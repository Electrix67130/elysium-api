import { z } from 'zod';

export const createFriendshipSchema = z.object({
  sender_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
});

export const updateFriendshipSchema = z.object({
  status: z.enum(['pending', 'accepted']),
});

export type CreateFriendship = z.infer<typeof createFriendshipSchema>;
export type UpdateFriendship = z.infer<typeof updateFriendshipSchema>;

export type FriendshipRow = CreateFriendship & {
  id: string;
  created_at: string;
  updated_at: string;
};
