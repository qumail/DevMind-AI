import { qdrant } from "../../../infrastructure/qdrant/client";
import { env } from "../../../config/env";

interface UpsertChunk {
  id: string;

  vector: number[];

  payload: {
    documentId: string;
    chunkId: string;
    chunkIndex: number;

    content: string;

    fileName: string;
    extension: string;
    mimeType: string;
  };
}

export class QdrantRepository {
  async upsertChunks(
    chunks: UpsertChunk[]
  ): Promise<void> {
    if (chunks.length === 0) {
      return;
    }

    await qdrant.upsert(
      env.qdrant.collectionName,
      {
        wait: true,

        points: chunks.map(
          (chunk) => ({
            id: chunk.id,

            vector: chunk.vector,

            payload: chunk.payload,
          })
        ),
      }
    );
  }
}