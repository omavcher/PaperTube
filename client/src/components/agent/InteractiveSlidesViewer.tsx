"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  MessageSquare, 
  Layers, 
  Layout, 
  CheckCircle, 
  FileText,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SlideItem {
  slide: number;
  title: string;
  subtitle?: string;
  layout?: string;
  bullets: string[];
  speakerNotes?: string;
}

interface InteractiveSlidesViewerProps {
  slides: SlideItem[];
  topic?: string;
  className?: string;
}

export function InteractiveSlidesViewer({ slides, topic = "Presentation Deck", className }: InteractiveSlidesViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [slides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length, isFullscreen]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentSlideIndex] || slides[0];
  const totalSlides = slides.length;

  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "my-5 rounded-2xl border border-white/[0.08] bg-[#0c0c12]/95 overflow-hidden shadow-2xl backdrop-blur-sm font-sans w-full",
        isFullscreen && "fixed inset-0 z-50 rounded-none my-0 bg-[#07070b] flex flex-col justify-between",
        className
      )}
    >
      {/* ──── TOP BAR (PAPERXIFY RED & OBSIDIAN KEYNOTE THEME) ──── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950/25 via-[#0d0d16] to-[#0c0c14] border-b border-white/[0.08] text-xs select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <Presentation size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-[13px] tracking-tight">Keynote Deck Studio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-neutral-400 truncate max-w-sm">{topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-neutral-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
            Slide {currentSlideIndex + 1} / {totalSlides}
          </span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-300 hover:text-white transition-all text-[11px] font-medium active:scale-95 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Presentation"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Present"}</span>
          </button>
        </div>
      </div>

      {/* ──── PROGRESS LINE ──── */}
      <div className="h-0.5 w-full bg-white/[0.04] overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ──── 16:9 SLIDE CANVAS ──── */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl relative aspect-[16/9] min-h-[320px] rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#151522] via-[#101018] to-[#0c0c14] p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />

          {/* Slide Header metadata */}
          <div className="flex items-center justify-between select-none z-10 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider text-[10.5px]">
                Slide {currentSlideIndex + 1}
              </span>
              {currentSlide.layout && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400 text-[10.5px]">
                  <Layout size={10} />
                  <span>{currentSlide.layout}</span>
                </span>
              )}
            </div>

            <span className="text-[11px] text-neutral-400 font-medium">
              Paperxify Presentation Studio
            </span>
          </div>

          {/* Main Slide Body */}
          <div className="my-auto py-3 z-10 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                    {currentSlide.title}
                  </h2>
                  {currentSlide.subtitle && (
                    <p className="text-xs sm:text-sm text-red-300/80 font-medium mt-1">
                      {currentSlide.subtitle}
                    </p>
                  )}
                </div>

                {/* Bullets Grid / List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {currentSlide.bullets.map((bullet, bIdx) => (
                    <div 
                      key={bIdx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs sm:text-[13px] text-neutral-200 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                      <span className="font-normal">{bullet}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Footer Notes Drawer Trigger */}
          <div className="flex items-center justify-between z-10 pt-3 border-t border-white/[0.06]">
            {currentSlide.speakerNotes ? (
              <button
                type="button"
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg border border-white/[0.06] transition-colors cursor-pointer"
              >
                <MessageSquare size={12} className="text-red-400" />
                <span>{showSpeakerNotes ? "Hide Presenter Notes" : "Show Presenter Notes"}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <span>{currentSlideIndex + 1} / {totalSlides}</span>
            </div>
          </div>
        </div>

        {/* Presenter Speaker Notes Expandable Box */}
        <AnimatePresence>
          {showSpeakerNotes && currentSlide.speakerNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-4xl mt-3 p-4 rounded-xl bg-[#14141e] border border-red-500/25 text-xs text-neutral-300 space-y-1 shadow-lg"
            >
              <div className="flex items-center gap-1.5 text-red-400 font-semibold text-[11.5px] uppercase tracking-wider">
                <MessageSquare size={12} />
                <span>Speaker Talking Points & Engagement Notes</span>
              </div>
              <p className="leading-relaxed text-neutral-300 font-sans">
                {currentSlide.speakerNotes}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──── NAVIGATION BAR ──── */}
        <div className="w-full max-w-4xl flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none bg-white/[0.05] hover:bg-white/[0.1] px-3.5 py-2 rounded-xl border border-white/[0.06] transition-all cursor-pointer font-medium"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          {/* Slide Select Dots */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar px-2 py-1 max-w-[50%]">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all cursor-pointer shrink-0",
                  idx === currentSlideIndex ? "w-5 bg-red-500" : "bg-white/[0.15] hover:bg-white/[0.3]"
                )}
                title={`Jump to Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentSlideIndex === totalSlides - 1}
            className="flex items-center gap-1.5 text-xs text-white disabled:opacity-30 disabled:pointer-events-none bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl transition-all cursor-pointer font-semibold shadow-lg shadow-red-600/20"
          >
            <span>Next Slide</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
