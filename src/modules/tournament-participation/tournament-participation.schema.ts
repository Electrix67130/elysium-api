import { z } from 'zod';

export const createTournamentParticipationSchema = z.object({
  user_id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  team_id: z.string().uuid().optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled']).default('pending').optional(),
});

export const updateTournamentParticipationSchema = z.object({
  status: z.enum(['confirmed', 'pending', 'cancelled']),
});

export type CreateTournamentParticipation = z.infer<typeof createTournamentParticipationSchema>;
export type UpdateTournamentParticipation = z.infer<typeof updateTournamentParticipationSchema>;

export type TournamentParticipationRow = CreateTournamentParticipation & {
  id: string;
  created_at: string;
  updated_at: string;
  registered_at: string;
};
