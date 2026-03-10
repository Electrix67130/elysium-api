import ChatMessageService from '@/modules/chat-message/chat-message.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('ChatMessageService', () => {
  let service: InstanceType<typeof ChatMessageService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new ChatMessageService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "chat_message"', () => {
    expect(service.table).toBe('chat_message');
  });

  describe('findByConversationId', () => {
    it('should query with conversation_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findByConversationId('cid');
      expect(mockDb.where).toHaveBeenCalledWith({ conversation_id: 'cid' });
    });
  });

  describe('findBySenderId', () => {
    it('should query with sender_id', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findBySenderId('sid');
      expect(mockDb.where).toHaveBeenCalledWith({ sender_id: 'sid' });
    });
  });
});
