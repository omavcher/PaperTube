// services/imageGenerationService.js
// Production-Grade AI Image Generation via OpenRouter (Flux 2 Klein, Flux Schnell, Recraft)
// + Cloudflare R2 bucket storage with high-speed CDN delivery (cdn.pro.paperxify.com)

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;

// OpenRouter Image Models Priority List
const OPENROUTER_IMAGE_MODELS = [
  'black-forest-labs/flux.2-klein-4b',
  'black-forest-labs/flux-1-schnell',
  'recraft/recraft-v3',
  'stabilityai/stable-diffusion-3.5-large'
];

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
  power: 15,
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
    forcePathStyle: true,
  });
}

// ------------------------------------------------------------------
// Build a clean, high-yield educational image prompt from a topic title
// ------------------------------------------------------------------
function buildEducationalPrompt(title) {
  const styleModifiers = [
    'technical architecture diagram',
    'clean vector flowchart schematic',
    'minimalist scientific infographic',
    'white background',
    'crisp labeled component boxes and directional arrows',
    'academic textbook illustration',
    'no people',
    'no human portrait',
    'no stock photo',
    'no watermark',
    'high resolution'
  ].join(', ');

  return `Technical schematic diagram of ${title}, ${styleModifiers}`;
}

// ------------------------------------------------------------------
// Generate Image Buffer via OpenRouter /images API (Primary)
// ------------------------------------------------------------------
async function generateImageViaOpenRouter(prompt, timeoutMs = 60000) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  let lastError = null;

  for (const model of OPENROUTER_IMAGE_MODELS) {
    try {
      console.log(`🎨 OpenRouter calling image model: ${model}`);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch('https://openrouter.ai/api/v1/images', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://paperxify.com',
          'X-Title': 'Paperxify Study Engine',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errJson)}`);
      }

      const result = await response.json();
      const firstImage = result.data?.[0];

      if (!firstImage) {
        throw new Error('No image data returned from OpenRouter');
      }

      // If Base64 JSON returned
      if (firstImage.b64_json) {
        const buffer = Buffer.from(firstImage.b64_json, 'base64');
        console.log(`✅ Success generating image with ${model} (${buffer.length} bytes)`);
        return buffer;
      }

      // If URL returned
      if (firstImage.url) {
        console.log(`📥 Fetching generated image from OpenRouter URL: ${firstImage.url.slice(0, 60)}...`);
        const imgRes = await fetch(firstImage.url);
        if (!imgRes.ok) throw new Error(`Failed to fetch image URL: HTTP ${imgRes.status}`);
        const arrayBuf = await imgRes.arrayBuffer();
        return Buffer.from(arrayBuf);
      }

      throw new Error('Unrecognized image format from OpenRouter');
    } catch (err) {
      console.warn(`⚠️ OpenRouter model ${model} image generation failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All OpenRouter image models failed');
}

// ------------------------------------------------------------------
// Fallback: Generate via Fireworks SDXL if OpenRouter fails
// ------------------------------------------------------------------
async function generateImageViaFireworks(prompt, timeoutMs = 45000) {
  if (!FIREWORKS_API_KEY) {
    throw new Error('FIREWORKS_API_KEY not configured');
  }

  console.log('🔄 Fallback: Generating image via Fireworks SDXL');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetch(
    'https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0',
    {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'image/jpeg',
        Authorization: `Bearer ${FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        height: 1024,
        width: 1024,
        seed: Math.floor(Math.random() * 2147483647),
        cfg_scale: 7,
        steps: 25,
      }),
    }
  );

  clearTimeout(timer);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Fireworks error ${response.status}: ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ------------------------------------------------------------------
// Upload an Image Buffer to Cloudflare R2 and return the CDN URL
// ------------------------------------------------------------------
async function uploadToR2(imageBuffer, filename, contentType = 'image/png') {
  if (!R2_ACCESS_KEY || !R2_SECRET_KEY) {
    throw new Error('R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY environment variable is not set');
  }

  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: filename,
    Body: imageBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await client.send(command);

  // Return the high-speed CDN URL
  return `${R2_CDN_BASE}/${filename}`;
}

// ------------------------------------------------------------------
// Generate a unique filename for Cloudflare R2 bucket storage
// ------------------------------------------------------------------
function buildFilename(title, ext = 'png') {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
  const uniqueId = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  return `notes-images/${slug}-${timestamp}-${uniqueId}.${ext}`;
}

// ------------------------------------------------------------------
// Core: generate & upload ONE image for a topic title
// Returns { title, img_url } or { title, img_url: null } on failure
// ------------------------------------------------------------------
async function generateAndUploadImage(title) {
  try {
    console.log(`🎨 Generating AI diagram for: "${title}"`);

    const prompt = buildEducationalPrompt(title);
    let imageBuffer = null;

    // 1. Try OpenRouter First (Flux 2 Klein, Flux Schnell, Recraft)
    try {
      imageBuffer = await generateImageViaOpenRouter(prompt);
    } catch (openRouterErr) {
      console.warn('⚠️ OpenRouter image generation failed, trying Fireworks fallback...', openRouterErr.message);
      // 2. Try Fireworks SDXL Fallback
      if (FIREWORKS_API_KEY) {
        imageBuffer = await generateImageViaFireworks(prompt);
      } else {
        throw openRouterErr;
      }
    }

    if (!imageBuffer || imageBuffer.length < 1000) {
      throw new Error('Generated image buffer is empty or corrupt');
    }

    const filename = buildFilename(title, 'png');
    const cdnUrl = await uploadToR2(imageBuffer, filename, 'image/png');

    console.log(`✅ AI Image stored in Cloudflare R2: ${cdnUrl}`);
    return { title, img_url: cdnUrl };
  } catch (err) {
    console.error(`❌ Image generation/upload failed for "${title}": ${err.message}`);
    return { title, img_url: null };
  }
}

// ------------------------------------------------------------------
// Public API: generate images for a list of topic titles
//
//   figures  - string[] of topic / figure names (from AI analysis)
//   tier     - 'free' | 'premium' | 'power' (controls max image count)
//
// Returns array of { title, img_url } with verified CDN URLs
// ------------------------------------------------------------------
async function generateStudyImages(figures, tier = 'free') {
  if (!figures || figures.length === 0) return [];

  const maxImages = IMAGE_LIMITS[tier] || IMAGE_LIMITS.free;
  const limitedFigures = figures.slice(0, maxImages);

  console.log(
    `🖼️ Generating ${limitedFigures.length} AI image(s) [tier: ${tier}, limit: ${maxImages}]`
  );

  const results = [];
  for (const title of limitedFigures) {
    const result = await generateAndUploadImage(title);
    results.push(result);

    // Polite delay between generation requests
    if (limitedFigures.indexOf(title) < limitedFigures.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  // Filter out any failed uploads
  const valid = results.filter((r) => r.img_url !== null);
  console.log(`✅ ${valid.length}/${limitedFigures.length} images generated and uploaded to Cloudflare R2`);
  return valid;
}

module.exports = {
  generateStudyImages,
  generateAndUploadImage,
  buildEducationalPrompt,
  IMAGE_LIMITS,
};
