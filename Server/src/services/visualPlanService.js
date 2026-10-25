const axios = require("axios");

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const PRIMARY_VISION_MODEL = "google/gemini-3.8-flash";
const FALLBACK_VISION_MODELS = [
  "google/gemini-3.8-flash",
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "meta-llama/llama-3.2-90b-vision-instruct"
];

/**
 * Strips markdown code fences or conversational preamble from raw LLM output
 */
function cleanAndParseJson(rawText) {
  if (!rawText || typeof rawText !== "string") return null;

  let cleaned = rawText.trim();
  // Strip markdown fences
  cleaned = cleaned.replace(/^```(?:json)?[ \t]*/im, "").replace(/```[ \t]*$/im, "").trim();

  // Extract outermost { ... }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Basic comma repair
    try {
      const repaired = cleaned.replace(/,[ \t\r\n]*([}\]])/g, "$1");
      return JSON.parse(repaired);
    } catch (_) {
      console.warn("JSON parse failed on cleaned LLM output:", err.message);
      return null;
    }
  }
}

/**
 * Generate Visual Understanding + Educational Video Planning JSON
 * Analyzes the ORIGINAL uploaded image and produces normalized 0-1000 coordinate plan
 */
async function generateVisualPlan({
  imageDataUrl, // data:image/png;base64,... or public URL
  userRequest = "Explain me like a 5 year old kid",
  imageMetadata = {}
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured in backend environment variables.");
  }

  const filename = imageMetadata.filename || "uploaded-image.png";
  const realWidth = parseInt(imageMetadata.width, 10) || 1920;
  const realHeight = parseInt(imageMetadata.height, 10) || 1080;

  const systemPrompt = `You are a Visual Understanding + Educational Video Planning AI.

SOURCE IMAGE:
Filename: ${filename}
REAL SOURCE IMAGE WIDTH: ${realWidth}px
REAL SOURCE IMAGE HEIGHT: ${realHeight}px

USER REQUEST:
${userRequest}

Your task is to analyze the ORIGINAL uploaded image and produce a machine-readable visual explanation plan for a video renderer.

IMPORTANT ARCHITECTURE:

The ORIGINAL UPLOADED IMAGE is the visual source.

The coordinates you return describe positions INSIDE THAT ORIGINAL IMAGE.

The browser, video canvas, aspect ratio, letterboxing, scaling, zoom and device size are NOT part of the coordinate calculation.

DO NOT calculate coordinates from the browser preview.

DO NOT calculate coordinates from a 1000×1000 browser canvas.

DO NOT compensate for black bars or letterboxing.

The renderer handles those later.

==================================================
COORDINATE SYSTEM
==================================================

Return normalized coordinates from 0 to 1000.

(0,0) = top-left of the ORIGINAL IMAGE.

(1000,1000) = bottom-right of the ORIGINAL IMAGE.

Convert from the actual source image dimensions:

normalized_x =
pixel_x / ${realWidth} * 1000

normalized_y =
pixel_y / ${realHeight} * 1000

normalized_width =
pixel_width / ${realWidth} * 1000

normalized_height =
pixel_height / ${realHeight} * 1000

IMPORTANT:

For a bounding box:
x and y = TOP-LEFT corner.

center = separate center coordinate.

Do NOT confuse center with x/y.

==================================================
OBJECTS
==================================================

Detect important visible elements such as:

heading
text
paragraph
rectangle
button
icon
image
person
object
circle
dot
line
arrow
curve
diagram
graph
axis
equation
formula
table
card
screen
window
phone
laptop
keyboard
cursor
flow_node
connection
logo
highlight_region
unknown

Do not invent objects.

For every important object return:

id
type
exact_text when readable
x
y
width
height
center
confidence

==================================================
PATHS
==================================================

For every important visible line, arrow, curve or connector:

return an ordered list of points.

Straight line:
2-5 points.

Curve / irregular / hand-drawn path:
use enough points to reproduce the shape accurately.

Each point uses the same normalized 0-1000 coordinate system.

Example:

{
  "id": "path_01",
  "type": "arrow",
  "points": [
    {"x":320,"y":400},
    {"x":420,"y":420},
    {"x":520,"y":440},
    {"x":620,"y":460}
  ],
  "arrowhead": {
    "x":620,
    "y":460
  },
  "confidence": 0.92
}

==================================================
RELATIONSHIPS
==================================================

Return useful relationships:

associated_with
contains
inside
above
below
left_of
right_of
next_to
connected_to
points_to
sends_to
receives_from
follows
leads_to
part_of

==================================================
USER REQUEST
==================================================

Adapt the explanation to the requested level.

For:
"Explain like I'm 5"

Use very simple language and familiar analogies.

For technical requests:

Preserve the actual technical meaning.

Do not change the meaning of what is shown.

==================================================
ANIMATION
==================================================

Create an animation sequence.

Every animation step must contain:

step_id
duration
target_ids
action
camera
purpose
narration_segment_id

Allowed actions:

fade_in
fade_out
highlight
pulse
zoom
pan
draw
trace
underline
circle
arrow
point
reveal
focus
dim_background
show_label
show_annotation
follow_path
none

Every target_id must refer to an existing object or path.

The animation must operate on the ORIGINAL IMAGE.

Do not recreate the entire image.

Do not redesign the screenshot.

Do not invent replacement diagrams.

==================================================
CAMERA
==================================================

Camera coordinates use the SAME normalized source-image space.

Example:

{
  "mode":"zoom",
  "x":500,
  "y":400,
  "scale":1.3
}

Do not use browser pixels.

==================================================
NARRATION
==================================================

Create narration segments.

Each segment:

segment_id
text
purpose
target_ids
animation_step_ids
estimated_duration

Do not pretend estimated timing is actual audio timing.

==================================================
VALIDATION
==================================================

Before returning JSON, verify:

1. All x values are 0-1000.
2. All y values are 0-1000.
3. All widths/heights are 0-1000.
4. Bounding boxes use top-left x/y.
5. Centers are separate.
6. Paths follow visible lines.
7. IDs are unique.
8. Animation target IDs exist.
9. Path IDs exist.
10. No hallucinated objects.
11. Explanation answers the user's request.
12. Coordinates come from the ORIGINAL SOURCE IMAGE.

==================================================
CRITICAL COORDINATE RULE
==================================================

NEVER modify, offset, shift or compensate coordinates for:

- browser preview
- screen size
- HTML canvas
- player viewport
- letterboxing
- aspect ratio
- video dimensions
- CSS scaling
- camera zoom

The renderer handles those.

==================================================
OUTPUT
==================================================

RETURN ONLY VALID JSON.

NO markdown fences.

NO explanation outside JSON.

Use this structure:

{
  "schema_version": "2.0",

  "source_image": {
    "width": ${realWidth},
    "height": ${realHeight},
    "coordinate_system": "normalized",
    "normalized_width": 1000,
    "normalized_height": 1000,
    "origin": "top-left"
  },

  "user_request": "${userRequest.replace(/"/g, '\\"')}",

  "explanation": {
    "title": "",
    "difficulty": "",
    "summary": "",
    "learning_goal": ""
  },

  "objects": [],

  "paths": [],

  "relationships": [],

  "annotations": [],

  "animation_sequence": [],

  "narration_segments": [],

  "validation": {
    "coordinate_confidence": 0.98,
    "uncertain_elements": [],
    "missing_information": []
  }
}

Return ONLY that JSON.`;

  let lastError = null;

  for (const model of FALLBACK_VISION_MODELS) {
    try {
      console.log(`[VisualPlanService] Calling vision model ${model} via OpenRouter...`);

      const messages = [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ];

      const res = await axios.post(
        OPENROUTER_ENDPOINT,
        {
          model,
          messages,
          temperature: 0.2,
          max_tokens: 4096
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://paperxify.com",
            "X-Title": "Paperxify Visual Engine"
          },
          timeout: 60000
        }
      );

      const rawContent = res.data?.choices?.[0]?.message?.content;
      if (!rawContent) throw new Error("Empty response from vision model.");

      const parsed = cleanAndParseJson(rawContent);
      if (parsed && Array.isArray(parsed.narration_segments) && parsed.narration_segments.length > 0) {
        console.log(`[VisualPlanService] Successfully generated visual plan using ${model} (${parsed.objects?.length || 0} objects, ${parsed.paths?.length || 0} paths, ${parsed.narration_segments.length} narration segments).`);
        return parsed;
      }

      console.warn(`[VisualPlanService] Output from ${model} lacked narration_segments, trying next fallback...`);
    } catch (err) {
      console.warn(`[VisualPlanService] Model ${model} failed:`, err.response?.data || err.message);
      lastError = err;
    }
  }

  throw new Error(`Failed to generate visual explanation plan. All vision models failed. Last error: ${lastError?.message}`);
}

module.exports = {
  generateVisualPlan,
  PRIMARY_VISION_MODEL,
  FALLBACK_VISION_MODELS
};
