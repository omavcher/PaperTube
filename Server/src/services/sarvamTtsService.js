const axios = require("axios");
const crypto = require("crypto");
const audioStorageService = require("./audioStorageService");

const SARVAM_TTS_ENDPOINT = "https://api.sarvam.ai/text-to-speech";
const DEFAULT_MODEL = "bulbul:v3";
const DEFAULT_SAMPLE_RATE = 24000;
const DEFAULT_CODEC = "mp3";
const DEFAULT_PACE = 1.0;
const DEFAULT_TEMPERATURE = 0.6;
const DEFAULT_SPEAKER = "shubh";
const DEFAULT_LANGUAGE = "en-IN";
const MAX_TEXT_CHUNK_LENGTH = 500; // Safe threshold for single Bulbul V3 request without truncation

/**
 * Language and Voice Configuration Layer for Sarvam Bulbul V3
 */
const SUPPORTED_LANGUAGES = {
  "en-IN": {
    code: "en-IN",
    name: "English (India)",
    nativeName: "English (India)",
    script: "Latin",
    defaultSpeaker: "shubh",
    supportedSpeakers: ["shubh", "priya", "aditya", "ritu", "neha", "rahul", "pooja", "rohan", "simran", "kavya"]
  },
  "hi-IN": {
    code: "hi-IN",
    name: "Hindi",
    nativeName: "हिन्दी",
    script: "Devanagari",
    defaultSpeaker: "shubh",
    supportedSpeakers: ["shubh", "priya", "aditya", "ritu", "neha", "rahul", "pooja", "rohan", "simran", "kavya", "amit", "dev", "ishita", "shreya"]
  }
};

const VOICE_CATALOG = [
  { id: "shubh", name: "Shubh", gender: "Male", language: "en-IN", style: "Educational / Clear", isDefault: true },
  { id: "priya", name: "Priya", gender: "Female", language: "en-IN", style: "Warm / Engaging", isDefault: false },
  { id: "aditya", name: "Aditya", gender: "Male", language: "en-IN", style: "Confident / Academic", isDefault: false },
  { id: "ritu", name: "Ritu", gender: "Female", language: "en-IN", style: "Expressive / Natural", isDefault: false },
  { id: "neha", name: "Neha", gender: "Female", language: "hi-IN", style: "Bright / Explanatory", isDefault: false },
  { id: "rahul", name: "Rahul", gender: "Male", language: "hi-IN", style: "Steady / Educational", isDefault: false },
  { id: "pooja", name: "Pooja", gender: "Female", language: "hi-IN", style: "Friendly / Articulate", isDefault: false },
  { id: "rohan", name: "Rohan", gender: "Male", language: "en-IN", style: "Youthful / Dynamic", isDefault: false },
  { id: "simran", name: "Simran", gender: "Female", language: "en-IN", style: "Calm / Professional", isDefault: false },
  { id: "kavya", name: "Kavya", gender: "Female", language: "hi-IN", style: "Storytelling / Gentle", isDefault: false },
  { id: "amit", name: "Amit", gender: "Male", language: "hi-IN", style: "Authoritative / News", isDefault: false },
  { id: "dev", name: "Dev", gender: "Male", language: "hi-IN", style: "Deep / Conversational", isDefault: false }
];

/**
 * Validates that SARVAM_API_KEY is configured in backend environment variables
 * NEVER exposes the key to the caller or logs.
 */
function getSarvamApiKey() {
  const key = process.env.SARVAM_API_KEY;
  if (!key || !key.trim()) {
    throw new Error(
      "SARVAM_API_KEY is not configured in backend environment variables. Please set SARVAM_API_KEY in the server .env file."
    );
  }
  return key.trim();
}

/**
 * Generate a deterministic SHA-256 hash for caching audio requests
 */
function generateDeterministicHash({
  text,
  languageCode,
  speaker,
  model,
  pace,
  temperature,
  sampleRate,
  codec
}) {
  const payload = [
    (text || "").trim(),
    (languageCode || DEFAULT_LANGUAGE).toLowerCase(),
    (speaker || DEFAULT_SPEAKER).toLowerCase(),
    (model || DEFAULT_MODEL).toLowerCase(),
    Number(pace || DEFAULT_PACE).toFixed(2),
    Number(temperature || DEFAULT_TEMPERATURE).toFixed(2),
    parseInt(sampleRate || DEFAULT_SAMPLE_RATE, 10),
    (codec || DEFAULT_CODEC).toLowerCase()
  ].join("::");

  return crypto.createHash("sha256").update(payload, "utf8").digest("hex");
}

/**
 * Accurately calculate the duration in milliseconds of an MP3 audio buffer
 * by parsing MPEG Layer-3 audio frame headers (works for both CBR and VBR).
 * Does not require external binaries (ffmpeg) or native C++ bindings.
 */
function calculateActualMp3DurationMs(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 4) return 0;

  let offset = 0;

  // 1. Skip ID3v2 metadata header if present
  if (
    buffer.length > 10 &&
    buffer[0] === 0x49 && // 'I'
    buffer[1] === 0x44 && // 'D'
    buffer[2] === 0x33    // '3'
  ) {
    const synchsafeSize =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f);
    offset = 10 + synchsafeSize;
  }

  const sampleRates = {
    1: [44100, 48000, 32000],       // MPEG-1
    2: [22050, 24000, 16000],       // MPEG-2
    2.5: [11025, 12000, 8000]       // MPEG-2.5
  };

  const bitratesV1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const bitratesV2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];

  let totalSamples = 0;
  let detectedSampleRate = DEFAULT_SAMPLE_RATE;
  let frameCount = 0;

  while (offset + 4 <= buffer.length) {
    // Check 11-bit sync word: 0xFF followed by byte with high 3 bits = 1 (0xE0)
    if (buffer[offset] === 0xff && (buffer[offset + 1] & 0xe0) === 0xe0) {
      const b1 = buffer[offset + 1];
      const b2 = buffer[offset + 2];
      const b3 = buffer[offset + 3];

      const versionId = (b1 >> 3) & 0x03;
      const layerId = (b1 >> 1) & 0x03;

      let version = 1;
      if (versionId === 0) version = 2.5;
      else if (versionId === 2) version = 2;
      else if (versionId === 3) version = 1;
      else {
        offset++;
        continue;
      }

      // Check Layer III (layerId === 1)
      if (layerId !== 1) {
        offset++;
        continue;
      }

      const bitrateIdx = (b2 >> 4) & 0x0f;
      const srIdx = (b2 >> 2) & 0x03;
      const padding = (b2 >> 1) & 0x01;

      if (bitrateIdx === 0 || bitrateIdx === 15 || srIdx === 3) {
        offset++;
        continue;
      }

      const sampleRate = sampleRates[version]?.[srIdx];
      if (!sampleRate) {
        offset++;
        continue;
      }
      detectedSampleRate = sampleRate;

      const bitrateKbps = version === 1 ? bitratesV1L3[bitrateIdx] : bitratesV2L3[bitrateIdx];
      if (!bitrateKbps) {
        offset++;
        continue;
      }

      const bitrate = bitrateKbps * 1000;
      const samplesPerFrame = version === 1 ? 1152 : 576;
      const frameLength = Math.floor(((samplesPerFrame / 8) * bitrate) / sampleRate) + padding;

      if (frameLength <= 0 || offset + frameLength > buffer.length + 1) {
        offset++;
        continue;
      }

      // Check for Xing / Info header in first frame (indicates accurate VBR total frames)
      if (frameCount === 0) {
        const xingOffset = version === 1 ? ((b3 & 0xc0) === 0xc0 ? 17 : 32) : ((b3 & 0xc0) === 0xc0 ? 9 : 17);
        const pos = offset + 4 + xingOffset;
        if (pos + 12 <= buffer.length) {
          const tag = buffer.toString("ascii", pos, pos + 4);
          if (tag === "Xing" || tag === "Info") {
            const flags = buffer.readUInt32BE(pos + 4);
            if (flags & 1) {
              const xingFrames = buffer.readUInt32BE(pos + 8);
              if (xingFrames > 0) {
                return Math.round(((xingFrames * samplesPerFrame) / sampleRate) * 1000);
              }
            }
          }
        }
      }

      totalSamples += samplesPerFrame;
      frameCount++;
      offset += frameLength;
    } else {
      offset++;
    }
  }

  if (totalSamples > 0 && detectedSampleRate > 0) {
    return Math.round((totalSamples / detectedSampleRate) * 1000);
  }

  // Fallback: estimate from file size at standard 64kbps if frame parsing was incomplete
  return Math.round((buffer.length * 8) / 64);
}

/**
 * Split long narration text into safe sub-chunks without breaking sentences or words.
 * Preserves Indic script and punctuation (। ॥ . ! ?).
 */
function splitTextSafely(text, maxLength = MAX_TEXT_CHUNK_LENGTH) {
  if (!text || text.length <= maxLength) return [text.trim()];

  // Regex splitting on sentence terminators: English (. ! ?), Indic danda (। ॥), newlines
  const sentenceRegex = /([^.!?।॥\n]+[.!?।॥\n]+)/g;
  const rawSentences = text.match(sentenceRegex) || [text];

  const chunks = [];
  let currentChunk = "";

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length > maxLength) {
      // If a single sentence exceeds maxLength, split on clause boundaries (commas, semicolons) or spaces
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      const words = trimmed.split(/\s+/);
      let wordChunk = "";
      for (const word of words) {
        if ((wordChunk + " " + word).trim().length > maxLength) {
          if (wordChunk) chunks.push(wordChunk.trim());
          wordChunk = word;
        } else {
          wordChunk = wordChunk ? `${wordChunk} ${word}` : word;
        }
      }
      if (wordChunk) chunks.push(wordChunk.trim());
    } else if ((currentChunk + " " + trimmed).trim().length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.trim()];
}

/**
 * Execute a single HTTP call to Sarvam Bulbul V3 with exponential backoff on 429
 */
async function callSarvamApiWithRetry(requestPayload, maxRetries = 3) {
  const apiKey = getSarvamApiKey();

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const response = await axios.post(SARVAM_TTS_ENDPOINT, requestPayload, {
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey
        },
        timeout: 25000 // 25s timeout
      });

      if (!response.data || !response.data.audios || !response.data.audios.length) {
        throw new Error("Sarvam TTS returned an empty audio response.");
      }

      return response.data.audios; // Array of base64 encoded strings
    } catch (err) {
      attempt++;
      const status = err.response?.status;
      const responseData = err.response?.data;

      // Handle 403 Forbidden: Safe configuration/auth error (NEVER expose key)
      if (status === 403) {
        console.error("[SarvamTTS] 403 Forbidden: Invalid or unauthorized SARVAM_API_KEY.");
        throw new Error(
          "Sarvam AI authentication failed. Please check that a valid SARVAM_API_KEY is configured in your backend environment."
        );
      }

      // Handle 422 Unprocessable Entity
      if (status === 422) {
        const detail = responseData?.detail || responseData?.message || "Invalid TTS parameters.";
        throw new Error(`Sarvam TTS Validation Error (422): ${JSON.stringify(detail)}`);
      }

      // Handle 400 Bad Request
      if (status === 400) {
        const detail = responseData?.message || responseData?.error || "Bad request format.";
        throw new Error(`Sarvam TTS Request Error (400): ${detail}`);
      }

      // Handle 429 Rate Limit: Exponential backoff with jitter
      if (status === 429 && attempt <= maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000 + Math.floor(Math.random() * 500);
        console.warn(`[SarvamTTS] 429 Rate limited. Retrying attempt ${attempt}/${maxRetries} in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      // Final failure
      if (attempt > maxRetries) {
        console.error(`[SarvamTTS] Failed after ${maxRetries} retries:`, err.message);
        throw new Error(`Sarvam TTS service unavailable (${status || "timeout"}). ${err.message}`);
      }

      // Network errors / timeouts: short pause before retry
      const delayMs = 1000 * attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Generate audio for a single text chunk, handling caching deterministically
 */
async function generateSingleChunkAudio({
  text,
  languageCode,
  speaker,
  model,
  pace,
  temperature,
  sampleRate,
  codec,
  baseUrl = ""
}) {
  const contentHash = generateDeterministicHash({
    text,
    languageCode,
    speaker,
    model,
    pace,
    temperature,
    sampleRate,
    codec
  });

  // 1. Check cache first
  const cached = await audioStorageService.checkAudioExists(contentHash, baseUrl);
  if (cached.exists && cached.audioUrl) {
    let durationMs = 0;
    if (cached.buffer) {
      durationMs = calculateActualMp3DurationMs(cached.buffer);
    }
    return {
      contentHash,
      audioUrl: cached.audioUrl,
      buffer: cached.buffer,
      durationMs,
      fromCache: true
    };
  }

  // 2. Exact payload format required by Sarvam Bulbul V3
  // Note: Only supported parameters for bulbul:v3 (no pitch, loudness, or SSML)
  const sarvamPayload = {
    text: text.trim(),
    target_language_code: languageCode,
    speaker: speaker.toLowerCase(),
    model: model || DEFAULT_MODEL,
    pace: Number(pace) || DEFAULT_PACE,
    temperature: Number(temperature) || DEFAULT_TEMPERATURE,
    speech_sample_rate: parseInt(sampleRate, 10) || DEFAULT_SAMPLE_RATE,
    output_audio_codec: codec || DEFAULT_CODEC
  };

  console.log(`[SarvamTTS] Generating TTS with ${sarvamPayload.model} [${sarvamPayload.target_language_code}, ${sarvamPayload.speaker}]: "${text.slice(0, 40)}..."`);

  const base64Audios = await callSarvamApiWithRetry(sarvamPayload);
  const audioBuffer = Buffer.from(base64Audios[0], "base64");

  const actualDurationMs = calculateActualMp3DurationMs(audioBuffer);

  // 3. Save to storage abstraction (local disk or Cloudflare R2 / S3)
  const saved = await audioStorageService.saveAudio(audioBuffer, contentHash, baseUrl);

  return {
    contentHash,
    audioUrl: saved.audioUrl,
    buffer: audioBuffer,
    durationMs: actualDurationMs,
    fromCache: false
  };
}

/**
 * Generate audio for a single narration segment.
 * If text exceeds character limit, safely splits into sentences,
 * generates sub-chunks, concatenates the resulting MP3 buffers,
 * computes the ACTUAL audio duration, and caches the result.
 */
async function generateSegmentAudio(segment, options = {}, baseUrl = "") {
  const {
    languageCode = DEFAULT_LANGUAGE,
    speaker = DEFAULT_SPEAKER,
    pace = DEFAULT_PACE,
    temperature = DEFAULT_TEMPERATURE,
    model = DEFAULT_MODEL,
    sampleRate = DEFAULT_SAMPLE_RATE,
    codec = DEFAULT_CODEC
  } = options;

  const rawText = (segment.text || "").trim();
  if (!rawText) {
    throw new Error(`Narration segment "${segment.segment_id}" is missing required "text" content.`);
  }

  // 1. Overall hash for the entire segment text & settings
  const segmentHash = generateDeterministicHash({
    text: rawText,
    languageCode,
    speaker,
    model,
    pace,
    temperature,
    sampleRate,
    codec
  });

  // 2. Check cache for the full segment
  const cached = await audioStorageService.checkAudioExists(segmentHash, baseUrl);
  if (cached.exists && cached.audioUrl) {
    let durationMs = 0;
    if (cached.buffer) {
      durationMs = calculateActualMp3DurationMs(cached.buffer);
    }
    return {
      segment_id: segment.segment_id,
      audio_url: cached.audioUrl,
      duration_ms: durationMs,
      mime_type: "audio/mpeg",
      animation_step_ids: segment.animation_step_ids || [],
      from_cache: true
    };
  }

  // 3. Safe sentence chunking if needed
  const textChunks = splitTextSafely(rawText, MAX_TEXT_CHUNK_LENGTH);
  let finalAudioBuffer;

  if (textChunks.length === 1) {
    const res = await generateSingleChunkAudio({
      text: textChunks[0],
      languageCode,
      speaker,
      model,
      pace,
      temperature,
      sampleRate,
      codec,
      baseUrl
    });
    finalAudioBuffer = res.buffer;
  } else {
    // Generate each sub-chunk and concatenate MP3 buffers
    console.log(`[SarvamTTS] Segment ${segment.segment_id} split into ${textChunks.length} sentence chunks.`);
    const chunkBuffers = [];
    for (const chunk of textChunks) {
      const chunkRes = await generateSingleChunkAudio({
        text: chunk,
        languageCode,
        speaker,
        model,
        pace,
        temperature,
        sampleRate,
        codec,
        baseUrl
      });
      chunkBuffers.push(chunkRes.buffer);
    }
    finalAudioBuffer = Buffer.concat(chunkBuffers);
  }

  // 4. Calculate actual duration of the final audio
  const actualDurationMs = calculateActualMp3DurationMs(finalAudioBuffer);

  // 5. Save the combined segment audio under the segment's deterministic hash
  const saved = await audioStorageService.saveAudio(finalAudioBuffer, segmentHash, baseUrl);

  return {
    segment_id: segment.segment_id,
    audio_url: saved.audioUrl,
    duration_ms: actualDurationMs,
    mime_type: "audio/mpeg",
    animation_step_ids: segment.animation_step_ids || [],
    from_cache: false
  };
}

/**
 * Process an array of narration segments with controlled concurrency
 * (Preserves segment IDs and output order)
 */
async function processSegmentsInBatches(segments, options, baseUrl, concurrency = 2) {
  const results = new Array(segments.length);
  let index = 0;

  async function worker() {
    while (index < segments.length) {
      const currentIndex = index++;
      const segment = segments[currentIndex];
      try {
        const res = await generateSegmentAudio(segment, options, baseUrl);
        results[currentIndex] = res;
      } catch (err) {
        console.error(`[SarvamTTS] Error processing segment ${segment.segment_id}:`, err.message);
        throw err;
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, segments.length); i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}

/**
 * Build synchronized timeline from generated audio segments
 * Handles animation duration discrepancies:
 * - If animation is shorter: extend/pause the final visual state
 * - If animation is longer: sustain visual state until narration completes
 */
function buildSynchronizedTimeline(audioSegments, originalSegments = []) {
  const timeline = [];
  let currentStartMs = 0;

  for (let i = 0; i < audioSegments.length; i++) {
    const audio = audioSegments[i];
    const orig = originalSegments.find((s) => s.segment_id === audio.segment_id) || {};
    const durationMs = audio.duration_ms || 4000;
    const endMs = currentStartMs + durationMs;

    // Estimated duration from AI visual JSON (in seconds or ms)
    const estimatedMs = orig.estimated_duration
      ? orig.estimated_duration > 100
        ? Math.round(orig.estimated_duration)
        : Math.round(orig.estimated_duration * 1000)
      : durationMs;

    let syncStrategy = "exact";
    if (estimatedMs < durationMs) {
      // Animation finishes earlier than voiceover -> extend and pause visual frame
      syncStrategy = "extend_pause";
    } else if (estimatedMs > durationMs) {
      // Voiceover finishes earlier than planned animation -> sustain visual state
      syncStrategy = "sustain";
    }

    timeline.push({
      segment_id: audio.segment_id,
      start_ms: currentStartMs,
      end_ms: endMs,
      duration_ms: durationMs,
      animation_step_ids: audio.animation_step_ids || orig.animation_step_ids || [],
      sync_strategy: syncStrategy,
      estimated_duration_ms: estimatedMs
    });

    currentStartMs = endMs;
  }

  return {
    timeline,
    total_duration_ms: currentStartMs
  };
}

/**
 * Main Entry Point: Generate Narration for visual explanation segments
 * Returns segments, actual durations, synchronized timeline, and complete render manifest.
 */
async function generateNarration(params, baseUrl = "") {
  const {
    segments = [],
    language_code = DEFAULT_LANGUAGE,
    speaker = DEFAULT_SPEAKER,
    pace = DEFAULT_PACE,
    temperature = DEFAULT_TEMPERATURE,
    source_image = null,
    animation_sequence = []
  } = params;

  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error('Narration generation requires a non-empty "segments" array.');
  }

  // Verify Sarvam API Key before starting work
  getSarvamApiKey();

  // Validate language code
  const targetLanguage = SUPPORTED_LANGUAGES[language_code] ? language_code : DEFAULT_LANGUAGE;
  const targetSpeaker = (speaker || DEFAULT_SPEAKER).toLowerCase();

  const options = {
    languageCode: targetLanguage,
    speaker: targetSpeaker,
    pace: Number(pace) || DEFAULT_PACE,
    temperature: Number(temperature) || DEFAULT_TEMPERATURE,
    model: DEFAULT_MODEL,
    sampleRate: DEFAULT_SAMPLE_RATE,
    codec: DEFAULT_CODEC
  };

  console.log(`[SarvamTTS] Starting narration generation for ${segments.length} segment(s)...`);

  // Generate audio for each narration segment
  const audioSegments = await processSegmentsInBatches(segments, options, baseUrl, 2);

  // Build synchronized timeline with actual durations
  const { timeline, total_duration_ms } = buildSynchronizedTimeline(audioSegments, segments);

  // Build complete merged render manifest for the video renderer
  const manifest = {
    version: "1.0",
    model: DEFAULT_MODEL,
    voice_config: {
      language_code: targetLanguage,
      speaker: targetSpeaker,
      pace: options.pace,
      temperature: options.temperature,
      speech_sample_rate: DEFAULT_SAMPLE_RATE,
      output_audio_codec: DEFAULT_CODEC
    },
    source_image: source_image || {
      url: "",
      width: 1920,
      height: 1080
    },
    animation_sequence: animation_sequence || [],
    audio_segments: audioSegments.map((s) => ({
      segment_id: s.segment_id,
      audio_url: s.audio_url,
      duration_ms: s.duration_ms,
      mime_type: s.mime_type
    })),
    timeline: timeline.map((t) => ({
      segment_id: t.segment_id,
      start_ms: t.start_ms,
      end_ms: t.end_ms,
      animation_step_ids: t.animation_step_ids
    })),
    total_duration_ms,
    created_at: new Date().toISOString()
  };

  return {
    success: true,
    segments: audioSegments.map((s) => ({
      segment_id: s.segment_id,
      audio_url: s.audio_url,
      duration_ms: s.duration_ms,
      mime_type: s.mime_type
    })),
    timeline: manifest.timeline,
    total_duration_ms,
    manifest
  };
}

module.exports = {
  generateNarration,
  generateSegmentAudio,
  calculateActualMp3DurationMs,
  splitTextSafely,
  SUPPORTED_LANGUAGES,
  VOICE_CATALOG,
  DEFAULT_MODEL,
  DEFAULT_SPEAKER,
  DEFAULT_LANGUAGE
};
