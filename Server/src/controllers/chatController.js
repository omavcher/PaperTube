const jwt = require("jsonwebtoken");
const Note = require("../models/Note");
const AiChat = require("../models/AiChat");
const User = require("../models/User");
const { getUserPlanId, PLAN_QUOTAS, getPeriodStartDate } = require("../middleware/quotaMiddleware");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// OpenRouter model routing matrix by user subscription tier
const CHAT_MODELS_BY_TIER = {
  free: [
    'deepseek/deepseek-v4-flash',
    'qwen/qwen3.6-flash',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openai/gpt-4o-mini'
  ],
  pro: [
      'deepseek/deepseek-v4-flash',
    'qwen/qwen3.6-flash',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openai/gpt-4o-mini'
  ],
  scholar: [
     'deepseek/deepseek-v4-flash',
    'qwen/qwen3.6-flash',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openai/gpt-4o-mini'
  ],
  power: [
    'google/gemini-3-pro-preview',
    'openai/gpt-5-nano',
    'openai/gpt-4o',
    'anthropic/claude-3.5-sonnet',
    'deepseek/deepseek-v4-flash'
  ]
};

/**
 * Helper to parse time string like "01:23:45" or "05:30" into seconds
 */
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/[^\d:]/g, '');
  const parts = clean.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function isValidTimestamp(ts) {
  if (!ts) return false;
  const clean = ts.replace(/[^\d:]/g, '').trim();
  if (!clean || clean === '00:00' || clean === '0:00' || clean === '00:00:00' || clean === '0') return false;
  return parseTimeToSeconds(clean) > 0;
}

/**
 * Format video timestamps into direct clickable YouTube markdown links
 */
function formatTimestampLinks(text, videoId) {
  if (!text || !videoId) return text || "";
  const baseVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Range timestamps: [00:00 - 01:00]
  let formatted = text.replace(/(?<!!)\[\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\](?!\()/g, (match, start, end) => {
    const sec = parseTimeToSeconds(start);
    if (sec <= 0) return "";
    return `[⏱️ ${start} - ${end}](${baseVideoUrl}&t=${sec}s)`;
  });

  // Single timestamps: [ 01:23:45 ]
  formatted = formatted.replace(/(?<!!)\[\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\](?!\()/g, (match, time) => {
    const sec = parseTimeToSeconds(time);
    if (sec <= 0) return "";
    return `[⏱️ ${time}](${baseVideoUrl}&t=${sec}s)`;
  });

  return formatted;
}

/**
 * Build structured Knowledge IR context from Note document
 */
function buildGroundedKnowledgeContext(note) {
  const kir = note.knowledgeIR || {};
  const kg = kir.knowledgeGraph || {};
  const videoId = note.videoId || "";
  const baseVideoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (note.videoUrl || "https://www.youtube.com");

  const chaptersSummary = (note.chapters || kir.chapters || []).map(ch => {
    const startSec = ch.start || ch.startSeconds || 0;
    const endSec = ch.end || ch.endSeconds || 0;
    const timeLabel = startSec > 0 ? `(${startSec}s - ${endSec}s)` : '';
    return `- **${ch.title}** ${timeLabel}: ${ch.summary || ''}`;
  }).join('\n') || 'None';

  const definitions = (kg.definitions || []).slice(0, 20).map(d => 
    `- **${d.term}**: ${d.definition} ${isValidTimestamp(d.timestamp) ? `(Timestamp: ${d.timestamp})` : ''}`
  ).join('\n') || 'None';

  const formulas = (kg.formulas || []).slice(0, 15).map(f => 
    `- Formula: $$${f.latex}$$ | Variables: ${f.variables || 'N/A'} ${isValidTimestamp(f.timestamp) ? `(Timestamp: ${f.timestamp})` : ''}`
  ).join('\n') || 'None';

  const keyPoints = (kg.keyPoints || []).slice(0, 20).map(p => 
    `- ${p.point} ${isValidTimestamp(p.timestamp) ? `(${p.timestamp})` : ''}`
  ).join('\n') || 'None';

  const commonMistakes = (kg.commonMistakes || []).slice(0, 8).map(m => 
    `- ⚠️ Misconception: "${m.mistake}" ➔ Correct: "${m.correction}"`
  ).join('\n') || 'None';

  const examTips = (kg.examTips || []).slice(0, 8).map(e => 
    `- 🎯 ${e.tip}`
  ).join('\n') || 'None';

  const codeSnippets = (kg.codeSnippets || []).slice(0, 5).map(c => 
    `\`\`\`${c.language || 'text'}\n${c.code}\n\`\`\`\nExplanation: ${c.explanation || ''}`
  ).join('\n\n') || 'None';

  // Compact content excerpt for direct citation
  const noteExcerpt = (note.content || '').substring(0, 3500);

  return {
    videoId,
    baseVideoUrl,
    title: note.title,
    contextBlock: `
### 📚 DOCUMENT METADATA
- **Title**: "${note.title}"
- **Video ID**: ${videoId}
- **Base Video URL**: ${baseVideoUrl}

### 📑 CHAPTER TIMESTAMPS
${chaptersSummary}

### 🔑 CANONICAL DEFINITIONS
${definitions}

### 🧮 FORMULAS & MATHEMATICAL PRINCIPLES
${formulas}

### 🔴 HIGH YIELD KEY POINTS
${keyPoints}

### ⚠️ COMMON MISCONCEPTIONS & PITFALLS
${commonMistakes}

### 🎯 EXAM PREP TIPS
${examTips}

### 💻 CODE ARTIFACTS
${codeSnippets}

### 📝 NOTE CONTENT EXCERPT
${noteExcerpt}
`
  };
}

/**
 * Get all messages for a specific note
 */
exports.getMessages = async (req, res) => {
  try {
    const { noteId } = req.params;
    if (!noteId) {
      return res.status(400).json({ error: "noteId is required" });
    }
    if (noteId.startsWith("mock-note") || noteId.length !== 24) {
      return res.json({ messages: [] });
    }
    const aiChat = await AiChat.findOne({ noteId });
    if (!aiChat || !aiChat.messages) {
      return res.json({ messages: [] });
    }
    res.json({ messages: aiChat.messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Handle new tutor message with streaming response & active knowledge grounding
 */
exports.handleMessage = async (req, res) => {
  try {
    const { 
      noteId, 
      message, 
      mode = "tutor", 
      selectedText, 
      chatModelId,
      userPlan = "free",
      noteTitle,
      noteContent,
      videoUrl
    } = req.body;

    if (!noteId || !message) {
      return res.status(400).json({ error: "noteId and message are required" });
    }

    // 1. Resolve authentic user & plan tier
    let user = null;
    const authHeader = req.header('Auth') || req.header('Authorization');
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          const decoded = jwt.verify(token, process.env.SESSION_SECRET);
          user = await User.findById(decoded.id).select('membership name email');
        } catch (e) {
          // Token invalid/expired - continue as guest
        }
      }
    }

    const resolvedPlanId = getUserPlanId(user);
    const planConfig = PLAN_QUOTAS[resolvedPlanId] || PLAN_QUOTAS.free;
    const chatLimit = planConfig.paperChatMessages || 100;
    const startDate = getPeriodStartDate(resolvedPlanId, user?.membership);

    // 2. Enforce PaperChat messages limit
    if (user) {
      try {
        const userNotes = await Note.find({ owner: user._id }).select('_id').limit(500);
        const noteIds = userNotes.map(n => n._id);
        if (noteId && !noteIds.some(id => id.toString() === noteId)) {
          noteIds.push(noteId);
        }
        const chats = await AiChat.find({ noteId: { $in: noteIds } });
        let messageCount = 0;
        for (const c of chats) {
          for (const m of (c.messages || [])) {
            if (m.role === 'user' && m.timestamp && new Date(m.timestamp) >= startDate) {
              messageCount++;
            }
          }
        }

        if (messageCount >= chatLimit) {
          const periodWord = planConfig.period === 'daily' ? 'today' : 'this month';
          const upgradeTarget = resolvedPlanId === 'free' ? 'Pro Scholar ($9.99/mo)' : 'Power Scholar ($19.99/mo)';
          return res.status(403).json({
            success: false,
            code: 'QUOTA_EXCEEDED',
            message: `You've reached your ${planConfig.name} plan limit of ${chatLimit} PaperChat messages for ${periodWord}. Upgrade to ${upgradeTarget} to unlock more messages.`,
            used: messageCount,
            limit: chatLimit,
            plan: planConfig.name,
            planId: resolvedPlanId,
            period: planConfig.period,
            upgradeUrl: '/pricing'
          });
        }
      } catch (err) {
        console.warn('PaperChat quota counting notice:', err.message);
      }
    }

    let note = null;
    if (noteId && !noteId.startsWith("mock-note") && noteId.length === 24) {
      note = await Note.findById(noteId).catch(() => null);
    }

    // Support mock notes and direct note content
    if (!note) {
      note = {
        _id: noteId,
        title: noteTitle || "Lecture Study Guide",
        content: noteContent || "",
        videoUrl: videoUrl || "https://www.youtube.com",
        videoId: (videoUrl && videoUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/)?.[1]) || "",
        chapters: [],
        knowledgeIR: {
          knowledgeGraph: {
            definitions: [],
            formulas: [],
            keyPoints: [],
            commonMistakes: [],
            examTips: [],
            codeSnippets: []
          }
        }
      };
    }

    // Fetch or create chat document
    let aiChat = null;
    try {
      if (!noteId.startsWith("mock-note") && noteId.length === 24) {
        aiChat = await AiChat.findOne({ noteId });
        if (!aiChat) {
          aiChat = new AiChat({ noteId, messages: [] });
        }
      }
    } catch (err) {
      console.warn("Could not find or init AiChat:", err.message);
      aiChat = null;
    }

    // Recent chat history
    const recentMessages = aiChat ? aiChat.messages.slice(-8).map(m => ({
      role: m.role,
      content: m.content
    })) : [];

    // Build Grounded Knowledge Context
    const { videoId, baseVideoUrl, title, contextBlock } = buildGroundedKnowledgeContext(note);

    // Mode-specific instructions with distinctive output architectures
    const modeSystemInstructions = {
      tutor: `You are PaperChat AI, the student's personal Socratic AI Tutor.
Your goal is to guide the student to deep mastery of "${title}" through intuitive reasoning and active learning.
Structure your response in this EXACT format:
### 💡 Core Intuition
(Explain the underlying concept clearly and why it matters)

### 📚 Step-by-Step Breakdown
(1. First step / building block)
(2. Second step / transition)
(3. Final insight)

### 🎯 Socratic Check Question
(Ask 1 brief, thought-provoking question to test if the student truly understands. E.g. "What happens if...?")

Cite exact video timestamps: [⏱️ HH:MM:SS](${baseVideoUrl}&t=Xs).`,

      study: `You are PaperChat AI in Active Study Session Mode for "${title}".
Conduct a structured academic study session.
Structure your response in this EXACT format:
### 🎓 Lecture Milestone & Objective
(Define the learning objective for this section)

### 📖 In-Depth Explanation
(Clear, comprehensive conceptual explanation with bold keywords)

### 🧠 Knowledge Verification Checkpoint
(Interactive review question for the student to reflect on)`,

      exam_prep: `You are PaperChat AI in High-Yield Exam Preparation Mode for "${title}".
Focus exclusively on score-boosting takeaways and avoiding marks loss:
Structure your response in this EXACT format:
### 🔴 High-Yield Exam Takeaways
(Top testable bullet points that frequently appear on exams)

### ⚠️ Common Exam Traps & Pitfalls
(Crucial mistakes, common misconceptions, and tricky edge cases students lose marks on)

### 🎯 Typical Exam Question & Mark Scheme
(Sample exam question with answer keywords and grading points)

### ⚡ Memory Mnemonic / Hook
(1-liner memory aid or formula hook)`,

      quick: `You are PaperChat AI in Quick Answer Mode.
Provide an ultra-crisp, direct, zero-fluff factual answer.
Structure your response in this EXACT format:
### ⚡ Quick Takeaway
(Direct 1-2 sentence core answer)

- **Key Fact 1**: (bullet point)
- **Key Fact 2**: (bullet point)
- **Source**: [⏱️ HH:MM:SS](${baseVideoUrl}&t=Xs)`,

      deep_dive: `You are PaperChat AI in Academic Deep Dive Mode.
Deliver an exhaustive, university-level theoretical breakdown of "${title}":
Structure your response in this EXACT format:
### 🔬 Theoretical Foundations & Principles
(Detailed conceptual and architectural explanation)

### 🧮 Mathematical & Technical Formulation
(Formal notation, KaTeX math $$ formula $$, and parameter definitions)

### ⚙️ Production Trade-offs & Edge Cases
(Real-world system constraints, complexity analysis, and edge failure modes)`,

      explain_simply: `You are PaperChat AI in Explain Simply (ELI5) Mode.
Explain the requested concept using relatable real-world analogies and simple language.
Structure your response in this EXACT format:
### 💡 The Everyday Analogy
(Start with: "Imagine you are..." and tell a simple, vivid story that makes the concept instantly clear)

### 🧩 How It Works in Plain English
(1. First simple step)
(2. Second simple step)
(3. Result)

### 💬 Golden Rule in One Sentence
(Single memorable quote takeaway)`,

      coding_tutor: `You are PaperChat AI in Coding Tutor Mode.
Structure your response in this EXACT format:
### 💻 Implementation Code
\`\`\`language
// Complete, clean, well-commented code
\`\`\`

### 🔍 Code Walkthrough
(Line-by-line explanation of key logic)

### ⏱️ Complexity Analysis
- **Time Complexity**: $O(...)$ — (explanation)
- **Space Complexity**: $O(...)$ — (explanation)

### 🛠️ Practice Challenge
(1 mini coding exercise for the student to solve)`,

      problem_solver: `You are PaperChat AI in Math & Problem Solver Mode.
Structure your response in this EXACT format:
### 🧮 Problem & Given Formulas
(State the formula using KaTeX $$ formula $$ and define all variables)

### 📐 Step-by-Step Mathematical Derivation
(Step 1: ...)
(Step 2: ...)
(Step 3: ...)

### 🔑 Final Solution & Intuition
(Final boxed answer with conceptual meaning)`,

      quiz: `You are PaperChat AI in Interactive Quiz Mode.
Generate 4-5 high-yield multiple choice questions testing active recall.
Format questions with **Q1. ...**, options A, B, C, D, and answers at the bottom.`,

      revision: `You are PaperChat AI in Rapid Revision Mode.
Structure your response in this EXACT format:
### ⚡ 30-Second Summary
(Lightning overview)

### 🔑 3 Core Memory Anchors
1. (Anchor 1)
2. (Anchor 2)
3. (Anchor 3)

### 🧮 Essential Formulas / Cheat-Sheet Box
(Key formulas or syntax to remember)`
    };

    const selectedModeInstruction = modeSystemInstructions[mode] || modeSystemInstructions.tutor;

    // Highlighted Text Context (if user selected text in note canvas)
    const highlightContext = selectedText 
      ? `\n\n[STUDENT HIGHLIGHTED CONTEXT]: The student selected this specific text on their note canvas:\n"${selectedText}"\nFocus your answer directly on explaining, clarifying, or testing this highlighted concept.`
      : '';

    const systemPrompt = `${selectedModeInstruction}

---
## GROUNDED KNOWLEDGE BASE:
${contextBlock}
${highlightContext}

---
## RESPONSE FORMATTING RULES:
1. **KaTeX Formulas**: Use $$ formula $$ for block equations, $formula$ for inline math.
2. **Timestamp Citations**: ONLY cite a video timestamp if you know the exact non-zero moment in the lecture (e.g. [⏱️ 05:23](${baseVideoUrl}&t=323s) or [⏱️ 01:14:30](${baseVideoUrl}&t=4470s)). CRITICAL RULE: NEVER cite [00:00], 00:00, or t=0s. If a specific timestamp is unknown or at 00:00, do NOT output any timestamp at all.
3. **Markdown Tables & Code**: Use clean markdown tables for comparisons and syntax-highlighted code blocks.
4. **Follow-Up Action Suggestions**: End your response with 3-4 interactive action tags on a new line formatted exactly like:
\`\`\`actions
[⚡ Explain Simply] [💡 Give Example] [🧠 Quiz Me] [🔍 Go Deeper]
\`\`\`
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...recentMessages,
      { role: "user", content: message }
    ];

    // Determine model list based on authoritative resolved plan
    const modelCandidates = CHAT_MODELS_BY_TIER[resolvedPlanId] || CHAT_MODELS_BY_TIER.free;

    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log(`🚀 PaperChat starting stream for Note "${title}" [Mode: ${mode}, Plan: ${userPlan}]`);

    let response = null;
    let successfulModel = modelCandidates[0];

    for (const model of modelCandidates) {
      try {
        console.log(`🤖 PaperChat calling OpenRouter model: ${model}`);
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://paperxify.com",
            "X-Title": "PaperChat AI Tutor"
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            stream: true,
            temperature: mode === 'socratic' || mode === 'tutor' ? 0.7 : 0.3
          })
        });

        if (response.ok) {
          successfulModel = model;
          break;
        } else {
          const errText = await response.text().catch(() => '');
          console.warn(`⚠️ Model ${model} failed HTTP ${response.status}: ${errText}`);
        }
      } catch (err) {
        console.warn(`⚠️ Model ${model} error:`, err.message);
      }
    }

    if (!response || !response.ok) {
      res.write(`data: ${JSON.stringify({ error: "Unable to reach AI tutor service. Please try again." })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.includes('[DONE]')) continue;

        try {
          const jsonStr = line.replace(/^data: /, '');
          const data = JSON.parse(jsonStr);
          const content = data.choices?.[0]?.delta?.content || "";

          if (content) {
            fullContent += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (e) {
          // Ignore partial chunk parse warnings
        }
      }
    }

    // Save chat interaction to history if database chat exists
    if (aiChat) {
      aiChat.messages.push({ 
        role: "user", 
        content: message, 
        timestamp: new Date(),
        mode: mode,
        selectedText: selectedText || null
      });

      aiChat.messages.push({ 
        role: "assistant", 
        content: fullContent, 
        timestamp: new Date(),
        modelUsed: successfulModel,
        mode: mode,
        videoLink: baseVideoUrl
      });

      // Keep history manageable
      if (aiChat.messages.length > 30) {
        aiChat.messages = aiChat.messages.slice(-30);
      }

      await aiChat.save();
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error("PaperChat Tutor Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  }
};

/**
 * Handle message feedback (Thumbs up/down)
 */
exports.handleFeedback = async (req, res) => {
  try {
    const { noteId, messageId, feedback } = req.body;
    if (!noteId || !messageId) {
      return res.status(400).json({ error: "noteId and messageId are required" });
    }

    const aiChat = await AiChat.findOne({ noteId });
    if (!aiChat) return res.status(404).json({ error: "Chat not found" });

    const msgIndex = aiChat.messages.findIndex(m => m._id.toString() === messageId);
    if (msgIndex === -1) return res.status(404).json({ error: "Message not found" });

    aiChat.messages[msgIndex].feedback = feedback;
    await aiChat.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving message feedback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};