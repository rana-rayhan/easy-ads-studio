import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import CampaignService from "../services/CampaignService";
import ApiResponse from "../utils/ApiResponse";
import { MessageKey } from "../enums/MessageKeys";

class CampaignController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, objective, dailyBudget, startDate, endDate } = req.body;

      // Basic checks. Zod validation replaces this later.
      if (!name || !objective || !startDate || Number(dailyBudget) <= 0) {
        throw createHttpError(400, MessageKey.COMMON_BAD_REQUEST);
      }

      // Temporary: the user id comes from the request until auth middleware is added.
      const userId = res.locals.userId as string;
      if (!userId) throw createHttpError(400, MessageKey.COMMON_BAD_REQUEST);

      const campaign = await CampaignService.create({
        name,
        objective,
        dailyBudget: Number(dailyBudget),
        startDate,
        endDate,
        userId,
      });

      return ApiResponse.success(res, { statusCode: 201, payload: campaign, message: "Campaign created" });
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      // Temporary: the user id comes from the query until auth middleware is added.
      const userId = res.locals.userId as string;
      if (!userId) throw createHttpError(400, MessageKey.COMMON_BAD_REQUEST);

      const campaign = await CampaignService.getById({ id: String(req.params.id), userId });

      return ApiResponse.success(res, { statusCode: 200, payload: campaign, message: "Campaign fetched" });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      // Temporary: the user id comes from the query until auth middleware is added.
      const userId = String(req.query.userId || "");
      if (!userId) throw createHttpError(400, MessageKey.COMMON_BAD_REQUEST);

      const campaigns = await CampaignService.list({ userId });

      return ApiResponse.success(res, { statusCode: 200, payload: campaigns, message: "Campaigns fetched" });
    } catch (error) {
      next(error);
    }
  }

  static async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      // Temporary: the user id comes from the query until auth middleware is added.
      const userId = String(req.query.userId || "");
      if (!userId) throw createHttpError(400, MessageKey.COMMON_BAD_REQUEST);

      const stats = await CampaignService.getDashboardStats({ userId });

      return ApiResponse.success(res, { statusCode: 200, payload: stats, message: "Dashboard fetched" });
    } catch (error) {
      next(error);
    }
  }
}

export default CampaignController;
