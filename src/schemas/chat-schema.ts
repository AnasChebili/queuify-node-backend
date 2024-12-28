import { z } from 'zod';

export const ChatMessageSchema = z.object({
  type: z.enum(['message', 'join', 'leave']),
  username: z.string(),
  content: z.string().optional(),
  timestamp: z.string(),
});
