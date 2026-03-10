import buildTestApp from '@tests/helpers/build-app';

describe('User routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should return 201 when creating a valid user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: `user-${Date.now()}`,
          email: `user-${Date.now()}@test.com`,
          password_hash: 'hashed123',
          display_name: 'Test User',
          country: 'FR',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('created_at');
      expect(body.is_official).toBe(false);
    });

    it('should return 400 when username is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { email: 'test@test.com', password_hash: 'hash' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when email is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'testuser', email: 'bad', password_hash: 'hash' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /users', () => {
    it('should return 200 with paginated results', async () => {
      const response = await app.inject({ method: 'GET', url: '/users' });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    let createdUser: any;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { username: `get-${Date.now()}`, email: `get-${Date.now()}@test.com`, password_hash: 'hash' },
      });
      createdUser = JSON.parse(response.payload);
    });

    it('should return 200 with the user', async () => {
      const response = await app.inject({ method: 'GET', url: `/users/${createdUser.id}` });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).id).toBe(createdUser.id);
    });

    it('should return 404 for unknown UUID', async () => {
      const response = await app.inject({ method: 'GET', url: '/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /users/:id', () => {
    let createdUser: any;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { username: `patch-${Date.now()}`, email: `patch-${Date.now()}@test.com`, password_hash: 'hash' },
      });
      createdUser = JSON.parse(response.payload);
    });

    it('should return 200 when updating', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/users/${createdUser.id}`,
        payload: { display_name: 'Updated Name', status_text: 'Online' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).display_name).toBe('Updated Name');
    });

    it('should return 404 for unknown UUID', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        payload: { display_name: 'Test' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    let createdUser: any;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { username: `del-${Date.now()}`, email: `del-${Date.now()}@test.com`, password_hash: 'hash' },
      });
      createdUser = JSON.parse(response.payload);
    });

    it('should return 204 when deleting', async () => {
      const response = await app.inject({ method: 'DELETE', url: `/users/${createdUser.id}` });

      expect(response.statusCode).toBe(204);
    });

    it('should return 404 after deletion', async () => {
      const response = await app.inject({ method: 'GET', url: `/users/${createdUser.id}` });

      expect(response.statusCode).toBe(404);
    });
  });
});
