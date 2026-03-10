import { createFriendshipSchema, updateFriendshipSchema } from '@/modules/friendship/friendship.schema';

describe('createFriendshipSchema', () => {
  const validData = {
    sender_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    receiver_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  };

  it('should accept valid data', () => {
    const result = createFriendshipSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing sender_id', () => {
    const result = createFriendshipSchema.safeParse({ receiver_id: validData.receiver_id });
    expect(result.success).toBe(false);
  });

  it('should reject missing receiver_id', () => {
    const result = createFriendshipSchema.safeParse({ sender_id: validData.sender_id });
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID for sender_id', () => {
    const result = createFriendshipSchema.safeParse({ sender_id: 'not-uuid', receiver_id: validData.receiver_id });
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID for receiver_id', () => {
    const result = createFriendshipSchema.safeParse({ sender_id: validData.sender_id, receiver_id: 'not-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('updateFriendshipSchema', () => {
  it('should accept valid status', () => {
    expect(updateFriendshipSchema.safeParse({ status: 'pending' }).success).toBe(true);
    expect(updateFriendshipSchema.safeParse({ status: 'accepted' }).success).toBe(true);
  });

  it('should reject invalid status', () => {
    expect(updateFriendshipSchema.safeParse({ status: 'rejected' }).success).toBe(false);
  });
});
