import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export interface IDocumentChunk
  extends Document {
  documentId: Types.ObjectId;

  content: string;

  chunkIndex: number;

  metadata: {
    fileName: string;
    extension: string;
    mimeType: string;
  };

  qdrantPointId?: string;

  embeddingStatus:
    | "pending"
    | "processing"
    | "completed"
    | "failed";

  embeddingModel?: string;

  createdAt: Date;
  updatedAt: Date;
}

const documentChunkSchema =
  new Schema<IDocumentChunk>(
    {
      documentId: {
        type: Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true,
      },

      content: {
        type: String,
        required: true,
      },

      chunkIndex: {
        type: Number,
        required: true,
      },

      metadata: {
        fileName: {
          type: String,
          required: true,
        },

        extension: {
          type: String,
          required: true,
        },

        mimeType: {
          type: String,
          required: true,
        },
      },

      qdrantPointId: {
        type: String,
      },

      embeddingStatus: {
        type: String,

        enum: [
          "pending",
          "processing",
          "completed",
          "failed",
        ],

        default: "pending",
      },

      embeddingModel: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

documentChunkSchema.index(
  {
    documentId: 1,
    chunkIndex: 1,
  },
  {
    unique: true,
  }
);

export const DocumentChunkModel =
  mongoose.model<IDocumentChunk>(
    "DocumentChunk",
    documentChunkSchema
  );