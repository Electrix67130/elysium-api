import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { TeamRow } from './team.schema';

class TeamService extends BaseService<TeamRow> {
  constructor(db: Knex) {
    super(db, 'team');
  }

  async findByGameId(gameId: string): Promise<TeamRow[]> {
    return this.findMany({ game_id: gameId });
  }
}

export default TeamService;
