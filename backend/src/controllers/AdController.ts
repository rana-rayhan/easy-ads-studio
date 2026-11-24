import { randomUUID } from "crypto";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { connectRedis, redisClient } from "../database/RedisClient";
import { getChannel } from "../database/RabbitClient";
import ApiResponse from "../utils/ApiResponse";
import AdJobService from "../services/jobs/AdJobService";
import { GOOGLE_ADS_MODE } from "../secrets/envSecret";

export const AD_JOB_QUEUE = "ad_job_create";
// Jobs that failed every try end up here (dead-letter queue), so they can be checked later
export const AD_JOB_DEAD_QUEUE = "ad_job_create_dead";
// Same settings everywhere the queue is used, or RabbitMQ refuses it (PRECONDITION_FAILED).
// A rejected message goes to AD_JOB_DEAD_QUEUE instead of being thrown away.
export const AD_JOB_QUEUE_OPTIONS = { durable: true, deadLetterExchange: "", deadLetterRoutingKey: AD_JOB_DEAD_QUEUE };

class AdController {
  // Saves the ad in Redis, creates a job, then puts the job in the queue for the worker.
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.userId as string;
      const { headline, description } = req.body;
      if (!headline || !description) throw createHttpError(400, "headline and description are required");
      if (!req.file) throw createHttpError(400, "image is required");

      // Google needs a website and a business name for every display ad
      const finalUrl = String(req.body.finalUrl ?? "").trim();
      const businessName = String(req.body.businessName ?? "").trim();
      const campaignId = String(req.body.campaignId ?? "").trim();
      if (!/^https?:\/\/\S+\.\S+/.test(finalUrl)) throw createHttpError(400, "Website must start with http:// or https://");
      if (!businessName || businessName.length > 25) throw createHttpError(400, "Business name is required (max 25 characters)");
      // Real Google Ads puts the ad in a campaign, so one must be chosen
      if (GOOGLE_ADS_MODE === "real" && !campaignId) throw createHttpError(400, "Choose a campaign for the ad");

      const adId = randomUUID();
      const jobId = randomUUID();
      // The UI switch sends "X-Job-Mode: local" or "worker" with every request (worker is the default)
      const jobMode = req.get("X-Job-Mode") === "local" ? "local" : "worker";

      // 1. Save the ad and the job in Redis
      await connectRedis();
      await redisClient.hSet(`ad:${adId}`, {
        id: adId,
        userId,
        headline: String(headline).trim(),
        description: String(description).trim(),
        imagePath: req.file.path,
        finalUrl,
        businessName,
        campaignId,
        status: "pending",
      });
      await redisClient.hSet(`ad-job:${jobId}`, {
        id: jobId,
        adId,
        userId,
        headline: String(headline).trim(),
        status: "pending",
        jobMode,
        message: jobMode === "local" ? "Starting in the API" : "Waiting for a worker",
        createdAt: new Date().toISOString(),
      });

      // A Redis list of this user's job ids, newest first. Used by GET /api/ads/jobs.
      await redisClient.lPush(`user-ad-jobs:${userId}`, jobId);

      if (jobMode === "local") {
        // 2a. Local mode: the API does the job itself in the background (no await, so the answer comes back right away)
        void AdJobService.run(jobId, adId);
      } else {
        // 2b. Worker mode: put the job in the queue. The worker picks it up later.
        const ch = await getChannel();
        await ch.assertQueue(AD_JOB_QUEUE, AD_JOB_QUEUE_OPTIONS);
        ch.sendToQueue(AD_JOB_QUEUE, Buffer.from(JSON.stringify({ jobId, adId })), { persistent: true });
      }

      return ApiResponse.success(res, { statusCode: 201, payload: { adId, jobId }, message: "Ad created, job queued" });
    } catch (error) {
      next(error);
    }
  }

  // Lists the latest 20 jobs of the logged-in user.
  static async listJobs(_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.userId as string;
      await connectRedis();

      const jobIds = await redisClient.lRange(`user-ad-jobs:${userId}`, 0, 19);
      const jobs = await Promise.all(jobIds.map((jobId) => redisClient.hGetAll(`ad-job:${jobId}`)));

      // Skip jobs whose hash no longer exists
      const payload = jobs.filter((job) => Object.keys(job).length > 0);
      return ApiResponse.success(res, { statusCode: 200, payload, message: "Jobs fetched" });
    } catch (error) {
      next(error);
    }
  }

  // Reads the job from Redis. Only the owner can see it.
  static async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.userId as string;
      await connectRedis();
      const job = await redisClient.hGetAll(`ad-job:${req.params.id}`);

      if (Object.keys(job).length === 0 || job.userId !== userId) throw createHttpError(404, "Job not found");

      return ApiResponse.success(res, { statusCode: 200, payload: job, message: "Job fetched" });
    } catch (error) {
      next(error);
    }
  }
}

export default AdController;
