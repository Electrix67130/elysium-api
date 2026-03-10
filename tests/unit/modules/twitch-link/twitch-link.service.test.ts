import TwitchLinkService from '@/modules/twitch-link/twitch-link.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('TwitchLinkService', () => {
  let service: InstanceType<typeof TwitchLinkService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new TwitchLinkService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "twitch_link"', () => {
    expect(service.table).toBe('twitch_link');
  });

  describe('findByUserId', () => {
    it('should call findOne with user_id', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1' });
      const result = await service.findByUserId('uid');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid' });
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findByTwitchId', () => {
    it('should call findOne with twitch_id', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1' });
      const result = await service.findByTwitchId('twitch123');
      expect(mockDb.where).toHaveBeenCalledWith({ twitch_id: 'twitch123' });
      expect(result).toEqual({ id: '1' });
    });
  });
});
