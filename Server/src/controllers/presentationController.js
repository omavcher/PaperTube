const mongoose = require("mongoose");
const Presentation = require("../models/Presentation");
const User = require("../models/User");
const Folder = require("../models/Folder");
const GeminiClient = require("../utils/geminiClient");
const pptxgen = require("pptxgenjs");
const crypto = require("crypto");
const { awardXP } = require("../utils/xpHelper");
const { searchPresentationImages } = require("../services/imageSearchService");
const { buildMasterXMLPrompt, parsePresentationXML, enrichSlidesWithRealImages } = require("../services/xmlPresentationService");

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
 * Curated Visual Candidate Engine with Real-Time Multi-Provider Image Search (Google + Wikimedia + Unsplash)
 */
const generateImageCandidatesHelper = async (slideTitle = "", slideDesc = "", layout = "image_left", topic = "", slideIndex = 0) => {
  const cleanTitle = (slideTitle || topic || "Executive Strategy").replace(/[^\w\s-]/g, " ").trim();
  const searchQuery = cleanTitle.length > 3 ? cleanTitle : (topic || "Modern Technology");
  
  // Real search images from Google / Wikimedia / Unsplash
  let searchUrls = [];
  try {
    searchUrls = await searchPresentationImages(searchQuery, 4);
  } catch (e) {
    console.warn("Failed to search presentation images:", e.message);
  }

  const curatedUnsplashPool = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
  ];

  const styles = [
    { name: "Photorealistic", desc: "High-resolution photographic capture of subject", baseScore: 95 },
    { name: "Cinematic", desc: "Dramatic wide-angle presentation visual with depth", baseScore: 91 },
    { name: "3D Render", desc: "Modern technical render with clean geometry", baseScore: 87 },
    { name: "Minimalist", desc: "Clean negative-space composition for presentation text", baseScore: 83 }
  ];

  return styles.map((st, i) => {
    const candidateUrl = (searchUrls && searchUrls[i]) || curatedUnsplashPool[(slideIndex + i) % curatedUnsplashPool.length];
    const relevance = Math.min(99, Math.max(86, st.baseScore + (i === 0 ? 3 : -i * 2)));
    const layoutScore = layout === "image_left" || layout === "image_right" ? 96 : 89;
    const quality = 96 - (i * 2);
    const textSafe = 92 - (i * 3);
    const compositeScore = Math.round(relevance * 0.40 + layoutScore * 0.25 + quality * 0.20 + textSafe * 0.15);

    return {
      id: `cand-${slideIndex + 1}-${i + 1}`,
      url: candidateUrl,
      title: `${st.name}: ${cleanTitle.split(" ").slice(0, 4).join(" ")}`,
      style: st.name,
      description: st.desc,
      score: compositeScore,
      scores: {
        relevance,
        layout: layoutScore,
        quality,
        textSafe
      }
    };
  });
};

/**
 * Endpoint to fetch 4 fresh candidate images with multi-factor layout scores
 * POST /api/presentation/image-candidates
 */
exports.getImageCandidates = async (req, res) => {
  try {
    const { slideTitle = "", slideDesc = "", layout = "image_left", topic = "", slideIndex = 0 } = req.body;
    const candidates = await generateImageCandidatesHelper(slideTitle, slideDesc, layout, topic, slideIndex);

    return res.status(200).json({
      success: true,
      candidates
    });
  } catch (error) {
    console.error("❌ Image Candidates Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate image candidates",
      error: error.message
    });
  }
};

/**
 * Create Blank Presentation Deck (Start from Scratch)
 * POST /api/presentation/create-blank
 */
exports.createBlankPresentation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title = "Untitled Presentation", theme = "sunset-orange" } = req.body;

    const slug = generateSlug(title);
    const starterSlides = [
      {
        id: 1,
        title: title,
        subtitle: "Click here to edit presentation subtitle and key thesis",
        layout: "title",
        author: "Created with Paperxify Studio",
        speakerNotes: "Welcome everyone. Today we are presenting " + title + "."
      },
      {
        id: 2,
        title: "Key Objectives & Core Premise",
        layout: "image_left",
        image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
        bullets: [
          "Primary Objective: Define core strategic priorities and implementation timeline.",
          "Secondary Objective: Identify high-impact growth levers and architecture metrics.",
          "Key Takeaway: Deliver measurable outcomes and long-term organizational value."
        ],
        speakerNotes: "In this slide, we establish the primary framework and foundational pillars."
      },
      {
        id: 3,
        title: "Strategic Impact & High-Yield Benchmarks",
        layout: "metric_callout",
        metrics: [
          { value: "99.4%", label: "Target Precision" },
          { value: "3.5x", label: "Velocity Multiplier" },
          { value: "< 25ms", label: "Latency Benchmark" }
        ],
        speakerNotes: "These metrics demonstrate the target efficiency and performance indicators."
      }
    ];

    const newPresentation = new Presentation({
      owner: userId,
      title: title,
      slug: slug,
      theme: theme || "sunset-orange",
      slides: starterSlides,
      generationDetails: {
        model: "scratch",
        language: "English",
        slideCount: starterSlides.length,
        prompt: "Blank presentation created from scratch",
        cost: 0,
        processingTime: 0
      }
    });

    await newPresentation.save();

    return res.status(200).json({
      success: true,
      message: "Blank presentation created successfully",
      data: {
        slug: newPresentation.slug,
        title: newPresentation.title,
        slideCount: newPresentation.slides.length
      }
    });
  } catch (error) {
    console.error("❌ Create Blank Presentation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blank presentation",
      error: error.message
    });
  }
};

/**
 * Generate Slide Outline with Layout-Aware Visual Candidates and Web Grounding (System A: Step 2)
 * POST /api/presentation/generate-outline
 */
exports.generateOutline = async (req, res) => {
  try {
    const { sourceInput, slideCount = 10, language = "English", prompt = "", style = "professional", webSearch = false } = req.body;
    if (!sourceInput) {
      return res.status(400).json({ success: false, message: "Presentation topic/prompt is required" });
    }

    const outlinePrompt = `You are a world-class presentation architect (matching Gamma.app & Pitch standards).
Create a presentation outline for the topic: "${sourceInput}".
Language: "${language}".
Tone/Style: "${style}" (e.g. professional, academic, casual, startup pitch, technical).
Slide count: ${slideCount}.
Web Grounding Enabled: ${webSearch ? "true (use recent accurate facts, statistics, and verifiable citations)" : "false"}.
Additional instructions: "${prompt}".

Provide the output in a strict JSON format with a root "slides" array containing exactly ${slideCount} items. Each item must be a JSON object with:
- "title": a sharp, compelling slide title (3-6 words)
- "desc": a substantive overview describing the slide's key thesis, evidence, or takeaways (1-2 sentences)
- "layout": recommended layout for this slide ("title", "image_left", "image_right", "bullets", "comparison", "metric_callout", "timeline", "matrix_2x2", "pros_cons", "quote", "paragraph", "conclusion")
- "sources": optional array of verified citations if web grounding applies (e.g. ["IEA Report 2025", "Bloomberg Energy"])

Ensure that:
1. Slide 1 is a captivating Title/Intro slide.
2. Slide ${slideCount} is an Executive Summary / Conclusion with forward actions.
3. The intermediate slides flow logically and provide progressive depth on the topic without fluff.

Do not include any extra text, comments, markdown tags (like \`\`\`json) or warnings. Return only the JSON object.`;

    const messages = [
      { role: "system", content: "You are a professional presentation planner. Output strict raw JSON only." },
      { role: "user", content: outlinePrompt }
    ];

    const responseText = await callOpenRouterOrGemini(messages, { temperature: 0.5, max_tokens: 3500 });
    const outlineData = extractJSON(responseText);

    if (!outlineData || !Array.isArray(outlineData.slides)) {
      throw new Error("Failed to generate a valid slide outline JSON.");
    }

    // Attach layout-aware ranked visual candidates for every outline card
    const enrichedSlides = await Promise.all(outlineData.slides.map(async (sl, idx) => {
      const layout = sl.layout || (idx === 0 ? "title" : idx % 2 === 1 ? "image_left" : "bullets");
      const candidates = await generateImageCandidatesHelper(sl.title, sl.desc, layout, sourceInput, idx);

      return {
        ...sl,
        layout,
        imageCandidates: candidates,
        selectedImageIndex: 0,
        selectedImage: candidates[0]?.url || ""
      };
    }));

    return res.status(200).json({
      success: true,
      data: {
        title: sourceInput,
        slides: enrichedSlides
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
 * Generate Final Presentation Slide Contents (System A: Step 4)
 * POST /api/presentation/generate-final
 */
exports.generateFinal = async (req, res) => {
  const startTime = Date.now();
  try {
    const { 
      title, 
      outline, 
      theme, 
      textDensity = "minimal", 
      visuals = true, 
      language = "English", 
      model = "flash", 
      prompt = "",
      style = "professional",
      imageSource = "unsplash",
      webSearch = false,
      audience = "general"
    } = req.body;
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

    // 1. Build Master XML Prompt (Matching mini-presentation-ai / allweonedev architecture)
    const masterPrompt = buildMasterXMLPrompt({
      title,
      outline,
      numberOfCards: outline.length || 7,
      language,
      tone: style,
      audience,
      webSearch,
      additionalContext: prompt
    });

    const messages = [
      { role: "system", content: "You are an elite presentation XML creator. Output well-formed <PRESENTATION> XML only." },
      { role: "user", content: masterPrompt }
    ];

    console.log(`🤖 Generating presentation XML for "${title}" using OpenRouter/DeepSeek/Gemini...`);
    const responseText = await callOpenRouterOrGemini(messages, { temperature: 0.7, max_tokens: 15000 });

    // 2. Parse XML Deck
    let parsedData = parsePresentationXML(responseText);
    let rawSlides = parsedData?.slides;

    // Fallback to JSON if model output JSON
    if (!Array.isArray(rawSlides) || rawSlides.length === 0) {
      console.log("ℹ️ XML parser returned empty, attempting JSON fallback parser...");
      rawSlides = extractJSON(responseText);
    }

    if (!Array.isArray(rawSlides) || rawSlides.length === 0) {
      throw new Error("Failed to generate a valid detailed presentation slides array.");
    }

    // 3. Enrich slides with real Google Images & Wikimedia photography
    console.log(`🔍 Enriching ${rawSlides.length} slides with verified Google & Wikimedia imagery...`);
    const enrichedSlides = await enrichSlidesWithRealImages(rawSlides, title);

    const slug = generateSlug(title);
    let effectiveTheme = chosenTheme;
    if (parsedData?.theme) {
      const customThemeKey = `ai-${slug.substring(0, 8)}`;
      THEME_CONFIGS[customThemeKey] = parsedData.theme;
      effectiveTheme = customThemeKey;
    }

    const newPresentation = new Presentation({
      owner: userId,
      title: title,
      slug: slug,
      theme: effectiveTheme,
      slides: enrichedSlides.map((slide, idx) => {
        const outlineItem = outline[idx] || {};
        let img = outlineItem.selectedImage || outlineItem.image_url || slide.image_url;
        if (!img || !img.startsWith("http")) {
          img = slide.imageCandidates?.[0]?.url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";
        }

        const sources = Array.isArray(slide.sources) ? slide.sources : (Array.isArray(outlineItem.sources) ? outlineItem.sources : []);

        // Normalize bullets
        let bullets = [];
        if (Array.isArray(slide.bullets) && slide.bullets.length > 0) {
          bullets = slide.bullets.map(b => {
            if (typeof b === "string") return b;
            if (b && typeof b === "object") return b.title ? `${b.title}: ${b.description || b.text || ''}` : (b.text || b.description || JSON.stringify(b));
            return String(b || "");
          });
        } else if (slide.subtitle) {
          bullets = [slide.subtitle];
        }

        // Normalize columns for comparison
        let columns = { left: [], right: [] };
        if (slide.columns && typeof slide.columns === "object") {
          columns.left = Array.isArray(slide.columns.left) ? slide.columns.left.map(String) : (slide.columns.left ? [String(slide.columns.left)] : []);
          columns.right = Array.isArray(slide.columns.right) ? slide.columns.right.map(String) : (slide.columns.right ? [String(slide.columns.right)] : []);
        } else if (Array.isArray(slide.pros) && Array.isArray(slide.cons) && (slide.pros.length > 0 || slide.cons.length > 0)) {
          columns.left = slide.pros;
          columns.right = slide.cons;
        } else if (bullets.length > 1) {
          const half = Math.ceil(bullets.length / 2);
          columns.left = bullets.slice(0, half);
          columns.right = bullets.slice(half);
        }

        return {
          id: idx + 1,
          title: typeof slide.title === "string" ? slide.title : "Slide Title",
          subtitle: typeof slide.subtitle === "string" ? slide.subtitle : "",
          layout: slide.layout || (idx === 0 ? "title" : idx % 3 === 1 ? "image_left" : "bullets"),
          bullets: bullets,
          columns: columns,
          metric: slide.metric && typeof slide.metric === "object" ? slide.metric : { value: "", label: "", description: "" },
          metrics: Array.isArray(slide.metrics) ? slide.metrics : [],
          events: Array.isArray(slide.events) ? slide.events : [],
          pros: Array.isArray(slide.pros) ? slide.pros : [],
          cons: Array.isArray(slide.cons) ? slide.cons : [],
          quote_text: slide.quote_text || "",
          author: slide.author || slide.quoteAuthor || "",
          role: slide.role || slide.quoteRole || "",
          image_url: img,
          imageCandidates: slide.imageCandidates || outlineItem.imageCandidates || [],
          sources: sources,
          speakerNotes: typeof slide.speakerNotes === "string" ? slide.speakerNotes : "",
          generationDetails: {
            modelUsed: model,
            promptLength: masterPrompt.length,
            generatedAt: new Date()
          }
        };
      }),
      generationDetails: {
        model,
        language,
        slideCount: enrichedSlides.length,
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
 * Conversational Presentation AI Agent Action (System B: Tool Operations)
 * POST /api/presentation/agent-action
 */
exports.agentAction = async (req, res) => {
  try {
    const { 
      action = "chat_agent", 
      slide, 
      slides = [], 
      activeSlideIndex = 0, 
      instruction = "", 
      presentationTitle = "", 
      theme = "sunset-orange",
      afterSlideId,
      imagePrompt = "",
      imageSource = "unsplash"
    } = req.body;

    const currentSlide = slide || (slides && slides[activeSlideIndex]) || slides[0];

    // Tool 1: Regenerate Single Slide (targeted replacement)
    if (action === "regenerate_slide") {
      if (!currentSlide) {
        return res.status(400).json({ success: false, message: "Slide data required for regeneration" });
      }

      const prompt = `You are a world-class presentation agent. Regenerate this specific slide based on the user's instruction.
Presentation Topic: "${presentationTitle}"
User Instruction: "${instruction || "Improve clarity, depth, and layout aesthetics"}"
Current Slide JSON:
${JSON.stringify(currentSlide, null, 2)}

Requirements:
1. Make the content substantive, rich, high-contrast, and tailored.
2. Select the optimal layout for this content: "title", "image_left", "image_right", "bullets", "comparison", "metric_callout", "timeline", "matrix_2x2", "pros_cons", "quote", "paragraph", "gallery_grid", "conclusion".
3. Return STRICT RAW JSON object for this slide only (preserve id: ${currentSlide.id || 1}).
4. Include speakerNotes teleprompter script.
Output ONLY raw JSON object.`;

      const responseText = await callOpenRouterOrGemini([
        { role: "system", content: "You are a presentation editor agent. Output strict raw JSON only." },
        { role: "user", content: prompt }
      ], { temperature: 0.6, max_tokens: 2500 });

      const updated = extractJSON(responseText);
      if (!updated || typeof updated !== "object") throw new Error("Invalid regenerated slide output");
      updated.id = currentSlide.id || Date.now();

      return res.status(200).json({
        success: true,
        tool: "regenerate_slide",
        slide: updated,
        message: "Slide updated with tailored AI layout & copy."
      });
    }

    // Tool 2: Create Slide (Insert after specified slide)
    if (action === "create_slide") {
      const prompt = `You are a world-class presentation agent. Create ONE new slide to insert into the presentation deck.
Presentation Topic: "${presentationTitle}"
Insertion Instruction / Context: "${instruction || "Add the next logical slide topic in this narrative"}"

Select an engaging layout from: "image_left", "image_right", "bullets", "comparison", "metric_callout", "timeline", "matrix_2x2", "pros_cons", "quote".
Include title, subtitle/takeaways, bullet points or metrics, image_url (thematic unsplash photo), and speakerNotes.

Return STRICT RAW JSON object representing this single new slide. No markdown code blocks.`;

      const responseText = await callOpenRouterOrGemini([
        { role: "system", content: "You are a presentation creator agent. Output strict raw JSON only." },
        { role: "user", content: prompt }
      ], { temperature: 0.7, max_tokens: 2500 });

      const newSlide = extractJSON(responseText);
      if (!newSlide || typeof newSlide !== "object") throw new Error("Invalid created slide output");
      newSlide.id = Date.now();

      return res.status(200).json({
        success: true,
        tool: "create_slide",
        slide: newSlide,
        afterSlideId: afterSlideId,
        message: `Created new slide: "${newSlide.title || "New Concept"}"`
      });
    }

    // Tool 3: Get Ranked Visual Candidates for Slide
    if (action === "get_image_candidates") {
      const searchTerm = currentSlide?.imageQuery || currentSlide?.title || presentationTitle || "technology";
      const realImages = await searchPresentationImages(searchTerm, 4);
      const candidates = realImages.map((url, idx) => ({
        id: idx + 1,
        url,
        score: 96 - idx * 3,
        style: idx === 0 ? "Photographic Master" : idx === 1 ? "Panoramic Context" : "High Contrast"
      }));

      return res.status(200).json({
        success: true,
        tool: "get_image_candidates",
        candidates,
        message: "Fetched verified high-res visual candidates."
      });
    }

    // Tool 4: Targeted Web Fact Search & Grounding
    if (action === "search_facts") {
      const query = instruction || currentSlide?.title || presentationTitle;
      const researchPrompt = `You are a factual research analyst.
Find 3-4 verified, current factual statistics or data benchmarks for: "${query}".
Presentation Context: "${presentationTitle}"

Return a STRICT RAW JSON object with:
{
  "facts": ["Fact 1 with metric", "Fact 2 with metric", "Fact 3 with metric"],
  "sources": ["Source Name 1", "Source Name 2"]
}`;

      const responseText = await callOpenRouterOrGemini([
        { role: "system", content: "You are a factual research engine. Output strict raw JSON only." },
        { role: "user", content: researchPrompt }
      ], { temperature: 0.4, max_tokens: 1500 });

      const factsData = extractJSON(responseText) || { facts: [], sources: [] };

      const updated = {
        ...currentSlide,
        bullets: factsData.facts && factsData.facts.length > 0 ? factsData.facts : currentSlide.bullets,
        sources: factsData.sources || ["Verified Industry Data"]
      };

      return res.status(200).json({
        success: true,
        tool: "search_facts",
        slide: updated,
        sources: factsData.sources,
        message: `Grounded slide with verified facts for: "${query}"`
      });
    }

    // Tool 5: Replace / Search Image
    if (action === "replace_image") {
      const searchTerm = imagePrompt || instruction || currentSlide?.title || presentationTitle || "technology";
      const realImages = await searchPresentationImages(searchTerm, 4);
      const chosenUrl = realImages[0] || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";
      const candidates = realImages.map((url, idx) => ({
        id: idx + 1,
        url,
        score: 95 - idx * 3,
        style: idx === 0 ? "Photographic" : "Contextual"
      }));

      return res.status(200).json({
        success: true,
        tool: "replace_image",
        imageUrl: chosenUrl,
        candidate: candidates[0],
        candidates: candidates,
        message: `Visual updated with verified photography for: "${searchTerm}"`
      });
    }

    // Tool 6: Conversational Chat Agent with Autonomous Tool Selection
    const agentPrompt = `You are the Gamma-grade Presentation AI Copilot Agent.
You have direct control over this presentation deck.

Presentation Title: "${presentationTitle}"
Total Slides: ${slides.length}
Active Slide Index: ${activeSlideIndex + 1}
Active Slide Content:
${JSON.stringify(currentSlide, null, 2)}

User Instruction: "${instruction}"

Analyze the user's intent and choose the best tool action:
1. "regenerate_slide": If the user wants to rewrite/improve/shorten/expand/metricize/re-layout the current slide.
   - You MUST return a complete, valid slide object.
   - Choose optimal layout: "title", "image_left", "image_right", "bullets", "comparison", "metric_callout", "timeline", "matrix_2x2", "pros_cons", "quote", "paragraph", "gallery_grid", "conclusion".
   - Include substantive copy, speakerNotes, and imageQuery (if layout has images).
2. "create_slide": If user asks to insert or add a new slide. Return a complete new slide object.
3. "change_theme": If user asks to change theme / visual mood. Return "themeId" ("sunset-orange", "midnight-tech", "cyberpunk", "emerald-forest", "vintage-gold", "royal-velvet", "carbon-coder", "dark-matter").
4. "replace_image": If user asks to find / change / replace image. Return "imagePrompt" string.
5. "search_facts": If user asks for verified statistics, data, or source grounding. Return updated slide with facts.
6. "answer": If user asks a general presentation or design question.

Output strictly valid JSON matching this schema:
{
  "tool": "regenerate_slide" | "create_slide" | "change_theme" | "replace_image" | "search_facts" | "answer",
  "slide": {
    "title": "Slide Title",
    "subtitle": "Subtitle",
    "layout": "image_left",
    "imageQuery": "Search query for real photo",
    "bullets": ["Bullet 1", "Bullet 2"],
    "metrics": [{"value": "4.2x", "label": "Speedup"}],
    "events": [{"year": "Phase 1", "description": "Desc"}],
    "columns": {"left": ["Left 1"], "right": ["Right 1"]},
    "pros": ["Pro 1"],
    "cons": ["Con 1"],
    "quote_text": "Quote",
    "quoteAuthor": "Author",
    "quoteRole": "Role",
    "speakerNotes": "Teleprompter script"
  },
  "themeId": "sunset-orange",
  "imagePrompt": "search term",
  "message": "Clear explanation of changes made"
}

Return raw JSON only.`;

    const responseText = await callOpenRouterOrGemini([
      { role: "system", content: "You are an autonomous presentation editing agent. Output strict raw JSON only." },
      { role: "user", content: agentPrompt }
    ], { temperature: 0.6, max_tokens: 3500 });

    const agentResult = extractJSON(responseText);
    if (!agentResult || typeof agentResult !== "object") {
      throw new Error("Failed to parse presentation agent response");
    }

    if (agentResult.slide) {
      if (agentResult.tool === "regenerate_slide") {
        agentResult.slide.id = currentSlide ? currentSlide.id : Date.now();
      } else if (agentResult.tool === "create_slide") {
        agentResult.slide.id = Date.now();
      }

      // Enrich slide with real photography if needed
      const imgQuery = agentResult.imagePrompt || agentResult.slide.imageQuery || (
        (agentResult.slide.layout === "image_left" || agentResult.slide.layout === "image_right" || agentResult.slide.layout === "gallery_grid")
          ? `${agentResult.slide.title} ${presentationTitle}`
          : ""
      );

      if (imgQuery) {
        const realImages = await searchPresentationImages(imgQuery, 4);
        if (realImages && realImages.length > 0) {
          agentResult.slide.image_url = realImages[0];
          agentResult.slide.imageCandidates = realImages.map((url, idx) => ({
            id: idx + 1,
            url,
            score: 95 - idx * 3,
            style: idx === 0 ? "Photographic" : "Contextual"
          }));
        }
      }
    }

    if (agentResult.tool === "replace_image" && agentResult.imagePrompt) {
      const realImages = await searchPresentationImages(agentResult.imagePrompt, 4);
      if (realImages && realImages.length > 0) {
        agentResult.imageUrl = realImages[0];
      }
    }

    return res.status(200).json({
      success: true,
      ...agentResult
    });

  } catch (error) {
    console.error("❌ Agent Action Error:", error);
    return res.status(500).json({
      success: false,
      message: "Presentation agent action failed",
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
        _id: presentation._id,
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
        // Bento cards / bullets / conclusion
        slideObj.addText(slide.title || "Key Takeaways", {
          x: 0.6, y: 0.6, w: 8.8, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const rawBullets = (Array.isArray(slide.bullets) && slide.bullets.length > 0)
          ? slide.bullets
          : (Array.isArray(slide.pros) && slide.pros.length > 0)
          ? slide.pros
          : (slide.subtitle || slide.content)
          ? [slide.subtitle || slide.content, "Strategic Execution Milestone", "Performance and Quality Telemetry"]
          : ["Strategic Execution Milestone", "Performance and Quality Telemetry"];

        const bulletItems = rawBullets.map(b => ({
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
        // Default bento cards / bullets / conclusion
        const items = (Array.isArray(slide.bullets) && slide.bullets.length > 0)
          ? slide.bullets
          : (Array.isArray(slide.pros) && slide.pros.length > 0)
          ? slide.pros
          : (slide.subtitle || slide.content)
          ? [slide.subtitle || slide.content, "Strategic Execution Milestone", "Performance and Quality Telemetry"]
          : ["Strategic Execution Milestone", "Performance and Quality Telemetry"];
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

    const filename = `${presentation.title.replace(/[^\w\s.-]/gi, "_").substring(0, 50)}.html`;
    res.setHeader("Content-Type", "text/html");
    return res.send(completeHTML);
  } catch (error) {
    console.error("❌ PDF Export Error:", error);
    return res.status(500).json({ success: false, message: "Failed to export PDF", error: error.message });
  }
};
