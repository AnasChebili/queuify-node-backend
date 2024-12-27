import Queue from 'bull';
import { taskQueue } from 'src/queues/task-queue';

async function processTask(job: Queue.Job) {
  const { taskType, config } = job.data;

  console.log(`Starting ${taskType} at ${new Date().toISOString()}`);

  for (let i = 0; i < config.steps.length; i++) {
    const step = config.steps[i];
    job.progress(Math.round((i / config.steps.length) * 100));
    console.log(`${taskType}: ${step}`);
    await new Promise((resolve) =>
      setTimeout(resolve, config.duration / config.steps.length)
    );
  }

  return {
    completed: true,
    taskType,
    finishedAt: new Date().toISOString(),
  };
}

taskQueue.process(processTask);
