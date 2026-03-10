import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { TournamentRow } from './tournament.schema';

class TournamentService extends BaseService<TournamentRow> {
  constructor(db: Knex) {
    super(db, 'tournament');
  }

  async findByGameId(gameId: string): Promise<TournamentRow[]> {
    return this.findMany({ game_id: gameId });
  }

  async findByOrganizerId(organizerId: string): Promise<TournamentRow[]> {
    return this.findMany({ organizer_id: organizerId });
  }

  async findByStatus(status: TournamentRow['status']): Promise<TournamentRow[]> {
    return this.findMany({ status });
  }
}

export default TournamentService;
