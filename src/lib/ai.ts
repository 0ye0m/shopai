// Groq AI Integration - Fast LLM inference
// Get your free API key at: https://console.groq.com/keys

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Available Groq models
const GROQ_MODELS = {
  llama70b: 'llama-3.3-70b-versatile',
  llama8b: 'llama-3.3-8b-versatile',
  mixtral: 'mixtral-8x7b-32768',
  gemma: 'gemma2-9b-it',
};

/**
 * Get Groq API key from environment
 */
function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables. Get your free key at https://console.groq.com/keys');
  }
  return apiKey;
}

/**
 * Chat completion using Groq API
 * @param messages - Array of chat messages
 * @param options - Optional configuration
 * @returns AI response string
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const apiKey = getGroqApiKey();
  
  const model = options.model || GROQ_MODELS.llama70b;
  
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Stream chat completion using Groq API
 * @param messages - Array of chat messages
 * @param options - Optional configuration
 * @yields Text chunks
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): AsyncGenerator<string, void, unknown> {
  const apiKey = getGroqApiKey();
  
  const model = options.model || GROQ_MODELS.llama70b;
  
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

// Export models for external use
export { GROQ_MODELS };

// Default export
export default {
  chatCompletion,
  streamChatCompletion,
  GROQ_MODELS,
};
