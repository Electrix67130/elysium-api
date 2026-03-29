import { z } from 'zod';

export const createMessageReactionSchema = z.object({
  message_id: z.string().uuid(),
  user_id: z.string().uuid(),
  emoji: z.string().min(1).max(10),
});

export const updateMessageReactionSchema = z.object({
  emoji: z.string().min(1).max(10).optional(),
});

export type CreateMessageReaction = z.infer<typeof createMessageReactionSchema>;
export type UpdateMessageReaction = z.infer<typeof updateMessageReactionSchema>;

export type MessageReactionRow = CreateMessageReaction & {
  id: string;
  created_at: string;
  updated_at: string;
};
