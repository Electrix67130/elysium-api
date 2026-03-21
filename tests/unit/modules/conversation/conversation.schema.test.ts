import {
  createConversationSchema,
  updateConversationSchema,
  createDmSchema,
  createTeamConversationSchema,
  createTournamentConversationSchema,
} from '@/modules/conversation/conversation.schema';

describe('createConversationSchema', () => {
  it('should accept valid dm conversation', () => {
    const result = createConversationSchema.safeParse({ type: 'dm' });
    expect(result.success).toBe(true);
  });

  it('should accept valid group conversation with name', () => {
    const result = createConversationSchema.safeParse({ type: 'group', name: 'My Group' });
    expect(result.success).toBe(true);
  });

  it('should accept team conversation with team_id', () => {
    const result = createConversationSchema.safeParse({ type: 'team', team_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
    expect(result.success).toBe(true);
  });

  it('should accept tournament conversation with tournament_id', () => {
    const result = createConversationSchema.safeParse({ type: 'tournament', tournament_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
    expect(result.success).toBe(true);
  });

  it('should reject missing type', () => {
    expect(createConversationSchema.safeParse({ name: 'test' }).success).toBe(false);
  });

  it('should reject invalid type', () => {
    expect(createConversationSchema.safeParse({ type: 'private' }).success).toBe(false);
  });

  it('should reject invalid team_id', () => {
    expect(createConversationSchema.safeParse({ type: 'team', team_id: 'bad' }).success).toBe(false);
  });

  it('should reject invalid tournament_id', () => {
    expect(createConversationSchema.safeParse({ type: 'tournament', tournament_id: 'bad' }).success).toBe(false);
  });
});

describe('updateConversationSchema', () => {
  it('should accept empty object', () => {
    expect(updateConversationSchema.safeParse({}).success).toBe(true);
  });

  it('should accept name update', () => {
    expect(updateConversationSchema.safeParse({ name: 'New Name' }).success).toBe(true);
  });
});

describe('createDmSchema', () => {
  const validUuid1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const validUuid2 = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

  it('should accept two different user UUIDs', () => {
    const result = createDmSchema.safeParse({ user_id_1: validUuid1, user_id_2: validUuid2 });
    expect(result.success).toBe(true);
  });

  it('should reject same user for both sides', () => {
    const result = createDmSchema.safeParse({ user_id_1: validUuid1, user_id_2: validUuid1 });
    expect(result.success).toBe(false);
  });

  it('should reject missing user_id_1', () => {
    expect(createDmSchema.safeParse({ user_id_2: validUuid2 }).success).toBe(false);
  });

  it('should reject missing user_id_2', () => {
    expect(createDmSchema.safeParse({ user_id_1: validUuid1 }).success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    expect(createDmSchema.safeParse({ user_id_1: 'bad', user_id_2: validUuid2 }).success).toBe(false);
  });
});

describe('createTeamConversationSchema', () => {
  it('should accept valid team_id', () => {
    const result = createTeamConversationSchema.safeParse({ team_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
    expect(result.success).toBe(true);
  });

  it('should accept team_id with name', () => {
    const result = createTeamConversationSchema.safeParse({ team_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Team Chat' });
    expect(result.success).toBe(true);
  });

  it('should reject missing team_id', () => {
    expect(createTeamConversationSchema.safeParse({}).success).toBe(false);
  });
});

describe('createTournamentConversationSchema', () => {
  it('should accept valid tournament_id', () => {
    const result = createTournamentConversationSchema.safeParse({ tournament_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
    expect(result.success).toBe(true);
  });

  it('should accept tournament_id with name', () => {
    const result = createTournamentConversationSchema.safeParse({ tournament_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Tournoi Chat' });
    expect(result.success).toBe(true);
  });

  it('should reject missing tournament_id', () => {
    expect(createTournamentConversationSchema.safeParse({}).success).toBe(false);
  });
});
