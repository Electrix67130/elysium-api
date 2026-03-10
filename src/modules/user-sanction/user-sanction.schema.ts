import { z } from 'zod';

export const createUserSanctionSchema = z.object({
  user_id: z.string().uuid(),
  issued_by: z.string().uuid(),
  type: z.enum(['warning', 'ban']),
  scope: z.enum(['platform', 'tournament', 'chat']),
  reason: z.string().optional(),
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateUserSanctionSchema = z.object({
  reason: z.string().optional(),
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().optional(),
});

export type CreateUserSanction = z.infer<typeof createUserSanctionSchema>;
export type UpdateUserSanction = z.infer<typeof updateUserSanctionSchema>;

export type UserSanctionRow = CreateUserSanction & {
  id: string;
  created_at: string;
  updated_at: string;
};
