const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

// Load env from Server/src/.env
dotenv.config({ path: path.join(__dirname, "../src/.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/NoteFlux";
const SESSION_SECRET = process.env.SESSION_SECRET || "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";
const PORT = process.env.PORT || 5000;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const User = require("../src/models/User");
  
  // Find or create a test user
  let user = await User.findOne({ email: "test_detector@paperxify.com" });
  if (!user) {
    user = await User.create({
      username: "testdetector",
      name: "Test Detector User",
      email: "test_detector@paperxify.com",
      membership: {
        isActive: true,
        planId: "pro",
        planName: "Pro Plan"
      }
    });
    console.log("Created test user");
  } else {
    // Ensure membership is active
    user.membership = {
      isActive: true,
      planId: "pro",
      planName: "Pro Plan"
    };
    await user.save();
    console.log("Updated test user membership");
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, SESSION_SECRET);
  console.log("Generated token:", token);

  const textToTest = `Artificial Intelligence has evolved rapidly over the last decade. It has permeated various aspects of human life. However, it is important to note that no AI tool is fully perfect. Furthermore, in conclusion, we must be careful with its usage.`;

  console.log("Sending POST request to detect AI...");
  try {
    const response = await axios.post(`http://localhost:${PORT}/api/writer/detect`, {
      text: textToTest
    }, {
      headers: {
        Auth: token
      }
    });

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error during API request:", error.response ? error.response.data : error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

run().catch(console.error);
