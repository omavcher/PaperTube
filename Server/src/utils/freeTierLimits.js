const Note = require('../models/Note');
const FlashcardSet = require('../models/FlashcardSet');
const PracticeTest = require('../models/PracticeTest');
const CodeSolution = require('../models/CodeSolution');
const Diagram = require('../models/Diagram');
const Homework = require('../models/Homework');
const MathSolution = require('../models/MathSolution');
const ExamPlan = require('../models/ExamPlan');
const LanguageLesson = require('../models/LanguageLesson');
const User = require('../models/User');

/**
 * Checks if a user is on the free tier and has hit their daily limit.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{allowed: boolean, reason?: string, code?: string, totalToday?: number}>}
 */
async function checkFreeTierLimits(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { allowed: false, reason: 'User not found', code: 'USER_NOT_FOUND' };
    }

    // Subscribed users have unlimited access
    if (user.membership?.isActive === true) {
      return { allowed: true, isSubscribed: true };
    }

    // Calculate start of today in UTC
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    // Count generations across all tools created by the user today
    const [notesCount, flashcardsCount, testsCount, codeCount, diagramsCount, homeworkCount, mathCount, examPlanCount, lessonCount] = await Promise.all([
      Note.countDocuments({ owner: userId, createdAt: { $gte: startOfToday } }),
      FlashcardSet.countDocuments({ owner: userId, createdAt: { $gte: startOfToday } }),
      PracticeTest.countDocuments({ owner: userId, createdAt: { $gte: startOfToday } }),
      CodeSolution.countDocuments({ userId: userId, createdAt: { $gte: startOfToday } }),
      Diagram.countDocuments({ userId: userId, createdAt: { $gte: startOfToday } }),
      Homework.countDocuments({ owner: userId, createdAt: { $gte: startOfToday } }),
      MathSolution.countDocuments({ owner: userId, createdAt: { $gte: startOfToday } }),
      ExamPlan.countDocuments({ owner: userId, createdAt: { $gte: startOfToday } }),
      LanguageLesson.countDocuments({ owner: userId, createdAt: { $gte: startOfToday } })
    ]);

    const totalToday = notesCount + flashcardsCount + testsCount + codeCount + diagramsCount + homeworkCount + mathCount + examPlanCount + lessonCount;

    if (totalToday >= 2) {
      return {
        allowed: false,
        code: 'DAILY_LIMIT_EXCEEDED',
        reason: 'You have reached your free tier limit of 2 generations per day. Upgrade to Pro for unlimited generation.',
        totalToday
      };
    }

    return { allowed: true, isSubscribed: false, totalToday };
  } catch (error) {
    console.error('Error checking free tier limits:', error);
    // In case of database error, allow to not block premium flow
    return { allowed: true, isSubscribed: false, error: error.message };
  }
}

// Parse YouTube duration format (PT1H30M15S) to seconds
function parseYouTubeDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

// Format seconds to hours and minutes
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Checks if a YouTube video is too long for a free user (max 1 hour limit).
 * @param {string} videoId - The YouTube video ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{allowed: boolean, code?: string, reason?: string, duration?: string, maxAllowed?: string}>}
 */
async function checkVideoDurationLimit(videoId, userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { allowed: false, code: 'USER_NOT_FOUND', reason: 'User not found' };
    }

    // Subscribed users have unlimited/higher limits (checked separately in premium controllers)
    if (user.membership?.isActive === true) {
      return { allowed: true };
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('YouTube API key not found, skipping duration check');
      return { allowed: true };
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const durationRaw = data.items[0].contentDetails.duration;
    const durationInSeconds = parseYouTubeDuration(durationRaw);

    const maxFreeDuration = 1 * 60 * 60; // 1 hour max for free tier
    if (durationInSeconds > maxFreeDuration) {
      return {
        allowed: false,
        code: 'VIDEO_TOO_LONG',
        reason: `This video is ${formatDuration(durationInSeconds)} long. Free tier users can only process videos up to 1 hour.`,
        duration: formatDuration(durationInSeconds),
        maxAllowed: formatDuration(maxFreeDuration)
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking video duration limit:', error);
    return { allowed: true }; // Don't block if YouTube API fails
  }
}

module.exports = {
  checkFreeTierLimits,
  checkVideoDurationLimit
};
