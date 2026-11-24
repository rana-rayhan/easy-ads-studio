// First Google Ads API call: proves the key file, the access and the test account all work.
// Run: npm run google:check
import GoogleCampaignService from "../services/google/GoogleCampaignService";

const run = async () => {
  try {
    const account = await GoogleCampaignService.checkConnection();

    console.log("Connected to Google Ads ---***");
    console.table(account);

    if (!account.testAccount) console.warn("WARNING: this is NOT a test account. Do not create ads here.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

run();
