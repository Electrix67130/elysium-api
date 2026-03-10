import { createTournamentParticipationSchema, updateTournamentParticipationSchema } from '@/modules/tournament-participation/tournament-participation.schema';

describe('createTournamentParticipationSchema', () => {
  const validData = {
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tournament_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  };

  it('should accept valid minimal data', () => {
    expect(createTournamentParticipationSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept with team_id and status', () => {
    expect(createTournamentParticipationSchema.safeParse({ ...validData, team_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', status: 'confirmed' }).success).toBe(true);
  });

  it('should reject missing user_id', () => {
    expect(createTournamentParticipationSchema.safeParse({ tournament_id: validData.tournament_id }).success).toBe(false);
  });

  it('should reject missing tournament_id', () => {
    expect(createTournamentParticipationSchema.safeParse({ user_id: validData.user_id }).success).toBe(false);
  });

  it('should reject invalid status', () => {
    expect(createTournamentParticipationSchema.safeParse({ ...validData, status: 'rejected' }).success).toBe(false);
  });
});

describe('updateTournamentParticipationSchema', () => {
  it('should accept valid status update', () => {
    expect(updateTournamentParticipationSchema.safeParse({ status: 'confirmed' }).success).toBe(true);
    expect(updateTournamentParticipationSchema.safeParse({ status: 'cancelled' }).success).toBe(true);
  });

  it('should reject invalid status', () => {
    expect(updateTournamentParticipationSchema.safeParse({ status: 'rejected' }).success).toBe(false);
  });
});
