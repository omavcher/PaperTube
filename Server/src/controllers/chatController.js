const Note = require("../models/Note");
const AiChat = require("../models/AiChat");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// OpenRouter model for PaperChat
const CHAT_MODEL = "openrouter/free";

/**
 * Get all messages for a specific note
 */
exports.getMessages = async (req, res) => {
  try {
    const { noteId } = req.params;
    if (!noteId) {
      return res.status(400).json({ error: "noteId is required" });
    }
    const aiChat = await AiChat.findOne({ noteId });
    if (!aiChat) {
      return res.json({ messages: [] });
    }
    res.json({ messages: aiChat.messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Handle a new chat message with streaming response
 */
exports.handleMessage = async (req, res) => {
  try {
    const { noteId, message, mode, chatModelPersona, chatModelId } = req.body;
    if (!noteId || !message) {
      return res.status(400).json({ error: "noteId and message are required" });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Fetch or create chat document
    let aiChat = await AiChat.findOne({ noteId });
    if (!aiChat) {
      aiChat = new AiChat({ noteId, messages: [] });
    }

    // Get recent chat history (last 5 exchanges)
    const recentMessages = aiChat.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Build mode-specific system prompt
    const noteContent = note.content.substring(0, 4000);
    const transcript = (note.transcript || "").substring(0, 2000);

    const modePrompts = {
      summarize: `
You are **PaperChat AI** in **Summarize Mode**. Your only job is to create a beautifully structured summary.

## NOTE CONTENT:
${noteContent}

## TRANSCRIPT:
${transcript}

## STRICT OUTPUT FORMAT (follow exactly):
Produce a clean Markdown summary using this structure:
1. **## 📋 Summary** — 2-3 sentence overview
2. **## 🔑 Key Points** — 5-8 bullet points, each starting with a bold keyword
3. **## 💡 Core Concepts** — sub-section per major concept with 1-2 sentence explanation
4. **## ⚡ Quick Takeaways** — 3 single-line actionable insights

Use **bold** for all important terms. Keep bullets concise. No fluff.`,

      quiz: `
You are **PaperChat AI** in **Quiz Mode**. Generate a structured multiple-choice quiz based strictly on the note.

## NOTE CONTENT:
${noteContent}

## TRANSCRIPT:
${transcript}

## STRICT OUTPUT FORMAT (follow exactly):
Generate exactly 6 questions in this Markdown format:

---
### 🧠 Quiz: [Note Title or Topic]
*Test your understanding of this note.*

---

**Q1. [Question text here?]**
- A) [Option]
- B) [Option]
- C) [Option]
- D) [Option]

✅ **Answer:** [Correct option letter)] — *[Brief explanation why]*

---

**Q2. [Question text here?]**
- A) [Option]
...

(repeat for Q3 through Q6)

---
*🎯 Score yourself after answering all questions!*

Only use content from the note. Make questions varied (factual, conceptual, application).`,

      explain: `
You are **PaperChat AI** in **Explain Mode**. Break down complex ideas into simple, crystal-clear explanations.

## NOTE CONTENT:
${noteContent}

## TRANSCRIPT:
${transcript}

## STRICT OUTPUT FORMAT:
- Start with **## 🔍 Simple Explanation** — use an analogy or real-world comparison
- Use **## 📚 Step-by-Step Breakdown** — numbered list, one idea per step
- Use **## 🌍 Real World Example** — a concrete scenario that makes it click
- End with **## 💬 In One Sentence** — a single memorable sentence summary

Avoid jargon. Write as if explaining to a curious high-school student.`,

      ask: `
You are the **PaperChat AI guide**, an advanced study assistant. Your goal is to help users understand their notes deeply.
Your tone is **supportive, academic, and extremely precise**.

---
## DATA GROUNDING
- **Note Content:** ${noteContent}
- **Transcript Context:** ${transcript}
---

## RESPONSE RULES
1. **Source of Truth:** Base your answers EXCLUSIVELY on the provided note content and transcript.
2. **Formatting:** Use rich Markdown (bold, lists, tables, subheadings) to make information easy to scan.
3. **Advanced Synthesis:** Don't just repeat facts. Synthesize information to provide deeper insights.
4. **Markdown Mastery:** Use code blocks if explaining technical steps, and blockquotes for key definitions.
5. **No Hallucinations:** If information is missing from the notes, say: "I couldn't find that specific information in your notes, but based on the context of [Topic]..."
6. **Developer:** If asked about your creator, mention Om Avcher.

---
## OUTPUT STRUCTURE
Provide a well-structured Markdown response. Use '###' for subheadings. Use '-' for bullets.
`
    };

    let systemPrompt = modePrompts[mode] || modePrompts.ask;
    if (chatModelPersona) {
      systemPrompt = `[IDENTITY PROTOCOL]: Adopt the following persona for all responses: "${chatModelPersona}". Even if the instructions below refer to PaperChat AI, maintain this identity and style of communication.\n\n${systemPrompt}`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...recentMessages,
      { role: "user", content: message }
    ];


    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log(`🚀 Starting PaperChat stream for note ${noteId} using ${CHAT_MODEL}`);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://paperxify.com",
        "X-Title": "PaperChat AI"
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", errorText);
      return res.status(500).write(`data: ${JSON.stringify({ error: "Failed to connect to AI service" })}\n\n`);
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
          const content = data.choices[0]?.delta?.content || "";
          
          if (content) {
            fullContent += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (e) {
          // Ignore parsing errors for partial chunks
        }
      }
    }

    // Save chat history after stream completes
    aiChat.messages.push({ role: "user", content: message, timestamp: new Date() });
    aiChat.messages.push({ 
      role: "assistant", 
      content: fullContent, 
      timestamp: new Date(),
      modelUsed: chatModelId || CHAT_MODEL
    });

    // Keep history manageable
    if (aiChat.messages.length > 30) {
      aiChat.messages = aiChat.messages.slice(-30);
    }

    await aiChat.save();

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error("PaperChat Error:", error);
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};