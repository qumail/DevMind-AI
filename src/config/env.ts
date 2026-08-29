import dotenv from "dotenv";

dotenv.config();

const getEnv = (
  key: string,
  defaultValue?: string
): string => {
  const value =
    process.env[key] ?? defaultValue;

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}`
    );
  }

  return value;
};

export const env = {
  port: Number(
    getEnv("PORT", "3000")
  ),

  mongodb: {
    uri: getEnv(
      "MONGODB_URI",
      "mongodb://localhost:27017/devmind"
    ),
  },

  redis: {
    host: getEnv(
      "REDIS_HOST",
      "localhost"
    ),

    port: Number(
      getEnv("REDIS_PORT", "6379")
    ),
  },

  qdrant: {
    url: getEnv(
      "QDRANT_URL",
      "http://localhost:6333"
    ),

    apiKey:
      process.env.QDRANT_API_KEY ||
      undefined,

    collectionName: getEnv(
      "QDRANT_COLLECTION_NAME",
      "devmind_documents"
    ),

    embeddingDimension: Number(
      getEnv(
        "EMBEDDING_DIMENSION",
        "768"
      )
    ),
  },

  ollama: {
    baseUrl: getEnv(
      "OLLAMA_BASE_URL",
      "http://localhost:11434"
    ),

    embeddingModel: getEnv(
      "EMBEDDING_MODEL",
      "nomic-embed-text"
    ),

    llmModel: getEnv(
      "OLLAMA_LLM_MODEL",
      "llama3.2:3b"
    )
  },
};