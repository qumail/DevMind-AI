export interface ChatRequest {
  question: string;

  documentId?: string;

  fileName?: string;

  extension?: string;

  topK?: number;
}

export interface ChatSource {
  documentId: string;

  chunkId: string;

  chunkIndex: number;

  fileName: string;

  score: number;
}

export interface ChatResponse {
  question: string;

  answer: string;

  sources: ChatSource[];
}