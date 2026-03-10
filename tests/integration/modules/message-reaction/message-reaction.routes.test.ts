import buildTestApp from '@tests/helpers/build-app';

describe('MessageReaction routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;
  let message: any;

  beforeAll(async () => {
    app = await buildTestApp();
    const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `react-${Date.now()}`, email: `react-${Date.now()}@test.com`, password_hash: 'hash' } });
    user = JSON.parse(userRes.payload);
    const convRes = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'dm' } });
    const conversation = JSON.parse(convRes.payload);
    const msgRes = await app.inject({ method: 'POST', url: '/chat-messages', payload: { conversation_id: conversation.id, sender_id: user.id, content: 'React to this' } });
    message = JSON.parse(msgRes.payload);
  });

  afterAll(async () => { await app.close(); });

  describe('POST /message-reactions', () => {
    it('should return 201 when adding a reaction', async () => {
      const res = await app.inject({ method: 'POST', url: '/message-reactions', payload: { message_id: message.id, user_id: user.id, emoji: '\u{1F44D}' } });
      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res.payload).emoji).toBe('\u{1F44D}');
    });

    it('should return 400 when emoji is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/message-reactions', payload: { message_id: message.id, user_id: user.id } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /message-reactions', () => {
    it('should return 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/message-reactions' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /message-reactions/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/message-reactions', payload: { message_id: message.id, user_id: user.id, emoji: '\u2764\uFE0F' } });
      created = JSON.parse(res.payload);
    });

    it('should return 204', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/message-reactions/${created.id}` });
      expect(res.statusCode).toBe(204);
    });
  });
});
