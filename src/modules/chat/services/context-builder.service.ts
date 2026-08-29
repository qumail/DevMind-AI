import {
  SearchResult,
} from "../../search/search.types";

export class ContextBuilderService {
  build(
    results: SearchResult[]
  ): string {
    if (results.length === 0) {
      return "No relevant context was found.";
    }

    return results
      .map(
        (result, index) => {
          return `
[Source ${index + 1}]
File: ${result.fileName}
Chunk: ${result.chunkIndex}
Similarity: ${result.score.toFixed(4)}

${result.content}
`;
        }
      )
      .join("\n-------------------------\n");
  }
}