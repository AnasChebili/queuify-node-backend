import Queue from 'bull';

export const taskQueue = new Queue('task-queue', {
  redis: {
    host: 'redis-11692.c240.us-east-1-3.ec2.redns.redis-cloud.com',
    port: 11692,
    username: 'default',
    password: process.env.REDIS_PASSWORD,
  },
});

taskQueue.on('failed', (job, error) => {
  console.log(`task ${job.id} (${job.data.taskType}) failed:`, error);
});

taskQueue.on('completed', (job, result) => {
  console.log(`task ${job.id} (${job.data.taskType}) completed:`, result);
});
