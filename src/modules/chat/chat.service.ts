import {
  ChatRequest,
  ChatResponse,
} from "./chat.types";

import {
  RagService,
} from "../rag/rag.service";

export class ChatService {
  private readonly ragService =
    new RagService();

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

    return this.ragService.answer(
      question,
      {
        topK: request.topK,
        documentId: request.documentId,
        fileName: request.fileName,
        extension: request.extension,
      }
    );
  }
}