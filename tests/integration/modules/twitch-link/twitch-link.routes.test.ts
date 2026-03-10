import buildTestApp from '@tests/helpers/build-app';

describe('TwitchLink routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;

  beforeAll(async () => {
    app = await buildTestApp();
    const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `twitch-${Date.now()}`, email: `twitch-${Date.now()}@test.com`, password_hash: 'hash' } });
    user = JSON.parse(userRes.payload);
  });

  afterAll(async () => { await app.close(); });

  describe('POST /twitch-links', () => {
    it('should return 201 when linking twitch', async () => {
      const res = await app.inject({ method: 'POST', url: '/twitch-links', payload: { user_id: user.id, twitch_id: `tw-${Date.now()}`, twitch_username: 'streamer', display_name: 'Streamer' } });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.user_id).toBe(user.id);
      expect(body.is_live).toBe(false);
    });

    it('should return 400 when twitch_id is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/twitch-links', payload: { user_id: user.id } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /twitch-links', () => {
    it('should return 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/twitch-links' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PATCH /twitch-links/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/twitch-links', payload: { user_id: user.id, twitch_id: `tw2-${Date.now()}` } });
      created = JSON.parse(res.payload);
    });

    it('should return 200 when updating', async () => {
      const res = await app.inject({ method: 'PATCH', url: `/twitch-links/${created.id}`, payload: { is_live: true, viewer_count: 1500, stream_title: 'Live!' } });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.is_live).toBe(true);
    });
  });

  describe('DELETE /twitch-links/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/twitch-links', payload: { user_id: user.id, twitch_id: `tw3-${Date.now()}` } });
      created = JSON.parse(res.payload);
    });

    it('should return 204', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/twitch-links/${created.id}` });
      expect(res.statusCode).toBe(204);
    });
  });
});
