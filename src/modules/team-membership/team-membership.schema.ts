import { z } from 'zod';

export const createTeamMembershipSchema = z.object({
  user_id: z.string().uuid(),
  team_id: z.string().uuid(),
  role: z.enum(['capitaine', 'manager', 'membre']).default('membre').optional(),
});

export const updateTeamMembershipSchema = z.object({
  role: z.enum(['capitaine', 'manager', 'membre']),
});

export type CreateTeamMembership = z.infer<typeof createTeamMembershipSchema>;
export type UpdateTeamMembership = z.infer<typeof updateTeamMembershipSchema>;

export type TeamMembershipRow = CreateTeamMembership & {
  id: string;
  created_at: string;
  updated_at: string;
  joined_at: string;
};
