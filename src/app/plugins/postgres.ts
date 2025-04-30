import fastifyPostgres from '@fastify/postgres';
import 'dotenv/config';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
/**
 * This plugins adds some utilities to handle @fastify/postgres
 *
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyPostgres, {
    connectionString: process.env.DATABASE_URL,
  });
});
