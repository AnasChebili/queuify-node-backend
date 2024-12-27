import { Prisma } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { ResponseTaskSchema } from '../../schemas/task-schema';

export class TaskController {
  public static async getTasks(
    fastify: FastifyInstance,
    page: number,
    limit: number
  ) {
    const key = `tasks:${page}:${limit}`;
    const ttl = 500;

    const cached = await fastify.redis.get(key);

    if (cached) {
      return ResponseTaskSchema.array().parse(JSON.parse(cached));
    }

    const tasks = await fastify.prisma.task.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    await fastify.redis.set(key, JSON.stringify(tasks), 'PX', ttl);
    return tasks;
  }

  public static async getTaskById(
    fastify: FastifyInstance,
    id: Prisma.TaskUncheckedCreateInput['id']
  ) {
    const task = await fastify.prisma.task.findUniqueOrThrow({
      where: { id: id },
    });
    return task;
  }

  public static async addTask(
    fastify: FastifyInstance,
    task: Prisma.TaskCreateInput
  ) {
    const response = await fastify.prisma.task.create({
      data: task,
    });
    return response;
  }

  public static async updateTask(
    fastify: FastifyInstance,
    id: Prisma.TaskUncheckedCreateInput['id'],
    task: Prisma.TaskUpdateInput
  ) {
    const response = await fastify.prisma.task.update({
      where: { id },
      data: task,
    });
    return response;
  }

  public static async deleteTask(
    fastify: FastifyInstance,
    id: Prisma.TaskUncheckedCreateInput['id']
  ) {
    const response = await fastify.prisma.task.delete({
      where: { id },
    });
    return response;
  }

  public static async getCount(fastify: FastifyInstance) {
    return await fastify.prisma.task.count();
  }
}
