import { z } from 'zod';

export const createTournamentSchema = z.object({
  name: z.string().min(1).max(200),
  game_id: z.string().uuid(),
  organizer_id: z.string().uuid(),
  status: z.enum(['upcoming', 'ongoing', 'completed']).default('upcoming').optional(),
  date: z.string().datetime().optional(),
  max_players: z.number().int().min(2).optional(),
  team_size: z.number().int().min(1).optional(),
  is_official: z.boolean().default(false).optional(),
  description: z.string().optional(),
  requires_approval: z.boolean().default(false).optional(),
  prize_pool: z.string().max(100).optional(),
  registration_closes_at: z.string().datetime().optional(),
});

export const updateTournamentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed']).optional(),
  date: z.string().datetime().optional(),
  max_players: z.number().int().min(2).optional(),
  team_size: z.number().int().min(1).optional(),
  is_official: z.boolean().optional(),
  description: z.string().optional(),
  requires_approval: z.boolean().optional(),
  prize_pool: z.string().max(100).optional(),
  registration_closes_at: z.string().datetime().optional(),
});

export type CreateTournament = z.infer<typeof createTournamentSchema>;
export type UpdateTournament = z.infer<typeof updateTournamentSchema>;

export type TournamentRow = CreateTournament & {
  id: string;
  recurrence_id: string | null;
  created_at: string;
  updated_at: string;
};
