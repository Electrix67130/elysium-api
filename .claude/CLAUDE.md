# Elysium API — Guidelines

API REST pour la plateforme esport Elysium. Stack : **Fastify + Knex (PostgreSQL) + Zod + TypeScript**.

## Commandes

```bash
npm run dev              # Dev (nodemon + ts-node)
npm start                # Prod
npm run migrate          # Lancer les migrations
npm run migrate:make     # Creer une migration (ex: npm run migrate:make -- create_user)
npm run migrate:rollback # Rollback la derniere migration
npm run seed             # Lancer les seeds
npm run seed:make        # Creer un seed
npm test                 # Lancer les tests
```

## Architecture

```
src/
├── config/          # env.js, knexfile.js
├── lib/             # BaseService, CrudRouteBuilder (code generique)
├── migrations/      # Migrations Knex (fichiers horodates)
├── modules/         # Un dossier par entite (user/, game/, team/, etc.)
│   └── <entity>/
│       ├── index.ts            # Registration Fastify (point d'entree du module)
│       ├── <entity>.service.ts # Service (extends BaseService)
│       └── <entity>.schema.ts  # Schemas Zod + types TS
├── plugins/         # Plugins Fastify (database, error-handler)
├── seeds/           # Seeds Knex
├── app.ts           # Configuration Fastify (plugins + autoload modules)
└── server.ts        # Point d'entree (listen)
tests/
├── unit/            # Tests unitaires (miroir de src/)
├── integration/     # Tests d'integration (routes HTTP)
└── helpers/         # Utilitaires de test (buildApp, fixtures, etc.)
docs/
├── API.md           # Reference des endpoints (pour le frontend)
└── MCD_USER.md      # Schema de la BDD (MCD complet)
```

## Principes fondamentaux

- **Separation des couches** : Route (HTTP) -> Service (metier) -> BaseService (DB). Jamais de SQL dans les routes, jamais de HTTP dans les services.
- **Validation via Zod uniquement** dans les fichiers `.schema.ts`. Jamais dans les routes ou services.
- **Pas de try/catch dans les routes** : le error-handler global gere tout. Exception : WsHandler pour le parsing WebSocket.
- **Logique metier dans le service**, routes = simples ponts HTTP.
- **Un fichier = une responsabilite** : schema, service, ou routes — jamais de mix.
- **TypeScript strict** : `strict: true`, jamais de `any`, typer les parametres et retours publics.
- **ES modules uniquement** : `import`/`export`, jamais `require`/`module.exports`.
- **Path aliases** : `@/*` pour `src/*`, `@tests/*` pour `tests/*`.

## Guidelines detaillees

Les conventions completes sont decoupees par theme :

1. [TypeScript](./01-typescript.md) — Typage, generics, imports, enums
2. [Conventions de nommage](./02-naming.md) — Tables, fichiers, classes, variables, URLs
3. [Pattern CRUD](./03-crud-pattern.md) — Service, schema, routes, migration, seed (template obligatoire)
4. [Fastify](./04-fastify.md) — Plugins, decorators, hooks, WebSocket
5. [Clean code](./05-clean-code.md) — Style, securite, performance, principes
6. [Tests](./06-testing.md) — Unitaires, integration, conventions
7. [Patterns avances](./07-advanced-patterns.md) — Relations, jointures, upsert, filtrage

## Documentation — Regle obligatoire

**Toujours mettre a jour la documentation apres chaque modification.** C'est non-negociable.

- **`docs/API.md`** : mettre a jour a chaque ajout, modification ou suppression de route (endpoint, params, body, reponse, codes HTTP)
- **`docs/MCD_USER.md`** : mettre a jour a chaque nouvelle migration (table, colonne, FK, contrainte)
- **`.claude/`** : mettre a jour les guidelines si un nouveau pattern ou une nouvelle convention emerge

Ne jamais considerer une tache comme terminee si la documentation n'est pas a jour.

## Checklist nouveau module

1. **Schema** : `src/modules/<entity>/<entity>.schema.ts` — schemas Zod + types
2. **Service** : `src/modules/<entity>/<entity>.service.ts` — extends `BaseService<XxxRow>`
3. **Routes** : `src/modules/<entity>/index.ts` — `CrudRouteBuilder` + `fastify-plugin`
4. **Migration** : `npm run migrate:make -- create_<table>` puis up/down
5. **Seed** (optionnel) : `npm run seed:make -- <table>`
6. **Tests unitaires** : `tests/unit/modules/<entity>/`
7. **Tests integration** : `tests/integration/modules/<entity>/`
8. **Doc API** : mettre a jour `docs/API.md` **(obligatoire)**
9. **Doc MCD** : mettre a jour `docs/MCD_USER.md` **(obligatoire)**
10. **Verifier** : `npx tsc --noEmit` + `npm test`
