import { z } from 'zod';

export const createConversationSchema = z.object({
  name: z.string().max(100).optional(),
  type: z.enum(['dm', 'group', 'team']),
  team_id: z.string().uuid().optional(),
});

export const updateConversationSchema = z.object({
  name: z.string().max(100).optional(),
});

export type CreateConversation = z.infer<typeof createConversationSchema>;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;

export type ConversationRow = CreateConversation & {
  id: string;
  created_at: string;
  updated_at: string;
};
