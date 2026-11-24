import cors from "cors";
import morgan from "morgan";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express, { NextFunction, Request, Response, urlencoded } from "express";

// Import the main API router and shared response utility.
import baseRoutes from "./routes/baseRoutes";
import ApiResponse from "./utils/ApiResponse";
import { CLIENT_HOST_REACT, isDevStage, PORT } from "./secrets/envSecret";
import { DatabaseMiddleware } from "./middlewares/DatabaseMiddleware";
import { MessageKey } from "./enums/MessageKeys";
import { connectRedis, redisClient } from "./database/RedisClient";

// Create the Express application.
const app = express();

app.use(
  cors({
    origin: CLIENT_HOST_REACT, // from .env, e.g. http://localhost:5173
    credentials: true,
    exposedHeaders: [
      "Strict-Transport-Security",
      "Content-Security-Policy",
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ],
  }),
); // Configure CORS to control which origins can access the API.
app.use(cookieParser()); // Parse cookies from incoming requests into req.cookies.
app.use(express.json()); // Parse incoming JSON request bodies into req.body.
app.use(urlencoded({ extended: true })); // Parse URL-encoded form data, including nested objects.

// Enable development-only logging and API documentation.
if (isDevStage) {
  app.use(morgan("dev")); // Log HTTP requests in a concise, developer-friendly format.
  // Generate the Swagger specification from route documentation.
  const swaggerSpec = swaggerJSDoc({
    apis: [`${__dirname}/routes/**/*.ts`], // Find OpenAPI comments inside TypeScript route files.
    definition: {
      openapi: "3.0.0",
      servers: [{ url: `http://localhost:${PORT}` }], // Base URL used by Swagger UI when trying API endpoints.
      // General information displayed in the API documentation.
      info: { title: "Title", version: "1.0.0", description: "API documentation using Swagger" },
    },
  });

  // Optional: save the generated Swagger specification to a JSON file.
  // const outputPath = path.resolve(__dirname, "swagger.json");
  // fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

  // Serve the interactive API documentation at /api-docs.
  // Disable "Try it out" so requests cannot be sent from Swagger UI.
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { tryItOutEnabled: false } }));
}

// NEW: liveness before the database middleware, so it never touches the DB
app.get("/health", (_req, res) => res.status(200).json({ status: "OK" }));

// Initialize the database connection before handling API requests.
// If connection setup fails, the middleware should pass the error onward.
app.use(DatabaseMiddleware.connectDatabase);

// Mount all application API routes under the /api prefix.
// For example, /users becomes /api/users.
app.use("/api", baseRoutes);

// Handle requests that did not match any registered route.
// Pass a 404 error to the centralized error handler.
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404, "Invalid route !"));
});

// Centralized error handler for middleware and route errors.
app.use(async (err: any, req: Request, res: Response, _next: NextFunction) => {
  // Log detailed errors internally, never return traces to the client.
  console.error("API Error:", err);

  const statusCode =
    typeof err.statusCode === "number" ? err.statusCode : typeof err.status === "number" ? err.status : 500;

  // Default to a safe, translated server error.
  let message = err instanceof Error ? err.message : String(err);
  const errorMessage = err instanceof Error ? err.message : String(err);

  // Handle database authentication failures.
  if (errorMessage.includes("password authentication failed")) {
    try {
      await DatabaseMiddleware.closeDatabaseConnection();
    } catch (closeError) {
      console.error("Failed to close database connection:", closeError);
    }

    message = MessageKey.COMMON_DATABASE_ERROR;
  } else if (statusCode < 500) {
    // Preserve client-safe messages for expected 4xx errors.
    message = typeof err.message === "string" ? err.message : MessageKey.COMMON_SERVER_ERROR;
  }

  return ApiResponse.error(res, { statusCode, message });
});

// Export the configured app so the server entry point can start it.
export default app;
