"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  Youtube, 
  Sparkles, 
  Presentation, 
  PenTool, 
  BookOpen, 
  GraduationCap, 
  Calculator, 
  Calendar, 
  HelpCircle, 
  ShieldAlert, 
  FileText, 
  FileSearch, 
  GitBranch, 
  LayoutGrid, 
  Code2, 
  Trophy, 
  Zap, 
  ArrowRight, 
  Languages, 
  Layers, 
  CornerDownLeft, 
  Boxes,
  ExternalLink,
  Bot,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "Core AI" | "Study Room" | "Writer" | "Developer" | "Connectors" | "Navigation";
  href?: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  action?: () => void;
}

export function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Detect OS for Windows (Ctrl+K) vs Mac (⌘K)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const mac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
      setIsMac(mac);
    }
  }, []);

  // Global Keyboard Listener for Ctrl+K (Windows) and ⌘K (Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Check for / when not in an input
      if (
        e.key === "/" &&
        !isOpen &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // If open, handle Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = (e?: any) => {
      setIsOpen(true);
      if (e?.detail?.query) {
        setQuery(e.detail.query);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-search-modal", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-search-modal", handleCustomOpen);
    };
  }, [isOpen]);

  // Lock scroll when open & focus input
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Comprehensive Catalog of Searchable Tools, Pages & Features
  const catalog: SearchItem[] = useMemo(() => [
    // ── Core AI Tools ──
    {
      id: "youtube-to-notes",
      title: "YouTube to Notes AI",
      description: "Convert video lectures & crash courses into smart study notes, flashcards & summaries",
      category: "Core AI",
      href: "/youtube-to-notes",
      icon: Youtube,
      badge: "POPULAR",
      badgeColor: "bg-red-500/15 text-red-400 border-red-500/30"
    },
    {
      id: "workspace",
      title: "AI Workspace Studio",
      description: "Autonomous reasoning workspace for notes, slide decks, research & diagrams",
      category: "Core AI",
      href: "/workspace",
      icon: Bot,
      badge: "STUDIO",
      badgeColor: "bg-red-500/15 text-red-400 border-red-500/30"
    },
    {
      id: "presentation-generator",
      title: "AI Presentation (PPT) Generator",
      description: "Transform topics or lecture notes into structured, downloadable PowerPoint decks",
      category: "Core AI",
      href: "/presentation-generator",
      icon: Presentation,
      badge: "HOT",
      badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30"
    },
    {
      id: "whiteboard",
      title: "Agentic Whiteboard",
      description: "Interactive canvas for system architectures, mind maps & visual study diagrams",
      category: "Core AI",
      href: "/whiteboard",
      icon: PenTool,
      badge: "AI",
      badgeColor: "bg-violet-500/15 text-violet-400 border-violet-500/30"
    },
    {
      id: "profile",
      title: "Profile",
      description: "Manage your profile, AI plan limits, daily resets & account settings",
      category: "Navigation",
      href: "/profile",
      icon: User
    },

    // ── Academic Study Room ──
    {
      id: "homework-helper",
      title: "Homework Helper AI",
      description: "Step-by-step problem solver, homework breakdown & academic explanations",
      category: "Study Room",
      href: "/ai-study/homework-helper",
      icon: GraduationCap
    },
    {
      id: "math-solver",
      title: "AI Math Solver",
      description: "Calculus, linear algebra, formulas, step-by-step proofs & graph solutions",
      category: "Study Room",
      href: "/ai-study/math-solver",
      icon: Calculator
    },
    {
      id: "exam-planner",
      title: "Exam Prep Planner",
      description: "Spaced repetition revision schedule, syllabus milestone tracker & reminders",
      category: "Study Room",
      href: "/ai-study/exam-planner",
      icon: Calendar,
      badge: "NEW",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30"
    },
    {
      id: "youtube-to-quiz",
      title: "AI Quiz & MCQ Generator",
      description: "Generate interactive multiple-choice tests & practice questions from topics",
      category: "Study Room",
      href: "/youtube-to-quiz",
      icon: HelpCircle
    },
    {
      id: "youtube-to-flashcards",
      title: "AI Flashcards Generator",
      description: "Active-recall digital flashcard decks with Leitner spaced-repetition",
      category: "Study Room",
      href: "/youtube-to-flashcards",
      icon: Layers
    },
    {
      id: "language-tutor",
      title: "AI Language Tutor",
      description: "Grammar breakdown, vocabulary drills & bilingual voice tutoring",
      category: "Study Room",
      href: "/ai-study/language-tutor",
      icon: Languages,
      badge: "AUDIO"
    },

    // ── AI Writer & Research ──
    {
      id: "ai-humanizer",
      title: "AI Humanizer",
      description: "Convert detectable AI prose into natural, authentic human-sounding writing",
      category: "Writer",
      href: "/ai-writer/ai-humanizer",
      icon: Sparkles
    },
    {
      id: "ai-detector",
      title: "AI Detector & Authenticity",
      description: "Detect synthetic GPT-4o, Claude & Gemini text patterns with confidence score",
      category: "Writer",
      href: "/ai-writer/ai-detector",
      icon: ShieldAlert,
      badge: "VERIFIED"
    },
    {
      id: "essay-writer",
      title: "AI Essay & Report Writer",
      description: "Structured academic essays with MLA/APA citations, abstracts & argument flow",
      category: "Writer",
      href: "/ai-writer/essay-writer",
      icon: FileText
    },
    {
      id: "plagiarism",
      title: "Plagiarism Checker",
      description: "Deep content similarity scan against academic publications & web archives",
      category: "Writer",
      href: "/ai-writer/plagiarism",
      icon: FileSearch
    },
    {
      id: "ai-diagram",
      title: "AI Mind Maps & Flowcharts",
      description: "Generate interactive concept charts & Mermaid flowcharts from topics",
      category: "Writer",
      href: "/ai-diagram",
      icon: GitBranch
    },

    // ── Developer Utilities ──
    {
      id: "tools",
      title: "All 25+ Developer Tools",
      description: "Comprehensive suite: Code to Image, JSON formatter, Regex, QR & SQL architects",
      category: "Developer",
      href: "/tools",
      icon: LayoutGrid
    },
    {
      id: "code-to-image",
      title: "Code to Image Generator",
      description: "Create beautiful, syntax-highlighted code screenshots for documentation & social",
      category: "Developer",
      href: "/tools/code-to-image",
      icon: Code2
    },
    {
      id: "json-formatter",
      title: "JSON Formatter & Validator",
      description: "Format, validate, beautify, and repair broken JSON objects instantly",
      category: "Developer",
      href: "/tools/json-formatter",
      icon: Code2
    },
    {
      id: "markdown-editor",
      title: "Live Markdown Editor",
      description: "Dual-pane real-time markdown preview with table formatting & syntax highlighting",
      category: "Developer",
      href: "/tools/markdown-editor",
      icon: FileText
    },
    {
      id: "generate-qr",
      title: "QR Code Generator",
      description: "Generate custom SVG/PNG QR codes for URLs, Wi-Fi networks & text clips",
      category: "Developer",
      href: "/tools/generate-qr",
      icon: LayoutGrid
    },

    // ── Connectors & Integrations ──
    {
      id: "connectors-modal",
      title: "Connectors & Integrations Directory",
      description: "Link Gmail, Google Drive, Notion, GitHub, Slack, Google Calendar & MCP tools",
      category: "Connectors",
      icon: Boxes,
      badge: "100+ APPS",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      action: () => {
        window.dispatchEvent(new CustomEvent("open-connectors-modal"));
      }
    },

    // ── Navigation & Community ──
    {
      id: "leaderboard",
      title: "Global Scholar Leaderboard",
      description: "Rankings, highest study streaks & scholar XP milestones worldwide",
      category: "Navigation",
      href: "/leaderboard",
      icon: Trophy
    },
    {
      id: "pricing",
      title: "Membership & Pricing Plans",
      description: "Upgrade to Pro Scholar for unlimited notes, 120 slides & priority AI models",
      category: "Navigation",
      href: "/pricing",
      icon: Zap
    },
    {
      id: "blog",
      title: "Engineering Blog & Tutorials",
      description: "Guides on learning techniques, AI study workflows & developer updates",
      category: "Navigation",
      href: "/blog",
      icon: FileText
    }
  ], []);

  // Filter Catalog by Query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return catalog.slice(0, 10);
    const q = query.toLowerCase().trim();
    return catalog.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [catalog, query]);

  // Navigate on Enter
  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  // Keyboard navigation inside results
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (filteredResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
      scrollItemIntoView((selectedIndex + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
      scrollItemIntoView((selectedIndex - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredResults[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  const scrollItemIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-search-item]");
    const target = items[index] as HTMLElement;
    if (target) {
      target.scrollIntoView({ block: "nearest" });
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      className="fixed inset-0 !z-[999999] flex items-start justify-center pt-[10vh] sm:pt-[14vh] p-3 sm:p-4 bg-black/80 backdrop-blur-xl font-sans select-none animate-in fade-in duration-150"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ type: "spring", stiffness: 450, damping: 35 }}
        className="w-full max-w-2xl bg-[#0a0a10]/95 border border-white/[0.1] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(239,68,68,0.15)] overflow-hidden flex flex-col relative z-10"
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-red-600/[0.08] via-transparent to-transparent pointer-events-none" />

        {/* ──── TOP SEARCH INPUT BAR ──── */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/[0.08] shrink-0">
          <Search size={18} className="text-neutral-400 shrink-0 ml-1 mr-3 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a tool, note generator, or feature to search..."
            className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 outline-none pr-8"
          />

          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          )}

          <div className="flex items-center gap-1.5 pl-2 shrink-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-neutral-400 border border-white/10">
              ESC
            </span>
          </div>
        </div>

        {/* ──── SEARCH RESULTS LIST ──── */}
        <div 
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar"
        >
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search size={22} className="text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400 font-medium">
                No matching tools or features found for <span className="text-white">"{query}"</span>
              </p>
              <p className="text-[11px] text-neutral-500">
                Try searching for "YouTube", "PPT", "Math", "Whiteboard", or "Tools"
              </p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  data-search-item
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer group",
                    isSelected
                      ? "bg-red-500/[0.12] border border-red-500/30 text-white shadow-sm"
                      : "hover:bg-white/[0.04] border border-transparent text-neutral-300"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                      isSelected
                        ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : "bg-[#14141c] text-neutral-400 border-white/[0.06] group-hover:text-white"
                    )}>
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs font-bold truncate transition-colors",
                          isSelected ? "text-white" : "text-neutral-200 group-hover:text-white"
                        )}>
                          {item.title}
                        </span>

                        {item.badge && (
                          <span className={cn(
                            "text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded border shrink-0",
                            item.badgeColor || "bg-white/[0.08] text-neutral-300 border-white/10"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-neutral-400 truncate mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9.5px] font-semibold text-neutral-500 uppercase tracking-wider hidden sm:inline-block">
                      {item.category}
                    </span>

                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                      isSelected
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-neutral-500 opacity-0 group-hover:opacity-100"
                    )}>
                      <CornerDownLeft size={12} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ──── BOTTOM KEYBOARD HINTS FOOTER ──── */}
        <div className="px-4 py-2.5 bg-[#07070b] border-t border-white/[0.07] flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[9.5px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[9.5px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="text-neutral-600">•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[9.5px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[9.5px] text-neutral-300">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </div>
        </div>

      </motion.div>
    </div>,
    document.body
  );
}
