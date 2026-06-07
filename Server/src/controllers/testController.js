const User = require('../models/User');
const PracticeTest = require('../models/PracticeTest');
const crypto = require('crypto');
const { getTranscript } = require('../youtube-transcript');
const { checkFreeTierLimits, checkVideoDurationLimit } = require('../utils/freeTierLimits');
const html_to_pdf = require("html-pdf-node");

const FREE_MODELS = ['flash'];
const PREMIUM_MODELS = ['canvas', 'scholar', 'atlas'];
const ALL_MODELS = [...FREE_MODELS, ...PREMIUM_MODELS];

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TOKEN_COST_PER_GENERATION = 5;

// Free model OpenRouter queue
let openRouterModelQueue = [
  "openrouter/free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "tngtech/deepseek-r1t-chimera:free"
];

// Premium model
const PREMIUM_MODEL_ID = "deepseek/deepseek-v4-flash";

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

function buildTestPrompt(transcript, testType, userPrompt, language = 'English', detailLevel = 'Standard') {
  let count = 10;
  let mixCountInstruction = "";
  if (detailLevel === 'Short') {
    count = 5;
    mixCountInstruction = "Generate exactly 8 questions mixed equally across 'MCQ', 'MSQ', 'FITB', 'NAT' (exactly 2 of each type).";
  } else if (detailLevel === 'Comprehensive') {
    count = 20;
    mixCountInstruction = "Generate exactly 24 questions mixed equally across 'MCQ', 'MSQ', 'FITB', 'NAT' (exactly 6 of each type).";
  } else { // Standard or default
    count = 10;
    mixCountInstruction = "Generate exactly 16 questions mixed equally across 'MCQ', 'MSQ', 'FITB', 'NAT' (exactly 4 of each type).";
  }

  let instructions = "";
  if (testType === 'MCQ') {
    instructions = `Generate exactly ${count} Multiple Choice Questions (type: 'MCQ'). Each has 4 options, 1 correctAnswer.`;
  } else if (testType === 'Fill in the Blanks') {
    instructions = `Generate exactly ${count} Fill in the blanks questions (type: 'FITB'). Provide a short sentence with a missing word and provide the exact 1-2 words as correctAnswer.`;
  } else if (testType === 'MSQ') {
    instructions = `Generate exactly ${count} Multiple Select Questions (type: 'MSQ'). Each has 4 options, 2 or more correctAnswers (array of options).`;
  } else if (testType === 'NAT') {
    instructions = `Generate exactly ${count} Numerical Answer Questions (type: 'NAT'). Provide a question whose answer is exclusively a number. Provide correctAnswer as a number string and tolerance as a number (e.g. 0.05).`;
  } else {
    // Mix
    instructions = mixCountInstruction + " Follow the data schemas carefully for each type.";
  }

  const languageInstruction = `
═══ CRITICAL LANGUAGE & QUALITY RULES ═══
1. MULTI-LANGUAGE COMPREHENSION: The source transcript may be in any language. You must accurately extract every single concept and nuance regardless of the transcript's original language.
2. NATIVE-LEVEL ${language.toUpperCase()} OUTPUT: You MUST write the ENTIRE practice test (questions, options, correct answers, and detailed explanations) strictly in ${language}. 
3. PROPER ACADEMIC TONE: Use professional, high-quality, and grammatically perfect ${language}. The test must read like it was written by a native expert examiner in ${language}.
4. NO LANGUAGE MIXING: Do not mix languages. Do not use English words in ${language} text unless they are universal technical terms with no equivalent.
5. COMPREHENSIVE EXPLANATION: Explain every answer thoroughly in ${language}. Ensure no meaning is lost in translation from the source transcript.
`;

  return `You are a master examiner. Generate a rigorous Practice Test based SOLELY on the transcript below.

${languageInstruction}

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

    // Enforce free tier daily limit (2 generations/day)
    const limitCheck = await checkFreeTierLimits(userId);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false,
        code: limitCheck.code,
        message: limitCheck.reason,
        currentPlan: "Free"
      });
    }

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
    if (!videoId) return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });

    // Enforce free tier video duration limit (1hr max)
    const durationCheck = await checkVideoDurationLimit(videoId, userId);
    if (!durationCheck.allowed) {
      return res.status(403).json({
        success: false,
        code: durationCheck.code,
        message: durationCheck.reason,
        upgradeRequired: true
      });
    }

    const videoTitle = await fetchVideoTitle(videoUrl);
    let transcript = await getTranscript(videoId);
    if (!transcript) throw new Error('Transcript unavailable');
    
    const maxTokens = (isPremiumModel ? 80000 : 10000) * 4;
    transcript = transcript.substring(0, maxTokens);

    const aiPrompt = buildTestPrompt(transcript, testType, prompt, settings?.language || 'English', settings?.detailLevel || 'Standard');
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

exports.deletePracticeTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await PracticeTest.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!test) {
      return res.status(404).json({ success: false, message: "Practice test not found or access denied" });
    }
    return res.status(200).json({ success: true, message: "Practice test deleted successfully" });
  } catch (error) {
    console.error("Error deleting practice test:", error);
    return res.status(500).json({ success: false, message: "Error deleting practice test", error: error.message });
  }
};

exports.exportPracticeTestPDF = async (req, res) => {
  try {
    const { slug } = req.params;
    const test = await PracticeTest.findOne({ slug });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const theme = {
      bg: '#ffffff',
      text: '#1f2937',
      primary: '#dc2626', // Premium Red
      accent: '#b91c1c',
      cardBg: '#f8fafc',
      border: '#e2e8f0',
      link: '#3b82f6',
      btnText: '#ffffff',
      font: "'Inter', sans-serif"
    };

    const displayBg = theme.bg;
    const displayText = theme.text;
    const displayBorder = theme.border;
    const displayCardBg = theme.cardBg;
    const displayFont = theme.font;

    // Compose HTML content
    let questionsHTML = '';
    test.questions.forEach((q, i) => {
      let optionsHTML = '';
      if (q.type === 'MCQ' || q.type === 'MSQ') {
        optionsHTML = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; padding-left: 15px;">`;
        q.options.forEach((opt, oIdx) => {
          optionsHTML += `<div style="font-size: 13px; color: ${displayText};">[ ] ${String.fromCharCode(65 + oIdx)}. ${opt}</div>`;
        });
        optionsHTML += `</div>`;
      } else if (q.type === 'NAT' || q.type === 'FITB') {
        optionsHTML = `<div style="margin-top: 10px; padding-left: 15px; font-size: 13px; color: #64748b;">Answer: __________________________________________________</div>`;
      }

      questionsHTML += `
        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          <p style="font-size: 14px; font-weight: 700; margin: 0; color: ${displayText};">
            ${i + 1}. ${q.question} <span style="font-size: 10px; font-weight: normal; color: #64748b; font-family: monospace;">(${q.type})</span>
          </p>
          ${optionsHTML}
        </div>
      `;
    });

    let answersHTML = '';
    test.questions.forEach((q, i) => {
      const correctAns = q.type === 'MSQ' ? (q.correctAnswers || []).join(', ') : (q.correctAnswer || '');
      answersHTML += `
        <div style="margin-bottom: 12px; border-bottom: 1px solid ${displayBorder}; padding-bottom: 8px; page-break-inside: avoid;">
          <p style="font-size: 14px; font-weight: 700; margin: 0; color: ${displayText};">
            Question ${i + 1} Answer & Explanation
          </p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: ${displayText};">
            <strong style="color: #475569;">Correct Answer:</strong> 
            <span style="font-family: monospace; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 700; border: 1px solid #cbd5e1;">${correctAns}</span>
          </p>
          ${q.explanation ? `
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #4b5563; font-style: italic; line-height: 1.5;">
              <strong>Explanation:</strong> ${q.explanation}
            </p>
          ` : ''}
        </div>
      `;
    });

    const promoFooter = `
      <div style="margin-top: 30px; padding: 16px 24px; border-top: 2px solid ${displayBorder}; font-family: ${displayFont}, sans-serif; display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; background-color: ${displayCardBg}; border-radius: 12px; page-break-inside: avoid;">
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
    `;

    const completeHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${test.title}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            color: ${displayText};
            background-color: ${displayBg};
            padding: 0;
            line-height: 1.6;
          }
          h1 {
            color: ${theme.primary};
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 5px;
          }
          .meta-info {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 20px;
            border-bottom: 2px solid ${displayBorder};
            padding-bottom: 10px;
          }
          .part-title {
            font-size: 18px;
            font-weight: 850;
            color: ${theme.primary};
            border-bottom: 1px solid ${theme.primary};
            padding-bottom: 5px;
            margin-top: 25px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div>
          <h1>${test.title}</h1>
          <div class="meta-info">
            Reference URL: ${test.videoUrl}
            <div style="margin-top: 15px; display: flex; justify-content: space-between; font-weight: bold; font-family: monospace; font-size: 13px;">
              <span>NAME: ___________________________</span>
              <span>DATE: ___________________</span>
              <span>SCORE: _________ / ${test.questions.length}</span>
            </div>
          </div>

          <div class="part-title">Part I: Questions</div>
          <div>
            ${questionsHTML}
          </div>
          ${promoFooter}
        </div>

        <div class="page-break">
          <div class="part-title">Part II: Answer Key & Explanation Bank</div>
          <div>
            ${answersHTML}
          </div>
          ${promoFooter}
        </div>
      </body>
      </html>
    `;

    const options = {
      format: 'A4',
      margin: {
        top: '35px',
        right: '35px',
        bottom: '35px',
        left: '35px'
      },
      printBackground: true,
      preferCSSPageSize: true
    };

    const file = { content: completeHTML };
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);
    const fileName = `${test.title.replace(/[^\w\s.-]/gi, '_').substring(0, 80)}_${Date.now()}.pdf`;
    const base64PDF = pdfBuffer.toString('base64');

    return res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      data: {
        pdf: base64PDF,
        fileName: fileName
      }
    });
  } catch (error) {
    console.error("Error exporting test PDF:", error);
    return res.status(500).json({ success: false, message: "PDF generation failed", error: error.message });
  }
};
