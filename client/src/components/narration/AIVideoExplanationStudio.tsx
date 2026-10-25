"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Upload,
  Play,
  RotateCcw,
  Volume2,
  Layers,
  ArrowRight,
  Code,
  FileJson,
  CheckCircle2,
  Image as ImageIcon,
  Mic,
  Bot,
  Wand2,
  Sliders,
  Eye,
  RefreshCw,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  Download,
  Info,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VisualExplanationPlayer } from "@/components/narration/VisualExplanationPlayer";
import { NarrationPanel } from "@/components/narration/NarrationPanel";
import {
  explainImage,
  generateVisualPlan,
  downloadRenderManifest,
  downloadNarration,
  formatDurationMs,
  FALLBACK_VOICES,
  type RenderManifest,
  type NarrationSegmentInput,
  type VisualPlan
} from "@/services/narrationService";

// Built-in educational samples (including the user's TCP 3-Way Handshake)
const SAMPLE_DIAGRAMS = [
  {
    id: "tcp-protocol",
    title: "TCP Three-Way Handshake Protocol",
    description: "Client & Server connection establishment via SYN, SYN+ACK, and ACK segments",
    filename: "working-of-tcp-protocal.webp",
    image: "/diagrams/working-of-tcp-protocol.svg",
    width: 3400,
    height: 2265,
    defaultPrompt: "Explain me like a 5 year old kid",
    language: "en-IN",
    speaker: "shubh"
  },
  {
    id: "system-architecture",
    title: "Microservices Event-Driven Architecture",
    description: "API Gateway routing requests to Microservices and Kafka event stream",
    filename: "microservices-architecture.svg",
    image: "/diagrams/microservices-architecture.svg",
    width: 1920,
    height: 1080,
    defaultPrompt: "Explain this system architecture step by step for junior software engineers",
    language: "en-IN",
    speaker: "shubh"
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis Light Reactions (Bilingual en-IN / hi-IN)",
    description: "Chloroplast thylakoid membrane ATP synthesis and water photolysis",
    filename: "photosynthesis-light-reactions.svg",
    image: "/diagrams/photosynthesis-light-reactions.svg",
    width: 1920,
    height: 1080,
    defaultPrompt: "Explain the light-dependent reactions of photosynthesis in simple Hindi and English",
    language: "hi-IN",
    speaker: "shubh"
  }
];

const PROMPT_SUGGESTIONS = [
  { label: "🧒 Explain like I'm 5", prompt: "Explain me like a 5 year old kid" },
  { label: "🎓 College Exam Prep", prompt: "Break this down with key concepts and exam-ready definitions" },
  { label: "⚙️ Technical Deep Dive", prompt: "Explain step by step with precise technical terminology and packet flow" },
  { label: "⚡ 30-Second Summary", prompt: "Give a rapid high-level summary of the core workflow" },
  { label: "🇮🇳 Bilingual Hindi / Hinglish", prompt: "Explain this concept clearly in simple bilingual Hindi and English" }
];

export function AIVideoExplanationStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uploaded Image State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>(SAMPLE_DIAGRAMS[0].image);
  const [imageMetadata, setImageMetadata] = useState<{
    filename: string;
    width: number;
    height: number;
  }>({
    filename: SAMPLE_DIAGRAMS[0].filename,
    width: SAMPLE_DIAGRAMS[0].width,
    height: SAMPLE_DIAGRAMS[0].height
  });

  // User Prompt State
  const [userPrompt, setUserPrompt] = useState<string>("Explain me like a 5 year old kid");

  // Voice & Language State
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-IN");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("shubh");
  const [speechPace, setSpeechPace] = useState<number>(1.0);

  // Active Manifest & Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>("");
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"player" | "audio" | "plan">("player");

  // Active Manifest state initialized with TCP Protocol preset
  const [activeManifest, setActiveManifest] = useState<RenderManifest>(() => ({
    schema_version: "2.0",
    source_image: {
      url: SAMPLE_DIAGRAMS[0].image,
      filename: SAMPLE_DIAGRAMS[0].filename,
      width: SAMPLE_DIAGRAMS[0].width,
      height: SAMPLE_DIAGRAMS[0].height,
      coordinate_system: "normalized",
      normalized_width: 1000,
      normalized_height: 1000,
      origin: "top-left"
    },
    user_request: "Explain me like a 5 year old kid",
    explanation: {
      title: "Computer Secret Handshake (TCP Protocol)",
      difficulty: "Preschool / Beginner",
      summary: "Two computer pals introduce themselves with a friendly 3-step wave before playing together.",
      learning_goal: "Understand how computers say hello and agree to share data using SYN, SYN-ACK, and ACK."
    },
    objects: [
      { id: "obj_title", type: "heading", exact_text: "Working of the TCP protocol", x: 353, y: 132, width: 294, height: 31, center: { x: 500, y: 147 }, confidence: 0.99 },
      { id: "box_client", type: "rectangle", exact_text: "Client", x: 276, y: 260, width: 144, height: 75, center: { x: 348, y: 297 }, confidence: 0.98 },
      { id: "box_server", type: "rectangle", exact_text: "Server", x: 579, y: 260, width: 144, height: 75, center: { x: 651, y: 297 }, confidence: 0.98 },
      { id: "box_active_open", type: "rectangle", exact_text: "Active Open", x: 182, y: 388, width: 135, height: 130, center: { x: 250, y: 453 }, confidence: 0.97 },
      { id: "box_passive_open", type: "rectangle", exact_text: "Passive Open", x: 682, y: 388, width: 135, height: 130, center: { x: 750, y: 453 }, confidence: 0.97 },
      { id: "txt_syn", type: "text", exact_text: "1. SYN Segment", x: 475, y: 365, width: 140, height: 34, center: { x: 545, y: 387 }, confidence: 0.96 },
      { id: "txt_syn_ack", type: "text", exact_text: "2. SYN + ACK Segment", x: 380, y: 460, width: 180, height: 34, center: { x: 470, y: 482 }, confidence: 0.96 },
      { id: "txt_ack", type: "text", exact_text: "3. ACK Segment", x: 475, y: 575, width: 140, height: 34, center: { x: 545, y: 597 }, confidence: 0.96 }
    ],
    paths: [
      { id: "path_client_line", type: "line", points: [{ x: 348, y: 335 }, { x: 348, y: 730 }], confidence: 0.98 },
      { id: "path_server_line", type: "line", points: [{ x: 651, y: 335 }, { x: 651, y: 730 }], confidence: 0.98 },
      { id: "path_arrow_syn", type: "arrow", points: [{ x: 348, y: 372 }, { x: 643, y: 423 }], arrowhead: { x: 643, y: 423 }, confidence: 0.97 },
      { id: "path_arrow_syn_ack", type: "arrow", points: [{ x: 651, y: 473 }, { x: 356, y: 517 }], arrowhead: { x: 356, y: 517 }, confidence: 0.97 },
      { id: "path_arrow_ack", type: "arrow", points: [{ x: 348, y: 585 }, { x: 643, y: 633 }], arrowhead: { x: 643, y: 633 }, confidence: 0.97 }
    ],
    annotations: [
      { id: "ann_1", target_id: "path_arrow_syn", text: "Step 1: 'Can we talk?' (SYN)" },
      { id: "ann_2", target_id: "path_arrow_syn_ack", text: "Step 2: 'Yes, I hear you! Can you hear me?' (SYN-ACK)" },
      { id: "ann_3", target_id: "path_arrow_ack", text: "Step 3: 'Awesome, connection ready!' (ACK)" }
    ],
    animation_sequence: [
      { step_id: "anim_1", duration: 3.5, target_ids: ["box_client", "box_server"], action: "highlight", camera: { mode: "zoom", x: 500, y: 300, scale: 1.25 }, purpose: "Introduce the Client and Server pals.", narration_segment_id: "narr_1" },
      { step_id: "anim_2", duration: 4.0, target_ids: ["path_arrow_syn", "txt_syn"], action: "draw", camera: { mode: "pan", x: 500, y: 400, scale: 1.25 }, purpose: "Show the first greeting sent across.", narration_segment_id: "narr_2" },
      { step_id: "anim_3", duration: 4.0, target_ids: ["path_arrow_syn_ack", "txt_syn_ack"], action: "draw", camera: { mode: "pan", x: 500, y: 500, scale: 1.25 }, purpose: "Show the server waving back.", narration_segment_id: "narr_3" },
      { step_id: "anim_4", duration: 4.0, target_ids: ["path_arrow_ack", "txt_ack"], action: "draw", camera: { mode: "pan", x: 500, y: 600, scale: 1.15 }, purpose: "Confirm they are both ready to transfer data.", narration_segment_id: "narr_4" }
    ],
    narration_segments: [
      { segment_id: "narr_1", text: "Meet two computer pals! The Client wants to talk, and the Server is waiting to listen.", purpose: "Character introduction", target_ids: ["box_client", "box_server"], animation_step_ids: ["anim_1"], estimated_duration: 3.5 },
      { segment_id: "narr_2", text: "First, your computer sends a wave: 'Hi! Can you hear me?' That is the SYN segment.", purpose: "Explain SYN", target_ids: ["path_arrow_syn", "txt_syn"], animation_step_ids: ["anim_2"], estimated_duration: 4.0 },
      { segment_id: "narr_3", text: "The server waves back: 'Yes, I hear you! Can you hear me too?' That is the SYN plus ACK reply.", purpose: "Explain SYN-ACK", target_ids: ["path_arrow_syn_ack", "txt_syn_ack"], animation_step_ids: ["anim_3"], estimated_duration: 4.0 },
      { segment_id: "narr_4", text: "Finally, your computer cheers: 'Yes! Now let's share data!' That is the TCP three-way handshake.", purpose: "Explain final ACK", target_ids: ["path_arrow_ack", "txt_ack"], animation_step_ids: ["anim_4"], estimated_duration: 4.0 }
    ],
    audio_segments: [
      { segment_id: "narr_1", audio_url: "https://cdn.pro.paperxify.com/narration/3b2032343df2fc3da4abaf378161871453c1ecf9a2aade34fc92480beef8f0be.mp3", duration_ms: 3120, mime_type: "audio/mpeg" },
      { segment_id: "narr_2", audio_url: "https://cdn.pro.paperxify.com/narration/9d5cb17d99a19aa314995ff29bd07ccb990ab81ca135c479506b2d4ff630fcf9.mp3", duration_ms: 5424, mime_type: "audio/mpeg" },
      { segment_id: "narr_3", audio_url: "https://cdn.pro.paperxify.com/narration/d704b6559e611d4a180fe89f3f93e1ef9cc8b94c1d127921cb27843cd8b7b65a.mp3", duration_ms: 8088, mime_type: "audio/mpeg" },
      { segment_id: "narr_4", audio_url: "https://cdn.pro.paperxify.com/narration/e7f324bcb58f369959c267b702767a6004de5863e0ebe5aa249da5df25888e8d.mp3", duration_ms: 7320, mime_type: "audio/mpeg" }
    ],
    timeline: [
      { segment_id: "narr_1", start_ms: 0, end_ms: 3120, animation_step_ids: ["anim_1"] },
      { segment_id: "narr_2", start_ms: 3120, end_ms: 8544, animation_step_ids: ["anim_2"] },
      { segment_id: "narr_3", start_ms: 8544, end_ms: 16632, animation_step_ids: ["anim_3"] },
      { segment_id: "narr_4", start_ms: 16632, end_ms: 23952, animation_step_ids: ["anim_4"] }
    ],
    total_duration_ms: 23952,
    voice_config: {
      language_code: "en-IN",
      speaker: "shubh",
      pace: 1.0,
      temperature: 0.6,
      speech_sample_rate: 24000,
      output_audio_codec: "mp3"
    }
  }));

  // Handle Local File Upload
  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WebP, SVG).");
      return;
    }

    setSelectedImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);

      // Extract real image pixel dimensions
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || 1920;
        const height = img.naturalHeight || 1080;
        setImageMetadata({
          filename: file.name,
          width,
          height
        });
        toast.success(`Image loaded: ${file.name} (${width} × ${height}px)`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Select pre-loaded sample
  const handleSelectSample = (sample: typeof SAMPLE_DIAGRAMS[0]) => {
    setSelectedImageFile(null);
    setImageDataUrl(sample.image);
    setImageMetadata({
      filename: sample.filename,
      width: sample.width,
      height: sample.height
    });
    setUserPrompt(sample.defaultPrompt);
    setSelectedLanguage(sample.language);
    setSelectedSpeaker(sample.speaker);
    toast.info(`Selected sample: ${sample.title}`);
  };

  // Unified Generate Pipeline: Gemini 3.8 Flash Vision + Sarvam Bulbul V3 Voiceover
  const handleGenerate = async () => {
    if (!imageDataUrl) {
      toast.error("Please upload an image first.");
      return;
    }

    if (!userPrompt.trim()) {
      toast.error("Please provide an explanation prompt.");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(20);
    setGenerationStage("Analyzing image with OpenRouter Gemini 3.8 Flash...");

    try {
      // Stage 1 update
      const stageTimer1 = setTimeout(() => {
        setGenerationProgress(55);
        setGenerationStage("Detecting objects, coordinates (0-1000) & animation steps...");
      }, 3000);

      // Stage 2 update
      const stageTimer2 = setTimeout(() => {
        setGenerationProgress(80);
        setGenerationStage("Synthesizing educational voiceover with Sarvam Bulbul V3...");
      }, 7000);

      const res = await explainImage({
        imageDataUrl,
        userRequest: userPrompt,
        imageMetadata,
        language_code: selectedLanguage,
        speaker: selectedSpeaker,
        pace: speechPace,
        temperature: 0.6
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      setGenerationProgress(100);
      setGenerationStage("Assembling synchronized video manifest...");

      if (res.success && res.manifest) {
        setActiveManifest(res.manifest);
        toast.success(
          `AI Video Explanation Ready! (${res.manifest.narration_segments?.length || 0} segments, ${Math.round((res.manifest.total_duration_ms || 0) / 1000)}s audio)`
        );
      } else {
        throw new Error("Invalid response format received from explanation pipeline.");
      }
    } catch (err: any) {
      console.error("Pipeline generation failed:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to generate video explanation.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStage("");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-sans">
      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-violet-500/20 bg-gradient-to-br from-violet-950/35 via-[#0e0e18] to-[#07070d] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 3.8 Flash + Sarvam Bulbul V3 Engine
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            AI Video Explanation Studio
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Upload any textbook diagram, architecture diagram, flowchart, or whiteboard screenshot.
            Gemini 3.8 Flash analyzes visible elements with normalized coordinates, and Sarvam Bulbul V3 synthesizes
            lifelike Indic voiceover synchronized to camera pan/zoom animations.
          </p>
        </div>

        {/* System Capability Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Vision Model</p>
            <p className="text-sm font-bold text-white mt-0.5">gemini-3.8-flash</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Voice Synthesis</p>
            <p className="text-sm font-bold text-violet-400 mt-0.5">Sarvam Bulbul V3</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Coordinates</p>
            <p className="text-sm font-bold text-cyan-400 mt-0.5">0-1000 Normalized</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Sync Precision</p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">Actual Duration ms</p>
          </div>
        </div>
      </div>

      {/* ── Step 1: Input Setup (Local Image Upload + Prompt + Voice) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Uploader (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">1</span>
              Source Image & Visual Source
            </h2>
            <span className="text-xs text-neutral-500 font-mono">
              {imageMetadata.width} × {imageMetadata.height}px
            </span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative rounded-3xl border-2 border-dashed transition-all cursor-pointer p-6 flex flex-col items-center justify-center text-center overflow-hidden group min-h-[220px]",
              imageDataUrl
                ? "border-violet-500/40 bg-[#0c0c16]/90 hover:border-violet-400"
                : "border-white/15 bg-white/[0.02] hover:border-violet-500/50 hover:bg-violet-500/[0.03]"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {imageDataUrl ? (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="relative max-h-48 max-w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/50">
                  <img
                    src={imageDataUrl}
                    alt="Source Preview"
                    className="max-h-48 w-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                    <Upload size={14} /> Click or Drop to Replace
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="font-semibold text-white truncate max-w-xs">{imageMetadata.filename}</span>
                  <span>•</span>
                  <span className="text-violet-400 font-mono">{imageMetadata.width} × {imageMetadata.height} px</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-bold text-white mt-1">Upload Diagram or Diagram Image</p>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Drag and drop local PNG, JPG, WebP, or SVG from your computer
                </p>
              </div>
            )}
          </div>

          {/* Quick Preset Diagrams Picker */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Or pick an instant educational sample:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_DIAGRAMS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={cn(
                    "p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 text-xs",
                    imageMetadata.filename === sample.filename
                      ? "bg-violet-500/15 border-violet-500/60 text-white"
                      : "bg-[#0b0b12] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/20"
                  )}
                >
                  <span className="font-bold truncate">{sample.title}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">{sample.width}×{sample.height}px</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt & Voice Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">2</span>
                Explanation Prompt & Voice
              </h2>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>User Request / Instruction:</span>
                <span className="text-[10px] text-violet-400 font-mono">Dynamic Prompts</span>
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. Explain me like a 5 year old kid"
                rows={3}
                className="w-full rounded-2xl bg-[#0c0c16] border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  onClick={() => setUserPrompt(sug.prompt)}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-violet-500/15 hover:border-violet-500/40 border border-white/[0.06] text-[11px] text-neutral-300 hover:text-violet-300 transition cursor-pointer"
                >
                  {sug.label}
                </button>
              ))}
            </div>

            {/* Voice & Language Settings Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-400">Language:</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-xl bg-[#0c0c16] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi (हिन्दी)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-400">Speaker Voice:</label>
                <select
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                  className="w-full rounded-xl bg-[#0c0c16] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  {FALLBACK_VOICES.filter((v) => v.language === selectedLanguage).map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name} ({voice.gender})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Speech Pace Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Speech Pace:</span>
                <span className="font-mono text-white font-bold">{speechPace}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speechPace}
                onChange={(e) => setSpeechPace(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !imageDataUrl}
              className={cn(
                "w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer",
                isGenerating || !imageDataUrl
                  ? "bg-violet-900/40 text-violet-400/50 cursor-not-allowed border border-violet-500/20"
                  : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98]"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{generationStage || "Generating AI Video Explanation..."}</span>
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  <span>Generate AI Video Explanation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar during generation */}
      {isGenerating && (
        <div className="space-y-2 p-4 rounded-2xl bg-violet-950/40 border border-violet-500/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-violet-300 font-semibold flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {generationStage}
            </span>
            <span className="font-mono text-violet-400 font-bold">{generationProgress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${generationProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* ── Step 2: Synchronized Visual Video Player ───────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">3</span>
            Interactive Animated Video Player
          </h2>
          <div className="flex items-center gap-2">
            {activeManifest?.explanation?.title && (
              <span className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-xs font-bold text-violet-300">
                {activeManifest.explanation.title}
              </span>
            )}
            <button
              onClick={() => downloadRenderManifest(activeManifest, `${imageMetadata.filename || "plan"}-manifest.json`)}
              className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileJson size={13} /> Export JSON
            </button>
          </div>
        </div>

        {/* Video Player */}
        <VisualExplanationPlayer
          manifest={activeManifest}
          onGenerateClick={handleGenerate}
        />
      </div>

      {/* ── Step 3: Explanation Insights & Inspection Tabs ────── */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2">
          <button
            onClick={() => setActiveTab("player")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer",
              activeTab === "player"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Play size={14} /> Storyboard & Animation Steps ({activeManifest.animation_sequence?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("audio")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer",
              activeTab === "audio"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Mic size={14} /> Sarvam Audio Segments ({activeManifest.audio_segments?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("plan")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer",
              activeTab === "plan"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Layers size={14} /> Schema 2.0 Visual Plan ({activeManifest.objects?.length || 0} Objects, {activeManifest.paths?.length || 0} Paths)
          </button>
        </div>

        {/* Tab 1: Storyboard & Animation Steps */}
        {activeTab === "player" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeManifest.animation_sequence?.map((step, idx) => {
              const narr = activeManifest.narration_segments?.find(
                (n) => n.segment_id === step.narration_segment_id || n.animation_step_ids?.includes(step.step_id)
              );
              const audioSeg = activeManifest.audio_segments?.find(
                (a) => a.segment_id === step.narration_segment_id || a.segment_id === narr?.segment_id
              );

              return (
                <div
                  key={step.step_id || idx}
                  className="p-4 rounded-2xl bg-[#0b0b12] border border-white/[0.08] hover:border-violet-500/40 transition flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-violet-600/80 text-white flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        {step.label || `Step: ${step.step_id}`}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-mono text-violet-300">
                        {step.action || "highlight"}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed font-sans line-clamp-3">
                      {narr?.text || step.purpose || "Visual animation step"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-white/[0.05] font-mono">
                    <span>Targets: {step.target_ids?.length || 0} element(s)</span>
                    <span className="text-emerald-400 font-bold">
                      {audioSeg?.duration_ms ? `${Math.round(audioSeg.duration_ms / 1000)}s` : `${step.duration || 3}s`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Sarvam Audio Segments */}
        {activeTab === "audio" && (
          <div className="space-y-3">
            <NarrationPanel
              segments={activeManifest.narration_segments || []}
              sourceImage={{ url: activeManifest.source_image?.url }}
              animationSequence={activeManifest.animation_sequence}
              initialManifest={activeManifest}
              onNarrationGenerated={(manifest) => setActiveManifest(manifest)}
            />
          </div>
        )}

        {/* Tab 3: Visual Plan Inspector (Schema 2.0) */}
        {activeTab === "plan" && (
          <div className="space-y-4">
            {/* Overview metadata card */}
            <div className="p-5 rounded-3xl bg-[#0b0b12] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-400" />
                  Gemini 3.8 Flash Vision Understanding Summary
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                  Schema 2.0 Validated
                </span>
              </div>

              {activeManifest.explanation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-neutral-500 block">Title:</span>
                    <span className="text-white font-semibold">{activeManifest.explanation.title}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Difficulty:</span>
                    <span className="text-violet-300 font-semibold">{activeManifest.explanation.difficulty || "General"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-neutral-500 block">Summary:</span>
                    <span className="text-neutral-300">{activeManifest.explanation.summary}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Objects & Paths Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Detected Objects Table */}
              <div className="p-4 rounded-3xl bg-[#0b0b12] border border-white/[0.08] space-y-3">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={14} className="text-violet-400" />
                  Detected Objects ({activeManifest.objects?.length || 0})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {activeManifest.objects?.map((obj) => (
                    <div
                      key={obj.id}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">{obj.exact_text || obj.id}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">type: {obj.type}</span>
                      </div>
                      <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md">
                        ({obj.x}, {obj.y}, {obj.width}x{obj.height})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Paths Table */}
              <div className="p-4 rounded-3xl bg-[#0b0b12] border border-white/[0.08] space-y-3">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <ArrowRight size={14} className="text-cyan-400" />
                  Detected Paths & Arrows ({activeManifest.paths?.length || 0})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {activeManifest.paths?.map((path) => (
                    <div
                      key={path.id}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">{path.id}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">type: {path.type}</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                        {path.points?.length || 0} pts {path.arrowhead ? "• arrowhead" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Architecture Guide Card ───────────────────────────── */}
      <div className="p-6 rounded-3xl bg-[#0b0b12] border border-white/[0.08] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-violet-400" />
          End-to-End Visual Planning Architecture
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          1. <strong>Original Image Source:</strong> Coordinates are computed strictly relative to the original source image dimensions ({imageMetadata.width} × {imageMetadata.height}px) and normalized to 0–1000 without letterbox distortion.<br />
          2. <strong>Sarvam AI Bulbul V3:</strong> Synthesizes natural voice audio for all narration segments, calculates exact MP3 frame durations, and matches the video timeline to eliminate audio drift.<br />
          3. <strong>SVG & Camera Rendering:</strong> The visual player applies CSS transform zooming to focal coordinates and renders SVG vector arrows with synchronized glowing animations.
        </p>
      </div>
    </div>
  );
}
