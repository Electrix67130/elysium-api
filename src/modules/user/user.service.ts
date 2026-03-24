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
   * Recherche d'utilisateurs par username ou display_name (pagine).
   * Exclut l'utilisateur connecte, ses amis/demandes en cours, et les utilisateurs bloques.
   */
  async search({
    query,
    userId,
    page = 1,
    limit = 20,
  }: {
    query: string;
    userId: string;
    page?: number;
    limit?: number;
  }) {
    // IDs des utilisateurs lies par une friendship (peu importe le status)
    const friendshipIds = this.db('friendship')
      .where('sender_id', userId)
      .select('receiver_id as id')
      .union(
        this.db('friendship')
          .where('receiver_id', userId)
          .select('sender_id as id'),
      );

    // IDs des utilisateurs bloques (dans les deux sens)
    const blockedIds = this.db('user_block')
      .where('blocker_id', userId)
      .select('blocked_id as id')
      .union(
        this.db('user_block')
          .where('blocked_id', userId)
          .select('blocker_id as id'),
      );

    const baseQuery = this.db(this.table)
      .where(function () {
        this.whereILike('username', `%${query}%`)
          .orWhereILike('display_name', `%${query}%`);
      })
      .whereNot('id', userId)
      .whereNotIn('id', friendshipIds)
      .whereNotIn('id', blockedIds);

    const [{ count }] = await baseQuery.clone().count('* as count') as { count: string }[];

    const data = await baseQuery.clone()
      .select('id', 'username', 'display_name', 'avatar_url', 'is_online', 'country')
      .orderBy('username', 'asc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      meta: {
        total: parseInt(count, 10),
        page,
        limit,
        totalPages: Math.ceil(parseInt(count, 10) / limit),
      },
    };
  }
}

export default UserService;
