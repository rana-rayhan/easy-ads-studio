// AI worker: takes AI jobs from the "ai_job" queue and asks Ollama (free local AI).
// Start it with: npm run ai-worker   (Ollama must be running: ollama serve)
import { connectRedis, closeRedis } from "./database/RedisClient";
import { getChannel, closeRabbit } from "./database/RabbitClient";
import { AI_JOB_QUEUE } from "./controllers/AiController";
import AiJobService from "./services/jobs/AiJobService";

const start = async () => {
  await connectRedis();
  const ch = await getChannel();
  await ch.assertQueue(AI_JOB_QUEUE, { durable: true });

  // One job at a time: the AI model runs on this computer and can only think about one thing well at once
  await ch.prefetch(1);
  console.log("***--- AI worker waiting for jobs");

  await ch.consume(AI_JOB_QUEUE, async (msg) => {
    if (!msg) return;

    const { jobId, type, input } = JSON.parse(msg.content.toString()) as {
      jobId: string;
      type: string;
      input: Record<string, string>;
    };
    // Do the job (same code the API uses in JOB_MODE=local)
    const isDone = await AiJobService.run(jobId, type, input);

    // Failed jobs are not put back in the queue again
    if (isDone) ch.ack(msg);
    else ch.nack(msg, false, false);
  });
};

const shutdown = async () => {
  await closeRabbit();
  await closeRedis();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
