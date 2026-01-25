const Groq = require("groq-sdk");
const dotenv = require("dotenv");
dotenv.config();

const client = new Groq("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");

// List of all available free models in priority order
const FREE_MODELS = [
  "llama-3.1-8b-instant",                    // Fast and efficient
  "llama-3.3-70b-versatile",                // More capable
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-guard-4-12b",
  "qwen/qwen3-32b",
  "moonshotai/kimi-k2-instruct",
  "moonshotai/kimi-k2-instruct-0905",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-safeguard-20b",
  "groq/compound",
  "groq/compound-mini",
  "allam-2-7b",
  "meta-llama/llama-prompt-guard-2-22m",
  "meta-llama/llama-prompt-guard-2-86m"
];

// Model-specific token limits
const MODEL_TOKEN_LIMITS = {
  "meta-llama/llama-guard-4-12b": 1024,
  "meta-llama/llama-prompt-guard-2-22m": 512,
  "meta-llama/llama-prompt-guard-2-86m": 512,
  // Default for other models
  "default": 4000
};

// Audio models (separate category)
const AUDIO_MODELS = [
  "whisper-large-v3",
  "whisper-large-v3-turbo"
];

// TTS models
const TTS_MODELS = [
  "playai-tts",
  "playai-tts-arabic"
];

class GroqMultiModel {
  constructor() {
    this.modelIndex = 0;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async chatCompletion(messages, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 1024,
      top_p = 1,
      stream = false
    } = options;

    while (this.modelIndex < FREE_MODELS.length) {
      const currentModel = FREE_MODELS[this.modelIndex];
      
      // Get model-specific token limit, fallback to provided max_tokens
      const modelMaxTokens = MODEL_TOKEN_LIMITS[currentModel] || max_tokens;
      const effectiveMaxTokens = Math.min(max_tokens, modelMaxTokens);
      
      try {
        console.log(`🔄 Trying model: ${currentModel} (${this.modelIndex + 1}/${FREE_MODELS.length}) with max_tokens: ${effectiveMaxTokens}`);
        
        const result = await client.chat.completions.create({
          model: currentModel,
          messages: messages,
          temperature: temperature,
          max_tokens: effectiveMaxTokens,
          top_p: top_p,
          stream: stream
        });

        console.log(`✅ Success with model: ${currentModel}`);
        this.retryCount = 0; // Reset retry count on success
        
        return {
          success: true,
          model: currentModel,
          content: result.choices[0].message.content,
          usage: result.usage,
          fullResponse: result
        };

      } catch (error) {
        console.log(`❌ Model ${currentModel} failed: ${error.message}`);
        
        // Check if it's a rate limit error
        if (error.status === 429) {
          const retryAfter = error.headers?.['retry-after'] || 2;
          console.log(`⏳ Rate limit hit. Waiting ${retryAfter} seconds...`);
          await this.delay(retryAfter * 1000);
          continue; // Retry same model after delay
        }

        // Check if it's a token limit error or model-specific error
        if (error.message.includes('token') || 
            error.message.includes('model') || 
            error.message.includes('overload') ||
            error.message.includes('capacity')) {
          
          this.modelIndex++; // Move to next model
          this.retryCount = 0;
          console.log(`🔄 Switching to next model...`);
          continue;
        }

        // For other errors, retry with same model
        this.retryCount++;
        if (this.retryCount >= this.maxRetries) {
          console.log(`⏩ Max retries reached for current model, switching...`);
          this.modelIndex++;
          this.retryCount = 0;
        } else {
          console.log(`🔄 Retrying model ${currentModel} (${this.retryCount}/${this.maxRetries})`);
          await this.delay(1000); // Wait 1 second before retry
        }
      }
    }

    // If all models failed
    return {
      success: false,
      error: "All models failed. Please try again later.",
      models_tried: FREE_MODELS.length
    };
  }

  


  resetModels() {
    this.modelIndex = 0;
    this.retryCount = 0;
    console.log('🔄 Model selector reset to first model');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAvailableModels() {
    return {
      chat: FREE_MODELS,
      audio: AUDIO_MODELS,
      tts: TTS_MODELS
    };
  }

  getCurrentModel() {
    return this.modelIndex < FREE_MODELS.length ? FREE_MODELS[this.modelIndex] : null;
  }
}

