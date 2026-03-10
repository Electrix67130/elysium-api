import buildTestApp from '@tests/helpers/build-app';

describe('TournamentParticipation routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;
  let tournament: any;

  beforeAll(async () => {
    app = await buildTestApp();
    const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `tp-${Date.now()}`, email: `tp-${Date.now()}@test.com`, password_hash: 'hash' } });
    user = JSON.parse(userRes.payload);
    const gameRes = await app.inject({ method: 'POST', url: '/games', payload: { name: 'TPGame', slug: `tp-game-${Date.now()}` } });
    const game = JSON.parse(gameRes.payload);
    const tRes = await app.inject({ method: 'POST', url: '/tournaments', payload: { name: 'TP Tourney', game_id: game.id, organizer_id: user.id } });
    tournament = JSON.parse(tRes.payload);
  });

  afterAll(async () => { await app.close(); });

  describe('POST /tournament-participations', () => {
    it('should return 201 when registering', async () => {
      const res = await app.inject({ method: 'POST', url: '/tournament-participations', payload: { user_id: user.id, tournament_id: tournament.id } });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe('pending');
    });

    it('should return 400 when user_id is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/tournament-participations', payload: { tournament_id: tournament.id } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /tournament-participations', () => {
    it('should return 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/tournament-participations' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /tournament-participations/:id', () => {
    let created: any;
    beforeAll(async () => {
      const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `tp2-${Date.now()}`, email: `tp2-${Date.now()}@test.com`, password_hash: 'hash' } });
      const user2 = JSON.parse(userRes.payload);
      const res = await app.inject({ method: 'POST', url: '/tournament-participations', payload: { user_id: user2.id, tournament_id: tournament.id } });
      created = JSON.parse(res.payload);
    });

    it('should return 200 when confirming', async () => {
      const res = await app.inject({ method: 'PATCH', url: `/tournament-participations/${created.id}`, payload: { status: 'confirmed' } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).status).toBe('confirmed');
    });
  });
});
