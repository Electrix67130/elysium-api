import { z } from 'zod';

export const createChatMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string().min(1),
  sender_tag: z.string().max(50).optional(),
  sender_tag_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateChatMessageSchema = z.object({
  content: z.string().min(1).optional(),
});

export type CreateChatMessage = z.infer<typeof createChatMessageSchema>;
export type UpdateChatMessage = z.infer<typeof updateChatMessageSchema>;

export type ChatMessageRow = CreateChatMessage & {
  id: string;
  timestamp: string;
  created_at: string;
};
