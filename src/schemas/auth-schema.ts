import { z } from 'zod';

export const UserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
