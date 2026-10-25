const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const capacityService = require("./capacityService");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// Fallback models for prompt enhancement
const ENHANCE_MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free"
];

/**
 * Visual Style Modifiers mapped to artistic lighting and camera directions
 */
const STYLE_PROFILES = {
  photorealistic: "Award-winning editorial photograph, 8k resolution, shot on Hasselblad H6D-100c, 85mm f/1.4 lens, natural dramatic lighting, photorealistic textures, micro-details, octane render look",
  cinematic: "Cinematic movie still, 35mm anamorphic lens, Panavision, cinematic volumetric atmospheric lighting, warm rim lights, depth of field, 4k Arri Alexa color grade",
  anime: "High-end anime key visual, Makoto Shinkai aesthetic, vibrant colors, clean lineart, volumetric atmospheric rays, beautiful detailed background, 4k digital anime art",
  digital_art: "Intricate concept art, trending on ArtStation, trending on Behance, sharp focus, dynamic composition, hyper-detailed digital painting, saturated complementary colors",
  "3d_render": "High-fidelity 3D render, Unreal Engine 5, Octane Render, ray tracing, subsurface scattering, ambient occlusion, polished materials, 8k",
  cyberpunk: "Futuristic cyberpunk aesthetic, neon cyan and magenta illumination, reflections on wet pavement, volumetric fog, futuristic urban architecture, high-tech dystopian details",
  watercolor: "Expressive traditional watercolor illustration, wet-on-dry technique, soft watercolor bleeds, delicate ink lines, textured paper grain, artistic masterpiece"
};

/**
 * Create professional Paperxify watermark SVG matching the official logo:
 * "PAPER" (crisp bold italic white) + "XIFY" (bold italic crimson #EF4444)
 * with a subtle dark frosted pill capsule for universal legibility on any image
 */
function createWatermarkSvg(imageWidth, imageHeight) {
  const baseDim = Math.min(imageWidth, imageHeight);
  const scale = Math.max(1, baseDim / 1024);

  const logoWidth = Math.round(175 * scale);
  const logoHeight = Math.round(44 * scale);
  const fontSize = Math.round(23 * scale);
  const textY = Math.round(30 * scale);
  const rx = Math.round(12 * scale);
  const strokeW = Math.max(1, Math.round(1 * scale));
  const padding = Math.round(24 * scale);

  const svg = `
  <svg width="${logoWidth}" height="${logoHeight}" viewBox="0 0 ${logoWidth} ${logoHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${Math.max(1, Math.round(1.5 * scale))}" stdDeviation="${Math.max(1.5, Math.round(2 * scale))}" flood-color="#000000" flood-opacity="0.95"/>
      </filter>
    </defs>
    <!-- Frosted luxury obsidian pill capsule for universal legibility -->
    <rect x="${strokeW}" y="${strokeW}" width="${logoWidth - strokeW * 2}" height="${logoHeight - strokeW * 2}" rx="${rx}" fill="rgba(10, 10, 16, 0.72)" stroke="rgba(255, 255, 255, 0.22)" stroke-width="${strokeW}"/>
    <!-- Official PAPERXIFY Brand Typography: PAPER (White) + XIFY (Red) -->
    <text x="${logoWidth / 2}" y="${textY}" text-anchor="middle" font-family="'Montserrat', 'Arial Black', 'Helvetica Neue', 'Segoe UI', sans-serif" font-weight="900" font-style="italic" font-size="${fontSize}" letter-spacing="0.5px" filter="url(#shadow)">
      <tspan fill="#FFFFFF">PAPER</tspan><tspan fill="#EF4444">XIFY</tspan>
    </text>
  </svg>
  `;

  return {
    svgBuffer: Buffer.from(svg),
    logoWidth,
    logoHeight,
    padding
  };
}

/**
 * Apply Paperxify watermark to an image buffer using sharp
 */
async function applyPaperxifyWatermark(rawBuffer) {
  try {
    const metadata = await sharp(rawBuffer).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    const { svgBuffer, logoWidth, logoHeight, padding } = createWatermarkSvg(width, height);

    const topPos = Math.max(0, height - logoHeight - padding);
    const leftPos = Math.max(0, width - logoWidth - padding);

    const watermarkedBuffer = await sharp(rawBuffer)
      .composite([
        {
          input: svgBuffer,
          top: topPos,
          left: leftPos
        }
      ])
      .png({ quality: 95 })
      .toBuffer();

    return watermarkedBuffer;
  } catch (err) {
    console.warn("⚠️ Watermark compositing failed, falling back to raw image buffer:", err.message);
    return rawBuffer;
  }
}

/**
 * Upload watermarked image to Cloudflare R2 bucket and return public CDN URL
 */
async function uploadImageToR2(imageBuffer, options = {}) {
  const { aspectRatio = "16-9", resolution = "1K" } = options;

  const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
  const R2_BUCKET = process.env.R2_BUCKET_NAME || "paperxify";
  const R2_ACCOUNT_ID = "1907350c4f2e8f5824e0cb40b15a6492";
  const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const R2_CDN_BASE = "https://cdn.pro.paperxify.com";

  if (!R2_ACCESS_KEY || !R2_SECRET_KEY) {
    console.warn("⚠️ R2 credentials not configured, skipping cloud bucket upload");
    return null;
  }

  const s3Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY
    },
    forcePathStyle: true
  });

  const uniqueId = crypto.randomBytes(6).toString("hex");
  const timestamp = Date.now();
  const safeRatio = String(aspectRatio).replace(/[^a-z0-9]/gi, "-");
  const key = `ai-images/paperxify-${timestamp}-${safeRatio}-${uniqueId}.png`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: imageBuffer,
    ContentType: "image/png",
    ACL: "public-read"
  });

  await s3Client.send(command);
  const publicUrl = `${R2_CDN_BASE}/${key}`;
  console.log(`🚀 Watermarked image uploaded to Cloudflare R2 bucket: ${publicUrl}`);
  return publicUrl;
}

/**
 * Use an LLM to enhance and expand the user's short image prompt into a rich, detailed visual prompt
 */
async function enhanceImagePrompt(rawPrompt, options = {}) {
  const { style = "photorealistic", aspectRatio = "1:1" } = options;
  if (!rawPrompt || !rawPrompt.trim()) return rawPrompt;

  const styleHint = STYLE_PROFILES[style] || STYLE_PROFILES.photorealistic;

  const systemPrompt = `You are a world-class prompt engineer and director of photography for next-generation generative AI models (specifically Qwen Image 3).
Your job is to expand the user's short prompt into an exceptionally rich, vivid, coherent visual prompt that produces stunning results.

Guidelines:
1. Describe the subject in precise detail (materials, colors, expression, posture).
2. Describe the environment and background atmosphere (time of day, weather, depth of field, surroundings).
3. Specify the lighting style (e.g. volumetric golden hour light, soft rim lighting, diffused studio glow, neon reflections).
4. Specify camera composition and lens characteristics (e.g. wide-angle shot, 85mm portrait, close-up macro, low-angle perspective).
5. Incorporate this style flavor: "${styleHint}".
6. Target aspect ratio: "${aspectRatio}".
7. IMPORTANT: Output ONLY the enhanced prompt. Do not include quotes, markdown headers, preamble ("Here is your prompt:"), or conversational text.`;

  for (const model of ENHANCE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `User Prompt: "${rawPrompt.trim()}"\n\nProduce the single best enhanced prompt:` }
          ],
          temperature: 0.7,
          max_tokens: 350
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content && content.length > rawPrompt.length) {
          const cleaned = content.replace(/^["']|["']$/g, "").replace(/^(enhanced prompt|prompt):\s*/i, "").trim();
          return cleaned;
        }
      }
    } catch (e) {
      // Continue to next model in queue
    }
  }

  // Fallback: rule-based enhancement if LLMs are unavailable
  return `${rawPrompt.trim()}, ${styleHint}, ultra-detailed, 8k resolution, crisp focus, masterpiece`;
}

/**
 * Generate high-resolution image using OpenRouter's qwen/qwen-image-3,
 * watermark it with the official Paperxify logo, and store it in Cloudflare R2
 */
async function generateQwenImage({
  userId = null,
  prompt,
  aspectRatio = "1:1",
  resolution = "1K",
  seed = undefined,
  n = 1
}) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required for image generation");
  }

  // Pre-flight atomic reservation
  let reservation = null;
  if (userId && userId !== "guest") {
    reservation = await capacityService.reserveCapacity(userId, "agent_image");
    if (!reservation.success) {
      const err = new Error(reservation.errorPayload?.message || "Visual capacity reached");
      err.code = "QUOTA_EXCEEDED";
      err.payload = reservation.errorPayload;
      throw err;
    }
  }

  // Validate aspect ratio accepted by Qwen Image 3
  const validAspectRatios = ["1:1", "1:2", "1:4", "2:1", "2:3", "3:2", "3:4", "4:1", "4:3", "4:5", "5:4", "9:16", "16:9"];
  const ratioMapping = {
    "21:9": "2:1",
    "5:2": "2:1"
  };
  const resolvedRatio = ratioMapping[aspectRatio] || aspectRatio;
  const finalAspectRatio = validAspectRatios.includes(resolvedRatio) ? resolvedRatio : "16:9";
  const finalResolution = resolution === "2K" ? "2K" : "1K";

  const requestBody = {
    model: "qwen/qwen-image-3",
    prompt: prompt.trim(),
    aspect_ratio: finalAspectRatio,
    resolution: finalResolution,
    n: Math.min(Math.max(Number(n) || 1, 1), 4)
  };

  if (typeof seed === "number" && !isNaN(seed)) {
    requestBody.seed = seed;
  }

  console.log(`🎨 [Qwen Image 3] Calling OpenRouter: ${JSON.stringify({ ...requestBody, prompt: requestBody.prompt.slice(0, 60) + "..." })}`);

  const response = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    if (reservation?.reservedUnits > 0) {
      await capacityService.releaseCapacity(userId, "agent_image", reservation.reservedUnits, true).catch(() => {});
    }
    const errorText = await response.text();
    console.error("OpenRouter Image API Error:", response.status, errorText);
    let message = `Failed to generate image (HTTP ${response.status})`;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson.error?.message) message = errJson.error.message;
    } catch {}
    throw new Error(message);
  }

  const result = await response.json();

  if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
    if (reservation?.reservedUnits > 0) {
      await capacityService.releaseCapacity(userId, "agent_image", reservation.reservedUnits, true).catch(() => {});
    }
    throw new Error("No image data returned from Qwen Image 3 API");
  }

  const primaryItem = result.data[0];
  let rawBuffer = null;

  if (primaryItem.b64_json) {
    rawBuffer = Buffer.from(primaryItem.b64_json, "base64");
  } else if (primaryItem.url) {
    const imgRes = await fetch(primaryItem.url);
    if (!imgRes.ok) throw new Error(`Failed to download image URL: HTTP ${imgRes.status}`);
    const arrayBuffer = await imgRes.arrayBuffer();
    rawBuffer = Buffer.from(arrayBuffer);
  }

  if (!rawBuffer) {
    throw new Error("Could not extract image buffer from AI response");
  }

  // 1. Watermark the generated image with official PAPERXIFY branding
  console.log("🖌️ Applying official Paperxify watermark to generated image...");
  const watermarkedBuffer = await applyPaperxifyWatermark(rawBuffer);

  // 2. Upload watermarked image to Cloudflare R2 bucket
  let cdnUrl = null;
  try {
    cdnUrl = await uploadImageToR2(watermarkedBuffer, {
      aspectRatio: finalAspectRatio,
      resolution: finalResolution
    });
  } catch (r2Err) {
    console.error("⚠️ Failed to upload image to R2:", r2Err.message);
  }

  // 3. Prepare response payload
  const mediaType = "image/png";
  const finalB64 = watermarkedBuffer.toString("base64");
  const dataUrl = `data:${mediaType};base64,${finalB64}`;
  const finalImageUrl = cdnUrl || dataUrl;

  if (userId && userId !== "guest") {
    const callCost = typeof result.usage?.cost === "number" && result.usage.cost > 0 ? result.usage.cost : 0.028;
    await capacityService.recordUsage({
      userId,
      feature: "agent_image",
      model: "qwen/qwen-image-3",
      type: "image",
      costUSD: callCost,
      status: "success",
      unitsAlreadyReserved: true,
      metadata: { aspectRatio: finalAspectRatio, resolution: finalResolution, prompt: prompt.slice(0, 100) }
    }).catch(e => console.warn("Image usage record warning:", e.message));
  }

  return {
    success: true,
    imageUrl: finalImageUrl,
    dataUrl,
    b64_json: finalB64,
    mediaType,
    aspectRatio: finalAspectRatio,
    resolution: finalResolution,
    model: "Paperxify Visual Engine",
    usage: result.usage || null,
    cost: result.usage?.cost || null,
    created: result.created || Date.now()
  };
}

module.exports = {
  enhanceImagePrompt,
  generateQwenImage,
  applyPaperxifyWatermark,
  uploadImageToR2,
  STYLE_PROFILES
};
