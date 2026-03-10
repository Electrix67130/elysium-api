import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { UserBlockRow } from './user-block.schema';

class UserBlockService extends BaseService<UserBlockRow> {
  constructor(db: Knex) {
    super(db, 'user_block');
  }

  async findByBlockerId(blockerId: string): Promise<UserBlockRow[]> {
    return this.findMany({ blocker_id: blockerId });
  }

  async findByPair(blockerId: string, blockedId: string): Promise<UserBlockRow | undefined> {
    return this.findOne({ blocker_id: blockerId, blocked_id: blockedId });
  }
}

export default UserBlockService;
