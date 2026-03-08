# CLAUDE.md — Elysium API

## Projet

API REST pour la plateforme esport Elysium. Stack : Fastify + Knex (PostgreSQL) + Zod.

## Commandes

```bash
npm run dev          # Lancer en dev (nodemon)
npm start            # Lancer en prod
npm run migrate      # Lancer les migrations
npm run migrate:make # Creer une migration (ex: npm run migrate:make -- create_user)
npm run seed         # Lancer les seeds
```

## Architecture

```
src/
├── config/          # env.js, knexfile.js
├── lib/             # BaseService, CrudRouteBuilder (code generique)
├── migrations/      # Migrations Knex
├── modules/         # Un dossier par entite (user/, game/, team/, etc.)
│   └── <entity>/
│       ├── index.js            # Registration Fastify (point d'entree du module)
│       ├── <entity>.service.js # Service (extends BaseService)
│       └── <entity>.schema.js  # Schemas Zod (create + update)
├── plugins/         # Plugins Fastify (database, error-handler)
├── seeds/           # Seeds Knex
├── app.js           # Configuration Fastify
└── server.js        # Point d'entree
```

## Conventions de nommage

- **Tables SQL** : snake_case, singulier (`user`, `player_stats`, `chat_message`)
- **Colonnes SQL** : snake_case (`created_at`, `user_id`, `is_active`)
- **Fichiers** : kebab-case pour lib/, snake_case avec le nom de l'entite pour les modules (`user.service.js`)
- **Classes** : PascalCase (`UserService`, `GameService`)
- **Variables/fonctions** : camelCase

## Pattern CRUD — Regles strictes

Chaque nouveau module CRUD DOIT suivre exactement ce pattern. L'objectif est que tous les modules soient quasi-identiques.

### 1. Service (`<entity>.service.js`)

```js
const BaseService = require('../../lib/base-service');

class XxxService extends BaseService {
  constructor(db) {
    super(db, 'table_name'); // nom de la table SQL
  }

  // Ajouter ici UNIQUEMENT les methodes specifiques a cette entite
  // Les methodes CRUD standard (findAll, findById, create, update, delete)
  // sont heritees de BaseService — NE PAS les redefinir sauf besoin reel.
}

module.exports = XxxService;
```

**Regles :**
- Toujours extends BaseService
- Le constructeur prend uniquement `db` et appelle `super(db, 'table_name')`
- Ne jamais redefinir findAll/findById/create/update/delete sauf si la logique metier l'exige
- Les methodes custom (ex: `findByEmail`) utilisent `this.findOne()` ou `this.db(this.table)`

### 2. Schema (`<entity>.schema.js`)

```js
const { z } = require('zod');

const createXxxSchema = z.object({
  // Tous les champs requis + optionnels pour la creation
});

const updateXxxSchema = z.object({
  // Tous les champs optionnels (partial du create, sans les champs immutables)
});

module.exports = { createXxxSchema, updateXxxSchema };
```

**Regles :**
- Toujours exporter exactement `createXxxSchema` et `updateXxxSchema`
- Le schema create contient les champs requis et optionnels
- Le schema update rend TOUT optionnel (PATCH partiel)
- Ne jamais inclure `id`, `created_at`, `updated_at` dans les schemas
- Utiliser les bons types Zod : `.uuid()`, `.email()`, `.url()`, `.length(2)` pour country, etc.

### 3. Index / Routes (`index.js`)

```js
const fp = require('fastify-plugin');
const CrudRouteBuilder = require('../../lib/crud-route-builder');
const XxxService = require('./xxx.service');
const { createXxxSchema, updateXxxSchema } = require('./xxx.schema');

const crud = new CrudRouteBuilder({
  prefix: '/xxx',           // URL au pluriel
  service: (fastify) => new XxxService(fastify.db),
  schemas: { create: createXxxSchema, update: updateXxxSchema },
  entityName: 'Xxx',        // Pour les messages d'erreur
});

module.exports = fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'xxx-module' });
```

**Regles :**
- Le prefix est TOUJOURS au pluriel et en kebab-case (`/users`, `/player-stats`, `/chat-messages`)
- Utiliser `fp()` (fastify-plugin) pour eviter l'encapsulation
- Le name du plugin suit le pattern `<entity>-module`
- Pour ajouter des routes custom au-dela du CRUD, les enregistrer dans la callback fp() APRES `crud.register()`

### 4. Routes custom (au-dela du CRUD standard)

Si un module a besoin de routes supplementaires, les ajouter DANS le meme `index.js` :

```js
module.exports = fp((fastify, opts, done) => {
  crud.register(fastify, opts, () => {
    // Routes custom APRES le CRUD
    fastify.get('/users/me', async (request, reply) => {
      // ...
    });
    done();
  });
}, { name: 'user-module' });
```

### 5. Migration

Chaque table doit avoir :
- `id` UUID avec default `gen_random_uuid()`
- `created_at` timestamp default `now()`
- `updated_at` timestamp default `now()`
- Les FK avec `.references('id').inTable('xxx').onDelete('CASCADE')`

```js
exports.up = function (knex) {
  return knex.schema.createTable('table_name', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    // ... colonnes
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('table_name');
};
```

## Regles generales

- **Validation** : Toujours via Zod dans les schemas, jamais dans les routes ou services
- **Erreurs** : Utiliser `reply.notFound()`, `reply.badRequest()` etc. (via @fastify/sensible)
- **Pas de try/catch** dans les routes : le error-handler global gere tout
- **Pas de logique metier dans les routes** : tout dans le service
- **Pagination** : Toujours via `findAll()` du BaseService (page, limit, orderBy, order)
- **Soft delete** : Utiliser `service.softDelete(id)` pour les entites avec `deleted_at`
- **MCD** : Le schema de la BDD est documente dans `docs/MCD_USER.md`

## Checklist nouveau module

1. Creer le dossier `src/modules/<entity>/`
2. Creer `<entity>.schema.js` avec create + update schemas Zod
3. Creer `<entity>.service.js` extends BaseService
4. Creer `index.js` avec CrudRouteBuilder
5. Creer la migration SQL correspondante
6. Tester : GET, GET/:id, POST, PATCH/:id, DELETE/:id
