import buildTestApp from '@tests/helpers/build-app';

describe('Game routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /games', () => {
    it('should return 200 with paginated results', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/games',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(body.meta).toHaveProperty('total');
      expect(body.meta).toHaveProperty('page', 1);
      expect(body.meta).toHaveProperty('limit', 20);
      expect(body.meta).toHaveProperty('totalPages');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should respect pagination params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/games?page=1&limit=5',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(5);
    });

    it('should return 400 for invalid page param', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/games?page=0',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for limit exceeding 100', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/games?limit=101',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /games', () => {
    it('should return 201 when creating a valid game', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/games',
        payload: {
          name: 'Valorant',
          slug: `valorant-${Date.now()}`,
          image_url: 'https://example.com/valorant.png',
          brand_color: '#FF4655',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('Valorant');
      expect(body.brand_color).toBe('#FF4655');
      expect(body).toHaveProperty('created_at');
      expect(body).toHaveProperty('updated_at');
    });

    it('should return 400 when name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/games',
        payload: { slug: 'test' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when slug is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/games',
        payload: { name: 'Test' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid brand_color', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/games',
        payload: { name: 'Test', slug: 'test', brand_color: 'red' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /games/:id', () => {
    let createdGame: any;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/games',
        payload: { name: 'CS2', slug: `cs2-${Date.now()}` },
      });
      createdGame = JSON.parse(response.payload);
    });

    it('should return 200 with the game', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/games/${createdGame.id}`,
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body.id).toBe(createdGame.id);
      expect(body.name).toBe('CS2');
    });

    it('should return 404 for unknown UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/games/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/games/not-a-uuid',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PATCH /games/:id', () => {
    let createdGame: any;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/games',
        payload: { name: 'LoL', slug: `lol-${Date.now()}` },
      });
      createdGame = JSON.parse(response.payload);
    });

    it('should return 200 when updating a game', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/games/${createdGame.id}`,
        payload: { name: 'League of Legends' },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body.name).toBe('League of Legends');
      expect(body.id).toBe(createdGame.id);
    });

    it('should return 404 for unknown UUID', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/games/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        payload: { name: 'Test' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/games/${createdGame.id}`,
        payload: { brand_color: 'invalid' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /games/:id', () => {
    let createdGame: any;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/games',
        payload: { name: 'Fortnite', slug: `fortnite-${Date.now()}` },
      });
      createdGame = JSON.parse(response.payload);
    });

    it('should return 204 when deleting a game', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/games/${createdGame.id}`,
      });

      expect(response.statusCode).toBe(204);
    });

    it('should return 404 after deletion', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/games/${createdGame.id}`,
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for unknown UUID', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/games/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
