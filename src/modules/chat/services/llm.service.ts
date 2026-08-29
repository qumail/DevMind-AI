import { env } from "../../../config/env";

interface OllamaGenerateResponse {
  model: string;

  response: string;

  done: boolean;
}

export class LLMService {
  async generate(
    prompt: string
  ): Promise<string> {
    const response = await fetch(
      `${env.ollama.baseUrl}/api/generate`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: env.ollama.llmModel,

          prompt,

          stream: false,

          options: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `Ollama generation failed: ${response.status} ${errorText}`
      );
    }

    const data =
      (await response.json()) as OllamaGenerateResponse;

    return data.response.trim();
  }
}