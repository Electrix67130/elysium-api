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
   * Verifie si une amitie existe deja entre deux users (dans les deux sens).
   */
  async findExisting(userId1: string, userId2: string): Promise<FriendshipRow | undefined> {
    return this.db(this.table)
      .where(function () {
        this.where({ sender_id: userId1, receiver_id: userId2 })
          .orWhere({ sender_id: userId2, receiver_id: userId1 });
      })
      .first() as Promise<FriendshipRow | undefined>;
  }

  /**
   * Cree une demande d'ami apres verification qu'elle n'existe pas deja.
   */
  async createFriendship(senderId: string, receiverId: string): Promise<FriendshipRow> {
    if (senderId === receiverId) {
      throw Object.assign(new Error('Cannot add yourself as a friend'), { statusCode: 400 });
    }

    const existing = await this.findExisting(senderId, receiverId);
    if (existing) {
      throw Object.assign(new Error('Friendship already exists'), { statusCode: 409 });
    }

    return this.create({ sender_id: senderId, receiver_id: receiverId } as Partial<FriendshipRow>);
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

    // Recuperer les IDs des amis (l'autre personne) + le friendship_id
    const friendEntries = friendships.map((f: FriendshipRow) => ({
      friendshipId: f.id,
      friendId: f.sender_id === userId ? f.receiver_id : f.sender_id,
    }));

    const friendIds = friendEntries.map((e) => e.friendId);

    // Fetch les infos des amis
    let friends: Record<string, unknown>[] = [];
    if (friendIds.length > 0) {
      friends = await this.db('user')
        .whereIn('id', friendIds)
        .select('id', 'username', 'display_name', 'avatar_url', 'is_online', 'last_seen_at', 'status_text');
    }

    // Garder l'ordre des friendships et inclure le friendship_id
    const friendMap = new Map(friends.map((f) => [f.id as string, f]));
    const data = friendEntries
      .map((e) => {
        const friend = friendMap.get(e.friendId);
        if (!friend) return null;
        return { friendship_id: e.friendshipId, ...friend };
      })
      .filter(Boolean);

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
   * Retourne les demandes d'amis en attente envoyees par l'utilisateur (pagine).
   */
  async findSentRequests({
    userId,
    page = 1,
    limit = 20,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const baseQuery = this.db(this.table)
      .where({ sender_id: userId, status: 'pending' })
      .join('user', 'friendship.receiver_id', 'user.id');

    const [{ count }] = await baseQuery.clone().count('* as count') as { count: string }[];

    const data = await baseQuery.clone()
      .select(
        'friendship.id as friendship_id',
        'friendship.created_at',
        'user.id as user_id',
        'user.username',
        'user.display_name',
        'user.avatar_url',
      )
      .orderBy('friendship.created_at', 'desc')
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

  /**
   * Retourne les demandes d'amis en attente recues par l'utilisateur (pagine).
   */
  async findPendingRequests({
    userId,
    page = 1,
    limit = 20,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const baseQuery = this.db(this.table)
      .where({ receiver_id: userId, status: 'pending' })
      .join('user', 'friendship.sender_id', 'user.id');

    const [{ count }] = await baseQuery.clone().count('* as count') as { count: string }[];

    const data = await baseQuery.clone()
      .select(
        'friendship.id as friendship_id',
        'friendship.created_at',
        'user.id as user_id',
        'user.username',
        'user.display_name',
        'user.avatar_url',
      )
      .orderBy('friendship.created_at', 'desc')
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
}

export default FriendshipService;
