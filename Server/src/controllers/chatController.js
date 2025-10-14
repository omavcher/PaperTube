const Note = require("../models/Note");
const AiChat = require("../models/AiChat");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Correct package


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


exports.handleMessage = async (req, res) => {
  try {
    const { noteId, message } = req.body;
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

    // Prepare chat history as a string
    const chatHistoryStr =
      aiChat.messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n") || "No previous chat history.";

    // Build AI prompt
    const prompt = `
You are a helpful assistant created by Om Awchar for taking notes.

---

## Available Data
- **Note Content:**  
${note.content}

- **Chat History:**  
${chatHistoryStr}

- **User Message:**  
${message}

- **YouTube Transcript:**  
${note.transcript || "No transcriptions available."}

- **Video Link:**  
${note.videoUrl || "No video available"}

---

## Instructions for Response
1. Use the note content, chat history, and YouTube transcript to give a **concise, relevant answer** to the user’s new message.  
2. If the information appears in the transcript, include a **timestamp link** in this format:  
   👉 **[Watch here](${note.videoUrl}?t=SECONDS)**  
   Only one link like this should appear separately.  
3. Always structure your response in **Markdown** with:
   - Subheadings  
   - Bullet points  
   - Code snippets (when applicable)
4. Keep the response properly structured and readable.
5. Ensure the **YouTube link is clickable** and formatted correctly.

---
`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY_FOR_CHAT);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate AI response
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 700,
      },
    });

    let assistantMessage = result.response.text() || "Sorry, I couldn't generate a response.";

    // ✅ Extract YouTube link (if any)
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)(?:[^\s]*)?)/g;
    const videoLinks = assistantMessage.match(youtubeRegex);
    const videoLink = videoLinks ? videoLinks[0] : note.videoUrl || null;

    // Remove the link from the message if you want a clean text
    const cleanMessage = assistantMessage.replace(youtubeRegex, "").trim();

    // Save both user and assistant messages
    aiChat.messages.push({ role: "user", content: message});
    aiChat.messages.push({ role: "assistant", content: cleanMessage , videoLink: videoLink });
    await aiChat.save();

    // ✅ Send clean message + video link separately
    res.json({
      assistantMessage: cleanMessage,
      videoLink: videoLink,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Update feedback on an assistant message
exports.handleFeedback = async (req, res) => {
  try {
    const { noteId, messageId, feedback } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: "noteId is required" });
    }

    const allowed = ["good", "bad", null];
    if (!allowed.includes(feedback)) {
      return res.status(400).json({ error: "feedback must be 'good', 'bad', or null" });
    }

    const aiChat = await AiChat.findOne({ noteId });
    if (!aiChat) {
      return res.status(404).json({ error: "Chat thread not found" });
    }

    let targetIndex = -1;

    if (messageId) {
      targetIndex = aiChat.messages.findIndex((m) => String(m._id) === String(messageId));
    } else {
      // Default to the latest assistant message
      for (let i = aiChat.messages.length - 1; i >= 0; i -= 1) {
        if (aiChat.messages[i].role === "assistant") {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex === -1) {
      return res.status(400).json({ error: "Target message not found" });
    }

    aiChat.messages[targetIndex].feedback = feedback;
    await aiChat.save();

    return res.json({
      updated: {
        _id: aiChat.messages[targetIndex]._id,
        role: aiChat.messages[targetIndex].role,
        content: aiChat.messages[targetIndex].content,
        feedback: aiChat.messages[targetIndex].feedback,
        timestamp: aiChat.messages[targetIndex].timestamp,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};