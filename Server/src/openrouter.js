const OPENROUTER_API_KEY = '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';


// Model priority queue - higher priority first
let modelQueue = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openrouter/free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "tngtech/deepseek-r1t-chimera:free"
];

// Track failed models
let failedModels = new Set();

async function ask(prompt) {


  // Rebuild queue: put failed models at the end
  const workingModels = modelQueue.filter(m => !failedModels.has(m));
  const failedModelsList = modelQueue.filter(m => failedModels.has(m));
  modelQueue = [...workingModels, ...failedModelsList];
  
  let lastError = null;
  
  for (const model of modelQueue) {
    console.log(`\n🤖 Trying model: ${model}`);
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${OPENROUTER_API_KEY}`, 
          "Content-Type": "application/json" ,
          "HTTP-Referer": "https://papertub.in", // Your site URL
            "X-Title": "PaperTube Server"
        },
        body: JSON.stringify({ 
          model: model, 
          messages: [{ role: "user", content: prompt }], 
          reasoning: { enabled: false }, 
          stream: false 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Success - move this model to front of queue for next time
      modelQueue = [model, ...modelQueue.filter(m => m !== model && !failedModels.has(m)), ...failedModelsList];
      failedModels.delete(model);
      
      console.log(`✅ Success with: ${model}`);
      console.log("\nAnswer:", data.choices[0].message.content);
      console.log("Model used:", model);
      console.log("Tokens:", data.usage?.total_tokens || 'N/A');
      
      return data.choices[0].message;
      
    } catch (error) {
      console.log(`❌ Failed: ${model} - ${error.message}`);
      failedModels.add(model);
      lastError = error;
    }
  }
  
  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

// Run it
async function main() {
  console.log("🚀 Starting model priority queue demo");
  console.log("Models in queue:", modelQueue.length);
  
  try {
    await ask("Hi what is API?");
    
    console.log("\n📊 Model status:");
    console.log("Working models:", modelQueue.filter(m => !failedModels.has(m)).length);
    console.log("Failed models:", failedModels.size);
    console.log("Current queue order:", modelQueue.slice(0, 3).join(", "), "...");
    
  } catch (error) {
    console.error("💥 Fatal:", error.message);
  }
}

main();