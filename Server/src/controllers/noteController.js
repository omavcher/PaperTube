const mongoose = require("mongoose");
const Note = require("../models/Note");
const User = require("../models/User");
const Comment = require("../models/Comment");
const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const pdf = require('html-pdf');
const axios = require('axios');
const { Dropbox } = require('dropbox');
const { get } = require("mongoose");
const {GoogleGenAI} = require("@google/genai");
const { google } = require("googleapis");
const html_to_pdf = require("html-pdf-node");
dotenv = require("dotenv");

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

const fetch = require("node-fetch");

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
      transcript = await fetchTranscriptWithRetry(videoId);
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is empty or unavailable for this video');
      }
    } catch (error) {
      console.error('Transcript fetch failed:', error);
      throw new Error(`Could not fetch transcript: ${error.message}`);
    }

    // Generate images for bhashasetu model
    let img_with_url = [];
    if (model === 'bhashasetu') {
      console.log('Generating images for bhashasetu model...');
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
    const { page = 1, limit = 10, search = '', sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    
    const userId = req.user._id;

    let searchQuery = { owner: userId };
    
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      searchQuery.$and = [
        { owner: userId },
        {
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { transcript: searchRegex }
          ]
        }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const notes = await Note.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-__v -transcript')
      .lean();

    const totalNotes = await Note.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalNotes / limitNum);

    const transformedNotes = notes.map(note => ({
      _id: note._id,
      title: note.title,
      slug: note.slug,
      thumbnail: note.thumbnail,
      videoUrl: note.videoUrl,
      videoId: note.videoId,
      content: note.content,
      transcript: note.transcript,
      img_with_url: note.img_with_url || [],
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      lastEdit: note.updatedAt.toISOString().split('T')[0]
    }));

    return res.status(200).json({
      success: true,
      message: totalNotes === 0 
        ? "No notes found. Create your first note!" 
        : "Notes fetched successfully",
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

exports.generatePDF = async (req, res) => {
  try {
    const { noteId } = req.query;
    if (!noteId) return res.status(400).json({ success: false, message: "Note ID is required" });

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });

    if (note.pdf_data?.downloadUrl) {
      return res.status(200).json({
        success: true,
        message: "PDF already generated",
        data: note.pdf_data
      });
    }

    console.log("✅ Note found, generating PDF without Chrome...");

    const completeHTML = `
      <html>
      <head>
        <style>
          body { font-family: Arial; color: #333; padding: 20px; }
          h1 { color: #27AE60; border-bottom: 2px solid #27AE60; }
        </style>
      </head>
      <body>
        <h1>${note.title}</h1>
        ${note.content}
      </body>
      </html>
    `;

    const file = { content: completeHTML };
    const pdfBuffer = await html_to_pdf.generatePdf(file, { format: "A4" });

    console.log("✅ PDF generated, size:", pdfBuffer.length);

    const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
    const dropboxPath = `/pdfs/${note.title.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

    const uploadResult = await dbx.filesUpload({
      path: dropboxPath,
      contents: pdfBuffer,
      mode: { ".tag": "add" },
      autorename: true,
      mute: false,
    });

    const sharedLinkResult = await dbx.sharingCreateSharedLinkWithSettings({
      path: uploadResult.result.path_lower,
    });

    const downloadUrl = sharedLinkResult.result.url.replace("dl=0", "dl=1");

    note.pdf_data = { downloadUrl, fileSize: pdfBuffer.length };
    await note.save();

    res.status(200).json({
      success: true,
      message: "PDF generated and uploaded successfully (no Chrome)",
      data: {
        pdfUrl: downloadUrl,
        noteTitle: note.title,
        generatedAt: new Date(),
        fileSize: pdfBuffer.length,
      },
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).json({ success: false, message: "PDF generation failed", error: error.message });
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

exports.explore = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '', 
      sortBy = 'updatedAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build the base query for public notes only
    let searchQuery = { 
      visibility: "public" // Only show public notes in explore
    };
    
    // Add search functionality
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      searchQuery.$and = [
        { visibility: "public" },
        {
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { transcript: searchRegex }
          ]
        }
      ];
    }

    // Sort options
    const sortOptions = {};
    
    // Map frontend sort options to database fields
    switch (sortBy) {
      case 'lastEdit':
        sortOptions['updatedAt'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'dateCreated':
        sortOptions['createdAt'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'alphabetical':
        sortOptions['title'] = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortOptions['updatedAt'] = sortOrder === 'desc' ? -1 : 1;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch public notes with creator information populated
    const notes = await Note.find(searchQuery)
      .populate('owner', 'name picture') // Populate owner details from User model - use 'picture' not 'avatarUrl'
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-__v -transcript') // Don't send transcript to frontend for explore
      .lean();

    // Transform notes for frontend
    const transformedNotes = notes.map(note => ({
      _id: note._id,
      title: note.title,
      slug: note.slug,
      thumbnail: note.thumbnail,
      videoUrl: note.videoUrl,
      videoId: note.videoId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      lastEdit: note.updatedAt.toISOString().split('T')[0],
      // Include populated creator information - map 'picture' to 'avatarUrl' for frontend
      creator: note.owner ? {
        _id: note.owner._id,
        name: note.owner.name || 'Anonymous',
        avatarUrl: note.owner.picture // Use 'picture' from User model but send as 'avatarUrl' to frontend
      } : {
        _id: 'unknown',
        name: 'Anonymous',
        avatarUrl: null
      },
      // Optional: Add views count if you implement it later
      views: note.views || Math.floor(Math.random() * 1000) // Placeholder for now
    }));

    const totalNotes = await Note.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalNotes / limitNum);

    return res.status(200).json({
      success: true,
      message: totalNotes === 0 
        ? "No public notes found" 
        : "Explore notes fetched successfully",
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
    console.error("❌ Explore Notes Error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error while fetching explore notes" 
    });
  }
};

// Comment System Controllers

// Get comments for a note
exports.getComments = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    // Check if note exists
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Get comments with user data populated
    const comments = await Comment.find({ note: noteId })
      .populate('user', 'name picture')
      .populate('replies.user', 'name picture')
      .sort({ createdAt: -1 })
      .lean();

    // Transform comments to include userLiked status
    const userId = req.user?._id;
    const transformedComments = comments.map(comment => ({
      ...comment,
      userLiked: userId ? comment.userLiked.includes(userId) : false,
      replies: comment.replies.map(reply => ({
        ...reply,
        userLiked: userId ? reply.userLiked.includes(userId) : false
      }))
    }));

    res.status(200).json({
      success: true,
      data: {
        comments: transformedComments
      }
    });

  } catch (error) {
    console.error("❌ Get Comments Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message
    });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content, isAiResponse = false } = req.body;
    const user = req.user;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    // Check if note exists
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Create new comment
    const newComment = new Comment({
      content: content.trim(),
      user: user._id,
      note: noteId,
      isAiResponse
    });

    await newComment.save();

    // Populate user data for response
    await newComment.populate('user', 'name picture');

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: {
        comment: {
          ...newComment.toObject(),
          userLiked: false,
          replies: []
        }
      }
    });

  } catch (error) {
    console.error("❌ Create Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message
    });
  }
};

// Like/unlike a comment
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const userLiked = comment.userLiked.includes(user._id);
    
    if (userLiked) {
      // Unlike the comment
      comment.userLiked.pull(user._id);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like the comment
      comment.userLiked.push(user._id);
      comment.likes += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: userLiked ? "Comment unliked" : "Comment liked",
      data: {
        likes: comment.likes,
        userLiked: !userLiked
      }
    });

  } catch (error) {
    console.error("❌ Like Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Error liking comment",
      error: error.message
    });
  }
};

// Create a reply to a comment
exports.createReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, isAiResponse = false } = req.body;
    const user = req.user;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required"
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Create new reply
    const newReply = {
      content: content.trim(),
      user: user._id,
      isAiResponse,
      createdAt: new Date()
    };

    comment.replies.push(newReply);
    await comment.save();

    // Populate user data for the new reply
    const savedReply = comment.replies[comment.replies.length - 1];
    await savedReply.populate('user', 'name picture');

    res.status(201).json({
      success: true,
      message: "Reply created successfully",
      data: {
        reply: {
          ...savedReply.toObject(),
          userLiked: false
        }
      }
    });

  } catch (error) {
    console.error("❌ Create Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating reply",
      error: error.message
    });
  }
};

// Like/unlike a reply
exports.likeReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const user = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found"
      });
    }

    const userLiked = reply.userLiked.includes(user._id);
    
    if (userLiked) {
      // Unlike the reply
      reply.userLiked.pull(user._id);
      reply.likes = Math.max(0, reply.likes - 1);
    } else {
      // Like the reply
      reply.userLiked.push(user._id);
      reply.likes += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: userLiked ? "Reply unliked" : "Reply liked",
      data: {
        likes: reply.likes,
        userLiked: !userLiked
      }
    });

  } catch (error) {
    console.error("❌ Like Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Error liking reply",
      error: error.message
    });
  }
};


exports.getNoteALLBySlug = async (req, res) => {
  try {
    
    // Find note and populate owner details with more fields
    const note = await Note.findOne({ slug: req.params.slug })
      .populate('owner', 'name picture email') // Add more fields if needed
      .lean();

    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: "Note not found" 
      });
    }

    // Check permissions
    if (note.visibility !== "public") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. You are not the owner of this note." 
      });
    }

    // Increment view count
    await Note.findByIdAndUpdate(note._id, {
      $inc: { views: 1 },
      $set: { lastViewedAt: new Date() },
      $push: {
        viewHistory: {
          date: new Date(),
          count: 1
        }
      }
    });

    // Transform the note
    const transformedNote = {
      _id: note._id,
      title: note.title,
      slug: note.slug,
      thumbnail: note.thumbnail,
      videoUrl: note.videoUrl,
      videoId: note.videoId,
      content: note.content,
      transcript: note.transcript,
      img_with_url: note.img_with_url || [],
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      lastEdit: note.updatedAt.toISOString().split('T')[0],
      visibility: note.visibility || 'private',
      pdf_data: note.pdf_data || null,
      // Enhanced creator information
      creator: {
        _id: note.owner._id,
        name: note.owner.name || 'Anonymous',
        avatarUrl: note.owner.picture,
        email: note.owner.email, // If you want to include email
        // Add more fields as needed
      },
      views: (note.views || 0) + 1,
        };

    res.status(200).json({
      success: true,
      data: transformedNote
    });

  } catch (error) {
    console.error("❌ Get Note By Slug Error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error retrieving note", 
      error: error.message 
    });
  }
};



// Get user analytics for profile page
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
    const [commentsStats, viewsOverTime, notesOverTime, activityData] = await Promise.all([
      // Comments, replies, and likes count
      Comment.aggregate([
        { $match: { note: { $in: noteIds } } },
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 },
            totalReplies: { $sum: { $size: { $ifNull: ["$replies", []] } } },
            totalLikes: { $sum: "$likes" }
          }
        }
      ]),
      
      // Views over time (last 30 days)
      getViewsOverTime(noteIds),
      
      // Notes created over time (last 12 months)
      getNotesOverTime(userId),
      
      // Activity calendar data
      getActivityData(userId)
    ]);

    const commentsData = commentsStats.length > 0 ? commentsStats[0] : {
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



// Get user's notes with pagination and search
exports.getUserNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build match query
    const matchQuery = { owner: new mongoose.Types.ObjectId(userId) };
    
    if (search) {
      matchQuery.title = { $regex: search, $options: "i" };
    }

    // Get notes with comments count in single aggregation
    const notesData = await Note.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "note",
          as: "comments"
        }
      },
      {
        $addFields: {
          commentsCount: { $size: "$comments" },
          likesCount: { $sum: "$comments.likes" }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          thumbnail: 1,
          visibility: 1,
          createdAt: 1,
          updatedAt: 1,
          views: 1,
          slug: 1,
          fileType: 1,
          commentsCount: 1,
          likesCount: 1
        }
      },
      { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
      { $skip: skip },
      { $limit: limitNum }
    ]);

    // Get total count for pagination
    const totalCount = await Note.countDocuments(matchQuery);

    res.status(200).json({
      success: true,
      data: notesData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });

  } catch (error) {
    console.error("❌ Get User Notes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user notes",
      error: error.message
    });
  }
};

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

    // Delete note and its comments in parallel
    const [deleteNoteResult, deleteCommentsResult] = await Promise.all([
      Note.deleteOne({ _id: noteId, owner: userId }).session(session),
      Comment.deleteMany({ note: noteId }).session(session)
    ]);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: {
        noteId: noteId,
        commentsDeleted: deleteCommentsResult.deletedCount
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

    // Delete notes and their comments in parallel without transactions
    const [deleteNotesResult, deleteCommentsResult] = await Promise.all([
      Note.deleteMany({ 
        _id: { $in: objectIds }, 
        owner: userId 
      }),
      Comment.deleteMany({ 
        note: { $in: objectIds } 
      })
    ]);

    res.status(200).json({
      success: true,
      message: `${deleteNotesResult.deletedCount} notes deleted successfully`,
      data: {
        notesDeleted: deleteNotesResult.deletedCount,
        commentsDeleted: deleteCommentsResult.deletedCount,
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

    // Delete note and its comments in parallel without transactions
    const [deleteNoteResult, deleteCommentsResult] = await Promise.all([
      Note.deleteOne({ _id: noteId, owner: userId }),
      Comment.deleteMany({ note: noteId })
    ]);

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
        noteId: noteId,
        commentsDeleted: deleteCommentsResult.deletedCount
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

    // Get comments for this note
    const comments = await Comment.find({ note: noteId })
      .populate('user', 'name picture')
      .populate('replies.user', 'name picture')
      .sort({ createdAt: -1 });

    // Calculate engagement metrics
    const uniqueCommenters = new Set();
    const engagerMap = new Map();

    comments.forEach(comment => {
      // Track unique commenters
      uniqueCommenters.add(comment.user._id.toString());

      // Track engagement per user
      const userId = comment.user._id.toString();
      if (!engagerMap.has(userId)) {
        engagerMap.set(userId, {
          userId,
          name: comment.user.name,
          picture: comment.user.picture,
          comments: 0,
          likes: 0
        });
      }
      
      const engager = engagerMap.get(userId);
      engager.comments += 1;
      engager.likes += comment.likes;

      // Also count replies
      comment.replies.forEach(reply => {
        const replyUserId = reply.user._id.toString();
        if (!engagerMap.has(replyUserId)) {
          engagerMap.set(replyUserId, {
            userId: replyUserId,
            name: reply.user.name,
            picture: reply.user.picture,
            comments: 0,
            likes: 0
          });
        }
        const replyEngager = engagerMap.get(replyUserId);
        replyEngager.comments += 1;
        replyEngager.likes += reply.likes;
      });
    });

    // Convert to array and sort by engagement
    const topEngagers = Array.from(engagerMap.values())
      .sort((a, b) => (b.comments + b.likes) - (a.comments + a.likes))
      .slice(0, 5);

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
          totalComments: comments.length,
          totalReplies: comments.reduce((sum, c) => sum + (c.replies?.length || 0), 0),
          totalLikes: comments.reduce((sum, c) => sum + (c.likes || 0), 0),
          uniqueCommenters: uniqueCommenters.size,
          topEngagers
        },
        comments: comments
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