// Where jobs run: "worker" = RabbitMQ + workers, "local" = the API does the job itself
type JobMode = "worker" | "local";

// GET /api/workers
interface IWorkerStatus {
  rabbitmq: boolean;
  adWorker: boolean;
  aiWorker: boolean;
}
