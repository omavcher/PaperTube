const Note = require("../models/Note");
const AiChat = require("../models/AiChat");
const Groq = require("groq-sdk");

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_CHAT_API_KEY });

// List of available Groq models with their token limits and priorities
const GROQ_MODELS = [
  {
    name: "llama-3.3-70b-versatile",
    maxTokens: 128000,
    priority: 1,
    costPerToken: 0.0000007 // Lower cost for better models
  },
  {
    name: "meta-llama/llama-4-maverick-17b-128e-instruct",
    maxTokens: 128000,
    priority: 2,
    costPerToken: 0.0000004
  },
  {
    name: "llama-3.1-8b-instant",
    maxTokens: 8192, // Lower token limit
    priority: 3,
    costPerToken: 0.0000001
  },
  {
    name: "meta-llama/llama-4-scout-17b-16e-instruct",
    maxTokens: 32000,
    priority: 4,
    costPerToken: 0.0000003
  },
  {
    name: "qwen/qwen3-32b",
    maxTokens: 32000,
    priority: 5,
    costPerToken: 0.0000005
  },
  {
    name: "moonshotai/kimi-k2-instruct",
    maxTokens: 128000,
    priority: 6,
    costPerToken: 0.0000006
  },
];

class GroqModelHandler {
  constructor() {
    this.modelIndex = 0;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.modelCooldowns = new Map(); // Track model cooldowns
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.totalTokensUsed = 0;
    this.dailyLimit = 100000; // Groq free tier daily limit
    this.lastReset = Date.now();
  }

  // Estimate token count (rough approximation)
  estimateTokens(text) {
    return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
  }

  // Check if model is in cooldown
  isModelInCooldown(modelName) {
    const cooldownUntil = this.modelCooldowns.get(modelName);
    return cooldownUntil && Date.now() < cooldownUntil;
  }

  // Put model in cooldown
  setModelCooldown(modelName, seconds) {
    const cooldownUntil = Date.now() + (seconds * 1000);
    this.modelCooldowns.set(modelName, cooldownUntil);
    console.log(`⏳ Model ${modelName} in cooldown for ${seconds} seconds`);
  }

  // Get available models sorted by priority and excluding cooldowns
  getAvailableModels(promptTokenCount) {
    return GROQ_MODELS
      .filter(model => {
        // Skip models in cooldown
        if (this.isModelInCooldown(model.name)) {
          return false;
        }
        // Skip models that can't handle the token count
        if (promptTokenCount > model.maxTokens * 0.8) { // Leave 20% buffer
          return false;
        }
        return true;
      })
      .sort((a, b) => a.priority - b.priority); // Lower priority number = higher priority
  }

  // Smart prompt optimization
  optimizePrompt(prompt, maxTokens = 6000) {
    const estimatedTokens = this.estimateTokens(prompt);
    
    if (estimatedTokens <= maxTokens) {
      return prompt; // No optimization needed
    }

    console.log(`📝 Optimizing prompt: ${estimatedTokens} tokens -> target ${maxTokens}`);
    
    // Strategy: Remove less critical parts while keeping core context
    const lines = prompt.split('\n');
    const coreSections = [];
    let currentTokens = 0;

    // Priority sections (keep these)
    const highPriorityKeywords = [
      '## Available Data',
      'Note Content',
      'YouTube Transcript',
      'User Message',
      '## Instructions'
    ];

    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      
      // Always include high-priority sections
      const isHighPriority = highPriorityKeywords.some(keyword => 
        line.includes(keyword)
      );

      if (isHighPriority || currentTokens + lineTokens <= maxTokens * 0.7) {
        coreSections.push(line);
        currentTokens += lineTokens;
      } else {
        // For non-critical sections, include only the first part
        if (line.length > 100) {
          const shortened = line.substring(0, 100) + '... [truncated]';
          coreSections.push(shortened);
          currentTokens += this.estimateTokens(shortened);
        }
      }

      if (currentTokens >= maxTokens * 0.9) {
        break; // Stop if we're close to the limit
      }
    }

    const optimizedPrompt = coreSections.join('\n');
    console.log(`✅ Optimized prompt: ${this.estimateTokens(optimizedPrompt)} tokens`);
    
    return optimizedPrompt;
  }

  async generateContent(originalPrompt, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 500,
      top_p = 1,
    } = options;

    // Estimate tokens and optimize prompt if needed
    const estimatedTokens = this.estimateTokens(originalPrompt);
    console.log(`📊 Original prompt tokens: ${estimatedTokens}`);

    // Get available models that can handle this request
    const availableModels = this.getAvailableModels(estimatedTokens);
    
    if (availableModels.length === 0) {
      return {
        success: false,
        error: "All suitable models are currently unavailable. Please try again in a few minutes.",
        models_tried: GROQ_MODELS.length
      };
    }

    console.log(`🔄 Available models: ${availableModels.map(m => m.name).join(', ')}`);

    for (const model of availableModels) {
      try {
        console.log(`🎯 Trying Groq model: ${model.name} (Priority: ${model.priority})`);
        
        // Optimize prompt for this specific model
        const optimizedPrompt = this.optimizePrompt(
          originalPrompt, 
          Math.min(model.maxTokens * 0.7, 6000) // Use 70% of model's capacity or 6k max
        );

        // Check daily limit
        if (this.totalTokensUsed > this.dailyLimit * 0.9) {
          console.log(`⚠️ Approaching daily token limit: ${this.totalTokensUsed}/${this.dailyLimit}`);
        }

        const result = await groq.chat.completions.create({
          model: model.name,
          messages: [{ role: "user", content: optimizedPrompt }],
          temperature: temperature,
          max_tokens: max_tokens,
          top_p: top_p,
        });

        // Track token usage
        if (result.usage) {
          this.totalTokensUsed += result.usage.total_tokens;
          console.log(`📈 Tokens used: ${result.usage.total_tokens} (Total: ${this.totalTokensUsed})`);
        }

        console.log(`✅ Success with model: ${model.name}`);
        this.retryCount = 0; // Reset retry count on success
        
        return {
          success: true,
          model: model.name,
          content: result.choices[0].message.content,
          usage: result.usage,
          promptOptimized: optimizedPrompt !== originalPrompt
        };

      } catch (error) {
        console.log(`❌ Model ${model.name} failed: ${error.message}`);
        
        // Handle different types of errors
        if (error.status === 429) {
          // Rate limit error
          const retryAfter = this.extractRetryAfter(error) || 30;
          console.log(`⏳ Rate limit hit for ${model.name}. Cooldown: ${retryAfter}s`);
          this.setModelCooldown(model.name, retryAfter);
          continue; // Try next model
        }

        if (error.status === 413) {
          // Token limit error
          console.log(`📝 Token limit exceeded for ${model.name}`);
          this.setModelCooldown(model.name, 60); // 1 minute cooldown
          continue; // Try next model
        }

        if (error.message.includes('overload') || error.message.includes('capacity')) {
          // Model capacity error
          console.log(`🚧 Model ${model.name} at capacity`);
          this.setModelCooldown(model.name, 120); // 2 minutes cooldown
          continue; // Try next model
        }

        // For other unexpected errors, short cooldown
        console.log(`⚡ Unexpected error with ${model.name}, short cooldown`);
        this.setModelCooldown(model.name, 10); // 10 seconds cooldown
      }
    }

    // If all available models failed
    return {
      success: false,
      error: "All available Groq models are currently busy. Please try again in a few minutes.",
      models_tried: availableModels.length,
      estimatedTokens: estimatedTokens
    };
  }

  // Extract retry-after from error response
  extractRetryAfter(error) {
    try {
      // Try to parse from error message first
      const message = error.message || '';
      const timeMatch = message.match(/try again in ([\d.]+)(s|m)/);
      if (timeMatch) {
        let seconds = parseFloat(timeMatch[1]);
        if (timeMatch[2] === 'm') {
          seconds *= 60;
        }
        return Math.ceil(seconds);
      }

      // Try from headers
      if (error.headers && error.headers['retry-after']) {
        return parseInt(error.headers['retry-after']);
      }

      // Default fallbacks based on error type
      if (error.status === 429) {
        return 30; // 30 seconds for rate limits
      }
      if (error.status === 413) {
        return 60; // 1 minute for token limits
      }

      return 10; // Default 10 seconds
    } catch (parseError) {
      return 30; // Fallback
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  resetModels() {
    this.modelCooldowns.clear();
    this.retryCount = 0;
    console.log('🔄 Groq model cooldowns cleared');
  }

  // Reset daily token counter (call this daily)
  resetDailyTokens() {
    this.totalTokensUsed = 0;
    this.lastReset = Date.now();
    console.log('🔄 Daily token counter reset');
  }

  getStatus() {
    const availableModels = this.getAvailableModels(1000); // Test with 1k tokens
    return {
      totalTokensUsed: this.totalTokensUsed,
      dailyLimit: this.dailyLimit,
      availableModels: availableModels.map(m => m.name),
      cooldownModels: Array.from(this.modelCooldowns.entries())
        .filter(([_, until]) => Date.now() < until)
        .map(([name, until]) => ({
          name,
          cooldownRemaining: Math.ceil((until - Date.now()) / 1000)
        })),
      retryCount: this.retryCount
    };
  }
}

// Initialize Groq handler
const groqHandler = new GroqModelHandler();

// Auto-reset token counter every 24 hours
setInterval(() => {
  groqHandler.resetDailyTokens();
}, 24 * 60 * 60 * 1000);

exports.getMessages = async (req, res) => {
  try {
    const { noteId } = req.params;
    if (!noteId) {
      return res.status(400).json({ error: "noteId is required" });
    }
    const aiChat = await AiChat.findOne({ noteId });
    if (!aiChat) {
      return res.json({ messages: [] });
    }
    res.json({ messages: aiChat.messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.handleMessage = async (req, res) => {
  try {
    const { noteId, message } = req.body;
    if (!noteId || !message) {
      return res.status(400).json({ error: "noteId and message are required" });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Fetch or create chat document
    let aiChat = await AiChat.findOne({ noteId });
    if (!aiChat) {
      aiChat = new AiChat({ noteId, messages: [] });
    }

    // Prepare chat history as a string
    const chatHistoryStr =
      aiChat.messages
        .map((m) => `${m.role === "user" ? "User" : "YT2PDF Ai guide"}: ${m.content}`)
        .join("\n") || "No previous chat history.";

    // Smart context selection - only include recent chat history
    const recentChatHistory = aiChat.messages
      .slice(-4) // Last 2 exchanges (4 messages)
      .map((m) => `${m.role === "user" ? "User" : "YT2PDF Ai guide"}: ${m.content}`)
      .join("\n") || "No recent chat history.";

    // Build AI prompt with optimized context
    const prompt = `
You are the **YT2PDF Ai guide**, a dedicated study assistant created by Om Awchar. Your primary function is to help the user study and review their created PDF notes. Your tone is **supportive, knowledgeable, and academically focused**.

**CRITICAL RULE:** Do not engage in casual conversation or answer questions unrelated to the study material provided in the 'Available Data' section below. If the user asks a question not covered by the data, politely state that the information isn't available in the current notes/transcript.

---

## Available Data (Grounding)
- **Note Content (Key Excerpts):**
${note.content.substring(0, 2000)}... [Content truncated for efficiency]

- **YouTube Transcript (Key Excerpts):**
${(note.transcript || "No raw transcript available.").substring(0, 1500)}... [Transcript truncated for efficiency]

- **Video Link:**
${note.videoUrl || "No video available"}

- **Recent Chat History:**
${recentChatHistory}

- **User Message (Current Query):**
${message}

---

## Instructions for Response
1.  **Persona:** Respond as the **YT2PDF Ai guide**.
2.  **Focus:** Use the **Note Content** and **Transcript** as the *only* source of truth.
3.  **Structure:** Use **Markdown** with appropriate subheadings and bullet points.
4.  **Explanation Style:** Create a **short, educational guide** explaining the topic.
5.  **Conciseness:** Be direct and avoid unnecessary filler.

If someone asks about your technology or developer, mention Om Awchar.

---

## Output Requirements:
* Use Markdown (subheadings, lists)
* Answer based only on provided data
* Maintain supportive academic tone
* Keep response under 400 words
`;

    // Generate AI response using Groq with smart error handling
    const result = await groqHandler.generateContent(prompt, {
      max_tokens: 800, // Reduced from 1024
      temperature: 0.7,
    });

    if (!result.success) {
      // Provide helpful error messages based on the failure type
      let userErrorMessage = "AI service temporarily unavailable. Please try again in a few minutes.";
      
      if (result.error.includes("token") || result.estimatedTokens > 10000) {
        userErrorMessage = "This conversation has become too long for AI processing. Please start a new chat or ask a more specific question.";
      }
      
      return res.status(503).json({ 
        error: userErrorMessage,
        retrySuggested: true
      });
    }

    let assistantMessage = result.content || "Sorry, I couldn't generate a response at this time. Please try again.";

    // Extract YouTube link (if any)
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)(?:[^\s]*)?)/g;
    const videoLinks = assistantMessage.match(youtubeRegex);
    const videoLink = note.videoUrl || null;

    // Remove the link from the message if you want a clean text
    const cleanMessage = assistantMessage.replace(youtubeRegex, "").trim();

    // Save both user and assistant messages
    aiChat.messages.push({ 
      role: "user", 
      content: message,
      timestamp: new Date()
    });
    aiChat.messages.push({ 
      role: "assistant", 
      content: cleanMessage, 
      videoLink: videoLink,
      modelUsed: result.model,
      promptOptimized: result.promptOptimized,
      timestamp: new Date()
    });

    // Limit chat history to prevent token overflow
    if (aiChat.messages.length > 20) {
      aiChat.messages = aiChat.messages.slice(-20); // Keep last 20 messages
    }

    await aiChat.save();

    res.json({
      assistantMessage: cleanMessage,
      videoLink: videoLink,
      modelUsed: result.model,
      promptOptimized: result.promptOptimized,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    
    // Reset model selector on unexpected errors
    groqHandler.resetModels();
    
    res.status(500).json({ 
      error: "Service temporarily unavailable. Please try again in a moment.",
      retrySuggested: true
    });
  }
};

// Update feedback on an assistant message
exports.handleFeedback = async (req, res) => {
  try {
    const { noteId, messageId, feedback } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: "noteId is required" });
    }

    const allowed = ["good", "bad", null];
    if (!allowed.includes(feedback)) {
      return res.status(400).json({ error: "feedback must be 'good', 'bad', or null" });
    }

    const aiChat = await AiChat.findOne({ noteId });
    if (!aiChat) {
      return res.status(404).json({ error: "Chat thread not found" });
    }

    let targetIndex = -1;

    if (messageId) {
      targetIndex = aiChat.messages.findIndex((m) => String(m._id) === String(messageId));
    } else {
      // Default to the latest assistant message
      for (let i = aiChat.messages.length - 1; i >= 0; i -= 1) {
        if (aiChat.messages[i].role === "assistant") {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex === -1) {
      return res.status(400).json({ error: "Target message not found" });
    }

    aiChat.messages[targetIndex].feedback = feedback;
    await aiChat.save();

    return res.json({
      updated: {
        _id: aiChat.messages[targetIndex]._id,
        role: aiChat.messages[targetIndex].role,
        content: aiChat.messages[targetIndex].content,
        feedback: aiChat.messages[targetIndex].feedback,
        timestamp: aiChat.messages[targetIndex].timestamp,
        modelUsed: aiChat.messages[targetIndex].modelUsed,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Utility function to reset Groq models
exports.resetGroqModels = async (req, res) => {
  try {
    groqHandler.resetModels();
    res.json({ message: "Groq models reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset models" });
  }
};

// Get current Groq model status
exports.getModelStatus = async (req, res) => {
  try {
    const status = groqHandler.getStatus();
    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get model status" });
  }
};

// Manual token reset (for admin purposes)
exports.resetTokenCounter = async (req, res) => {
  try {
    groqHandler.resetDailyTokens();
    res.json({ message: "Token counter reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset token counter" });
  }
};