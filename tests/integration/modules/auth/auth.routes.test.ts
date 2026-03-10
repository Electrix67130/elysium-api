import buildTestApp from '@tests/helpers/build-app';

describe('Auth routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    username: `auth-${Date.now()}`,
    email: `auth-${Date.now()}@test.com`,
    password: 'SecurePass123!',
    display_name: 'Auth Test User',
    country: 'FR',
  };

  let accessToken: string;
  let refreshToken: string;

  describe('POST /auth/register', () => {
    it('should return 201 with user and tokens', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: testUser,
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('refresh_token');
      expect(body.user).toHaveProperty('id');
      expect(body.user.username).toBe(testUser.username);
      expect(body.user.email).toBe(testUser.email);
      expect(body.user).not.toHaveProperty('password_hash');

      accessToken = body.access_token;
      refreshToken = body.refresh_token;
    });

    it('should return 409 when email already exists', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { ...testUser, username: 'different-username' },
      });

      expect(response.statusCode).toBe(409);
    });

    it('should return 409 when username already exists', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { ...testUser, email: 'different@test.com' },
      });

      expect(response.statusCode).toBe(409);
    });

    it('should return 400 when password is too short', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { ...testUser, email: 'short@test.com', username: 'shortpw', password: '123' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 with user and tokens', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: testUser.email, password: testUser.password },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('refresh_token');
      expect(body.user).not.toHaveProperty('password_hash');

      accessToken = body.access_token;
      refreshToken = body.refresh_token;
    });

    it('should return 401 with wrong password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: testUser.email, password: 'WrongPassword!' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 with unknown email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'unknown@test.com', password: 'whatever' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 200 with current user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body.email).toBe(testUser.email);
      expect(body).not.toHaveProperty('password_hash');
    });

    it('should return 401 without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: 'Bearer invalid.token.here' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 200 with new tokens', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refresh_token: refreshToken },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('refresh_token');

      // Old token should be rotated
      accessToken = body.access_token;
      refreshToken = body.refresh_token;
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refresh_token: 'invalid.token' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 204 and invalidate refresh tokens', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(204);

      // Refresh token should no longer work
      const refreshResponse = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refresh_token: refreshToken },
      });

      expect(refreshResponse.statusCode).toBe(401);
    });

    it('should return 401 without token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/logout',
      });

      expect(response.statusCode).toBe(401);
    });
  });

});
