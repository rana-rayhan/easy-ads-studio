// Demo worker to learn RabbitMQ + Redis.
// It takes jobs from the "count_job" queue and counts 10, 20 ... 60, saving each step in Redis.
// Start it with: npm run count-worker
import { connectRedis, closeRedis, redisClient } from "./database/RedisClient";
import { getChannel, closeRabbit } from "./database/RabbitClient";
import { COUNT_QUEUE } from "./controllers/CountJobController";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const start = async () => {
  await connectRedis();
  const ch = await getChannel();
  await ch.assertQueue(COUNT_QUEUE, { durable: true });

  // Take up to 2 messages at a time
  await ch.prefetch(2);
  console.log("***--- Count worker waiting for jobs");

  await ch.consume(COUNT_QUEUE, async (msg) => {
    if (!msg) return;

    const { jobId } = JSON.parse(msg.content.toString()) as { jobId: string };
    const key = `count-job:${jobId}`;
    console.log(`Job ${jobId}: started ---***`);

    await redisClient.hSet(key, { status: "processing", message: "Counting started" });

    // Count 10, 20, 30, 40, 50, 60 (one step every second)
    for (let count = 10; count <= 60; count += 10) {
      await sleep(1000);
      await redisClient.hSet(key, { count: String(count) });
      console.log(`Job ${jobId}: count ${count}`);
    }

    await redisClient.hSet(key, { status: "completed", message: "Counting complete" });
    console.log(`Job ${jobId}: counting complete ---***`);

    // Tell RabbitMQ the job is done, so it removes the message from the queue
    ch.ack(msg);
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
