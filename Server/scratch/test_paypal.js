const axios = require("axios");
const path = require("path");
const dotenv = require("dotenv");

// Load the environment variables from src/.env
dotenv.config({ path: path.join(__dirname, "../src/.env") });

// The helper function copied from paymentController.js
function getDetailedPaypalError(error) {
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.details && Array.isArray(data.details)) {
      return data.details.map(d => `${d.issue}: ${d.description}`).join("; ") || data.message;
    }
    return data.error_description || data.message || data.error || JSON.stringify(data);
  }
  return error.message;
}

async function testPaypalAuth(clientId, clientSecret) {
  const mode = process.env.PAYPAL_MODE || "sandbox";
  const baseUrl = mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const response = await axios.post(
      `${baseUrl}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: { username: clientId, password: clientSecret },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return { success: true, token: response.data.access_token };
  } catch (error) {
    return { success: false, message: getDetailedPaypalError(error) };
  }
}

async function run() {
  console.log("--- TEST 1: Valid Local Env Credentials ---");
  const validClientId = process.env.PAYPAL_CLIENT_ID;
  const validClientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const res1 = await testPaypalAuth(validClientId, validClientSecret);
  console.log("Success:", res1.success);
  if (res1.success) {
    console.log("Token starts with:", res1.token.substring(0, 20) + "...");
  } else {
    console.log("Error message:", res1.message);
  }

  console.log("\n--- TEST 2: Invalid Credentials (Simulating 401) ---");
  const res2 = await testPaypalAuth("invalid-client-id", "invalid-client-secret");
  console.log("Success:", res2.success);
  console.log("Parsed Error message:", res2.message);

  console.log("\n--- TEST 3: Simulated Validation Errors (Details Array) ---");
  const mockError = {
    response: {
      data: {
        name: "UNPROCESSABLE_ENTITY",
        details: [
          {
            field: "/purchase_units/0/amount/value",
            value: "-5.00",
            issue: "CANNOT_BE_NEGATIVE",
            description: "The value must be greater than zero"
          },
          {
            field: "/purchase_units/0/currency_code",
            value: "XYZ",
            issue: "INVALID_CURRENCY_CODE",
            description: "Currency code is invalid"
          }
        ],
        message: "The requested action could not be performed."
      }
    }
  };
  console.log("Parsed simulated error:", getDetailedPaypalError(mockError));
}

run();
