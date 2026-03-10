import buildTestApp from '@tests/helpers/build-app';

describe('ConversationMember routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;
  let conversation: any;

  beforeAll(async () => {
    app = await buildTestApp();
    const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `cm-${Date.now()}`, email: `cm-${Date.now()}@test.com`, password_hash: 'hash' } });
    user = JSON.parse(userRes.payload);
    const convRes = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'group', name: 'Test Group' } });
    conversation = JSON.parse(convRes.payload);
  });

  afterAll(async () => { await app.close(); });

  describe('POST /conversation-members', () => {
    it('should return 201 when adding a member', async () => {
      const res = await app.inject({ method: 'POST', url: '/conversation-members', payload: { user_id: user.id, conversation_id: conversation.id } });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.user_id).toBe(user.id);
      expect(body.is_pinned).toBe(false);
      expect(body.is_muted).toBe(false);
    });

    it('should return 400 when user_id is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/conversation-members', payload: { conversation_id: conversation.id } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /conversation-members', () => {
    it('should return 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/conversation-members' });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload)).toHaveProperty('data');
    });
  });

  describe('PATCH /conversation-members/:id', () => {
    let created: any;
    beforeAll(async () => {
      const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `cm2-${Date.now()}`, email: `cm2-${Date.now()}@test.com`, password_hash: 'hash' } });
      const user2 = JSON.parse(userRes.payload);
      const res = await app.inject({ method: 'POST', url: '/conversation-members', payload: { user_id: user2.id, conversation_id: conversation.id } });
      created = JSON.parse(res.payload);
    });

    it('should return 200 when updating', async () => {
      const res = await app.inject({ method: 'PATCH', url: `/conversation-members/${created.id}`, payload: { is_pinned: true, unread_count: 3 } });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.is_pinned).toBe(true);
    });
  });
});
