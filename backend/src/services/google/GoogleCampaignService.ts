import fs from "fs";
import path from "path";
import sharp from "sharp";
import createHttpError from "http-errors";
import { JWT } from "google-auth-library";
import {
  GOOGLE_ADS_API_VERSION,
  GOOGLE_ADS_CUSTOMER_ID,
  GOOGLE_ADS_KEY_FILE,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID,
} from "../../secrets/envSecret";

/*
Talking to the Google Ads REST API always takes the same steps:

  A. getAccessToken(): read the service account key file and ask Google for a token.
  B. search() or mutate(): send a POST request with fetch. The token goes in the "Authorization" header,
     and "login-customer-id" tells Google we come in through the test manager account.
     - search() reads data with a GAQL query (SQL-like).
     - mutate() creates or changes one object (budget, campaign, ad group...).
  C. Inside search() / mutate(): if Google says no, throw an error with Google's message.

How a campaign is built (each one points to the one before it):
  1. Campaign budget -> how much money per day
  2. Campaign        -> uses the budget, decides where ads show (here: Display network)
  3. Ad group        -> a group of ads inside the campaign

How an ad is built (createDisplayAd, run by the ad worker):
  4. Image assets    -> the image uploaded twice: wide (1.91:1) and square (1:1), Google needs both
  5. Ad group ad     -> a "responsive display ad" in the ad group: text + the 2 images + website

Google answers each create with a "resource name", like "customers/1234567890/campaigns/123".
Money is in "micros": 1 euro = 1,000,000 micros.
*/

// The error Google sends back (only the parts we read).
type GoogleErrorBody = { error?: { message?: string; details?: { errors?: { message?: string }[] }[] } };

class GoogleCampaignService {
  // ==================== Private methods (used only inside this class) ====================

  // A. Read the key file and get an access token from Google.
  private static async getAccessToken() {
    const keyPath = path.resolve(process.cwd(), GOOGLE_ADS_KEY_FILE);
    const key = JSON.parse(fs.readFileSync(keyPath, "utf8")) as { client_email: string; private_key: string };

    // JWT = the Google auth client for service accounts. The "adwords" scope means Google Ads API.
    const authClient = new JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ["https://www.googleapis.com/auth/adwords"],
    });

    const { token } = await authClient.getAccessToken();
    if (!token) throw new Error("Could not get a Google access token");
    return token;
  }

  // B. Read data with a GAQL query. Returns Google's answer as it is ({ results: [...] }).
  private static async search(query: string) {
    const token = await this.getAccessToken();

    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${GOOGLE_ADS_CUSTOMER_ID}/googleAds:search`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "login-customer-id": GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      },
      body: JSON.stringify({ query }),
    });
    const data: unknown = await response.json().catch(() => null);

    // C. Check the answer
    if (!response.ok) {
      const errorBody = data as GoogleErrorBody | null;
      const message =
        errorBody?.error?.details?.[0]?.errors?.[0]?.message ?? errorBody?.error?.message ?? "Unknown error";
      throw createHttpError(response.status === 400 ? 400 : 502, `Google Ads: ${message}`);
    }

    return data;
  }

  // B. Create one object. resource is e.g. "campaignBudgets", "campaigns", "adGroups".
  // Returns the resource name Google gave the new object, e.g. "customers/1234567890/campaigns/123".
  private static async mutate(resource: string, createData: object) {
    const token = await this.getAccessToken();

    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${GOOGLE_ADS_CUSTOMER_ID}/${resource}:mutate`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "login-customer-id": GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      },
      // Google takes a list of operations. We send one "create" operation.
      body: JSON.stringify({ operations: [{ create: createData }] }),
    });
    const data: unknown = await response.json().catch(() => null);

    // C. Check the answer
    if (!response.ok) {
      const errorBody = data as GoogleErrorBody | null;
      const message =
        errorBody?.error?.details?.[0]?.errors?.[0]?.message ?? errorBody?.error?.message ?? "Unknown error";
      throw createHttpError(response.status === 400 ? 400 : 502, `Google Ads (${resource}): ${message}`);
    }

    const result = data as { results: { resourceName: string }[] };
    return result.results[0].resourceName;
  }

  // ==================== Public methods (used by the controller and the check script) ====================

  // Reads the account we are connected to. Used by "npm run google:check".
  static async checkConnection() {
    const data = await this.search(
      "SELECT customer.id, customer.descriptive_name, customer.test_account, customer.currency_code, customer.time_zone FROM customer LIMIT 1",
    );

    const result = data as {
      results?: {
        customer: {
          id: string;
          descriptiveName?: string;
          testAccount?: boolean;
          currencyCode?: string;
          timeZone?: string;
        };
      }[];
    };
    const customer = result.results?.[0]?.customer;
    if (!customer) throw new Error("No customer returned");

    return {
      id: customer.id,
      name: customer.descriptiveName,
      testAccount: customer.testAccount ?? false,
      currency: customer.currencyCode,
      timeZone: customer.timeZone,
    };
  }

  // Creates budget -> campaign (paused) -> ad group in the test client account.
  static async createCampaign({ name, dailyBudget }: { name: string; dailyBudget: number }) {
    // Names must be unique in the account, so add a timestamp.
    const uniqueName = `${name} #${Date.now()}`;

    // 1. Budget
    const budgetResourceName = await this.mutate("campaignBudgets", {
      name: `${uniqueName} budget`,
      amountMicros: Math.round(dailyBudget * 1_000_000), // euros -> micros
      deliveryMethod: "STANDARD", // spend evenly during the day
      explicitlyShared: false, // this budget belongs only to this campaign
    });

    // 2. Campaign (PAUSED, so it can never start showing ads by itself)
    const campaignResourceName = await this.mutate("campaigns", {
      name: uniqueName,
      status: "PAUSED",
      advertisingChannelType: "DISPLAY", // image ads on websites and apps
      campaignBudget: budgetResourceName, // link to the budget from step 1
      manualCpc: {}, // bidding: we set the price per click ourselves (on the ad group)
      // Required by Google for every new campaign since the EU political ads rules.
      containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
    });

    // 3. Ad group inside the campaign
    const adGroupResourceName = await this.mutate("adGroups", {
      name: `${uniqueName} ad group`,
      campaign: campaignResourceName, // link to the campaign from step 2
      status: "ENABLED", // still shows nothing while the campaign is paused
      type: "DISPLAY_STANDARD",
      cpcBidMicros: 500_000, // max 0.50 EUR per click
    });

    // The id is the last part of the resource name: "customers/1234567890/campaigns/123" -> "123"
    return {
      name: uniqueName,
      budgetId: budgetResourceName.split("/").pop(),
      campaignId: campaignResourceName.split("/").pop(),
      adGroupId: adGroupResourceName.split("/").pop(),
      // Resource names are what later steps (the ad) need.
      resourceNames: { budget: budgetResourceName, campaign: campaignResourceName, adGroup: adGroupResourceName },
    };
  }

  // Creates a real display ad (PAUSED) in the first ad group of a campaign. Used by the ad worker.
  static async createDisplayAd({
    campaignId,
    headline,
    description,
    businessName,
    finalUrl,
    imagePath,
    adId,
  }: {
    campaignId: string;
    headline: string;
    description: string;
    businessName: string;
    finalUrl: string;
    imagePath: string;
    adId: string;
  }) {
    // 1. Find the ad group of the campaign (every campaign made by this app has one)
    const data = await this.search(
      `SELECT ad_group.resource_name FROM ad_group WHERE campaign.id = ${Number(campaignId)} LIMIT 1`,
    );
    const result = data as { results?: { adGroup: { resourceName: string } }[] };
    const adGroupResourceName = result.results?.[0]?.adGroup.resourceName;
    if (!adGroupResourceName) throw new Error(`Campaign ${campaignId} has no ad group`);

    // 2. Crop the image to the 2 shapes Google needs. "cover" fills the shape and cuts off the edges.
    const wideImage = await sharp(imagePath).resize(1200, 628, { fit: "cover" }).jpeg({ quality: 85 }).toBuffer();
    const squareImage = await sharp(imagePath).resize(1200, 1200, { fit: "cover" }).jpeg({ quality: 85 }).toBuffer();

    // 3. Upload both images as image assets (Google wants the file as base64 text). Names must be unique.
    const wideAssetResourceName = await this.mutate("assets", {
      name: `Ad ${adId} wide`,
      type: "IMAGE",
      imageAsset: { data: wideImage.toString("base64") },
    });
    const squareAssetResourceName = await this.mutate("assets", {
      name: `Ad ${adId} square`,
      type: "IMAGE",
      imageAsset: { data: squareImage.toString("base64") },
    });

    // 4. Create the ad in the ad group (PAUSED, so it can never show by itself)
    const adGroupAdResourceName = await this.mutate("adGroupAds", {
      adGroup: adGroupResourceName,
      status: "PAUSED",
      ad: {
        finalUrls: [finalUrl],
        responsiveDisplayAd: {
          headlines: [{ text: headline }], // max 30 characters
          longHeadline: { text: headline }, // max 90 characters
          descriptions: [{ text: description }], // max 90 characters
          businessName, // max 25 characters
          marketingImages: [{ asset: wideAssetResourceName }],
          squareMarketingImages: [{ asset: squareAssetResourceName }],
        },
      },
    });

    // The resource name ends with "adGroupId~adId", e.g. "customers/123/adGroupAds/456~789" -> "789"
    return adGroupAdResourceName.split("~").pop() as string;
  }

  // Reads the latest 50 campaigns from Google Ads. LIMIT 50 fits in one page, so one request is enough.
  static async listCampaigns() {
    const data = await this.search(
      `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign_budget.amount_micros
       FROM campaign
       ORDER BY campaign.id DESC
       LIMIT 50`,
    );

    // Each row has "campaign" and "campaignBudget" (Google turns snake_case into camelCase in JSON).
    const result = data as {
      results?: {
        campaign: { id: string; name: string; status: string; advertisingChannelType: string };
        campaignBudget?: { amountMicros?: string };
      }[];
    };

    const campaigns = [];
    for (const row of result.results ?? []) {
      campaigns.push({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        channel: row.campaign.advertisingChannelType,
        dailyBudget: Number(row.campaignBudget?.amountMicros ?? 0) / 1_000_000, // micros -> euros
      });
    }
    return campaigns;
  }
}

export default GoogleCampaignService;
