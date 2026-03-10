import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { ConversationMemberRow } from './conversation-member.schema';

class ConversationMemberService extends BaseService<ConversationMemberRow> {
  constructor(db: Knex) {
    super(db, 'conversation_member');
  }

  async findByUserId(userId: string): Promise<ConversationMemberRow[]> {
    return this.findMany({ user_id: userId });
  }

  async findByConversationId(conversationId: string): Promise<ConversationMemberRow[]> {
    return this.findMany({ conversation_id: conversationId });
  }

  async findByUserAndConversation(userId: string, conversationId: string): Promise<ConversationMemberRow | undefined> {
    return this.findOne({ user_id: userId, conversation_id: conversationId });
  }
}

export default ConversationMemberService;
