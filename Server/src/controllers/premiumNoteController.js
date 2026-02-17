// controllers/premiumNoteController.js
const User = require('../models/User');
const Note = require('../models/Note');
const { GoogleGenAI } = require("@google/genai");
const crypto = require('crypto');
const { getTranscript } = require('../youtube-transcript');

const PREMIUM_MODELS = ['parikshasarthi', 'vyavastha', 'sarlakruti'];
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
  },
  sarlakruti: { 
    maxLength: 'unlimited', 
    features: ['compression', 'smart_summary', 'jargon_buster', 'simplified_explanations'],
    description: 'Smart compression and summary features'
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

// API Key Manager Class
class GeminiAPIKeyManager {
  constructor() {
    this.apiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3
    ].filter(key => key && key !== 'your_first_api_key' && key !== 'your_second_api_key' && key !== 'your_third_api_key');
    
    this.currentKeyIndex = 0;
    this.failedKeys = new Set();
    this.retryDelays = new Map();
  }

  getCurrentKey() {
    return this.apiKeys[this.currentKeyIndex];
  }

  getCurrentKeyIndex() {
    return this.currentKeyIndex;
  }

  markKeyFailed(keyIndex, retryDelayMs = 0) {
    this.failedKeys.add(keyIndex);
    
    if (retryDelayMs > 0) {
      const retryTime = Date.now() + retryDelayMs;
      this.retryDelays.set(keyIndex, retryTime);
      console.log(`⏰ Key ${keyIndex + 1} will be retried in ${retryDelayMs}ms`);
    }

    this.switchToNextKey();
  }

  switchToNextKey() {
    const originalIndex = this.currentKeyIndex;
    let attempts = 0;

    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      attempts++;

      // If we've tried all keys, check if any are ready for retry
      if (attempts >= this.apiKeys.length) {
        this.cleanExpiredFailures();
        if (this.failedKeys.size === this.apiKeys.length) {
          throw new Error('All API keys are currently rate limited');
        }
      }
    } while (
      this.failedKeys.has(this.currentKeyIndex) || 
      !this.isKeyReady(this.currentKeyIndex)
    );

    console.log(`🔄 Switched from key ${originalIndex + 1} to key ${this.currentKeyIndex + 1}`);
  }

  isKeyReady(keyIndex) {
    if (!this.retryDelays.has(keyIndex)) return true;
    
    const retryTime = this.retryDelays.get(keyIndex);
    return Date.now() >= retryTime;
  }

  cleanExpiredFailures() {
    const now = Date.now();
    for (const [keyIndex, retryTime] of this.retryDelays.entries()) {
      if (now >= retryTime) {
        this.retryDelays.delete(keyIndex);
        this.failedKeys.delete(keyIndex);
        console.log(`♻️ Key ${keyIndex + 1} is now available again`);
      }
    }
  }

  getAvailableKeysCount() {
    this.cleanExpiredFailures();
    return this.apiKeys.length - this.failedKeys.size;
  }

  getStatus() {
    return {
      totalKeys: this.apiKeys.length,
      availableKeys: this.getAvailableKeysCount(),
      currentKeyIndex: this.currentKeyIndex,
      failedKeys: Array.from(this.failedKeys),
      retryDelays: Object.fromEntries(this.retryDelays)
    };
  }
}

// Gemini Client Wrapper
class GeminiClient {
  constructor() {
    this.keyManager = new GeminiAPIKeyManager();
    this.ai = null;
    this.initializeAI();
  }

  initializeAI() {
    const currentKey = this.keyManager.getCurrentKey();
    this.ai = new GoogleGenAI({
      apiKey: currentKey
    });
  }

  async makeRequest(operation, ...args) {
    const maxRetries = this.keyManager.apiKeys.length * 2;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt + 1} with key ${this.keyManager.getCurrentKeyIndex() + 1}`);
        }

        const result = await this.ai.models[operation](...args);
        return result;

      } catch (error) {
        lastError = error;
        const currentKeyIndex = this.keyManager.getCurrentKeyIndex();
        
        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          const retryDelay = this.extractRetryDelay(error);
          console.warn(`⏳ Rate limit hit on key ${currentKeyIndex + 1}. Retry in ${retryDelay}ms. Error: ${error.message}`);
          
          this.keyManager.markKeyFailed(currentKeyIndex, retryDelay);
          this.initializeAI();
          
          // Wait before retrying with new key
          if (retryDelay > 0) {
            await this.delay(Math.min(retryDelay, 10000)); // Max 10 second delay
          }
          
          continue;
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    throw new Error(`All API keys exhausted after ${maxRetries} attempts. Last error: ${lastError.message}`);
  }

  isRateLimitError(error) {
    return error.status === 429 || 
           error.message?.includes('429') ||
           error.message?.includes('quota') ||
           error.message?.includes('RESOURCE_EXHAUSTED') ||
           error.message?.includes('rate limit') ||
           error.message?.includes('QUOTA_EXCEEDED');
  }

  extractRetryDelay(error) {
    // Extract retry delay from error message
    const delayMatch = error.message?.match(/Please retry in ([0-9.]+)s/) ||
                      error.message?.match(/retryDelay["']?:\s*["']?([0-9.]+)s/) ||
                      error.message?.match(/retryDelay["']?:\s*["']?(\d+)s/);
    
    if (delayMatch) {
      return parseFloat(delayMatch[1]) * 1000;
    }
    
    // Default exponential backoff
    return Math.min(1000 * Math.pow(2, this.keyManager.failedKeys.size), 30000);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Proxy methods for common operations
  async generateContent(...args) {
    return this.makeRequest('generateContent', ...args);
  }

  getAvailableKeysCount() {
    return this.keyManager.getAvailableKeysCount();
  }

  getStatus() {
    return this.keyManager.getStatus();
  }
}

// Initialize Gemini Client
const geminiClient = new GeminiClient();

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

// Function to get image links from Google Custom Search
const getImgLink = async (query, count = 1) => {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

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
      "instagram.com",
      "facebook.com",
      "twitter.com",
      "youtube.com",
      "youtube.in",
      "tiktok.com",
      "snapchat.com",
      "linkedin.com",
      "flickr.com",
      "vimeo.com",
      "quora.com",
      "medium.com",
      "whatsapp.com",
      "telegram.org",
      "discord.com",
      "weibo.com",
      "vk.com",
      "twitch.tv",
      "netflix.com",
      "hulu.com",
      "primevideo.com",
      "spotify.com",
      "soundcloud.com",
      "bandcamp.com",
      "mixcloud.com",
      "patreon.com",
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

async function generateImgGEnAI(transcript, language = 'English') {
  if (!transcript) {
    throw new Error("Transcript is required for image generation!");
  }

  const languageInstruction = language !== 'English' ? 
    `Generate figure names in ${language} language.` : 
    'Generate figure names in English.';

  const prompt = `For the following transcript, generate figure names in a strict JSON array format. 
- Minimum 1 and Maximum 5 items. 
- Do not add any extra text, explanation, or formatting. 
- ${languageInstruction}
- If the transcript is NOT about educational, technical, or book-related content, return "none". 
- If no figure is required (because no proper educational figure exists), return "none". 

Transcript:
${transcript}
`;

  try {
    const response = await geminiClient.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const resultText = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!resultText || resultText.toLowerCase().includes("none")) {
      return null;
    }

    let figures;
    try {
      figures = JSON.parse(resultText);
    } catch {
      const cleaned = resultText
        .replace(/```json|```/g, "")
        .replace(/[\r\n]/g, "")
        .trim();
      figures = JSON.parse(cleaned);
    }

    console.log("Generated Figures:", figures);
    return figures;
  } catch (err) {
    console.error("Error generating image data:", err);
    throw err;
  }
}

async function getVideoParams(videoId) {
  const body = {
    context: {
      client: {
        hl: "en-GB",
        gl: "IN",
        clientName: "WEB",
        clientVersion: "2.20250828.01.00",
        originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
        platform: "DESKTOP",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36,gzip(gfe)",
      },
      user: { lockedSafetyMode: false },
      request: { useSsl: true },
    },
    videoId,
    captionsRequested: true,
  };

  try {
    const response = await fetch("https://www.youtube.com/youtubei/v1/next?prettyPrint=false", {
      headers: {
        "content-type": "application/json",
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "same-origin",
        "sec-fetch-site": "same-origin",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": "2.20250828.01.00",
        "Referer": `https://www.youtube.com/watch?v=${videoId}`,
      },
      body: JSON.stringify(body),
      method: "POST",
    });

    const data = await response.json();

    function findTranscriptEndpoint(res) {
      try {
        const engagementPanels = res?.engagementPanels || [];
        for (const panel of engagementPanels) {
          const renderer = panel?.engagementPanelSectionListRenderer?.content?.continuationItemRenderer;
          if (renderer?.continuationEndpoint?.getTranscriptEndpoint) {
            return renderer.continuationEndpoint.getTranscriptEndpoint;
          }
        }
        return null;
      } catch (error) {
        console.error("Error finding transcript endpoint:", error);
        return null;
      }
    }

    const endpoint = findTranscriptEndpoint(data);

    if (!endpoint) {
      console.warn("Transcript endpoint not found in response.");
    }

    return endpoint?.params;
  } catch (error) {
    console.error("Error fetching video params:", error);
    return null;
  }
}

// Enhanced transcript fetching with retry mechanism
const fetchTranscriptWithRetry = async (videoId, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const transcript = await fetchTranscript(videoId);
      if (transcript && transcript.trim().length > 0) {
        return transcript;
      }
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('All transcript fetch attempts failed');
};

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

// Premium Model-specific prompt templates
const getPremiumModelPrompt = (model, transcript, userPrompt, images_json, videoUrl, settings = {}) => {
  const { language = 'English' } = settings;

  // --- 1. SHARED CONFIGURATION ---
  const languageInstruction = language !== 'English' ? `Generate content in ${language}.` : 'Generate content in English.';
  const userInstructions = userPrompt ? `\n**User Note:** ${userPrompt}` : '';

  // The Base Prompt ensures technical compliance (No Markdown, Pure HTML)
  const basePrompt = `You are an elite educational AI using the ${model} engine. 
  Your task is to convert a video transcript into a **High-End, HTML-Formatted Study Document**.

  **TECHNICAL RULES (STRICT):**
  1. Output **ONLY HTML** content to go inside a <body> tag. DO NOT write <html>, <head>, or <body> tags.
  2. **NO MARKDOWN**. Do not use **bold**, ## headers, or tables in markdown. Use <b>, <h2>, <table> tags.
  3. **INLINE STYLES ONLY**. Do not generate <style> blocks. Every tag must have a style="..." attribute.
  4. **Font:** Use "Segoe UI, Roboto, Helvetica Neue, sans-serif".
  5. **Spacing:** Use generous padding/margin. No walls of text.
  
  **CONTEXT:**
  - ${languageInstruction}
  ${userInstructions}
  - Video URL for linking: ${videoUrl}
  `;

  // --- 2. THE FOOTER (Branding) ---
  const commonFooter = `
  <div style="margin-top: 60px; padding: 25px; background: linear-gradient(to right, #f8fafc, #e2e8f0); border-radius: 12px; text-align: center; border: 1px solid #cbd5e1;">
      <p style="margin: 0; color: #334155; font-weight: 800; font-size: 16px; letter-spacing: 0.5px;">🚀 GENERATED BY YT2PDF</p>
      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">
          Study Smarter, Not Harder. <a href="https://yt2pdf.in" style="color: #2563eb; text-decoration: none; font-weight: bold;">Create your own at YT2PDF.in</a>
      </p>
  </div>`;

  // --- 3. MODEL SPECIFIC PROMPTS ---

  // =========================================================
  // 🔥 MODEL: PARIKSHA-SARTHI (Exam-Focused Q&A)
  // Vibe: High Energy, Question Bank, Flashcards, "Important!"
  // =========================================================
  if (model === 'parikshasarthi') {
    return `${basePrompt}

    **MODE: PARIKSHA-SARTHI (Exam Q&A & Drill Master)**
    
    **Goal:** Create an active-recall study guide. Transform passive info into Questions, Answers, and Exam Tips.
    
    **Design Palette (Exam Vibes):**
    - **Headers:** Dark Red (#991b1b) for urgency.
    - **Questions:** Deep Blue Background (#eff6ff) with Blue Text (#1e40af).
    - **Answers:** Clean White Background with Left Green Border.
    - **Badges:** Gold/Yellow for "Exam Tips".

    **Required HTML Structure:**

    1.  **Title:** <h1 style="color: #991b1b; border-bottom: 4px solid #fca5a5; padding-bottom: 10px; margin-bottom: 30px;">🎯 Exam-Ready Q&A Notes</h1>

    2.  **The "Quick Cram" Summary (Top Section):**
        <div style="background-color: #fff1f2; border: 1px solid #fda4af; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
           <h3 style="margin-top:0; color: #be123c;">⚡ High-Yield Summary</h3>
           <p>... (Summary of core concepts likely to appear in exams) ...</p>
        </div>

    3.  **Q&A Cards (Repeat for 5-10 key concepts):**
        <div style="margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background-color: #1e40af; padding: 15px 20px; color: white;">
                <strong style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">QUESTION</strong>
                <span style="font-weight: 600;">(Insert Exam Style Question Here?)</span>
            </div>
            <div style="padding: 20px; background-color: white;">
                <p style="margin-top: 0; color: #374151; line-height: 1.6;">(Insert Detailed Answer Here)</p>
                <div style="margin-top: 10px; text-align: right;">
                    <a href="${videoUrl}" style="color: #6b7280; font-size: 12px; text-decoration: none;">▶ Verify at Timestamp</a>
                 </div>
            </div>
        </div>

    4.  **Exam Tip Box (Insert strictly where relevant):**
        <div style="background-color: #fefce8; border-left: 5px solid #ca8a04; padding: 15px; margin: 20px 0; color: #854d0e;">
            <strong>🔥 Exam Tip:</strong> (Insert tip on how to remember this or common mistakes students make).
        </div>

    **Execution:**
    - Analyze the transcript: "${transcript}"
    - Extract the most "examinable" concepts.
    - Format them strictly using the HTML components above.
    - ${commonFooter}
    `;
  }

  // =========================================================
  // 🏛️ MODEL: VYAVASTHA (The Organizer / Comprehensive)
  // Vibe: Academic, Structured, Table of Contents, Timeline
  // =========================================================
  else if (model === 'vyavastha') {
    return `${basePrompt}

    **MODE: VYAVASTHA (Comprehensive Structured Notes)**
    
    **Goal:** Create a highly organized, chronological, and deep-dive set of notes. Perfect for first-time learning.
    
    **Design Palette (Academic Vibes):**
    - **Headers:** Teal/Cyan Gradients.
    - **Sidebar:** Visual vertical lines to show hierarchy.
    - **Tables:** Clean, striped tables for data.

    **Required HTML Structure:**

    1.  **Title:** <h1 style="background: -webkit-linear-gradient(0deg, #0f766e, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; border-bottom: 2px solid #ccfbf1; padding-bottom: 15px;">📚 Comprehensive Lecture Notes</h1>

    2.  **Clickable Table of Contents (Top):**
        <div style="background-color: #f0fdfa; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #99f6e4;">
            <h3 style="margin-top:0; color: #0f766e;">📖 Table of Contents</h3>
            <ul style="list-style: none; padding-left: 0;">
                <li style="margin-bottom: 8px;">1. <a href="#topic1" style="color: #0d9488; text-decoration: none; font-weight: 500;">Topic Name</a> <span style="color:#94a3b8; font-size: 0.9em;">(00:00)</span></li>
                 </ul>
        </div>

    3.  **Deep Dive Sections (The Content):**
        <div id="topic1" style="margin-bottom: 40px;">
            <h2 style="color: #115e59; font-size: 24px; display: flex; align-items: center; gap: 10px;">
                <span style="background: #ccfbf1; color: #0f766e; padding: 5px 12px; border-radius: 20px; font-size: 0.6em;">00:00</span>
                Main Topic Heading
            </h2>
            
            <div style="border-left: 3px solid #e2e8f0; margin-left: 15px; padding-left: 20px; padding-top: 5px;">
                <p style="color: #334155; line-height: 1.7;">(Detailed explanation of the concept...)</p>
                
                <h4 style="color: #0d9488; margin-bottom: 5px;">Key Details:</h4>
                <ul style="color: #475569;">
                    <li>Detail point 1...</li>
                    <li>Detail point 2...</li>
                </ul>

                </div>
        </div>

    **Execution:**
    - Analyze the transcript: "${transcript}"
    - Create a structured hierarchy (H1 -> H2 -> H3).
    - Ensure EVERY main section has a visible timestamp.
    - If detailed data exists, use HTML tables (\`<table style="width:100%; border-collapse: collapse;">...\`).
    - ${commonFooter}
    `;
  }

  // =========================================================
  // 💡 MODEL: SARLAKRUTI (The Simplifier / Jargon Buster)
  // Vibe: Cheat Sheet, Glossary, Dictionary, Soft & Approachable
  // =========================================================
  else if (model === 'sarlakruti') {
    return `${basePrompt}

    **MODE: SARLAKRUTI (Smart Simplifier & Glossary)**
    
    **Goal:** Demystify complex topics. Create a "Cheat Sheet" with definitions, analogies, and a simplified summary.
    
    **Design Palette (Approachable Vibes):**
    - **Headers:** Soft Purple (#7c3aed) and Orange (#ea580c).
    - **Tables:** Alternating row colors.
    - **Cards:** Soft shadows, rounded corners.

    **Required HTML Structure:**

    1.  **Title:** <h1 style="color: #4c1d95; font-family: 'Georgia', serif; font-style: italic; border-bottom: 1px dashed #c4b5fd; padding-bottom: 15px;">✨ Simplified Notes & Glossary</h1>

    2.  **The "In A Nutshell" Summary:**
        <div style="background: linear-gradient(135deg, #fffbeb 0%, #fff 100%); padding: 25px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 40px;">
            <h2 style="color: #d97706; margin-top: 0;">🥜 In A Nutshell</h2>
            <p style="font-size: 18px; line-height: 1.6; color: #4b5563;">(Write a very simple, paragraph-form explanation of the video content here, as if explaining to a 10-year-old).</p>
        </div>

    3.  **Jargon Buster Table (The Core Feature):**
        <h2 style="color: #7c3aed;">📖 Jargon Buster (Glossary)</h2>
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #ddd6fe; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
            <thead>
                <tr style="background-color: #f5f3ff;">
                    <th style="padding: 12px; text-align: left; color: #5b21b6; border-bottom: 1px solid #ddd6fe;">Term</th>
                    <th style="padding: 12px; text-align: left; color: #5b21b6; border-bottom: 1px solid #ddd6fe;">Simple Definition</th>
                    <th style="padding: 12px; text-align: left; color: #5b21b6; border-bottom: 1px solid #ddd6fe;">Analogy/Example</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #1f2937;">(Complex Term)</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">(Definition)</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-style: italic;">(e.g., "Think of it like...")</td>
                </tr>
            </tbody>
        </table>

    4.  **"Did You Know?" Cards:**
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
            <strong style="color: #059669;">💡 Insight:</strong> (An interesting fact or simplified concept from the video).
        </div>

    **Execution:**
    - Analyze the transcript: "${transcript}"
    - Identify difficult words, technical jargon, or complex concepts.
    - Fill the "Jargon Buster" table.
    - Write the "In a Nutshell" summary using simple language.
    - ${commonFooter}
    `;
  }

  // Fallback to base prompt if no match
  return basePrompt; 
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

    // Check API key availability
    const availableKeys = geminiClient.getAvailableKeysCount();
    if (availableKeys === 0) {
      return res.status(503).json({
        success: false,
        code: "ALL_KEYS_RATE_LIMITED",
        message: "All API keys are currently rate limited. Please try again later.",
        retryAfter: "5 minutes"
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
    } catch (error) {
      console.error('Error fetching video info:', error);
      // Continue with default title if video info fetch fails
    }

    console.log('Starting premium note generation process...');
    console.log('Premium Model:', model, 'Settings:', { language: settings?.language, prompt });
    
    // STEP 1: Fetch transcript
    console.log('Fetching transcript...');
    let transcript;
    try {
      transcript = await getTranscript(videoId);
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is empty or unavailable for this video');
      }
      console.log(`Found ${transcript.split('\n').length} transcript segments`);
    } catch (error) {
      console.error('Transcript fetch failed:', error);
      throw new Error(`Could not fetch transcript: ${error.message}`);
    }

    // STEP 2: Generate images for premium models (all premium models support images)
    let img_with_url = [];
    console.log('Generating images for premium model...');
    const figures = await generateImgGEnAI(transcript, settings?.language);
    if (figures && figures.length > 0) {
      console.log(`Generated ${figures.length} figures, fetching images...`);
      img_with_url = await generateImgObjects(figures);
      // Filter out entries with null or invalid img_url
      img_with_url = img_with_url.filter(img => {
        if (!img.img_url || !img.img_url.trim().length) return false;
        try {
          new URL(img.img_url);
          return true;
        } catch {
          return false;
        }
      });
      console.log(`Found ${img_with_url.length} valid images`);
    }

    // STEP 3: Generate premium PDF content using Google Gemini AI
    console.log(`Generating premium PDF content with ${model} model using Gemini...`);
    
    const images_json = JSON.stringify(img_with_url);
    const ai_prompt = getPremiumModelPrompt(model, transcript, prompt, images_json, videoUrl, settings);

    // Use Google Gemini AI for premium models
    const response = await geminiClient.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: ai_prompt }] }],
    });

    const content = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
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
      content: content,
      status: 'completed',
      visibility: 'private',
      img_with_url: img_with_url,
      generationDetails: {
        model: model,
        language: settings?.language || 'English',
        detailLevel: mapDetailLevel(settings?.detailLevel) || 'Standard Notes',
        prompt: prompt || "",
        cost: 0,
        generatedAt: new Date(),
        processingTime: processingTime,
        type: 'premium',
      }
    });

    await newNote.save();

    // STEP 5: Add note to user's notes array
    if (!user.notes) user.notes = [];
    user.notes.push({ noteId: newNote._id });
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
        type: newNote.type,
        premiumFeatures: newNote.premiumFeatures,
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
        userPrompt: prompt || "No additional instructions",
        modelFeatures: PREMIUM_FEATURES[model]?.features || [],
        processingTime: `${processingTime} seconds`
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
      name: model.charAt(0).toUpperCase() + model.slice(1).replace(/([A-Z])/g, ' $1'),
      features: PREMIUM_FEATURES[model]?.features || [],
      description: PREMIUM_FEATURES[model]?.description || '',
      maxLength: PREMIUM_FEATURES[model]?.maxLength || 'unlimited'
    }));

    res.json({
      success: true,
      models
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

// Get API status
exports.getAPIStatus = async (req, res) => {
  try {
    const status = geminiClient.getStatus();
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting API status",
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
      type: 'premium' 
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title slug status videoUrl createdAt updatedAt generationDetails premiumFeatures content img_with_url');

    const total = await Note.countDocuments({ 
      owner: userId, 
      type: 'premium' 
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
      type: 'premium'
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
        type: note.type,
        premiumFeatures: note.premiumFeatures,
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
      type: 'premium'
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