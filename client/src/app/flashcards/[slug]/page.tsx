"use client";

import React, { useState, useRef, useCallback, useEffect, use, TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Download, ArrowLeft,
  Layers, RotateCcw, CheckCircle, X, ZapIcon, BookOpen,
  List, RotateCw
} from "lucide-react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/config/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Flashcard {
  id: number;
  front: string;
  back: string;
  mastery?: string;
  difficulty?: string;
}

interface FlashcardSet {
  _id: string;
  title: string;
  slug: string;
  videoUrl: string;
  videoId: string;
  flashcards: Flashcard[];
  generationDetails?: any;
  createdAt: string;
}

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

async function captureCardAsCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, { scale: 2, backgroundColor: "#0a0a0a", useCORS: true, logging: false });
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FlashcardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDeckSheet, setShowDeckSheet] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Touch swipe tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/flashcards/slug/${slug}`, {
        headers: { Auth: getAuthToken() },
      });
      setSet(res.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Please log in to view this flashcard set.");
      } else if (err.response?.status === 404) {
        setError("Flashcard set not found.");
      } else {
        setError("Failed to load. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goTo = (idx: number) => { setActiveIndex(idx); setIsFlipped(false); };
  const goNext = () => set && goTo(Math.min(set.flashcards.length - 1, activeIndex + 1));
  const goPrev = () => goTo(Math.max(0, activeIndex - 1));

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); setIsFlipped(f => !f); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, set]);

  // Touch swipe handlers
  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only treat as swipe if mostly horizontal
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const toggleMastered = (idx: number) => {
    setMasteredCards(prev => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  };

  // ── Export ───────────────────────────────────────────────────────────────
  const exportCurrentPNG = async () => {
    if (!set || isExporting) return;
    setIsExporting(true);
    toast.info("Saving card...", { id: "fc-export" });
    try {
      const card = set.flashcards[activeIndex];

      // Build an offscreen flat div — html2canvas can't handle CSS 3D transforms
      const tempDiv = document.createElement("div");
      tempDiv.style.cssText = [
        "position:fixed", "left:-9999px", "top:-9999px",
        "width:800px", "height:500px",
        "padding:56px 64px",
        "background:linear-gradient(145deg,#141414 0%,#0c0c0c 100%)",
        "color:white", "font-family:system-ui,sans-serif",
        "display:flex", "flex-direction:column",
        "justify-content:center", "align-items:center",
        "text-align:center", "border-radius:28px",
        "border:1px solid rgba(255,255,255,0.08)",
        "box-shadow:0 40px 80px rgba(0,0,0,0.6)",
        "box-sizing:border-box",
      ].join(";");

      // Show both front and back together in the PNG export
      tempDiv.innerHTML = `
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#555;margin-bottom:20px;font-weight:700;">
          Card ${activeIndex + 1} of ${total} · Paperxify
        </div>
        <h2 style="font-size:30px;font-weight:900;line-height:1.3;color:#fff;margin:0 0 28px;letter-spacing:-0.5px;">
          ${card.front}
        </h2>
        <div style="width:100%;border-top:1px solid rgba(239,68,68,0.2);padding-top:24px;">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#ef4444;margin-bottom:12px;font-weight:700;">Answer</div>
          <p style="font-size:17px;line-height:1.7;color:#aaa;margin:0;">${card.back}</p>
        </div>
      `;
      document.body.appendChild(tempDiv);

      const canvas = await captureCardAsCanvas(tempDiv);
      document.body.removeChild(tempDiv);

      canvas.toBlob(blob => {
        if (blob) {
          saveAs(blob, `flashcard-${activeIndex + 1}-${card.front.substring(0, 30).replace(/[^a-z0-9]/gi, "-")}.png`);
          toast.success("Saved!", { id: "fc-export" });
        }
      });
    } catch (e) {
      console.error("PNG export error:", e);
      toast.error("Export failed", { id: "fc-export" });
    }
    setIsExporting(false);
    setShowExportMenu(false);
  };

  const exportAllZip = async () => {
    if (!set || isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    toast.info("Building ZIP...", { id: "fc-export" });
    const zip = new JSZip();
    const imgFolder = zip.folder("flashcards")!;
    const tempDiv = document.createElement("div");
    tempDiv.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:800px;height:500px;padding:48px;background:#0a0a0a;color:white;font-family:system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;border-radius:24px;";
    document.body.appendChild(tempDiv);
    for (let i = 0; i < set.flashcards.length; i++) {
      const card = set.flashcards[i];
      tempDiv.innerHTML = `<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#555;margin-bottom:24px;">Card ${i + 1} of ${set.flashcards.length}</div><h2 style="font-size:32px;font-weight:900;line-height:1.3;color:#fff;margin:0 0 24px;">${card.front}</h2><div style="border-top:1px solid #333;padding-top:20px;width:100%;"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ef4444;margin-bottom:12px;">Answer</div><p style="font-size:18px;line-height:1.7;color:#ccc;margin:0;">${card.back}</p></div>`;
      const canvas = await captureCardAsCanvas(tempDiv);
      await new Promise<void>(res => {
        canvas.toBlob(blob => {
          if (blob) imgFolder.file(`card-${(i + 1).toString().padStart(2, "0")}.png`, blob);
          setExportProgress(Math.round(((i + 1) / set.flashcards.length) * 90));
          res();
        });
      });
    }
    zip.file("flashcards.json", JSON.stringify(set.flashcards.map(c => ({ front: c.front, back: c.back })), null, 2));
    document.body.removeChild(tempDiv);
    const blob = await zip.generateAsync({ type: "blob" });
    setExportProgress(100);
    saveAs(blob, `${set.title || "flashcards"}.zip`);
    toast.success("ZIP ready!", { id: "fc-export" });
    setIsExporting(false);
    setExportProgress(0);
    setShowExportMenu(false);
  };

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-dvh bg-black flex flex-col items-center justify-center text-white gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-spin border-t-transparent" />
        </div>
        <p className="text-neutral-500 text-sm font-medium">Loading flashcards…</p>
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="h-dvh bg-black flex flex-col items-center justify-center text-white gap-5 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <X className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold mb-1">Couldn't load flashcards</h2>
          <p className="text-neutral-500 text-sm">{error}</p>
        </div>
        <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-red-600 rounded-xl text-sm font-bold">
          Go Home
        </button>
      </div>
    );
  }

  const cards = set.flashcards;
  const total = cards.length;
  const current = cards[activeIndex];
  const masteredCount = masteredCards.size;
  const isMastered = masteredCards.has(activeIndex);
  const progress = ((activeIndex) / Math.max(total - 1, 1)) * 100;

  return (
    <div className="h-dvh w-screen bg-[#080808] text-white flex flex-col overflow-hidden select-none">

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />

      {/* ── Export progress bar ────────────────────────────────────────────── */}
      {isExporting && exportProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/5 z-50">
          <motion.div className="h-full bg-red-500" animate={{ width: `${exportProgress}%` }} transition={{ duration: 0.3 }} />
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="relative z-20 shrink-0 flex items-center justify-between px-3 py-2.5 bg-black/70 backdrop-blur-md border-b border-white/[0.06]">
        {/* Left: back + title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => router.push("/")}
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 active:bg-white/10 transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white leading-none truncate max-w-[160px]">{set.title}</p>
            <p className="text-[10px] text-neutral-600 mt-0.5 leading-none">
              {activeIndex + 1}/{total} · {masteredCount > 0 ? `${masteredCount} mastered` : "0 mastered"}
            </p>
          </div>
        </div>

        {/* Right: export + deck */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowDeckSheet(true)}
            className="w-8 h-8 rounded-xl bg-white/5 active:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="View all cards"
          >
            <List size={14} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-8 h-8 rounded-xl bg-white/5 active:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Export"
            >
              <Download size={14} />
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-10 z-50 w-48 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-1.5 overflow-hidden"
                  >
                    <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-2.5 py-1.5">Export</p>
                    <button
                      onClick={exportCurrentPNG}
                      disabled={isExporting}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                        <ZapIcon size={11} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">This card</div>
                        <div className="text-[10px] text-neutral-500">Save as PNG</div>
                      </div>
                    </button>
                    <button
                      onClick={exportAllZip}
                      disabled={isExporting}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                        <Layers size={11} className="text-red-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">All {total} cards</div>
                        <div className="text-[10px] text-neutral-500">ZIP + JSON</div>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── Thin progress bar ─────────────────────────────────────────────── */}
      <div className="relative z-10 h-[2px] bg-white/[0.04] shrink-0">
        <motion.div
          className="h-full bg-gradient-to-r from-red-600 to-red-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ── CARD AREA (swipeable) ─────────────────────────────────────────── */}
      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-3 pb-4 min-h-0 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Card */}
        <div className="w-full max-w-sm lg:max-w-2xl" style={{ perspective: "1400px" }}>
          <motion.div
            ref={cardRef}
            onClick={() => setIsFlipped(f => !f)}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.55, type: "spring", stiffness: 60, damping: 15 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full cursor-pointer aspect-[3/4] lg:aspect-[16/9]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* FRONT ─────────────────────────────────────────────────────── */}
            <div
              className="absolute inset-0 rounded-[24px] flex flex-col overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Top label */}
              <div className="flex items-center gap-1.5 px-5 pt-5 pb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-[9px] font-bold tracking-[2.5px] text-neutral-600 uppercase">Concept</span>
                <span className="ml-auto text-[9px] text-neutral-700 font-mono">{String(activeIndex + 1).padStart(2,"0")}</span>
              </div>

              {/* Card content */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
                {/* Glow */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={`front-${activeIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-center text-xl font-black leading-snug tracking-tight text-white relative z-10"
                  >
                    {current?.front}
                  </motion.h2>
                </AnimatePresence>
              </div>

              {/* Bottom tap hint */}
              <div className="pb-5 flex justify-center">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full">
                  <RotateCcw size={9} className="text-neutral-600" />
                  <span className="text-[9px] text-neutral-600 font-medium">Tap to reveal</span>
                </div>
              </div>

              {/* Mastered badge */}
              {isMastered && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle size={12} className="text-white" />
                </div>
              )}
            </div>

            {/* BACK ──────────────────────────────────────────────────────── */}
            <div
              className="absolute inset-0 rounded-[24px] flex flex-col overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "#0a0a0a",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              {/* Top label */}
              <div className="flex items-center gap-1.5 px-5 pt-5 pb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                <span className="text-[9px] font-bold tracking-[2.5px] text-red-500/70 uppercase">Answer</span>
              </div>

              {/* Divider */}
              <div className="mx-5 h-px bg-red-500/10" />

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 flex flex-col items-center justify-center">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`back-${activeIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium leading-relaxed text-neutral-200 text-center relative z-10"
                  >
                    {current?.back}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="pb-5 flex justify-center">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full">
                  <RotateCw size={9} className="text-neutral-600" />
                  <span className="text-[9px] text-neutral-600 font-medium">Tap to flip back</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Swipe hint dots (mobile only) */}
        <div className="flex items-center gap-1.5 mt-4 lg:hidden">
          {total <= 10
            ? cards.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-4 h-1.5 bg-white"
                      : masteredCards.has(i)
                      ? "w-1.5 h-1.5 bg-emerald-500/70"
                      : "w-1.5 h-1.5 bg-white/15"
                  }`}
                />
              ))
            : (
              <p className="text-[10px] text-neutral-600 font-medium">
                Swipe to navigate · {activeIndex + 1} of {total}
              </p>
            )
          }
        </div>
      </div>

      {/* ── BOTTOM CONTROLS ───────────────────────────────────────────── */}
      <div className="relative z-20 shrink-0 bg-black/80 backdrop-blur-md border-t border-white/[0.06] px-4 pt-3 pb-3"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        {/* Prev / Mastered / Next row */}
        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <button
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/[0.08] active:bg-white/10 flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none shrink-0"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => toggleMastered(activeIndex)}
            className={`flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border transition-all active:scale-95 ${
              isMastered
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-white/[0.04] border-white/[0.08] text-neutral-400"
            }`}
          >
            <CheckCircle size={14} />
            <span>{isMastered ? "Mastered ✓" : "Mark mastered"}</span>
          </button>

          <button
            onClick={goNext}
            disabled={activeIndex === total - 1}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/[0.08] active:bg-white/10 flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none shrink-0"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Mastery progress bar */}
        {masteredCount > 0 && (
          <div className="flex items-center gap-2 mt-2.5 max-w-sm mx-auto">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                animate={{ width: `${(masteredCount / total) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-[9px] text-emerald-500 font-bold shrink-0">
              {masteredCount}/{total}
            </span>
          </div>
        )}
      </div>


      {/* ── DECK BOTTOM SHEET ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeckSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeckSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-[125] bg-neutral-950/98 border-t border-white/10 rounded-t-[28px] flex flex-col"
              style={{ maxHeight: '80dvh' }}
            >
              {/* Sheet handle + header */}
              <div className="flex flex-col items-center px-5 pt-3 pb-4 border-b border-white/5 shrink-0">
                <div className="w-10 h-1 bg-white/10 rounded-full mb-4" />
                <div className="w-full flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">All Cards</h3>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{masteredCount}/{total} mastered</p>
                  </div>
                  <button
                    onClick={() => setShowDeckSheet(false)}
                    className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Card list */}
              <div className="overflow-y-auto custom-scrollbar flex-1 p-3 space-y-2">
                {cards.map((card, idx) => {
                  const isAct = idx === activeIndex;
                  const isMast = masteredCards.has(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => { goTo(idx); setShowDeckSheet(false); }}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all active:scale-[0.98] ${
                        isAct
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-white/[0.03] border-white/[0.06] active:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          isAct ? "bg-red-500 text-white" : isMast ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-neutral-500"
                        }`}>
                          {isMast ? "✓" : idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold leading-relaxed line-clamp-2 ${isAct ? "text-white" : "text-neutral-300"}`}>
                            {card.front}
                          </p>
                          {isMast && (
                            <span className="text-[9px] text-emerald-500 font-bold mt-0.5 inline-block">Mastered</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
