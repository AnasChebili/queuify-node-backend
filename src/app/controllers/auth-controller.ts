import { FastifyInstance, FastifyRequest } from 'fastify';
import { ValidationError } from '../../errors/validation-error';
import { UnauthorizedError } from '../../errors/unauthorized-error';

export class AuthController {
  static bcrypt = require('bcrypt');
  public static async login(
    fastify: FastifyInstance,
    email: string,
    password?: string
  ) {
    const user = await fastify.prisma.user.findFirst({
      where: { email: email },
    });
    if (!user) {
      throw new UnauthorizedError('invalid email or password');
    }
    if (password) {
      const isPasswordValid = await AuthController.bcrypt.compare(
        password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        throw new UnauthorizedError('invalid email or password');
      }
    }

    return fastify.jwt.sign({
      id: user.id,
    });
  }
  public static async register(
    fastify: FastifyInstance,
    email: string,
    password?: string,
    sub?: string,
    provider?: string
  ) {
    const isUser = await fastify.prisma.user.findFirst({
      where: { email: email },
    });
    if (isUser) {
      throw new ValidationError('email already in use', {
        email: 'email already exists',
      });
    }
    const saltRounds = 10;

    const passwordHash =
      password && (await AuthController.bcrypt.hash(password, saltRounds));

    const user = await fastify.prisma.user.create({
      data: { email, passwordHash, sub, provider },
    });

    return fastify.jwt.sign({
      id: user.id,
    });
  }

  public static async verify(request: FastifyRequest) {
    try {
      await request.jwtVerify();
      return request.user as {
        id: string;
      };
    } catch (err) {
      throw new UnauthorizedError('Unauthorized');
    }
  }
}
