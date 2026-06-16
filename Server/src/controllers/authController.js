const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Otp = require("../models/Otp");
const Note = require("../models/Note");
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios'); // Add axios for better HTTP requests
const emailService = require('../utils/emailService');

exports.googleAuth = async (req, res) => {
  try {
    console.log("🔵 Google Auth Request received");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const { googleAccessToken, authType } = req.body;

    const accessToken = googleAccessToken;

    if (!accessToken) {
      console.log("❌ No access token provided");
      return res.status(400).json({ 
        success: false,
        message: "Access token is required" 
      });
    }

    // Create OAuth2 client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    console.log(`🔄 Processing token (type: ${authType || 'unknown'})`);
    
    let email, name, picture, googleId;
    
    try {
      // Try to verify as ID token first
      const ticket = await client.verifyIdToken({
        idToken: accessToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      // This works if it's an ID token
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
      
      console.log("✅ Verified as ID token for:", email);
      
    } catch (idTokenError) {
      console.log("⚠️ Not an ID token, trying as access token...");
      
      // If ID token verification fails, it's probably an access token
      const userInfo = await getUserInfoFromAccessToken(accessToken);
      
      if (!userInfo || !userInfo.email) {
        console.error("❌ Failed to get user info from access token");
        return res.status(400).json({ 
          success: false,
          message: "Could not get user info from Google. Token might be invalid or expired." 
        });
      }
      
      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture;
      googleId = userInfo.sub || userInfo.id;
      
      console.log("✅ Retrieved user info from access token for:", email);
    }
    
    // Validate required fields
    if (!email) {
      console.error("❌ No email found in token");
      return res.status(400).json({
        success: false,
        message: "No email found in Google token"
      });
    }
    
    console.log("👤 User info:", { email, name, picture: !!picture, googleId });
    
    // Handle user creation/update
    const { user, isNewUser } = await handleUserAuth({
      email,
      name,
      picture,
      googleId,
      location: req.body.location,
      ip: req.ip || req.headers['x-forwarded-for']
    });
    
    console.log("✅ User processed:", user.email, user._id);
    
    // Send success response
    return sendAuthResponse(res, user, isNewUser);
    
  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    console.error("Error stack:", error.stack);
    
    // Provide better error messages
    let errorMessage = "Authentication failed";
    let statusCode = 500;
    
    if (error.message.includes('invalid_token') || 
        error.message.includes('expired') ||
        error.message.includes('Invalid token')) {
      errorMessage = "Google token is invalid or expired. Please sign in again.";
      statusCode = 401;
    } else if (error.message.includes('Could not get user info')) {
      errorMessage = "Could not retrieve user information from Google.";
      statusCode = 400;
    } else if (error.message.includes('Network Error')) {
      errorMessage = "Cannot connect to Google servers. Please check your internet.";
      statusCode = 503;
    }
    
    return res.status(statusCode).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to get user info from access token
async function getUserInfoFromAccessToken(accessToken) {
  try {
    console.log("🔄 Getting user info from Google API...");
    
    // Try with axios for better error handling
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log("✅ Got user info from Google API");
    return response.data;
    
  } catch (error) {
    console.error("❌ Error getting user info from Google API:", error.message);
    
    // Try alternative endpoint as fallback
    try {
      console.log("🔄 Trying alternative userinfo endpoint...");
      const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: 10000
      });
      
      console.log("✅ Got user info from alternative endpoint");
      return response.data;
      
    } catch (fallbackError) {
      console.error("❌ Both endpoints failed:", fallbackError.message);
      
      // Try to get token info as last resort
      try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const tokenInfo = await client.getTokenInfo(accessToken);
        
        console.log("✅ Got token info:", tokenInfo);
        
        return {
          email: tokenInfo.email,
          sub: tokenInfo.sub,
          name: tokenInfo.email.split('@')[0] // Default name from email
        };
        
      } catch (tokenError) {
        console.error("❌ Could not get any user info:", tokenError.message);
        return null;
      }
    }
  }
}

// Helper function to handle user creation/update
async function handleUserAuth(userInfo) {
  console.log("🔄 Processing user in database...");
  
  try {
    const { email, name, picture, googleId, githubId, password, country, location, ip } = userInfo;
    
    // Resolve user location coordinates
    let finalLocation = { city: "", country: "", latitude: null, longitude: null };
    if (location && location.latitude && location.longitude) {
      finalLocation = {
        city: location.city || "",
        country: location.country || location.country_name || "",
        latitude: Number(location.latitude),
        longitude: Number(location.longitude)
      };
    } else if (ip) {
      const geo = await geocodeIp(ip);
      if (geo) {
        finalLocation = geo;
      }
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      console.log("👤 Creating new user:", email);
      isNewUser = true;
      
      // Generate username from email
      const username = generateUsername(email);
      
      user = await User.create({
        googleId,
        githubId,
        password,
        name,
        email,
        username,
        picture,
        country: finalLocation.country || country || "Unknown",
        location: finalLocation,
        isVerified: true,
        tokens: 10, // Start with daily allocation
        streak: { count: 1, lastVisit: new Date() },
        lastTokenReset: new Date()
      });
      
      console.log("✅ New user created:", user._id);

      // Fire welcome email in background (non-blocking)
      setImmediate(() => {
        emailService.sendWelcome({ name: user.name, email: user.email, _id: user._id })
          .catch(e => console.warn('⚠️ Welcome email failed (non-critical):', e.message));
      });
    } else {
      console.log("👤 Updating existing user:", user._id);
      
      const now = new Date();
      const todayStr = now.toDateString();

      // ── Streak logic ──────────────────────────────────────────
      // lastVisit is the last time they logged in
      const lastVisit = user.streak?.lastVisit ? new Date(user.streak.lastVisit) : null;
      const lastVisitStr = lastVisit ? lastVisit.toDateString() : null;

      let newStreak = user.streak?.count || 0;

      if (lastVisitStr === todayStr) {
        // Same day login — keep streak unchanged
        console.log("📅 Same day login, streak unchanged:", newStreak);
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastVisitStr === yesterdayStr) {
          // Consecutive day — increment streak
          newStreak += 1;
          console.log("🔥 Streak incremented:", newStreak);
        } else {
          // Missed a day — reset streak back to 1
          newStreak = 1;
          console.log("💔 Streak reset to 1 (missed a day)");
        }
      }

      // ── Daily token refresh for all users ──────────────────
      // Top up tokens to 10 if it's a new day and they have less than 10.
      const lastReset = user.lastTokenReset ? new Date(user.lastTokenReset) : null;
      const lastResetStr = lastReset ? lastReset.toDateString() : null;
      const DAILY_FREE_TOKENS = 10;

      let tokenUpdate = {};
      if (lastResetStr !== todayStr) {
        tokenUpdate.lastTokenReset = now;
        if (user.tokens === undefined || user.tokens === null || user.tokens < DAILY_FREE_TOKENS) {
          tokenUpdate.tokens = DAILY_FREE_TOKENS;
          console.log(`🎁 Daily tokens topped up (to ${DAILY_FREE_TOKENS}) for user: ${email}`);
        } else {
          console.log(`ℹ️ Daily reset checked but user ${email} already has ${user.tokens} tokens (>= ${DAILY_FREE_TOKENS})`);
        }
      }

      // Build update object
      const updateData = {
        lastLogin: now,
        'streak.count': newStreak,
        'streak.lastVisit': now,
        location: finalLocation,
        ...tokenUpdate,
      };

      if (finalLocation.country) {
        updateData.country = finalLocation.country;
      }

      if (googleId && !user.googleId) updateData.googleId = googleId;
      if (githubId && !user.githubId) updateData.githubId = githubId;
      if (picture && !user.picture) updateData.picture = picture;
      
      user = await User.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        { new: true, runValidators: false }
      );
      
      console.log("✅ User updated — streak:", newStreak);
    }
    
    return { user, isNewUser };
    
  } catch (dbError) {
    console.error("❌ Database error:", dbError);
    
    // Handle specific validation errors
    if (dbError.name === 'ValidationError') {
      // If it's a username error, try to fix it
      if (dbError.errors?.username) {
        console.log("🔄 Attempting to fix username validation error...");
        
        try {
          const { email, name, picture, googleId } = userInfo;
          
          // Find user by email
          const existingUser = await User.findOne({ email });
          
          if (existingUser && !existingUser.username) {
            // Generate and set username
            existingUser.username = generateUsername(email);
            await existingUser.save({ validateBeforeSave: false });
            console.log("✅ Fixed username for existing user");
            return { user: existingUser, isNewUser: false };
          }
        } catch (fixError) {
          console.error("❌ Failed to fix username error:", fixError);
        }
      }
    }
    
    throw new Error(`Database error: ${dbError.message}`);
  }
}

// Helper function to geocode user location from IP with local fallbacks
async function geocodeIp(ip) {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    // Generate simulated coordinates for testing on localhost
    const simulatedCities = [
      { city: "New York", country: "United States", lat: 40.7128, lon: -74.0060 },
      { city: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
      { city: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
      { city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
      { city: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
      { city: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
      { city: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194 }
    ];
    const target = simulatedCities[Math.floor(Math.random() * simulatedCities.length)];
    const noiseLat = (Math.random() - 0.5) * 0.5;
    const noiseLon = (Math.random() - 0.5) * 0.5;
    return {
      city: target.city,
      country: target.country,
      latitude: target.lat + noiseLat,
      longitude: target.lon + noiseLon
    };
  }

  try {
    const cleanIp = ip.replace(/^::ffff:/, '');
    const response = await axios.get(`https://ipapi.co/${cleanIp}/json/`, { timeout: 4000 });
    if (response.data && !response.data.error) {
      return {
        city: response.data.city || "Unknown",
        country: response.data.country_name || "Unknown",
        latitude: response.data.latitude || null,
        longitude: response.data.longitude || null
      };
    }
  } catch (error) {
    console.error("Geocoding IP error:", error.message);
  }
  return null;
}

// Helper function to generate username
function generateUsername(email) {
  // Extract base username from email
  const baseUsername = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .substring(0, 20); // Limit length
  
  // Add random suffix for uniqueness
  const randomSuffix = Math.floor(Math.random() * 10000);
  const username = `${baseUsername}${randomSuffix}`;
  
  console.log(`🔄 Generated username: ${username} for email: ${email}`);
  return username;
}

// Helper function to send response
function sendAuthResponse(res, user, isSignup = false) {
  // Create JWT session token
  const token = jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      name: user.name 
    },
    process.env.JWT_SECRET || process.env.SESSION_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );

  console.log("✅ Auth successful, sending response for user:", user.email);
  
  const response = {
    success: true,
    message: "User logged in successfully",
    data: {
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        username: user.username,
        googleId: user.googleId
      },
      isSignup: isSignup,
      expiresIn: 2592000 // 30 days in seconds
    }
  };
  
  return res.status(200).json(response);
}

exports.getToken = async (req, res) => {
  try {
    const user = req.user; // assuming user is attached via auth middleware

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Fetch the latest user data from DB
    const currentUser = await User.findById(user._id).select("token");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return only the token count
    return res.status(200).json({
      success: true,
      token: currentUser.token,
    });
  } catch (error) {
    console.error("❌ Error fetching token:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching token",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find the user in database
    const currentUser = await User.findById(user._id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Optional: Delete user's transactions if you have a Transaction model
    try {
      // If you have a Transaction model, uncomment the following:
      // await Transaction.deleteMany({ userId: user._id });
      console.log(`Cleaning up data for user: ${user._id}`);
    } catch (cleanupError) {
      console.error("Error during data cleanup:", cleanupError);
      // Continue with account deletion even if cleanup fails
    }

    // Delete the user account
    await User.findByIdAndDelete(user._id);

    // Optional: Invalidate any active sessions/tokens
    // This depends on your session management strategy

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting account",
    });
  }
};



exports.getUserServices = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get user with populated notes and all related data
    const userData = await User.findById(user._id)
      .populate('notes.noteId')
      .lean();

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create an array to hold all mixed data
    const mixedData = [];

    // Add transaction data
    if (userData.transactions && userData.transactions.length > 0) {
      userData.transactions.forEach(transaction => {
        mixedData.push({
          type: 'transaction',
          id: transaction._id,
          timestamp: transaction.timestamp,
          date: transaction.timestamp,
          title: `Payment - ${transaction.packageName}`,
          description: `${transaction.status === 'success' ? 'Successful' : 'Failed'} payment for ${transaction.packageName}`,
          status: transaction.status,
          amount: transaction.amount,
          tokens: transaction.tokens,
          paymentId: transaction.paymentId,
          orderId: transaction.orderId,
          packageName: transaction.packageName,
          paymentMethod: transaction.paymentMethod,
          error: transaction.error,
          metadata: {
            razorpay_payment_id: transaction.razorpay_payment_id,
            razorpay_order_id: transaction.razorpay_order_id,
            type: 'payment'
          }
        });
      });
    }

    // Add token usage history data
    if (userData.tokenUsageHistory && userData.tokenUsageHistory.length > 0) {
      userData.tokenUsageHistory.forEach(usage => {
        mixedData.push({
          type: 'token-INage',
          id: usage._id,
          timestamp: usage.date,
          date: usage.date,
          title: `Token Usage - ${usage.name}`,
          description: `Used ${usage.tokens} tokens for ${usage.name}`,
          tokens: usage.tokens,
          action: usage.name,
          metadata: {
            type: 'token-INage'
          }
        });
      });
    }

    // Add token transactions data
    if (userData.tokenTransactions && userData.tokenTransactions.length > 0) {
      userData.tokenTransactions.forEach(transaction => {
        mixedData.push({
          type: 'token_transaction',
          id: transaction._id,
          timestamp: transaction.date,
          date: transaction.date,
          title: `Token ${transaction.type} - ${transaction.name}`,
          description: `${transaction.tokensUsed} tokens used for ${transaction.name}`,
          tokens: transaction.tokensUsed,
          transactionType: transaction.type,
          action: transaction.name,
          status: transaction.status,
          metadata: {
            type: 'token_transaction'
          }
        });
      });
    }

    // Add notes data with thumbnail
    if (userData.notes && userData.notes.length > 0) {
      userData.notes.forEach(noteItem => {
        if (noteItem.noteId) {
          mixedData.push({
            type: 'note',
            id: noteItem.noteId._id,
            timestamp: noteItem.noteId.createdAt,
            date: noteItem.noteId.createdAt,
            title: `Note Created - ${noteItem.noteId.title}`,
            slug: noteItem.noteId.slug,
            thumbnail: noteItem.noteId.thumbnail, // Thumbnail link included here
            metadata: {
              type: 'note_creation',
              contentLength: noteItem.noteId.content?.length || 0,
              hasPdf: !!noteItem.noteId.pdf_data?.downloadUrl,
              thumbnailAvailable: !!noteItem.noteId.thumbnail,
              imagesCount: noteItem.noteId.img_with_url?.length || 0
            }
          });
        }
      });
    }

    // Add user join date
    mixedData.push({
      type: 'account',
      id: userData._id,
      timestamp: userData.joinedAt,
      date: userData.joinedAt,
      title: 'Account Created',
      description: 'Joined the platform',
      metadata: {
        type: 'account_creation'
      }
    });

    // Sort all data by timestamp (newest first)
    mixedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Format dates for better readability
    const formattedData = mixedData.map(item => ({
      ...item,
      formattedDate: new Date(item.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: item.timestamp,
      isoDate: item.timestamp.toISOString()
    }));

    return res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: {
        timeline: formattedData,
        summary: {
          totalTransactions: userData.transactions?.length || 0,
          successfulTransactions: userData.transactions?.filter(t => t.status === 'success').length || 0,
          failedTransactions: userData.transactions?.filter(t => t.status === 'failed').length || 0,
          totalNotes: userData.notes?.length || 0,
          totalTokenUsage: userData.tokenUsageHistory?.length || 0,
          notesWithThumbnails: userData.notes?.filter(note => note.noteId?.thumbnail).length || 0
        }
      }
    });

  } catch (error) {
    console.error("Error in getUserServices:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Allow 'mobile' to be updated, protect all other sensitive fields
    const protectedFields = ['_id', 'id', 'email', 'googleId', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => delete updates[field]);

    // Optional: Add validation for mobile number if present
    if (updates.mobile) {
      // Only allow 10 digit numbers, you may adapt as needed
      const mobileString = updates.mobile.toString().replace(/\D/g, '');
      if (mobileString.length !== 10) {
        return res.status(400).json({ success: false, message: "Mobile number must be 10 digits" });
      }
      updates.mobile = mobileString;
    }

    // Find and update the user with only the provided fields (including mobile, if present)
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select('-password -__v -googleAccessToken -googleId -followerUsers'); 

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user
    });
  } catch (error) {
    console.error("❌ Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};


exports.getPlanStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select(
      "name email picture token usedToken membership notes transactions tokenUsageHistory"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();
    const membership = user.membership || {};
    const expiresAt = membership.expiresAt ? new Date(membership.expiresAt) : null;
    const isActive =
      membership.isActive && expiresAt && expiresAt.getTime() > now.getTime();

    if (membership.isActive && !isActive) {
      membership.isActive = false;
      await user.save({ validateBeforeSave: false });
    }

    const remainingMs = expiresAt ? expiresAt.getTime() - now.getTime() : null;
    const expiresInDays =
      remainingMs !== null ? Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24))) : null;

    const recentTransactions = (user.transactions || [])
      .slice(-5)
      .reverse()
      .map((txn) => ({
        id: txn._id,
        packageId: txn.packageId,
        packageName: txn.packageName,
        packageType: txn.packageType,
        amount: txn.amount,
        tokens: txn.tokens,
        status: txn.status,
        timestamp: txn.timestamp,
      }));

    const planStatus = {
      isActive,
      planId: membership.planId || null,
      planName: membership.planName || null,
      billingPeriod: membership.billingPeriod || null,
      startedAt: membership.startedAt || null,
      expiresAt: expiresAt || null,
      expiresInDays,
    };

    const responsePayload = {
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
        },
        membership: planStatus,
        tokens: {
          balance: user.token,
          used: user.usedToken,
        },
        usageSummary: {
          notesCreated: user.notes?.length || 0,
          tokenTransactions: user.tokenUsageHistory?.length || 0,
        },
        recentTransactions,
      },
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("❌ Get Plan Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plan status",
      error: error.message,
    });
  }
};

// 🔹 Email/Password Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, otpCode, country } = req.body;
    if (!name || !email || !password || !otpCode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const emailLower = email.toLowerCase();

    // Verify OTP
    const validOtp = await Otp.findOne({ email: emailLower, code: otpCode, purpose: "signup" });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Call handleUserAuth to create the user properly (setting streaks, welcome email, tokens, country)
    const { user } = await handleUserAuth({
      email: emailLower,
      name,
      password: hashedPassword,
      country: country || "Unknown",
      location: req.body.location,
      ip: req.ip || req.headers['x-forwarded-for']
    });

    // Clean up OTP
    await Otp.deleteOne({ _id: validOtp._id });

    return sendAuthResponse(res, user, true);
  } catch (error) {
    console.error("❌ Register Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Registration failed" });
  }
};

// 🔹 Email/Password Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Check if they registered via social login and don't have a password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was registered using Google. Please log in using Google."
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Update streak and tokens utilizing the unified handleUserAuth helper
    const { user: updatedUser } = await handleUserAuth({
      email: user.email,
      name: user.name,
      location: req.body.location,
      ip: req.ip || req.headers['x-forwarded-for']
    });

    return sendAuthResponse(res, updatedUser, false);
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Login failed" });
  }
};

// 🔹 GitHub OAuth Controller
exports.githubAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "GitHub authorization code is required" });
    }

    const clientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("❌ GitHub Client ID or Secret is missing from environment variables");
      return res.status(500).json({
        success: false,
        message: "GitHub authentication failed",
        error: "GitHub Client ID or Secret is not configured on the server."
      });
    }

    // Exchange code for token
    console.log("🔄 Exchanging GitHub code for access token...");
    const tokenResponse = await axios.post("https://github.com/login/oauth/access_token", {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }, {
      headers: {
        Accept: "application/json"
      }
    });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      console.error("❌ Failed to get access token from GitHub", tokenResponse.data);
      return res.status(400).json({ success: false, message: "GitHub token exchange failed: " + (tokenResponse.data.error_description || "No token returned") });
    }

    // Fetch user profile
    console.log("🔄 Fetching GitHub user profile...");
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Paperxify-App"
      }
    });

    const profile = userResponse.data;
    let email = profile.email;

    // Fetch emails if profile email is private/null
    if (!email) {
      console.log("🔄 Fetching GitHub user emails...");
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "Paperxify-App"
        }
      });
      const primaryEmailObj = emailResponse.data.find(e => e.primary && e.verified);
      email = primaryEmailObj ? primaryEmailObj.email : (emailResponse.data[0] ? emailResponse.data[0].email : null);
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "No email associated with this GitHub account." });
    }

    console.log(`✅ GitHub Profile: ${profile.login} (${email})`);

    // Handle user database sync
    const { user, isNewUser } = await handleUserAuth({
      email: email.toLowerCase(),
      name: profile.name || profile.login,
      picture: profile.avatar_url,
      githubId: String(profile.id),
      location: req.body.location,
      ip: req.ip || req.headers['x-forwarded-for']
    });

    return sendAuthResponse(res, user, isNewUser);
  } catch (error) {
    console.error("❌ GitHub OAuth Error:", error);
    return res.status(500).json({
      success: false,
      message: "GitHub authentication failed",
      error: error.message
    });
  }
};

// 🔹 Send Signup OTP
exports.sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Generate 6-digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Otp model, replacing any old ones for same email/purpose
    await Otp.deleteMany({ email: emailLower, purpose: "signup" });
    await Otp.create({
      email: emailLower,
      code: otpCode,
      purpose: "signup",
    });

    // Send email
    const emailResult = await emailService.sendVerificationOtp(emailLower, otpCode, "signup");
    if (!emailResult.success) {
      console.error("❌ Failed to send signup OTP email:", emailResult.error);
      return res.status(500).json({ success: false, message: "Failed to send verification email" });
    }

    return res.status(200).json({ success: true, message: "Verification OTP code sent to your email" });
  } catch (error) {
    console.error("❌ sendSignupOtp Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to send OTP" });
  }
};

// 🔹 Send Forgot Password OTP
exports.sendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const emailLower = email.toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ success: false, message: "No account registered with this email" });
    }

    // Check if user has a password (they might be Google/GitHub OAuth only)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was registered using Google/GitHub. Please log in using those providers.",
      });
    }

    // Generate 6-digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Otp model, replacing any old ones for same email/purpose
    await Otp.deleteMany({ email: emailLower, purpose: "forgot" });
    await Otp.create({
      email: emailLower,
      code: otpCode,
      purpose: "forgot",
    });

    // Send email
    const emailResult = await emailService.sendVerificationOtp(emailLower, otpCode, "forgot");
    if (!emailResult.success) {
      console.error("❌ Failed to send forgot OTP email:", emailResult.error);
      return res.status(500).json({ success: false, message: "Failed to send verification email" });
    }

    return res.status(200).json({ success: true, message: "Password reset OTP sent to your email" });
  } catch (error) {
    console.error("❌ sendForgotOtp Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to send OTP" });
  }
};

// 🔹 Reset Password with OTP
exports.resetPasswordOtp = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const emailLower = email.toLowerCase();

    // Verify OTP
    const validOtp = await Otp.findOne({ email: emailLower, code: otpCode, purpose: "forgot" });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    // Update user
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });

    // Clean up OTP
    await Otp.deleteOne({ _id: validOtp._id });

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("❌ resetPasswordOtp Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to reset password" });
  }
};

// 🔹 Apple Sign-In Controller removed




