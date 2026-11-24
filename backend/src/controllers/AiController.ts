import { randomUUID } from "crypto";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { connectRedis, redisClient } from "../database/RedisClient";
import { getChannel } from "../database/RabbitClient";
import ApiResponse from "../utils/ApiResponse";
import AiJobService from "../services/jobs/AiJobService";

// AI answers take a few seconds, so every AI request becomes a job:
// API saves the job in Redis + puts it in this queue -> AI worker (src/aiWorker.ts) does the AI work.
export const AI_JOB_QUEUE = "ai_job";
// Jobs that failed every try end up here (dead-letter queue), so they can be checked later
export const AI_JOB_DEAD_QUEUE = "ai_job_dead";
// Same settings everywhere the queue is used, or RabbitMQ refuses it (PRECONDITION_FAILED).
// A rejected message goes to AI_JOB_DEAD_QUEUE instead of being thrown away.
export const AI_JOB_QUEUE_OPTIONS = { durable: true, deadLetterExchange: "", deadLetterRoutingKey: AI_JOB_DEAD_QUEUE };

class AiController {
  // ==================== Private method (used only inside this class) ====================

  // Save the job in Redis, then run it in the API (local) or put it in the queue (worker). Returns the job id.
  private static async queueJob(req: Request, userId: string, type: string, input: Record<string, string>) {
    const jobId = randomUUID();
    // The UI switch sends "X-Job-Mode: local" or "worker" with every request (worker is the default)
    const jobMode = req.get("X-Job-Mode") === "local" ? "local" : "worker";

    // 1. Save the job in Redis (the UI reads the status from here)
    await connectRedis();
    await redisClient.hSet(`ai-job:${jobId}`, {
      id: jobId,
      userId,
      type,
      status: "pending",
      jobMode,
      message: jobMode === "local" ? "Starting in the API" : "Waiting for the AI worker",
      createdAt: new Date().toISOString(),
    });

    // 2a. Local mode: the API does the job itself in the background (no await, so the answer comes back right away)
    if (jobMode === "local") {
      void AiJobService.run(jobId, type, input);
      return jobId;
    }

    // 2b. Worker mode: put the job in the queue. The AI worker picks it up.
    const ch = await getChannel();
    await ch.assertQueue(AI_JOB_QUEUE, AI_JOB_QUEUE_OPTIONS);
    ch.sendToQueue(AI_JOB_QUEUE, Buffer.from(JSON.stringify({ jobId, type, input })), { persistent: true });

    return jobId;
  }

  // ==================== Public methods (used by the routes) ====================

  // Idea 1 - POST /api/ai/suggest-copy  body: { product, audience, tone }
  static async suggestCopy(req: Request, res: Response, next: NextFunction) {
    try {
      const product = String(req.body?.product ?? "").trim();
      const audience = String(req.body?.audience ?? "").trim();
      const tone = String(req.body?.tone ?? "friendly").trim();
      if (!product || !audience) throw createHttpError(400, "product and audience are required");

      const jobId = await AiController.queueJob(req, res.locals.userId as string, "suggest_copy", { product, audience, tone });
      return ApiResponse.success(res, { statusCode: 201, payload: { jobId }, message: "AI job queued" });
    } catch (error) {
      next(error);
    }
  }

  // Idea 2 - POST /api/ai/describe-image  multipart: image
  static async describeImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw createHttpError(400, "image is required");

      const jobId = await AiController.queueJob(req, res.locals.userId as string, "describe_image", {
        imagePath: req.file.path,
      });
      return ApiResponse.success(res, { statusCode: 201, payload: { jobId }, message: "AI job queued" });
    } catch (error) {
      next(error);
    }
  }

  // Idea 3 - POST /api/ai/review-ad  body: { headline, description }
  static async reviewAd(req: Request, res: Response, next: NextFunction) {
    try {
      const headline = String(req.body?.headline ?? "").trim();
      const description = String(req.body?.description ?? "").trim();
      if (!headline || !description) throw createHttpError(400, "headline and description are required");

      const jobId = await AiController.queueJob(req, res.locals.userId as string, "review_ad", { headline, description });
      return ApiResponse.success(res, { statusCode: 201, payload: { jobId }, message: "AI job queued" });
    } catch (error) {
      next(error);
    }
  }

  // Idea 4 - POST /api/ai/summarize-campaigns  (the worker reads the campaigns from Google Ads)
  static async summarizeCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = await AiController.queueJob(req, res.locals.userId as string, "summarize_campaigns", {});
      return ApiResponse.success(res, { statusCode: 201, payload: { jobId }, message: "AI job queued" });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/jobs/:id  -> status, and the result when it is done. Only the owner can see it.
  static async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      await connectRedis();
      const job = await redisClient.hGetAll(`ai-job:${req.params.id}`);
      if (Object.keys(job).length === 0 || job.userId !== res.locals.userId) throw createHttpError(404, "Job not found");

      // The worker saves the result as JSON text, so turn it back into an object
      const result: unknown = job.result ? JSON.parse(job.result) : null;
      return ApiResponse.success(res, { statusCode: 200, payload: { ...job, result }, message: "AI job fetched" });
    } catch (error) {
      next(error);
    }
  }
}

export default AiController;
