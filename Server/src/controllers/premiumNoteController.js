// controllers/premiumNoteController.js
const User = require('../models/User');
const Note = require('../models/Note');
const crypto = require('crypto');
const { getTranscript } = require('../youtube-transcript');
const { generateStudyImages } = require('../services/imageGenerationService');

const PREMIUM_MODELS = ['canvas', 'scholar', 'atlas'];
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Plan-based video duration limits (in seconds)
const PLAN_VIDEO_LIMITS = {
  scholar: 4 * 60 * 60,    // 4 hours for legacy Scholar
  pro: 4 * 60 * 60,        // 4 hours for Pro plan
  power: 12 * 60 * 60       // 12 hours for Power plan
};

// Plan-based model restrictions
const PLAN_MODEL_RESTRICTIONS = {
  scholar: ['canvas', 'scholar'],
  pro: ['canvas', 'scholar'],
  power: ['canvas', 'scholar', 'atlas']
};

// Helper to get max video duration for a user's plan
function getMaxVideoDuration(user) {
  const planId = user.membership?.planId || 'pro';
  return PLAN_VIDEO_LIMITS[planId] || PLAN_VIDEO_LIMITS.pro;
}

// Token limits
const MAX_INPUT_TOKENS = 500000; // 500k tokens for transcript
const MAX_OUTPUT_TOKENS = 15000;  // 15k tokens for generated content

// Premium model features
const PREMIUM_FEATURES = {
  canvas: { 
    maxLength: '4 hours', 
    features: ['visual_notes', 'card_layout', 'curated_images'],
    description: 'Visual notes with curated images and card layout'
  },
  scholar: { 
    maxLength: '4 hours', 
    features: ['structured_pdf', 'textbook_quality', 'table_of_contents'],
    description: 'Textbook-quality structured notes'
  },
  atlas: {
    maxLength: '12 hours',
    features: ['deep_chapters', 'playlist_processing', 'anki_export'],
    description: 'Deep chapters breakdown and cross-section concept linking'
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

  const model = "deepseek/deepseek-v4-flash";
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

// Function to get image links from Google Custom Search
const getImgLink = async (query, count = 1) => {
  try {
    const apiKey = 'AIzaSyAkD0dWuBRTharsqXlhh-Bv05ek6AdzhlI';
    const cx = '6606604e9a50d4c0d';

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&cx=${cx}&searchType=image&num=${count}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log("No images found for query:", query);
      return [];
    }

    const blockedDomains = [
      "instagram.com", "facebook.com", "twitter.com", "youtube.com", "youtube.in",
      "tiktok.com", "snapchat.com", "linkedin.com", "flickr.com", "vimeo.com",
      "quora.com", "medium.com", "whatsapp.com", "telegram.org", "discord.com",
      "weibo.com", "vk.com", "twitch.tv", "netflix.com", "hulu.com",
      "primevideo.com", "spotify.com", "soundcloud.com", "bandcamp.com",
      "mixcloud.com", "patreon.com"
    ];
    
    const imgLinks = data.items
      .filter(item => !blockedDomains.some(domain => item.displayLink.includes(domain)))
      .map(item => item.link);

    return imgLinks;
  } catch (err) {
    console.error("Error fetching image links:", err);
    return [];
  }
};

// Function to generate objects array {title, img_url} from figure names
const generateImgObjects = async (figures) => {
  const result = [];

  for (const title of figures) {
    const links = await getImgLink(title, 1);
    result.push({
      title,
      img_url: links.length > 0 ? links[0] : null,
    });
  }

  return result;
};

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
const getPremiumModelPrompt = (model, transcript, userPrompt, image_titles, videoUrl, settings = {}) => {
  const { language = 'English', detailLevel = 'Standard Notes' } = settings;

  const languageInstruction = `
═══ CRITICAL LANGUAGE & QUALITY RULES ═══
1. MULTI-LANGUAGE COMPREHENSION: The source transcript may be in any language. You must accurately extract every single concept and nuance regardless of the transcript's original language.
2. NATIVE-LEVEL ${language.toUpperCase()} OUTPUT: You MUST write the ENTIRE premium study guide (headings, explanations, exam tips, Q&A, labels, and captions) strictly in ${language}. 
3. PROPER ACADEMIC TONE: Use professional, high-quality, and grammatically perfect ${language}. The notes must read like they were written by a native expert educator in ${language}.
4. NO LANGUAGE MIXING: Do not mix languages. Do not use English words in ${language} text unless they are universal technical terms with no equivalent.
5. COMPREHENSIVE EXPLANATION: Explain every concept thoroughly. If the transcript is in one language and the output is in another, ensure no meaning is lost in translation.
`;

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

  if (settings?.format === 'flashcards') {
    const cardLimit = settings.flashcardCount || 30; // Premium users get up to 30
    return `
**YOUR ROLE: Expert Academic Flashcard Architect**

You have been given a raw video transcript. Your task is to generate EXACTLY ${cardLimit} premium flashcards that cover the most important concepts, avoiding trivial details.

${languageInstruction}

STEP 1 — DEEP UNDERSTANDING
Identify the core principles and concepts from the transcript.

STEP 2 — KNOWLEDGE SYNTHESIS
Create powerful, high-yield flashcards. Make the "back" of the flashcard beautifully detailed but concise.

STEP 3 — FORMAT
You MUST output ONLY a valid JSON array of objects. Do not wrap in markdown fences like \`\`\`json. Output raw JSON only.
Format:
[
  { "front": "Question, Term, or Prompt", "back": "Detailed Academic Explanation / Answer / Definition" }
]

**TRANSCRIPT:**
${transcript}
`;
  }

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
  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 CANVAS — Visual Magazine Card Layout
  // ═══════════════════════════════════════════════════════════════════════════
  if (model === 'canvas') {
    return `
${coreIntelligence}

**${languageInstruction}**${userInstructions}

**DESIGN SYSTEM — CANVAS (Visual Magazine):**
Theme: Vibrant and Modern | Primary: #3b82f6 (blue) | Accent: #10b981 (green) | Contrast: #0f172a
Layout: Use cards! Write content as distinct sections wrapped in card components:
<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05)">
  ...
</div>

**AVAILABLE IMAGES:**
You have these images available (by title) — use them contextually inside relevant cards:
${image_titles}

To insert an image inside a card, you MUST use the exact placeholder format:
[IMAGE_PLACEHOLDER: exact_image_title]
Do not write HTML or markdown for images, ONLY use this exact placeholder. Our system will replace it with the correct image HTML.

**MANDATORY DOCUMENT STRUCTURE:**

━━━ SECTION 1: HEADER CARD ━━━
<div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);border-radius:16px;padding:32px;margin-bottom:24px;color:#fff">
  <div style="font-size:11px;letter-spacing:2px;font-weight:700;opacity:0.8;text-transform:uppercase;margin-bottom:8px">Visual Concept Guide</div>
  <h1 style="font-size:28px;font-weight:900;margin:0 0 8px;line-height:1.2;color:#ffffff">[TOPIC TITLE]</h1>
  <p style="opacity:0.8;font-size:13px;margin:10px 0 0">Source Video: <a href="${videoUrl}" style="color:#93c5fd;text-decoration:none">Reference Link ↗</a></p>
</div>

━━━ SECTION 2: CONCEPTS CARD ARRAY ━━━
Produce 4-8 concept cards. Each card must focus on a major idea, including:
- A title with an emoji.
- Clean bullet explanations.
- An embedded image placeholder if relevant.
- Timestamp link back to the video: <a href="${videoUrl}&t=Xs" style="color:#3b82f6;text-decoration:none;font-weight:700">Watch this section ↗</a>

Example Card layout:
<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05)">
  <h2 style="font-size:20px;font-weight:700;color:#1e3a8a;margin:0 0 12px">🧠 [Concept Name]</h2>
  <p style="color:#4b5563;font-size:14px;line-height:1.6">[Explanation...]</p>
  [IMAGE_PLACEHOLDER: exact_image_title]
  <div style="margin-top:14px"><a href="${videoUrl}&t=60s" style="color:#3b82f6;font-size:12px;text-decoration:none;font-weight:700">⏱️ Watch this section →</a></div>
</div>

**NOW PROCESS THE TRANSCRIPT BELOW AND GENERATE THE COMPLETE VISUAL GUIDE:**
${transcript}
`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📖 SCHOLAR — Textbook-Quality Structured PDF Notes
  // ═══════════════════════════════════════════════════════════════════════════
  if (model === 'scholar') {
    return `
${coreIntelligence}

**${languageInstruction}**${userInstructions}

**DESIGN SYSTEM — SCHOLAR (Academic textbook format):**
Font: Serif for headings, Sans-serif for body.
Theme: Oxford Blue (#0f172a) primary | Slate (#475569) secondary | Soft light background.
No images should be used. This model is purely textual.

**MANDATORY DOCUMENT STRUCTURE:**

━━━ SECTION 1: TITLE PAGE ━━━
<div style="border-bottom:3px double #0f172a;padding-bottom:20px;margin-bottom:28px">
  <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin-bottom:6px">[SUBJECT DOMAIN] • REFERENCE SCHOLAR NOTES</div>
  <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 10px;font-family:Georgia,serif">[TOPIC TITLE]</h1>
  <p style="color:#64748b;font-size:13px;margin:0">Source: <a href="${videoUrl}" style="color:#0f172a;text-decoration:underline">YouTube Reference ↗</a></p>
</div>

━━━ SECTION 2: TABLE OF CONTENTS ━━━
<div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:20px;margin-bottom:28px">
  <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#475569;margin:0 0 12px">Table of Contents</h3>
  <ol style="margin:0;padding-left:20px;color:#0f172a;font-size:13px">
    <li style="margin-bottom:6px">[Section 1 Name]</li>
    <li style="margin-bottom:6px">[Section 2 Name]</li>
  </ol>
</div>

━━━ SECTION 3: DETAILED CONCEPTS (H1 → H2 → H3 structure) ━━━
Structure concepts with proper headers and sub-sections.
For each key term/concept, provide:
- A definition box:
<div style="background:#f1f5f9;border-left:4px solid #0f172a;padding:12px 16px;margin:12px 0;border-radius:0 8px 8px 0">
  <b style="color:#0f172a;font-size:13px">Definition:</b> <span style="color:#334155;font-size:13px">[Precise definition]</span>
</div>
- Data tables for comparisons:
<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">
  <thead>
    <tr style="background:#0f172a;color:#fff"><th style="padding:8px;border:1px solid #cbd5e1">Concept</th><th style="padding:8px;border:1px solid #cbd5e1">Details</th></tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #cbd5e1">[Concept A]</td><td style="padding:8px;border:1px solid #cbd5e1">[Comparison details]</td></tr>
  </tbody>
</table>

**NOW PROCESS THE TRANSCRIPT BELOW AND GENERATE THE SCHOLAR DOCUMENT:**
${transcript}
`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🗺️ ATLAS — Deep Course Chapters & Concept Outline
  // ═══════════════════════════════════════════════════════════════════════════
  if (model === 'atlas') {
    return `
${coreIntelligence}

**${languageInstruction}**${userInstructions}

**DESIGN SYSTEM — ATLAS (Deep Outline):**
Theme: Minimalist Slate & Purple | Primary: #581c87 (purple) | Secondary: #3b82f6 (blue).
Purpose: Chapter-by-chapter detailed breakdown of long videos, playlists, or deep topics.

**MANDATORY DOCUMENT STRUCTURE:**

━━━ SECTION 1: COURSE COVER ━━━
<div style="background:linear-gradient(135deg,#3b0764,#581c87);border-radius:16px;padding:32px;margin-bottom:28px;color:#fff">
  <div style="font-size:11px;letter-spacing:2px;font-weight:700;opacity:0.8;text-transform:uppercase;margin-bottom:8px">Deep Research Notes & Syllabus Map</div>
  <h1 style="font-size:30px;font-weight:900;margin:0 0 10px;line-height:1.2;color:#ffffff">[COURSE / PLAYLIST TITLE]</h1>
  <p style="opacity:0.8;font-size:13px;margin:0">Full syllabus mapped from: <a href="${videoUrl}" style="color:#d8b4fe;text-decoration:none">Playlist Source ↗</a></p>
</div>

━━━ SECTION 2: CHAPTER BREAKDOWN ━━━
Provide a detailed chapter-by-chapter analysis of the transcript. For each chapter, include:
- Chapter title with timestamp.
- Detailed sub-topics and bullet explanations.
- Cross-section linking: how this chapter connects back to preceding concepts.

━━━ SECTION 3: ANKI DECK STUDY GUIDE ━━━
<div style="background:#fdf4ff;border:1px solid #f0abfc;border-radius:12px;padding:20px;margin-top:28px">
  <h3 style="color:#86198f;font-size:16px;font-weight:700;margin:0 0 12px">⚡ Anki Flashcard Deck Generated</h3>
  <p style="color:#701a75;font-size:13px;line-height:1.6">The following cards have been added to the syllabus deck. Use these for active recall practice:</p>
  <ul style="margin:10px 0;padding-left:20px;color:#701a75;font-size:13px">
    <li style="margin-bottom:8px"><b>Q:</b> [Concept question] <br> <b>A:</b> [Direct precise answer]</li>
  </ul>
</div>

**NOW PROCESS THE TRANSCRIPT BELOW AND GENERATE THE COMPLETE ATLAS STUDY GUIDE:**
${transcript}
`;
  }

  // Fallback
  return `
${coreIntelligence}
**${languageInstruction}**${userInstructions}
# Notes
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
    const { videoUrl, prompt, model, settings, format, flashcardCount } = req.body;
    
    if (settings) {
      settings.format = format;
      settings.flashcardCount = flashcardCount;
    }

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

    // Check plan-based model restrictions (Pro/Scholar cannot use Atlas)
    const userPlanId = user.membership?.planId || 'scholar';
    const allowedModels = PLAN_MODEL_RESTRICTIONS[userPlanId] || PLAN_MODEL_RESTRICTIONS.scholar;
    
    if (!allowedModels.includes(model)) {
      const planName = user.membership?.planName || 'Scholar Plan';
      return res.status(403).json({
        success: false,
        code: "MODEL_NOT_AVAILABLE",
        message: `The ${model === 'atlas' ? 'Atlas' : model} model is not available on the ${planName}. Please upgrade to Power Tier to access this model.`,
        currentPlan: planName,
        requiredPlan: 'Power',
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

    // STEP 2: Generate AI images for premium models (Only Canvas gets visual images)
    let img_with_url = [];
    if (model === 'canvas') {
      console.log('🎨 Generating images for premium model using Google Search...');
      try {
        const figures = await generateImgGEnAI(transcript, settings?.language);
        if (figures && figures.length > 0) {
          img_with_url = await generateImgObjects(figures);
          console.log(`✅ Image retrieval complete: ${img_with_url.length} image(s) ready`);
        } else {
          console.log('No visual topics identified – skipping image generation');
        }
      } catch (imgErr) {
        console.error('⚠️ Image generation failed (non-critical):', imgErr.message);
        // Continue without images – premium note generation must not fail
      }
    }

    // STEP 3: Generate premium PDF content using OpenRouter
    console.log(`Generating premium PDF content with ${model} model using OpenRouter...`);
    
    const image_titles = img_with_url.map(img => img.title).join(', ');
    const ai_prompt = getPremiumModelPrompt(model, transcript, prompt, image_titles, videoUrl, settings);

    const systemPromptContent = (settings?.format === 'flashcards')
      ? "You are an expert at creating educational flashcards from video transcripts. Always output a valid JSON array of flashcard objects only."
      : "You are an expert at creating educational PDF content from video transcripts. Always output valid HTML with inline styles only.";

    const messages = [
      {
        role: "system",
        content: systemPromptContent
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
      content: (() => {
        let finalContent = stripMarkdownFences(content);
        if (img_with_url && img_with_url.length > 0) {
          img_with_url.forEach(img => {
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\[IMAGE_PLACEHOLDER:\\s*${escapeRegExp(img.title)}\\]`, 'gi');
            
            const imgHtml = `\n<div style="text-align:center;margin:20px 0">\n  <img src="${img.img_url}" alt="${img.title}" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">\n  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig: ${img.title}</p>\n</div>\n`;
            finalContent = finalContent.replace(regex, imgHtml);
          });
        }
        return finalContent;
      })(),
      status: 'completed',
      visibility: 'private',
      img_with_url: img_with_url,
      generationDetails: {
        model: model,
        language: settings?.language || 'English',
        detailLevel: mapDetailLevel(settings?.detailLevel) || 'Standard Notes',
        prompt: prompt || "",
        format: format || 'notes',
        theme: req.body.theme || 'blueberry',
        flashcardCount: flashcardCount,
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
      name: model.charAt(0).toUpperCase() + model.slice(1),
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