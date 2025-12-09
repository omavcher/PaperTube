const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Note = require("../models/Note");
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios'); // Add axios for better HTTP requests

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
    const user = await handleUserAuth({ email, name, picture, googleId, accessToken });
    
    console.log("✅ User processed:", user.email, user._id);
    
    // Send success response
    return sendAuthResponse(res, user, accessToken);
    
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
    const { email, name, picture, googleId, accessToken } = userInfo;
    
    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log("👤 Creating new user:", email);
      
      // Generate username from email
      const username = generateUsername(email);
      
      user = await User.create({
        googleId,
        name,
        email,
        username,
        picture,
        googleAccessToken: accessToken,
        isVerified: true
      });
      
      console.log("✅ New user created:", user._id);
    } else {
      console.log("👤 Updating existing user:", user._id);
      
      // Build update object
      const updateData = {};
      
      // Only update if not already set
      if (googleId && !user.googleId) updateData.googleId = googleId;
      if (picture) updateData.picture = picture;
      
      // Always update these fields
      updateData.googleAccessToken = accessToken;
      updateData.lastLogin = new Date();
      
      // Use findByIdAndUpdate to avoid validation issues with existing fields
      if (Object.keys(updateData).length > 0) {
        user = await User.findByIdAndUpdate(
          user._id,
          { $set: updateData },
          { new: true, runValidators: false }
        );
      }
      
      console.log("✅ User updated");
    }
    
    return user;
    
  } catch (dbError) {
    console.error("❌ Database error:", dbError);
    
    // Handle specific validation errors
    if (dbError.name === 'ValidationError') {
      // If it's a username error, try to fix it
      if (dbError.errors?.username) {
        console.log("🔄 Attempting to fix username validation error...");
        
        try {
          const { email, name, picture, googleId, accessToken } = userInfo;
          
          // Find user by email
          const existingUser = await User.findOne({ email });
          
          if (existingUser && !existingUser.username) {
            // Generate and set username
            existingUser.username = generateUsername(email);
            await existingUser.save({ validateBeforeSave: false });
            console.log("✅ Fixed username for existing user");
            return existingUser;
          }
        } catch (fixError) {
          console.error("❌ Failed to fix username error:", fixError);
        }
      }
    }
    
    throw new Error(`Database error: ${dbError.message}`);
  }
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
function sendAuthResponse(res, user, accessToken) {
  // Create JWT session token
  const token = jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      name: user.name 
    },
    process.env.JWT_SECRET || process.env.SESSION_SECRET, // Use JWT_SECRET as fallback
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
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
      googleAccessToken: accessToken, // Send back to frontend for Drive operations
      expiresIn: 604800 // 7 days in seconds
    }
  };
  
  console.log("📤 Response being sent:", JSON.stringify(response, null, 2));
  
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
          type: 'token_usage',
          id: usage._id,
          timestamp: usage.date,
          date: usage.date,
          title: `Token Usage - ${usage.name}`,
          description: `Used ${usage.tokens} tokens for ${usage.name}`,
          tokens: usage.tokens,
          action: usage.name,
          metadata: {
            type: 'token_usage'
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

    const user = await User.findById(userId).select('-password -__v'); 

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