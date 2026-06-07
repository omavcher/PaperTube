"use client";
import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Youtube, 
  Layout, 
  Workflow, 
  PenTool, 
  GraduationCap, 
  Check, 
  Play, 
  Loader2, 
  Lock,
  ArrowRight,
  Zap,
  Languages,
  Plus,
  Download,
  BookOpen,
  Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolLivePreviewProps {
  toolId: string;
}

export default function ToolLivePreview({ toolId }: ToolLivePreviewProps) {
  const [animationTick, setAnimationTick] = useState(0);

  // Drive global animation tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTick(prev => (prev + 1) % 120); // 120 ticks cycle (~12 seconds)
    }, 100);
    return () => clearInterval(interval);
  }, []);

  switch (toolId) {
    case "youtube-notes":
      return <YoutubeNotesPreview tick={animationTick} />;
    case "ai-ppt":
      return <PPTPreview tick={animationTick} />;
    case "ai-diagram":
      return <DiagramPreview tick={animationTick} />;
    case "ai-writer":
      return <WriterPreview tick={animationTick} />;
    case "ai-study":
      return <StudyRoomPreview tick={animationTick} />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-500 font-mono text-xs">
          Select a tool to preview
        </div>
      );
  }
}

/* ────────────────────────────────────────────────────────
   1. YOUTUBE TO NOTES PREVIEW
   ──────────────────────────────────────────────────────── */
function YoutubeNotesPreview({ tick }: { tick: number }) {
  // Cycle timeline:
  // 0 - 25: Input typing url
  // 25 - 28: Button Click
  // 28 - 60: Loading/Summarizing spinner states
  // 60 - 110: Notes sliding in
  // 110 - 120: Reset pause

  const step = tick < 25 ? "typing" : tick < 28 ? "click" : tick < 60 ? "loading" : "result";
  const typedUrl = "youtube.com/watch?v=DeepLearning101".substring(0, Math.min(35, tick * 1.5));

  return (
    <div className="w-full h-full bg-[#070707] text-white flex flex-col font-sans p-3 sm:p-4 relative overflow-hidden select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Youtube className="text-red-500 shrink-0" size={15} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-400">YouTube Video Workspace</span>
        </div>
        <div className="flex gap-1.5 text-[8px] text-neutral-500 font-mono">
          <span>Notes: Active</span>
        </div>
      </div>

      {/* Main Workspace split screen */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Side: Video Player & Live Transcript (Desktop Only) */}
        <div className="hidden md:flex w-[38%] flex-col gap-2.5 border-r border-white/[0.03] pr-3 shrink-0 text-left">
          {/* Simulated Video Player */}
          <div className="relative w-full aspect-video bg-neutral-900 border border-white/5 rounded-xl overflow-hidden shadow-md flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-neutral-950 to-neutral-950 flex items-center justify-center">
              <svg viewBox="0 0 100 50" className="w-4/5 h-4/5 opacity-40">
                <circle cx="20" cy="25" r="3" fill="#ef4444" />
                <circle cx="50" cy="15" r="3" fill="#ffffff" />
                <circle cx="50" cy="35" r="3" fill="#ffffff" />
                <circle cx="80" cy="25" r="3" fill="#ef4444" />
                <line x1="23" y1="25" x2="47" y2="15" stroke="white" strokeWidth="0.5" />
                <line x1="23" y1="25" x2="47" y2="35" stroke="white" strokeWidth="0.5" />
                <line x1="53" y1="15" x2="77" y2="25" stroke="white" strokeWidth="0.5" />
                <line x1="53" y1="35" x2="77" y2="25" stroke="white" strokeWidth="0.5" />
              </svg>
              <div className="absolute w-7 h-7 rounded-full bg-red-600/90 border border-red-500/30 flex items-center justify-center text-white shadow-lg">
                <Play size={10} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
            {/* Player Controls */}
            <div className="relative z-10 p-2 bg-gradient-to-t from-black/95 to-transparent w-full space-y-1.5">
              <div className="w-full h-1 bg-white/20 rounded-full relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-red-500 rounded-full transition-all"
                  style={{ width: step === "typing" ? `${tick * 1.4}%` : step === "loading" ? "35%" : "75%" }}
                />
              </div>
              <div className="flex justify-between items-center text-[7.5px] font-mono text-neutral-400 leading-none">
                <span>{step === "typing" ? `00:${String(Math.floor(tick)).padStart(2, '0')}` : step === "loading" ? "00:25" : "03:40"} / 12:45</span>
                <span className="text-[7px] text-red-500 font-bold uppercase tracking-wider">Deep Learning 101</span>
              </div>
            </div>
          </div>

          {/* Live Transcript scroll */}
          <div className="flex-1 bg-neutral-950/40 border border-white/[0.02] rounded-xl p-2.5 flex flex-col justify-start gap-1.5 overflow-y-auto">
            <span className="text-[7.5px] font-bold text-neutral-500 uppercase tracking-widest block">Live Transcript</span>
            <div className="space-y-1.5 text-[8.5px] leading-relaxed">
              <p className={step === "typing" ? "text-white font-medium" : "text-neutral-500"}>
                "Hello everyone, today we cover the basics of Neural Networks..."
              </p>
              <p className={step === "loading" ? "text-white font-medium animate-pulse" : step === "result" ? "text-neutral-500" : "text-neutral-600"}>
                "We start by feeding inputs to nodes to calculate cost functions..."
              </p>
              <p className={step === "result" ? "text-white font-medium animate-fade-in-up" : "text-neutral-600"}>
                "Backpropagation calculates gradients through back-chained derivatives."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Notes Workspace */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* URL Input Bar */}
          <div className="flex gap-2 items-center bg-neutral-900 border border-white/[0.06] rounded-xl px-3 py-2 shrink-0">
            <div className="flex-1 text-[11px] text-neutral-300 font-mono overflow-hidden whitespace-nowrap text-left">
              {typedUrl}
              {step === "typing" && <span className="animate-pulse">|</span>}
            </div>
            <button 
              className={cn(
                "px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all shrink-0",
                step === "click" ? "bg-red-600 scale-95" : step === "typing" ? "bg-red-500 text-white" : "bg-neutral-800 text-neutral-500"
              )}
            >
              Convert
            </button>
          </div>

          {/* Loading State */}
          {step === "loading" && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-neutral-950/20 border border-white/[0.03] rounded-xl p-4">
              <Loader2 className="text-red-500 animate-spin" size={22} />
              <div className="text-center space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  {tick < 45 ? "Extracting Video Transcript..." : "Synthesizing Revision Notes..."}
                </p>
                <div className="w-28 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${(tick - 28) * 3}%` }} 
                  />
                </div>
                <p className="text-[8.5px] font-mono text-neutral-600">
                  {tick < 45 ? `Progress: ${Math.floor((tick - 28) * 3)}%` : `Analyzing semantics: ${Math.floor((tick - 45) * 6)}%`}
                </p>
              </div>
            </div>
          )}

          {/* Result view */}
          {step === "result" && (
            <div className="flex-1 flex flex-col space-y-2 border border-white/5 rounded-xl bg-neutral-950/60 p-3.5 overflow-y-auto text-left">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5 shrink-0">
                <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={11} className="text-red-400 shrink-0" /> Introduction to Neural Networks
                </h4>
                <span className="text-[8px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Canvas AI</span>
              </div>
              
              <div className="space-y-2.5 text-[10px] text-neutral-400 font-light leading-relaxed overflow-y-auto">
                <p className="text-neutral-500 italic text-[9px]">"A deep-dive overview of artificial network architectures."</p>
                
                {tick >= 65 && (
                  <div className="space-y-1 animate-fade-in-up">
                    <span className="font-extrabold text-white block text-[9.5px]">1. Structural Neurons</span>
                    <p className="text-neutral-400">Layers of interconnected nodes. Each connections represents a weight parameter adjusted dynamically during training epochs.</p>
                  </div>
                )}
                {tick >= 80 && (
                  <div className="space-y-1 animate-fade-in-up">
                    <span className="font-extrabold text-white block text-[9.5px]">2. Backpropagation Optimization</span>
                    <p className="text-neutral-400">Uses the chain rule to calculate derivatives of cost function relative to learning rates.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   2. AI SLIDE DECK & PPT PREVIEW
   ──────────────────────────────────────────────────────── */
function PPTPreview({ tick }: { tick: number }) {
  const slideIndex = Math.floor(tick / 30) % 4;

  const slides = [
    {
      title: "Paperxify Presentation Generator",
      tagline: "Topic-to-presentation slide deck creator",
      desc: "Paste summaries or custom prompts to generate high-fidelity slideshows.",
      num: "01",
      theme: "from-orange-950 via-slate-900 to-amber-950"
    },
    {
      title: "Custom Outlines Structure",
      tagline: "AI conceptual slide mapping",
      desc: "Automatically drafts slides cards covering introductions, body proofs, datasets, and conclusions.",
      num: "02",
      theme: "from-amber-950 via-slate-900 to-yellow-950"
    },
    {
      title: "Interactive PDF & PPTX Exports",
      tagline: "Academic design templates ready",
      desc: "Fully style-compatible download outputs for Microsoft PowerPoint and Google Slides.",
      num: "03",
      theme: "from-yellow-950 via-slate-900 to-orange-950"
    },
    {
      title: "Dynamic Layout Themes",
      tagline: "Blueberry, Midnight, Kraft, Emerald",
      desc: "Change colors, margins, paddings, and font sizes matching your presentation room theme.",
      num: "04",
      theme: "from-orange-950 via-slate-900 to-orange-900"
    }
  ];

  const currentSlide = slides[slideIndex];

  return (
    <div className="w-full h-full bg-[#080808] text-white flex flex-col font-sans p-3 sm:p-4 relative overflow-hidden select-none">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 mb-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <Layout className="text-orange-500 shrink-0" size={15} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-400">Presentation Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/5 text-[7.5px] font-bold text-neutral-300">
            <Plus size={8} /> Add Slide
          </button>
          <button className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 px-2 py-0.5 rounded text-[7.5px] font-bold text-white shadow-md">
            <Download size={8} /> Export
          </button>
        </div>
      </div>

      {/* Main Workspace splits into two panes */}
      <div className="flex-1 flex gap-3.5 min-h-0 text-left">
        {/* Left Side: Outlines List */}
        <div className="w-[30%] flex flex-col gap-2 border-r border-white/[0.04] pr-3 overflow-y-auto shrink-0 select-none">
          {slides.map((s, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-2 rounded-xl border text-left text-[9px] font-bold transition-all space-y-1.5 cursor-pointer",
                idx === slideIndex 
                  ? "bg-orange-500/10 border-orange-500/35 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.06)]" 
                  : "bg-white/[0.01] border-white/[0.03] text-neutral-500"
              )}
            >
              <div className="flex justify-between items-center text-[7.5px] opacity-75">
                <span>SLIDE {s.num}</span>
                <span className={idx === slideIndex ? "text-orange-400" : "text-neutral-600"}>Active</span>
              </div>
              <div className="truncate text-[8.5px] text-white/90">{s.title}</div>
              <div className="flex gap-1">
                <div className={cn("h-1 w-6 rounded-full", idx === slideIndex ? "bg-orange-400/30" : "bg-neutral-800")} />
                <div className={cn("h-1 w-4 rounded-full", idx === slideIndex ? "bg-orange-400/20" : "bg-neutral-800")} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Slide Canvas preview */}
        <div className={cn(
          "flex-1 flex flex-col justify-between p-4 rounded-xl relative overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 bg-gradient-to-br",
          currentSlide.theme
        )}>
          {/* Decorative aura spheres */}
          <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-white/[0.03] blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-orange-500/[0.07] blur-2xl pointer-events-none" />

          {/* Canvas header */}
          <div className="flex justify-between items-center text-[8px] text-neutral-300 font-mono relative z-10">
            <span>PAPERXIFY SLIDES</span>
            <span className="bg-black/25 px-1.5 py-0.5 rounded text-neutral-400">SLIDE {currentSlide.num} / 04</span>
          </div>

          {/* Slide Body */}
          <div className="my-auto space-y-2 py-3 relative z-10">
            <span className="text-[9px] text-orange-300 font-extrabold uppercase tracking-wider block">
              {currentSlide.tagline}
            </span>
            <h4 className="text-[13px] font-black text-white leading-tight">
              {currentSlide.title}
            </h4>
            <p className="text-[9.5px] text-neutral-200 font-light leading-relaxed">
              {currentSlide.desc}
            </p>
          </div>

          {/* Bottom layout indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] relative z-10 shrink-0">
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === slideIndex ? "bg-white scale-110" : "bg-white/30"}`} 
                />
              ))}
            </div>
            <span className="text-[7.5px] font-bold text-white/50 uppercase tracking-widest">Interactive Slides</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   3. AI DIAGRAM & FLOWCHART PREVIEW
   ──────────────────────────────────────────────────────── */
function DiagramPreview({ tick }: { tick: number }) {
  const currentTick = tick % 80;

  const showNode1 = currentTick >= 0;
  const showEdge1 = currentTick >= 20;
  const showNode2 = currentTick >= 25;
  const showEdge2 = currentTick >= 45;
  const showNode3 = currentTick >= 50;

  return (
    <div className="w-full h-full bg-[#050505] text-white flex flex-col font-sans p-3 sm:p-4 relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#ffffff01_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Toolbar header */}
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 mb-3.5 shrink-0 relative z-10">
        <div className="flex items-center gap-1.5">
          <Workflow className="text-cyan-500 shrink-0" size={15} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-400">Concept Map Canvas</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/5 text-[7.5px] font-bold text-neutral-300">
            Export SVG
          </button>
          <span className="text-[8px] border border-cyan-500/25 bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full leading-none flex items-center">
            Mermaid Engine
          </span>
        </div>
      </div>

      {/* SVG Canvas drawing */}
      <div className="flex-1 relative flex items-center justify-center border border-white/[0.03] bg-black/60 rounded-xl min-h-0">
        <svg viewBox="0 0 450 200" className="w-full h-full p-4 relative z-10">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 8 5 L 0 8 z" fill="#06b6d4" />
            </marker>
          </defs>

          {/* Edge 1 (Start to Decision) */}
          {showEdge1 && (
            <path
              d="M 110 100 L 195 100"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              markerEnd="url(#arrow)"
              className="animate-pulse"
              opacity={showNode2 ? 1 : 0.4}
            />
          )}

          {/* Edge 2 (Decision to Success) */}
          {showEdge2 && (
            <path
              d="M 275 100 L 355 100"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              markerEnd="url(#arrow)"
              className="animate-pulse"
              opacity={showNode3 ? 1 : 0.4}
            />
          )}

          {/* Node 1: Start */}
          {showNode1 && (
            <g transform="translate(30, 75)" className="animate-fade-in">
              <rect width="80" height="50" rx="8" fill="#141414" stroke="#ffffff15" strokeWidth="1.5" />
              <rect width="80" height="50" rx="8" fill="none" stroke="#06b6d4" strokeWidth="2.5" className="animate-pulse opacity-40" />
              <text x="40" y="29" fill="white" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                Start Request
              </text>
            </g>
          )}

          {/* Node 2: Decision */}
          {showNode2 && (
            <g transform="translate(195, 75)" className="animate-fade-in">
              <polygon points="40,0 80,25 40,50 0,25" fill="#141414" stroke="#ffffff15" strokeWidth="1.5" />
              <polygon points="40,0 80,25 40,50 0,25" fill="none" stroke="#7c3aed" strokeWidth="2.5" className="animate-pulse opacity-40" />
              <text x="40" y="29" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                Is Authed?
              </text>
            </g>
          )}

          {/* Node 3: Success */}
          {showNode3 && (
            <g transform="translate(355, 75)" className="animate-fade-in">
              <rect width="80" height="50" rx="8" fill="#141414" stroke="#ffffff15" strokeWidth="1.5" />
              <rect width="80" height="50" rx="8" fill="none" stroke="#10b981" strokeWidth="2.5" className="animate-pulse opacity-40" />
              <text x="40" y="29" fill="#10b981" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                Success (200)
              </text>
            </g>
          )}
        </svg>

        {/* Small floating control overlay */}
        <div className="absolute bottom-2 left-2 flex gap-2 bg-black/60 border border-white/5 rounded px-2 py-1 text-[7.5px] font-mono text-neutral-500 select-none shrink-0">
          <span>Pan: (0,0)</span>
          <span>Zoom: 100%</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   4. AI WRITER & EDITOR PREVIEW
   ──────────────────────────────────────────────────────── */
function WriterPreview({ tick }: { tick: number }) {
  const currentTick = tick % 100;

  const fullText = "The impact of generative AI model algorithms on computer science education has grown exponentially. By leveraging automated code explanation, these models enable faster student revision loops...";
  
  const typedLength = currentTick < 50 
    ? Math.floor(currentTick * (fullText.length / 50)) 
    : fullText.length;
  
  const typedText = fullText.substring(0, typedLength);

  const isScanning = currentTick >= 70 && currentTick < 88;
  const isFinished = currentTick >= 88;

  return (
    <div className="w-full h-full bg-[#060606] text-white flex flex-col font-sans p-3 sm:p-4 relative overflow-hidden select-none">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 mb-3.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <PenTool className="text-amber-500 shrink-0" size={14} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-400">Academic Writer Workspace</span>
        </div>
        
        {/* Formatting actions simulated icons */}
        <div className="flex gap-2.5 text-[8.5px] font-mono text-neutral-400 bg-white/5 rounded-md border border-white/5 px-2.5 py-0.5">
          <span className="font-extrabold text-neutral-200">B</span>
          <span className="italic">I</span>
          <span className="underline">U</span>
          <span className="text-[7.5px] border-l border-white/10 pl-2">Align</span>
        </div>
      </div>

      <div className="flex-1 flex gap-3.5 items-stretch min-h-0 text-left">
        {/* Writer Document (styled matching dark premium theme) */}
        <div className="flex-1 bg-neutral-900 text-neutral-200 p-4 rounded-xl border border-white/10 shadow-2xl relative flex flex-col justify-start text-left overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 mb-2.5 text-[8.5px] font-mono text-neutral-500 select-none shrink-0">
            <span>DOCUMENT.TXT</span>
            <span>244 Words</span>
          </div>

          <p className="text-[10px] text-neutral-300 font-light leading-relaxed select-text">
            {typedText}
            {currentTick < 50 && <span className="animate-pulse font-extrabold text-amber-500">|</span>}
          </p>

          {/* Highlight effect during format phase */}
          {currentTick >= 50 && currentTick < 70 && (
            <div className="absolute inset-x-4 top-14 bg-amber-500/10 rounded border border-amber-500/20 h-4 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Side AI checking panel */}
        <div className="w-[32%] flex flex-col justify-between bg-neutral-950/80 border border-white/[0.04] p-3 rounded-xl shrink-0">
          <div>
            <h5 className="text-[8.5px] font-black uppercase tracking-widest text-neutral-500 mb-2.5">AI Checking Panel</h5>
            
            <div className="space-y-3">
              {/* Plagiarism check */}
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-neutral-400 block uppercase">Plagiarism match</span>
                {isScanning ? (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-amber-400 font-mono">
                    <Loader2 size={8} className="animate-spin" /> Scanning...
                  </div>
                ) : isFinished ? (
                  <span className="text-[9px] font-black font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded block text-center animate-fade-in">
                    0% Match (Unique)
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-neutral-600 block">Idle</span>
                )}
              </div>

              {/* Human score check */}
              <div className="space-y-1 mt-2.5">
                <span className="text-[8px] font-bold text-neutral-400 block uppercase">AI Detection</span>
                {isFinished ? (
                  <span className="text-[9px] font-black font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded block text-center animate-fade-in">
                    99% Human Score
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-neutral-600 block">Idle</span>
                )}
              </div>
            </div>
          </div>

          <span className="text-[7px] text-neutral-600 font-mono uppercase block text-center shrink-0">Scanner v2.5</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   5. AI STUDY ROOM PREVIEW
   ──────────────────────────────────────────────────────── */
function StudyRoomPreview({ tick }: { tick: number }) {
  const tabIndex = Math.floor(tick / 40) % 3;

  return (
    <div className="w-full h-full bg-[#050505] text-white flex flex-col font-sans p-3 sm:p-4 relative overflow-hidden select-none">
      {/* Tab bar header */}
      <div className="flex gap-2 border-b border-white/[0.05] pb-2.5 mb-3.5 overflow-x-auto no-scrollbar shrink-0">
        <div 
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all shrink-0 cursor-pointer",
            tabIndex === 0 
              ? "bg-[#ec4899]/10 border-[#ec4899]/30 text-[#ec4899] shadow-[0_0_10px_rgba(236,72,153,0.1)]" 
              : "bg-white/[0.01] border-white/[0.04] text-neutral-500"
          )}
        >
          <GraduationCap size={10} /> Homework Q&A
        </div>
        <div 
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all shrink-0 cursor-pointer",
            tabIndex === 1 
              ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
              : "bg-white/[0.01] border-white/[0.04] text-neutral-500"
          )}
        >
          <Zap size={10} /> Math Solver
        </div>
        <div 
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all shrink-0 cursor-pointer",
            tabIndex === 2 
              ? "bg-[#6366f1]/10 border-[#6366f1]/30 text-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.1)]" 
              : "bg-white/[0.01] border-white/[0.04] text-neutral-500"
          )}
        >
          <Languages size={10} /> Language Tutor
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-start relative min-h-0 text-left">
        {/* Homework Helper tab view */}
        {tabIndex === 0 && (
          <div className="flex-1 flex flex-col gap-3 animate-fade-in overflow-y-auto">
            {/* Input prompt */}
            <div className="bg-neutral-900/60 border border-white/5 p-2.5 rounded-xl text-left flex gap-2 items-start shrink-0">
              <BookOpen size={13} className="text-[#ec4899] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[7.5px] font-bold text-neutral-500 uppercase block">Homework Prompt</span>
                <p className="text-[10.5px] font-medium text-white leading-snug">"What is the function of mitochondria in cells?"</p>
              </div>
            </div>
            {/* AI Answer output */}
            <div className="flex-1 bg-neutral-950/60 border border-white/[0.04] p-3 rounded-xl text-left space-y-2 relative overflow-hidden">
              <span className="absolute top-2.5 right-2.5 text-[7.5px] font-mono text-neutral-600">ANSWER ENGINE</span>
              <span className="text-[7.5px] font-bold text-neutral-400 uppercase block">AI Drafted Solution</span>
              <p className="text-[10px] text-neutral-300 font-light leading-relaxed">
                Mitochondria generate most of the cell's supply of adenosine triphosphate (ATP), which is used as a source of chemical energy. 
                They are also involved in cell signaling, cellular differentiation, and apoptosis.
              </p>
              <div className="flex gap-2 pt-1.5 text-[8.5px] font-semibold text-[#ec4899]/90 border-t border-white/[0.03]">
                <span>✓ Generated Flashcards</span>
                <span>• Key Definitions Added</span>
              </div>
            </div>
          </div>
        )}

        {/* Math Solver tab view */}
        {tabIndex === 1 && (
          <div className="flex-1 flex flex-col bg-[#0b241b] border-4 border-amber-950 rounded-xl relative overflow-hidden text-left p-3.5 animate-fade-in shadow-inner">
            {/* Green dot blackboard grid */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-25" 
              style={{
                backgroundImage: "radial-gradient(#10b981 1.2px, transparent 1.2px)",
                backgroundSize: "16px 16px"
              }}
            />

            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* Formula and step */}
              <div className="space-y-2">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 rounded-full inline-block">
                    LaTeX Chalkboard Solver
                  </span>
                  <span className="text-[7.5px] font-mono text-emerald-500">Auto-solve: Active</span>
                </div>
                <div className="font-mono text-xs text-emerald-100/90 tracking-wide font-bold">
                  {"$$\\int (3x^2 - 4x) \\, dx$$"}
                </div>
                
                <div className="space-y-1 pl-1 text-[9px] text-emerald-200/75 leading-relaxed font-mono">
                  <p className="text-white font-bold font-sans">Chalk Steps:</p>
                  <p>{"1) Integration: $\\int x^n dx = \\frac{x^{n+1}}{n+1}$"}</p>
                  <p>{"2) Term 1: $\\int 3x^2 dx = x^3$"}</p>
                  <p>{"3) Term 2: $\\int 4x dx = 2x^2$"}</p>
                </div>
              </div>

              {/* Ans block */}
              <div className="pt-2 border-t border-emerald-500/20 text-[10.5px] font-bold text-emerald-300 flex items-center justify-between font-mono mt-2 shrink-0">
                <span>Final Solution:</span>
                <span className="bg-[#10b981]/15 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">{"$x^3 - 2x^2 + C$"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Language Tutor tab view */}
        {tabIndex === 2 && (
          <div className="flex-1 flex flex-col bg-neutral-950/80 border border-white/[0.04] rounded-xl p-3 text-left space-y-3 animate-fade-in overflow-y-auto select-none">
            <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.03] shrink-0">
              <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500">Practice dialogue</span>
              <span className="text-[8.5px] bg-[#6366f1]/15 border border-[#6366f1]/20 text-[#6366f1] px-1.5 py-0.2 rounded font-bold">Spanish A2</span>
            </div>

            <div className="flex-1 flex flex-col gap-2.5 justify-start font-sans overflow-y-auto">
              {/* Tutor balloon */}
              <div className="flex gap-2 items-start max-w-[85%]">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[8px] font-black flex items-center justify-center shrink-0">
                  ES
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl rounded-tl-none p-2 text-[9.5px] text-neutral-300 leading-normal relative">
                  <div className="flex items-center gap-1 font-extrabold text-white text-[8.5px] mb-0.5">
                    <span>AI Tutor</span>
                    <Volume2 size={8} className="text-indigo-400" />
                  </div>
                  ¡Hola! ¿Cómo estás hoy? ¿Qué quieres practicar?
                </div>
              </div>

              {/* User balloon */}
              <div className="flex gap-2 items-start max-w-[85%] ml-auto flex-row-reverse">
                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-[8px] font-black flex items-center justify-center shrink-0">
                  ME
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-none p-2 text-[9.5px] text-neutral-300 leading-normal">
                  <div className="flex items-center gap-1 font-extrabold text-white text-[8.5px] mb-0.5">
                    <span>You</span>
                  </div>
                  Hola, me gustaría practicar cómo pedir café en un bar.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
