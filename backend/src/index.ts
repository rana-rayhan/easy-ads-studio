import "reflect-metadata"; // Enables TypeORM decorators and entity metadata.

import app from "./app"; // Import the configured Express application.
import { PORT } from "./secrets/envSecret"; // Load the server port from environment configuration.
import { DatabaseMiddleware } from "./middlewares/DatabaseMiddleware";

// Start the Express server and listen for incoming HTTP requests.
const server = app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));

// Graceful shutdown: stop accepting requests, close the database, then exit.
const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    try {
      await DatabaseMiddleware.closeDatabaseConnection();
    } catch (err) {
      console.error("Failed to close database connection:", err);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // Force exit if shutdown hangs.
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
