"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Youtube,
  Sparkles,
  Bot,
  Settings2,
  Zap,
  FileText,
  Brain,
  Globe,
  Check,
} from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────── Constants */
const TOUR_KEY = "paperxify_tour_v2";
const SPOT_PAD = 10; // px padding around highlighted element

/* ─────────────────────────────────────────── Types */
interface TourStep {
  id: string;
  targetId: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  badge: string;
  preferSide: "top" | "bottom" | "left" | "right";
}

/* ──────────────────────────────────────── Tour Steps */
const STEPS: TourStep[] = [
  {
    id: "url",
    targetId: "tour-url-input",
    title: "Paste any YouTube URL",
    body: "Drop a YouTube lecture here and we'll instantly pull the title, thumbnail, and duration — so you know you're processing the right video.",
    icon: <Youtube size={16} className="text-red-400" />,
    badge: "Step 1",
    preferSide: "bottom",
  },
  {
    id: "prompt",
    targetId: "tour-prompt-input",
    title: "Add a custom focus",
    body: "Optionally tell the AI what to prioritize — \"focus on formulas\", \"highlight diagrams\", or anything specific. Leave blank for a full summary.",
    icon: <Sparkles size={16} className="text-amber-400" />,
    badge: "Step 2",
    preferSide: "top",
  },
  {
    id: "model",
    targetId: "tour-model-selector",
    title: "Choose your AI engine",
    body: "Free models like Sankshipta work great for most videos. Unlock Pariksha-Sarthi or Vyavastha for deeper, richer notes on long lectures.",
    icon: <Bot size={16} className="text-blue-400" />,
    badge: "Step 3",
    preferSide: "top",
  },
  {
    id: "options",
    targetId: "tour-options-selector",
    title: "Language & detail depth",
    body: "Generate notes in English, Hindi, Marathi, Bengali & more. Dial in Short, Standard or Comprehensive depth to match your study style.",
    icon: <Settings2 size={16} className="text-violet-400" />,
    badge: "Step 4",
    preferSide: "top",
  },
  {
    id: "generate",
    targetId: "tour-generate-btn",
    title: "Initialize and get your notes",
    body: "Once a valid URL is detected, this button comes alive. One click starts the AI — notes are ready in under 20 seconds. That's it!",
    icon: <Zap size={16} className="text-emerald-400" />,
    badge: "Final",
    preferSide: "top",
  },
];

/* ─────────────────────────────────────────── Welcome features */
const FEATURES = [
  {
    icon: <Youtube size={15} className="text-red-400" />,
    color: "from-red-500/10 to-red-500/5 border-red-500/15",
    title: "Any YouTube video",
    desc: "Paste the link — we handle transcripts, chapters & metadata.",
  },
  {
    icon: <Brain size={15} className="text-blue-400" />,
    color: "from-blue-500/10 to-blue-500/5 border-blue-500/15",
    title: "Multiple AI engines",
    desc: "Free & premium models with different depth levels.",
  },
  {
    icon: <FileText size={15} className="text-emerald-400" />,
    color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/15",
    title: "Beautiful notes, instantly",
    desc: "Structured headings, bullets, key formulas — export-ready.",
  },
  {
    icon: <Globe size={15} className="text-violet-400" />,
    color: "from-violet-500/10 to-violet-500/5 border-violet-500/15",
    title: "7 Indian languages",
    desc: "Hindi, Marathi, Bengali, Telugu, Tamil, Kannada & English.",
  },
];

/* ─────────────────────────────────────────── Utility: get rect */
function getRect(id: string): DOMRect | null {
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect() : null;
}

/* ─────────────────────────────────────────── SVG Spotlight Mask */
function SpotlightMask({
  rect,
  onClickOutside,
}: {
  rect: DOMRect | null;
  onClickOutside: () => void;
}) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  const r = SPOT_PAD + 10; // border-radius of cutout

  if (!rect) {
    return (
      <div
        className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-[2px]"
        onClick={onClickOutside}
      />
    );
  }

  const x = rect.left - SPOT_PAD;
  const y = rect.top - SPOT_PAD;
  const w = rect.width + SPOT_PAD * 2;
  const h = rect.height + SPOT_PAD * 2;

  const clipPath = `
    M 0 0 L ${vw} 0 L ${vw} ${vh} L 0 ${vh} Z
    M ${x + r} ${y}
    Q ${x} ${y} ${x} ${y + r}
    L ${x} ${y + h - r}
    Q ${x} ${y + h} ${x + r} ${y + h}
    L ${x + w - r} ${y + h}
    Q ${x + w} ${y + h} ${x + w} ${y + h - r}
    L ${x + w} ${y + r}
    Q ${x + w} ${y} ${x + w - r} ${y}
    Z
  `;

  return (
    <div className="fixed inset-0 z-[9000] pointer-events-none">
      {/* Dark mask with cutout */}
      <svg
        width={vw}
        height={vh}
        className="absolute inset-0 pointer-events-none"
        style={{ display: "block" }}
      >
        <defs>
          <clipPath id="spotlight-clip" clipRule="evenodd">
            <path d={clipPath} fillRule="evenodd" />
          </clipPath>
        </defs>
        <rect
          width={vw}
          height={vh}
          fill="rgba(0,0,0,0.78)"
          clipPath="url(#spotlight-clip)"
        />
      </svg>

      {/* Click-outside handler (only on the dark region) */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={onClickOutside}
        style={{
          clipPath: `path('${clipPath.replace(/\s+/g, " ").trim()}')`,
        }}
      />

      {/* Glowing ring around spotlight */}
      <motion.div
        key={`ring-${rect.left}-${rect.top}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute rounded-xl pointer-events-none"
        style={{
          top: y - 1,
          left: x - 1,
          width: w + 2,
          height: h + 2,
          boxShadow: `
            0 0 0 1.5px rgba(255,255,255,0.25),
            0 0 0 4px rgba(255,255,255,0.06),
            0 0 24px 2px rgba(255,255,255,0.08)
          `,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────── Smart Tooltip */
const TOOLTIP_W = 320;
const TOOLTIP_ESTIMATED_H = 200;
const GAP = 14;

function computeTooltipPos(
  rect: DOMRect,
  prefer: TourStep["preferSide"],
  tooltipH: number
): { top: number; left: number; arrowSide: "top" | "bottom" | "left" | "right" | null } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = SPOT_PAD + GAP;

  const spots = {
    bottom: { top: rect.bottom + pad, left: rect.left + rect.width / 2 - TOOLTIP_W / 2 },
    top: { top: rect.top - pad - tooltipH, left: rect.left + rect.width / 2 - TOOLTIP_W / 2 },
    right: { top: rect.top + rect.height / 2 - tooltipH / 2, left: rect.right + pad },
    left: { top: rect.top + rect.height / 2 - tooltipH / 2, left: rect.left - pad - TOOLTIP_W },
  };

  const fits = (s: { top: number; left: number }) =>
    s.top > 8 && s.left > 8 && s.top + tooltipH < vh - 8 && s.left + TOOLTIP_W < vw - 8;

  const order: TourStep["preferSide"][] =
    prefer === "top" ? ["top", "bottom", "right", "left"] :
    prefer === "bottom" ? ["bottom", "top", "right", "left"] :
    prefer === "right" ? ["right", "left", "bottom", "top"] :
    ["left", "right", "bottom", "top"];

  for (const side of order) {
    const pos = spots[side];
    if (fits(pos)) {
      return {
        top: Math.max(8, pos.top),
        left: Math.max(8, Math.min(pos.left, vw - TOOLTIP_W - 8)),
        arrowSide:
          side === "bottom" ? "top" :
          side === "top" ? "bottom" :
          side === "right" ? "left" :
          "right",
      };
    }
  }

  // Fallback: center of screen
  return {
    top: Math.max(8, vh / 2 - tooltipH / 2),
    left: vw / 2 - TOOLTIP_W / 2,
    arrowSide: null,
  };
}

function TourTooltip({
  step,
  stepIdx,
  total,
  rect,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TourStep;
  stepIdx: number;
  total: number;
  rect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; arrowSide: string | null }>({
    top: -9999,
    left: -9999,
    arrowSide: null,
  });

  useLayoutEffect(() => {
    if (!rect || !ref.current) {
      setPos({
        top: window.innerHeight / 2 - TOOLTIP_ESTIMATED_H / 2,
        left: window.innerWidth / 2 - TOOLTIP_W / 2,
        arrowSide: null,
      });
      return;
    }
    const h = ref.current.offsetHeight || TOOLTIP_ESTIMATED_H;
    setPos(computeTooltipPos(rect, step.preferSide, h));
  }, [rect, step]);

  const isFirst = stepIdx === 0;
  const isLast = stepIdx === total - 1;
  const progress = ((stepIdx + 1) / total) * 100;

  // Arrow positioning
  const arrowEl = pos.arrowSide ? (
    <div
      className="absolute w-2.5 h-2.5 bg-[#161616] border-white/10 rotate-45"
      style={{
        ...(pos.arrowSide === "top" && {
          top: -5,
          left: rect ? Math.min(rect.left + rect.width / 2 - pos.left - 5, TOOLTIP_W - 20) : TOOLTIP_W / 2 - 5,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
        }),
        ...(pos.arrowSide === "bottom" && {
          bottom: -5,
          left: rect ? Math.min(rect.left + rect.width / 2 - pos.left - 5, TOOLTIP_W - 20) : TOOLTIP_W / 2 - 5,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }),
        ...(pos.arrowSide === "left" && {
          left: -5,
          top: "50%",
          marginTop: -5,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
        }),
        ...(pos.arrowSide === "right" && {
          right: -5,
          top: "50%",
          marginTop: -5,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }),
      }}
    />
  ) : null;

  return (
    <motion.div
      ref={ref}
      key={step.id}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: TOOLTIP_W,
        zIndex: 9999,
      }}
      className="bg-[#161616] border border-white/[0.08] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.7),0_0_0_0.5px_rgba(255,255,255,0.04)] overflow-hidden"
    >
      {arrowEl}

      {/* Progress bar */}
      <div className="h-[2px] bg-white/5 w-full">
        <motion.div
          className="h-full bg-gradient-to-r from-white/60 to-white/90"
          initial={{ width: `${((stepIdx) / total) * 100}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
            {step.icon}
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/25">
            {step.badge} <span className="text-white/15">·</span> {stepIdx + 1}/{total}
          </span>
        </div>
        <button
          onClick={onSkip}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          <X size={13} />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pt-2 pb-4">
        <h3 className="text-[15px] font-bold text-white tracking-tight leading-snug mb-2">
          {step.title}
        </h3>
        <p className="text-[13px] text-white/45 leading-relaxed">{step.body}</p>
      </div>

      {/* Dot indicators */}
      <div className="px-5 pb-4 flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === stepIdx
                ? "w-4 h-1.5 bg-white"
                : i < stepIdx
                ? "w-1.5 h-1.5 bg-white/35"
                : "w-1.5 h-1.5 bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex items-center justify-between border-t border-white/5 pt-3.5">
        <button
          onClick={onSkip}
          className="text-[11px] font-semibold text-white/25 hover:text-white/50 transition-colors"
        >
          Skip tour
        </button>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="h-8 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/6 text-[12px] font-semibold text-white/50 transition-all flex items-center gap-1"
            >
              <ChevronLeft size={13} />
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className={`h-8 px-4 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5
              ${isLast
                ? "bg-white text-black hover:bg-neutral-100 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                : "bg-white text-black hover:bg-neutral-100 shadow-[0_0_12px_rgba(255,255,255,0.1)]"
              }`}
          >
            {isLast ? (
              <>
                <Check size={13} strokeWidth={3} />
                Done!
              </>
            ) : (
              <>
                Next
                <ChevronRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────── Welcome Modal */
function WelcomeModal({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onSkip}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg bg-[#111] border border-white/[0.07] rounded-3xl overflow-hidden shadow-[0_48px_96px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.03)]"
      >
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
        />

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/3 w-48 h-48 bg-red-600/12 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-600/8 blur-[60px] rounded-full pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 z-20 w-7 h-7 rounded-xl flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          <X size={14} />
        </button>

        <div className="relative z-10 p-8">
          {/* Logo area */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Youtube size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-0.5">
                Welcome to
              </p>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                Paper<span className="text-red-500">Tube</span>
              </h1>
            </div>
            <div className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-400">
                Free to start
              </span>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-2">
            Turn YouTube lectures into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              beautiful notes
            </span>{" "}
            in seconds.
          </h2>
          <p className="text-[13px] text-white/40 leading-relaxed mb-7">
            Powered by AI. Supports 7 Indian languages. Works on any device.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`relative p-3.5 rounded-2xl border bg-gradient-to-br ${f.color} overflow-hidden`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-lg bg-black/20 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <p className="text-[11px] font-bold text-white/80 leading-none">{f.title}</p>
                </div>
                <p className="text-[11px] text-white/35 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onStart}
              className="w-full h-12 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-neutral-100 transition-all shadow-[0_0_32px_rgba(255,255,255,0.12)] active:scale-[0.98]"
            >
              Take a quick tour
              <ArrowRight size={15} />
            </button>
            <button
              onClick={onSkip}
              className="w-full h-11 rounded-2xl bg-white/4 hover:bg-white/7 border border-white/6 text-white/40 hover:text-white/60 font-semibold text-sm flex items-center justify-center transition-all"
            >
              I'll explore on my own
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] text-white/20">
            Takes less than 60 seconds &nbsp;·&nbsp;{" "}
            <Link href="/pricing" onClick={onSkip} className="text-white/35 hover:text-white/60 transition-colors">
              View pricing
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────── Completion Flash */
function DoneFlash({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-end justify-center pb-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#161616] border border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.6)] pointer-events-auto"
      >
        <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <Check size={14} className="text-emerald-400" strokeWidth={3} />
        </div>
        <div>
          <p className="text-[13px] font-bold text-white">You're all set!</p>
          <p className="text-[11px] text-white/35">Paste a YouTube URL to get started.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────── Main Component */
type Phase = "idle" | "welcome" | "tour" | "done" | "flash";

export default function WelcomeTour() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  /* Show on first visit */
  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return;
    const t = setTimeout(() => setPhase("welcome"), 800);
    return () => clearTimeout(t);
  }, []);

  /* Resolve target rect whenever step changes */
  const resolveRect = useCallback(() => {
    const step = STEPS[stepIdx];
    const el = document.getElementById(step.targetId);
    if (!el) { setRect(null); return; }

    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    const update = () => setRect(el.getBoundingClientRect());

    // Run twice: immediately + after scroll settles
    update();
    const t = setTimeout(update, 420);
    return () => clearTimeout(t);
  }, [stepIdx]);

  useEffect(() => {
    if (phase !== "tour") return;
    return resolveRect();
  }, [phase, resolveRect]);

  /* Keyboard nav */
  useEffect(() => {
    if (phase !== "tour") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  /* Resize observer to keep rect fresh */
  useEffect(() => {
    if (phase !== "tour") return;
    const step = STEPS[stepIdx];
    const el = document.getElementById(step.targetId);
    if (!el) return;
    const ro = new ResizeObserver(() => setRect(el.getBoundingClientRect()));
    window.addEventListener("resize", () => setRect(el.getBoundingClientRect()));
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, [phase, stepIdx]);

  const finish = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setPhase("flash");
  };

  const handleNext = () => {
    if (stepIdx < STEPS.length - 1) { setStepIdx(i => i + 1); }
    else { finish(); }
  };
  const handlePrev = () => { if (stepIdx > 0) setStepIdx(i => i - 1); };
  const handleSkip = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setPhase("done");
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {phase === "welcome" && (
        <WelcomeModal key="welcome" onStart={() => { setStepIdx(0); setPhase("tour"); }} onSkip={handleSkip} />
      )}

      {phase === "tour" && (
        <React.Fragment key="tour">
          <SpotlightMask rect={rect} onClickOutside={handleSkip} />
          <AnimatePresence mode="wait">
            <TourTooltip
              key={stepIdx}
              step={STEPS[stepIdx]}
              stepIdx={stepIdx}
              total={STEPS.length}
              rect={rect}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
            />
          </AnimatePresence>
        </React.Fragment>
      )}

      {phase === "flash" && (
        <DoneFlash key="flash" onClose={() => setPhase("done")} />
      )}
    </AnimatePresence>,
    document.body
  );
}
