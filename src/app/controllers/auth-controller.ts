import { FastifyInstance, FastifyRequest } from 'fastify';
import { HttpError } from '../../errors/http-error';
import { ValidationError } from '../../errors/validation-error';

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

  public static verify(fastify: FastifyInstance, request: FastifyRequest) {
    try {
      request.jwtVerify();
    } catch (err) {
      throw new HttpError('Unauthorized', 401);
    }
  }
}
