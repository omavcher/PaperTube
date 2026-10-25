const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

// Local storage directory
const LOCAL_UPLOADS_DIR = path.join(__dirname, "../../uploads/narration");

// Ensure local directory exists
function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Check if Cloudflare R2 / S3 credentials are configured
 */
function isCloudStorageConfigured() {
  return !!(
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

/**
 * Get configured S3 client for R2 / S3
 */
function getS3Client() {
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "1907350c4f2e8f5824e0cb40b15a6492";
  const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

/**
 * Check if an audio file already exists in storage by contentHash
 * @param {string} contentHash - SHA-256 hash of narration parameters
 * @returns {Promise<{ exists: boolean, audioUrl?: string, buffer?: Buffer }>}
 */
async function checkAudioExists(contentHash, baseUrl = "") {
  const key = `narration/${contentHash}.mp3`;

  // 1. Check Cloud Storage (R2 / S3) if enabled
  if (isCloudStorageConfigured()) {
    try {
      const s3 = getS3Client();
      const bucket = process.env.R2_BUCKET_NAME;
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));

      const cdnBase = process.env.R2_CDN_BASE || "https://cdn.pro.paperxify.com";
      const publicUrl = `${cdnBase}/${key}`;
      return { exists: true, audioUrl: publicUrl };
    } catch (err) {
      // 404 or not found - proceed to local check
    }
  }

  // 2. Check local disk storage
  ensureLocalDir();
  const localFilePath = path.join(LOCAL_UPLOADS_DIR, `${contentHash}.mp3`);
  if (fs.existsSync(localFilePath)) {
    const buffer = fs.readFileSync(localFilePath);
    const host = baseUrl || process.env.BACKEND_URL || "http://localhost:5000";
    const audioUrl = `${host}/uploads/narration/${contentHash}.mp3`;
    return { exists: true, audioUrl, buffer };
  }

  return { exists: false };
}

/**
 * Save an audio buffer to storage (local disk or Cloudflare R2 / S3)
 * @param {Buffer} audioBuffer - MP3 binary buffer
 * @param {string} contentHash - SHA-256 hash
 * @param {string} baseUrl - Base host URL for local URL generation
 * @returns {Promise<{ audioUrl: string, storageType: 'cloud' | 'local', key: string }>}
 */
async function saveAudio(audioBuffer, contentHash, baseUrl = "") {
  const key = `narration/${contentHash}.mp3`;

  // 1. Try Cloud Storage if configured
  if (isCloudStorageConfigured()) {
    try {
      const s3 = getS3Client();
      const bucket = process.env.R2_BUCKET_NAME;
      const cdnBase = process.env.R2_CDN_BASE || "https://cdn.pro.paperxify.com";

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: audioBuffer,
          ContentType: "audio/mpeg",
          ACL: "public-read",
        })
      );

      const publicUrl = `${cdnBase}/${key}`;
      console.log(`[AudioStorage] Saved to Cloud Storage: ${publicUrl}`);
      return { audioUrl: publicUrl, storageType: "cloud", key };
    } catch (err) {
      console.warn(`[AudioStorage] Cloud upload failed, falling back to local disk:`, err.message);
    }
  }

  // 2. Save to local disk
  ensureLocalDir();
  const localFilePath = path.join(LOCAL_UPLOADS_DIR, `${contentHash}.mp3`);
  fs.writeFileSync(localFilePath, audioBuffer);

  const host = baseUrl || process.env.BACKEND_URL || "http://localhost:5000";
  const audioUrl = `${host}/uploads/narration/${contentHash}.mp3`;
  console.log(`[AudioStorage] Saved to local disk: ${localFilePath} -> ${audioUrl}`);

  return { audioUrl, storageType: "local", key };
}

module.exports = {
  checkAudioExists,
  saveAudio,
  LOCAL_UPLOADS_DIR,
};
