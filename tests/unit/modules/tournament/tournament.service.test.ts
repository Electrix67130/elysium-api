import TournamentService from '@/modules/tournament/tournament.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('TournamentService', () => {
  let service: InstanceType<typeof TournamentService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new TournamentService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "tournament"', () => {
    expect(service.table).toBe('tournament');
  });

  describe('findByGameId', () => {
    it('should query with game_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByGameId('gid');
      expect(mockDb.where).toHaveBeenCalledWith({ game_id: 'gid' });
    });
  });

  describe('findByOrganizerId', () => {
    it('should query with organizer_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByOrganizerId('oid');
      expect(mockDb.where).toHaveBeenCalledWith({ organizer_id: 'oid' });
    });
  });

  describe('findByStatus', () => {
    it('should query with status', async () => {
      mockDb.where.mockResolvedValue([{ id: '1' }]);
      const result = await service.findByStatus('upcoming');
      expect(mockDb.where).toHaveBeenCalledWith({ status: 'upcoming' });
      expect(result).toEqual([{ id: '1' }]);
    });
  });
});
