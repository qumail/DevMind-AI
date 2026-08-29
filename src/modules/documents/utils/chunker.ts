import { DocumentChunk } from "../documents.types";

interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export const chunkText = (
  text: string,
  options: ChunkOptions = {}
): DocumentChunk[] => {
  const chunkSize = options.chunkSize ?? 1000;
  const overlap = options.overlap ?? 200;

  if (overlap >= chunkSize) {
    throw new Error(
      "Chunk overlap must be smaller than chunk size"
    );
  }

  const chunks: DocumentChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(
      start + chunkSize,
      text.length
    );

    const content = text
      .slice(start, end)
      .trim();

    if (content.length > 0) {
      chunks.push({
        content,
        chunkIndex,
      });

      chunkIndex++;
    }

    if (end === text.length) {
      break;
    }

    start += chunkSize - overlap;
  }

  return chunks;
};