import TeamMembershipService from '@/modules/team-membership/team-membership.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('TeamMembershipService', () => {
  let service: InstanceType<typeof TeamMembershipService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new TeamMembershipService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "team_membership"', () => {
    expect(service.table).toBe('team_membership');
  });

  describe('findByUserId', () => {
    it('should call findMany with user_id', async () => {
      mockDb.where.mockResolvedValue([{ id: '1' }]);

      const result = await service.findByUserId('user-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'user-uuid' });
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findByTeamId', () => {
    it('should call findMany with team_id', async () => {
      mockDb.where.mockResolvedValue([]);

      await service.findByTeamId('team-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ team_id: 'team-uuid' });
    });
  });

  describe('findByUserAndTeam', () => {
    it('should call findOne with both ids', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1', role: 'membre' });

      const result = await service.findByUserAndTeam('user-uuid', 'team-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'user-uuid', team_id: 'team-uuid' });
      expect(result).toEqual({ id: '1', role: 'membre' });
    });
  });
});
