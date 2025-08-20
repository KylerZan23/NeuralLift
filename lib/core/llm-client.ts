// /lib/core/llm-client.ts
import OpenAI from 'openai';

// A simplified interface matching the parts of the OpenAI client we use
export interface LLMClient {
  chat: {
    completions: {
      create(params: OpenAI.Chat.ChatCompletionCreateParams): Promise<OpenAI.Chat.ChatCompletion>;
    };
  };
}

const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Add clients for other providers like Anthropic here

export function getLLMClient(modelName: string): LLMClient {
  if (modelName.startsWith('gpt-')) {
    return openAIClient;
  }
  if (modelName.startsWith('claude-')) {
    // Placeholder for Anthropic client
    throw new Error(`Model ${modelName} not yet implemented.`);
  }
  // Add support for Groq, Gemini, etc. here

  throw new Error(`Unknown model provider for ${modelName}.`);
}
