// One campaign from GET /api/google-ads/campaigns
interface IGoogleCampaign {
  id: string;
  name: string;
  status: string;
  channel: string;
  dailyBudget: number;
}

// Response of POST /api/google-ads/campaigns
interface IGoogleCampaignCreated {
  name: string;
  budgetId: string;
  campaignId: string;
  adGroupId: string;
}
