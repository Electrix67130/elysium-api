import buildTestApp from '@tests/helpers/build-app';

describe('UserSanction routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;
  let admin: any;

  beforeAll(async () => {
    app = await buildTestApp();
    const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `sanctioned-${Date.now()}`, email: `sanctioned-${Date.now()}@test.com`, password_hash: 'hash' } });
    user = JSON.parse(userRes.payload);
    const adminRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `admin-${Date.now()}`, email: `admin-${Date.now()}@test.com`, password_hash: 'hash' } });
    admin = JSON.parse(adminRes.payload);
  });

  afterAll(async () => { await app.close(); });

  describe('POST /user-sanctions', () => {
    it('should return 201 when creating a warning', async () => {
      const res = await app.inject({ method: 'POST', url: '/user-sanctions', payload: { user_id: user.id, issued_by: admin.id, type: 'warning', scope: 'platform', reason: 'Toxic behavior' } });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.type).toBe('warning');
      expect(body.scope).toBe('platform');
      expect(body.is_active).toBe(true);
    });

    it('should return 201 when creating a ban with expiry', async () => {
      const res = await app.inject({ method: 'POST', url: '/user-sanctions', payload: { user_id: user.id, issued_by: admin.id, type: 'ban', scope: 'chat', expires_at: '2027-01-01T00:00:00Z' } });
      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res.payload).type).toBe('ban');
    });

    it('should return 400 when type is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/user-sanctions', payload: { user_id: user.id, issued_by: admin.id, scope: 'platform' } });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid type', async () => {
      const res = await app.inject({ method: 'POST', url: '/user-sanctions', payload: { user_id: user.id, issued_by: admin.id, type: 'mute', scope: 'platform' } });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid scope', async () => {
      const res = await app.inject({ method: 'POST', url: '/user-sanctions', payload: { user_id: user.id, issued_by: admin.id, type: 'ban', scope: 'game' } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /user-sanctions', () => {
    it('should return 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/user-sanctions' });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload)).toHaveProperty('data');
    });
  });

  describe('PATCH /user-sanctions/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/user-sanctions', payload: { user_id: user.id, issued_by: admin.id, type: 'ban', scope: 'tournament' } });
      created = JSON.parse(res.payload);
    });

    it('should return 200 when deactivating', async () => {
      const res = await app.inject({ method: 'PATCH', url: `/user-sanctions/${created.id}`, payload: { is_active: false } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).is_active).toBe(false);
    });
  });

  describe('DELETE /user-sanctions/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/user-sanctions', payload: { user_id: user.id, issued_by: admin.id, type: 'warning', scope: 'chat' } });
      created = JSON.parse(res.payload);
    });

    it('should return 204', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/user-sanctions/${created.id}` });
      expect(res.statusCode).toBe(204);
    });
  });
});
