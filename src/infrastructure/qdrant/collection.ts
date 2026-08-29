import { qdrant } from "./client";
import { env } from "../../config/env";

export const initializeQdrantCollection =
  async (): Promise<void> => {
    const collectionName =
      env.qdrant.collectionName;

    const collections =
      await qdrant.getCollections();

    const exists =
      collections.collections.some(
        (collection) =>
          collection.name ===
          collectionName
      );

    if (exists) {
      console.log(
        `✓ Qdrant collection "${collectionName}" already exists`
      );

      return;
    }

    await qdrant.createCollection(
      collectionName,
      {
        vectors: {
          size:
            env.qdrant.embeddingDimension,

          distance: "Cosine",
        },
      }
    );

    console.log(
      `✓ Qdrant collection "${collectionName}" created`
    );
  };