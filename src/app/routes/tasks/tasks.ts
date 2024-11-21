import { Prisma } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get(
    '/',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const tasks = await fastify.prisma.task.findMany();
        return tasks;
      } catch (error) {
        console.log(error);
        throw error;
      }
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
      const id = request.params.id;
      try {
        const rows = await fastify.prisma.task.findUnique({
          where: { id: id },
        });
        return rows;
      } catch (error) {
        console.log(error);
      }
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
      try {
        const response = await fastify.prisma.task.create({
          data: request.body,
        });
        return response;
      } catch (error) {
        console.log(error);
      }
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
      const id = request.params.id;
      try {
        const response = await fastify.prisma.task.update({
          where: { id },
          data: request.body,
        });
        return response;
      } catch (error) {
        console.log(error);
      }
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
      const id = request.params.id;
      try {
        const response = await fastify.prisma.task.delete({
          where: { id },
        });
        return response;
      } catch (error) {
        console.log(error);
      }
    }
  );
}
