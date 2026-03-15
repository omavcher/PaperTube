const axios = require("axios");

/**
 * Formats seconds into [SS.Ss]
 */
function formatTime(seconds) {
    if (isNaN(seconds)) return "[0.0s]";
    return `[${parseFloat(seconds).toFixed(1)}s]`;
}

/**
 * Validates if the content is a proper transcript or just metadata/error
 */
function isValidTranscript(text) {
    if (!text || typeof text !== "string") return false;
    const noise = ["webCommandMetadata", "styleRuns", "videoDescription", "aren't available", "restricted access"];
    if (noise.some(word => text.includes(word))) return false;
    return text.trim().length > 20;
}

/**
 * Parses raw YouTube InnerTube JSON if an API returns it directly
 */
function parseRawYouTubeJSON(data) {
    try {
        const json = typeof data === "string" ? JSON.parse(data) : data;
        let segments = json?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer?.initialSegments;
        
        if (!segments) {
            segments = json?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.body?.transcriptBodyRenderer?.cueGroups;
        }

        if (segments && Array.isArray(segments)) {
            return segments.map(seg => {
                const renderer = seg.transcriptSegmentRenderer || seg.transcriptCueGroupRenderer?.cues?.[0]?.transcriptCueRenderer;
                if (!renderer) return null;
                const start = (renderer.startMs || renderer.startOffsetMs) / 1000;
                const text = (renderer.snippet?.runs?.[0]?.text || renderer.simpleText || "").trim();
                return text ? `${formatTime(start)} ${text}` : null;
            }).filter(Boolean).join("\n");
        }
    } catch (e) {
        return null;
    }
    return null;
}

async function getTranscript(videoId) {
    console.log(`\n🔍 Debug: Fetching transcript for ${videoId}`);

    // 1️⃣ Method - Kome API
    try {
        const response = await axios.post("https://kome.ai/api/transcript", {
            video_id: `https://www.youtube.com/watch?v=${videoId}`,
            format: true,
            source: "tool"
        }, { headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" }, timeout: 10000 });

        const data = response.data?.transcript;
        if (isValidTranscript(data)) {
            console.log("✅ Success: Kome API");
            return data;
        }
        // Try parsing as raw YouTube if Kome returned it
        const parsedBody = parseRawYouTubeJSON(response.data);
        if (parsedBody) {
            console.log("✅ Success: Kome API (Raw JSON Parsed)");
            return parsedBody;
        }
    } catch (error) {}

    // 2️⃣ Method - Maestro API
    try {
        const response = await axios.post("https://website-tools-dot-maestro-218920.uk.r.appspot.com/getYoutubeCaptions", {
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`
        }, { timeout: 10000 });

        const data = response.data?.selectedCaptions;
        if (isValidTranscript(data)) {
            console.log("✅ Success: Maestro API");
            return data;
        }
    } catch (error) {}

    // 3️⃣ Method - yt-to-text API
    try {
        const response = await axios.post("https://yt-to-text.com/api/v1/Subtitles", { video_id: videoId }, { timeout: 10000 });
        const segments = response.data?.data?.transcripts;
        if (segments?.length > 0) {
            const formatted = segments.map(s => `${formatTime(s.s)} ${s.t}`).join("\n");
            console.log("✅ Success: yt-to-text API");
            return formatted;
        }
    } catch (error) {}

    // 4️⃣ Method - youtube-transcript-plus
    try {
        const { fetchTranscript } = await import('youtube-transcript-plus');
        const transcript = await fetchTranscript(videoId);
        if (transcript?.length > 0) {
            const formatted = transcript.map(s => `${formatTime(s.offset)} ${s.text}`).join("\n");
            console.log("✅ Success: youtube-transcript-plus");
            return formatted;
        }
    } catch (err) {}

    throw new Error("Failed to fetch transcript: All available methods failed.");
}



module.exports = { getTranscript };
