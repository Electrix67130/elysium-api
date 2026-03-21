import { createNewsSchema, updateNewsSchema } from '@/modules/news/news.schema';

describe('createNewsSchema', () => {
  const validData = {
    title: 'Patch 2.0 is here',
    summary: 'A major update bringing new features.',
    content: 'Full article content here...',
    category: 'update' as const,
    author_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  };

  it('should accept valid minimal data', () => {
    expect(createNewsSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept valid complete data', () => {
    const result = createNewsSchema.safeParse({
      ...validData,
      image_url: 'https://example.com/image.png',
      published_at: '2026-03-21T12:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('should accept all category values', () => {
    for (const category of ['update', 'tournament', 'community', 'esport']) {
      expect(createNewsSchema.safeParse({ ...validData, category }).success).toBe(true);
    }
  });

  it('should reject missing title', () => {
    const { title, ...rest } = validData;
    expect(createNewsSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject missing summary', () => {
    const { summary, ...rest } = validData;
    expect(createNewsSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject missing content', () => {
    const { content, ...rest } = validData;
    expect(createNewsSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject missing category', () => {
    const { category, ...rest } = validData;
    expect(createNewsSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject missing author_id', () => {
    const { author_id, ...rest } = validData;
    expect(createNewsSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject invalid category', () => {
    expect(createNewsSchema.safeParse({ ...validData, category: 'breaking' }).success).toBe(false);
  });

  it('should reject invalid author_id', () => {
    expect(createNewsSchema.safeParse({ ...validData, author_id: 'not-a-uuid' }).success).toBe(false);
  });

  it('should reject title over 200 chars', () => {
    expect(createNewsSchema.safeParse({ ...validData, title: 'a'.repeat(201) }).success).toBe(false);
  });

  it('should reject summary over 500 chars', () => {
    expect(createNewsSchema.safeParse({ ...validData, summary: 'a'.repeat(501) }).success).toBe(false);
  });

  it('should reject invalid image_url', () => {
    expect(createNewsSchema.safeParse({ ...validData, image_url: 'not-a-url' }).success).toBe(false);
  });

  it('should reject invalid published_at', () => {
    expect(createNewsSchema.safeParse({ ...validData, published_at: 'not-a-date' }).success).toBe(false);
  });
});

describe('updateNewsSchema', () => {
  it('should accept empty object', () => {
    expect(updateNewsSchema.safeParse({}).success).toBe(true);
  });

  it('should accept partial update', () => {
    expect(updateNewsSchema.safeParse({ title: 'New Title', category: 'esport' }).success).toBe(true);
  });

  it('should accept nullable image_url', () => {
    expect(updateNewsSchema.safeParse({ image_url: null }).success).toBe(true);
  });

  it('should reject invalid category', () => {
    expect(updateNewsSchema.safeParse({ category: 'invalid' }).success).toBe(false);
  });
});
