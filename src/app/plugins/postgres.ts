import fastifyPostgres from '@fastify/postgres';
import 'dotenv/config';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
/**
 * This plugins adds some utilities to handle @fastify/postgres
 *
 */

//this is no longer needed.

/* export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyPostgres, {
    connectionString: `postgres://${process.env.MASTER_USERNAME}:${process.env.MASTER_PASSWORD}@${process.env.MASTER_ENDPOINT}:${process.env.MASTER_PORT}/${process.env.PRODUCTION_DB}`,
  });
}); */
