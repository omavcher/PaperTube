const dotenv = require("dotenv");
dotenv.config();

(async () => {
  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/microsoft/DialoGPT-large",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: "Create a flowchart for an AI system architecture"
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();