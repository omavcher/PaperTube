const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const app = require("./app");

dotenv.config({ path: path.join(__dirname, ".env") });
connectDB();

const PORT = process.env.PORT;


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});