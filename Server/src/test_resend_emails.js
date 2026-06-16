const dotenv = require("dotenv");
const path = require("path");

// Load Environment variables first
dotenv.config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const emailService = require("./utils/emailService");

(async () => {
  console.log("🔄 Connecting to Database...");
  await connectDB();
  console.log("✅ Database connected successfully.");

  const testEmail = "omawchar07@gmail.com";
  const user = {
    name: "Om Awchar",
    email: testEmail,
  };

  const results = [];

  const measure = async (name, fn) => {
    console.log(`\n📧 Sending: ${name} ...`);
    const start = Date.now();
    try {
      const res = await fn();
      const end = Date.now();
      const duration = end - start;
      console.log(`Result Status: ${res.success ? "SUCCESS" : "FAILED"}`);
      if (res.messageId) console.log(`Resend Message ID: ${res.messageId}`);
      if (res.error) console.log(`Error Response:`, res.error);
      console.log(`⚡ Time taken: ${duration}ms`);
      results.push({ name, success: res.success ? "YES" : "NO", duration: `${duration}ms`, error: res.error || "None" });
    } catch (err) {
      const end = Date.now();
      console.error(`💥 Exception error:`, err.message);
      results.push({ name, success: "NO", duration: `${end - start}ms`, error: err.message });
    }
  };

  // 1. Welcome Email
  await measure("Welcome Email", () => emailService.sendWelcome(user));

  // 2. Verification OTP Email
  await measure("Verification OTP", () => emailService.sendVerificationOtp(testEmail, "999888", "signup"));

  // 3. Subscription Purchase Email
  const transaction = {
    packageName: "Pro Plan",
    billingPeriod: "monthly",
    amount: 9,
    paymentId: "pay_test_resend_123",
    timestamp: new Date(),
    _id: new mongoose.Types.ObjectId()
  };
  await measure("Subscription Purchase Confirmation", () => emailService.sendSubscriptionPurchase({
    ...user,
    membership: { expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  }, transaction));

  console.log("\n=================================");
  console.log("Summary of Resend Performance Test");
  console.log("=================================");
  console.table(results);

  // Close MongoDB connection
  mongoose.connection.close();
  process.exit(0);
})();
