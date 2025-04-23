import Fastify, { fastify, FastifyError, FastifyInstance } from 'fastify';
import { app } from './app/app';
import { PrismaClient } from '@prisma/client';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { ValidationError } from './errors/validation-error';
import { NotFoundError } from './errors/not-found-error';
import { ServerError } from './errors/server-error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  mapPrismaErrortoErrorMessage,
  mapZodIssuesToErrorMessages,
} from './lib/error-handling';
import { env } from 'process';
import { HttpError } from '@fastify/sensible';
import { boolean, ZodError } from 'zod';
import { JWT } from '@fastify/jwt';
import { UnauthorizedError } from './errors/unauthorized-error';
import fastifyRedis from '@fastify/redis';

import './worker';
import fastifyWebsocket from '@fastify/websocket';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

server.register(require('@fastify/cors'), {
  origin: 'http://127.0.0.1:5173',
  credentials: true, // Enables `Access-Control-Allow-Credentials`
  optionsSuccessStatus: 200, // Sets a successful status for preflight requests
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
    jwt: JWT;
    googleOAuth2: import('@fastify/oauth2').OAuth2Namespace;
  }
}

// Graceful shutdown
server.addHook('onClose', async (instance) => {
  await instance.prisma.$disconnect();
});

const jwt = require('@fastify/jwt');

server.register(jwt, { secret: process.env.JWT_SECRET });
server.register(fastifyWebsocket);

const oauthPlugin = require('@fastify/oauth2');

server.register(oauthPlugin, {
  name: 'googleOAuth2',
  scope: ['openid', 'profile', 'email'],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    auth: oauthPlugin.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: '/auth/google',
  callbackUri: `${process.env.BASE_URL}/auth/google/callback`,
});

server.register(fastifyRedis, {
  host: 'redis-11692.c240.us-east-1-3.ec2.redns.redis-cloud.com',
  port: 11692,
  username: 'default',
  password: process.env.REDIS_PASSWORD,
});

// Register your application as a normal plugin.
server.register(app);

server.setErrorHandler((fastifyError, request, reply) => {
  let error: FastifyError | ValidationError | NotFoundError | ServerError =
    fastifyError;

  if (isResponseSerializationError(error))
    error = new ServerError('Response Schema Parsing failed');

  if (error instanceof ZodError) {
    error = new ValidationError(
      'Bad Request',
      mapZodIssuesToErrorMessages(error.errors)
    );
  }

  if (error instanceof PrismaClientKnownRequestError) {
    const message = mapPrismaErrortoErrorMessage(error).message;
    if (message == 'Record Not Found') error = new NotFoundError(message);
  }

  let res: any = {
    name: 'Error',
    message: 'something went wrong',
    stack: env.NODE_ENV === 'development' ? error.stack : undefined,
  };

  if (error instanceof ServerError) {
    res = {
      name: error.name,
      message: error.message,
      stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  } else if (error instanceof NotFoundError) {
    res = {
      name: error.name,
      Message: error.message,
      stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  } else if (error instanceof ValidationError) {
    res = {
      name: error.name,
      Message: error.message,
      details: error.details,
      stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  } else if (error instanceof UnauthorizedError) {
    res = {
      name: error.name,
      Message: error.message,
      stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  return reply.code((error as HttpError).statusCode || 500).send(res);
});

// Start listening.
server.listen({ port, host }, async (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
