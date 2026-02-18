// youtube-transcript.js
async function getTranscript(videoId) {
    const { fetchTranscript } = await import('youtube-transcript-plus');

// This depends on whether youtube-transcript-plus supports options
const transcript = await fetchTranscript(videoId, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});
    // Format the transcript with timestamps
    const formattedTranscript = transcript
        .map(segment => `[${segment.offset.toFixed(1)}s] ${segment.text}`)
        .join('\n');

    return formattedTranscript;
}

module.exports = { getTranscript };