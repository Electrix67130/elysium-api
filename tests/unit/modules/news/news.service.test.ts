import NewsService from '@/modules/news/news.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('NewsService', () => {
  let service: InstanceType<typeof NewsService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new NewsService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "news"', () => {
    expect(service.table).toBe('news');
  });

  describe('findByAuthorId', () => {
    it('should query with author_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByAuthorId('uid');
      expect(mockDb.where).toHaveBeenCalledWith({ author_id: 'uid' });
    });
  });

  describe('findByCategory', () => {
    it('should query with category', async () => {
      mockDb.where.mockResolvedValue([{ id: '1' }]);
      const result = await service.findByCategory('tournament');
      expect(mockDb.where).toHaveBeenCalledWith({ category: 'tournament' });
      expect(result).toEqual([{ id: '1' }]);
    });
  });
});
