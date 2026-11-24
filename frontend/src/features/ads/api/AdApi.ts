import axiosInstance from "../../../shared/api/axiosInstance";

class AdApi {
  // POST /api/ads (multipart: headline, description, image)
  static async create(formData: FormData) {
    const { data } = await axiosInstance.post("/ads", formData);
    return data.payload as CreateAdResponse;
  }

  // GET /api/ads/jobs
  static async listJobs() {
    const { data } = await axiosInstance.get("/ads/jobs");
    return data.payload as IAdJob[];
  }

  // GET /api/ads/jobs/:id
  static async getJob(jobId: string) {
    const { data } = await axiosInstance.get(`/ads/jobs/${jobId}`);
    return data.payload as IAdJob;
  }
}

export default AdApi;
