import { In, IsNull, Not, Repository } from "typeorm";
import AppDataSource from "../database/AppDataSource";
import { Campaign, CampaignStatus, JobStatus } from "../entities/Campaign";

class CampaignRepo {
  // A getter, so the repository is read when used, after the database is connected.
  private static repo: Repository<Campaign> = AppDataSource.getRepository(Campaign);

  static async create(data: {
    name: string;
    objective: string;
    dailyBudget: string;
    startDate: string;
    endDate: string | null;
    userId: string;
    status?: CampaignStatus;
    jobStatus?: JobStatus;
  }) {
    const campaign = this.repo.create(data);
    return this.repo.save(campaign);
  }

  static async findById({ id }: { id: string }) {
    return this.repo.findOneBy({ id });
  }

  static async updateStatus({ id, status, jobStatus }: { id: string; status?: CampaignStatus; jobStatus?: JobStatus }) {
    await this.repo.update({ id }, { ...(status && { status }), ...(jobStatus && { jobStatus }) });
  }

  static async findAllByUser({ userId }: { userId: string }) {
    return this.repo.find({ where: { userId }, order: { createdAt: "DESC" } });
  }

  static async countByStatus({ userId }: { userId: string }) {
    const rows = await this.repo
      .createQueryBuilder("campaign")
      .select("campaign.status", "status")
      .addSelect("COUNT(*)", "count")
      .where("campaign.user_id = :userId", { userId })
      .groupBy("campaign.status")
      .getRawMany<{ status: string; count: string }>();

    return rows.map((row) => ({ status: row.status, count: Number(row.count) }));
  }

  static async setGoogleId({ id, googleCampaignId }: { id: string; googleCampaignId: string }) {
    await this.repo.update({ id }, { googleCampaignId });
  }

  static async findSyncable({ userId }: { userId: string }) {
    return this.repo.find({
      where: {
        userId,
        status: In([CampaignStatus.ACTIVE, CampaignStatus.PAUSED]),
        googleCampaignId: Not(IsNull()),
      },
    });
  }

  static async updateMetrics({ id, impressions, clicks }: { id: string; impressions: number; clicks: number }) {
    await this.repo.update({ id }, { impressions, clicks });
  }

  static async sumMetrics({ userId }: { userId: string }) {
    const row = await this.repo
      .createQueryBuilder("campaign")
      .select("COALESCE(SUM(campaign.impressions), 0)", "impressions")
      .addSelect("COALESCE(SUM(campaign.clicks), 0)", "clicks")
      .where("campaign.user_id = :userId", { userId })
      .getRawOne<{ impressions: string; clicks: string }>();

    return { impressions: Number(row?.impressions ?? 0), clicks: Number(row?.clicks ?? 0) };
  }
}

export default CampaignRepo;
