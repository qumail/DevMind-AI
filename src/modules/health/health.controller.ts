import { Request, Response } from "express";
import { HealthService } from "./health.service";

const healthService = new HealthService();

export const getHealth = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await healthService.check();

    const statusCode = result.status === "ok"
      ? 200
      : 503;

    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      status: "degraded",
      timestamp: new Date().toISOString(),
    });
  }
};