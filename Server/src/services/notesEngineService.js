// services/notesEngineService.js
// 7-Layer Production-Grade AI Document Generation Pipeline for Paperxify
// Supports 10-minute tutorials to 12-hour mega-lectures with OpenRouter, verified search images, and Cloudflare R2

const { getVerifiedSearchImage, getVerifiedImagesForFigures } = require('./imageSearchService');
const { generateStudyImages } = require('./imageGenerationService');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// OpenRouter model routing matrix
const MODEL_ROUTING = {
  fast_extraction: [
    'deepseek/deepseek-v4-flash',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openai/gpt-4o-mini',
    'google/gemini-flash-1.5'
  ],
  chapter_detection: [
    'deepseek/deepseek-v4-flash',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openai/gpt-4o-mini'
  ],
  synthesis_free: [
    'deepseek/deepseek-v4-flash',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openai/gpt-4o-mini'
  ],
  synthesis_pro: [
    'deepseek/deepseek-v4-flash',
    'openai/gpt-4o-mini',
    'nvidia/nemotron-3-ultra-550b-a55b:free'
  ],
  synthesis_power: [
    'openai/gpt-4o',
    'deepseek/deepseek-v4-flash',
    'nvidia/nemotron-3-ultra-550b-a55b:free'
  ]
};

// Plan duration limits in seconds and features
const PLAN_LIMITS = {
  free: { maxSeconds: 1 * 60 * 60, maxAiImages: 0, modelTier: 'synthesis_free' },
  pro: { maxSeconds: 4 * 60 * 60, maxAiImages: 6, modelTier: 'synthesis_pro' },
  scholar: { maxSeconds: 4 * 60 * 60, maxAiImages: 6, modelTier: 'synthesis_pro' },
  power: { maxSeconds: 12 * 60 * 60, maxAiImages: 15, modelTier: 'synthesis_power' }
};

// Accurate pricing per million tokens from OpenRouter (Input / Output USD)
const MODEL_COSTS = {
  'qwen/qwen3.6-flash': { input: 0.10, output: 0.40 },
  'google/gemini-flash-1.5': { input: 0.075, output: 0.30 },
  'deepseek/deepseek-v4-flash': { input: 0.14, output: 0.28 },
  'deepseek/deepseek-v4-flash': { input: 0.15, output: 0.60 },
  'nvidia/nemotron-3-ultra-550b-a55b:free': { input: 0.20, output: 0.60 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.60 },
  'openai/gpt-4o': { input: 2.50, output: 10.00 },
  'anthropic/claude-3.5-sonnet': { input: 3.00, output: 15.00 },
  'deepseek/deepseek-r1': { input: 0.55, output: 2.19 }
};

/**
 * Execute OpenRouter chat completion with model fallback list and token tracking
 */
async function callOpenRouterWithFallback(models, messages, options = {}) {
  const { temperature = 0.6, max_tokens = 8000, timeout = 90000 } = options;

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`🤖 OpenRouter calling model: ${model}`);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://paperxify.com',
          'X-Title': 'Paperxify Study Engine'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens
        })
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(errJson)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from model');

      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      
      // OpenRouter natively returns the exact cost in USD in `usage.cost`
      let callCost = typeof usage.cost === 'number' ? usage.cost : null;
      
      if (callCost === null) {
        const modelRate = MODEL_COSTS[model] || { input: 0.15, output: 0.60 };
        const inputCost = ((usage.prompt_tokens || 0) / 1000000) * modelRate.input;
        const outputCost = ((usage.completion_tokens || 0) / 1000000) * modelRate.output;
        callCost = inputCost + outputCost;
      }

      console.log(`✅ Success with model: ${model} (${usage.total_tokens || 'N/A'} tokens, OpenRouter exact cost: $${callCost.toFixed(6)})`);

      return {
        content,
        model,
        usage: {
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0
        },
        cost: callCost
      };
    } catch (err) {
      console.warn(`❌ Model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`);
}

/**
 * Format raw seconds to [HH:MM:SS] or [MM:SS]
 */
function formatTimestamp(seconds) {
  const sec = Math.floor(seconds || 0);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remainingSec = sec % 60;

  if (hrs > 0) {
    return `[${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(remainingSec).padStart(2, '0')}]`;
  }
  return `[${String(mins).padStart(2, '0')}:${String(remainingSec).padStart(2, '0')}]`;
}

/**
 * Step 1: Normalize Transcript (Deterministic & Cheap)
 * Deduplicates repeated lines, fixes fragments, groups into semantic paragraphs with timestamps.
 */
function normalizeTranscript(transcriptInput) {
  if (!transcriptInput) return '';

  let lines = [];
  if (typeof transcriptInput === 'string') {
    lines = transcriptInput.split('\n');
  } else if (Array.isArray(transcriptInput)) {
    lines = transcriptInput.map(seg => {
      const time = seg.start !== undefined ? `[${seg.start}s]` : '';
      return `${time} ${seg.text || ''}`;
    });
  }

  let normalized = '';
  let currentGroup = [];
  let currentStart = '00:00';
  let seenLines = new Set();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Deduplicate identical consecutive lines
    const textOnly = line.replace(/\[.*?\]/g, '').trim();
    if (seenLines.has(textOnly) && textOnly.length > 15) continue;
    seenLines.add(textOnly);

    // Extract timestamp if present
    const match = line.match(/\[([0-9.:]+)s?\]/);
    if (match && currentGroup.length === 0) {
      const rawSec = parseFloat(match[1]);
      currentStart = !isNaN(rawSec) ? formatTimestamp(rawSec) : match[1];
    }

    currentGroup.push(textOnly);

    // Group paragraphs into ~60 words
    if (currentGroup.join(' ').split(' ').length >= 60) {
      normalized += `${currentStart} ${currentGroup.join(' ')}\n\n`;
      currentGroup = [];
    }
  }

  if (currentGroup.length > 0) {
    normalized += `${currentStart} ${currentGroup.join(' ')}\n\n`;
  }

  return normalized;
}

/**
 * Step 2: Semantic Chapter Detection
 */
async function detectSemanticChapters(normalizedText, durationSeconds = 0) {
  // Sample first 15k characters of transcript for high-level structure
  const sample = normalizedText.substring(0, 18000);

  const prompt = `You are a curriculum architect. Analyze this lecture transcript and identify 4 to 8 logical semantic chapters.
For each chapter, provide:
- chapterId (e.g. "ch_1")
- title (clean academic title)
- startSeconds (approximate start in seconds)
- endSeconds (approximate end in seconds)
- summary (1 sentence overview)
- importance (0.1 to 1.0)

TRANSCRIPT SAMPLE:
${sample}

Respond ONLY with valid JSON array:
[
  {
    "chapterId": "ch_1",
    "title": "...",
    "startSeconds": 0,
    "endSeconds": 300,
    "summary": "...",
    "importance": 0.95
  }
]`;

  try {
    const res = await callOpenRouterWithFallback(
      MODEL_ROUTING.chapter_detection,
      [{ role: 'user', content: prompt }],
      { temperature: 0.2, max_tokens: 1500 }
    );

    const cleanJson = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
    const chapters = JSON.parse(cleanJson);
    if (Array.isArray(chapters) && chapters.length > 0) {
      return {
        chapters,
        usage: res.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        cost: res.cost || 0
      };
    }
  } catch (err) {
    console.warn('⚠️ Chapter detection fallback:', err.message);
  }

  // Fallback default chapters
  return {
    chapters: [
      {
        chapterId: 'ch_1',
        title: 'Introduction & Core Foundations',
        startSeconds: 0,
        endSeconds: Math.floor(durationSeconds * 0.4),
        summary: 'Overview of foundational principles and key motivations.',
        importance: 0.9
      },
      {
        chapterId: 'ch_2',
        title: 'Detailed Methodologies & Key Concepts',
        startSeconds: Math.floor(durationSeconds * 0.4),
        endSeconds: durationSeconds || 600,
        summary: 'In-depth analysis, formulas, comparisons, and applications.',
        importance: 0.95
      }
    ],
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    cost: 0
  };
}

/**
 * Step 3: Semantic Chunking (5,000 - 8,000 tokens ~ 20,000 - 32,000 characters)
 */
function chunkTranscriptText(text, maxCharsPerChunk = 24000, overlapChars = 1500) {
  if (text.length <= maxCharsPerChunk) {
    return [text];
  }

  const chunks = [];
  let startIdx = 0;

  while (startIdx < text.length) {
    let endIdx = Math.min(startIdx + maxCharsPerChunk, text.length);

    if (endIdx < text.length) {
      const nextBreak = text.lastIndexOf('\n\n', endIdx);
      if (nextBreak > startIdx + maxCharsPerChunk / 2) {
        endIdx = nextBreak;
      }
    }

    chunks.push(text.substring(startIdx, endIdx));
    if (endIdx >= text.length) break;
    startIdx = endIdx - overlapChars;
  }

  return chunks;
}

/**
 * Step 4: Fast Knowledge Extraction (Map Phase)
 */
async function extractChunkKnowledge(chunkText, chunkIndex, totalChunks) {
  const prompt = `You are an expert academic knowledge extractor. Extract all key information from this lecture segment (${chunkIndex + 1}/${totalChunks}).
Preserve all timestamps (e.g. [01:23:45]) next to the definitions, formulas, and concepts.

Return a clean structured JSON object with this EXACT schema:
{
  "topics": ["topic names"],
  "definitions": [
    { "term": "term name", "definition": "clear concise definition", "timestamp": "[00:00]" }
  ],
  "formulas": [
    { "latex": "LaTeX formula", "variables": "variable explanation", "timestamp": "[00:00]" }
  ],
  "keyPoints": [
    { "point": "important factual takeaway", "importance": "high|medium", "timestamp": "[00:00]" }
  ],
  "tables": [
    { "title": "table title", "columns": ["Col1", "Col2"], "rows": [["val1", "val2"]] }
  ],
  "visualCandidates": [
    { "title": "Exact technical diagram/flowchart name (e.g. 'RAG Vector Indexing Pipeline Architecture', 'B-Tree Node Split Diagram'). ONLY list when an architectural diagram or flowchart is genuinely needed. Leave empty [] if no diagram is needed." }
  ],
  "codeSnippets": [
    { "language": "python|js|cpp", "code": "code here", "explanation": "explanation" }
  ],
  "commonMistakes": [
    { "mistake": "common misconception", "correction": "correct concept" }
  ],
  "examTips": [
    { "tip": "high yield test takeaway" }
  ]
}

TRANSCRIPT SEGMENT:
${chunkText}

Respond ONLY with valid JSON. No markdown backticks.`;

  try {
    const res = await callOpenRouterWithFallback(
      MODEL_ROUTING.fast_extraction,
      [{ role: 'user', content: prompt }],
      { temperature: 0.2, max_tokens: 3000 }
    );

    const cleanJson = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return { data: parsed, usage: res.usage, cost: res.cost || 0 };
  } catch (err) {
    console.warn(`⚠️ Extraction fallback for chunk ${chunkIndex + 1}:`, err.message);
    return {
      data: {
        topics: [],
        definitions: [],
        formulas: [],
        keyPoints: [],
        tables: [],
        visualCandidates: [],
        codeSnippets: [],
        commonMistakes: [],
        examTips: []
      },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      cost: 0
    };
  }
}

/**
 * Step 5: Cross-Chapter Knowledge Merge & Canonical Knowledge IR Builder
 */
function buildKnowledgeIR(title, channel, duration, chapters, knowledgeObjects) {
  const mergedDefinitions = [];
  const mergedFormulas = [];
  const mergedKeyPoints = [];
  const mergedTables = [];
  const mergedVisualCandidates = [];
  const mergedCodeSnippets = [];
  const mergedCommonMistakes = [];
  const mergedExamTips = [];

  for (const ko of knowledgeObjects) {
    if (ko.definitions) mergedDefinitions.push(...ko.definitions);
    if (ko.formulas) mergedFormulas.push(...ko.formulas);
    if (ko.keyPoints) mergedKeyPoints.push(...ko.keyPoints);
    if (ko.tables) mergedTables.push(...ko.tables);
    if (ko.visualCandidates) mergedVisualCandidates.push(...ko.visualCandidates);
    if (ko.codeSnippets) mergedCodeSnippets.push(...ko.codeSnippets);
    if (ko.commonMistakes) mergedCommonMistakes.push(...ko.commonMistakes);
    if (ko.examTips) mergedExamTips.push(...ko.examTips);
  }

  // Deduplicate definitions by term
  const uniqueDefs = [];
  const seenTerms = new Set();
  for (const def of mergedDefinitions) {
    const norm = (def.term || '').toLowerCase().trim();
    if (norm && !seenTerms.has(norm)) {
      seenTerms.add(norm);
      uniqueDefs.push(def);
    }
  }

  // Deduplicate visual candidates
  const uniqueVisuals = [];
  const seenVisuals = new Set();
  for (const vis of mergedVisualCandidates) {
    const norm = (vis.title || '').toLowerCase().trim();
    if (norm && !seenVisuals.has(norm) && norm.length > 5) {
      seenVisuals.add(norm);
      uniqueVisuals.push(vis);
    }
  }

  return {
    metadata: {
      title,
      channel,
      duration,
      extractedAt: new Date().toISOString()
    },
    chapters,
    knowledgeGraph: {
      definitions: uniqueDefs,
      formulas: mergedFormulas,
      keyPoints: mergedKeyPoints,
      tables: mergedTables,
      visualCandidates: uniqueVisuals,
      codeSnippets: mergedCodeSnippets,
      commonMistakes: mergedCommonMistakes,
      examTips: mergedExamTips
    }
  };
}

/**
 * Step 6: Note Architect & Synthesis Engine (Reduce Phase)
 */
async function synthesizePaperxifyNote({
  title,
  channel,
  duration,
  knowledgeIR,
  userPlan = 'free',
  detailLevel = 'Standard Notes'
}) {
  const planConfig = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  const models = MODEL_ROUTING[planConfig.modelTier] || MODEL_ROUTING.synthesis_free;

  // 1. Resolve visuals via Priority Ladder
  const visualCandidates = (knowledgeIR.knowledgeGraph?.visualCandidates || []).map(v => v.title);
  console.log(`🖼️ Resolving visuals: found ${visualCandidates.length} candidate(s)`);

  const searchImages = await getVerifiedImagesForFigures(visualCandidates.slice(0, 3));
  const verifiedSearchImages = searchImages.filter(img => img.img_url);

  let aiImages = [];
  if (planConfig.maxAiImages > 0 && verifiedSearchImages.length < 2 && visualCandidates.length > 0) {
    const missing = visualCandidates.filter(fig => !verifiedSearchImages.some(v => v.title === fig));
    if (missing.length > 0) {
      aiImages = await generateStudyImages(missing.slice(0, planConfig.maxAiImages), userPlan === 'power' ? 'premium' : 'free');
    }
  }

  const allAvailableImages = [...verifiedSearchImages, ...aiImages];

  // 2. Note Architect Synthesis Prompt
  const synthesisPrompt = `You are Paperxify AI, the world's premier academic study document engine.
Create a comprehensive, textbook-quality study document for: "${title}" (${channel || 'Lecture'}).
Detail Level: ${detailLevel}.
User Tier: ${userPlan.toUpperCase()}.

AVAILABLE VERIFIED TECHNICAL IMAGES:
${allAvailableImages.length > 0 ? allAvailableImages.map(img => `- ![${img.title}](${img.img_url})`).join('\n') : 'None'}

DOCUMENT DESIGN GUIDELINES:
1. **Title & Overview**: Start with the Document Title (# Title), subject domain, and a 3-bullet "What You'll Learn" block.
2. **Textbook Hierarchy**: Structure by Chapters (## Chapter Name) and Sections (### Section Name).
3. **Core Elements to Include**:
   - ⚡ **Quick Remember Boxes**: Concise one-liner memory aids.
   - 🔴 **Must Know High Yield Points**: Core takeaways.
   - **KaTeX Mathematical Formulas**: Use $$ formula $$ for block display, $formula$ for inline. Explain all variables.
   - **Comparative Markdown Tables**: Generate clean comparative tables for contrasting concepts.
   - **Code Blocks**: When programming is discussed, provide complete, syntax-highlighted code with explanation.
   - **Common Mistakes & Pitfalls**: Explicit callouts on where students get confused.
   - **🎯 Exam Prep Points**: High yield takeaways for exams.
4. **Provenance Timestamps**: Place clickable YouTube timestamps like [ 01:23:45 ] right next to definitions and formulas.
5. **STRICT VISUAL & IMAGE EMBEDDING RULES**:
   - ONLY embed an image IF it is a strictly technical architecture diagram, data flowchart, or scientific process directly illustrating that specific section.
   - NEVER embed generic stock pictures, human portraits, or marketing illustrations.
   - NEVER force an image if it does not directly add technical value. High-quality tables and formatted math are much more valuable than decorative images.

STRUCTURED KNOWLEDGE IR:
${JSON.stringify(knowledgeIR, null, 2)}

Now generate the complete, textbook-grade study note in Markdown:`;

  const res = await callOpenRouterWithFallback(
    models,
    [{ role: 'user', content: synthesisPrompt }],
    { temperature: 0.6, max_tokens: 8000 }
  );

  return {
    markdown: res.content,
    images: allAvailableImages,
    usage: res.usage,
    cost: res.cost || 0
  };
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/[^\d:]/g, '');
  const parts = clean.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/**
 * Step 7: Content Quality Assurance (QA) Check
 */
function runQualityAssurance(markdownContent, videoId = null) {
  let cleaned = markdownContent;

  // Fix broken LaTeX delimiters
  cleaned = cleaned.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  cleaned = cleaned.replace(/\\\(/g, '$').replace(/\\\)/g, '$');

  // Ensure table pipes are properly aligned
  cleaned = cleaned.replace(/\n\s*\|/g, '\n|');

  // Make timestamps clickable markdown links if videoId is available
  if (videoId) {
    const baseVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Range timestamps: [00:00 - 01:00]
    cleaned = cleaned.replace(/(?<!!)\[\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\](?!\()/g, (match, start, end) => {
      const sec = parseTimeToSeconds(start);
      return `[⏱️ ${start} - ${end}](${baseVideoUrl}&t=${sec}s)`;
    });

    // Single timestamps: [ 01:23:45 ]
    cleaned = cleaned.replace(/(?<!!)\[\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\](?!\()/g, (match, time) => {
      const sec = parseTimeToSeconds(time);
      return `[⏱️ ${time}](${baseVideoUrl}&t=${sec}s)`;
    });
  }

  return cleaned;
}

/**
 * End-to-End Master Generator: From Raw YouTube Transcript to Paperxify Note
 * Emits real-time progress callbacks for asynchronous job tracking.
 */
async function generateLectureNotePipeline({
  jobId,
  videoId,
  title,
  channel,
  duration,
  transcriptSegments,
  userPlan = 'free',
  detailLevel = 'Standard Notes',
  onProgress = () => {}
}) {
  console.log(`🚀 Starting Paperxify Pipeline [Job: ${jobId || 'direct'}] for "${title}" (${duration}s, Plan: ${userPlan})`);

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalExactCost = 0;

  // 1. Initializing & Normalizing Transcript
  onProgress({
    status: 'PROCESSING_TRANSCRIPT',
    progress: 10,
    currentStage: 'Transcript Normalization',
    currentMessage: 'Normalizing punctuation, deduplicating captions, and mapping timestamps...'
  });

  const normalizedText = normalizeTranscript(transcriptSegments);

  // 2. Semantic Chapter Detection
  onProgress({
    status: 'DETECTING_CHAPTERS',
    progress: 25,
    currentStage: 'Semantic Chapter Detection',
    currentMessage: 'Identifying lecture boundaries, major chapters, and topic milestones...'
  });

  const chapterResult = await detectSemanticChapters(normalizedText, duration);
  const chapters = chapterResult.chapters;
  totalInputTokens += chapterResult.usage.inputTokens;
  totalOutputTokens += chapterResult.usage.outputTokens;
  totalExactCost += (chapterResult.cost || 0);

  // 3. Semantic Chunking
  const chunks = chunkTranscriptText(normalizedText);
  console.log(`📑 Lecture partitioned into ${chunks.length} semantic chunks`);

  // 4. Knowledge Extraction (Map Phase)
  onProgress({
    status: 'EXTRACTING_KNOWLEDGE',
    progress: 40,
    currentStage: 'Knowledge Extraction',
    currentMessage: `Extracting concepts, formulas, tables, and definitions across ${chunks.length} chunk(s)...`
  });

  const knowledgeObjects = [];
  for (let i = 0; i < chunks.length; i++) {
    const { data, usage, cost } = await extractChunkKnowledge(chunks[i], i, chunks.length);
    knowledgeObjects.push(data);
    totalInputTokens += usage.inputTokens;
    totalOutputTokens += usage.outputTokens;
    totalExactCost += (cost || 0);

    const chunkProgress = 40 + Math.floor(((i + 1) / chunks.length) * 20);
    onProgress({
      status: 'EXTRACTING_KNOWLEDGE',
      progress: chunkProgress,
      currentStage: 'Knowledge Extraction',
      currentMessage: `Extracted chunk ${i + 1}/${chunks.length} (${data.definitions?.length || 0} definitions, ${data.formulas?.length || 0} formulas)...`,
      tokenUsage: { inputTokens: totalInputTokens, outputTokens: totalOutputTokens, totalTokens: totalInputTokens + totalOutputTokens },
      estimatedCost: parseFloat(totalExactCost.toFixed(6))
    });
  }

  // 5. Cross-Chapter Merge & Knowledge IR
  onProgress({
    status: 'BUILDING_KNOWLEDGE',
    progress: 65,
    currentStage: 'Knowledge Graph Synthesis',
    currentMessage: 'Merging canonical concepts and constructing structured Knowledge IR...'
  });

  const knowledgeIR = buildKnowledgeIR(title, channel, duration, chapters, knowledgeObjects);

  // 6. Note Synthesis & Visual Decision Engine
  onProgress({
    status: 'GENERATING_NOTES',
    progress: 75,
    currentStage: 'Note Architecture & Synthesis',
    currentMessage: 'Synthesizing textbook explanations, KaTeX formulas, and resolving verified visuals...'
  });

  const synthesisResult = await synthesizePaperxifyNote({
    title,
    channel,
    duration,
    knowledgeIR,
    userPlan,
    detailLevel
  });

  totalInputTokens += synthesisResult.usage.inputTokens;
  totalOutputTokens += synthesisResult.usage.outputTokens;
  totalExactCost += (synthesisResult.cost || 0);

  // 7. Quality Assurance Check
  onProgress({
    status: 'QUALITY_CHECK',
    progress: 90,
    currentStage: 'Quality Assurance',
    currentMessage: 'Validating LaTeX formatting, citation timestamps, and document structure...'
  });

  const finalMarkdown = runQualityAssurance(synthesisResult.markdown, videoId);

  onProgress({
    status: 'COMPLETED',
    progress: 100,
    currentStage: 'Document Ready',
    currentMessage: 'Study document generated successfully!',
    tokenUsage: {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens
    },
    estimatedCost: parseFloat(totalExactCost.toFixed(6))
  });

  console.log(`✅ Pipeline Complete [Job: ${jobId || 'direct'}]: ${totalInputTokens + totalOutputTokens} tokens, OpenRouter Billed Cost: $${totalExactCost.toFixed(6)}`);

  return {
    title,
    content: finalMarkdown,
    knowledgeIR,
    chapters,
    images: synthesisResult.images,
    tokenUsage: {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens
    },
    estimatedCost: parseFloat(totalExactCost.toFixed(6))
  };
}

module.exports = {
  generateLectureNotePipeline,
  normalizeTranscript,
  detectSemanticChapters,
  chunkTranscriptText,
  extractChunkKnowledge,
  buildKnowledgeIR,
  synthesizePaperxifyNote,
  runQualityAssurance,
  PLAN_LIMITS,
  MODEL_ROUTING
};
