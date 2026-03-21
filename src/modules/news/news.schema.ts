import { z } from 'zod';

export const NEWS_CATEGORIES = ['update', 'tournament', 'community', 'esport'] as const;

export const createNewsSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  content: z.string().min(1),
  image_url: z.string().url().max(500).optional(),
  category: z.enum(NEWS_CATEGORIES),
  author_id: z.string().uuid(),
  published_at: z.string().datetime().optional(),
});

export const updateNewsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  image_url: z.string().url().max(500).nullable().optional(),
  category: z.enum(NEWS_CATEGORIES).optional(),
  published_at: z.string().datetime().optional(),
});

export type CreateNews = z.infer<typeof createNewsSchema>;
export type UpdateNews = z.infer<typeof updateNewsSchema>;

export type NewsRow = CreateNews & {
  id: string;
  created_at: string;
  updated_at: string;
};
