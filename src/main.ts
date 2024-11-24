import Fastify, { FastifyError } from 'fastify';
import { app } from './app/app';
import { PrismaClient } from '@prisma/client';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { ValidationError } from './errors/validation-error';
import { NotFoundError } from './errors/not-found-error';
import { ServerError } from './errors/server-error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

server.setErrorHandler((fastifyError, request, reply) => {
  let error: FastifyError | ValidationError | NotFoundError | ServerError =
    fastifyError;

  /*   if (error instanceof PrismaClientKnownRequestError)
    error = new ValidationError('Bad Request', {}); */

  // Default values for unknown errors
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

  // Handle Fastify validation errors
  if (error.validation) {
    statusCode = 400;
    message = error.message;
    status = 'fail';
  }

  // Handle specific Node.js errors
  if (error.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service Unavailable';
    status = 'error';
  }

  // Log error for debugging (customize as needed)
  console.error({
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
    errorMessage: error.message,
    stack: error.stack,
  });

  // Send response
  reply.code(statusCode).send({
    error,
    status,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
