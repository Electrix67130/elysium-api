import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { UserRow } from './user.schema';

class UserService extends BaseService<UserRow> {
  constructor(db: Knex) {
    super(db, 'user');
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return this.findOne({ email });
  }

  async findByUsername(username: string): Promise<UserRow | undefined> {
    return this.findOne({ username });
  }

  /**
   * Recherche d'utilisateurs par username ou display_name (min 3 chars).
   * Exclut le password_hash du resultat.
   */
  async search(query: string, limit = 20): Promise<Record<string, unknown>[]> {
    return this.db(this.table)
      .where(function () {
        this.whereILike('username', `%${query}%`)
          .orWhereILike('display_name', `%${query}%`);
      })
      .select('id', 'username', 'display_name', 'avatar_url', 'is_online', 'country')
      .limit(limit);
  }
}

export default UserService;
