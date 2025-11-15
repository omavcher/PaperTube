// src/utils/geminiClient.js
const { GoogleGenAI } = require("@google/genai");
const GeminiAPIKeyManager = require("./apiKeyManager");

class GeminiClient {
  constructor() {
    this.keyManager = new GeminiAPIKeyManager();
    this.ai = null;
    this.initializeAI();
  }

  initializeAI() {
    const currentKey = this.keyManager.getCurrentKey();
    if (!currentKey) {
      throw new Error('No valid Gemini API keys found');
    }
    
    this.ai = new GoogleGenAI({
      apiKey: currentKey
    });
  }

  async makeRequest(operation, ...args) {
    const maxRetries = this.keyManager.apiKeys.length * 2; // Allow cycling through keys twice
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt + 1} with key ${this.keyManager.currentKeyIndex + 1}`);
        }

        const result = await this.ai.models[operation](...args);
        return result;

      } catch (error) {
        lastError = error;
        
        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          const retryDelay = this.extractRetryDelay(error);
          console.warn(`⏳ Rate limit hit on key ${this.keyManager.currentKeyIndex + 1}. Retry in ${retryDelay}ms`);
          
          this.keyManager.markKeyFailed(this.keyManager.currentKeyIndex, retryDelay);
          this.initializeAI(); // Reinitialize with new key
          
          // Wait before retrying with new key
          if (retryDelay > 0) {
            await this.delay(Math.min(retryDelay, 5000)); // Max 5 second delay
          }
          
          continue; // Retry with next key
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    // If we exhaust all retries
    throw new Error(`All API keys exhausted. Last error: ${lastError.message}`);
  }

  isRateLimitError(error) {
    return error.status === 429 || 
           error.message?.includes('429') ||
           error.message?.includes('quota') ||
           error.message?.includes('RESOURCE_EXHAUSTED') ||
           error.message?.includes('rate limit');
  }

  extractRetryDelay(error) {
    // Extract retry delay from error message
    const delayMatch = error.message?.match(/Please retry in ([0-9.]+)s/) ||
                      error.message?.match(/retryDelay["']?:\s*["']?([0-9.]+)s/);
    
    if (delayMatch) {
      return parseFloat(delayMatch[1]) * 1000; // Convert to milliseconds
    }
    
    // Default exponential backoff
    return Math.min(1000 * Math.pow(2, this.keyManager.failedKeys.size), 30000);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Proxy methods for common operations
  async generateContent(...args) {
    return this.makeRequest('generateContent', ...args);
  }
}

module.exports = GeminiClient;