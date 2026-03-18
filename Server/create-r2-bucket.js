/**
 * One-time script to create the R2 bucket "paperxify-images"
 * Run with:  node create-r2-bucket.js
 */
require('dotenv').config({ path: './src/.env' });

const { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const R2_ACCOUNT_ID = '1907350c4f2e8f5824e0cb40b15a6492';
const R2_ENDPOINT   = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BUCKET_NAME   = process.env.R2_BUCKET_NAME || 'paperxify-images';

const client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function run() {
  console.log(`\n🪣  Target bucket : ${BUCKET_NAME}`);
  console.log(`📡  R2 endpoint   : ${R2_ENDPOINT}\n`);

  // 1. Check if bucket already exists
  try {
    await client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅  Bucket "${BUCKET_NAME}" already exists — nothing to do.`);
    return;
  } catch (err) {
    if (err.name !== 'NotFound' && err.$metadata?.httpStatusCode !== 404) {
      // Some other access error
      console.error('❌  Error checking bucket:', err.message);
      process.exit(1);
    }
    // 404 means it doesn't exist yet — proceed to create
  }

  // 2. Create the bucket
  try {
    await client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅  Bucket "${BUCKET_NAME}" created successfully!`);
  } catch (err) {
    console.error('❌  Failed to create bucket:', err.message);
    process.exit(1);
  }

  // 3. Set a permissive CORS policy so CDN / browsers can load the images
  try {
    await client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'HEAD'],
            AllowedOrigins: ['*'],
            MaxAgeSeconds: 86400,
          },
        ],
      },
    }));
    console.log('✅  CORS policy applied (GET / HEAD from any origin).');
  } catch (err) {
    // CORS is best-effort; don't fail the whole script
    console.warn('⚠️  Could not set CORS policy (non-critical):', err.message);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Bucket setup complete!

  Next steps in Cloudflare Dashboard:
  1. Go to R2 → "${BUCKET_NAME}" → Settings
  2. Under "Custom Domains" add:  cdn.pro.paperxify.com
  3. That's it — images will be served via the CDN URL.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

run().catch(console.error);
