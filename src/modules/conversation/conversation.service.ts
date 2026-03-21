import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { ConversationRow } from './conversation.schema';

class ConversationService extends BaseService<ConversationRow> {
  constructor(db: Knex) {
    super(db, 'conversation');
  }

  async findByTeamId(teamId: string): Promise<ConversationRow | undefined> {
    return this.findOne({ team_id: teamId });
  }

  async findByTournamentId(tournamentId: string): Promise<ConversationRow | undefined> {
    return this.findOne({ tournament_id: tournamentId });
  }

  async findByType(type: ConversationRow['type']): Promise<ConversationRow[]> {
    return this.findMany({ type });
  }

  /**
   * Retourne les conversations dont l'utilisateur est membre (paginee).
   * Pour les DMs, enrichit avec les infos de l'autre membre.
   */
  async findByUserId({
    userId,
    page = 1,
    limit = 20,
    orderBy = 'created_at',
    order = 'desc',
  }: {
    userId: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const baseQuery = this.db(this.table)
      .whereIn('id', function () {
        this.select('conversation_id')
          .from('conversation_member')
          .where('user_id', userId);
      });

    const [items, [{ count }]] = await Promise.all([
      baseQuery.clone()
        .select('*')
        .orderBy(orderBy, order)
        .limit(limit)
        .offset((page - 1) * limit),
      baseQuery.clone().count('* as count') as Promise<{ count: string }[]>,
    ]);

    // Pour les DMs, recuperer l'autre membre avec ses infos
    const conversations = items as ConversationRow[];
    const dmConversations = conversations.filter((c) => c.type === 'dm');

    if (dmConversations.length > 0) {
      const dmIds = dmConversations.map((c) => c.id);

      // Recuperer l'autre membre de chaque DM (celui qui n'est pas userId)
      const otherMembers = await this.db('conversation_member')
        .join('user', 'conversation_member.user_id', 'user.id')
        .whereIn('conversation_member.conversation_id', dmIds)
        .whereNot('conversation_member.user_id', userId)
        .select(
          'conversation_member.conversation_id',
          'user.id as user_id',
          'user.username',
          'user.display_name',
          'user.avatar_url',
          'user.is_online',
        );

      const otherMemberMap = new Map(
        otherMembers.map((m: Record<string, unknown>) => [m.conversation_id as string, m]),
      );

      for (const conv of dmConversations) {
        const other = otherMemberMap.get(conv.id);
        if (other) {
          (conv as Record<string, unknown>).recipient = {
            id: other.user_id,
            username: other.username,
            display_name: other.display_name,
            avatar_url: other.avatar_url,
            is_online: other.is_online,
          };
        }
      }
    }

    return {
      data: conversations,
      meta: {
        total: parseInt(count, 10),
        page,
        limit,
        totalPages: Math.ceil(parseInt(count, 10) / limit),
      },
    };
  }

  /**
   * Cree une conversation DM entre exactement 2 utilisateurs.
   * Verifie qu'il n'existe pas deja un DM entre ces 2 personnes.
   */
  async createDm(userId1: string, userId2: string): Promise<ConversationRow> {
    // Verifier qu'un DM n'existe pas deja entre ces 2 users
    const existing = await this.db('conversation')
      .where({ type: 'dm' })
      .whereIn('id', function () {
        this.select('conversation_id')
          .from('conversation_member')
          .where('user_id', userId1);
      })
      .whereIn('id', function () {
        this.select('conversation_id')
          .from('conversation_member')
          .where('user_id', userId2);
      })
      .first();

    if (existing) return existing as ConversationRow;

    // Creer la conversation + les 2 membres dans une transaction
    return this.db.transaction(async (trx) => {
      const [conversation] = await trx('conversation')
        .insert({ type: 'dm' })
        .returning('*');

      await trx('conversation_member').insert([
        { user_id: userId1, conversation_id: conversation.id },
        { user_id: userId2, conversation_id: conversation.id },
      ]);

      return conversation as ConversationRow;
    });
  }

  /**
   * Cree une conversation pour une equipe et ajoute tous ses membres.
   * Si une conversation existe deja pour cette equipe, la retourne.
   */
  async createForTeam(teamId: string, name?: string): Promise<ConversationRow> {
    const existing = await this.findByTeamId(teamId);
    if (existing) return existing;

    return this.db.transaction(async (trx) => {
      const [conversation] = await trx('conversation')
        .insert({ type: 'team', team_id: teamId, name })
        .returning('*');

      // Recuperer tous les membres de l'equipe
      const members = await trx('team_membership')
        .where({ team_id: teamId })
        .select('user_id');

      if (members.length > 0) {
        await trx('conversation_member').insert(
          members.map((m: { user_id: string }) => ({
            user_id: m.user_id,
            conversation_id: conversation.id,
          })),
        );
      }

      return conversation as ConversationRow;
    });
  }

  /**
   * Cree une conversation pour un tournoi et ajoute tous les participants.
   * Si une conversation existe deja pour ce tournoi, la retourne.
   */
  async createForTournament(tournamentId: string, name?: string): Promise<ConversationRow> {
    const existing = await this.findByTournamentId(tournamentId);
    if (existing) return existing;

    return this.db.transaction(async (trx) => {
      const [conversation] = await trx('conversation')
        .insert({ type: 'tournament', tournament_id: tournamentId, name })
        .returning('*');

      // Recuperer tous les participants confirmes du tournoi
      const participants = await trx('tournament_participation')
        .where({ tournament_id: tournamentId, status: 'confirmed' })
        .select('user_id');

      if (participants.length > 0) {
        await trx('conversation_member').insert(
          participants.map((p: { user_id: string }) => ({
            user_id: p.user_id,
            conversation_id: conversation.id,
          })),
        );
      }

      return conversation as ConversationRow;
    });
  }

  /**
   * Synchronise les membres d'une conversation team avec les membres actuels de l'equipe.
   */
  async syncTeamMembers(teamId: string): Promise<void> {
    const conversation = await this.findByTeamId(teamId);
    if (!conversation) return;

    await this.db.transaction(async (trx) => {
      const currentMembers = await trx('conversation_member')
        .where({ conversation_id: conversation.id })
        .select('user_id');

      const teamMembers = await trx('team_membership')
        .where({ team_id: teamId })
        .select('user_id');

      const currentIds = new Set(currentMembers.map((m: { user_id: string }) => m.user_id));
      const teamIds = new Set(teamMembers.map((m: { user_id: string }) => m.user_id));

      // Ajouter les nouveaux membres
      const toAdd = teamMembers.filter((m: { user_id: string }) => !currentIds.has(m.user_id));
      if (toAdd.length > 0) {
        await trx('conversation_member').insert(
          toAdd.map((m: { user_id: string }) => ({
            user_id: m.user_id,
            conversation_id: conversation.id,
          })),
        );
      }

      // Retirer ceux qui ne sont plus dans l'equipe
      const toRemove = currentMembers.filter((m: { user_id: string }) => !teamIds.has(m.user_id));
      if (toRemove.length > 0) {
        await trx('conversation_member')
          .where({ conversation_id: conversation.id })
          .whereIn('user_id', toRemove.map((m: { user_id: string }) => m.user_id))
          .del();
      }
    });
  }

  /**
   * Synchronise les membres d'une conversation tournoi avec les participants confirmes.
   */
  async syncTournamentMembers(tournamentId: string): Promise<void> {
    const conversation = await this.findByTournamentId(tournamentId);
    if (!conversation) return;

    await this.db.transaction(async (trx) => {
      const currentMembers = await trx('conversation_member')
        .where({ conversation_id: conversation.id })
        .select('user_id');

      const participants = await trx('tournament_participation')
        .where({ tournament_id: tournamentId, status: 'confirmed' })
        .select('user_id');

      const currentIds = new Set(currentMembers.map((m: { user_id: string }) => m.user_id));
      const participantIds = new Set(participants.map((p: { user_id: string }) => p.user_id));

      const toAdd = participants.filter((p: { user_id: string }) => !currentIds.has(p.user_id));
      if (toAdd.length > 0) {
        await trx('conversation_member').insert(
          toAdd.map((p: { user_id: string }) => ({
            user_id: p.user_id,
            conversation_id: conversation.id,
          })),
        );
      }

      const toRemove = currentMembers.filter((m: { user_id: string }) => !participantIds.has(m.user_id));
      if (toRemove.length > 0) {
        await trx('conversation_member')
          .where({ conversation_id: conversation.id })
          .whereIn('user_id', toRemove.map((m: { user_id: string }) => m.user_id))
          .del();
      }
    });
  }
}

export default ConversationService;
