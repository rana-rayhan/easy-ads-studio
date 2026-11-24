import axiosInstance from "../../../shared/api/axiosInstance";

class WorkerApi {
  // GET /api/workers -> is RabbitMQ up, and are the ad worker and AI worker running?
  static async getStatus() {
    const { data } = await axiosInstance.get("/workers");
    return data.payload as IWorkerStatus;
  }
}

export default WorkerApi;
