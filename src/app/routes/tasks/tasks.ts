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
        querystring: z.object({
          page: z
            .string()
            .regex(/^\d+$/, 'Must be a positive integer')
            .default('1')
            .transform(Number),
          limit: z
            .string()
            .regex(/^\d+$/, 'Must be a positive integer')
            .default('10')
            .transform(Number),
        }),
        response: {
          200: z.object({
            status: z.literal('success'),
            data: ResponseTaskSchema.array(),
            metadata: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    async function (request, reply) {
      const { page, limit } = request.query;

      const tasks = await TaskController.getTasks(fastify, page, limit);
      const total = await TaskController.getCount(fastify);
      const totalPages = Math.ceil(total / limit);

      reply.header('Cache-Control', 'no-store');

      return {
        status: 'success' as const,
        data: ResponseTaskSchema.array().parse(tasks),
        metadata: {
          total,
          page,
          limit,
          totalPages,
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
    async function (request, reply) {
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
    async function (request, reply) {
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
    async function (request, reply) {
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
    async function (request, reply) {
      const task = await TaskController.deleteTask(fastify, request.params.id);

      reply.header('Cache-Control', 'no-store');

      return {
        status: 'success' as const,
        data: ResponseTaskSchema.parse(task),
      };
    }
  );
}
