const Bytez = require('bytez.js');

// Initialize SDK - Use environment variable for your key in production
const sdk = new Bytez(process.env.BYTEZ_API_KEY || 'ee8c89813f22765dfe1884dba71b5113');
const modelId = 'Qwen/Qwen3-4B';
const model = sdk.model(modelId);

// Your prompt
const myPrompt = [
  { "role": "system", "content": "You are a helpful and concise assistant." },
  { "role": "user", "content": "genrate a Calculter Html page with in line css" }
];

async function getStreamingResponse() {
  console.log('Starting streaming response...\n---');
  
  try {
    // Enable streaming: the third parameter 'true' activates stream mode
    const stream = await model.run(myPrompt, {}, true);
    
    // Process each chunk as it arrives
    for await (const chunk of stream) {
      // Output each chunk as it comes in
      process.stdout.write(chunk);
    }
    
    console.log('\n---\nStream complete.');
  } catch (error) {
    console.error('Stream Error:', error.message);
  }
}

// Run the streaming function
getStreamingResponse();