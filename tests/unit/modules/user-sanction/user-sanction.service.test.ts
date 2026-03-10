import UserSanctionService from '@/modules/user-sanction/user-sanction.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.andWhere = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('UserSanctionService', () => {
  let service: InstanceType<typeof UserSanctionService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new UserSanctionService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "user_sanction"', () => {
    expect(service.table).toBe('user_sanction');
  });

  describe('findByUserId', () => {
    it('should query with user_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByUserId('uid');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid' });
    });
  });

  describe('findActiveByUserId', () => {
    it('should query active sanctions', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.andWhere.mockResolvedValue([{ id: '1' }]);
      const result = await service.findActiveByUserId('uid');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid', is_active: true });
      expect(mockDb.andWhere).toHaveBeenCalled();
    });
  });

  describe('findActiveBansByUserIdAndScope', () => {
    it('should query active bans for scope', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.andWhere.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1', type: 'ban' });
      const result = await service.findActiveBansByUserIdAndScope('uid', 'chat');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid', type: 'ban', scope: 'chat', is_active: true });
      expect(result).toEqual({ id: '1', type: 'ban' });
    });
  });
});
