import Fastify from 'fastify';
import { app } from './app/app';
import { PrismaClient } from '@prisma/client';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Create Prisma instance
const prisma = new PrismaClient();

// Add Prisma to Fastify instance
server.decorate('prisma', prisma);

// Declare Prisma type for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Graceful shutdown
server.addHook('onClose', async (instance) => {
  await instance.prisma.$disconnect();
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
