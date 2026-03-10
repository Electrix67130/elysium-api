import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { GameRow } from './game.schema';

class GameService extends BaseService<GameRow> {
  constructor(db: Knex) {
    super(db, 'game');
  }

  async findBySlug(slug: string): Promise<GameRow | undefined> {
    return this.findOne({ slug });
  }
}

export default GameService;
