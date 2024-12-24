import { FastifyInstance, FastifyRequest } from 'fastify';
import { ValidationError } from '../../errors/validation-error';
import { UnauthorizedError } from '../../errors/unauthorized-error';

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
      throw new UnauthorizedError('invalid email or password');
    }
    const isPasswordValid = await AuthController.bcrypt.compare(
      password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('invalid email or password');
    }
    return fastify.jwt.sign({
      email,
      passwordhash: user.passwordHash,
    });
  }
  public static async register(
    fastify: FastifyInstance,
    email: string,
    password: string
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
    const passwordHash = await AuthController.bcrypt.hash(password, saltRounds);
    const user = await fastify.prisma.user.create({
      data: { email: email, passwordHash: passwordHash },
    });
    return fastify.jwt.sign({
      email,
      passwordHash: passwordHash,
    });
  }

  public static async verify(
    fastify: FastifyInstance,
    request: FastifyRequest
  ) {
    try {
      await request.jwtVerify();
      return request.user as {
        email: string;
        passwordHash: string;
      };
    } catch (err) {
      throw new UnauthorizedError('Unauthorized');
    }
  }
}
