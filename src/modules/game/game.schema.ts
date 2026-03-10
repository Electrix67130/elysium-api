import { z } from 'zod';

export const createGameSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50),
  image_url: z.string().url().max(500).optional(),
  icon_url: z.string().url().max(500).optional(),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateGameSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).optional(),
  image_url: z.string().url().max(500).optional(),
  icon_url: z.string().url().max(500).optional(),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type CreateGame = z.infer<typeof createGameSchema>;
export type UpdateGame = z.infer<typeof updateGameSchema>;

export type GameRow = CreateGame & {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};
