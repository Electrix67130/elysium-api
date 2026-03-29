import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { MessageReactionRow } from './message-reaction.schema';

class MessageReactionService extends BaseService<MessageReactionRow> {
  constructor(db: Knex) {
    super(db, 'message_reaction');
  }

  async findByMessageId(messageId: string): Promise<MessageReactionRow[]> {
    return this.findMany({ message_id: messageId });
  }

  async findByUserId(userId: string): Promise<MessageReactionRow[]> {
    return this.findMany({ user_id: userId });
  }

  async react(messageId: string, userId: string, emoji: string): Promise<MessageReactionRow> {
    const existing = await this.findOne({ message_id: messageId, user_id: userId });

    if (existing) {
      return (await this.update(existing.id, { emoji })) as MessageReactionRow;
    }

    return this.create({ message_id: messageId, user_id: userId, emoji });
  }
}

export default MessageReactionService;
