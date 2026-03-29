# Clean code — Principes

## Style de code

### Early returns (guard clauses)

Sortir tot pour eviter l'imbrication. Le chemin principal reste a plat.

```ts
// Bon
async findActiveUser(id: string): Promise<UserRow> {
  const user = await this.findById(id);
  if (!user) throw new Error('User not found');
  if (user.deleted_at) throw new Error('User is deleted');
  return user;
}

// Mauvais
async findActiveUser(id: string): Promise<UserRow> {
  const user = await this.findById(id);
  if (user) {
    if (!user.deleted_at) {
      return user;
    } else {
      throw new Error('User is deleted');
    }
  } else {
    throw new Error('User not found');
  }
}
```

### Const par defaut

- Toujours `const` sauf si la variable est reassignee — jamais `var`
- `let` uniquement quand la reassignation est necessaire (boucles, accumulateurs)

### Destructuring

- Destructurer les objets quand on utilise plusieurs proprietes
- Destructurer les parametres de fonction quand ils sont des objets

```ts
// Bon
const { page, limit, orderBy, order } = options;
const { user_id: userId, game_id: gameId } = params;

// Mauvais
const page = options.page;
const limit = options.limit;
```

### Pas de magic numbers/strings

- Extraire les valeurs constantes avec des noms explicites
- Les valeurs par defaut de pagination sont dans BaseService

```ts
// Bon
const MAX_TEAM_MEMBERS = 10;
if (members.length >= MAX_TEAM_MEMBERS) { ... }

// Mauvais
if (members.length >= 10) { ... }
```

### Ternaires

- Utiliser les ternaires pour les assignations simples uniquement
- Jamais de ternaires imbriques — utiliser if/else ou early returns

```ts
// Bon
const label = isOnline ? 'En ligne' : 'Hors ligne';

// Mauvais
const label = isOnline ? (isInGame ? 'En jeu' : 'En ligne') : 'Hors ligne';
```

## Fonctions et methodes

- **Courtes et focalisees** — une methode fait une seule chose
- Extraire les sous-operations complexes en methodes privees
- `async/await` partout, jamais `.then()/.catch()`
- `Promise.all()` pour les operations independantes en parallele
- Methodes privees avec `private`, pas de `_` prefix
- Parametres : 3 max. Au-dela, utiliser un objet

```ts
// Bon
async createTeamWithMembers(data: { name: string; memberIds: string[] }): Promise<TeamRow> { ... }

// Mauvais
async createTeamWithMembers(name: string, description: string, gameId: string, memberIds: string[]): Promise<TeamRow> { ... }
```

## Immutabilite

- `readonly` pour les proprietes qui ne changent pas apres le constructeur
- Ne jamais muter les objets recus en parametre — creer de nouvelles references
- Les queries Knex reutilisees doivent etre `.clone()` avant modification

```ts
// Bon
const updatedUser = { ...user, display_name: newName };

// Mauvais
user.display_name = newName;
```

## Transactions

- `this.db.transaction(async (trx) => { ... })` pour les operations multi-tables
- Toutes les queries dans la transaction utilisent `trx`, pas `this.db`
- Creation avec entites associees (conversation + members) = transactionnel obligatoire

```ts
async createConversationWithMembers(data: CreateConversation, memberIds: string[]): Promise<ConversationRow> {
  return this.db.transaction(async (trx) => {
    const conversation = await trx('conversation').insert(data).returning('*').then(rows => rows[0]);
    await trx('conversation_member').insert(
      memberIds.map(id => ({ conversation_id: conversation.id, user_id: id }))
    );
    return conversation;
  });
}
```

## Securite

- **Jamais exposer** `password_hash` ou donnees sensibles dans les reponses API
- Les queries Knex sont parametrees par defaut — ne jamais concatener du SQL brut avec des inputs utilisateur
- Utiliser `whereILike` avec des templates Knex, pas de string interpolation dans les queries
- Valider tous les inputs aux frontieres du systeme (body, params, query) via Zod
- Les UUID en params doivent etre valides avec `.uuid()` dans le schema

```ts
// Bon — Knex parametrise automatiquement
query.where('email', email);
query.whereILike('name', `%${search}%`);

// Mauvais — injection SQL possible
query.whereRaw(`email = '${email}'`);
```

## Performance

- Selectionner uniquement les colonnes necessaires quand on fait des jointures (pas de `SELECT *` sur les deux tables)
- Utiliser `first()` au lieu de recuperer un array quand on attend un seul resultat
- Paginer systematiquement les listes — ne jamais retourner toutes les lignes
- Utiliser les index sur les colonnes de recherche frequente (FK, colonnes filtrees)
- `Promise.all()` pour les lectures independantes en parallele

```ts
// Bon — colonnes specifiques sur la jointure
const result = await this.db(this.table)
  .join('game', 'player_stats.game_id', 'game.id')
  .select('player_stats.*', 'game.name as game_name')
  .where('player_stats.user_id', userId);

// Bon — lectures paralleles
const [user, stats, team] = await Promise.all([
  userService.findById(userId),
  statsService.findByUserId(userId),
  teamService.findByMemberId(userId),
]);
```

## DRY mais pas premature

- Le CRUD est factorise dans `CrudRouteBuilder` et `BaseService` — ne pas redupliquer
- Les schemas de pagination/UUID sont definis une fois et reutilises
- Ne pas creer d'abstraction pour du code utilise une seule fois
- Si un pattern se repete 3+ fois, envisager de le factoriser dans `lib/`
- Trois lignes similaires > une abstraction prematuree
