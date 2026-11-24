import createHttpError from "http-errors";
import CampaignRepo from "../repositories/CampaignRepo";
import { MessageKey } from "../enums/MessageKeys";
import { connectRedis, redisClient } from "../database/RedisClient";
import { CampaignStatus, JobStatus } from "../entities/Campaign";
// import { publishCampaignCreate } from "../database/RabbitClient";

class CampaignService {
  static async create(data: {
    name: string;
    objective: string;
    dailyBudget: number;
    startDate: string;
    endDate?: string | null;
    userId: string;
  }) {
    const endDate = data.endDate ?? null;

    // The end date must not be before the start date.
    if (endDate && new Date(endDate) < new Date(data.startDate)) {
      throw createHttpError(400, MessageKey.COMMON_BAD_REQUEST);
    }

    const campaign = await CampaignRepo.create({
      name: data.name.trim(),
      objective: data.objective.trim(),
      dailyBudget: data.dailyBudget.toFixed(2),
      startDate: data.startDate,
      endDate,
      userId: data.userId,
      status: CampaignStatus.PENDING,
      jobStatus: JobStatus.PENDING,
    });

    // Invalidate dashboard cache
    await connectRedis();
    await redisClient.del(`dashboard:${data.userId}`);

    // Hand the slow Google Ads work to the worker
    // await publishCampaignCreate({ campaignId: campaign.id });

    return campaign;
  }

  static async getById({ id, userId }: { id: string; userId: string }) {
    const campaign = await CampaignRepo.findById({ id });
    if (!campaign || campaign.userId !== userId) throw createHttpError(404, MessageKey.COMMON_BAD_REQUEST);
    return campaign;
  }

  static async list({ userId }: { userId: string }) {
    return CampaignRepo.findAllByUser({ userId });
  }

  static async getDashboardStats({ userId }: { userId: string }) {
    await connectRedis();
    const cacheKey = `dashboard:${userId}`;

    // 1. Look in Redis first (hit)
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2. Miss: ask Postgres
    const rows = await CampaignRepo.countByStatus({ userId });
    const metrics = await CampaignRepo.sumMetrics({ userId });
    const countOf = (status: string) => rows.find((row) => row.status === status)?.count ?? 0;

    const stats = {
      total: rows.reduce((sum, row) => sum + row.count, 0),
      active: countOf("active"),
      paused: countOf("paused"),
      draft: countOf("draft"),
      impressions: metrics.impressions,
      clicks: metrics.clicks,
    };

    // 3. Save in Redis for 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(stats), { EX: 60 });
    return stats;
  }
}

export default CampaignService;
