import Redis from "ioredis";
import { env } from "../config/env";

export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,

  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("✓ Redis connected");
});

redis.on("error", (error) => {
  console.error("✗ Redis error:", error.message);
});