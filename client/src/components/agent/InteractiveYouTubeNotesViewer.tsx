"use client";

import React, { useState } from "react";
import { 
  Youtube, 
  Play, 
  Clock, 
  Bookmark, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface YouTubeChapter {
  timestamp: string; // e.g. "02:15"
  title: string;
  summary: string;
  keyPoints?: string[];
}

export interface YouTubeNotesData {
  videoId?: string;
  videoTitle: string;
  channelName?: string;
  summary: string;
  chapters: YouTubeChapter[];
  formulas?: string[];
  reviewQuestions?: Array<{ question: string; answer: string }>;
}

interface InteractiveYouTubeNotesViewerProps {
  data: YouTubeNotesData;
  className?: string;
}

export function InteractiveYouTubeNotesViewer({ data, className }: InteractiveYouTubeNotesViewerProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(data.videoId || null);
  const [isPlayingEmbed, setIsPlayingEmbed] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  if (!data || !data.chapters || data.chapters.length === 0) return null;

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleSeek = (timestampStr: string) => {
    // Convert mm:ss or hh:mm:ss to seconds
    const parts = timestampStr.replace(/[\[\]]/g, "").split(":").map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    if (data.videoId) {
      setIsPlayingEmbed(true);
      const iframe = document.getElementById("yt-embed-iframe") as HTMLIFrameElement;
      if (iframe) {
        iframe.src = `https://www.youtube.com/embed/${data.videoId}?start=${seconds}&autoplay=1`;
      }
    }
  };

  return (
    <div className={cn(
      "my-5 rounded-2xl border border-white/[0.08] bg-[#0c0c12]/95 overflow-hidden shadow-2xl backdrop-blur-sm font-sans w-full",
      className
    )}>
      {/* ──── TOP BAR (PAPERXIFY YOUTUBE COMPANION THEME) ──── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950/25 via-[#0d0d16] to-[#0c0c14] border-b border-white/[0.08] text-xs select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <Youtube size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-[13px] tracking-tight">YouTube Study Companion</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-neutral-400 truncate max-w-sm">{data.videoTitle}</p>
          </div>
        </div>

        {data.videoId && (
          <a
            href={`https://www.youtube.com/watch?v=${data.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-white transition-all text-[11px] font-medium active:scale-95"
          >
            <span>Watch on YouTube</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* ──── VIDEO PLAYER OR THUMBNAIL ──── */}
      {data.videoId && (
        <div className="relative w-full aspect-video max-h-[360px] bg-black">
          {isPlayingEmbed ? (
            <iframe
              id="yt-embed-iframe"
              src={`https://www.youtube.com/embed/${data.videoId}?autoplay=1`}
              title={data.videoTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div 
              onClick={() => setIsPlayingEmbed(true)}
              className="relative w-full h-full cursor-pointer group flex items-center justify-center overflow-hidden"
            >
              <img 
                src={`https://img.youtube.com/vi/${data.videoId}/hqdefault.jpg`} 
                alt={data.videoTitle}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play size={24} className="ml-1 fill-white" />
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-xs text-white/90 font-medium truncate">
                {data.videoTitle}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──── EXECUTIVE SUMMARY ──── */}
      <div className="p-4 sm:p-6 border-b border-white/[0.06] bg-white/[0.01] space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wider">
          <BookOpen size={12} />
          <span>Executive Lecture Summary</span>
        </div>
        <p className="text-xs sm:text-[13.5px] text-neutral-300 leading-relaxed font-sans">
          {data.summary}
        </p>
      </div>

      {/* ──── TIMESTAMPED CHAPTERS LIST ──── */}
      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between text-xs pb-1">
          <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
            <Clock size={13} className="text-rose-400" />
            <span>Timestamped Chapter Breakdown ({data.chapters.length} Chapters)</span>
          </span>
          <span className="text-[11px] text-neutral-400">Click timestamp to seek</span>
        </div>

        <div className="space-y-2.5">
          {data.chapters.map((ch, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-xl border border-white/[0.06] bg-[#12121b]/80 hover:border-white/[0.12] transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[13.5px] font-semibold text-white tracking-tight flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSeek(ch.timestamp)}
                    className="flex items-center gap-1 text-[11px] font-mono text-rose-300 bg-rose-600/15 hover:bg-rose-600/30 border border-rose-500/30 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    title={`Seek to ${ch.timestamp}`}
                  >
                    <Play size={10} className="fill-rose-400" />
                    <span>{ch.timestamp}</span>
                  </button>
                  <span>{ch.title}</span>
                </h4>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed pl-1">
                {ch.summary}
              </p>

              {ch.keyPoints && ch.keyPoints.length > 0 && (
                <ul className="space-y-1 pt-1 pl-4 list-disc text-xs text-neutral-400 marker:text-rose-500">
                  {ch.keyPoints.map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTIVE RECALL REVIEW QUESTIONS ──── */}
      {data.reviewQuestions && data.reviewQuestions.length > 0 && (
        <div className="p-4 sm:p-6 bg-white/[0.01] border-t border-white/[0.06] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <HelpCircle size={13} />
            <span>Active Recall & Retention Check</span>
          </div>

          <div className="space-y-2">
            {data.reviewQuestions.map((q, qIdx) => {
              const isRevealed = !!revealedAnswers[qIdx];
              return (
                <div 
                  key={qIdx}
                  className="rounded-xl border border-white/[0.06] bg-[#101018] p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-200">
                      Q{qIdx + 1}: {q.question}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAnswer(qIdx)}
                      className="flex items-center gap-1 text-[11px] text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <span>{isRevealed ? "Hide Answer" : "Reveal Answer"}</span>
                      {isRevealed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 border-t border-white/[0.04] text-xs text-emerald-300 leading-relaxed font-sans"
                      >
                        <span className="font-semibold text-emerald-400">Answer: </span>
                        {q.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
