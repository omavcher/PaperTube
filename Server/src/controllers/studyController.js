const User = require("../models/User");
const Homework = require("../models/Homework");
const MathSolution = require("../models/MathSolution");
const ExamPlan = require("../models/ExamPlan");
const LanguageLesson = require("../models/LanguageLesson");
const { checkFreeTierLimits } = require("../utils/freeTierLimits");
const { awardXP } = require("../utils/xpHelper");
const crypto = require("crypto");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// OpenRouter priority queue for free-tier fallbacks
const FREE_MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash:free",
  "openrouter/free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "tngtech/deepseek-r1t-chimera:free"
];

const PRO_MODEL = "deepseek/deepseek-v4-flash";
const POWER_MODEL = "google/gemini-2.5-pro";

// Helper to make API calls to OpenRouter
async function callOpenRouter(systemPrompt, userPrompt, modelTier, customModelId) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  let modelsToTry = [];

  if (customModelId === "canvas") {
    modelsToTry = [PRO_MODEL, "google/gemini-2.5-flash"];
  } else if (customModelId === "scholar" || customModelId === "atlas") {
    modelsToTry = [POWER_MODEL, PRO_MODEL, "google/gemini-2.5-flash"];
  } else {
    // Free model 'flash'
    modelsToTry = FREE_MODELS;
  }

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`📡 Study Engine trying model: ${model}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://paperxify.com",
          "X-Title": "Paperxify Study Room"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log(`✅ Success with model: ${model}`);
      return { content: data.choices[0].message.content, actualModelUsed: model };
    } catch (error) {
      console.warn(`❌ Model ${model} failed: ${error.message}`);
      lastError = error;
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

// 🔹 POST /api/study/homework
exports.generateHomework = async (req, res) => {
  try {
    const { prompt, additionalPrompt, model = "flash", language = "English", tone = "Step-by-step" } = req.body;
    const userId = req.user.id;

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid study topic or homework question (at least 5 characters)."
      });
    }

    // 1. Verify user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isSubscribed = user.membership?.isActive === true;
    const userPlanId = isSubscribed ? (user.membership?.planId || "pro") : "free";

    // 2. Validate Model access level matching client expectations
    if (model === "canvas" || model === "scholar") {
      if (!isSubscribed) {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: `The selected model (${model}) requires a Pro subscription.`
        });
      }
    } else if (model === "atlas") {
      if (!isSubscribed || userPlanId !== "power") {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: "The selected model requires a Power subscription."
        });
      }
    }

    // 3. Enforce token limits and daily limits for free tier
    const TOKEN_COST = 5;
    if (!isSubscribed) {
      const limitsCheck = await checkFreeTierLimits(userId);
      if (!limitsCheck.allowed) {
        return res.status(403).json({
          success: false,
          code: limitsCheck.code,
          message: limitsCheck.reason
        });
      }

      if (user.tokens < TOKEN_COST) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_TOKENS",
          message: `You need at least ${TOKEN_COST} tokens to run this AI module.`,
          requiredTokens: TOKEN_COST,
          currentTokens: user.tokens,
          canPurchase: true
        });
      }
    }

    // 4. Construct exam-prep prompt
    const systemPrompt = `You are a world-class academic tutor and expert examiner. 
Your goal is to generate an elite, exam-grade homework answer that is guaranteed to secure full marks (100% score) on a high-stakes exam or assignment. 
Do NOT generate a generic, brief, or lazy AI response. The answer must be thorough, academically rigorous, and meticulously structured.

Use the following strict structural framework:
1. # [Title of the Homework Topic]
2. ## 🔍 Exam Question Analysis & Context
   Provide a concise academic breakdown of the question scope, identifying the underlying parameters and core principles being tested.
3. ## 📚 Core Definitions & Key Terminology
   Define the essential terms, variables, equations, or concepts in structured callouts or clear bold text.
4. ## 📝 Detailed Step-by-Step Answer / Explanation
   Provide an exhaustive, multi-paragraph, and point-by-point explanation. Break down complex ideas into detailed numbered or bulleted sections.
5. ## 💡 Illustrative Examples & Practical Applications
   Provide a real-world scenario, code block, or mathematical example demonstrating how this concept functions.
6. ## 🎯 Exam Rubric Alignment & Scoring Tips
   Explain why this answer meets standard grading rubrics, highlighting the exact keywords or key steps that examiners look for to award full marks.
7. ## 📖 References & Further Reading
   List 2-3 standard educational text references, syllabus references, or academic sources (e.g. Standard Calculus, ACM Journals, or standard reference textbooks).

Explanatory Tone/Style requested: ${tone} (apply this style to the step-by-step detailed explanations: e.g. Socratic asks guiding questions, Step-by-step focuses on logical sequences, Concise is direct and clear, Detailed is extremely comprehensive).
Response Language: Write the ENTIRE document strictly in ${language}. All labels, headers, terms, and content must be in ${language}.

Return the response in clean, standard Markdown format. Do not wrap the entire output in a markdown block, just output the raw markdown text.`;

    const userPrompt = `Develop a detailed academic homework explanation for the following query:
"${prompt}"

${additionalPrompt ? `Custom constraints and curriculum context to follow:\n"${additionalPrompt}"` : ""}`;

    console.log(`📡 Sending Homework generation request to OpenRouter for user: ${userId}`);
    const { content: rawContent, actualModelUsed } = await callOpenRouter(systemPrompt, userPrompt, userPlanId, model);

    if (!rawContent || typeof rawContent !== "string") {
      throw new Error("Invalid output received from study helper generator.");
    }

    // Clean up response if it wraps in markdown blocks
    let content = rawContent.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
    if (content.startsWith("```markdown") || content.startsWith("```")) {
      content = content.replace(/^```[a-z]*\r?\n/i, "").replace(/\r?\n```$/g, "").trim();
    }

    // Extract Title from markdown or fall back to prompt
    let title = prompt;
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // Create unique slug
    const cleanTopic = prompt.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const suffix = crypto.randomBytes(3).toString("hex");
    const slug = `${cleanTopic.substring(0, 40)}-${suffix}`;

    // 5. Save Homework guide to database
    const homework = new Homework({
      owner: userId,
      title,
      slug,
      question: prompt,
      additionalPrompt,
      content,
      model,
      language,
      tone
    });

    await homework.save();

    // Award XP for successful study homework helper (+60 XP)
    await awardXP(userId, 60);

    // 6. Deduct tokens from free user
    if (!isSubscribed) {
      user.tokens -= TOKEN_COST;
      if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
      user.tokenUsageHistory.push({
        name: `Homework Helper - ${model}`,
        tokens: -TOKEN_COST,
        date: new Date()
      });
      await user.save();
    }

    console.log(`✅ Homework saved successfully. Slug: ${slug}`);

    return res.status(200).json({
      success: true,
      homework: {
        id: homework._id,
        title: homework.title,
        slug: homework.slug,
        content: homework.content,
        question: homework.question,
        additionalPrompt: homework.additionalPrompt,
        model: homework.model,
        language: homework.language,
        tone: homework.tone,
        createdAt: homework.createdAt
      },
      tokenInfo: isSubscribed ? { type: "premium" } : { tokensRemaining: user.tokens, tokensDeducted: TOKEN_COST }
    });

  } catch (error) {
    console.error("❌ Study Homework Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during homework guide generation",
      error: error.message
    });
  }
};

// 🔹 GET /api/study/homework/:slug
exports.getHomeworkBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const homework = await Homework.findOne({ slug });
    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework guide not found."
      });
    }

    // Check ownership
    if (homework.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this study guide."
      });
    }

    return res.status(200).json({
      success: true,
      homework
    });
  } catch (error) {
    console.error("❌ Get Homework by Slug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving homework guide",
      error: error.message
    });
  }
};

// 🔹 GET /api/study/homework/history
exports.getUserHomeworkHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Homework.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error("❌ Get User Homework History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving homework history",
      error: error.message
    });
  }
};

// 🔹 POST /api/study/math
exports.generateMathSolution = async (req, res) => {
  try {
    const { prompt, image, additionalPrompt, model = "flash", language = "English", tone = "Step-by-step" } = req.body;
    const userId = req.user.id;

    if ((!prompt || prompt.trim().length === 0) && (!image || image.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a math problem or upload a problem image."
      });
    }

    // 1. Verify user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isSubscribed = user.membership?.isActive === true;
    const userPlanId = isSubscribed ? (user.membership?.planId || "pro") : "free";

    // 2. Validate Model access level matching client expectations
    if (model === "canvas" || model === "scholar") {
      if (!isSubscribed) {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: `The selected model (${model}) requires a Pro subscription.`
        });
      }
    } else if (model === "atlas") {
      if (!isSubscribed || userPlanId !== "power") {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: "The selected model requires a Power subscription."
        });
      }
    }

    // 3. Enforce token limits and daily limits for free tier
    const TOKEN_COST = 5;
    if (!isSubscribed) {
      const limitsCheck = await checkFreeTierLimits(userId);
      if (!limitsCheck.allowed) {
        return res.status(403).json({
          success: false,
          code: limitsCheck.code,
          message: limitsCheck.reason
        });
      }

      if (user.tokens < TOKEN_COST) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_TOKENS",
          message: `You need at least ${TOKEN_COST} tokens to run this AI module.`,
          requiredTokens: TOKEN_COST,
          currentTokens: user.tokens,
          canPurchase: true
        });
      }
    }

    // 4. Construct math solver system prompt
    const systemPrompt = `You are a world-class AI Math Solver. Your task is to solve the mathematical problem provided in the text or image.
Provide a highly precise, accurate, and concise step-by-step solution.
IMPORTANT: Keep the explanation short, clean, and straight to the point ("only give ans so not much explain and long only some"). Focus on formula derivations, math equations, and the final answer.

Format mathematical expressions beautifully using LaTeX notation. Use standard LaTeX delimiters:
- Inline formulas: $expression$ (e.g. $x^2 + y^2 = r^2$)
- Block formulas: $$expression$$ on a separate line (e.g. $$f(x) = \\int_{-\\infty}^{\\infty} e^{-x^2} dx$$)

Ensure all variables, fractions, limits, integrals, and matrices are wrapped in appropriate LaTeX syntax so they render cleanly.

The output must start with a clean Markdown heading 1:
# [Brief Title of the Solved Problem]

Return the response in clean, standard Markdown format. Do not wrap the entire output in a markdown block, just output the raw markdown text. Output strictly in ${language}.`;

    let userPrompt;
    if (image && image.trim().startsWith("data:image")) {
      userPrompt = [
        { 
          type: "text", 
          text: prompt 
            ? `Solve the following math problem: ${prompt}. Explain concisely in ${language}.` 
            : `Identify the math problem in the uploaded image, solve it step-by-step, and return the final answer. Explain concisely in ${language}.`
        },
        {
          type: "image_url",
          image_url: {
            url: image
          }
        }
      ];
    } else {
      userPrompt = `Solve the following math problem:\n"${prompt}"\n\n${additionalPrompt ? `Additional instructions and context:\n"${additionalPrompt}"` : ""}`;
    }

    console.log(`📡 Sending Math Solver generation request to OpenRouter for user: ${userId}`);
    const { content: rawContent, actualModelUsed } = await callOpenRouter(systemPrompt, userPrompt, userPlanId, model);

    if (!rawContent || typeof rawContent !== "string") {
      throw new Error("Invalid output received from math solver generator.");
    }

    // Clean up response if it wraps in markdown blocks
    let content = rawContent.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
    if (content.startsWith("```markdown") || content.startsWith("```")) {
      content = content.replace(/^```[a-z]*\r?\n/i, "").replace(/\r?\n```$/g, "").trim();
    }

    // Extract Title from markdown or fall back
    let title = prompt ? (prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt) : "Math Solver Solution";
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // Create unique slug
    const cleanTopic = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const suffix = crypto.randomBytes(3).toString("hex");
    const slug = `math-${cleanTopic.substring(0, 40)}-${suffix}`;

    // 5. Save Math Solution to database
    const mathSolution = new MathSolution({
      owner: userId,
      title,
      slug,
      question: prompt || "Image-based Math Problem",
      image: image || "",
      content,
      model,
      language,
      tone
    });

    await mathSolution.save();

    // Award XP for successful math solver (+60 XP)
    await awardXP(userId, 60);

    // 6. Deduct tokens from free user
    if (!isSubscribed) {
      user.tokens -= TOKEN_COST;
      if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
      user.tokenUsageHistory.push({
        name: `Math Solver - ${model}`,
        tokens: -TOKEN_COST,
        date: new Date()
      });
      await user.save();
    }

    console.log(`✅ Math solution saved successfully. Slug: ${slug}`);

    return res.status(200).json({
      success: true,
      mathSolution: {
        id: mathSolution._id,
        title: mathSolution.title,
        slug: mathSolution.slug,
        content: mathSolution.content,
        question: mathSolution.question,
        image: mathSolution.image,
        model: mathSolution.model,
        language: mathSolution.language,
        tone: mathSolution.tone,
        createdAt: mathSolution.createdAt
      },
      tokenInfo: isSubscribed ? { type: "premium" } : { tokensRemaining: user.tokens, tokensDeducted: TOKEN_COST }
    });

  } catch (error) {
    console.error("❌ Study Math Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during math solver generation",
      error: error.message
    });
  }
};

// 🔹 GET /api/study/math/:slug
exports.getMathSolutionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const mathSolution = await MathSolution.findOne({ slug });
    if (!mathSolution) {
      return res.status(404).json({
        success: false,
        message: "Math solution not found."
      });
    }

    // Check ownership
    if (mathSolution.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this math solution."
      });
    }

    return res.status(200).json({
      success: true,
      mathSolution
    });
  } catch (error) {
    console.error("❌ Get Math Solution by Slug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving math solution",
      error: error.message
    });
  }
};

// 🔹 GET /api/study/math/history
exports.getUserMathHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await MathSolution.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error("❌ Get User Math History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving math history",
      error: error.message
    });
  }
};

// 🔹 POST /api/study/planner
exports.generateExamPlan = async (req, res) => {
  try {
    const { prompt, targetDate, dailyHours, prepLevel, additionalPrompt, model = "flash" } = req.body;
    const userId = req.user.id;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter an exam name."
      });
    }

    if (!targetDate) {
      return res.status(400).json({
        success: false,
        message: "Please select a target exam date."
      });
    }

    // 1. Verify user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isSubscribed = user.membership?.isActive === true;
    const userPlanId = isSubscribed ? (user.membership?.planId || "pro") : "free";

    // 2. Validate Model access level
    if (model === "canvas" || model === "scholar") {
      if (!isSubscribed) {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: `The selected model (${model}) requires a Pro subscription.`
        });
      }
    } else if (model === "atlas") {
      if (!isSubscribed || userPlanId !== "power") {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: "The selected model requires a Power subscription."
        });
      }
    }

    // 3. Enforce token limits and daily limits for free tier
    const TOKEN_COST = 5;
    if (!isSubscribed) {
      const limitsCheck = await checkFreeTierLimits(userId);
      if (!limitsCheck.allowed) {
        return res.status(403).json({
          success: false,
          code: limitsCheck.code,
          message: limitsCheck.reason
        });
      }

      if (user.tokens < TOKEN_COST) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_TOKENS",
          message: `You need at least ${TOKEN_COST} tokens to run this AI module.`,
          requiredTokens: TOKEN_COST,
          currentTokens: user.tokens,
          canPurchase: true
        });
      }
    }

    // 4. Construct system prompt
    const systemPrompt = `You are a world-class AI Exam Preparation Planner. Your task is to generate a highly detailed and customized day-by-day and week-by-week study calendar/schedule to help the user prepare for their upcoming exam.
You must output the plan strictly in a valid JSON format. Do not wrap the JSON inside markdown code blocks (do not output \`\`\`json ... \`\`\`), just output the raw JSON text itself.

The JSON response MUST match the following typescript interface exactly:
{
  "title": string, // E.g., "SAT Prep Plan", "MCAT Prep Plan"
  "examName": string,
  "targetDate": string, // YYYY-MM-DD
  "dailyHours": string,
  "prepLevel": string,
  "phases": Array<{
    "name": string, // E.g. "Phase 1: Foundation Building"
    "duration": string, // E.g. "Weeks 1-4"
    "description": string,
    "tasks": Array<string>
  }>,
  "weeks": Array<{
    "weekNumber": number,
    "focus": string, // Core focus of the week
    "days": Array<{
      "day": number, // Day number (1 to 7)
      "topic": string, // Topic name
      "tasks": Array<string>, // Specific study tasks for this day
      "hours": number // Suggested hours for this day (based on dailyHours)
    }>
  }>
}

Generate a comprehensive day-by-day list for Week 1 (7 days), and then week-by-week summaries for subsequent weeks (for weeks 2 to 6, you can include the weeks array item with its focus and an empty or summarized days list, or general weekly tasks). This keeps the token size compact and fast.
Make the study tasks highly practical, using active recall (self-quizzing, flashcards) and spaced repetition techniques.`;

    const userPrompt = `Create a custom exam prep plan with these inputs:
- Exam Name: "${prompt}"
- Target Date: "${targetDate}"
- Daily Commitment: "${dailyHours}"
- Preparation Level: "${prepLevel}"
- Additional context/focus areas: "${additionalPrompt || "All core syllabus areas"}"`;

    console.log(`📡 Sending Exam Planner generation request to OpenRouter for user: ${userId}`);
    const { content: rawContent, actualModelUsed } = await callOpenRouter(systemPrompt, userPrompt, userPlanId, model);

    if (!rawContent || typeof rawContent !== "string") {
      throw new Error("Invalid output received from exam planner generator.");
    }

    // Clean up markdown block wraps
    let content = rawContent.trim();
    if (content.startsWith("```json") || content.startsWith("```")) {
      content = content.replace(/^```[a-z]*\r?\n/i, "").replace(/\r?\n```$/g, "").trim();
    }

    // Validate if it is JSON
    try {
      JSON.parse(content);
    } catch (e) {
      console.warn("⚠️ AI did not return valid JSON. Wrapping response inside a fallback JSON structure.");
      content = JSON.stringify({
        title: `${prompt} Preparation Plan`,
        examName: prompt,
        targetDate,
        dailyHours,
        prepLevel,
        phases: [
          {
            name: "Phase 1: Foundation",
            duration: "Weeks 1-4",
            description: "Read, study core subjects, and make summaries.",
            tasks: [additionalPrompt || "Review exam syllabus details."]
          }
        ],
        weeks: [
          {
            weekNumber: 1,
            focus: "Initial Assessment and Study Setup",
            days: [
              {
                day: 1,
                topic: "Diagnostic Prep Setup",
                tasks: ["Gather prep materials", "Plan daily study schedule"],
                hours: 2
              }
            ]
          }
        ],
        rawMessage: content
      });
    }

    // Extract Title for Slug
    let title = `${prompt} Prep Plan`;
    const slug = `exam-${prompt.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 30)}-${crypto.randomBytes(3).toString("hex")}`;

    // 5. Save Exam Plan to DB
    const examPlan = new ExamPlan({
      owner: userId,
      title,
      slug,
      examName: prompt,
      targetDate: new Date(targetDate),
      dailyHours,
      prepLevel,
      content,
      model: actualModelUsed || model,
    });

    await examPlan.save();

    // Award XP for successful exam plan (+60 XP)
    await awardXP(userId, 60);

    // Deduct tokens if not subscribed
    if (!isSubscribed) {
      user.tokens = Math.max(0, user.tokens - TOKEN_COST);
      await user.save();
    }

    console.log(`... Exam Prep Plan successfully compiled and saved: ${slug}`);
    return res.status(200).json({
      success: true,
      examPlan,
      tokenInfo: {
        tokensRemaining: user.tokens
      }
    });

  } catch (error) {
    console.error("❌ Generate Exam Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating your exam preparation plan.",
      error: error.message
    });
  }
};

// 🔹 GET /api/study/planner/history
exports.getUserExamPlanHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await ExamPlan.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error("❌ Get User Exam Plan History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving exam plan history",
      error: error.message
    });
  }
};

// 🔹 GET /api/study/planner/:slug
exports.getExamPlanBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const examPlan = await ExamPlan.findOne({ slug });

    if (!examPlan) {
      return res.status(404).json({
        success: false,
        message: "Exam plan not found."
      });
    }

    return res.status(200).json({
      success: true,
      examPlan
    });
  } catch (error) {
    console.error("❌ Get Exam Plan by Slug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving exam plan",
      error: error.message
    });
  }
};

// 🔹 POST /api/study/tutor
exports.generateLanguageLesson = async (req, res) => {
  try {
    const {
      prompt,
      targetLanguage = "Spanish",
      proficiencyLevel = "Beginner (A1-A2)",
      learningFocus = "Conversational Speaking",
      additionalPrompt,
      model = "flash"
    } = req.body;

    const userId = req.user.id;

    if (!prompt || prompt.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please enter a practice scenario or learning topic (at least 3 characters)."
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({ success: false, message: "Please select a target language." });
    }

    // 1. Verify user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isSubscribed = user.membership?.isActive === true;
    const userPlanId = isSubscribed ? (user.membership?.planId || "pro") : "free";

    // 2. Model access check
    if (model === "canvas" || model === "scholar") {
      if (!isSubscribed) {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: `The selected model (${model}) requires a Pro subscription.`
        });
      }
    } else if (model === "atlas") {
      if (!isSubscribed || userPlanId !== "power") {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: "The selected model requires a Power subscription."
        });
      }
    }

    // 3. Token / free-tier check
    const TOKEN_COST = 5;
    if (!isSubscribed) {
      const limitsCheck = await checkFreeTierLimits(userId);
      if (!limitsCheck.allowed) {
        return res.status(403).json({ success: false, code: limitsCheck.code, message: limitsCheck.reason });
      }
      if (user.tokens < TOKEN_COST) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_TOKENS",
          message: `You need at least ${TOKEN_COST} tokens to run this AI module.`,
          requiredTokens: TOKEN_COST,
          currentTokens: user.tokens,
          canPurchase: true
        });
      }
    }

    // 4. Build AI prompt — output must be valid JSON
    const systemPrompt = `You are an elite, certified language teacher with 20+ years of immersive teaching experience. 
Your task is to generate a rich, structured language lesson in JSON format.

IMPORTANT: Output ONLY raw JSON — no markdown fences, no extra text. The JSON MUST match this exact TypeScript interface:

{
  "lessonTitle": string,
  "targetLanguage": string,
  "proficiencyLevel": string,
  "learningFocus": string,
  "scenario": string,
  "vocabulary": Array<{
    "native": string,        // word/phrase in the target language
    "english": string,       // English translation
    "pronunciation": string, // phonetic / romanization hint
    "example": string        // a short example sentence in target language
  }>,
  "grammarPoints": Array<{
    "rule": string,
    "explanation": string,
    "examples": string[]    // 2-3 short example sentences
  }>,
  "dialogue": Array<{
    "speaker": string,   // "Tutor" or "Student"
    "targetLang": string,  // the sentence in the target language
    "english": string       // English translation
  }>,
  "exercises": Array<{
    "type": string,          // e.g. "Translate", "Fill-in-the-blank", "Multiple choice"
    "instruction": string,
    "question": string,
    "answer": string
  }>,
  "culturalTip": string,
  "nextSteps": string[]
}

Rules:
- vocabulary: include 6-10 high-value words/phrases directly relevant to the scenario
- grammarPoints: include 2-3 grammar rules critical for the proficiency level
- dialogue: 8-12 turns of natural, realistic conversation for the scenario
- exercises: include 4-5 diverse practice exercises with clear answers
- culturalTip: one paragraph of meaningful cultural context
- nextSteps: 3 actionable steps for the learner to continue progressing
- Make all content specifically tailored to: Language=${targetLanguage}, Level=${proficiencyLevel}, Focus=${learningFocus}, Scenario=${prompt}`;

    const userPrompt = `Generate a full language lesson for:
- Target Language: "${targetLanguage}"
- Proficiency Level: "${proficiencyLevel}"
- Learning Focus: "${learningFocus}"
- Practice Scenario: "${prompt}"
${additionalPrompt ? `- Extra Notes: "${additionalPrompt}"` : ""}`;

    console.log(`📡 Sending Language Tutor request to OpenRouter for user: ${userId}`);
    const { content: rawContent, actualModelUsed } = await callOpenRouter(systemPrompt, userPrompt, userPlanId, model);

    if (!rawContent || typeof rawContent !== "string") {
      throw new Error("Invalid output received from language tutor generator.");
    }

    // Clean possible markdown fences
    let content = rawContent.replace(/<thought>[\s\S]*?<\/thought>/gi, "").trim();
    if (content.startsWith("```json") || content.startsWith("```")) {
      content = content.replace(/^```[a-z]*\r?\n/i, "").replace(/\r?\n```$/g, "").trim();
    }

    // Validate JSON
    let lessonData;
    try {
      lessonData = JSON.parse(content);
    } catch (e) {
      console.warn("⚠️ AI did not return valid JSON for language lesson. Using fallback.");
      lessonData = {
        lessonTitle: `${targetLanguage} Lesson: ${prompt}`,
        targetLanguage,
        proficiencyLevel,
        learningFocus,
        scenario: prompt,
        vocabulary: [{ native: "(see raw output)", english: "(see raw output)", pronunciation: "-", example: content.substring(0, 100) }],
        grammarPoints: [],
        dialogue: [],
        exercises: [],
        culturalTip: "Content generation encountered an issue. Please try again.",
        nextSteps: ["Try regenerating the lesson with a more specific scenario."]
      };
      content = JSON.stringify(lessonData);
    }

    const title = lessonData.lessonTitle || `${targetLanguage} — ${prompt}`;
    const slug = `tutor-${targetLanguage.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${crypto.randomBytes(3).toString("hex")}`;

    // 5. Save to DB
    const lesson = new LanguageLesson({
      owner: userId,
      title,
      slug,
      targetLanguage,
      proficiencyLevel,
      learningFocus,
      topic: prompt,
      content,
      model: actualModelUsed || model
    });

    await lesson.save();

    // Award XP for successful language lesson (+60 XP)
    await awardXP(userId, 60);

    // 6. Deduct tokens for free users
    if (!isSubscribed) {
      user.tokens = Math.max(0, user.tokens - TOKEN_COST);
      await user.save();
    }

    console.log(`✅ Language lesson saved: ${slug}`);
    return res.status(200).json({
      success: true,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        slug: lesson.slug,
        targetLanguage: lesson.targetLanguage,
        proficiencyLevel: lesson.proficiencyLevel,
        learningFocus: lesson.learningFocus,
        topic: lesson.topic,
        content: lesson.content,
        model: lesson.model,
        createdAt: lesson.createdAt
      },
      tokenInfo: isSubscribed ? { type: "premium" } : { tokensRemaining: user.tokens, tokensDeducted: TOKEN_COST }
    });

  } catch (error) {
    console.error("❌ Generate Language Lesson Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating your language lesson.",
      error: error.message
    });
  }
};

// 🔹 GET /api/study/tutor/history
exports.getUserLanguageLessonsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await LanguageLesson.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error("❌ Get Language Lesson History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving language lesson history",
      error: error.message
    });
  }
};

// 🔹 GET /api/study/tutor/:slug
exports.getLanguageLessonBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const lesson = await LanguageLesson.findOne({ slug });
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Language lesson not found." });
    }

    if (lesson.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this lesson." });
    }

    return res.status(200).json({ success: true, lesson });
  } catch (error) {
    console.error("❌ Get Language Lesson by Slug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving language lesson",
      error: error.message
    });
  }
};

// 🔹 DELETE /api/study/homework/:id
exports.deleteHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await Homework.findOneAndDelete({ _id: id, owner: userId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Homework guide not found or unauthorized." });
    }
    return res.status(200).json({ success: true, message: "Homework guide deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete homework guide.", error: error.message });
  }
};

// 🔹 DELETE /api/study/math/:id
exports.deleteMathSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await MathSolution.findOneAndDelete({ _id: id, owner: userId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Math solution not found or unauthorized." });
    }
    return res.status(200).json({ success: true, message: "Math solution deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete math solution.", error: error.message });
  }
};

// 🔹 DELETE /api/study/planner/:id
exports.deleteExamPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await ExamPlan.findOneAndDelete({ _id: id, owner: userId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Exam plan not found or unauthorized." });
    }
    return res.status(200).json({ success: true, message: "Exam plan deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete exam plan.", error: error.message });
  }
};

// 🔹 DELETE /api/study/tutor/:id
exports.deleteLanguageLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await LanguageLesson.findOneAndDelete({ _id: id, owner: userId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Language lesson not found or unauthorized." });
    }
    return res.status(200).json({ success: true, message: "Language lesson deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete language lesson.", error: error.message });
  }
};
