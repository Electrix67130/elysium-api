# Elysium API — Reference des endpoints

> Ce fichier sert de contexte pour le developpement frontend. Copier dans le CLAUDE.md du projet front ou le referencer.

## Base URL

```
http://localhost:3000
```

## Headers requis

| Header | Valeur | Obligatoire |
|---|---|---|
| `x-api-key` | Cle API configuree dans `.env` | Oui (sauf `/health`) |
| `Authorization` | `Bearer <access_token>` | Routes protegees uniquement |
| `Content-Type` | `application/json` | POST / PATCH |

## Authentification

### POST /auth/register

Inscription d'un nouvel utilisateur.

```ts
// Request
axios.post('/auth/register', {
    username: string,       // requis, 3-50 chars
    email: string,          // requis, email valide
    password: string,       // requis, 8-128 chars
    display_name?: string,  // max 100 chars
    country?: string,       // 2 chars (ISO 3166-1, ex: "FR")
})

// Response 201
{
    user: { id, username, email, display_name, country, is_official, created_at, updated_at },
    access_token: string,   // JWT, expire apres 15min
        refresh_token: string,  // JWT, n'expire jamais (rotation a chaque refresh)
}
```

### POST /auth/login

```ts
axios.post('/auth/login', {
    email: string,     // requis
    password: string,  // requis
})

// Response 200 — meme format que register
```

### POST /auth/refresh

Renouveler le access token. Le refresh token est tourne (l'ancien est invalide).

```ts
axios.post('/auth/refresh', {
    refresh_token: string,  // requis
})

// Response 200
{ access_token: string, refresh_token: string }
```

### POST /auth/logout `🔒 JWT`

Revoque tous les refresh tokens de l'utilisateur.

```ts
axios.post('/auth/logout', null, {
    headers: { Authorization: `Bearer ${accessToken}` }
})

// Response 204
```

### GET /auth/me `🔒 JWT`

```ts
axios.get('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
})

// Response 200
{ id, username, email, display_name, avatar_url, country, bio, is_official, status_text, is_online, last_seen_at, created_at, updated_at }
// Note: password_hash n'est JAMAIS retourne
```

---

## Pattern CRUD standard

Tous les modules ci-dessous exposent les 5 memes endpoints :

```ts
// Liste paginee
axios.get('/users?page=1&limit=20&orderBy=created_at&order=desc')
// Response 200
{ data: T[], meta: { total, page, limit, totalPages } }

// Detail
axios.get('/users/:id')
// Response 200 | 404

// Creation
axios.post('/users', { ...body })
// Response 201

// Mise a jour partielle
axios.patch('/users/:id', { ...body })
// Response 200 | 404

// Suppression
axios.delete('/users/:id')
// Response 204 | 404
```

### Parametres de pagination (query string)

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page courante (min 1) |
| `limit` | number | 20 | Resultats par page (1-100) |
| `orderBy` | string | `created_at` | Colonne de tri |
| `order` | `asc` \| `desc` | `desc` | Ordre de tri |

---

## Modules

### Users — `/users`

**Create :**
```ts
{
    username: string,        // requis, 3-50 chars
        email: string,           // requis, email valide
        password_hash: string,   // requis (utiliser /auth/register pour l'inscription)
        display_name?: string,   // max 100 chars
        avatar_url?: string,     // URL valide, max 500 chars
        country?: string,        // 2 chars
        bio?: string,
        is_official?: boolean,   // default false
}
```

**Update (tous optionnels) :**
```ts
{
    username?: string,
        email?: string,
        display_name?: string,
        avatar_url?: string,
        country?: string,
        bio?: string,
        is_official?: boolean,
        status_text?: string,    // max 255 chars
}
```

#### GET /users/search `🔒 JWT`

Recherche d'utilisateurs par username ou display_name (pagine). Exclut automatiquement l'utilisateur connecte, ses amis/demandes en cours, et les utilisateurs bloques (dans les deux sens).

```ts
axios.get('/users/search?q=jul&page=1&limit=20', {
    headers: { Authorization: `Bearer ${accessToken}` }
})
// Response 200
{
    data: [
        { id, username, display_name, avatar_url, is_online, country },
        ...
    ],
    meta: { total, page, limit, totalPages }
}
// q: 1-50 chars, page: min 1 (default 1), limit: 1-50 (default 20)
```

---

### Games — `/games`

**Create :**
```ts
{
    name: string,            // requis, 1-100 chars
        slug: string,            // requis, 1-50 chars
        image_url?: string,      // URL valide, max 500 chars
        icon_url?: string,       // URL valide, max 500 chars
        brand_color?: string,    // hex color, ex: "#FF4655"
}
```

**Update :** memes champs, tous optionnels.

---

### Teams — `/teams`

**Create :**
```ts
{
    name: string,            // requis, 1-100 chars
        image_url?: string,      // URL valide, max 500 chars
        description?: string,
        game_id?: string,        // UUID
}
```

**Update :** memes champs, tous optionnels.

---

### Friendships — `/friendships`

#### GET /friendships `🔒 JWT`

Retourne les amis acceptes de l'utilisateur connecte avec leurs infos (paginee).

```ts
axios.get('/friendships?page=1&limit=20', {
    headers: { Authorization: `Bearer ${accessToken}` }
})
// Response 200
{
    data: [
        { id, username, display_name, avatar_url, is_online, last_seen_at, status_text },
        ...
    ],
    meta: { total, page, limit, totalPages }
}
// Response 401 si token manquant/invalide
```

#### GET /friendships/pending `🔒 JWT`

Retourne les demandes d'amis en attente recues par l'utilisateur connecte (pagine).

```ts
axios.get('/friendships/pending?page=1&limit=20', {
    headers: { Authorization: `Bearer ${accessToken}` }
})
// Response 200
{
    data: [
        { friendship_id, created_at, user_id, username, display_name, avatar_url },
        ...
    ],
    meta: { total, page, limit, totalPages }
}
```

#### GET /friendships/sent `🔒 JWT`

Retourne les demandes d'amis en attente envoyees par l'utilisateur connecte (pagine).

```ts
axios.get('/friendships/sent?page=1&limit=20', {
    headers: { Authorization: `Bearer ${accessToken}` }
})
// Response 200
{
    data: [
        { friendship_id, created_at, user_id, username, display_name, avatar_url },
        ...
    ],
    meta: { total, page, limit, totalPages }
}
```

**Create :**
```ts
{
    sender_id: string,       // UUID, requis
    receiver_id: string,     // UUID, requis
}
```

**Update :**
```ts
{
    status?: 'pending' | 'accepted',
}
```

---

### User Blocks — `/user-blocks`

#### GET /user-blocks/me `🔒 JWT`

Retourne les utilisateurs bloques par l'utilisateur connecte (pagine).

```ts
axios.get('/user-blocks/me?page=1&limit=20', {
    headers: { Authorization: `Bearer ${accessToken}` }
})
// Response 200
{
    data: [
        { block_id, blocked_at, id, username, display_name, avatar_url },
        ...
    ],
    meta: { total, page, limit, totalPages }
}
```

**Create :**
```ts
{
    blocker_id: string,      // UUID, requis
        blocked_id: string,      // UUID, requis
}
```

**Update :** aucun champ modifiable.

---

### Team Memberships — `/team-memberships`

**Create :**
```ts
{
    user_id: string,         // UUID, requis
        team_id: string,         // UUID, requis
        role?: 'capitaine' | 'manager' | 'membre',  // default 'membre'
}
```

**Update :**
```ts
{
    role?: 'capitaine' | 'manager' | 'membre',
}
```

---

### Player Stats — `/player-stats`

**Create :**
```ts
{
    user_id: string,              // UUID, requis
        game_id: string,              // UUID, requis
        wins?: number,                // default 0
        losses?: number,              // default 0
        win_rate?: number,            // 0-100, default 0
        total_matches?: number,       // default 0
        tournaments_played?: number,  // default 0
        tournaments_won?: number,     // default 0
}
```

**Update :** memes champs (sans user_id/game_id), tous optionnels.

---

### Conversations — `/conversations`

#### GET /conversations `🔒 JWT`

Retourne uniquement les conversations dont l'utilisateur connecte est membre (paginee).

```ts
axios.get('/conversations?page=1&limit=20', {
    headers: { Authorization: `Bearer ${accessToken}` }
})
// Response 200
{ data: Conversation[], meta: { total, page, limit, totalPages } }
// Response 401 si token manquant/invalide
```

Pour les conversations de type `dm`, chaque element contient un champ `recipient` avec les infos de l'autre membre :

```ts
// Conversation DM enrichie
{
    id: string,
    type: 'dm',
    name: null,
    recipient: {
        id: string,              // UUID de l'autre utilisateur
        username: string,
        display_name: string | null,
        avatar_url: string | null,
        is_online: boolean,
    },
    created_at: string,
    updated_at: string,
}
```

> Le front peut utiliser `recipient.display_name || recipient.username` comme nom de conversation.

**Create (generique) :**
```ts
{
    name?: string,           // max 100 chars (null pour DM)
    type: 'dm' | 'group' | 'team' | 'tournament',  // requis
    team_id?: string,        // UUID (requis si type='team')
    tournament_id?: string,  // UUID (requis si type='tournament')
}
```

**Update :**
```ts
{
    name?: string,
}
```

**Routes custom (creation avec logique metier) :**

#### POST /conversations/dm

Cree un DM entre 2 utilisateurs. Retourne la conversation existante si elle existe deja.

```ts
axios.post('/conversations/dm', {
    user_id_1: string,   // UUID, requis
    user_id_2: string,   // UUID, requis (doit etre different de user_id_1)
})
// Response 201 — conversation + les 2 membres sont ajoutes automatiquement
```

#### POST /conversations/team

Cree une conversation d'equipe et ajoute automatiquement tous les membres de l'equipe.

```ts
axios.post('/conversations/team', {
    team_id: string,     // UUID, requis
    name?: string,       // max 100 chars
})
// Response 201 — conversation + tous les team_membership sont ajoutes
```

#### POST /conversations/tournament

Cree une conversation de tournoi et ajoute automatiquement tous les participants confirmes.

```ts
axios.post('/conversations/tournament', {
    tournament_id: string, // UUID, requis
    name?: string,         // max 100 chars
})
// Response 201 — conversation + tous les participants status='confirmed' sont ajoutes
```

#### POST /conversations/team/:teamId/sync

Synchronise les membres de la conversation avec les membres actuels de l'equipe (ajout des nouveaux, retrait des partis).

```ts
axios.post('/conversations/team/:teamId/sync')
// Response 204
```

#### POST /conversations/tournament/:tournamentId/sync

Synchronise les membres de la conversation avec les participants confirmes du tournoi.

```ts
axios.post('/conversations/tournament/:tournamentId/sync')
// Response 204
```

---

### Conversation Members — `/conversation-members`

**Create :**
```ts
{
    user_id: string,         // UUID, requis
        conversation_id: string, // UUID, requis
        is_pinned?: boolean,     // default false
        is_muted?: boolean,      // default false
}
```

**Update :**
```ts
{
    is_pinned?: boolean,
        is_muted?: boolean,
        unread_count?: number,   // >= 0
}
```

---

### Chat Messages — `/chat-messages`

**Create :**
```ts
{
    conversation_id: string,  // UUID, requis
        sender_id: string,        // UUID, requis
        content: string,          // requis, min 1 char
        sender_tag?: string,      // max 50 chars, ex: "Organisateur"
        sender_tag_color?: string, // hex color, ex: "#FF4655"
}
```

**Update :**
```ts
{
    content?: string,
}
```

---

### Message Reactions — `/message-reactions`

**Create :**
```ts
{
    message_id: string,      // UUID, requis
        user_id: string,         // UUID, requis
        emoji: string,           // requis, 1-10 chars
}
```

**Update :**
```ts
{
    emoji?: string,
}
```

---

### Tournaments — `/tournaments`

**Create :**
```ts
{
    name: string,                     // requis, 1-200 chars
        game_id: string,                  // UUID, requis
        organizer_id: string,             // UUID, requis
        status?: 'upcoming' | 'ongoing' | 'completed',  // default 'upcoming'
        date?: string,                    // ISO 8601
        max_players?: number,             // min 2
        team_size?: number,               // min 1
        is_official?: boolean,            // default false
        description?: string,
        requires_approval?: boolean,      // default false
        prize_pool?: string,              // max 100 chars
        registration_closes_at?: string,  // ISO 8601
}
```

**Update :** memes champs (sans game_id/organizer_id), tous optionnels.

---

### Tournament Participations — `/tournament-participations`

**Create :**
```ts
{
    user_id: string,         // UUID, requis
        tournament_id: string,   // UUID, requis
        team_id?: string,        // UUID (null si solo)
        status?: 'confirmed' | 'pending' | 'cancelled',  // default 'pending'
}
```

**Update :**
```ts
{
    status?: 'confirmed' | 'pending' | 'cancelled',
}
```

---

### Tournament Recurrences — `/tournament-recurrences`

Gestion de la recurrence des tournois officiels. Seuls les tournois `is_official = true` peuvent etre recurrents.

**Create :**
```ts
{
    source_tournament_id: string,   // UUID, requis — le tournoi modele
    recurrence_type: 'weekly' | 'monthly',  // requis
    recurrence_end_at?: string,     // ISO 8601 (null = pas de fin)
    is_active?: boolean,            // default true
}
```

**Update :**
```ts
{
    recurrence_type?: 'weekly' | 'monthly',
    recurrence_end_at?: string | null,
    is_active?: boolean,
}
```

**Routes custom :**

#### POST /tournament-recurrences/:id/generate

Genere la prochaine occurrence du tournoi recurrent (clone le tournoi source avec la date suivante).

```ts
axios.post('/tournament-recurrences/:id/generate')
// Response 201 — nouveau tournoi cree avec status='upcoming'
```

#### POST /tournament-recurrences/:id/generate-all

Genere toutes les occurrences en attente jusqu'a maintenant + la prochaine future.

```ts
axios.post('/tournament-recurrences/:id/generate-all')
// Response 201 — tableau de tournois crees
```

#### PATCH /tournament-recurrences/:id/deactivate

Desactive la recurrence (is_active = false). Les occurrences deja generees restent intactes.

```ts
axios.patch('/tournament-recurrences/:id/deactivate')
// Response 200 — recurrence mise a jour
```

---

### Twitch Links — `/twitch-links`

**Create :**
```ts
{
    user_id: string,          // UUID, requis
        twitch_id: string,        // requis, 1-100 chars
        twitch_username?: string, // max 100 chars
        display_name?: string,    // max 100 chars
        is_live?: boolean,        // default false
        viewer_count?: number,    // default 0
        stream_title?: string,    // max 500 chars
        thumbnail_url?: string,   // URL valide, max 500 chars
}
```

**Update :** memes champs (sans user_id/twitch_id), tous optionnels.

---

### News — `/news`

**Create :**
```ts
{
  title: string,              // requis, 1-200 chars
  summary: string,            // requis, 1-500 chars
  content: string,            // requis, min 1 char
  image_url?: string,         // URL valide, max 500 chars
  category: 'update' | 'tournament' | 'community' | 'esport',  // requis
  author_id: string,          // UUID, requis (utilisateur qui publie)
  published_at?: string,      // ISO 8601 (default now)
}
```

**Update :**
```ts
{
  title?: string,
  summary?: string,
  content?: string,
  image_url?: string,
  category?: 'update' | 'tournament' | 'community' | 'esport',
  published_at?: string,
}
```

**Response :**
```ts
{
  id: string,
  title: string,
  summary: string,
  content: string,
  image_url: string | null,
  category: 'update' | 'tournament' | 'community' | 'esport',
  author: { id: string, username: string, display_name: string | null },
  published_at: string,
  created_at: string,
  updated_at: string,
}
```

---

### User Sanctions — `/user-sanctions`

**Create :**
```ts
{
    user_id: string,         // UUID, requis
        issued_by: string,       // UUID, requis (admin/moderateur)
        type: 'warning' | 'ban', // requis
        scope: 'platform' | 'tournament' | 'chat',  // requis
        reason?: string,
        expires_at?: string,     // ISO 8601 (null = permanent)
        is_active?: boolean,     // default true
}
```

**Update :**
```ts
{
    reason?: string,
        expires_at?: string,
        is_active?: boolean,
}
```

---

## WebSocket — `/ws`

Connexion WebSocket pour le chat en temps reel, les indicateurs de frappe et la presence en ligne.

### Connexion

```ts
const ws = new WebSocket(`ws://localhost:3000/ws?token=${accessToken}`);
```

L'authentification se fait via le query param `token` (les browsers ne supportent pas les headers custom sur WebSocket). Si le token est invalide ou manquant, le serveur ferme la connexion avec le code `4401`.

### Messages Client → Serveur

```ts
// Envoyer un message
ws.send(JSON.stringify({
    type: 'message:send',
    conversationId: string,  // UUID
    content: string,         // min 1 char
}))

// Indicateur de frappe
ws.send(JSON.stringify({ type: 'typing:start', conversationId: string }))
ws.send(JSON.stringify({ type: 'typing:stop', conversationId: string }))
```

### Messages Serveur → Client

```ts
// Nouveau message (broadcast a tous les membres de la conversation)
{ type: 'message:new', message: { id, conversation_id, sender_id, content, sender_username, sender_display_name, sender_avatar_url, created_at } }

// Indicateur de frappe
{ type: 'typing:start', conversationId: string, userId: string, username: string }
{ type: 'typing:stop', conversationId: string, userId: string, username: string }

// Presence
{ type: 'presence:online', userId: string }
{ type: 'presence:offline', userId: string }

// Erreur
{ type: 'error', message: string }
```

### Notes

- Le `sender_id` est toujours extrait du JWT, jamais du payload client (anti-impersonation)
- L'utilisateur doit etre membre de la conversation pour envoyer un message ou un typing indicator
- La presence (online/offline) est automatiquement broadcastee a tous les contacts (users partageant une conversation)
- Le serveur envoie un ping toutes les 30s pour detecter les connexions mortes
- L'historique des messages reste accessible via `GET /chat-messages` (REST, pagine)

---

## Gestion des erreurs

Toutes les erreurs suivent le meme format :

```ts
{
    statusCode: number,
        error: string,
        message: string | string[],  // string[] pour les erreurs de validation Zod
}
```

| Code | Signification |
|---|---|
| 400 | Validation error (champs manquants/invalides) |
| 401 | Non authentifie (token manquant/invalide) |
| 403 | API key manquante/invalide |
| 404 | Ressource non trouvee |
| 409 | Conflit (email/username deja pris) |
| 429 | Rate limit depasse (100 req/min) |
| 500 | Erreur serveur |

---

## Exemple d'utilisation avec Axios

```ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'x-api-key': import.meta.env.VITE_API_KEY },
});

// Interceptor pour ajouter le JWT automatiquement
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Interceptor pour refresh automatique du token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken });
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            error.config.headers.Authorization = `Bearer ${data.access_token}`;
            return api(error.config);
        }
        return Promise.reject(error);
    },
);

export default api;
```
