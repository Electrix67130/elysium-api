import { Knex } from 'knex';
import BaseService, { PaginationOptions, PaginatedResult } from '@/lib/base-service';
import { ChatMessageRow } from './chat-message.schema';

class ChatMessageService extends BaseService<ChatMessageRow> {
  constructor(db: Knex) {
    super(db, 'chat_message');
  }

  async findByConversationId(conversationId: string): Promise<ChatMessageRow[]> {
    return this.findMany({ conversation_id: conversationId });
  }

  async findByConversationIdPaginated(
    conversationId: string,
    { page = 1, limit = 20, orderBy = 'created_at', order = 'desc' }: PaginationOptions = {},
  ): Promise<PaginatedResult<ChatMessageRow>> {
    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      this.db(this.table)
        .where({ conversation_id: conversationId })
        .orderBy(orderBy, order)
        .limit(limit)
        .offset(offset) as Promise<ChatMessageRow[]>,
      this.db(this.table)
        .where({ conversation_id: conversationId })
        .count('* as count') as Promise<{ count: string }[]>,
    ]);

    return {
      data: items,
      meta: {
        total: parseInt(count, 10),
        page,
        limit,
        totalPages: Math.ceil(parseInt(count, 10) / limit),
      },
    };
  }

  async findBySenderId(senderId: string): Promise<ChatMessageRow[]> {
    return this.findMany({ sender_id: senderId });
  }
}

export default ChatMessageService;
