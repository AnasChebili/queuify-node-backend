import Queue from 'bull';

export const taskQueue = new Queue('task-queue', {
  redis: {
    host: 'redis-16862.c55.eu-central-1-1.ec2.redns.redis-cloud.com',
    port: 16862,
    username: 'default',
    password: '9YpzEEJh8W4XpZui23JjnTnOCxSPKxEc',
  },
});

taskQueue.on('failed', (job, error) => {
  console.log(`task ${job.id} (${job.data.taskType}) failed:`, error);
});

taskQueue.on('completed', (job, result) => {
  console.log(`task ${job.id} (${job.data.taskType}) completed:`, result);
});
