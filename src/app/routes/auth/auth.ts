import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  UserRequestSchema,
  UserResponseSchema,
} from '../../../schemas/auth-schema';
import { z } from 'zod';
import { AuthController } from '../../controllers/auth-controller';

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
    async function (request, reply) {
      const { email, password } = request.body;
      const token = await AuthController.login(fastify, email, password);
      reply.header('Cache-Control', 'no-store');
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
      const token = await AuthController.register(fastify, email, password);
      reply.header('Cache-Control', 'no-store');
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
      const { id } = await AuthController.verify(request);
      const user = await fastify.prisma.user.findFirstOrThrow({
        where: { id },
      });
      reply.header('Cache-Control', 'no-store');
      return {
        status: 'success' as const,
        data: UserResponseSchema.parse(user),
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/google/callback',
    {
      schema: {
        response: {
          200: z.object({ status: z.literal('success'), data: z.string() }),
        },
      },
    },
    async function (request, reply) {
      const returnToken = await AuthController.OAuthLoginRegister(
        fastify,
        request
      );
      return {
        status: 'success' as const,
        data: returnToken,
      };
    }
  );
}
