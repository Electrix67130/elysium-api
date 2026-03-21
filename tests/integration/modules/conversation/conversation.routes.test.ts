import buildTestApp from '@tests/helpers/build-app';

describe('Conversation routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await buildTestApp();

    // Creer un utilisateur et obtenir un token
    const registerRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: 'convtestuser',
        email: 'convtest@test.com',
        password: 'password123',
      },
    });
    const registerBody = JSON.parse(registerRes.payload);
    accessToken = registerBody.access_token;
    userId = registerBody.user.id;
  });

  afterAll(async () => { await app.close(); });

  describe('POST /conversations', () => {
    it('should return 201 when creating a dm', async () => {
      const res = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'dm' } });
      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res.payload).type).toBe('dm');
    });

    it('should return 201 when creating a group with name', async () => {
      const res = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'group', name: 'My Group' } });
      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res.payload).name).toBe('My Group');
    });

    it('should return 400 when type is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/conversations', payload: { name: 'test' } });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid type', async () => {
      const res = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'invalid' } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /conversations', () => {
    it('should return 401 without token', async () => {
      const res = await app.inject({ method: 'GET', url: '/conversations' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 200 with paginated results for authenticated user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/conversations',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    });

    it('should only return conversations the user is a member of', async () => {
      // Creer une conversation et ajouter l'utilisateur comme membre
      const convRes = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'group', name: 'My Conv' } });
      const conv = JSON.parse(convRes.payload);

      await app.inject({
        method: 'POST',
        url: '/conversation-members',
        payload: { user_id: userId, conversation_id: conv.id },
      });

      // Creer une autre conversation sans ajouter l'utilisateur
      await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'group', name: 'Not Mine' } });

      const res = await app.inject({
        method: 'GET',
        url: '/conversations',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = JSON.parse(res.payload);
      const names = body.data.map((c: any) => c.name);
      expect(names).toContain('My Conv');
      expect(names).not.toContain('Not Mine');
    });
  });

  describe('PATCH /conversations/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'group', name: 'Old' } });
      created = JSON.parse(res.payload);
    });

    it('should return 200 when updating name', async () => {
      const res = await app.inject({ method: 'PATCH', url: `/conversations/${created.id}`, payload: { name: 'Updated' } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).name).toBe('Updated');
    });
  });

  describe('DELETE /conversations/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'dm' } });
      created = JSON.parse(res.payload);
    });

    it('should return 204', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/conversations/${created.id}` });
      expect(res.statusCode).toBe(204);
    });
  });
});
