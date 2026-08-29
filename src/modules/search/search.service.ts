import {
  EmbeddingService,
} from "../embeddings/embedding.service";

import {
  SearchRepository,
} from "./repositories/search.repository";

import {
  SearchRequest,
  SearchResponse,
} from "./search.types";

export class SearchService {
  private readonly embeddingService =
    new EmbeddingService();

  private readonly searchRepository =
    new SearchRepository();

  async search(
    request: SearchRequest
  ): Promise<SearchResponse> {
    const query =
      request.query.trim();

    if (!query) {
      throw new Error(
        "Search query cannot be empty"
      );
    }

    const limit =
      Math.min(
        Math.max(
          request.limit ?? 5,
          1
        ),
        20
      );

    // --------------------------------
    // 1. Convert query to embedding
    // --------------------------------

    const queryEmbedding =
      await this.embeddingService.generateEmbedding(
        query
      );

    // --------------------------------
    // 2. Search Qdrant
    // --------------------------------

    const results =
      await this.searchRepository.search({
        vector: queryEmbedding,

        limit,

        documentId:
          request.documentId,

        fileName:
          request.fileName,

        extension:
          request.extension,
      });

    return {
      query,

      results,
    };
  }
}