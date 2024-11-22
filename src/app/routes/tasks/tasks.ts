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
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';

const paramsJsonSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        response: { 200: ResponseTaskSchema.array() },
      },
    },
    async function (request: FastifyRequest, reply: FastifyReply) {
      return ResponseTaskSchema.array().parse(
        await TaskController.getTasks(fastify)
      );
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: TaskSchema.shape.id,
        }),
        response: { 200: ResponseTaskSchema },
      },
    },
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
      }>,
      reply: FastifyReply
    ) {
      return ResponseTaskSchema.parse(
        await TaskController.getTaskById(fastify, request.params.id)
      );
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/add',
    {
      schema: {
        body: CreateTaskSchema,
        response: { 200: ResponseTaskSchema },
      },
    },
    async function (
      request: FastifyRequest<{
        Body: Prisma.TaskCreateInput;
      }>,
      reply: FastifyReply
    ) {
      return ResponseTaskSchema.parse(
        await TaskController.addTask(fastify, request.body)
      );
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
        response: { 200: ResponseTaskSchema },
      },
    },
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
        Body: Prisma.TaskUpdateInput;
      }>,
      reply: FastifyReply
    ) {
      return ResponseTaskSchema.parse(
        await TaskController.updateTask(
          fastify,
          request.params.id,
          request.body
        )
      );
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        params: z.object({
          id: TaskSchema.shape.id,
        }),
        response: { 200: ResponseTaskSchema },
      },
    },
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
      }>,
      reply: FastifyReply
    ) {
      return ResponseTaskSchema.parse(
        await TaskController.deleteTask(fastify, request.params.id)
      );
    }
  );
}
