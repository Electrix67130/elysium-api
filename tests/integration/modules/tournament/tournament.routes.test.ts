import buildTestApp from '@tests/helpers/build-app';

describe('Tournament routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;
  let game: any;

  beforeAll(async () => {
    app = await buildTestApp();
    const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `org-${Date.now()}`, email: `org-${Date.now()}@test.com`, password_hash: 'hash' } });
    user = JSON.parse(userRes.payload);
    const gameRes = await app.inject({ method: 'POST', url: '/games', payload: { name: 'TourneyGame', slug: `tourney-game-${Date.now()}` } });
    game = JSON.parse(gameRes.payload);
  });

  afterAll(async () => { await app.close(); });

  describe('POST /tournaments', () => {
    it('should return 201 when creating a tournament', async () => {
      const res = await app.inject({ method: 'POST', url: '/tournaments', payload: { name: 'Elysium Cup', game_id: game.id, organizer_id: user.id } });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.name).toBe('Elysium Cup');
      expect(body.status).toBe('upcoming');
    });

    it('should return 201 with all fields', async () => {
      const res = await app.inject({ method: 'POST', url: '/tournaments', payload: { name: 'Big Cup', game_id: game.id, organizer_id: user.id, max_players: 64, team_size: 5, is_official: true, description: 'A big tournament', prize_pool: '1000\u20AC', requires_approval: true } });
      expect(res.statusCode).toBe(201);
    });

    it('should return 400 when name is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/tournaments', payload: { game_id: game.id, organizer_id: user.id } });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when game_id is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/tournaments', payload: { name: 'Test', organizer_id: user.id } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /tournaments', () => {
    it('should return 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/tournaments' });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload)).toHaveProperty('data');
    });
  });

  describe('PATCH /tournaments/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/tournaments', payload: { name: 'PatchTourney', game_id: game.id, organizer_id: user.id } });
      created = JSON.parse(res.payload);
    });

    it('should return 200 when updating', async () => {
      const res = await app.inject({ method: 'PATCH', url: `/tournaments/${created.id}`, payload: { status: 'ongoing', name: 'Updated Cup' } });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe('ongoing');
      expect(body.name).toBe('Updated Cup');
    });
  });

  describe('DELETE /tournaments/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/tournaments', payload: { name: 'DelTourney', game_id: game.id, organizer_id: user.id } });
      created = JSON.parse(res.payload);
    });

    it('should return 204', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/tournaments/${created.id}` });
      expect(res.statusCode).toBe(204);
    });
  });
});
