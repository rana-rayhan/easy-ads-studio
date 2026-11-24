import axiosInstance from "../../../shared/api/axiosInstance";

// Every AI request returns a jobId right away. The AI worker does the work, and we ask for the result with getJob().
class AiApi {
  // Idea 1: POST /api/ai/suggest-copy
  static async suggestCopy(values: { product: string; audience: string; tone: string }) {
    const { data } = await axiosInstance.post("/ai/suggest-copy", values);
    return data.payload as { jobId: string };
  }

  // Idea 2: POST /api/ai/describe-image (multipart, field "image")
  static async describeImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await axiosInstance.post("/ai/describe-image", formData);
    return data.payload as { jobId: string };
  }

  // Idea 3: POST /api/ai/review-ad
  static async reviewAd(values: { headline: string; description: string }) {
    const { data } = await axiosInstance.post("/ai/review-ad", values);
    return data.payload as { jobId: string };
  }

  // Idea 4: POST /api/ai/summarize-campaigns
  static async summarizeCampaigns() {
    const { data } = await axiosInstance.post("/ai/summarize-campaigns");
    return data.payload as { jobId: string };
  }

  // GET /api/ai/jobs/:id -> status + result
  static async getJob(jobId: string) {
    const { data } = await axiosInstance.get(`/ai/jobs/${jobId}`);
    return data.payload as IAiJob;
  }
}

export default AiApi;
