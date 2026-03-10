import { createTeamMembershipSchema, updateTeamMembershipSchema } from '@/modules/team-membership/team-membership.schema';

describe('createTeamMembershipSchema', () => {
  const validData = {
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    team_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  };

  it('should accept valid minimal data', () => {
    const result = createTeamMembershipSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept valid data with role', () => {
    const result = createTeamMembershipSchema.safeParse({ ...validData, role: 'capitaine' });
    expect(result.success).toBe(true);
  });

  it('should reject missing user_id', () => {
    const result = createTeamMembershipSchema.safeParse({ team_id: validData.team_id });
    expect(result.success).toBe(false);
  });

  it('should reject missing team_id', () => {
    const result = createTeamMembershipSchema.safeParse({ user_id: validData.user_id });
    expect(result.success).toBe(false);
  });

  it('should reject invalid role', () => {
    const result = createTeamMembershipSchema.safeParse({ ...validData, role: 'admin' });
    expect(result.success).toBe(false);
  });

  it('should accept all valid roles', () => {
    for (const role of ['capitaine', 'manager', 'membre']) {
      const result = createTeamMembershipSchema.safeParse({ ...validData, role });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateTeamMembershipSchema', () => {
  it('should accept valid role update', () => {
    const result = updateTeamMembershipSchema.safeParse({ role: 'manager' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid role', () => {
    const result = updateTeamMembershipSchema.safeParse({ role: 'admin' });
    expect(result.success).toBe(false);
  });
});
