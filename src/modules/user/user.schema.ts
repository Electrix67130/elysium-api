import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(255),
  password_hash: z.string().min(1),
  display_name: z.string().max(100).optional(),
  avatar_url: z.string().url().max(500).optional(),
  country: z.string().length(2).optional(),
  bio: z.string().optional(),
  is_official: z.boolean().optional().default(false),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().max(255).optional(),
  display_name: z.string().max(100).optional(),
  avatar_url: z.string().url().max(500).optional(),
  country: z.string().length(2).optional(),
  bio: z.string().optional(),
  is_official: z.boolean().optional(),
  status_text: z.string().max(255).optional(),
});

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type UserRow = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name?: string;
  avatar_url?: string;
  country?: string;
  bio?: string;
  is_official: boolean;
  status_text?: string;
  is_online?: boolean;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
};
