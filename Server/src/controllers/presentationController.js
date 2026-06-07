const mongoose = require("mongoose");
const Presentation = require("../models/Presentation");
const User = require("../models/User");
const Folder = require("../models/Folder");
const GeminiClient = require("../utils/geminiClient");
const pptxgen = require("pptxgenjs");
const html_to_pdf = require("html-pdf-node");
const crypto = require("crypto");

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
    const finalPrompt = `Generate the full slide deck content based on the user-approved outline structure: ${JSON.stringify(outline)}.
Topic: "${title}".
Language: "${language}".
Text Density: "${textDensity}".
Visuals Enabled: ${visuals}.
Additional Prompt Context: "${prompt}".

For each slide title in the outline, choose one of the following 17 layout types based on the topic context and supply the corresponding data fields:
Layout Options:
1. "title": The main hero cover of the presentation. Fields: "title", "subtitle", "author" (optional, e.g. "By Paperxify AI")
2. "section_break": A bold divider to introduce a new chapter. Fields: "title", "subtitle"
3. "conclusion": The final wrap-up or summary slide. Fields: "title", "bullets" (array of 3-4 strings summarizing key takeaways)
4. "bullets": Standard bulleted list for key takeaways. Fields: "title", "bullets" (array of 3-5 strings)
5. "paragraph": Long-form text for detailed explanations. Fields: "title", "content" (string representing detailed analysis paragraphs)
6. "quote": Highlighting a powerful statement or testimonial. Fields: "quote_text" (string), "author" (string), "role" (string, optional)
7. "two_column_text": Two side-by-side text blocks without comparison. Fields: "title", "left_text" (string), "right_text" (string)
8. "comparison": Side-by-side feature comparison. Fields: "title", "columns" object containing "left" (array of strings, first item is header) and "right" (array of strings, first item is header)
9. "pros_cons": Specifically formatted for advantages vs disadvantages. Fields: "title", "pros" (array of strings), "cons" (array of strings)
10. "metric_callout": One or three massive numbers with short labels. Fields: "title", "metrics" (array of 1 or 3 objects each with "value" and "label")
11. "matrix_2x2": A four-quadrant grid (e.g., SWOT analysis). Fields: "title", "quadrants" (array of exactly 4 strings for Top-Left, Top-Right, Bottom-Left, Bottom-Right)
12. "timeline": Chronological events mapped horizontally. Fields: "title", "events" (array of objects with "year" and "description" fields)
13. "steps": A 1-2-3-4 numbered process flow. Fields: "title", "steps" (array of 3-4 strings)
14. "roadmap": Future planning (Now, Next, Later). Fields: "title", "phases" (array of 3 objects with "phase" and "goal" fields)
15. "image_left": Image on the left 50%, text on the right. Fields: "title", "content" (string), "image_url" (string), "alt_text" (string)
16. "image_right": Image on the right 50%, text on the left. Fields: "title", "content" (string), "image_url" (string), "alt_text" (string)
17. "gallery_grid": A grid of images. Fields: "title", "images" (array of 2-4 image URLs)

Note: For any image URLs, use high quality Unsplash abstract/tech images matching the theme, e.g. "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800" or similar keywords.

For each slide, you must also provide "speakerNotes" (a paragraph of text representing the presenter script).

Generate the output in a strict JSON format matching this array structure:
[
  {
    "id": 1,
    "title": "Title of Slide",
    "subtitle": "Cover Subtitle",
    "layout": "title",
    "author": "Presented by Paperxify",
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 2,
    "title": "Section Title",
    "subtitle": "Chapter introduction summary",
    "layout": "section_break",
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 3,
    "title": "Introduction to Topic",
    "layout": "paragraph",
    "content": "This is a detailed analysis of the core concepts...",
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 4,
    "title": "Key Takeaways",
    "layout": "bullets",
    "bullets": ["Bullet 1", "Bullet 2", "Bullet 3"],
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 5,
    "title": "Inspiring Quote",
    "layout": "quote",
    "quote_text": "Quantum computing is the next frontier.",
    "author": "Richard Feynman",
    "role": "Theoretical Physicist",
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 6,
    "title": "Compare Systems",
    "layout": "comparison",
    "columns": {
      "left": ["Legacy", "High latency"],
      "right": ["Modern", "Sub-millisecond"]
    },
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 7,
    "title": "Strategic Overview",
    "layout": "matrix_2x2",
    "quadrants": ["Strengths: Speed", "Weaknesses: Cost", "Opportunities: Scale", "Threats: Noise"],
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 8,
    "title": "Historical Timeline",
    "layout": "timeline",
    "events": [
      { "year": "1998", "description": "First 2-qubit computer built" },
      { "year": "2019", "description": "Quantum supremacy claim" }
    ],
    "speakerNotes": "Presenter notes..."
  }
]

Do not include any extra text, comments, markdown tags (like \`\`\`json) or warnings. Return only the JSON array.`;

    const messages = [
      { role: "system", content: "You are a professional PowerPoint designer. Write strict raw JSON code array only." },
      { role: "user", content: finalPrompt }
    ];

    const responseText = await callOpenRouterOrGemini(messages, { temperature: 0.7, max_tokens: 15000 });
    const slidesData = extractJSON(responseText);

    if (!Array.isArray(slidesData) || slidesData.length === 0) {
      throw new Error("Failed to generate a valid detailed presentation slides array.");
    }

    const slug = generateSlug(title);
    const newPresentation = new Presentation({
      owner: userId,
      title: title,
      slug: slug,
      theme: chosenTheme,
      slides: slidesData.map((slide, idx) => ({
        id: idx + 1,
        title: slide.title || "Slide Title",
        subtitle: slide.subtitle || "",
        layout: slide.layout || "bullets",
        bullets: slide.bullets || [],
        columns: slide.columns || { left: [], right: [] },
        metric: slide.metric || { value: "", label: "", description: "" },
        speakerNotes: slide.speakerNotes || "",
        variantIndex: slide.variantIndex || 0,
        bgImageIndex: slide.bgImageIndex || 0,
        author: slide.author || "",
        content: slide.content || "",
        quote_text: slide.quote_text || "",
        role: slide.role || "",
        left_text: slide.left_text || "",
        right_text: slide.right_text || "",
        pros: slide.pros || [],
        cons: slide.cons || [],
        metrics: slide.metrics || [],
        quadrants: slide.quadrants || [],
        events: slide.events || [],
        steps: slide.steps || [],
        phases: slide.phases || [],
        image_url: slide.image_url || "",
        alt_text: slide.alt_text || "",
        images: slide.images || []
      })),
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
      
      // Dynamic theme-aligned background fill
      slideObj.background = { fill: bgColor };

      const normalized = normalizeSlide(slide);

      if (normalized.layout === "title") {
        slideObj.addText(normalized.title, {
          x: 1, y: 2, w: 8, h: 1.5,
          fontSize: 40, align: "center",
          color: primaryColor, bold: true,
          fontFace: fontFace
        });
        if (normalized.subtitle) {
          slideObj.addText(normalized.subtitle, {
            x: 1, y: 3.8, w: 8, h: 1,
            fontSize: 18, align: "center",
            color: textColor,
            fontFace: fontFace
          });
        }
      } else if (normalized.layout === "bullets") {
        slideObj.addText(normalized.title, {
          x: 0.5, y: 0.5, w: 9, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        const bulletItems = normalized.bullets.map(b => ({
          text: b,
          options: { bullet: true, color: textColor, fontSize: 16 }
        }));
        slideObj.addText(bulletItems, {
          x: 0.5, y: 1.5, w: 9, h: 4.5,
          fontFace: fontFace
        });
      } else if (normalized.layout === "comparison") {
        slideObj.addText(normalized.title, {
          x: 0.5, y: 0.5, w: 9, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });

        // Left column
        const leftCol = normalized.columns?.left || [];
        const leftItems = leftCol.map((item, idx) => ({
          text: item,
          options: {
            bullet: idx > 0,
            fontSize: idx === 0 ? 18 : 14,
            bold: idx === 0,
            color: idx === 0 ? primaryColor : textColor
          }
        }));
        slideObj.addText(leftItems, {
          x: 0.5, y: 1.5, w: 4.25, h: 4.5,
          fontFace: fontFace
        });

        // Right column
        const rightCol = normalized.columns?.right || [];
        const rightItems = rightCol.map((item, idx) => ({
          text: item,
          options: {
            bullet: idx > 0,
            fontSize: idx === 0 ? 18 : 14,
            bold: idx === 0,
            color: idx === 0 ? accentColor : textColor
          }
        }));
        slideObj.addText(rightItems, {
          x: 5.25, y: 1.5, w: 4.25, h: 4.5,
          fontFace: fontFace
        });
      } else if (normalized.layout === "metric") {
        slideObj.addText(normalized.title, {
          x: 0.5, y: 0.5, w: 9, h: 0.8,
          fontSize: 24, color: primaryColor, bold: true,
          fontFace: fontFace
        });
        slideObj.addText(normalized.metric?.value || "0%", {
          x: 0.5, y: 2, w: 4, h: 1.8,
          fontSize: 64, bold: true, color: primaryColor, align: "center",
          fontFace: fontFace
        });
        slideObj.addText(normalized.metric?.label || "Metric Label", {
          x: 0.5, y: 4, w: 4, h: 0.8,
          fontSize: 16, bold: true, color: accentColor, align: "center",
          fontFace: fontFace
        });
        slideObj.addText(normalized.metric?.description || "", {
          x: 5, y: 2, w: 4.5, h: 3,
          fontSize: 16, color: textColor,
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
 * Export to PDF (Beautiful HTML → PDF with all 17 layouts)
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
      const border = hexToRgba(T.primary, 0.15);
      const cardBg = hexToRgba(T.primary, 0.04);
      let body = "";

      if (layout === "title") {
        body = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;gap:30px;max-width:1200px;margin:0 auto;position:relative;z-index:2;">
            <h1 style="font-size:76px;font-weight:900;line-height:1.2;margin:0;background:linear-gradient(160deg,#ffffff 30%,${T.primary});-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-1px;">
              ${slide.title || ""}
            </h1>
            <div style="width:140px;height:6px;border-radius:4px;background:${T.primary};box-shadow:0 0 15px ${T.primary};margin:10px auto;"></div>
            ${slide.subtitle ? `<p style="font-size:28px;color:#d4d4d4;font-weight:300;margin:0;max-width:900px;line-height:1.5;">${slide.subtitle}</p>` : ""}
            ${slide.author ? `<p style="font-size:18px;color:${T.primary};font-family:monospace;letter-spacing:3px;text-transform:uppercase;margin-top:20px;">// ${slide.author}</p>` : ""}
          </div>
        `;
      }
      else if (layout === "section_break") {
        body = `
          <div style="display:flex;flex-direction:column;justify-content:center;height:100%;padding-left:80px;border-left:8px solid ${T.primary};max-width:1200px;margin:0 auto;position:relative;z-index:2;gap:20px;">
            <span style="font-family:monospace;text-transform:uppercase;letter-spacing:6px;font-size:16px;font-weight:900;color:${T.primary};">// NEXT CHAPTER</span>
            <h1 style="font-size:68px;font-weight:900;margin:0;color:#ffffff;line-height:1.2;letter-spacing:-1.5px;">${slide.title || ""}</h1>
            ${slide.subtitle ? `<p style="font-size:26px;color:#a3a3a3;font-weight:300;margin:0;max-width:900px;line-height:1.5;">${slide.subtitle}</p>` : ""}
          </div>
        `;
      }
      else if (layout === "conclusion") {
        const bullets = slide.bullets || [];
        const cards = bullets.map(b => `
          <div style="padding:28px;border-radius:18px;border:1px solid ${border};background:${cardBg};display:flex;align-items:center;gap:18px;box-shadow:0 8px 32px 0 rgba(0,0,0,0.25);">
            <span style="color:${T.accent};font-size:26px;line-height:1;flex-shrink:0;">✔</span>
            <p style="font-size:20px;color:#e5e5e5;font-weight:300;margin:0;line-height:1.6;">${b}</p>
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:40px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:900;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || "Conclusion"}</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;width:100%;">
              ${cards}
            </div>
          </div>
        `;
      }
      else if (layout === "bullets") {
        const items = slide.bullets || [];
        const listItems = items.map((b, idx) => `
          <div style="padding:24px;border-radius:18px;border:1px solid ${border};background:${cardBg};display:flex;align-items:start;gap:20px;box-shadow:0 8px 32px 0 rgba(0,0,0,0.25);">
            <span style="width:34px;height:34px;border-radius:50%;border:1px solid ${border};color:${T.accent};font-family:monospace;font-size:14px;font-weight:900;display:flex;align-items:center;justify-content:center;background:${hexToRgba(T.primary, 0.12)};flex-shrink:0;margin-top:2px;">
              0${idx + 1}
            </span>
            <p style="font-size:21px;color:${T.text};font-weight:300;line-height:1.6;margin:0;">${b}</p>
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
      else if (layout === "steps") {
        const items = slide.steps || [];
        const stepCards = items.map((step, idx) => `
          <div style="flex:1;padding:32px 28px;border-radius:20px;border:1px solid ${border};background:${cardBg};display:flex;flex-direction:column;gap:20px;position:relative;box-shadow:0 10px 40px 0 rgba(0,0,0,0.25);">
            <div style="width:44px;height:44px;border-radius:50%;color:${T.accent};background:${hexToRgba(T.primary, 0.15)};font-size:20px;font-weight:950;font-family:monospace;display:flex;align-items:center;justify-content:center;border:1px solid ${border};">
              ${idx + 1}
            </div>
            <p style="font-size:19px;color:${T.text};font-weight:300;line-height:1.6;margin:0;">${step}</p>
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:40px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:flex;gap:24px;width:100%;">
              ${stepCards}
            </div>
          </div>
        `;
      }
      else if (layout === "paragraph") {
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:32px;max-width:1200px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="padding:44px;border-radius:24px;border:1px solid ${border};background:${cardBg};box-shadow:0 12px 48px 0 rgba(0,0,0,0.35);">
              <p style="font-size:24px;color:${T.text};font-weight:300;line-height:1.8;margin:0;white-space:pre-wrap;">${slide.content || ""}</p>
            </div>
          </div>
        `;
      }
      else if (layout === "quote") {
        body = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;gap:36px;max-width:1100px;margin:0 auto;position:relative;z-index:2;">
            <span style="font-size:100px;line-height:0.1;color:${T.primary};opacity:0.4;font-family:Georgia, serif;font-weight:bold;">“</span>
            <blockquote style="font-size:36px;color:${T.text};font-weight:400;font-style:italic;line-height:1.6;margin:0;">
              "${slide.quote_text || ""}"
            </blockquote>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;">${slide.author || ""}</span>
              ${slide.role ? `<span style="font-size:14px;font-family:monospace;letter-spacing:3px;text-transform:uppercase;color:${T.primary};">${slide.role}</span>` : ""}
            </div>
          </div>
        `;
      }
      else if (layout === "two_column_text") {
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;width:100%;">
              <div style="padding:32px;border-radius:20px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.005);box-shadow:0 8px 32px 0 rgba(0,0,0,0.15);">
                <p style="font-size:19px;color:#d4d4d4;font-weight:300;line-height:1.75;margin:0;white-space:pre-wrap;">${slide.left_text || ""}</p>
              </div>
              <div style="padding:32px;border-radius:20px;border:1px solid ${border};background:${cardBg};box-shadow:0 8px 32px 0 rgba(0,0,0,0.25);">
                <p style="font-size:19px;color:${T.text};font-weight:300;line-height:1.75;margin:0;white-space:pre-wrap;">${slide.right_text || ""}</p>
              </div>
            </div>
          </div>
        `;
      }
      else if (layout === "comparison") {
        const L = slide.columns?.left || [];
        const R = slide.columns?.right || [];
        const lHeader = L[0] || "Left Column";
        const rHeader = R[0] || "Right Column";
        const lItems = L.slice(1).map(item => `
          <li style="font-size:18px;color:#d4d4d4;font-weight:300;padding:8px 0;list-style:none;display:flex;align-items:start;gap:10px;">
            <span style="color:${T.primary};flex-shrink:0;">▸</span>
            <span>${item}</span>
          </li>
        `).join("");
        const rItems = R.slice(1).map(item => `
          <li style="font-size:18px;color:#d4d4d4;font-weight:300;padding:8px 0;list-style:none;display:flex;align-items:start;gap:10px;">
            <span style="color:${T.accent};flex-shrink:0;">▸</span>
            <span>${item}</span>
          </li>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;width:100%;">
              <div style="padding:32px;border-radius:20px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.005);box-shadow:0 8px 32px 0 rgba(0,0,0,0.15);">
                <span style="font-family:monospace;font-size:14px;color:#888888;text-transform:uppercase;letter-spacing:2px;display:block;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:14px;margin-bottom:20px;">${lHeader}</span>
                <ul style="padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">${lItems}</ul>
              </div>
              <div style="padding:32px;border-radius:20px;border:1px solid ${border};background:${cardBg};box-shadow:0 8px 32px 0 rgba(0,0,0,0.25);">
                <span style="font-family:monospace;font-size:14px;color:${T.accent};text-transform:uppercase;letter-spacing:2px;display:block;border-bottom:1px solid ${border};padding-bottom:14px;margin-bottom:20px;">${rHeader}</span>
                <ul style="padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">${rItems}</ul>
              </div>
            </div>
          </div>
        `;
      }
      else if (layout === "pros_cons") {
        const pItems = (slide.pros || []).map(p => `
          <li style="font-size:18px;color:#e2fcf0;font-weight:300;padding:8px 0;list-style:none;display:flex;align-items:start;gap:10px;">
            <span style="color:#10b981;font-weight:900;flex-shrink:0;">✓</span>
            <span>${p}</span>
          </li>
        `).join("");
        const cItems = (slide.cons || []).map(c => `
          <li style="font-size:18px;color:#fee2e2;font-weight:300;padding:8px 0;list-style:none;display:flex;align-items:start;gap:10px;">
            <span style="color:#ef4444;font-weight:900;flex-shrink:0;">✗</span>
            <span>${c}</span>
          </li>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;width:100%;">
              <div style="padding:32px;border-radius:20px;border:1px solid rgba(16,185,129,0.15);background:rgba(16,185,129,0.02);box-shadow:0 8px 32px 0 rgba(0,0,0,0.15);">
                <span style="font-family:monospace;font-size:15px;color:#10b981;font-weight:800;text-transform:uppercase;letter-spacing:2px;display:block;border-bottom:1px solid rgba(16,185,129,0.1);padding-bottom:14px;margin-bottom:20px;">✓ Advantages</span>
                <ul style="padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">${pItems}</ul>
              </div>
              <div style="padding:32px;border-radius:20px;border:1px solid rgba(239,68,68,0.15);background:rgba(239,68,68,0.02);box-shadow:0 8px 32px 0 rgba(0,0,0,0.25);">
                <span style="font-family:monospace;font-size:15px;color:#ef4444;font-weight:800;text-transform:uppercase;letter-spacing:2px;display:block;border-bottom:1px solid rgba(239,68,68,0.1);padding-bottom:14px;margin-bottom:20px;">✗ Limitations</span>
                <ul style="padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">${cItems}</ul>
              </div>
            </div>
          </div>
        `;
      }
      else if (["metric", "metric_callout"].includes(layout)) {
        const metrics = slide.metrics || [];
        if (metrics.length >= 2) {
          const count = Math.min(metrics.length, 3);
          const metricCards = metrics.slice(0, count).map(m => `
            <div style="flex:1;padding:48px 28px;border-radius:24px;border:1px solid ${border};background:${cardBg};text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;box-shadow:0 10px 40px 0 rgba(0,0,0,0.25);">
              <span style="font-size:${count === 3 ? "56px" : "72px"};font-weight:900;background:linear-gradient(to right, ${T.primary}, ${T.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-1.5px;">${m.value}</span>
              <span style="font-size:14px;font-weight:700;color:${T.primary};text-transform:uppercase;letter-spacing:2px;font-family:monospace;">${m.label}</span>
            </div>
          `).join("");
          body = `
            <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:40px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
              <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
              <div style="display:flex;gap:24px;width:100%;">${metricCards}</div>
            </div>
          `;
        } else {
          const m = metrics[0] || slide.metric || { value: "0", label: "Metric", description: "" };
          body = `
            <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:40px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
              <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
              <div style="display:grid;grid-template-columns:5fr 7fr;gap:44px;align-items:center;width:100%;">
                <div style="padding:54px 40px;border-radius:24px;border:1px solid ${border};background:${cardBg};text-align:center;box-shadow:0 12px 48px 0 rgba(0,0,0,0.3);display:flex;flex-direction:column;gap:14px;">
                  <span style="font-size:80px;font-weight:900;background:linear-gradient(to right, ${T.primary}, ${T.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;letter-spacing:-2.5px;">${m.value}</span>
                  <span style="font-size:15px;font-weight:800;color:${T.primary};text-transform:uppercase;letter-spacing:2px;font-family:monospace;">${m.label}</span>
                </div>
                <p style="font-size:24px;color:${T.text};font-weight:300;line-height:1.75;margin:0;white-space:pre-wrap;">${m.description || slide.content || ""}</p>
              </div>
            </div>
          `;
        }
      }
      else if (layout === "matrix_2x2") {
        const quads = (slide.quadrants || ["", "", "", ""]).slice(0, 4);
        const quadColors = [T.primary, T.accent, T.accent, T.primary];
        const quadItems = quads.map((qtext, idx) => `
          <div style="padding:32px;border-radius:20px;border:1px solid ${hexToRgba(quadColors[idx], 0.25)};background:${hexToRgba(quadColors[idx], 0.06)};display:flex;flex-direction:column;justify-content:center;box-shadow:0 8px 32px 0 rgba(0,0,0,0.25);">
            <p style="font-size:19px;color:${T.text};font-weight:300;line-height:1.65;margin:0;">${qtext}</p>
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:24px;aspect-ratio:2.4/1;width:100%;">
              ${quadItems}
            </div>
          </div>
        `;
      }
      else if (layout === "timeline") {
        const events = (slide.events || []).slice(0, 5);
        const eventCards = events.map((ev, idx) => `
          <div style="flex:1;padding:28px 24px;border-radius:18px;border:1px solid ${border};background:#000000;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 8px 32px 0 rgba(0,0,0,0.3);position:relative;z-index:2;min-height:220px;">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
              <span style="font-family:monospace;font-size:18px;font-weight:900;color:${T.primary};letter-spacing:1px;">${ev.year}</span>
              <div style="flex:1;height:1px;background:rgba(255,255,255,0.15);"></div>
            </div>
            <p style="font-size:17px;color:#d4d4d4;font-weight:300;line-height:1.6;margin:0;flex-grow:1;">${ev.description}</p>
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:40px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:flex;gap:24px;position:relative;width:100%;">
              ${eventCards}
            </div>
          </div>
        `;
      }
      else if (layout === "roadmap") {
        const phases = (slide.phases || []).slice(0, 3);
        const phaseCards = phases.map((p, idx) => `
          <div style="flex:1;padding:36px 32px;border-radius:24px;border:1px solid ${border};background:#000000;display:flex;flex-direction:column;gap:20px;box-shadow:0 10px 40px 0 rgba(0,0,0,0.3);min-height:260px;">
            <span style="font-family:monospace;font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:3px;color:${T.primary};border-bottom:1px solid ${border};padding-bottom:12px;display:block;">${p.phase}</span>
            <p style="font-size:18px;color:#d4d4d4;font-weight:300;line-height:1.65;margin:0;flex-grow:1;">${p.goal}</p>
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:${T.primary};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:flex;gap:28px;width:100%;">
              ${phaseCards}
            </div>
          </div>
        `;
      }
      else if (layout === "image_left") {
        const imgEl = slide.image_url 
          ? `<img src="${slide.image_url}" alt="${slide.alt_text || "Slide Image"}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;" />`
          : `<span style="font-size:56px;opacity:0.2;color:#ffffff;">📷</span>`;
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;width:100%;">
              <div style="height:500px;border-radius:24px;border:1px solid ${border};background:#121212;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 48px 0 rgba(0,0,0,0.35);">
                ${imgEl}
              </div>
              <div style="display:flex;flex-direction:column;gap:24px;">
                <h2 style="font-size:44px;font-weight:850;color:${T.primary};margin:0;">${slide.title || ""}</h2>
                <p style="font-size:20px;color:${T.text};font-weight:300;line-height:1.8;margin:0;white-space:pre-wrap;">${slide.content || ""}</p>
              </div>
            </div>
          </div>
        `;
      }
      else if (layout === "image_right") {
        const imgEl = slide.image_url 
          ? `<img src="${slide.image_url}" alt="${slide.alt_text || "Slide Image"}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;" />`
          : `<span style="font-size:56px;opacity:0.2;color:#ffffff;">📷</span>`;
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;width:100%;">
              <div style="display:flex;flex-direction:column;gap:24px;">
                <h2 style="font-size:44px;font-weight:850;color:${T.primary};margin:0;">${slide.title || ""}</h2>
                <p style="font-size:20px;color:${T.text};font-weight:300;line-height:1.8;margin:0;white-space:pre-wrap;">${slide.content || ""}</p>
              </div>
              <div style="height:500px;border-radius:24px;border:1px solid ${border};background:#121212;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 48px 0 rgba(0,0,0,0.35);">
                ${imgEl}
              </div>
            </div>
          </div>
        `;
      }
      else if (layout === "gallery_grid") {
        const imgs = (slide.images || []).slice(0, 4);
        const gridCards = imgs.map((img, idx) => `
          <div style="flex:1;height:260px;border-radius:20px;border:1px solid ${border};background:#121212;overflow:hidden;box-shadow:0 10px 36px 0 rgba(0,0,0,0.25);">
            <img src="${img}" alt="Gallery ${idx + 1}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;" />
          </div>
        `).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:36px;max-width:1400px;margin:0 auto;position:relative;z-index:2;width:100%;">
            <h2 style="font-size:48px;font-weight:800;color:#ffffff;margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${slide.title || ""}</h2>
            <div style="display:flex;gap:24px;width:100%;">
              ${gridCards}
            </div>
          </div>
        `;
      }
      else {
        // Generic fallback
        const normalized = normalizeSlide(slide);
        const lItems = (normalized.bullets || []).map(b => `<li style="font-size:21px;color:${T.text};padding:7px 0 7px 28px;position:relative;font-weight:300;"><span style="position:absolute;left:0;color:${T.primary};">●</span>${b}</li>`).join("");
        body = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:24px;">
            <h2 style="font-size:44px;font-weight:800;color:${T.accent};margin:0;border-left:6px solid ${T.primary};padding-left:20px;">${normalized.title}</h2>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px;">${lItems}</ul>
          </div>`;
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
