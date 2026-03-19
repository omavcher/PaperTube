const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const R2_ACCOUNT_ID = '1907350c4f2e8f5824e0cb40b15a6492';
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'paperxify';
const R2_CDN_BASE = 'https://cdn.pro.paperxify.com';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

/**
 * Generate a pre-signed URL for uploading a file to R2.
 * @param {string} fileName - The original file name.
 * @param {string} contentType - The MIME type of the file.
 * @param {string} folder - The folder in the bucket (e.g. 'blog-images').
 * @returns {Promise<{uploadUrl: string, publicUrl: string}>}
 */
exports.generatePresignedUploadUrl = async (fileName, contentType, folder = 'uploads') => {
    // 1. Create a unique file name to avoid collisions
    const fileExtension = fileName.split('.').pop();
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const safeFileName = fileName
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-');
    
    // Final key in the bucket
    const key = `${folder}/${timestamp}-${uniqueId}-${safeFileName}`;

    // 2. Prepare the S3 command
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    // 3. Generate the pre-signed URL (valid for 15 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // 4. Return both the upload URL and the final public URL
    const publicUrl = `${R2_CDN_BASE}/${key}`;

    return { uploadUrl, publicUrl, key };
};
