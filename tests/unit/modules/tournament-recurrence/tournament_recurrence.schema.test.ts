import { createTournamentRecurrenceSchema, updateTournamentRecurrenceSchema } from '@/modules/tournament-recurrence/tournament_recurrence.schema';

describe('createTournamentRecurrenceSchema', () => {
  const validData = {
    source_tournament_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    recurrence_type: 'weekly' as const,
  };

  it('should accept valid minimal data', () => {
    expect(createTournamentRecurrenceSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept valid complete data', () => {
    const result = createTournamentRecurrenceSchema.safeParse({
      ...validData,
      recurrence_end_at: '2026-12-31T23:59:59Z',
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it('should accept monthly recurrence type', () => {
    expect(createTournamentRecurrenceSchema.safeParse({ ...validData, recurrence_type: 'monthly' }).success).toBe(true);
  });

  it('should reject missing source_tournament_id', () => {
    expect(createTournamentRecurrenceSchema.safeParse({ recurrence_type: 'weekly' }).success).toBe(false);
  });

  it('should reject missing recurrence_type', () => {
    expect(createTournamentRecurrenceSchema.safeParse({ source_tournament_id: validData.source_tournament_id }).success).toBe(false);
  });

  it('should reject invalid source_tournament_id', () => {
    expect(createTournamentRecurrenceSchema.safeParse({ ...validData, source_tournament_id: 'not-a-uuid' }).success).toBe(false);
  });

  it('should reject invalid recurrence_type', () => {
    expect(createTournamentRecurrenceSchema.safeParse({ ...validData, recurrence_type: 'daily' }).success).toBe(false);
  });

  it('should reject invalid recurrence_end_at', () => {
    expect(createTournamentRecurrenceSchema.safeParse({ ...validData, recurrence_end_at: 'not-a-date' }).success).toBe(false);
  });

  it('should default is_active to true', () => {
    const result = createTournamentRecurrenceSchema.parse(validData);
    expect(result.is_active).toBe(true);
  });
});

describe('updateTournamentRecurrenceSchema', () => {
  it('should accept empty object', () => {
    expect(updateTournamentRecurrenceSchema.safeParse({}).success).toBe(true);
  });

  it('should accept partial update with recurrence_type', () => {
    expect(updateTournamentRecurrenceSchema.safeParse({ recurrence_type: 'monthly' }).success).toBe(true);
  });

  it('should accept partial update with is_active', () => {
    expect(updateTournamentRecurrenceSchema.safeParse({ is_active: false }).success).toBe(true);
  });

  it('should accept nullable recurrence_end_at', () => {
    expect(updateTournamentRecurrenceSchema.safeParse({ recurrence_end_at: null }).success).toBe(true);
  });

  it('should reject invalid recurrence_type', () => {
    expect(updateTournamentRecurrenceSchema.safeParse({ recurrence_type: 'daily' }).success).toBe(false);
  });
});
