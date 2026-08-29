import mongoose, { Document, Schema } from "mongoose";

export type DocumentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface IDocument extends Document {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  extension: string;

  status: DocumentStatus;

  chunkCount: number;

  error?: string;

  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    storedName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    extension: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
      ],
      default: "pending",
    },

    chunkCount: {
      type: Number,
      default: 0,
    },

    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel =
  mongoose.model<IDocument>(
    "Document",
    documentSchema
  );