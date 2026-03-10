import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { PlayerStatsRow } from './player-stats.schema';

class PlayerStatsService extends BaseService<PlayerStatsRow> {
  constructor(db: Knex) {
    super(db, 'player_stats');
  }

  async findByUserId(userId: string): Promise<PlayerStatsRow[]> {
    return this.findMany({ user_id: userId });
  }

  async findByGameId(gameId: string): Promise<PlayerStatsRow[]> {
    return this.findMany({ game_id: gameId });
  }

  async findByUserAndGame(userId: string, gameId: string): Promise<PlayerStatsRow | undefined> {
    return this.findOne({ user_id: userId, game_id: gameId });
  }
}

export default PlayerStatsService;
