import { connectRedis, closeRedis } from "./database/RedisClient";
import { getChannel, closeRabbit } from "./database/RabbitClient";
import { AD_JOB_QUEUE } from "./controllers/AdController";
import AdJobService from "./services/jobs/AdJobService";

const start = async () => {
  await connectRedis();
  const ch = await getChannel();
  await ch.assertQueue(AD_JOB_QUEUE, { durable: true });

  // Take only one message at a time
  await ch.prefetch(1);
  console.log("***--- Ad worker waiting for jobs");

  await ch.consume(AD_JOB_QUEUE, async (msg) => {
    if (!msg) return;

    const { jobId, adId } = JSON.parse(msg.content.toString()) as { jobId: string; adId: string };
    // Do the job (same code the API uses in JOB_MODE=local)
    const isDone = await AdJobService.run(jobId, adId);

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
