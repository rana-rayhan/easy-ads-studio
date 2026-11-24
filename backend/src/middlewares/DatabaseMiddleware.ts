import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";

import AppDataSource from "../database/AppDataSource";
import { databaseSecret } from "../secrets/envSecret";

export class DatabaseMiddleware {
  // Track whether the database has been initialized.
  private static dataSourceInitialized = false;

  // Close the database connection if it is open.
  static closeDatabaseConnection = async (): Promise<void> => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("***--- Database connection closed");
    }
    this.dataSourceInitialized = false;
  };

  // Ensure the database is connected before handling a request.
  static connectDatabase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Connect only if the database is not already initialized.
      if (!this.dataSourceInitialized || !AppDataSource.isInitialized) {
        // Load the database connection settings from environment variables.
        Object.assign(AppDataSource.options, {
          host: databaseSecret.host,
          port: databaseSecret.port,
          username: databaseSecret.username,
          password: databaseSecret.password,
          database: databaseSecret.database,
        });

        await AppDataSource.initialize();

        console.log("***--- Database connection established");
        this.dataSourceInitialized = true;
      }

      // Continue to the route or middleware.
      next();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      // Close the connection if the database rejects the password.
      if (message.includes("password authentication failed")) {
        console.log("***--- Authentication error detected, closing database connection");
        await this.closeDatabaseConnection();
      }

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Pass the database error to the central error handler.
      next(createHttpError(500, "Failed to connect to the database: " + errorMessage));
    }
  };
}
