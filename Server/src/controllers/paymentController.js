// controllers/paymentController.js
const User = require("../models/User");

// Save transaction to database
exports.saveTransaction = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      packageId,
      amount,
      tokens,
      status,
      userId,
      userEmail,
      userName,
      packageName,
      error
    } = req.body;

    console.log("📦 Received transaction data:", {
      razorpay_payment_id,
      packageId,
      amount,
      tokens,
      status,
      userId,
      userEmail
    });

    // Validate required fields
    if (!razorpay_payment_id || !packageId || !amount || !tokens || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Find user by ID or email
    let user;
    if (userId) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
      
      if (isValidObjectId) {
        user = await User.findById(userId);
      } else {
        user = await User.findOne({ email: userId });
      }
    }

    if (!user && userEmail) {
      user = await User.findOne({ email: userEmail });
    }

    if (!user) {
      console.error("❌ User not found with userId:", userId, "or userEmail:", userEmail);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ User found:", user.email);

    // Generate order ID in backend if not provided
    const generateOrderId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = 'order_';
      for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const finalOrderId = razorpay_order_id || generateOrderId();

    // Create transaction object - FIXED: Removed duplicate fields
    const transactionData = {
      paymentId: razorpay_payment_id,
      orderId: finalOrderId,
      signature: razorpay_signature || '',
      packageId,
      packageName: packageName || `Package ${packageId}`,
      amount: parseFloat(amount),
      tokens: parseInt(tokens),
      status,
      error: error || null,
      userEmail: userEmail || user.email,
      userName: userName || user.name,
      timestamp: new Date()
    };

    console.log("💾 Saving transaction:", transactionData);

    // Check for duplicate payment before processing
    const existingSuccessfulTransaction = user.transactions.find(
      txn => txn.paymentId === razorpay_payment_id && txn.status === 'success'
    );

    if (existingSuccessfulTransaction) {
      console.log(`⚠️ Payment ${razorpay_payment_id} was already processed successfully`);
      return res.status(409).json({
        success: false,
        message: "This payment was already processed"
      });
    }

    // Add transaction to user's transactions array
    user.transactions.push(transactionData);

    // If payment was successful, add tokens to user's account
    if (status === 'success') {
      const tokensToAdd = parseInt(tokens);
      user.token += tokensToAdd;
      console.log(`💰 Added ${tokensToAdd} tokens to user. New balance: ${user.token}`);
    }

    // Save user with new transaction
    await user.save();

    const savedTransaction = user.transactions[user.transactions.length - 1];

    console.log("✅ Transaction saved successfully:", savedTransaction._id);

    res.json({
      success: true,
      transactionId: savedTransaction._id,
      orderId: finalOrderId,
      message: `Transaction ${status} saved successfully`,
      data: {
        transactionId: savedTransaction._id,
        orderId: finalOrderId,
        tokens: user.token,
        status: status
      }
    });

  } catch (error) {
    console.error("❌ Error saving transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save transaction",
      error: error.message
    });
  }
};



// Get user's transaction history
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, page = 1 } = req.query;

    const user = await User.findById(userId).select('transactions');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Sort transactions by timestamp (newest first) and paginate
    const transactions = user.transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      transactions: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: user.transactions.length
      }
    });

  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message
    });
  }
};

// Get user token balance
exports.getTokenBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('token usedToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      token: user.token,
      usedToken: user.usedToken,
      availableToken: user.token - user.usedToken
    });

  } catch (error) {
    console.error("❌ Error fetching token balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch token balance",
      error: error.message
    });
  }
};