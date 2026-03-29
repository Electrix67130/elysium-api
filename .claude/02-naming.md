# Conventions de nommage

| Categorie | Style | Exemples |
|-----------|-------|----------|
| **Tables SQL** | snake_case, singulier | `user`, `player_stats`, `chat_message` |
| **Colonnes SQL** | snake_case | `created_at`, `user_id`, `is_active` |
| **Fichiers lib/** | kebab-case `.ts` | `base-service.ts`, `crud-route-builder.ts` |
| **Fichiers modules** | snake_case avec entite `.ts` | `user.service.ts`, `user.schema.ts` |
| **Fichiers tests** | meme nom + `.test.ts` | `user.service.test.ts`, `user.schema.test.ts` |
| **Classes** | PascalCase | `UserService`, `GameService` |
| **Interfaces/Types** | PascalCase | `UserRow`, `PaginationOptions` |
| **Variables/fonctions** | camelCase | `findByEmail`, `userId` |
| **Constantes enum** | SCREAMING_SNAKE_CASE + `as const` | `CONVERSATION_TYPES`, `TEAM_ROLES` |
| **URL prefixes** | kebab-case, pluriel | `/users`, `/player-stats`, `/chat-messages` |
| **Noms de plugins** | kebab-case + `-module` | `user-module`, `team-module` |
| **Colonnes date** | Convention stricte | `created_at`, `updated_at`, `deleted_at` |
| **Booleens** | Prefixe `is`, `has`, `can` | `isOnline`, `isMember`, `hasAccess` |

## Regles supplementaires

- Les noms de methodes expriment l'**intention**, pas l'implementation : `findByEmail` et non `queryUserTableByEmailColumn`
- Les methodes custom de recherche : `findByXxx(value)`, multi-criteres : `findByXxxAndYyy(x, y)`
- Les FK en BDD : `<entity>_id` (ex: `user_id`, `game_id`, `conversation_id`)
- Les tables de liaison : `<entity1>_<entity2>` en snake_case (ex: `team_membership`, `conversation_member`)
