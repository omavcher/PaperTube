"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ArrowLeft, Download, Keyboard,
  AlertCircle, MousePointer2,
  Hash, AtSign, RotateCcw,
  Clock, Type, TrendingUp, Award, Crosshair,
  Gauge, BarChart3, Zap, Target, Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { LoginDialog } from "@/components/LoginDialog";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "../CorePromo";

// ────────────────────────────────────────────
// Word Banks
// ────────────────────────────────────────────
const COMMON_WORDS = [
  "the","be","to","of","and","a","in","that","have","it","for","not","on","with","he","as","you",
  "do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one",
  "all","would","there","their","what","so","up","out","if","about","who","get","which","go","me",
  "when","make","can","like","time","no","just","him","know","take","people","into","year","your",
  "good","some","could","them","see","other","than","then","now","look","only","come","its","over",
  "think","also","back","after","use","two","how","our","work","first","well","way","even","new",
  "want","because","any","these","give","day","most","us","great","between","need","large","often",
  "system","set","each","under","turn","end","point","move","right","show","house","world","next",
  "area","open","seem","still","change","last","while","number","always","since","long","part",
  "start","run","every","own","found","hand","high","real","place","during","keep","head","light",
  "old","life","left","line","early","around","should","much","small","bring","word","call","begin",
  "against","close","door","through","before","might","more","room","side","water","land","city",
  "another","down","few","something","find","tell","let","ask","late","hard","follow","learn","once"
];

const PUNCTUATION_MARKS = [".", ",", ";", ":", "!", "?"];

function generateWords(count: number, usePunctuation: boolean, useNumbers: boolean): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    let word = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
    
    if (usePunctuation && Math.random() < 0.15) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    if (useNumbers && Math.random() < 0.10) {
      const num = String(Math.floor(Math.random() * 100));
      word = Math.random() > 0.5 ? num + word : word + num;
    }
    
    if (usePunctuation && Math.random() < 0.12 && words.length > 0) {
      const mark = PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)];
      words[words.length - 1] += mark;
      if ([".", "!", "?"].includes(mark)) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }
    
    words.push(word);
  }
  return words;
}

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type TestMode = "time" | "words";
type TimeOption = 15 | 30 | 60 | 120;
type WordOption = 10 | 25 | 50 | 100;
type TestState = "idle" | "running" | "finished";

interface WpmSnapshot {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

interface TestResults {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalWords: number;
  correctWords: number;
  incorrectWords: number;
  totalTime: number;
  wpmHistory: WpmSnapshot[];
  charPerSecond: number;
}

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────
export default function TypingTestClient() {
  const router = useRouter();
  useToolAnalytics("typing-speed-test", "VELOCITY", "Engineering Tools");

  // ── Config ──
  const [mode, setMode] = useState<TestMode>("time");
  const [timeOption, setTimeOption] = useState<TimeOption>(30);
  const [wordOption, setWordOption] = useState<WordOption>(25);
  const [usePunctuation, setUsePunctuation] = useState(false);
  const [useNumbers, setUseNumbers] = useState(false);

  // ── Test State ──
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCWI] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [typedHistory, setTypedHistory] = useState<string[]>([]); // what user typed for each word
  const [testState, setTestState] = useState<TestState>("idle");
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [results, setResults] = useState<TestResults | null>(null);
  const [wpmSnapshots, setWpmSnapshots] = useState<WpmSnapshot[]>([]);
  const [secondTick, setSecondTick] = useState(0);

  // ── UI ──
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileBannerDismissed, setMobileBannerDismissed] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  // ── Refs ──
  const inputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // ── Load user ──
  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);

  // ── Mobile Detection ──
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Init ──
  const initTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const wc = mode === "time" ? 250 : wordOption;
    const w = generateWords(wc, usePunctuation, useNumbers);
    setWords(w);
    setCWI(0);
    setTypedInput("");
    setTypedHistory([]);
    setTestState("idle");
    setStartTime(0);
    setTimeLeft(mode === "time" ? timeOption : 0);
    setResults(null);
    setWpmSnapshots([]);
    setSecondTick(0);
    setTimeout(() => {
      inputRef.current?.focus();
      // Scroll words container to top
      if (wordsContainerRef.current) wordsContainerRef.current.scrollTop = 0;
    }, 50);
  }, [mode, timeOption, wordOption, usePunctuation, useNumbers]);

  useEffect(() => { initTest(); }, [initTest]);

  // ── Timer ──
  useEffect(() => {
    if (testState !== "running" || !startTime) return;
    
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setSecondTick(elapsed);
      
      if (mode === "time") {
        const remaining = Math.max(0, timeOption - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          finishTest();
        }
      }

      // WPM snapshot every second
      const correctChars = typedHistory.reduce((sum, typed, i) => {
        return sum + (typed === words[i] ? typed.length + 1 : 0);
      }, 0);
      const totalChars = typedHistory.reduce((sum, typed) => sum + typed.length + 1, 0) + typedInput.length;
      const elapsedMin = elapsed / 60;
      if (elapsedMin > 0) {
        const wpm = Math.round((correctChars / 5) / elapsedMin);
        const raw = Math.round((totalChars / 5) / elapsedMin);
        const errors = typedHistory.filter((typed, i) => typed !== words[i]).length;
        setWpmSnapshots(prev => {
          // Avoid duplicate seconds
          if (prev.length > 0 && prev[prev.length - 1].second === elapsed) return prev;
          return [...prev, { second: elapsed, wpm: Math.max(0, wpm), rawWpm: Math.max(0, raw), errors }];
        });
      }
    }, 250);
    
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [testState, startTime, mode, timeOption, typedHistory, typedInput, words]);

  // ── Scroll active word into view ──
  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const container = wordsContainerRef.current;
      const active = activeWordRef.current;
      const cRect = container.getBoundingClientRect();
      const aRect = active.getBoundingClientRect();
      // If the active word is below 60% of container, scroll
      if (aRect.top > cRect.top + cRect.height * 0.55) {
        container.scrollTop += aRect.height + 16;
      }
    }
  }, [currentWordIndex]);

  // ── Live Stats ──
  const liveWpm = useMemo(() => {
    if (!startTime || testState !== "running") return 0;
    const elapsed = (Date.now() - startTime) / 60000;
    if (elapsed < 0.015) return 0;
    const correctChars = typedHistory.reduce((sum, typed, i) => {
      return sum + (typed === words[i] ? typed.length + 1 : 0);
    }, 0);
    return Math.max(0, Math.round((correctChars / 5) / elapsed));
  }, [startTime, typedHistory, testState, words, secondTick]);

  const liveAccuracy = useMemo(() => {
    if (typedHistory.length === 0) return 100;
    const correct = typedHistory.filter((t, i) => t === words[i]).length;
    return Math.round((correct / typedHistory.length) * 100);
  }, [typedHistory, words]);

  // ── Finish ──
  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const endTime = Date.now();
    const totalTime = Math.max(1, (endTime - (startTime || endTime)) / 1000);
    
    const allTyped = [...typedHistory];
    // Include partial current word
    if (typedInput.length > 0 && currentWordIndex < words.length) {
      allTyped.push(typedInput);
    }

    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;
    let correctWords = 0;
    let incorrectWords = 0;

    allTyped.forEach((typed, idx) => {
      const target = words[idx] || "";
      if (typed === target) {
        correctWords++;
        correctChars += typed.length;
      } else {
        incorrectWords++;
        const maxLen = Math.max(typed.length, target.length);
        for (let c = 0; c < maxLen; c++) {
          if (c < typed.length && c < target.length) {
            if (typed[c] === target[c]) correctChars++;
            else incorrectChars++;
          } else if (c >= target.length) {
            extraChars++;
          } else {
            missedChars++;
          }
        }
      }
    });

    // Add spaces between words as correct chars
    if (allTyped.length > 1) correctChars += allTyped.length - 1;

    const totalCharsTyped = correctChars + incorrectChars + extraChars;
    const accuracy = totalCharsTyped > 0 ? Math.round((correctChars / totalCharsTyped) * 100) : 0;
    const wpm = Math.max(0, Math.round((correctChars / 5) / (totalTime / 60)));
    const rawWpm = Math.max(0, Math.round((totalCharsTyped / 5) / (totalTime / 60)));

    // Consistency
    const wpmValues = wpmSnapshots.map(s => s.wpm).filter(v => v > 0);
    let consistency = 100;
    if (wpmValues.length > 1) {
      const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
      const variance = wpmValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / wpmValues.length;
      const cv = mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0;
      consistency = Math.max(0, Math.round(100 - cv));
    }

    // Guest login prompt
    const testCount = Number(localStorage.getItem("test_count") || 0) + 1;
    localStorage.setItem("test_count", testCount.toString());
    if (!user && testCount >= 3) {
      setIsLoginOpen(true);
    }

    setResults({
      wpm, rawWpm, accuracy, consistency,
      correctChars, incorrectChars, extraChars, missedChars,
      totalWords: allTyped.length,
      correctWords, incorrectWords,
      totalTime: Math.round(totalTime),
      wpmHistory: wpmSnapshots,
      charPerSecond: Math.round(totalCharsTyped / totalTime * 10) / 10,
    });
    setTestState("finished");
    toast.success("Test Complete!");
  }, [startTime, typedHistory, typedInput, currentWordIndex, words, wpmSnapshots, user]);

  // ── Key Handler ──
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState("CapsLock"));

    if (e.key === "Tab") {
      e.preventDefault();
      initTest();
      return;
    }

    if (testState === "finished") return;

    if (e.key === " ") {
      e.preventDefault();
      if (typedInput.length === 0) return;

      // Start on first space
      if (testState === "idle") {
        setTestState("running");
        setStartTime(Date.now());
      }

      const newHistory = [...typedHistory, typedInput];
      setTypedHistory(newHistory);
      setTypedInput("");
      const nextIdx = currentWordIndex + 1;
      setCWI(nextIdx);

      // Words mode: check completion
      if (mode === "words" && nextIdx >= words.length) {
        // Need to set state first before finishing
        setTimeout(() => finishTest(), 100);
      }
    } else if (e.key === "Backspace" && e.ctrlKey) {
      e.preventDefault();
      setTypedInput("");
    }
  }, [testState, typedInput, currentWordIndex, words, mode, initTest, finishTest, typedHistory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (testState === "finished") return;
    const v = e.target.value;
    if (testState === "idle" && v.length > 0) {
      setTestState("running");
      setStartTime(Date.now());
    }
    setTypedInput(v);
  };

  // ── Export ──
  const exportReport = useCallback(async () => {
    if (!reportRef.current) return;
    const t = toast.loading("Generating report...");
    try {
      const url = await toPng(reportRef.current, { pixelRatio: 3, backgroundColor: '#0a0a0a' });
      const a = document.createElement("a");
      a.download = `PaperXify-TypingTest-${results?.wpm}WPM.png`;
      a.href = url;
      a.click();
      toast.success("Report exported!", { id: t });
    } catch {
      toast.error("Export failed", { id: t });
    }
  }, [results]);

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-500/30 font-sans flex flex-col">
      
      {/* ── Navbar ── */}
      <header className="relative z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl px-4 md:px-10 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/tools">
            <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl transition-all h-8 w-8 md:h-9 md:w-9">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="h-5 w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-2">
            <Keyboard className="text-red-500 h-4 w-4 md:h-5 md:w-5" />
            <h1 className="text-sm md:text-base font-black tracking-tight">
              Typing<span className="text-red-500">Test</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-400">{user.username}</span>
            </div>
          ) : (
            <Button onClick={() => setIsLoginOpen(true)} variant="ghost" className="text-neutral-500 hover:text-white text-xs font-medium h-8 px-3">Sign In</Button>
          )}
          {testState === "finished" && (
            <Button onClick={exportReport} size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg px-4 h-8 text-xs">
              <Download size={14} className="mr-1.5" /> Export
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 w-full flex flex-col">
        {/* ── Mobile Banner ── */}
        <AnimatePresence>
          {isMobile && !mobileBannerDismissed && testState !== "running" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5"
            >
              <Monitor size={16} className="text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-400/90 font-medium leading-snug flex-1">
                For the best typing experience, use a <span className="font-bold text-amber-300">laptop or desktop</span> with a physical keyboard.
              </p>
              <button
                onClick={() => setMobileBannerDismissed(true)}
                className="text-amber-600 hover:text-amber-400 text-xs font-bold flex-shrink-0 px-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {testState !== "finished" ? (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-center py-6 md:py-12">
              
              {/* ── Mode Selector ── */}
              <div className={cn(
                "flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mb-6 md:mb-12 transition-all duration-500",
                testState === "running" && "opacity-0 pointer-events-none h-0 mb-0 overflow-hidden"
              )}>
                {/* Punctuation / Numbers */}
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/5">
                  <button onClick={() => setUsePunctuation(p => !p)} className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    usePunctuation ? "bg-red-600/20 text-red-400 border border-red-600/30" : "text-neutral-600 hover:text-neutral-400"
                  )}>
                    <AtSign size={13} /> punctuation
                  </button>
                  <button onClick={() => setUseNumbers(n => !n)} className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    useNumbers ? "bg-red-600/20 text-red-400 border border-red-600/30" : "text-neutral-600 hover:text-neutral-400"
                  )}>
                    <Hash size={13} /> numbers
                  </button>
                </div>

                <div className="h-6 w-px bg-white/10 hidden md:block" />

                {/* Mode */}
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/5">
                  <button onClick={() => setMode("time")} className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    mode === "time" ? "bg-white/10 text-white" : "text-neutral-600 hover:text-neutral-400"
                  )}>
                    <Clock size={13} /> time
                  </button>
                  <button onClick={() => setMode("words")} className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    mode === "words" ? "bg-white/10 text-white" : "text-neutral-600 hover:text-neutral-400"
                  )}>
                    <Type size={13} /> words
                  </button>
                </div>

                <div className="h-6 w-px bg-white/10 hidden md:block" />

                {/* Duration / Count */}
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/5">
                  {mode === "time"
                    ? ([15, 30, 60, 120] as TimeOption[]).map(t => (
                        <button key={t} onClick={() => setTimeOption(t)} className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                          timeOption === t ? "bg-red-600 text-white" : "text-neutral-600 hover:text-neutral-400"
                        )}>{t}</button>
                      ))
                    : ([10, 25, 50, 100] as WordOption[]).map(w => (
                        <button key={w} onClick={() => setWordOption(w)} className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                          wordOption === w ? "bg-red-600 text-white" : "text-neutral-600 hover:text-neutral-400"
                        )}>{w}</button>
                      ))
                  }
                </div>
              </div>

              {/* ── Live Stats (visible during test) ── */}
              {testState === "running" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black text-red-500 tabular-nums tracking-tighter font-mono">
                    {mode === "time" ? timeLeft : `${currentWordIndex}/${words.length}`}
                  </span>
                  <div className="flex items-center gap-4 text-neutral-600">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white tabular-nums">{liveWpm}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider">WPM</div>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="text-center">
                      <div className="text-lg font-bold text-white tabular-nums">{liveAccuracy}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider">ACC</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Typing Area ── */}
              <div
                onClick={() => inputRef.current?.focus()}
                className={cn(
                  "relative rounded-2xl md:rounded-3xl transition-all duration-300 cursor-text",
                  isFocused ? "ring-1 ring-red-600/20" : ""
                )}
              >
                {/* Blur overlay when not focused */}
                {!isFocused && (
                  <div className="absolute inset-0 z-20 rounded-2xl md:rounded-3xl bg-[#0a0a0a]/70 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <MousePointer2 size={16} />
                      <span className="text-sm font-medium">Click here or press any key to focus</span>
                    </div>
                  </div>
                )}

                {/* Caps Lock */}
                <AnimatePresence>
                  {capsLock && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-3 py-1">
                      <AlertCircle size={12} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Caps Lock ON</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Words */}
                <div ref={wordsContainerRef} className="relative p-4 sm:p-6 md:p-10 max-h-[145px] sm:max-h-[170px] md:max-h-[195px] overflow-hidden scroll-smooth">
                  <div className="font-mono text-base sm:text-lg md:text-[22px] leading-[2.2] sm:leading-[2.4] tracking-wide flex flex-wrap">
                    {words.map((word, wIdx) => {
                      const isActive = wIdx === currentWordIndex;
                      const isTyped = wIdx < currentWordIndex;
                      const typedWord = isTyped ? typedHistory[wIdx] : undefined;

                      return (
                        <span key={wIdx} ref={isActive ? activeWordRef : null} className="mr-[0.65em] relative">
                          {/* Render each character */}
                          {word.split("").map((char, cIdx) => {
                            let color = "text-neutral-700"; // pending

                            if (isTyped && typedWord !== undefined) {
                              if (cIdx < typedWord.length) {
                                color = typedWord[cIdx] === char ? "text-white" : "text-red-500 underline decoration-red-500/50";
                              } else {
                                color = "text-red-500/40"; // missed
                              }
                            } else if (isActive) {
                              if (cIdx < typedInput.length) {
                                color = typedInput[cIdx] === char
                                  ? "text-white"
                                  : "text-red-500 bg-red-500/15 rounded-sm";
                              }
                            }

                            return (
                              <span key={cIdx} className={cn("relative inline-block transition-colors duration-75", color)}>
                                {/* ── CARET ── */}
                                {isActive && cIdx === typedInput.length && (
                                  <span className="absolute -left-[1px] top-[0.1em] bottom-[0.1em] w-[2.5px] bg-red-500 rounded-full animate-caret z-10" />
                                )}
                                {char}
                              </span>
                            );
                          })}

                          {/* Caret at end of word if typed all chars */}
                          {isActive && typedInput.length === word.length && (
                            <span className="relative inline-block w-0" style={{ height: '1em' }}>
                              <span className="absolute left-0 top-[0.1em] bottom-[0.1em] w-[2.5px] bg-red-500 rounded-full animate-caret z-10" />
                            </span>
                          )}

                          {/* Extra typed chars beyond word length */}
                          {isActive && typedInput.length > word.length && (
                            <>
                              {typedInput.slice(word.length).split("").map((c, i) => (
                                <span key={`extra-${i}`} className="text-red-500/70 bg-red-500/10 rounded-sm relative inline-block">
                                  {c}
                                </span>
                              ))}
                              <span className="relative inline-block w-0" style={{ height: '1em' }}>
                                <span className="absolute left-0 top-[0.1em] bottom-[0.1em] w-[2.5px] bg-red-500 rounded-full animate-caret z-10" />
                              </span>
                            </>
                          )}

                          {/* Extra typed chars for completed words */}
                          {isTyped && typedWord && typedWord.length > word.length && (
                            typedWord.slice(word.length).split("").map((c, i) => (
                              <span key={`exh-${i}`} className="text-red-500/50">{c}</span>
                            ))
                          )}

                          {/* Active word underline */}
                          {isActive && (
                            <span className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-red-500/40 rounded-full" />
                          )}

                          {/* Incorrect word underline */}
                          {isTyped && typedWord && typedWord !== word && (
                            <span className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-red-500/60 rounded-full" />
                          )}
                        </span>
                      );
                    })}
                  </div>

                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                </div>

                {/* Hidden input — on mobile, use a visible but transparent input to trigger keyboard */}
                <input
                  ref={inputRef}
                  type="text"
                  value={typedInput}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  inputMode="text"
                  className={cn(
                    "absolute opacity-0 pointer-events-none",
                    isMobile ? "bottom-0 left-0 w-full h-[1px]" : "h-0 w-0"
                  )}
                  aria-label="Type here"
                />
              </div>

              {/* ── Restart hint ── */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                <button onClick={initTest} className="flex items-center gap-2 text-neutral-700 hover:text-neutral-400 transition-colors">
                  <RotateCcw size={14} />
                  <span className="text-xs font-medium">restart test</span>
                </button>
                {!isMobile && (
                  <>
                    <div className="h-4 w-px bg-white/5" />
                    <span className="text-[10px] text-neutral-800 font-mono">
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-neutral-600 text-[9px]">tab</kbd> to restart
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            /* ────────────────────────────────────
               RESULTS SCREEN
              ──────────────────────────────────── */
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 py-5 sm:py-8 md:py-12 space-y-4 sm:space-y-6">
              
              <div ref={reportRef} className="bg-[#0e0e0e] rounded-2xl md:rounded-3xl border border-white/[0.06] overflow-hidden">
                
                {/* ── Hero Stats ── */}
                <div className="p-4 sm:p-6 md:p-10 pb-3 sm:pb-4 md:pb-6">
                  <div className="flex flex-col md:flex-row md:items-end gap-4 sm:gap-6 md:gap-12">
                    {/* WPM - Primary */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <Gauge size={14} className="text-red-500" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">words per minute</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl sm:text-6xl md:text-8xl font-black text-red-500 tracking-tighter leading-none tabular-nums">
                          {results?.wpm}
                        </span>
                        <span className="text-base sm:text-lg md:text-xl font-bold text-red-500/40">wpm</span>
                      </div>
                    </div>
                    
                    {/* Secondary Stats */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-10 flex-1">
                      <div>
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                          <Crosshair size={11} className="text-emerald-500 sm:w-3 sm:h-3" />
                          <span className="text-[8px] sm:text-[9px] font-bold text-neutral-600 uppercase tracking-[0.15em]">accuracy</span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tighter tabular-nums">
                          {results?.accuracy}<span className="text-xs sm:text-sm md:text-lg text-neutral-600">%</span>
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                          <Target size={11} className="text-blue-500 sm:w-3 sm:h-3" />
                          <span className="text-[8px] sm:text-[9px] font-bold text-neutral-600 uppercase tracking-[0.15em]">consistency</span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tighter tabular-nums">
                          {results?.consistency}<span className="text-xs sm:text-sm md:text-lg text-neutral-600">%</span>
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                          <Clock size={11} className="text-amber-500 sm:w-3 sm:h-3" />
                          <span className="text-[8px] sm:text-[9px] font-bold text-neutral-600 uppercase tracking-[0.15em]">time</span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tighter tabular-nums">
                          {results?.totalTime}<span className="text-xs sm:text-sm md:text-lg text-neutral-600">s</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── WPM Graph ── */}
                {results && results.wpmHistory.length >= 2 && (
                  <div className="px-4 sm:px-6 md:px-10 py-4 sm:py-6 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-neutral-600" />
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.15em]">Performance Graph</span>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-[2px] bg-red-500 rounded-full" />
                          <span className="text-[9px] font-bold text-neutral-700 uppercase">WPM</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-[2px] bg-white/15 rounded-full" />
                          <span className="text-[9px] font-bold text-neutral-700 uppercase">Raw</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-amber-500/50 rounded-full" />
                          <span className="text-[9px] font-bold text-neutral-700 uppercase">Errors</span>
                        </div>
                      </div>
                    </div>
                    <WpmGraph data={results.wpmHistory} />
                  </div>
                )}

                {/* ── Detailed Stats Grid ── */}
                <div className="px-4 sm:px-6 md:px-10 py-4 sm:py-6 border-t border-white/[0.04]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
                    {/* Raw WPM */}
                    <StatCard icon={<Zap size={14} />} label="Raw WPM" value={results?.rawWpm || 0} color="text-neutral-400" />
                    
                    {/* Characters */}
                    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Type size={13} className="text-neutral-600" />
                        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.15em]">characters</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-emerald-500 tabular-nums">{results?.correctChars}</span>
                        <span className="text-neutral-700">/</span>
                        <span className="text-lg font-bold text-red-500 tabular-nums">{results?.incorrectChars}</span>
                        <span className="text-neutral-700">/</span>
                        <span className="text-lg font-bold text-amber-500 tabular-nums">{results?.extraChars}</span>
                        <span className="text-neutral-700">/</span>
                        <span className="text-lg font-bold text-neutral-500 tabular-nums">{results?.missedChars}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[8px] text-emerald-600 font-bold">correct</span>
                        <span className="text-neutral-800">/</span>
                        <span className="text-[8px] text-red-600 font-bold">wrong</span>
                        <span className="text-neutral-800">/</span>
                        <span className="text-[8px] text-amber-600 font-bold">extra</span>
                        <span className="text-neutral-800">/</span>
                        <span className="text-[8px] text-neutral-600 font-bold">missed</span>
                      </div>
                    </div>

                    {/* Words */}
                    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Award size={13} className="text-neutral-600" />
                        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.15em]">words</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-emerald-500 tabular-nums">{results?.correctWords}</span>
                        <span className="text-neutral-700">/</span>
                        <span className="text-lg font-bold text-red-500 tabular-nums">{results?.incorrectWords}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[8px] text-emerald-600 font-bold">correct</span>
                        <span className="text-neutral-800">/</span>
                        <span className="text-[8px] text-red-600 font-bold">incorrect</span>
                      </div>
                    </div>

                    {/* Speed */}
                    <StatCard icon={<TrendingUp size={14} />} label="Chars/Sec" value={results?.charPerSecond || 0} color="text-neutral-400" />
                  </div>
                </div>

                {/* ── Character Accuracy Bar ── */}
                {results && (
                  <div className="px-4 sm:px-6 md:px-10 py-4 sm:py-5 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.15em]">accuracy breakdown</span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden gap-[1px]">
                      {results.correctChars > 0 && (
                        <div
                          className="bg-emerald-500 rounded-l-full transition-all"
                          style={{ width: `${(results.correctChars / (results.correctChars + results.incorrectChars + results.extraChars + results.missedChars)) * 100}%` }}
                          title={`Correct: ${results.correctChars}`}
                        />
                      )}
                      {results.incorrectChars > 0 && (
                        <div
                          className="bg-red-500 transition-all"
                          style={{ width: `${(results.incorrectChars / (results.correctChars + results.incorrectChars + results.extraChars + results.missedChars)) * 100}%` }}
                          title={`Incorrect: ${results.incorrectChars}`}
                        />
                      )}
                      {results.extraChars > 0 && (
                        <div
                          className="bg-amber-500 transition-all"
                          style={{ width: `${(results.extraChars / (results.correctChars + results.incorrectChars + results.extraChars + results.missedChars)) * 100}%` }}
                          title={`Extra: ${results.extraChars}`}
                        />
                      )}
                      {results.missedChars > 0 && (
                        <div
                          className="bg-neutral-600 rounded-r-full transition-all"
                          style={{ width: `${(results.missedChars / (results.correctChars + results.incorrectChars + results.extraChars + results.missedChars)) * 100}%` }}
                          title={`Missed: ${results.missedChars}`}
                        />
                      )}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] font-bold text-emerald-600 tabular-nums">{results.correctChars} correct</span>
                      <span className="text-[9px] font-bold text-red-600 tabular-nums">{results.incorrectChars} wrong</span>
                    </div>
                  </div>
                )}

                {/* ── Test Info Footer ── */}
                <div className="px-4 sm:px-6 md:px-10 py-3 sm:py-4 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest">
                      Paper<span className="text-red-600">Xify</span>
                    </span>
                    <div className="h-3 w-px bg-white/5" />
                    <span className="text-[9px] text-neutral-800 font-mono">
                      {mode === "time" ? `time ${timeOption}s` : `words ${wordOption}`}
                      {usePunctuation ? " · punctuation" : ""}
                      {useNumbers ? " · numbers" : ""}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-800">
                    {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center pt-2">
                <Button onClick={initTest} className="h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all active:scale-95 group text-sm">
                  <RotateCcw className="mr-2 group-hover:-rotate-180 transition-transform duration-500" size={18} /> Next Test
                </Button>
                <Button onClick={() => router.push('/tools')} variant="outline" className="h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 border-white/10 hover:bg-white/5 rounded-xl font-bold text-neutral-500 text-sm">
                  All Tools
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <CorePromo />
      </main>

      <Footer />

      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={(t: string, info: any) => {
        const u = { username: info.name.split(' ')[0], picture: info.picture };
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
        setIsLoginOpen(false);
        toast.success("Signed In!");
      }} />

      <style jsx global>{`
        @keyframes caret-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-caret {
          animation: caret-blink 1s infinite;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────
// WPM Graph Component (SVG)
// ────────────────────────────────────────────
function WpmGraph({ data }: { data: WpmSnapshot[] }) {
  if (data.length < 2) return null;

  const width = 800;
  const height = 200;
  const padL = 45;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const maxWpm = Math.max(...data.map(d => Math.max(d.wpm, d.rawWpm)), 10);
  const maxTime = data[data.length - 1].second;
  const maxErrors = Math.max(...data.map(d => d.errors), 1);

  const xScale = (sec: number) => padL + (sec / maxTime) * chartW;
  const yScale = (wpm: number) => padT + chartH - (wpm / (maxWpm * 1.15)) * chartH;
  const errYScale = (e: number) => padT + chartH - (e / (maxErrors * 1.3)) * chartH;

  const buildPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";
    // Smooth curve using catmull-rom spline converted to cubic bezier
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const wpmPoints = data.map(d => ({ x: xScale(d.second), y: yScale(d.wpm) }));
  const rawPoints = data.map(d => ({ x: xScale(d.second), y: yScale(d.rawWpm) }));
  const wpmPath = buildPath(wpmPoints);
  const rawPath = buildPath(rawPoints);

  // Area path for WPM
  const wpmArea = wpmPath + ` L ${wpmPoints[wpmPoints.length - 1].x} ${padT + chartH} L ${wpmPoints[0].x} ${padT + chartH} Z`;

  // Y-axis grid labels
  const yLabels = [];
  const step = Math.ceil(maxWpm / 4 / 10) * 10 || 10;
  for (let v = 0; v <= maxWpm * 1.1; v += step) {
    yLabels.push(v);
  }

  // X-axis time labels
  const xLabels: number[] = [];
  const xStep = Math.max(1, Math.ceil(maxTime / 8));
  for (let t = 0; t <= maxTime; t += xStep) {
    xLabels.push(t);
  }

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 'auto', maxHeight: '200px' }}>
        {/* Grid */}
        {yLabels.map(v => (
          <g key={`y-${v}`}>
            <line x1={padL} y1={yScale(v)} x2={width - padR} y2={yScale(v)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={padL - 8} y={yScale(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">{v}</text>
          </g>
        ))}
        {xLabels.map(t => (
          <g key={`x-${t}`}>
            <line x1={xScale(t)} y1={padT} x2={xScale(t)} y2={padT + chartH} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <text x={xScale(t)} y={height - 5} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">{t}s</text>
          </g>
        ))}

        {/* WPM filled area */}
        <path d={wpmArea} fill="url(#wpmFill)" />

        {/* Raw WPM line */}
        <path d={rawPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />

        {/* WPM line */}
        <path d={wpmPath} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />

        {/* Error bars at bottom */}
        {data.map((d, i) => {
          if (d.errors <= 0) return null;
          const barH = Math.max(4, (d.errors / maxErrors) * 30);
          return (
            <rect key={`err-${i}`} x={xScale(d.second) - 3} y={padT + chartH - barH} width={6} height={barH}
              rx={2} fill="rgba(245,158,11,0.35)" />
          );
        })}

        {/* WPM dots */}
        {wpmPoints.map((p, i) => (
          <g key={`dot-${i}`}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0e0e0e" stroke="#dc2626" strokeWidth="2" />
          </g>
        ))}

        {/* WPM value labels on hover points (only show a few) */}
        {wpmPoints.filter((_, i) => i === 0 || i === wpmPoints.length - 1 || i % Math.max(1, Math.floor(wpmPoints.length / 5)) === 0).map((p, i) => (
          <text key={`lbl-${i}`} x={p.x} y={p.y - 10} textAnchor="middle" fill="rgba(220,38,38,0.7)" fontSize="9" fontFamily="monospace" fontWeight="bold">
            {data[wpmPoints.indexOf(p)]?.wpm}
          </text>
        ))}

        <defs>
          <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────
// Stat Card Component
// ────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-neutral-600">{icon}</span>
        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.15em]">{label}</span>
      </div>
      <p className={cn("text-xl font-bold tabular-nums", color)}>{value}</p>
    </div>
  );
}