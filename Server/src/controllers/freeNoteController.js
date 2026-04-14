// controllers/freeNoteController.js
const User = require('../models/User');
const Note = require('../models/Note');
const crypto = require('crypto');
const { getTranscript } = require('../youtube-transcript');
const { generateStudyImages } = require('../services/imageGenerationService');

const FREE_MODELS = ['sankshipta', 'bhashasetu'];
const MAX_FREE_VIDEO_LENGTH = 2 * 60 * 60; // 2 hours in seconds for free users

// Plan-based video duration limits (in seconds)
const PLAN_VIDEO_LIMITS = {
  free: 2 * 60 * 60,      // 2 hours for free users
  scholar: 6 * 60 * 60,   // 6 hours for Scholar plan
  pro: 12 * 60 * 60,      // 12 hours for Pro Scholar plan
  power: Infinity          // Unlimited for Power Scholar plan
};

// Helper to get max video duration for a user's plan
function getMaxVideoDuration(user) {
  if (!user.membership?.isActive) return PLAN_VIDEO_LIMITS.free;
  const planId = user.membership?.planId || 'free';
  return PLAN_VIDEO_LIMITS[planId] || PLAN_VIDEO_LIMITS.free;
}
const TOKEN_COST_PER_GENERATION = 5; // Deduct 5 tokens per free generation

// Model-specific token limits
const MODEL_TOKEN_LIMITS = {
  sankshipta: {
    maxInputTokens: 10000,
    maxOutputTokens: 1200
  },
  bhashasetu: {
    maxInputTokens: 10000,
    maxOutputTokens: 3500
  }
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// OpenRouter model priority queue - higher priority first
let openRouterModelQueue = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openrouter/free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "tngtech/deepseek-r1t-chimera:free"
];

// Track failed models for OpenRouter
let failedOpenRouterModels = new Set();

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

// Premium OpenRouter call for x-ai/grok-4.1-fast (for subscribers)
async function premiumOpenRouterChatCompletion(messages, options = {}) {
  const {
    temperature = 0.7,
    max_tokens = 15000,
    top_p = 1,
    timeout = 120000
  } = options;

  const model = "x-ai/grok-4.1-fast";
  let retries = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Premium OpenRouter attempt ${attempt}/${retries} with model: ${model}`);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Premium OpenRouter request timeout after ${timeout}ms`)), timeout);
      });

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

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after') || 5;
          console.log(`⏳ Rate limited. Waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ Premium OpenRouter success with: ${model}`);
      
      return {
        success: true,
        model: model,
        content: data.choices[0].message.content,
        usage: data.usage,
        fullResponse: data
      };
      
    } catch (error) {
      console.log(`❌ Premium OpenRouter attempt ${attempt} failed: ${error.message}`);
      lastError = error;
      
      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  return {
    success: false,
    error: `All premium OpenRouter attempts failed. Last error: ${lastError?.message}`,
    attempts: retries
  };
}

/**
 * OpenRouter AI chat completion with model fallback (for free users)
 */
async function openRouterChatCompletion(messages, options = {}) {
  const {
    temperature = 0.7,
    max_tokens = 4000,
    top_p = 1,
    timeout = 60000
  } = options;

  // Rebuild queue: put failed models at the end
  const workingModels = openRouterModelQueue.filter(m => !failedOpenRouterModels.has(m));
  const failedModelsList = openRouterModelQueue.filter(m => failedOpenRouterModels.has(m));
  openRouterModelQueue = [...workingModels, ...failedModelsList];
  
  let lastError = null;
  
  for (const model of openRouterModelQueue) {
    console.log(`🔄 OpenRouter trying model: ${model}`);
    
    try {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      // Success - move this model to front of queue for next time
      openRouterModelQueue = [
        model,
        ...openRouterModelQueue.filter(m => m !== model && !failedOpenRouterModels.has(m)),
        ...failedModelsList
      ];
      
      failedOpenRouterModels.delete(model);
      
      console.log(`✅ OpenRouter success with: ${model}`);
      
      return {
        success: true,
        model: model,
        content: data.choices[0].message.content,
        usage: data.usage,
        fullResponse: data
      };
      
    } catch (error) {
      console.log(`❌ OpenRouter model ${model} failed: ${error.message}`);
      failedOpenRouterModels.add(model);
      lastError = error;
      
      // If rate limited, wait a bit
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.log(`⏳ Rate limit hit. Waiting 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      continue; // Try next model
    }
  }
  
  // If all models failed
  return {
    success: false,
    error: `All OpenRouter models failed. Last error: ${lastError?.message}`,
    models_tried: openRouterModelQueue.length
  };
}

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
- Minimum 1 and Maximum 5 items.
- Each item should be a short, descriptive noun phrase (3-6 words max) that can be used as an image generation prompt.
- Focus on concrete visual concepts (diagrams, processes, scientific concepts, historical events, etc.).
- Do not add any extra text, explanation, or formatting.
- ${languageInstruction}
- If the transcript is NOT about educational, technical, or book-related content, return "none".
- If no visual concept exists, return "none".

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
      max_tokens: 2000  // Increased to prevent truncation
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

// Function to fetch YouTube transcript
const fetchTranscript = async (videoId) => {
  try {
    const params = await getVideoParams(videoId);
    
    if (!params) {
      throw new Error('Could not get transcript parameters');
    }

    const response = await fetch("https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
        "sec-ch-ua-arch": "\"x86\"",
        "sec-ch-ua-bitness": "\"64\"",
        "sec-ch-ua-full-version-list": "\"Not;A=Brand\";v=\"99.0.0.0\", \"Google Chrome\";v=\"139.0.0.0\", \"Chromium\";v=\"139.0.0.0\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-ch-ua-platform-version": "\"19.0.0\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-goog-authuser": "2",
        "x-origin": "https://www.youtube.com",
        "x-youtube-bootstrap-logged-in": "true",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": "2.20250828.01.00"
      },
      body: JSON.stringify({
        context: {
          client: {
            hl: "en-GB",
            gl: "IN",
            clientName: "WEB",
            clientVersion: "2.20250828.01.00",
            originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
            platform: "DESKTOP",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36,gzip(gfe)"
          }
        },
        params: params,
        externalVideoId: videoId
      }),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    let segments = data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer?.initialSegments;

    if (segments && Array.isArray(segments)) {
      console.log(`Found ${segments.length} segments in response`);
      
      const formattedSegments = segments
        .map(seg => {
          if (seg.transcriptSectionHeaderRenderer) {
            return null;
          }
          
          const r = seg?.transcriptSegmentRenderer;
          if (!r || !r.startMs || !r.snippet?.runs) {
            console.warn('Invalid segment structure:', seg);
            return null;
          }
          
          const startMs = parseFloat(r.startMs);
          const endMs = parseFloat(r.endMs || startMs + 5000);
          const text = r.snippet.runs
            .map(run => run?.text || '')
            .join(' ')
            .replace(/\n/g, ' ')
            .trim();

          if (!text) return null;

          return {
            startTime: startMs / 1000,
            duration: (endMs - startMs) / 1000,
            text: text
          };
        })
        .filter(cue => cue !== null && cue.text);

      if (formattedSegments.length > 0) {
        return formattedSegments
          .map(cue => `[${cue.startTime.toFixed(2)}s] ${cue.text}`)
          .join('\n');
      }
    }

    const transcripts = data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.transcript?.cues;
    if (transcripts && Array.isArray(transcripts)) {
      console.log('Using fallback transcript format');
      const formattedTranscripts = transcripts
        .map(cue => {
          if (!cue?.startOffsetMs || !cue.text) {
            console.warn('Invalid cue structure:', cue);
            return null;
          }
          
          return {
            startTime: parseFloat(cue.startOffsetMs) / 1000,
            duration: parseFloat(cue.durationMs || 5000) / 1000,
            text: cue.text.replace(/\n/g, ' ').trim()
          };
        })
        .filter(cue => cue !== null && cue.text)
        .map(cue => `[${cue.startTime.toFixed(2)}s] ${cue.text}`)
        .join('\n');

      if (formattedTranscripts) {
        return formattedTranscripts;
      }
    }

    const alternativeSegments = data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.body?.transcriptBodyRenderer?.cueGroups;
    if (alternativeSegments && Array.isArray(alternativeSegments)) {
      console.log('Using alternative transcript format');
      const formatted = alternativeSegments
        .map(group => {
          const cue = group?.transcriptCueGroupRenderer?.cues?.[0]?.transcriptCueRenderer;
          if (!cue || !cue.startOffsetMs || !cue.simpleText) return null;
          
          return {
            startTime: parseFloat(cue.startOffsetMs) / 1000,
            duration: parseFloat(cue.durationMs || 5000) / 1000,
            text: cue.simpleText.replace(/\n/g, ' ').trim()
          };
        })
        .filter(cue => cue !== null && cue.text)
        .map(cue => `[${cue.startTime.toFixed(2)}s] ${cue.text}`)
        .join('\n');

      if (formatted) {
        return formatted;
      }
    }

    throw new Error("No transcript available for this video or unsupported format");
  } catch (error) {
    console.error('Transcript fetch error details:', {
      videoId,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
};

const getModelPrompt = (model, transcript, userPrompt, images_json, videoUrl, settings = {}) => {
  const { language = 'English', detailLevel = 'Standard Notes' } = settings;

  const languageInstruction = language !== 'English'
    ? `IMPORTANT: Write ALL content — headings, explanations, bullets, labels — entirely in ${language}. Do not mix languages.`
    : 'Write all content in clear, academic English.';

  const userInstructions = userPrompt
    ? `\nThe user has given these additional instructions — follow them precisely: "${userPrompt}"`
    : '';

  // Detail level controls depth and length
  const detailConfig = {
    'Brief Summary': {
      instruction: 'Produce a compact summary: 1 overview paragraph + the 5-7 most critical concepts as bullets. Skip minor details.',
      depth: 'concise'
    },
    'Standard Notes': {
      instruction: 'Produce comprehensive study notes covering all major topics in good depth with explanations and examples.',
      depth: 'standard'
    },
    'Comprehensive': {
      instruction: 'Produce an exhaustive, graduate-level study guide. Cover every concept, sub-concept, edge case, and nuance. Include worked examples, comparisons, and detailed explanations.',
      depth: 'exhaustive'
    },
    'Bullet Points Only': {
      instruction: 'Produce a structured bullet-point outline only. Use nested bullets for sub-points. No prose paragraphs.',
      depth: 'bullets'
    }
  };

  const { instruction: depthInstruction } = detailConfig[detailLevel] || detailConfig['Standard Notes'];

  if (settings?.format === 'flashcards') {
    const cardLimit = settings.flashcardCount || 5;
    return `
**YOUR TASK — READ THIS CAREFULLY:**
You are an expert educator creating high-yield flashcards from a video transcript.
Generate EXACTLY ${cardLimit} flashcards that cover the most important concepts.

STEP 1 — UNDERSTAND
Read the transcript and extract the ${cardLimit} most critical terms, questions, or concepts.

STEP 2 — SYNTHESIZE
Create concise, punchy flashcards.
- The 'front' should be a clear question or term.
- The 'back' should be a comprehensive but concise answer/explanation.

STEP 3 — FORMAT
You MUST output ONLY a valid JSON array of objects. Do not wrap in markdown fences like \`\`\`json. Output raw JSON only.
Format:
[
  { "front": "Question or Term here", "back": "Answer or Explanation here" }
]

**TRANSCRIPT:**
${transcript}
`;
  }

  // ─── CORE INTELLIGENCE LAYER ─────────────────────────────────────────────
  // This is the key change: the AI must UNDERSTAND first, then WRITE study material.
  // It must NOT copy-paste or paraphrase the transcript.
  const coreIntelligenceRules = `
**YOUR TASK — READ THIS CAREFULLY:**
You are an expert educator and academic writer. You have been given a raw video transcript.
Your job is NOT to convert the transcript into notes. Your job is to:

STEP 1 — UNDERSTAND: Read the entire transcript and identify:
  • The subject domain (e.g., mathematics, history, biology, programming, finance, etc.)
  • The central topic or problem being addressed
  • All key concepts, terms, principles, formulas, or processes taught
  • The logical flow and structure of the ideas
  • Real-world applications or examples mentioned

STEP 2 — SYNTHESIZE: From your understanding, write ORIGINAL study material that a student
  can use to learn this topic from scratch, even without watching the video. This means:
  • Use your own explanations — do NOT copy sentences from the transcript
  • Define every key term properly
  • Explain the "why" behind concepts, not just the "what"
  • Use concrete examples to illustrate abstract ideas
  • Show connections between concepts
  • ${depthInstruction}

STEP 3 — FORMAT: Present the synthesized knowledge as a beautiful, well-structured HTML document.

**ABSOLUTE RULES:**
• NEVER copy raw transcript text into the output
• NEVER write "the speaker says" or "in this video"
• NEVER start with "This transcript covers..." 
• ALWAYS write as if YOU are the expert author of a textbook
• Output ONLY valid HTML with inline styles — no <html>, <head>, <body>, <style> tags
• No markdown syntax — use <b>, <h2>, <ul>, <table> etc.
• Every HTML tag must have a style="..." attribute
`;

  // ─── SANKSHIPTA: Clean Academic Notes ────────────────────────────────────
  if (model === 'sankshipta') {
    return `
${coreIntelligenceRules}

**${languageInstruction}**${userInstructions}

**DESIGN SYSTEM — SANKSHIPTA (Clean Academic):**
Font: "Segoe UI, Helvetica Neue, Arial, sans-serif" | Line-height: 1.7
Colors: Primary headings #1e293b, Section headings #2563eb, Accents #059669, Body text #374151
Background: #ffffff | Max-width: 800px | Padding: 40px

**AVAILABLE IMAGES:**
You have these image links to embed — use them contextually near relevant concepts:
\${images_json}
For each image: <div style="text-align:center;margin:20px 0">
  <img src="[img_url]" alt="[title]" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig: [descriptive caption]</p>
</div>

**DOCUMENT STRUCTURE — produce ALL of these sections:**

1. SUBJECT BADGE + TITLE
   <div style="background:#eff6ff;border-left:5px solid #2563eb;padding:6px 14px;border-radius:4px;display:inline-block;font-size:12px;font-weight:700;color:#2563eb;letter-spacing:1px;margin-bottom:12px;text-transform:uppercase">[SUBJECT DOMAIN]</div>
   <h1 style="font-size:28px;font-weight:800;color:#1e293b;margin:0 0 6px;line-height:1.3">[TOPIC TITLE]</h1>
   <p style="color:#64748b;font-size:14px;margin:0 0 24px">Based on: <a href="${videoUrl}" style="color:#2563eb;text-decoration:none">Source Video ↗</a></p>

2. LEARNING OBJECTIVES BOX
   <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 22px;margin-bottom:28px">
     <h3 style="color:#166534;font-size:14px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.5px">📋 Learning Objectives</h3>
     <ul style="margin:0;padding-left:18px">
       <li style="color:#15803d;font-size:14px;margin-bottom:6px">What you will understand after studying this</li>
       ... (3–5 objectives)
     </ul>
   </div>

3. CORE CONCEPT SECTIONS — for EACH major concept in the topic:
   <h2 style="font-size:20px;font-weight:700;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin:28px 0 14px">[Concept Name]</h2>
   <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 14px">[Clear explanation of the concept in your own words]</p>
   
   For definitions: <div style="background:#fafafa;border-left:3px solid #2563eb;padding:12px 16px;margin:12px 0;border-radius:0 6px 6px 0">
     <b style="color:#1e293b;font-size:14px">Definition:</b> <span style="color:#374151;font-size:14px">[precise definition]</span>
   </div>
   
   For examples: <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin:12px 0">
     <b style="color:#c2410c;font-size:13px">💡 Example:</b><br>
     <span style="color:#374151;font-size:14px">[concrete example that illustrates the concept]</span>
   </div>
   
   Key points: <ul style="padding-left:20px;margin:10px 0">
     <li style="color:#374151;font-size:14px;line-height:1.65;margin-bottom:8px">[point]</li>
   </ul>

4. KEY TERMS GLOSSARY (if applicable)
   <h2 style="font-size:20px;font-weight:700;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin:28px 0 14px">📖 Key Terms</h2>
   <dl style="margin:0">
     <dt style="font-weight:700;color:#1e293b;font-size:15px;margin:12px 0 4px">[Term]</dt>
     <dd style="color:#374151;font-size:14px;line-height:1.65;margin-left:16px">[Definition and context]</dd>
   </dl>

5. SUMMARY TAKEAWAYS
   <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-top:32px">
     <h3 style="color:#1e293b;font-size:16px;font-weight:700;margin:0 0 12px">✅ Key Takeaways</h3>
     <ul style="margin:0;padding-left:18px">
       <li style="color:#374151;font-size:14px;line-height:1.65;margin-bottom:8px">[takeaway]</li>
     </ul>
   </div>

**NOW PROCESS THIS TRANSCRIPT AND GENERATE THE COMPLETE STUDY DOCUMENT:**
${transcript}
`;
  }

  // ─── BHASHASETU: Visual Study Guide with Images ──────────────────────────
  return `
${coreIntelligenceRules}

**${languageInstruction}**${userInstructions}

**DESIGN SYSTEM — BHASHASETU (Premium Visual Study Guide):**
Font: "Segoe UI, Roboto, Helvetica Neue, sans-serif" | Line-height: 1.75
Primary: #2563eb | Success: #059669 | Warning: #d97706 | Danger: #dc2626 | Dark: #1e293b
Background: #f8fafc | Card background: #ffffff

**AVAILABLE IMAGES:**
You have these AI-generated images to embed — use them contextually near relevant concepts:
${images_json}
For each image: <div style="text-align:center;margin:20px 0">
  <img src="[img_url]" alt="[title]" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12)">
  <p style="color:#64748b;font-size:12px;font-style:italic;margin:6px 0 0">Fig: [descriptive caption]</p>
</div>

**DOCUMENT STRUCTURE — produce ALL of these sections:**

1. HERO HEADER
   <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);border-radius:14px;padding:32px;margin-bottom:28px;color:#fff">
     <div style="font-size:11px;font-weight:700;letter-spacing:2px;opacity:0.75;text-transform:uppercase;margin-bottom:8px">[SUBJECT DOMAIN]</div>
     <h1 style="font-size:30px;font-weight:800;margin:0 0 10px;line-height:1.25">[TOPIC TITLE]</h1>
     <p style="opacity:0.85;font-size:14px;margin:0">Comprehensive study guide • <a href="${videoUrl}" style="color:#93c5fd;text-decoration:none">Source Video ↗</a></p>
   </div>

2. LEARNING OBJECTIVES CARD
   <div style="background:#fff;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;box-shadow:0 2px 8px rgba(5,150,105,0.08)">
     <h3 style="color:#065f46;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px">📋 What You Will Learn</h3>
     <ul style="margin:0;padding-left:20px">
       <li style="color:#047857;font-size:14px;line-height:1.65;margin-bottom:7px">[objective]</li>
     </ul>
   </div>

3. CONCEPT CARDS — for EACH major concept, create a styled card:
   <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
     <h2 style="font-size:19px;font-weight:700;color:#1e293b;margin:0 0 14px;display:flex;align-items:center;gap:8px">
       <span style="background:#dbeafe;color:#2563eb;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">CONCEPT</span>
       [Concept Name]
     </h2>
     <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 14px">[Clear, original explanation of the concept]</p>
     
     [Insert image here if relevant — use the provided images_json]
     
     <!-- Definition box if needed -->
     <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0">
       <span style="font-weight:700;color:#1d4ed8;font-size:13px">Definition: </span>
       <span style="color:#1e40af;font-size:14px">[precise definition]</span>
     </div>
     
     <!-- Example box if needed -->
     <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin:12px 0">
       <b style="color:#92400e;font-size:13px">💡 Example</b><br>
       <span style="color:#374151;font-size:14px;line-height:1.65">[concrete example]</span>
     </div>
     
     <!-- Key points -->
     <ul style="padding-left:18px;margin:12px 0 0">
       <li style="color:#374151;font-size:14px;line-height:1.65;margin-bottom:7px">[key point]</li>
     </ul>
     
     <!-- Timestamp link if extractable from transcript -->
     <div style="margin-top:14px">
       <a href="${videoUrl}&t=0s" style="background:#f1f5f9;color:#64748b;padding:4px 12px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:500">▶ Watch in video</a>
     </div>
   </div>

4. COMPARISON TABLE (use when comparing 2+ related concepts or approaches)
   <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow-x:auto">
     <h2 style="font-size:18px;font-weight:700;color:#1e293b;margin:0 0 16px">Comparison / Overview</h2>
     <table style="width:100%;border-collapse:collapse;font-size:14px">
       <thead>
         <tr style="background:#f1f5f9">
           <th style="padding:10px 14px;text-align:left;font-weight:600;color:#475569;border-bottom:2px solid #e2e8f0">[Column]</th>
           <th style="padding:10px 14px;text-align:left;font-weight:600;color:#475569;border-bottom:2px solid #e2e8f0">[Column]</th>
         </tr>
       </thead>
       <tbody>
         <tr style="border-bottom:1px solid #f1f5f9">
           <td style="padding:10px 14px;color:#374151">[value]</td>
           <td style="padding:10px 14px;color:#374151">[value]</td>
         </tr>
       </tbody>
     </table>
   </div>

5. CRITICAL POINTS ALERT (for must-know facts)
   <div style="background:#fff7ed;border-left:5px solid #f97316;border-radius:0 10px 10px 0;padding:16px 20px;margin:20px 0">
     <b style="color:#ea580c;font-size:14px">🚨 Important to Remember</b>
     <ul style="margin:8px 0 0;padding-left:18px">
       <li style="color:#374151;font-size:14px;line-height:1.65;margin-bottom:6px">[critical point]</li>
     </ul>
   </div>

6. KEY TERMS GLOSSARY
   <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
     <h2 style="font-size:18px;font-weight:700;color:#1e293b;margin:0 0 16px">📖 Glossary of Key Terms</h2>
     <dl style="margin:0">
       <dt style="font-weight:700;color:#2563eb;font-size:15px;margin:12px 0 3px">[Term]</dt>
       <dd style="color:#374151;font-size:14px;line-height:1.65;margin-left:0;padding-left:14px;border-left:2px solid #dbeafe">[Definition with context]</dd>
     </dl>
   </div>

7. SUMMARY + REVIEW QUESTIONS
   <div style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #a7f3d0;border-radius:12px;padding:22px 26px;margin-top:28px">
     <h3 style="color:#065f46;font-size:17px;font-weight:700;margin:0 0 14px">✅ Summary & Key Takeaways</h3>
     <ul style="margin:0 0 18px;padding-left:20px">
       <li style="color:#047857;font-size:14px;line-height:1.65;margin-bottom:8px">[takeaway]</li>
     </ul>
     <h3 style="color:#065f46;font-size:15px;font-weight:700;margin:0 0 10px">🧠 Review Questions</h3>
     <ol style="margin:0;padding-left:20px">
       <li style="color:#374151;font-size:14px;line-height:1.65;margin-bottom:7px">[thought-provoking question based on content]</li>
     </ol>
   </div>

**NOW PROCESS THIS TRANSCRIPT AND GENERATE THE COMPLETE VISUAL STUDY GUIDE:**
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

// Deduct tokens from user
async function deductTokens(user, amount, noteId, model) {
  if (user.tokens < amount) {
    throw new Error(`Insufficient tokens. You have ${user.tokens} tokens but need ${amount}.`);
  }

  // Deduct tokens
  user.tokens -= amount;
  
  // Add to token usage history
  if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
  user.tokenUsageHistory.push({
    name: `Free generation - ${model}`,
    tokens: -amount,
    date: new Date()
  });
  
  // Add to note creation history
  if (!user.noteCreationHistory) user.noteCreationHistory = [];
  user.noteCreationHistory.push({
    noteId: noteId,
    model: model,
    createdAt: new Date(),
    videoTitle: `Note generation - ${amount} tokens deducted`
  });
  
  await user.save();
  
  return user.tokens;
}

exports.createNote = async (req, res) => {
  const startTime = Date.now();

  try {
    const { videoUrl, prompt, model, settings, format, flashcardCount } = req.body;
    
    // Inject format into settings so getModelPrompt can access it
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

    // Validate free model
    if (!FREE_MODELS.includes(model)) {
      return res.status(400).json({
        success: false,
        message: "Invalid free model selected"
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

    // Check if user has active subscription - they can use premium features
    const isSubscribed = user.membership?.isActive === true;

    // Check token balance for free users
    if (!isSubscribed) {
      if (user.tokens < TOKEN_COST_PER_GENERATION) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_TOKENS",
          message: `You need ${TOKEN_COST_PER_GENERATION} tokens to generate notes. You have ${user.tokens} tokens. Please purchase more tokens.`,
          currentTokens: user.tokens,
          requiredTokens: TOKEN_COST_PER_GENERATION,
          canPurchase: true
        });
      }
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
        const planName = user.membership?.planId 
          ? user.membership.planId.charAt(0).toUpperCase() + user.membership.planId.slice(1) 
          : 'Free';
        
        return res.status(403).json({
          success: false,
          code: "VIDEO_TOO_LONG",
          message: `This video is ${formattedDuration} long. ${planName} plan users can only process videos up to ${maxFormattedDuration}.`,
          videoDuration: formattedDuration,
          maxAllowedDuration: maxFormattedDuration,
          upgradeRequired: true,
          currentPlan: planName
        });
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
      // Continue with default title if video info fetch fails
    }

    console.log('Starting complete note generation process...');
    console.log('Settings received:', { language: settings?.language, detailLevel: settings?.detailLevel, prompt });
    console.log('User subscription status:', isSubscribed ? 'Subscribed' : 'Free user');
    
    // STEP 1: Fetch transcript
    let transcript;
    try {
      console.log("Fetching transcript for video ID:", videoId);
      transcript = await getTranscript(videoId);
      console.log(`Transcript fetched, length: ${transcript?.length || 0} characters`);
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is empty or unavailable for this video');
      }
      console.log(`Found ${transcript.split('\n').length} transcript segments`);
      
      // Check transcript token limits for the specific model
      const estimatedTokens = estimateTokenCount(transcript);
      const modelLimits = MODEL_TOKEN_LIMITS[model];
      
      console.log(`Transcript estimated tokens: ${estimatedTokens}, Model max input: ${modelLimits.maxInputTokens}`);
      
      // If transcript is too long, truncate it to fit within the model's token limit
      // (~4 chars per token), so we can still generate notes instead of erroring out
      if (estimatedTokens > modelLimits.maxInputTokens) {
        const maxChars = modelLimits.maxInputTokens * 4;
        transcript = transcript.substring(0, maxChars);
        // Try to end at a clean line boundary
        const lastNewline = transcript.lastIndexOf('\n');
        if (lastNewline > maxChars * 0.8) {
          transcript = transcript.substring(0, lastNewline);
        }
        console.log(`⚠️ Transcript truncated from ~${estimatedTokens} to ~${estimateTokenCount(transcript)} tokens to fit ${model} model limits. Proceeding with generation.`);
      }
    } catch (error) {
      console.error('Transcript fetch failed:', error);
      return res.status(400).json({
        success: false,
        message: "Sorry, this video does not have a proper format and clear pronunciation. Please try another video."
      });
    }

    // STEP 2: Generate AI images for all free models
    // Free tier → use Google custom search for image links
    let img_with_url = [];
    console.log('🎨 Generating images for free models using Google Search...');
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
      // Continue without images – note generation must not fail because of this
    }

    // STEP 3: Generate PDF content using appropriate AI
    console.log(`Generating PDF content with ${model} model...`);
    console.log(`Language: ${settings?.language || 'English'}, Detail Level: ${settings?.detailLevel || 'Standard Notes'}`);
    
    const images_json = JSON.stringify(img_with_url);
    const ai_prompt = getModelPrompt(model, transcript, prompt, images_json, videoUrl, settings);

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

    // Use appropriate API based on subscription status
    let response;
    const modelLimits = MODEL_TOKEN_LIMITS[model];
    
    if (isSubscribed) {
      // Subscribed users get premium model with higher limits
      console.log('Using premium OpenRouter model for subscribed user');
      response = await premiumOpenRouterChatCompletion(messages, {
        temperature: 0.7,
        max_tokens: modelLimits.maxOutputTokens,
        timeout: 120000
      });
    } else {
      // Free users use the free model queue
      console.log('Using free OpenRouter models');
      response = await openRouterChatCompletion(messages, {
        temperature: 0.7,
        max_tokens: modelLimits.maxOutputTokens,
        timeout: 90000
      });
    }

    if (!response.success) {
      throw new Error(`AI generation failed: ${response.error}`);
    }

    console.log('AI content generation completed successfully');

    // STEP 4: Create complete note with all generated content
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
      content: stripMarkdownFences(response.content),
      status: 'completed',
      visibility: 'public',
      img_with_url: img_with_url,
      generationDetails: {
        model: model,
        language: settings?.language || 'English',
        detailLevel: mapDetailLevel(settings?.detailLevel) || 'Standard Notes',
        prompt: prompt || "",
        format: format || 'notes',
        flashcardCount: flashcardCount,
        generatedAt: new Date(),
        processingTime: processingTime,
        type: isSubscribed ? 'premium' : 'free',
        cost: isSubscribed ? 0 : TOKEN_COST_PER_GENERATION,
        aiModel: response.model
      },
    });

    await newNote.save();

    // STEP 5: Update user - deduct tokens if not subscribed
    let remainingTokens = user.tokens;
    if (!isSubscribed) {
      remainingTokens = await deductTokens(user, TOKEN_COST_PER_GENERATION, newNote._id, model);
      console.log(`Deducted ${TOKEN_COST_PER_GENERATION} tokens. Remaining: ${remainingTokens}`);
    } else {
      // Just add to note creation history for subscribed users
      if (!user.noteCreationHistory) user.noteCreationHistory = [];
      user.noteCreationHistory.push({
        noteId: newNote._id,
        model: model,
        createdAt: new Date(),
        videoTitle: videoTitle
      });
      
      // Add to notes array
      if (!user.notes) user.notes = [];
      user.notes.push({ noteId: newNote._id });
      
      await user.save();
    }

    console.log('Complete note generation finished successfully:', newNote._id);

    // STEP 6: Return complete note with all AI-generated content
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
      message: isSubscribed ? 
        "Premium note generated successfully with AI content!" : 
        "Note generated successfully with AI content!",
      videoTitle: videoTitle,
      videoDuration: videoDuration ? formatDuration(videoDuration) : 'Unknown',
      generationSettings: {
        language: settings?.language || 'English',
        detailLevel: mapDetailLevel(settings?.detailLevel) || 'Standard Notes',
        userPrompt: prompt || "No additional instructions"
      },
      tokenInfo: isSubscribed ? {
        type: 'premium',
        message: 'You have unlimited access as a subscriber'
      } : {
        type: 'free',
        tokensDeducted: TOKEN_COST_PER_GENERATION,
        remainingTokens: remainingTokens,
        message: `${TOKEN_COST_PER_GENERATION} tokens deducted from your account`
      }
    });

  } catch (error) {
    console.error('Error creating free note:', error);
    
    res.status(500).json({
      success: false,
      message: "Failed to generate note",
      error: error.message
    });
  }
};

exports.getVideoInfo = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required"
      });
    }

    // Validate YouTube URL
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid YouTube URL"
      });
    }

    const videoInfo = await fetchYouTubeInfo(videoUrl);
    
    // Add plan-based duration limit info
    if (videoInfo.duration) {
      videoInfo.planLimits = {
        free: { maxDuration: PLAN_VIDEO_LIMITS.free, formatted: formatDuration(PLAN_VIDEO_LIMITS.free), allowed: videoInfo.duration <= PLAN_VIDEO_LIMITS.free },
        scholar: { maxDuration: PLAN_VIDEO_LIMITS.scholar, formatted: formatDuration(PLAN_VIDEO_LIMITS.scholar), allowed: videoInfo.duration <= PLAN_VIDEO_LIMITS.scholar },
        pro: { maxDuration: PLAN_VIDEO_LIMITS.pro, formatted: formatDuration(PLAN_VIDEO_LIMITS.pro), allowed: videoInfo.duration <= PLAN_VIDEO_LIMITS.pro },
        power: { maxDuration: null, formatted: 'Unlimited', allowed: true }
      };

      // Backward compatibility
      if (videoInfo.duration > MAX_FREE_VIDEO_LENGTH) {
        videoInfo.tooLongForFree = true;
        videoInfo.maxFreeDuration = MAX_FREE_VIDEO_LENGTH;
        videoInfo.maxFreeDurationFormatted = formatDuration(MAX_FREE_VIDEO_LENGTH);
      }
    }
    
    res.json({
      success: true,
      ...videoInfo
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch video information",
      error: error.message
    });
  }
};

// Additional helper function to check note status
exports.getNoteStatus = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    
    const note = await Note.findOne({ _id: noteId, owner: userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    res.json({
      success: true,
      status: note.status,
      content: note.content,
      transcript: note.transcript,
      error: note.error,
      img_with_url: note.img_with_url,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      generationDetails: note.generationDetails
    });
  } catch (error) {
    console.error('Error fetching note status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch note status",
      error: error.message
    });
  }
};

// Get user's notes
exports.getUserNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const notes = await Note.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title slug status videoUrl createdAt updatedAt visibility generationDetails content img_with_url');

    const total = await Note.countDocuments({ owner: userId });

    res.json({
      success: true,
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalNotes: total
    });
  } catch (error) {
    console.error('Error fetching user notes:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message
    });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ _id: noteId, owner: userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
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
      message: "Note deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message
    });
  }
};

// Get user's recent completed notes
exports.getRecentNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recentNotes = await Note.find({ 
      owner: userId, 
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
    console.error('Error fetching recent notes:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent notes",
      error: error.message
    });
  }
};

// Get completed note details
exports.getNoteDetails = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    
    const note = await Note.findOne({ _id: noteId, owner: userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
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
        prompt: note.generationDetails?.prompt,
        settings: note.generationDetails?.settings,
        visibility: note.visibility
      }
    });
  } catch (error) {
    console.error('Error fetching note details:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch note details",
      error: error.message
    });
  }
};

// Reset OpenRouter model failures (useful for testing)
exports.resetOpenRouterModels = async (req, res) => {
  try {
    failedOpenRouterModels.clear();
    console.log('🔄 OpenRouter failed models reset');
    
    res.json({
      success: true,
      message: "OpenRouter model failures reset successfully",
      currentQueue: openRouterModelQueue
    });
  } catch (error) {
    console.error('Error resetting OpenRouter models:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reset OpenRouter models",
      error: error.message
    });
  }
};

// Get OpenRouter model status
exports.getOpenRouterModelStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      modelQueue: openRouterModelQueue,
      failedModels: Array.from(failedOpenRouterModels),
      workingModels: openRouterModelQueue.filter(m => !failedOpenRouterModels.has(m)),
      totalModels: openRouterModelQueue.length
    });
  } catch (error) {
    console.error('Error fetching OpenRouter model status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch OpenRouter model status",
      error: error.message
    });
  }
};

// Get model token limits
exports.getModelTokenLimits = async (req, res) => {
  try {
    res.json({
      success: true,
      models: FREE_MODELS,
      tokenLimits: MODEL_TOKEN_LIMITS,
      tokenCostPerGeneration: TOKEN_COST_PER_GENERATION
    });
  } catch (error) {
    console.error('Error fetching model token limits:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch model token limits",
      error: error.message
    });
  }
};

// Check if user has enough tokens
exports.checkTokenBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('tokens membership');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isSubscribed = user.membership?.isActive === true;

    res.json({
      success: true,
      tokens: user.tokens,
      isSubscribed: isSubscribed,
      canGenerate: isSubscribed || user.tokens >= TOKEN_COST_PER_GENERATION,
      tokenCostPerGeneration: TOKEN_COST_PER_GENERATION,
      message: isSubscribed ? 
        "You have unlimited access as a subscriber" : 
        `You have ${user.tokens} tokens. Each generation costs ${TOKEN_COST_PER_GENERATION} tokens.`
    });
  } catch (error) {
    console.error('Error checking token balance:', error);
    res.status(500).json({
      success: false,
      message: "Failed to check token balance",
      error: error.message
    });
  }
};

// Check transcript token count for a specific model
exports.checkTranscriptTokens = async (req, res) => {
  try {
    const { videoUrl, model } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required"
      });
    }

    if (!model || !FREE_MODELS.includes(model)) {
      return res.status(400).json({
        success: false,
        message: "Valid model is required"
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
    const modelLimits = MODEL_TOKEN_LIMITS[model];
    const isWithinLimit = estimatedTokens <= modelLimits.maxInputTokens;

    res.json({
      success: true,
      transcriptLength: transcript.length,
      estimatedTokens,
      modelLimits: modelLimits,
      isWithinLimit,
      message: isWithinLimit ? 
        `Transcript is within ${model} token limits` : 
        `Transcript exceeds ${model} token limit by ${estimatedTokens - modelLimits.maxInputTokens} tokens`
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