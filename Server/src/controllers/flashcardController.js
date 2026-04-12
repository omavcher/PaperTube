// controllers/flashcardController.js
const User = require('../models/User');
const FlashcardSet = require('../models/FlashcardSet');
const crypto = require('crypto');
const { getTranscript } = require('../youtube-transcript');

const FREE_MODELS = ['sankshipta', 'bhashasetu'];
const PREMIUM_MODELS = ['parikshasarthi', 'vyavastha'];
const ALL_MODELS = [...FREE_MODELS, ...PREMIUM_MODELS];

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TOKEN_COST_PER_GENERATION = 5;

// Free model OpenRouter queue
let openRouterModelQueue = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openrouter/free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "tngtech/deepseek-r1t-chimera:free"
];

// Premium model
const PREMIUM_MODEL_ID = "x-ai/grok-4.1-fast";

// ─── OPENROUTER CALLS ────────────────────────────────────────────────────────

async function callOpenRouter(messages, modelId, options = {}) {
  const { temperature = 0.5, max_tokens = 4000, timeout = 120000 } = options;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${timeout}ms`)), timeout)
  );

  const fetchPromise = fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://paperxify.com",
      "X-Title": "Paperxify Flashcards"
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature,
      max_tokens,
      stream: false
    })
  });

  const res = await Promise.race([fetchPromise, timeoutPromise]);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

// Free tier: try models in queue, fallback on failure
async function callFreeModel(messages, options = {}) {
  let lastError;
  for (const modelId of openRouterModelQueue) {
    try {
      const content = await callOpenRouter(messages, modelId, options);
      return { content, model: modelId };
    } catch (e) {
      console.warn(`Free model ${modelId} failed: ${e.message}`);
      lastError = e;
    }
  }
  throw new Error(`All free models failed. Last error: ${lastError?.message}`);
}

// Premium tier: use grok-4.1-fast with retries
async function callPremiumModel(messages, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const content = await callOpenRouter(messages, PREMIUM_MODEL_ID, { ...options, max_tokens: 8000 });
      return { content, model: PREMIUM_MODEL_ID };
    } catch (e) {
      console.warn(`Premium model attempt ${attempt} failed: ${e.message}`);
      lastError = e;
      if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error(`Premium model failed: ${lastError?.message}`);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.get('v'))
      return urlObj.searchParams.get('v');
    if (urlObj.hostname === 'youtu.be')
      return urlObj.pathname.slice(1);
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch { return null; }
};

async function fetchVideoTitle(videoUrl) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return 'Flashcard Set';
    const data = await res.json();
    return data.title || 'Flashcard Set';
  } catch { return 'Flashcard Set'; }
}

// Safely parse JSON from AI output — handles markdown fences and trailing garbage
function parseFlashcardJSON(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Empty response from AI');

  // Strip markdown fences if present
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/im, '').replace(/```\s*$/im, '').trim();

  // Find the JSON array bounds
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`No JSON array found in AI response. Got: ${cleaned.substring(0, 200)}`);
  }

  const jsonStr = cleaned.substring(start, end + 1);
  const parsed = JSON.parse(jsonStr);

  if (!Array.isArray(parsed)) throw new Error('AI response is not a JSON array');
  if (parsed.length === 0) throw new Error('AI returned empty flashcard array');

  // Validate each card has front and back
  const valid = parsed.filter(c => c && typeof c.front === 'string' && typeof c.back === 'string' && c.front.trim() && c.back.trim());
  if (valid.length === 0) throw new Error('No valid flashcards with front/back fields found');

  return valid;
}

// Build the flashcard generation prompt — strict JSON output
function buildFlashcardPrompt(transcript, cardCount, userPrompt = '') {
  const userExtra = userPrompt ? `\nUser additional focus: "${userPrompt}"` : '';
  return `You are a master educator creating premium study flashcards.

Generate EXACTLY ${cardCount} high-quality flashcards from the transcript below.${userExtra}

RULES:
- Each card must have a "front" (question, term, or concept) and a "back" (clear answer or explanation)
- Focus on the most important, exam-worthy concepts
- Make backs thorough but concise (2-4 sentences max)
- Vary question types: definitions, "what is", "how does", "why", comparisons
- NO filler cards — every card must teach something valuable

OUTPUT FORMAT — CRITICAL:
You MUST output ONLY a raw JSON array. No explanation, no markdown, no code fences.
Start your response with [ and end with ]

Example:
[
  {"front": "What is X?", "back": "X is ... because ..."},
  {"front": "Define Y", "back": "Y refers to ..."}
]

TRANSCRIPT:
${transcript}`;
}

// ─── MAIN CONTROLLER ─────────────────────────────────────────────────────────

exports.createFlashcardSet = async (req, res) => {
  const startTime = Date.now();

  try {
    const { videoUrl, prompt, model, settings, flashcardCount } = req.body;
    const userId = req.user.id;

    // ── Validation ──────────────────────────────────────────────────────
    if (!videoUrl) return res.status(400).json({ success: false, message: 'Video URL is required' });
    if (!model) return res.status(400).json({ success: false, message: 'Model is required' });
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))
      return res.status(400).json({ success: false, message: 'Please provide a valid YouTube URL' });
    if (!ALL_MODELS.includes(model))
      return res.status(400).json({ success: false, message: `Invalid model: ${model}` });

    const isPremiumModel = PREMIUM_MODELS.includes(model);
    const isFreeModel = FREE_MODELS.includes(model);

    // ── User check ───────────────────────────────────────────────────────
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isSubscribed = user.membership?.isActive === true;

    // Enforce card limits
    let cardLimit = parseInt(flashcardCount) || 5;
    if (!isSubscribed) cardLimit = Math.min(cardLimit, 5);   // Free: max 5
    else cardLimit = Math.min(cardLimit, 30);                  // Premium: max 30

    // Token check for free users
    if (!isSubscribed && isFreeModel) {
      if ((user.tokens || 0) < TOKEN_COST_PER_GENERATION) {
        return res.status(403).json({
          success: false,
          code: 'INSUFFICIENT_TOKENS',
          message: `You need ${TOKEN_COST_PER_GENERATION} tokens. You have ${user.tokens || 0}.`,
          currentTokens: user.tokens || 0,
          requiredTokens: TOKEN_COST_PER_GENERATION,
          canPurchase: true
        });
      }
    }

    // Premium model requires subscription
    if (isPremiumModel && !isSubscribed) {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Active subscription required for premium models'
      });
    }

    // ── Extract video info ──────────────────────────────────────────────
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });

    const videoTitle = await fetchVideoTitle(videoUrl);
    console.log(`🃏 Generating ${cardLimit} flashcards for: ${videoTitle}`);

    // ── Fetch transcript ─────────────────────────────────────────────────
    let transcript;
    try {
      transcript = await getTranscript(videoId);
      if (!transcript || transcript.trim().length === 0)
        throw new Error('Transcript is empty or unavailable');

      // Truncate if too long (flash cards don't need the full transcript)
      const estTokens = Math.ceil(transcript.length / 4);
      const maxTokens = isPremiumModel ? 80000 : 10000;
      if (estTokens > maxTokens) {
        transcript = transcript.substring(0, maxTokens * 4);
        const lastNewline = transcript.lastIndexOf('\n');
        if (lastNewline > maxTokens * 4 * 0.8) transcript = transcript.substring(0, lastNewline);
        console.log(`⚠️ Transcript truncated to fit model`);
      }
    } catch (err) {
      console.error('Transcript fetch error:', err);
      return res.status(400).json({
        success: false,
        message: 'This video does not have a transcript available. Please try another video.'
      });
    }

    // ── Build prompt & call AI ──────────────────────────────────────────
    const aiPrompt = buildFlashcardPrompt(transcript, cardLimit, prompt);
    const messages = [
      {
        role: 'system',
        content: 'You are a flashcard generation AI. You ONLY output raw JSON arrays. Never use markdown fences. Never add explanation. Only output the JSON array starting with [ and ending with ].'
      },
      { role: 'user', content: aiPrompt }
    ];

    let aiResponse;
    if (isPremiumModel || isSubscribed) {
      aiResponse = await callPremiumModel(messages, { temperature: 0.4, timeout: 120000 });
    } else {
      aiResponse = await callFreeModel(messages, { temperature: 0.4, timeout: 90000 });
    }

    // ── Parse flashcards ─────────────────────────────────────────────────
    let rawCards;
    try {
      rawCards = parseFlashcardJSON(aiResponse.content);
    } catch (parseErr) {
      console.error('Flashcard JSON parse error:', parseErr.message);
      console.error('Raw AI output:', aiResponse.content?.substring(0, 500));
      return res.status(500).json({
        success: false,
        message: `AI returned invalid format: ${parseErr.message}. Please try again.`
      });
    }

    // Limit to requested count (AI may return more)
    rawCards = rawCards.slice(0, cardLimit);

    // ── Format cards for DB ──────────────────────────────────────────────
    const formattedCards = rawCards.map((card, idx) => ({
      id: idx + 1,
      type: 'basic',
      front: card.front.trim(),
      back: card.back.trim(),
      category: 'General',
      difficulty: 'medium',
      importance: 'medium',
      mastery: 'new',
      reviewCount: 0
    }));

    // ── Create slug ──────────────────────────────────────────────────────
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const slug = `flashcards-${(videoTitle || 'set').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 40)}-${randomSuffix}`;

    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    // ── Save to DB ───────────────────────────────────────────────────────
    const newSet = new FlashcardSet({
      owner: userId,
      videoUrl,
      videoId,
      title: `Flashcards: ${videoTitle}`,
      slug,
      transcript,
      flashcards: formattedCards,
      status: 'completed',
      visibility: 'private',
      generationDetails: {
        language: settings?.language || 'English',
        cardType: 'basic',
        prompt: prompt || '',
        cost: isSubscribed ? 0 : TOKEN_COST_PER_GENERATION,
        generatedAt: new Date(),
        processingTime,
        type: isSubscribed ? 'premium' : 'free',
        cardCount: formattedCards.length,
        metadata: { model, aiModel: aiResponse.model }
      }
    });

    await newSet.save();

    // ── Deduct tokens for free users ─────────────────────────────────────
    if (!isSubscribed && isFreeModel) {
      user.tokens = (user.tokens || 0) - TOKEN_COST_PER_GENERATION;
      if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
      user.tokenUsageHistory.push({
        name: `Flashcard generation - ${model}`,
        tokens: -TOKEN_COST_PER_GENERATION,
        date: new Date()
      });
      await user.save();
    }

    console.log(`✅ Flashcard set created: ${newSet._id} (${formattedCards.length} cards)`);

    return res.status(201).json({
      success: true,
      newFlashcardSet: {
        _id: newSet._id,
        slug: newSet.slug,
        title: newSet.title,
        status: newSet.status,
        videoUrl: newSet.videoUrl,
        videoId: newSet.videoId,
        flashcards: newSet.flashcards,
        generationDetails: newSet.generationDetails,
        createdAt: newSet.createdAt,
        visibility: newSet.visibility
      },
      message: `${formattedCards.length} flashcards generated successfully!`,
      tokenInfo: isSubscribed
        ? { type: 'premium', message: 'Unlimited access as subscriber' }
        : {
            type: 'free',
            tokensDeducted: TOKEN_COST_PER_GENERATION,
            remainingTokens: user.tokens || 0
          }
    });

  } catch (error) {
    console.error('Flashcard generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate flashcards',
      error: error.message
    });
  }
};

// ── GET flashcard set by slug ────────────────────────────────────────────────
exports.getFlashcardSetBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const set = await FlashcardSet.findOne({ slug });
    if (!set) return res.status(404).json({ success: false, message: 'Flashcard set not found' });

    // Allow access if owner OR public
    if (set.visibility === 'private' && set.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({
      _id: set._id,
      slug: set.slug,
      title: set.title,
      videoUrl: set.videoUrl,
      videoId: set.videoId,
      flashcards: set.flashcards,
      generationDetails: set.generationDetails,
      stats: set.stats,
      createdAt: set.createdAt,
      visibility: set.visibility
    });
  } catch (error) {
    console.error('Get flashcard set error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch flashcard set' });
  }
};

// ── GET user's flashcard sets ────────────────────────────────────────────────
exports.getUserFlashcardSets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const sets = await FlashcardSet.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title slug status videoUrl createdAt generationDetails flashcards visibility');

    const total = await FlashcardSet.countDocuments({ owner: userId });

    return res.json({
      success: true,
      sets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user flashcard sets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch flashcard sets' });
  }
};

// ── DELETE flashcard set ─────────────────────────────────────────────────────
exports.deleteFlashcardSet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const set = await FlashcardSet.findOne({ _id: id, owner: userId });
    if (!set) return res.status(404).json({ success: false, message: 'Flashcard set not found' });

    await FlashcardSet.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Flashcard set deleted' });
  } catch (error) {
    console.error('Delete flashcard set error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete flashcard set' });
  }
};
