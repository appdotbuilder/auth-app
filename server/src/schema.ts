
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Public user schema (without password hash)
export const publicUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PublicUser = z.infer<typeof publicUserSchema>;

// Registration input schema
export const registerInputSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

// Login input schema
export const loginInputSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Authentication response schema
export const authResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: publicUserSchema.optional()
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
