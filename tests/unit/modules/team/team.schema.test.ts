import { createTeamSchema, updateTeamSchema } from '@/modules/team/team.schema';

describe('createTeamSchema', () => {
  const validData = {
    name: 'Team Alpha',
    image_url: 'https://example.com/team.png',
    description: 'Best team ever',
    game_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  };

  it('should accept valid complete data', () => {
    const result = createTeamSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept minimal required data', () => {
    const result = createTeamSchema.safeParse({ name: 'Team' });
    expect(result.success).toBe(true);
  });

  it('should reject missing name', () => {
    const result = createTeamSchema.safeParse({ description: 'test' });
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = createTeamSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should reject name exceeding 100 chars', () => {
    const result = createTeamSchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('should reject invalid image_url', () => {
    const result = createTeamSchema.safeParse({ name: 'Team', image_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid game_id', () => {
    const result = createTeamSchema.safeParse({ name: 'Team', game_id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('updateTeamSchema', () => {
  it('should accept empty object', () => {
    const result = updateTeamSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial update', () => {
    const result = updateTeamSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid values', () => {
    const result = updateTeamSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});
