import { Prisma } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { TaskController } from '../../controllers/task-controller';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  CreateTaskSchema,
  ResponseTaskSchema,
  TaskSchema,
  UpdateTaskSchema,
} from '../../../schemas/task-schema';
import { z } from 'zod';

export default async function (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        response: {
          200: z.object({
            status: z.literal('success'),
            data: ResponseTaskSchema.array(),
            metadata: z.object({ total: z.number() }),
          }),
        },
      },
    },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const tasks = await TaskController.getTasks(fastify);
      const total = tasks.length;

      reply.header('Cache-Control', 'no-store');

      return {
        status: 'success',
        data: ResponseTaskSchema.array().parse(tasks),
        metadata: {
          total,
        },
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: TaskSchema.shape.id,
        }),
        response: {
          200: z.object({
            status: z.literal('success'),
            data: ResponseTaskSchema,
          }),
        },
      },
    },
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
      }>,
      reply: FastifyReply
    ) {
      const task = await TaskController.getTaskById(fastify, request.params.id);

      reply.header('Cache-Control', 'no-store');

      return {
        status: 'success' as const,
        data: ResponseTaskSchema.parse(task),
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        body: CreateTaskSchema,
        response: {
          200: z.object({
            status: z.literal('success'),
            data: ResponseTaskSchema,
          }),
        },
      },
    },
    async function (
      request: FastifyRequest<{
        Body: Prisma.TaskCreateInput;
      }>,
      reply: FastifyReply
    ) {
      const task = await TaskController.addTask(fastify, request.body);

      reply.header('Cache-Control', 'no-store');

      return {
        status: 'success' as const,
        data: ResponseTaskSchema.parse(task),
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().put(
    '/:id',
    {
      schema: {
        params: z.object({
          id: TaskSchema.shape.id,
        }),
        body: UpdateTaskSchema,
        response: {
          200: z.object({
            status: z.literal('success'),
            data: ResponseTaskSchema,
          }),
        },
      },
    },
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
        Body: Prisma.TaskUpdateInput;
      }>,
      reply: FastifyReply
    ) {
      const task = await TaskController.updateTask(
        fastify,
        request.params.id,
        request.body
      );

      reply.header('Cache-Control', 'no-store');

      return {
        status: 'success' as const,
        data: ResponseTaskSchema.parse(task),
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        params: z.object({
          id: TaskSchema.shape.id,
        }),
        response: {
          200: z.object({
            status: z.literal('success'),
            data: ResponseTaskSchema,
          }),
        },
      },
    },
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
      }>,
      reply: FastifyReply
    ) {
      const task = await TaskController.deleteTask(fastify, request.params.id);

      reply.header('Cache-Control', 'no-store');

      return {
        status: 'success' as const,
        data: ResponseTaskSchema.parse(task),
      };
    }
  );
}
