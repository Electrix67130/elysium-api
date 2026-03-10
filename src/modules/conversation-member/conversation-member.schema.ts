import { z } from 'zod';

export const createConversationMemberSchema = z.object({
  user_id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  is_pinned: z.boolean().default(false).optional(),
  is_muted: z.boolean().default(false).optional(),
});

export const updateConversationMemberSchema = z.object({
  is_pinned: z.boolean().optional(),
  is_muted: z.boolean().optional(),
  unread_count: z.number().int().min(0).optional(),
});

export type CreateConversationMember = z.infer<typeof createConversationMemberSchema>;
export type UpdateConversationMember = z.infer<typeof updateConversationMemberSchema>;

export type ConversationMemberRow = CreateConversationMember & {
  id: string;
  created_at: string;
  updated_at: string;
  joined_at: string;
};
