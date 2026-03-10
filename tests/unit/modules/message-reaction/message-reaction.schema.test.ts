import { createMessageReactionSchema, updateMessageReactionSchema } from '@/modules/message-reaction/message-reaction.schema';

describe('createMessageReactionSchema', () => {
  const validData = {
    message_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    emoji: '\u{1F44D}',
  };

  it('should accept valid data', () => {
    expect(createMessageReactionSchema.safeParse(validData).success).toBe(true);
  });

  it('should reject missing emoji', () => {
    expect(createMessageReactionSchema.safeParse({ message_id: validData.message_id, user_id: validData.user_id }).success).toBe(false);
  });

  it('should reject empty emoji', () => {
    expect(createMessageReactionSchema.safeParse({ ...validData, emoji: '' }).success).toBe(false);
  });

  it('should reject emoji exceeding 10 chars', () => {
    expect(createMessageReactionSchema.safeParse({ ...validData, emoji: 'a'.repeat(11) }).success).toBe(false);
  });

  it('should reject invalid message_id', () => {
    expect(createMessageReactionSchema.safeParse({ ...validData, message_id: 'bad' }).success).toBe(false);
  });
});

describe('updateMessageReactionSchema', () => {
  it('should accept empty object', () => {
    expect(updateMessageReactionSchema.safeParse({}).success).toBe(true);
  });

  it('should accept emoji update', () => {
    expect(updateMessageReactionSchema.safeParse({ emoji: '\u2764\uFE0F' }).success).toBe(true);
  });
});
