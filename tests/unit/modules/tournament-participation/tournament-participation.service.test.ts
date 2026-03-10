import TournamentParticipationService from '@/modules/tournament-participation/tournament-participation.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('TournamentParticipationService', () => {
  let service: InstanceType<typeof TournamentParticipationService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new TournamentParticipationService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "tournament_participation"', () => {
    expect(service.table).toBe('tournament_participation');
  });

  describe('findByUserId', () => {
    it('should query with user_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByUserId('uid');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid' });
    });
  });

  describe('findByTournamentId', () => {
    it('should query with tournament_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByTournamentId('tid');
      expect(mockDb.where).toHaveBeenCalledWith({ tournament_id: 'tid' });
    });
  });

  describe('findByUserAndTournament', () => {
    it('should call findOne with both ids', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1' });
      const result = await service.findByUserAndTournament('uid', 'tid');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid', tournament_id: 'tid' });
      expect(result).toEqual({ id: '1' });
    });
  });
});
