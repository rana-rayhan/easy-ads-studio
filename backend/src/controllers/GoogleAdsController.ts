import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import GoogleCampaignService from "../services/google/GoogleCampaignService";
import ApiResponse from "../utils/ApiResponse";

class GoogleAdsController {
  // POST /api/google-ads/campaigns  body: { name, dailyBudget }
  // Creates budget + campaign (paused) + ad group in the Google Ads test client account.
  static async createCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const name = String(req.body?.name ?? "").trim();
      const dailyBudget = Number(req.body?.dailyBudget);

      if (!name) throw createHttpError(400, "name is required");
      if (!Number.isFinite(dailyBudget) || dailyBudget <= 0) throw createHttpError(400, "dailyBudget must be above 0");

      // If Google says no, the service throws a 400 with Google's message.
      const campaign = await GoogleCampaignService.createCampaign({ name, dailyBudget });
      return ApiResponse.success(res, { statusCode: 201, payload: campaign, message: "Google Ads campaign created" });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/google-ads/campaigns
  // Lists campaigns straight from Google Ads.
  static async listCampaigns(_req: Request, res: Response, next: NextFunction) {
    try {
      const campaigns = await GoogleCampaignService.listCampaigns();
      return ApiResponse.success(res, { statusCode: 200, payload: campaigns, message: "Google Ads campaigns fetched" });
    } catch (error) {
      next(error);
    }
  }
}

export default GoogleAdsController;
