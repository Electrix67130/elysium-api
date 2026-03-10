import { createChatMessageSchema, updateChatMessageSchema } from '@/modules/chat-message/chat-message.schema';

describe('createChatMessageSchema', () => {
  const validData = {
    conversation_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    sender_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    content: 'Hello world',
  };

  it('should accept valid data', () => {
    expect(createChatMessageSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept with optional tags', () => {
    expect(createChatMessageSchema.safeParse({ ...validData, sender_tag: 'Admin', sender_tag_color: '#FF0000' }).success).toBe(true);
  });

  it('should reject empty content', () => {
    expect(createChatMessageSchema.safeParse({ ...validData, content: '' }).success).toBe(false);
  });

  it('should reject missing conversation_id', () => {
    expect(createChatMessageSchema.safeParse({ sender_id: validData.sender_id, content: 'Hi' }).success).toBe(false);
  });

  it('should reject missing sender_id', () => {
    expect(createChatMessageSchema.safeParse({ conversation_id: validData.conversation_id, content: 'Hi' }).success).toBe(false);
  });

  it('should reject invalid sender_tag_color', () => {
    expect(createChatMessageSchema.safeParse({ ...validData, sender_tag_color: 'red' }).success).toBe(false);
  });
});

describe('updateChatMessageSchema', () => {
  it('should accept empty object', () => {
    expect(updateChatMessageSchema.safeParse({}).success).toBe(true);
  });

  it('should accept content update', () => {
    expect(updateChatMessageSchema.safeParse({ content: 'Edited' }).success).toBe(true);
  });

  it('should reject empty content', () => {
    expect(updateChatMessageSchema.safeParse({ content: '' }).success).toBe(false);
  });
});
