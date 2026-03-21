import { z } from 'zod';

export const CONVERSATION_TYPES = ['dm', 'group', 'team', 'tournament'] as const;

export const createConversationSchema = z.object({
  name: z.string().max(100).optional(),
  type: z.enum(CONVERSATION_TYPES),
  team_id: z.string().uuid().optional(),
  tournament_id: z.string().uuid().optional(),
});

export const updateConversationSchema = z.object({
  name: z.string().max(100).optional(),
});

// Schemas dedies pour les routes custom de creation
export const createDmSchema = z.object({
  user_id_1: z.string().uuid(),
  user_id_2: z.string().uuid(),
}).refine((data) => data.user_id_1 !== data.user_id_2, {
  message: 'A DM conversation requires two different users',
});

export const createTeamConversationSchema = z.object({
  team_id: z.string().uuid(),
  name: z.string().max(100).optional(),
});

export const createTournamentConversationSchema = z.object({
  tournament_id: z.string().uuid(),
  name: z.string().max(100).optional(),
});

export type CreateConversation = z.infer<typeof createConversationSchema>;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;

export type ConversationRow = CreateConversation & {
  id: string;
  tournament_id: string | null;
  created_at: string;
  updated_at: string;
};
