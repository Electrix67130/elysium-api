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

  /**
   * Retourne les utilisateurs bloques par l'utilisateur courant avec leurs infos (pagine).
   */
  async findBlockedUsers({
    blockerId,
    page = 1,
    limit = 20,
  }: {
    blockerId: string;
    page?: number;
    limit?: number;
  }) {
    const baseQuery = this.db(this.table)
      .where('user_block.blocker_id', blockerId)
      .join('user', 'user_block.blocked_id', 'user.id');

    const [{ count }] = await baseQuery.clone().count('* as count') as { count: string }[];

    const data = await baseQuery.clone()
      .select(
        'user_block.id as block_id',
        'user_block.created_at as blocked_at',
        'user.id',
        'user.username',
        'user.display_name',
        'user.avatar_url',
      )
      .orderBy('user_block.created_at', 'desc')
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

  async findByPair(blockerId: string, blockedId: string): Promise<UserBlockRow | undefined> {
    return this.findOne({ blocker_id: blockerId, blocked_id: blockedId });
  }
}

export default UserBlockService;
