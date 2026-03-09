const axios = require("axios");

async function getTranscript(videoId) {

    // 1️⃣ First Method - Kome API
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
    } catch (error) {
        console.log("Kome API failed. Switching to Maestro API...");
    }

    // 2️⃣ Second Method - Maestro API
    try {
        const maestroResponse = await axios.post(
            "https://website-tools-dot-maestro-218920.uk.r.appspot.com/getYoutubeCaptions",
            { videoUrl: `https://www.youtube.com/watch?v=${videoId}` },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (maestroResponse.data && maestroResponse.data.selectedCaptions) {
            return maestroResponse.data.selectedCaptions;
        }
    } catch (error) {
        console.log("Maestro API failed. Switching to yt-to-text API...");
    }

    // 3️⃣ Third Method - yt-to-text API
    try {
        const response = await axios.post(
            "https://yt-to-text.com/api/v1/Subtitles",
            { video_id: videoId },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data && response.data.data && response.data.data.transcripts) {
            const formattedTranscript = response.data.data.transcripts
                .map(segment => `[${parseFloat(segment.s).toFixed(1)}s] ${segment.t}`)
                .join('\n');
            return formattedTranscript;
        }
    } catch (error) {
        console.log("yt-to-text API failed. Switching to youtube-transcript-plus...");
    }

    // 4️⃣ Fourth Method - youtube-transcript-plus
    try {
        const { fetchTranscript } = await import('youtube-transcript-plus');

        const transcript = await fetchTranscript(videoId);

        const formattedTranscript = transcript
            .map(segment => `[${segment.offset.toFixed(1)}s] ${segment.text}`)
            .join('\n');

        return formattedTranscript;

    } catch (err) {
        console.error("Fallback method failed:", err.message);
        return null; // Return null to trigger graceful fallback in controllers
    }
}

module.exports = { getTranscript };
