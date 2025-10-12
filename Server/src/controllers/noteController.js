const { json } = require("express");
const Note = require("../models/Note");
const User = require("../models/User");

const { get } = require("mongoose");
const {GoogleGenAI} = require("@google/genai");
const { google } = require("googleapis");
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
const youtube = google.youtube({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY, // Your API Key from Google Cloud
});
// Function to extract video ID from YouTube URL
const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v') || 
           url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
  } catch (error) {
    return null;
  }
};

const fetch = require("node-fetch");

// Function to get image links from Google Custom Search
const getImgLink = async (query, count = 1) => {
  try {
    const apiKey = 'AIzaSyAkD0dWuBRTharsqXlhh-Bv05ek6AdzhlI'; // Your Google API Key
    const cx = '6606604e9a50d4c0d'; // Your Custom Search Engine ID

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&cx=${cx}&searchType=image&num=${count}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log("No images found for query:", query);
      return [];
    }

    // Filter out social media domains
    const blockedDomains = ["instagram.com", "facebook.com", "twitter.com", "pinterest.com"];
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
    const links = await getImgLink(title, 1); // get 1 image per title
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Extract text
    const resultText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!resultText || resultText.toLowerCase().includes("none")) {
      return null; // No image needed
    }

    // Try parsing JSON
    let figures;
    try {
      figures = JSON.parse(resultText);
    } catch {
      // Fallback: remove unwanted text and parse manually
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

  // Prompt for Gemini AI
const prompt = `
You are an AI that generates **rich PDF-ready HTML content** from a timestamped video transcript.

Requirements:
~ You can use these figures/images using their links as <img> tags -> ${images_json} ~

1. Keep timestamps only for **main headings and key points**.
   - Do not add timestamps for every line.
   - Only add timestamp at the end of main headings (<h2>) or very important points.
   - Use a text like "watch" for timestamp.
   - If timestamp is 0s, do not include it.
   - Make timestamps clickable links that start the YouTube video at that time.
2. Organize content with headings (<h1>, <h2>, <h3>), subheadings, bullet points (<ul>/<li>), tables (<table>), and diagrams (<img>) where relevant.
3. Include LaTeX/KaTeX inside <span> or <div> for mathematical formulas if needed.
4. Make it visually attractive with:
   - Colorful headings
   - Highlights for key points
   - Proper spacing and sections like a professional PDF guide
   - Code blocks or examples with syntax highlighting
5. Ensure the output is **pure HTML** (do not wrap in <html>/<body>, just the content)
6. Keep examples, tables, and diagrams where helpful.

Video URL: ${note.videoUrl}

Transcript:
${note.transcript}

Generate the **HTML content only**. No Markdown.
`;



  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text; // Only returning generated content
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

    // Function to find the transcript endpoint
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
const params = await getVideoParams(videoId);

  try {
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

    // Try new format first
    let segments = data.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer?.initialSegments;

    if (segments) {
      // New format
      return segments
        .map(seg => {
          const r = seg.transcriptSegmentRenderer;
          return {
            startTime: parseFloat(r.startMs) / 1000,
            duration: (parseFloat(r.endMs) - parseFloat(r.startMs)) / 1000,
            text: r.snippet?.runs?.map(run => run.text).join(' ').replace(/\n/g, ' ').trim()
          };
        })
        .filter(cue => cue.text)
        .map(cue => `[${cue.startTime.toFixed(2)}s] ${cue.text}`)
        .join('\n');
    }

    // Fallback to old format
    const transcripts = data.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.transcript?.cues;
    if (transcripts) {
      return transcripts
        .map(cue => ({
          startTime: parseFloat(cue.startOffsetMs) / 1000,
          duration: parseFloat(cue.durationMs) / 1000,
          text: cue.text?.replace(/\n/g, ' ').trim()
        }))
        .filter(cue => cue.text)
        .map(cue => `[${cue.startTime.toFixed(2)}s] ${cue.text}`)
        .join('\n');
    }

    throw new Error("No transcript available for this video");
  } catch (error) {
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
    // Extract videoId from URL
    const url = new URL(videoUrl);
    const videoId = url.searchParams.get("v");

    if (!videoId) {
      console.error("❌ Invalid YouTube URL, no video ID found");
      return;
    }

    // Call YouTube API
    const response = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoId,
    });

    if (!response.data.items.length) {
      console.error("❌ No video found for this URL");
      return;
    }

    const video = response.data.items[0].snippet;
    return { title: video.title, thumbnail: video.thumbnails.high.url };
  } catch (err) {
    console.error("❌ Error fetching video info:", err.message);
  }
}

// Create note from YouTube URL with full token and history tracking
exports.createNote = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    const user = req.user; // auth middleware must populate req.user

    if (!videoUrl)
      return res.status(400).json({ success: false, message: "Video URL is required" });

    if (!user)
      return res.status(401).json({ success: false, message: "User authentication required" });

    // Fetch the latest user record
    const currentUser = await User.findById(user._id);
    if (!currentUser)
      return res.status(404).json({ success: false, message: "User not found" });

    const TOKEN_COST = 20;

    // Check token balance
    if (currentUser.token < TOKEN_COST)
      return res.status(403).json({
        success: false,
        code: "INSUFFICIENT_TOKENS",
        message: "You don’t have enough tokens to generate a new note.",
        remainingTokens: currentUser.token,
      });

    // Deduct tokens
    currentUser.token -= TOKEN_COST;
    currentUser.usedToken += TOKEN_COST;

    // Extract video info
    const videoId = extractVideoId(videoUrl);
    if (!videoId)
      return res.status(400).json({ success: false, message: "Invalid YouTube URL" });

    const videoMeta = await ytinfo(videoUrl);
    const transcript = await fetchTranscript(videoId);

    // Generate images and PDF content
    const img_gen_data = await generateImgGEnAI(transcript);
    const img_with_url = await generateImgObjects(img_gen_data);
    const images_json = img_with_url.map((img) => JSON.stringify(img));
    const pdf_content = await generatePDFContent({ transcript, videoUrl }, images_json);

    // Generate a unique slug
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const note_slug =
      (videoMeta?.title || "untitled")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 50) + "-" + randomSuffix;

    // Save the note
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

    // Add reference to user's notes
    currentUser.notes.push({ noteId: newNote._id });

    // Record token usage history
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
    // Extract videoId from URL
    const url = new URL(videoUrl);
    const videoId = url.searchParams.get("v");

    if (!videoId) {
      console.error("❌ Invalid YouTube URL, no video ID found");
      return;
    }

    // Call YouTube API
    const response = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoId,
    });

    if (!response.data.items.length) {
      console.error("❌ No video found for this URL");
      return;
    }

    const video = response.data.items[0].snippet;

    res.status(200).json({ title: video.title, thumbnail: video.thumbnails.high.url });
  } catch (err) {
    console.error("❌ Error fetching video info:", err.message);
  }
}


exports.getNoteBySlug = async (req, res) => {
  try {
    const user = req.user;
    
    const note = await Note.findOne({ slug: req.params.slug });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if the current user is the owner of the note
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
    
    // First find the note to check ownership
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if the current user is the owner of the note
    if (note.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        message: "Access denied. You are not the owner of this note." 
      });
    }

    // If user is the owner, proceed with update
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
    
    // Get the authenticated user's ID
    const userId = req.user._id;

    // Build search query - only notes belonging to the current user
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

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get notes with pagination and search - only user's notes
    const notes = await Note.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-__v -transcript') // Exclude heavy fields if not needed in list
      .lean();

    // Get total count for pagination - only user's notes
    const totalNotes = await Note.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalNotes / limitNum);

    // Transform data for frontend
    const transformedNotes = notes.map(note => ({
      _id: note._id,
      title: note.title,
      slug: note.slug,
      thumbnail: note.thumbnail,
      videoUrl: note.videoUrl,
      videoId: note.videoId,
      content: note.content,
      transcript: note.transcript, // Include if needed, but it might be large
      img_with_url: note.img_with_url || [],
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      // Add formatted dates if needed
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

