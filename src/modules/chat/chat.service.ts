import {
  SearchRepository,
} from "../search/repositories/search.repository";

import {
  EmbeddingService,
} from "../embeddings/embedding.service";

import {
  SearchResult,
} from "../search/search.types";

import {
  ChatRequest,
  ChatResponse,
  ChatSource,
} from "./chat.types";

import {
  ContextBuilderService,
} from "./services/context-builder.service";

import {
  LLMService,
} from "./services/llm.service";

export class ChatService {
  private readonly embeddingService =
    new EmbeddingService();

  private readonly searchRepository =
    new SearchRepository();

  private readonly contextBuilder =
    new ContextBuilderService();

  private readonly llmService =
    new LLMService();

  async chat(
    request: ChatRequest
  ): Promise<ChatResponse> {
    const question =
      request.question.trim();

    if (!question) {
      throw new Error(
        "Question cannot be empty"
      );
    }

    const topK =
      Math.min(
        Math.max(
          request.topK ?? 5,
          1
        ),
        10
      );

    // --------------------------------
    // 1. Convert question → embedding
    // --------------------------------

    const queryVector =
      await this.embeddingService.generateEmbedding(
        question
      );

    // --------------------------------
    // 2. Retrieve relevant chunks
    // --------------------------------

    const results =
      await this.searchRepository.search({
        vector: queryVector,

        limit: topK,

        documentId:
          request.documentId,

        fileName:
          request.fileName,

        extension:
          request.extension,
      });

    // --------------------------------
    // 3. Build context
    // --------------------------------

    const context =
      this.contextBuilder.build(
        results
      );

    // --------------------------------
    // 4. Build RAG prompt
    // --------------------------------

    const prompt =
      this.buildPrompt(
        question,
        context
      );

    // --------------------------------
    // 5. Generate answer
    // --------------------------------

    const answer =
      await this.llmService.generate(
        prompt
      );

    // --------------------------------
    // 6. Return sources
    // --------------------------------

    const sources: ChatSource[] =
      results.map(
        (result: SearchResult) => ({
          documentId:
            result.documentId,

          chunkId:
            result.chunkId,

          chunkIndex:
            result.chunkIndex,

          fileName:
            result.fileName,

          score:
            result.score,
        })
      );

    return {
      question,

      answer,

      sources,
    };
  }

  private buildPrompt(
    question: string,
    context: string
  ): string {
    return `
You are DevMind, an AI assistant that answers
questions using the provided knowledge base.

IMPORTANT RULES:

1. Answer the question using ONLY the provided context.
2. Do not use outside knowledge.
3. Do not invent facts.
4. If the answer cannot be found in the context,
   say that you don't have enough information.
5. Be concise and technically accurate.
6. When possible, mention the relevant source file.

KNOWLEDGE BASE CONTEXT:

${context}

USER QUESTION:

${question}

ANSWER:
`;
  }
}