import { Router } from "express";
import GoogleAdsController from "../controllers/GoogleAdsController";

const googleAdsRoute = Router();

/**
 * @openapi
 * /api/google-ads/campaigns:
 *   post:
 *     tags:
 *       - Google Ads / googleAdsRoute.ts
 *     description: Create a paused campaign (budget + campaign + ad group) in the Google Ads test account. Body { name, dailyBudget }.
 */
googleAdsRoute.post("/campaigns", GoogleAdsController.createCampaign);

/**
 * @openapi
 * /api/google-ads/campaigns:
 *   get:
 *     tags:
 *       - Google Ads / googleAdsRoute.ts
 *     description: List campaigns from the Google Ads test account.
 */
googleAdsRoute.get("/campaigns", GoogleAdsController.listCampaigns);

export default googleAdsRoute;
