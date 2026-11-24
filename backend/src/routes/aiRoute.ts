import { Router } from "express";
import AiController from "../controllers/AiController";
import { uploadAdImage } from "../middlewares/UploadMiddleware";

const aiRoute = Router();

/**
 * @openapi
 * /api/ai/suggest-copy:
 *   post:
 *     tags:
 *       - AI / aiRoute.ts
 *     description: Idea 1 - AI writes 3 headlines and 3 descriptions. Body { product, audience, tone }. Returns a jobId.
 */
aiRoute.post("/suggest-copy", AiController.suggestCopy);

/**
 * @openapi
 * /api/ai/describe-image:
 *   post:
 *     tags:
 *       - AI / aiRoute.ts
 *     description: Idea 2 - AI looks at the image and suggests a headline and description. Multipart field "image". Returns a jobId.
 */
aiRoute.post("/describe-image", uploadAdImage, AiController.describeImage);

/**
 * @openapi
 * /api/ai/review-ad:
 *   post:
 *     tags:
 *       - AI / aiRoute.ts
 *     description: Idea 3 - rules + AI review the ad text before sending. Body { headline, description }. Returns a jobId.
 */
aiRoute.post("/review-ad", AiController.reviewAd);

/**
 * @openapi
 * /api/ai/summarize-campaigns:
 *   post:
 *     tags:
 *       - AI / aiRoute.ts
 *     description: Idea 4 - AI explains your Google Ads campaigns in plain words. Returns a jobId.
 */
aiRoute.post("/summarize-campaigns", AiController.summarizeCampaigns);

/**
 * @openapi
 * /api/ai/jobs/{id}:
 *   get:
 *     tags:
 *       - AI / aiRoute.ts
 *     description: Status and result of an AI job.
 */
aiRoute.get("/jobs/:id", AiController.getJob);

export default aiRoute;
