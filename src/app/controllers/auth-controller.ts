import { FastifyInstance, FastifySchemaCompiler } from 'fastify';
import { HttpError } from '../../errors/http-error';

export class AuthController {
  static bcrypt = require('bcrypt');
  public static async login(
    fastify: FastifyInstance,
    email: string,
    password: string
  ) {
    const user = await fastify.prisma.user.findFirst({
      where: { email: email },
    });
    if (!user || !user.passwordHash) {
      throw new HttpError('invalid email or password', 403);
    }
    const isPasswordValid = await AuthController.bcrypt.compare(
      password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new HttpError('invalid email or password', 401);
    }
    return fastify.jwt.sign({
      email,
      passwordhash: user.passwordHash,
    });
  }
}
