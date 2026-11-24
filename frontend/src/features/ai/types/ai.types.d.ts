type AiJobStatus = "pending" | "processing" | "completed" | "failed";

// GET /api/ai/jobs/:id
interface IAiJob {
  id: string;
  type: string;
  status: AiJobStatus;
  message: string;
  createdAt?: string;
  result: unknown; // the shape depends on the job type (see below)
}

// Idea 1 result
interface IAiCopySuggestion {
  headlines: string[];
  descriptions: string[];
}

// Idea 2 result
interface IAiImageSuggestion {
  whatISee: string;
  headline: string;
  description: string;
}

// Idea 3 result
interface IAiAdReview {
  approved: boolean;
  score: number;
  ruleIssues: string[];
  aiIssues: string[];
  improvedHeadline: string;
  improvedDescription: string;
}

// Idea 4 result
interface IAiCampaignSummary {
  summary: string;
  tips: string[];
  totals?: { campaigns: number; paused: number; dailyBudget: number };
}

// The "Create ad" form values (shared by the ad form and the AI panel)
type CreateAdFormValues = { headline: string; description: string; image: import("antd").UploadFile[] };
