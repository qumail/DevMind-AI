import mongoose from "mongoose";
import { redis } from "../../infrastructure/redis"
import { qdrant } from "../../infrastructure/qdrant/client";

type ServiceStatus = "up" | "down";

interface HealthResult {
  status: "ok" | "degraded";
  timestamp: string;

  services: {
    mongodb: ServiceStatus;
    redis: ServiceStatus;
    qdrant: ServiceStatus;
  };
}

export class HealthService {
  async check(): Promise<HealthResult> {
    const [mongodb, redisStatus, qdrantStatus] =
      await Promise.all([
        this.checkMongoDB(),
        this.checkRedis(),
        this.checkQdrant(),
      ]);

    const allServicesUp =
      mongodb === "up" &&
      redisStatus === "up" &&
      qdrantStatus === "up";

    return {
      status: allServicesUp ? "ok" : "degraded",

      timestamp: new Date().toISOString(),

      services: {
        mongodb,
        redis: redisStatus,
        qdrant: qdrantStatus,
      },
    };
  }

  private async checkMongoDB(): Promise<ServiceStatus> {
    try {
      if (mongoose.connection.readyState !== 1) {
        return "down";
      }

      return "up";
    } catch {
      return "down";
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    try {
      const result = await redis.ping();

      return result === "PONG" ? "up" : "down";
    } catch {
      return "down";
    }
  }

  private async checkQdrant(): Promise<ServiceStatus> {
    try {
      await qdrant.getCollections();

      return "up";
    } catch {
      return "down";
    }
  }
}