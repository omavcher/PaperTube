const Quiz = require('../models/Quiz');
const axios = require('axios');
const { google } = require('googleapis');
const crypto = require('crypto');
const { getTranscript } = require('../youtube-transcript');

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * HELPER: Extract Video ID from URL
 */
const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * HELPER: Get YouTube Video Info (Title & Thumbnail)
 */
async function ytinfo(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return null;

    const response = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoId,
    });

    if (!response.data.items.length) return null;

    const video = response.data.items[0].snippet;
    const duration = response.data.items[0].contentDetails?.duration;
    
    // Format duration
    let formattedDuration = 'Unknown';
    if (duration) {
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = (match[1] || '').replace('H', '');
      const minutes = (match[2] || '').replace('M', '');
      const seconds = (match[3] || '').replace('S', '');
      
      if (hours) formattedDuration = `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
      else if (minutes) formattedDuration = `${minutes}:${seconds.padStart(2, '0')}`;
      else if (seconds) formattedDuration = `0:${seconds.padStart(2, '0')}`;
    }
    
    return { 
      title: video.title, 
      thumbnail: video.thumbnails.high?.url || video.thumbnails.default?.url,
      duration: formattedDuration,
      videoId: videoId,
      description: video.description || '',
      channelTitle: video.channelTitle || '',
      tags: video.tags || [],
      categoryId: video.categoryId || '',
      viewCount: response.data.items[0].statistics?.viewCount || '0',
      likeCount: response.data.items[0].statistics?.likeCount || '0'
    };
  } catch (err) {
    console.error("❌ Error fetching video info:", err.message);
    return null;
  }
}

function generateSlugFromTitle(title) {
  // Clean the title: remove special chars, convert to lowercase, replace spaces with hyphens
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Remove multiple hyphens
    .substring(0, 40)          // Limit length
    .replace(/-$/, '');        // Remove trailing hyphen
  
  // Generate short hex code
  const hexCode = crypto.randomBytes(4).toString('hex');
  
  // Combine: title-hexcode
  return `${cleanTitle}-${hexCode}`;
}


/**
 * HELPER: Fetch Transcript using your working method
 */
async function fetchTranscript(videoId) {
  try {
    console.log(`📝 Fetching transcript for video: ${videoId}`);
    
    // Use your working transcript method
    const transcript = await getTranscript(videoId);
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error("No transcript content received");
    }
    
    console.log(`✅ Transcript fetched: ${transcript.length} characters`);
    
    // Remove timestamps for AI processing if needed
    const cleanTranscript = transcript.replace(/\[\d+\.?\d*s\]\s*/g, '');
    
    return {
      raw: transcript,
      clean: cleanTranscript,
      hasTimestamps: transcript !== cleanTranscript
    };
    
  } catch (error) {
    console.error("❌ Transcript fetch failed:", error.message);
    throw error;
  }
}

/**
 * MAIN CONTROLLER: Generate Quiz and Save to DB
 */
exports.generateQuiz = async (req, res) => {
  console.log('🎬 ========== QUIZ GENERATION STARTED ==========');
  
  try {
    const { videoUrl, prompt = '', settings = {}, model, type } = req.body;
    const userEmail = req.user?.email || "anonymous";

    // 1. Validate Input
    if (!videoUrl) {
      console.log('❌ Missing video URL');
      return res.status(400).json({ 
        success: false, 
        message: "Video URL is required" 
      });
    }

    // 2. Extract video ID
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      console.log('❌ Invalid video URL:', videoUrl);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid YouTube URL" 
      });
    }
    console.log(`🎥 Video ID: ${videoId}`);

    // 3. Fetch Video Data
    console.log('📥 Fetching video info...');
    const videoData = await ytinfo(videoUrl);
    if (!videoData) {
      console.log('❌ Failed to fetch video info');
      return res.status(404).json({ 
        success: false, 
        message: "Could not fetch video information" 
      });
    }
    console.log(`✅ Video: "${videoData.title}"`);
    console.log(`⏱️  Duration: ${videoData.duration}`);
    console.log(`📺 Channel: ${videoData.channelTitle}`);
    console.log(`👁️  Views: ${videoData.viewCount}`);
    console.log(`👍 Likes: ${videoData.likeCount}`);

    // 4. Prepare quiz settings with validation
    const quizSettings = {
      language: settings?.language || 'English',
      detailLevel: settings?.detailLevel || 'Standard',
      count: Math.min(Math.max(parseInt(settings?.count) || 5, 1), 30), // Limit 1-30
      difficulty: ['easy', 'medium', 'hard'].includes(settings?.difficulty) ? settings.difficulty : 'medium',
      includeExplanation: settings?.includeExplanation !== false,
      quizType: ['mcq', 'multi', 'truefalse', 'fill'].includes(settings?.quizType) ? settings.quizType : 'mcq'
    };
    
    console.log('⚙️  Quiz Configuration:');
    console.log(`   • Type: ${quizSettings.quizType.toUpperCase()}`);
    console.log(`   • Questions: ${quizSettings.count}`);
    console.log(`   • Difficulty: ${quizSettings.difficulty}`);
    console.log(`   • Language: ${quizSettings.language}`);
    console.log(`   • Explanations: ${quizSettings.includeExplanation ? 'Yes' : 'No'}`);
    console.log(`   • Detail Level: ${quizSettings.detailLevel}`);

    // 5. Fetch Transcript using your working method
    console.log('📝 Fetching transcript...');
    let transcriptData = null;
    let transcriptSource = 'none';
    
    try {
      transcriptData = await fetchTranscript(videoId);
      if (transcriptData && transcriptData.clean && transcriptData.clean.length > 100) {
        transcriptSource = 'transcript';
        console.log(`✅ Transcript available: ${transcriptData.clean.length} characters`);
        console.log(`📊 Has timestamps: ${transcriptData.hasTimestamps ? 'Yes' : 'No'}`);
      } else {
        console.log('⚠️  Transcript too short or empty');
        transcriptData = null;
      }
    } catch (transcriptError) {
      console.log('⚠️  Transcript not available:', transcriptError.message);
      console.log('💡 Proceeding without transcript...');
      transcriptData = null;
    }

    // 6. Construct AI Prompt
    console.log('🤖 Building AI prompt...');
    
    let aiSystemPrompt = '';
    const hasTranscript = transcriptData && transcriptData.clean && transcriptData.clean.length > 100;
    
    if (hasTranscript) {
      // WITH TRANSCRIPT
      const maxTranscriptLength = 6000; // Limit transcript length for AI
      const transcriptToUse = transcriptData.clean.length > maxTranscriptLength 
        ? transcriptData.clean.substring(0, maxTranscriptLength) + "... [truncated]"
        : transcriptData.clean;
      
      aiSystemPrompt = `You are an expert educational quiz generator. Create a high-quality quiz based on this YouTube video transcript.

VIDEO DETAILS:
• Title: "${videoData.title}"
• Channel: "${videoData.channelTitle}"
• Duration: ${videoData.duration}
• Views: ${videoData.viewCount}
• Likes: ${videoData.likeCount}

TRANSCRIPT CONTENT:
"${transcriptToUse}"

QUIZ SPECIFICATIONS:
• Number of Questions: ${quizSettings.count}
• Question Type: ${quizSettings.quizType.toUpperCase()}
• Difficulty Level: ${quizSettings.difficulty}
• Language: ${quizSettings.language}
• Include Explanations: ${quizSettings.includeExplanation ? 'YES' : 'NO'}
• Detail Level: ${quizSettings.detailLevel}

${prompt ? `ADDITIONAL INSTRUCTIONS:\n${prompt}\n` : ''}

FORMATTING RULES:
${getFormattingRules(quizSettings.quizType)}

Create questions that:
1. Test understanding of key concepts from the transcript
2. Are appropriate for the specified difficulty level
3. Have clear, unambiguous correct answers
4. Include helpful explanations when required
5. Cover different parts of the video content

RESPONSE FORMAT (MUST BE VALID JSON):
{
  "questions": [
    {
      "question": "Clear, concise question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct answer text or array",
      "explanation": "Detailed explanation of why this is correct"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. No additional text, comments, or explanations.`;
    } else {
      // WITHOUT TRANSCRIPT (FALLBACK)
      aiSystemPrompt = `You are an expert educational quiz generator. Create a quiz based on this YouTube video.

VIDEO INFORMATION:
• Title: "${videoData.title}"
• Channel: "${videoData.channelTitle}"
• Duration: ${videoData.duration}
• Views: ${videoData.viewCount}
• Likes: ${videoData.likeCount}
• Description: "${videoData.description?.substring(0, 500) || 'Description not available'}"
• Tags: ${videoData.tags?.slice(0, 10).join(', ') || 'No tags available'}

Since transcript is not available, create questions based on:
1. What the video title suggests
2. The video description and tags
3. Common knowledge about the topic
4. General context from the channel name
5. Logical inferences about the content

QUIZ SPECIFICATIONS:
• Number of Questions: ${quizSettings.count}
• Question Type: ${quizSettings.quizType.toUpperCase()}
• Difficulty Level: ${quizSettings.difficulty}
• Language: ${quizSettings.language}
• Include Explanations: ${quizSettings.includeExplanation ? 'YES' : 'NO'}
• Detail Level: ${quizSettings.detailLevel}

${prompt ? `ADDITIONAL INSTRUCTIONS:\n${prompt}\n` : ''}

FORMATTING RULES:
${getFormattingRules(quizSettings.quizType)}

Create questions that are:
1. Educational and informative
2. Appropriate for the difficulty level
3. Based on reasonable inferences from available information
4. Clear and unambiguous

RESPONSE FORMAT (MUST BE VALID JSON):
{
  "questions": [
    {
      "question": "Educational question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct answer",
      "explanation": "Why this answer is correct"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. No additional text, comments, or explanations.`;
    }

    console.log(`📄 AI Prompt ready (${aiSystemPrompt.length} characters)`);
    console.log(`📊 Has Transcript: ${hasTranscript ? 'Yes' : 'No'}`);

    // 7. Validate OpenRouter API Key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ CRITICAL: OpenRouter API key missing!');
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact support."
      });
    }

    // 8. Call OpenRouter API
    console.log('🚀 Calling OpenRouter API...');
    
    const aiModel = model || 'openai/gpt-3.5-turbo';
    console.log(`🤖 Using AI Model: ${aiModel}`);
    
    const startTime = Date.now();
    let openRouterResponse;
    
    try {
      openRouterResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'nvidia/nemotron-3-nano-30b-a3b:free',
          messages: [
            {
              role: "system",
              content: "You are an expert educational quiz generator. You must respond with valid JSON only, no other text, comments, or explanations. Ensure all questions are accurate and educational."
            },
            {
              role: "user",
              content: aiSystemPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
            'X-Title': 'Quiz Generator Pro'
          },
          timeout: 120000 // 120 seconds timeout
        }
      );

      const apiTime = Date.now() - startTime;
      console.log(`✅ OpenRouter API successful (${apiTime}ms)`);
      
    } catch (apiError) {
      console.error('❌ OpenRouter API Error:', apiError.message);
      
      if (apiError.response) {
        console.error('Status:', apiError.response.status);
        console.error('Data:', apiError.response.data);
        
        if (apiError.response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter configuration.');
        } else if (apiError.response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (apiError.response.status === 400) {
          throw new Error('Invalid request to AI service.');
        } else {
          throw new Error(`AI Service Error: ${apiError.response.status}`);
        }
      } else if (apiError.request) {
        throw new Error('No response from AI service. Check your internet connection.');
      } else {
        throw apiError;
      }
    }

    // 9. Parse AI Response
    console.log('📋 Parsing AI response...');
    
    let aiContent = openRouterResponse.data.choices[0].message.content;
    console.log(`📄 Raw response length: ${aiContent.length} characters`);
    
    // Clean the response
    aiContent = cleanJsonResponse(aiContent);
    
    let parsedData;
    try {
      parsedData = JSON.parse(aiContent);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      
      // Try to extract JSON from response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON extracted from response');
        } catch (extractError) {
          console.error('❌ Could not extract valid JSON, creating fallback quiz');
          parsedData = createFallbackQuiz(quizSettings, videoData);
        }
      } else {
        console.log('⚠️  No JSON found, creating fallback quiz');
        parsedData = createFallbackQuiz(quizSettings, videoData);
      }
    }

    // 10. Extract and validate questions
    let questions = parsedData.questions || [];
    
    if (!Array.isArray(questions)) {
      console.error('❌ Questions is not an array, creating fallback');
      questions = createFallbackQuiz(quizSettings, videoData).questions;
    }
    
    if (questions.length === 0) {
      console.error('❌ No questions generated, creating fallback');
      questions = createFallbackQuiz(quizSettings, videoData).questions;
    }
    
    console.log(`✅ Generated ${questions.length} questions`);
    
    // Validate and clean each question
    const validQuestions = questions
      .filter((q, index) => {
        if (!q || typeof q !== 'object') {
          console.log(`⚠️  Skipping invalid question ${index + 1}: Not an object`);
          return false;
        }
        
        if (!q.question || q.question.trim().length < 5) {
          console.log(`⚠️  Skipping question ${index + 1}: Invalid question text`);
          return false;
        }
        
        return true;
      })
      .map((q, index) => ({
        question: q.question?.trim() || `Question ${index + 1}`,
        options: Array.isArray(q.options) 
          ? q.options.map(opt => String(opt || '').trim()).filter(opt => opt.length > 0)
          : [],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : '',
        explanation: q.explanation?.trim() || (quizSettings.includeExplanation ? 'No explanation provided.' : ''),
        questionNumber: index + 1,
        quizType: quizSettings.quizType
      }))
      .slice(0, quizSettings.count); // Limit to requested count

    console.log(`📊 Valid questions: ${validQuestions.length}/${questions.length}`);

    // 11. Generate unique slug
    const slug = generateSlugFromTitle(videoData.title);
    
    
    const newQuiz = new Quiz({
      userId: req.user?._id,
      videoUrl,
      videoId,
      title: videoData.title,
      thumbnail: videoData.thumbnail || '',
      slug,
      settings: quizSettings,
      questions: validQuestions,
      userEmail,
      transcriptSource,
      prompt: prompt || '',
      model: aiModel,
      metadata: {
        videoDuration: videoData.duration,
        channelName: videoData.channelTitle,
        hasTranscript: hasTranscript,
        transcriptLength: hasTranscript ? transcriptData.clean.length : 0,
        viewCount: videoData.viewCount,
        likeCount: videoData.likeCount,
        generationTime: Date.now() - startTime
      }
    });

    await newQuiz.save();
    console.log('✅ Quiz saved successfully to database!');

    // 13. Success Response
    console.log('🎉 ========== QUIZ GENERATION COMPLETED ==========\n');
    
    res.status(200).json({ 
      success: true, 
      message: hasTranscript 
        ? `Quiz generated successfully with ${validQuestions.length} questions from transcript` 
        : `Quiz generated successfully with ${validQuestions.length} questions from video metadata`,
      slug: newQuiz.slug,
      data: {
        id: newQuiz._id,
        slug: newQuiz.slug,
        title: newQuiz.title,
        questionCount: validQuestions.length,
        transcriptAvailable: hasTranscript,
        thumbnail: newQuiz.thumbnail,
        createdAt: newQuiz.createdAt,
        settings: newQuiz.settings,
        videoDuration: videoData.duration,
        channelName: videoData.channelTitle
      }
    });

  } catch (error) {
    console.error('\n❌ ========== QUIZ GENERATION FAILED ==========');
    console.error('Error:', error.message);
    
    let errorMessage = "Quiz generation failed";
    let statusCode = 500;
    
    if (error.message.includes('API key') || error.message.includes('OpenRouter')) {
      errorMessage = "AI service temporarily unavailable. Please try again later.";
      statusCode = 503;
    } else if (error.message.includes('transcript')) {
      errorMessage = "Could not fetch transcript. The video might not have captions enabled.";
      statusCode = 400;
    } else if (error.message.includes('timeout')) {
      errorMessage = "Request timed out. Please try with a shorter video.";
      statusCode = 408;
    } else if (error.message.includes('Invalid YouTube URL')) {
      errorMessage = "Please provide a valid YouTube URL.";
      statusCode = 400;
    } else if (error.message.includes('Rate limit')) {
      errorMessage = "Too many requests. Please try again in a few minutes.";
      statusCode = 429;
    }

    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        debug: error.message,
        stack: error.stack 
      })
    });
  }
};

/**
 * HELPER: Get formatting rules based on quiz type
 */
function getFormattingRules(quizType) {
  const rules = {
    mcq: `• Provide exactly 4 options (A, B, C, D)
• correctAnswer should be a single string matching one option exactly
• Example: correctAnswer: "Paris"`,
    
    multi: `• Provide 4-6 options
• correctAnswer should be an ARRAY of correct options
• Example: correctAnswer: ["Paris", "London"]
• At least 2 correct answers required`,
    
    truefalse: `• options must be exactly: ["True", "False"]
• correctAnswer should be either "True" or "False"
• No other options allowed`,
    
    fill: `• options should be empty array: []
• correctAnswer should be the fill-in text as string
• Question should contain blank(s) indicated by _____
• Example: "The capital of France is _____"`
  };
  
  return rules[quizType] || rules.mcq;
}

/**
 * HELPER: Clean JSON response from AI
 */
function cleanJsonResponse(text) {
  if (!text || typeof text !== 'string') {
    return '{"questions": []}';
  }
  
  let cleaned = text.trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  
  // Remove any text before first { and after last }
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}') + 1;
  
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd);
  }
  
  // Fix common JSON issues
  cleaned = cleaned.replace(/'/g, '"'); // Single quotes to double quotes
  cleaned = cleaned.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
  cleaned = cleaned.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
  cleaned = cleaned.replace(/\n/g, ' '); // Remove newlines
  cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single
  
  // Escape problematic characters
  cleaned = cleaned.replace(/\\/g, '\\\\');
  cleaned = cleaned.replace(/"/g, '\\"');
  cleaned = cleaned.replace(/\t/g, ' ');
  
  return cleaned.trim();
}

/**
 * HELPER: Create fallback quiz when AI fails
 */
function createFallbackQuiz(settings, videoData) {
  console.log('🔄 Creating fallback quiz...');
  
  const quizType = settings.quizType;
  const questionCount = Math.min(settings.count, 5);
  const questions = [];
  
  const titleWords = videoData.title.split(' ').filter(word => word.length > 3).slice(0, 5);
  
  for (let i = 1; i <= questionCount; i++) {
    let question, options, correctAnswer, explanation;
    
    switch (quizType) {
      case 'truefalse':
        question = `Based on the title, this video "${videoData.title.substring(0, 60)}..." is likely an entertainment show.`;
        options = ["True", "False"];
        correctAnswer = videoData.title.toLowerCase().includes('episode') || 
                        videoData.title.toLowerCase().includes('show') ||
                        videoData.channelTitle.toLowerCase().includes('tv') ? "True" : "False";
        explanation = `The title suggests it's ${correctAnswer === "True" ? 'an entertainment show' : 'not necessarily entertainment'}.`;
        break;
        
      case 'fill':
        question = `The video "${videoData.title.substring(0, 40)}" appears to be about _____.`;
        options = [];
        correctAnswer = "entertainment and drama";
        explanation = "Based on typical YouTube content with similar titles.";
        break;
        
      case 'multi':
        question = `What can you infer about the video "${videoData.title}"?`;
        options = [
          "It's educational content",
          "It's entertainment/drama",
          "It's a news report",
          "It's a tutorial video",
          "It's a documentary"
        ];
        correctAnswer = ["It's entertainment/drama"];
        explanation = "The title format and channel name suggest entertainment content.";
        break;
        
      default: // mcq
        question = `What type of audience is the video "${videoData.title}" likely targeting?`;
        options = [
          "Academic researchers",
          "General entertainment viewers",
          "Professional trainers",
          "News enthusiasts"
        ];
        correctAnswer = "General entertainment viewers";
        explanation = "The video title and channel suggest mass entertainment content.";
    }
    
    questions.push({
      question,
      options,
      correctAnswer,
      explanation: settings.includeExplanation ? explanation : ''
    });
  }
  
  return { questions };
}

/**
 * Get Quiz by Slug
 */
exports.getQuizBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const quiz = await Quiz.findOne({ slug })
      .select('-__v -updatedAt -metadata')
      .lean();
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }
    
    // Format response
    const response = {
      ...quiz,
      transcriptAvailable: quiz.transcriptSource === 'transcript'
    };
    
    res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error("Get Quiz Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz"
    });
  }
};

/**
 * Get User's Quizzes
 */
exports.getUserQuizzes = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication required"
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const [quizzes, total] = await Promise.all([
      Quiz.find({ userId })
        .select('slug title thumbnail videoUrl createdAt settings.count settings.quizType transcriptSource metadata.videoDuration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quiz.countDocuments({ userId })
    ]);
    
    res.status(200).json({
      success: true,
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Get User Quizzes Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes"
    });
  }
};

/**
 * Delete Quiz
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    const result = await Quiz.deleteOne({ slug, userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or unauthorized"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete Quiz Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete quiz"
    });
  }
};

/**
 * Test Endpoint
 */
exports.test = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Quiz API v2.0 is operational",
      timestamp: new Date().toISOString(),
      features: [
        "Transcript-based quiz generation",
        "Multiple quiz types (MCQ, True/False, Fill-in, Multi-select)",
        "Configurable difficulty and question count",
        "Detailed explanations",
        "Pagination support",
        "Comprehensive error handling"
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Test failed",
      error: error.message
    });
  }
};

/**
 * Test Transcript Endpoint
 */
exports.testTranscript = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ 
        success: false, 
        message: "Video URL required" 
      });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid YouTube URL" 
      });
    }

    console.log(`Testing transcript for video: ${videoId}`);
    
    try {
      const transcriptData = await fetchTranscript(videoId);
      
      res.status(200).json({
        success: true,
        message: "Transcript available",
        data: {
          videoId,
          hasTranscript: true,
          length: transcriptData.clean.length,
          hasTimestamps: transcriptData.hasTimestamps,
          preview: transcriptData.clean.substring(0, 300) + (transcriptData.clean.length > 300 ? '...' : '')
        }
      });
      
    } catch (transcriptError) {
      res.status(200).json({
        success: true,
        message: "No transcript available",
        data: {
          videoId,
          hasTranscript: false,
          error: transcriptError.message
        }
      });
    }
    
  } catch (error) {
    console.error("Transcript test error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Transcript test failed",
      error: error.message 
    });
  }
};

/**
 * Health Check
 */
exports.health = async (req, res) => {
  try {
    // Test database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Test YouTube API
    let youtubeStatus = 'unknown';
    try {
      await youtube.videos.list({
        part: "snippet",
        id: "dQw4w9WgXcQ",
        maxResults: 1
      });
      youtubeStatus = 'working';
    } catch (e) {
      youtubeStatus = 'failed';
    }
    
    res.status(200).json({
      success: true,
      status: "healthy",
      services: {
        database: dbStatus,
        youtube_api: youtubeStatus,
        openrouter: process.env.OPENROUTER_API_KEY ? 'configured' : 'missing',
        transcript_service: 'youtube-transcript-plus'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: error.message
    });
  }
};

/**
 * Generate Quiz Preview (without saving)
 */
exports.previewQuiz = async (req, res) => {
  try {
    const { videoUrl, settings = {} } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL required"
      });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Invalid YouTube URL"
      });
    }

    const videoData = await ytinfo(videoUrl);
    if (!videoData) {
      return res.status(404).json({
        success: false,
        message: "Could not fetch video information"
      });
    }

    let hasTranscript = false;
    try {
      const transcriptData = await fetchTranscript(videoId);
      hasTranscript = transcriptData && transcriptData.clean && transcriptData.clean.length > 100;
    } catch (e) {
      hasTranscript = false;
    }

    res.status(200).json({
      success: true,
      data: {
        videoId,
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
        channel: videoData.channelTitle,
        transcriptAvailable: hasTranscript,
        supportedQuizTypes: ['mcq', 'multi', 'truefalse', 'fill'],
        maxQuestions: 30,
        estimatedGenerationTime: hasTranscript ? '30-60 seconds' : '15-30 seconds'
      }
    });

  } catch (error) {
    console.error("Preview error:", error.message);
    res.status(500).json({
      success: false,
      message: "Preview generation failed"
    });
  }
};