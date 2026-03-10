import TeamService from '@/modules/team/team.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.select = jest.fn(() => mock);
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('TeamService', () => {
  let service: InstanceType<typeof TeamService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new TeamService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "team"', () => {
    expect(service.table).toBe('team');
  });

  describe('findByGameId', () => {
    it('should call findMany with game_id', async () => {
      const teams = [{ id: '1', name: 'Team A' }];
      mockDb.where.mockResolvedValue(teams);

      const result = await service.findByGameId('game-uuid');

      expect(mockDb).toHaveBeenCalledWith('team');
      expect(mockDb.where).toHaveBeenCalledWith({ game_id: 'game-uuid' });
      expect(result).toEqual(teams);
    });
  });
});
