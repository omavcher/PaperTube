// utils/groqMultiModel.js
const Groq = require("groq-sdk");
const dotenv = require("dotenv");
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    this.requestTimeout = 30000; // 30 seconds timeout
  }

  /**
   * Main chat completion method with model fallback
   */
  async chatCompletion(messages, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 1024,
      top_p = 1,
      stream = false,
      timeout = this.requestTimeout
    } = options;

    // Reset model index if we've exhausted all models in previous calls
    if (this.modelIndex >= FREE_MODELS.length) {
      this.resetModels();
    }

    while (this.modelIndex < FREE_MODELS.length) {
      const currentModel = FREE_MODELS[this.modelIndex];
      
      try {
        console.log(`🔄 Trying model: ${currentModel} (${this.modelIndex + 1}/${FREE_MODELS.length})`);
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
        });

        // Create chat completion promise
        const chatPromise = client.chat.completions.create({
          model: currentModel,
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens,
          top_p: top_p,
          stream: stream
        });

        // Race between chat completion and timeout
        const result = await Promise.race([chatPromise, timeoutPromise]);

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

        // Check if it's a timeout error
        if (error.message.includes('timeout')) {
          console.log(`⏰ Timeout with model ${currentModel}, switching to next model...`);
          this.modelIndex++;
          this.retryCount = 0;
          continue;
        }

        // Check if it's a token limit error or model-specific error
        if (error.message.includes('token') || 
            error.message.includes('model') || 
            error.message.includes('overload') ||
            error.message.includes('capacity') ||
            error.message.includes('not found') ||
            error.message.includes('unavailable')) {
          
          this.modelIndex++;
          this.retryCount = 0;
          console.log(`🔄 Switching to next model due to: ${error.message}`);
          continue;
        }

        // For other errors, retry with same model
        this.retryCount++;
        if (this.retryCount >= this.maxRetries) {
          console.log(`⏩ Max retries reached for ${currentModel}, switching...`);
          this.modelIndex++;
          this.retryCount = 0;
        } else {
          console.log(`🔄 Retrying model ${currentModel} (${this.retryCount}/${this.maxRetries})`);
          await this.delay(1000 * this.retryCount); // Exponential backoff
        }
      }
    }

    // If all models failed
    return {
      success: false,
      error: "All models failed. Please try again later.",
      models_tried: FREE_MODELS.length,
      last_error: "Exhausted all available models"
    };
  }

  /**
   * Audio transcription with fallback
   */
  async audioTranscription(audioFile, options = {}) {
    const {
      language = 'en',
      prompt = '',
      response_format = 'json',
      temperature = 0,
      timeout = this.requestTimeout
    } = options;

    for (const model of AUDIO_MODELS) {
      try {
        console.log(`🎵 Trying audio model: ${model}`);
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Audio transcription timeout after ${timeout}ms`)), timeout);
        });

        // Create transcription promise
        const transcriptionPromise = client.audio.transcriptions.create({
          file: audioFile,
          model: model,
          language: language,
          prompt: prompt,
          response_format: response_format,
          temperature: temperature
        });

        // Race between transcription and timeout
        const result = await Promise.race([transcriptionPromise, timeoutPromise]);

        console.log(`✅ Audio transcription success with: ${model}`);
        return {
          success: true,
          model: model,
          text: result.text,
          fullResponse: result
        };

      } catch (error) {
        console.log(`❌ Audio model ${model} failed: ${error.message}`);
        
        // If it's a rate limit, wait and continue with next model
        if (error.status === 429) {
          const retryAfter = error.headers?.['retry-after'] || 2;
          console.log(`⏳ Audio rate limit hit. Waiting ${retryAfter} seconds...`);
          await this.delay(retryAfter * 1000);
        }
        continue; // Try next audio model
      }
    }

    return {
      success: false,
      error: "All audio models failed. Please try again later.",
      models_tried: AUDIO_MODELS.length
    };
  }

  /**
   * Text to speech with fallback
   */
  async textToSpeech(text, options = {}) {
    const {
      voice = "alloy",
      speed = 1.0,
      response_format = "mp3",
      timeout = this.requestTimeout
    } = options;

    for (const model of TTS_MODELS) {
      try {
        console.log(`🔊 Trying TTS model: ${model}`);
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`TTS timeout after ${timeout}ms`)), timeout);
        });

        // Create TTS promise
        const ttsPromise = client.audio.speech.create({
          model: model,
          input: text,
          voice: voice,
          speed: speed,
          response_format: response_format
        });

        // Race between TTS and timeout
        const result = await Promise.race([ttsPromise, timeoutPromise]);

        console.log(`✅ TTS success with: ${model}`);
        return {
          success: true,
          model: model,
          audio: result,
          fullResponse: result
        };

      } catch (error) {
        console.log(`❌ TTS model ${model} failed: ${error.message}`);
        
        // If it's a rate limit, wait and continue with next model
        if (error.status === 429) {
          const retryAfter = error.headers?.['retry-after'] || 2;
          console.log(`⏳ TTS rate limit hit. Waiting ${retryAfter} seconds...`);
          await this.delay(retryAfter * 1000);
        }
        continue; // Try next TTS model
      }
    }

    return {
      success: false,
      error: "All TTS models failed. Please try again later.",
      models_tried: TTS_MODELS.length
    };
  }

  /**
   * Batch processing for multiple requests
   */
  async batchChatCompletion(requests) {
    const results = [];
    
    for (const request of requests) {
      try {
        const result = await this.chatCompletion(request.messages, request.options);
        results.push(result);
        
        // Small delay between batch requests to avoid rate limits
        await this.delay(100);
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Get model info and capabilities
   */
  getModelInfo(modelName) {
    const allModels = [...FREE_MODELS, ...AUDIO_MODELS, ...TTS_MODELS];
    const model = allModels.find(m => m === modelName);
    
    if (!model) {
      return null;
    }
    
    const info = {
      name: model,
      type: this.getModelType(model),
      status: 'available'
    };
    
    // Add specific capabilities based on model type
    if (info.type === 'chat') {
      info.capabilities = ['text-generation', 'chat'];
      info.max_tokens = this.estimateMaxTokens(model);
    } else if (info.type === 'audio') {
      info.capabilities = ['audio-transcription'];
    } else if (info.type === 'tts') {
      info.capabilities = ['text-to-speech'];
    }
    
    return info;
  }

  /**
   * Estimate max tokens for a model
   */
  estimateMaxTokens(modelName) {
    const tokenLimits = {
      'llama-3.1-8b-instant': 8192,
      'llama-3.3-70b-versatile': 8192,
      'meta-llama/llama-4-maverick-17b-128e-instruct': 16384,
      'meta-llama/llama-4-scout-17b-16e-instruct': 16384,
      'qwen/qwen3-32b': 8192,
      'groq/compound': 8192,
      'groq/compound-mini': 4096,
      'default': 4096
    };
    
    return tokenLimits[modelName] || tokenLimits.default;
  }

  /**
   * Get model type
   */
  getModelType(modelName) {
    if (FREE_MODELS.includes(modelName)) return 'chat';
    if (AUDIO_MODELS.includes(modelName)) return 'audio';
    if (TTS_MODELS.includes(modelName)) return 'tts';
    return 'unknown';
  }

  /**
   * Reset model selector to first model
   */
  resetModels() {
    this.modelIndex = 0;
    this.retryCount = 0;
    console.log('🔄 Model selector reset to first model');
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all available models
   */
  getAvailableModels() {
    return {
      chat: FREE_MODELS,
      audio: AUDIO_MODELS,
      tts: TTS_MODELS
    };
  }

  /**
   * Get current active model
   */
  getCurrentModel() {
    return this.modelIndex < FREE_MODELS.length ? FREE_MODELS[this.modelIndex] : null;
  }

  /**
   * Health check for models
   */
  async healthCheck() {
    const health = {
      chat: {},
      audio: {},
      tts: {},
      overall: 'healthy'
    };
    
    // Test chat models with a simple request
    const testMessages = [
      { role: "user", content: "Say 'OK' if you're working." }
    ];
    
    try {
      const testResult = await this.chatCompletion(testMessages, {
        max_tokens: 10,
        timeout: 10000
      });
      
      health.chat.status = testResult.success ? 'healthy' : 'unhealthy';
      health.chat.active_model = testResult.model;
    } catch (error) {
      health.chat.status = 'unhealthy';
      health.chat.error = error.message;
      health.overall = 'degraded';
    }
    
    return health;
  }

  /**
   * Set custom model priority
   */
  setModelPriority(priorityList) {
    const validModels = priorityList.filter(model => 
      FREE_MODELS.includes(model) || 
      AUDIO_MODELS.includes(model) || 
      TTS_MODELS.includes(model)
    );
    
    if (validModels.length > 0) {
      // Reorder models based on priority
      const newChatModels = [
        ...validModels.filter(model => FREE_MODELS.includes(model)),
        ...FREE_MODELS.filter(model => !validModels.includes(model))
      ];
      
      const newAudioModels = [
        ...validModels.filter(model => AUDIO_MODELS.includes(model)),
        ...AUDIO_MODELS.filter(model => !validModels.includes(model))
      ];
      
      const newTTSModels = [
        ...validModels.filter(model => TTS_MODELS.includes(model)),
        ...TTS_MODELS.filter(model => !validModels.includes(model))
      ];
      
      // Update the arrays (in a real implementation, you might want to be more careful here)
      FREE_MODELS.length = 0;
      FREE_MODELS.push(...newChatModels);
      
      AUDIO_MODELS.length = 0;
      AUDIO_MODELS.push(...newAudioModels);
      
      TTS_MODELS.length = 0;
      TTS_MODELS.push(...newTTSModels);
      
      this.resetModels();
      console.log('✅ Model priority updated');
    }
  }
}

module.exports = GroqMultiModel;