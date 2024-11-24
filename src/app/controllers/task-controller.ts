import { Prisma } from '@prisma/client';
import { FastifyInstance } from 'fastify';

export class TaskController {
  public static async getTasks(fastify: FastifyInstance) {
    const tasks = await fastify.prisma.task.findMany();
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
}
