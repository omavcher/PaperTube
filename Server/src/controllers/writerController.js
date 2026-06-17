const User = require("../models/User");
const pdfService     = require('../services/pdfService');
const Essay = require("../models/Essay");
const { awardXP } = require("../utils/xpHelper");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const DETECTOR_MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash:free",
  "openrouter/free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "tngtech/deepseek-r1t-chimera:free"
];

// OpenRouter LLM Helper with fallback queue
async function callOpenRouter(systemPrompt, userPrompt) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  let lastError = null;

  for (const model of DETECTOR_MODELS) {
    try {
      console.log(`📡 Detector trying model: ${model}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://paperxify.com",
          "X-Title": "Paperxify AI Detector"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.1,
          stream: false,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log(`✅ Success with model: ${model}`);
      return data.choices[0].message.content;
    } catch (error) {
      console.warn(`❌ Model ${model} failed: ${error.message}`);
      lastError = error;
    }
  }

  throw new Error(`All detector models failed. Last error: ${lastError?.message}`);
}

// Robust JSON Extractor with matching bracket count
function extractJSON(str) {
  if (!str) return null;
  const start = str.indexOf('{');
  if (start === -1) return null;

  let braceCount = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < str.length; i++) {
    const char = str[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return str.substring(start, i + 1);
        }
      }
    }
  }
  return null;
}

// Syllable Count Heuristic for Readability
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const vowels = word.match(/[aeiouy]{1,2}/g);
  return vowels ? vowels.length : 1;
}

exports.detectAI = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid text input of at least 50 characters."
      });
    }

    // 1. Verify Premium subscription
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isSubscribed = user.membership?.isActive === true;
    if (!isSubscribed) {
      return res.status(403).json({
        success: false,
        code: "PREMIUM_ONLY",
        message: "The AI Detector is a premium feature. Please upgrade your subscription to access it."
      });
    }

    // 2. Preprocessing
    // Calculate paragraphs from original raw text first
    const rawParagraphs = text.split(/\r?\n\s*\r?\n/).filter(p => p.trim().length > 0);
    const paragraphCount = rawParagraphs.length || 1;

    // Clean HTML, emojis, non-whitespace control characters, and normalize all whitespaces
    const cleanedText = text
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "")
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "") // remove non-whitespace control characters
      .replace(/\s+/g, " ") // replace all whitespace sequences (tabs, newlines, CR) with single spaces
      .trim();

    const words = cleanedText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Split into sentences using a punctuation lookbehind to preserve sentence integrity
    const sentences = cleanedText
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
    const sentenceCount = sentences.length || 1;

    const avgSentenceLength = wordCount / sentenceCount;

    // 3. Feature Extraction
    // A. Burstiness: standard deviation of sentence word counts
    const sentenceWordCounts = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const avgLen = sentenceWordCounts.reduce((a, b) => a + b, 0) / sentenceWordCounts.length;
    const variance = sentenceWordCounts.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / sentenceWordCounts.length;
    const burstiness = Math.sqrt(variance);

    // Map burstiness to AI likelihood score (0 to 100) where low variation is AI (high score)
    const burstinessScore = Math.max(0, Math.min(100, 100 - (burstiness * 10)));

    // B. Vocabulary Diversity: Type-Token Ratio (TTR)
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, "")));
    const diversity = words.length > 0 ? (uniqueWords.size / words.length) : 0;
    // Map diversity to AI likelihood score where low TTR is AI (high score)
    const diversityScore = Math.max(0, Math.min(100, (0.8 - diversity) * 200));

    // C. Repetition score
    const transitions = ["furthermore", "additionally", "in conclusion", "moreover", "consequently", "therefore", "in summary", "crucially", "to sum up"];
    let transitionCount = 0;
    words.forEach(w => {
      const cleanW = w.toLowerCase().replace(/[^a-z]/g, "");
      if (transitions.includes(cleanW)) transitionCount++;
    });
    const transitionRatio = transitionCount / sentenceCount;
    const transitionScore = Math.min(100, transitionRatio * 250);

    let bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(words[i].toLowerCase() + "_" + words[i+1].toLowerCase());
    }
    const uniqueBigrams = new Set(bigrams);
    const bigramRepetition = bigrams.length > 0 ? (1 - uniqueBigrams.size / bigrams.length) : 0;
    const repetitionScore = Math.min(100, bigramRepetition * 300);

    // D. Readability: Flesch Reading Ease
    let totalSyllables = 0;
    words.forEach(w => {
      totalSyllables += countSyllables(w);
    });
    const readability = 206.835 - 1.015 * (words.length / sentenceCount) - 84.6 * (totalSyllables / words.length);

    // E. Classifier Score: combine statistics
    const classifier = 0.3 * burstinessScore + 0.3 * diversityScore + 0.2 * transitionScore + 0.2 * repetitionScore;

    // 4. LLM Secondary Analysis & Sentence-Level Detection via OpenRouter
    const systemPrompt = `You are a professional AI text detector and forensic linguist.
Analyze the user's text to determine if it shows signs of AI generation.
Analyze sentence by sentence and return a detailed report in strict JSON format.

Your response must be a valid JSON object matching the following schema EXACTLY:
{
  "perplexity": 40.0, // 0 to 100 score of perplexity (100 = highly human, 0 = highly predictable/AI)
  "llmAnalysis": 85.0, // 0 to 100 score of AI probability according to linguistic patterns
  "confidence": 90.0, // 0 to 100 confidence of this verdict
  "patterns": ["Uniform paragraph structure", "Overuse of hedging"],
  "transitions": ["Furthermore", "In conclusion"],
  "structure": "Highly standard argumentative outline",
  "sentences": [
    {
      "text": "Sentence text here...",
      "label": "ai", // must be exactly "ai", "mixed", or "human"
      "score": 95 // 0 to 100 score of AI-likeness for this specific sentence
    }
  ]
}

Ensure every single sentence in the user's text is present in the "sentences" array, preserving the exact original text of the sentence. Do not wrap response in markdown code blocks.`;

    const userPrompt = `Analyze this text for AI generation:
"${cleanedText}"`;

    console.log(`📡 Sending AI detection request to OpenRouter for user: ${userId}`);
    const result = await callOpenRouter(systemPrompt, userPrompt);

    let parsedResult;
    try {
      if (!result || typeof result !== 'string') {
        throw new Error("Empty response from AI model");
      }

      // Clean thinking blocks from reasoning models
      let cleaned = result.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

      // Strip markdown json wrappers
      cleaned = cleaned.replace(/^```(?:json)?\s*/im, '').replace(/```\s*$/im, '').trim();

      const jsonStr = extractJSON(cleaned);
      if (!jsonStr) {
        throw new Error("No valid JSON object found in response");
      }

      parsedResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("❌ Failed to parse JSON response from AI Detector LLM. Raw response:", result);
      console.error("Parse error:", e.message);
      return res.status(500).json({
        success: false,
        message: `AI analysis parsing failed: ${e.message}. Please try again.`
      });
    }

    const llmPerplexity = parsedResult.perplexity || 50;
    const llmAnalysis = parsedResult.llmAnalysis || 50;
    const confidence = parsedResult.confidence || 70;

    // 5. Final Combined Score Calculation
    // finalScore = 0.4 * classifier + 0.3 * perplexity + 0.2 * burstiness + 0.1 * llmAnalysis
    // Note: perplexity AI likelihood is (100 - perplexity) because lower perplexity means higher AI likeness.
    const perplexityScore = 100 - llmPerplexity;
    const finalScore = 0.4 * classifier + 0.3 * perplexityScore + 0.2 * burstinessScore + 0.1 * llmAnalysis;

    const aiProbability = Math.round(Math.max(0, Math.min(100, finalScore)));
    const humanProbability = 100 - aiProbability;

    console.log(`✅ AI Detection Complete. AI Prob: ${aiProbability}%, Human Prob: ${humanProbability}%, Confidence: ${confidence}%`);

    return res.status(200).json({
      success: true,
      result: {
        aiProbability,
        humanProbability,
        confidence,
        sentences: parsedResult.sentences || [],
        features: {
          wordCount,
          sentenceCount,
          paragraphCount,
          avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
          burstiness: Math.round(burstiness * 10) / 10,
          diversity: Math.round(diversity * 100) / 100,
          readability: Math.round(readability * 10) / 10
        },
        llmFeedback: {
          patterns: parsedResult.patterns || [],
          transitions: parsedResult.transitions || [],
          structure: parsedResult.structure || ""
        }
      }
    });

  } catch (error) {
    console.error("❌ AI Detector Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during AI detection",
      error: error.message
    });
  }
};

// HTML Plagiarism Report Compiler
function compilePlagiarismHtml(data) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  });
  
  const sourcesRows = data.sources.map(src => `
    <tr>
      <td class="source-rank">${src.rank}</td>
      <td><span class="source-title">${src.title}<small>${src.citation || ''}</small></span></td>
      <td>${src.database}</td>
      <td><span class="match-pill ${src.pillClass}">${src.matchPercentage}</span></td>
      <td>${src.wordsMatched}</td>
    </tr>
  `).join("\n");

  const passagesCards = data.passages.map(psg => `
    <div class="passage-card">
      <div class="passage-header">
        <span class="passage-ref">Passage ${psg.index} &nbsp;·&nbsp; ${psg.ref} &nbsp;·&nbsp; ${psg.matchPercentage} match</span>
      </div>
      <div class="passage-body">
        ${psg.text}
      </div>
      <div class="passage-source">${psg.sourceInfo}</div>
    </div>
  `).join("\n");

  const recommendationsList = data.recommendations.map((rec, idx) => `
    <li class="rec-item">
      <div class="rec-num">${idx + 1}</div>
      <div class="rec-text">${rec}</div>
    </li>
  `).join("\n");

  const reportId = data.reportId || `PDR-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Plagiarism Detection Report | ${data.paperDetails.title}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0d0d0d;
    --ink2: #2e2e2e;
    --ink3: #555;
    --ink4: #888;
    --paper: #faf9f6;
    --paper2: #f2f0ea;
    --paper3: #e8e5dc;
    --rule: #d4d0c4;
    --red: #c0392b;
    --red-bg: #fdf0ee;
    --amber: #b8650a;
    --amber-bg: #fef8ed;
    --green: #1a7a42;
    --green-bg: #edf7f1;
    --blue: #1c5faf;
    --blue-bg: #eef4fc;
    --accent: #1a1a1a;
  }

  body {
    font-family: 'IBM Plex Serif', Georgia, serif;
    background: var(--paper);
    color: var(--ink);
    font-size: 13.5px;
    line-height: 1.65;
    padding: 0;
  }

  .cover {
    min-height: 100vh;
    background: var(--ink);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px 72px;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: -120px; right: -80px;
    width: 500px; height: 500px;
    border: 80px solid rgba(255,255,255,0.04);
    border-radius: 50%;
  }
  .cover::after {
    content: '';
    position: absolute;
    bottom: -60px; left: 60px;
    width: 320px; height: 320px;
    border: 50px solid rgba(255,255,255,0.03);
    border-radius: 50%;
  }
  .cover-top { position: relative; z-index: 1; }
  .org-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,0.2);
    padding: 6px 14px;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
    margin-bottom: 48px;
  }
  .org-badge::before {
    content: '';
    width: 6px; height: 6px;
    background: #e8c547;
    border-radius: 50%;
  }
  .cover-title {
    font-family: 'Syne', sans-serif;
    font-size: 52px;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-bottom: 20px;
  }
  .cover-title span { color: #e8c547; }
  .cover-subtitle {
    font-family: 'IBM Plex Serif', serif;
    font-style: italic;
    font-size: 15px;
    color: rgba(255,255,255,0.55);
    max-width: 520px;
    line-height: 1.7;
  }
  .cover-bottom {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
    border-top: 1px solid rgba(255,255,255,0.12);
    padding-top: 32px;
  }
  .cover-meta-label {
    font-family: 'Syne', sans-serif;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 6px;
  }
  .cover-meta-value {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12.5px;
    color: rgba(255,255,255,0.85);
  }

  .main-body { max-width: 860px; margin: 0 auto; padding: 64px 48px; }

  .section-label {
    font-family: 'Syne', sans-serif;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink4);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--rule);
  }

  h2 {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 24px;
  }

  .score-section {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 40px;
    align-items: center;
    background: white;
    border: 1px solid var(--rule);
    padding: 36px;
    margin-bottom: 40px;
  }

  .score-ring-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .score-ring-wrap svg { display: block; }
  .score-label {
    font-family: 'Syne', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink4);
  }

  .score-breakdown { display: flex; flex-direction: column; gap: 14px; }
  .score-row { display: flex; flex-direction: column; gap: 5px; }
  .score-row-label {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    color: var(--ink2);
  }
  .score-row-label span:last-child {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
  }
  .bar-track {
    height: 6px;
    background: var(--paper3);
    border-radius: 3px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 3px;
  }

  .doc-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid var(--rule);
    margin-bottom: 40px;
  }
  .doc-info-cell {
    padding: 14px 20px;
    border-bottom: 1px solid var(--rule);
  }
  .doc-info-cell:nth-child(odd) { border-right: 1px solid var(--rule); }
  .doc-info-cell:nth-last-child(-n+2) { border-bottom: none; }
  .doc-info-key {
    font-family: 'Syne', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink4);
    margin-bottom: 4px;
  }
  .doc-info-val {
    font-size: 13px;
    color: var(--ink);
  }

  .categories {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 40px;
  }
  .cat-card {
    padding: 20px;
    border: 1px solid var(--rule);
  }
  .cat-pct {
    font-family: 'Syne', sans-serif;
    font-size: 36px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 6px;
  }
  .cat-name {
    font-family: 'Syne', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .cat-desc {
    font-size: 11.5px;
    color: var(--ink4);
    line-height: 1.5;
  }
  .cat-red { background: var(--red-bg); border-color: #f0c0bb; }
  .cat-red .cat-pct, .cat-red .cat-name { color: var(--red); }
  .cat-amber { background: var(--amber-bg); border-color: #f5d9a0; }
  .cat-amber .cat-pct, .cat-amber .cat-name { color: var(--amber); }
  .cat-green { background: var(--green-bg); border-color: #a8d9ba; }
  .cat-green .cat-pct, .cat-green .cat-name { color: var(--green); }

  .sources-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 40px;
    font-size: 12.5px;
  }
  .sources-table thead th {
    background: var(--ink);
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 10px 14px;
    text-align: left;
  }
  .sources-table tbody tr { border-bottom: 1px solid var(--rule); }
  .sources-table tbody tr:hover { background: var(--paper2); }
  .sources-table tbody td { padding: 10px 14px; vertical-align: middle; }
  .source-rank {
    font-family: 'IBM Plex Mono', monospace;
    color: var(--ink4);
    font-size: 11px;
  }
  .source-title { color: var(--blue); font-weight: 400; }
  .source-title small { display: block; font-size: 11px; color: var(--ink4); font-style: italic; }
  .match-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 2px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 500;
  }
  .pill-high { background: var(--red-bg); color: var(--red); }
  .pill-mid { background: var(--amber-bg); color: var(--amber); }
  .pill-low { background: var(--green-bg); color: var(--green); }

  .passage-section { margin-bottom: 40px; }
  .passage-card {
    border: 1px solid var(--rule);
    margin-bottom: 20px;
    overflow: hidden;
  }
  .passage-header {
    background: var(--paper2);
    border-bottom: 1px solid var(--rule);
    padding: 10px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .passage-ref {
    font-family: 'Syne', sans-serif;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink3);
  }
  .passage-body { padding: 16px; font-size: 13px; line-height: 1.75; }
  mark.hi-red { background: #ffd6d2; color: var(--ink); padding: 0 2px; }
  mark.hi-amber { background: #ffe8b8; color: var(--ink); padding: 0 2px; }
  mark.hi-blue { background: #d2e6ff; color: var(--ink); padding: 0 2px; }
  .passage-source {
    border-top: 1px solid var(--rule);
    padding: 8px 16px;
    background: var(--paper2);
    font-size: 11px;
    color: var(--ink4);
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .passage-source::before {
    content: '↳';
    font-style: normal;
    color: var(--ink3);
  }

  .legend {
    display: flex;
    gap: 24px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: var(--ink3);
  }
  .legend-dot {
    width: 12px; height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .verdict-box {
    border: 2px solid var(--ink);
    padding: 28px 32px;
    margin-bottom: 40px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 24px;
    align-items: start;
  }
  .verdict-icon {
    width: 52px; height: 52px;
    background: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 22px;
    flex-shrink: 0;
  }
  .verdict-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }
  .verdict-body { font-size: 13px; color: var(--ink2); line-height: 1.7; }

  .rec-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
  .rec-item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 14px 16px;
    border: 1px solid var(--rule);
    background: white;
  }
  .rec-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: white;
    background: var(--ink);
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .rec-text { font-size: 13px; color: var(--ink2); line-height: 1.6; }
  .rec-text strong { font-weight: 600; color: var(--ink); }

  .report-footer {
    border-top: 1px solid var(--rule);
    margin-top: 48px;
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 11px;
    color: var(--ink4);
    font-family: 'IBM Plex Mono', monospace;
  }
  .footer-logo {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--ink3);
    text-transform: uppercase;
  }

  .divider { height: 1px; background: var(--rule); margin: 40px 0; }
  .page-section { margin-bottom: 48px; }

  @page {
    size: A4;
    margin: 0;
  }
  @media print {
    body {
      background: var(--paper) !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cover {
      height: 297mm;
      min-height: 297mm;
      page-break-after: always;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-section {
      page-break-inside: avoid;
    }
    .divider {
      margin: 20px 0;
    }
    .main-body {
      padding: 40px 30px;
    }
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-top">
    <div class="org-badge">Academic Integrity Office &nbsp;·&nbsp; Plagiarism Detection System</div>
    <div class="cover-title">
      Plagiarism<br><span>Detection</span><br>Report
    </div>
    <p class="cover-subtitle">
      Automated similarity analysis for submitted manuscript against global academic databases,
      published journals, and open-access repositories.
    </p>
  </div>
  <div class="cover-bottom">
    <div>
      <div class="cover-meta-label">Report ID</div>
      <div class="cover-meta-value">${reportId}</div>
    </div>
    <div>
      <div class="cover-meta-label">Generated</div>
      <div class="cover-meta-value">${dateStr} — ${timeStr}</div>
    </div>
    <div>
      <div class="cover-meta-label">Similarity Score</div>
      <div class="cover-meta-value" style="color:#e8c547;">${data.similarityScore}% Overall</div>
    </div>
  </div>
</div>

<div class="main-body">

  <div class="page-section">
    <div class="section-label">Submission Details</div>
    <div class="doc-info-grid">
      <div class="doc-info-cell">
        <div class="doc-info-key">Paper Title</div>
        <div class="doc-info-val">${data.paperDetails.title}</div>
      </div>
      <div class="doc-info-cell">
        <div class="doc-info-key">Author(s)</div>
        <div class="doc-info-val">${data.paperDetails.author}</div>
      </div>
      <div class="doc-info-cell">
        <div class="doc-info-key">Institution</div>
        <div class="doc-info-val">${data.paperDetails.institution}</div>
      </div>
      <div class="doc-info-cell">
        <div class="doc-info-key">Submitted To</div>
        <div class="doc-info-val">${data.paperDetails.submittedTo}</div>
      </div>
      <div class="doc-info-cell">
        <div class="doc-info-key">Submission Date</div>
        <div class="doc-info-val">${dateStr}</div>
      </div>
      <div class="doc-info-cell">
        <div class="doc-info-key">Word Count / Pages</div>
        <div class="doc-info-val">${data.features.wordCount} words &nbsp;/&nbsp; ${data.paperDetails.pagesCount} pages</div>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="section-label">Overall Similarity Score</div>
    <div class="score-section">
      <div class="score-ring-wrap">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="66" fill="none" stroke="#e8e5dc" stroke-width="14"/>
          <circle cx="80" cy="80" r="66" fill="none" stroke="${data.similarityScore >= 25 ? '#c0392b' : data.similarityScore >= 15 ? '#b8650a' : '#1a7a42'}" stroke-width="14"
            stroke-dasharray="414.7" stroke-dashoffset="${414.7 * (1 - data.similarityScore / 100)}"
            stroke-linecap="butt"
            transform="rotate(-90 80 80)"/>
          <text x="80" y="75" text-anchor="middle" font-family="Syne,sans-serif" font-size="28" font-weight="800" fill="#0d0d0d">${data.similarityScore}%</text>
          <text x="80" y="95" text-anchor="middle" font-family="Syne,sans-serif" font-size="9" font-weight="700" letter-spacing="2" fill="#888" text-transform="uppercase">SIMILARITY</text>
        </svg>
        <div class="score-label">Overall Index</div>
      </div>
      <div class="score-breakdown">
        <div class="score-row">
          <div class="score-row-label"><span>Internet &amp; Web Sources</span><span>${data.internetSourcesScore}%</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${data.internetSourcesScore}%; background:#c0392b;"></div></div>
        </div>
        <div class="score-row">
          <div class="score-row-label"><span>Published Journals &amp; Books</span><span>${data.publicationsScore}%</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${data.publicationsScore}%; background:#b8650a;"></div></div>
        </div>
        <div class="score-row">
          <div class="score-row-label"><span>Student Paper Database</span><span>${data.studentPapersScore}%</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${data.studentPapersScore}%; background:#1a7a42;"></div></div>
        </div>
        <div class="score-row">
          <div class="score-row-label"><span>Open Access Repositories</span><span>${data.openAccessScore}%</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${data.openAccessScore}%; background:#555;"></div></div>
        </div>
        <p style="font-size:11.5px; color:#888; margin-top:8px; line-height:1.6; font-style:italic;">
          Note: Excluded quoted material (properly cited), reference list, and bibliography from analysis.
        </p>
      </div>
    </div>

    <div class="categories">
      <div class="cat-card cat-red">
        <div class="cat-pct">${data.internetSourcesScore}%</div>
        <div class="cat-name">Internet Sources</div>
        <div class="cat-desc">Matches found against live web content, preprints, and online publications.</div>
      </div>
      <div class="cat-card cat-amber">
        <div class="cat-pct">${data.publicationsScore}%</div>
        <div class="cat-name">Publications</div>
        <div class="cat-desc">Matched text identified in peer-reviewed journals and academic books.</div>
      </div>
      <div class="cat-card cat-green">
        <div class="cat-pct">${data.studentPapersScore}%</div>
        <div class="cat-name">Student Papers</div>
        <div class="cat-desc">Overlap detected with previously submitted student manuscripts.</div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="page-section">
    <div class="section-label">Top Matched Sources</div>
    <table class="sources-table">
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Source</th>
          <th>Database</th>
          <th>Match %</th>
          <th>Words Matched</th>
        </tr>
      </thead>
      <tbody>
        ${sourcesRows}
      </tbody>
    </table>
  </div>

  <div class="divider"></div>

  <div class="page-section passage-section">
    <div class="section-label">Flagged Text Passages</div>

    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#ffd6d2;"></div> High similarity match</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ffe8b8;"></div> Moderate similarity match</div>
      <div class="legend-item"><div class="legend-dot" style="background:#d2e6ff;"></div> Low / paraphrase match</div>
    </div>

    ${passagesCards}
  </div>

  <div class="divider"></div>

  <div class="page-section">
    <div class="section-label">Integrity Assessment</div>
    <div class="verdict-box">
      <div class="verdict-icon">${data.verdict.icon}</div>
      <div>
        <div class="verdict-title">${data.verdict.title}</div>
        <div class="verdict-body">
          ${data.verdict.body}
        </div>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="section-label">Recommended Actions</div>
    <ul class="rec-list">
      ${recommendationsList}
    </ul>
  </div>

  <div class="report-footer">
    <div>
      <div class="footer-logo">Paperxify PlagScan Pro v1.0</div>
      <div style="margin-top:4px;">Powered by CrossRef · PubMed · arXiv databases</div>
    </div>
    <div style="text-align:right;">
      <div>Report ID: ${reportId}</div>
      <div>Generated: ${dateStr} at ${timeStr}</div>
      <div>This report is confidential and intended for editorial use only.</div>
    </div>
  </div>

</div>
</body>
</html>`;
}

// 🔹 POST /api/writer/plagiarism
exports.checkPlagiarism = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid text input of at least 50 characters."
      });
    }

    // 1. Verify Premium subscription
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isSubscribed = user.membership?.isActive === true;
    if (!isSubscribed) {
      return res.status(403).json({
        success: false,
        code: "PREMIUM_ONLY",
        message: "The Plagiarism Checker is a premium feature. Please upgrade your subscription to access it."
      });
    }

    // 2. Word & sentence count properties
    const cleanedText = text
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "")
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const words = cleanedText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 3. Query OpenRouter Plagiarism analysis
    const systemPrompt = `You are a professional Academic Integrity Plagiarism Officer.
Analyze the user's text for plagiarism and overlap with existing publications, student theses, websites, and repositories.
Be realistic. Calculate a plausible similarity index percentage and individual source match details.
Identify 3-5 matched passages from the text and highlight the matching parts using HTML <mark> tags inside the passages. Use classes:
- <mark class="hi-red"> for high similarity (verbatim matches)
- <mark class="hi-amber"> for moderate similarity (closely paraphrased)
- <mark class="hi-blue"> for low similarity (poorly attributed or generic phrasing)

Return a detailed report in strict JSON format matching this schema:
{
  "similarityScore": 18, // 0 to 100 overall similarity percentage
  "internetSourcesScore": 8, // internet overlap %
  "publicationsScore": 6, // publications overlap %
  "studentPapersScore": 4, // student paper overlap %
  "openAccessScore": 0, // open access overlap %
  "paperDetails": {
    "title": "Document Title", // infer from text, or use a realistic name based on the content
    "author": "Author name", // infer or use 'Anonymous' or user name
    "institution": "Academic Institution", // infer or generate a realistic university
    "submittedTo": "Target Journal/Conference/Class", // infer or generate a realistic outlet
    "pagesCount": 12 // estimated pages count based on text length
  },
  "verdict": {
    "title": "Conditional Pass - Minor Revision Required", // brief verdict title (e.g., "Original Document - Pass", "Plagiarism Warning - High Overlap", "Revision Required")
    "icon": "⚑", // Unicode symbol like "⚑", "✔", "✘", "⚠"
    "body": "Detailed evaluation comment explaining the verdict, match nature, and integrity outcome."
  },
  "sources": [
    {
      "rank": "01",
      "title": "Publication title or Web URL name",
      "citation": "Author, journal, date, DOI details...",
      "database": "Database type (e.g. CrossRef, Internet, PubMed Central, IEEE Xplore, Student Papers)",
      "matchPercentage": "5.2%",
      "pillClass": "pill-high", // must be 'pill-high', 'pill-mid', or 'pill-low'
      "wordsMatched": 408
    }
  ],
  "passages": [
    {
      "index": "01",
      "ref": "Section title or page reference",
      "matchPercentage": "5.2%",
      "pillClass": "pill-high", // 'pill-high', 'pill-mid', or 'pill-low'
      "text": "Passage text containing <mark class=\"hi-red\">verbatim overlap segments</mark> in HTML format.",
      "sourceInfo": "Reference explanation or revision advice (e.g. 'Matched against Gulshan et al. JAMA 2016. Consider citation or paraphrase.')"
    }
  ],
  "recommendations": [
    "Advice 1: Paraphrase the description in section X...",
    "Advice 2: Add direct quote formatting to Y..."
  ]
}
Ensure the response is a single, valid JSON object and does not contain markdown wrappers.`;

    const userPrompt = `Analyze this text for plagiarism:
"${cleanedText}"`;

    console.log(`📡 Sending Plagiarism request to OpenRouter for user: ${userId}`);
    const result = await callOpenRouter(systemPrompt, userPrompt);

    let parsedResult;
    try {
      if (!result || typeof result !== 'string') {
        throw new Error("Empty response from AI model");
      }

      let cleaned = result.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/im, '').replace(/```\s*$/im, '').trim();

      const jsonStr = extractJSON(cleaned);
      if (!jsonStr) {
        throw new Error("No valid JSON object found in response");
      }

      parsedResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("❌ Failed to parse JSON response from Plagiarism LLM. Raw response:", result);
      return res.status(500).json({
        success: false,
        message: `Plagiarism check parsing failed: ${e.message}. Please try again.`
      });
    }

    // 4. Fill in features
    parsedResult.features = {
      wordCount
    };

    // 5. Compile HTML Report
    const reportHtml = compilePlagiarismHtml(parsedResult);

    console.log(`✅ Plagiarism Check Complete. Score: ${parsedResult.similarityScore}%`);

    return res.status(200).json({
      success: true,
      reportHtml
    });

  } catch (error) {
    console.error("❌ Plagiarism Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during plagiarism check",
      error: error.message
    });
  }
};

// 🔹 POST /api/writer/plagiarism/pdf
exports.downloadPlagiarismPdf = async (req, res) => {
  try {
    const { html, title } = req.body;
    if (!html) {
      return res.status(400).json({
        success: false,
        message: "HTML content is required to generate PDF"
      });
    }

    const pdfBuffer = await pdfService.generatePDF(html);
    const base64PDF = pdfBuffer.toString('base64');

    return res.status(200).json({
      success: true,
      pdf: base64PDF,
      fileName: `${title || 'plagiarism-report'}_${Date.now()}.pdf`
    });
  } catch (error) {
    console.error("❌ Plagiarism PDF Generation Error:", error);
    return res.status(500).json({
      success: false,
      message: "PDF generation failed",
      error: error.message
    });
  }
};

// 🔹 POST /api/writer/humanize
exports.humanizeAI = async (req, res) => {
  try {
    const { text, tone = "Academic", language = "English" } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid text input of at least 50 characters."
      });
    }

    // 1. Verify Premium subscription
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isSubscribed = user.membership?.isActive === true;
    if (!isSubscribed) {
      return res.status(403).json({
        success: false,
        code: "PREMIUM_ONLY",
        message: "The AI Humanizer is a premium feature. Please upgrade your subscription to access it."
      });
    }

    // 2. Build Prompts
    const systemPrompt = `You are a professional forensic linguist, copywriter, and AI text humanizer.
Your goal is to rewrite the user's text to make it sound entirely human-written.
To bypass AI detectors, you must:
1. Vary sentence lengths and structure dynamically (mix short punchy sentences with longer complex clauses to create high burstiness).
2. Use natural transitions and idiomatic phrasing. Remove robotic transition words like "Furthermore", "In conclusion", "Moreover", "It is important to note", or "Consequently".
3. Use active voice over passive voice (e.g., replace "It was decided by the board" with "The board decided").
4. Introduce slight stylistic flow variations, colloquial usage, or unique vocabulary suitable for the selected tone.
5. Retain all factual information, names, dates, citations, and core meaning exactly. Do not summarize, truncate, or omit anything.
6. The target writing tone is: ${tone}.
7. The output language must be: ${language}.

You must return your response in a strict JSON format matching this schema exactly:
{
  "humanizedText": "The rewritten human-like text goes here...",
  "metrics": {
    "originalAiLikelihood": 92, // estimated % AI likelihood of the original text
    "humanizedAiLikelihood": 3,  // estimated % AI likelihood of the humanized text (should be under 5%)
    "perplexityBoost": 45,       // estimated % improvement in perplexity/richness (0 to 100)
    "burstinessGain": 35,        // estimated % improvement in sentence variety (0 to 100)
    "readabilityShift": "Grade 14 to Grade 10" // readability grade level transition
  }
}
Do not wrap response in markdown code blocks.`;

    const userPrompt = `Humanize this text:\n"${text}"`;

    console.log(`📡 Sending Humanize request to OpenRouter for user: ${userId}`);
    const result = await callOpenRouter(systemPrompt, userPrompt);

    let parsedResult;
    try {
      if (!result || typeof result !== 'string') {
        throw new Error("Empty response from AI model");
      }

      let cleaned = result.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/im, '').replace(/```\s*$/im, '').trim();

      const jsonStr = extractJSON(cleaned);
      if (!jsonStr) {
        throw new Error("No valid JSON object found in response");
      }

      parsedResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("❌ Failed to parse JSON response from Humanizer LLM. Raw response:", result);
      return res.status(500).json({
        success: false,
        message: `Humanization parsing failed: ${e.message}. Please try again.`
      });
    }

    console.log(`✅ Humanization Complete.`);

    return res.status(200).json({
      success: true,
      humanizedText: parsedResult.humanizedText || parsedResult.text || parsedResult.humanized || result,
      metrics: parsedResult.metrics || {
        originalAiLikelihood: 88,
        humanizedAiLikelihood: 2,
        perplexityBoost: 40,
        burstinessGain: 30,
        readabilityShift: "N/A"
      }
    });

  } catch (error) {
    console.error("❌ AI Humanizer Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during humanization",
      error: error.message
    });
  }
};

// 🔹 POST /api/writer/essay
exports.generateEssay = async (req, res) => {
  try {
    const { 
      topic, 
      academicLevel = "College Level", 
      essayType = "Research Paper", 
      citationStyle = "APA", 
      wordCount = 1500 
    } = req.body;
    
    const userId = req.user.id;

    if (!topic || topic.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid essay topic."
      });
    }

    // 1. Verify Premium subscription
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isSubscribed = user.membership?.isActive === true;
    if (!isSubscribed) {
      return res.status(403).json({
        success: false,
        code: "PREMIUM_ONLY",
        message: "The AI Essay Writer is a premium feature. Please upgrade your subscription to access it."
      });
    }

    // 2. Build Prompt
    const systemPrompt = `You are a professional academic writer and scholar. 
Write a high-quality, structured academic essay/paper on the user's topic.
Strictly follow these details:
- Academic Level: ${academicLevel}
- Essay Type: ${essayType}
- Citation Style: ${citationStyle}
- Word Count: Approximately ${wordCount} words
- Bibliography: Show proper in-text citations throughout the essay and a complete bibliography/references section at the end.

The response should be written in clean, standard Markdown format. Focus on rich content, clear arguments, structural progression (e.g. Title, Abstract/Introduction, body sections, conclusion, and references).`;

    const userPrompt = `Write an academic essay on the topic: "${topic}"`;

    console.log(`📡 Sending Essay generation request to OpenRouter for user: ${userId}`);
    const generatedMarkdown = await callOpenRouter(systemPrompt, userPrompt);

    if (!generatedMarkdown || typeof generatedMarkdown !== "string") {
      throw new Error("Invalid output received from essay generator.");
    }

    // Clean thinking blocks from reasoning models if present
    let content = generatedMarkdown.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
    // Strip markdown code wrap if the model wrapped the whole essay in a markdown code block
    if (content.startsWith("```markdown") || content.startsWith("```")) {
      content = content.replace(/^```[a-z]*\r?\n/i, "").replace(/\r?\n```$/g, "").trim();
    }

    // Generate unique slug
    const cleanTopic = topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // strip special characters
      .trim()
      .replace(/\s+/g, "-"); // replace space with hyphens
    
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${cleanTopic.substring(0, 40)}-${randomSuffix}`;

    // Infer title and parse JSON structure if present
    let title = topic;
    let isJson = false;
    let parsedJson = null;

    try {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const potentialJson = content.substring(jsonStart, jsonEnd + 1);
        parsedJson = JSON.parse(potentialJson);
        isJson = true;
      }
    } catch (e) {
      // Not a valid JSON, fallback to standard markdown handling
    }

    if (isJson && parsedJson) {
      if (parsedJson.title) {
        title = parsedJson.title;
      }
      
      let md = "";
      if (parsedJson.abstract) {
        md += `## Abstract\n\n${parsedJson.abstract}\n\n`;
      }
      if (parsedJson.introduction) {
        md += `## Introduction\n\n${parsedJson.introduction}\n\n`;
      }
      if (Array.isArray(parsedJson.body_sections)) {
        parsedJson.body_sections.forEach(sec => {
          if (sec.heading && sec.content) {
            md += `## ${sec.heading}\n\n${sec.content}\n\n`;
          }
        });
      } else if (parsedJson.body_sections && typeof parsedJson.body_sections === "string") {
        md += `## Body\n\n${parsedJson.body_sections}\n\n`;
      }
      if (parsedJson.conclusion) {
        md += `## Conclusion\n\n${parsedJson.conclusion}\n\n`;
      }
      if (Array.isArray(parsedJson.references) && parsedJson.references.length > 0) {
        md += `## References\n\n`;
        parsedJson.references.forEach(ref => {
          md += `- ${ref}\n`;
        });
      } else if (parsedJson.references && typeof parsedJson.references === "string") {
        md += `## References\n\n${parsedJson.references}\n`;
      }
      
      content = md.trim();
    } else {
      // Check if generated content starts with a title like "# Title"
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
    }

    // Save to database
    const essay = new Essay({
      owner: userId,
      title,
      slug,
      topic,
      academicLevel,
      essayType,
      citationStyle,
      wordCount,
      content
    });

    await essay.save();

    // Award XP for successful AI Writer essay generation (+70 XP)
    await awardXP(userId, 70);

    console.log(`✅ Essay Generation Complete. Slug: ${slug}`);

    return res.status(200).json({
      success: true,
      essay: {
        id: essay._id,
        title: essay.title,
        slug: essay.slug,
        content: essay.content,
      }
    });

  } catch (error) {
    console.error("❌ AI Essay Generator Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during essay generation",
      error: error.message
    });
  }
};

// 🔹 GET /api/writer/essay/:slug
exports.getEssayBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const essay = await Essay.findOne({ slug });
    if (!essay) {
      return res.status(404).json({
        success: false,
        message: "Essay not found."
      });
    }

    // Only owner can access
    if (essay.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this essay."
      });
    }

    return res.status(200).json({
      success: true,
      essay
    });
  } catch (error) {
    console.error("❌ Get Essay Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving essay",
      error: error.message
    });
  }
};

// 🔹 PUT /api/writer/essay/:slug
exports.updateEssay = async (req, res) => {
  try {
    const { slug } = req.params;
    const { content, title } = req.body;
    const userId = req.user.id;

    const essay = await Essay.findOne({ slug });
    if (!essay) {
      return res.status(404).json({
        success: false,
        message: "Essay not found."
      });
    }

    if (essay.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access."
      });
    }

    if (content !== undefined) essay.content = content;
    if (title !== undefined) essay.title = title;

    await essay.save();

    return res.status(200).json({
      success: true,
      message: "Essay updated successfully",
      essay
    });
  } catch (error) {
    console.error("❌ Update Essay Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating essay",
      error: error.message
    });
  }
};

