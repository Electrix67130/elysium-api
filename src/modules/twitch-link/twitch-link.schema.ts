import { z } from 'zod';

export const createTwitchLinkSchema = z.object({
  user_id: z.string().uuid(),
  twitch_id: z.string().min(1).max(100),
  twitch_username: z.string().max(100).optional(),
  display_name: z.string().max(100).optional(),
  is_live: z.boolean().default(false).optional(),
  viewer_count: z.number().int().min(0).default(0).optional(),
  stream_title: z.string().max(500).optional(),
  thumbnail_url: z.string().url().max(500).optional(),
});

export const updateTwitchLinkSchema = z.object({
  twitch_username: z.string().max(100).optional(),
  display_name: z.string().max(100).optional(),
  is_live: z.boolean().optional(),
  viewer_count: z.number().int().min(0).optional(),
  stream_title: z.string().max(500).optional(),
  thumbnail_url: z.string().url().max(500).optional(),
});

export type CreateTwitchLink = z.infer<typeof createTwitchLinkSchema>;
export type UpdateTwitchLink = z.infer<typeof updateTwitchLinkSchema>;

export type TwitchLinkRow = CreateTwitchLink & {
  id: string;
  created_at: string;
  updated_at: string;
  linked_at: string;
};
