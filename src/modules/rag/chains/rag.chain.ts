import { ChatOllama } from "@langchain/ollama";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { ragPrompt } from "../prompts/rag.prompt";

import { env } from "../../../config/env";

export const ragLLM = new ChatOllama({
  baseUrl: env.ollama.baseUrl,
  model: env.ollama.llmModel,
  temperature: 0.2,
});

export const ragChain = ragPrompt
  .pipe(ragLLM)
  .pipe(new StringOutputParser());