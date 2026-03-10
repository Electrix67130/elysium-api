import PlayerStatsService from '@/modules/player-stats/player-stats.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('PlayerStatsService', () => {
  let service: InstanceType<typeof PlayerStatsService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new PlayerStatsService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "player_stats"', () => {
    expect(service.table).toBe('player_stats');
  });

  describe('findByUserId', () => {
    it('should call findMany with user_id', async () => {
      const stats = [{ id: '1', wins: 10 }];
      mockDb.where.mockResolvedValue(stats);

      const result = await service.findByUserId('user-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'user-uuid' });
      expect(result).toEqual(stats);
    });
  });

  describe('findByGameId', () => {
    it('should call findMany with game_id', async () => {
      mockDb.where.mockResolvedValue([]);

      await service.findByGameId('game-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ game_id: 'game-uuid' });
    });
  });

  describe('findByUserAndGame', () => {
    it('should call findOne with both ids', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1' });

      const result = await service.findByUserAndGame('user-uuid', 'game-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'user-uuid', game_id: 'game-uuid' });
      expect(result).toEqual({ id: '1' });
    });
  });
});
