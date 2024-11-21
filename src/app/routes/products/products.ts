import { Prisma } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get(
    '/',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const products = await fastify.prisma.products.findMany();
        return products;
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
        Params: { id: Prisma.productsUncheckedCreateInput['id'] };
      }>,
      reply: FastifyReply
    ) {
      const id = Number(request.params.id);
      try {
        const rows = await fastify.prisma.products.findUnique({
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
        Body: Prisma.productsCreateInput;
      }>,
      reply: FastifyReply
    ) {
      try {
        const response = await fastify.prisma.products.create({
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
        Params: { id: Prisma.productsUncheckedCreateInput['id'] };
        Body: Prisma.productsUpdateInput;
      }>,
      reply: FastifyReply
    ) {
      const id = Number(request.params.id);
      try {
        const response = await fastify.prisma.products.update({
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
        Params: { id: Prisma.productsUncheckedCreateInput['id'] };
      }>,
      reply: FastifyReply
    ) {
      const id = Number(request.params.id);
      try {
        const response = await fastify.prisma.products.delete({
          where: { id },
        });
        return response;
      } catch (error) {
        console.log(error);
      }
    }
  );
}
