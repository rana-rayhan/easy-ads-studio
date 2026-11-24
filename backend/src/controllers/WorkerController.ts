import { Request, Response, NextFunction } from "express";
import { getChannel } from "../database/RabbitClient";
import ApiResponse from "../utils/ApiResponse";
import { AD_JOB_QUEUE } from "./AdController";
import { AI_JOB_QUEUE } from "./AiController";

class WorkerController {
  // GET /api/workers -> is RabbitMQ up, and is a worker listening on each queue?
  // The UI uses this next to the "Worker / Local" switch.
  static async status(_req: Request, res: Response, next: NextFunction) {
    try {
      let rabbitmq = false;
      let adWorker = false;
      let aiWorker = false;

      try {
        // assertQueue also tells how many consumers (running workers) listen on the queue
        const ch = await getChannel();
        const adQueue = await ch.assertQueue(AD_JOB_QUEUE, { durable: true });
        const aiQueue = await ch.assertQueue(AI_JOB_QUEUE, { durable: true });
        rabbitmq = true;
        adWorker = adQueue.consumerCount > 0;
        aiWorker = aiQueue.consumerCount > 0;
      } catch {
        // RabbitMQ is not running, so no worker can get jobs. Local mode still works.
      }

      return ApiResponse.success(res, {
        statusCode: 200,
        payload: { rabbitmq, adWorker, aiWorker },
        message: "Worker status fetched",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default WorkerController;
