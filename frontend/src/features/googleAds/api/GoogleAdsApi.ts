import axiosInstance from "../../../shared/api/axiosInstance";

class GoogleAdsApi {
  // POST /api/google-ads/campaigns -> creates budget + paused campaign + ad group in Google Ads
  static async createCampaign(values: { name: string; dailyBudget: number }) {
    const { data } = await axiosInstance.post("/google-ads/campaigns", values);
    return data.payload as IGoogleCampaignCreated;
  }

  // GET /api/google-ads/campaigns -> campaigns read straight from Google Ads
  static async listCampaigns() {
    const { data } = await axiosInstance.get("/google-ads/campaigns");
    return data.payload as IGoogleCampaign[];
  }
}

export default GoogleAdsApi;
