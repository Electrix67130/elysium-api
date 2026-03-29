# Tests

## Structure

Miroir exact de `src/` :

```
tests/
├── unit/
│   ├── modules/
│   │   └── user/
│   │       ├── user.service.test.ts
│   │       └── user.schema.test.ts
│   └── lib/
│       ├── base-service.test.ts
│       └── crud-route-builder.test.ts
├── integration/
│   ├── modules/
│   │   └── user/
│   │       └── user.routes.test.ts
│   └── health.test.ts
└── helpers/
    ├── build-app.ts           # Factory pour creer l'app de test
    ├── fixtures.ts            # Donnees de test reutilisables
    └── db.ts                  # Utilitaires DB pour les tests d'integration
```

## Tests unitaires (tests/unit/)

Chaque fichier source a son `.test.ts`.

### Tests de schemas

- Tester que le schema accepte les donnees valides
- Tester chaque regle de validation (min, max, email, uuid, etc.)
- Tester les champs optionnels, requis, et les valeurs par defaut

```ts
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

### Tests de services

- Mocker `db` (l'objet Knex) pour ne pas toucher a la BDD
- Tester chaque methode custom du service
- Tester les cas limites (not found, donnees invalides)

```ts
describe('UserService', () => {
  let service: UserService;
  let mockDb: Knex;

  beforeEach(() => {
    mockDb = /* mock Knex */;
    service = new UserService(mockDb);
  });

  it('should find user by email', async () => {
    // ...
  });
});
```

## Tests d'integration (tests/integration/)

Routes HTTP de bout en bout avec base de test.

- `buildApp()` pour creer l'instance Fastify de test
- `fastify.inject()` pour simuler les requetes (pas de serveur reel)
- Reinitialiser la base avant chaque suite
- Tester les codes HTTP (200, 201, 204, 400, 404)
- Tester le format JSON et la pagination

```ts
describe('GET /users', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
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

## Conventions generales

- **Nommage** : `describe` pour le sujet, `it`/`test` pour le comportement
- **Pattern AAA** : Arrange, Act, Assert — toujours dans cet ordre
- **Un assert par test** quand possible
- **Pas de logique metier dans les tests** — simples et lisibles
- **Mocker au maximum** dans les unitaires pour isoler le sujet
- **Tester le comportement**, jamais l'implementation (pas de test sur le SQL genere)
- **Nommage** : `should [comportement]` ou `should [comportement] when [condition]`
- **Donnees de test** : utiliser les fixtures de `tests/helpers/fixtures.ts`, pas de donnees en dur dupliquees
- **Cleanup** : toujours `afterAll` pour fermer les connexions (`app.close()`)
