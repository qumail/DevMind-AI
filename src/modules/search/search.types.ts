export interface SearchRequest {
  query: string;

  limit?: number;

  documentId?: string;

  fileName?: string;

  extension?: string;
}

export interface SearchResult {
  score: number;

  content: string;

  documentId: string;

  chunkId: string;

  chunkIndex: number;

  fileName: string;

  extension: string;

  mimeType: string;
}

export interface SearchResponse {
  query: string;

  results: SearchResult[];
}