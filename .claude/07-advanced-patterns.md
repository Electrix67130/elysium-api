# Patterns avances

## Relations entre entites

Pour les entites avec FK, ajouter des methodes de recherche par FK dans le service :

```ts
class PlayerStatsService extends BaseService<PlayerStatsRow> {
  constructor(db: Knex) {
    super(db, 'player_stats');
  }

  async findByUserId(userId: string): Promise<PlayerStatsRow[]> {
    return this.findMany({ user_id: userId });
  }

  async findByUserAndGame(userId: string, gameId: string): Promise<PlayerStatsRow | undefined> {
    return this.findOne({ user_id: userId, game_id: gameId });
  }
}
```

## Jointures dans les services

Utiliser `this.db` directement pour les jointures :

```ts
async findWithDetails(id: string): Promise<PlayerStatsWithGame | undefined> {
  return this.db(this.table)
    .join('game', 'player_stats.game_id', 'game.id')
    .where('player_stats.id', id)
    .select('player_stats.*', 'game.name as game_name')
    .first();
}
```

## Contraintes d'unicite composites

```ts
// Migration
table.unique(['sender_id', 'receiver_id']);

// Service
async findByPair(senderId: string, receiverId: string): Promise<FriendshipRow | undefined> {
  return this.findOne({ sender_id: senderId, receiver_id: receiverId });
}
```

## Upsert (insert or update)

Pour les entites ou un seul enregistrement par combinaison est autorise :

```ts
async react(messageId: string, userId: string, emoji: string): Promise<MessageReactionRow> {
  const existing = await this.findOne({ message_id: messageId, user_id: userId });

  if (existing) {
    return (await this.update(existing.id, { emoji })) as MessageReactionRow;
  }

  return this.create({ message_id: messageId, user_id: userId, emoji });
}
```

## Enumeration de valeurs

```ts
// Schema
export const TEAM_ROLES = ['capitaine', 'manager', 'membre'] as const;

export const createTeamMembershipSchema = z.object({
  role: z.enum(TEAM_ROLES).default('membre'),
});

// Migration
table.enu('role', ['capitaine', 'manager', 'membre']).notNullable();
```

## Filtrage avance dans les listes

Surcharger `findAll` dans le service quand le filtrage depasse la pagination standard :

```ts
async findAll({
  page = 1,
  limit = 20,
  orderBy = 'created_at',
  order = 'desc',
  filters = {},
}: PaginationOptions & { filters?: { status?: string; gameId?: string; search?: string } } = {}) {
  const query = this.db(this.table);

  if (filters.status) query.where('status', filters.status);
  if (filters.gameId) query.where('game_id', filters.gameId);
  if (filters.search) query.whereILike('name', `%${filters.search}%`);

  query.whereNull('deleted_at');

  const [{ count }] = await query.clone().count('* as count') as { count: string }[];
  const data = await query.clone()
    .orderBy(orderBy, order)
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
```

## Soft delete

- `service.softDelete(id)` pour les entites avec `deleted_at`
- Les entites soft-deleted = inexistantes dans les `findById` custom
- Filtrer avec `.whereNull('deleted_at')` dans les listes
