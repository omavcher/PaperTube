"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Subtitles,
  Loader2,
  AlertCircle,
  Camera,
  FastForward,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDurationMs, type RenderManifest } from "@/services/narrationService";

export interface VisualExplanationPlayerProps {
  manifest: RenderManifest;
  onGenerateClick?: () => void;
  className?: string;
}

export function VisualExplanationPlayer({
  manifest,
  onGenerateClick,
  className
}: VisualExplanationPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentMs, setCurrentMs] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);

  const totalDurationMs = manifest?.total_duration_ms || 10000;
  const timeline = manifest?.timeline || [];
  const audioSegments = manifest?.audio_segments || [];
  const animationSequence = manifest?.animation_sequence || [];
  const sourceImage = manifest?.source_image;
  const narrationSegments = manifest?.narration_segments || [];

  const hasAudio = audioSegments.length > 0;

  // Active timeline segment based on currentMs
  const activeTimelineEntry = timeline.find(
    (t) => currentMs >= t.start_ms && currentMs < t.end_ms
  ) || timeline[timeline.length - 1] || timeline[0];

  const activeSegmentId = activeTimelineEntry?.segment_id;
  const activeAnimationStepIds = activeTimelineEntry?.animation_step_ids || [];

  // Active visual step definition
  const activeStep = animationSequence.find(
    (step) => activeAnimationStepIds.includes(step.step_id || (step as any).id)
  ) || animationSequence[0];

  // Active audio segment
  const activeAudio = audioSegments.find((a) => a.segment_id === activeSegmentId);

  // Active narration text for subtitles
  const activeNarration = narrationSegments.find((s) => s.segment_id === activeSegmentId);

  // Clean stop for audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
  }, []);

  // Stop audio whenever manifest changes (e.g. user selected another preset)
  useEffect(() => {
    stopAudio();
    setIsPlaying(false);
    setCurrentMs(0);
  }, [manifest, stopAudio]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Play audio for a specific segment at an offset
  const playSegmentAudio = useCallback(
    (segmentIndex: number, offsetMs: number = 0) => {
      if (segmentIndex >= timeline.length || !hasAudio) {
        setIsPlaying(false);
        stopAudio();
        return;
      }

      const timeEntry = timeline[segmentIndex];
      const audioSeg = audioSegments.find((a) => a.segment_id === timeEntry.segment_id);

      if (!audioSeg?.audio_url) {
        console.warn(`[VisualPlayer] No audio URL for segment ${timeEntry.segment_id}`);
        // Advance to next segment if missing
        playSegmentAudio(segmentIndex + 1, 0);
        return;
      }

      stopAudio();
      setAudioLoading(true);

      const audio = new Audio(audioSeg.audio_url);
      audio.muted = isMuted;
      audioRef.current = audio;

      const offsetSec = Math.max(0, offsetMs / 1000);

      audio.oncanplay = () => {
        setAudioLoading(false);
        if (offsetSec > 0 && offsetSec < audio.duration) {
          audio.currentTime = offsetSec;
        }
        audio.play().catch((err) => {
          console.warn("[VisualPlayer] Playback error or autoplay blocked:", err);
          setIsPlaying(false);
          setAudioLoading(false);
        });
      };

      audio.ontimeupdate = () => {
        const segElapsedMs = Math.round(audio.currentTime * 1000);
        const globalMs = timeEntry.start_ms + segElapsedMs;
        setCurrentMs(Math.min(globalMs, totalDurationMs));
      };

      audio.onended = () => {
        if (segmentIndex + 1 < timeline.length) {
          playSegmentAudio(segmentIndex + 1, 0);
        } else {
          setIsPlaying(false);
          setCurrentMs(totalDurationMs);
          stopAudio();
        }
      };

      audio.onerror = (e) => {
        console.error("[VisualPlayer] Audio loading error:", e);
        setAudioLoading(false);
        if (segmentIndex + 1 < timeline.length) {
          playSegmentAudio(segmentIndex + 1, 0);
        } else {
          setIsPlaying(false);
          stopAudio();
        }
      };

      audio.load();
    },
    [timeline, audioSegments, hasAudio, isMuted, stopAudio, totalDurationMs]
  );

  // Play / Pause toggle
  const togglePlay = () => {
    if (!hasAudio) {
      if (onGenerateClick) onGenerateClick();
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      const startingMs = currentMs >= totalDurationMs ? 0 : currentMs;
      setCurrentMs(startingMs);
      setIsPlaying(true);

      // Find which segment covers startingMs
      const segIndex = timeline.findIndex(
        (t) => startingMs >= t.start_ms && startingMs < t.end_ms
      );
      const safeIndex = segIndex >= 0 ? segIndex : 0;
      const offsetMs = startingMs - (timeline[safeIndex]?.start_ms || 0);

      playSegmentAudio(safeIndex, offsetMs);
    }
  };

  // Timeline Scrubber Seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetMs = parseInt(e.target.value, 10);
    setCurrentMs(targetMs);

    if (isPlaying && hasAudio) {
      const segIndex = timeline.findIndex(
        (t) => targetMs >= t.start_ms && targetMs < t.end_ms
      );
      const safeIndex = segIndex >= 0 ? segIndex : 0;
      const offsetMs = targetMs - (timeline[safeIndex]?.start_ms || 0);
      playSegmentAudio(safeIndex, offsetMs);
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const [enableCameraZoom, setEnableCameraZoom] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const objects = manifest?.objects || [];
  const paths = manifest?.paths || [];
  const annotations = manifest?.annotations || [];

  // Compute targeted objects and paths for active step
  const targetedObjects = objects.filter((obj) =>
    activeStep?.target_ids?.includes(obj.id)
  );
  const targetedPaths = paths.filter((path) =>
    activeStep?.target_ids?.includes(path.id)
  );

  // Active annotations matching targets
  const activeAnnotations = annotations.filter((ann) =>
    activeStep?.target_ids?.includes(ann.target_id)
  );

  // Camera transform calculations
  const cameraScale =
    enableCameraZoom && activeStep?.camera?.scale
      ? Math.max(1, Math.min(activeStep.camera.scale, 2.0))
      : 1.0;
  const cameraOriginX =
    activeStep?.camera?.x != null ? activeStep.camera.x / 10 : 50;
  const cameraOriginY =
    activeStep?.camera?.y != null ? activeStep.camera.y / 10 : 50;

  // Apply playback speed to active audio element
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-3xl overflow-hidden border border-violet-500/25 bg-[#07070d] text-white shadow-2xl flex flex-col font-sans select-none",
        className
      )}
    >
      {/* ── Visual Stage Area ───────────────────────────────────── */}
      <div className="relative w-full aspect-video bg-[#050508] flex items-center justify-center overflow-hidden">
        {/* Dynamic Zoom & Pan Camera Wrapper */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
          style={{
            transformOrigin: `${cameraOriginX}% ${cameraOriginY}%`,
            transform: `scale(${cameraScale})`,
            willChange: "transform"
          }}
        >
          {/* Source Image / Diagram Canvas */}
          {sourceImage?.url ? (
            <img
              src={sourceImage.url}
              alt="Visual Source"
              className="w-full h-full object-contain pointer-events-none select-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#0c0c16] via-[#10101f] to-[#07070e] text-center">
              <Sparkles className="w-12 h-12 text-violet-400 mb-3 animate-pulse" />
              <h4 className="text-lg font-bold text-white">Visual Explanation Canvas</h4>
              <p className="text-xs text-neutral-400 max-w-md mt-1">
                Upload any diagram or image to generate synchronized animation and Sarvam Bulbul V3 voiceover
              </p>
            </div>
          )}

          {/* SVG Vector Paths Layer (0-1000 Normalized Coordinate System) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#c084fc" />
              </marker>
              <marker
                id="arrowhead-dim"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.25)" />
              </marker>
              <linearGradient id="neon-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {paths.map((p) => {
              const isTargeted = targetedPaths.some((tp) => tp.id === p.id);
              if (!p.points || p.points.length < 2) return null;

              const d = p.points.reduce((acc, pt, idx) => {
                return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
              }, "");

              return (
                <g key={p.id}>
                  {/* Outer glow stroke when targeted */}
                  {isTargeted && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.45"
                      className="animate-pulse"
                    />
                  )}
                  {/* Primary Path Stroke */}
                  <path
                    d={d}
                    fill="none"
                    stroke={isTargeted ? "url(#neon-glow)" : "rgba(255, 255, 255, 0.3)"}
                    strokeWidth={isTargeted ? 5 : 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={isTargeted ? "8 4" : undefined}
                    markerEnd={
                      p.arrowhead || p.type === "arrow"
                        ? isTargeted
                          ? "url(#arrowhead-active)"
                          : "url(#arrowhead-dim)"
                        : undefined
                    }
                    className={isTargeted ? "transition-all duration-300" : "opacity-40"}
                  />
                </g>
              );
            })}
          </svg>

          {/* Schema 2.0 Detected Objects Highlight Layer (0-1000 Normalized Coordinates) */}
          <AnimatePresence>
            {targetedObjects.map((obj) => (
              <motion.div
                key={`obj_${obj.id}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  left: `${obj.x / 10}%`,
                  top: `${obj.y / 10}%`,
                  width: `${obj.width / 10}%`,
                  height: `${obj.height / 10}%`
                }}
                className={cn(
                  "absolute pointer-events-none rounded-xl border-2 transition-all flex flex-col justify-between p-1.5",
                  activeStep?.action === "circle" ? "rounded-full" : "rounded-xl",
                  "border-violet-400 bg-violet-500/20 shadow-[0_0_25px_rgba(139,92,246,0.7),inset_0_0_12px_rgba(139,92,246,0.3)]"
                )}
              >
                {/* Badge showing exact text or element identification */}
                <div className="flex items-center gap-1 self-start">
                  <span className="px-2 py-0.5 rounded-md bg-violet-600/90 text-white text-[9px] font-bold shadow-md border border-violet-300/40 backdrop-blur-sm line-clamp-1">
                    {obj.exact_text || obj.type || obj.id}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Fallback Legacy Bounding Box (if using presets with bounds) */}
          <AnimatePresence>
            {targetedObjects.length === 0 && activeStep?.bounds && (
              <motion.div
                key={activeStep.step_id || "step_focus"}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  left: `${activeStep.bounds.x}%`,
                  top: `${activeStep.bounds.y}%`,
                  width: `${activeStep.bounds.width}%`,
                  height: `${activeStep.bounds.height}%`
                }}
                className="absolute pointer-events-none rounded-2xl border-2 border-violet-400 bg-violet-500/15 shadow-[0_0_30px_rgba(139,92,246,0.65),inset_0_0_15px_rgba(139,92,246,0.25)] flex items-start justify-end p-2.5"
              >
                {activeStep.label && (
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold shadow-lg border border-violet-400/30">
                    {activeStep.label}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Big Central Play Button Overlay when Paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group transition-all z-20"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.7)] group-hover:scale-110 active:scale-95 transition-all">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Step Annotations Floating Pill */}
        <AnimatePresence>
          {activeAnnotations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none"
            >
              {activeAnnotations.map((ann) => (
                <div
                  key={ann.id}
                  className="px-3 py-1.5 rounded-xl bg-violet-950/90 border border-violet-400/40 text-violet-200 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="text-violet-400 shrink-0" />
                  <span>{ann.text}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner if audio is not synthesized yet */}
        {!hasAudio && (
          <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-auto z-20">
            <div className="px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 shadow-xl backdrop-blur-md">
              <AlertCircle size={14} className="text-amber-400 shrink-0" />
              <span>Voiceover audio ready to synthesize with Sarvam Bulbul V3</span>
              {onGenerateClick && (
                <button
                  onClick={onGenerateClick}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400 transition cursor-pointer"
                >
                  Generate Voiceover
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Audio Narration Subtitle Overlay */}
        <AnimatePresence>
          {showSubtitles && activeTimelineEntry && (
            <motion.div
              key={activeSegmentId || "subtitles"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 flex justify-center pointer-events-none z-20"
            >
              <div className="max-w-2xl px-5 py-3 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 text-center shadow-2xl">
                <p className="text-xs sm:text-sm font-medium text-white leading-relaxed tracking-wide">
                  {activeNarration?.text ||
                    (activeStep?.label ? `Explaining: ${activeStep.label}` : "Synchronized Voice Narration")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Player Control Bar ──────────────────────────────────── */}
      <div className="p-4 bg-[#0a0a12] border-t border-white/[0.08] flex flex-col gap-2">
        {/* Timeline Scrubber */}
        <div className="relative flex items-center group cursor-pointer">
          <input
            type="range"
            min="0"
            max={totalDurationMs}
            value={currentMs}
            onChange={handleSeek}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500 transition-all hover:h-2"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Left Controls: Play/Pause, Restart, Time, Segment Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.5)] transition cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {audioLoading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : isPlaying ? (
                <Pause size={16} className="fill-current" />
              ) : (
                <Play size={16} className="fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                stopAudio();
                setCurrentMs(0);
                if (isPlaying && hasAudio) {
                  playSegmentAudio(0, 0);
                }
              }}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Restart"
            >
              <RotateCcw size={14} />
            </button>

            <div className="text-xs font-mono text-neutral-300">
              <span className="font-bold text-white">{formatDurationMs(currentMs)}</span> / {formatDurationMs(totalDurationMs)}
            </div>

            {activeSegmentId && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[10px] font-mono text-violet-300 font-semibold">
                segment: {activeSegmentId}
              </span>
            )}
          </div>

          {/* Right Controls: Camera, Speed, Subtitles, Mute, Fullscreen */}
          <div className="flex items-center gap-1.5">
            {/* Camera Zoom Toggle */}
            <button
              onClick={() => setEnableCameraZoom((prev) => !prev)}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer text-xs font-semibold",
                enableCameraZoom
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                  : "bg-white/[0.05] text-neutral-500 hover:text-neutral-300"
              )}
              title={enableCameraZoom ? "Disable Camera Focus (Full View)" : "Enable Dynamic Camera Focus"}
            >
              <Camera size={14} />
            </button>

            {/* Playback Speed Switcher */}
            <button
              onClick={() => {
                const speeds = [1.0, 1.25, 1.5, 0.8];
                const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                handleSpeedChange(speeds[nextIdx]);
              }}
              className="px-2 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono font-bold text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Change Speed"
            >
              {playbackSpeed}x
            </button>

            {/* Subtitles Toggle */}
            <button
              onClick={() => setShowSubtitles((prev) => !prev)}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer",
                showSubtitles
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                  : "bg-white/[0.05] text-neutral-500 hover:text-neutral-300"
              )}
              title="Toggle Subtitles"
            >
              <Subtitles size={14} />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={() => {
                setIsMuted((prev) => {
                  const next = !prev;
                  if (audioRef.current) audioRef.current.muted = next;
                  return next;
                });
              }}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
