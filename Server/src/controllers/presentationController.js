const mongoose = require("mongoose");
const Presentation = require("../models/Presentation");
const User = require("../models/User");
const Folder = require("../models/Folder");
const GeminiClient = require("../utils/geminiClient");
const pptxgen = require("pptxgenjs");
const html_to_pdf = require("html-pdf-node");
const crypto = require("crypto");

const gemini = new GeminiClient();

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
    const { title, outline, theme = "orange-gradient", textDensity = "minimal", visuals = false, language = "English", model = "flash", prompt = "" } = req.body;
    const userId = req.user._id;

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

For each slide title in the outline, choose a layout and supply the text contents and speaker notes.
Layout Options:
1. "title": Used for the first introductory slide. MUST contain "subtitle".
2. "bullets": Used for explaining concepts. MUST contain a "bullets" array of 3-5 strings (density: ${textDensity}).
3. "comparison": Used for comparing two things. MUST contain a "columns" object with "left" and "right" arrays. The first item in each array should be the column header (e.g. "Legacy Systems", "Modern AI").
4. "metric": Used for presenting a statistic or KPI. MUST contain a "metric" object with "value", "label", and "description".

For each slide, you must also provide "speakerNotes" (a paragraph of text representing the presenter script).

Generate the output in a strict JSON format matching this array structure:
[
  {
    "id": 1,
    "title": "Title of Slide",
    "subtitle": "Subtitle of Slide (only if layout is 'title')",
    "layout": "title",
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 2,
    "title": "Concept Bullets",
    "layout": "bullets",
    "bullets": ["Bullet point 1", "Bullet point 2"],
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 3,
    "title": "Comparison Slide",
    "layout": "comparison",
    "columns": {
      "left": ["Legacy", "Slow", "Static"],
      "right": ["Modern", "Sub-millisecond", "Dynamic"]
    },
    "speakerNotes": "Presenter notes..."
  },
  {
    "id": 4,
    "title": "Key Metric",
    "layout": "metric",
    "metric": {
      "value": "99.4%",
      "label": "Accuracy Rate",
      "description": "Cross-validated over 1.2M training sets"
    },
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
      theme: theme,
      slides: slidesData.map((slide, idx) => ({
        id: idx + 1,
        title: slide.title || "Slide Title",
        subtitle: slide.subtitle || "",
        layout: slide.layout || "bullets",
        bullets: slide.bullets || [],
        columns: slide.columns || { left: [], right: [] },
        metric: slide.metric || { value: "", label: "", description: "" },
        speakerNotes: slide.speakerNotes || ""
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

    presentation.slides.forEach(slide => {
      const slideObj = pptx.addSlide();
      
      // Standard PowerPoint orange color background
      slideObj.background = { fill: "fcfbfa" };

      if (slide.layout === "title") {
        slideObj.addText(slide.title, {
          x: 1, y: 2, w: 8, h: 1.5,
          fontSize: 40, align: "center",
          color: "d83b01", bold: true,
          fontFace: "Segoe UI"
        });
        if (slide.subtitle) {
          slideObj.addText(slide.subtitle, {
            x: 1, y: 3.8, w: 8, h: 1,
            fontSize: 18, align: "center",
            color: "555555",
            fontFace: "Segoe UI"
          });
        }
      } else if (slide.layout === "bullets") {
        slideObj.addText(slide.title, {
          x: 0.5, y: 0.5, w: 9, h: 0.8,
          fontSize: 24, color: "d83b01", bold: true,
          fontFace: "Segoe UI"
        });
        const bulletItems = slide.bullets.map(b => ({
          text: b,
          options: { bullet: true, color: "333333", fontSize: 16 }
        }));
        slideObj.addText(bulletItems, {
          x: 0.5, y: 1.5, w: 9, h: 4.5,
          fontFace: "Segoe UI"
        });
      } else if (slide.layout === "comparison") {
        slideObj.addText(slide.title, {
          x: 0.5, y: 0.5, w: 9, h: 0.8,
          fontSize: 24, color: "d83b01", bold: true,
          fontFace: "Segoe UI"
        });

        // Left column
        const leftCol = slide.columns?.left || [];
        const leftItems = leftCol.map((item, idx) => ({
          text: item,
          options: {
            bullet: idx > 0,
            fontSize: idx === 0 ? 18 : 14,
            bold: idx === 0,
            color: idx === 0 ? "d83b01" : "333333"
          }
        }));
        slideObj.addText(leftItems, {
          x: 0.5, y: 1.5, w: 4.25, h: 4.5,
          fontFace: "Segoe UI"
        });

        // Right column
        const rightCol = slide.columns?.right || [];
        const rightItems = rightCol.map((item, idx) => ({
          text: item,
          options: {
            bullet: idx > 0,
            fontSize: idx === 0 ? 18 : 14,
            bold: idx === 0,
            color: idx === 0 ? "d83b01" : "333333"
          }
        }));
        slideObj.addText(rightItems, {
          x: 5.25, y: 1.5, w: 4.25, h: 4.5,
          fontFace: "Segoe UI"
        });
      } else if (slide.layout === "metric") {
        slideObj.addText(slide.title, {
          x: 0.5, y: 0.5, w: 9, h: 0.8,
          fontSize: 24, color: "d83b01", bold: true,
          fontFace: "Segoe UI"
        });
        slideObj.addText(slide.metric?.value || "0%", {
          x: 0.5, y: 2, w: 4, h: 1.8,
          fontSize: 64, bold: true, color: "d83b01", align: "center",
          fontFace: "Segoe UI"
        });
        slideObj.addText(slide.metric?.label || "Metric Label", {
          x: 0.5, y: 4, w: 4, h: 0.8,
          fontSize: 16, bold: true, color: "555555", align: "center",
          fontFace: "Segoe UI"
        });
        slideObj.addText(slide.metric?.description || "", {
          x: 5, y: 2, w: 4.5, h: 3,
          fontSize: 16, color: "333333",
          fontFace: "Segoe UI"
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
    
    // Construct PDF HTML
    let slidesHTML = "";
    presentation.slides.forEach((slide, idx) => {
      let layoutHTML = "";
      if (slide.layout === "title") {
        layoutHTML = `
          <div class="title-layout">
            <h1>${slide.title}</h1>
            <div class="divider"></div>
            <p class="subtitle">${slide.subtitle || ""}</p>
          </div>
        `;
      } else if (slide.layout === "bullets") {
        const bulletsList = (slide.bullets || []).map(b => `<li>${b}</li>`).join("");
        layoutHTML = `
          <div class="bullets-layout">
            <h2>${slide.title}</h2>
            <ul>${bulletsList}</ul>
          </div>
        `;
      } else if (slide.layout === "comparison") {
        const leftList = (slide.columns?.left || []).slice(1).map(b => `<li>${b}</li>`).join("");
        const rightList = (slide.columns?.right || []).slice(1).map(b => `<li>${b}</li>`).join("");
        layoutHTML = `
          <div class="comparison-layout">
            <h2>${slide.title}</h2>
            <div class="comparison-cols">
              <div class="col-box">
                <div class="col-header">${slide.columns?.left?.[0] || "Left Column"}</div>
                <ul class="col-list">${leftList}</ul>
              </div>
              <div class="col-box right">
                <div class="col-header">${slide.columns?.right?.[0] || "Right Column"}</div>
                <ul class="col-list">${rightList}</ul>
              </div>
            </div>
          </div>
        `;
      } else if (slide.layout === "metric") {
        layoutHTML = `
          <div class="metric-layout">
            <h2>${slide.title}</h2>
            <div class="metric-cols">
              <div class="metric-badge">
                <div class="metric-value">${slide.metric?.value || "0%"}</div>
                <div class="metric-label">${slide.metric?.label || "Metric"}</div>
              </div>
              <div class="metric-desc">
                <p>${slide.metric?.description || ""}</p>
              </div>
            </div>
          </div>
        `;
      }

      // Add watermark overlay if free tier
      const watermarkHTML = !isSubscribed ? `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 140px; font-weight: 900; color: rgba(255, 255, 255, 0.02); font-family: sans-serif; letter-spacing: 12px; pointer-events: none; z-index: 0; white-space: nowrap;">PAPERXIFY FREE</div>
        <div style="position: absolute; bottom: 30px; right: 40px; font-size: 14px; color: rgba(255, 255, 255, 0.15); font-family: monospace; z-index: 100;">Created with Paperxify Free Plan</div>
      ` : "";

      slidesHTML += `
        <div class="slide">
          <div class="header">
            <span>${presentation.title}</span>
            <span class="layout-type">${slide.layout} layout</span>
          </div>
          <div class="content-area">
            ${layoutHTML}
          </div>
          ${watermarkHTML}
          <div class="footer">
            <span>Paperxify AI Presentations</span>
            <span>Slide ${idx + 1} of ${presentation.slides.length}</span>
          </div>
        </div>
      `;
    });

    const completeHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
          @page {
            size: 1920px 1080px;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #000;
            color: #fff;
            font-family: 'Outfit', sans-serif;
            -webkit-print-color-adjust: exact;
          }
          .slide {
            width: 1920px;
            height: 1080px;
            box-sizing: border-box;
            padding: 60px 100px;
            position: relative;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: radial-gradient(circle at 80% 20%, rgba(216, 59, 1, 0.1) 0%, rgba(0, 0, 0, 0) 60%),
                        radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.05) 0%, rgba(0, 0, 0, 0) 50%),
                        #070707;
            overflow: hidden;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: monospace;
            font-size: 18px;
            color: #666;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            padding-bottom: 15px;
          }
          .header .layout-type {
            color: rgba(216, 59, 1, 0.5);
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 0;
          }
          .title-layout {
            text-align: center;
            max-width: 1400px;
            margin: 0 auto;
          }
          .title-layout h1 {
            font-size: 72px;
            font-weight: 900;
            line-height: 1.15;
            margin: 0 0 30px 0;
            background: linear-gradient(to bottom, #fff 40%, #fbbf24 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .title-layout .subtitle {
            font-size: 30px;
            color: #a3a3a3;
            font-weight: 300;
            letter-spacing: 1px;
          }
          .title-layout .divider {
            height: 4px;
            width: 140px;
            background-color: #d83b01;
            margin: 0 auto 30px auto;
          }
          .bullets-layout h2 {
            font-size: 48px;
            font-weight: 800;
            color: #fbbf24;
            margin: 0 0 30px 0;
            border-left: 6px solid #d83b01;
            padding-left: 24px;
          }
          .bullets-layout ul {
            margin: 0;
            padding-left: 40px;
            font-size: 32px;
            line-height: 1.6;
            color: #d4d4d4;
            font-weight: 300;
          }
          .bullets-layout li {
            margin-bottom: 15px;
          }
          .comparison-layout h2 {
            font-size: 48px;
            font-weight: 800;
            color: #fbbf24;
            margin: 0 0 30px 0;
          }
          .comparison-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .col-box {
            background: rgba(255, 255, 255, 0.01);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 20px;
            padding: 30px;
          }
          .col-box.right {
            border-color: rgba(216, 59, 1, 0.15);
          }
          .col-header {
            font-family: monospace;
            font-size: 24px;
            color: #888;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .col-box.right .col-header {
            color: #fbbf24;
            border-color: rgba(216, 59, 1, 0.1);
          }
          .col-list {
            margin: 0;
            padding-left: 24px;
            font-size: 22px;
            line-height: 1.6;
            color: #c7c7c7;
            font-weight: 300;
          }
          .col-list li {
            margin-bottom: 10px;
          }
          .metric-layout h2 {
            font-size: 48px;
            font-weight: 800;
            color: #fbbf24;
            margin: 0 0 30px 0;
          }
          .metric-cols {
            display: grid;
            grid-template-columns: 5fr 7fr;
            gap: 40px;
            align-items: center;
          }
          .metric-badge {
            background: rgba(216, 59, 1, 0.05);
            border: 1px solid rgba(216, 59, 1, 0.15);
            border-radius: 24px;
            padding: 40px 30px;
            text-align: center;
          }
          .metric-value {
            font-size: 90px;
            font-weight: 900;
            line-height: 1;
            background: linear-gradient(to bottom, #fbbf24, #d83b01);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .metric-label {
            font-size: 20px;
            font-weight: 700;
            color: #d83b01;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 15px;
          }
          .metric-desc {
            font-size: 26px;
            line-height: 1.6;
            color: #d4d4d4;
            font-weight: 300;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: monospace;
            font-size: 18px;
            color: #666;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        ${slidesHTML}
      </body>
      </html>
    `;

    const options = {
      width: "1920px",
      height: "1080px",
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 30000,
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
