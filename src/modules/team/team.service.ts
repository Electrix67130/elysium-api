import { Knex } from 'knex';
import BaseService, { PaginatedResult } from '@/lib/base-service';
import { TeamRow } from './team.schema';

class TeamService extends BaseService<TeamRow> {
  constructor(db: Knex) {
    super(db, 'team');
  }

  async findByGameId(gameId: string): Promise<TeamRow[]> {
    return this.findMany({ game_id: gameId });
  }

  async search({
    q,
    page = 1,
    limit = 20,
    excludeUserId,
  }: {
    q: string;
    page?: number;
    limit?: number;
    excludeUserId?: string;
  }): Promise<PaginatedResult<TeamRow>> {
    const baseQuery = this.db(this.table).whereILike('name', `%${q}%`);

    // Exclure les équipes dont l'utilisateur est déjà membre
    if (excludeUserId) {
      baseQuery.whereNotIn('id', function () {
        this.select('team_id').from('team_membership').where('user_id', excludeUserId);
      });
    }

    const [{ count }] = await baseQuery.clone().count('* as count') as { count: string }[];
    const data = await baseQuery.clone()
      .orderBy('name', 'asc')
      .limit(limit)
      .offset((page - 1) * limit) as TeamRow[];

    const total = parseInt(count, 10);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default TeamService;
