// AI worker: takes AI jobs from the "ai_job" queue and asks Ollama (free local AI).
// Start it with: npm run ai-worker   (Ollama must be running: ollama serve)
import { connectRedis, closeRedis } from "./database/RedisClient";
import { getChannel, closeRabbit } from "./database/RabbitClient";
import { AI_JOB_QUEUE, AI_JOB_DEAD_QUEUE, AI_JOB_QUEUE_OPTIONS } from "./controllers/AiController";
import AiJobService from "./services/jobs/AiJobService";

// A failed job is tried up to 3 times, with 5 seconds between tries
const MAX_TRIES = 3;
const RETRY_DELAY_MS = 5000;

const start = async () => {
  await connectRedis();
  const ch = await getChannel();
  await ch.assertQueue(AI_JOB_QUEUE, AI_JOB_QUEUE_OPTIONS);
  await ch.assertQueue(AI_JOB_DEAD_QUEUE, { durable: true });

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
    // 1. Which try is this? The first message has no header, so it is try 1.
    const tryNumber = Number(msg.properties.headers?.["x-try"] ?? 1);
    const isLastTry = tryNumber >= MAX_TRIES;

    // 2. Do the job (same code the API uses in JOB_MODE=local)
    const isDone = await AiJobService.run(jobId, type, input, isLastTry);
    if (isDone) {
      ch.ack(msg);
      return;
    }

    // 3. Failed, but tries are left: wait, put a copy back in the queue with the next try number
    if (!isLastTry) {
      console.log(
        `AI job ${jobId}: try ${tryNumber} of ${MAX_TRIES} failed, trying again in ${RETRY_DELAY_MS / 1000} s`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      ch.sendToQueue(AI_JOB_QUEUE, msg.content, { persistent: true, headers: { "x-try": tryNumber + 1 } });
      ch.ack(msg);
      return;
    }

    // 4. Last try failed: reject it, RabbitMQ moves it to the dead-letter queue
    console.log(`AI job ${jobId}: failed ${MAX_TRIES} times, moved to ${AI_JOB_DEAD_QUEUE}`);
    ch.nack(msg, false, false);
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
