// controllers/paymentController.js
const User = require("../models/User");
const { getSubscriptionPlan, getTokenPackage } = require("../config/packages");

// Enhanced transaction validation
const validateTransactionData = (data) => {
  const requiredFields = ['packageId', 'packageType', 'status', 'amount'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount < 0) {
    throw new Error('Invalid amount value');
  }

  if (!['subscription', 'token'].includes(data.packageType)) {
    throw new Error('Invalid packageType. Must be "subscription" or "token"');
  }

  if (data.packageType === 'subscription' && !data.billingPeriod) {
    throw new Error('Billing period is required for subscription packages');
  }

  return true;
};

// Enhanced user lookup
const findUser = async (identifier) => {
  if (!identifier) return null;

  // Try different lookup methods
  const lookupMethods = [
    // By MongoDB ObjectId
    () => /^[0-9a-fA-F]{24}$/.test(identifier) ? User.findById(identifier) : null,
    // By email
    () => User.findOne({ email: identifier.toLowerCase() }),
    // By payment user ID
    () => User.findOne({ _id: identifier }),
  ];

  for (const method of lookupMethods) {
    try {
      const user = await method();
      if (user) return user;
    } catch (error) {
      continue;
    }
  }
  return null;
};

// Save transaction to database
exports.saveTransaction = async (req, res) => {
  try {
    const transactionData = {
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_signature: req.body.razorpay_signature,
      packageId: req.body.packageId,
      packageType: req.body.packageType,
      billingPeriod: req.body.billingPeriod,
      amount: req.body.amount,
      baseAmount: req.body.baseAmount,
      discountAmount: req.body.discountAmount || 0,
      gstAmount: req.body.gstAmount || 0,
      status: req.body.status,
      couponCode: req.body.couponCode,
      userId: req.body.userId,
      userEmail: req.body.userEmail,
      userName: req.body.userName,
      packageName: req.body.packageName,
      error: req.body.error,
      paymentMethod: req.body.paymentMethod || 'razorpay'
    };

    console.log("📦 Received transaction data:", {
      razorpay_payment_id: transactionData.razorpay_payment_id,
      packageId: transactionData.packageId,
      packageType: transactionData.packageType,
      amount: transactionData.amount,
      billingPeriod: transactionData.billingPeriod,
      status: transactionData.status,
    });

    // Validate transaction data
    validateTransactionData(transactionData);

    const totalAmount = parseFloat(transactionData.amount);
    let packageDetails;
    let tokensToAward = 0;
    let computedBaseAmount;

    // Get package details based on type
    if (transactionData.packageType === "subscription") {
      packageDetails = getSubscriptionPlan(transactionData.packageId, transactionData.billingPeriod);
      if (!packageDetails) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription plan or billing period",
        });
      }
      computedBaseAmount = packageDetails.basePrice;
    } else if (transactionData.packageType === "token") {
      packageDetails = getTokenPackage(transactionData.packageId);
      if (!packageDetails) {
        return res.status(400).json({
          success: false,
          message: "Invalid token package",
        });
      }
      tokensToAward = packageDetails.tokens;
      computedBaseAmount = packageDetails.basePrice;
    }

    // Find user using multiple methods
    let user = null;
    
    // Method 1: From authenticated request
    if (req.user?._id) {
      user = await User.findById(req.user._id);
    }
    
    // Method 2: From provided user identifier
    if (!user && transactionData.userId) {
      user = await findUser(transactionData.userId);
    }
    
    // Method 3: From user email
    if (!user && transactionData.userEmail) {
      user = await User.findOne({ email: transactionData.userEmail.toLowerCase() });
    }

    if (!user) {
      console.error("❌ User not found for transaction");
      return res.status(404).json({
        success: false,
        message: "User not found. Please provide valid user identifier",
        providedData: {
          userId: transactionData.userId,
          userEmail: transactionData.userEmail,
          authenticatedUser: req.user?._id
        }
      });
    }

    console.log("✅ User found:", { id: user._id, email: user.email, name: user.name });

    // Generate order ID if not provided
    const generateOrderId = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      return `order_${timestamp}_${random}`.toUpperCase();
    };

    const finalOrderId = transactionData.razorpay_order_id || generateOrderId();
    
    // Parse amounts with validation
    const parsedBaseAmount = transactionData.baseAmount !== undefined && 
                            transactionData.baseAmount !== null && 
                            !isNaN(parseFloat(transactionData.baseAmount))
      ? parseFloat(transactionData.baseAmount)
      : computedBaseAmount;

    const parsedDiscount = !isNaN(parseFloat(transactionData.discountAmount)) 
      ? parseFloat(transactionData.discountAmount) 
      : 0;

    const parsedGst = !isNaN(parseFloat(transactionData.gstAmount)) 
      ? parseFloat(transactionData.gstAmount) 
      : 0;

    const sanitizedPaymentId = transactionData.razorpay_payment_id || 
                              `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build comprehensive transaction data
    const transactionRecord = {
      paymentId: sanitizedPaymentId,
      orderId: finalOrderId,
      signature: transactionData.razorpay_signature || "",
      packageId: transactionData.packageId,
      packageName: transactionData.packageName || packageDetails?.name || `Package ${transactionData.packageId}`,
      packageType: transactionData.packageType,
      billingPeriod: transactionData.packageType === "subscription" ? transactionData.billingPeriod : undefined,
      amount: totalAmount,
      baseAmount: parsedBaseAmount,
      discountAmount: parsedDiscount,
      gstAmount: parsedGst,
      tokens: tokensToAward,
      status: transactionData.status,
      couponCode: transactionData.couponCode || null,
      packageMeta: {
        serverComputed: {
          baseAmount: computedBaseAmount,
          tokens: tokensToAward,
          planDurationDays: transactionData.packageType === "subscription" ? packageDetails?.durationDays : undefined,
          packageDetails: packageDetails || null
        },
        clientReported: {
          baseAmount: transactionData.baseAmount,
          discountAmount: transactionData.discountAmount,
          gstAmount: transactionData.gstAmount,
        },
        validation: {
          amountsMatch: Math.abs(parsedBaseAmount - computedBaseAmount) < 0.01,
          totalAmountValid: Math.abs(totalAmount - (parsedBaseAmount - parsedDiscount + parsedGst)) < 0.01
        }
      },
      razorpay_payment_id: transactionData.razorpay_payment_id,
      razorpay_order_id: transactionData.razorpay_order_id,
      razorpay_signature: transactionData.razorpay_signature,
      paymentMethod: transactionData.paymentMethod,
      error: transactionData.error || null,
      userEmail: transactionData.userEmail || user.email,
      userName: transactionData.userName || user.name,
      timestamp: new Date(),
    };

    console.log("💾 Saving transaction:", {
      paymentId: transactionRecord.paymentId,
      orderId: transactionRecord.orderId,
      package: transactionRecord.packageName,
      amount: transactionRecord.amount,
      tokens: transactionRecord.tokens,
      status: transactionRecord.status
    });

    // Check for duplicate successful transactions
    let existingSuccessfulTransaction = null;
    if (transactionData.razorpay_payment_id) {
      existingSuccessfulTransaction = user.transactions.find(
        (txn) => txn.paymentId === transactionData.razorpay_payment_id && txn.status === "success"
      );
    }

    if (transactionData.status === "success" && existingSuccessfulTransaction) {
      console.log(`⚠️ Payment ${transactionData.razorpay_payment_id} was already processed successfully`);
      return res.status(409).json({
        success: false,
        message: "This payment was already processed successfully",
        transactionId: existingSuccessfulTransaction._id
      });
    }

    // Add transaction to user's history
    user.transactions.push(transactionRecord);

    // Process successful payments
    if (transactionData.status === "success") {
      if (transactionData.packageType === "token") {
        // Add tokens to user's balance
        user.token += tokensToAward;
        
        // Record token transaction
        user.tokenTransactions.push({
          name: `Token Purchase - ${transactionRecord.packageName}`,
          type: "token_purchase",
          tokensUsed: tokensToAward,
          status: "success"
        });
        
        console.log(`💰 Added ${tokensToAward} tokens to user. New balance: ${user.token}`);
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
          planId: packageDetails.planId,
          planName: packageDetails.name,
          billingPeriod: transactionData.billingPeriod,
          startedAt: user.membership?.startedAt || now,
          expiresAt,
          lastPaymentId: sanitizedPaymentId,
          autoRenew: user.membership?.autoRenew || false,
        };

        // Record membership transaction
        user.tokenTransactions.push({
          name: `Membership - ${packageDetails.name} (${transactionData.billingPeriod})`,
          type: "membership_purchase",
          tokensUsed: 0,
          status: "success"
        });

        console.log(`🪪 Membership updated till ${expiresAt.toISOString()}`);
      }
    }

    // Save user with transaction
    await user.save();

    const savedTransaction = user.transactions[user.transactions.length - 1];
    
    console.log("✅ Transaction saved successfully:", {
      transactionId: savedTransaction._id,
      paymentId: savedTransaction.paymentId,
      tokensAwarded: tokensToAward,
      newTokenBalance: user.token,
      membershipActive: user.membership?.isActive || false
    });

    res.json({
      success: true,
      transactionId: savedTransaction._id,
      orderId: finalOrderId,
      message: `Transaction ${transactionData.status} saved successfully`,
      data: {
        transactionId: savedTransaction._id,
        orderId: finalOrderId,
        paymentId: sanitizedPaymentId,
        tokens: user.token,
        tokensAwarded: tokensToAward,
        membership: user.membership,
        status: transactionData.status,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      },
    });
  } catch (error) {
    console.error("❌ Error saving transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save transaction",
      error: error.message,
      details: error.stack
    });
  }
};

// Get user's transaction history with enhanced filtering
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

    let transactions = user.transactions;

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
        totalTransactions: user.transactions.length,
        successful: user.transactions.filter(t => t.status === 'success').length,
        failed: user.transactions.filter(t => t.status === 'failed').length
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

// Get user token balance with enhanced info
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

    const availableToken = Math.max(0, user.token - user.usedToken);

    res.json({
      success: true,
      token: user.token,
      usedToken: user.usedToken,
      availableToken: availableToken,
      membership: user.membership,
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

    const transaction = user.transactions.id(transactionId);
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