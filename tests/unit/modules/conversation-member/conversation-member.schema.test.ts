import { createConversationMemberSchema, updateConversationMemberSchema } from '@/modules/conversation-member/conversation-member.schema';

describe('createConversationMemberSchema', () => {
  const validData = {
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    conversation_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  };

  it('should accept valid data', () => {
    expect(createConversationMemberSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept with optional booleans', () => {
    expect(createConversationMemberSchema.safeParse({ ...validData, is_pinned: true, is_muted: true }).success).toBe(true);
  });

  it('should reject missing user_id', () => {
    expect(createConversationMemberSchema.safeParse({ conversation_id: validData.conversation_id }).success).toBe(false);
  });

  it('should reject missing conversation_id', () => {
    expect(createConversationMemberSchema.safeParse({ user_id: validData.user_id }).success).toBe(false);
  });
});

describe('updateConversationMemberSchema', () => {
  it('should accept empty object', () => {
    expect(updateConversationMemberSchema.safeParse({}).success).toBe(true);
  });

  it('should accept partial updates', () => {
    expect(updateConversationMemberSchema.safeParse({ is_pinned: true, unread_count: 5 }).success).toBe(true);
  });

  it('should reject negative unread_count', () => {
    expect(updateConversationMemberSchema.safeParse({ unread_count: -1 }).success).toBe(false);
  });
});
