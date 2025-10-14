const { json } = require("express");
const Note = require("../models/Note");
const User = require("../models/User");
const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const pdf = require('html-pdf');
const axios = require('axios');
const { Dropbox } = require('dropbox');
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
  
  **CRITICAL REQUIREMENTS:**
  - Output ONLY pure HTML content without any <style> blocks, <html>, <head>, or <body> tags
  - Use inline styles ONLY for styling
  - Do NOT include CSS classes or external stylesheets
  - Do NOT wrap content in any container elements like <div class="content-wrapper">

IMPORTANT: If you include any CSS styling, it must be inline using style attributes only. Do not generate <style> tags or CSS classes. The output should be ready-to-use HTML content that can be directly inserted into a PDF generator.
  
  **Content Structure & Styling:**
  1. **Timestamps:** Only include for main headings (<h2>) and very important points
     - Use format: <a href="URL&t=Xs" style="margin-left: 10px; color: #007BFF; text-decoration: none; font-weight: bold;">watch Xs</a>
     - Skip if timestamp is 0s
     - Place at end of heading or paragraph
  
  2. **Styling (INLINE ONLY):**
     - Use style attributes for all styling
     - Colors: #2C3E50 (dark blue), #27AE60 (green), #E67E22 (orange), #007BFF (blue)
     - Font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
     - Layout: Use <div> with inline styles for sections
  
  3. **Images:** Use provided image links: ${images_json}
     - Format: <img src="URL" style="max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  
  4. **Organization:**
     - Use proper heading hierarchy: <h1>, <h2>, <h3>
     - Use <ul>/<li> for lists
     - Use <table> with inline styling for data
     - Use <section> or <div> with background colors for content blocks
     - Highlight key points with background colors
  
  **Video Information:**
  - URL: ${note.videoUrl}
  - Transcript: ${note.transcript}
  
  **Generate ONLY the HTML content** - no explanations, no markdown, no style blocks.
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



exports.generatePDF = async (req, res) => {
  try {
    const { noteId } = req.query;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: "Note ID is required"
      });
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // ✅ Check if PDF already exists
    if (note.pdf_data?.downloadUrl) {
      console.log('🔗 PDF already exists, returning saved link');
      return res.status(200).json({
        success: true,
        message: "PDF already generated",
        data: {
          pdfUrl: note.pdf_data.downloadUrl,
          downloadUrl: note.pdf_data.downloadUrl,
          noteTitle: note.title,
          generatedAt: note.updatedAt,
          fileSize: note.pdf_data.fileSize
        }
      });
    }

    console.log('✅ Note found, generating PDF...');

    const completeHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: Arial, sans-serif; color: #2C3E50; line-height: 1.6; margin: 0; padding: 20px; }
              h1 { color: #27AE60; text-align: center; border-bottom: 2px solid #27AE60; padding-bottom: 10px; }
              h2 { color: #007BFF; margin-top: 30px; }
              h3 { color: #2C3E50; margin-top: 20px; }
              .info-box { background-color: #D6EAF8; padding: 10px; border-radius: 5px; margin: 10px 0; }
              .warning-box { background-color: #FFF3E0; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
      </head>
      <body>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h1>${note.title}</h1>
          <div style="font-size: 0.9em; color: #666;">
            <strong>Generated on:</strong> ${new Date().toLocaleDateString()}
          </div>
        </div>
        ${note.content}
      </body>
      </html>
    `;

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(completeHTML, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      printBackground: true
    });
    await browser.close();

    console.log('✅ PDF generated, size:', pdfBuffer.length, 'bytes');

    // Upload to Dropbox
    const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
    const dropboxPath = `/pdfs/${note.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    const uploadResult = await dbx.filesUpload({
      path: dropboxPath,
      contents: pdfBuffer,
      mode: { '.tag': 'add' },
      autorename: true,
      mute: false
    });

    console.log('☁️ PDF uploaded to Dropbox:', uploadResult.result.path_display);

    // Generate shared link
    const sharedLinkResult = await dbx.sharingCreateSharedLinkWithSettings({
      path: uploadResult.result.path_lower
    });

    const downloadUrl = sharedLinkResult.result.url.replace('dl=0', 'dl=1'); // force download
    console.log('🔗 Download URL:', downloadUrl);

    // Save PDF info in DB
    note.pdf_data = {
      downloadUrl,
      fileSize: pdfBuffer.length
    };
    await note.save();

    return res.status(200).json({
      success: true,
      message: "PDF generated and uploaded successfully",
      data: {
        pdfUrl: downloadUrl,
        downloadUrl,
        noteTitle: note.title,
        generatedAt: new Date(),
        fileSize: pdfBuffer.length
      }
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return res.status(500).json({
      success: false,
      message: "PDF generation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// // Optional: Delete PDF from Cloudinary
// exports.deletePDF = async (req, res) => {
//   try {
//     const { publicId } = req.body;

//     if (!publicId) {
//       return res.status(400).json({
//         success: false,
//         message: "Public ID is required"
//       });
//     }

//     const result = await cloudinary.uploader.destroy(publicId, {
//       resource_type: 'raw'
//     });

//     if (result.result === 'ok') {
//       return res.status(200).json({
//         success: true,
//         message: "PDF deleted successfully from Cloudinary"
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Failed to delete PDF from Cloudinary"
//       });
//     }

//   } catch (error) {
//     console.error('❌ Error deleting PDF:', error);
//     return res.status(500).json({ 
//       success: false,
//       message: "Server error while deleting PDF",
//       error: error.message 
//     });
//   }
// };

// // Get all user notes (existing function)
// exports.getUserNotes = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const notes = await Note.find({ owner: userId })
//       .select('title slug videoUrl createdAt updatedAt')
//       .sort({ createdAt: -1 });
    
//     return res.status(200).json({
//       success: true,
//       data: notes,
//       count: notes.length
//     });
    
//   } catch (error) {
//     return res.status(500).json({ 
//       success: false,
//       message: "Server error while fetching user notes" 
//     });
//   }
// };



