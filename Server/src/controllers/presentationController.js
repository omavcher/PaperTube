const mongoose = require("mongoose");
const Presentation = require("../models/Presentation");
const User = require("../models/User");
const Folder = require("../models/Folder");
const GeminiClient = require("../utils/geminiClient");
const pptxgen = require("pptxgenjs");
const html_to_pdf = require("html-pdf-node");
const crypto = require("crypto");
const { awardXP } = require("../utils/xpHelper");

const gemini = new GeminiClient();

const THEME_CONFIGS = {
  "sunset-orange": {
    primary: "#f97316",
    accent: "#fbbf24",
    text: "#ffedd5",
    bg: "#0f0b07",
    bgGradient: "from-[#120a04] via-[#080808] to-[#040404]",
    fontFamily: "Outfit, sans-serif"
  },
  "midnight-tech": {
    primary: "#3b82f6",
    accent: "#8b5cf6",
    text: "#eff6ff",
    bg: "#030712",
    bgGradient: "from-[#020617] via-[#090d1f] to-[#020205]",
    fontFamily: "Outfit, sans-serif"
  },
  "classic-slate": {
    primary: "#64748b",
    accent: "#94a3b8",
    text: "#f8fafc",
    bg: "#0f172a",
    bgGradient: "from-[#0f172a] via-[#1e293b] to-[#020617]",
    fontFamily: "Inter, sans-serif"
  },
  "ocean-breeze": {
    primary: "#0ea5e9",
    accent: "#38bdf8",
    text: "#f0f9ff",
    bg: "#030c14",
    bgGradient: "from-[#030c14] via-[#075985] to-[#020617]",
    fontFamily: "Inter, sans-serif"
  },
  "minimal-snow": {
    primary: "#ffffff",
    accent: "#a3a3a3",
    text: "#f5f5f5",
    bg: "#121212",
    bgGradient: "from-[#121212] via-[#262626] to-[#0a0a0a]",
    fontFamily: "Outfit, sans-serif"
  },
  "emerald-forest": {
    primary: "#10b981",
    accent: "#a7f3d0",
    text: "#ecfdf5",
    bg: "#02120e",
    bgGradient: "from-[#020d0a] via-[#041d16] to-[#010806]",
    fontFamily: "Georgia, serif"
  },
  "vintage-gold": {
    primary: "#fbbf24",
    accent: "#d97706",
    text: "#fffbeb",
    bg: "#17140f",
    bgGradient: "from-[#17140f] via-[#2d220c] to-[#0a0805]",
    fontFamily: "Georgia, serif"
  },
  "cyberpunk": {
    primary: "#ec4899",
    accent: "#06b6d4",
    text: "#fdf2f8",
    bg: "#08020f",
    bgGradient: "from-[#08020e] via-[#12021c] to-[#04010a]",
    fontFamily: "Courier New, monospace"
  },
  "royal-velvet": {
    primary: "#8b5cf6",
    accent: "#c084fc",
    text: "#f5f3ff",
    bg: "#0a0314",
    bgGradient: "from-[#0a0314] via-[#2e1065] to-[#05010a]",
    fontFamily: "Georgia, serif"
  },
  "carbon-coder": {
    primary: "#22c55e",
    accent: "#4ade80",
    text: "#f0fdf4",
    bg: "#0a0f0a",
    bgGradient: "from-[#0a0f0a] via-[#14532d] to-[#020502]",
    fontFamily: "Courier New, monospace"
  },
  "sakura-bloom": {
    primary: "#f472b6",
    accent: "#fbcfe8",
    text: "#fff1f2",
    bg: "#14070e",
    bgGradient: "from-[#14070e] via-[#4c0519] to-[#0a0206]",
    fontFamily: "Inter, sans-serif"
  },
  "warm-clay": {
    primary: "#ea580c",
    accent: "#ff7849",
    text: "#fdf4ff",
    bg: "#140a05",
    bgGradient: "from-[#140a05] via-[#431407] to-[#0a0402]",
    fontFamily: "Georgia, serif"
  },
  "lavender-dream": {
    primary: "#a855f7",
    accent: "#f472b6",
    text: "#faf5ff",
    bg: "#0a0512",
    bgGradient: "from-[#08030f] via-[#150724] to-[#04010b]",
    fontFamily: "Outfit, sans-serif"
  },
  "nordic-frost": {
    primary: "#38bdf8",
    accent: "#7dd3fc",
    text: "#f0f9ff",
    bg: "#06131a",
    bgGradient: "from-[#06131a] via-[#0c4a6e] to-[#03090d]",
    fontFamily: "Inter, sans-serif"
  },
  "bronze-metal": {
    primary: "#b45309",
    accent: "#f59e0b",
    text: "#fffbeb",
    bg: "#140e05",
    bgGradient: "from-[#140e05] via-[#451a03] to-[#0a0702]",
    fontFamily: "Georgia, serif"
  },
  "royal-gold": {
    primary: "#fbbf24",
    accent: "#1e3a8a",
    text: "#eff6ff",
    bg: "#030814",
    bgGradient: "from-[#030814] via-[#172554] to-[#01030a]",
    fontFamily: "Georgia, serif"
  },
  "mint-fresh": {
    primary: "#2dd4bf",
    accent: "#5eead4",
    text: "#f0fdfa",
    bg: "#031411",
    bgGradient: "from-[#031411] via-[#115e59] to-[#010706]",
    fontFamily: "Outfit, sans-serif"
  },
  "nebula-space": {
    primary: "#ec4899",
    accent: "#3b82f6",
    text: "#faf5ff",
    bg: "#05030f",
    bgGradient: "from-[#05030f] via-[#311042] to-[#020108]",
    fontFamily: "Outfit, sans-serif"
  },
  "desert-sand": {
    primary: "#f59e0b",
    accent: "#d97706",
    text: "#fffbeb",
    bg: "#140e05",
    bgGradient: "from-[#140e05] via-[#78350f] to-[#0a0702]",
    fontFamily: "Outfit, sans-serif"
  },
  "dark-matter": {
    primary: "#ffffff",
    accent: "#f97316",
    text: "#fafafa",
    bg: "#020205",
    bgGradient: "from-[#020205] via-[#171717] to-[#000000]",
    fontFamily: "Inter, sans-serif"
  }
};

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Helper to generate unique slug
const generateSlug = (title) => {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const rand = crypto.randomBytes(3).toString("hex");
  return `${base || "presentation"}-${rand}`;
};

// Helper to extract JSON from LLM responses robustly
const extractJSON = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```[a-zA-Z]*\s*\n?/m, "").replace(/```\s*$/m, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch (err) {}
    }
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch (err) {}
    }
    throw e;
  }
};

// Call OpenRouter with fallback
const callOpenRouterOrGemini = async (messages, options = {}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey && apiKey !== "your_openrouter_key") {
    try {
      console.log("🤖 Attempting OpenRouter call with deepseek/deepseek-v4-flash...");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://paperxify.com",
          "X-Title": "Paperxify"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-v4-flash",
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 8000
        })
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      } else {
        console.warn(`OpenRouter returned status: ${response.status}. Falling back to Gemini.`);
      }
    } catch (err) {
      console.warn("OpenRouter request failed, falling back to Gemini:", err.message);
    }
  }

  // Fallback to Gemini
  console.log("♊ Running Gemini fallback...");
  const promptText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
  const response = await gemini.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: promptText }] }]
  });
  return response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

/**
 * Generate Slide Outline
 * POST /api/presentation/generate-outline
 */
exports.generateOutline = async (req, res) => {
  try {
    const { sourceInput, slideCount = 10, language = "English", prompt = "" } = req.body;
    if (!sourceInput) {
      return res.status(400).json({ success: false, message: "Presentation topic/prompt is required" });
    }

    const outlinePrompt = `Create a presentation outline for the topic: "${sourceInput}".
Language: "${language}".
Slide count: ${slideCount}.
Additional instructions: "${prompt}".

Provide the output in a strict JSON format with a root "slides" array containing exactly ${slideCount} items. Each item must be a JSON object with:
- "title": a short slide title (3-6 words)
- "desc": a brief description of what this slide will cover (1-2 sentences)

Ensure that:
1. The first slide is a Title/Intro slide.
2. The last slide is a Conclusion/Summary slide.
3. The intermediate slides form a logical, sequential presentation flow of the topic.
Do not include any extra text, comments, markdown tags (like \`\`\`json) or warnings. Return only the JSON object.`;

    const messages = [
      { role: "system", content: "You are a professional presentation planner. Output strict raw JSON only." },
      { role: "user", content: outlinePrompt }
    ];

    const responseText = await callOpenRouterOrGemini(messages, { temperature: 0.5, max_tokens: 3000 });
    const outlineData = extractJSON(responseText);

    if (!outlineData || !Array.isArray(outlineData.slides)) {
      throw new Error("Failed to generate a valid slide outline JSON.");
    }

    return res.status(200).json({
      success: true,
      data: {
        title: sourceInput,
        slides: outlineData.slides
      }
    });
  } catch (error) {
    console.error("❌ Generate Outline Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate presentation outline",
      error: error.message
    });
  }
};

/**
 * Generate Final Presentation Slide Contents
 * POST /api/presentation/generate-final
 */
exports.generateFinal = async (req, res) => {
  const startTime = Date.now();
  try {
    const { title, outline, theme, textDensity = "minimal", visuals = false, language = "English", model = "flash", prompt = "" } = req.body;
    const userId = req.user._id;

    // Pick a random default theme from the 20 registered themes if not specified or orange-gradient
    const themeKeys = Object.keys(THEME_CONFIGS);
    let chosenTheme = theme;
    if (!chosenTheme || chosenTheme === "orange-gradient" || !THEME_CONFIGS[chosenTheme]) {
      chosenTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    }

    if (!title || !Array.isArray(outline) || outline.length === 0) {
      return res.status(400).json({ success: false, message: "Title and outline array are required" });
    }

    // SaaS Plan and Token Gating Checks
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isSubscribed = user.membership?.isActive === true;
    const planId = user.membership?.planId || "free";

    // 1. Slide count validation
    if (!isSubscribed && outline.length > 10) {
      return res.status(403).json({ success: false, code: "UPGRADE_REQUIRED", message: "Free tier allows max 10 slides." });
    }
    if (isSubscribed && planId === "pro" && outline.length > 30) {
      return res.status(403).json({ success: false, code: "UPGRADE_REQUIRED", message: "Pro tier allows max 30 slides." });
    }

    // 2. Language validation
    const premiumLanguages = ["German", "Spanish", "French", "Japanese", "Arabic"];
    if (premiumLanguages.includes(language) && (!isSubscribed || planId !== "power")) {
      return res.status(403).json({ success: false, code: "UPGRADE_REQUIRED", message: "Premium languages require Power tier." });
    }

    // 3. Model validation
    if (model !== "flash" && !isSubscribed) {
      return res.status(403).json({ success: false, code: "UPGRADE_REQUIRED", message: "Premium models require Pro/Power subscription." });
    }
    if (model === "atlas" && (!isSubscribed || planId !== "power")) {
      return res.status(403).json({ success: false, code: "UPGRADE_REQUIRED", message: "Atlas engine requires Power tier subscription." });
    }

    // 4. Token check (Free tier only)
    const tokenCost = 5;
    if (!isSubscribed && user.tokens < tokenCost) {
      return res.status(403).json({
        success: false,
        code: "INSUFFICIENT_TOKENS",
        message: `You need ${tokenCost} tokens to generate presentations.`,
        requiredTokens: tokenCost,
        currentTokens: user.tokens,
        canPurchase: true
      });
    }

    // Build synthesis prompt
    // Build synthesis prompt with production-grade depth and visual instructions
    const finalPrompt = `You are a world-class executive presentation designer and expert subject researcher (matching Gamma.app and Pitch standards).
Generate a deep, highly detailed, production-grade slide deck based on the user outline: ${JSON.stringify(outline)}.

Presentation Topic: "${title}".
Language: "${language}".
Text Density: "${textDensity || "detailed"}".
Visuals Enabled: true.
Additional Context: "${prompt}".

CRITICAL DESIGN & CONTENT RULES:
1. DEPTH & SUBSTANCE: Do NOT generate shallow, generic 3-word bullets. Each slide must contain substantive, insightful, technical/factual depth with specific mechanisms, data points, historical milestones, architecture trade-offs, and actionable takeaways.
2. DIVERSE VISUAL LAYOUTS: Avoid repetitive bullet templates. Utilize a rich, engaging mix of visual layouts:
   - "title": Hero cover with title, compelling subtitle, and author badge.
   - "image_left": 50% left side high-res thematic image, 50% right side bold title, content summary, and 3 key detailed takeaways. Supply "image_url" (thematic Unsplash photo URL) and "bullets" (array of 3 rich strings).
   - "image_right": 50% left side bold analysis with 3 rich bullet points, 50% right side thematic image. Supply "image_url" and "bullets".
   - "metric_callout": 3 quantitative benchmark KPIs with values (e.g. "99.8%", "3.8x", "< 15ms") and descriptive labels.
   - "comparison": Multi-factor architectural or strategic comparison (Option A vs Option B) with 3-4 distinct contrast points.
   - "pros_cons": 3 concrete benefits vs 3 tangible challenges/trade-offs.
   - "timeline": 3-4 chronological steps or evolutionary milestones.
   - "matrix_2x2": 4-quadrant strategic matrix (Q1-Q4) with clear category insights.
   - "bullets": 3-4 Bento cards. Format each bullet with a bold prefix and explanation (e.g. "Dynamic Vector Caching: Sub-millisecond latency retrieval with zero query duplication overhead.").
   - "quote": Notable quotation with attribution and executive role.
   - "conclusion": Final executive summary with 3 actionable forward-looking recommendations.

3. CONTEXTUAL IMAGE URLS: For any slide with "image_left", "image_right", or "gallery_grid", provide a realistic high-definition Unsplash URL relevant to the topic (e.g., technology, energy, architecture, finance, science).

4. SPEAKER NOTES: For every slide, provide a comprehensive, 2-3 sentence teleprompter script in "speakerNotes".

Output strictly valid raw JSON array format matching this structure:
[
  {
    "id": 1,
    "title": "Title of Slide",
    "subtitle": "Subtitle explanation",
    "layout": "title",
    "author": "Presented by Paperxify AI",
    "speakerNotes": "Welcome everyone..."
  },
  {
    "id": 2,
    "title": "Topic Core Mechanisms",
    "layout": "image_left",
    "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    "bullets": [
      "Semantic Chunking Heuristics: Context-aware document partitioning preserves relational continuity.",
      "Vector Space Optimization: Cosine indexing accelerates nearest-neighbor lookups by 4.2x.",
      "Real-time Feedback Loops: Automated error telemetry prevents semantic drift."
    ],
    "speakerNotes": "Here we analyze the foundational mechanisms..."
  }
]

Return only the raw JSON array. No markdown tags, no code blocks.`;

    const messages = [
      { role: "system", content: "You are a world-class presentation creator. Output strict raw JSON array only." },
      { role: "user", content: finalPrompt }
    ];

    const responseText = await callOpenRouterOrGemini(messages, { temperature: 0.7, max_tokens: 15000 });
    const slidesData = extractJSON(responseText);

    if (!Array.isArray(slidesData) || slidesData.length === 0) {
      throw new Error("Failed to generate a valid detailed presentation slides array.");
    }

    // Curated high-res fallback visuals for topic categories
    const fallbackVisuals = [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800", // Hardware/Chip
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800", // Earth/Network
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800", // Code/Data
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800", // Business/Finance
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800", // Modern Tech
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"  // Collaboration
    ];

    const slug = generateSlug(title);
    const newPresentation = new Presentation({
      owner: userId,
      title: title,
      slug: slug,
      theme: chosenTheme,
      slides: slidesData.map((slide, idx) => {
        let img = slide.image_url;
        if ((slide.layout === "image_left" || slide.layout === "image_right" || slide.layout === "gallery_grid") && (!img || !img.startsWith("http"))) {
          img = fallbackVisuals[idx % fallbackVisuals.length];
        }

        // Normalize bullets to string array
        let bullets = [];
        if (Array.isArray(slide.bullets)) {
          bullets = slide.bullets.map(b => {
            if (typeof b === "string") return b;
            if (b && typeof b === "object") return b.title ? `${b.title}: ${b.description || b.text || ''}` : (b.text || b.description || JSON.stringify(b));
            return String(b || "");
          });
        }

        // Normalize steps
        let steps = [];
        if (Array.isArray(slide.steps)) {
          steps = slide.steps.map((st, i) => {
            if (typeof st === "string") return st;
            if (st && typeof st === "object") return st.title ? `${st.title}: ${st.description || ''}` : (st.step || st.description || JSON.stringify(st));
            return String(st || "");
          });
        }

        // Normalize events
        let events = [];
        if (Array.isArray(slide.events)) {
          events = slide.events.map((ev, i) => {
            if (typeof ev === "string") return { year: `Stage ${i + 1}`, description: ev };
            if (ev && typeof ev === "object") return { year: String(ev.year || ev.title || ev.phase || `Step ${i + 1}`), description: String(ev.description || ev.text || ev.details || "") };
            return { year: `Stage ${i + 1}`, description: String(ev || "") };
          });
        } else if (Array.isArray(slide.steps) && (slide.layout === "timeline" || slide.layout === "steps")) {
          events = slide.steps.map((st, i) => {
            if (typeof st === "string") return { year: `Phase ${i + 1}`, description: st };
            if (st && typeof st === "object") return { year: String(st.title || st.year || `Phase ${i + 1}`), description: String(st.description || st.text || "") };
            return { year: `Phase ${i + 1}`, description: String(st || "") };
          });
        }

        // Normalize metrics
        let metrics = [];
        if (Array.isArray(slide.metrics)) {
          metrics = slide.metrics.map(m => {
            if (m && typeof m === "object") return { value: String(m.value || m.val || "0"), label: String(m.label || m.title || "Metric") };
            return { value: String(m || "0"), label: "Metric" };
          });
        }

        // Normalize phases
        let phases = [];
        if (Array.isArray(slide.phases)) {
          phases = slide.phases.map((p, i) => {
            if (p && typeof p === "object") return { phase: String(p.phase || p.title || `Phase ${i + 1}`), goal: String(p.goal || p.description || "") };
            return { phase: `Phase ${i + 1}`, goal: String(p || "") };
          });
        }

        // Normalize pros and cons and quadrants
        let pros = Array.isArray(slide.pros) ? slide.pros.map(p => typeof p === "string" ? p : (p?.text || p?.title || JSON.stringify(p))) : [];
        let cons = Array.isArray(slide.cons) ? slide.cons.map(c => typeof c === "string" ? c : (c?.text || c?.title || JSON.stringify(c))) : [];
        let quadrants = Array.isArray(slide.quadrants) ? slide.quadrants.map(q => typeof q === "string" ? q : (q?.text || q?.title || JSON.stringify(q))) : [];

        return {
          id: idx + 1,
          title: typeof slide.title === "string" ? slide.title : "Slide Title",
          subtitle: typeof slide.subtitle === "string" ? slide.subtitle : "",
          layout: slide.layout || (idx === 0 ? "title" : idx % 3 === 1 ? "image_left" : "bullets"),
          bullets: bullets,
          columns: slide.columns && typeof slide.columns === "object" ? slide.columns : { left: [], right: [] },
          metric: slide.metric && typeof slide.metric === "object" ? slide.metric : { value: "", label: "", description: "" },
          speakerNotes: typeof slide.speakerNotes === "string" ? slide.speakerNotes : "",
          variantIndex: slide.variantIndex || 0,
          bgImageIndex: slide.bgImageIndex || 0,
          author: typeof slide.author === "string" ? slide.author : "",
          content: typeof slide.content === "string" ? slide.content : "",
          quote_text: typeof slide.quote_text === "string" ? slide.quote_text : "",
          role: typeof slide.role === "string" ? slide.role : "",
          left_text: typeof slide.left_text === "string" ? slide.left_text : "",
          right_text: typeof slide.right_text === "string" ? slide.right_text : "",
          pros: pros,
          cons: cons,
          metrics: metrics,
          quadrants: quadrants,
          events: events,
          steps: steps,
          phases: phases,
          image_url: img || "",
          alt_text: slide.alt_text || slide.title || "Topic visualization",
          images: Array.isArray(slide.images) ? slide.images : (img ? [img] : [])
        };
      }),
      generationDetails: {
        model,
        language,
        slideCount: slidesData.length,
        prompt,
        cost: isSubscribed ? 0 : tokenCost,
        processingTime: Math.round((Date.now() - startTime) / 1000)
      }
    });

    await newPresentation.save();

    // Award XP for successful Slide Deck / PPT generation (+100 XP)
    await awardXP(userId, 100);

    // Deduct tokens for Free users
    if (!isSubscribed) {
      user.tokens = Math.max(0, user.tokens - tokenCost);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Presentation generated successfully",
      data: {
        slug: newPresentation.slug,
        title: newPresentation.title,
        slideCount: newPresentation.slides.length,
        tokensDeducted: isSubscribed ? 0 : tokenCost
      }
    });
  } catch (error) {
    console.error("❌ Generate Final Presentation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate presentation slides",
      error: error.message
    });
  }
};

/**
 * AI Slide Co-Pilot Enhancement
 * POST /api/presentation/enhance-slide
 */
exports.enhanceSlide = async (req, res) => {
  try {
    const { slide, action = "concise", instruction = "", presentationTitle = "" } = req.body;
    if (!slide) {
      return res.status(400).json({ success: false, message: "Slide object is required" });
    }

    const actionDirectives = {
      concise: "Rewrite the slide content to be more concise, punchy, and executive-ready. Cut fluff, sharpen bullet points, and ensure high clarity.",
      expand: "Enrich and expand the slide content with concrete real-world examples, practical implications, and deeper insights.",
      metrics: "Suggest relevant quantitative metrics, percentage benchmarks, and KPI numbers (e.g. 85%, 3.5x, 99.9%) and populate the 'metrics' or 'metric' field.",
      notes: "Generate an engaging, natural, conversational presenter transcript for the 'speakerNotes' field that a speaker can read during a live talk.",
      professional: "Elevate the professional tone, use industry standard vocabulary, and polish phrasing for a C-suite presentation.",
      storytelling: "Rewrite the slide with a compelling storytelling narrative arc (Hook, Challenge, Solution, Outcome)."
    };

    const directive = actionDirectives[action] || instruction || "Polish and improve the slide content.";

    const enhancePrompt = `You are a world-class presentation designer and executive speechwriter (similar to Gamma.app AI).
Presentation Topic: "${presentationTitle}"
Goal: ${directive}
${instruction ? `Additional User Instruction: "${instruction}"` : ""}

Current Slide JSON:
${JSON.stringify(slide, null, 2)}

Return the improved slide as a STRICT RAW JSON object preserving the layout and required fields.
Keep the existing "id" and "layout" unless the user's instruction explicitly requested a layout change.
Do not include any extra text, markdown codeblocks (like \`\`\`json), or conversational preamble. Return ONLY the JSON object.`;

    const messages = [
      { role: "system", content: "You are an expert presentation editor. Output strict raw JSON only." },
      { role: "user", content: enhancePrompt }
    ];

    const responseText = await callOpenRouterOrGemini(messages, { temperature: 0.6, max_tokens: 2000 });
    const enhancedSlide = extractJSON(responseText);

    if (!enhancedSlide || typeof enhancedSlide !== "object") {
      throw new Error("Failed to parse enhanced slide JSON.");
    }

    // Preserve id
    enhancedSlide.id = slide.id;

    return res.status(200).json({
      success: true,
      slide: enhancedSlide
    });
  } catch (error) {
    console.error("❌ Enhance Slide Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enhance slide with AI",
      error: error.message
    });
  }
};

/**
 * Get User Presentations
 * GET /api/presentation/get-all
 */
exports.getUserPresentations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { folderId, search, sortBy = "updatedAt" } = req.query;

    const query = { owner: userId };
    if (folderId && folderId !== "all") {
      query.folderId = folderId === "root" ? null : folderId;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const sortOption = {};
    if (sortBy === "title") {
      sortOption.title = 1;
    } else {
      sortOption.updatedAt = -1;
    }

    const list = await Presentation.find(query)
      .sort(sortOption)
      .select("title slug theme slides updatedAt createdAt folderId");

    // Format list similar to Note response structure for client compatibility
    const notes = list.map(item => ({
      _id: item._id,
      slug: item.slug,
      title: item.title,
      slideCount: item.slides.length,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      folderId: item.folderId,
      type: "ppt"
    }));

    return res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: { hasNext: false }
      }
    });
  } catch (error) {
    console.error("❌ Fetch presentations error:", error);
    return res.status(500).json({ success: false, message: "Failed to load presentations" });
  }
};

/**
 * Get Presentation by Slug
 * GET /api/presentation/:slug
 */
exports.getPresentationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const presentation = await Presentation.findOne({ slug });
    if (!presentation) {
      return res.status(404).json({ success: false, message: "Presentation not found" });
    }

    return res.status(200).json({
      success: true,
      presentation: {
        title: presentation.title,
        slides: presentation.slides,
        theme: presentation.theme
      }
    });
  } catch (error) {
    console.error("❌ Fetch presentation by slug error:", error);
    return res.status(500).json({ success: false, message: "Failed to load presentation details" });
  }
};

/**
 * Update Presentation
 * PUT /api/presentation/update/:id
 */
exports.updatePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { slides, title } = req.body;
    const userId = req.user._id;

    const presentation = await Presentation.findOne({ _id: id, owner: userId });
    if (!presentation) {
      return res.status(404).json({ success: false, message: "Presentation not found or unauthorized" });
    }

    if (title) presentation.title = title;
    if (slides) presentation.slides = slides;
    if (req.body.theme) presentation.theme = req.body.theme;

    await presentation.save();
    return res.status(200).json({ success: true, message: "Presentation updated successfully" });
  } catch (error) {
    console.error("❌ Update presentation error:", error);
    return res.status(500).json({ success: false, message: "Failed to update presentation" });
  }
};

/**
 * Delete Presentation
 * DELETE /api/presentation/:id
 */
exports.deletePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const presentation = await Presentation.findOneAndDelete({ _id: id, owner: userId });
    if (!presentation) {
      return res.status(404).json({ success: false, message: "Presentation not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Presentation deleted successfully" });
  } catch (error) {
    console.error("❌ Delete presentation error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete presentation" });
  }
};

/**
 * Move Presentation to Folder
 * PUT /api/presentation/move
 */
exports.movePresentationToFolder = async (req, res) => {
  try {
    const { itemId, folderId } = req.body;
    const userId = req.user._id;

    const fId = folderId === "root" || folderId === null ? null : folderId;

    const presentation = await Presentation.findOneAndUpdate(
      { _id: itemId, owner: userId },
      { folderId: fId },
      { new: true }
    );

    if (!presentation) {
      return res.status(404).json({ success: false, message: "Presentation not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Presentation moved successfully", data: presentation });
  } catch (error) {
    console.error("❌ Move presentation error:", error);
    return res.status(500).json({ success: false, message: "Failed to move presentation" });
  }
};

// Helper to normalize the 17 rich slide layouts into 4 standard structures for PPTX/PDF export fallbacks
const normalizeSlide = (slide) => {
  const normalized = {
    title: slide.title || "Slide Title",
    subtitle: slide.subtitle || "",
    layout: slide.layout || "bullets",
    bullets: slide.bullets || [],
    columns: slide.columns || { left: [], right: [] },
    metric: slide.metric || { value: "0", label: "Metric", description: "" },
    speakerNotes: slide.speakerNotes || ""
  };
  
  if (["title", "section_break"].includes(slide.layout)) {
    normalized.layout = "title";
  }
  else if (["bullets", "conclusion", "steps"].includes(slide.layout)) {
    normalized.layout = "bullets";
    if (slide.layout === "steps") {
      normalized.bullets = slide.steps || [];
    }
  }
  else if (["comparison", "two_column_text", "pros_cons", "matrix_2x2"].includes(slide.layout)) {
    normalized.layout = "comparison";
    if (slide.layout === "two_column_text") {
      normalized.columns = {
        left: ["Column 1", slide.left_text || ""],
        right: ["Column 2", slide.right_text || ""]
      };
    } else if (slide.layout === "pros_cons") {
      normalized.columns = {
        left: ["Advantages", ...(slide.pros || [])],
        right: ["Disadvantages", ...(slide.cons || [])]
      };
    } else if (slide.layout === "matrix_2x2") {
      normalized.columns = {
        left: ["Top Quadrants", slide.quadrants?.[0] || "", slide.quadrants?.[1] || ""],
        right: ["Bottom Quadrants", slide.quadrants?.[2] || "", slide.quadrants?.[3] || ""]
      };
    }
  }
  else if (["metric", "metric_callout"].includes(slide.layout)) {
    normalized.layout = "metric";
    if (slide.layout === "metric_callout") {
      const firstMetric = slide.metrics?.[0] || { value: "0", label: "Metric" };
      normalized.metric = {
        value: firstMetric.value,
        label: firstMetric.label,
        description: slide.title
      };
    }
  }
  else if (["paragraph", "quote", "image_left", "image_right", "gallery_grid"].includes(slide.layout)) {
    normalized.layout = "bullets";
    if (slide.layout === "paragraph") {
      normalized.bullets = [slide.content || ""];
    } else if (slide.layout === "quote") {
      normalized.bullets = [`"${slide.quote_text || ""}"`, `-- ${slide.author || ""} (${slide.role || ""})`];
    } else if (["image_left", "image_right"].includes(slide.layout)) {
      normalized.bullets = [slide.content || ""];
    } else if (slide.layout === "gallery_grid") {
      normalized.bullets = (slide.images || []).map((img, i) => `Image ${i+1}: ${img}`);
    }
  }
  
  return normalized;
};

/**
 * Export to PPTX
 * GET /api/presentation/:slug/export/pptx
 */
exports.exportPPTX = async (req, res) => {
  try {
    const { slug } = req.params;
    const presentation = await Presentation.findOne({ slug });
    if (!presentation) {
      return res.status(404).json({ success: false, message: "Presentation not found" });
    }

    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_16x9";

    const chosenThemeId = presentation.theme || "sunset-orange";
    const themeConfig = THEME_CONFIGS[chosenThemeId] || THEME_CONFIGS["sunset-orange"];

    const fontFace = themeConfig.fontFamily.split(",")[0].trim().replace(/['"]/g, "");
    const primaryColor = themeConfig.primary.replace("#", "");
    const accentColor = themeConfig.accent.replace("#", "");
    const textColor = themeConfig.text.replace("#", "");
    const bgColor = themeConfig.bg.replace("#", "");

    presentation.slides.forEach(slide => {
      const slideObj = pptx.addSlide();
      slideObj.background = { fill: bgColor };

      const layout = slide.layout || "bullets";

      if (layout === "title") {
        slideObj.addText(slide.title || "Presentation Title", {
          x: 0.8, y: 1.8, w: 8.4, h: 1.5,
          fontSize: 38, align: "center",
          color: primaryColor, bold: true,
          fontFace: fontFace
        });
        if (slide.subtitle) {
          slideObj.addText(slide.subtitle, {
            x: 1.0, y: 3.4, w: 8.0, h: 1.0,
            fontSize: 16, align: "center",
            color: textColor,
            fontFace: fontFace
          });
        }
        if (slide.author) {
          slideObj.addText(slide.author, {
            x: 1.0, y: 4.5, w: 8.0, h: 0.5,
            fontSize: 12, align: "center",
            color: primaryColor, bold: true,
            fontFace: fontFace
          });
        }
      } else if (layout === "image_left") {
        if (slide.image_url) {
          try {
            slideObj.addImage({ path: slide.image_url, x: 0.6, y: 0.8, w: 4.2, h: 4.0, rounding: true });
          } catch (e) {}
        }
        slideObj.addText(slide.title || "Topic Insight", {
          x: 5.1, y: 0.8, w: 4.3, h: 0.8,
          fontSize: 22, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const bullets = (slide.bullets || [slide.content || ""]).map(b => ({
          text: b,
          options: { bullet: true, color: textColor, fontSize: 13 }
        }));
        slideObj.addText(bullets, {
          x: 5.1, y: 1.8, w: 4.3, h: 3.0,
          fontFace: fontFace
        });
      } else if (layout === "image_right") {
        slideObj.addText(slide.title || "Topic Insight", {
          x: 0.6, y: 0.8, w: 4.3, h: 0.8,
          fontSize: 22, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const bullets = (slide.bullets || [slide.content || ""]).map(b => ({
          text: b,
          options: { bullet: true, color: textColor, fontSize: 13 }
        }));
        slideObj.addText(bullets, {
          x: 0.6, y: 1.8, w: 4.3, h: 3.0,
          fontFace: fontFace
        });
        if (slide.image_url) {
          try {
            slideObj.addImage({ path: slide.image_url, x: 5.2, y: 0.8, w: 4.2, h: 4.0, rounding: true });
          } catch (e) {}
        }
      } else if (layout === "metric_callout" || layout === "metric") {
        slideObj.addText(slide.title || "Key Metrics", {
          x: 0.6, y: 0.6, w: 8.8, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const metrics = slide.metrics || [
          { value: slide.metric?.value || "99.4%", label: slide.metric?.label || "KPI Index" },
          { value: "3.5x", label: "Acceleration" },
          { value: "< 10ms", label: "P99 Latency" }
        ];
        metrics.slice(0, 3).forEach((m, idx) => {
          const xPos = 0.6 + idx * 2.95;
          slideObj.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.6, w: 2.75, h: 2.8, fill: { color: "111115" }, line: { color: primaryColor, width: 1 } });
          slideObj.addText(m.value, { x: xPos, y: 2.0, w: 2.75, h: 1.2, fontSize: 32, bold: true, color: primaryColor, align: "center", fontFace });
          slideObj.addText(m.label, { x: xPos, y: 3.2, w: 2.75, h: 0.8, fontSize: 11, bold: true, color: textColor, align: "center", fontFace });
        });
      } else if (layout === "timeline" || layout === "steps" || layout === "roadmap") {
        slideObj.addText(slide.title || "Deployment Timeline", {
          x: 0.6, y: 0.6, w: 8.8, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const events = (slide.events || [
          { year: "Phase 1", description: "Architecture Discovery" },
          { year: "Phase 2", description: "Semantic Indexing" },
          { year: "Phase 3", description: "Production Scale" }
        ]).slice(0, 4);
        const cardW = 8.5 / events.length;
        events.forEach((ev, idx) => {
          const xPos = 0.6 + idx * (cardW + 0.15);
          slideObj.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.6, w: cardW, h: 3.0, fill: { color: "111115" }, line: { color: accentColor, width: 1 } });
          slideObj.addText(ev.year, { x: xPos + 0.1, y: 1.8, w: cardW - 0.2, h: 0.5, fontSize: 13, bold: true, color: accentColor, fontFace });
          slideObj.addText(ev.description, { x: xPos + 0.1, y: 2.4, w: cardW - 0.2, h: 2.0, fontSize: 10.5, color: textColor, fontFace });
        });
      } else if (layout === "comparison" || layout === "two_column_text") {
        slideObj.addText(slide.title || "Comparison", {
          x: 0.6, y: 0.6, w: 8.8, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const leftItems = (slide.columns?.left || ["Baseline"]).map((item, idx) => ({
          text: item,
          options: { bullet: idx > 0, fontSize: idx === 0 ? 15 : 12, bold: idx === 0, color: idx === 0 ? primaryColor : textColor }
        }));
        slideObj.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.6, w: 4.1, h: 3.2, fill: { color: "111115" }, line: { color: primaryColor, width: 1 } });
        slideObj.addText(leftItems, { x: 0.8, y: 1.8, w: 3.7, h: 2.8, fontFace });

        const rightItems = (slide.columns?.right || ["AI Modern"]).map((item, idx) => ({
          text: item,
          options: { bullet: idx > 0, fontSize: idx === 0 ? 15 : 12, bold: idx === 0, color: idx === 0 ? accentColor : textColor }
        }));
        slideObj.addShape(pptx.ShapeType.roundRect, { x: 5.0, y: 1.6, w: 4.1, h: 3.2, fill: { color: "111115" }, line: { color: accentColor, width: 1 } });
        slideObj.addText(rightItems, { x: 5.2, y: 1.8, w: 3.7, h: 2.8, fontFace });
      } else if (layout === "pros_cons") {
        slideObj.addText(slide.title || "Advantages vs Challenges", {
          x: 0.6, y: 0.6, w: 8.8, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const proItems = ["Advantages", ...(slide.pros || ["High accuracy", "Infinite scale"])].map((item, idx) => ({
          text: item,
          options: { bullet: idx > 0, fontSize: idx === 0 ? 15 : 12, bold: idx === 0, color: idx === 0 ? "10B981" : textColor }
        }));
        slideObj.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.6, w: 4.1, h: 3.2, fill: { color: "064E3B" }, line: { color: "10B981", width: 1 } });
        slideObj.addText(proItems, { x: 0.8, y: 1.8, w: 3.7, h: 2.8, fontFace });

        const conItems = ["Key Challenges", ...(slide.cons || ["Initial setup overhead"])].map((item, idx) => ({
          text: item,
          options: { bullet: idx > 0, fontSize: idx === 0 ? 15 : 12, bold: idx === 0, color: idx === 0 ? "EF4444" : textColor }
        }));
        slideObj.addShape(pptx.ShapeType.roundRect, { x: 5.0, y: 1.6, w: 4.1, h: 3.2, fill: { color: "450A0A" }, line: { color: "EF4444", width: 1 } });
        slideObj.addText(conItems, { x: 5.2, y: 1.8, w: 3.7, h: 2.8, fontFace });
      } else if (layout === "quote") {
        slideObj.addText(`"${slide.quote_text || slide.title || ""}"`, {
          x: 1.0, y: 1.8, w: 8.0, h: 1.8,
          fontSize: 24, italic: true, align: "center",
          color: primaryColor, fontFace
        });
        if (slide.author) {
          slideObj.addText(`-- ${slide.author} ${slide.role ? `(${slide.role})` : ""}`, {
            x: 1.0, y: 3.8, w: 8.0, h: 0.8,
            fontSize: 14, bold: true, align: "center",
            color: textColor, fontFace
          });
        }
      } else {
        // Bento cards / bullets
        slideObj.addText(slide.title || "Key Takeaways", {
          x: 0.6, y: 0.6, w: 8.8, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const bulletItems = (slide.bullets || ["First takeaway", "Second takeaway"]).map(b => ({
          text: b,
          options: { bullet: true, color: textColor, fontSize: 13 }
        }));
        slideObj.addText(bulletItems, {
          x: 0.6, y: 1.6, w: 8.8, h: 3.2,
          fontFace: fontFace
        });
      }

      if (slide.speakerNotes) {
        slideObj.addNotes(slide.speakerNotes);
      }
    });

    const buffer = await pptx.write("nodebuffer");
    const filename = `${presentation.title.replace(/[^\w\s.-]/gi, "_").substring(0, 50)}.pptx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    console.error("❌ PPTX Export Error:", error);
    return res.status(500).json({ success: false, message: "Failed to export PPTX", error: error.message });
  }
};

/**
 * Export to PDF
 * GET /api/presentation/:slug/export/pdf
 */
exports.exportPDF = async (req, res) => {
  try {
    const { slug } = req.params;
    const presentation = await Presentation.findOne({ slug }).populate("owner");
    if (!presentation) {
      return res.status(404).json({ success: false, message: "Presentation not found" });
    }

    const isSubscribed = presentation.owner?.membership?.isActive === true;
    const chosenThemeId = presentation.theme || "sunset-orange";
    const T = THEME_CONFIGS[chosenThemeId] || THEME_CONFIGS["sunset-orange"];

    const fontName = T.fontFamily.split(",")[0].trim().replace(/['"]/g, "");
    const webSafeFonts = ["Georgia", "Courier New", "Arial", "Times New Roman", "Helvetica", "Courier", "Verdana", "Trebuchet MS", "Comic Sans MS", "Impact"];
    let fontImport = "";
    if (!webSafeFonts.includes(fontName)) {
      fontImport = `@import url('https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;600;800;900&display=swap');`;
    }

    const renderSlide = (slide, idx) => {
      const layout = slide.layout || "bullets";
      const border = hexToRgba(T.primary, 0.20);
      const cardBg = hexToRgba(T.primary, 0.05);
      let body = "";

      if (layout === "title") {
        body = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;gap:24px;max-width:1200px;margin:0 auto;position:relative;z-index:2;">
            <h1 style="font-size:72px;font-weight:900;line-height:1.2;margin:0;background:linear-gradient(160deg,#ffffff 30%,${T.primary});-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-1px;">
              ${slide.title || ""}
            </h1>
            <div style="width:140px;height:6px;border-radius:4px;background:${T.primary};box-shadow:0 0 15px ${T.primary};margin:5px auto;"></div>
            ${slide.subtitle ? `<p style="font-size:26px;color:#d4d4d4;font-weight:300;margin:0;max-width:900px;line-height:1.5;">${slide.subtitle}</p>` : ""}
            ${slide.author ? `<p style="font-size:18px;color:${T.primary};font-family:monospace;letter-spacing:3px;text-transform:uppercase;margin-top:15px;">// ${slide.author}</p>` : ""}
          </div>
        `;
      }
      else if (layout === "image_left") {
        const imgEl = slide.image_url 
          ? `<img src="${slide.image_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:20px;" />`
          : `<span style="font-size:60px;opacity:0.3;color:#ffffff;">📷</span>`;
        
        const bulletItems = (slide.bullets || [slide.content || ""]).map(b => `
          <div style="display:flex;gap:14px;align-items:start;">
            <span style="width:10px;height:10px;border-radius:50%;background:${T.primary};flex-shrink:0;margin-top:8px;"></span>
            <p style="font-size:20px;color:${T.text};font-weight:300;line-height:1.6;margin:0;">${b}</p>
          </div>
        `).join("");

        body = `
          <div style="height:100%;display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <div style="height:480px;border-radius:24px;border:1px solid ${border};background:#111;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,0.5);">
              ${imgEl}
            </div>
            <div style="display:flex;flex-direction:column;gap:20px;">
              <h2 style="font-size:42px;font-weight:900;color:${T.primary};margin:0;line-height:1.2;">${slide.title || ""}</h2>
              ${slide.subtitle ? `<p style="font-size:20px;color:#a3a3a3;margin:0;">${slide.subtitle}</p>` : ""}
              <div style="display:flex;flex-direction:column;gap:16px;margin-top:10px;">
                ${bulletItems}
              </div>
            </div>
          </div>
        `;
      }
      else if (layout === "image_right") {
        const imgEl = slide.image_url 
          ? `<img src="${slide.image_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:20px;" />`
          : `<span style="font-size:60px;opacity:0.3;color:#ffffff;">📷</span>`;
        
        const bulletItems = (slide.bullets || [slide.content || ""]).map(b => `
          <div style="display:flex;gap:14px;align-items:start;">
            <span style="width:10px;height:10px;border-radius:50%;background:${T.accent};flex-shrink:0;margin-top:8px;"></span>
            <p style="font-size:20px;color:${T.text};font-weight:300;line-height:1.6;margin:0;">${b}</p>
          </div>
        `).join("");

        body = `
          <div style="height:100%;display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <div style="display:flex;flex-direction:column;gap:20px;">
              <h2 style="font-size:42px;font-weight:900;color:${T.primary};margin:0;line-height:1.2;">${slide.title || ""}</h2>
              ${slide.subtitle ? `<p style="font-size:20px;color:#a3a3a3;margin:0;">${slide.subtitle}</p>` : ""}
              <div style="display:flex;flex-direction:column;gap:16px;margin-top:10px;">
                ${bulletItems}
              </div>
            </div>
            <div style="height:480px;border-radius:24px;border:1px solid ${border};background:#111;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,0.5);">
              ${imgEl}
            </div>
          </div>
        `;
      }
      else if (layout === "metric_callout" || layout === "metric") {
        const metrics = slide.metrics || [
          { value: slide.metric?.value || "99.4%", label: slide.metric?.label || "Metric KPI" },
          { value: "3.5x", label: "Acceleration" },
          { value: "< 10ms", label: "Latency" }
        ];
        const metricCards = metrics.slice(0, 3).map(m => `
          <div style="flex:1;padding:48px 32px;border-radius:24px;border:1px solid ${border};background:${cardBg};text-align:center;box-shadow:0 12px 48px 0 rgba(0,0,0,0.3);display:flex;flex-direction:column;justify-content:center;gap:12px;">
            <span style="font-size:68px;font-weight:900;background:linear-gradient(to right, ${T.primary}, ${T.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;letter-spacing:-2px;">${m.value}</span>
            <span style="font-size:16px;font-weight:800;color:${T.text};text-transform:uppercase;letter-spacing:2px;font-family:monospace;">${m.label}</span>
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:40px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:flex;gap:30px;width:100%;">${metricCards}</div>
          </div>
        `;
      }
      else if (layout === "timeline" || layout === "steps") {
        const events = (slide.events || [
          { year: "Phase 1", description: "Architecture Discovery" },
          { year: "Phase 2", description: "Semantic Indexing" },
          { year: "Phase 3", description: "Production Scale" }
        ]).slice(0, 4);
        const eventCards = events.map((ev, idx) => `
          <div style="flex:1;padding:28px 24px;border-radius:20px;border:1px solid ${border};background:#0d0d12;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 8px 32px rgba(0,0,0,0.35);min-height:220px;">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
              <span style="font-family:monospace;font-size:18px;font-weight:900;color:${T.primary};">${ev.year}</span>
              <div style="flex:1;height:1px;background:rgba(255,255,255,0.15);"></div>
            </div>
            <p style="font-size:18px;color:#d4d4d4;font-weight:300;line-height:1.6;margin:0;">${ev.description}</p>
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:40px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:flex;gap:24px;width:100%;">${eventCards}</div>
          </div>
        `;
      }
      else if (layout === "comparison" || layout === "two_column_text") {
        const leftItems = (slide.columns?.left || ["Baseline"]).map((item, idx) => `
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="width:8px;height:8px;border-radius:50%;background:${T.primary};flex-shrink:0;"></span>
            <span style="font-size:18px;color:${idx === 0 ? T.primary : T.text};font-weight:${idx === 0 ? "700" : "300"};">${item}</span>
          </div>
        `).join("");

        const rightItems = (slide.columns?.right || ["AI Modern"]).map((item, idx) => `
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="color:${T.accent};font-size:16px;flex-shrink:0;">✔</span>
            <span style="font-size:18px;color:${idx === 0 ? T.accent : "#ffffff"};font-weight:${idx === 0 ? "700" : "400"};">${item}</span>
          </div>
        `).join("");

        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;width:100%;">
              <div style="padding:36px;border-radius:24px;border:1px solid ${border};background:${cardBg};display:flex;flex-direction:column;gap:16px;">
                ${leftItems}
              </div>
              <div style="padding:36px;border-radius:24px;border:1px solid ${hexToRgba(T.primary, 0.4)};background:${hexToRgba(T.primary, 0.1)};display:flex;flex-direction:column;gap:16px;">
                ${rightItems}
              </div>
            </div>
          </div>
        `;
      }
      else if (layout === "pros_cons") {
        const proItems = (slide.pros || ["High accuracy", "Infinite scale"]).map(p => `
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="color:#10B981;font-size:18px;">✔</span>
            <span style="font-size:18px;color:#e5e5e5;font-weight:300;">${p}</span>
          </div>
        `).join("");

        const conItems = (slide.cons || ["Initial setup overhead"]).map(c => `
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="color:#EF4444;font-size:18px;">✖</span>
            <span style="font-size:18px;color:#e5e5e5;font-weight:300;">${c}</span>
          </div>
        `).join("");

        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;width:100%;">
              <div style="padding:36px;border-radius:24px;border:1px solid rgba(16,185,129,0.3);background:rgba(6,78,59,0.25);display:flex;flex-direction:column;gap:16px;">
                <span style="font-size:16px;font-weight:900;color:#10B981;text-transform:uppercase;letter-spacing:2px;">Advantages & Benefits</span>
                ${proItems}
              </div>
              <div style="padding:36px;border-radius:24px;border:1px solid rgba(239,68,68,0.3);background:rgba(69,10,10,0.25);display:flex;flex-direction:column;gap:16px;">
                <span style="font-size:16px;font-weight:900;color:#EF4444;text-transform:uppercase;letter-spacing:2px;">Challenges & Constraints</span>
                ${conItems}
              </div>
            </div>
          </div>
        `;
      }
      else {
        // Default bento cards / bullets
        const items = slide.bullets || ["Key insight"];
        const listItems = items.map((b, idx) => `
          <div style="padding:26px 28px;border-radius:20px;border:1px solid ${border};background:${cardBg};display:flex;align-items:start;gap:18px;box-shadow:0 8px 32px 0 rgba(0,0,0,0.25);">
            <span style="width:34px;height:34px;border-radius:50%;border:1px solid ${border};color:${T.accent};font-family:monospace;font-size:14px;font-weight:900;display:flex;align-items:center;justify-content:center;background:${hexToRgba(T.primary, 0.15)};flex-shrink:0;margin-top:2px;">
              0${idx + 1}
            </span>
            <p style="font-size:20px;color:${T.text};font-weight:300;line-height:1.6;margin:0;">${b}</p>
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;width:100%;">
              ${listItems}
            </div>
          </div>
        `;
      }

      const watermark = !isSubscribed ? `
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:130px;font-weight:900;color:rgba(255,255,255,0.018);pointer-events:none;white-space:nowrap;z-index:0;letter-spacing:10px;">PAPERXIFY FREE</div>
        <div style="position:absolute;bottom:28px;right:36px;font-size:12px;color:rgba(255,255,255,0.12);font-family:monospace;z-index:10;">Created with Paperxify Free</div>
      ` : "";

      return `
        <div style="width:1920px;height:1080px;box-sizing:border-box;padding:60px 100px;position:relative;page-break-after:always;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(ellipse at 85% 10%,${hexToRgba(T.primary, 0.12)} 0%,transparent 60%),radial-gradient(ellipse at 15% 90%,${hexToRgba(T.accent, 0.08)} 0%,transparent 55%),${T.bg};overflow:hidden;font-family:${T.fontFamily};color:${T.text};-webkit-print-color-adjust:exact;">
          ${watermark}
          <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.04);flex-shrink:0;">
            <span style="font-family:monospace;font-size:16px;color:#555;text-transform:uppercase;letter-spacing:2px;">${presentation.title}</span>
            <span style="font-family:monospace;font-size:14px;color:${hexToRgba(T.primary, 0.65)};text-transform:uppercase;letter-spacing:3px;">${layout.replace(/_/g, " ")} layout</span>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;padding:40px 0;">
            ${body}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:18px;border-top:1px solid rgba(255,255,255,0.04);flex-shrink:0;">
            <span style="font-family:monospace;font-size:15px;color:#555;">Paperxify AI Presentations</span>
            <span style="font-family:monospace;font-size:15px;color:#555;">Slide ${idx + 1} of ${presentation.slides.length}</span>
          </div>
        </div>
      `;
    };

    const slidesHTML = presentation.slides.map((s, i) => renderSlide(s, i)).join("\n");

    const completeHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${fontImport}
    @page { size: 1920px 1080px; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; background: ${T.bg}; }
  </style>
</head>
<body>
  ${slidesHTML}
</body>
</html>`;

    const options = {
      width: "1920px",
      height: "1080px",
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 45000,
      waitUntil: "networkidle0"
    };

    const file = { content: completeHTML };
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);

    const filename = `${presentation.title.replace(/[^\w\s.-]/gi, "_").substring(0, 50)}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ PDF Export Error:", error);
    return res.status(500).json({ success: false, message: "Failed to export PDF", error: error.message });
  }
};
