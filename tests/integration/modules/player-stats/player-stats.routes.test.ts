import buildTestApp from '@tests/helpers/build-app';

describe('PlayerStats routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;
  let game: any;

  beforeAll(async () => {
    app = await buildTestApp();

    const userRes = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { username: `stats-${Date.now()}`, email: `stats-${Date.now()}@test.com`, password_hash: 'hash' },
    });
    user = JSON.parse(userRes.payload);

    const gameRes = await app.inject({
      method: 'POST',
      url: '/games',
      payload: { name: 'StatsGame', slug: `stats-game-${Date.now()}` },
    });
    game = JSON.parse(gameRes.payload);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /player-stats', () => {
    it('should return 201 when creating player stats', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/player-stats',
        payload: { user_id: user.id, game_id: game.id, wins: 10, losses: 5 },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload);
      expect(body.user_id).toBe(user.id);
      expect(body.game_id).toBe(game.id);
      expect(body.wins).toBe(10);
    });

    it('should return 400 when user_id is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/player-stats',
        payload: { game_id: game.id },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /player-stats', () => {
    it('should return 200 with paginated results', async () => {
      const response = await app.inject({ method: 'GET', url: '/player-stats' });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    });
  });

  describe('PATCH /player-stats/:id', () => {
    let created: any;

    beforeAll(async () => {
      const gameRes = await app.inject({
        method: 'POST',
        url: '/games',
        payload: { name: 'PatchStatsGame', slug: `patch-stats-${Date.now()}` },
      });
      const game2 = JSON.parse(gameRes.payload);

      const response = await app.inject({
        method: 'POST',
        url: '/player-stats',
        payload: { user_id: user.id, game_id: game2.id },
      });
      created = JSON.parse(response.payload);
    });

    it('should return 200 when updating stats', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/player-stats/${created.id}`,
        payload: { wins: 20, win_rate: 75.5 },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body.wins).toBe(20);
    });
  });
});
