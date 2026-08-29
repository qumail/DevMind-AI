import {
  Request,
  Response,
} from "express";

import {
  ChatService,
} from "./chat.service";

import {
  ChatRequest,
} from "./chat.types";

export class ChatController {
  constructor(
    private readonly chatService: ChatService
  ) {}

  chat = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        question,
        documentId,
        fileName,
        extension,
        topK,
      } =
        req.body as ChatRequest;

      if (
        typeof question !== "string"
      ) {
        res.status(400).json({
          message:
            "question must be a string",
        });

        return;
      }

      const result =
        await this.chatService.chat({
          question,

          documentId,

          fileName,

          extension,

          topK:
            typeof topK === "number"
              ? topK
              : undefined,
        });


      res.status(200).json(
        result
      );
    } catch (error) {
      console.error(
        "Chat failed:",
        error
      );

      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Chat failed",
      });
    }
  };
}