import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { healthRoutes } from "./modules/health/health.routes";
import { documentRoutes } from "./modules/documents/documents.routes";
import searchRoutes from "./modules/search/search.routes";
import chatRoutes from "./modules/chat/chat.routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());

  app.use(express.json());

  app.use(morgan("dev"));

  app.use(
    "/health",
    healthRoutes
  );

  app.use(
    "/documents",
    documentRoutes
  );

  app.use(
    "/search",
    searchRoutes
  );

  app.use(
    "/chat",
    chatRoutes
  );


  return app;
};