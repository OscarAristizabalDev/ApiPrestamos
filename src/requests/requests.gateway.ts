import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface AuthedSocket extends Socket {
  userId?: string;
}

const ALLOWED_ORIGINS = [
  'http://localhost:3001',
  'https://sirenically-slippiest-lylah.ngrok-free.dev',
];

const ADMIN_ROLES = ['admin', 'superadmin'];
const ADMINS_ROOM = 'requests:admins';

/**
 * Gateway de solicitudes: une a los admin/superadmin a la sala `requests:admins`
 * (para recibir nuevas solicitudes en tiempo real) y a todos a su sala personal
 * `user:<id>` (para avisar al solicitante cuando su solicitud se resuelve).
 */
@WebSocketGateway({ cors: { origin: ALLOWED_ORIGINS, credentials: true } })
export class RequestsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('RequestsGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: AuthedSocket) {
    try {
      const raw =
        (client.handshake.auth?.token as string | undefined) ??
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!raw) throw new Error('No token');

      const payload = this.jwtService.verify<{ sub: string; role?: string }>(raw, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      client.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      if (payload.role && ADMIN_ROLES.includes(payload.role)) {
        client.join(ADMINS_ROOM);
      }
    } catch {
      client.disconnect(true);
    }
  }

  /** Notifica a los admins de una nueva solicitud pendiente. */
  emitNew(payload: unknown) {
    this.server.to(ADMINS_ROOM).emit('request:new', payload);
  }

  /** Notifica la resolución a los admins (para refrescar) y al solicitante. */
  emitResolved(payload: unknown, requesterId: string) {
    this.server.to(ADMINS_ROOM).emit('request:resolved', payload);
    this.server.to(`user:${requesterId}`).emit('request:resolved', payload);
  }
}
