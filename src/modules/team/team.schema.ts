import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  image_url: z.string().url().max(500).optional(),
  description: z.string().optional(),
  game_id: z.string().uuid().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image_url: z.string().url().max(500).optional(),
  description: z.string().optional(),
  game_id: z.string().uuid().optional(),
});

export type CreateTeam = z.infer<typeof createTeamSchema>;
export type UpdateTeam = z.infer<typeof updateTeamSchema>;

export type TeamRow = CreateTeam & {
  id: string;
  created_at: string;
  updated_at: string;
};
