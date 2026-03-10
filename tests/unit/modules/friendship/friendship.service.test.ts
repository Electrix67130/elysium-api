import FriendshipService from '@/modules/friendship/friendship.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('FriendshipService', () => {
  let service: InstanceType<typeof FriendshipService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new FriendshipService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "friendship"', () => {
    expect(service.table).toBe('friendship');
  });

  describe('findBySenderId', () => {
    it('should call findMany with sender_id', async () => {
      const friendships = [{ id: '1' }];
      mockDb.where.mockResolvedValue(friendships);

      const result = await service.findBySenderId('sender-uuid');

      expect(mockDb).toHaveBeenCalledWith('friendship');
      expect(mockDb.where).toHaveBeenCalledWith({ sender_id: 'sender-uuid' });
      expect(result).toEqual(friendships);
    });
  });

  describe('findByReceiverId', () => {
    it('should call findMany with receiver_id', async () => {
      mockDb.where.mockResolvedValue([]);

      await service.findByReceiverId('receiver-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ receiver_id: 'receiver-uuid' });
    });
  });

  describe('findByPair', () => {
    it('should call findOne with both ids', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1' });

      const result = await service.findByPair('sender-uuid', 'receiver-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ sender_id: 'sender-uuid', receiver_id: 'receiver-uuid' });
      expect(mockDb.first).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });
  });
});
