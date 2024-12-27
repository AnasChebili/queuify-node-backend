import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { taskQueue } from 'src/queues/task-queue';
import { z } from 'zod';

export default async function (fastify: FastifyInstance) {
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

      const taskConfigs = {
        'database-backup': {
          duration: 5000, // 5 seconds
          steps: [
            'Preparing backup',
            'Compressing data',
            'Uploading to storage',
          ],
        },
        'report-generation': {
          duration: 8000, // 8 seconds
          steps: [
            'Fetching data',
            'Processing statistics',
            'Formatting report',
          ],
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
}
