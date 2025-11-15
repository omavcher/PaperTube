const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Note = require("../models/Note");

exports.googleAuth = async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        picture,
      });
    } else {
      // Update Google ID or picture if changed
      user.googleId = googleId || user.googleId;
      user.picture = picture || user.picture;
      await user.save();
    }

    // Create JWT session token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SESSION_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      sessionToken: token,
      user,
    });
  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


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