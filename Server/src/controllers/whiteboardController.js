const Whiteboard = require("../models/Whiteboard");
const User = require("../models/User");
const { awardXP } = require("../utils/xpHelper");
const crypto = require("crypto");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// OpenRouter model routing matrix matching notesEngineService.js
const WHITEBOARD_OPENROUTER_MODELS = [
  "deepseek/deepseek-v4-flash",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "openai/gpt-4o-mini",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.3-70b-instruct",
  "openrouter/free"
];

/**
 * Execute OpenRouter chat completion with model fallback list matching notesEngineService.js
 */
async function callOpenRouterWithFallback(models, messages, options = {}) {
  const { temperature = 0.2, max_tokens = 2500, timeout = 20000, response_format } = options;
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`🤖 OpenRouter calling model: ${model}`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const body = {
        model,
        messages,
        temperature,
        max_tokens,
      };
      // response_format json_object is supported by deepseek, gpt-4o-mini, etc.
      if (response_format) body.response_format = response_format;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://paperxify.com",
          "X-Title": "Paperxify Whiteboard Engine"
        },
        body: JSON.stringify(body)
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(errJson)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from model");

      console.log(`✅ Success with OpenRouter model: ${model} (${data.usage?.total_tokens || "N/A"} tokens)`);
      return content;
    } catch (err) {
      console.warn(`❌ Model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`);
}

/**
 * Generate a unique slug for a whiteboard
 */
function generateSlug(title = "board") {
  const cleanTitle = (title || "board")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 24);
  const randomPart = crypto.randomBytes(4).toString("hex");
  return `${cleanTitle}-${randomPart}`;
}

/**
 * Helper to convert structured diagram nodes & edges into valid, beautiful Excalidraw elements.
 * Features:
 *  - Intelligent 2D Tier-Based Auto-Layout (zero horizontal cramping)
 *  - Collision-Free Bidirectional Arrow Routing (separate tracks for A->B and B->A)
 *  - Rich Library Component Stencils (Database cylinders, Queue pipes, Cache blocks, Cloud VPCs, Gateways)
 *  - Perfectly positioned, non-overlapping edge labels
 */
function convertToExcalidrawElements(diagramData, startX = 100, startY = 100, isDark = true) {
  const elements = [];
  const nodeMap = new Map();

  // ─── Color Palette (Production Grade) ────────────────────────────
  const colors = {
    standard:    { bg: isDark ? "#1e1b4b" : "#ede9fe", stroke: isDark ? "#818cf8" : "#4f46e5" },
    database:    { bg: isDark ? "#172554" : "#dbeafe", stroke: isDark ? "#60a5fa" : "#2563eb", cap: isDark ? "#1e3a8a" : "#93c5fd" },
    cache:       { bg: isDark ? "#450a0a" : "#ffe4e6", stroke: isDark ? "#f43f5e" : "#e11d48", cap: isDark ? "#881337" : "#fecdd3" },
    queue:       { bg: isDark ? "#064e3b" : "#d1fae5", stroke: isDark ? "#34d399" : "#059669", cap: isDark ? "#065f46" : "#a7f3d0" },
    gateway:     { bg: isDark ? "#3b0764" : "#f3e8ff", stroke: isDark ? "#c084fc" : "#9333ea", cap: isDark ? "#581c87" : "#e9d5ff" },
    cloud:       { bg: isDark ? "#082f49" : "#e0f2fe", stroke: isDark ? "#38bdf8" : "#0284c7", cap: isDark ? "#0c4a6e" : "#bae6fd" },
    client:      { bg: isDark ? "#1e293b" : "#f1f5f9", stroke: isDark ? "#94a3b8" : "#475569", cap: isDark ? "#334155" : "#e2e8f0" },
    service:     { bg: isDark ? "#2e1065" : "#ede9fe", stroke: isDark ? "#a855f7" : "#7c3aed", cap: isDark ? "#3b0764" : "#ddd6fe" },
    start:       { bg: isDark ? "#052e16" : "#dcfce7", stroke: isDark ? "#22c55e" : "#16a34a" },
    end:         { bg: isDark ? "#052e16" : "#dcfce7", stroke: isDark ? "#22c55e" : "#16a34a" },
    success:     { bg: isDark ? "#052e16" : "#dcfce7", stroke: isDark ? "#22c55e" : "#16a34a" },
    decision:    { bg: isDark ? "#2d1a00" : "#fff7ed", stroke: isDark ? "#fb923c" : "#ea580c" },
    alert:       { bg: isDark ? "#2d0a0a" : "#fef2f2", stroke: isDark ? "#f87171" : "#dc2626" },
    text:        isDark ? "#ffffff" : "#0f172a",
    arrowStroke: isDark ? "#94a3b8" : "#64748b",
    edgeLabelText: isDark ? "#e2e8f0" : "#1e293b",
  };

  function detectComponentType(node) {
    const raw = `${node.component || ""} ${node.type || ""} ${node.label || ""} ${node.title || ""}`.toLowerCase();
    if (raw.includes("postgres") || raw.includes("mongo") || raw.includes("database") || raw.includes("mysql") || raw.includes("dynamo") || raw.includes(" db") || raw.includes("storage") || raw.includes("s3") || raw.includes("sql") || raw.includes("oracle")) {
      return "database";
    }
    if (raw.includes("cache") || raw.includes("redis") || raw.includes("memcached") || raw.includes("cdn") || raw.includes("in-memory")) {
      return "cache";
    }
    if (raw.includes("kafka") || raw.includes("queue") || raw.includes("event") || raw.includes("rabbitmq") || raw.includes("sqs") || raw.includes("pubsub") || raw.includes("stream")) {
      return "queue";
    }
    if (raw.includes("gateway") || raw.includes("load balancer") || raw.includes("balancer") || raw.includes("nginx") || raw.includes("ingress") || raw.includes("proxy") || raw.includes("router")) {
      return "gateway";
    }
    if (raw.includes("cloud") || raw.includes("vpc") || raw.includes("aws") || raw.includes("azure") || raw.includes("gcp") || raw.includes("subnet") || raw.includes("cluster")) {
      return "cloud";
    }
    if (raw.includes("mobile") || raw.includes("app") || raw.includes("client") || raw.includes("browser") || raw.includes("user") || raw.includes("frontend") || raw.includes("react") || raw.includes("next.js") || raw.includes("ui")) {
      return "client";
    }
    if (raw.includes("decision") || raw.includes("check") || raw.includes("condition") || raw.includes("if") || raw.includes("validate")) {
      return "decision";
    }
    if (raw.includes("service") || raw.includes("microservice") || raw.includes("auth") || raw.includes("api") || raw.includes("server") || raw.includes("worker") || raw.includes("backend") || raw.includes("payment")) {
      return "service";
    }
    return "standard";
  }

  function getTierLevel(compType) {
    switch (compType) {
      case "client": return 0;
      case "gateway": return 1;
      case "service": case "decision": case "standard": return 2;
      case "database": case "cache": case "queue": case "cloud": return 3;
      default: return 2;
    }
  }

  function makeSeed() { return Math.floor(Math.random() * 2_000_000_000); }
  const ts = Date.now();

  const rawNodes = Array.isArray(diagramData.nodes) ? diagramData.nodes : [];
  const rawEdges = Array.isArray(diagramData.edges) ? diagramData.edges : [];

  // ─── 1. Topological Tiered 2D Auto-Layout ───────────────────────────
  // Inspect if the LLM provided valid distinct 2D coordinates or if nodes are flat 1D.
  const yValues = rawNodes.map(n => (typeof n.y === "number" ? n.y : 0));
  const isFlatLayout = yValues.length > 2 && (Math.max(...yValues) - Math.min(...yValues) < 50);

  // Categorize nodes into 4 tiers
  const tierGroups = { 0: [], 1: [], 2: [], 3: [] };
  rawNodes.forEach((node, idx) => {
    const compType = detectComponentType(node);
    const tier = getTierLevel(compType);
    tierGroups[tier].push({ ...node, _origIdx: idx, _compType: compType });
  });

  const nodeSpacingX = 270;
  const nodeSpacingY = 190;
  const maxNodesInTier = Math.max(1, ...Object.values(tierGroups).map(g => g.length));
  const totalTierWidth = Math.max(maxNodesInTier * nodeSpacingX, 600);

  // Position map (node rawId -> computed coordinates)
  const computedLayout = new Map();

  [0, 1, 2, 3].forEach((tierIdx) => {
    const group = tierGroups[tierIdx];
    if (group.length === 0) return;

    const tierWidth = group.length * nodeSpacingX;
    const tierStartX = startX + (totalTierWidth - tierWidth) / 2;
    const tierY = startY + tierIdx * nodeSpacingY;

    group.forEach((node, i) => {
      const rawId = String(node.id ?? (node._origIdx + 1));
      let x, y;

      if (!isFlatLayout && typeof node.x === "number" && typeof node.y === "number" && node.x > 0 && node.y > 0) {
        x = node.x + startX;
        y = node.y + startY;
      } else {
        x = tierStartX + i * nodeSpacingX;
        y = tierY;
      }

      const w = node._compType === "database" ? 210 : 200;
      const h = node._compType === "database" ? 95 : 80;

      computedLayout.set(rawId, {
        ...node,
        rawId,
        x,
        y,
        w,
        h,
        compType: node._compType,
      });
    });
  });

  // ─── 2. Render Node Elements (with Library Stencils) ───────────────
  computedLayout.forEach((node) => {
    const { rawId, x, y, w, h, compType } = node;
    const label = String(node.label || node.title || "Component");
    const shapeId = `wb_shape_${rawId}_${ts}`;
    const textId  = `wb_text_${rawId}_${ts}`;
    const compColors = colors[compType] || colors.standard;

    // ── Stencil A: Database Cylinder ──
    if (compType === "database") {
      const capHeight = 22;
      const bodyHeight = h - capHeight / 2;

      const cylinderBody = {
        id:              shapeId,
        type:            "rectangle",
        x,
        y:               y + capHeight / 2,
        width:           w,
        height:          bodyHeight,
        angle:           0,
        strokeColor:     compColors.stroke,
        backgroundColor: compColors.bg,
        fillStyle:       "solid",
        strokeWidth:     2,
        strokeStyle:     "solid",
        roughness:       1,
        opacity:         100,
        groupIds:        [`group_${rawId}_${ts}`],
        frameId:         null,
        roundness:       { type: 3, value: 16 },
        seed:            makeSeed(),
        version:         1,
        versionNonce:    makeSeed(),
        isDeleted:       false,
        boundElements:   [{ id: textId, type: "text" }],
        updated:         ts,
        link:            null,
        locked:          false,
      };

      const topCap = {
        id:              `wb_cap_${rawId}_${ts}`,
        type:            "ellipse",
        x,
        y,
        width:           w,
        height:          capHeight,
        angle:           0,
        strokeColor:     compColors.stroke,
        backgroundColor: compColors.cap || compColors.bg,
        fillStyle:       "solid",
        strokeWidth:     2,
        strokeStyle:     "solid",
        roughness:       1,
        opacity:         100,
        groupIds:        [`group_${rawId}_${ts}`],
        frameId:         null,
        roundness:       null,
        seed:            makeSeed(),
        version:         1,
        versionNonce:    makeSeed(),
        isDeleted:       false,
        boundElements:   [],
        updated:         ts,
        link:            null,
        locked:          false,
      };

      const textEl = {
        id:              textId,
        type:            "text",
        x,
        y:               y + capHeight / 2,
        width:           w,
        height:          bodyHeight,
        angle:           0,
        strokeColor:     colors.text,
        backgroundColor: "transparent",
        fillStyle:       "solid",
        strokeWidth:     1,
        strokeStyle:     "solid",
        roughness:       0,
        opacity:         100,
        groupIds:        [`group_${rawId}_${ts}`],
        frameId:         null,
        roundness:       null,
        seed:            makeSeed(),
        version:         1,
        versionNonce:    makeSeed(),
        isDeleted:       false,
        text:            label,
        fontSize:        label.length > 25 ? 12 : 14,
        fontFamily:      1,
        textAlign:       "center",
        verticalAlign:   "middle",
        baseline:        Math.round(bodyHeight * 0.65),
        containerId:     shapeId,
        originalText:    label,
        lineHeight:      1.25,
        autoResize:      true,
        updated:         ts,
        link:            null,
        locked:          false,
      };

      elements.push(cylinderBody, topCap, textEl);
      nodeMap.set(rawId, { shapeId, x, y, w, h, cx: x + w / 2, cy: y + h / 2 });
      return;
    }

    // ── Stencil B: Decision Diamond ──
    if (compType === "decision" || (node.shape && node.shape.toLowerCase() === "diamond")) {
      const diamondEl = {
        id:              shapeId,
        type:            "diamond",
        x,
        y,
        width:           w,
        height:          h,
        angle:           0,
        strokeColor:     colors.decision.stroke,
        backgroundColor: colors.decision.bg,
        fillStyle:       "solid",
        strokeWidth:     2,
        strokeStyle:     "solid",
        roughness:       1,
        opacity:         100,
        groupIds:        [],
        frameId:         null,
        roundness:       null,
        seed:            makeSeed(),
        version:         1,
        versionNonce:    makeSeed(),
        isDeleted:       false,
        boundElements:   [{ id: textId, type: "text" }],
        updated:         ts,
        link:            null,
        locked:          false,
      };

      const textEl = {
        id:              textId,
        type:            "text",
        x, y, width: w, height: h,
        angle:           0,
        strokeColor:     colors.text,
        backgroundColor: "transparent",
        fillStyle:       "solid",
        strokeWidth:     1,
        strokeStyle:     "solid",
        roughness:       0,
        opacity:         100,
        groupIds:        [],
        frameId:         null,
        roundness:       null,
        seed:            makeSeed(),
        version:         1,
        versionNonce:    makeSeed(),
        isDeleted:       false,
        text:            label,
        fontSize:        label.length > 25 ? 11 : 13,
        fontFamily:      1,
        textAlign:       "center",
        verticalAlign:   "middle",
        baseline:        Math.round(h * 0.65),
        containerId:     shapeId,
        originalText:    label,
        lineHeight:      1.25,
        autoResize:      true,
        updated:         ts,
        link:            null,
        locked:          false,
      };

      elements.push(diamondEl, textEl);
      nodeMap.set(rawId, { shapeId, x, y, w, h, cx: x + w / 2, cy: y + h / 2 });
      return;
    }

    // ── Stencil C: Standard / Service / Gateway / Queue / Cloud ──
    const isCloud = compType === "cloud";
    const isQueue = compType === "queue";
    const shapeEl = {
      id:              shapeId,
      type:            "rectangle",
      x,
      y,
      width:           w,
      height:          h,
      angle:           0,
      strokeColor:     compColors.stroke,
      backgroundColor: compColors.bg,
      fillStyle:       "solid",
      strokeWidth:     2,
      strokeStyle:     isCloud ? "dashed" : "solid",
      roughness:       1,
      opacity:         100,
      groupIds:        [],
      frameId:         null,
      roundness:       { type: 3, value: isQueue ? 24 : isCloud ? 20 : 12 },
      seed:            makeSeed(),
      version:         1,
      versionNonce:    makeSeed(),
      isDeleted:       false,
      boundElements:   [{ id: textId, type: "text" }],
      updated:         ts,
      link:            null,
      locked:          false,
    };

    const textEl = {
      id:              textId,
      type:            "text",
      x,
      y,
      width:           w,
      height:          h,
      angle:           0,
      strokeColor:     colors.text,
      backgroundColor: "transparent",
      fillStyle:       "solid",
      strokeWidth:     1,
      strokeStyle:     "solid",
      roughness:       0,
      opacity:         100,
      groupIds:        [],
      frameId:         null,
      roundness:       null,
      seed:            makeSeed(),
      version:         1,
      versionNonce:    makeSeed(),
      isDeleted:       false,
      text:            label,
      fontSize:        label.length > 30 ? 11 : label.length > 15 ? 13 : 15,
      fontFamily:      1,
      textAlign:       "center",
      verticalAlign:   "middle",
      baseline:        Math.round(h * 0.65),
      containerId:     shapeId,
      originalText:    label,
      lineHeight:      1.25,
      autoResize:      true,
      updated:         ts,
      link:            null,
      locked:          false,
    };

    elements.push(shapeEl, textEl);
    nodeMap.set(rawId, { shapeId, x, y, w, h, cx: x + w / 2, cy: y + h / 2 });
  });

  // ─── 3. Process Edges / Arrows with Collision-Free Routing ────────
  // Track pair counts to prevent overlapping bidirectional arrows
  const edgePairMap = new Map();

  rawEdges.forEach((edge, idx) => {
    const fromKey = String(edge.from ?? "");
    const toKey   = String(edge.to   ?? "");
    const from    = nodeMap.get(fromKey);
    const to      = nodeMap.get(toKey);

    if (!from || !to) {
      console.warn(`⚠️ Edge ${idx}: from="${fromKey}" or to="${toKey}" not found in nodeMap`);
      return;
    }

    // Bidirectional tracking key
    const pairKey = [fromKey, toKey].sort().join("<->");
    const existingCount = edgePairMap.get(pairKey) || 0;
    edgePairMap.set(pairKey, existingCount + 1);

    // If reverse edge exists, offset Y attachment to prevent overlapping lines
    const isReverse = fromKey > toKey;
    const offset = existingCount > 0 ? (isReverse ? 18 : -18) : 0;

    const dx = to.cx - from.cx;
    const dy = to.cy - from.cy;

    let startAbsX, startAbsY, endAbsX, endAbsY;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Mostly horizontal
      if (dx > 0) {
        startAbsX = from.x + from.w;   startAbsY = from.cy + offset;
        endAbsX   = to.x;              endAbsY   = to.cy + offset;
      } else {
        startAbsX = from.x;            startAbsY = from.cy + offset;
        endAbsX   = to.x + to.w;       endAbsY   = to.cy + offset;
      }
    } else {
      // Mostly vertical
      if (dy > 0) {
        startAbsX = from.cx + offset;  startAbsY = from.y + from.h;
        endAbsX   = to.cx + offset;    endAbsY   = to.y;
      } else {
        startAbsX = from.cx + offset;  startAbsY = from.y;
        endAbsX   = to.cx + offset;    endAbsY   = to.y + to.h;
      }
    }

    const arrowId = `wb_arrow_${idx}_${ts}`;

    // Add arrowId to shape's boundElements
    const fromShape = elements.find(e => e.id === from.shapeId);
    const toShape   = elements.find(e => e.id === to.shapeId);
    if (fromShape) fromShape.boundElements.push({ id: arrowId, type: "arrow" });
    if (toShape)   toShape.boundElements.push({ id: arrowId, type: "arrow" });

    const arrowEl = {
      id:              arrowId,
      type:            "arrow",
      x:               startAbsX,
      y:               startAbsY,
      width:           Math.abs(endAbsX - startAbsX) || 1,
      height:          Math.abs(endAbsY - startAbsY) || 1,
      angle:           0,
      strokeColor:     colors.arrowStroke,
      backgroundColor: "transparent",
      fillStyle:       "solid",
      strokeWidth:     2,
      strokeStyle:     "solid",
      roughness:       1,
      opacity:         100,
      groupIds:        [],
      frameId:         null,
      roundness:       { type: 2 },
      seed:            makeSeed(),
      version:         1,
      versionNonce:    makeSeed(),
      isDeleted:       false,
      points: [
        [0, 0],
        [endAbsX - startAbsX, endAbsY - startAbsY],
      ],
      lastCommittedPoint: null,
      startBinding: { elementId: from.shapeId, focus: 0, gap: 6 },
      endBinding:   { elementId: to.shapeId,   focus: 0, gap: 6 },
      startArrowhead: null,
      endArrowhead:   "arrow",
      updated:         ts,
      link:            null,
      locked:          false,
    };

    elements.push(arrowEl);

    // ── Edge label (placed cleanly above the arrow track) ───────────
    if (edge.label && String(edge.label).trim()) {
      const labelStr = String(edge.label).trim();
      const midX = (startAbsX + endAbsX) / 2;
      const midY = (startAbsY + endAbsY) / 2 + (offset !== 0 ? offset * 0.8 : -14);
      const labelW = Math.max(60, labelStr.length * 6.5 + 10);
      const labelH = 20;

      elements.push({
        id:              `wb_elabel_${idx}_${ts}`,
        type:            "text",
        x:               midX - labelW / 2,
        y:               midY - labelH / 2,
        width:           labelW,
        height:          labelH,
        angle:           0,
        strokeColor:     colors.edgeLabelText,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        fillStyle:       "solid",
        strokeWidth:     1,
        strokeStyle:     "solid",
        roughness:       0,
        opacity:         95,
        groupIds:        [],
        frameId:         null,
        roundness:       null,
        seed:            makeSeed(),
        version:         1,
        versionNonce:    makeSeed(),
        isDeleted:       false,
        text:            labelStr,
        fontSize:        11,
        fontFamily:      1,
        textAlign:       "center",
        verticalAlign:   "middle",
        baseline:        14,
        containerId:     null,
        originalText:    labelStr,
        lineHeight:      1.2,
        autoResize:      false,
        updated:         ts,
        link:            null,
        locked:          false,
      });
    }
  });

  return elements;
}

/**
 * Create or Update Whiteboard — atomic upsert, immune to concurrent-save VersionError
 * POST /api/whiteboard/save
 */
exports.saveWhiteboard = async (req, res) => {
  try {
    const {
      slug,
      title,
      elements = [],
      appState = {},
      files = {},
      thumbnail,
      tags,
      isPublic = true,
    } = req.body;

    const userId = req.user?.id || req.user?._id;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Whiteboard slug is required",
      });
    }

    // Authorization check: fetch minimal fields first
    const existing = await Whiteboard.findOne({ slug }).select("userId").lean();

    if (existing?.userId && userId && existing.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit this whiteboard",
      });
    }

    const elementCount = Array.isArray(elements) ? elements.filter((e) => !e.isDeleted).length : 0;

    // $set runs on BOTH insert and update — put everything here.
    // $setOnInsert must NOT share any path with $set (MongoDB code 40).
    const $set = {
      elements,
      elementCount,
      appState,
      files,
      isPublic,
      title:     title     !== undefined ? title     : "Untitled Whiteboard",
      thumbnail: thumbnail !== undefined ? thumbnail : "",
      tags:      tags      !== undefined ? tags      : [],
      updatedAt: new Date(),
    };
    // userId goes in $set only — never in $setOnInsert
    if (userId) $set.userId = userId;

    // $setOnInsert: ONLY fields not in $set (slug + createdAt)
    const $setOnInsert = {
      slug,
      createdAt: new Date(),
    };

    const whiteboard = await Whiteboard.findOneAndUpdate(
      { slug },
      { $set, $setOnInsert },
      {
        new: true,
        upsert: true,
        runValidators: false,
      }
    );

    const isNew = !existing;

    if (isNew && userId) {
      try {
        await awardXP(userId, 30);
      } catch (e) {
        console.error("Failed to award XP:", e);
      }
    }

    return res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? "Whiteboard created successfully" : "Whiteboard updated successfully",
      data: whiteboard,
    });
  } catch (error) {
    console.error("❌ Save Whiteboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save whiteboard",
      error: error.message,
    });
  }
};

/**
 * Get Whiteboard by slug
 * GET /api/whiteboard/:slug
 */
exports.getWhiteboard = async (req, res) => {
  try {
    const { slug } = req.params;

    const whiteboard = await Whiteboard.findOne({ slug }).populate("userId", "name email picture");

    if (!whiteboard) {
      return res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: whiteboard,
    });
  } catch (error) {
    console.error("❌ Get Whiteboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch whiteboard",
      error: error.message,
    });
  }
};

/**
 * Get User's Whiteboards
 * GET /api/whiteboard/user
 */
exports.getUserWhiteboards = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { page = 1, limit = 20, search = "", tag = "" } = req.query;

    const query = { userId };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (tag) {
      query.tags = tag;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [whiteboards, total] = await Promise.all([
      Whiteboard.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("slug title thumbnail elementCount tags isPublic createdAt updatedAt")
        .lean(),
      Whiteboard.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: whiteboards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Get User Whiteboards Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch whiteboards",
      error: error.message,
    });
  }
};

/**
 * Delete Whiteboard
 * DELETE /api/whiteboard/:id
 */
exports.deleteWhiteboard = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const whiteboard = await Whiteboard.findOneAndDelete({
      $or: [{ _id: id }, { slug: id }],
      userId,
    });

    if (!whiteboard) {
      return res.status(404).json({
        success: false,
        message: "Whiteboard not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Whiteboard deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Whiteboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete whiteboard",
      error: error.message,
    });
  }
};

/**
 * Duplicate Whiteboard
 * POST /api/whiteboard/duplicate/:id
 */
exports.duplicateWhiteboard = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const original = await Whiteboard.findOne({
      $or: [{ _id: id }, { slug: id }],
    });

    if (!original) {
      return res.status(404).json({
        success: false,
        message: "Original whiteboard not found",
      });
    }

    const newSlug = generateSlug(original.title + "-copy");
    const duplicated = await Whiteboard.create({
      slug: newSlug,
      title: `${original.title} (Copy)`,
      userId: userId || original.userId,
      elements: original.elements,
      elementCount: original.elementCount,
      appState: original.appState,
      files: original.files,
      thumbnail: original.thumbnail,
      tags: original.tags,
      isPublic: original.isPublic,
    });

    return res.status(201).json({
      success: true,
      message: "Whiteboard duplicated successfully",
      data: duplicated,
    });
  } catch (error) {
    console.error("❌ Duplicate Whiteboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to duplicate whiteboard",
      error: error.message,
    });
  }
};

/**
 * Safely strip LLM cruft from a JSON response and parse it.
 * Key invariant: never modify content inside string literals
 * (e.g. URLs containing "://" must not be stripped by the // comment remover).
 */
function cleanAndParseJson(raw) {
  if (!raw || typeof raw !== "string") return null;

  let cleaned = raw.trim();

  // 1. Strip markdown fences
  cleaned = cleaned.replace(/^```(?:json)?[ \t]*/im, "").replace(/```[ \t]*$/im, "").trim();

  // 2. Extract outermost { ... } block (removes leading prose)
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) return null;
  const lastBrace  = cleaned.lastIndexOf("}");
  if (lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  } else {
    // No closing brace — JSON was truncated; take from firstBrace to end
    cleaned = cleaned.slice(firstBrace);
  }

  // 3. Try direct parse first — fastest path for clean responses
  try { return JSON.parse(cleaned); } catch (_) {}

  // 4. Strip comments outside string literals (state-machine safe — won't corrupt URLs)
  cleaned = stripJsonComments(cleaned);

  // 5. Remove trailing commas before ] or }
  cleaned = cleaned.replace(/,[ \t\r\n]*([}\]])/g, "$1");

  // 6. Try again after comment/comma cleanup
  try { return JSON.parse(cleaned); } catch (_) {}

  // 7. Truncation repair: the model was cut off mid-JSON.
  //    Find the last complete key-value pair or array item, then close all open
  //    brackets in LIFO order.
  try {
    const repaired = repairTruncatedJson(cleaned);
    if (repaired) {
      const parsed = JSON.parse(repaired);
      // Only accept if we actually got nodes
      if (parsed && (Array.isArray(parsed.nodes) || Array.isArray(parsed.edges))) {
        console.log("🔧 JSON truncation repaired successfully");
        return parsed;
      }
    }
  } catch (_) {}

  console.warn("JSON repair failed: could not recover truncated response");
  return null;
}

// Strip single-line (//) and multi-line (block) comments from JSON-like text,
// skipping over string contents so URLs like "https://..." are never touched.
function stripJsonComments(str) {
  let out = "";
  let i = 0;
  const len = str.length;
  while (i < len) {
    const ch = str[i];
    if (ch === '"') {
      out += ch; i++;
      while (i < len) {
        const c = str[i];
        out += c; i++;
        if (c === '\\') { if (i < len) { out += str[i]; i++; } }
        else if (c === '"') break;
      }
    } else if (ch === '/' && str[i + 1] === '/') {
      i += 2;
      while (i < len && str[i] !== '\n' && str[i] !== '\r') i++;
    } else if (ch === '/' && str[i + 1] === '*') {
      i += 2;
      while (i < len && !(str[i] === '*' && str[i + 1] === '/')) i++;
      i += 2;
    } else {
      out += ch; i++;
    }
  }
  return out;
}

// Attempt to close a truncated JSON string by tracking bracket/brace depth
// via a state machine, then appending the missing closers in LIFO order.
function repairTruncatedJson(str) {
  const stack = [];
  let inString = false;
  let i = 0;
  const len = str.length;

  // Walk the string tracking open brackets and string state
  while (i < len) {
    const ch = str[i];
    if (inString) {
      if (ch === '\\') { i += 2; continue; }  // skip escaped char
      if (ch === '"') inString = false;
    } else {
      if (ch === '"') { inString = true; }
      else if (ch === '{') { stack.push('}'); }
      else if (ch === '[') { stack.push(']'); }
      else if (ch === '}' || ch === ']') { stack.pop(); }
    }
    i++;
  }

  // If we're cut off inside a string, close the string first
  const tail = inString ? '"' : '';

  // Remove trailing comma or dangling key-with-no-value: e.g. ,"x": or ,"key":
  // These appear when the JSON is cut off right after a colon
  let trimmed = (str + tail).trimEnd();
  // Strip trailing comma(s)
  trimmed = trimmed.replace(/,\s*$/, '');
  // Strip dangling "key": with nothing after (the value was cut off)
  trimmed = trimmed.replace(/,?\s*"[^"]*"\s*:\s*$/, '');
  // Strip trailing comma again after the above
  trimmed = trimmed.replace(/,\s*$/, '');

  // Close all dangling brackets in reverse order
  return trimmed + stack.reverse().join('');
}

/**
 * AI Agent Whiteboard Generation
 * POST /api/whiteboard/ai-generate
 */
exports.generateWhiteboardAI = async (req, res) => {
  try {
    const {
      prompt,
      diagramType = "architecture", // architecture, flowchart, mindmap, sequence, wireframe, userflow
      theme = "dark",
      targetPosition = { x: 100, y: 100 },
    } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "A descriptive prompt is required for AI diagram generation.",
      });
    }

    const systemPrompt = `You are an expert AI software architect and diagram designer.
Your mission is to generate a comprehensive, beautifully structured diagram layout in strict JSON format based on the user's request.

Output Format Requirement:
You MUST respond with valid JSON only. Do NOT include markdown fences, comments, or extra text.

JSON Structure:
{
  "title": "Diagram Title",
  "diagramType": "${diagramType}",
  "nodes": [
    {
      "id": "1",
      "label": "Component Name",
      "component": "database",
      "shape": "rectangle",
      "type": "standard",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 80
    }
  ],
  "edges": [
    {
      "from": "1",
      "to": "2",
      "label": "HTTPS / Flow"
    }
  ]
}

Component Stencil options:
- "database" (Postgres, MongoDB, Redis DB, MySQL, DynamoDB, Oracle, Storage Bucket, S3)
- "cache" (Redis Cache, Memcached, CloudFront CDN, In-Memory)
- "queue" (Kafka, RabbitMQ, SQS, EventBridge, Pub/Sub, Stream Pipeline)
- "gateway" (API Gateway, Load Balancer, Ingress, NGINX, Cloudflare)
- "cloud" (AWS VPC, Azure Region, GCP Network, Kubernetes Cluster)
- "client" (React Frontend, Mobile App, Next.js, Browser, User Persona)
- "service" (Auth Service, Payment API, Order Worker, Microservice Backend)
- "decision" (Condition check, validation, branch gate)

Shape options: "rectangle", "diamond", "ellipse"
Node type options: "start", "end", "decision", "standard", "success", "alert"

Layout Guidelines by Diagram Type:
1. architecture:
   - Layered tiers (Client Layer: Y=50, API Gateway/Load Balancer: Y=180, Microservices/App Layer: Y=320, Database/Cache/Storage Layer: Y=460).
   - Space nodes horizontally by 240px (X: 100, 360, 620, 880).
2. flowchart / userflow:
   - Logical top-to-bottom or left-to-right progression with decision diamonds and clear branching edges.
3. mindmap:
   - Central topic node at (400, 300), sub-branches radiating outward in 4 quadrants.
4. sequence:
   - Lifelines side by side at Y=50, messages descending in time (Y increments of 80px).
5. wireframe:
   - UI mockup layout with Header, Sidebar, Main Content area, Action Cards, Footer.

Create between 5 to 14 high-quality nodes with logical connections.`;

    const userPrompt = `Generate a ${diagramType} diagram for: "${prompt.trim()}". Theme: ${theme}. Output ONLY valid JSON.`;

    console.log(`✨ Generating AI Whiteboard Diagram via OpenRouter Engine: "${prompt}" [Type: ${diagramType}]`);

    let parsedResult = null;

    // ────────────────────────────────────────────────────────────────
    // 1. Primary Engine: OpenRouter (Matching notesEngineService.js)
    // ────────────────────────────────────────────────────────────────
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];

      const rawContent = await callOpenRouterWithFallback(WHITEBOARD_OPENROUTER_MODELS, messages, {
        temperature: 0.1,
        max_tokens: 4096,   // generous limit — complex diagrams can be large
        timeout: 25000,     // 25s max per model
        response_format: { type: "json_object" },
      });

      if (rawContent) {
        parsedResult = cleanAndParseJson(rawContent);
        if (parsedResult && Array.isArray(parsedResult.nodes) && parsedResult.nodes.length > 0) {
          console.log("✅ Successfully generated diagram via OpenRouter!");
        } else {
          console.warn("⚠️ OpenRouter parse failed, trying Gemini fallback...");
          parsedResult = null;
        }
      }
    } catch (orErr) {
      console.warn("⚠️ OpenRouter failed:", orErr.message.slice(0, 80));
    }

    // ────────────────────────────────────────────────────────────────
    // 2. Secondary Fallback: Google Gemini (parallel race — fastest key wins)
    // ────────────────────────────────────────────────────────────────
    if (!parsedResult || !Array.isArray(parsedResult.nodes) || parsedResult.nodes.length === 0) {
      const geminiKeys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GOOGLE_GENAI_API_KEY_FOR_CHAT,
        process.env.GOOGLE_API_KEY,
      ].filter(Boolean);

      if (geminiKeys.length > 0) {
        const geminiPrompt = `${systemPrompt}\n\nTask: ${userPrompt}`;

        // Race all keys in parallel — use the first successful response
        const tryGeminiKey = async (key) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 10000); // 10s per key
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
              {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
                  generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 2500,
                    responseMimeType: "application/json",
                  },
                }),
              }
            );
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = rawText ? cleanAndParseJson(rawText) : null;
            if (parsed?.nodes?.length > 0) return parsed;
            throw new Error("Empty or invalid diagram");
          } catch (e) {
            clearTimeout(timer);
            throw e;
          }
        };

        try {
          console.log(`🤖 [Gemini Fallback] Racing ${geminiKeys.length} keys in parallel...`);
          parsedResult = await Promise.any(geminiKeys.map(tryGeminiKey));
          console.log("✅ Successfully generated diagram via Google Gemini fallback!");
        } catch {
          console.warn("⚠️ All Gemini keys failed — using static fallback.");
        }
      }
    }

    // ────────────────────────────────────────────────────────────────
    // 3. Ultimate Fail-Safe: Dynamic Vector Topology Synthesis
    // ────────────────────────────────────────────────────────────────
    if (!parsedResult || !Array.isArray(parsedResult.nodes) || parsedResult.nodes.length === 0) {
      console.log("ℹ️ Using intelligent dynamic fallback diagram layout");
      parsedResult = {
        title: prompt.slice(0, 30),
        diagramType,
        nodes: [
          { id: "1", label: `Input: ${prompt.slice(0, 25)}`, shape: "ellipse", type: "start", x: 100, y: 150, width: 180, height: 70 },
          { id: "2", label: "AI Processing Engine", shape: "rectangle", type: "standard", x: 360, y: 150, width: 200, height: 80 },
          { id: "3", label: "Validation & Topology", shape: "diamond", type: "decision", x: 640, y: 140, width: 150, height: 100 },
          { id: "4", label: "Cloud Output & Storage", shape: "rectangle", type: "success", x: 880, y: 150, width: 200, height: 80 },
        ],
        edges: [
          { from: "1", to: "2", label: "Payload" },
          { from: "2", to: "3", label: "Process" },
          { from: "3", to: "4", label: "Verified" },
        ],
      };
    }

    // Convert to Excalidraw Elements
    const isDark = theme !== "light";
    const startX = targetPosition?.x || 100;
    const startY = targetPosition?.y || 100;

    const excalidrawElements = convertToExcalidrawElements(parsedResult, startX, startY, isDark);

    return res.status(200).json({
      success: true,
      title: parsedResult.title || "AI Generated Diagram",
      diagramType: parsedResult.diagramType || diagramType,
      elements: excalidrawElements,
      rawDiagram: parsedResult,
    });
  } catch (error) {
    console.error("❌ Generate Whiteboard AI Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI diagram for whiteboard",
      error: error.message,
    });
  }
};
