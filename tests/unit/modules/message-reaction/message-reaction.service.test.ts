import MessageReactionService from '@/modules/message-reaction/message-reaction.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('MessageReactionService', () => {
  let service: InstanceType<typeof MessageReactionService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new MessageReactionService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "message_reaction"', () => {
    expect(service.table).toBe('message_reaction');
  });

  describe('findByMessageId', () => {
    it('should query with message_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByMessageId('mid');
      expect(mockDb.where).toHaveBeenCalledWith({ message_id: 'mid' });
    });
  });

  describe('findByUserId', () => {
    it('should query with user_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByUserId('uid');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid' });
    });
  });
});
