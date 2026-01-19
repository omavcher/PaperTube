// youtube-transcript.js
const { fetchTranscript } = require('youtube-transcript-plus');

const extractVideoId = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

async function getTranscript(videoId) {
    const transcript = await fetchTranscript(videoId);

    // Format the transcript with timestamps
    const formattedTranscript = transcript
        .map(segment => `[${segment.offset.toFixed(1)}s] ${segment.text}`)
        .join('\n');

    return formattedTranscript;
}

module.exports = { getTranscript };