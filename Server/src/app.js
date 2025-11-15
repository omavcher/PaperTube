const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const noteRoutes = require("./routes/noteRoutes");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const authPayment = require("./routes/paymentRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
app.use(cors(
    { origin: process.env.CLIENT, credentials: true }
));
app.use(express.json());

// Routes
app.use("/api/notes", noteRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", authPayment);


const url = process.env.BACKUP_URL;

const interval = 90000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log("website reloaded");
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
    });
}

setInterval(reloadWebsite, interval);

// Error handler
app.use(errorHandler);

module.exports = app;