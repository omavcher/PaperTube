"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FlashcardItem {
  front: string; // Question or Concept
  back: string;  // Answer or Explanation
  hint?: string;
}

interface InteractiveFlashcardsViewerProps {
  cards: FlashcardItem[];
  topic?: string;
  className?: string;
}

export function InteractiveFlashcardsViewer({ cards, topic = "Core Concepts", className }: InteractiveFlashcardsViewerProps) {
  const [deck, setDeck] = useState<FlashcardItem[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setDeck(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  if (!deck || deck.length === 0) return null;

  const currentCard = deck[currentIndex];
  const totalCards = deck.length;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % totalCards);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const handleToggleMastered = () => {
    setMastered(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  return (
    <div className={cn(
      "my-5 rounded-2xl border border-white/[0.08] bg-[#0c0c12]/95 overflow-hidden shadow-2xl backdrop-blur-sm font-sans w-full",
      className
    )}>
      {/* ──── TOP TOOLBAR (PAPERXIFY FLASHCARDS THEME) ──── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950/25 via-[#0d0d16] to-[#0c0c14] border-b border-white/[0.08] text-xs select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <Layers size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-[13px] tracking-tight">3D Flashcard Deck</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-neutral-400 truncate max-w-sm">{topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="flex items-center gap-1.5 text-[11px] text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg border border-white/[0.06] transition-all cursor-pointer font-medium active:scale-95"
            title="Shuffle Flashcard Order"
          >
            <Shuffle size={11} className="text-red-400" />
            <span>Shuffle</span>
          </button>
          <span className="text-[11px] font-mono font-medium text-neutral-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
            {currentIndex + 1} / {totalCards}
          </span>
        </div>
      </div>

      {/* ──── PROGRESS LINE ──── */}
      <div className="h-0.5 w-full bg-white/[0.04] overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ──── 3D PHYSICAL CARD CONTAINER ──── */}
      <div className="p-4 sm:p-6 w-full flex flex-col items-center">
        {/* 3D Perspective Stage with Explicit Height */}
        <div 
          style={{ perspective: 1200 }} 
          className="w-full max-w-2xl h-[270px] sm:h-[290px] cursor-pointer select-none relative"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full relative"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            {/* ──── FRONT FACE (QUESTION) ──── */}
            <div 
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 w-full h-full rounded-2xl border border-white/[0.1] bg-[#14141e] p-6 sm:p-7 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:border-white/[0.2] transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider text-[10.5px]">
                  <HelpCircle size={11} />
                  <span>Question</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors font-medium">
                  <RotateCw size={12} className="opacity-80" />
                  <span>Click to flip</span>
                </div>
              </div>

              {/* Center Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-4">
                <h3 className="text-[17px] sm:text-[19px] font-semibold text-white leading-relaxed tracking-tight break-words font-sans">
                  {currentCard.front}
                </h3>
                {currentCard.hint && (
                  <p className="mt-2.5 text-xs text-neutral-400 italic">
                    Hint: {currentCard.hint}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleMastered();
                  }}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium",
                    mastered[currentIndex]
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  <CheckCircle2 size={13} className={mastered[currentIndex] ? "text-emerald-400" : "text-neutral-500"} />
                  <span>{mastered[currentIndex] ? "Mastered" : "Mark as Mastered"}</span>
                </button>

                <span className="text-[11px] text-neutral-400 font-medium">
                  Card {currentIndex + 1} of {totalCards}
                </span>
              </div>
            </div>

            {/* ──── BACK FACE (ANSWER) ──── */}
            <div 
              style={{ 
                backfaceVisibility: "hidden", 
                transform: "rotateY(180deg)" 
              }}
              className="absolute inset-0 w-full h-full rounded-2xl border border-emerald-500/30 bg-[#0f1816] p-6 sm:p-7 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.7)] hover:border-emerald-500/45 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600/15 border border-emerald-500/35 text-emerald-400 font-bold uppercase tracking-wider text-[10.5px]">
                  <BookOpen size={11} />
                  <span>Answer</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors font-medium">
                  <RotateCw size={12} className="opacity-80" />
                  <span>Click to flip back</span>
                </div>
              </div>

              {/* Center Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-4">
                <p className="text-[16px] sm:text-[17.5px] font-medium text-emerald-50 leading-relaxed tracking-normal break-words font-sans">
                  {currentCard.back}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleMastered();
                  }}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium",
                    mastered[currentIndex]
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  <CheckCircle2 size={13} className={mastered[currentIndex] ? "text-emerald-400" : "text-neutral-500"} />
                  <span>{mastered[currentIndex] ? "Mastered" : "Mark as Mastered"}</span>
                </button>

                <span className="text-[11px] text-neutral-400 font-medium">
                  Card {currentIndex + 1} of {totalCards}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ──── NAVIGATION CONTROLS ──── */}
        <div className="w-full max-w-2xl flex items-center justify-between pt-5">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-3.5 py-2 rounded-xl border border-white/[0.06] transition-all cursor-pointer font-medium"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          {/* Dot Navigation */}
          <div className="flex items-center gap-1">
            {deck.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(idx);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all cursor-pointer",
                  idx === currentIndex ? "w-5 bg-red-500" : mastered[idx] ? "bg-emerald-400/60" : "bg-white/[0.15]"
                )}
                title={`Card ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 text-xs text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl transition-all cursor-pointer font-semibold shadow-lg shadow-red-600/20"
          >
            <span>Next Card</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
