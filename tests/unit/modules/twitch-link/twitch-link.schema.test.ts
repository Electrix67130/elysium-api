import { createTwitchLinkSchema, updateTwitchLinkSchema } from '@/modules/twitch-link/twitch-link.schema';

describe('createTwitchLinkSchema', () => {
  const validData = {
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    twitch_id: 'twitch123',
  };

  it('should accept valid minimal data', () => {
    expect(createTwitchLinkSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept valid complete data', () => {
    expect(createTwitchLinkSchema.safeParse({
      ...validData,
      twitch_username: 'streamer',
      display_name: 'Streamer',
      is_live: true,
      viewer_count: 1500,
      stream_title: 'Live now!',
      thumbnail_url: 'https://example.com/thumb.jpg',
    }).success).toBe(true);
  });

  it('should reject missing user_id', () => {
    expect(createTwitchLinkSchema.safeParse({ twitch_id: 'test' }).success).toBe(false);
  });

  it('should reject missing twitch_id', () => {
    expect(createTwitchLinkSchema.safeParse({ user_id: validData.user_id }).success).toBe(false);
  });

  it('should reject negative viewer_count', () => {
    expect(createTwitchLinkSchema.safeParse({ ...validData, viewer_count: -1 }).success).toBe(false);
  });

  it('should reject invalid thumbnail_url', () => {
    expect(createTwitchLinkSchema.safeParse({ ...validData, thumbnail_url: 'not-url' }).success).toBe(false);
  });
});

describe('updateTwitchLinkSchema', () => {
  it('should accept empty object', () => {
    expect(updateTwitchLinkSchema.safeParse({}).success).toBe(true);
  });

  it('should accept partial update', () => {
    expect(updateTwitchLinkSchema.safeParse({ is_live: true, viewer_count: 500 }).success).toBe(true);
  });
});
