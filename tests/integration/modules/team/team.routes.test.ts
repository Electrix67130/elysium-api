import buildTestApp from '@tests/helpers/build-app';

describe('Team routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /teams', () => {
    it('should return 201 when creating a valid team', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/teams',
        payload: { name: 'Team Alpha', description: 'A great team' },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('Team Alpha');
    });

    it('should return 400 when name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/teams',
        payload: { description: 'No name' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /teams', () => {
    it('should return 200 with paginated results', async () => {
      const response = await app.inject({ method: 'GET', url: '/teams' });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    });
  });

  describe('PATCH /teams/:id', () => {
    let createdTeam: any;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/teams',
        payload: { name: `PatchTeam-${Date.now()}` },
      });
      createdTeam = JSON.parse(response.payload);
    });

    it('should return 200 when updating', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/teams/${createdTeam.id}`,
        payload: { name: 'Updated Team' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).name).toBe('Updated Team');
    });
  });

  describe('DELETE /teams/:id', () => {
    let createdTeam: any;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/teams',
        payload: { name: `DelTeam-${Date.now()}` },
      });
      createdTeam = JSON.parse(response.payload);
    });

    it('should return 204 when deleting', async () => {
      const response = await app.inject({ method: 'DELETE', url: `/teams/${createdTeam.id}` });

      expect(response.statusCode).toBe(204);
    });
  });
});
