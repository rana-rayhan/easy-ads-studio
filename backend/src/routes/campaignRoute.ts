import { Router } from "express";
import CampaignController from "../controllers/CampaignController";

const campaignRoute = Router();

/**
 * @openapi
 * /api/campaigns:
 *   post:
 *     tags:
 *       - Campaign / campaignRoute.ts
 *     description: Create a campaign.
 */
campaignRoute.post("/", CampaignController.create);

/**
 * @openapi
 * /api/campaigns/{id}:
 *   get:
 *     tags:
 *       - Campaign / campaignRoute.ts
 *     description: Get one campaign with its job status.
 */
campaignRoute.get("/:id", CampaignController.getOne);

/**
 * @openapi
 * /api/campaigns:
 *   get:
 *     tags:
 *       - Campaign / campaignRoute.ts
 *     description: List campaigns of a user.
 */
campaignRoute.get("/", CampaignController.list);

/**
 * @openapi
 * /api/campaigns/dashboard:
 *   get:
 *     tags:
 *       - Campaign / campaignRoute.ts
 *     description: Dashboard statistics of a user.
 */
campaignRoute.get("/dashboard", CampaignController.dashboard);

export default campaignRoute;
