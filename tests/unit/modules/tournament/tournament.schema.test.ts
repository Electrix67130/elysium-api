import { createTournamentSchema, updateTournamentSchema } from '@/modules/tournament/tournament.schema';

describe('createTournamentSchema', () => {
  const validData = {
    name: 'Elysium Cup',
    game_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    organizer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  };

  it('should accept valid minimal data', () => {
    expect(createTournamentSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept valid complete data', () => {
    const result = createTournamentSchema.safeParse({
      ...validData,
      status: 'upcoming',
      date: '2026-06-15T10:00:00Z',
      max_players: 64,
      team_size: 5,
      is_official: true,
      description: 'Big tournament',
      requires_approval: true,
      prize_pool: '1000\u20AC',
      registration_closes_at: '2026-06-10T23:59:59Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing name', () => {
    expect(createTournamentSchema.safeParse({ game_id: validData.game_id, organizer_id: validData.organizer_id }).success).toBe(false);
  });

  it('should reject missing game_id', () => {
    expect(createTournamentSchema.safeParse({ name: 'Test', organizer_id: validData.organizer_id }).success).toBe(false);
  });

  it('should reject missing organizer_id', () => {
    expect(createTournamentSchema.safeParse({ name: 'Test', game_id: validData.game_id }).success).toBe(false);
  });

  it('should reject invalid status', () => {
    expect(createTournamentSchema.safeParse({ ...validData, status: 'cancelled' }).success).toBe(false);
  });

  it('should reject max_players less than 2', () => {
    expect(createTournamentSchema.safeParse({ ...validData, max_players: 1 }).success).toBe(false);
  });

  it('should reject team_size less than 1', () => {
    expect(createTournamentSchema.safeParse({ ...validData, team_size: 0 }).success).toBe(false);
  });
});

describe('updateTournamentSchema', () => {
  it('should accept empty object', () => {
    expect(updateTournamentSchema.safeParse({}).success).toBe(true);
  });

  it('should accept partial update', () => {
    expect(updateTournamentSchema.safeParse({ status: 'ongoing', name: 'New Name' }).success).toBe(true);
  });

  it('should reject invalid status', () => {
    expect(updateTournamentSchema.safeParse({ status: 'invalid' }).success).toBe(false);
  });
});
