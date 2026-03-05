// app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const noteRoutes = require("./routes/noteRoutes");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const authPayment = require("./routes/paymentRoutes");
const tokenResetService = require("./services/tokenResetService");
const pdfRoutes = require("./routes/pdfRoutes");
const supportRoutes = require("./routes/supportRoutes");
const promoRoutes = require("./routes/promoRoutes");
const errorHandler = require("./middleware/errorHandler");


const app = express();

// Middlewares
app.use(cors(
    { origin: ["https://paperxify.com", "https://www.paperxify.com", "http://localhost:3000"]
      , credentials: true }
));
app.use(express.json());

// Routes
app.use("/api/notes", noteRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", authPayment);
app.use("/api/pdf", pdfRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/general", require("./routes/generalRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/faker", require("./routes/fakerRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/support", supportRoutes);
app.use("/api/promo", promoRoutes);

// Optional: Add admin route to manually trigger token reset
app.post("/api/admin/trigger-token-reset", async (req, res) => {
  try {
    // Check if user is admin (you need to add admin check middleware)
    await tokenResetService.testReset();
    res.json({ success: true, message: "Token reset triggered manually" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Optional: Get token reset stats
app.get("/api/admin/token-reset-stats", async (req, res) => {
  try {
    const stats = await tokenResetService.getResetStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start daily token reset scheduler
tokenResetService.startDailyReset();

// Basic health-check / root route for the keep-alive ping
app.get("/", (req, res) => {
  res.status(200).send("Backend is active.");
});

// Keep your existing keep-alive functionality
const url = process.env.BACKEND_URL;
const interval = 90000; // 15 minutes in milliseconds

function reloadWebsite() {
  if (!url) {
    console.log("BACKEND_URL is not defined. Skipping website reload.");
    return;
  }
  
  axios
    .get(url)
    .then((response) => {
      console.log("website reloaded");
    })
    .catch((error) => {
      console.error(`Error reloading website: ${error.message}`);
    });
}

setInterval(reloadWebsite, interval);

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  tokenResetService.stopAllJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  tokenResetService.stopAllJobs();
  process.exit(0);
});

module.exports = app;