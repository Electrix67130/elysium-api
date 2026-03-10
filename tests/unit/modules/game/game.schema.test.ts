import { createGameSchema, updateGameSchema } from '@/modules/game/game.schema';

describe('createGameSchema', () => {
  const validData = {
    name: 'Valorant',
    slug: 'valorant',
    image_url: 'https://example.com/valorant.png',
    icon_url: 'https://example.com/valorant-icon.png',
    brand_color: '#FF4655',
  };

  it('should accept valid complete data', () => {
    const result = createGameSchema.safeParse(validData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validData);
  });

  it('should accept minimal required data', () => {
    const result = createGameSchema.safeParse({ name: 'CS2', slug: 'cs2' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'CS2', slug: 'cs2' });
  });

  it('should reject missing name', () => {
    const result = createGameSchema.safeParse({ slug: 'test' });
    expect(result.success).toBe(false);
  });

  it('should reject missing slug', () => {
    const result = createGameSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = createGameSchema.safeParse({ name: '', slug: 'test' });
    expect(result.success).toBe(false);
  });

  it('should reject name exceeding 100 chars', () => {
    const result = createGameSchema.safeParse({ name: 'a'.repeat(101), slug: 'test' });
    expect(result.success).toBe(false);
  });

  it('should reject slug exceeding 50 chars', () => {
    const result = createGameSchema.safeParse({ name: 'Test', slug: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('should reject invalid image_url', () => {
    const result = createGameSchema.safeParse({ name: 'Test', slug: 'test', image_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid icon_url', () => {
    const result = createGameSchema.safeParse({ name: 'Test', slug: 'test', icon_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid brand_color format', () => {
    const invalid = ['red', '#FFF', '#GGGGGG', '123456', '#12345', '#1234567'];
    for (const color of invalid) {
      const result = createGameSchema.safeParse({ name: 'Test', slug: 'test', brand_color: color });
      expect(result.success).toBe(false);
    }
  });

  it('should accept valid brand_color formats', () => {
    const valid = ['#FF4655', '#000000', '#ffffff', '#aaBBcc'];
    for (const color of valid) {
      const result = createGameSchema.safeParse({ name: 'Test', slug: 'test', brand_color: color });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateGameSchema', () => {
  it('should accept empty object (no fields to update)', () => {
    const result = updateGameSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial update with name only', () => {
    const result = updateGameSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'New Name' });
  });

  it('should accept partial update with slug only', () => {
    const result = updateGameSchema.safeParse({ slug: 'new-slug' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with brand_color only', () => {
    const result = updateGameSchema.safeParse({ brand_color: '#00FF00' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid values even on partial update', () => {
    const result = updateGameSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid brand_color on partial update', () => {
    const result = updateGameSchema.safeParse({ brand_color: 'invalid' });
    expect(result.success).toBe(false);
  });
});
