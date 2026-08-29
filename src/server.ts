import { createApp } from "./app";

import { env } from "./config/env";

import {
  connectMongoDB,
  disconnectMongoDB,
} from "./infrastructure/mongo";

import { redis } from "./infrastructure/redis";

import {
  initializeQdrantCollection,
} from "./infrastructure/qdrant/collection";

// Start worker
import "./modules/documents/processors/document.processor";

const bootstrap =
  async (): Promise<void> => {
    try {
      await connectMongoDB();

      await initializeQdrantCollection();

      const app =
        createApp();

      const server =
        app.listen(
          env.port,
          () => {
            console.log(
              `✓ DevMind AI API running on http://localhost:${env.port}`
            );
          }
        );

      const shutdown =
        async (
          signal: string
        ) => {
          console.log(
            `\n${signal} received. Shutting down...`
          );

          server.close(
            async () => {
              await disconnectMongoDB();

              await redis.quit();

              console.log(
                "✓ Application shut down gracefully"
              );

              process.exit(0);
            }
          );
        };

      process.on(
        "SIGINT",
        () => shutdown("SIGINT")
      );

      process.on(
        "SIGTERM",
        () => shutdown("SIGTERM")
      );
    } catch (error) {
      console.error(
        "✗ Failed to start application:",
        error
      );

      process.exit(1);
    }
  };

bootstrap();