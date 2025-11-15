const { json } = require("express");
const Note = require("../models/Note");
const User = require("../models/User");
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
exports.createNote = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    const user = req.user;

    if (!videoUrl)
      return res.status(400).json({ success: false, message: "Video URL is required" });

    if (!user)
      return res.status(401).json({ success: false, message: "User authentication required" });

    // Check API key availability first - FIXED: Now using the correct method
    const availableKeys = geminiClient.getAvailableKeysCount();
    if (availableKeys === 0) {
      return res.status(503).json({
        success: false,
        code: "ALL_KEYS_RATE_LIMITED",
        message: "All API keys are currently rate limited. Please try again later.",
        retryAfter: "5 minutes"
      });
    }

    const currentUser = await User.findById(user._id);
    if (!currentUser)
      return res.status(404).json({ success: false, message: "User not found" });

    const TOKEN_COST = 20;

    if (currentUser.token < TOKEN_COST)
      return res.status(403).json({
        success: false,
        code: "INSUFFICIENT_TOKENS",
        message: "You don't have enough tokens to generate a new note.",
        remainingTokens: currentUser.token,
      });

    currentUser.token -= TOKEN_COST;
    currentUser.usedToken += TOKEN_COST;

    const videoId = extractVideoId(videoUrl);
    if (!videoId)
      return res.status(400).json({ success: false, message: "Invalid YouTube URL" });

    const videoMeta = await ytinfo(videoUrl);
    const transcript = await fetchTranscript(videoId);

    // Generate images and PDF content with automatic key rotation
    const img_gen_data = await generateImgGEnAI(transcript);
    const img_with_url = await generateImgObjects(img_gen_data);
    const images_json = img_with_url.map((img) => JSON.stringify(img));
    const pdf_content = await generatePDFContent({ transcript, videoUrl }, images_json);

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const note_slug =
      (videoMeta?.title || "untitled")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 50) + "-" + randomSuffix;

    const newNote = new Note({
      owner: currentUser._id,
      title: videoMeta?.title || "Untitled",
      slug: note_slug,
      thumbnail: videoMeta?.thumbnail || "",
      videoUrl,
      videoId,
      transcript,
      img_with_url,
      content: pdf_content,
    });
    await newNote.save();

    currentUser.notes.push({ noteId: newNote._id });

    currentUser.tokenTransactions.push({
      name: newNote.title,
      type: "note_generation",
      tokensUsed: TOKEN_COST,
      date: new Date(),
      status: "success",
    });

    await currentUser.save();

    res.status(201).json({
      success: true,
      message: `Note generated successfully. ${TOKEN_COST} tokens have been used.`,
      usedTokens: TOKEN_COST,
      remainingTokens: currentUser.token,
      newNote,
    });
  } catch (error) {
    console.error("❌ Error creating note:", error);
    
    if (error.message.includes('All API keys exhausted') || error.message.includes('All API keys are currently rate limited')) {
      return res.status(503).json({
        success: false,
        code: "SERVER_BUSY",
        message: "Our servers are too busy right now. Please try again in a few minutes.",
        retryAfter: "1 hour"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating note",
      error: error.message,
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
    
    const note = await Note.findOne({ slug: req.params.slug });
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