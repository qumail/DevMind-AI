import { qdrant } from "../../../infrastructure/qdrant/client";
import { env } from "../../../config/env";

import {
  SearchResult,
} from "../search.types";

interface SearchOptions {
  vector: number[];
  limit: number;
  documentId?: string;
  fileName?: string;
  extension?: string;
}

interface QdrantPayload {
  documentId?: string;
  chunkId?: string;
  chunkIndex?: number;
  content?: string;
  fileName?: string;
  extension?: string;
  mimeType?: string;
}

export class SearchRepository {
  async search(
    options: SearchOptions
  ): Promise<SearchResult[]> {
    const {
      vector,
      limit,
      documentId,
      fileName,
      extension,
    } = options;

    const filterConditions: Array<{
      key: string;
      match: {
        value: string;
      };
    }> = [];

    if (documentId) {
      filterConditions.push({
        key: "documentId",
        match: {
          value: documentId,
        },
      });
    }

    if (fileName) {
      filterConditions.push({
        key: "fileName",
        match: {
          value: fileName,
        },
      });
    }

    if (extension) {
      filterConditions.push({
        key: "extension",
        match: {
          value: extension,
        },
      });
    }

    const response = await qdrant.query(
      env.qdrant.collectionName,
      {
        query: vector,

        limit,

        with_payload: true,

        ...(filterConditions.length > 0
          ? {
              filter: {
                must: filterConditions,
              },
            }
          : {}),
      }
    );

    return response.points
      .map((point) => {
        const payload =
          point.payload as QdrantPayload;

        if (
          !payload.documentId ||
          !payload.chunkId ||
          payload.chunkIndex === undefined ||
          !payload.content ||
          !payload.fileName ||
          !payload.extension ||
          !payload.mimeType
        ) {
          return null;
        }

        return {
          score: point.score ?? 0,

          content: payload.content,

          documentId:
            payload.documentId,

          chunkId:
            payload.chunkId,

          chunkIndex:
            payload.chunkIndex,

          fileName:
            payload.fileName,

          extension:
            payload.extension,

          mimeType:
            payload.mimeType,
        };
      })
      .filter(
        (
          result
        ): result is SearchResult =>
          result !== null
      );
  }
}