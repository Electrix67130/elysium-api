# Pattern CRUD — Regles strictes

Chaque nouveau module CRUD DOIT suivre exactement ce pattern. Tous les modules doivent etre quasi-identiques. **Ne jamais devier sans raison metier explicite.**

## 1. Service (`<entity>.service.ts`)

```ts
import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { EntityRow } from './entity.schema';

class EntityService extends BaseService<EntityRow> {
  constructor(db: Knex) {
    super(db, 'table_name'); // nom de la table SQL (snake_case, singulier)
  }

  // UNIQUEMENT les methodes specifiques a cette entite.
  // Les methodes CRUD standard sont heritees — NE PAS les redefinir sauf besoin reel.
}

export default EntityService;
```

**Regles :**
- Toujours `extends BaseService<EntityRow>` avec le type Row generique
- Constructeur : uniquement `db: Knex`, appelle `super(db, 'table_name')`
- Ne jamais redefinir `findAll`/`findById`/`create`/`update`/`delete` sauf logique metier specifique
- Methodes custom utilisent `this.findOne()` ou `this.db(this.table)`
- Toute logique metier complexe dans le service, jamais dans les routes
- Toujours typer les parametres et retours des methodes publiques

**Methodes heritees de BaseService :**

| Methode | Description | Retour |
|---------|-------------|--------|
| `findAll({ page, limit, orderBy, order })` | Liste paginee | `PaginatedResult<T>` |
| `findById(id)` | Par UUID | `T \| undefined` |
| `findOne(where)` | Premier match | `T \| undefined` |
| `findMany(where)` | Tous les matchs | `T[]` |
| `create(data)` | Insertion | `T` |
| `createMany(dataArray)` | Insertion bulk | `T[]` |
| `update(id, data)` | MAJ (auto `updated_at`) | `T \| undefined` |
| `delete(id)` | Suppression hard | `boolean` |
| `softDelete(id)` | Set `deleted_at` | `T \| undefined` |

## 2. Schema (`<entity>.schema.ts`)

```ts
import { z } from 'zod';

export const createEntitySchema = z.object({
  // Champs requis + optionnels pour la creation
});

export const updateEntitySchema = z.object({
  // Tous optionnels (semantique PATCH)
});

export type CreateEntity = z.infer<typeof createEntitySchema>;
export type UpdateEntity = z.infer<typeof updateEntitySchema>;

export type EntityRow = {
  id: string;
  // ... colonnes metier
  created_at: string;
  updated_at: string;
};
```

**Regles :**
- Toujours exporter : `createXxxSchema`, `updateXxxSchema`, `CreateXxx`, `UpdateXxx`, `XxxRow`
- Le schema update rend TOUT optionnel (PATCH partiel)
- Jamais `id`, `created_at`, `updated_at`, `deleted_at` dans les schemas
- Types Zod adaptes : `.uuid()`, `.email()`, `.url()`, `.length(2)` pour country
- `.optional()` pour optionnel, `.nullable()` pour nullable
- `.trim()` sur les strings quand pertinent
- `.min()` / `.max()` pour les contraintes de longueur
- Constantes enum avec `as const` + `z.enum()`

## 3. Index / Routes (`index.ts`)

```ts
import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import EntityService from './entity.service';
import { createEntitySchema, updateEntitySchema } from './entity.schema';

const crud = new CrudRouteBuilder({
  prefix: '/entities',      // URL pluriel, kebab-case
  service: (fastify) => new EntityService(fastify.db),
  schemas: { create: createEntitySchema, update: updateEntitySchema },
  entityName: 'Entity',     // PascalCase singulier (pour messages d'erreur)
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'entity-module' });
```

**Routes generees par CrudRouteBuilder :**

| Methode | Route | Description | Status |
|---------|-------|-------------|--------|
| `GET` | `/{prefix}` | Liste paginee | 200 |
| `GET` | `/{prefix}/:id` | Detail par UUID | 200 / 404 |
| `POST` | `/{prefix}` | Creation | 201 |
| `PATCH` | `/{prefix}/:id` | Modification partielle | 200 / 404 |
| `DELETE` | `/{prefix}/:id` | Suppression | 204 / 404 |

**Pagination (query params GET list) :**
- `page` (defaut: 1, min: 1)
- `limit` (defaut: 20, min: 1, max: 100)
- `orderBy` (defaut: 'created_at')
- `order` (defaut: 'desc', enum: 'asc'|'desc')

## 4. Routes custom

Ajouter DANS le meme `index.ts`, APRES le CRUD :

```ts
export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, () => {
    fastify.get('/users/me', { preHandler: [fastify.authenticate] }, async (request) => {
      const service = new UserService(fastify.db);
      // ... logique
    });
    done();
  });
}, { name: 'user-module' });
```

**Regles routes custom :**
- Pas de try/catch — error-handler global
- Pas de logique metier — tout dans le service
- Valider body/params/query avec Zod avant d'appeler le service
- `reply.notFound()`, `reply.badRequest()` etc. (via @fastify/sensible)
- `{ preHandler: [fastify.authenticate] }` pour les routes protegees

## 5. Migration

```ts
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

**Regles :**
- Chaque table : `id` (UUID PK), `created_at`, `updated_at`
- `deleted_at` (timestamp nullable) si soft delete
- FK : `.references('id').inTable('xxx').onDelete('CASCADE')`
- Colonnes en snake_case, tables en snake_case singulier
- Enums : `table.enu('col', ['val1', 'val2'])`
- Unicite : `.unique()` ou `table.unique(['col1', 'col2'])`
- `down` = inverse exact du `up`
- Booleens : default explicite (`.defaultTo(false)`)
- `text` pour contenu long, `string(n)` pour contenu borne

## 6. Seed

```ts
exports.seed = async function (knex) {
  await knex('table_name').del();
  await knex('table_name').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      // ... donnees
    },
  ]);
};
```

**Regles :**
- UUID fixes (previsibles) pour tests et references FK
- `del()` puis `insert()`
- Respecter l'ordre des FK (supprimer enfants avant parents)
