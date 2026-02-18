// youtube-transcript.js
async function getTranscript(videoId) {
    const { fetchTranscript } = await import('youtube-transcript-plus');


    const transcript = await fetchTranscript(videoId);
console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    // Format the transcript with timestamps
    const formattedTranscript = transcript
        .map(segment => `[${segment.offset.toFixed(1)}s] ${segment.text}`)
        .join('\n');

    return formattedTranscript;
}

module.exports = { getTranscript };