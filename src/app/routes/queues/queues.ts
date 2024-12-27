import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { request } from 'http';
import { taskQueue } from 'src/queues/task-queue';
import { z } from 'zod';

export default async function (fastify: FastifyInstance) {
  const taskConfigs = {
    'database-backup': {
      duration: 5000, // 5 seconds
      steps: ['Preparing backup', 'Compressing data', 'Uploading to storage'],
    },
    'report-generation': {
      duration: 8000, // 8 seconds
      steps: ['Fetching data', 'Processing statistics', 'Formatting report'],
    },
    'data-cleanup': {
      duration: 3000, // 3 seconds
      steps: [
        'Scanning old records',
        'Removing expired data',
        'Optimizing storage',
      ],
    },
  };
  fastify.withTypeProvider<ZodTypeProvider>().post(
    'schedule-task',
    {
      schema: {
        body: z.object({
          taskType: z.enum([
            'database-backup',
            'report-generation',
            'data-cleanup',
          ]),
          scheduledFor: z.number().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            jobId: z.any(),
            taskType: z.enum([
              'database-backup',
              'report-generation',
              'data-cleanup',
            ]),
            scheduledFor: z.union([z.number(), z.string()]),
          }),
        },
      },
    },
    async (request, reply) => {
      const { taskType, scheduledFor } = request.body;

      const config = taskConfigs[taskType];

      const job = await taskQueue.add(
        { taskType, config },
        {
          delay: scheduledFor
            ? new Date(scheduledFor).getTime() - Date.now()
            : 0,
          attempts: 2,
          removeOnComplete: false,
        }
      );

      return {
        message: 'Task scheduled successfully',
        jobId: job.id,
        taskType,
        scheduledFor: scheduledFor || 'immediate',
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/schedule-recurring',
    {
      schema: {
        body: z.object({
          taskType: z.enum([
            'database-backup',
            'report-generation',
            'data-cleanup',
          ]),
        }),
        response: {
          200: z.object({
            message: z.string(),
            jobId: z.any(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { taskType } = request.body;

      const config = taskConfigs[taskType];

      const job = await taskQueue.add(
        { taskType, config },
        {
          repeat: {
            cron: '0 * * * *', // every hour
          },
        }
      );

      return {
        message: 'Recurring task scheduled successfully',
        jobId: job.id,
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/scheduled-tasks',
    {
      schema: {
        response: {
          200: z
            .object({
              id: z.any(),
              taskType: z.any(),
              status: z.any(),
              scheduledFor: z.union([z.string(), z.date()]),
            })
            .array(),
        },
      },
    },
    async (request, reply) => {
      const jobs = await taskQueue.getJobs(['active', 'waiting', 'delayed']);

      return Promise.all(
        jobs.map(async (job) => ({
          id: job.id,
          taskType: job.data.type,
          status: await job.getState(),
          scheduledFor: job.opts.delay
            ? new Date(Date.now() + job.opts.delay)
            : 'immediate',
        }))
      );
    }
  );
}
