type AdJobStatus = "pending" | "processing" | "completed" | "failed";

type CreateAdResponse = { adId: string; jobId: string };

interface IAdJob {
  id: string;
  adId: string;
  userId: string;
  headline?: string;
  status: AdJobStatus;
  message: string;
  googleAdId?: string;
  createdAt?: string;
}
