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

  /**
   * Retourne tous les amis acceptes d'un utilisateur avec leurs infos.
   * Cherche dans les deux sens (sender ou receiver).
   */
  async findFriendsOfUser({
    userId,
    page = 1,
    limit = 20,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const baseQuery = this.db(this.table)
      .where(function () {
        this.where({ sender_id: userId, status: 'accepted' })
          .orWhere({ receiver_id: userId, status: 'accepted' });
      });

    const [{ count }] = await baseQuery.clone().count('* as count') as { count: string }[];

    const friendships = await baseQuery.clone()
      .orderBy('updated_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    // Recuperer les IDs des amis (l'autre personne)
    const friendIds = friendships.map((f: FriendshipRow) =>
      f.sender_id === userId ? f.receiver_id : f.sender_id,
    );

    // Fetch les infos des amis
    let friends: Record<string, unknown>[] = [];
    if (friendIds.length > 0) {
      friends = await this.db('user')
        .whereIn('id', friendIds)
        .select('id', 'username', 'display_name', 'avatar_url', 'is_online', 'last_seen_at', 'status_text');
    }

    // Garder l'ordre des friendships
    const friendMap = new Map(friends.map((f) => [f.id as string, f]));
    const data = friendIds.map((id: string) => friendMap.get(id)).filter(Boolean);

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

  /**
   * Retourne les demandes d'amis en attente recues par l'utilisateur.
   */
  async findPendingRequests(userId: string) {
    const pending = await this.db(this.table)
      .where({ receiver_id: userId, status: 'pending' })
      .join('user', 'friendship.sender_id', 'user.id')
      .select(
        'friendship.id as friendship_id',
        'friendship.created_at',
        'user.id as user_id',
        'user.username',
        'user.display_name',
        'user.avatar_url',
      )
      .orderBy('friendship.created_at', 'desc');

    return pending;
  }
}

export default FriendshipService;
