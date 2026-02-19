// controllers/premiumNoteController.js
const User = require('../models/User');
const Note = require('../models/Note');
const crypto = require('crypto');
const { getTranscript } = require('../youtube-transcript');

const PREMIUM_MODELS = ['parikshasarthi', 'vyavastha'];
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
          "HTTP-Referer": "https://yt2pdf.in",
          "X-Title": "YT2PDF"
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

    const response = await openRouterChatCompletion(messages, {
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

// Premium Model-specific prompt templates
const getPremiumModelPrompt = (model, transcript, userPrompt, images_json, videoUrl, settings = {}) => {
  const { language = 'English', detailLevel = 'Standard Notes' } = settings;

  // --- 1. SHARED CONFIGURATION ---
  const languageInstruction = language !== 'English' ? `Generate all content in ${language} language.` : 'Generate all content in English.';
  const userInstructions = userPrompt ? `\n**Additional User Instructions:** ${userPrompt}` : '';

  // Detail level instructions
  const detailInstructions = {
    'Brief Summary': 'Create a concise summary focusing only on key concepts.',
    'Standard Notes': 'Create balanced notes with main concepts and examples.',
    'Comprehensive': 'Create an in-depth study guide with detailed explanations.',
    'Bullet Points Only': 'Create a structured bullet-point list.'
  };

  const detailInstruction = detailInstructions[detailLevel] || detailInstructions['Standard Notes'];

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
  - ${detailInstruction}
  ${userInstructions}
  - Video URL for linking: ${videoUrl}
  `;

  // --- 2. MANDATORY FOOTER (Copy this HTML exactly at the end) ---
  const commonFooter = `
  <div style="margin-top: 40px; padding: 20px 30px; border-top: 2px solid #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: table; width: 100%; box-sizing: border-box; background-color: #fafaf9; page-break-inside: avoid;">
    <div style="display: table-cell; vertical-align: middle; text-align: left;">
        <a href="https://papertube.in" style="text-decoration: none;">
            <span style="font-size: 18px; font-weight: 900; font-style: italic; letter-spacing: -0.5px; text-transform: uppercase; color: #0a0a0a;">
                Paper<span style="color: #dc2626;">Tube</span>
            </span>
        </a>
        <div style="font-size: 9px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
            AI Knowledge Synthesis
        </div>
    </div>
    <div style="display: table-cell; vertical-align: middle; text-align: right;">
        <a href="https://papertube.in" style="color: #475569; font-size: 11px; text-decoration: none; font-weight: 500;">
            Convert any YouTube Video to PDF <span style="color: #dc2626; font-weight: 900; margin-left: 4px;">&rarr;</span>
        </a>
    </div>
  </div>`;

  // --- 3. MODEL SPECIFIC PROMPTS ---

  // =========================================================
  // 🔥 MODEL: PARIKSHA-SARTHI (Exam-Focused Q&A)
  // Vibe: High Energy, Question Bank, Flashcards, "Important!"
  // =========================================================
  if (model === 'parikshasarthi') {
    return `${basePrompt}

**MODE: PARIKSHA-SARTHI (High Energy Flashcards & Question Bank)**

**Design Language:**
- Vibe: High energy, intense study session, test-prep focused.
- Colors: Electric Purple (#9333ea) primary, Warning Orange (#f97316) for "Important!" alerts.
- Layout: Grid-based flashcards, quick Q&A pairs.

**Structure Instructions:**
1. **Header:** <h1> with an energetic, modern style.
2. **Important Callout:** <div style="background: #fff7ed; border-left: 5px solid #ea580c; padding: 15px; margin: 20px 0; border-radius: 4px;">🚨 <strong>CRITICAL CONCEPT:</strong> [Concept]</div>
3. **Flashcard Grid:** <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px;">
     <div style="background: #faf5ff; border: 2px solid #d8b4fe; border-radius: 12px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
       <div style="font-weight: 900; color: #7e22ce; margin-bottom: 8px;">Q: [Question based on transcript]</div>
       <div style="color: #4b5563; font-size: 14px;">A: [Concise Answer]</div>
       <div style="margin-top: 10px;"><a href="${videoUrl}&t=Xs" style="background:#e9d5ff; color:#7e22ce; padding:3px 8px; border-radius:12px; text-decoration:none; font-size:11px; font-weight:bold;">⏱️ Review Concept</a></div>
     </div>
   </div>

**Execution Strategy:**
- Process this transcript: "${transcript}"
- Aggressively convert paragraphs into Question/Answer flashcards.
- Identify the 3 most crucial takeaways and wrap them in the "Important Callout" HTML.
- Inject images from ${images_json} above the relevant flashcard grids if it aids active recall.

**MANDATORY FOOTER (Copy exactly at the end):**
${commonFooter}`;
  }

  // =========================================================
  // 🏛️ MODEL: VYAVASTHA (The Organizer / Comprehensive)
  // Vibe: Formal, university-level, structured textbook
  // =========================================================
  else if (model === 'vyavastha') {
    return `${basePrompt}

**MODE: VYAVASTHA (The Organizer / Academic)**

**Design Language:**
- Vibe: Formal, university-level, structured textbook.
- Colors: Oxford Blue (#0f172a), Crimson Red (#991b1b) accents.
- Typography: Use standard sans-serif for body, but serif for primary headings to look academic.

**Structure Instructions:**
1. **Header:** Clean <h1> with a solid bottom border.
2. **Table of Contents:** An organized <ul> block with links to internal sections at the top.
3. **Academic Sections:** Clear <h2> headings.
4. **Timeline/Process Flow (Use when sequence matters):** <div style="border-left: 3px solid #cbd5e1; padding-left: 20px; margin-left: 10px; margin-bottom: 25px;">
     <div style="position: relative; margin-bottom: 15px;">
       <span style="position: absolute; left: -28px; top: 2px; background: #0f172a; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></span>
       <strong style="color: #0f172a;">[Timestamp/Step]</strong>: [Detailed Explanation]
     </div>
   </div>
5. **Data Integration:** Use basic HTML <table> elements if comparing concepts.

**Execution Strategy:**
- Process this transcript: "${transcript}"
- Generate a comprehensive, highly detailed document. Do not summarize too aggressively; utilize the full context window.
- Create a Table of Contents right after the title.
- Embed images from ${images_json} inside formal "Figure 1.1" style captions centered on the page.
- Ensure the document reads like a published research paper or textbook chapter.

**MANDATORY FOOTER (Copy exactly at the end):**
${commonFooter}`;
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

// Estimate token count (rough estimation)
function estimateTokenCount(text) {
  // Rough estimation: ~4 characters per token for English
  return Math.ceil(text.length / 4);
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
      
      if (estimatedTokens > MAX_INPUT_TOKENS) {
        return res.status(400).json({
          success: false,
          code: "TRANSCRIPT_TOO_LONG",
          message: `Transcript is too long (estimated ${estimatedTokens} tokens). Maximum allowed is ${MAX_INPUT_TOKENS} tokens.`,
          estimatedTokens,
          maxTokens: MAX_INPUT_TOKENS
        });
      }
      
      console.log(`Found ${transcript.split('\n').length} transcript segments`);
    } catch (error) {
      console.error('Transcript fetch failed:', error);
      throw new Error(`Could not fetch transcript: ${error.message}`);
    }

    // STEP 2: Generate images for premium models
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
      content: content,
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