import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { canMessage, CHAT_PROTOCOL } from '../auth/ownership';

export interface ConversationSummary {
  peerId: Types.ObjectId;
  fullName: string;
  lastMessage: string;
  lastAt: Date;
  lastFrom: Types.ObjectId;
  lastRead: boolean;
  unread: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Directorio de contactos según el protocolo de comunicación por rol:
   * user ↔ admin, admin ↔ (user + superadmin), superadmin ↔ admin.
   */
  async getContacts(userId: string, role: string) {
    const allowedRoles = CHAT_PROTOCOL[role] ?? [];
    return this.userModel
      .find(
        { active: 1, _id: { $ne: new Types.ObjectId(userId) }, role: { $in: allowedRoles } },
        'fullName email',
      )
      .sort({ fullName: 1 })
      .lean()
      .exec();
  }

  async create(from: string, to: string, content: string): Promise<MessageDocument> {
    // Valida el protocolo de comunicación con los roles reales (fuente de verdad: BD).
    const [fromUser, toUser] = await Promise.all([
      this.userModel.findById(from, 'role').lean().exec(),
      this.userModel.findById(to, 'role').lean().exec(),
    ]);
    if (!toUser) throw new NotFoundException('Recipient not found');
    if (!fromUser || !canMessage(fromUser.role, toUser.role)) {
      throw new ForbiddenException('Messaging not allowed by protocol');
    }

    const message = new this.messageModel({
      from: new Types.ObjectId(from),
      to: new Types.ObjectId(to),
      content: content.trim(),
    });
    return message.save();
  }

  async getConversation(userId: string, peerId: string, page = 1, limit = 30) {
    const uid = new Types.ObjectId(userId);
    const pid = new Types.ObjectId(peerId);
    const filter = {
      $or: [
        { from: uid, to: pid },
        { from: pid, to: uid },
      ],
    };
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * safeLimit;

    const [messages, total] = await Promise.all([
      this.messageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean().exec(),
      this.messageModel.countDocuments(filter).exec(),
    ]);

    return {
      data: messages.reverse(), // ascendente para el render del hilo
      total,
      page,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async listConversations(userId: string): Promise<ConversationSummary[]> {
    const uid = new Types.ObjectId(userId);
    return this.messageModel.aggregate<ConversationSummary>([
      { $match: { $or: [{ from: uid }, { to: uid }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$from', uid] }, '$to', '$from'] },
          lastMessage: { $first: '$content' },
          lastAt: { $first: '$createdAt' },
          lastFrom: { $first: '$from' },
          lastRead: { $first: '$read' },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$to', uid] }, { $eq: ['$read', false] }] }, 1, 0],
            },
          },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'peer' } },
      { $unwind: '$peer' },
      {
        $project: {
          _id: 0,
          peerId: '$_id',
          fullName: '$peer.fullName',
          lastMessage: 1,
          lastAt: 1,
          lastFrom: 1,
          lastRead: 1,
          unread: 1,
        },
      },
      { $sort: { lastAt: -1 } },
    ]).exec();
  }

  async markRead(userId: string, peerId: string): Promise<void> {
    await this.messageModel
      .updateMany(
        { from: new Types.ObjectId(peerId), to: new Types.ObjectId(userId), read: false },
        { read: true },
      )
      .exec();
  }
}
