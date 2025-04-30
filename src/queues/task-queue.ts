import Queue from 'bull';

export const taskQueue = new Queue('task-queue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
});

taskQueue.on('failed', (job, error) => {
  console.log(`task ${job.id} (${job.data.taskType}) failed:`, error);
});

taskQueue.on('completed', (job, result) => {
  console.log(`task ${job.id} (${job.data.taskType}) completed:`, result);
});
