// services/imageGenerationService.js
// AI Image Generation via Fireworks AI (Stable Diffusion XL 1024)
// + Cloudflare R2 storage with CDN delivery

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const FIREWORKS_MODEL_URL =
  'https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0';

const R2_ACCOUNT_ID = '1907350c4f2e8f5824e0cb40b15a6492';
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'paperxify';
const R2_CDN_BASE = 'https://cdn.pro.paperxify.com';

const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;

// Image limits per tier
const IMAGE_LIMITS = {
  free: 2,
  premium: 6,
};

// ------------------------------------------------------------------
// R2 S3 Client
// ------------------------------------------------------------------
function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY,
    },
    // R2 is path-style
    forcePathStyle: true,
  });
}

// ------------------------------------------------------------------
// Build a detailed, optimised educational image prompt from a topic title
// ------------------------------------------------------------------
function buildEducationalPrompt(title) {
  // Base quality & style modifiers that produce clean, study-friendly visuals
  const styleModifiers = [
    'educational illustration',
    'clean and professional',
    'detailed infographic style',
    'flat design with soft shadows',
    'vibrant but academic color palette',
    'suitable for textbook or study guide',
    'high resolution',
    '4k',
    'sharp focus',
    'no text',
    'no watermark',
  ].join(', ');

  // Negative concepts to steer away from
  // (Fireworks SDXL doesn't support a separate negative_prompt via the REST endpoint
  //  so we embed avoidance keywords in the positive prompt itself)
  const avoidance = 'avoid: blurry, low quality, cluttered, cartoon, anime, dark, scary';

  return `${title}, ${styleModifiers}, ${avoidance}`;
}

// ------------------------------------------------------------------
// Generate a single image via Fireworks AI and return raw Buffer
// ------------------------------------------------------------------
async function generateImageBuffer(prompt, timeoutMs = 60000) {
  if (!FIREWORKS_API_KEY) {
    throw new Error('FIREWORKS_API_KEY environment variable is not set');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(FIREWORKS_MODEL_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'image/jpeg',
        Authorization: `Bearer ${FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        height: 1024,
        width: 1024,
        seed: Math.floor(Math.random() * 2147483647), // random seed each time
        cfg_scale: 7,   // classifier-free guidance – higher = closer to prompt
        steps: 30,      // enough for good quality without being too slow
        safety_check: false,
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Fireworks API error ${response.status}: ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ------------------------------------------------------------------
// Upload a JPEG Buffer to Cloudflare R2 and return the CDN URL
// ------------------------------------------------------------------
async function uploadToR2(imageBuffer, filename) {
  if (!R2_ACCESS_KEY || !R2_SECRET_KEY) {
    throw new Error('R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY environment variable is not set');
  }

  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: filename,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
    // Public-read so the CDN can serve it
    ACL: 'public-read',
  });

  await client.send(command);

  // Return the CDN URL (custom domain configured on R2 bucket)
  return `${R2_CDN_BASE}/${filename}`;
}

// ------------------------------------------------------------------
// Generate a unique filename for the image
// ------------------------------------------------------------------
function buildFilename(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
  const uniqueId = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  return `notes-images/${slug}-${timestamp}-${uniqueId}.jpg`;
}

// ------------------------------------------------------------------
// Core: generate & upload ONE image for a topic title
// Returns { title, img_url } or { title, img_url: null } on failure
// ------------------------------------------------------------------
async function generateAndUploadImage(title) {
  try {
    console.log(`🎨 Generating AI image for: "${title}"`);

    const prompt = buildEducationalPrompt(title);
    const imageBuffer = await generateImageBuffer(prompt);

    const filename = buildFilename(title);
    const cdnUrl = await uploadToR2(imageBuffer, filename);

    console.log(`✅ Image uploaded: ${cdnUrl}`);
    return { title, img_url: cdnUrl };
  } catch (err) {
    console.error(`❌ Image generation/upload failed for "${title}": ${err.message}`);
    return { title, img_url: null };
  }
}

// ------------------------------------------------------------------
// Public API: generate images for a list of topic titles
//
//   tier     - 'free' | 'premium'  (controls max image count)
//   figures  - string[] of topic / figure names (from AI analysis)
//
// Returns array of { title, img_url } with null img_url on failure
// ------------------------------------------------------------------
async function generateStudyImages(figures, tier = 'free') {
  if (!figures || figures.length === 0) return [];

  const maxImages = tier === 'premium' ? IMAGE_LIMITS.premium : IMAGE_LIMITS.free;
  const limitedFigures = figures.slice(0, maxImages);

  console.log(
    `🖼️  Generating ${limitedFigures.length} AI image(s) [tier: ${tier}, limit: ${maxImages}]`
  );

  // Generate images sequentially to avoid hammering the API
  const results = [];
  for (const title of limitedFigures) {
    const result = await generateAndUploadImage(title);
    results.push(result);

    // Small pause between requests to be polite to the API
    if (limitedFigures.indexOf(title) < limitedFigures.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Return only successfully generated images
  const valid = results.filter((r) => r.img_url !== null);
  console.log(`✅ ${valid.length}/${limitedFigures.length} images generated successfully`);
  return valid;
}

module.exports = {
  generateStudyImages,
  generateAndUploadImage,
  buildEducationalPrompt,
  IMAGE_LIMITS,
};
