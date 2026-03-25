import { Knex } from 'knex';
import { WebSocket } from 'ws';
import { z } from 'zod';
import ConnectionManager from '@/lib/connection-manager';
import ChatMessageService from '@/modules/chat-message/chat-message.service';
import ConversationMemberService from '@/modules/conversation-member/conversation-member.service';

const wsMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('message:send'),
    conversationId: z.string().uuid(),
    content: z.string().min(1),
  }),
  z.object({
    type: z.literal('typing:start'),
    conversationId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('typing:stop'),
    conversationId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('conversation:read'),
    conversationId: z.string().uuid(),
  }),
]);

class WsHandler {
  private chatMessageService: ChatMessageService;
  private conversationMemberService: ConversationMemberService;

  constructor(
    private db: Knex,
    private connectionManager: ConnectionManager,
  ) {
    this.chatMessageService = new ChatMessageService(db);
    this.conversationMemberService = new ConversationMemberService(db);
  }

  async handleMessage(userId: string, ws: WebSocket, raw: string): Promise<void> {
    let parsed: z.infer<typeof wsMessageSchema>;
    try {
      parsed = wsMessageSchema.parse(JSON.parse(raw));
    } catch {
      this.send(ws, { type: 'error', message: 'Invalid message format' });
      return;
    }

    const isMember = await this.verifyMembership(userId, parsed.conversationId);
    if (!isMember) {
      this.send(ws, { type: 'error', message: 'Not a member of this conversation' });
      return;
    }

    switch (parsed.type) {
      case 'message:send':
        await this.handleSendMessage(userId, parsed.conversationId, parsed.content);
        break;
      case 'typing:start':
      case 'typing:stop':
        await this.handleTyping(userId, parsed.conversationId, parsed.type);
        break;
      case 'conversation:read':
        await this.handleConversationRead(userId, parsed.conversationId);
        break;
    }
  }

  async handleConnect(userId: string): Promise<void> {
    await this.db('user').where({ id: userId }).update({
      is_online: true,
      last_seen_at: this.db.fn.now(),
    });

    const contactIds = await this.getContactUserIds(userId);
    this.connectionManager.broadcastToUsers(contactIds, {
      type: 'presence:online',
      userId,
    }, userId);
  }

  async handleDisconnect(userId: string): Promise<void> {
    // Seulement si l'utilisateur n'a plus aucune connexion active
    if (this.connectionManager.isOnline(userId)) return;

    await this.db('user').where({ id: userId }).update({
      is_online: false,
      last_seen_at: this.db.fn.now(),
    });

    const contactIds = await this.getContactUserIds(userId);
    this.connectionManager.broadcastToUsers(contactIds, {
      type: 'presence:offline',
      userId,
    });
  }

  private async handleSendMessage(userId: string, conversationId: string, content: string): Promise<void> {
    const message = await this.chatMessageService.create({
      conversation_id: conversationId,
      sender_id: userId,
      content,
    } as Record<string, unknown>);

    // Enrichir avec les infos du sender
    const sender = await this.db('user')
      .where({ id: userId })
      .select('username', 'display_name', 'avatar_url')
      .first();

    const enrichedMessage = {
      ...message,
      sender_username: sender?.username,
      sender_display_name: sender?.display_name,
      sender_avatar_url: sender?.avatar_url,
    };

    // Incrementer unread_count pour tous les membres sauf le sender
    await this.db('conversation_member')
      .where({ conversation_id: conversationId })
      .whereNot({ user_id: userId })
      .increment('unread_count', 1);

    const memberIds = await this.getConversationMemberIds(conversationId);
    this.connectionManager.broadcastToUsers(memberIds, {
      type: 'message:new',
      message: enrichedMessage,
    });
  }

  private async handleConversationRead(userId: string, conversationId: string): Promise<void> {
    const now = new Date().toISOString();

    // Remettre unread_count a 0 et mettre a jour last_read_at
    await this.db('conversation_member')
      .where({ user_id: userId, conversation_id: conversationId })
      .update({
        unread_count: 0,
        last_read_at: now,
        updated_at: this.db.fn.now(),
      });

    // Notifier les autres membres que cet utilisateur a lu la conversation
    const memberIds = await this.getConversationMemberIds(conversationId);
    this.connectionManager.broadcastToUsers(memberIds, {
      type: 'conversation:read',
      conversationId,
      userId,
      readAt: now,
    }, userId);
  }

  private async handleTyping(userId: string, conversationId: string, type: 'typing:start' | 'typing:stop'): Promise<void> {
    const sender = await this.db('user')
      .where({ id: userId })
      .select('username')
      .first();

    const memberIds = await this.getConversationMemberIds(conversationId);
    this.connectionManager.broadcastToUsers(memberIds, {
      type,
      conversationId,
      userId,
      username: sender?.username,
    }, userId);
  }

  private async verifyMembership(userId: string, conversationId: string): Promise<boolean> {
    const member = await this.conversationMemberService.findByUserAndConversation(userId, conversationId);
    return !!member;
  }

  private async getConversationMemberIds(conversationId: string): Promise<string[]> {
    const members = await this.conversationMemberService.findByConversationId(conversationId);
    return members.map((m) => (m as Record<string, unknown>).user_id as string);
  }

  private async getContactUserIds(userId: string): Promise<string[]> {
    const members = await this.db('conversation_member as cm1')
      .join('conversation_member as cm2', 'cm1.conversation_id', 'cm2.conversation_id')
      .where('cm1.user_id', userId)
      .whereNot('cm2.user_id', userId)
      .distinct('cm2.user_id')
      .pluck('cm2.user_id');

    return members;
  }

  private send(ws: WebSocket, payload: object): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }
}

export default WsHandler;
