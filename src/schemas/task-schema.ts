import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.number().int().optional(),
  dueDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const ResponseTaskSchema = TaskSchema.omit({
  dueDate: true,
}).extend({ dueDate: z.date() });
