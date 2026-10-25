const sarvamTtsService = require("../services/sarvamTtsService");
const visualPlanService = require("../services/visualPlanService");

// In-memory job registry for asynchronous tracking if needed
const narrationJobs = new Map();

/**
 * Generate narration audio for visual explanation segments using Sarvam Bulbul V3
 * POST /api/narration/generate
 */
exports.generateNarration = async (req, res) => {
  try {
    const {
      segments,
      language_code = "en-IN",
      speaker = "shubh",
      pace = 1.0,
      temperature = 0.6,
      source_image,
      animation_sequence,
      async_mode = false
    } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: "segments" array is required and must not be empty.',
      });
    }

    // Validate segments structure
    for (const [index, seg] of segments.entries()) {
      if (!seg.segment_id) {
        return res.status(400).json({
          success: false,
          message: `Segment at index ${index} is missing "segment_id".`,
        });
      }
      if (!seg.text || typeof seg.text !== "string" || !seg.text.trim()) {
        return res.status(400).json({
          success: false,
          message: `Segment "${seg.segment_id}" is missing or has empty "text".`,
        });
      }
    }

    // Derive server base URL for local file hosting
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;

    // Handle asynchronous generation if requested for very large jobs
    if (async_mode) {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      narrationJobs.set(jobId, {
        jobId,
        status: "processing",
        progress: 0,
        createdAt: new Date().toISOString()
      });

      // Execute in background
      sarvamTtsService
        .generateNarration(
          { segments, language_code, speaker, pace, temperature, source_image, animation_sequence },
          baseUrl
        )
        .then((result) => {
          narrationJobs.set(jobId, {
            jobId,
            status: "completed",
            result,
            completedAt: new Date().toISOString()
          });
        })
        .catch((err) => {
          narrationJobs.set(jobId, {
            jobId,
            status: "failed",
            error: err.message,
            failedAt: new Date().toISOString()
          });
        });

      return res.status(202).json({
        success: true,
        message: "Narration generation initiated in background.",
        jobId
      });
    }

    // Synchronous execution (standard for visual explanation segments)
    const result = await sarvamTtsService.generateNarration(
      {
        segments,
        language_code,
        speaker,
        pace,
        temperature,
        source_image,
        animation_sequence
      },
      baseUrl
    );

    return res.status(200).json({
      success: true,
      segments: result.segments,
      timeline: result.timeline,
      total_duration_ms: result.total_duration_ms,
      manifest: result.manifest
    });
  } catch (error) {
    console.error("❌ Generate Narration Error:", error.message);

    // Differentiate authentication / config errors (safe, no secrets leaked)
    if (error.message.includes("SARVAM_API_KEY") || error.message.includes("authentication failed")) {
      return res.status(403).json({
        success: false,
        message: "Sarvam AI authentication or configuration error. Please ensure SARVAM_API_KEY is configured in backend environment variables.",
        code: "SARVAM_AUTH_ERROR"
      });
    }

    if (error.message.includes("Validation Error") || error.message.includes("422")) {
      return res.status(422).json({
        success: false,
        message: error.message,
        code: "SARVAM_VALIDATION_ERROR"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate narration audio.",
      code: "SARVAM_GENERATION_FAILED"
    });
  }
};

/**
 * Get available voices, languages, and settings for Sarvam Bulbul V3
 * GET /api/narration/voices
 */
exports.getVoices = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      model: sarvamTtsService.DEFAULT_MODEL,
      defaultLanguage: sarvamTtsService.DEFAULT_LANGUAGE,
      defaultSpeaker: sarvamTtsService.DEFAULT_SPEAKER,
      languages: sarvamTtsService.SUPPORTED_LANGUAGES,
      voices: sarvamTtsService.VOICE_CATALOG
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve voice catalog.",
      error: error.message
    });
  }
};

/**
 * Get status of an asynchronous narration job
 * GET /api/narration/:jobId
 */
exports.getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = narrationJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Narration job "${jobId}" not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch narration job status.",
      error: error.message
    });
  }
};

/**
 * Generate Visual Understanding + Educational Video Plan using OpenRouter Gemini 3.8 Flash
 * POST /api/narration/visual-plan
 */
exports.generateVisualPlan = async (req, res) => {
  try {
    const { imageDataUrl, userRequest, imageMetadata } = req.body;

    if (!imageDataUrl) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: "imageDataUrl" is required.'
      });
    }

    console.log(`[NarrationController] Generating visual plan with Gemini 3.8 Flash for request: "${userRequest || 'Explain me like a 5 year old kid'}"`);

    const plan = await visualPlanService.generateVisualPlan({
      imageDataUrl,
      userRequest: userRequest || "Explain me like a 5 year old kid",
      imageMetadata: imageMetadata || {}
    });

    return res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    console.error("❌ Generate Visual Plan Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate visual explanation plan.",
      code: "VISUAL_PLAN_FAILED"
    });
  }
};

/**
 * Complete End-to-End Pipeline:
 * Upload Image + Prompt -> Gemini 3.8 Flash Visual Plan -> Sarvam Bulbul V3 Audio -> Unified Render Manifest
 * POST /api/narration/explain-image
 */
exports.explainImage = async (req, res) => {
  try {
    const {
      imageDataUrl,
      userRequest = "Explain me like a 5 year old kid",
      imageMetadata = {},
      language_code = "en-IN",
      speaker = "shubh",
      pace = 1.0,
      temperature = 0.6
    } = req.body;

    if (!imageDataUrl) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: "imageDataUrl" is required.'
      });
    }

    console.log(`[NarrationController] explainImage pipeline started for user request: "${userRequest}"`);

    // 1. Generate Schema 2.0 Visual Plan via Gemini 3.8 Flash
    const plan = await visualPlanService.generateVisualPlan({
      imageDataUrl,
      userRequest,
      imageMetadata
    });

    // 2. Synthesize Sarvam Bulbul V3 audio for narration segments
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;

    let ttsResult = null;
    if (plan.narration_segments && plan.narration_segments.length > 0) {
      console.log(`[NarrationController] Synthesizing ${plan.narration_segments.length} narration segments with Sarvam Bulbul V3 [${language_code}, ${speaker}]...`);
      ttsResult = await sarvamTtsService.generateNarration(
        {
          segments: plan.narration_segments,
          language_code,
          speaker,
          pace,
          temperature,
          source_image: {
            url: imageDataUrl,
            width: imageMetadata.width || plan.source_image?.width || 1920,
            height: imageMetadata.height || plan.source_image?.height || 1080
          },
          animation_sequence: plan.animation_sequence
        },
        baseUrl
      );
    }

    // 3. Assemble unified RenderManifest
    const manifest = {
      schema_version: plan.schema_version || "2.0",
      source_image: {
        url: imageDataUrl,
        filename: imageMetadata.filename || "uploaded-image.png",
        width: imageMetadata.width || plan.source_image?.width || 1920,
        height: imageMetadata.height || plan.source_image?.height || 1080,
        coordinate_system: "normalized",
        normalized_width: 1000,
        normalized_height: 1000,
        origin: "top-left"
      },
      user_request: plan.user_request || userRequest,
      explanation: plan.explanation || {
        title: "Visual Explanation",
        difficulty: "General",
        summary: "",
        learning_goal: ""
      },
      objects: plan.objects || [],
      paths: plan.paths || [],
      relationships: plan.relationships || [],
      annotations: plan.annotations || [],
      animation_sequence: plan.animation_sequence || [],
      narration_segments: plan.narration_segments || [],
      audio_segments: ttsResult?.segments || [],
      timeline: ttsResult?.timeline || [],
      total_duration_ms: ttsResult?.total_duration_ms || 10000,
      voice_config: {
        language_code,
        speaker,
        pace,
        temperature,
        speech_sample_rate: 24000,
        output_audio_codec: "mp3"
      },
      validation: plan.validation || { coordinate_confidence: 0.98 },
      created_at: new Date().toISOString()
    };

    console.log(`[NarrationController] explainImage pipeline complete! Duration: ${manifest.total_duration_ms}ms, Objects: ${manifest.objects.length}, Paths: ${manifest.paths.length}`);

    return res.status(200).json({
      success: true,
      manifest,
      plan
    });
  } catch (error) {
    console.error("❌ Explain Image Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process visual explanation and voiceover.",
      code: "EXPLAIN_IMAGE_FAILED"
    });
  }
};
