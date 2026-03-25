# MCD UML - Entite USER et relations

> Modele Conceptuel de Donnees pour l'application Elysium-UI.
> Base sur l'analyse des types, mocks et composants du codebase.

---

## Diagramme des entites

```
┌──────────────────────────────────────────────┐
│                    USER                       │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│     username           : VARCHAR(50) UQ       │
│     email              : VARCHAR(255) UQ      │
│     password_hash      : VARCHAR(255)         │
│     display_name       : VARCHAR(100)         │
│     avatar_url         : VARCHAR(500)         │
│     country            : CHAR(2)              │  ← ISO 3166-1 (ex: "FR")
│     bio                : TEXT                 │
│     is_official        : BOOLEAN              │  ← membre officiel Elysium
│     status_text        : VARCHAR(255)         │  ← "En jeu - Valorant"
│     is_online          : BOOLEAN              │
│     last_seen_at       : TIMESTAMP            │
│     created_at         : TIMESTAMP            │
│     updated_at         : TIMESTAMP            │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│              PLAYER_STATS                     │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  user_id           : UUID → USER          │
│ FK  game_id           : UUID → GAME          │
│     wins              : INTEGER               │
│     losses            : INTEGER               │
│     win_rate          : DECIMAL(5,2)          │  ← 74.70
│     total_matches     : INTEGER               │
│     tournaments_played: INTEGER               │
│     tournaments_won   : INTEGER               │
├──────────────────────────────────────────────┤
│ UQ (user_id, game_id)                         │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│                   GAME                        │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│     name              : VARCHAR(100)          │  ← "Valorant", "CS2", "LoL"
│     slug              : VARCHAR(50) UQ        │
│     image_url         : VARCHAR(500)          │
│     icon_url          : VARCHAR(500)          │
│     brand_color       : CHAR(7)               │  ← "#FF4655" (GameColors)
│     created_at        : TIMESTAMP             │
│     updated_at        : TIMESTAMP             │
│     deleted_at        : TIMESTAMP             │  ← soft delete
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│              FRIENDSHIP                       │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  sender_id         : UUID → USER          │
│ FK  receiver_id       : UUID → USER          │
│     status            : ENUM                  │  ← 'pending', 'accepted'
│     created_at        : TIMESTAMP             │
│     updated_at        : TIMESTAMP             │
├──────────────────────────────────────────────┤
│ UQ (sender_id, receiver_id)                   │
│ CHECK (sender_id != receiver_id)              │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│              USER_BLOCK                       │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  blocker_id        : UUID → USER          │
│ FK  blocked_id        : UUID → USER          │
│     created_at        : TIMESTAMP             │
├──────────────────────────────────────────────┤
│ UQ (blocker_id, blocked_id)                   │
│ CHECK (blocker_id != blocked_id)              │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│                   TEAM                        │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│     name              : VARCHAR(100)          │  ← "Team Alpha"
│     image_url         : VARCHAR(500)          │
│     description       : TEXT                  │
│ FK  game_id           : UUID → GAME          │  ← a discuter
│     created_at        : TIMESTAMP             │
│     updated_at        : TIMESTAMP             │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│           TEAM_MEMBERSHIP                     │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  user_id           : UUID → USER          │
│ FK  team_id           : UUID → TEAM          │
│     role              : ENUM                  │  ← 'capitaine', 'manager', 'membre'
│     joined_at         : TIMESTAMP             │
├──────────────────────────────────────────────┤
│ UQ (user_id, team_id)                         │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│            CONVERSATION                       │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│     name              : VARCHAR(100)          │  ← null pour DM
│     type              : ENUM                  │  ← 'dm', 'group', 'team', 'tournament'
│ FK  team_id           : UUID → TEAM           │  ← null sauf type='team'
│ FK  tournament_id     : UUID → TOURNAMENT     │  ← null sauf type='tournament'
│     created_at        : TIMESTAMP             │
│     updated_at        : TIMESTAMP             │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│        CONVERSATION_MEMBER                    │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  user_id           : UUID → USER          │
│ FK  conversation_id   : UUID → CONVERSATION  │
│     is_pinned         : BOOLEAN               │
│     is_muted          : BOOLEAN               │
│     unread_count      : INTEGER               │
│     last_read_at      : TIMESTAMP             │  ← derniere lecture (null = jamais lu)
│     joined_at         : TIMESTAMP             │
├──────────────────────────────────────────────┤
│ UQ (user_id, conversation_id)                 │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│            CHAT_MESSAGE                       │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  conversation_id   : UUID → CONVERSATION  │
│ FK  sender_id         : UUID → USER          │
│     content           : TEXT                  │
│     sender_tag        : VARCHAR(50)           │  ← "Organisateur"
│     sender_tag_color  : CHAR(7)               │
│     timestamp         : TIMESTAMP             │
│     created_at        : TIMESTAMP             │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│         MESSAGE_REACTION                      │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  message_id        : UUID → CHAT_MESSAGE  │
│ FK  user_id           : UUID → USER          │
│     emoji             : VARCHAR(10)           │
│     created_at        : TIMESTAMP             │
├──────────────────────────────────────────────┤
│ UQ (message_id, user_id, emoji)               │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│             TOURNAMENT                        │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│     name              : VARCHAR(200)          │
│ FK  game_id           : UUID → GAME          │
│ FK  organizer_id      : UUID → USER          │
│     status            : ENUM                  │  ← 'upcoming','ongoing','completed'
│     date              : TIMESTAMP             │
│     max_players       : INTEGER               │
│     team_size         : INTEGER               │
│     is_official       : BOOLEAN               │
│     description       : TEXT                  │
│     requires_approval : BOOLEAN               │  ← inscription avec validation manuelle
│     prize_pool        : VARCHAR(100)          │
│     registration_closes_at : TIMESTAMP        │  ← date limite d'inscription
│ FK  recurrence_id     : UUID → TOURNAMENT_RECURRENCE │  ← null si non recurrent
│     created_at        : TIMESTAMP             │
│     updated_at        : TIMESTAMP             │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│       TOURNAMENT_RECURRENCE                  │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  source_tournament_id : UUID → TOURNAMENT │  ← tournoi modele
│     recurrence_type   : ENUM                 │  ← 'weekly', 'monthly'
│     recurrence_end_at : TIMESTAMP            │  ← null = pas de fin
│     is_active         : BOOLEAN              │  ← permet de stopper la recurrence
│     created_at        : TIMESTAMP            │
│     updated_at        : TIMESTAMP            │
├──────────────────────────────────────────────┤
│ Contrainte: source_tournament.is_official = true │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│      TOURNAMENT_PARTICIPATION                 │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  user_id           : UUID → USER          │
│ FK  tournament_id     : UUID → TOURNAMENT    │
│ FK  team_id           : UUID → TEAM           │  ← null si solo
│     status            : ENUM                  │  ← 'confirmed','pending','cancelled'
│     registered_at     : TIMESTAMP             │
├──────────────────────────────────────────────┤
│ UQ (user_id, tournament_id)                   │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│           TWITCH_LINK                         │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  user_id           : UUID → USER          │
│     twitch_id         : VARCHAR(100) UQ      │
│     twitch_username   : VARCHAR(100)          │
│     display_name      : VARCHAR(100)          │
│     is_live           : BOOLEAN               │
│     viewer_count      : INTEGER               │
│     stream_title      : VARCHAR(500)          │
│     thumbnail_url     : VARCHAR(500)          │
│     linked_at         : TIMESTAMP             │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│          USER_SANCTION                        │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│ FK  user_id           : UUID → USER          │
│ FK  issued_by         : UUID → USER          │  ← admin/moderateur
│     type              : ENUM                  │  ← 'warning', 'ban'
│     scope             : ENUM                  │  ← 'platform', 'tournament', 'chat'
│     reason            : TEXT                  │
│     expires_at        : TIMESTAMP             │  ← null = permanent
│     is_active         : BOOLEAN               │  ← permet de lever avant expiration
│     created_at        : TIMESTAMP             │
│     updated_at        : TIMESTAMP             │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────┐
│                    NEWS                       │
├──────────────────────────────────────────────┤
│ PK  id                : UUID                 │
│     title             : VARCHAR(200)          │
│     summary           : VARCHAR(500)          │
│     content           : TEXT                  │
│     image_url         : VARCHAR(500)          │
│     category          : ENUM                  │  ← 'update', 'tournament', 'community', 'esport'
│ FK  author_id         : UUID → USER          │
│     published_at      : TIMESTAMP             │
│     created_at        : TIMESTAMP             │
│     updated_at        : TIMESTAMP             │
└──────────────────────────────────────────────┘
```

---

## Diagramme des cardinalites

```
USER ─── 0,N ─── PLAYER_STATS ─── N,1 ─── GAME
  │                                          │
  ├── 0,N ── FRIENDSHIP (sender) ── 0,N ── USER (receiver)
  │
  ├── 0,N ── USER_BLOCK (blocker) ── 0,N ── USER (blocked)
  │
  ├── 0,N ── TEAM_MEMBERSHIP ─── N,1 ─── TEAM ── N,1 ── GAME
  │
  ├── 0,N ── CONVERSATION_MEMBER ── N,1 ── CONVERSATION ── 0,1 ── TEAM
  │                                                        ├── 0,1 ── TOURNAMENT
  │
  ├── 0,N ── CHAT_MESSAGE ─── N,1 ─── CONVERSATION
  │
  ├── 0,N ── MESSAGE_REACTION ── N,1 ── CHAT_MESSAGE
  │
  ├── 0,N ── TOURNAMENT (organizer_id)
  │
  ├── 0,N ── TOURNAMENT_PARTICIPATION ── N,1 ── TOURNAMENT ── N,1 ── GAME
  │                                            │
  │                                            └── 0,1 ── TOURNAMENT_RECURRENCE
  │
  ├── 0,1 ── TWITCH_LINK
  │
  ├── 0,N ── NEWS (author_id)
  │
  └── 0,N ── USER_SANCTION (user_id + issued_by)
```

---

## Resume des relations depuis USER

| Relation                             | Cardinalite | Description                                    |
|--------------------------------------|-------------|------------------------------------------------|
| `USER → PLAYER_STATS`               | 1:N         | Stats par jeu (1 ligne par jeu joue)           |
| `USER ↔ USER` (Friendship)          | N:N         | Demande d'ami avec statut pending/accepted     |
| `USER ↔ USER` (Block)               | N:N         | Blocage unidirectionnel                        |
| `USER → TEAM` (Membership)          | N:N         | Role: capitaine / manager / membre             |
| `USER → CONVERSATION` (Member)      | N:N         | Participation aux conversations                |
| `USER → CHAT_MESSAGE`               | 1:N         | Messages envoyes                               |
| `USER → MESSAGE_REACTION`           | 1:N         | Reactions aux messages                         |
| `USER → TOURNAMENT` (organizer)     | 1:N         | Tournois organises                             |
| `USER → TOURNAMENT` (Participation) | N:N         | Inscriptions aux tournois                      |
| `USER → TWITCH_LINK`                | 1:0..1      | Compte Twitch lie (optionnel)                  |
| `USER → USER_SANCTION` (user_id)    | 1:N         | Sanctions recues (warnings, bans)              |
| `USER → NEWS` (author)              | 1:N         | Articles publies                               |
| `USER → USER_SANCTION` (issued_by)  | 1:N         | Sanctions emises (en tant qu'admin/moderateur) |
| `TOURNAMENT → TOURNAMENT_RECURRENCE` | 1:0..1     | Recurrence (weekly/monthly) pour tournois officiels |
| `CONVERSATION → TOURNAMENT`         | 0..1:1      | Conversation liee a un tournoi                 |

---

## Fonctionnement des sanctions (USER_SANCTION)

Le systeme de sanctions permet d'**avertir** ou de **bannir** un utilisateur, avec une duree configurable.

### Types de sanctions

| type        | Description                                          |
|-------------|------------------------------------------------------|
| `warning`   | Avertissement simple, pas de restriction             |
| `ban`       | Interdiction d'acces au scope defini                 |

### Scopes de sanctions

| scope        | Effet                                                           |
|--------------|-----------------------------------------------------------------|
| `platform`   | Ban global — plus d'acces a l'application                       |
| `tournament` | Interdit de participer/creer des tournois                       |
| `chat`       | Interdit d'envoyer des messages                                 |

### Regles metier

- `expires_at = null` → sanction permanente (jusqu'a levee manuelle)
- `expires_at = 2026-02-28 00:00:00` → ban temporaire de 2 jours par exemple
- `is_active = false` → sanction levee manuellement avant expiration
- Un user est considere **banni** si : `type = 'ban' AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())`
- Un user peut cumuler plusieurs sanctions (ex: warning + ban tournament)
- `issued_by` trace quel admin/moderateur a emis la sanction

### Exemples d'utilisation

```
-- Avertissement simple
{ type: 'warning', scope: 'platform', reason: 'Comportement toxique en chat', expires_at: null }

-- Ban tournoi 2 jours
{ type: 'ban', scope: 'tournament', reason: 'Triche detectee', expires_at: NOW() + 2 days }

-- Ban chat permanent
{ type: 'ban', scope: 'chat', reason: 'Spam repetitif', expires_at: null }

-- Ban plateforme 7 jours
{ type: 'ban', scope: 'platform', reason: 'Multi-compte', expires_at: NOW() + 7 days }

-- Verification: l'utilisateur est-il banni des tournois ?
SELECT EXISTS (
  FROM user_sanction
  WHERE user_id = :uid
    AND type = 'ban'
    AND scope = 'tournament'
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
)
```

---

## Origine des donnees (mapping codebase)

| Entite MCD               | Type source                    | Fichier                          |
|---------------------------|--------------------------------|----------------------------------|
| USER                      | `Contact`, `Friend`, `Player`  | `src/types/chat.ts`, `tournament.ts` |
| PLAYER_STATS              | `Player`                       | `src/types/tournament.ts`        |
| GAME                      | `GameColors` keys              | `src/constants/GameColors.ts`    |
| FRIENDSHIP                | `Friend`, `PotentialFriend`    | `src/types/chat.ts`             |
| USER_BLOCK                | `blockedUsers: Set<string>`    | `src/hooks/useConversations.ts`  |
| TEAM                      | Team groups dans mocks         | `src/mocks/groupData.ts`        |
| TEAM_MEMBERSHIP           | `GroupMember` + `TeamRole`     | `src/types/chat.ts`             |
| CONVERSATION              | `ConversationPreview`          | `src/types/chat.ts`             |
| CONVERSATION_MEMBER       | `pinnedConversations`, `notificationsDisabled` | `src/hooks/useConversations.ts` |
| CHAT_MESSAGE              | `ChatMessage`                  | `src/types/chat.ts`             |
| MESSAGE_REACTION          | `ChatMessage.reactions`        | `src/types/chat.ts`             |
| TOURNAMENT                | `TournamentInfo`               | `src/types/tournament.ts`        |
| TOURNAMENT_PARTICIPATION  | `Participant`                  | `src/mocks/participantsData.ts`  |
| TWITCH_LINK               | `TwitchStreamer`               | `src/types/home.ts`             |
| USER_SANCTION             | *nouveau* — pas dans le codebase actuel | —                       |
| NEWS                      | *nouveau*                      | `src/modules/news/`            |
| TOURNAMENT_RECURRENCE     | *nouveau*                      | `src/modules/tournament-recurrence/` |

---

## Notes

- `password_hash`, `email`, `last_seen_at` sont ajoutes pour la production (absents des mocks)
- `sender_tag` / `sender_tag_color` sur `CHAT_MESSAGE` permettent d'afficher des badges contextuels ("Organisateur", "Team Alpha")
- `TEAM_MEMBERSHIP.role` reprend le type `TeamRole` existant : `'capitaine' | 'manager' | 'membre'`
- Les permissions d'equipe sont gerees par `src/utils/teamPermissions.ts` (`canPerformAction`, `canKickTarget`)
- `TWITCH_LINK` est une entite separee (1:0..1) car tous les utilisateurs ne lient pas leur compte Twitch
- `GAME.deleted_at` permet le soft delete (desactiver un jeu sans perdre les donnees liees)
- `TOURNAMENT.requires_approval` remplace l'ancien `subscribe_with_validation` — inscription manuelle par l'organisateur
- `TOURNAMENT.registration_closes_at` remplace l'ancien `closed_subscription_at` — date limite pour s'inscrire
- `TOURNAMENT_PARTICIPATION.registered_at` remplace l'ancien `registration_date` — coherence de nommage
- `PLAYER_STATS.tournaments_won` (avec un seul 'n') — nombre de tournois gagnes par jeu
- `USER.is_official` remplace l'ancien `official_member` — coherence avec le prefixe `is_` des booleens
- `CONVERSATION.type` inclut desormais `'tournament'` — conversations auto-peuplees avec les participants confirmes
- `CONVERSATION` DM : exactement 2 membres, crees via `/conversations/dm`
- `CONVERSATION` team : membres synchronises avec `team_membership` via `/conversations/team/:id/sync`
- `CONVERSATION` tournament : membres synchronises avec `tournament_participation` (status='confirmed') via `/conversations/tournament/:id/sync`
- `TOURNAMENT_RECURRENCE` : seuls les tournois `is_official = true` peuvent avoir une recurrence
- `NEWS.category` : 'update', 'tournament', 'community', 'esport'
