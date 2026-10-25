import api from "@/config/api";

export interface NarrationSegmentInput {
  segment_id: string;
  text: string;
  estimated_duration?: number; // In seconds or ms
  animation_step_ids?: string[];
  purpose?: string;
  target_ids?: string[];
}

export interface NarrationSegmentOutput {
  segment_id: string;
  audio_url: string;
  duration_ms: number;
  mime_type: string;
}

export interface TimelineEntry {
  segment_id: string;
  start_ms: number;
  end_ms: number;
  animation_step_ids: string[];
  sync_strategy?: "exact" | "extend_pause" | "sustain";
  duration_ms?: number;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  language: string;
  style: string;
  isDefault?: boolean;
}

export interface VisualObject {
  id: string;
  type: string;
  exact_text?: string;
  x: number; // 0-1000 normalized
  y: number; // 0-1000 normalized
  width: number; // 0-1000 normalized
  height: number; // 0-1000 normalized
  center?: { x: number; y: number };
  confidence?: number;
}

export interface VisualPathPoint {
  x: number; // 0-1000
  y: number; // 0-1000
}

export interface VisualPath {
  id: string;
  type: "line" | "arrow" | "curve" | string;
  points: VisualPathPoint[];
  arrowhead?: { x: number; y: number };
  confidence?: number;
}

export interface VisualRelationship {
  from_id: string;
  to_id: string;
  type: string;
}

export interface VisualAnnotation {
  id: string;
  target_id: string;
  text: string;
}

export interface CameraConfig {
  mode: "zoom" | "pan" | "static" | string;
  x: number; // 0-1000
  y: number; // 0-1000
  scale: number;
}

export interface AnimationStep {
  step_id: string;
  duration?: number;
  target_ids?: string[];
  action?: string;
  camera?: CameraConfig;
  purpose?: string;
  narration_segment_id?: string;
  bounds?: { x: number; y: number; width: number; height: number };
  label?: string;
  highlight_color?: string;
  [key: string]: any;
}

export interface ExplanationMeta {
  title: string;
  difficulty?: string;
  summary?: string;
  learning_goal?: string;
}

export interface VisualPlan {
  schema_version: string;
  source_image: {
    url?: string;
    filename?: string;
    width: number;
    height: number;
    coordinate_system: string;
    normalized_width: number;
    normalized_height: number;
    origin: string;
  };
  user_request: string;
  explanation: ExplanationMeta;
  objects: VisualObject[];
  paths: VisualPath[];
  relationships: VisualRelationship[];
  annotations: VisualAnnotation[];
  animation_sequence: AnimationStep[];
  narration_segments: NarrationSegmentInput[];
  validation?: {
    coordinate_confidence?: number;
    uncertain_elements?: any[];
    missing_information?: any[];
  };
}

export interface RenderManifest {
  version?: string;
  schema_version?: string;
  model?: string;
  voice_config?: {
    language_code: string;
    speaker: string;
    pace: number;
    temperature: number;
    speech_sample_rate: number;
    output_audio_codec: string;
  };
  source_image?: {
    url?: string;
    filename?: string;
    width?: number;
    height?: number;
    coordinate_system?: string;
    normalized_width?: number;
    normalized_height?: number;
    origin?: string;
    [key: string]: any;
  };
  user_request?: string;
  explanation?: ExplanationMeta;
  objects?: VisualObject[];
  paths?: VisualPath[];
  relationships?: VisualRelationship[];
  annotations?: VisualAnnotation[];
  animation_sequence?: AnimationStep[];
  audio_segments?: NarrationSegmentOutput[];
  narration_segments?: NarrationSegmentInput[];
  timeline?: TimelineEntry[];
  total_duration_ms?: number;
  validation?: any;
  created_at?: string;
}

export interface GenerateNarrationParams {
  segments: NarrationSegmentInput[];
  language_code?: string;
  speaker?: string;
  pace?: number;
  temperature?: number;
  source_image?: any;
  animation_sequence?: any[];
  async_mode?: boolean;
}

export interface ExplainImageParams {
  imageDataUrl: string;
  userRequest?: string;
  imageMetadata?: {
    filename?: string;
    width?: number;
    height?: number;
  };
  language_code?: string;
  speaker?: string;
  pace?: number;
  temperature?: number;
}

export interface ExplainImageResponse {
  success: boolean;
  manifest: RenderManifest;
  plan: VisualPlan;
}

export interface GenerateNarrationResponse {
  success: boolean;
  segments: NarrationSegmentOutput[];
  timeline: TimelineEntry[];
  total_duration_ms: number;
  manifest?: RenderManifest;
  jobId?: string;
}

export interface VoiceCatalogResponse {
  success: boolean;
  model: string;
  defaultLanguage: string;
  defaultSpeaker: string;
  languages: Record<string, { code: string; name: string; nativeName: string; defaultSpeaker: string; supportedSpeakers: string[] }>;
  voices: VoiceOption[];
}

/**
 * Fallback static voices for instant UI render
 */
export const FALLBACK_VOICES: VoiceOption[] = [
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
 * Complete Pipeline: Send user-uploaded image + prompt to Gemini 3.8 Flash & synthesize Sarvam Bulbul V3 voiceover
 */
export async function explainImage(params: ExplainImageParams): Promise<ExplainImageResponse> {
  const response = await api.post("/narration/explain-image", {
    imageDataUrl: params.imageDataUrl,
    userRequest: params.userRequest || "Explain me like a 5 year old kid",
    imageMetadata: params.imageMetadata || {},
    language_code: params.language_code || "en-IN",
    speaker: params.speaker || "shubh",
    pace: params.pace ?? 1.0,
    temperature: params.temperature ?? 0.6
  });

  return response.data;
}

/**
 * Generate Visual Plan only (Schema 2.0 objects, paths, steps, narration text) using Gemini 3.8 Flash
 */
export async function generateVisualPlan(params: {
  imageDataUrl: string;
  userRequest?: string;
  imageMetadata?: { filename?: string; width?: number; height?: number };
}): Promise<{ success: boolean; plan: VisualPlan }> {
  const response = await api.post("/narration/visual-plan", {
    imageDataUrl: params.imageDataUrl,
    userRequest: params.userRequest || "Explain me like a 5 year old kid",
    imageMetadata: params.imageMetadata || {}
  });

  return response.data;
}

/**
 * Call backend to generate synchronized Sarvam Bulbul V3 narration audio
 */
export async function generateNarration(params: GenerateNarrationParams): Promise<GenerateNarrationResponse> {
  const response = await api.post("/narration/generate", {
    segments: params.segments,
    language_code: params.language_code || "en-IN",
    speaker: params.speaker || "shubh",
    pace: params.pace ?? 1.0,
    temperature: params.temperature ?? 0.6,
    source_image: params.source_image,
    animation_sequence: params.animation_sequence,
    async_mode: params.async_mode ?? false
  });

  return response.data;
}



/**
 * Fetch voice catalog and supported languages from backend
 */
export async function getAvailableVoices(): Promise<VoiceCatalogResponse> {
  try {
    const response = await api.get("/narration/voices");
    return response.data;
  } catch (err) {
    return {
      success: true,
      model: "bulbul:v3",
      defaultLanguage: "en-IN",
      defaultSpeaker: "shubh",
      languages: {
        "en-IN": { code: "en-IN", name: "English (India)", nativeName: "English (India)", defaultSpeaker: "shubh", supportedSpeakers: ["shubh", "priya", "aditya", "ritu", "rohan", "simran"] },
        "hi-IN": { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी", defaultSpeaker: "shubh", supportedSpeakers: ["shubh", "neha", "rahul", "pooja", "kavya", "amit", "dev"] }
      },
      voices: FALLBACK_VOICES
    };
  }
}

/**
 * Poll job status for asynchronous long-form narration generation
 */
export async function getNarrationStatus(jobId: string): Promise<any> {
  const response = await api.get(`/narration/${jobId}`);
  return response.data;
}

/**
 * Play a specific audio segment
 */
export function playNarration(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.play().catch((err) => {
    console.warn("Audio playback interrupted or blocked by autoplay policy:", err);
  });
  return audio;
}

/**
 * Download generated audio file or trigger browser download
 */
export function downloadNarration(audioUrl: string, filename = "narration.mp3"): void {
  const anchor = document.createElement("a");
  anchor.href = audioUrl;
  anchor.download = filename;
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Download complete Render Manifest as JSON file
 */
export function downloadRenderManifest(manifest: RenderManifest, filename = "render-manifest.json"): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
  const anchor = document.createElement("a");
  anchor.href = dataStr;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Formats duration in milliseconds to "MM:SS" or "SS.s"
 */
export function formatDurationMs(ms: number): string {
  if (!ms || isNaN(ms)) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${seconds}.${tenths}s`;
}
