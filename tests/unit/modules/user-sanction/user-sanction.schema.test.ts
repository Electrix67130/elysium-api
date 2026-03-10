import { createUserSanctionSchema, updateUserSanctionSchema } from '@/modules/user-sanction/user-sanction.schema';

describe('createUserSanctionSchema', () => {
  const validData = {
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    issued_by: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    type: 'warning',
    scope: 'platform',
  };

  it('should accept valid minimal data', () => {
    expect(createUserSanctionSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept with all optional fields', () => {
    expect(createUserSanctionSchema.safeParse({
      ...validData,
      reason: 'Toxic behavior',
      expires_at: '2026-12-31T23:59:59Z',
      is_active: true,
    }).success).toBe(true);
  });

  it('should reject missing user_id', () => {
    const { user_id, ...rest } = validData;
    expect(createUserSanctionSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject missing issued_by', () => {
    const { issued_by, ...rest } = validData;
    expect(createUserSanctionSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject invalid type', () => {
    expect(createUserSanctionSchema.safeParse({ ...validData, type: 'mute' }).success).toBe(false);
  });

  it('should reject invalid scope', () => {
    expect(createUserSanctionSchema.safeParse({ ...validData, scope: 'game' }).success).toBe(false);
  });

  it('should accept all valid types', () => {
    for (const type of ['warning', 'ban']) {
      expect(createUserSanctionSchema.safeParse({ ...validData, type }).success).toBe(true);
    }
  });

  it('should accept all valid scopes', () => {
    for (const scope of ['platform', 'tournament', 'chat']) {
      expect(createUserSanctionSchema.safeParse({ ...validData, scope }).success).toBe(true);
    }
  });
});

describe('updateUserSanctionSchema', () => {
  it('should accept empty object', () => {
    expect(updateUserSanctionSchema.safeParse({}).success).toBe(true);
  });

  it('should accept deactivation', () => {
    expect(updateUserSanctionSchema.safeParse({ is_active: false }).success).toBe(true);
  });

  it('should accept reason update', () => {
    expect(updateUserSanctionSchema.safeParse({ reason: 'Updated reason' }).success).toBe(true);
  });
});
