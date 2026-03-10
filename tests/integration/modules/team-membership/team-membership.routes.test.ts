import buildTestApp from '@tests/helpers/build-app';

describe('TeamMembership routes (integration)', () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let user: any;
  let team: any;

  beforeAll(async () => {
    app = await buildTestApp();

    const userRes = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { username: `member-${Date.now()}`, email: `member-${Date.now()}@test.com`, password_hash: 'hash' },
    });
    user = JSON.parse(userRes.payload);

    const teamRes = await app.inject({
      method: 'POST',
      url: '/teams',
      payload: { name: `MemberTeam-${Date.now()}` },
    });
    team = JSON.parse(teamRes.payload);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /team-memberships', () => {
    it('should return 201 when adding a member', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/team-memberships',
        payload: { user_id: user.id, team_id: team.id, role: 'capitaine' },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload);
      expect(body.user_id).toBe(user.id);
      expect(body.team_id).toBe(team.id);
      expect(body.role).toBe('capitaine');
    });

    it('should return 400 when user_id is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/team-memberships',
        payload: { team_id: team.id },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid role', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/team-memberships',
        payload: { user_id: user.id, team_id: team.id, role: 'admin' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /team-memberships', () => {
    it('should return 200 with paginated results', async () => {
      const response = await app.inject({ method: 'GET', url: '/team-memberships' });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    });
  });

  describe('PATCH /team-memberships/:id', () => {
    let created: any;

    beforeAll(async () => {
      const userRes = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { username: `patchmem-${Date.now()}`, email: `patchmem-${Date.now()}@test.com`, password_hash: 'hash' },
      });
      const user2 = JSON.parse(userRes.payload);

      const response = await app.inject({
        method: 'POST',
        url: '/team-memberships',
        payload: { user_id: user2.id, team_id: team.id },
      });
      created = JSON.parse(response.payload);
    });

    it('should return 200 when updating role', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/team-memberships/${created.id}`,
        payload: { role: 'manager' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).role).toBe('manager');
    });
  });
});
