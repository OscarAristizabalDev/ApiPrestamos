import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async conversations(@AuthUser('id') userId: string) {
    return this.messagesService.listConversations(userId);
  }

  @Get('contacts')
  async contacts(@AuthUser('id') userId: string, @AuthUser('role') role: string) {
    return this.messagesService.getContacts(userId, role);
  }

  @Get(':peerId')
  async conversation(
    @AuthUser('id') userId: string,
    @Param('peerId') peerId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '30',
  ) {
    return this.messagesService.getConversation(userId, peerId, parseInt(page), parseInt(limit));
  }

  @Post(':peerId/read')
  async read(@AuthUser('id') userId: string, @Param('peerId') peerId: string) {
    await this.messagesService.markRead(userId, peerId);
    return { message: 'ok' };
  }
}
