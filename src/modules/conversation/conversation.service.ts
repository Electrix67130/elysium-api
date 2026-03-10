import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { ConversationRow } from './conversation.schema';

class ConversationService extends BaseService<ConversationRow> {
  constructor(db: Knex) {
    super(db, 'conversation');
  }

  async findByTeamId(teamId: string): Promise<ConversationRow | undefined> {
    return this.findOne({ team_id: teamId });
  }

  async findByType(type: ConversationRow['type']): Promise<ConversationRow[]> {
    return this.findMany({ type });
  }
}

export default ConversationService;
