// bytezvideo.js - Video Generation with Bytez
const Bytez = require('bytez.js');

// Initialize SDK
const sdk = new Bytez(process.env.BYTEZ_API_KEY || 'ee8c89813f22765dfe1884dba71b5113');

// *** CHANGE HERE: Use a valid text-to-video model ***
// Use the model ID from the Bytez text-to-video documentation[citation:1]
const modelId = 'ali-vilab/text-to-video-ms-1.7b'; // Correct model for video
const model = sdk.model(modelId);

// Your prompt for video generation
const videoPrompt = "A futuristic cityscape at sunset with flying cars and neon lights";

async function generateVideo() {
  console.log(`Generating video with prompt: "${videoPrompt}"`);
  
  try {
    // Send the text prompt to the model[citation:1]
    const { error, output } = await model.run(videoPrompt);
    
    if (error) {
      console.error('Generation Error:', error);
      return;
    }
    
    console.log('Video generation successful!');
    // The output format depends on the model
    console.log('Output:', output);
    
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

// Run the video generation
generateVideo();