import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { UserSanctionRow } from './user-sanction.schema';

class UserSanctionService extends BaseService<UserSanctionRow> {
  constructor(db: Knex) {
    super(db, 'user_sanction');
  }

  async findByUserId(userId: string): Promise<UserSanctionRow[]> {
    return this.findMany({ user_id: userId });
  }

  async findActiveByUserId(userId: string): Promise<UserSanctionRow[]> {
    return this.db(this.table)
      .where({ user_id: userId, is_active: true })
      .andWhere(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      });
  }

  async findActiveBansByUserIdAndScope(userId: string, scope: string): Promise<UserSanctionRow | undefined> {
    return this.db(this.table)
      .where({ user_id: userId, type: 'ban', scope, is_active: true })
      .andWhere(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .first();
  }
}

export default UserSanctionService;
