import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { FriendshipRow } from './friendship.schema';

class FriendshipService extends BaseService<FriendshipRow> {
  constructor(db: Knex) {
    super(db, 'friendship');
  }

  async findBySenderId(senderId: string): Promise<FriendshipRow[]> {
    return this.findMany({ sender_id: senderId });
  }

  async findByReceiverId(receiverId: string): Promise<FriendshipRow[]> {
    return this.findMany({ receiver_id: receiverId });
  }

  async findByPair(senderId: string, receiverId: string): Promise<FriendshipRow | undefined> {
    return this.findOne({ sender_id: senderId, receiver_id: receiverId });
  }
}

export default FriendshipService;
