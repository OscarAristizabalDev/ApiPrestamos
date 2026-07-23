import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

interface AuthedSocket extends Socket {
  userId?: string;
}

const ALLOWED_ORIGINS = [
  'http://localhost:3001',
  'https://sirenically-slippiest-lylah.ngrok-free.dev',
];

@WebSocketGateway({ cors: { origin: ALLOWED_ORIGINS, credentials: true } })
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('MessagesGateway');

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: AuthedSocket) {
    try {
      const raw =
        (client.handshake.auth?.token as string | undefined) ??
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!raw) throw new Error('No token');

      const payload = this.jwtService.verify<{ sub: string }>(raw, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      client.userId = payload.sub;
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('message:send')
  async onSend(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { to?: string; content?: string },
  ) {
    if (!client.userId) return { error: 'unauthorized' };
    const to = payload?.to;
    const content = (payload?.content ?? '').trim();
    if (!to || !Types.ObjectId.isValid(to) || content.length === 0 || content.length > 2000) {
      return { error: 'invalid' };
    }

    let saved: Awaited<ReturnType<MessagesService['create']>>;
    try {
      saved = await this.messagesService.create(client.userId, to, content);
    } catch {
      // Protocolo de comunicación no permitido o destinatario inválido.
      return { error: 'forbidden' };
    }
    const message = {
      id: String(saved._id),
      from: client.userId,
      to,
      content: saved.content,
      read: false,
      createdAt: saved.get('createdAt') as Date,
    };

    this.server.to(`user:${to}`).emit('message:new', message);
    this.server.to(`user:${client.userId}`).emit('message:new', message);
    return message;
  }

  @SubscribeMessage('message:read')
  async onRead(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { peerId?: string },
  ) {
    if (!client.userId || !payload?.peerId || !Types.ObjectId.isValid(payload.peerId)) return;
    await this.messagesService.markRead(client.userId, payload.peerId);
    // Notifica al remitente (para pintar el "visto") y al propio lector (para
    // refrescar su bandeja / contador de no leídos en otras pestañas).
    this.server
      .to(`user:${payload.peerId}`)
      .emit('message:read', { by: client.userId, peerId: client.userId });
    this.server
      .to(`user:${client.userId}`)
      .emit('message:read', { by: client.userId, peerId: payload.peerId });
  }
}
