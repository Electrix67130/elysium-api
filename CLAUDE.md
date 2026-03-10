# CLAUDE.md — Elysium API

## Projet

API REST pour la plateforme esport Elysium. Stack : Fastify + Knex (PostgreSQL) + Zod.

## Commandes

```bash
npm run dev          # Lancer en dev (nodemon)
npm start            # Lancer en prod
npm run migrate      # Lancer les migrations
npm run migrate:make # Creer une migration (ex: npm run migrate:make -- create_user)
npm run migrate:rollback # Rollback la derniere migration
npm run seed         # Lancer les seeds
npm run seed:make    # Creer un seed
npm test             # Lancer les tests
```

## Architecture

```
src/
├── config/          # env.js, knexfile.js
├── lib/             # BaseService, CrudRouteBuilder (code generique)
├── migrations/      # Migrations Knex (fichiers horodates)
├── modules/         # Un dossier par entite (user/, game/, team/, etc.)
│   └── <entity>/
│       ├── index.js            # Registration Fastify (point d'entree du module)
│       ├── <entity>.service.js # Service (extends BaseService)
│       └── <entity>.schema.js  # Schemas Zod (create + update)
├── plugins/         # Plugins Fastify (database, error-handler)
├── seeds/           # Seeds Knex
├── app.js           # Configuration Fastify (plugins + autoload modules)
└── server.js        # Point d'entree (listen)
tests/
├── unit/            # Tests unitaires (miroir de src/)
│   ├── modules/     # Tests des services et schemas
│   └── lib/         # Tests de BaseService, CrudRouteBuilder
├── integration/     # Tests d'integration (routes HTTP)
└── helpers/         # Utilitaires de test (buildApp, fixtures, etc.)
docs/
└── MCD_USER.md      # Schema de la BDD (MCD complet)
```

---

## Conventions de nommage

| Categorie | Style | Exemples |
|-----------|-------|----------|
| **Tables SQL** | snake_case, singulier | `user`, `player_stats`, `chat_message` |
| **Colonnes SQL** | snake_case | `created_at`, `user_id`, `is_active` |
| **Fichiers lib/** | kebab-case | `base-service.js`, `crud-route-builder.js` |
| **Fichiers modules** | snake_case avec entite | `user.service.js`, `user.schema.js` |
| **Fichiers tests** | meme nom + `.test.js` | `user.service.test.js`, `user.schema.test.js` |
| **Classes** | PascalCase | `UserService`, `GameService` |
| **Variables/fonctions** | camelCase | `findByEmail`, `userId` |
| **URL prefixes** | kebab-case, pluriel | `/users`, `/player-stats`, `/chat-messages` |
| **Noms de plugins** | kebab-case + `-module` | `user-module`, `team-module` |
| **Noms de colonnes date** | `created_at`, `updated_at`, `deleted_at` | Convention stricte |

---

## Pattern CRUD — Regles strictes

Chaque nouveau module CRUD DOIT suivre exactement ce pattern. L'objectif est que tous les modules soient quasi-identiques. **Ne jamais devier de ce pattern sans raison metier explicite.**

### 1. Service (`<entity>.service.js`)

```js
const BaseService = require('../../lib/base-service');

class XxxService extends BaseService {
  constructor(db) {
    super(db, 'table_name'); // nom de la table SQL (snake_case, singulier)
  }

  // Ajouter ici UNIQUEMENT les methodes specifiques a cette entite.
  // Les methodes CRUD standard (findAll, findById, create, update, delete)
  // sont heritees de BaseService — NE PAS les redefinir sauf besoin reel.
}

module.exports = XxxService;
```

**Regles :**
- Toujours `extends BaseService`
- Le constructeur prend uniquement `db` et appelle `super(db, 'table_name')`
- Ne jamais redefinir `findAll`/`findById`/`create`/`update`/`delete` sauf si la logique metier l'exige
- Les methodes custom (ex: `findByEmail`) utilisent `this.findOne()` ou `this.db(this.table)`
- Toute logique metier complexe va dans le service, jamais dans les routes
- Les methodes custom de recherche suivent le nommage `findByXxx(value)` (comme les repositories PHP)
- Pour les recherches multi-criteres, utiliser `this.findMany(where)`

**Methodes heritees de BaseService :**

| Methode | Description | Retour |
|---------|-------------|--------|
| `findAll({ page, limit, orderBy, order })` | Liste paginee | `{ data, meta: { total, page, limit, totalPages } }` |
| `findById(id)` | Par UUID | Row ou `undefined` |
| `findOne(where)` | Premier match | Row ou `undefined` |
| `findMany(where)` | Tous les matchs | `Row[]` |
| `create(data)` | Insertion | Row cree |
| `createMany(dataArray)` | Insertion bulk | `Row[]` |
| `update(id, data)` | MAJ (auto `updated_at`) | Row mis a jour ou `undefined` |
| `delete(id)` | Suppression hard | `boolean` |
| `softDelete(id)` | Set `deleted_at` | Row ou `undefined` |

### 2. Schema (`<entity>.schema.js`)

```js
const { z } = require('zod');

const createXxxSchema = z.object({
  // Tous les champs requis + optionnels pour la creation
});

const updateXxxSchema = z.object({
  // Tous les champs optionnels (PATCH partiel)
});

module.exports = { createXxxSchema, updateXxxSchema };
```

**Regles :**
- Toujours exporter exactement `createXxxSchema` et `updateXxxSchema`
- Le schema create contient les champs requis et optionnels pour la creation
- Le schema update rend TOUT optionnel (semantique PATCH : seuls les champs presents sont modifies)
- Ne jamais inclure `id`, `created_at`, `updated_at`, `deleted_at` dans les schemas
- Utiliser les bons types Zod : `.uuid()`, `.email()`, `.url()`, `.length(2)` pour country, etc.
- Les champs optionnels utilisent `.optional()`, les nullable utilisent `.nullable()`
- Ajouter `.trim()` sur les champs string quand pertinent
- Ajouter `.min()` / `.max()` pour les contraintes de longueur

**Exemple concret (User) :**
```js
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(255),
  password_hash: z.string().min(1),
  display_name: z.string().max(100).optional(),
  avatar_url: z.string().url().max(500).optional(),
  country: z.string().length(2).optional(),
  bio: z.string().optional(),
  is_official: z.boolean().default(false).optional(),
});
```

### 3. Index / Routes (`index.js`)

```js
const fp = require('fastify-plugin');
const CrudRouteBuilder = require('../../lib/crud-route-builder');
const XxxService = require('./xxx.service');
const { createXxxSchema, updateXxxSchema } = require('./xxx.schema');

const crud = new CrudRouteBuilder({
  prefix: '/xxx',           // URL au pluriel, kebab-case
  service: (fastify) => new XxxService(fastify.db),
  schemas: { create: createXxxSchema, update: updateXxxSchema },
  entityName: 'Xxx',        // Pour les messages d'erreur (PascalCase singulier)
});

module.exports = fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'xxx-module' });
```

**Regles :**
- Le prefix est TOUJOURS au pluriel et en kebab-case (`/users`, `/player-stats`, `/chat-messages`)
- Utiliser `fp()` (fastify-plugin) pour eviter l'encapsulation
- Le name du plugin suit le pattern `<entity>-module`
- `service` est une factory function recevant `fastify` (pour acceder a `fastify.db`)
- Pour ajouter des routes custom au-dela du CRUD, les enregistrer dans la callback `fp()` APRES `crud.register()`

**Routes generees automatiquement par CrudRouteBuilder :**

| Methode | Route | Description | Status |
|---------|-------|-------------|--------|
| `GET` | `/{prefix}` | Liste paginee | 200 |
| `GET` | `/{prefix}/:id` | Detail par UUID | 200 / 404 |
| `POST` | `/{prefix}` | Creation | 201 |
| `PATCH` | `/{prefix}/:id` | Modification partielle | 200 / 404 |
| `DELETE` | `/{prefix}/:id` | Suppression | 204 / 404 |

**Pagination (query params pour GET list) :**
- `page` (defaut: 1, min: 1)
- `limit` (defaut: 20, min: 1, max: 100)
- `orderBy` (defaut: 'created_at')
- `order` (defaut: 'desc', enum: 'asc'|'desc')

### 4. Routes custom (au-dela du CRUD standard)

Si un module a besoin de routes supplementaires, les ajouter DANS le meme `index.js` :

```js
module.exports = fp((fastify, opts, done) => {
  crud.register(fastify, opts, () => {
    // Routes custom APRES le CRUD
    fastify.get('/users/me', async (request, reply) => {
      const service = new UserService(fastify.db);
      // ... logique
    });
    done();
  });
}, { name: 'user-module' });
```

**Regles pour les routes custom :**
- Pas de try/catch — le error-handler global gere les erreurs
- Pas de logique metier dans la route — tout dans le service
- Valider le body/params avec Zod avant d'appeler le service
- Utiliser `reply.notFound()`, `reply.badRequest()` etc. (via @fastify/sensible)

### 5. Migration

```js
exports.up = function (knex) {
  return knex.schema.createTable('table_name', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    // ... colonnes metier
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('table_name');
};
```

**Regles migrations :**
- Chaque table DOIT avoir : `id` (UUID PK), `created_at`, `updated_at`
- Ajouter `deleted_at` (timestamp nullable) si l'entite supporte le soft delete
- Les FK : `.references('id').inTable('xxx').onDelete('CASCADE')`
- Noms de colonnes en snake_case
- Noms de tables en snake_case, singulier
- Les colonnes enum utilisent `table.enu('col', ['val1', 'val2'])`
- Les champs avec contrainte d'unicite utilisent `.unique()` ou `table.unique(['col1', 'col2'])` pour les composites
- Le `down` doit TOUJOURS etre l'inverse exact du `up` (drop la table)
- Les colonnes `boolean` ont un default explicite : `.defaultTo(false)` ou `.defaultTo(true)`
- Les colonnes `text` pour du contenu long, `string(n)` pour du contenu borne

**Colonnes communes :**

| Colonne | Type | Nullable | Default | Usage |
|---------|------|----------|---------|-------|
| `id` | uuid | non | `gen_random_uuid()` | Cle primaire |
| `created_at` | timestamp | non | `now()` | Date de creation |
| `updated_at` | timestamp | non | `now()` | Date de modification |
| `deleted_at` | timestamp | oui | `null` | Soft delete |

### 6. Seed

```js
exports.seed = async function (knex) {
  // Supprimer les donnees existantes (dans l'ordre inverse des FK)
  await knex('table_name').del();

  // Inserer les donnees de test
  await knex('table_name').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      // ... donnees
    },
  ]);
};
```

**Regles seeds :**
- Utiliser des UUID fixes (previsibles) pour faciliter les tests et les references FK
- Supprimer avant d'inserer (`del()` puis `insert()`)
- Respecter l'ordre des FK (supprimer enfants avant parents, inserer parents avant enfants)

---

## Regles generales

### Validation
- **Toujours via Zod** dans les fichiers schema, jamais dans les routes ou les services
- Le error-handler global transforme les `ZodError` en reponse 400 avec le detail des erreurs
- Ne jamais inclure les champs auto-generes (`id`, `created_at`, `updated_at`) dans les schemas

### Gestion d'erreurs
- **Pas de try/catch dans les routes** : le error-handler global (`src/plugins/error-handler.js`) gere tout
- Utiliser `reply.notFound('Message')`, `reply.badRequest('Message')` etc. (via `@fastify/sensible`)
- Format de reponse erreur standard : `{ statusCode, error, message }`
- Les erreurs Zod retournent un format : `{ statusCode: 400, error: 'Validation Error', message: { champ: 'description' } }`
- Les erreurs inconnues retournent un 500 generique (le detail est loge, pas expose au client)

### Logique metier
- **Toute la logique metier va dans le service**, jamais dans les routes
- Les routes sont de simples ponts entre HTTP et le service (comme les Controllers PHP)
- Un service peut appeler d'autres services si necessaire

### Pagination
- Toujours via `findAll()` du BaseService avec les params `page`, `limit`, `orderBy`, `order`
- Reponse paginee : `{ data: [...], meta: { total, page, limit, totalPages } }`

### Soft delete
- Utiliser `service.softDelete(id)` pour les entites avec `deleted_at`
- Les entites soft-deleted doivent etre traitees comme inexistantes dans les `findById` custom
- Pour filtrer les soft-deleted dans les listes, ajouter `.whereNull('deleted_at')` dans le service

### Documentation
- Le schema de la BDD est documente dans `docs/MCD_USER.md`
- Ce fichier CLAUDE.md sert de reference pour les conventions du projet

---

## Tests

### Structure des tests

Les tests suivent la structure miroir de `src/` :

```
tests/
├── unit/
│   ├── modules/
│   │   └── user/
│   │       ├── user.service.test.js
│   │       └── user.schema.test.js
│   └── lib/
│       ├── base-service.test.js
│       └── crud-route-builder.test.js
├── integration/
│   ├── modules/
│   │   └── user/
│   │       └── user.routes.test.js
│   └── health.test.js
└── helpers/
    ├── build-app.js          # Factory pour creer l'app de test
    ├── fixtures.js            # Donnees de test reutilisables
    └── db.js                  # Utilitaires DB pour les tests d'integration
```

### Tests unitaires (tests/unit/)

Miroir exact de `src/`. Chaque fichier source a son fichier `.test.js`.

**Tests de schemas :**
- Tester que le schema accepte les donnees valides
- Tester chaque regle de validation (min, max, email, uuid, etc.)
- Tester que les champs optionnels sont bien optionnels
- Tester que les champs requis sont bien requis
- Tester les valeurs par defaut

```js
describe('createUserSchema', () => {
  it('should accept valid data', () => {
    const result = createUserSchema.safeParse({ /* donnees valides */ });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = createUserSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });
});
```

**Tests de services :**
- Mocker `db` (l'objet Knex) pour ne pas toucher a la BDD
- Tester chaque methode custom du service
- Verifier les appels a `this.findOne()`, `this.db(this.table)` etc.
- Tester les cas limites (not found, donnees invalides)

```js
describe('UserService', () => {
  let service;
  let mockDb;

  beforeEach(() => {
    mockDb = /* mock Knex */;
    service = new UserService(mockDb);
  });

  it('should find user by email', async () => {
    // ...
  });
});
```

### Tests d'integration (tests/integration/)

Testent les routes HTTP de bout en bout avec une vraie base de donnees (ou une base de test).

**Regles :**
- Utiliser `buildApp()` pour creer une instance Fastify de test
- Utiliser `fastify.inject()` pour simuler les requetes HTTP (pas de serveur reel)
- Reinitialiser la base avant chaque test ou suite de tests
- Tester les codes de retour HTTP (200, 201, 204, 400, 404)
- Tester le format des reponses JSON
- Tester la pagination (meta, data)

```js
describe('GET /users', () => {
  let app;

  beforeAll(async () => {
    app = await buildApp();
    // seed la base
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated users', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users?page=1&limit=10',
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('should return 404 for unknown user', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/00000000-0000-0000-0000-000000000099',
    });
    expect(response.statusCode).toBe(404);
  });
});
```

### Conventions de test generales

- **Nommage** : `describe` pour le sujet, `it`/`test` pour le comportement
- **Pattern AAA** : Arrange, Act, Assert — toujours dans cet ordre
- **Un assert par test** quand possible (tester un comportement a la fois)
- **Pas de logique metier dans les tests** — les tests doivent etre simples et lisibles
- **Mocker au maximum** dans les tests unitaires pour isoler le sujet
- **Ne jamais tester l'implementation** mais le comportement (pas de test sur le SQL genere)
- **Nommage des tests** : `should [comportement attendu]` ou `should [comportement] when [condition]`

---

## Checklist nouveau module

1. **Creer le dossier** `src/modules/<entity>/`
2. **Schema** : `<entity>.schema.js` avec `createXxxSchema` + `updateXxxSchema` (Zod)
3. **Service** : `<entity>.service.js` extends `BaseService`, uniquement methodes custom
4. **Routes** : `index.js` avec `CrudRouteBuilder` + `fastify-plugin`
5. **Migration** : `npm run migrate:make -- create_<table>` puis remplir le up/down
6. **Seed** (optionnel) : `npm run seed:make -- <table>` avec donnees de test
7. **Tests unitaires** : `tests/unit/modules/<entity>/<entity>.schema.test.js` + `<entity>.service.test.js`
8. **Tests integration** : `tests/integration/modules/<entity>/<entity>.routes.test.js`
9. **Verifier** les 5 routes : `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`

---

## Patterns avances

### Relations entre entites

Pour les entites avec des FK (ex: `player_stats` -> `user`, `game`), le service peut ajouter des methodes de recherche par FK :

```js
class PlayerStatsService extends BaseService {
  constructor(db) {
    super(db, 'player_stats');
  }

  async findByUserId(userId) {
    return this.findMany({ user_id: userId });
  }

  async findByGameId(gameId) {
    return this.findMany({ game_id: gameId });
  }

  async findByUserAndGame(userId, gameId) {
    return this.findOne({ user_id: userId, game_id: gameId });
  }
}
```

### Jointures dans les services

Si une route necessite des donnees de plusieurs tables, utiliser `this.db` directement dans le service :

```js
async findWithDetails(id) {
  return this.db(this.table)
    .join('game', 'player_stats.game_id', 'game.id')
    .where('player_stats.id', id)
    .select('player_stats.*', 'game.name as game_name')
    .first();
}
```

### Contraintes d'unicite composites

Pour les tables avec des contraintes d'unicite sur plusieurs colonnes (ex: `friendship`, `user_block`) :

```js
// Dans la migration
table.unique(['sender_id', 'receiver_id']);

// Dans le service
async findByPair(senderId, receiverId) {
  return this.findOne({ sender_id: senderId, receiver_id: receiverId });
}
```

### Enumeration de valeurs

Pour les colonnes avec des valeurs fixes (ex: `status`, `role`, `type`) :

```js
// Dans le schema
const TEAM_ROLES = ['capitaine', 'manager', 'membre'];
const roleSchema = z.enum(TEAM_ROLES);

// Dans la migration
table.enu('role', ['capitaine', 'manager', 'membre']).notNullable();
```

### Filtrage avance dans les listes

Si un module necessite du filtrage au-dela de la pagination standard, surcharger dans le service :

```js
async findAll({ page = 1, limit = 20, orderBy = 'created_at', order = 'desc', filters = {} } = {}) {
  const query = this.db(this.table);

  // Appliquer les filtres
  if (filters.status) {
    query.where('status', filters.status);
  }
  if (filters.gameId) {
    query.where('game_id', filters.gameId);
  }
  if (filters.search) {
    query.whereILike('name', `%${filters.search}%`);
  }

  // Exclure les soft-deleted
  query.whereNull('deleted_at');

  const total = await query.clone().count('id as count').first();
  const data = await query
    .orderBy(orderBy, order)
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    data,
    meta: { total: parseInt(total.count), page, limit, totalPages: Math.ceil(total.count / limit) },
  };
}
```

Et ajouter une route custom dans `index.js` ou passer les filtres via les query params dans le CrudRouteBuilder.
