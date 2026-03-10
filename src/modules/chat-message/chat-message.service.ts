import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { ChatMessageRow } from './chat-message.schema';

class ChatMessageService extends BaseService<ChatMessageRow> {
  constructor(db: Knex) {
    super(db, 'chat_message');
  }

  async findByConversationId(conversationId: string): Promise<ChatMessageRow[]> {
    return this.findMany({ conversation_id: conversationId });
  }

  async findBySenderId(senderId: string): Promise<ChatMessageRow[]> {
    return this.findMany({ sender_id: senderId });
  }
}

export default ChatMessageService;
