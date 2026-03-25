import { z } from 'zod';

export const createFriendshipSchema = z.object({
  receiver_id: z.string().uuid(),
});

export const updateFriendshipSchema = z.object({
  status: z.enum(['pending', 'accepted']),
});

export type CreateFriendship = z.infer<typeof createFriendshipSchema>;
export type UpdateFriendship = z.infer<typeof updateFriendshipSchema>;

export type FriendshipRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  updated_at: string;
};
