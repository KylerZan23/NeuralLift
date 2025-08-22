// /lib/core/llm-client.ts
import OpenAI from 'openai';
import { GoogleGenerativeAI, Tool, FunctionDeclaration, FunctionDeclarationSchema } from '@google/generative-ai';

// A simplified interface matching the parts of the OpenAI client we use
export interface LLMClient {
  chat: {
    completions: {
      create(params: OpenAI.Chat.ChatCompletionCreateParams): Promise<OpenAI.Chat.ChatCompletion>;
    };
  };
}

const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Google AI client wrapper that implements the LLMClient interface
class GoogleAIClientWrapper implements LLMClient {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  chat = {
    completions: {
      create: async (params: OpenAI.Chat.ChatCompletionCreateParams): Promise<OpenAI.Chat.ChatCompletion> => {
        try {
          // 1. Get the tool definitions from the parameters and convert to Gemini format
          const modelConfig: { model: string; tools?: Tool[] } = { model: params.model };
          
          if (params.tools && params.tools.length > 0) {
            const functionDeclarations: FunctionDeclaration[] = params.tools
              .filter(t => t.type === 'function')
              .map(t => {
                const decl: FunctionDeclaration = {
                  name: t.function.name,
                  description: t.function.description ?? ''
                };
                if (t.function.parameters) {
                  // Cast OpenAI parameters to Google AI format - they are compatible in practice
                  decl.parameters = t.function.parameters as unknown as FunctionDeclarationSchema;
                }
                return decl;
              });
            
            if (functionDeclarations.length > 0) {
              modelConfig.tools = [{ functionDeclarations }];
            }
          }

          // 2. Pass the tools in the format Gemini expects
          const model = this.client.getGenerativeModel(modelConfig);

          // Convert OpenAI messages to Gemini format
          const systemMessages: string[] = [];
          const conversationMessages = params.messages.filter(msg => {
            if (msg.role === 'system') {
              systemMessages.push(msg.content as string || '');
              return false;
            }
            return true;
          });

          // Convert remaining messages to Google AI format
          const processedContents = conversationMessages.map(msg => {
            // Extract content as string - handle both string and array formats
            let contentText = '';
            if (typeof msg.content === 'string') {
              contentText = msg.content;
            } else if (Array.isArray(msg.content)) {
              // For array content, extract text parts only
              contentText = msg.content
                .filter(part => part.type === 'text')
                .map(part => (part as OpenAI.Chat.Completions.ChatCompletionContentPartText).text)
                .join(' ');
            }

            return {
              role: msg.role === 'user' ? 'user' as const : 'model' as const,
              parts: [{ text: contentText }]
            };
          });

          // Prepend system messages to first user message if any exist
          if (systemMessages.length > 0 && processedContents.length > 0) {
            const firstUserIndex = processedContents.findIndex(content => content.role === 'user');
            if (firstUserIndex >= 0) {
              const systemText = systemMessages.join('\n');
              const existingText = processedContents[firstUserIndex]!.parts[0]?.text || '';
              processedContents[firstUserIndex] = {
                ...processedContents[firstUserIndex]!,
                parts: [{ text: `${systemText}\n\n${existingText}` }]
              };
            }
          }

          // Generate content with configuration
          const result = await model.generateContent({
            contents: processedContents,
            generationConfig: {
              temperature: params.temperature ?? 0.7,
              maxOutputTokens: 8192,
              topP: 0.8,
              topK: 40
            }
          });

          const response = result.response;

          // 3. Check for Gemini's function call response and map it correctly
          const functionCalls = response.functionCalls();
          if (functionCalls && functionCalls.length > 0) {
            const toolCalls = functionCalls.map((fc, index) => ({
              id: `call_${index}`, // Generate a unique ID for the call
              type: 'function' as const,
              function: {
                name: fc.name,
                arguments: JSON.stringify(fc.args), // Ensure arguments are a string
              },
            }));

            // 4. Return the response in the OpenAI-compatible format
            return {
              id: `gemini-${Date.now()}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: params.model,
              choices: [{
                index: 0,
                message: {
                  role: 'assistant',
                  content: null,
                  tool_calls: toolCalls,
                  refusal: null
                },
                finish_reason: 'tool_calls',
                logprobs: null
              }],
              usage: {
                prompt_tokens: response.usageMetadata?.promptTokenCount ?? 0,
                completion_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
                total_tokens: response.usageMetadata?.totalTokenCount ?? 0
              }
            };
          }

          // Regular text response (no tool calls)
          const text = response.text();

          // Convert Gemini response back to OpenAI format
          const openAIResponse: OpenAI.Chat.ChatCompletion = {
            id: `gemini-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: params.model,
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: text,
                refusal: null
              },
              finish_reason: response.candidates?.[0]?.finishReason === 'STOP' ? 'stop' : 'stop',
              logprobs: null
            }],
            usage: {
              prompt_tokens: response.usageMetadata?.promptTokenCount ?? 0,
              completion_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
              total_tokens: response.usageMetadata?.totalTokenCount ?? 0
            }
          };

          return openAIResponse;
        } catch (error) {
          console.error('❌ [GoogleAIClientWrapper] Gemini API error:', error);
          throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  };
}

const googleAIClient = new GoogleAIClientWrapper(process.env.GOOGLE_API_KEY || '');

export function getLLMClient(modelName: string): LLMClient {
  if (modelName.startsWith('gpt-')) {
    return openAIClient;
  }
  if (modelName.startsWith('claude-')) {
    // Placeholder for Anthropic client
    throw new Error(`Model ${modelName} not yet implemented.`);
  }
  if (modelName.startsWith('gemini-')) {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is required for Gemini models. Please configure GOOGLE_API_KEY environment variable.');
    }
    return googleAIClient;
  }
  // Add support for other providers here

  throw new Error(`Unknown model provider for ${modelName}.`);
}
