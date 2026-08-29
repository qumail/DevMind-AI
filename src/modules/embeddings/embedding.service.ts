import { env } from "../../config/env";

interface OllamaEmbedResponse {
  embeddings: number[][];
}

export class EmbeddingService {
  async generateEmbedding(
    text: string
  ): Promise<number[]> {
    const response = await fetch(
      `${env.ollama.baseUrl}/api/embed`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model:
            env.ollama.embeddingModel,

          input: text,
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `Ollama embedding failed: ${response.status} ${errorText}`
      );
    }

    const data =
      (await response.json()) as OllamaEmbedResponse;

    const embedding =
      data.embeddings?.[0];

    if (!embedding) {
      throw new Error(
        "Ollama returned an empty embedding"
      );
    }

    this.validateDimension(embedding);

    return embedding;
  }

  async generateEmbeddings(
    texts: string[]
  ): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const response = await fetch(
      `${env.ollama.baseUrl}/api/embed`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model:
            env.ollama.embeddingModel,

          input: texts,
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `Ollama batch embedding failed: ${response.status} ${errorText}`
      );
    }

    const data =
      (await response.json()) as OllamaEmbedResponse;

    const embeddings =
      data.embeddings;

    if (
      !embeddings ||
      embeddings.length !== texts.length
    ) {
      throw new Error(
        "Ollama returned an unexpected number of embeddings"
      );
    }

    embeddings.forEach((embedding) =>
      this.validateDimension(embedding)
    );

    return embeddings;
  }

  private validateDimension(
    embedding: number[]
  ): void {
    if (
      embedding.length !==
      env.qdrant.embeddingDimension
    ) {
      throw new Error(
        `Invalid embedding dimension. Expected ${env.qdrant.embeddingDimension}, received ${embedding.length}`
      );
    }
  }
}