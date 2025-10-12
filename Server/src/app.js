const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const noteRoutes = require("./routes/noteRoutes");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const authPayment = require("./routes/paymentRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
app.use(cors(
    { origin: 'http://localhost:3000', credentials: true }
));
app.use(express.json());

// Routes
app.use("/api/notes", noteRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", authPayment);

// Error handler
app.use(errorHandler);

module.exports = app;