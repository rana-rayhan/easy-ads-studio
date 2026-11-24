import { randomUUID } from "crypto";
import { connectRedis, redisClient } from "../../database/RedisClient";

// Does one "create ad" job and saves the status in Redis.
// Used by the ad worker (JOB_MODE=worker) and by the API itself (JOB_MODE=local).
class AdJobService {
  // Returns true when the job worked, false when it failed (the worker uses this to ack or nack).
  static async run(jobId: string, adId: string): Promise<boolean> {
    const jobKey = `ad-job:${jobId}`;
    const adKey = `ad:${adId}`;
    console.log(`Job ${jobId}: started ---***`);

    try {
      await connectRedis();
      await redisClient.hSet(jobKey, { status: "processing", message: "Creating ad on Google (mock)" });
      await redisClient.hSet(adKey, { status: "processing" });

      // Mock of the Google Ads call (waits 9 s). Replaced with the real API in phase 6.
      await new Promise((resolve) => setTimeout(resolve, 9000));
      const googleAdId = `mock-${randomUUID()}`;

      await redisClient.hSet(adKey, { status: "completed", googleAdId });
      await redisClient.hSet(jobKey, { status: "completed", message: "Ad created (mock)", googleAdId });
      console.log(`Job ${jobId}: completed ---***`);
      return true;
    } catch (error) {
      console.error(`Job ${jobId}: failed`, error);
      await redisClient.hSet(jobKey, { status: "failed", message: "Ad creation failed" });
      await redisClient.hSet(adKey, { status: "failed" });
      return false;
    }
  }
}

export default AdJobService;
