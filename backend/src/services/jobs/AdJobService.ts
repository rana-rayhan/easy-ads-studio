import { randomUUID } from "crypto";
import { connectRedis, redisClient } from "../../database/RedisClient";
import GoogleCampaignService from "../google/GoogleCampaignService";
import { GOOGLE_ADS_MODE } from "../../secrets/envSecret";

// Does one "create ad" job and saves the status in Redis.
// Used by the ad worker (JOB_MODE=worker) and by the API itself (JOB_MODE=local).
class AdJobService {
  // Returns true when the job worked, false when it failed (the worker uses this to ack or nack).
  // isLastTry: false when the worker will try again, so the UI shows "trying again" instead of "failed".
  static async run(jobId: string, adId: string, isLastTry = true): Promise<boolean> {
    const jobKey = `ad-job:${jobId}`;
    const adKey = `ad:${adId}`;
    console.log(`Job ${jobId}: started ---***`);

    try {
      await connectRedis();
      await redisClient.hSet(adKey, { status: "processing" });

      let googleAdId: string;
      let doneMessage: string;

      if (GOOGLE_ADS_MODE === "real") {
        // Real Google Ads: crop + upload the image, then create the ad (paused) in the chosen campaign
        await redisClient.hSet(jobKey, { status: "processing", message: "Creating ad on Google Ads" });
        const ad = await redisClient.hGetAll(adKey);
        if (!ad.campaignId) throw new Error("No campaign chosen for this ad");

        googleAdId = await GoogleCampaignService.createDisplayAd({
          campaignId: ad.campaignId,
          headline: ad.headline,
          description: ad.description,
          businessName: ad.businessName,
          finalUrl: ad.finalUrl,
          imagePath: ad.imagePath,
          adId,
        });
        doneMessage = "Ad created on Google Ads (paused)";
      } else {
        // Mock (GOOGLE_ADS_MODE=mock): waits 9 s and makes up an id, so the app works without Google Ads
        await redisClient.hSet(jobKey, { status: "processing", message: "Creating ad on Google (mock)" });
        await new Promise((resolve) => setTimeout(resolve, 9000));
        googleAdId = `mock-${randomUUID()}`;
        doneMessage = "Ad created (mock)";
      }

      await redisClient.hSet(adKey, { status: "completed", googleAdId });
      await redisClient.hSet(jobKey, { status: "completed", message: doneMessage, googleAdId });
      console.log(`Job ${jobId}: completed ---***`);
      return true;
    } catch (error) {
      console.error(`Job ${jobId}: failed`, error);

      // Another try is coming: keep the job "processing" so the UI keeps waiting
      if (!isLastTry) {
        await redisClient.hSet(jobKey, { status: "processing", message: "Failed, trying again" });
        return false;
      }

      // Show the reason (for example Google's error) in the jobs list
      const reason = error instanceof Error ? error.message : "Ad creation failed";
      await redisClient.hSet(jobKey, { status: "failed", message: reason });
      await redisClient.hSet(adKey, { status: "failed" });
      return false;
    }
  }
}

export default AdJobService;
