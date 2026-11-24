import { Router } from "express";
import AppDataSource from "../database/AppDataSource";

export const livenessRouter = Router();
export const readinessRouter = Router();

// Liveness: process is running, no database needed
livenessRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Readiness: database is reachable (mounted after DatabaseMiddleware)
readinessRouter.get("/", async (_req, res) => {
  try {
    await AppDataSource.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "up" });
  } catch {
    res.status(503).json({ status: "error", database: "down" });
  }
});
