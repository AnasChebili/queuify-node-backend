import Queue from 'bull';
import { taskQueue } from '../queues/task-queue';

async function processTask(job: Queue.Job) {
  const { taskType, config, recurring } = job.data;

  console.log(`Starting ${taskType} at ${new Date().toISOString()}`);

  for (let i = 0; i < config.steps.length; i++) {
    const step = config.steps[i];
    job.progress(Math.round((i / config.steps.length) * 100));
    console.log(`${taskType}: ${step}`);
    await new Promise((resolve) =>
      setTimeout(resolve, config.duration / config.steps.length)
    );
  }
  console.log('===============', recurring);

  console.log('==============', job.data.scheduledFor);

  if (recurring) {
    job.data.scheduledFor = job.data.scheduledFor + 60 * 60 * 1000;
    await taskQueue.removeRepeatableByKey(job.opts.repeat?.key as string);
    await taskQueue.add(job.data, { repeat: { cron: '* * * * *' } });
  }
  console.log('============', job.name);

  console.log('==============', job.data.scheduledFor);

  return {
    completed: true,
    taskType,
    finishedAt: new Date().toISOString(),
  };
}
taskQueue.process(processTask);
