const User = require('../models/User');
const PracticeTest = require('../models/PracticeTest');
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
      "X-Title": "Paperxify Test Generator"
    },
    body: JSON.stringify({ model: modelId, messages, temperature, max_tokens, stream: false })
  });

  const res = await Promise.race([fetchPromise, timeoutPromise]);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

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
  throw new Error(`All free models failed. ${lastError?.message}`);
}

async function callPremiumModel(messages, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const content = await callOpenRouter(messages, PREMIUM_MODEL_ID, { ...options, max_tokens: 8000 });
      return { content, model: PREMIUM_MODEL_ID };
    } catch (e) {
      lastError = e;
      if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error(`Premium model failed. ${lastError?.message}`);
}

const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.get('v')) return urlObj.searchParams.get('v');
    if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch { return null; }
};

async function fetchVideoTitle(videoUrl) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
    if (!res.ok) return 'Practice Test';
    const data = await res.json();
    return data.title || 'Practice Test';
  } catch { return 'Practice Test'; }
}

function parseJSONOutput(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Empty response');
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/im, '').replace(/```\s*$/im, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) throw new Error(`No JSON array found`);
  const parsed = JSON.parse(cleaned.substring(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error('Not an array');
  return parsed;
}

function buildTestPrompt(transcript, testType, userPrompt) {
  let instructions = "";
  if (testType === 'MCQ') {
    instructions = `Generate exactly 10 Multiple Choice Questions (type: 'MCQ'). Each has 4 options, 1 correctAnswer.`;
  } else if (testType === 'Fill in the Blanks') {
    instructions = `Generate exactly 10 Fill in the blanks questions (type: 'FITB'). Provide a short sentence with a missing word and provide the exact 1-2 words as correctAnswer.`;
  } else if (testType === 'MSQ') {
    instructions = `Generate exactly 10 Multiple Select Questions (type: 'MSQ'). Each has 4 options, 2 or more correctAnswers (array).`;
  } else if (testType === 'NAT') {
    instructions = `Generate exactly 10 Numerical Answer Questions (type: 'NAT'). Provide a question whose answer is exclusively a number. Provide correctAnswer as a number string and tolerance as a number (e.g. 0.1).`;
  } else {
    // Mix
    instructions = `Generate exactly 15 questions mixed equally across 'MCQ', 'MSQ', 'FITB', 'NAT'. Follow the data schemas carefully for each type.`;
  }

  return `You are a master examiner. Generate a rigorous Practice Test based SOLELY on the transcript below.
${instructions}
${userPrompt ? `User constraints: "${userPrompt}"\n` : ''}

REQUIRED JSON SCHEMA FOR ARRAY ITEMS DEPENDING ON TYPE:
For MCQ: {"id": "unique-id-1", "type": "MCQ", "question": "...", "options": ["A","B","C","D"], "correctAnswer": "A", "explanation": "..."}
For MSQ: {"id": "unique-id-2", "type": "MSQ", "question": "...", "options": ["A","B","C","D"], "correctAnswers": ["A","B"], "explanation": "..."}
For FITB: {"id": "unique-id-3", "type": "FITB", "question": "...", "correctAnswer": "word", "explanation": "..."}
For NAT: {"id": "unique-id-4", "type": "NAT", "question": "...", "correctAnswer": "3.14", "tolerance": 0.05, "explanation": "..."}

CRITICAL: Output ONLY a raw JSON array. Start with [ and end with ]. NO MARKDOWN. NO CODEBLOCKS. NEVER OUTPUT ANYTHING OUTSIDE OF THE JSON ARRAY.

TRANSCRIPT:
${transcript}`;
}

exports.createPracticeTest = async (req, res) => {
  const startTime = Date.now();
  try {
    const { videoUrl, prompt, model, testType, settings } = req.body;
    const userId = req.user.id;

    if (!videoUrl || !model || !testType) return res.status(400).json({ success: false, message: 'Missing parameters' });
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isSubscribed = user.membership?.isActive === true;
    const isFreeModel = FREE_MODELS.includes(model);
    
    if (!isSubscribed && isFreeModel) {
      if ((user.tokens || 0) < TOKEN_COST_PER_GENERATION) {
        return res.status(403).json({ success: false, code: 'INSUFFICIENT_TOKENS', message: `You need ${TOKEN_COST_PER_GENERATION} tokens.` });
      }
    }
    const isPremiumModel = PREMIUM_MODELS.includes(model);
    if ((isPremiumModel || testType === 'MSQ' || testType === 'NAT' || testType === 'Master All (Mix)') && !isSubscribed) {
      return res.status(403).json({ success: false, code: 'SUBSCRIPTION_REQUIRED', message: 'Premium required for this test configuration.' });
    }

    const videoId = extractVideoId(videoUrl);
    const videoTitle = await fetchVideoTitle(videoUrl);
    let transcript = await getTranscript(videoId);
    if (!transcript) throw new Error('Transcript unavailable');
    
    const maxTokens = (isPremiumModel ? 80000 : 10000) * 4;
    transcript = transcript.substring(0, maxTokens);

    const aiPrompt = buildTestPrompt(transcript, testType, prompt);
    const messages = [
      { role: 'system', content: 'You only output raw JSON arrays starting with [ and ending with ].' },
      { role: 'user', content: aiPrompt }
    ];

    let aiResponse;
    if (isPremiumModel || isSubscribed) {
      aiResponse = await callPremiumModel(messages, { temperature: 0.4 });
    } else {
      aiResponse = await callFreeModel(messages, { temperature: 0.4 });
    }

    let rawQuestions;
    try {
      rawQuestions = parseJSONOutput(aiResponse.content);
    } catch (parseErr) {
      console.error('Parse error:', parseErr.message, aiResponse.content?.substring(0, 500));
      return res.status(500).json({ success: false, message: `AI JSON error: ${parseErr.message}` });
    }

    rawQuestions.forEach((q, i) => q.id = q.id || `q${i+1}`);

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const slug = `practice-test-${(videoTitle || 'pt').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 40)}-${randomSuffix}`;

    const newTest = new PracticeTest({
      owner: userId,
      videoUrl,
      videoId,
      title: `Practice Test: ${videoTitle}`,
      slug,
      transcript,
      questions: rawQuestions,
      generationDetails: {
        language: settings?.language || 'English',
        testType,
        cost: isSubscribed ? 0 : TOKEN_COST_PER_GENERATION,
        processingTime: Math.floor((Date.now() - startTime) / 1000),
        tier: isSubscribed ? 'premium' : 'free',
        questionCount: rawQuestions.length,
        metadata: { model, aiModel: aiResponse.model }
      }
    });

    await newTest.save();

    if (!isSubscribed && isFreeModel) {
      user.tokens -= TOKEN_COST_PER_GENERATION;
      if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
      user.tokenUsageHistory.push({ name: `Practice Test - ${model}`, tokens: -TOKEN_COST_PER_GENERATION, date: new Date() });
      await user.save();
    }

    return res.status(201).json({
      success: true,
      newTest: {
        slug: newTest.slug,
        title: newTest.title,
      },
      tokenInfo: isSubscribed ? { type: 'premium' } : { tokensDeducted: TOKEN_COST_PER_GENERATION }
    });
  } catch (error) {
    console.error('Test generation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate test', error: error.message });
  }
};

exports.getPracticeTestBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const test = await PracticeTest.findOne({ slug });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    return res.json({ success: true, test });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching test' });
  }
};
