const { z } = require('zod');

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(255),
  password_hash: z.string().min(1),
  display_name: z.string().max(100).optional(),
  avatar_url: z.string().url().max(500).optional(),
  country: z.string().length(2).optional(),
  bio: z.string().optional(),
  is_official: z.boolean().optional().default(false),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().max(255).optional(),
  display_name: z.string().max(100).optional(),
  avatar_url: z.string().url().max(500).optional(),
  country: z.string().length(2).optional(),
  bio: z.string().optional(),
  is_official: z.boolean().optional(),
  status_text: z.string().max(255).optional(),
});

module.exports = { createUserSchema, updateUserSchema };
