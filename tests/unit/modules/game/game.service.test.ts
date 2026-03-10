import GameService from '@/modules/game/game.service';

/**
 * Creates a mock Knex instance.
 * Each chainable method returns the mock itself for fluent API.
 */
function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.select = jest.fn(() => mock);
  mock.insert = jest.fn(() => mock);
  mock.update = jest.fn(() => mock);
  mock.del = jest.fn();
  mock.returning = jest.fn();
  mock.orderBy = jest.fn(() => mock);
  mock.limit = jest.fn(() => mock);
  mock.offset = jest.fn(() => mock);
  mock.count = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('GameService', () => {
  let service: InstanceType<typeof GameService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new GameService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "game"', () => {
    expect(service.table).toBe('game');
  });

  it('should store the db reference', () => {
    expect(service.db).toBe(mockDb);
  });

  describe('findBySlug', () => {
    it('should call findOne with slug', async () => {
      const expectedGame = { id: '123', name: 'Valorant', slug: 'valorant' };
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue(expectedGame);

      const result = await service.findBySlug('valorant');

      expect(mockDb).toHaveBeenCalledWith('game');
      expect(mockDb.where).toHaveBeenCalledWith({ slug: 'valorant' });
      expect(mockDb.first).toHaveBeenCalled();
      expect(result).toEqual(expectedGame);
    });

    it('should return undefined when slug not found', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue(undefined);

      const result = await service.findBySlug('nonexistent');

      expect(result).toBeUndefined();
    });
  });
});
