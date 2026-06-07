const Diagram = require("../models/Diagram");
const User = require("../models/User");
const { checkFreeTierLimits } = require("../utils/freeTierLimits");
const crypto = require("crypto");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Cost in tokens for free users
const TOKEN_COST_PER_GENERATION = 5;

// Plan limits definition
const PLAN_LIMITS = {
  free: {
    maxNodes: 5,
    allowedFormats: ["flowchart", "sequence"],
    allowedModels: ["flash"]
  },
  pro: {
    maxNodes: 15,
    allowedFormats: ["flowchart", "sequence", "class", "state", "er", "journey", "pie", "quadrant", "timeline", "sankey", "xy", "block"],
    allowedModels: ["flash", "canvas", "scholar"]
  },
  power: {
    maxNodes: 40,
    allowedFormats: ["flowchart", "sequence", "class", "state", "er", "journey", "pie", "quadrant", "timeline", "sankey", "xy", "block"],
    allowedModels: ["flash", "canvas", "scholar", "atlas"]
  }
};

// OpenRouter LLM Helper function
async function callOpenRouter(systemPrompt, userPrompt, modelId) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  let targetModel = "google/gemini-2.5-flash"; // Default fast model
  if (modelId === "atlas") {
    targetModel = "google/gemini-2.5-pro"; // Deep reasoning model for complex Atlas mapping
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://paperxify.com",
      "X-Title": "Paperxify Diagram Gen"
    },
    body: JSON.stringify({
      model: targetModel,
      messages,
      temperature: 0.3,
      stream: false,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter failed: HTTP ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Generate Diagram Endpoint logic
exports.generateDiagram = async (req, res) => {
  try {
    const { prompt, format, model, language = "English", theme = "cyber" } = req.body;
    const userId = req.user.id;

    if (!prompt || !format || !model) {
      return res.status(400).json({
        success: false,
        message: "Prompt, format, and model are required fields."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isSubscribed = user.membership?.isActive === true;
    const planId = isSubscribed ? (user.membership?.planId || "pro") : "free";
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;

    // 1. Verify Model eligibility
    if (!limits.allowedModels.includes(model)) {
      return res.status(403).json({
        success: false,
        code: "MODEL_RESTRICTED",
        message: `The selected model (${model}) is not available on your plan. Please upgrade to access it.`
      });
    }

    // 2. Verify Format eligibility
    if (!limits.allowedFormats.includes(format)) {
      return res.status(403).json({
        success: false,
        code: "FORMAT_RESTRICTED",
        message: `The selected format (${format}) is not available on your plan. Please upgrade to access it.`
      });
    }

    // 3. Verify Daily Limit & Token balance for Free users
    if (!isSubscribed) {
      const freeTierCheck = await checkFreeTierLimits(userId);
      if (!freeTierCheck.allowed) {
        return res.status(403).json({
          success: false,
          code: freeTierCheck.code,
          message: freeTierCheck.reason
        });
      }

      if (user.tokens < TOKEN_COST_PER_GENERATION) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_TOKENS",
          message: `You need ${TOKEN_COST_PER_GENERATION} tokens, but you only have ${user.tokens} left.`,
          requiredTokens: TOKEN_COST_PER_GENERATION,
          currentTokens: user.tokens
        });
      }
    }

    // 4. Construct AI Prompts
    const systemPrompt = `You are an AI that generates coordinate-based structured diagrams and node relationship tables from user descriptions.
Generate a diagram mapping layout represented in strict JSON according to the requested type, theme, and output language.
The output MUST be a valid JSON object matching the exact structure below. Do not wrap in markdown code fences.

JSON Structure:
{
  "nodes": [
    {
      "id": "1",
      "label": "Brief Node Label",
      "x": 350,
      "y": 100,
      "type": "start",
      "details": "Supplementary conceptual details about this node",
      "value": 40 // Optional: Include integer weight value ONLY for 'pie' or 'sankey' layouts
    }
  ],
  "edges": [
    {
      "from": "1",
      "to": "2",
      "label": "Optional connection arrow label (e.g. YES, NO, inherits, etc.)"
    }
  ]
}

Layout Coordinate Guidelines (Crucial for readable rendering):
- Coordinate plane sizes: width = 800, height = 600.
- X ranges: [100 to 700]. Y ranges: [50 to 500].
- You MUST space out nodes cleanly to avoid overlap:
  * flowchart: vertical flow (Y increases by 100-120 per step). Start node should have type="start". Use type="decision" for diamond decisions. Use type="success" or "fail" for terminals.
  * sequence: horizontal spacing for lifelines (X = 150, 380, 610) with type="lifeline". Render messages descending in Y sequentially down the lines (e.g., Y = 160, 240, 320) with type="message".
  * class & er: render side-by-side or layered blocks. Use type="class" or type="table". List multiple attributes/methods in the 'details' field separated by newlines \\n.
  * state: circular node loops. Use type="state".
  * pie: Render slices with type="slice" and include a 'value' percentage weight field for each slice.
  * quadrant: 2x2 grid. Use type "high-impact-low-effort", "high-impact-high-effort", "low-impact-low-effort", "low-impact-high-effort".
  * timeline: horizontal row (X increases by 200, Y remains at 250) with type="event".
  * sankey: Use types "flow-input", "flow-mid", "flow-out" and include a 'value' split amount.
  * xy: plot coordinates. Use type="point".
  * block: horizontal or hierarchical blocks with type="block".

Rules:
1. Generate a maximum of ${limits.maxNodes} nodes because of plan-based constraints.
2. The language of all headings, labels, details, and text in the diagram MUST be strictly: ${language}.
3. The prompt should be analyzed conceptually first, then mapped to nodes and edges.`;

    const userPrompt = `Generate a diagram of type "${format}" matching this description: "${prompt}".
Theme style requested is "${theme}".
Output Language is "${language}".`;

    console.log(`📡 Sending request to OpenRouter for user: ${userId}, Format: ${format}, Model: ${model}`);
    const result = await callOpenRouter(systemPrompt, userPrompt, model);

    let parsedResult;
    try {
      const cleanJson = result.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (e) {
      console.error("❌ Failed to parse JSON response from LLM:", e.message);
      return res.status(500).json({
        success: false,
        message: "AI response parsing failed. Please try again."
      });
    }

    if (!parsedResult.nodes || !Array.isArray(parsedResult.nodes)) {
      return res.status(500).json({
        success: false,
        message: "Invalid diagram structure generated by AI."
      });
    }

    // 5. Deduct tokens for Free users
    if (!isSubscribed) {
      user.tokens -= TOKEN_COST_PER_GENERATION;
      await user.save();
    }

    // 6. Save Diagram to DB
    const slug = crypto.randomUUID().split("-")[0] + "-" + prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    const diagram = await Diagram.create({
      userId,
      slug,
      prompt,
      format,
      model,
      language,
      theme,
      nodes: parsedResult.nodes,
      edges: parsedResult.edges || []
    });

    console.log(`✅ Successfully generated diagram. Saved with slug: ${slug}`);

    return res.status(200).json({
      success: true,
      diagram,
      tokenInfo: {
        tokensRemaining: user.tokens,
        tokensDeducted: isSubscribed ? 0 : TOKEN_COST_PER_GENERATION
      }
    });

  } catch (error) {
    console.error("❌ Generate Diagram Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during diagram generation",
      error: error.message
    });
  }
};

// Fetch a single diagram by slug
exports.getDiagramBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const diagram = await Diagram.findOne({ slug });

    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: "Diagram not found."
      });
    }

    return res.status(200).json({
      success: true,
      diagram
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fetch user's history of diagrams
exports.getUserDiagramHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Diagram.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a diagram
exports.deleteDiagram = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await Diagram.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Diagram not found." });
    }
    return res.status(200).json({ success: true, message: "Diagram deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
