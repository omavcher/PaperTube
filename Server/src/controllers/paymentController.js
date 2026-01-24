// controllers/paymentController.js
const User = require("../models/User");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Package configurations
const SUBSCRIPTION_PLANS = {
  scholar: {
    monthly: { basePrice: 149, durationDays: 30 },
    yearly: { basePrice: 1490, durationDays: 365 }
  },
  pro: {
    monthly: { basePrice: 299, durationDays: 30 },
    yearly: { basePrice: 2990, durationDays: 365 }
  },
  power: {
    monthly: { basePrice: 599, durationDays: 30 },
    yearly: { basePrice: 5990, durationDays: 365 }
  }
};

const TOKEN_PACKAGES = {
  basic: { tokens: 100, basePrice: 99 },
  standard: { tokens: 500, basePrice: 399 },
  premium: { tokens: 1000, basePrice: 699 }
};

// Verify payment signature
const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
};

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { 
      packageId, 
      packageType, 
      finalAmount, 
      billingPeriod = 'monthly',
      packageName 
    } = req.body;

    // Validate required fields
    if (!packageId || !packageType || !finalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate amount
    const amount = Math.round(parseFloat(finalAmount) * 100); // Convert to paise
    if (amount < 100) { // Minimum ₹1
      return res.status(400).json({
        success: false,
        message: "Amount must be at least ₹1"
      });
    }

    // Create order options
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        packageId: packageId,
        packageType: packageType,
        billingPeriod: packageType === 'subscription' ? billingPeriod : undefined,
        packageName: packageName || packageId,
        userId: req.user._id.toString(),
        userEmail: req.user.email
      },
      payment_capture: 1 // Auto capture payment
    };

    // Create order with Razorpay
    const order = await razorpay.orders.create(options);

    console.log("✅ Order created:", {
      orderId: order.id,
      amount: order.amount / 100,
      userId: req.user._id,
      package: packageId
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("❌ Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message
    });
  }
};

// Verify payment and save transaction
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      packageId,
      packageType,
      finalAmount,
      baseAmount,
      discountAmount,
      gstAmount,
      couponCode,
      billingPeriod,
      mobile,
      status,
      userId,
      userEmail,
      userName,
      packageName
    } = req.body;

    console.log("🔍 Verifying payment:", {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      packageId,
      status,
      userId
    });

    // Verify signature for successful payments
    if (status === "success") {
      const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature"
        });
      }
    }

    // Prepare transaction data
    const transactionData = {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature: status === "success" ? razorpay_signature : undefined,
      packageId,
      packageType,
      billingPeriod,
      amount: parseFloat(finalAmount),
      baseAmount: parseFloat(baseAmount) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      gstAmount: parseFloat(gstAmount) || 0,
      status,
      couponCode: couponCode || null,
      userId: userId || req.user._id,
      userEmail: userEmail || req.user.email,
      userName: userName || req.user.name,
      packageName: packageName || `Package ${packageId}`,
      error: status === "failed" ? req.body.error : null,
      paymentMethod: "razorpay"
    };

    console.log("📦 Processing transaction data:", {
      userId: transactionData.userId,
      email: transactionData.userEmail,
      amount: transactionData.amount
    });

    // Save transaction using internal function
    const result = await saveTransactionInternal(transactionData);

    if (status === "success") {
      console.log("✅ Payment verified and saved successfully");
      
      // Fetch updated user data
      const user = await User.findById(transactionData.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found after transaction"
        });
      }
      
      res.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          transactionId: result.transactionId,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          tokens: user?.token || 0,
          tokensAwarded: result.tokensAwarded || 0,
          membership: user?.membership || null,
          status: "success"
        }
      });
    } else {
      res.json({
        success: true,
        message: "Failed transaction saved",
        data: {
          transactionId: result.transactionId,
          status: "failed"
        }
      });
    }

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Internal function to save transaction
const saveTransactionInternal = async (transactionData) => {
  try {
    // Validate required fields
    const requiredFields = ['packageId', 'packageType', 'status', 'amount', 'userId'];
    const missingFields = requiredFields.filter(field => !transactionData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Parse and validate amounts
    const totalAmount = parseFloat(transactionData.amount);
    const baseAmount = parseFloat(transactionData.baseAmount) || 0;
    const discountAmount = parseFloat(transactionData.discountAmount) || 0;
    const gstAmount = parseFloat(transactionData.gstAmount) || 0;

    if (isNaN(totalAmount) || totalAmount < 0) {
      throw new Error('Invalid amount value');
    }

    // Get package details
    let packageDetails;
    let tokensToAward = 999999;
    let computedBaseAmount = 0;

    if (transactionData.packageType === "subscription") {
      const plan = SUBSCRIPTION_PLANS[transactionData.packageId];
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      const periodPlan = plan[transactionData.billingPeriod || 'monthly'];
      if (!periodPlan) {
        throw new Error('Invalid billing period');
      }

      packageDetails = {
        name: `${transactionData.packageId.charAt(0).toUpperCase() + transactionData.packageId.slice(1)} Plan`,
        basePrice: periodPlan.basePrice,
        durationDays: periodPlan.durationDays
      };
      computedBaseAmount = periodPlan.basePrice;

    } else if (transactionData.packageType === "token") {
      const tokenPackage = TOKEN_PACKAGES[transactionData.packageId];
      if (!tokenPackage) {
        throw new Error('Invalid token package');
      }

      packageDetails = {
        name: `${transactionData.packageId.charAt(0).toUpperCase() + transactionData.packageId.slice(1)} Tokens`,
        basePrice: tokenPackage.basePrice,
        tokens: tokenPackage.tokens
      };
      tokensToAward = tokenPackage.tokens;
      computedBaseAmount = tokenPackage.basePrice;
    } else {
      throw new Error('Invalid package type');
    }

    // Find user
    const user = await User.findById(transactionData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log("👤 User found:", {
      id: user._id,
      email: user.email,
      name: user.name,
      hasTransactionsField: user.transactions !== undefined
    });

    // Check for duplicate successful transactions
    if (transactionData.status === "success" && transactionData.razorpay_payment_id) {
      const existingTransaction = user.transactions.find(
        txn => txn.razorpay_payment_id === transactionData.razorpay_payment_id && txn.status === "success"
      );

      if (existingTransaction) {
        console.log(`⚠️ Payment ${transactionData.razorpay_payment_id} already processed`);
        return {
          success: false,
          message: "Payment already processed",
          transactionId: existingTransaction._id
        };
      }
    }

    // Build transaction record
    const transactionRecord = {
      paymentId: transactionData.razorpay_payment_id || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: transactionData.razorpay_order_id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      signature: transactionData.razorpay_signature || "",
      packageId: transactionData.packageId,
      packageName: transactionData.packageName || packageDetails.name,
      packageType: transactionData.packageType,
      billingPeriod: transactionData.packageType === "subscription" ? transactionData.billingPeriod : undefined,
      amount: totalAmount,
      baseAmount: baseAmount || computedBaseAmount,
      discountAmount: discountAmount,
      gstAmount: gstAmount,
      tokens: tokensToAward,
      status: transactionData.status,
      couponCode: transactionData.couponCode || null,
      razorpay_payment_id: transactionData.razorpay_payment_id,
      razorpay_order_id: transactionData.razorpay_order_id,
      razorpay_signature: transactionData.razorpay_signature,
      paymentMethod: transactionData.paymentMethod || "razorpay",
      error: transactionData.error || null,
      userEmail: transactionData.userEmail || user.email,
      userName: transactionData.userName || user.name,
      timestamp: new Date()
    };

    console.log("💾 Saving transaction record:", {
      paymentId: transactionRecord.paymentId,
      package: transactionRecord.packageName,
      amount: transactionRecord.amount,
      tokens: transactionRecord.tokens,
      status: transactionRecord.status
    });

    // Initialize transactions array if it doesn't exist
    if (!user.transactions) {
      user.transactions = [];
    }

    // Add transaction to user's history
    user.transactions.push(transactionRecord);

    // Process successful payments
    if (transactionData.status === "success") {
      if (transactionData.packageType === "token") {
        // Add tokens to user's balance
        user.token += tokensToAward;
        
        // Initialize tokenTransactions array if it doesn't exist
        if (!user.tokenTransactions) {
          user.tokenTransactions = [];
        }
        
        // Record token transaction
        user.tokenTransactions.push({
          name: `Token Purchase - ${transactionRecord.packageName}`,
          type: "token_purchase",
          tokensUsed: tokensToAward,
          status: "success",
          date: new Date()
        });
        
        console.log(`💰 Added ${tokensToAward} tokens to user ${user.email}. New balance: ${user.token}`);
      }

      if (transactionData.packageType === "subscription") {
        const now = new Date();
        const currentExpiry = user.membership?.isActive && user.membership?.expiresAt
          ? new Date(user.membership.expiresAt)
          : null;
        
        // If user has active membership, extend from current expiry, otherwise from now
        const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
        const durationMs = (packageDetails.durationDays || 30) * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(baseDate.getTime() + durationMs);

        user.membership = {
          isActive: true,
          planId: transactionData.packageId,
          planName: packageDetails.name,
          billingPeriod: transactionData.billingPeriod,
          startedAt: user.membership?.startedAt || now,
          expiresAt: expiresAt,
          lastPaymentId: transactionRecord.paymentId,
          autoRenew: user.membership?.autoRenew || false,
        };

        // Initialize tokenTransactions array if it doesn't exist
        if (!user.tokenTransactions) {
          user.tokenTransactions = [];
        }

        // Record membership transaction
        user.tokenTransactions.push({
          name: `Membership - ${packageDetails.name} (${transactionData.billingPeriod})`,
          type: "membership_purchase",
          tokensUsed: 0,
          status: "success",
          date: new Date()
        });

        console.log(`🪪 Membership updated for ${user.email} till ${expiresAt.toISOString()}`);
      }
    }



    user.tokens = 999999;
    // Save user
    await user.save();

    const savedTransaction = user.transactions[user.transactions.length - 1];
    
    console.log("✅ Transaction saved successfully:", {
      transactionId: savedTransaction._id,
      paymentId: savedTransaction.paymentId,
      tokensAwarded: tokensToAward,
      newTokenBalance: user.token
    });

    return {
      success: true,
      transactionId: savedTransaction._id,
      tokensAwarded: tokensToAward
    };

  } catch (error) {
    console.error("❌ Error saving transaction internally:", error);
    throw error;
  }
};

// Public endpoint to save transaction (for direct calls)
exports.saveTransaction = async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name
    };

    const result = await saveTransactionInternal(transactionData);

    if (result.success === false && result.message === "Payment already processed") {
      return res.status(409).json(result);
    }

    res.json({
      success: true,
      transactionId: result.transactionId,
      orderId: transactionData.razorpay_order_id || transactionData.orderId,
      message: `Transaction ${transactionData.status} saved successfully`,
      data: {
        transactionId: result.transactionId,
        tokensAwarded: result.tokensAwarded
      }
    });

  } catch (error) {
    console.error("❌ Error in saveTransaction endpoint:", error);
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
    const { limit = 50, page = 1, status, packageType, startDate, endDate } = req.query;

    const user = await User.findById(userId).select('transactions name email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Initialize transactions if not present
    let transactions = user.transactions || [];

    // Apply filters
    if (status) {
      transactions = transactions.filter(txn => txn.status === status);
    }
    if (packageType) {
      transactions = transactions.filter(txn => txn.packageType === packageType);
    }
    if (startDate) {
      const start = new Date(startDate);
      transactions = transactions.filter(txn => new Date(txn.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      transactions = transactions.filter(txn => new Date(txn.timestamp) <= end);
    }

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      transactions: paginatedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transactions.length,
        totalPages: Math.ceil(transactions.length / limit)
      },
      summary: {
        totalTransactions: transactions.length,
        successful: transactions.filter(t => t.status === 'success').length,
        failed: transactions.filter(t => t.status === 'failed').length
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

    const user = await User.findById(userId).select('token usedToken membership name email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const availableToken = Math.max(0, (user.token || 0) - (user.usedToken || 0));

    res.json({
      success: true,
      token: user.token || 0,
      usedToken: user.usedToken || 0,
      availableToken: availableToken,
      membership: user.membership || null,
      user: {
        name: user.name,
        email: user.email
      }
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

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { transactionId } = req.params;

    const user = await User.findById(userId).select('transactions');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const transactions = user.transactions || [];
    const transaction = transactions.find(t => t._id.toString() === transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.json({
      success: true,
      transaction: transaction
    });

  } catch (error) {
    console.error("❌ Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message
    });
  }
};

// Test endpoint to check user schema
exports.testUserSchema = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        hasTransactions: Array.isArray(user.transactions),
        transactionsCount: user.transactions ? user.transactions.length : 0,
        hasTokenTransactions: Array.isArray(user.tokenTransactions),
        tokenTransactionsCount: user.tokenTransactions ? user.tokenTransactions.length : 0,
        schemaFields: Object.keys(User.schema.paths)
      }
    });

  } catch (error) {
    console.error("❌ Error testing user schema:", error);
    res.status(500).json({
      success: false,
      message: "Error testing user schema",
      error: error.message
    });
  }
};