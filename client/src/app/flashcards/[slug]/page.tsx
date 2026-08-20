"use client";

import React, { useState, useRef, useCallback, useEffect, use, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Download, ArrowLeft,
  Layers, RotateCcw, CheckCircle, X, ZapIcon, BookOpen,
  List, RotateCw, Sparkles, Brain, Trophy, Clock, Search,
  Plus, Trash2, Copy, Shuffle, Wand2, Lightbulb, Check,
  Flame, CheckCircle2, AlertCircle, HelpCircle, FileText,
  Share2, Edit3, Maximize2, Minimize2, Eye, EyeOff
} from "lucide-react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  mastery?: "new" | "learning" | "mastered" | "reviewing";
  difficulty?: "easy" | "medium" | "hard";
  mnemonic?: string;
  explanation?: string;
  options?: string[];
}

export interface FlashcardSet {
  _id: string;
  title: string;
  slug: string;
  videoUrl: string;
  videoId: string;
  flashcards: Flashcard[];
  generationDetails?: any;
  stats?: any;
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

  // Active View Modes: flip (3D active recall), quiz (multiple choice), match (speed game), deck (table overview)
  const [studyMode, setStudyMode] = useState<"flip" | "quiz" | "match" | "deck">("flip");

  // Flip Studio State
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Spaced Repetition Mastery Tracking
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [learningCards, setLearningCards] = useState<Set<number>>(new Set());

  // Quiz Mode State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Match Game State
  const [matchTiles, setMatchTiles] = useState<{ id: string; text: string; cardId: number; type: "front" | "back"; isMatched: boolean }[]>([]);
  const [selectedMatchTile, setSelectedMatchTile] = useState<{ id: string; cardId: number; type: "front" | "back" } | null>(null);
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [isMatchRunning, setIsMatchRunning] = useState(false);
  const [matchWon, setMatchWon] = useState(false);

  // Deck Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");

  // AI Co-Pilot State
  const [showCopilot, setShowCopilot] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Export State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Fetch Flashcards ───────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/flashcards/slug/${slug}`, {
        headers: { Auth: getAuthToken() },
      });
      setSet(res.data);

      // Initialize mastery sets
      if (res.data?.flashcards) {
        const mastered = new Set<number>();
        const learning = new Set<number>();
        res.data.flashcards.forEach((c: Flashcard, idx: number) => {
          if (c.mastery === "mastered") mastered.add(idx);
          else if (c.mastery === "learning") learning.add(idx);
        });
        setMasteredCards(mastered);
        setLearningCards(learning);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Please log in to view this flashcard set.");
      } else if (err.response?.status === 404) {
        setError("Flashcard set not found.");
      } else {
        // Mock fallback for demo
        const niceTitle = slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const mockSet: FlashcardSet = {
          _id: "demo-fc-" + Date.now(),
          title: niceTitle,
          slug,
          videoUrl: "https://youtube.com/watch?v=demo",
          videoId: "demo",
          createdAt: new Date().toISOString(),
          flashcards: [
            {
              id: 1,
              front: "What is the core principle of Retrieval-Augmented Generation (RAG)?",
              back: "RAG optimizes LLM outputs by retrieving authoritative domain context from an external vector index before generating answers, avoiding hallucinations without model retraining.",
              difficulty: "medium",
              mnemonic: "R.A.G. = Retrieve Relevant References, Augment Context, Generate Grounded Truth",
              explanation: "Vector embeddings index chunks into dense semantic space to execute cosine similarity lookup in sub-milliseconds."
            },
            {
              id: 2,
              front: "How does the Attention Mechanism compute token relevance in Transformers?",
              back: "$$ \\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V $$",
              difficulty: "hard",
              mnemonic: "Q (Query: what I search), K (Key: what tags match), V (Value: what content I extract)",
              explanation: "Scaling by $1/\\sqrt{d_k}$ prevents gradient vanishing during softmax saturation in high dimensions."
            },
            {
              id: 3,
              front: "What is Spaced Repetition (SRS) and why is it effective?",
              back: "An evidence-based learning technique that schedules review sessions at increasing intervals to counteract the Ebbinghaus Forgetting Curve and solidify memory consolidation.",
              difficulty: "easy",
              mnemonic: "Review just before you forget to trigger maximum neural synaptic strengthening.",
              explanation: "Active recall forces the brain to retrieve data rather than passively recognizing it."
            },
            {
              id: 4,
              front: "What is the time complexity of searching a dense HNSW vector index?",
              back: "$$ O(\\log N) $$ average search time complexity across $N$ high-dimensional vectors.",
              difficulty: "medium",
              mnemonic: "HNSW builds multi-layer geometric skip lists for sub-linear similarity search.",
              explanation: "Hierarchical Navigable Small World graphs provide asymptotic speedup compared to brute-force $O(N)$ flat scan."
            }
          ]
        };
        setSet(mockSet);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goTo = (idx: number) => { 
    setActiveIndex(idx); 
    setIsFlipped(false); 
    setShowMnemonic(false);
  };
  const goNext = () => set && goTo(Math.min(set.flashcards.length - 1, activeIndex + 1));
  const goPrev = () => goTo(Math.max(0, activeIndex - 1));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      if (studyMode === "flip") {
        if (e.key === "ArrowLeft") goPrev();
        else if (e.key === "ArrowRight") goNext();
        else if (e.key === " " || e.key === "Enter") { 
          e.preventDefault(); 
          setIsFlipped(f => !f); 
        } else if (e.key === "1") {
          handleSrsRating("again");
        } else if (e.key === "2") {
          handleSrsRating("hard");
        } else if (e.key === "3") {
          handleSrsRating("good");
        } else if (e.key === "4") {
          handleSrsRating("easy");
        } else if (e.key.toLowerCase() === "f") {
          setIsFullscreen(prev => !prev);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, set, studyMode]);

  // ── SRS Difficulty Rating ─────────────────────────────────────────────────
  const handleSrsRating = (rating: "again" | "hard" | "good" | "easy") => {
    if (!set) return;
    const cardIdx = activeIndex;

    setMasteredCards(prev => {
      const next = new Set(prev);
      if (rating === "easy" || rating === "good") {
        next.add(cardIdx);
      } else {
        next.delete(cardIdx);
      }
      return next;
    });

    setLearningCards(prev => {
      const next = new Set(prev);
      if (rating === "again" || rating === "hard") {
        next.add(cardIdx);
      } else {
        next.delete(cardIdx);
      }
      return next;
    });

    // Update in-memory flashcard
    const updatedCards = [...set.flashcards];
    updatedCards[cardIdx] = {
      ...updatedCards[cardIdx],
      mastery: rating === "easy" ? "mastered" : rating === "again" ? "reviewing" : "learning"
    };
    setSet({ ...set, flashcards: updatedCards });

    toast.success(
      rating === "easy" ? "🟢 Card Mastered! (Review in 7 days)" :
      rating === "good" ? "🟩 Great Recall! (Review in 3 days)" :
      rating === "hard" ? "🟧 Challenging! (Review tomorrow)" :
      "🔴 Needs Review! (Reset interval)"
    );

    // Auto-advance to next card after brief delay
    setTimeout(() => {
      if (activeIndex < set.flashcards.length - 1) {
        goNext();
      }
    }, 250);
  };

  // ── Quiz Mode Logic ────────────────────────────────────────────────────────
  const currentQuizCard = useMemo(() => {
    if (!set || set.flashcards.length === 0) return null;
    return set.flashcards[quizIndex] || set.flashcards[0];
  }, [set, quizIndex]);

  const quizOptions = useMemo(() => {
    if (!currentQuizCard || !set) return [];
    if (currentQuizCard.options && currentQuizCard.options.length >= 4) {
      return [...currentQuizCard.options].sort(() => Math.random() - 0.5);
    }
    // Generate distractors from other flashcards in deck
    const otherAnswers = set.flashcards
      .filter(c => c.id !== currentQuizCard.id)
      .map(c => c.back);
    const shuffledOthers = otherAnswers.sort(() => Math.random() - 0.5).slice(0, 3);
    const combined = [currentQuizCard.back, ...shuffledOthers];
    return combined.sort(() => Math.random() - 0.5);
  }, [currentQuizCard, set]);

  const handleQuizAnswer = (option: string) => {
    if (isAnswerSubmitted || !currentQuizCard) return;
    setSelectedAnswer(option);
    setIsAnswerSubmitted(true);

    const isCorrect = option === currentQuizCard.back;
    if (isCorrect) {
      setQuizScore(s => s + 1);
      setQuizStreak(s => s + 1);
      toast.success("🎯 Correct! +10 XP");
    } else {
      setQuizStreak(0);
      toast.error("❌ Incorrect! Review the concept");
    }
  };

  const handleNextQuizQuestion = () => {
    if (!set) return;
    if (quizIndex < set.flashcards.length - 1) {
      setQuizIndex(q => q + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizStreak(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
  };

  // ── Speed Match Game Setup ─────────────────────────────────────────────────
  const startMatchGame = useCallback(() => {
    if (!set) return;
    const sample = [...set.flashcards].sort(() => Math.random() - 0.5).slice(0, 6);
    const tiles: { id: string; text: string; cardId: number; type: "front" | "back"; isMatched: boolean }[] = [];

    sample.forEach((c) => {
      tiles.push({ id: `f-${c.id}`, text: c.front, cardId: c.id, type: "front", isMatched: false });
      tiles.push({ id: `b-${c.id}`, text: c.back, cardId: c.id, type: "back", isMatched: false });
    });

    setMatchTiles(tiles.sort(() => Math.random() - 0.5));
    setSelectedMatchTile(null);
    setMatchSeconds(0);
    setIsMatchRunning(true);
    setMatchWon(false);
  }, [set]);

  useEffect(() => {
    if (studyMode === "match") {
      startMatchGame();
    } else {
      setIsMatchRunning(false);
    }
  }, [studyMode, startMatchGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMatchRunning && !matchWon) {
      interval = setInterval(() => setMatchSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isMatchRunning, matchWon]);

  const handleMatchTileClick = (tile: typeof matchTiles[0]) => {
    if (tile.isMatched) return;

    if (!selectedMatchTile) {
      setSelectedMatchTile(tile);
    } else if (selectedMatchTile.id === tile.id) {
      setSelectedMatchTile(null);
    } else {
      // Check if match
      if (selectedMatchTile.cardId === tile.cardId && selectedMatchTile.type !== tile.type) {
        // Matched!
        setMatchTiles(prev => prev.map(t => (t.cardId === tile.cardId ? { ...t, isMatched: true } : t)));
        setSelectedMatchTile(null);
        toast.success("✨ Match Found!");

        // Check if all matched
        setTimeout(() => {
          setMatchTiles(currentTiles => {
            const allMatched = currentTiles.every(t => t.isMatched || t.cardId === tile.cardId);
            if (allMatched) {
              setMatchWon(true);
              setIsMatchRunning(false);
              toast.success("🏆 Speed Match Completed!");
            }
            return currentTiles;
          });
        }, 100);
      } else {
        toast.error("Not a match!");
        setSelectedMatchTile(null);
      }
    }
  };

  // ── AI Co-Pilot Card Enhancement ──────────────────────────────────────────
  const handleEnhanceCard = async (action: string, customInstruction?: string) => {
    if (!set) return;
    setIsEnhancing(true);
    const toastId = toast.loading("🪄 AI Co-Pilot is refining your flashcard...");

    try {
      const token = getAuthToken();
      const current = set.flashcards[activeIndex];
      const res = await api.post("/flashcards/enhance-card", {
        card: current,
        action,
        instruction: customInstruction || copilotPrompt,
        setTitle: set.title
      }, {
        headers: { Auth: token }
      });

      if (res.data?.success && res.data?.card) {
        const updated = [...set.flashcards];
        updated[activeIndex] = res.data.card;
        setSet({ ...set, flashcards: updated });
        toast.success("Flashcard refined with AI!", { id: toastId });
        setCopilotPrompt("");
      } else {
        throw new Error("Enhancement did not return valid card data");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI enhancement request failed. Please try again.", { id: toastId });
    } finally {
      setIsEnhancing(false);
    }
  };

  // ── In-Place Card Updates ─────────────────────────────────────────────────
  const updateCardContent = (cardIdx: number, updates: Partial<Flashcard>) => {
    if (!set) return;
    const updated = [...set.flashcards];
    updated[cardIdx] = { ...updated[cardIdx], ...updates };
    setSet({ ...set, flashcards: updated });
  };

  const handleAddNewCard = () => {
    if (!set) return;
    const newCard: Flashcard = {
      id: Date.now(),
      front: "New Study Question or Formula",
      back: "Detailed answer and explanation.",
      difficulty: "medium",
      mastery: "new"
    };
    const updated = [...set.flashcards, newCard];
    setSet({ ...set, flashcards: updated });
    setActiveIndex(updated.length - 1);
    toast.success("New flashcard created");
  };

  const handleDeleteCard = (cardIdx: number) => {
    if (!set) return;
    if (set.flashcards.length <= 1) {
      toast.error("Deck must have at least 1 card");
      return;
    }
    const updated = set.flashcards.filter((_, i) => i !== cardIdx);
    setSet({ ...set, flashcards: updated });
    setActiveIndex(Math.max(0, activeIndex - 1));
    toast.success("Card deleted");
  };

  const handleShuffleDeck = () => {
    if (!set) return;
    const shuffled = [...set.flashcards].sort(() => Math.random() - 0.5);
    setSet({ ...set, flashcards: shuffled });
    setActiveIndex(0);
    setIsFlipped(false);
    toast.success("🔀 Deck shuffled!");
  };

  // ── Auto-save debounced effect ─────────────────────────────────────────────
  useEffect(() => {
    if (!set || !set._id || set._id.startsWith("demo")) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const token = getAuthToken();
        await api.put(`/flashcards/update/${set._id}`, {
          flashcards: set.flashcards,
          title: set.title,
          stats: {
            totalReviews: masteredCards.size + learningCards.size,
            averageScore: Math.round((masteredCards.size / Math.max(set.flashcards.length, 1)) * 100),
            lastStudied: new Date()
          }
        }, {
          headers: { Auth: token }
        });
      } catch (err) {
        console.error("Failed to auto-save flashcard set:", err);
      }
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [set, masteredCards, learningCards]);

  // ── Export Formats ────────────────────────────────────────────────────────
  const exportAnkiTSV = () => {
    if (!set) return;
    const tsvContent = set.flashcards
      .map(c => `${c.front.replace(/\t/g, " ").replace(/\n/g, "<br>")}\t${c.back.replace(/\t/g, " ").replace(/\n/g, "<br>")}`)
      .join("\n");

    const blob = new Blob([tsvContent], { type: "text/tab-separated-values;charset=utf-8" });
    saveAs(blob, `${set.slug || "anki-deck"}.txt`);
    toast.success("Exported Anki .txt deck! Import directly into Anki desktop.");
    setShowExportMenu(false);
  };

  const exportQuizletClipboard = () => {
    if (!set) return;
    const quizletText = set.flashcards
      .map(c => `${c.front}\t${c.back}`)
      .join("\n");

    navigator.clipboard.writeText(quizletText).then(() => {
      toast.success("Copied to clipboard formatted for Quizlet import!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
    setShowExportMenu(false);
  };

  const exportCurrentPNG = async () => {
    if (!set || isExporting) return;
    setIsExporting(true);
    toast.info("Rendering card image...", { id: "fc-export" });
    try {
      const card = set.flashcards[activeIndex];
      const tempDiv = document.createElement("div");
      tempDiv.style.cssText = [
        "position:fixed", "left:-9999px", "top:-9999px",
        "width:800px", "height:500px",
        "padding:56px 64px",
        "background:linear-gradient(145deg,#121216 0%,#09090c 100%)",
        "color:white", "font-family:system-ui,sans-serif",
        "display:flex", "flex-direction:column",
        "justify-content:center", "align-items:center",
        "text-align:center", "border-radius:28px",
        "border:1px solid rgba(255,255,255,0.12)",
        "box-shadow:0 40px 80px rgba(0,0,0,0.8)",
        "box-sizing:border-box",
      ].join(";");

      tempDiv.innerHTML = `
        <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#f97316;margin-bottom:20px;font-weight:900;">
          Card ${activeIndex + 1} of ${set.flashcards.length} · Paperxify AI Flashcards
        </div>
        <h2 style="font-size:28px;font-weight:900;line-height:1.3;color:#fff;margin:0 0 24px;letter-spacing:-0.5px;">
          ${card.front}
        </h2>
        <div style="width:100%;border-top:1px solid rgba(249,115,22,0.3);padding-top:20px;">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#a3a3a3;margin-bottom:10px;font-weight:700;">Active Recall Key</div>
          <p style="font-size:16px;line-height:1.6;color:#e5e5e5;margin:0;">${card.back}</p>
        </div>
      `;
      document.body.appendChild(tempDiv);

      const canvas = await captureCardAsCanvas(tempDiv);
      document.body.removeChild(tempDiv);

      canvas.toBlob(blob => {
        if (blob) {
          saveAs(blob, `flashcard-${activeIndex + 1}.png`);
          toast.success("Saved PNG card!", { id: "fc-export" });
        }
      });
    } catch (e) {
      console.error("PNG export error:", e);
      toast.error("Export failed", { id: "fc-export" });
    }
    setIsExporting(false);
    setShowExportMenu(false);
  };

  // ── Loading & Error States ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen bg-[#070709] flex flex-col items-center justify-center text-white gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-orange-500 animate-spin border-t-transparent" />
        </div>
        <p className="text-neutral-400 text-xs font-mono animate-pulse">Launching Flashcard Study Studio...</p>
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="h-screen bg-[#070709] flex flex-col items-center justify-center text-white gap-5 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
          <AlertCircle className="w-7 h-7 text-orange-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold mb-1">Couldn't load flashcards</h2>
          <p className="text-neutral-400 text-sm">{error}</p>
        </div>
        <button onClick={() => router.push("/youtube-to-flashcards")} className="px-6 py-2.5 bg-orange-500 text-black rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer">
          Return to Flashcards Generator
        </button>
      </div>
    );
  }

  const cards = set.flashcards;
  const total = cards.length;
  const current = cards[activeIndex] || cards[0];
  const masteredCount = masteredCards.size;
  const masteryPercentage = Math.round((masteredCount / Math.max(total, 1)) * 100);

  // Filtered cards for Deck View
  const filteredCards = cards.filter(c => {
    const matchesSearch = c.front.toLowerCase().includes(searchQuery.toLowerCase()) || c.back.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = filterDifficulty === "all" || c.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className={cn(
      "bg-[#060608] text-white flex flex-col font-sans select-none relative overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 h-screen w-screen p-0" : "h-screen pt-16"
    )}>
      
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      {!isFullscreen && (
        <header className="fixed top-0 inset-x-0 h-16 bg-[#0a0a0d]/90 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-4 lg:px-8 z-40 shadow-md">
          {/* Left: Back + Deck Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => router.push("/youtube-to-flashcards")}
              className="shrink-0 p-2 bg-neutral-900 border border-white/[0.08] hover:border-orange-500/40 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
            </button>
            <div className="min-w-0">
              <input
                type="text"
                value={set.title}
                onChange={(e) => setSet({ ...set, title: e.target.value })}
                className="font-bold text-sm tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.04] px-1.5 py-0.5 rounded-lg transition-colors max-w-[200px] sm:max-w-md truncate"
              />
              <div className="flex items-center gap-2 text-[9.5px] font-black uppercase tracking-widest text-neutral-500">
                <span className="text-orange-400 flex items-center gap-1">
                  <Brain size={10} /> Active Recall Deck
                </span>
                <span>•</span>
                <span>{total} Cards</span>
                <span>•</span>
                <span className="text-emerald-400">{masteryPercentage}% Mastered</span>
              </div>
            </div>
          </div>

          {/* Center: Study Mode Pill Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-neutral-900/90 border border-white/[0.08] p-1 rounded-2xl shadow-inner">
            <button
              onClick={() => setStudyMode("flip")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                studyMode === "flip" ? "bg-orange-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
              )}
            >
              <RotateCw size={12} />
              <span>3D Flip</span>
            </button>

            <button
              onClick={() => setStudyMode("quiz")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                studyMode === "quiz" ? "bg-orange-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
              )}
            >
              <HelpCircle size={12} />
              <span>Quiz Mode</span>
            </button>

            <button
              onClick={() => setStudyMode("match")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                studyMode === "match" ? "bg-orange-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
              )}
            >
              <Flame size={12} />
              <span>Speed Match</span>
            </button>

            <button
              onClick={() => setStudyMode("deck")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                studyMode === "deck" ? "bg-orange-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
              )}
            >
              <List size={12} />
              <span>Deck Grid</span>
            </button>
          </div>

          {/* Right: Actions (Shuffle, AI, Export) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleDeck}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Shuffle Deck"
            >
              <Shuffle size={14} />
            </button>

            <button
              onClick={() => setShowCopilot(!showCopilot)}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
                showCopilot ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" : "bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white"
              )}
            >
              <Wand2 size={13} className="text-orange-400" />
              <span className="hidden sm:inline">AI Co-Pilot</span>
            </button>

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Export</span>
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      className="absolute right-0 top-11 z-50 w-56 bg-[#0e0e12] border border-white/[0.12] rounded-2xl shadow-2xl p-2 space-y-1"
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 px-2 py-1">Export Deck</p>
                      
                      <button
                        onClick={exportAnkiTSV}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-left text-xs font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <FileText size={14} className="text-blue-400 shrink-0" />
                        <div>
                          <div>Export to Anki (.txt)</div>
                          <div className="text-[9.5px] text-neutral-500 font-normal">Native TSV import format</div>
                        </div>
                      </button>

                      <button
                        onClick={exportQuizletClipboard}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-left text-xs font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy size={14} className="text-purple-400 shrink-0" />
                        <div>
                          <div>Copy for Quizlet</div>
                          <div className="text-[9.5px] text-neutral-500 font-normal">1-click clipboard format</div>
                        </div>
                      </button>

                      <button
                        onClick={exportCurrentPNG}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-left text-xs font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <Download size={14} className="text-emerald-400 shrink-0" />
                        <div>
                          <div>Save Card Image (PNG)</div>
                          <div className="text-[9.5px] text-neutral-500 font-normal">High-res study card</div>
                        </div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
      )}

      {/* ── MOBILE STUDY MODE NAV BAR ────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-around bg-[#0c0c10] border-b border-white/[0.06] p-1.5 z-30">
        <button onClick={() => setStudyMode("flip")} className={cn("px-3 py-1 rounded-xl text-xs font-bold", studyMode === "flip" ? "bg-orange-500 text-black" : "text-neutral-400")}>3D Flip</button>
        <button onClick={() => setStudyMode("quiz")} className={cn("px-3 py-1 rounded-xl text-xs font-bold", studyMode === "quiz" ? "bg-orange-500 text-black" : "text-neutral-400")}>Quiz</button>
        <button onClick={() => setStudyMode("match")} className={cn("px-3 py-1 rounded-xl text-xs font-bold", studyMode === "match" ? "bg-orange-500 text-black" : "text-neutral-400")}>Match</button>
        <button onClick={() => setStudyMode("deck")} className={cn("px-3 py-1 rounded-xl text-xs font-bold", studyMode === "deck" ? "bg-orange-500 text-black" : "text-neutral-400")}>Deck</button>
      </div>

      {/* ── WORKSPACE BODY ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden h-full relative">
        
        {/* MAIN STUDY AREA */}
        <main className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 overflow-y-auto custom-scrollbar">

          {/* ═════════ MODE 1: 3D FLIP CARD STUDIO ═════════ */}
          {studyMode === "flip" && (
            <div className="w-full max-w-3xl flex-1 flex flex-col justify-between items-center my-auto py-2">
              
              {/* Progress & Stats Bar */}
              <div className="w-full flex items-center justify-between text-xs font-mono text-neutral-400 mb-4 px-2">
                <span className="font-bold text-white">Card {activeIndex + 1} of {total}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={13} /> {masteredCount} Mastered
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-400">Space to Flip</span>
                </div>
              </div>

              {/* 3D Flip Card Container */}
              <div className="w-full aspect-[16/10] max-h-[460px] perspective-[1200px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <motion.div
                  className="w-full h-full relative rounded-3xl preserve-3d transition-transform duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                >
                  {/* FRONT SIDE (Question) */}
                  <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-[#141418] via-[#0d0d10] to-[#08080a] border border-white/[0.12] p-8 sm:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-orange-400 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                        Question · Active Recall
                      </span>
                      <span className={cn(
                        "text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded-md",
                        current.difficulty === "hard" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                        current.difficulty === "easy" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                        "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      )}>
                        {current.difficulty || "medium"}
                      </span>
                    </div>

                    <div className="my-auto py-6 text-center">
                      <div className="text-xl sm:text-3xl font-black text-white leading-relaxed tracking-tight">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {current.front}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500 border-t border-white/[0.06] pt-3">
                      <span>Click card or press Space to reveal answer</span>
                      <span className="text-orange-400/80 flex items-center gap-1">
                        <RotateCw size={11} /> Flip Card
                      </span>
                    </div>
                  </div>

                  {/* BACK SIDE (Answer & Memory Hooks) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-[#181210] via-[#0f0c0a] to-[#08080a] border border-orange-500/30 p-8 sm:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        Answer & Key Concept
                      </span>
                      {current.mnemonic && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowMnemonic(!showMnemonic); }}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20"
                        >
                          <Lightbulb size={11} /> Mnemonic Hook
                        </button>
                      )}
                    </div>

                    <div className="my-auto py-4 text-center space-y-4">
                      <div className="text-base sm:text-xl font-medium text-neutral-200 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {current.back}
                        </ReactMarkdown>
                      </div>

                      {/* Mnemonic Drawer */}
                      {showMnemonic && current.mnemonic && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed max-w-lg mx-auto"
                        >
                          <span className="font-bold block mb-0.5">🧠 Memory Device:</span>
                          {current.mnemonic}
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500 border-t border-white/[0.06] pt-3">
                      <span>Rate recall difficulty below for spaced repetition</span>
                      <span className="text-orange-400/80">Active</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Anki Spaced Repetition (SRS) Rating Bar */}
              <div className="w-full flex items-center justify-between gap-2 sm:gap-3 mt-6">
                <button
                  onClick={() => handleSrsRating("again")}
                  className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-red-950/40 hover:bg-red-950/80 border border-red-500/30 text-red-300 text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <span className="font-black text-red-400">Again (1)</span>
                  <span className="text-[9px] text-red-500/80">&lt; 10 min</span>
                </button>

                <button
                  onClick={() => handleSrsRating("hard")}
                  className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-amber-950/40 hover:bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <span className="font-black text-amber-400">Hard (2)</span>
                  <span className="text-[9px] text-amber-500/80">+1 day</span>
                </button>

                <button
                  onClick={() => handleSrsRating("good")}
                  className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <span className="font-black text-emerald-400">Good (3)</span>
                  <span className="text-[9px] text-emerald-500/80">+3 days</span>
                </button>

                <button
                  onClick={() => handleSrsRating("easy")}
                  className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-blue-950/40 hover:bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <span className="font-black text-blue-400">Easy (4)</span>
                  <span className="text-[9px] text-blue-500/80">+7 days</span>
                </button>
              </div>

              {/* Bottom Nav Arrows */}
              <div className="w-full flex items-center justify-between mt-4">
                <button
                  onClick={goPrev}
                  disabled={activeIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 disabled:opacity-30 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                <button
                  onClick={goNext}
                  disabled={activeIndex === total - 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 disabled:opacity-30 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ═════════ MODE 2: INTERACTIVE QUIZ MODE ═════════ */}
          {studyMode === "quiz" && currentQuizCard && (
            <div className="w-full max-w-2xl flex-1 flex flex-col justify-between my-auto py-4">
              {!quizFinished ? (
                <>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-4">
                    <span>Question {quizIndex + 1} of {total}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400 font-bold flex items-center gap-1">
                        <Flame size={13} /> {quizStreak} Streak
                      </span>
                      <span>Score: {quizScore}</span>
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-[#0f0f13] border border-white/[0.12] shadow-2xl mb-6">
                    <span className="text-[10px] font-mono uppercase font-black text-orange-400 block mb-3">Quiz Question</span>
                    <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed">
                      {currentQuizCard.front}
                    </h2>
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {quizOptions.map((opt, idx) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = opt === currentQuizCard.back;
                      let btnStyle = "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] text-neutral-200";

                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                        } else if (isSelected) {
                          btnStyle = "bg-red-950/60 border-red-500 text-red-300";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(opt)}
                          disabled={isAnswerSubmitted}
                          className={cn(
                            "p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer",
                            btnStyle
                          )}
                        >
                          <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswerSubmitted && (
                    <button
                      onClick={handleNextQuizQuestion}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:scale-[1.01]"
                    >
                      {quizIndex < total - 1 ? "Next Question →" : "View Quiz Summary 🏆"}
                    </button>
                  )}
                </>
              ) : (
                /* Quiz Complete Screen */
                <div className="text-center py-12 space-y-6 max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto shadow-2xl">
                    <Trophy size={36} className="text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Quiz Completed!</h2>
                    <p className="text-xs text-neutral-400 mt-1">You answered {quizScore} out of {total} questions correctly ({Math.round((quizScore / total) * 100)}%).</p>
                  </div>
                  <button
                    onClick={restartQuiz}
                    className="px-6 py-3 rounded-2xl bg-orange-500 text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═════════ MODE 3: SPEED MATCH GAME ═════════ */}
          {studyMode === "match" && (
            <div className="w-full max-w-3xl flex-1 flex flex-col justify-between my-auto py-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-4">
                <span className="text-orange-400 font-bold flex items-center gap-1.5">
                  <Clock size={13} /> {matchSeconds}s Elapsed
                </span>
                <span>Match Questions to Answers</span>
                <button onClick={startMatchGame} className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer">
                  Restart
                </button>
              </div>

              {!matchWon ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {matchTiles.map((tile) => {
                    const isSelected = selectedMatchTile?.id === tile.id;
                    return (
                      <motion.div
                        key={tile.id}
                        onClick={() => handleMatchTileClick(tile)}
                        className={cn(
                          "p-4 rounded-2xl border aspect-[4/3] flex items-center justify-center text-center p-3 transition-all cursor-pointer shadow-md select-none",
                          tile.isMatched ? "opacity-0 pointer-events-none scale-95" :
                          isSelected ? "bg-orange-500 text-black border-orange-400 font-bold scale-105" :
                          "bg-[#0e0e12] border-white/[0.10] hover:border-white/20 text-neutral-200 text-xs"
                        )}
                      >
                        <span className="line-clamp-4 leading-relaxed font-medium text-[11px] sm:text-xs">
                          {tile.text}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-6 max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-2xl">
                    <Trophy size={36} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Board Cleared!</h2>
                    <p className="text-xs text-neutral-400 mt-1">You cleared the matching board in {matchSeconds} seconds!</p>
                  </div>
                  <button
                    onClick={startMatchGame}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═════════ MODE 4: DECK OVERVIEW & GRID MANAGER ═════════ */}
          {studyMode === "deck" && (
            <div className="w-full max-w-4xl flex-1 flex flex-col space-y-4 py-2">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-64">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cards in deck..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-900 border border-white/[0.08] text-xs text-white placeholder:text-neutral-500 outline-none focus:border-orange-500/50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                  <select
                    value={filterDifficulty}
                    onChange={(e: any) => setFilterDifficulty(e.target.value)}
                    className="bg-neutral-900 border border-white/[0.08] text-xs text-neutral-300 rounded-xl px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy Only</option>
                    <option value="medium">Medium Only</option>
                    <option value="hard">Hard Only</option>
                  </select>

                  <button
                    onClick={handleAddNewCard}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 text-black text-xs font-bold cursor-pointer"
                  >
                    <Plus size={13} /> Add Card
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCards.map((c, i) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-[#0e0e12] border border-white/[0.08] space-y-3 shadow-lg hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                      <span>Card {i + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setActiveIndex(i);
                            setStudyMode("flip");
                          }}
                          className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                          title="Study in 3D"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(i)}
                          className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                          title="Delete Card"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={c.front}
                      onChange={(e) => updateCardContent(i, { front: e.target.value })}
                      placeholder="Question front..."
                      rows={2}
                      className="w-full bg-black/40 border border-white/[0.06] rounded-xl p-2 text-xs font-bold text-white resize-none outline-none focus:border-orange-500/40"
                    />

                    <textarea
                      value={c.back}
                      onChange={(e) => updateCardContent(i, { back: e.target.value })}
                      placeholder="Answer back..."
                      rows={3}
                      className="w-full bg-black/40 border border-white/[0.06] rounded-xl p-2 text-xs text-neutral-300 resize-none outline-none focus:border-orange-500/40 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* ── AI CO-PILOT DRAWER ────────────────────────────────────────────── */}
        <AnimatePresence>
          {showCopilot && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 bg-[#09090c] border-l border-white/[0.08] flex flex-col h-full overflow-hidden shadow-2xl z-30"
            >
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0c0c10]">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Sparkles size={13} /> AI Card Co-Pilot
                </span>
                <button onClick={() => setShowCopilot(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-950/30 to-[#0e0e12] border border-orange-500/20 text-[11px] text-neutral-400 leading-relaxed">
                  Refine the active card (Card {activeIndex + 1}) with learning psychology prompts:
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">1-Click Actions</p>
                  
                  <button
                    onClick={() => handleEnhanceCard("simplify")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left text-xs font-bold text-neutral-200 hover:text-orange-300 transition-all cursor-pointer"
                  >
                    <ZapIcon size={14} className="text-amber-400 shrink-0" />
                    <span>Simplify Answer (ELI5)</span>
                  </button>

                  <button
                    onClick={() => handleEnhanceCard("mnemonic")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left text-xs font-bold text-neutral-200 hover:text-orange-300 transition-all cursor-pointer"
                  >
                    <Lightbulb size={14} className="text-yellow-400 shrink-0" />
                    <span>Add Mnemonic Memory Hook</span>
                  </button>

                  <button
                    onClick={() => handleEnhanceCard("example")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left text-xs font-bold text-neutral-200 hover:text-orange-300 transition-all cursor-pointer"
                  >
                    <BookOpen size={14} className="text-emerald-400 shrink-0" />
                    <span>Add Real-World Example</span>
                  </button>

                  <button
                    onClick={() => handleEnhanceCard("distractors")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left text-xs font-bold text-neutral-200 hover:text-orange-300 transition-all cursor-pointer"
                  >
                    <HelpCircle size={14} className="text-blue-400 shrink-0" />
                    <span>Generate Quiz Distractors</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Custom Card Instruction</p>
                  <textarea
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    placeholder="e.g. Add LaTeX equations and format the proof steps..."
                    rows={3}
                    className="w-full bg-[#121216] border border-white/[0.10] rounded-xl p-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-orange-500/50 resize-none leading-relaxed"
                  />
                  <button
                    onClick={() => handleEnhanceCard("custom", copilotPrompt)}
                    disabled={!copilotPrompt.trim() || isEnhancing}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Wand2 size={13} />
                    <span>Enhance Card</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
