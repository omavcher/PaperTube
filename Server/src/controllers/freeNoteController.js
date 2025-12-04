const User = require('../models/User');
const Note = require('../models/Note');
const GroqMultiModel = require('../utils/groqMultiModel');
const crypto = require('crypto');

const FREE_MODELS = ['sankshipta', 'bhashasetu'];
const MODEL_TOKEN_COSTS = {
  sankshipta: 25,
  bhashasetu: 50
};
const MAX_FREE_VIDEO_LENGTH = 90 * 60; // 90 minutes in seconds

// Initialize Groq client
const groqClient = new GroqMultiModel();

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
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that generates relevant figure names for educational content. Return only JSON array or 'none'."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const response = await groqClient.chatCompletion(messages, {
      temperature: 0.3,
      max_tokens: 500
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

const getModelPrompt = (model, transcript, userPrompt, images_json, videoUrl, settings = {}) => {
  const { language = 'English', detailLevel = 'Standard Notes' } = settings;

  // Language instruction
  const languageInstruction = language !== 'English' ?
    `Generate all content in ${language} language.` :
    'Generate all content in English.';

  // Detail level instructions
  const detailInstructions = {
    'Brief Summary': 'Create a concise summary focusing only on key concepts.',
    'Standard Notes': 'Create balanced notes with main concepts and examples.',
    'Comprehensive': 'Create an in-depth study guide with detailed explanations.',
    'Bullet Points Only': 'Create a structured bullet-point list.'
  };

  const detailInstruction = detailInstructions[detailLevel] || detailInstructions['Standard Notes'];
  const userInstructions = userPrompt ? `\n**Additional User Instructions:** ${userPrompt}` : '';

  // --- BASE PROMPT ---
  const basePrompt = `You are an expert educational content generator. Your task is to convert a video transcript into a **visually stunning, HTML-formatted PDF document**.

  **CRITICAL TECH SPECS:**
  1. Output **ONLY pure HTML** (inside the body). No <html>, <head>, <body> tags.
  2. **NO MARKDOWN**. Do not use **bold**, ## Header, or - bullet. Use <b>, <h2>, <li>.
  3. **INLINE STYLES ONLY**. Everything must have style="..." attributes.
  4. Font Family: Use "Helvetica Neue, Helvetica, Arial, sans-serif".
  5. Line Height: Use '1.6' for readability.

  **CONTEXT:**
  - ${languageInstruction}
  - ${detailInstruction}
  ${userInstructions}
  `;

  // --- LEVEL 1: SANKSHIPTA (Clean Minimalist with Footer) ---
  const sankshiptaPrompt = `${basePrompt}

  **MODE: SANKSHIPTA (Clean Minimalist Notes)**
  
  **Design Language:**
  - Vibe: Clean, academic, distraction-free.
  - Colors: Dark Slate headers (#334155), Soft Blue accents (#3b82f6).
  - Background: White/Light Gray.

  **Structure Instructions:**
  1. **Header:** Title with bottom border.
  2. **Summary:** Boxed summary section.
  3. **Content:** Clear <h2> headings and <ul> lists.
  
  **MANDATORY FOOTER (Copy this HTML exactly at the end):**
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; font-family: sans-serif;">
      Generated by <strong style="color: #64748b;">YT2PDF.in</strong> • 
      <a href="https://yt2pdf.in" style="color: #3b82f6; text-decoration: none;">Convert any YouTube Video to PDF</a>
  </div>

  **Execution:**
  - Process this transcript: "${transcript}"
  - Create a clean document.
  - NO IMAGES.
  - **Don't forget the footer.**
  `;

  // --- LEVEL 2: BHASHASETU (Premium Visual with Footer) ---
  const bhashasetuPrompt = `${basePrompt}

  **MODE: BHASHASETU (Premium Visual Study Guide)**

  **Design Language:**
  - Vibe: Modern textbook, rich media, card-based layout.
  - Colors: Royal Blue (#2563eb) primary, Emerald Green (#059669) accents.
  
  **Content Strategy:**
  - Insert images from this list: ${images_json} contextually after relevant paragraphs.
  - Use "Cards" (divs with shadows) for main concepts.

  **HTML Components:**
  1. **Title:** Styled <h1> with blue underline.
  2. **Cards:** <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 20px;">
  3. **Timestamps:** <a href="${videoUrl}&t=Xs" style="background:#e0f2fe; color:#0284c7; padding:2px 8px; border-radius:12px; text-decoration:none; font-size:12px;">▶ Watch</a>

  **MANDATORY FOOTER (Copy this HTML exactly at the end):**
  <div style="margin-top: 50px; margin-bottom: 20px; padding: 20px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center;">
      <p style="margin: 0; color: #334155; font-weight: bold; font-size: 14px;">🚀 Study Smarter with YT2PDF</p>
      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">
          This note was AI-generated from a video. 
          <a href="https://yt2pdf.in" style="color: #2563eb; text-decoration: none; font-weight: bold;">Create your own at YT2PDF.in</a>
      </p>
  </div>

  **Execution:**
  - Process this transcript: "${transcript}"
  - Create a beautiful, magazine-quality HTML document.
  - Integrate images.
  - **Ensure the branded footer is the very last element.**
  `;

  return model === 'sankshipta' ? sankshiptaPrompt : bhashasetuPrompt;
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
  let user;
  let actualTokenCost;
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

    // Validate free model
    if (!FREE_MODELS.includes(model)) {
      return res.status(400).json({
        success: false,
        message: "Invalid free model selected"
      });
    }

    // Get actual token cost for the model
    actualTokenCost = MODEL_TOKEN_COSTS[model] || 25;

    // Find user by ID
    user = await User.findById(userId);
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

    console.log('Starting complete note generation process...');
    console.log('Settings received:', { language: settings?.language, detailLevel: settings?.detailLevel, prompt });
    
    // STEP 1: Fetch transcript
    console.log('Fetching transcript...');
    let transcript;
    try {
      transcript = await fetchTranscriptWithRetry(videoId);
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is empty or unavailable for this video');
      }
      console.log(`Found ${transcript.split('\n').length} transcript segments`);
    } catch (error) {
      console.error('Transcript fetch failed:', error);
      throw new Error(`Could not fetch transcript: ${error.message}`);
    }

    // STEP 2: Generate images for bhashasetu model with language support
    let img_with_url = [];
    if (model === 'bhashasetu') {
      console.log('Generating images for bhashasetu model...');
      const figures = await generateImgGEnAI(transcript, settings?.language);
      if (figures && figures.length > 0) {
        console.log(`Generated ${figures.length} figures, fetching images...`);
        img_with_url = await generateImgObjects(figures);
        console.log(`Found ${img_with_url.length} images`);
      }
    }

    // STEP 3: Generate PDF content using AI with language and detail level support
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
      content: response.content,
      status: 'completed',
      visibility: 'public',
      img_with_url: img_with_url,
      generationDetails: {
        model: model,
        language: settings?.language || 'English',
        detailLevel: settings?.detailLevel || 'Standard Notes',
        prompt: prompt || "",
        cost: actualTokenCost,
        generatedAt: new Date(),
        processingTime: processingTime,
        type: 'free',
      },
    });

    await newNote.save();

    // STEP 5: Update user tokens and history
    user.token -= actualTokenCost;
    user.usedToken += actualTokenCost;
    
    user.tokenUsageHistory.push({
      name: `Note generation with ${model}`,
      tokens: actualTokenCost
    });
    
    user.notes.push({ noteId: newNote._id });
    await user.save();

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
        cost: actualTokenCost,
        createdAt: newNote.createdAt,
        content: newNote.content,
        transcript: newNote.transcript,
        img_with_url: newNote.img_with_url,
        visibility: newNote.visibility
      },
      message: "Note generated successfully with AI content!",
      usedTokens: actualTokenCost,
      remainingTokens: user.token,
      videoTitle: videoTitle,
      videoDuration: videoDuration ? formatDuration(videoDuration) : 'Unknown',
      generationSettings: {
        language: settings?.language || 'English',
        detailLevel: settings?.detailLevel || 'Standard Notes',
        userPrompt: prompt || "No additional instructions"
      }
    });

  } catch (error) {
    console.error('Error creating free note:', error);
    
    // Refund tokens if processing fails
    if (user && actualTokenCost) {
      try {
        user.token += actualTokenCost;
        user.usedToken -= actualTokenCost;
        await user.save();
        console.log('Tokens refunded due to processing failure');
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
    
    // Check if video is too long for free tier
    if (videoInfo.duration && videoInfo.duration > MAX_FREE_VIDEO_LENGTH) {
      videoInfo.tooLongForFree = true;
      videoInfo.maxFreeDuration = MAX_FREE_VIDEO_LENGTH;
      videoInfo.maxFreeDurationFormatted = formatDuration(MAX_FREE_VIDEO_LENGTH);
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
        cost: note.generationDetails?.cost || 25,
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