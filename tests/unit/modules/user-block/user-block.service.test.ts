import UserBlockService from '@/modules/user-block/user-block.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('UserBlockService', () => {
  let service: InstanceType<typeof UserBlockService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new UserBlockService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "user_block"', () => {
    expect(service.table).toBe('user_block');
  });

  describe('findByBlockerId', () => {
    it('should call findMany with blocker_id', async () => {
      mockDb.where.mockResolvedValue([{ id: '1' }]);

      const result = await service.findByBlockerId('blocker-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ blocker_id: 'blocker-uuid' });
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findByPair', () => {
    it('should call findOne with both ids', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1' });

      const result = await service.findByPair('blocker-uuid', 'blocked-uuid');

      expect(mockDb.where).toHaveBeenCalledWith({ blocker_id: 'blocker-uuid', blocked_id: 'blocked-uuid' });
      expect(result).toEqual({ id: '1' });
    });
  });
});
