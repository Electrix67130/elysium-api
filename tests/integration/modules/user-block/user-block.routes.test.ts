import buildTestApp from '@tests/helpers/build-app';

describe('UserBlock routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let userA: any;
  let userB: any;

  beforeAll(async () => {
    app = await buildTestApp();

    const resA = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { username: `blockA-${Date.now()}`, email: `blockA-${Date.now()}@test.com`, password_hash: 'hash' },
    });
    userA = JSON.parse(resA.payload);

    const resB = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { username: `blockB-${Date.now()}`, email: `blockB-${Date.now()}@test.com`, password_hash: 'hash' },
    });
    userB = JSON.parse(resB.payload);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /user-blocks', () => {
    it('should return 201 when blocking a user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user-blocks',
        payload: { blocker_id: userA.id, blocked_id: userB.id },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload);
      expect(body.blocker_id).toBe(userA.id);
      expect(body.blocked_id).toBe(userB.id);
    });

    it('should return 400 when blocker_id is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/user-blocks',
        payload: { blocked_id: userB.id },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /user-blocks', () => {
    it('should return 200 with paginated results', async () => {
      const response = await app.inject({ method: 'GET', url: '/user-blocks' });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    });
  });

  describe('DELETE /user-blocks/:id', () => {
    let createdBlock: any;

    beforeAll(async () => {
      const resC = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { username: `blockC-${Date.now()}`, email: `blockC-${Date.now()}@test.com`, password_hash: 'hash' },
      });
      const userC = JSON.parse(resC.payload);

      const response = await app.inject({
        method: 'POST',
        url: '/user-blocks',
        payload: { blocker_id: userA.id, blocked_id: userC.id },
      });
      createdBlock = JSON.parse(response.payload);
    });

    it('should return 204 when deleting a block', async () => {
      const response = await app.inject({ method: 'DELETE', url: `/user-blocks/${createdBlock.id}` });

      expect(response.statusCode).toBe(204);
    });
  });
});
