import { Router } from "express";
import WorkerController from "../controllers/WorkerController";

const workerRoute = Router();

/**
 * @openapi
 * /api/workers:
 *   get:
 *     tags:
 *       - Workers / workerRoute.ts
 *     description: Is RabbitMQ up, and are the ad worker and AI worker running? Returns { rabbitmq, adWorker, aiWorker }.
 */
workerRoute.get("/", WorkerController.status);

export default workerRoute;
