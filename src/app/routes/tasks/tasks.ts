import { Prisma } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { TaskController } from '../../controllers/task-controller';

export default async function (fastify: FastifyInstance) {
  fastify.get(
    '/',
    async function (request: FastifyRequest, reply: FastifyReply) {
      return TaskController.getTasks(fastify);
    }
  );

  fastify.get(
    '/:id',
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
      }>,
      reply: FastifyReply
    ) {
      return TaskController.getTaskById(fastify, request.params.id);
    }
  );

  fastify.post(
    '/add',
    async function (
      request: FastifyRequest<{
        Body: Prisma.TaskCreateInput;
      }>,
      reply: FastifyReply
    ) {
      return TaskController.addTask(fastify, request.body);
    }
  );

  fastify.put(
    '/:id',
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
        Body: Prisma.TaskUpdateInput;
      }>,
      reply: FastifyReply
    ) {
      return TaskController.updateTask(
        fastify,
        request.params.id,
        request.body
      );
    }
  );

  fastify.delete(
    '/:id',
    async function (
      request: FastifyRequest<{
        Params: { id: Prisma.TaskUncheckedCreateInput['id'] };
      }>,
      reply: FastifyReply
    ) {
      return TaskController.deleteTask(fastify, request.params.id);
    }
  );
}
