import { z } from 'zod';

const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export default TaskSchema;
