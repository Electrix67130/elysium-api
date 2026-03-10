import { createConversationSchema, updateConversationSchema } from '@/modules/conversation/conversation.schema';

describe('createConversationSchema', () => {
  it('should accept valid dm conversation', () => {
    const result = createConversationSchema.safeParse({ type: 'dm' });
    expect(result.success).toBe(true);
  });

  it('should accept valid group conversation with name', () => {
    const result = createConversationSchema.safeParse({ type: 'group', name: 'My Group' });
    expect(result.success).toBe(true);
  });

  it('should accept team conversation with team_id', () => {
    const result = createConversationSchema.safeParse({ type: 'team', team_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
    expect(result.success).toBe(true);
  });

  it('should reject missing type', () => {
    expect(createConversationSchema.safeParse({ name: 'test' }).success).toBe(false);
  });

  it('should reject invalid type', () => {
    expect(createConversationSchema.safeParse({ type: 'private' }).success).toBe(false);
  });

  it('should reject invalid team_id', () => {
    expect(createConversationSchema.safeParse({ type: 'team', team_id: 'bad' }).success).toBe(false);
  });
});

describe('updateConversationSchema', () => {
  it('should accept empty object', () => {
    expect(updateConversationSchema.safeParse({}).success).toBe(true);
  });

  it('should accept name update', () => {
    expect(updateConversationSchema.safeParse({ name: 'New Name' }).success).toBe(true);
  });
});
