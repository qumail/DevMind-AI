import { Request, Response } from "express";

import { DocumentService } from "./documents.service";
import { isSupportedFile } from "./utils/file-parser";

const documentService =
  new DocumentService();

export const uploadDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        message: "No file uploaded",
      });

      return;
    }

    if (!isSupportedFile(req.file.originalname)) {
      res.status(400).json({
        message: "Unsupported file type",
      });

      return;
    }

    const document =
      await documentService.createDocument({
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        filePath: req.file.path,
      });

    res.status(202).json({
      message:
        "Document uploaded and queued for processing",

      document: {
        id: document._id,
        originalName:
          document.originalName,

        status: document.status,
      },
    });
  } catch (error) {
    console.error(
      "Document upload failed:",
      error
    );

    res.status(500).json({
      message: "Failed to upload document",
    });
  }
};

export const getDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const document =
      await documentService.getDocument(
        req.params.id as string
      );

    if (!document) {
      res.status(404).json({
        message: "Document not found",
      });

      return;
    }

    res.status(200).json({
      document,
    });
  } catch (error) {
    console.error(
      "Failed to get document:",
      error
    );

    res.status(500).json({
      message: "Failed to get document",
    });
  }
};