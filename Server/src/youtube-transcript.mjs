// youtube-transcript.js
const { fetchTranscript } = require('youtube-transcript-plus');

async function getTranscript(videoId) {
        console.log("mjs mjs mjsmjs mjs mjsmjs mjs mjsmjs mjs mjsmjs mjs mjsmjs mjs mjsmjs mjs mjsmjs mjs mjsmjs mjs mjs")

    const transcript = await fetchTranscript(videoId);

    // Format the transcript with timestamps
    const formattedTranscript = transcript
        .map(segment => `[${segment.offset.toFixed(1)}s] ${segment.text}`)
        .join('\n');

    return formattedTranscript;
}

module.exports = { getTranscript };