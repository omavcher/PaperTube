// bytez-image.js - Image Generation with Concurrency Management
const Bytez = require('bytez.js');
const fs = require('fs');

// Configuration
const BYTEZ_API_KEY = 'ee8c89813f22765dfe1884dba71b5113'; // USE ENV VARIABLE IN PRODUCTION!
const MODEL_ID = 'dreamlike-art/dreamlike-photoreal-2.0';
const PROMPT = `Hand-drawn doodle style illustration on a clean white notebook background
a student running with a stopwatch, a brain with puzzle pieces,
stacked exam papers with checkmarks, a magic wand with sparkles,
symbols of exam preparation and learning,
minimal black ink sketches with soft pastel highlights,
simple flat doodle art, no text, no letters, no words,
centered composition, vertical poster layout,
high quality, clean, educational aesthetic

for this video thumbaile  -> Marathon on General Aptitude GATE PYQs with TRICKS| Shrenik Jain
`;

// Global flag to track if we're currently making a request
let isRequestInProgress = false;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

class BytezImageGenerator {
  constructor() {
    this.sdk = new Bytez(BYTEZ_API_KEY);
    this.model = this.sdk.model(MODEL_ID);
    this.retryCount = 0;
  }

  async generateWithRetry() {
    // Safety check: prevent multiple concurrent calls
    if (isRequestInProgress) {
      console.log('⚠️  Another request is already in progress. Waiting...');
      return null;
    }

    isRequestInProgress = true;
    
    try {
      return await this.attemptGeneration();
    } finally {
      isRequestInProgress = false;
    }
  }

  async attemptGeneration() {
    while (this.retryCount < MAX_RETRIES) {
      console.log(`\n🔄 Attempt ${this.retryCount + 1} of ${MAX_RETRIES}`);
      
      try {
        console.log(`🚀 Sending request to model: ${MODEL_ID}`);
        const { error, output } = await this.model.run(PROMPT);
        
        if (error) {
          if (error.message && error.message.includes('concurrency')) {
            console.log(`⏳ Concurrency limit hit. Retrying in ${RETRY_DELAY_MS/1000} seconds...`);
            this.retryCount++;
            
            if (this.retryCount < MAX_RETRIES) {
              await this.delay(RETRY_DELAY_MS);
              continue; // Try again
            } else {
              console.error(`❌ Max retries (${MAX_RETRIES}) reached. Giving up.`);
              return null;
            }
          } else {
            // Other errors (model not found, auth issues, etc.)
            console.error('❌ Generation failed:', error);
            return null;
          }
        }
        
        // SUCCESS!
        console.log('✨ Image generated successfully!');
        this.retryCount = 0; // Reset for next time
        return this.saveImage(output);
        
      } catch (error) {
        console.error('💥 Unexpected error:', error.message);
        return null;
      }
    }
    
    return null;
  }

  saveImage(imageData) {
    try {
      // Handle different output formats
      if (imageData.startsWith('http')) {
        console.log(`🌐 Image URL: ${imageData}`);
        return { type: 'url', data: imageData };
      } 
      else if (imageData.startsWith('data:image')) {
        const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const imageType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = `generated-${Date.now()}.${imageType}`;
          
          fs.writeFileSync(filename, buffer);
          console.log(`✅ Image saved as: ${filename}`);
          return { type: 'file', data: filename };
        }
      }
      
      // Unknown format
      console.log('📦 Raw output:', typeof imageData === 'string' ? imageData.substring(0, 100) + '...' : imageData);
      return { type: 'unknown', data: imageData };
      
    } catch (error) {
      console.error('❌ Error saving image:', error.message);
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log('==========================================');
  console.log('Bytez Image Generator with Concurrency Control');
  console.log('==========================================');
  
  const generator = new BytezImageGenerator();
  const result = await generator.generateWithRetry();
  
  if (result) {
    console.log('\n🎉 SUCCESS!');
    if (result.type === 'file') {
      console.log(`📁 Image saved: ${result.data}`);
    } else if (result.type === 'url') {
      console.log(`🔗 Image URL: ${result.data}`);
    }
  } else {
    console.log('\n❌ Failed to generate image.');
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Run this command to check for other Node processes:');
    console.log('   tasklist | findstr node');
    console.log('2. Kill any unrelated Node processes:');
    console.log('   taskkill /F /PID <process_id>');
    console.log('3. Wait 30 seconds for any pending requests to complete');
    console.log('4. Check your Bytez dashboard: https://bytez.com/api');
    console.log('5. Contact support: team@bytez.com');
  }
  
  console.log('==========================================');
}

// Run only if this is the main module
if (require.main === module) {
  main();
}

// Export for use in other modules
module.exports = BytezImageGenerator;