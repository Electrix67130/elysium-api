import buildTestApp from '@tests/helpers/build-app';

describe('ChatMessage routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;
  let conversation: any;

  beforeAll(async () => {
    app = await buildTestApp();
    const userRes = await app.inject({ method: 'POST', url: '/users', payload: { username: `msg-${Date.now()}`, email: `msg-${Date.now()}@test.com`, password_hash: 'hash' } });
    user = JSON.parse(userRes.payload);
    const convRes = await app.inject({ method: 'POST', url: '/conversations', payload: { type: 'group', name: 'Chat Test' } });
    conversation = JSON.parse(convRes.payload);
  });

  afterAll(async () => { await app.close(); });

  describe('POST /chat-messages', () => {
    it('should return 201 when sending a message', async () => {
      const res = await app.inject({ method: 'POST', url: '/chat-messages', payload: { conversation_id: conversation.id, sender_id: user.id, content: 'Hello!' } });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.content).toBe('Hello!');
      expect(body.sender_id).toBe(user.id);
    });

    it('should return 201 with tags', async () => {
      const res = await app.inject({ method: 'POST', url: '/chat-messages', payload: { conversation_id: conversation.id, sender_id: user.id, content: 'Tagged', sender_tag: 'Admin', sender_tag_color: '#FF0000' } });
      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res.payload).sender_tag).toBe('Admin');
    });

    it('should return 400 when content is empty', async () => {
      const res = await app.inject({ method: 'POST', url: '/chat-messages', payload: { conversation_id: conversation.id, sender_id: user.id, content: '' } });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when content is missing', async () => {
      const res = await app.inject({ method: 'POST', url: '/chat-messages', payload: { conversation_id: conversation.id, sender_id: user.id } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /chat-messages', () => {
    it('should return 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/chat-messages' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /chat-messages/:id', () => {
    let created: any;
    beforeAll(async () => {
      const res = await app.inject({ method: 'POST', url: '/chat-messages', payload: { conversation_id: conversation.id, sender_id: user.id, content: 'To delete' } });
      created = JSON.parse(res.payload);
    });

    it('should return 204', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/chat-messages/${created.id}` });
      expect(res.statusCode).toBe(204);
    });
  });
});
