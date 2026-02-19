// youtube-transcript.js
async function getTranscript(videoId) {
    const { fetchTranscript } = await import('youtube-transcript-plus');

    const transcript = await fetchTranscript(videoId);

    // Format the transcript with timestamps
    const formattedTranscript = transcript
        .map(segment => `[${segment.offset.toFixed(1)}s] ${segment.text}`)
        .join('\n');

    return formattedTranscript;
}

getTranscript('BmYv8XGl-YU').then(console.log);

module.exports = { getTranscript };