import { Router } from "express";
import userRoute from "./userRoute";
import authRoute from "./authRoute";
import campaignRoute from "./campaignRoute";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import countJobRoute from "./countJobRoute";
import adRoute from "./adRoute";
import googleAdsRoute from "./googleAdsRoute";
import aiRoute from "./aiRoute";
import workerRoute from "./workerRoute";
import SessionMiddleware from "../middlewares/SessionMiddleware";

/* *
This file combines the authentication and user routers under the /api base path. Authentication routes are available at /api/auth,
while user routes are available at /api/user and protected by middleware that checks whether the user is logged in and authorized.
The combined router is exported for use in the main Express application.
*/

const baseRoutes = Router();

// User routes
// Base URL: /api/auth
baseRoutes.use("/auth", authRoute);

// User routes
// Base URL: /api/user
// AuthMiddleware.isLoggedInAndAuthorized -> later we will use it
baseRoutes.use("/user", userRoute);

// Campaign routes
// Base URL: /api/campaigns
// AuthMiddleware.isLoggedIn -> later we will use it
baseRoutes.use("/campaigns", AuthMiddleware.isLoggedIn, campaignRoute);

// Learning route, no auth on purpose
// Base URL: /api/count-job (demo job for the count worker)
baseRoutes.use("/count-job", countJobRoute);

// Ad routes (session login required)
// Base URL: /api/ads
baseRoutes.use("/ads", adRoute);

// Google Ads API routes (session login required)
// Base URL: /api/google-ads
baseRoutes.use("/google-ads", SessionMiddleware.requireSession, googleAdsRoute);

// AI routes, powered by Ollama (session login required)
// Base URL: /api/ai
baseRoutes.use("/ai", SessionMiddleware.requireSession, aiRoute);

// Worker status for the "Worker / Local" switch in the UI (session login required)
// Base URL: /api/workers
baseRoutes.use("/workers", SessionMiddleware.requireSession, workerRoute);

// Exporting the API routes for integration with the main server
export default baseRoutes;
