import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { HttpError } from '../../../errors/http-error';
import {
  UserRequestSchema,
  UserResponseSchema,
} from '../../../schemas/auth-schema';
import { ValidationError } from '../../../errors/validation-error';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const bcrypt = require('bcrypt');

export default async function (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      schema: {
        body: UserRequestSchema,
        response: {
          200: z.object({ status: z.literal('success'), data: z.string() }),
        },
      },
    },
    async function (request, response) {
      const { email, password } = request.body;
      const user = await fastify.prisma.user.findFirst({
        where: { email: email },
      });
      if (!user || !user.passwordHash) {
        throw new HttpError('invalid email or password', 403);
      }
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new HttpError('invalid email or password', 401);
      }
      const token = fastify.jwt.sign({
        email,
        passwordhash: user.passwordHash,
      });
      return { status: 'success' as const, data: token };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      schema: {
        body: UserRequestSchema,
        response: {
          200: z.object({ status: z.literal('success'), data: z.string() }),
        },
      },
    },
    async function (request, reply) {
      const { email, password } = request.body;
      const isUser = await fastify.prisma.user.findFirst({
        where: { email: email },
      });
      if (isUser) {
        throw new ValidationError('email already in use', {
          email: 'email already exists',
        });
      }
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      const user = await fastify.prisma.user.create({
        data: { email: email, passwordHash: passwordHash },
      });
      const token = fastify.jwt.sign({
        email,
        passwordHash: passwordHash,
      });

      return { status: 'success' as const, data: token };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/verify',
    {
      schema: {
        headers: z.object({ authorization: z.string() }),
        response: {
          200: z.object({
            status: z.literal('success'),
            data: UserResponseSchema,
          }),
        },
      },
    },
    async function (request, reply) {
      try {
        await request.jwtVerify();

        const { email, passwordHash } = request.user as {
          email: string;
          passwordHash: string;
        };

        const user = await fastify.prisma.user.findFirstOrThrow({
          where: { email: email },
        });
        return {
          status: 'success' as const,
          data: UserResponseSchema.parse(user),
        };
      } catch (err) {
        throw new HttpError('Unauthorized', 401);
      }
    }
  );
}
