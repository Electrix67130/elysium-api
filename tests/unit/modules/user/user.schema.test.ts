import { createUserSchema, updateUserSchema } from '@/modules/user/user.schema';

describe('createUserSchema', () => {
  const validData = {
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashed_password',
  };

  it('should accept valid minimal data', () => {
    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept valid complete data', () => {
    const result = createUserSchema.safeParse({
      ...validData,
      display_name: 'Test User',
      avatar_url: 'https://example.com/avatar.png',
      country: 'FR',
      bio: 'Hello world',
      is_official: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing username', () => {
    const { username, ...rest } = validData;
    const result = createUserSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject missing email', () => {
    const { email, ...rest } = validData;
    const result = createUserSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject missing password_hash', () => {
    const { password_hash, ...rest } = validData;
    const result = createUserSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject username shorter than 3 chars', () => {
    const result = createUserSchema.safeParse({ ...validData, username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('should reject username longer than 50 chars', () => {
    const result = createUserSchema.safeParse({ ...validData, username: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = createUserSchema.safeParse({ ...validData, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid avatar_url', () => {
    const result = createUserSchema.safeParse({ ...validData, avatar_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('should reject country not exactly 2 chars', () => {
    expect(createUserSchema.safeParse({ ...validData, country: 'F' }).success).toBe(false);
    expect(createUserSchema.safeParse({ ...validData, country: 'FRA' }).success).toBe(false);
  });

  it('should default is_official to false', () => {
    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
    expect(result.data!.is_official).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('should accept empty object', () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial update', () => {
    const result = updateUserSchema.safeParse({ display_name: 'New Name', status_text: 'Playing' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email on update', () => {
    const result = updateUserSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});
