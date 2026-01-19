const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Auth') || req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
    }

    // Extract token from "Bearer <token>" or use as is
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. Invalid token format." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-__v');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found. Token is invalid." 
      });
    }

    // Check if user is admin by comparing email with environment variable
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.error("❌ ADMIN_EMAIL environment variable is not set");
      return res.status(500).json({
        success: false,
        message: "Server configuration error."
      });
    }

    // Normalize emails (case-insensitive comparison)
    const userEmail = user.email.toLowerCase().trim();
    const allowedAdminEmail = adminEmail.toLowerCase().trim();

    if (userEmail !== allowedAdminEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to access this resource.",
        hint: "Only admin users can access this endpoint."
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Admin Auth Middleware Error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token." 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired." 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "Server error during authentication." 
    });
  }
};

module.exports = adminAuth;