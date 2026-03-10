import ConversationMemberService from '@/modules/conversation-member/conversation-member.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('ConversationMemberService', () => {
  let service: InstanceType<typeof ConversationMemberService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new ConversationMemberService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "conversation_member"', () => {
    expect(service.table).toBe('conversation_member');
  });

  describe('findByUserId', () => {
    it('should query with user_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByUserId('uid');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid' });
    });
  });

  describe('findByConversationId', () => {
    it('should query with conversation_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByConversationId('cid');
      expect(mockDb.where).toHaveBeenCalledWith({ conversation_id: 'cid' });
    });
  });

  describe('findByUserAndConversation', () => {
    it('should call findOne with both ids', async () => {
      mockDb.where.mockReturnValue(mockDb);
      mockDb.first.mockResolvedValue({ id: '1' });
      const result = await service.findByUserAndConversation('uid', 'cid');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: 'uid', conversation_id: 'cid' });
      expect(result).toEqual({ id: '1' });
    });
  });
});
