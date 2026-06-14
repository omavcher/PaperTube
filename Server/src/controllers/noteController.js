const mongoose = require("mongoose");
const Note = require("../models/Note");
const User = require("../models/User");

const Folder = require("../models/Folder");
const { getTranscript } = require('../youtube-transcript');
const {GoogleGenAI} = require("@google/genai");
const { google } = require("googleapis");
const html_to_pdf = require("html-pdf-node");
dotenv = require("dotenv");
const axios = require('axios');
const jwt = require("jsonwebtoken");


const GoogleDriveService = require('../services/googleDriveService');
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

  // Add this method to fix the error
  getAvailableKeysCount() {
    return this.keyManager.getAvailableKeysCount();
  }

  getStatus() {
    return this.keyManager.getStatus();
  }
}

// Initialize Gemini Client
const geminiClient = new GeminiClient();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY,
});

// Function to extract video ID from YouTube URL
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

async function generateImgGEnAI(transcript) {
  if (!transcript) {
    throw new Error("Transcript is required for image generation!");
  }

  const prompt = `For the following transcript, generate figure names in a strict JSON array format. 
- Minimum 1 and Maximum 5 items. 
- Do not add any extra text, explanation, or formatting. 
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




    const resultText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

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
            console.error("Final legacy JSON parse attempt failed:", e3.message);
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
    console.error("Error generating image data:", err);
    return null; // Fail gracefully
  }
}

async function generatePDFContent(note, images_json) {
  if (!note.transcript || !note.videoUrl) {
    throw new Error("Transcript and video URL are required!");
  }

  const prompt = `
  You are an AI that generates **rich PDF-ready HTML content** from a timestamped video transcript.
  
  **CRITICAL REQUIREMENTS:**
  - Output ONLY pure HTML content without any <style> blocks, <html>, <head>, or <body> tags
  - Use inline styles ONLY for styling
  - Do NOT include CSS classes or external stylesheets
  - Do NOT wrap content in any container elements like <div class="content-wrapper">
  

IMPORTANT: If you include any CSS styling, it must be inline using style attributes only. Do not generate <style> tags or CSS classes. The output should be ready-to-use HTML content that can be directly inserted into a PDF generator.
  
  **Content Structure & Styling:**
  1. **Timestamps:** Only include for main headings (<h2>) and very important points
     - Use format: <a href="URL&t=Xs" style="margin-left: 10px; color: #007BFF; text-decoration: none; font-weight: bold;">watch Xs</a>
     - Skip if timestamp is 0s
     - Place at end of heading or paragraph
  
  2. **Styling (INLINE ONLY):**
     - Use style attributes for all styling
     - Colors: #2C3E50 (dark blue), #27AE60 (green), #E67E22 (orange), #007BFF (blue)
     - Font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
     - Layout: Use <div> with inline styles for sections
  
  3. **Images:** Use provided image links: ${images_json}
     - Format: <img src="URL" style="max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  
  4. **Organization:**
     - Use proper heading hierarchy: <h1>, <h2>, <h3>
     - Use <ul>/<li> for lists
     - Use <table> with inline styling for data
     - Use <section> or <div> with background colors for content blocks
     - Highlight key points with background colors
  
  **Video Information:**
  - URL: ${note.videoUrl}
  - Transcript: ${note.transcript}
  
  **Generate ONLY the HTML content** - no explanations, no markdown, no style blocks.
  `;

  try {
    const response = await geminiClient.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (err) {
    console.error("Error generating PDF content:", err);
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

    return endpoint.params;
  } catch (error) {
    console.error("Error fetching video params:", error);
    return null;
  }
}

// Function to fetch YouTube transcript
const fetchTranscript = async (videoId) => {
  try {
    const params = await getVideoParams(videoId);
    
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

// Get all notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving notes", error: error.message });
  }
};

async function ytinfo(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      console.error("❌ Invalid YouTube URL, no video ID found");
      return null;
    }

    const response = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoId,
    });

    if (!response.data.items.length) {
      console.error("❌ No video found for this URL");
      return null;
    }

    const video = response.data.items[0].snippet;
    return { title: video.title, thumbnail: video.thumbnails.high.url };
  } catch (err) {
    console.error("❌ Error fetching video info:", err.message);
    return null;
  }
}

// Create note from YouTube URL with full token and history tracking
// controllers/freeNoteController.js - UPDATED SYNCHRONOUS VERSION

// ... (keep all your existing imports and helper functions)

exports.createNote = async (req, res) => {
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

    // Validate free model
    if (!FREE_MODELS.includes(model)) {
      return res.status(400).json({
        success: false,
        message: "Invalid free model selected"
      });
    }

    // Get actual token cost for the model
    const actualTokenCost = MODEL_TOKEN_COSTS[model] || 25;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has enough tokens
    if (user.token < actualTokenCost) {
      return res.status(403).json({
        success: false,
        code: "INSUFFICIENT_TOKENS",
        message: `You need ${actualTokenCost} tokens to use this model`,
        requiredTokens: actualTokenCost,
        availableTokens: user.token
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
      
      // Check video duration limit for free users
      if (videoDuration && videoDuration > MAX_FREE_VIDEO_LENGTH) {
        const formattedDuration = formatDuration(videoDuration);
        const maxFormattedDuration = formatDuration(MAX_FREE_VIDEO_LENGTH);
        
        return res.status(403).json({
          success: false,
          code: "VIDEO_TOO_LONG",
          message: `This video is ${formattedDuration} long. Free users can only process videos up to ${maxFormattedDuration}.`,
          videoDuration: formattedDuration,
          maxAllowedDuration: maxFormattedDuration,
          upgradeRequired: true
        });
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
      // Continue with default title if video info fetch fails
    }

    // Start the synchronous note generation process
    console.log('Starting note generation process...');
    
    // Extract video ID and fetch transcript
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    console.log('Fetching transcript...');
    let transcript;
    try {
      transcript = await getTranscript(videoId);
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is empty or unavailable for this video');
      }
    } catch (error) {
      console.error('Transcript fetch failed:', error);
      return res.status(400).json({
        success: false,
        message: "Sorry, this video does not have a proper format and clear pronunciation. Please try another video."
      });
    }

    // Generate images for canvas model
    let img_with_url = [];
    if (model === 'canvas') {
      console.log('Generating images for canvas model...');
      const figures = await generateImgGEnAI(transcript);
      if (figures && figures.length > 0) {
        img_with_url = await generateImgObjects(figures);
      }
    }

    // Get model-specific prompt
    const images_json = JSON.stringify(img_with_url);
    const ai_prompt = getModelPrompt(model, transcript, prompt, images_json, videoUrl);

    // Generate HTML content using Groq
    console.log(`Generating content with ${model} model...`);
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

    // Add timeout for Groq API
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout after 60 seconds')), 60000);
    });

    const groqPromise = groqClient.chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = await Promise.race([groqPromise, timeoutPromise]);

    if (!response.success) {
      throw new Error(`AI generation failed: ${response.error}`);
    }

    // Generate slug from title
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const note_slug = (videoTitle || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50) + "-" + randomSuffix;

    // Create note only after all processing is complete
    const newNote = new Note({
      owner: userId,
      videoUrl,
      videoId,
      title: videoTitle,
      slug: note_slug,
      transcript: transcript,
      content: response.content,
      status: 'completed',
      visibility: 'private',
      img_with_url: img_with_url,
      generatedAt: new Date()
    });

    await newNote.save();

    // Deduct tokens after successful note creation
    user.token -= actualTokenCost;
    user.usedToken += actualTokenCost;
    
    // Add to token usage history
    user.tokenUsageHistory.push({
      name: `Note generation with ${model}`,
      tokens: actualTokenCost
    });
    
    // Add note to user's notes array
    user.notes.push({ noteId: newNote._id });
    await user.save();

    console.log('Note generation completed successfully:', newNote._id);

    // Return the complete note immediately
    res.status(201).json({
      success: true,
      message: "Note generated successfully",
      newNote: {
        _id: newNote._id,
        slug: newNote.slug,
        title: newNote.title,
        status: newNote.status,
        videoUrl: newNote.videoUrl,
        model: model,
        cost: actualTokenCost,
        createdAt: newNote.createdAt,
        content: newNote.content,
        transcript: newNote.transcript,
        img_with_url: newNote.img_with_url
      },
      usedTokens: actualTokenCost,
      remainingTokens: user.token
    });

  } catch (error) {
    console.error('Error creating free note:', error);
    
    // Refund tokens if processing fails
    if (user && actualTokenCost) {
      try {
        user.token += actualTokenCost;
        user.usedToken -= actualTokenCost;
        await user.save();
      } catch (refundError) {
        console.error('Error refunding tokens:', refundError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to generate note",
      error: error.message
    });
  }
};

// Get single note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving note", error: error.message });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error: error.message });
  }
};

exports.getYouTubeInfo = async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ message: "Video URL is required" });
  }
  try {
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      console.error("❌ Invalid YouTube URL, no video ID found");
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    const response = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoId,
    });

    if (!response.data.items.length) {
      console.error("❌ No video found for this URL");
      return res.status(404).json({ message: "No video found for this URL" });
    }

    const video = response.data.items[0].snippet;

    res.status(200).json({ 
      title: video.title, 
      thumbnail: video.thumbnails.high.url 
    });
  } catch (err) {
    console.error("❌ Error fetching video info:", err.message);
    res.status(500).json({ message: "Error fetching video info", error: err.message });
  }
}

exports.getNoteBySlug = async (req, res) => {
  try {
    const user = req.user;
    
    const note = await Note.findOne({ slug: req.params.slug }).select('-generationDetails -img_with_url -viewHistory -transcript -videoId');
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        message: "Access denied. You are not the owner of this note." 
      });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving note", error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const user = req.user;
    
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        message: "Access denied. You are not the owner of this note." 
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error: error.message });
  }
};

exports.getUserNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'updatedAt', sortOrder = 'desc', folderId } = req.query;
    
    const userId = req.user._id;

    let matchQuery = { owner: new mongoose.Types.ObjectId(userId) };
    let fcMatchQuery = { owner: new mongoose.Types.ObjectId(userId) };
    let testMatchQuery = { owner: new mongoose.Types.ObjectId(userId) };

    // Apply folder filtering if specified
    if (folderId) {
      if (folderId === 'root') {
        const rootFilter = { $or: [{ folderId: null }, { folderId: { $exists: false } }] };
        matchQuery = { ...matchQuery, ...rootFilter };
        fcMatchQuery = { ...fcMatchQuery, ...rootFilter };
        testMatchQuery = { ...testMatchQuery, ...rootFilter };
      } else {
        matchQuery.folderId = new mongoose.Types.ObjectId(folderId);
        fcMatchQuery.folderId = new mongoose.Types.ObjectId(folderId);
        testMatchQuery.folderId = new mongoose.Types.ObjectId(folderId);
      }
    }
    
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      
      const searchConditions = [{ $or: [{ title: searchRegex }, { content: searchRegex }, { transcript: searchRegex }] }];
      const fcSearchConditions = [{ $or: [{ title: searchRegex }, { transcript: searchRegex }] }];
      const testSearchConditions = [{ $or: [{ title: searchRegex }, { transcript: searchRegex }] }];

      if (folderId === 'root') {
        matchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            { $or: [{ folderId: null }, { folderId: { $exists: false } }] },
            ...searchConditions
          ]
        };
        fcMatchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            { $or: [{ folderId: null }, { folderId: { $exists: false } }] },
            ...fcSearchConditions
          ]
        };
        testMatchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            { $or: [{ folderId: null }, { folderId: { $exists: false } }] },
            ...testSearchConditions
          ]
        };
      } else if (folderId) {
        matchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            { folderId: new mongoose.Types.ObjectId(folderId) },
            ...searchConditions
          ]
        };
        fcMatchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            { folderId: new mongoose.Types.ObjectId(folderId) },
            ...fcSearchConditions
          ]
        };
        testMatchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            { folderId: new mongoose.Types.ObjectId(folderId) },
            ...testSearchConditions
          ]
        };
      } else {
        matchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            ...searchConditions
          ]
        };
        fcMatchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            ...fcSearchConditions
          ]
        };
        testMatchQuery = {
          $and: [
            { owner: new mongoose.Types.ObjectId(userId) },
            ...testSearchConditions
          ]
        };
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Use unionWith to combine notes, flashcardsets, and practice tests
    const pipeline = [
      { $match: matchQuery },
      { $addFields: { type: 'note' } },
      { $project: { __v: 0, content: 0, transcript: 0, img_with_url: 0 } },
      {
        $unionWith: {
          coll: 'flashcardsets',
          pipeline: [
            { $match: fcMatchQuery },
            { $addFields: { type: 'flashcard' } },
            { $project: { __v: 0, flashcards: 0, transcript: 0 } }
          ]
        }
      },
      {
        $unionWith: {
          coll: 'practicetests',
          pipeline: [
            { $match: testMatchQuery },
            { $addFields: { type: 'test' } },
            { $project: { __v: 0, questions: 0, transcript: 0 } }
          ]
        }
      },
      { $sort: sortOptions },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limitNum }]
        }
      }
    ];

    const results = await Note.aggregate(pipeline);
    
    const totalNotes = results[0].metadata.length > 0 ? results[0].metadata[0].total : 0;
    const items = results[0].data;
    
    const totalPages = Math.ceil(totalNotes / limitNum);

    const transformedNotes = items.map(item => ({
      _id: item._id,
      title: item.title,
      slug: item.slug,
      thumbnail: item.thumbnail,
      videoUrl: item.videoUrl,
      videoId: item.videoId,
      type: item.type, // 'note', 'flashcard', or 'test'
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastEdit: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : null
    }));

    return res.status(200).json({
      success: true,
      message: totalNotes === 0 
        ? "No notes found. Create your first note/flashcard!" 
        : "Items fetched successfully",
      data: {
        notes: transformedNotes,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalNotes,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error("❌ Get User Notes Error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error while fetching user notes" 
    });
  }
};



// Update your generatePDF function in noteController.js
// In your noteController.js, update the generatePDF function:

// In your noteController.js, update the generatePDF function:


const marked = require('marked');

const THEMES = [
  // --- LIGHT THEMES ---
  {
    id: 'atmosphere',
    name: 'Atmosphere',
    category: 'light',
    bg: '#fafafa',
    text: '#18181b',
    primary: '#db2777',
    accent: '#7c3aed',
    cardBg: '#f4f4f5',
    border: '#e4e4e7',
    link: '#c084fc',
    btnText: '#ffffff',
    font: "'Inter', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    desc: 'Clean pink and lavender glassmorphism light theme'
  },
  {
    id: 'snow',
    name: 'Snow',
    category: 'light',
    bg: '#ffffff',
    text: '#1f2937',
    primary: '#0ea5e9',
    accent: '#0284c7',
    cardBg: '#f3f4f6',
    border: '#e5e7eb',
    link: '#38bdf8',
    btnText: '#ffffff',
    font: "'DM Sans', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
    desc: 'Brilliant white background with clear sky blue highlights'
  },
  {
    id: 'cream',
    name: 'Cream',
    category: 'light',
    bg: '#fffdf9',
    text: '#27272a',
    primary: '#d97706',
    accent: '#f59e0b',
    cardBg: '#faf5e6',
    border: '#e9dfc6',
    link: '#ea580c',
    btnText: '#ffffff',
    font: "'Lora', serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    desc: 'Soft ivory background with warm butterscotch details'
  },
  {
    id: 'cotton',
    name: 'Cotton',
    category: 'light',
    bg: '#f8fafc',
    text: '#334155',
    primary: '#f43f5e',
    accent: '#ec4899',
    cardBg: '#f1f5f9',
    border: '#e2e8f0',
    link: '#fb7185',
    btnText: '#ffffff',
    font: "'Nunito', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap',
    desc: 'Cozy slate-white theme with soft cherry-red features'
  },
  {
    id: 'emerald-light',
    name: 'Emerald Light',
    category: 'light',
    bg: '#f0fdf4',
    text: '#14532d',
    primary: '#059669',
    accent: '#10b981',
    cardBg: '#dcfce7',
    border: '#bbf7d0',
    link: '#10b981',
    btnText: '#ffffff',
    font: "'Plus Jakarta Sans', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    desc: 'Refreshing pastel green field guide style'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    category: 'light',
    bg: '#faf5ff',
    text: '#3b0764',
    primary: '#7c3aed',
    accent: '#a78bfa',
    cardBg: '#f3e8ff',
    border: '#e9d5ff',
    link: '#9f7aea',
    btnText: '#ffffff',
    font: "'Quicksand', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap',
    desc: 'Gentle pale purple and violet watercolor aesthetic'
  },
  {
    id: 'peach',
    name: 'Peach',
    category: 'light',
    bg: '#fffaf0',
    text: '#7c2d12',
    primary: '#ea580c',
    accent: '#f97316',
    cardBg: '#ffedd5',
    border: '#fed7aa',
    link: '#f97316',
    btnText: '#ffffff',
    font: "'Poppins', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
    desc: 'Warm cream-orange tone with sweet apricot highlights'
  },
  {
    id: 'sakura',
    name: 'Sakura',
    category: 'light',
    bg: '#fff5f5',
    text: '#4a1d1d',
    primary: '#db2777',
    accent: '#f472b6',
    cardBg: '#ffe4e6',
    border: '#fecdd3',
    link: '#db2777',
    btnText: '#ffffff',
    font: "'Zen Maru Gothic', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap',
    desc: 'Japanese cherry blossom pink theme with crimson lettering'
  },
  {
    id: 'sky',
    name: 'Sky',
    category: 'light',
    bg: '#f0f9ff',
    text: '#0c4a6e',
    primary: '#0369a1',
    accent: '#38bdf8',
    cardBg: '#e0f2fe',
    border: '#bae6fd',
    link: '#0ea5e9',
    btnText: '#ffffff',
    font: "'Outfit', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
    desc: 'Airy light blue horizon theme with clear sky tones'
  },
  {
    id: 'mint',
    name: 'Mint',
    category: 'light',
    bg: '#f0fdfb',
    text: '#134e4a',
    primary: '#0f766e',
    accent: '#2dd4bf',
    cardBg: '#ccfbf1',
    border: '#99f6e4',
    link: '#0d9488',
    btnText: '#ffffff',
    font: "'Figtree', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap',
    desc: 'Crisp fresh mint and teal tones for an energetic clean feel'
  },

  // --- PROFESSIONAL THEMES ---
  {
    id: 'kraft',
    name: 'Kraft',
    category: 'professional',
    bg: '#f4efe4',
    text: '#2d241e',
    primary: '#8b5a2b',
    accent: '#cd853f',
    cardBg: '#eae3d2',
    border: '#d7cdb2',
    link: '#a0522d',
    btnText: '#ffffff',
    font: "'Crimson Pro', Georgia, serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&display=swap',
    desc: 'Vintage organic paper style with elegant brown serif typography'
  },
  {
    id: 'academic',
    name: 'Academic',
    category: 'professional',
    bg: '#ffffff',
    text: '#0f172a',
    primary: '#1e293b',
    accent: '#475569',
    cardBg: '#f8fafc',
    border: '#e2e8f0',
    link: '#3b82f6',
    btnText: '#ffffff',
    font: "'Source Serif 4', Georgia, serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap',
    desc: 'Clean, neutral-light layouts standard for research and thesis'
  },
  {
    id: 'sepia',
    name: 'Sepia',
    category: 'professional',
    bg: '#f4ecd8',
    text: '#433422',
    primary: '#5c4033',
    accent: '#8b5a2b',
    cardBg: '#eae0c8',
    border: '#d3c2a0',
    link: '#8b4513',
    btnText: '#ffffff',
    font: "'EB Garamond', Georgia, serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap',
    desc: 'Warm reading-friendly antique paper tone with dark brown text'
  },
  {
    id: 'oxford',
    name: 'Oxford',
    category: 'professional',
    bg: '#f8fafc',
    text: '#0f172a',
    primary: '#0f172a',
    accent: '#334155',
    cardBg: '#f1f5f9',
    border: '#cbd5e1',
    link: '#1e3a8a',
    btnText: '#ffffff',
    font: "'Playfair Display', Georgia, serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap',
    desc: 'Classic British library aesthetic with navy and heavy borders'
  },
  {
    id: 'executive',
    name: 'Executive',
    category: 'professional',
    bg: '#ffffff',
    text: '#1c1917',
    primary: '#44403c',
    accent: '#78716c',
    cardBg: '#f5f5f4',
    border: '#e7e5e4',
    link: '#292524',
    btnText: '#ffffff',
    font: "'IBM Plex Sans', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
    desc: 'High-contrast charcoal on warm white corporate layout'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'professional',
    bg: '#fafafa',
    text: '#18181b',
    primary: '#09090b',
    accent: '#27272a',
    cardBg: '#f4f4f5',
    border: '#e4e4e7',
    link: '#09090b',
    btnText: '#ffffff',
    font: "'Space Grotesk', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
    desc: 'Ultra-clean layout stripped of all decorative colors'
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    category: 'professional',
    bg: '#f8fbff',
    text: '#1e3a5f',
    primary: '#1d4ed8',
    accent: '#3b82f6',
    cardBg: '#eff6ff',
    border: '#bfdbfe',
    link: '#2563eb',
    btnText: '#ffffff',
    font: "'Roboto Mono', monospace",
    googleFont: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap',
    desc: 'Technical drafting-inspired blue-on-white engineering theme'
  },
  {
    id: 'linen',
    name: 'Linen',
    category: 'professional',
    bg: '#faf8f5',
    text: '#3d2b1f',
    primary: '#6b4c3b',
    accent: '#a07050',
    cardBg: '#f2ede7',
    border: '#e0d5c8',
    link: '#8b5e3c',
    btnText: '#ffffff',
    font: "'Merriweather', Georgia, serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    desc: 'Natural off-white linen texture with earthy warm tones'
  },

  // --- COLORFUL THEMES ---
  {
    id: 'coral',
    name: 'Coral',
    category: 'colorful',
    bg: '#fff8f6',
    text: '#7f1d1d',
    primary: '#e11d48',
    accent: '#f97316',
    cardBg: '#ffe4e1',
    border: '#fecaca',
    link: '#e11d48',
    btnText: '#ffffff',
    font: "'Raleway', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap',
    desc: 'Vibrant coral and warm orange tones on a light blush base'
  },
  {
    id: 'violet-mist',
    name: 'Violet Mist',
    category: 'colorful',
    bg: '#fdf4ff',
    text: '#4a044e',
    primary: '#9333ea',
    accent: '#c026d3',
    cardBg: '#fae8ff',
    border: '#f0abfc',
    link: '#a21caf',
    btnText: '#ffffff',
    font: "'Josefin Sans', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;600;700&display=swap',
    desc: 'Dreamy fuchsia and violet mist with soft purple highlights'
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    category: 'colorful',
    bg: '#fffbf0',
    text: '#78350f',
    primary: '#f59e0b',
    accent: '#f97316',
    cardBg: '#fef3c7',
    border: '#fde68a',
    link: '#d97706',
    btnText: '#ffffff',
    font: "'Cabin', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&display=swap',
    desc: 'Golden sunrise warmth with amber and orange glow on cream'
  },
  {
    id: 'breeze',
    name: 'Breeze',
    category: 'colorful',
    bg: '#f0f7ff',
    text: '#1e3a5f',
    primary: '#2563eb',
    accent: '#06b6d4',
    cardBg: '#dbeafe',
    border: '#bfdbfe',
    link: '#0284c7',
    btnText: '#ffffff',
    font: "'Karla', sans-serif",
    googleFont: 'https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700;800&display=swap',
    desc: 'Fresh coastal breeze with cerulean blue and cyan highlights'
  }
];

exports.generatePDF = async (req, res) => {
  try {
    const { noteId } = req.query;
    
    console.log("📄 PDF Generation Request for note:", noteId);

    if (!noteId) {
      return res.status(400).json({ 
        success: false, 
        message: "Note ID is required" 
      });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: "Note not found" 
      });
    }

    // Verify user session to check subscription (Clean vs Watermarked PDF)
    let isPremium = false;
    const authHeader = req.header('Auth') || req.header('Authorization');
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          const decoded = jwt.verify(token, process.env.SESSION_SECRET);
          const user = await User.findById(decoded.id);
          if (user && user.membership?.isActive === true) {
            isPremium = true;
          }
        } catch (jwtErr) {
          console.warn("JWT verification in PDF generation failed:", jwtErr.message);
        }
      }
    }

    console.log(`` + `✅ Found note: ${note.title}. PDF Tier determined: ${isPremium ? 'Premium (No Watermark)' : 'Free (Watermarked)'}`);
    console.log("🔄 Generating new PDF with images...");

    // Convert Markdown to HTML if needed
    let rawContent = note.content || '';
    let processedContent = '';

    // Simple check: if it contains common HTML tags, assume it's HTML. Otherwise, treat as Markdown.
    if (rawContent.includes('<h1') || rawContent.includes('<p>') || rawContent.includes('<div')) {
      processedContent = rawContent;
    } else {
      processedContent = marked.parse(rawContent);
    }
    
    // Extract all image URLs from the content (handles both HTML and Markdown style)
    const imgRegex = /<img[^>]+src="([^">]+)"|!\\[[^\\]]*\\]\\(([^)]+)\\)/g;
    const imgUrls = [];
    let match;
    
    while ((match = imgRegex.exec(processedContent)) !== null) {
      // match[1] is for HTML, match[2] is for Markdown
      const url = match[1] || match[2];
      if (url && !imgUrls.push(url)) imgUrls.push(url);
    }

    console.log(`📸 Found ${imgUrls.length} images to process`);

    // Download and convert images to base64 concurrently for faster PDF generation
    const imageMap = {};
    
    if (imgUrls.length > 0) {
      console.log(`🔄 Downloading ${imgUrls.length} images concurrently...`);
      await Promise.allSettled(imgUrls.map(async (imgUrl) => {
        try {
          const imageResponse = await axios.get(imgUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
          });
          
          const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
          const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
          imageMap[imgUrl] = `data:${contentType};base64,${base64Image}`;
        } catch (imgError) {
          console.error(`❌ Failed to download image ${imgUrl.substring(0, 50)}...:`, imgError.message);
          // Fallback placeholder
          imageMap[imgUrl] = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-family='Arial' font-size='16'%3EImage failed to load%3C/text%3E%3C/svg%3E`;
        }
      }));
      console.log(`` + `✅ Image downloading complete.`);
    }

    // Replace the URLs in content with data URLs
    imgUrls.forEach(url => {
      if (imageMap[url]) {
        // Use split/join to replace all occurrences without regex escaping issues
        processedContent = processedContent.split(url).join(imageMap[url]);
      }
    });

    // Determine the theme dynamically
    const activeThemeId = note.generationDetails?.theme || 'atmosphere';
    const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

    const displayBg = theme.bg;
    const displayText = theme.text;
    const displayBorder = theme.border;
    const displayCardBg = theme.cardBg;
    const displayFont = theme.font || "'Inter', sans-serif";

    // Create HTML with embedded images and premium styling
    const completeHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${note.title}</title>
        ${theme.googleFont ? `<link rel="stylesheet" href="${theme.googleFont}">` : `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">`}
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: ${displayFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            color: ${displayText}; 
            padding: 50px 60px;
            line-height: 1.7;
            max-width: 1000px;
            margin: 0 auto;
            background: ${displayBg};
          }
          h1 { 
            color: ${theme.primary}; 
            font-size: 36px;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin-bottom: 8px;
            line-height: 1.2;
          }
          h2 { 
            color: ${theme.primary}; 
            font-size: 24px;
            font-weight: 700;
            margin-top: 40px;
            margin-bottom: 16px;
            border-bottom: 2px solid ${displayBorder};
            padding-bottom: 8px;
          }
          h3 { 
            color: ${theme.primary}; 
            font-size: 20px;
            font-weight: 600;
            margin-top: 30px;
            margin-bottom: 12px;
          }
          h4 {
            color: ${theme.primary};
            font-size: 16px;
            font-weight: 600;
            margin-top: 24px;
            margin-bottom: 10px;
          }
          p { 
            margin-bottom: 18px;
            font-size: 15px;
            color: ${displayText};
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            margin: 24px auto;
            display: block;
            border: 1px solid ${displayBorder};
          }
          .content {
            margin-top: 32px;
          }
          code {
            background-color: ${displayCardBg};
            color: ${theme.accent};
            padding: 3px 6px;
            border-radius: 6px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            border: 1px solid ${displayBorder};
          }
          pre {
            background-color: ${displayCardBg};
            color: ${displayText};
            padding: 20px;
            border-radius: 12px;
            overflow-x: auto;
            margin: 24px 0;
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            border: 1px solid ${displayBorder};
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          pre code {
            background-color: transparent;
            color: inherit;
            border: none;
            padding: 0;
          }
          blockquote {
            background-color: ${displayCardBg};
            border-left: 4px solid ${theme.primary};
            padding: 16px 20px;
            border-radius: 0 12px 12px 0;
            margin: 24px 0;
            color: ${displayText};
            font-style: italic;
          }
          table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            margin: 24px 0;
            font-size: 15px;
            border-radius: 12px;
            border: 1px solid ${displayBorder};
            overflow: hidden;
            background-color: ${displayCardBg};
          }
          th, td {
            border-bottom: 1px solid ${displayBorder};
            padding: 14px 16px;
            text-align: left;
            color: ${displayText};
          }
          th {
            background-color: ${displayBorder};
            font-weight: 600;
            color: ${theme.primary};
          }
          tr:last-child td {
            border-bottom: none;
          }
          ul, ol {
            margin: 18px 0;
            padding-left: 28px;
            color: ${displayText};
          }
          li {
            margin-bottom: 10px;
            font-size: 15px;
          }
          li::marker {
            color: ${theme.primary};
            font-weight: 600;
          }
          hr {
            border: none;
            border-top: 2px solid ${displayBorder};
            margin: 40px 0;
          }
          .header-meta {
            color: #64748b; 
            font-size: 14px; 
            margin-bottom: 32px; 
            display: flex; 
            gap: 24px;
            font-weight: 500;
          }
          @media print {
            * {
              font-family: ${displayFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            }
            body {
              padding: 0;
              background: ${displayBg} !important;
              color: ${displayText} !important;
            }
            img {
              max-width: 100% !important;
              page-break-inside: avoid;
            }
            h2, h3, h4 {
              page-break-after: avoid;
              color: ${theme.primary} !important;
            }
            p, ul, ol, blockquote, pre {
              page-break-inside: avoid;
            }
            table {
              page-break-inside: auto;
            }
            tr, td, th {
              page-break-inside: avoid;
            }
          }
          ${!isPremium ? `
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 70px;
            font-weight: 900;
            color: rgba(220, 38, 38, 0.05);
            pointer-events: none;
            z-index: 9999;
            text-transform: uppercase;
            letter-spacing: 5px;
            white-space: nowrap;
          }
          ` : ''}
        </style>
      </head>
      <body>
        ${!isPremium ? '<div class="watermark">Paperxify Free Tier</div>' : ''}
        <header>
          <h1 style="color: ${theme.primary};">${note.title}</h1>
          <div class="header-meta">
            <span>Created: ${new Date(note.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            ${note.videoUrl ? `<span>Source: YouTube Video</span>` : ''}
          </div>
        </header>
        
        <main class="content">
          ${processedContent}
        </main>
        
        <div style="margin-top: 60px; padding: 24px 32px; border-top: 2px solid ${displayBorder}; font-family: ${displayFont}, sans-serif; display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; background-color: ${displayCardBg}; border-radius: 16px; page-break-inside: avoid;">
          <div>
            <a href="https://paperxify.com" style="text-decoration: none;">
              <span style="font-size: 20px; font-weight: 800; font-style: italic; letter-spacing: -0.5px; text-transform: uppercase; color: ${theme.primary};">Paper<span style="color: ${theme.accent};">Xify</span></span>
            </a>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">AI Knowledge Synthesis</div>
          </div>
          <div>
            <a href="https://paperxify.com" style="color: ${displayText}; font-size: 12px; text-decoration: none; font-weight: 600;">
              Convert any YouTube Video to PDF <span style="color: ${theme.primary}; font-weight: 900; margin-left: 6px;">&#8594;</span>
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("✅ HTML generated with embedded images");

    const options = {
      format: 'A4',
      margin: {
        top: '40px',
        right: '40px',
        bottom: '40px',
        left: '40px'
      },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 30000, // 30 second timeout for large PDFs
      waitUntil: 'networkidle0' // Wait for all resources to load
    };

    const file = { content: completeHTML };
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);

    console.log("✅ PDF generated, size:", (pdfBuffer.length / 1024 / 1024).toFixed(2), "MB");

    const fileName = `${note.title.replace(/[^\w\s.-]/gi, '_').substring(0, 80)}_${Date.now()}.pdf`;
    const base64PDF = pdfBuffer.toString('base64');
    
    res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      data: {
        pdf: base64PDF,
        fileName: fileName,
        generatedAt: new Date(),
        noteTitle: note.title,
        imagesEmbedded: imgUrls.length
      }
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).json({ 
      success: false, 
      message: "PDF generation failed", 
      error: error.message
    });
  }
};

// Delete PDF from Google Drive
exports.deletePDF = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userAccessToken = req.headers['x-google-access-token'];
    
    if (!userAccessToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Google access token required" 
      });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: "Note not found" 
      });
    }

    if (!note.pdf_data?.fileId) {
      return res.status(404).json({ 
        success: false, 
        message: "PDF not found for this note" 
      });
    }

    // Delete from Google Drive
    await GoogleDriveService.deleteFile(note.pdf_data.fileId, userAccessToken);
    
    // Remove PDF data from note
    note.pdf_data = undefined;
    await note.save();

    res.status(200).json({
      success: true,
      message: "PDF deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting PDF:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete PDF", 
      error: error.message 
    });
  }
};

// Get user's PDF list from Google Drive
exports.getUserPDFs = async (req, res) => {
  try {
    const userAccessToken = req.headers['x-google-access-token'];
    
    if (!userAccessToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Google access token required" 
      });
    }

    const pdfs = await GoogleDriveService.listUserPDFs(userAccessToken);
    
    res.status(200).json({
      success: true,
      message: "PDFs retrieved successfully",
      data: pdfs.map(pdf => ({
        id: pdf.id,
        name: pdf.name,
        viewLink: pdf.webViewLink,
        downloadLink: pdf.webContentLink,
        thumbnailLink: pdf.thumbnailLink,
        size: pdf.size,
        createdTime: pdf.createdTime
      }))
    });
  } catch (error) {
    console.error("❌ Error getting user PDFs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve PDFs", 
      error: error.message 
    });
  }
};

// New endpoint to check API key status
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

// Explore, public notes, and comments features have been permanently removed.


// Get user analytics for profile page (comments removed)
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get basic note statistics in single query
    const notesStats = await Note.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          totalViews: { $sum: "$views" },
          publicNotes: {
            $sum: { $cond: [{ $eq: ["$visibility", "public"] }, 1, 0] }
          },
          privateNotes: {
            $sum: { $cond: [{ $eq: ["$visibility", "private"] }, 1, 0] }
          },
          noteIds: { $push: "$_id" },
          latestNotes: {
            $push: {
              id: "$_id",
              title: "$title",
              slug: "$slug",
              thumbnail: "$thumbnail",
              views: "$views",
              createdAt: "$createdAt"
            }
          }
        }
      }
    ]);

    if (notesStats.length === 0) {
      return res.status(200).json({
        success: true,
        data: getEmptyAnalyticsResponse()
      });
    }

    const stats = notesStats[0];
    const noteIds = stats.noteIds;

    // Get comments statistics in parallel
    const [viewsOverTime, notesOverTime, activityData] = await Promise.all([
      // Views over time (last 30 days)
      getViewsOverTime(noteIds),
      
      // Notes created over time (last 12 months)
      getNotesOverTime(userId),
      
      // Activity calendar data
      getActivityData(userId)
    ]);

    const commentsData = {
      totalComments: 0,
      totalReplies: 0,
      totalLikes: 0
    };

    const totalEngagement = commentsData.totalComments + commentsData.totalReplies + commentsData.totalLikes;

    // Top performing notes
    const topNotes = stats.latestNotes
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(note => ({
        id: note.id,
        title: note.title,
        slug: note.slug,
        thumbnail: note.thumbnail,
        views: note.views || 0,
        comments: 0, // Will be populated separately if needed
        likes: 0,
        engagement: 0
      }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalNotes: stats.totalNotes,
          totalViews: stats.totalViews,
          totalComments: commentsData.totalComments,
          totalReplies: commentsData.totalReplies,
          totalLikes: commentsData.totalLikes,
          totalEngagement,
          publicNotes: stats.publicNotes,
          privateNotes: stats.privateNotes
        },
        viewsOverTime,
        notesOverTime,
        activityData,
        topNotes
      }
    });

  } catch (error) {
    console.error("❌ Get User Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message
    });
  }
};

// Helper function for views over time
async function getViewsOverTime(noteIds) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const viewsData = await Note.aggregate([
    { $match: { _id: { $in: noteIds } } },
    { $unwind: { path: "$viewHistory", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { "viewHistory.date": { $gte: thirtyDaysAgo } },
          { "viewHistory.date": { $exists: false } }
        ]
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$viewHistory.date"
          }
        },
        views: { $sum: "$viewHistory.count" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in missing dates
  const viewsMap = new Map(viewsData.map(item => [item._id, item.views]));
  const viewsOverTime = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dateKey = date.toISOString().split('T')[0];
    viewsOverTime.push({
      date: dateKey,
      views: viewsMap.get(dateKey) || 0
    });
  }

  return viewsOverTime;
}

// Helper function for notes over time
async function getNotesOverTime(userId) {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const notesData = await Note.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Fill in missing months
  const notesMap = new Map();
  notesData.forEach(item => {
    const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
    notesMap.set(key, item.count);
  });

  const notesOverTime = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    
    notesOverTime.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: notesMap.get(key) || 0
    });
  }

  return notesOverTime;
}

// Helper function for activity data
async function getActivityData(userId) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const activityData = await Note.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: oneYearAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const activityMap = new Map(activityData.map(item => [item._id, item.count]));
  
  // Generate complete activity data for the last year
  const completeActivityData = [];
  const now = new Date();
  
  for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    completeActivityData.push({
      date: dateKey,
      count: activityMap.get(dateKey) || 0
    });
  }

  return completeActivityData;
}

function getEmptyAnalyticsResponse() {
  const viewsOverTime = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    viewsOverTime.push({
      date: date.toISOString().split('T')[0],
      views: 0
    });
  }

  const notesOverTime = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    notesOverTime.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: 0
    });
  }

  const activityData = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
    activityData.push({
      date: d.toISOString().split('T')[0],
      count: 0
    });
  }

  return {
    summary: {
      totalNotes: 0,
      totalViews: 0,
      totalComments: 0,
      totalReplies: 0,
      totalLikes: 0,
      totalEngagement: 0,
      publicNotes: 0,
      privateNotes: 0
    },
    viewsOverTime,
    notesOverTime,
    activityData,
    topNotes: []
  };
}




// Delete a note and its associated comments
exports.deleteNote = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const userId = req.user._id;
    const noteId = req.params.id;

    // Check if note exists and belongs to user
    const note = await Note.findOne({ _id: noteId, owner: userId }).session(session);
    
    if (!note) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Note not found or you don't have permission to delete it"
      });
    }

    // Delete note
    const deleteNoteResult = await Note.deleteOne({ _id: noteId, owner: userId }).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: {
        noteId: noteId
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Delete Note Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting note",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// controllers/noteController.js

// Bulk delete notes (without transactions for standalone MongoDB)
exports.bulkDeleteNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { noteIds } = req.body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Note IDs array is required"
      });
    }

    // Validate note IDs
    const validNoteIds = noteIds.filter(id => {
      try {
        new mongoose.Types.ObjectId(id);
        return true;
      } catch {
        return false;
      }
    });

    if (validNoteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid note IDs provided"
      });
    }

    // Convert to ObjectId
    const objectIds = validNoteIds.map(id => new mongoose.Types.ObjectId(id));

    // Verify all notes belong to user
    const userNotes = await Note.find({
      _id: { $in: objectIds },
      owner: userId
    }).select('_id');

    const userNoteIds = userNotes.map(note => note._id.toString());
    
    // Check if user has permission to delete all requested notes
    if (userNoteIds.length !== objectIds.length) {
      const unauthorizedNotes = objectIds.filter(id => 
        !userNoteIds.includes(id.toString())
      );
      
      return res.status(403).json({
        success: false,
        message: `You don't have permission to delete ${unauthorizedNotes.length} note(s)`,
        unauthorizedCount: unauthorizedNotes.length
      });
    }

    // Delete notes
    const deleteNotesResult = await Note.deleteMany({ 
      _id: { $in: objectIds }, 
      owner: userId 
    });

    res.status(200).json({
      success: true,
      message: `${deleteNotesResult.deletedCount} notes deleted successfully`,
      data: {
        notesDeleted: deleteNotesResult.deletedCount,
        requestedCount: noteIds.length,
        processedCount: validNoteIds.length
      }
    });

  } catch (error) {
    console.error("❌ Bulk Delete Notes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting notes",
      error: error.message
    });
  }
};

// Also fix the single delete note function
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    // Check if note exists and belongs to user
    const note = await Note.findOne({ _id: noteId, owner: userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you don't have permission to delete it"
      });
    }

    // Delete note
    const deleteNoteResult = await Note.deleteOne({ _id: noteId, owner: userId });

    if (deleteNoteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: {
        noteId: noteId
      }
    });

  } catch (error) {
    console.error("❌ Delete Note Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting note",
      error: error.message
    });
  }
};

// Update note visibility
exports.updateNoteVisibility = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;
    const { visibility } = req.body;

    if (!['public', 'private', 'unlisted'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visibility value"
      });
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, owner: userId },
      { visibility },
      { new: true, runValidators: true }
    ).select('_id title visibility');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you don't have permission to update it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Note visibility updated successfully",
      data: note
    });

  } catch (error) {
    console.error("❌ Update Note Visibility Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating note visibility",
      error: error.message
    });
  }
};

// Get note by ID for editing
exports.getNoteForEdit = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, owner: userId })
      .select('-__v')
      .lean();

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you don't have permission to edit it"
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });

  } catch (error) {
    console.error("❌ Get Note for Edit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching note",
      error: error.message
    });
  }
};



// Update note
exports.updateNoteedit = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;
    const updates = req.body;

    // Allowed fields to update
    const allowedUpdates = ['title', 'visibility'];
    const requestedUpdates = Object.keys(updates);
    
    const isValidOperation = requestedUpdates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: `Invalid updates! Only allowed: ${allowedUpdates.join(', ')}`
      });
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, owner: userId },
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you don't have permission to update it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note
    });

  } catch (error) {
    console.error("❌ Update Note Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating note",
      error: error.message
    });
  }
};



// Get detailed analytics for a specific note
exports.getNoteAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    // Verify note belongs to user
    const note = await Note.findOne({ _id: noteId, owner: userId });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you don't have permission to view analytics"
      });
    }

    // Generate views over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const viewsOverTime = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateKey = date.toISOString().split('T')[0];
      const viewsOnDate = note.viewHistory?.filter(vh => {
        const vhDate = new Date(vh.date);
        return vhDate.toISOString().split('T')[0] === dateKey;
      }).reduce((sum, vh) => sum + (vh.count || 1), 0) || 0;
      
      viewsOverTime.push({
        date: dateKey,
        views: viewsOnDate
      });
    }

    res.status(200).json({
      success: true,
      data: {
        viewsOverTime,
        engagementMetrics: {
          totalComments: 0,
          totalReplies: 0,
          totalLikes: note.likes || 0,
          uniqueCommenters: 0,
          topEngagers: []
        }
      }
    });

  } catch (error) {
    console.error("❌ Get Note Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching note analytics",
      error: error.message
    });
  }
};             


exports.likeNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Check if user already liked the note
    const alreadyLiked = note.likedBy?.includes(userId);
    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this note"
      });
    }

    // Update like count and likedBy array
    note.likes = (note.likes || 0) + 1;
    note.likedBy = note.likedBy || [];
    note.likedBy.push(userId);
    await note.save();

    res.status(200).json({
      success: true,
      message: "Note liked successfully",
      data: {
        noteId: note._id,
        likes: note.likes
      }
    });

  } catch (error) {
    console.error("❌ Like Note Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error liking note",
      error: error.message
    });
  }
}





// --- FOLDER CRUD CONTROLLERS ---

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Folder name is required" });
    }
    const folder = new Folder({
      name: name.trim(),
      owner: req.user._id
    });
    await folder.save();
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A folder with this name already exists" });
    }
    res.status(500).json({ success: false, message: "Error creating folder", error: error.message });
  }
};

// Get all folders of user
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id }).sort({ name: 1 });
    
    // For each folder, let's also count how many notes/flashcards are inside it!
    const folderData = await Promise.all(folders.map(async (folder) => {
      const noteCount = await Note.countDocuments({ owner: req.user._id, folderId: folder._id });
      const flashcardCount = await mongoose.model('FlashcardSet').countDocuments({ owner: req.user._id, folderId: folder._id });
      return {
        ...folder.toObject(),
        count: noteCount + flashcardCount
      };
    }));
    
    res.status(200).json({ success: true, data: folderData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching folders", error: error.message });
  }
};

// Rename a folder
exports.renameFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Folder name is required" });
    }
    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, owner: req.user._id },
      { name: name.trim() },
      { new: true }
    );
    if (!folder) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }
    res.status(200).json({ success: true, data: folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A folder with this name already exists" });
    }
    res.status(500).json({ success: false, message: "Error renaming folder", error: error.message });
  }
};

// Delete a folder
exports.deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder = await Folder.findOneAndDelete({ _id: folderId, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }
    // Update all notes & flashcards in this folder to have folderId = null
    await Note.updateMany({ owner: req.user._id, folderId }, { $set: { folderId: null } });
    await mongoose.model('FlashcardSet').updateMany({ owner: req.user._id, folderId }, { $set: { folderId: null } });
    
    res.status(200).json({ success: true, message: "Folder deleted and contents moved to root" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting folder", error: error.message });
  }
};

// Move note or flashcard to a folder
exports.moveNoteToFolder = async (req, res) => {
  try {
    const { itemId, itemType, folderId } = req.body;
    if (!itemId || !itemType) {
      return res.status(400).json({ success: false, message: "itemId and itemType are required" });
    }
    
    let targetFolderId = null;
    if (folderId && folderId !== 'root') {
      const folderExists = await Folder.findOne({ _id: folderId, owner: req.user._id });
      if (!folderExists) {
        return res.status(404).json({ success: false, message: "Target folder not found or access denied" });
      }
      targetFolderId = folderExists._id;
    }
    
    let updatedItem = null;
    if (itemType === 'note') {
      updatedItem = await Note.findOneAndUpdate(
        { _id: itemId, owner: req.user._id },
        { $set: { folderId: targetFolderId } },
        { new: true }
      );
    } else if (itemType === 'flashcard') {
      updatedItem = await mongoose.model('FlashcardSet').findOneAndUpdate(
        { _id: itemId, owner: req.user._id },
        { $set: { folderId: targetFolderId } },
        { new: true }
      );
    } else if (itemType === 'test') {
      updatedItem = await mongoose.model('PracticeTest').findOneAndUpdate(
        { _id: itemId, owner: req.user._id },
        { $set: { folderId: targetFolderId } },
        { new: true }
      );
    } else {
      return res.status(400).json({ success: false, message: "Invalid itemType (must be 'note', 'flashcard', or 'test')" });
    }
    
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item not found or access denied" });
    }
    
    res.status(200).json({ success: true, message: "Item moved successfully", data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error moving item", error: error.message });
  }
};