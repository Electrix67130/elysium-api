import { createPlayerStatsSchema, updatePlayerStatsSchema } from '@/modules/player-stats/player-stats.schema';

describe('createPlayerStatsSchema', () => {
  const validData = {
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    game_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  };

  it('should accept valid minimal data', () => {
    const result = createPlayerStatsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept valid complete data', () => {
    const result = createPlayerStatsSchema.safeParse({
      ...validData,
      wins: 10,
      losses: 5,
      win_rate: 66.67,
      total_matches: 15,
      tournaments_played: 3,
      tournaments_won: 1,
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing user_id', () => {
    const result = createPlayerStatsSchema.safeParse({ game_id: validData.game_id });
    expect(result.success).toBe(false);
  });

  it('should reject missing game_id', () => {
    const result = createPlayerStatsSchema.safeParse({ user_id: validData.user_id });
    expect(result.success).toBe(false);
  });

  it('should reject negative wins', () => {
    const result = createPlayerStatsSchema.safeParse({ ...validData, wins: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject win_rate over 100', () => {
    const result = createPlayerStatsSchema.safeParse({ ...validData, win_rate: 101 });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer wins', () => {
    const result = createPlayerStatsSchema.safeParse({ ...validData, wins: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe('updatePlayerStatsSchema', () => {
  it('should accept empty object', () => {
    const result = updatePlayerStatsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial update', () => {
    const result = updatePlayerStatsSchema.safeParse({ wins: 15, losses: 3 });
    expect(result.success).toBe(true);
  });

  it('should reject invalid values', () => {
    const result = updatePlayerStatsSchema.safeParse({ wins: -5 });
    expect(result.success).toBe(false);
  });
});
