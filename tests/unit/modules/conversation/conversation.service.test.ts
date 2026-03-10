import ConversationService from '@/modules/conversation/conversation.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
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

  describe('findByType', () => {
    it('should call findMany with type', async () => {
      mockDb.where.mockResolvedValue([{ id: '1' }]);
      const result = await service.findByType('dm');
      expect(mockDb.where).toHaveBeenCalledWith({ type: 'dm' });
      expect(result).toEqual([{ id: '1' }]);
    });
  });
});
