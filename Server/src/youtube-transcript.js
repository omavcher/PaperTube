const axios = require("axios");

async function getTranscript(videoId) {

    // 1️⃣ First Method - youtube-transcript-plus
    try {
        const { fetchTranscript } = await import('youtube-transcript-plus');

        const transcript = await fetchTranscript(videoId);

        const formattedTranscript = transcript
            .map(segment => `[${segment.offset.toFixed(1)}s] ${segment.text}`)
            .join('\n');

        return formattedTranscript;

    } catch (err) {
        console.log("Primary method failed. Switching to Kome API...");

        // 2️⃣ Second Method - Kome API
        try {
            const response = await axios.post(
                "https://kome.ai/api/transcript",
                {
                    video_id: `https://www.youtube.com/watch?v=${videoId}`,
                    format: true,
                    source: "tool",
                    reason: null,
                    other_reason: null
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0"
                    }
                }
            );

            if (response.data && response.data.transcript) {
                return response.data.transcript;
            }

            return "Transcript not available.";

        } catch (error) {
            console.error("Fallback method failed:", error.message);
            return "Transcript not available from any method.";
        }
    }
}

module.exports = { getTranscript };
