const mongoose = require('mongoose');
const User = require('../models/User');
const Note = require('../models/Note');
const Comment = require('../models/Comment');
const crypto = require('crypto');
const { google } = require("googleapis");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

// 1. Get Faker Users (users flagged as fake to isolate them optionally, or just users with no googleId)
exports.getFakeUsers = async (req, res) => {
  try {
    const users = await User.find({ isFake: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create Fake Users Based on Names
exports.createFakeUsers = async (req, res) => {
  try {
    const { names } = req.body; 
    let count = 0;

    if (names && Array.isArray(names)) {
        for (const name of names) {
            const randomSuffix = crypto.randomBytes(3).toString('hex');
            const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') + randomSuffix;
            const email = username + '@fakemail.com';

            const user = new User({
                name,
                username,
                email,
                isNewUser: false,
                isFake: true,
                picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
            });
            await user.save();
            count++;
        }
    }

    res.status(200).json({ success: true, count, message: `Created ${count} fake users` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Fake User Stats (XP, Streak)
exports.updateUserStats = async (req, res) => {
    try {
        const { userId, xp, streakCount, rank } = req.body;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ success: false, message: "User not found" });

        if(xp !== undefined) user.xp = xp;
        if(rank !== undefined) user.rank = rank;
        if(streakCount !== undefined) {
            user.streak.count = streakCount;
        }

        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Bot Followers (Add fake followers to any user)
exports.addFollowers = async (req, res) => {
    try {
        const { targetUserId, count } = req.body;
        
        const targetUser = await User.findById(targetUserId);
        if(!targetUser) return res.status(404).json({ success: false, message: "Target user not found" });

        // Get fake users not already following this user
        const fakeUsers = await User.find({ 
            isFake: true, 
            _id: { $ne: targetUserId, $nin: targetUser.followerUsers } 
        }).limit(parseInt(count));

        if(fakeUsers.length === 0) {
            return res.status(400).json({ success: false, message: "No available fake users to follow." });
        }

        for (const fUser of fakeUsers) {
            targetUser.followerUsers.push(fUser._id);
            fUser.followingUsers.push(targetUser._id);
            await fUser.save();
        }

        await targetUser.save();

        res.status(200).json({ success: true, message: `Added ${fakeUsers.length} followers.` });
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 5. Inject Note from Data
exports.injectNote = async (req, res) => {
    try {
        const { userId, data } = req.body;
        const { videoUrl, title, type, detailLevel, content } = data;

        const videoId = extractVideoId(videoUrl);
        if (!videoId) return res.status(400).json({ success: false, message: "Invalid YouTube URL" });

        let thumbnail = "";
        try {
            const ytRes = await youtube.videos.list({
                part: "snippet",
                id: videoId,
            });
            if (ytRes.data.items && ytRes.data.items.length > 0) {
                thumbnail = ytRes.data.items[0].snippet.thumbnails.high.url;
            }
        } catch(e) { console.error("YT Fetch error", e) }

        const randomSuffix = crypto.randomBytes(4).toString('hex');
        const slug = (title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + randomSuffix;

        const user = await User.findById(userId);

        const newNote = new Note({
            owner: userId,
            videoUrl,
            videoId,
            title,
            slug,
            thumbnail,
            transcript: "MANUAL INJECTION NO TRANSCRIPT",
            content: content,
            status: 'completed',
            visibility: 'public', // Fake user notes usually public
            generationDetails: {
                model: 'sankshipta',
                type: type,
                detailLevel: detailLevel,
                language: 'English',
                generatedAt: new Date()
            }
        });

        await newNote.save();
        
        if (user) {
            user.notes.push({ noteId: newNote._id });
            await user.save();
        }

        res.status(200).json({ success: true, message: "Note injected", data: newNote });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// 6. SMM Bulk Bot Comments & Engagement
exports.bulkComments = async (req, res) => {
    try {
        const { noteId, comments, views, likes } = req.body; 
        
        const note = await Note.findById(noteId);
        if(!note) return res.status(404).json({ success: false, message: "Target note not found" });

        // Add Comments
        if(comments && comments.length > 0) {
            const fakeUsers = await User.find({ isFake: true }).limit(comments.length);
            for (let i = 0; i < comments.length; i++) {
                const fUser = fakeUsers.length > 0 ? fakeUsers[i % fakeUsers.length] : null; 
                if(!fUser) break;
                const cmt = new Comment({
                    note: noteId,
                    user: fUser._id,
                    content: comments[i]
                });
                await cmt.save();
            }
        }
        
        // Add Views
        if(views && Number(views) > 0) {
            const vCount = Number(views);
            note.views = (note.views || 0) + vCount;
            note.viewHistory.push({
                date: new Date(),
                count: vCount
            });
        }

        // Add Likes
        if(likes && Number(likes) > 0) {
            const lCount = Number(likes);
            const fakeLikerUsers = await User.find({ 
                isFake: true,
                _id: { $nin: note.likedBy }
            }).limit(lCount);
            
            note.likes = (note.likes || 0) + fakeLikerUsers.length;
            for(const fUser of fakeLikerUsers) {
                note.likedBy.push(fUser._id);
            }
        }

        await note.save();

        res.status(200).json({ success: true, message: `System Updated: Comments injected, ${views || 0} Bot Views added, ${likes || 0} Bot Likes added!` });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// 7. Extract Prompt String Helper for Client (To manually prompt LLM)
exports.getPrompt = async (req, res) => {
    try {
        const { videoUrl } = req.body;
        const videoId = extractVideoId(videoUrl);
        if (!videoId) return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
        
        // Dynamically import the transcript utility
        const { getTranscript } = require('../youtube-transcript') || {}; 
        // Note: we can't reliably fetch transcript without the exact path. Let's do a basic yt snippet fetch too.
        
        const ytRes = await youtube.videos.list({
            part: "snippet",
            id: videoId,
        });
        const title = ytRes.data.items?.[0]?.snippet?.title || "Video";
        
        let promptString = `I want to generate a very detailed, highly formatted educational note (like a textbook chapter) for a YouTube video.
Video Title: ${title}
Video Link: ${videoUrl}

Please output ONLY HTML content using semantic tags (<h1>, <h2>, <p>, <ul>, <li>, <strong>, etc.) with beautiful inline styles. Ensure it covers all topics in depth. Do not include \`\`\`html tags, just raw HTML string.`;
        
        res.status(200).json({ success: true, prompt: promptString, title });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

// 8. Search Notes (For SMM)
exports.searchNotes = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(200).json({ success: true, data: [] });
        }
        
        const searchRegex = new RegExp(query, 'i');
        const notes = await Note.find({
            $or: [
                { title: searchRegex },
                { slug: searchRegex }
            ]
        }).select('_id title slug').limit(10);
        
        res.status(200).json({ success: true, data: notes });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}
