# Elysium API

API REST pour la plateforme esport **Elysium**. Gestion des utilisateurs, equipes, tournois, messagerie et integrations Twitch.

## Stack technique

- **Runtime** : Node.js + TypeScript (tsx)
- **Framework** : Fastify 5
- **Base de donnees** : PostgreSQL 17 (via Knex 3)
- **Validation** : Zod 4
- **Tests** : Jest + ts-jest

## Demarrage rapide

### Pre-requis

- Node.js >= 18
- Docker & Docker Compose

### Installation

```bash
git clone https://github.com/Electrix67130/elysium-api.git
cd elysium-api
npm install
cp .env.example .env
```

### Lancer la base de donnees

```bash
docker compose up -d elysium-db
```

### Lancer les migrations

```bash
npm run migrate
```

### Lancer le serveur

```bash
# Developpement (hot reload)
npm run dev

# Production
npm start
```

Le serveur demarre sur `http://localhost:3000`. Verifier avec `GET /health`.

### Docker (tout-en-un)

```bash
docker compose up -d
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur dev avec hot reload (tsx watch) |
| `npm start` | Serveur production |
| `npm run build` | Compilation TypeScript |
| `npm run migrate` | Appliquer les migrations |
| `npm run migrate:make -- <name>` | Creer une migration |
| `npm run migrate:rollback` | Annuler la derniere migration |
| `npm run seed` | Executer les seeds |
| `npm test` | Lancer tous les tests |
| `npm run test:unit` | Tests unitaires |
| `npm run test:integration` | Tests d'integration |

## Architecture

```
src/
├── config/          # Configuration (env, knexfile)
├── lib/             # Code generique (BaseService, CrudRouteBuilder)
├── migrations/      # Migrations Knex (JS)
├── modules/         # Un dossier par entite
│   └── <entity>/
│       ├── index.ts              # Routes Fastify (CrudRouteBuilder)
│       ├── <entity>.service.ts   # Service (extends BaseService)
│       └── <entity>.schema.ts    # Schemas Zod + types TypeScript
├── plugins/         # Plugins Fastify (database, error-handler)
├── seeds/           # Seeds Knex
├── app.ts           # Configuration Fastify
└── server.ts        # Point d'entree
```

## Modules

L'API expose 15 modules CRUD, chacun avec les endpoints standards :

| Module | Endpoint | Description |
|---|---|---|
| User | `/users` | Utilisateurs de la plateforme |
| Game | `/games` | Jeux supportes (Valorant, CS2, LoL...) |
| Friendship | `/friendships` | Relations d'amitie entre utilisateurs |
| User Block | `/user-blocks` | Systeme de blocage |
| Team | `/teams` | Equipes esport |
| Team Membership | `/team-memberships` | Membres d'equipe (capitaine, manager, membre) |
| Player Stats | `/player-stats` | Statistiques par joueur et par jeu |
| Conversation | `/conversations` | Conversations (DM, groupe, equipe) |
| Conversation Member | `/conversation-members` | Participants aux conversations |
| Chat Message | `/chat-messages` | Messages dans les conversations |
| Message Reaction | `/message-reactions` | Reactions emoji sur les messages |
| Tournament | `/tournaments` | Tournois esport |
| Tournament Participation | `/tournament-participations` | Inscriptions aux tournois |
| Twitch Link | `/twitch-links` | Comptes Twitch lies |
| User Sanction | `/user-sanctions` | Sanctions (warnings, bans) |

### Endpoints CRUD par module

Chaque module expose automatiquement :

```
GET    /<entity>             # Liste paginee
GET    /<entity>/:id         # Detail par ID
POST   /<entity>             # Creation
PATCH  /<entity>/:id         # Mise a jour partielle
DELETE /<entity>/:id         # Suppression
```

### Pagination

Tous les endpoints `GET /` supportent la pagination :

```
GET /users?page=2&limit=10&orderBy=created_at&order=desc
```

```json
{
  "data": [],
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 10,
    "totalPages": 15
  }
}
```

## Base de donnees

Le schema complet est documente dans [`docs/MCD_USER.md`](docs/MCD_USER.md).

### Entites principales

```
USER ─── PLAYER_STATS ─── GAME
  ├── FRIENDSHIP (N:N entre users)
  ├── USER_BLOCK (N:N entre users)
  ├── TEAM_MEMBERSHIP ─── TEAM ─── GAME
  ├── CONVERSATION_MEMBER ─── CONVERSATION ─── TEAM
  ├── CHAT_MESSAGE ─── CONVERSATION
  ├── MESSAGE_REACTION ─── CHAT_MESSAGE
  ├── TOURNAMENT (organisateur)
  ├── TOURNAMENT_PARTICIPATION ─── TOURNAMENT ─── GAME
  ├── TWITCH_LINK (1:0..1)
  └── USER_SANCTION (sanctions recues + emises)
```

## Tests

285 tests repartis en :
- **30 suites unitaires** : validation des schemas Zod + logique des services
- **15 suites d'integration** : tests HTTP end-to-end par module

```bash
npm test                   # Tous les tests (285)
npm run test:unit          # Tests unitaires
npm run test:integration   # Tests d'integration
```

## Variables d'environnement

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environnement |
| `PORT` | `3000` | Port du serveur |
| `HOST` | `0.0.0.0` | Host du serveur |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_NAME` | `elysium` | Nom de la base |
| `DB_USER` | `postgres` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | `postgres` | Mot de passe PostgreSQL |

## Licence

ISC
