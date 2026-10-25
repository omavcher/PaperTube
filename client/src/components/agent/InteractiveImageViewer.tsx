"use client";

import React, { useState, useEffect } from "react";
import { 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  Sparkles, 
  RotateCcw, 
  Info, 
  X, 
  ZoomIn, 
  ZoomOut, 
  ExternalLink,
  Layers,
  Wand2,
  Sliders,
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ImageDataPayload {
  imageUrl?: string;
  dataUrl?: string;
  b64_json?: string;
  mediaType?: string;
  originalPrompt?: string;
  enhancedPrompt?: string;
  aspectRatio?: string;
  resolution?: string;
  model?: string;
}

export interface InteractiveImageViewerProps {
  imageData?: ImageDataPayload | null;
  imageUrl?: string | null;
  isLoading?: boolean;
  loading?: boolean;
  aspectRatio?: string;
  resolution?: string;
  style?: string;
  prompt?: string;
  enhancedPrompt?: string;
  onRegenerate?: () => void;
}

const ASPECT_RATIO_CLASSES: Record<string, string> = {
  "1:1": "aspect-square w-full",
  "16:9": "aspect-video w-full",
  "9:16": "aspect-[9/16] w-full max-h-[580px]",
  "4:3": "aspect-[4/3] w-full",
  "3:2": "aspect-[3/2] w-full",
  "2:3": "aspect-[2/3] w-full max-h-[580px]",
  "21:9": "aspect-[21/9] w-full",
  "5:2": "aspect-[5/2] w-full",
  "default": "aspect-square w-full"
};

const CARD_MAX_WIDTH_CLASSES: Record<string, string> = {
  "1:1": "max-w-[520px] mx-auto",
  "16:9": "max-w-3xl w-full mx-auto",
  "9:16": "max-w-[380px] mx-auto",
  "4:3": "max-w-[580px] mx-auto",
  "3:2": "max-w-[620px] mx-auto",
  "2:3": "max-w-[400px] mx-auto",
  "21:9": "max-w-3xl w-full mx-auto",
  "5:2": "max-w-3xl w-full mx-auto",
  "default": "max-w-[520px] mx-auto"
};

const LOADING_PHASES = [
  { title: "Thinking", subtitle: "Structuring visual composition & spatial latents...", progress: 25 },
  { title: "Creating image", subtitle: "Diffusing neural latent tensor grid...", progress: 55 },
  { title: "Creating image", subtitle: "Refining photorealistic textures & lighting...", progress: 80 },
  { title: "Creating image", subtitle: "Finalizing high-resolution rendering — hang tight.", progress: 95 }
];

export function InteractiveImageViewer({
  imageData,
  imageUrl: directImageUrl,
  isLoading = false,
  loading = false,
  aspectRatio = "1:1",
  resolution = "1K",
  style,
  prompt = "",
  enhancedPrompt = "",
  onRegenerate
}: InteractiveImageViewerProps) {
  const isGenerating = isLoading || loading;
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPromptInspector, setShowPromptInspector] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const activeAspectRatio = imageData?.aspectRatio || aspectRatio || "1:1";
  const activeResolution = imageData?.resolution || resolution || "1K";
  const rawPrompt = imageData?.originalPrompt || prompt || "";
  const activePrompt = rawPrompt && rawPrompt !== "AI Image Generation" ? rawPrompt : "Generated AI Image";
  const activeEnhancedPrompt = imageData?.enhancedPrompt || enhancedPrompt || "";
  const imageUrl = directImageUrl || imageData?.imageUrl || imageData?.dataUrl || (imageData?.b64_json ? `data:${imageData.mediaType || "image/png"};base64,${imageData.b64_json}` : null);

  const aspectClass = ASPECT_RATIO_CLASSES[activeAspectRatio] || ASPECT_RATIO_CLASSES["default"];
  const cardMaxClass = CARD_MAX_WIDTH_CLASSES[activeAspectRatio] || CARD_MAX_WIDTH_CLASSES["default"];

  // Cycle loading phases for smooth progress feedback
  useEffect(() => {
    if (!isGenerating) {
      setCurrentStageIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < LOADING_PHASES.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle PNG Download
  const handleDownload = () => {
    if (!imageUrl) return;
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      const cleanName = (activePrompt.slice(0, 32) || "ai-image").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      link.download = `paperxify-${cleanName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image saved to downloads!");
    } catch {
      toast.error("Download failed");
    }
  };

  // Helper: Copy actual image binary blob to system clipboard
  const copyImageBlobToClipboard = async (url: string, b64?: string): Promise<boolean> => {
    // 1. Convert from Base64 if available
    if (b64) {
      try {
        const cleanB64 = b64.replace(/^data:image\/\w+;base64,/, "");
        const byteCharacters = atob(cleanB64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: "image/png" });
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        return true;
      } catch (err) {
        console.warn("Base64 clipboard write failed, trying canvas...", err);
      }
    }

    // 2. Render image onto Canvas to export clean PNG blob (Bypasses format restrictions)
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 1024;
      canvas.height = img.naturalHeight || img.height || 1024;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          return true;
        }
      }
    } catch (err) {
      console.warn("Canvas clipboard write failed, trying fetch...", err);
    }

    // 3. Fallback: Fetch remote image blob & convert to PNG
    try {
      const response = await fetch(url, { mode: "cors" });
      const rawBlob = await response.blob();
      if (rawBlob.type !== "image/png") {
        const img = new Image();
        img.src = URL.createObjectURL(rawBlob);
        await new Promise((resolve) => (img.onload = resolve));
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (pngBlob) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
          return true;
        }
      } else {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": rawBlob })]);
        return true;
      }
    } catch (err) {
      console.error("Fetch clipboard write failed:", err);
    }

    return false;
  };

  // Handle Copy Image Directly to Clipboard
  const handleCopy = async () => {
    if (!imageUrl && !imageData?.b64_json) return;
    try {
      const success = await copyImageBlobToClipboard(
        imageUrl || "",
        imageData?.b64_json || undefined
      );
      if (success) {
        setCopied(true);
        toast.success("Image copied directly to clipboard!");
        setTimeout(() => setCopied(false), 2200);
      } else {
        await navigator.clipboard.writeText(imageUrl || "");
        setCopied(true);
        toast.success("Image link copied to clipboard");
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      toast.error("Failed to copy image to clipboard");
    }
  };

  return (
    <div className={cn("w-full mx-auto my-4 font-sans select-none", cardMaxClass)}>
      
      {/* ──── 1. PROFESSIONAL LATENT DIFFUSION LOADING STATE ──── */}
      {isGenerating && (
        <div className="w-full mx-auto my-2 font-sans select-none">
          
          {/* Top Status Header */}
          <div className="space-y-1 mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <span className="text-[14px] sm:text-[15px] font-semibold text-neutral-100 tracking-tight">
                {LOADING_PHASES[currentStageIdx].title}
              </span>
            </div>
            <p className="text-[12px] sm:text-[12.5px] text-neutral-400 leading-snug">
              {LOADING_PHASES[currentStageIdx].subtitle}
            </p>
          </div>

          {/* Minimalist Obsidian Canvas Card */}
          <div className={cn(
            "relative w-full rounded-[28px] overflow-hidden bg-[#0a0a0f] border border-white/[0.12] shadow-[0_16px_48px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center",
            aspectClass
          )}>
            
            {/* Ambient Breathing Radial Glow */}
            <div className="absolute inset-0 bg-radial from-red-500/[0.05] via-transparent to-transparent pointer-events-none animate-pulse" style={{ animationDuration: "3.6s" }} />

            {/* Generative Latent Diffusion Matrix — Living Wave */}
            <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10 pointer-events-none">
              <div className="grid grid-cols-11 gap-3.5 sm:gap-4 w-full h-full max-w-sm max-h-64 items-center justify-items-center">
                {Array.from({ length: 77 }).map((_, i) => {
                  const row = Math.floor(i / 11);
                  const col = i % 11;
                  const distFromCenter = Math.hypot(col - 5, row - 3);
                  const delay = distFromCenter * 0.28;
                  
                  return (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white/90"
                      initial={{ opacity: 0.08, scale: 0.8 }}
                      animate={{
                        opacity: [0.08, 0.75, 0.15],
                        scale: [0.8, 1.45, 0.9]
                      }}
                      transition={{
                        duration: 3.6,
                        repeat: Infinity,
                        delay: delay,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Central Minimalist Badge */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-2.5 p-6 text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12121a]/90 border border-white/[0.14] backdrop-blur-md shadow-lg shadow-black/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                <span className="text-[11px] font-mono font-semibold text-neutral-200 tracking-wider">
                  {activeAspectRatio} • {activeResolution}
                </span>
              </div>

              {activePrompt && activePrompt !== "Generated AI Image" && (
                <p className="text-[12px] sm:text-[12.5px] text-neutral-300 max-w-sm line-clamp-2 italic px-3 font-normal leading-relaxed text-center">
                  &ldquo;{activePrompt}&rdquo;
                </p>
              )}
            </div>

            {/* Micro Hairline Bottom Progress Line */}
            <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/[0.05] overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-600/40 via-red-500 to-red-400/60"
                initial={{ width: "15%" }}
                animate={{ width: `${LOADING_PHASES[currentStageIdx].progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

          </div>

        </div>
      )}

      {/* ──── 2. COMPLETED HIGH-RESOLUTION IMAGE DISPLAY (PURE APPLE MINIMALIST GRADE) ──── */}
      {!isGenerating && imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative rounded-2xl sm:rounded-[24px] overflow-hidden border border-white/[0.12] bg-[#0b0b10] shadow-[0_16px_48px_rgba(0,0,0,0.7)] group font-sans select-none"
        >
          
          {/* Main Visual Image Container (Pure Edge-to-Edge, Zero Letterboxing) */}
          <div className={cn(
            "relative w-full overflow-hidden bg-black flex items-center justify-center cursor-pointer",
            aspectClass
          )}>
            <img
              src={imageUrl}
              alt={activePrompt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              onClick={() => setIsLightboxOpen(true)}
            />

            {/* Top-Right Floating Glass Action Capsule (Visible on Hover / Touch) */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 p-1 rounded-2xl bg-black/75 border border-white/20 backdrop-blur-md shadow-2xl z-20">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                className="p-2 rounded-xl hover:bg-white/20 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                title="Full-screen Lightbox Zoom"
              >
                <Maximize2 size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="p-2 rounded-xl hover:bg-white/20 text-neutral-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                title="Copy Image directly to Clipboard"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                title="Download PNG Image"
              >
                <Download size={13} />
                <span>PNG</span>
              </button>
            </div>

            {/* Bottom Floating Prompt Overlay (Subtle Vignette on Hover) */}
            {activePrompt && activePrompt !== "Generated AI Image" && (
              <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-end justify-between gap-3 text-xs text-white">
                <p className="line-clamp-1 italic text-neutral-200 text-[12px] font-normal">
                  &ldquo;{activePrompt}&rdquo;
                </p>
                <span className="font-mono text-[10px] text-neutral-400 shrink-0 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                  {activeAspectRatio} • {activeResolution}
                </span>
              </div>
            )}

          </div>

        </motion.div>
      )}

      {/* ──── 3. FULL-SCREEN LIGHTBOX ZOOM MODAL ──── */}
      <AnimatePresence>
        {isLightboxOpen && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col p-4 select-none"
          >
            {/* Top Lightbox Header */}
            <div className="flex items-center justify-between text-white p-2">
              <div className="flex items-center gap-2 max-w-md truncate">
                <span className="font-semibold text-sm truncate">{activePrompt}</span>
                <span className="text-xs text-neutral-400 font-mono">({activeResolution})</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                  className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/20 text-neutral-200 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono text-neutral-400 min-w-10 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                  className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/20 text-neutral-200 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold shadow-lg shadow-red-600/30"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLightboxOpen(false);
                    setZoomLevel(1);
                  }}
                  className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/20 text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main Lightbox Body */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-4">
              <motion.img
                src={imageUrl}
                alt={activePrompt}
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[88vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-transform duration-200"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
