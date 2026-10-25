"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface InteractiveQuizViewerProps {
  questions: QuizQuestion[];
  topic?: string;
  className?: string;
}

export function InteractiveQuizViewer({ questions, topic = "Knowledge Check", className }: InteractiveQuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const isAnswered = selectedAnswers[currentIndex] !== undefined;

  // Determine correct index from answer string
  const getCorrectOptionIndex = (q: QuizQuestion): number => {
    const raw = (q.answer || "").trim().toLowerCase();
    
    // Check letter prefix A, B, C, D
    if (raw.startsWith("a)") || raw === "a" || raw.startsWith("a.")) return 0;
    if (raw.startsWith("b)") || raw === "b" || raw.startsWith("b.")) return 1;
    if (raw.startsWith("c)") || raw === "c" || raw.startsWith("c.")) return 2;
    if (raw.startsWith("d)") || raw === "d" || raw.startsWith("d.")) return 3;

    // Match text content
    const matchIdx = q.options.findIndex(opt => {
      const cleanOpt = opt.replace(/^[a-d][.)]\s*/i, "").trim().toLowerCase();
      return cleanOpt === raw || raw.includes(cleanOpt) || cleanOpt.includes(raw);
    });

    return matchIdx >= 0 ? matchIdx : 0;
  };

  const correctIndex = getCorrectOptionIndex(currentQ);

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    const updated = { ...selectedAnswers, [currentIndex]: index };
    setSelectedAnswers(updated);

    if (Object.keys(updated).length === totalQuestions) {
      setTimeout(() => setIsCompleted(true), 1200);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  // Calculate score
  const score = Object.entries(selectedAnswers).reduce((acc, [idxStr, selectedOpt]) => {
    const qIndex = parseInt(idxStr, 10);
    const q = questions[qIndex];
    if (q && selectedOpt === getCorrectOptionIndex(q)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const scorePercentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className={cn(
      "my-4 rounded-2xl border border-white/[0.08] bg-[#0c0c12]/95 overflow-hidden shadow-2xl backdrop-blur-sm font-sans",
      className
    )}>
      {/* ──── TOP HEADER BAR (PAPERXIFY QUIZ THEME) ──── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950/25 via-[#0d0d16] to-[#0c0c14] border-b border-white/[0.08] text-xs select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <HelpCircle size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-[13px] tracking-tight">Interactive Knowledge Check</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-neutral-400 truncate max-w-sm">{topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-neutral-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
            {Object.keys(selectedAnswers).length}/{totalQuestions} Answered
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Reset Quiz"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* ──── ULTRA-SLEEK PROGRESS BAR ──── */}
      <div className="h-0.5 w-full bg-white/[0.04] overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ──── MAIN CARD CONTENT ──── */}
      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5 font-sans"
            >
              {/* Question Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  {isAnswered && (
                    <span className={cn(
                      "text-xs font-semibold flex items-center gap-1",
                      selectedAnswers[currentIndex] === correctIndex ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {selectedAnswers[currentIndex] === correctIndex ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={13} />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <h3 className="text-[15px] sm:text-[16px] font-semibold text-white leading-relaxed tracking-tight">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;
                  const isCorrect = optIdx === correctIndex;
                  const showResult = isAnswered;

                  let cardStyle = "border-white/[0.08] bg-[#13131b]/80 hover:bg-white/[0.05] hover:border-white/[0.15] text-neutral-200";
                  let badgeStyle = "bg-white/[0.06] text-neutral-300 border-white/[0.08]";

                  if (showResult) {
                    if (isCorrect) {
                      cardStyle = "border-emerald-500/60 bg-emerald-950/30 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
                      badgeStyle = "bg-emerald-500 text-neutral-950 font-bold border-emerald-400";
                    } else if (isSelected && !isCorrect) {
                      cardStyle = "border-rose-500/60 bg-rose-950/30 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.12)]";
                      badgeStyle = "bg-rose-500 text-white font-bold border-rose-400";
                    } else {
                      cardStyle = "border-white/[0.04] bg-white/[0.01] text-neutral-400 opacity-50";
                    }
                  }

                  const letter = String.fromCharCode(65 + optIdx);
                  const cleanText = option.replace(/^[a-d][.)]\s*/i, "").trim();

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={cn(
                        "w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-[13.5px] sm:text-[14px] font-sans font-normal transition-all cursor-pointer select-none",
                        cardStyle,
                        !isAnswered && "active:scale-[0.99]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn("w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold border shrink-0", badgeStyle)}>
                          {letter}
                        </span>
                        <span className="font-normal leading-relaxed text-neutral-200">{cleanText}</span>
                      </div>

                      {showResult && isCorrect && (
                        <Check size={16} className="text-emerald-400 shrink-0 ml-2" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle size={16} className="text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {isAnswered && currentQ.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-[#14141d] border border-white/[0.08] text-xs sm:text-[13px] text-neutral-300 space-y-1 leading-relaxed"
                >
                  <span className="font-semibold text-red-400 block">Explanation:</span>
                  <p>{currentQ.explanation}</p>
                </motion.div>
              )}

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05]"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {questions.map((_, dotIdx) => {
                    const answered = selectedAnswers[dotIdx] !== undefined;
                    const isCur = dotIdx === currentIndex;
                    return (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentIndex(dotIdx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all cursor-pointer",
                          isCur ? "w-5 bg-red-500" : answered ? "bg-red-400/50" : "bg-white/[0.15]"
                        )}
                        title={`Go to Question ${dotIdx + 1}`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 text-xs text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer px-3 py-1.5 rounded-lg font-medium shadow-md shadow-red-600/20"
                >
                  <span>{currentIndex === totalQuestions - 1 ? "Results" : "Next"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ) : (
            /* ──── QUIZ COMPLETION SUMMARY ──── */
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-5 font-sans"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600/25 to-rose-600/25 border border-red-500/35 mx-auto flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <Award size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Quiz Complete!</h3>
                <p className="text-xs text-neutral-400">
                  You scored <span className="text-red-300 font-bold">{score}</span> out of <span className="text-white font-bold">{totalQuestions}</span> ({scorePercentage}%)
                </p>
              </div>

              <div className="max-w-xs mx-auto p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-neutral-300 flex items-center justify-around">
                <div>
                  <span className="text-emerald-400 font-bold text-base block">{score}</span>
                  <span className="text-[11px] text-neutral-400">Correct</span>
                </div>
                <div className="w-px h-8 bg-white/[0.08]" />
                <div>
                  <span className="text-rose-400 font-bold text-base block">{totalQuestions - score}</span>
                  <span className="text-[11px] text-neutral-400">Incorrect</span>
                </div>
                <div className="w-px h-8 bg-white/[0.08]" />
                <div>
                  <span className="text-red-400 font-bold text-base block">{scorePercentage}%</span>
                  <span className="text-[11px] text-neutral-400">Accuracy</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Retake Quiz</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompleted(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-red-600/20"
                >
                  <Sparkles size={13} />
                  <span>Review Answers</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
