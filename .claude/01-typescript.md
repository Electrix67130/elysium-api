# TypeScript — Regles strictes

## Configuration

Le projet utilise `strict: true` dans `tsconfig.json`. Ne jamais desactiver les options strict.

## Imports et exports

- **Toujours ES modules** (`import`/`export`), jamais `require`/`module.exports`
- Path aliases : `@/*` pour `src/*`, `@tests/*` pour `tests/*`
- Named exports par defaut, sauf plugin Fastify et classes service (export default)

```ts
// Bon
import BaseService from '@/lib/base-service';
import { createUserSchema, updateUserSchema, UserRow } from './user.schema';

// Mauvais
const BaseService = require('../../lib/base-service');
```

## Typage

- **Toujours typer explicitement** les parametres de fonction et les retours des methodes publiques
- Generics de BaseService : `extends BaseService<EntityRow>`
- Deriver les types depuis Zod : `z.infer<typeof schema>`
- Definir les Row types dans le fichier schema
- **Jamais `any`** — utiliser `unknown` + type guards si necessaire
- `as` uniquement quand TS ne peut pas inferer (ex: retour Knex)
- `interface` pour les formes d'objets, `type` pour les unions/intersections

```ts
// Deriver les types depuis Zod
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Row type = representation complete en BDD
export type UserRow = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name?: string;
  avatar_url?: string;
  country?: string;
  bio?: string;
  is_official: boolean;
  status_text?: string;
  is_online?: boolean;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
};
```

## Null safety

- Toujours gerer les cas `undefined` retournes par `findById` / `findOne`
- Preferer le narrowing explicite aux assertions non-null (`!`)
- Utiliser optional chaining (`?.`) et nullish coalescing (`??`) au lieu de checks manuels

```ts
// Bon
const user = await service.findById(id);
if (!user) return reply.notFound('User not found');

const displayName = user.display_name ?? user.username;

// Mauvais
const user = (await service.findById(id))!;
const displayName = user.display_name ? user.display_name : user.username;
```

## Type guards et narrowing

- Utiliser des type guards nommes pour les verifications complexes de types
- Preferer `in` operator ou `discriminatedUnion` plutot que des casts

```ts
function isUserRow(value: unknown): value is UserRow {
  return typeof value === 'object' && value !== null && 'username' in value;
}
```

## Utility types

- Utiliser `Pick<T, K>` / `Omit<T, K>` pour creer des sous-types depuis les Row types
- `Partial<T>` pour les updates, `Required<T>` pour forcer les champs
- Ne pas redeclarer manuellement ce que les utility types peuvent deriver

```ts
// Bon : deriver un type de reponse sans le password
type UserPublic = Omit<UserRow, 'password_hash'>;

// Bon : type pour les updates partiels
type UserPatch = Partial<Pick<UserRow, 'display_name' | 'avatar_url' | 'bio'>>;
```

## Enums et constantes

- `as const` pour les tableaux de valeurs fixes, jamais les `enum` TS
- Extraire le type union avec `typeof`

```ts
export const CONVERSATION_TYPES = ['dm', 'group', 'team', 'tournament'] as const;
type ConversationType = typeof CONVERSATION_TYPES[number];
// = 'dm' | 'group' | 'team' | 'tournament'

// Dans Zod
type: z.enum(CONVERSATION_TYPES),
```

## Exhaustive checks

- Utiliser `never` pour garantir que tous les cas d'une union sont traites

```ts
function getLabel(type: ConversationType): string {
  switch (type) {
    case 'dm': return 'Message prive';
    case 'group': return 'Groupe';
    case 'team': return 'Equipe';
    case 'tournament': return 'Tournoi';
    default: {
      const _exhaustive: never = type;
      throw new Error(`Type inconnu: ${_exhaustive}`);
    }
  }
}
```

## Generics

- BaseService utilise `T extends Record<string, unknown>` — toujours passer le Row type concret
- Les interfaces partagees (`PaginationOptions`, `PaginatedResult<T>`) sont exportees depuis `base-service.ts`

```ts
import BaseService, { PaginationOptions, PaginatedResult } from '@/lib/base-service';
```
