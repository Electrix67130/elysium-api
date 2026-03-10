import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { TwitchLinkRow } from './twitch-link.schema';

class TwitchLinkService extends BaseService<TwitchLinkRow> {
  constructor(db: Knex) {
    super(db, 'twitch_link');
  }

  async findByUserId(userId: string): Promise<TwitchLinkRow | undefined> {
    return this.findOne({ user_id: userId });
  }

  async findByTwitchId(twitchId: string): Promise<TwitchLinkRow | undefined> {
    return this.findOne({ twitch_id: twitchId });
  }
}

export default TwitchLinkService;
