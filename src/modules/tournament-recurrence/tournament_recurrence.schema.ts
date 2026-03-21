import { z } from 'zod';

export const RECURRENCE_TYPES = ['weekly', 'monthly'] as const;

export const createTournamentRecurrenceSchema = z.object({
  source_tournament_id: z.string().uuid(),
  recurrence_type: z.enum(RECURRENCE_TYPES),
  recurrence_end_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateTournamentRecurrenceSchema = z.object({
  recurrence_type: z.enum(RECURRENCE_TYPES).optional(),
  recurrence_end_at: z.string().datetime().nullable().optional(),
  is_active: z.boolean().optional(),
});

export type CreateTournamentRecurrence = z.infer<typeof createTournamentRecurrenceSchema>;
export type UpdateTournamentRecurrence = z.infer<typeof updateTournamentRecurrenceSchema>;

export type TournamentRecurrenceRow = CreateTournamentRecurrence & {
  id: string;
  created_at: string;
  updated_at: string;
};
