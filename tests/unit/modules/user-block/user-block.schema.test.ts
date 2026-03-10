import { createUserBlockSchema, updateUserBlockSchema } from '@/modules/user-block/user-block.schema';

describe('createUserBlockSchema', () => {
  const validData = {
    blocker_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    blocked_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  };

  it('should accept valid data', () => {
    const result = createUserBlockSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing blocker_id', () => {
    const result = createUserBlockSchema.safeParse({ blocked_id: validData.blocked_id });
    expect(result.success).toBe(false);
  });

  it('should reject missing blocked_id', () => {
    const result = createUserBlockSchema.safeParse({ blocker_id: validData.blocker_id });
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const result = createUserBlockSchema.safeParse({ blocker_id: 'bad', blocked_id: validData.blocked_id });
    expect(result.success).toBe(false);
  });
});

describe('updateUserBlockSchema', () => {
  it('should accept empty object', () => {
    const result = updateUserBlockSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
