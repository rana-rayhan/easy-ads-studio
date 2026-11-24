import { randomUUID } from "crypto";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { connectRedis, redisClient } from "../database/RedisClient";
import { getChannel } from "../database/RabbitClient";
import ApiResponse from "../utils/ApiResponse";

// Demo job to learn RabbitMQ + Redis: the count worker (src/countWorker.ts) counts 10, 20 ... 60.
export const COUNT_QUEUE = "count_job";

class CountJobController {
  // Creates a job: save it in Redis, then put a message in the queue.
  static async create(_req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = randomUUID();

      // 1. Save the job details in Redis (a hash is like an object with fields)
      await connectRedis();
      await redisClient.hSet(`count-job:${jobId}`, {
        id: jobId,
        name: "count_job",
        status: "pending",
        count: "0",
        message: "Waiting for a worker",
      });

      // 2. Publish the message. The worker will pick it up later.
      const ch = await getChannel();
      await ch.assertQueue(COUNT_QUEUE, { durable: true });
      ch.sendToQueue(COUNT_QUEUE, Buffer.from(JSON.stringify({ jobId })), { persistent: true });

      return ApiResponse.success(res, { statusCode: 201, payload: { jobId }, message: "Job created successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Reads the job details from Redis.
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      await connectRedis();
      const job = await redisClient.hGetAll(`count-job:${req.params.id}`);

      // hGetAll returns an empty object when the key does not exist
      if (Object.keys(job).length === 0) throw createHttpError(404, "Job not found");

      return ApiResponse.success(res, { statusCode: 200, payload: job, message: "Job fetched" });
    } catch (error) {
      next(error);
    }
  }
}

export default CountJobController;
