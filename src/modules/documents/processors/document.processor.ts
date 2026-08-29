import {
  Worker,
  Job,
} from "bullmq";

import { redis } from "../../../infrastructure/redis";

import {
  DOCUMENT_QUEUE_NAME,
} from "../queues/document.queue";

import { DocumentModel } from "../models/document.model";

import {
  DocumentChunkModel,
} from "../models/document-chunk.model";

import {
  parseFile,
} from "../utils/file-parser";

import {
  chunkText,
} from "../utils/chunker";

import {
  EmbeddingService,
} from "../../embeddings/embedding.service";

import {
  QdrantRepository,
} from "../repositories/qdrant.repository";

import crypto from "crypto";

interface DocumentJobData {
  documentId: string;
  filePath: string;
}

const embeddingService =
  new EmbeddingService();

const qdrantRepository =
  new QdrantRepository();

const EMBEDDING_BATCH_SIZE = 16;

export const documentWorker =
  new Worker<DocumentJobData>(
    DOCUMENT_QUEUE_NAME,

    async (
      job: Job<DocumentJobData>
    ) => {
      const {
        documentId,
        filePath,
      } = job.data;

      console.log(
        `Processing document ${documentId}`
      );

      const document =
        await DocumentModel.findById(
          documentId
        );

      if (!document) {
        throw new Error(
          `Document not found: ${documentId}`
        );
      }

      try {
        document.status =
          "processing";

        document.error =
          undefined;

        await document.save();

        // --------------------------------
        // 1. Parse file
        // --------------------------------

        const parsed =
          await parseFile(
            filePath,
            document.originalName,
            document.mimeType
          );

        // --------------------------------
        // 2. Chunk file
        // --------------------------------

        const chunks =
          chunkText(
            parsed.content
          );

        console.log(
          `Created ${chunks.length} chunks`
        );

        // --------------------------------
        // 3. Persist chunks in MongoDB
        // --------------------------------

        const chunkDocuments =
          await DocumentChunkModel.bulkWrite(
            chunks.map((chunk) => ({
              updateOne: {
                filter: {
                  documentId:
                    document._id,

                  chunkIndex:
                    chunk.chunkIndex,
                },

                update: {
                  $set: {
                    content:
                      chunk.content,

                    metadata: {
                      fileName:
                        parsed.metadata.fileName,

                      extension:
                        parsed.metadata.extension,

                      mimeType:
                        parsed.metadata.mimeType,
                    },

                    embeddingStatus:
                      "pending",
                  },

                  $setOnInsert: {
                    documentId:
                      document._id,

                    chunkIndex:
                      chunk.chunkIndex,
                  },
                },

                upsert: true,
              },
            }))
          );

        console.log(
          `Persisted ${chunkDocuments.upsertedCount} new chunks`
        );

        // --------------------------------
        // 4. Read chunks from MongoDB
        // --------------------------------

        const persistedChunks =
          await DocumentChunkModel.find({
            documentId:
              document._id,
          }).sort({
            chunkIndex: 1,
          });

        // --------------------------------
        // 5. Generate embeddings
        // --------------------------------

        for (
          let i = 0;
          i < persistedChunks.length;
          i += EMBEDDING_BATCH_SIZE
        ) {
          const batch =
            persistedChunks.slice(
              i,
              i + EMBEDDING_BATCH_SIZE
            );

          const texts =
            batch.map(
              (chunk) =>
                chunk.content
            );

          console.log(
            `Generating embeddings for chunks ${i} - ${
              i + batch.length - 1
            }`
          );

          batch.forEach((chunk) => {
            chunk.embeddingStatus =
              "processing";
          });

          await Promise.all(
            batch.map((chunk) =>
              chunk.save()
            )
          );

          const embeddings =
            await embeddingService.generateEmbeddings(
              texts
            );

          // --------------------------------
          // 6. Prepare Qdrant points
          // --------------------------------

          const qdrantChunks =
            batch.map(
              (
                chunk,
                index
              ) => {
                const pointId =
                  chunk.qdrantPointId ??
                  crypto.randomUUID();

                return {
                  id: pointId,

                  vector:
                    embeddings[index],

                  payload: {
                    documentId:
                      document._id.toString(),

                    chunkId:
                      chunk._id.toString(),

                    chunkIndex:
                      chunk.chunkIndex,

                    content:
                      chunk.content,

                    fileName:
                      chunk.metadata.fileName,

                    extension:
                      chunk.metadata.extension,

                    mimeType:
                      chunk.metadata.mimeType,
                  },
                };
              }
            );

          // --------------------------------
          // 7. Store vectors in Qdrant
          // --------------------------------

          await qdrantRepository.upsertChunks(
            qdrantChunks
          );

          // --------------------------------
          // 8. Mark chunks as completed
          // --------------------------------

          await Promise.all(
            batch.map(
              async (
                chunk,
                index
              ) => {
                const pointId =
                  qdrantChunks[index]
                    .id;

                chunk.qdrantPointId =
                  pointId;

                chunk.embeddingStatus =
                  "completed";

                chunk.embeddingModel =
                  "nomic-embed-text";

                await chunk.save();
              }
            )
          );

          console.log(
            `✓ Embedded and indexed ${batch.length} chunks`
          );
        }

        // --------------------------------
        // 9. Mark document completed
        // --------------------------------

        document.chunkCount =
          persistedChunks.length;

        document.status =
          "completed";

        await document.save();

        console.log(
          `✓ Document ${documentId} completed`
        );

        return {
          documentId,

          chunkCount:
            persistedChunks.length,
        };
      } catch (error) {
        document.status =
          "failed";

        document.error =
          error instanceof Error
            ? error.message
            : "Unknown processing error";

        await document.save();

        throw error;
      }
    },

    {
      connection: redis,

      concurrency: 2,
    }
  );

documentWorker.on(
  "completed",
  (job) => {
    console.log(
      `✓ Document job ${job.id} completed`
    );
  }
);

documentWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `✗ Document job ${job?.id} failed:`,
      error.message
    );
  }
);