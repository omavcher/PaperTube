// services/openRouterService.js
// Centralized, resilient OpenRouter API client with automatic telemetry, model failover, and capacity enforcement
const capacityService = require("./capacityService");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// Accurate pricing per 1M tokens (USD) fallback if OpenRouter omits usage.cost
const MODEL_PRICING = {
  "google/gemini-2.0-flash-lite": { input: 0.075, output: 0.30 },
  "google/gemini-2.0-flash": { input: 0.10, output: 0.40 },
  "deepseek/deepseek-chat": { input: 0.14, output: 0.28 },
  "deepseek/deepseek-v3": { input: 0.14, output: 0.28 },
  "deepseek/deepseek-v4-flash": { input: 0.14, output: 0.28 },
  "openai/gpt-4o-mini": { input: 0.15, output: 0.60 },
  "meta-llama/llama-3.3-70b-instruct": { input: 0.12, output: 0.30 },
  "mistralai/mistral-small-24b-instruct-2501": { input: 0.10, output: 0.30 },
  "qwen/qwen-2.5-72b-instruct": { input: 0.35, output: 0.40 },
  default: { input: 0.15, output: 0.45 },
};

/**
 * Compute USD cost from tokens if not provided by OpenRouter
 */
function calculateCostUSD(model, promptTokens = 0, completionTokens = 0) {
  const rates = MODEL_PRICING[model] || MODEL_PRICING.default;
  const inputCost = (promptTokens / 1000000) * rates.input;
  const outputCost = (completionTokens / 1000000) * rates.output;
  return Number((inputCost + outputCost).toFixed(7));
}

/**
 * Custom error class for capacity exhaustion
 */
class CapacityExceededError extends Error {
  constructor(payload) {
    super(payload.message || "AI Study Capacity Reached");
    this.name = "CapacityExceededError";
    this.code = "QUOTA_EXCEEDED";
    this.status = 403;
    this.payload = payload;
  }
}

/**
 * Central non-streaming OpenRouter execution with model cascading and capacity tracking
 */
async function callChatCompletion({
  userId,
  feature = "other",
  models = ["google/gemini-2.0-flash", "deepseek/deepseek-chat"],
  messages,
  options = {},
  metadata = {},
}) {
  const {
    temperature = 0.3,
    max_tokens = 3500,
    timeout = 30000,
    response_format = undefined,
    skipCapacityCheck = false,
  } = options;

  // 1. Pre-flight capacity check
  if (!skipCapacityCheck && userId && userId !== "guest") {
    const check = await capacityService.checkCanExecute(userId, feature, metadata);
    if (!check.allowed) {
      throw new CapacityExceededError(check.errorPayload);
    }
  }

  const modelList = Array.isArray(models) ? models : [models];
  let lastError = null;

  for (const model of modelList) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const requestBody = {
        model,
        messages,
        temperature,
        max_tokens,
        stream: false,
      };
      if (response_format) {
        requestBody.response_format = response_format;
      }

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://paperxify.com",
          "X-Title": "Paperxify Autonomous Engine",
        },
        body: JSON.stringify(requestBody),
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(errJson)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenRouter model");

      // Extract token usage & exact cost
      const usage = data.usage || {};
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || promptTokens + completionTokens;

      const callCost = typeof usage.cost === "number" && usage.cost > 0
        ? usage.cost
        : calculateCostUSD(model, promptTokens, completionTokens);

      console.log(`✅ [OpenRouter] ${feature} succeeded with ${model} (${totalTokens} tokens, $${callCost.toFixed(6)})`);

      // Record to AiUsageLog and atomically increment user capacity
      if (userId && userId !== "guest") {
        await capacityService.recordUsage({
          userId,
          feature,
          model,
          type: "text",
          promptTokens,
          completionTokens,
          totalTokens,
          costUSD: callCost,
          status: "success",
          metadata: { ...metadata, model },
          unitsAlreadyReserved: Boolean(options.skipCapacityCheck || options.unitsAlreadyReserved),
        });
      }

      return {
        content,
        model,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          costUSD: callCost,
        },
      };
    } catch (err) {
      console.warn(`⚠️ [OpenRouter] Model ${model} failed for ${feature}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`All OpenRouter models failed for ${feature}. Last error: ${lastError?.message}`);
}

/**
 * Central streaming OpenRouter execution with stream_options: { include_usage: true }
 */
async function streamChatCompletion({
  userId,
  feature = "agent",
  models = ["google/gemini-2.0-flash", "openai/gpt-4o-mini"],
  messages,
  options = {},
  metadata = {},
  onChunk,
  onDone,
}) {
  const {
    temperature = 0.35,
    max_tokens = 3000,
    timeout = 35000,
    skipCapacityCheck = false,
  } = options;

  // 1. Pre-flight capacity check
  if (!skipCapacityCheck && userId && userId !== "guest") {
    const check = await capacityService.checkCanExecute(userId, feature, metadata);
    if (!check.allowed) {
      throw new CapacityExceededError(check.errorPayload);
    }
  }

  const modelList = Array.isArray(models) ? models : [models];
  let fullText = "";
  let lastError = null;
  let finalUsage = null;
  let successfulModel = modelList[0];

  for (const model of modelList) {
    if (fullText) break;
    try {
      console.log(`🤖 [OpenRouter Stream] ${feature} calling model: ${model}`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://paperxify.com",
          "X-Title": "Paperxify Stream Engine",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: true,
          stream_options: { include_usage: true }, // OpenRouter sends usage in final SSE chunk
        }),
      });

      clearTimeout(timer);

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;
            if (trimmed === "data: [DONE]") continue;

            if (trimmed.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content || "";
                if (delta) {
                  fullText += delta;
                  if (onChunk) onChunk(delta);
                }

                // Capture usage from final SSE chunk if present
                if (parsed.usage) {
                  finalUsage = parsed.usage;
                }
              } catch {}
            }
          }
        }

        if (fullText.trim().length > 0) {
          successfulModel = model;
          break;
        }
      }
    } catch (err) {
      console.warn(`⚠️ [OpenRouter Stream] Model ${model} failed for ${feature}:`, err.message);
      lastError = err;
    }
  }

  if (!fullText.trim()) {
    throw new Error(`All streaming models failed for ${feature}. Last error: ${lastError?.message}`);
  }

  // Token & cost calculations
  const promptTokens = finalUsage?.prompt_tokens || Math.round(JSON.stringify(messages).length / 4);
  const completionTokens = finalUsage?.completion_tokens || Math.round(fullText.length / 4);
  const totalTokens = finalUsage?.total_tokens || promptTokens + completionTokens;

  const costUSD = typeof finalUsage?.cost === "number" && finalUsage.cost > 0
    ? finalUsage.cost
    : calculateCostUSD(successfulModel, promptTokens, completionTokens);

  console.log(`✅ [OpenRouter Stream] ${feature} complete (${totalTokens} tokens, $${costUSD.toFixed(6)})`);

  // Record to AiUsageLog and increment capacity
  if (userId && userId !== "guest") {
    await capacityService.recordUsage({
      userId,
      feature,
      model: successfulModel,
      type: "text",
      promptTokens,
      completionTokens,
      totalTokens,
      costUSD,
      status: "success",
      metadata: { ...metadata, model: successfulModel },
      unitsAlreadyReserved: Boolean(options.skipCapacityCheck || options.unitsAlreadyReserved),
    });
  }

  if (onDone) {
    onDone({
      fullText,
      model: successfulModel,
      usage: { promptTokens, completionTokens, totalTokens, costUSD },
    });
  }

  return {
    content: fullText,
    model: successfulModel,
    usage: { promptTokens, completionTokens, totalTokens, costUSD },
  };
}

module.exports = {
  callChatCompletion,
  streamChatCompletion,
  calculateCostUSD,
  CapacityExceededError,
};
