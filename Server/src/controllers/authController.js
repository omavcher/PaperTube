const jwt = require("jsonwebtoken");
const User = require("../models/User");

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