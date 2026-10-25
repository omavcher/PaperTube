const mongoose = require('mongoose');
const crypto = require('crypto');
const { faker } = require('@faker-js/faker');
const { google } = require("googleapis");
const User = require('../models/User');
const Note = require('../models/Note');
const Transaction = require('../models/Transaction');

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

// ── 40+ CURATED GLOBAL CITIES WITH ACCURATE COORDINATES ──────────────────────
const CURATED_CITIES = [
  // North America
  { city: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
  { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
  { city: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
  { city: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298 },
  { city: "Austin", country: "United States", lat: 30.2672, lng: -97.7431 },
  { city: "Seattle", country: "United States", lat: 47.6062, lng: -122.3321 },
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { city: "Montreal", country: "Canada", lat: 45.5017, lng: -73.5673 },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },

  // Europe
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
  { city: "Munich", country: "Germany", lat: 48.1351, lng: 11.5820 },
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { city: "Barcelona", country: "Spain", lat: 41.3879, lng: 2.1699 },
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { city: "Milan", country: "Italy", lat: 45.4642, lng: 9.1900 },
  { city: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417 },
  { city: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603 },
  { city: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { city: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { city: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122 },

  // Asia
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { city: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777 },
  { city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
  { city: "Delhi", country: "India", lat: 28.6139, lng: 77.2090 },
  { city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { city: "Hong Kong", country: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { city: "Taipei", country: "Taiwan", lat: 25.0330, lng: 121.5654 },
  { city: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },

  // Oceania
  { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { city: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631 },
  { city: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633 },

  // Latin America
  { city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { city: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729 },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { city: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693 },
  { city: "Bogota", country: "Colombia", lat: 4.7110, lng: -74.0721 },

  // Africa
  { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { city: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473 },
  { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { city: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
  { city: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 }
];

const PLAN_PRESETS = {
  scholar: { id: "scholar", name: "Scholar", monthlyUSD: 4.99, yearlyUSD: 49, tokens: 500, rank: "scholar" },
  pro:     { id: "pro",     name: "Pro Scholar", monthlyUSD: 9.99, yearlyUSD: 89, tokens: 1500, rank: "pro" },
  power:   { id: "power",   name: "Power Scholar", monthlyUSD: 19.99, yearlyUSD: 179, tokens: 4500, rank: "power" },
};

// ── 1. GET ALL FAKER USERS ──────────────────────────────────────────────────
exports.getFakeUsers = async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    let query = { isFake: true };
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), "i");
      query.$or = [{ name: reg }, { email: reg }, { username: reg }, { "location.city": reg }, { "location.country": reg }];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('name email username picture location country membership tokens xp rank streak createdAt transactions isFake')
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 2. CREATE A SINGLE DETAILED REALISTIC USER (ADMIN FILLED) ───────────────
exports.createDetailedUser = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      picture,
      location,
      membership,
      payment,
      tokens = 10,
      xp = 100,
      streak = 1,
      createdAt
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "User name is required." });
    }

    const cleanName = name.trim();
    const cleanUsername = (username && username.trim()) 
      ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + crypto.randomBytes(2).toString('hex');

    const cleanEmail = (email && email.trim()) 
      ? email.trim().toLowerCase() 
      : `${cleanUsername}@gmail.com`;

    // Check duplicate
    const existing = await User.findOne({ $or: [{ email: cleanEmail }, { username: cleanUsername }] });
    if (existing) {
      return res.status(400).json({ success: false, message: "A user with this email or username already exists." });
    }

    // Location coordinates with slight random jitter if coordinates provided
    let locCity = location?.city || "New York";
    let locCountry = location?.country || "United States";
    let locLat = location?.latitude !== undefined && location?.latitude !== null ? Number(location.latitude) : 40.7128;
    let locLng = location?.longitude !== undefined && location?.longitude !== null ? Number(location.longitude) : -74.0060;

    // Small jitter (+- 0.02 deg) so pins don't overlap perfectly
    const jitterLat = (Math.random() - 0.5) * 0.04;
    const jitterLng = (Math.random() - 0.5) * 0.04;
    locLat += jitterLat;
    locLng += jitterLng;

    const userCreatedAt = createdAt ? new Date(createdAt) : new Date();

    // Membership defaults
    const isPaid = Boolean(membership?.isActive);
    const planId = (membership?.planId || "pro").toLowerCase();
    const preset = PLAN_PRESETS[planId] || PLAN_PRESETS.pro;
    const planName = membership?.planName || preset.name;
    const billingPeriod = (membership?.billingPeriod || "monthly").toLowerCase();
    const durationDays = billingPeriod === "yearly" ? 365 : 30;
    const amount = Number(payment?.amount) > 0 
      ? Number(payment.amount) 
      : (billingPeriod === "yearly" ? preset.yearlyUSD : preset.monthlyUSD);

    const expiresAt = isPaid 
      ? new Date(userCreatedAt.getTime() + durationDays * 24 * 60 * 60 * 1000) 
      : null;

    const paymentId = payment?.paymentId || `PAYID-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const orderId = `ORD-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const paymentMethod = payment?.paymentMethod || "paypal";

    const userDoc = new User({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      isNewUser: false,
      isFake: true,
      picture: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      country: locCountry,
      location: {
        city: locCity,
        country: locCountry,
        latitude: locLat,
        longitude: locLng
      },
      xp: Number(xp) || 120,
      tokens: isPaid ? preset.tokens : Number(tokens) || 10,
      rank: isPaid ? preset.rank : "basic",
      streak: {
        count: Number(streak) || 1,
        lastVisit: userCreatedAt
      },
      joinedAt: userCreatedAt,
      createdAt: userCreatedAt,
      membership: {
        isActive: isPaid,
        planId: isPaid ? planId : null,
        planName: isPaid ? planName : null,
        billingPeriod: isPaid ? billingPeriod : undefined,
        startedAt: isPaid ? userCreatedAt : null,
        expiresAt: isPaid ? expiresAt : null,
        lastPaymentId: isPaid ? paymentId : null,
        autoRenew: false
      },
      transactions: []
    });

    await userDoc.save();

    // Create real Transaction document if paid or requested
    let createdTransaction = null;
    if (isPaid || payment?.createTransaction) {
      createdTransaction = await Transaction.create({
        userId: userDoc._id,
        paymentId: paymentId,
        orderId: orderId,
        paypalOrderId: paymentMethod === "paypal" ? paymentId : null,
        lemonSqueezyOrderId: paymentMethod === "lemonsqueezy" ? paymentId : null,
        packageId: planId,
        packageName: `${planName} (${billingPeriod})`,
        packageType: "subscription",
        billingPeriod: billingPeriod,
        amount: amount,
        baseAmount: amount,
        discountAmount: 0,
        gstAmount: 0,
        status: payment?.status || "success",
        paymentMethod: paymentMethod,
        userEmail: cleanEmail,
        userName: cleanName,
        timestamp: userCreatedAt
      });

      // Embed in user document
      userDoc.transactions.push({
        paymentId,
        orderId,
        packageId: planId,
        packageName: `${planName} (${billingPeriod})`,
        packageType: "subscription",
        billingPeriod,
        amount,
        status: payment?.status || "success",
        paymentMethod,
        userEmail: cleanEmail,
        userName: cleanName,
        timestamp: userCreatedAt
      });
      await userDoc.save({ validateModifiedOnly: true });
    }

    res.status(201).json({
      success: true,
      message: `User ${cleanName} created with ${isPaid ? `active ${planName} subscription ($${amount})` : 'free tier'} and geo-location (${locCity}, ${locCountry})!`,
      data: {
        user: userDoc,
        transaction: createdTransaction
      }
    });

  } catch (error) {
    console.error("❌ Create Detailed User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 3. BATCH GENERATE REALISTIC USERS & TRANSACTIONS ─────────────────────────
exports.batchGenerateUsers = async (req, res) => {
  try {
    const {
      count = 10,
      paidRatio = 0.4, // 40% paid users
      spreadDays = 7,  // Spread signups across last 7 days
    } = req.body;

    const totalToCreate = Math.min(Math.max(parseInt(count) || 10, 1), 100);
    const ratio = Math.min(Math.max(parseFloat(paidRatio) || 0, 0), 1);
    const days = Math.min(Math.max(parseInt(spreadDays) || 7, 1), 30);

    const createdUsers = [];
    const createdTransactions = [];
    const now = Date.now();

    const planKeys = ["scholar", "pro", "power"];
    const paymentMethods = ["paypal", "lemonsqueezy", "razorpay"];

    for (let i = 0; i < totalToCreate; i++) {
      // Pick random location from curated cities
      const locPreset = CURATED_CITIES[Math.floor(Math.random() * CURATED_CITIES.length)];
      const jitterLat = (Math.random() - 0.5) * 0.08;
      const jitterLng = (Math.random() - 0.5) * 0.08;

      // Realistic identity
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const randomSuffix = crypto.randomBytes(2).toString('hex');
      const username = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '') + randomSuffix;
      
      const emailDomains = ["gmail.com", "outlook.com", "yahoo.com", "proton.me", "icloud.com"];
      const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
      const email = `${username}@${domain}`;

      // Distribute creation time across spreadDays
      const dayOffset = Math.random() * days * 24 * 60 * 60 * 1000;
      const userDate = new Date(now - dayOffset);

      // Determine paid status
      const isPaid = Math.random() < ratio;
      const planKey = planKeys[Math.floor(Math.random() * planKeys.length)];
      const preset = PLAN_PRESETS[planKey];
      const isYearly = Math.random() < 0.25; // 25% yearly
      const billingPeriod = isYearly ? "yearly" : "monthly";
      const amount = isYearly ? preset.yearlyUSD : preset.monthlyUSD;
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentId = `PAYID-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      const orderId = `ORD-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
      const expiresAt = isPaid 
        ? new Date(userDate.getTime() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000) 
        : null;

      const user = new User({
        name: fullName,
        username,
        email,
        isNewUser: false,
        isFake: true,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        country: locPreset.country,
        location: {
          city: locPreset.city,
          country: locPreset.country,
          latitude: locPreset.lat + jitterLat,
          longitude: locPreset.lng + jitterLng,
        },
        xp: Math.floor(Math.random() * 400) + 50,
        streak: {
          count: Math.floor(Math.random() * 14) + 1,
          lastVisit: userDate
        },
        tokens: isPaid ? preset.tokens : 10,
        rank: isPaid ? preset.rank : "basic",
        joinedAt: userDate,
        createdAt: userDate,
        membership: {
          isActive: isPaid,
          planId: isPaid ? planKey : null,
          planName: isPaid ? preset.name : null,
          billingPeriod: isPaid ? billingPeriod : undefined,
          startedAt: isPaid ? userDate : null,
          expiresAt,
          lastPaymentId: isPaid ? paymentId : null,
          autoRenew: false
        },
        transactions: []
      });

      await user.save();
      createdUsers.push(user);

      // Create transaction if paid
      if (isPaid) {
        const tx = await Transaction.create({
          userId: user._id,
          paymentId,
          orderId,
          paypalOrderId: paymentMethod === "paypal" ? paymentId : null,
          lemonSqueezyOrderId: paymentMethod === "lemonsqueezy" ? paymentId : null,
          packageId: planKey,
          packageName: `${preset.name} (${billingPeriod})`,
          packageType: "subscription",
          billingPeriod,
          amount,
          baseAmount: amount,
          status: "success",
          paymentMethod,
          userEmail: email,
          userName: fullName,
          timestamp: userDate
        });

        user.transactions.push({
          paymentId,
          orderId,
          packageId: planKey,
          packageName: `${preset.name} (${billingPeriod})`,
          packageType: "subscription",
          billingPeriod,
          amount,
          status: "success",
          paymentMethod,
          userEmail: email,
          userName: fullName,
          timestamp: userDate
        });
        await user.save({ validateModifiedOnly: true });
        createdTransactions.push(tx);
      }
    }

    const totalRev = createdTransactions.reduce((acc, t) => acc + t.amount, 0);

    res.status(201).json({
      success: true,
      message: `Batch generated ${createdUsers.length} realistic users (${createdTransactions.length} paid subscribers, $${totalRev.toFixed(2)} revenue) with global locations!`,
      data: {
        usersCount: createdUsers.length,
        paidCount: createdTransactions.length,
        totalRevenue: Math.round(totalRev),
      }
    });

  } catch (error) {
    console.error("❌ Batch Generate Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 4. ALLOCATE SUBSCRIPTION TO EXISTING USER ───────────────────────────────
exports.allocateSubscription = async (req, res) => {
  try {
    const {
      userId,
      planId = "pro",
      billingPeriod = "monthly",
      isActive = true,
      createTransaction = true,
      amount,
      paymentMethod = "paypal"
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const normPlan = (planId || "pro").toLowerCase();
    const preset = PLAN_PRESETS[normPlan] || PLAN_PRESETS.pro;
    const normBilling = (billingPeriod || "monthly").toLowerCase();
    const isYearly = normBilling === "yearly";
    const durationDays = isYearly ? 365 : 30;
    const price = Number(amount) > 0 ? Number(amount) : (isYearly ? preset.yearlyUSD : preset.monthlyUSD);
    const now = new Date();
    const expiresAt = isActive ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000) : null;
    const paymentId = `PAYID-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const orderId = `ORD-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

    user.membership = {
      isActive: Boolean(isActive),
      planId: isActive ? normPlan : null,
      planName: isActive ? preset.name : null,
      billingPeriod: isActive ? normBilling : undefined,
      startedAt: isActive ? now : null,
      expiresAt: isActive ? expiresAt : null,
      lastPaymentId: isActive ? paymentId : null,
      autoRenew: false
    };

    if (isActive) {
      user.tokens = preset.tokens;
      user.rank = preset.rank;
      user.aiCapacity = {
        usedUnits: 0,
        allocatedUnits: preset.tokens,
        hardCostUSD: 0,
        imagesGenerated: 0,
        lastReset: now
      };
    }

    if (isActive && createTransaction) {
      await Transaction.create({
        userId: user._id,
        paymentId,
        orderId,
        paypalOrderId: paymentMethod === "paypal" ? paymentId : null,
        lemonSqueezyOrderId: paymentMethod === "lemonsqueezy" ? paymentId : null,
        packageId: normPlan,
        packageName: `${preset.name} (${normBilling})`,
        packageType: "subscription",
        billingPeriod: normBilling,
        amount: price,
        baseAmount: price,
        status: "success",
        paymentMethod,
        userEmail: user.email,
        userName: user.name,
        timestamp: now
      });

      if (!user.transactions) user.transactions = [];
      user.transactions.push({
        paymentId,
        orderId,
        packageId: normPlan,
        packageName: `${preset.name} (${normBilling})`,
        packageType: "subscription",
        billingPeriod: normBilling,
        amount: price,
        status: "success",
        paymentMethod,
        userEmail: user.email,
        userName: user.name,
        timestamp: now
      });
    }

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `Updated subscription for ${user.name}: ${isActive ? `${preset.name} (${normBilling}) active` : 'Free Tier'}`,
      data: user
    });

  } catch (error) {
    console.error("❌ Allocate Subscription Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 5. INJECT STANDALONE PAYMENT TRANSACTION ─────────────────────────────────
exports.injectTransaction = async (req, res) => {
  try {
    const {
      userId,
      amount,
      packageName,
      packageId = "pro",
      billingPeriod = "monthly",
      paymentMethod = "paypal",
      status = "success",
      timestamp
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const paymentId = `PAYID-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const orderId = `ORD-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const txDate = timestamp ? new Date(timestamp) : new Date();

    const tx = await Transaction.create({
      userId: user._id,
      paymentId,
      orderId,
      packageId,
      packageName: packageName || `Package (${packageId})`,
      packageType: "subscription",
      billingPeriod,
      amount: Number(amount) || 9.99,
      baseAmount: Number(amount) || 9.99,
      status,
      paymentMethod,
      userEmail: user.email,
      userName: user.name,
      timestamp: txDate
    });

    if (!user.transactions) user.transactions = [];
    user.transactions.push({
      paymentId,
      orderId,
      packageId,
      packageName: packageName || `Package (${packageId})`,
      packageType: "subscription",
      billingPeriod,
      amount: Number(amount) || 9.99,
      status,
      paymentMethod,
      userEmail: user.email,
      userName: user.name,
      timestamp: txDate
    });
    await user.save({ validateModifiedOnly: true });

    res.status(201).json({
      success: true,
      message: `Injected transaction of $${amount} for ${user.name}`,
      data: tx
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 6. DELETE SINGLE FAKE USER ───────────────────────────────────────────────
exports.deleteFakeUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Clean up their transactions and notes
    await Transaction.deleteMany({ userId: user._id });
    await Note.deleteMany({ owner: user._id });
    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      message: `Deleted faker user "${user.name}" and removed associated transactions.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 7. PURGE ALL FAKE USERS & THEIR TRANSACTIONS ────────────────────────────
exports.purgeAllFakeUsers = async (req, res) => {
  try {
    const fakeUsers = await User.find({ isFake: true }).select('_id');
    const fakeIds = fakeUsers.map(u => u._id);

    if (fakeIds.length === 0) {
      return res.status(200).json({ success: true, message: "No faker accounts found to purge." });
    }

    await Transaction.deleteMany({ userId: { $in: fakeIds } });
    await Note.deleteMany({ owner: { $in: fakeIds } });
    const deleteResult = await User.deleteMany({ _id: { $in: fakeIds } });

    res.status(200).json({
      success: true,
      message: `Successfully purged ${deleteResult.deletedCount} faker accounts and all associated transactions.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── LEGACY HELPERS (NAMES BATCH, STATS, FOLLOWERS, NOTE INJECTION) ───────────
exports.createFakeUsers = async (req, res) => {
  try {
    const { names } = req.body; 
    let count = 0;

    if (names && Array.isArray(names)) {
      for (const name of names) {
        const randomSuffix = crypto.randomBytes(3).toString('hex');
        const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') + randomSuffix;
        const email = username + '@fakemail.com';
        const loc = CURATED_CITIES[Math.floor(Math.random() * CURATED_CITIES.length)];
        const noiseLat = (Math.random() - 0.5) * 0.05;
        const noiseLon = (Math.random() - 0.5) * 0.05;

        const user = new User({
          name,
          username,
          email,
          isNewUser: false,
          isFake: true,
          picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          country: loc.country,
          location: {
            city: loc.city,
            country: loc.country,
            latitude: loc.lat + noiseLat,
            longitude: loc.lng + noiseLon
          }
        });
        await user.save();
        count++;
      }
    }

    res.status(200).json({ success: true, count, message: `Created ${count} fake users` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStats = async (req, res) => {
  try {
    const { userId, xp, streakCount, rank, location } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (xp !== undefined) user.xp = Number(xp);
    if (rank !== undefined) user.rank = rank;
    if (streakCount !== undefined) {
      if (!user.streak) user.streak = {};
      user.streak.count = Number(streakCount);
    }
    if (location) {
      if (!user.location) user.location = {};
      if (location.city) user.location.city = location.city;
      if (location.country) {
        user.location.country = location.country;
        user.country = location.country;
      }
      if (location.latitude !== undefined) user.location.latitude = Number(location.latitude);
      if (location.longitude !== undefined) user.location.longitude = Number(location.longitude);
    }

    await user.save();
    res.status(200).json({ success: true, data: user, message: "User stats and location updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addFollowers = async (req, res) => {
  try {
    const { targetUserId, count } = req.body;
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ success: false, message: "Target user not found" });

    const fakeUsers = await User.find({ 
      isFake: true, 
      _id: { $ne: targetUserId, $nin: targetUser.followerUsers } 
    }).limit(parseInt(count) || 5);

    if (fakeUsers.length === 0) {
      return res.status(400).json({ success: false, message: "No available fake users to follow." });
    }

    for (const fUser of fakeUsers) {
      targetUser.followerUsers.push(fUser._id);
      fUser.followingUsers.push(targetUser._id);
      await fUser.save();
    }

    await targetUser.save();
    res.status(200).json({ success: true, message: `Added ${fakeUsers.length} followers.` });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.injectNote = async (req, res) => {
  try {
    const { userId, data } = req.body;
    const { videoUrl, title, type, detailLevel, content } = data;

    const videoId = extractVideoId(videoUrl);
    if (!videoId) return res.status(400).json({ success: false, message: "Invalid YouTube URL" });

    let thumbnail = "";
    try {
      const ytRes = await youtube.videos.list({
        part: "snippet",
        id: videoId,
      });
      if (ytRes.data.items && ytRes.data.items.length > 0) {
        thumbnail = ytRes.data.items[0].snippet.thumbnails.high.url;
      }
    } catch(e) { console.error("YT Fetch error", e); }

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const slug = (title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + randomSuffix;

    const user = await User.findById(userId);

    const newNote = new Note({
      owner: userId,
      videoUrl,
      videoId,
      title,
      slug,
      thumbnail,
      transcript: "MANUAL INJECTION NO TRANSCRIPT",
      content: content,
      status: 'completed',
      visibility: 'public',
      generationDetails: {
        model: 'flash',
        type: type,
        detailLevel: detailLevel,
        language: 'English',
        generatedAt: new Date()
      }
    });

    await newNote.save();
    
    if (user) {
      user.notes.push({ noteId: newNote._id });
      await user.save();
    }

    res.status(200).json({ success: true, message: "Note injected successfully", data: newNote });
  } catch(e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getPrompt = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
    
    const ytRes = await youtube.videos.list({
      part: "snippet",
      id: videoId,
    });
    const title = ytRes.data.items?.[0]?.snippet?.title || "Video";
    
    const promptString = `I want to generate a very detailed, highly formatted educational note (like a textbook chapter) for a YouTube video.
Video Title: ${title}
Video Link: ${videoUrl}

Please output ONLY HTML content using semantic tags (<h1>, <h2>, <p>, <ul>, <li>, <strong>, etc.) with beautiful inline styles. Ensure it covers all topics in depth. Do not include \`\`\`html tags, just raw HTML string.`;
    
    res.status(200).json({ success: true, prompt: promptString, title });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    const searchRegex = new RegExp(query, 'i');
    const notes = await Note.find({
      $or: [
        { title: searchRegex },
        { slug: searchRegex }
      ]
    }).select('_id title slug').limit(10);
    
    res.status(200).json({ success: true, data: notes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
