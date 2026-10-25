"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Play,
  Pause,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  VolumeX,
  FileJson,
  Copy,
  Check,
  Sparkles,
  Sliders,
  ChevronDown,
  Layers,
  Clock,
  Radio,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  generateNarration,
  getAvailableVoices,
  downloadNarration,
  downloadRenderManifest,
  formatDurationMs,
  FALLBACK_VOICES,
  type NarrationSegmentInput,
  type NarrationSegmentOutput,
  type TimelineEntry,
  type RenderManifest,
  type VoiceOption
} from "@/services/narrationService";

export interface NarrationPanelProps {
  segments: NarrationSegmentInput[];
  sourceImage?: any;
  animationSequence?: any[];
  initialManifest?: RenderManifest | null;
  onNarrationGenerated?: (manifest: RenderManifest) => void;
  onActiveSegmentChange?: (segmentId: string | null, animationStepIds: string[]) => void;
  className?: string;
}

type GenerationStatus = "idle" | "generating" | "completed" | "failed";

export function NarrationPanel({
  segments = [],
  sourceImage,
  animationSequence = [],
  initialManifest = null,
  onNarrationGenerated,
  onActiveSegmentChange,
  className
}: NarrationPanelProps) {
  // Voice & Generation Settings
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-IN");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("shubh");
  const [pace, setPace] = useState<number>(1.0);
  const [temperature, setTemperature] = useState<number>(0.6);
  const [voices, setVoices] = useState<VoiceOption[]>(FALLBACK_VOICES);

  // Status & Output Data
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [generatedSegments, setGeneratedSegments] = useState<NarrationSegmentOutput[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [totalDurationMs, setTotalDurationMs] = useState<number>(0);
  const [manifest, setManifest] = useState<RenderManifest | null>(null);

  // Playback State
  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState<boolean>(false);
  const [currentPlaybackTimeMs, setCurrentPlaybackTimeMs] = useState<number>(0);
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);

  // Sync when initialManifest is provided or changes (e.g. preset selection)
  useEffect(() => {
    if (initialManifest && initialManifest.audio_segments && initialManifest.audio_segments.length > 0) {
      setGeneratedSegments(initialManifest.audio_segments);
      setTimeline(initialManifest.timeline || []);
      setTotalDurationMs(initialManifest.total_duration_ms || 0);
      setManifest(initialManifest);
      setStatus("completed");
      if (initialManifest.voice_config?.language_code) {
        setSelectedLanguage(initialManifest.voice_config.language_code);
      }
      if (initialManifest.voice_config?.speaker) {
        setSelectedSpeaker(initialManifest.voice_config.speaker);
      }
    } else {
      setGeneratedSegments([]);
      setTimeline([]);
      setTotalDurationMs(0);
      setManifest(null);
      setStatus("idle");
    }
  }, [initialManifest]);

  // Audio elements & timers refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fullPlaybackIndexRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Load available voices on mount
  useEffect(() => {
    let isMounted = true;
    getAvailableVoices().then((res) => {
      if (isMounted && res.voices && res.voices.length > 0) {
        setVoices(res.voices);
      }
    });
    return () => {
      isMounted = false;
      stopAllAudio();
    };
  }, []);

  // Filter voices by selected language
  const filteredVoices = voices.filter(
    (v) => !v.language || v.language === selectedLanguage || selectedLanguage === "all"
  );

  // Stop any active audio and timers
  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setPlayingSegmentId(null);
    setIsPlayingFull(false);
    if (onActiveSegmentChange) onActiveSegmentChange(null, []);
  };

  // Handle single segment playback
  const handleTogglePlaySegment = (segmentId: string, audioUrl: string) => {
    if (playingSegmentId === segmentId) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingSegmentId(segmentId);

    const timelineItem = timeline.find((t) => t.segment_id === segmentId);
    if (onActiveSegmentChange && timelineItem) {
      onActiveSegmentChange(segmentId, timelineItem.animation_step_ids || []);
    }

    audio.onended = () => {
      setPlayingSegmentId(null);
      if (onActiveSegmentChange) onActiveSegmentChange(null, []);
    };

    audio.onerror = () => {
      toast.error("Audio playback error. Please try again.");
      setPlayingSegmentId(null);
      if (onActiveSegmentChange) onActiveSegmentChange(null, []);
    };

    audio.play().catch((err) => {
      console.warn("Autoplay blocked:", err);
      setPlayingSegmentId(null);
    });
  };

  // Handle full continuous narration playback
  const handlePlayFullNarration = () => {
    if (isPlayingFull) {
      stopAllAudio();
      return;
    }

    if (generatedSegments.length === 0) {
      toast.error("Generate narration audio first.");
      return;
    }

    stopAllAudio();
    setIsPlayingFull(true);
    fullPlaybackIndexRef.current = 0;
    playSequentialSegment(0);
  };

  const playSequentialSegment = (index: number) => {
    if (index >= generatedSegments.length) {
      stopAllAudio();
      return;
    }

    fullPlaybackIndexRef.current = index;
    const seg = generatedSegments[index];
    const timelineEntry = timeline[index];

    setPlayingSegmentId(seg.segment_id);
    if (onActiveSegmentChange && timelineEntry) {
      onActiveSegmentChange(seg.segment_id, timelineEntry.animation_step_ids || []);
    }

    const audio = new Audio(seg.audio_url);
    audioRef.current = audio;

    audio.onended = () => {
      playSequentialSegment(index + 1);
    };

    audio.onerror = () => {
      console.warn(`Segment ${seg.segment_id} failed to play`);
      playSequentialSegment(index + 1);
    };

    audio.play().catch(() => {
      stopAllAudio();
    });
  };

  // Generate narration audio with Sarvam Bulbul V3
  const handleGenerate = async () => {
    if (!segments || segments.length === 0) {
      toast.error("No narration segments found to synthesize.");
      return;
    }

    stopAllAudio();
    setStatus("generating");
    setErrorMessage("");

    try {
      const res = await generateNarration({
        segments,
        language_code: selectedLanguage,
        speaker: selectedSpeaker,
        pace,
        temperature,
        source_image: sourceImage,
        animation_sequence: animationSequence
      });

      if (res.success) {
        setGeneratedSegments(res.segments);
        setTimeline(res.timeline);
        setTotalDurationMs(res.total_duration_ms);
        setManifest(res.manifest || null);
        setStatus("completed");
        toast.success(`Generated narration voiceover (${formatDurationMs(res.total_duration_ms)}) with Sarvam Bulbul V3!`);

        if (onNarrationGenerated && res.manifest) {
          onNarrationGenerated(res.manifest);
        }
      } else {
        throw new Error("Narration generation failed without error details.");
      }
    } catch (err: any) {
      console.error("Narration generation error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to generate narration.";
      setErrorMessage(msg);
      setStatus("failed");
      toast.error(msg);
    }
  };

  // Copy Render Manifest JSON to clipboard
  const handleCopyManifest = () => {
    if (!manifest) return;
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopiedManifest(true);
    toast.success("Render Manifest JSON copied to clipboard!");
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-3xl border border-violet-500/20 bg-gradient-to-b from-[#0f0f17] to-[#09090f] p-5 sm:p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.08)] backdrop-blur-xl font-sans",
        className
      )}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <Mic className="w-5 h-5 text-white" />
            {status === "generating" && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-white">Sarvam Bulbul V3 Voiceover</h3>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[10px] font-black uppercase text-violet-400 tracking-wider">
                24kHz MP3
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Production neural educational narration synchronized with animation timeline
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {status === "idle" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/50 text-xs font-medium text-neutral-300">
              <Radio className="w-3.5 h-3.5 text-neutral-400" /> Ready to Generate
            </span>
          )}
          {status === "generating" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-xs font-semibold text-violet-300 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" /> Synthesizing Audio...
            </span>
          )}
          {status === "completed" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Completed ({formatDurationMs(totalDurationMs)})
            </span>
          )}
          {status === "failed" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-semibold text-rose-300">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Generation Failed
            </span>
          )}
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────── */}
      {status === "failed" && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Narration synthesis error</p>
            <p className="text-rose-300/90 mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={handleGenerate}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Voice & Synthesis Controls ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {/* Language Selection */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block mb-1.5">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={status === "generating"}
            className="w-full bg-[#14141f] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer disabled:opacity-50"
          >
            <option value="en-IN">English (India) — en-IN</option>
            <option value="hi-IN">हिन्दी (Hindi) — hi-IN</option>
          </select>
        </div>

        {/* Voice / Speaker Selection */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block mb-1.5">
            Voice (Speaker)
          </label>
          <select
            value={selectedSpeaker}
            onChange={(e) => setSelectedSpeaker(e.target.value)}
            disabled={status === "generating"}
            className="w-full bg-[#14141f] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer disabled:opacity-50"
          >
            {filteredVoices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.gender}, {v.style})
              </option>
            ))}
          </select>
        </div>

        {/* Pace / Speech Speed */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Pace</label>
            <span className="text-xs font-semibold text-violet-400">{pace.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.4"
            step="0.05"
            value={pace}
            onChange={(e) => setPace(parseFloat(e.target.value))}
            disabled={status === "generating"}
            className="w-full accent-violet-500 cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* Generate / Action Button */}
        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={status === "generating" || segments.length === 0}
            className={cn(
              "w-full h-11 px-4 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg",
              status === "generating"
                ? "bg-violet-600/50 text-white/70 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.98]"
            )}
          >
            {status === "generating" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing...
              </>
            ) : status === "completed" ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Regenerate Audio
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Narration
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Master Narration & Render Manifest Bar ──────────────── */}
      {status === "completed" && generatedSegments.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-neutral-900 border border-violet-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayFullNarration}
              className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] transition cursor-pointer"
              title={isPlayingFull ? "Pause Full Narration" : "Play Full Narration"}
            >
              {isPlayingFull ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                {isPlayingFull ? "Playing Full Narration" : "Play Full Explanation"}
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/30 text-violet-300 font-mono">
                  {generatedSegments.length} Segments
                </span>
              </p>
              <p className="text-[11px] text-neutral-400 font-mono">
                Total Actual Duration: <span className="text-white font-semibold">{formatDurationMs(totalDurationMs)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {manifest && (
              <>
                <button
                  onClick={handleCopyManifest}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition cursor-pointer"
                  title="Copy Merged Render Manifest JSON"
                >
                  {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                  Copy Manifest
                </button>
                <button
                  onClick={() => downloadRenderManifest(manifest)}
                  className="px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-xs font-semibold text-violet-200 flex items-center gap-1.5 transition cursor-pointer"
                  title="Download Manifest JSON"
                >
                  <FileJson className="w-3.5 h-3.5 text-violet-400" />
                  Render Manifest
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Narration Segments Timeline ─────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1">
          <span>Narration Segments ({segments.length})</span>
          <span>Actual Duration / Sync</span>
        </div>

        {segments.map((seg, idx) => {
          const generated = generatedSegments.find((g) => g.segment_id === seg.segment_id);
          const timeEntry = timeline.find((t) => t.segment_id === seg.segment_id);
          const isPlayingThis = playingSegmentId === seg.segment_id;

          return (
            <motion.div
              key={seg.segment_id || idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                isPlayingThis
                  ? "bg-violet-500/15 border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
              )}
            >
              {/* Left Segment Info & Text */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Play/Pause Button */}
                {generated ? (
                  <button
                    onClick={() => handleTogglePlaySegment(seg.segment_id, generated.audio_url)}
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer",
                      isPlayingThis
                        ? "bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                        : "bg-white/[0.08] hover:bg-white/[0.15] text-neutral-300"
                    )}
                  >
                    {isPlayingThis ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] text-neutral-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                    {idx + 1}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-[10px] font-mono text-neutral-300 font-bold">
                      {seg.segment_id}
                    </span>
                    {seg.animation_step_ids && seg.animation_step_ids.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                        step: {seg.animation_step_ids.join(", ")}
                      </span>
                    )}
                    {timeEntry && (
                      <span className="text-[10px] text-neutral-400 font-mono">
                        [{formatDurationMs(timeEntry.start_ms)} → {formatDurationMs(timeEntry.end_ms)}]
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed">
                    {seg.text}
                  </p>
                </div>
              </div>

              {/* Right Duration & Download Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.05]">
                {generated ? (
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400 font-mono">
                      {formatDurationMs(generated.duration_ms)}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      actual duration
                    </p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 font-mono">
                      {seg.estimated_duration ? `${seg.estimated_duration}s est.` : "—"}
                    </p>
                  </div>
                )}

                {generated && (
                  <button
                    onClick={() => downloadNarration(generated.audio_url, `${seg.segment_id}.mp3`)}
                    className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                    title={`Download ${seg.segment_id}.mp3`}
                  >
                    <Download size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
