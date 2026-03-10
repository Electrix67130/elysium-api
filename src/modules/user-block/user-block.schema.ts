import { z } from 'zod';

export const createUserBlockSchema = z.object({
  blocker_id: z.string().uuid(),
  blocked_id: z.string().uuid(),
});

export const updateUserBlockSchema = z.object({});

export type CreateUserBlock = z.infer<typeof createUserBlockSchema>;
export type UpdateUserBlock = z.infer<typeof updateUserBlockSchema>;

export type UserBlockRow = CreateUserBlock & {
  id: string;
  created_at: string;
  updated_at: string;
};
