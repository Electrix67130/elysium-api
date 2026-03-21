import ConversationService from '@/modules/conversation/conversation.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.whereIn = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.select = jest.fn(() => mock);
  mock.insert = jest.fn(() => mock);
  mock.returning = jest.fn();
  mock.del = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  mock.transaction = jest.fn();
  return mock;
}

describe('ConversationService', () => {
  let service: InstanceType<typeof ConversationService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new ConversationService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "conversation"', () => {
    expect(service.table).toBe('conversation');
  });

  describe('findByTeamId', () => {
    it('should call findOne with team_id', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1', type: 'team' });
      const result = await service.findByTeamId('team-uuid');
      expect(mockDb.where).toHaveBeenCalledWith({ team_id: 'team-uuid' });
      expect(result).toEqual({ id: '1', type: 'team' });
    });
  });

  describe('findByTournamentId', () => {
    it('should call findOne with tournament_id', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1', type: 'tournament' });
      const result = await service.findByTournamentId('tid');
      expect(mockDb.where).toHaveBeenCalledWith({ tournament_id: 'tid' });
      expect(result).toEqual({ id: '1', type: 'tournament' });
    });
  });

  describe('findByType', () => {
    it('should call findMany with type', async () => {
      mockDb.where.mockResolvedValue([{ id: '1' }]);
      const result = await service.findByType('dm');
      expect(mockDb.where).toHaveBeenCalledWith({ type: 'dm' });
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('createDm', () => {
    it('should return existing DM if one already exists', async () => {
      const existingConv = { id: 'conv-1', type: 'dm' };
      mockDb.where.mockReturnValue(mockDb);
      mockDb.whereIn.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue(existingConv);

      const result = await service.createDm('user-1', 'user-2');
      expect(result).toEqual(existingConv);
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it('should create conversation and 2 members in transaction when no existing DM', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.whereIn.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue(null);

      const newConv = { id: 'conv-new', type: 'dm' };
      const mockTrx = jest.fn(() => mockTrx) as any;
      mockTrx.insert = jest.fn(() => mockTrx);
      mockTrx.returning = jest.fn().mockResolvedValue([newConv]);

      mockDb.transaction.mockImplementation(async (cb: Function) => cb(mockTrx));

      const result = await service.createDm('user-1', 'user-2');
      expect(result).toEqual(newConv);
      expect(mockTrx.insert).toHaveBeenCalledTimes(2);
      // Second insert = les 2 membres
      expect(mockTrx.insert).toHaveBeenLastCalledWith([
        { user_id: 'user-1', conversation_id: 'conv-new' },
        { user_id: 'user-2', conversation_id: 'conv-new' },
      ]);
    });
  });

  describe('createForTeam', () => {
    it('should return existing conversation if one exists for team', async () => {
      const existing = { id: 'conv-1', type: 'team', team_id: 'tid' };
      jest.spyOn(service, 'findByTeamId').mockResolvedValue(existing as any);

      const result = await service.createForTeam('tid');
      expect(result).toEqual(existing);
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it('should create conversation and add all team members', async () => {
      jest.spyOn(service, 'findByTeamId').mockResolvedValue(undefined);

      const newConv = { id: 'conv-new', type: 'team', team_id: 'tid' };
      const mockTrx = jest.fn(() => mockTrx) as any;
      mockTrx.insert = jest.fn(() => mockTrx);
      mockTrx.returning = jest.fn().mockResolvedValue([newConv]);
      mockTrx.where = jest.fn(() => mockTrx);
      mockTrx.select = jest.fn().mockResolvedValue([{ user_id: 'u1' }, { user_id: 'u2' }, { user_id: 'u3' }]);

      mockDb.transaction.mockImplementation(async (cb: Function) => cb(mockTrx));

      const result = await service.createForTeam('tid', 'Team Chat');
      expect(result).toEqual(newConv);
      expect(mockTrx.insert).toHaveBeenLastCalledWith([
        { user_id: 'u1', conversation_id: 'conv-new' },
        { user_id: 'u2', conversation_id: 'conv-new' },
        { user_id: 'u3', conversation_id: 'conv-new' },
      ]);
    });
  });

  describe('createForTournament', () => {
    it('should return existing conversation if one exists for tournament', async () => {
      const existing = { id: 'conv-1', type: 'tournament', tournament_id: 'tid' };
      jest.spyOn(service, 'findByTournamentId').mockResolvedValue(existing as any);

      const result = await service.createForTournament('tid');
      expect(result).toEqual(existing);
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it('should create conversation and add confirmed participants only', async () => {
      jest.spyOn(service, 'findByTournamentId').mockResolvedValue(undefined);

      const newConv = { id: 'conv-new', type: 'tournament', tournament_id: 'tid' };
      const mockTrx = jest.fn(() => mockTrx) as any;
      mockTrx.insert = jest.fn(() => mockTrx);
      mockTrx.returning = jest.fn().mockResolvedValue([newConv]);
      mockTrx.where = jest.fn(() => mockTrx);
      mockTrx.select = jest.fn().mockResolvedValue([{ user_id: 'p1' }, { user_id: 'p2' }]);

      mockDb.transaction.mockImplementation(async (cb: Function) => cb(mockTrx));

      const result = await service.createForTournament('tid');
      expect(result).toEqual(newConv);
      expect(mockTrx.where).toHaveBeenCalledWith({ tournament_id: 'tid', status: 'confirmed' });
      expect(mockTrx.insert).toHaveBeenLastCalledWith([
        { user_id: 'p1', conversation_id: 'conv-new' },
        { user_id: 'p2', conversation_id: 'conv-new' },
      ]);
    });
  });
});
