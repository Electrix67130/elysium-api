import buildApp from '@/app';

describe('API Key middleware', () => {
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    app = buildApp({ logLevel: 'silent' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 403 without x-api-key header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users',
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.payload);
    expect(body.message).toBe('Invalid or missing API key');
  });

  it('should return 403 with wrong x-api-key', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: { 'x-api-key': 'wrong-key' },
    });

    expect(response.statusCode).toBe(403);
  });

  it('should allow /health without API key', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
  });

  it('should pass with correct x-api-key', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: { 'x-api-key': process.env.API_KEY || 'change-me-in-production' },
    });

    expect(response.statusCode).toBe(200);
  });
});
