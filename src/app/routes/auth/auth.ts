import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { HttpError } from '../../../errors/http-error';
import { UserRequestSchema } from '../../../schemas/auth-schema';

const bcrypt = require('bcrypt');

export default async function (fastify: FastifyInstance) {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post(
      'login',
      { schema: { body: UserRequestSchema } },
      async function (request, response) {
        const { email, password } = request.body;
        const user = await fastify.prisma.user.findFirst({
          where: { email: email },
        });
        if (!user || !user.passwordHash) {
          throw new HttpError('invalid email or password', 403);
        }
        const isPasswordValid = await bcrypt.compare(
          password,
          user.passwordHash
        );
        if (!isPasswordValid) {
          throw new HttpError('invalid email or password', 403);
        }
        const token = fastify.jwt.sign({
          email,
          passwordhash: user.passwordHash,
        });
        return token;
      }
    );
}
