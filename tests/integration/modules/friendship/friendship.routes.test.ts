import buildTestApp from '@tests/helpers/build-app';

describe('Friendship routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let userA: any;
  let userB: any;

  beforeAll(async () => {
    app = await buildTestApp();

    const resA = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { username: `friendA-${Date.now()}`, email: `friendA-${Date.now()}@test.com`, password_hash: 'hash' },
    });
    userA = JSON.parse(resA.payload);

    const resB = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { username: `friendB-${Date.now()}`, email: `friendB-${Date.now()}@test.com`, password_hash: 'hash' },
    });
    userB = JSON.parse(resB.payload);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /friendships', () => {
    it('should return 201 when creating a friendship', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/friendships',
        payload: { sender_id: userA.id, receiver_id: userB.id },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload);
      expect(body.sender_id).toBe(userA.id);
      expect(body.receiver_id).toBe(userB.id);
      expect(body.status).toBe('pending');
    });

    it('should return 400 when sender_id is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/friendships',
        payload: { receiver_id: userB.id },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /friendships', () => {
    it('should return 200 with paginated results', async () => {
      const response = await app.inject({ method: 'GET', url: '/friendships' });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    });
  });

  describe('PATCH /friendships/:id', () => {
    let createdFriendship: any;

    beforeAll(async () => {
      const resC = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { username: `friendC-${Date.now()}`, email: `friendC-${Date.now()}@test.com`, password_hash: 'hash' },
      });
      const userC = JSON.parse(resC.payload);

      const response = await app.inject({
        method: 'POST',
        url: '/friendships',
        payload: { sender_id: userA.id, receiver_id: userC.id },
      });
      createdFriendship = JSON.parse(response.payload);
    });

    it('should return 200 when accepting friendship', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/friendships/${createdFriendship.id}`,
        payload: { status: 'accepted' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).status).toBe('accepted');
    });
  });
});
