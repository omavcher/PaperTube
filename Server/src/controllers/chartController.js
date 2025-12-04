const Note = require("../models/Note");
const ChartSession = require("../models/ChartSession");
const Groq = require("groq-sdk");

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_CHART_API_KEY });

// List of available Groq models optimized for chart generation
const GROQ_CHART_MODELS = [
  {
    name: "llama-3.3-70b-versatile",
    maxTokens: 128000,
    priority: 1,
    costPerToken: 0.0000007,
    chartCapability: "excellent" // Best for complex chart logic
  },
  {
    name: "meta-llama/llama-4-maverick-17b-128e-instruct",
    maxTokens: 128000,
    priority: 2,
    costPerToken: 0.0000004,
    chartCapability: "good"
  },
  {
    name: "qwen/qwen3-32b",
    maxTokens: 32000,
    priority: 3,
    costPerToken: 0.0000005,
    chartCapability: "excellent" // Qwen models are good at structured outputs
  },
  {
    name: "moonshotai/kimi-k2-instruct",
    maxTokens: 128000,
    priority: 4,
    costPerToken: 0.0000006,
    chartCapability: "good"
  },
  {
    name: "llama-3.1-8b-instant",
    maxTokens: 8192,
    priority: 5,
    costPerToken: 0.0000001,
    chartCapability: "basic" // For simple charts only
  }
];

class ChartModelHandler {
  constructor() {
    this.modelIndex = 0;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.modelCooldowns = new Map();
    this.totalTokensUsed = 0;
    this.dailyLimit = 50000; // Lower limit for chart generation
    this.lastReset = Date.now();
  }

  // Estimate token count
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
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
    console.log(`⏳ Chart Model ${modelName} in cooldown for ${seconds} seconds`);
  }

  // Get available models for chart generation
  getAvailableModels(promptTokenCount, chartComplexity = "medium") {
    return GROQ_CHART_MODELS
      .filter(model => {
        // Skip models in cooldown
        if (this.isModelInCooldown(model.name)) {
          return false;
        }
        
        // Skip models that can't handle the token count
        if (promptTokenCount > model.maxTokens * 0.7) {
          return false;
        }
        
        // Filter by chart capability based on complexity
        if (chartComplexity === "high" && model.chartCapability === "basic") {
          return false;
        }
        if (chartComplexity === "medium" && model.chartCapability === "basic") {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => a.priority - b.priority);
  }

  // Optimize prompt for chart generation
  optimizeChartPrompt(prompt, maxTokens = 5000) {
    const estimatedTokens = this.estimateTokens(prompt);
    
    if (estimatedTokens <= maxTokens) {
      return prompt;
    }

    console.log(`📝 Optimizing chart prompt: ${estimatedTokens} tokens -> target ${maxTokens}`);
    
    const lines = prompt.split('\n');
    const coreSections = [];
    let currentTokens = 0;

    // High priority sections for chart generation
    const highPriorityKeywords = [
      '## CHART GENERATION PROMPT',
      '## AVAILABLE DATA',
      'Note Content',
      'User Chart Request',
      '## MERMAID SYNTAX RULES',
      'chart-type:'
    ];

    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      
      const isHighPriority = highPriorityKeywords.some(keyword => 
        line.includes(keyword)
      );

      if (isHighPriority || currentTokens + lineTokens <= maxTokens * 0.8) {
        coreSections.push(line);
        currentTokens += lineTokens;
      } else if (line.includes('Transcript') || line.includes('Previous Charts')) {
        // Truncate transcript and history more aggressively
        const shortened = line.substring(0, 80) + '... [truncated]';
        coreSections.push(shortened);
        currentTokens += this.estimateTokens(shortened);
      }

      if (currentTokens >= maxTokens * 0.9) {
        break;
      }
    }

    const optimizedPrompt = coreSections.join('\n');
    console.log(`✅ Optimized chart prompt: ${this.estimateTokens(optimizedPrompt)} tokens`);
    
    return optimizedPrompt;
  }

  // Detect chart complexity from user request
  detectChartComplexity(userRequest) {
    const request = userRequest.toLowerCase();
    
    // High complexity charts
    if (request.includes('gantt') || 
        request.includes('timeline') || 
        request.includes('sequence') ||
        request.includes('state') ||
        request.includes('class diagram') ||
        request.includes('architecture')) {
      return "high";
    }
    
    // Medium complexity charts
    if (request.includes('flowchart') || 
        request.includes('process') || 
        request.includes('journey') ||
        request.includes('pie chart') ||
        request.includes('graph') ||
        request.includes('network')) {
      return "medium";
    }
    
    // Default to basic
    return "basic";
  }

  async generateChart(originalPrompt, userRequest, options = {}) {
    const {
      temperature = 0.3, // Lower temperature for consistent chart syntax
      max_tokens = 1500, // More tokens for mermaid code
      top_p = 0.9,
    } = options;

    // Estimate tokens and detect complexity
    const estimatedTokens = this.estimateTokens(originalPrompt);
    const chartComplexity = this.detectChartComplexity(userRequest);
    
    console.log(`📊 Chart prompt tokens: ${estimatedTokens}, Complexity: ${chartComplexity}`);

    // Get available models
    const availableModels = this.getAvailableModels(estimatedTokens, chartComplexity);
    
    if (availableModels.length === 0) {
      return {
        success: false,
        error: "All suitable chart models are currently unavailable. Please try again in a few minutes.",
        models_tried: GROQ_CHART_MODELS.length
      };
    }

    console.log(`🔄 Available chart models: ${availableModels.map(m => m.name).join(', ')}`);

    for (const model of availableModels) {
      try {
        console.log(`🎯 Trying Chart Groq model: ${model.name} (Priority: ${model.priority}, Capability: ${model.chartCapability})`);
        
        // Optimize prompt for chart generation
        const optimizedPrompt = this.optimizeChartPrompt(
          originalPrompt, 
          Math.min(model.maxTokens * 0.6, 5000)
        );

        // Check daily limit
        if (this.totalTokensUsed > this.dailyLimit * 0.9) {
          console.log(`⚠️ Approaching daily chart token limit: ${this.totalTokensUsed}/${this.dailyLimit}`);
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
          console.log(`📈 Chart tokens used: ${result.usage.total_tokens} (Total: ${this.totalTokensUsed})`);
        }

        console.log(`✅ Chart success with model: ${model.name}`);
        this.retryCount = 0;
        
        return {
          success: true,
          model: model.name,
          content: result.choices[0].message.content,
          usage: result.usage,
          promptOptimized: optimizedPrompt !== originalPrompt,
          chartComplexity: chartComplexity
        };

      } catch (error) {
        console.log(`❌ Chart Model ${model.name} failed: ${error.message}`);
        
        if (error.status === 429) {
          const retryAfter = this.extractRetryAfter(error) || 30;
          console.log(`⏳ Rate limit hit for chart model ${model.name}. Cooldown: ${retryAfter}s`);
          this.setModelCooldown(model.name, retryAfter);
          continue;
        }

        if (error.status === 413) {
          console.log(`📝 Token limit exceeded for chart model ${model.name}`);
          this.setModelCooldown(model.name, 60);
          continue;
        }

        if (error.message.includes('overload') || error.message.includes('capacity')) {
          console.log(`🚧 Chart Model ${model.name} at capacity`);
          this.setModelCooldown(model.name, 120);
          continue;
        }

        console.log(`⚡ Unexpected error with chart model ${model.name}, short cooldown`);
        this.setModelCooldown(model.name, 10);
      }
    }

    return {
      success: false,
      error: "All available chart models are currently busy. Please try again in a few minutes.",
      models_tried: availableModels.length,
      estimatedTokens: estimatedTokens
    };
  }

  // Extract retry-after from error response
  extractRetryAfter(error) {
    try {
      const message = error.message || '';
      const timeMatch = message.match(/try again in ([\d.]+)(s|m)/);
      if (timeMatch) {
        let seconds = parseFloat(timeMatch[1]);
        if (timeMatch[2] === 'm') {
          seconds *= 60;
        }
        return Math.ceil(seconds);
      }

      if (error.headers && error.headers['retry-after']) {
        return parseInt(error.headers['retry-after']);
      }

      if (error.status === 429) return 30;
      if (error.status === 413) return 60;

      return 10;
    } catch (parseError) {
      return 30;
    }
  }

  resetModels() {
    this.modelCooldowns.clear();
    this.retryCount = 0;
    console.log('🔄 Chart model cooldowns cleared');
  }

  resetDailyTokens() {
    this.totalTokensUsed = 0;
    this.lastReset = Date.now();
    console.log('🔄 Daily chart token counter reset');
  }

  getStatus() {
    const availableModels = this.getAvailableModels(1000);
    return {
      totalTokensUsed: this.totalTokensUsed,
      dailyLimit: this.dailyLimit,
      availableModels: availableModels.map(m => ({
        name: m.name,
        capability: m.chartCapability
      })),
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

// Initialize Chart handler
const chartHandler = new ChartModelHandler();

// Auto-reset token counter every 24 hours
setInterval(() => {
  chartHandler.resetDailyTokens();
}, 24 * 60 * 60 * 1000);

// Get chart sessions for a note
exports.getChartSessions = async (req, res) => {
  try {
    const { noteId } = req.params;
    if (!noteId) {
      return res.status(400).json({ error: "noteId is required" });
    }
    
    const chartSessions = await ChartSession.find({ noteId }).sort({ createdAt: -1 });
    if (!chartSessions.length) {
      return res.json({ sessions: [] });
    }
    
    res.json({ sessions: chartSessions });
  } catch (error) {
    console.error("Get Chart Sessions Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle chart generation request
exports.generateChart = async (req, res) => {
  try {
    const { noteId, chartRequest } = req.body;
    if (!noteId || !chartRequest) {
      return res.status(400).json({ error: "noteId and chartRequest are required" });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Fetch or create chart session
    let chartSession = await ChartSession.findOne({ noteId });
    if (!chartSession) {
      chartSession = new ChartSession({ 
        noteId, 
        charts: [],
        sessionContext: `Chart generation session for note: ${note.title}`
      });
    }

    // Prepare recent chart history
    const recentCharts = chartSession.charts
      .slice(-3) // Last 3 charts
      .map(chart => `Previous Chart (${chart.type}): ${chart.description}`)
      .join('\n') || "No previous charts in this session.";

    // Build specialized chart generation prompt
    const chartPrompt = `
# CHART GENERATION PROMPT
You are the **YT2PDF Chart Generator**, a specialized AI that creates Mermaid.js diagrams from study content. Your ONLY output should be valid Mermaid.js syntax.

## AVAILABLE DATA
- **Note Title:** ${note.title}
- **Note Content (Key Excerpts):**
${note.content.substring(0, 1500)}... [Content truncated for efficiency]

- **YouTube Transcript (Key Excerpts):**
${(note.transcript || "No raw transcript available.").substring(0, 1000)}... [Transcript truncated]

- **User Chart Request:** ${chartRequest}

- **Previous Charts in Session:**
${recentCharts}

## MERMAID SYNTAX RULES - STRICTLY FOLLOW:
1. **Start with exact chart type declaration:**
   - flowchart TD (Top-Down) or LR (Left-Right)
   - graph TD or LR
   - pie title Chart Title
   - sequenceDiagram
   - gantt
   - classDiagram
   - stateDiagram-v2
   - journey

2. **Use proper syntax:**
   - Nodes: A[Label] --> B[Label]
   - Subgraphs: subgraph Title ... end
   - Styles: style A fill:#f9f,stroke:#333

3. **Keep it clean and educational**
4. **Use meaningful labels from the note content**
5. **Maximum 20 nodes for readability**

## CHART TYPE DETECTION:
Based on user request "${chartRequest}", create the most appropriate chart type:
- "flow", "process", "steps" → flowchart
- "timeline", "schedule", "gantt" → gantt chart
- "sequence", "interaction" → sequenceDiagram
- "pie", "percentage", "distribution" → pie chart
- "class", "object", "relationship" → classDiagram
- "state", "transition" → stateDiagram
- "journey", "user flow" → journey

## OUTPUT REQUIREMENTS:
- ONLY output valid Mermaid.js syntax
- No explanations, no markdown, no code blocks
- Start directly with chart declaration
- Include appropriate title based on note content
- Use labels derived from the note/transcript
- Keep it under 30 lines for clarity

## EXAMPLE OUTPUT:
flowchart TD
    A[Start Process] --> B[Analysis Phase]
    B --> C[Implementation]
    C --> D[Testing & Review]
    D --> E[Completion]
    
    style A fill:#e1f5fe
    style E fill:#c8e6c9
`;

    // Generate chart using specialized handler
    const result = await chartHandler.generateChart(chartPrompt, chartRequest, {
      max_tokens: 1200,
      temperature: 0.2, // Very low temperature for consistent syntax
    });

    if (!result.success) {
      let userErrorMessage = "Chart generation service temporarily unavailable. Please try again.";
      
      if (result.error.includes("token")) {
        userErrorMessage = "The note content is too extensive for chart generation. Please try with a shorter note or more specific request.";
      }
      
      return res.status(503).json({ 
        error: userErrorMessage,
        retrySuggested: true
      });
    }

    // Extract clean mermaid code (remove any potential markdown code blocks)
    let mermaidCode = result.content.trim();
    
    // Remove ```mermaid and ``` if present
    mermaidCode = mermaidCode.replace(/```mermaid?/g, '').replace(/```/g, '').trim();
    
    // Validate basic mermaid structure
    const validChartTypes = [
      'flowchart', 'graph', 'pie', 'sequenceDiagram', 
      'gantt', 'classDiagram', 'stateDiagram', 'journey'
    ];
    
    const isValidMermaid = validChartTypes.some(type => 
      mermaidCode.toLowerCase().includes(type)
    );

    if (!isValidMermaid) {
      console.log("⚠️ Generated code doesn't appear to be valid Mermaid syntax");
      // Fallback to a simple flowchart
      mermaidCode = `flowchart TD
    A[${note.title}] --> B[Study Content]
    B --> C[Key Concepts]
    B --> D[Important Points]
    
    style A fill:#e1f5fe
    style C fill:#c8e6c9
    style D fill:#fff3e0`;
    }

    // Detect chart type from generated code
    let chartType = "flowchart";
    for (const type of validChartTypes) {
      if (mermaidCode.toLowerCase().includes(type)) {
        chartType = type;
        break;
      }
    }

    // Create new chart entry
    const newChart = {
      type: chartType,
      mermaidCode: mermaidCode,
      description: chartRequest,
      userPrompt: chartRequest,
      modelUsed: result.model,
      promptOptimized: result.promptOptimized,
      complexity: result.chartComplexity,
      timestamp: new Date()
    };

    // Save to session
    chartSession.charts.push(newChart);
    
    // Limit charts per session to prevent overflow
    if (chartSession.charts.length > 10) {
      chartSession.charts = chartSession.charts.slice(-10);
    }

    await chartSession.save();

    res.json({
      success: true,
      chart: newChart,
      sessionId: chartSession._id,
      totalChartsInSession: chartSession.charts.length
    });

  } catch (error) {
    console.error("Chart Generation Error:", error);
    
    // Reset model selector on unexpected errors
    chartHandler.resetModels();
    
    res.status(500).json({ 
      error: "Chart generation service temporarily unavailable. Please try again.",
      retrySuggested: true
    });
  }
};

// Get specific chart by ID
exports.getChart = async (req, res) => {
  try {
    const { noteId, chartId } = req.params;
    
    const chartSession = await ChartSession.findOne({ noteId });
    if (!chartSession) {
      return res.status(404).json({ error: "Chart session not found" });
    }

    const chart = chartSession.charts.id(chartId);
    if (!chart) {
      return res.status(404).json({ error: "Chart not found" });
    }

    res.json({ chart });
  } catch (error) {
    console.error("Get Chart Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update chart feedback
exports.updateChartFeedback = async (req, res) => {
  try {
    const { noteId, chartId, feedback } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: "noteId is required" });
    }

    const allowed = ["useful", "not_useful", "needs_improvement", null];
    if (!allowed.includes(feedback)) {
      return res.status(400).json({ error: "Invalid feedback value" });
    }

    const chartSession = await ChartSession.findOne({ noteId });
    if (!chartSession) {
      return res.status(404).json({ error: "Chart session not found" });
    }

    const chart = chartSession.charts.id(chartId);
    if (!chart) {
      return res.status(404).json({ error: "Chart not found" });
    }

    chart.feedback = feedback;
    chart.feedbackTimestamp = new Date();
    
    await chartSession.save();

    res.json({
      updated: {
        chartId: chart._id,
        type: chart.type,
        description: chart.description,
        feedback: chart.feedback,
        feedbackTimestamp: chart.feedbackTimestamp
      }
    });
  } catch (error) {
    console.error("Chart Feedback Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a specific chart
exports.deleteChart = async (req, res) => {
  try {
    const { noteId, chartId } = req.params;

    const chartSession = await ChartSession.findOne({ noteId });
    if (!chartSession) {
      return res.status(404).json({ error: "Chart session not found" });
    }

    chartSession.charts.pull(chartId);
    await chartSession.save();

    res.json({ 
      message: "Chart deleted successfully",
      remainingCharts: chartSession.charts.length 
    });
  } catch (error) {
    console.error("Delete Chart Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Clear entire chart session
exports.clearChartSession = async (req, res) => {
  try {
    const { noteId } = req.params;

    const chartSession = await ChartSession.findOne({ noteId });
    if (!chartSession) {
      return res.status(404).json({ error: "Chart session not found" });
    }

    chartSession.charts = [];
    await chartSession.save();

    res.json({ message: "Chart session cleared successfully" });
  } catch (error) {
    console.error("Clear Session Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Utility endpoints
exports.resetChartModels = async (req, res) => {
  try {
    chartHandler.resetModels();
    res.json({ message: "Chart models reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset chart models" });
  }
};

exports.getChartModelStatus = async (req, res) => {
  try {
    const status = chartHandler.getStatus();
    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get chart model status" });
  }
};

exports.resetChartTokenCounter = async (req, res) => {
  try {
    chartHandler.resetDailyTokens();
    res.json({ message: "Chart token counter reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset chart token counter" });
  }
};