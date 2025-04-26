import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { request } from 'http';
import { taskQueue } from '../../../queues/task-queue';
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
    '/schedule-task',
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
        { taskType, config, scheduledFor },
        {
          delay: scheduledFor ? scheduledFor - Date.now() : 0,
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
            taskType: z.enum([
              'database-backup',
              'report-generation',
              'data-cleanup',
            ]),
            scheduledFor: z.date(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { taskType } = request.body;

      const config = taskConfigs[taskType];

      const job = await taskQueue.add(
        {
          taskType,
          config,
          scheduledFor:
            Date.now() +
            60 * 60 * 1000 -
            new Date().getMinutes() * 60000 -
            new Date().getSeconds() * 1000,
          recurring: true,
        },

        {
          repeat: {
            cron: '0 * * * *', // every hour
          },
          jobId: `${taskType}:${Date.now()}`,
        }
      );

      return {
        message: 'Recurring task scheduled successfully',
        jobId: job.id,
        taskType,
        scheduledFor: new Date(Date.now()),
      };
    }
  );

  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get('/scheduled-tasks', {}, async (request, reply) => {
      const jobs = await taskQueue.getJobs([
        'active',
        'waiting',
        'delayed',
        'paused',
        'failed',
      ]);

      return Promise.all(
        jobs.map(async (job) => ({
          id: job.id,
          taskType: job.data.taskType,
          status: await job.getState(),
          scheduledFor: job.opts.delay
            ? new Date(job.data.scheduledFor)
            : 'immediate',
        }))
      );
    });
}
