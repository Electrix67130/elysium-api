import buildTestApp from '@tests/helpers/build-app';

describe('Conversation routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;

  beforeAll(async () => { app = await buildTestApp(); });
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
    it('should return 200 with paginated results', async () => {
      const res = await app.inject({ method: 'GET', url: '/conversations' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
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
