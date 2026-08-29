import { Queue } from "bullmq";
import { redis } from "../../../infrastructure/redis";

export const DOCUMENT_QUEUE_NAME =
  "document-ingestion";

export const documentQueue = new Queue(
  DOCUMENT_QUEUE_NAME,
  {
    connection: redis,
  }
);