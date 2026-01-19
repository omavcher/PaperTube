const FlashcardSet = require('../models/FlashcardSet');
const User = require('../models/User');
const { getTranscript } = require('../youtube-transcript');
const GroqMultiModel = require('../utils/groqMultiModel');
const crypto = require('crypto');

// Initialize Groq client
const groqClient = new GroqMultiModel();

// Function to extract video ID from YouTube URL
const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.get('v')) {
      return urlObj.searchParams.get('v');
    }
    
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/live/')) {
      return urlObj.pathname.split('/live/')[1];
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

// Function to get YouTube video info
async function getYouTubeVideoInfo(videoId) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch video info');
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    return {
      title: data.items[0].snippet.title,
      thumbnail: data.items[0].snippet.thumbnails.high.url
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return { 
      title: 'YouTube Video', 
      thumbnail: null 
    };
  }
}

// Function to summarize long transcripts
const summarizeTranscript = async (transcript, maxLength = 8000) => {
  if (transcript.length <= maxLength) {
    return transcript;
  }

  console.log(`📝 Transcript too long (${transcript.length} chars), summarizing...`);

  try {
    const summaryPrompt = `Please summarize this YouTube video transcript to capture the key concepts, main ideas, and important details. Keep the most educational and relevant content for creating flashcards. Focus on:

1. Main topics and concepts
2. Key definitions and explanations
3. Important examples and case studies
4. Critical facts and data points
5. Step-by-step processes or methodologies

Keep the summary concise but comprehensive, around 4000-6000 characters.

Transcript: "${transcript.substring(0, 15000)}"`; // Take first 15K chars for summarization

    const messages = [
      {
        role: "system",
        content: "You are an expert at summarizing educational content for flashcard creation."
      },
      {
        role: "user",
        content: summaryPrompt
      }
    ];

    const response = await groqClient.chatCompletion(messages, {
      temperature: 0.3,
      max_tokens: 2000
    });

    if (response.success) {
      const summarized = response.content.trim();
      console.log(`✅ Transcript summarized from ${transcript.length} to ${summarized.length} characters`);
      return summarized;
    }
  } catch (error) {
    console.error('❌ Transcript summarization failed:', error);
  }

  // Fallback: truncate the original transcript
  const truncated = transcript.substring(0, maxLength - 500) + "...[truncated]";
  console.log(`⚠️ Using truncated transcript (${truncated.length} characters)`);
  return truncated;
};

// Function to generate flashcards using Groq AI
const generateFlashcardsWithAI = async (transcript, settings = {}) => {
  const { language = 'English', cardType = 'basic', prompt = '', cardCount = 5 } = settings;

  const languageInstruction = language !== 'English' ? 
    `Generate all content in ${language} language.` : 
    'Generate all content in English.';

  // Summarize transcript if too long
  const processedTranscript = await summarizeTranscript(transcript);

  // More concise prompt
  const basePrompt = `Create ${cardCount} educational flashcards from this transcript.

Requirements:
- Output ONLY valid JSON array
- Each flashcard: {id, type, front, back, category, difficulty}
- Types: basic, visual, detailed, mnemonic
- Difficulty: easy, medium, hard
- ${languageInstruction}

${prompt ? `Additional: ${prompt}` : ''}

Transcript: "${processedTranscript}"`;

  try {
    const messages = [
      {
        role: "system",
        content: "Generate educational flashcards as JSON array only."
      },
      {
        role: "user",
        content: basePrompt
      }
    ];

    const response = await groqClient.chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 3000  // Reduced from 4000
    });

    if (!response.success) {
      throw new Error('AI generation failed');
    }

    const resultText = response.content.trim();
    
    // Parse JSON
    let flashcards;
    try {
      flashcards = JSON.parse(resultText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate structure
    if (!Array.isArray(flashcards)) {
      throw new Error('Response is not an array');
    }

    // Ensure each flashcard has required fields
    const validatedFlashcards = flashcards.map((card, index) => ({
      id: card.id || index + 1,
      type: card.type || 'basic',
      front: card.front || 'Question',
      back: card.back || 'Answer',
      image: card.image || null,
      mnemonic: card.mnemonic || null,
      category: card.category || 'General',
      difficulty: card.difficulty || 'medium'
    }));

    return validatedFlashcards;
  } catch (error) {
    console.error('❌ Flashcard generation error:', error);
    throw error;
  }
};

exports.generateFreeFlashcards = async (req, res) => {
  const startTime = Date.now();

  try {
    const { videoUrl, prompt, model, settings } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'Video URL is required' });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    }

    console.log('Starting flashcard generation process...');
    console.log('Settings received:', settings);

    // Get video info
    const videoInfo = await getYouTubeVideoInfo(videoId);
    const videoTitle = videoInfo.title;
    const videoThumbnail = videoInfo.thumbnail;

    // Fetch transcript
    console.log('Fetching transcript...');
    let transcript;
    try {
      transcript = await getTranscript(videoId);
    } catch (error) {
      console.error('Transcript fetch failed:', error);
      return res.status(400).json({ success: false, message: 'Could not fetch transcript for this video' });
    }

    // Generate flashcards using AI
    console.log('Generating flashcards with AI...');
    const flashcards = await generateFlashcardsWithAI(transcript, settings);

    // Create unique slug
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const setSlug = (videoTitle || "flashcards")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50) + "-" + randomSuffix;

    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    // Create flashcard set
    const flashcardSet = new FlashcardSet({
      owner: userId,
      videoUrl,
      videoId,
      title: videoTitle,
      slug: setSlug,
      thumbnail: videoThumbnail,
      transcript: transcript,
      flashcards: flashcards,
      generationDetails: {
        language: settings?.language || 'English',
        cardType: settings?.cardType || 'basic',
        prompt: prompt || "",
        cost: 0,
        generatedAt: new Date(),
        processingTime: processingTime,
        type: 'free',
        cardCount: flashcards.length
      },
      status: 'completed',
      visibility: 'private'
    });

    await flashcardSet.save();

    // Update user
    await User.findByIdAndUpdate(userId, {
      $push: {
        flashcardSets: { setId: flashcardSet._id },
        flashcardCreationHistory: {
          setId: flashcardSet._id,
          model: model || 'free',
          videoTitle: videoTitle,
          cardCount: flashcards.length
        }
      }
    });

    console.log('Flashcard generation completed successfully');

    res.status(200).json({
      success: true,
      message: 'Flashcards generated successfully',
      data: {
        setId: flashcardSet._id,
        slug: setSlug,
        title: videoTitle,
        thumbnail: videoThumbnail,
        flashcards: flashcards,
        cardCount: flashcards.length
      }
    });

  } catch (error) {
    console.error("❌ Flashcard Generation Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while generating flashcards",
      error: error.message
    });
  }
};

// Get user's flashcard sets
exports.getUserFlashcardSets = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let matchQuery = { owner: userId };
    
    if (search) {
      matchQuery.title = { $regex: search, $options: "i" };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const flashcardSets = await FlashcardSet.find(matchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('title slug thumbnail videoUrl videoId flashcards generationDetails status createdAt updatedAt')
      .lean();

    const totalSets = await FlashcardSet.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalSets / limitNum);

    res.status(200).json({
      success: true,
      data: flashcardSets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalSets,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error("❌ Get User Flashcard Sets Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching flashcard sets" 
    });
  }
};

// Get flashcard set by slug
exports.getFlashcardSetBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user._id;

    const flashcardSet = await FlashcardSet.findOne({ 
      slug, 
      $or: [
        { owner: userId }
          ]
    }).lean();

    if (!flashcardSet) {
      return res.status(404).json({ success: false, message: 'Flashcard set not found' });
    }

    res.status(200).json({
      success: true,
      data: flashcardSet
    });

  } catch (error) {
    console.error("❌ Get Flashcard Set Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching flashcard set" 
    });
  }
};
      
