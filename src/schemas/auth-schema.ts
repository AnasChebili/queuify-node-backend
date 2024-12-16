import { string, z } from 'zod';

export const UserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UserResponseSchema = z.object({
  email: z.string(),
  id: z.string(),
  createdAt: z.date(),
  passwordHash: z.string(),
});
