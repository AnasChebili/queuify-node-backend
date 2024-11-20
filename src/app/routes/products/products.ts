import { Prisma } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { IParams, Product } from 'src/app/interfaces/products.interface';

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
      request: FastifyRequest<{ Params: IParams }>,
      reply: FastifyReply
    ) {
      const { id } = request.params;
      const client = await fastify.pg.connect();
      try {
        const { rows } = await client.query(
          'SELECT * FROM products WHERE id = $1',
          [id]
        );
        return rows;
      } catch (error) {
        console.log(error);
      } finally {
        client.release();
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
      const { title, description, price, brand, category, thumbnail } =
        request.body;
      const client = await fastify.pg.connect();
      try {
        const response = await client.query(
          'INSERT INTO products (title, description, price, brand, category, thumbnail) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [title, description, price, brand, category, thumbnail]
        );
        return response;
      } catch (error) {
        console.log(error);
      } finally {
        client.release();
      }
    }
  );

  fastify.put(
    '/:id',
    async function (
      request: FastifyRequest<{
        Params: IParams;
        Body: Prisma.productsUpdateInput;
      }>,
      reply: FastifyReply
    ) {
      const { id } = request.params;
      const { title, description, price, brand, category, thumbnail } =
        request.body;
      const client = await fastify.pg.connect();
      try {
        const response = await client.query(
          'UPDATE products SET title = $1, description = $2, price = $3, brand = $4, category = $5, thumbnail = $6 WHERE id = $7',
          [title, description, price, brand, category, thumbnail, id]
        );
        return response;
      } catch (error) {
        console.log(error);
      } finally {
        client.release();
      }
    }
  );

  fastify.delete(
    '/:id',
    async function (
      request: FastifyRequest<{ Params: IParams }>,
      reply: FastifyReply
    ) {
      const { id } = request.params;
      const client = await fastify.pg.connect();
      try {
        const response = await client.query(
          'DELETE FROM products WHERE id = $1',
          [id]
        );
        return response;
      } catch (error) {
        console.log(error);
      } finally {
        client.release();
      }
    }
  );
}
