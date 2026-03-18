// controllers/premiumNoteController.js
const User = require('../models/User');
const Note = require('../models/Note');
const crypto = require('crypto');
const { getTranscript } = require('../youtube-transcript');
const { generateStudyImages } = require('../services/imageGenerationService');

const PREMIUM_MODELS = ['parikshasarthi', 'vyavastha'];
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Plan-based video duration limits (in seconds)
const PLAN_VIDEO_LIMITS = {
  scholar: 6 * 60 * 60,    // 6 hours for Scholar plan
  pro: 12 * 60 * 60,       // 12 hours for Pro Scholar plan
  power: Infinity           // Unlimited for Power Scholar plan
};

// Plan-based model restrictions
// Scholar plan cannot use Vyavastha model
const PLAN_MODEL_RESTRICTIONS = {
  scholar: ['parikshasarthi'],  // Scholar can only use parikshasarthi
  pro: ['parikshasarthi', 'vyavastha'],     // Pro can use all premium models
  power: ['parikshasarthi', 'vyavastha']    // Power can use all premium models
};

// Helper to get max video duration for a user's plan
function getMaxVideoDuration(user) {
  const planId = user.membership?.planId || 'scholar';
  return PLAN_VIDEO_LIMITS[planId] || PLAN_VIDEO_LIMITS.scholar;
}

// Token limits
const MAX_INPUT_TOKENS = 500000; // 500k tokens for transcript
const MAX_OUTPUT_TOKENS = 15000;  // 15k tokens for generated content

// Premium model features
const PREMIUM_FEATURES = {
  parikshasarthi: { 
    maxLength: '2 hours', 
    features: ['exam_focused', 'qna_format', 'high_yield_summary'],
    description: 'Exam-focused notes with structured Q&A format'
  },
  vyavastha: { 
    maxLength: '4 hours', 
    features: ['structured_output', 'comprehensive_coverage', 'table_of_contents'],
    description: 'Structured notes with comprehensive coverage'
  }
};

// Map frontend detail levels to backend enum values
const mapDetailLevel = (level) => {
  const mapping = {
    'Standard': 'Standard Notes',
    'Brief': 'Brief Summary',
    'Comprehensive': 'Comprehensive',
    'Bullet Points': 'Bullet Points Only'
  };
  return mapping[level] || level;
};

// OpenRouter API call with retry logic
async function openRouterChatCompletion(messages, options = {}) {
  const {
    temperature = 0.7,
    max_tokens = MAX_OUTPUT_TOKENS,
    top_p = 1,
    timeout = 120000 // 2 minute timeout
  } = options;

  const model = "x-ai/grok-4.1-fast";
  let lastError = null;
  let retries = 3;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 OpenRouter attempt ${attempt}/${retries} with model: ${model}`);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`OpenRouter request timeout after ${timeout}ms`)), timeout);
      });

      // Create fetch promise
      const fetchPromise = fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://paperxify.com",
          "X-Title": "Paperxify"
        },
        body: JSON.stringify({ 
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens,
          top_p: top_p,
          stream: false,
          reasoning: { enabled: false }
        })
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle rate limiting with retry
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after') || 5;
          console.log(`⏳ Rate limited. Waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ OpenRouter success with: ${model}`);
      
      return {
        success: true,
        model: model,
        content: data.choices[0].message.content,
        usage: data.usage,
        fullResponse: data
      };
      
    } catch (error) {
      console.log(`❌ OpenRouter attempt ${attempt} failed: ${error.message}`);
      lastError = error;
      
      // Exponential backoff before retry
      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // If all attempts failed
  return {
    success: false,
    error: `All OpenRouter attempts failed. Last error: ${lastError?.message}`,
    attempts: retries
  };
}

const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.get('v')) {
      return urlObj.searchParams.get('v');
    }
    
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/live/')) {
      const pathParts = urlObj.pathname.split('/');
      const liveIndex = pathParts.indexOf('live');
      if (liveIndex !== -1 && pathParts.length > liveIndex + 1) {
        return pathParts[liveIndex + 1];
      }
    }
    
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
    
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
};

// Function to get YouTube video duration using YouTube Data API
async function getYouTubeVideoDuration(videoId) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('YouTube API key not found, skipping duration check');
      return null;
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const duration = data.items[0].contentDetails.duration;
    return parseYouTubeDuration(duration);
  } catch (error) {
    console.error('Error fetching video duration:', error);
    return null;
  }
}

// Parse YouTube duration format (PT1H30M15S) to seconds
function parseYouTubeDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

// Format seconds to hours and minutes
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

// Extract relevant figure/topic names from the transcript using AI
// These names are passed to the AI image generator as prompts
async function generateImgGEnAI(transcript, language = 'English') {
  if (!transcript) {
    throw new Error("Transcript is required for image generation!");
  }

  const languageInstruction = language !== 'English' ?
    `Generate figure names in ${language} language.` :
    'Generate figure names in English.';

  const prompt = `For the following transcript, generate figure/topic names suitable for educational image generation in a strict JSON array format.
- Minimum 1 and Maximum 6 items.
- Each item should be a short, descriptive noun phrase (3-6 words max) that can be used as an AI image generation prompt.
- Focus on concrete visual concepts: diagrams, scientific processes, anatomical structures, historical events, mathematical concepts, engineering systems, etc.
- Do not add any extra text, explanation, or formatting.
- ${languageInstruction}
- If the transcript is NOT about educational, technical, or book-related content, return "none".
- If no clear visual concept exists, return "none".

Transcript:
${transcript}
`;

  try {
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that identifies key visual concepts from educational transcripts for AI image generation. Return only a JSON array of short descriptive phrases, or 'none'."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const response = await openRouterChatCompletion(messages, {
      temperature: 0.3,
      max_tokens: 2000 // Increased to prevent truncation
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    const resultText = response.content.trim();

    if (!resultText || resultText.toLowerCase().includes("none")) {
      return null;
    }

    let figures;
    try {
      // Try direct parse
      figures = JSON.parse(resultText);
    } catch (e) {
      // Robust JSON extraction using regex
      const arrayMatch = resultText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          figures = JSON.parse(arrayMatch[0]);
        } catch (e2) {
          // One last attempt: clean common markdown garbage
          const cleaned = arrayMatch[0].replace(/```json|```/g, "").trim();
          try {
            figures = JSON.parse(cleaned);
          } catch (e3) {
            console.error("Final Premium JSON parse attempt failed:", e3.message);
            return null;
          }
        }
      } else {
        return null;
      }
    }

    console.log("Generated Figure Topics:", figures);
    return figures;
  } catch (err) {
    console.error("Error generating figure topics:", err);
    return null; // Fail gracefully - image generation is non-critical
  }
}

// Premium Model-specific prompt templates
const getPremiumModelPrompt = (model, transcript, userPrompt, images_json, videoUrl, settings = {}) => {
  const { language = 'English', detailLevel = 'Standard Notes' } = settings;

  const languageInstruction = language !== 'English'
    ? `IMPORTANT: Write ALL content — headings, explanations, bullets, labels, questions — entirely in ${language}. Do not mix languages.`
    : 'Write all content in precise, academic English.';

  const userInstructions = userPrompt
    ? `\nThe user provided these extra instructions — follow them precisely: "${userPrompt}"`
    : '';

  const detailConfig = {
    'Brief Summary': 'Cover only the most critical concepts. Be concise — maximum impact, minimum words.',
    'Standard Notes': 'Cover all major concepts with proper explanations, examples, and context.',
    'Comprehensive': 'Cover everything exhaustively. Leave no concept unexplained. Include edge cases, nuances, worked examples, and cross-concept links.',
    'Bullet Points Only': 'Use bullet/numbered lists throughout. No prose paragraphs. Use nested lists for sub-points.'
  };
  const depthInstruction = detailConfig[detailLevel] || detailConfig['Standard Notes'];

  // ─── SHARED CORE INTELLIGENCE LAYER ──────────────────────────────────────
  // The AI must THINK before it writes — understand the content, THEN synthesize it.
  const coreIntelligence = `
**YOUR ROLE: Expert Academic Content Synthesizer**

You have been given a raw video transcript. You must NOT transcribe, copy, or directly paraphrase it.
Instead, follow this 3-step cognitive process:

═══ STEP 1 — DEEP UNDERSTANDING ═══
Read the entire transcript and extract:
  ① Subject domain (e.g., Data Structures, Organic Chemistry, World History, Economics...)
  ② Central topic / problem / skill being taught
  ③ Every key concept, term, theorem, formula, process, or principle mentioned
  ④ The pedagogical logic — how does the instructor build from simple to complex?
  ⑤ All examples, analogies, case studies, and real-world applications used
  ⑥ Common mistakes, misconceptions, or "gotchas" mentioned or implied

═══ STEP 2 — KNOWLEDGE SYNTHESIS ═══
Using your extracted understanding, construct study material that:
  • Is completely original — your own expert words, not the instructor's
  • Teaches the concepts from first principles
  • Explains the "why" and "how", not just the "what"
  • Includes your own examples if the transcript's examples are weak
  • Organizes knowledge logically, not in transcription order
  • ${depthInstruction}

═══ STEP 3 — PREMIUM PRESENTATION ═══
Format the synthesized knowledge as a stunning, print-ready HTML document.

**NON-NEGOTIABLE RULES:**
✗ NEVER copy raw sentences from the transcript
✗ NEVER write "the speaker mentions" / "in this video" / "the instructor explains"
✗ NEVER produce thin or shallow content — this is PREMIUM tier
✗ NEVER use <style> blocks, <html>, <head>, or <body> tags
✗ NEVER use markdown syntax (**, ##, etc.) — use proper HTML tags only
✓ ALWAYS use inline style="..." on every single HTML element
✓ ALWAYS write as if you are the world's best textbook author on this subject
✓ ALWAYS produce rich, dense, high-value study content
`;

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 PARIKSHA-SARTHI — High-Intensity Exam Preparation Engine
  // ═══════════════════════════════════════════════════════════════════════════
  if (model === 'parikshasarthi') {
    return `
${coreIntelligence}

**${languageInstruction}**${userInstructions}

**DESIGN SYSTEM — PARIKSHA-SARTHI (Exam Powerhouse):**
Font: "Segoe UI, Roboto, sans-serif" | Line-height: 1.7
Theme: Deep Purple (#7c3aed) primary | Orange (#ea580c) for critical alerts | Emerald (#059669) for correct/positive
Background: #faf5ff (light purple tint)

**MANDATORY DOCUMENT STRUCTURE:**

━━━ SECTION 1: EXAM HEADER ━━━
<div style="background:linear-gradient(135deg,#4c1d95,#7c3aed);border-radius:14px;padding:28px 32px;margin-bottom:24px;color:#fff">
  <div style="font-size:11px;letter-spacing:2px;font-weight:700;opacity:0.7;text-transform:uppercase;margin-bottom:8px">EXAM PREPARATION GUIDE • [SUBJECT]</div>
  <h1 style="font-size:28px;font-weight:900;margin:0 0 8px;line-height:1.2">[TOPIC TITLE]</h1>
  <p style="opacity:0.8;font-size:13px;margin:0">Source: <a href="${videoUrl}" style="color:#c4b5fd;text-decoration:none">Video Reference ↗</a></p>
</div>

━━━ SECTION 2: EXAM READINESS CHECKLIST ━━━
<div style="background:#fff;border:2px solid #ede9fe;border-radius:12px;padding:20px 24px;margin-bottom:22px">
  <h3 style="color:#6d28d9;font-size:15px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px">📋 What You Must Know for the Exam</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    <div style="background:#f5f3ff;border-radius:8px;padding:10px 14px;font-size:13px;color:#5b21b6;font-weight:500">☐ [Core concept 1]</div>
    ... (6-10 items, 2-column grid)
  </div>
</div>

━━━ SECTION 3: CONCEPT BREAKDOWN (one card per major concept) ━━━
<div style="background:#fff;border:1px solid #ede9fe;border-radius:12px;padding:22px 26px;margin-bottom:18px;box-shadow:0 2px 10px rgba(124,58,237,0.07)">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
    <span style="background:#7c3aed;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px">CONCEPT</span>
    <h2 style="font-size:18px;font-weight:700;color:#1e1b4b;margin:0">[Concept Name]</h2>
  </div>
  <p style="color:#374151;font-size:14px;line-height:1.75;margin:0 0 14px">[Clear expert explanation of the concept — written as a textbook author]</p>

  <!-- Critical Alert box — use for exam-critical points -->
  <div style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0">
    <b style="color:#9a3412;font-size:13px">🚨 EXAM TRAP / COMMON MISTAKE:</b>
    <p style="color:#374151;font-size:13px;margin:6px 0 0">[What students commonly get wrong about this concept and how to avoid it]</p>
  </div>

  <!-- Memory Tip -->
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;margin:12px 0">
    <b style="color:#14532d;font-size:13px">🧠 Memory Trick:</b>
    <span style="color:#374151;font-size:13px"> [Mnemonic, analogy, or memory hook]</span>
  </div>

  <!-- Formula/Rule box if applicable -->
  <div style="background:#1e1b4b;color:#e0e7ff;border-radius:8px;padding:12px 18px;margin:12px 0;font-family:monospace;font-size:14px">
    [Formula / Definition / Rule — use for maths, science, law, etc.]
  </div>

  <!-- Timestamp -->
  <a href="${videoUrl}&t=0s" style="display:inline-block;background:#f5f3ff;color:#7c3aed;padding:4px 12px;border-radius:20px;text-decoration:none;font-size:11px;font-weight:600;margin-top:10px">⏱️ Review in video</a>
</div>

━━━ SECTION 4: Q&A FLASHCARD BANK ━━━
<h2 style="font-size:20px;font-weight:800;color:#1e1b4b;margin:28px 0 16px">🃏 Exam Question Bank</h2>
<p style="color:#6b7280;font-size:13px;margin:0 0 18px">Cover each answer and attempt to recall before revealing</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">
  <!-- Generate 8-15 Q&A pairs based on the topic -->
  <div style="background:#fff;border:2px solid #ede9fe;border-radius:12px;padding:18px;box-shadow:0 2px 8px rgba(124,58,237,0.06)">
    <div style="font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Q</div>
    <p style="font-weight:600;color:#1e1b4b;font-size:14px;margin:0 0 12px">[Exam-style question that tests deep understanding]</p>
    <div style="border-top:1px dashed #ddd6fe;padding-top:10px">
      <div style="font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">A</div>
      <p style="color:#374151;font-size:13px;line-height:1.65;margin:0">[Precise, exam-ready answer]</p>
    </div>
  </div>
</div>

━━━ SECTION 5: IMAGES ━━━
Embed images from: ${images_json}
Place each image inside a relevant concept card like:
<div style="text-align:center;margin:16px 0">
  <img src="[img_url]" alt="[concept]" style="max-width:100%;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.10)">
  <p style="color:#9ca3af;font-size:12px;font-style:italic;margin:6px 0 0">Visual: [descriptive caption]</p>
</div>

━━━ SECTION 6: HIGH-YIELD SUMMARY ━━━
<div style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);color:#fff;border-radius:14px;padding:26px 30px;margin-top:30px">
  <h3 style="font-size:18px;font-weight:800;margin:0 0 16px">⚡ High-Yield Summary — Must Know for Exam</h3>
  <ul style="margin:0;padding-left:18px">
    <li style="font-size:14px;line-height:1.7;margin-bottom:9px;opacity:0.9">[Most critical point — written as a bullet a student would memorize]</li>
    ... (7-12 bullets — the absolute essentials)
  </ul>
</div>

**NOW SYNTHESIZE THE TRANSCRIPT BELOW INTO THE ABOVE EXAM GUIDE:**
${transcript}
`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏛️ VYAVASTHA — Academic Deep Dive / Comprehensive Textbook
  // ═══════════════════════════════════════════════════════════════════════════
  return `
${coreIntelligence}

**${languageInstruction}**${userInstructions}

**DESIGN SYSTEM — VYAVASTHA (Academic Excellence):**
Font: "Georgia, 'Times New Roman', serif" for headings | "Segoe UI, Arial, sans-serif" for body
Primary: #0f172a | Accent: #0369a1 | Subheading: #1e40af | Success: #14532d | Warning: #92400e
Background: #ffffff | Print-optimized, formal academic aesthetic

**MANDATORY DOCUMENT STRUCTURE:**

━━━ SECTION 1: ACADEMIC TITLE PAGE ━━━
<div style="border-bottom:3px solid #0f172a;padding-bottom:24px;margin-bottom:28px">
  <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin:0 0 8px">[SUBJECT DOMAIN] • ACADEMIC STUDY GUIDE</p>
  <h1 style="font-size:32px;font-weight:900;color:#0f172a;margin:0 0 10px;line-height:1.15;font-family:Georgia,'Times New Roman',serif">[TOPIC TITLE]</h1>
  <p style="color:#64748b;font-size:13px;margin:0">Reference: <a href="${videoUrl}" style="color:#0369a1;text-decoration:none">Source Material ↗</a></p>
</div>

━━━ SECTION 2: ABSTRACT / EXECUTIVE OVERVIEW ━━━
<div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:20px 24px;margin-bottom:28px">
  <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#475569;margin:0 0 10px">Abstract</h3>
  <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0">[2-3 sentence expert summary of what this study guide covers and why it matters — written like a textbook abstract]</p>
</div>

━━━ SECTION 3: TABLE OF CONTENTS ━━━
<div style="border:1px solid #e2e8f0;border-radius:8px;padding:18px 22px;margin-bottom:28px">
  <h3 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 12px">Contents</h3>
  <ol style="margin:0;padding-left:18px;color:#0369a1">
    <li style="font-size:14px;margin-bottom:6px"><a href="#sec1" style="color:#0369a1;text-decoration:none">[Section 1 Name]</a></li>
    ... (one entry per section)
  </ol>
</div>

━━━ SECTION 4: CORE ACADEMIC SECTIONS (one per major topic/concept) ━━━
<!-- Each section gets a proper anchor ID and academic formatting -->
<section id="sec1" style="margin-bottom:36px">
  <h2 style="font-size:22px;font-weight:700;color:#0f172a;font-family:Georgia,'Times New Roman',serif;border-bottom:2px solid #e2e8f0;padding-bottom:10px;margin:0 0 18px">[Section N: Concept Name]</h2>
  
  <!-- Main explanation — 2-4 substantial paragraphs -->
  <p style="color:#1e293b;font-size:15px;line-height:1.85;margin:0 0 14px">[Expert, well-structured explanation of the concept. Be thorough. Think textbook chapter.]</p>
  
  <!-- Definition sidebar style -->
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 18px;margin:14px 0">
    <b style="color:#1e40af;font-size:13px;display:block;margin-bottom:4px">Formal Definition</b>
    <p style="color:#1d4ed8;font-size:14px;line-height:1.7;margin:0;font-style:italic">[Precise, formal definition]</p>
  </div>

  <!-- Image placement if relevant -->
  ${images_json ? `
  <div style="text-align:center;margin:20px 0">
    <img src="[relevant img_url from images_json]" alt="[concept]" style="max-width:90%;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.12)">
    <p style="color:#64748b;font-size:12px;font-style:italic;margin:8px 0 0">Figure [N]. [Descriptive caption explaining what the image shows]</p>
  </div>` : ''}

  <!-- Key points -->
  <ul style="padding-left:22px;margin:14px 0">
    <li style="color:#1e293b;font-size:14px;line-height:1.75;margin-bottom:10px">[Key academic point — written with precision]</li>
  </ul>

  <!-- Example / Case Study box -->
  <div style="background:#fff7ed;border-left:4px solid #d97706;padding:14px 18px;border-radius:0 8px 8px 0;margin:14px 0">
    <b style="color:#92400e;font-size:13px;display:block;margin-bottom:6px">Worked Example / Case Study</b>
    <p style="color:#374151;font-size:14px;line-height:1.75;margin:0">[Step-by-step example showing the concept in action]</p>
  </div>

  <!-- Process Flow / Timeline (use when there's a sequence) -->
  <div style="border-left:3px solid #cbd5e1;padding-left:22px;margin:18px 0">
    <div style="position:relative;margin-bottom:16px;padding-left:10px">
      <span style="position:absolute;left:-27px;top:4px;background:#0f172a;width:11px;height:11px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 2px #94a3b8;display:block"></span>
      <b style="color:#0f172a;font-size:14px">[Step / Phase / Stage]</b>
      <p style="color:#374151;font-size:14px;line-height:1.7;margin:4px 0 0">[Detailed explanation of this step]</p>
    </div>
    ... (repeat for each step in a process)
  </div>
</section>

━━━ SECTION 5: COMPARATIVE ANALYSIS TABLE ━━━
<!-- Use when 2 or more concepts/approaches can be compared -->
<div style="overflow-x:auto;margin-bottom:30px">
  <h2 style="font-size:20px;font-weight:700;color:#0f172a;font-family:Georgia,'Times New Roman',serif;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin:0 0 16px">Comparative Analysis</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead>
      <tr style="background:#0f172a">
        <th style="padding:12px 16px;text-align:left;font-weight:600;color:#f1f5f9;border:1px solid #334155">[Criterion]</th>
        <th style="padding:12px 16px;text-align:left;font-weight:600;color:#f1f5f9;border:1px solid #334155">[Approach A]</th>
        <th style="padding:12px 16px;text-align:left;font-weight:600;color:#f1f5f9;border:1px solid #334155">[Approach B]</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background:#f8fafc">
        <td style="padding:11px 16px;color:#374151;border:1px solid #e2e8f0;font-weight:500">[criterion]</td>
        <td style="padding:11px 16px;color:#374151;border:1px solid #e2e8f0">[value]</td>
        <td style="padding:11px 16px;color:#374151;border:1px solid #e2e8f0">[value]</td>
      </tr>
    </tbody>
  </table>
</div>

━━━ SECTION 6: ACADEMIC GLOSSARY ━━━
<div style="border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin-bottom:28px">
  <h2 style="font-size:20px;font-weight:700;color:#0f172a;font-family:Georgia,'Times New Roman',serif;margin:0 0 16px">Glossary of Terms</h2>
  <dl style="margin:0;columns:2;gap:24px">
    <dt style="font-weight:700;color:#0369a1;font-size:14px;margin:10px 0 3px;break-inside:avoid">[Term]</dt>
    <dd style="color:#374151;font-size:13px;line-height:1.7;margin:0 0 8px;padding-left:14px;border-left:2px solid #bfdbfe;break-inside:avoid">[Precise academic definition with context]</dd>
  </dl>
</div>

━━━ SECTION 7: CONCLUSION & FURTHER STUDY ━━━
<div style="background:#0f172a;color:#f1f5f9;border-radius:12px;padding:26px 30px;margin-top:28px">
  <h2 style="font-size:20px;font-weight:700;font-family:Georgia,'Times New Roman',serif;margin:0 0 14px">Conclusion</h2>
  <p style="font-size:14px;line-height:1.85;opacity:0.9;margin:0 0 18px">[2-3 sentence scholarly conclusion — what has been established, its significance, and how it connects to broader knowledge]</p>
  
  <h3 style="font-size:15px;font-weight:700;margin:0 0 12px;opacity:0.8">Key Takeaways</h3>
  <ul style="margin:0 0 18px;padding-left:18px">
    <li style="font-size:14px;line-height:1.7;margin-bottom:8px;opacity:0.9">[critical takeaway]</li>
  </ul>

  <h3 style="font-size:15px;font-weight:700;margin:0 0 12px;opacity:0.8">Discussion Questions</h3>
  <ol style="margin:0;padding-left:18px">
    <li style="font-size:14px;line-height:1.7;margin-bottom:7px;opacity:0.85">[Open-ended question encouraging critical thinking]</li>
    ... (3-5 questions)
  </ol>
</div>

**NOW SYNTHESIZE THE TRANSCRIPT BELOW INTO THE ABOVE ACADEMIC STUDY GUIDE:**
${transcript}
`;
};


// YouTube info fetching with duration
async function fetchYouTubeInfo(url) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Get basic video info from oEmbed
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch video information');
    }

    const data = await response.json();
    
    // Get video duration
    const durationInSeconds = await getYouTubeVideoDuration(videoId);
    
    return {
      title: data.title,
      thumbnail: data.thumbnail_url,
      duration: durationInSeconds,
      formattedDuration: durationInSeconds ? formatDuration(durationInSeconds) : 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    return { 
      title: 'Video Title', 
      duration: null,
      formattedDuration: 'Unknown',
      thumbnail: null 
    };
  }
}

// Estimate token count (rough estimation)
function estimateTokenCount(text) {
  // Rough estimation: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

// Strip markdown code fences that AI models sometimes wrap HTML output in
function stripMarkdownFences(content) {
  if (!content) return content;
  // Remove opening fence: ```html, ```HTML, ```xml, or plain ```
  // and the corresponding closing ```
  return content
    .replace(/^```[a-zA-Z]*\s*\n?/m, '')
    .replace(/```\s*$/m, '')
    .trim();
}

exports.createNote = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { videoUrl, prompt, model, settings } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required"
      });
    }

    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Model selection is required"
      });
    }

    // Validate YouTube URL format
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid YouTube URL"
      });
    }

    // Validate premium model
    if (!PREMIUM_MODELS.includes(model)) {
      return res.status(400).json({
        success: false,
        message: "Invalid premium model selected"
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check subscription status
    if (!user.membership?.isActive) {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        message: "Active subscription required for premium models"
      });
    }

    // Check plan-based model restrictions (Scholar cannot use Vyavastha)
    const userPlanId = user.membership?.planId || 'scholar';
    const allowedModels = PLAN_MODEL_RESTRICTIONS[userPlanId] || PLAN_MODEL_RESTRICTIONS.scholar;
    
    if (!allowedModels.includes(model)) {
      const planName = user.membership?.planName || 'Scholar Plan';
      return res.status(403).json({
        success: false,
        code: "MODEL_NOT_AVAILABLE",
        message: `The ${model === 'vyavastha' ? 'Vyavastha' : model} model is not available on the ${planName}. Please upgrade to Pro Scholar or higher to access this model.`,
        currentPlan: planName,
        requiredPlan: 'Pro Scholar',
        upgradeRequired: true
      });
    }

    // Extract video ID for the note
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Invalid YouTube URL"
      });
    }

    // Get video info for title
    let videoTitle = `Notes from YouTube Video`;
    let videoDuration = null;
    
    try {
      const videoInfo = await fetchYouTubeInfo(videoUrl);
      if (videoInfo && videoInfo.title) {
        videoTitle = `Notes: ${videoInfo.title}`;
      }
      videoDuration = videoInfo.duration;

      // Check video duration limit based on user's plan
      const maxDuration = getMaxVideoDuration(user);
      if (videoDuration && videoDuration > maxDuration) {
        const formattedDuration = formatDuration(videoDuration);
        const maxFormattedDuration = maxDuration === Infinity ? 'Unlimited' : formatDuration(maxDuration);
        const planName = user.membership?.planName || 'Scholar Plan';
        
        return res.status(403).json({
          success: false,
          code: "VIDEO_TOO_LONG",
          message: `This video is ${formattedDuration} long. ${planName} users can only process videos up to ${maxFormattedDuration}. Please upgrade your plan.`,
          videoDuration: formattedDuration,
          maxAllowedDuration: maxFormattedDuration,
          upgradeRequired: true,
          currentPlan: userPlanId
        });
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
      // Continue with default title if video info fetch fails
    }

    console.log('Starting premium note generation process...');
    console.log('Premium Model:', model, 'Settings:', { language: settings?.language, detailLevel: settings?.detailLevel, prompt });
    
    // STEP 1: Fetch transcript
    console.log('Fetching transcript...');
    let transcript;
    try {
      transcript = await getTranscript(videoId);
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is empty or unavailable for this video');
      }
      
      // Check token limit
      const estimatedTokens = estimateTokenCount(transcript);
      console.log(`Transcript length: ${transcript.length} chars, estimated tokens: ${estimatedTokens}`);
      
      // If transcript is too long, truncate gracefully instead of erroring out
      if (estimatedTokens > MAX_INPUT_TOKENS) {
        const maxChars = MAX_INPUT_TOKENS * 4;
        transcript = transcript.substring(0, maxChars);
        const lastNewline = transcript.lastIndexOf('\n');
        if (lastNewline > maxChars * 0.8) {
          transcript = transcript.substring(0, lastNewline);
        }
        console.log(`⚠️ Transcript truncated from ~${estimatedTokens} to ~${estimateTokenCount(transcript)} tokens for premium model. Proceeding with generation.`);
      }
      
      console.log(`Found ${transcript.split('\n').length} transcript segments`);
    } catch (error) {
      console.error('Transcript fetch failed:', error);
      return res.status(400).json({
        success: false,
        message: "Sorry, this video does not have a proper format and clear pronunciation. Please try another video."
      });
    }

    // STEP 2: Generate AI images for premium models
    // Premium tier → max 6 images via Fireworks AI + Cloudflare R2
    let img_with_url = [];
    console.log('🎨 Generating AI images for premium model (premium tier, max 6)...');
    try {
      const figures = await generateImgGEnAI(transcript, settings?.language);
      if (figures && figures.length > 0) {
        img_with_url = await generateStudyImages(figures, 'premium');
        console.log(`✅ AI image generation complete: ${img_with_url.length} image(s) ready`);
      } else {
        console.log('No visual topics identified – skipping image generation');
      }
    } catch (imgErr) {
      console.error('⚠️ AI image generation failed (non-critical):', imgErr.message);
      // Continue without images – premium note generation must not fail
    }

    // STEP 3: Generate premium PDF content using OpenRouter
    console.log(`Generating premium PDF content with ${model} model using OpenRouter...`);
    
    const images_json = JSON.stringify(img_with_url);
    const ai_prompt = getPremiumModelPrompt(model, transcript, prompt, images_json, videoUrl, settings);

    const messages = [
      {
        role: "system",
        content: "You are an expert at creating educational PDF content from video transcripts. Always output valid HTML with inline styles only."
      },
      {
        role: "user",
        content: ai_prompt
      }
    ];

    const response = await openRouterChatCompletion(messages, {
      temperature: 0.7,
      max_tokens: MAX_OUTPUT_TOKENS,
      timeout: 120000 // 2 minute timeout
    });

    if (!response.success) {
      throw new Error(`AI generation failed: ${response.error}`);
    }

    const content = response.content;
    
    if (!content) {
      throw new Error('AI generation failed - no content returned');
    }

    console.log('Premium AI content generation completed successfully');

    // STEP 4: Create complete premium note with all generated content
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const note_slug = (videoTitle || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50) + "-" + randomSuffix;

    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    const newNote = new Note({
      owner: userId,
      videoUrl,
      videoId,
      title: videoTitle,
      slug: note_slug,
      transcript: transcript,
      content: stripMarkdownFences(content),
      status: 'completed',
      visibility: 'private',
      img_with_url: img_with_url,
      generationDetails: {
        model: model,
        language: settings?.language || 'English',
        detailLevel: mapDetailLevel(settings?.detailLevel) || 'Standard Notes',
        prompt: prompt || "",
        generatedAt: new Date(),
        processingTime: processingTime,
        type: 'premium',
        aiModel: response.model,
        tokenUsage: response.usage
      }
    });

    await newNote.save();

    // STEP 5: Add note to user's notes array
    if (!user.notes) user.notes = [];
    user.notes.push({ noteId: newNote._id });
    
    // Track note creation in user activity
    if (!user.noteCreationHistory) user.noteCreationHistory = [];
    user.noteCreationHistory.push({
      noteId: newNote._id,
      model: model,
      createdAt: new Date(),
      videoTitle: videoTitle
    });
    
    await user.save();

    console.log('Premium note generation finished successfully:', newNote._id);

    // STEP 6: Return complete premium note with all AI-generated content
    res.status(201).json({
      success: true,
      newNote: {
        _id: newNote._id,
        slug: newNote.slug,
        title: newNote.title,
        status: newNote.status,
        videoUrl: newNote.videoUrl,
        videoId: newNote.videoId,
        generationDetails: newNote.generationDetails,
        createdAt: newNote.createdAt,
        content: newNote.content,
        transcript: newNote.transcript,
        img_with_url: newNote.img_with_url,
        visibility: newNote.visibility
      },
      message: "Premium note generated successfully with AI content!",
      videoTitle: videoTitle,
      videoDuration: videoDuration ? formatDuration(videoDuration) : 'Unknown',
      generationSettings: {
        language: settings?.language || 'English',
        detailLevel: mapDetailLevel(settings?.detailLevel) || 'Standard Notes',
        userPrompt: prompt || "No additional instructions",
        modelFeatures: PREMIUM_FEATURES[model]?.features || [],
        processingTime: `${processingTime} seconds`,
        tokenUsage: response.usage
      }
    });

  } catch (error) {
    console.error('Error creating premium note:', error);
    
    res.status(500).json({
      success: false,
      message: "Failed to generate premium note",
      error: error.message
    });
  }
};

// Get premium models info
exports.getPremiumModels = async (req, res) => {
  try {
    const models = PREMIUM_MODELS.map(model => ({
      id: model,
      name: model === 'parikshasarthi' ? 'Pariksha-Sarthi' : 'Vyavastha',
      features: PREMIUM_FEATURES[model]?.features || [],
      description: PREMIUM_FEATURES[model]?.description || '',
      maxLength: PREMIUM_FEATURES[model]?.maxLength || 'unlimited'
    }));

    res.json({
      success: true,
      models,
      tokenLimits: {
        maxInputTokens: MAX_INPUT_TOKENS,
        maxOutputTokens: MAX_OUTPUT_TOKENS
      }
    });
  } catch (error) {
    console.error('Error fetching premium models:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch premium models",
      error: error.message
    });
  }
};

// Get user's premium notes
exports.getUserPremiumNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const notes = await Note.find({ 
      owner: userId,
      'generationDetails.type': 'premium'
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title slug status videoUrl createdAt updatedAt generationDetails content img_with_url');

    const total = await Note.countDocuments({ 
      owner: userId,
      'generationDetails.type': 'premium'
    });

    res.json({
      success: true,
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalNotes: total
    });
  } catch (error) {
    console.error('Error fetching user premium notes:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch premium notes",
      error: error.message
    });
  }
};

// Get premium note details
exports.getPremiumNoteDetails = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    
    const note = await Note.findOne({ 
      _id: noteId, 
      owner: userId,
      'generationDetails.type': 'premium'
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Premium note not found"
      });
    }

    res.json({
      success: true,
      note: {
        _id: note._id,
        slug: note.slug,
        title: note.title,
        status: note.status,
        videoUrl: note.videoUrl,
        generationDetails: note.generationDetails,
        createdAt: note.createdAt,
        content: note.content,
        transcript: note.transcript,
        img_with_url: note.img_with_url,
        visibility: note.visibility
      }
    });
  } catch (error) {
    console.error('Error fetching premium note details:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch premium note details",
      error: error.message
    });
  }
};

// Delete premium note
exports.deletePremiumNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ 
      _id: noteId, 
      owner: userId,
      'generationDetails.type': 'premium'
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Premium note not found"
      });
    }

    // Remove note from user's notes array
    await User.findByIdAndUpdate(userId, {
      $pull: { notes: { noteId: noteId } }
    });

    // Delete the note
    await Note.findByIdAndDelete(noteId);

    res.json({
      success: true,
      message: "Premium note deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting premium note:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete premium note",
      error: error.message
    });
  }
};

// Get recent premium notes
exports.getRecentPremiumNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recentNotes = await Note.find({ 
      owner: userId, 
      'generationDetails.type': 'premium',
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .sort({ createdAt: -1 })
    .select('title slug videoUrl createdAt generationDetails status content img_with_url')
    .limit(5);

    res.json({
      success: true,
      notes: recentNotes
    });
  } catch (error) {
    console.error('Error fetching recent premium notes:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent premium notes",
      error: error.message
    });
  }
};

// Check transcript token count
exports.checkTranscriptTokens = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required"
      });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Invalid YouTube URL"
      });
    }

    // Fetch transcript
    const transcript = await getTranscript(videoId);
    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: "No transcript available for this video"
      });
    }

    const estimatedTokens = estimateTokenCount(transcript);
    const isWithinLimit = estimatedTokens <= MAX_INPUT_TOKENS;

    res.json({
      success: true,
      transcriptLength: transcript.length,
      estimatedTokens,
      maxTokens: MAX_INPUT_TOKENS,
      isWithinLimit,
      message: isWithinLimit ? 
        "Transcript is within token limits" : 
        `Transcript exceeds token limit by ${estimatedTokens - MAX_INPUT_TOKENS} tokens`
    });
  } catch (error) {
    console.error('Error checking transcript tokens:', error);
    res.status(500).json({
      success: false,
      message: "Failed to check transcript tokens",
      error: error.message
    });
  }
};