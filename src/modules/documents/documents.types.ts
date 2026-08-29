export interface ParsedDocument {
  content: string;
  metadata: {
    fileName: string;
    extension: string;
    mimeType: string;
  };
}

export interface DocumentChunk {
  content: string;
  chunkIndex: number;
}