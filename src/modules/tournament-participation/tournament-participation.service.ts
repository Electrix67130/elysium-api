import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { TournamentParticipationRow } from './tournament-participation.schema';

class TournamentParticipationService extends BaseService<TournamentParticipationRow> {
  constructor(db: Knex) {
    super(db, 'tournament_participation');
  }

  async findByUserId(userId: string): Promise<TournamentParticipationRow[]> {
    return this.findMany({ user_id: userId });
  }

  async findByTournamentId(tournamentId: string): Promise<TournamentParticipationRow[]> {
    return this.findMany({ tournament_id: tournamentId });
  }

  async findByUserAndTournament(userId: string, tournamentId: string): Promise<TournamentParticipationRow | undefined> {
    return this.findOne({ user_id: userId, tournament_id: tournamentId });
  }
}

export default TournamentParticipationService;
