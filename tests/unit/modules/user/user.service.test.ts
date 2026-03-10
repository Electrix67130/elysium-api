import UserService from '@/modules/user/user.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('UserService', () => {
  let service: InstanceType<typeof UserService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new UserService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "user"', () => {
    expect(service.table).toBe('user');
  });

  describe('findByEmail', () => {
    it('should call findOne with email', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(mockDb.where).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(user);
    });
  });

  describe('findByUsername', () => {
    it('should call findOne with username', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue(undefined);

      const result = await service.findByUsername('unknown');

      expect(mockDb.where).toHaveBeenCalledWith({ username: 'unknown' });
      expect(result).toBeUndefined();
    });
  });
});
