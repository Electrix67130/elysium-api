import { z } from 'zod';

export const createPlayerStatsSchema = z.object({
  user_id: z.string().uuid(),
  game_id: z.string().uuid(),
  wins: z.number().int().min(0).default(0).optional(),
  losses: z.number().int().min(0).default(0).optional(),
  win_rate: z.number().min(0).max(100).default(0).optional(),
  total_matches: z.number().int().min(0).default(0).optional(),
  tournaments_played: z.number().int().min(0).default(0).optional(),
  tournaments_won: z.number().int().min(0).default(0).optional(),
});

export const updatePlayerStatsSchema = z.object({
  wins: z.number().int().min(0).optional(),
  losses: z.number().int().min(0).optional(),
  win_rate: z.number().min(0).max(100).optional(),
  total_matches: z.number().int().min(0).optional(),
  tournaments_played: z.number().int().min(0).optional(),
  tournaments_won: z.number().int().min(0).optional(),
});

export type CreatePlayerStats = z.infer<typeof createPlayerStatsSchema>;
export type UpdatePlayerStats = z.infer<typeof updatePlayerStatsSchema>;

export type PlayerStatsRow = CreatePlayerStats & {
  id: string;
  created_at: string;
  updated_at: string;
};
