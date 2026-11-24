import { connectRedis, redisClient } from "../../database/RedisClient";
import AiService from "../ai/AiService";
import GoogleCampaignService from "../google/GoogleCampaignService";

// Does one AI job and saves the status + result in Redis.
// Used by the AI worker (JOB_MODE=worker) and by the API itself (JOB_MODE=local).
class AiJobService {
  // Returns true when the job worked, false when it failed (the worker uses this to ack or nack).
  // isLastTry: false when the worker will try again, so the UI shows "trying again" instead of "failed".
  static async run(jobId: string, type: string, input: Record<string, string>, isLastTry = true): Promise<boolean> {
    const jobKey = `ai-job:${jobId}`;
    console.log(`AI job ${jobId} (${type}): started ---***`);

    try {
      await connectRedis();
      await redisClient.hSet(jobKey, { status: "processing", message: "The AI is thinking..." });

      // Do the right AI task for this job type
      let result: unknown;
      if (type === "suggest_copy") {
        result = await AiService.suggestAdCopy({ product: input.product, audience: input.audience, tone: input.tone });
      } else if (type === "describe_image") {
        result = await AiService.describeImage({ imagePath: input.imagePath });
      } else if (type === "review_ad") {
        result = await AiService.reviewAd({ headline: input.headline, description: input.description });
      } else if (type === "summarize_campaigns") {
        // Read the campaigns from Google Ads first, then ask the AI about them
        const campaigns = await GoogleCampaignService.listCampaigns();
        result = await AiService.summarizeCampaigns({ campaigns });
      } else {
        throw new Error(`Unknown AI job type: ${type}`);
      }

      // Redis stores text, so save the result as JSON text
      await redisClient.hSet(jobKey, { status: "completed", message: "Done", result: JSON.stringify(result) });
      console.log(`AI job ${jobId}: completed ---***`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI job failed";
      console.error(`AI job ${jobId}: failed -`, message);

      // Another try is coming: keep the job "processing" so the UI keeps waiting
      if (!isLastTry) {
        await redisClient.hSet(jobKey, { status: "processing", message: `Failed, trying again: ${message}` });
        return false;
      }

      await redisClient.hSet(jobKey, { status: "failed", message });
      return false;
    }
  }
}

export default AiJobService;
