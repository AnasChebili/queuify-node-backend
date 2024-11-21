import { Prisma } from '@prisma/client';
import { FastifyInstance } from 'fastify';

export class TaskController {
  public static async getTasks(fastify: FastifyInstance) {
    try {
      const tasks = await fastify.prisma.task.findMany();
      return tasks;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public static async getTaskById(
    fastify: FastifyInstance,
    id: Prisma.TaskUncheckedCreateInput['id']
  ) {
    try {
      const task = await fastify.prisma.task.findUnique({
        where: { id: id },
      });
      return task;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public static async addTask(
    fastify: FastifyInstance,
    task: Prisma.TaskCreateInput
  ) {
    try {
      const response = await fastify.prisma.task.create({
        data: task,
      });
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public static async updateTask(
    fastify: FastifyInstance,
    id: Prisma.TaskUncheckedCreateInput['id'],
    task: Prisma.TaskUpdateInput
  ) {
    try {
      const response = await fastify.prisma.task.update({
        where: { id },
        data: task,
      });
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public static async deleteTask(
    fastify: FastifyInstance,
    id: Prisma.TaskUncheckedCreateInput['id']
  ) {
    try {
      const response = await fastify.prisma.task.delete({
        where: { id },
      });
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
