import path from "path";
import { v4 as uuidv4 } from "uuid";

import { DocumentModel } from "./models/document.model";
import { documentQueue } from "./queues/document.queue";

interface CreateDocumentInput {
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
}

export class DocumentService {
  async createDocument(
    input: CreateDocumentInput
  ) {
    const extension = path
      .extname(input.originalName)
      .toLowerCase();

    const storedName = uuidv4();

    const document = await DocumentModel.create({
      originalName: input.originalName,
      storedName,
      mimeType: input.mimeType,
      size: input.size,
      extension,
      status: "pending",
    });

    await documentQueue.add(
      "process-document",
      {
        documentId: document._id.toString(),
        filePath: input.filePath,
      },
      {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 2000,
        },

        removeOnComplete: 100,
        removeOnFail: 100,
      }
    );

    return document;
  }

  async getDocument(id: string) {
    return DocumentModel.findById(id).lean();
  }
}