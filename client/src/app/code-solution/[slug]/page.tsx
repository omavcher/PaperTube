"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/config/api";
import Link from "next/link";
import {
  ChevronLeft, Loader2, Link as LinkIcon, Zap, BrainCircuit, Bot,
  Copy, CheckCircle2, GitBranch, ArrowDown, RotateCcw, Lightbulb,
  ListChecks, Tag, Lock, Crown, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SandpackProvider, SandpackCodeEditor, SandpackLayout } from "@codesandbox/sandpack-react";

// ─── Subscription check ───────────────────────────────────────────────────────
const getSubscriptionStatus = (): boolean => {
  try {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!userStr) return false;
    const userObj = JSON.parse(userStr);
    return !!(userObj.membership?.isActive || userObj.isSubscribed);
  } catch { return false; }
};

// ─── Flowchart ────────────────────────────────────────────────────────────────
const STEP_COLORS = [
  { border: "border-blue-500/30",    bg: "bg-blue-500/[0.07]",    dot: "bg-blue-400",    text: "text-blue-300" },
  { border: "border-purple-500/30",  bg: "bg-purple-500/[0.07]",  dot: "bg-purple-400",  text: "text-purple-300" },
  { border: "border-yellow-500/30",  bg: "bg-yellow-500/[0.07]",  dot: "bg-yellow-400",  text: "text-yellow-300" },
  { border: "border-red-500/30",     bg: "bg-red-500/[0.07]",     dot: "bg-red-400",     text: "text-red-300" },
  { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.07]", dot: "bg-emerald-400", text: "text-emerald-300" },
];

const CodeFlowchart = ({ code = "", isPremium }: { code?: string; isPremium: boolean }) => {
  const hasLoop   = /\bfor\b|\bwhile\b/.test(code);
  const hasMap    = /\bMap\b|HashMap|\bSet\b|\{\}/.test(code);
  const isRecurse = code.split(/\bfunction\b|\bdef\b/).length > 2 && /\breturn\b.+\(/.test(code);

  const steps = [
    { title: "Read Input",             sub: "Parse constraints, handle edge cases" },
    { title: hasMap ? "Build Data Structure" : "Initialise State", sub: hasMap ? "HashMap / Set for fast O(1) lookup" : "Declare pointers, counters, accumulators" },
    { title: isRecurse ? "Recurse on Sub-problem" : hasLoop ? "Iterate" : "Apply Core Logic", sub: isRecurse ? "Split into smaller independent subproblems" : hasLoop ? "Traverse elements, update running state" : "Transform or evaluate the key condition" },
    { title: "Track Best / Update",    sub: "Maintain global answer, boundary vars" },
    { title: "Return Answer",          sub: "Emit final computed result" },
  ];

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#080808] overflow-hidden">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <GitBranch size={13} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Execution Flow</span>
          {isPremium && <span className="ml-1 text-[8px] font-black uppercase tracking-widest text-yellow-500 border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 rounded">Pro</span>}
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
      </div>

      {/* Nodes */}
      <div className="relative p-5 flex flex-col items-center gap-0">
        {hasLoop && (
          <div className="absolute right-6 top-14 bottom-14 flex flex-col items-center pointer-events-none">
            <div className="flex-1 w-[1px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
            <RotateCcw size={13} className="text-blue-500/50 my-1" />
          </div>
        )}
        {steps.map((s, i) => {
          const c = STEP_COLORS[i % STEP_COLORS.length];
          return (
            <React.Fragment key={i}>
              <div className={cn("w-full max-w-[420px] rounded-xl border flex items-start gap-3 px-4 py-3.5 transition-all hover:brightness-110", c.border, c.bg)}>
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", c.dot)} />
                <div className="min-w-0">
                  <p className={cn("text-[13px] font-bold leading-tight", c.text)}>{s.title}</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5 font-mono leading-snug">{s.sub}</p>
                </div>
                <span className={cn("ml-auto text-[10px] font-black shrink-0 mt-1", c.text)}>#{i + 1}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex flex-col items-center my-0.5">
                  <div className="h-5 w-[1px] bg-neutral-800" />
                  <ArrowDown size={11} className="text-neutral-700 -mt-1" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Premium blur gate for free users */}
      {!isPremium && (
        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/60 z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.15)]">
              <Crown size={24} className="text-yellow-400" />
            </div>
            <p className="text-white font-black text-base tracking-tight">Pro Exclusive</p>
            <p className="text-neutral-400 text-[12px] leading-relaxed">Execution Flow diagrams are unlocked for <span className="text-yellow-400 font-bold">Pro subscribers</span> only.</p>
            <Link href="/pricing" className="mt-1 flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-[0_4px_20px_rgba(234,179,8,0.3)]">
              <Sparkles size={12} /> Upgrade to Pro
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sandpack lang config ─────────────────────────────────────────────────────
const getLangConfig = (lang: string = "C++") => {
  const l = lang.toLowerCase();
  if (l === "python")     return { file: "/solution.py",   ext: "py" };
  if (l === "java")       return { file: "/Solution.java", ext: "java" };
  if (l === "javascript") return { file: "/solution.js",   ext: "js" };
  if (l === "go")         return { file: "/solution.go",   ext: "go" };
  if (l === "rust")       return { file: "/solution.rs",   ext: "rs" };
  return                         { file: "/solution.cpp",  ext: "cpp" };
};

// ─── Dummy code shown to free users ──────────────────────────────────────────
const DUMMY_CODE = `// Upgrade to Pro to unlock the full solution.
//
// Pro members get:
//   ✦ Complete optimised code in any language
//   ✦ Step-by-step execution flow diagram
//   ✦ Inline code comments
//   ✦ Unlimited generations

class Solution {
public:
    // ... premium solution hidden ...
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        // Subscribe to see the full O(log(min(m,n))) binary search approach
        return -1;
    }
};`;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CodeSolutionPage() {
  const { slug }  = useParams();
  const router    = useRouter();
  const [solution, setSolution] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(getSubscriptionStatus());
    const fetchSolution = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) { router.push("/login"); return; }
      try {
        const res = await api.get(`/code/${slug}`, { headers: { Auth: token } });
        if (res.data.success) setSolution(res.data.solution);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchSolution();
  }, [slug, router]);

  const copyCode = () => {
    if (!isPremium) return;
    navigator.clipboard.writeText(solution?.codeSnippet ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-500" size={30} />
      <p className="text-[11px] text-neutral-600 font-mono tracking-widest uppercase">Loading Workspace…</p>
    </div>
  );

  if (!solution) return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col items-center justify-center gap-4">
      <p className="text-lg font-bold">Workspace not found.</p>
      <Link href="/" className="text-blue-400 hover:underline text-sm flex items-center gap-1"><ChevronLeft size={14}/> Home</Link>
    </div>
  );

  const langCfg   = getLangConfig(solution.codeLanguage);
  const steps: any[]     = solution.solutionSteps || [];
  const keyPoints: any[] = solution.keyPoints || [];
  const displayCode = isPremium ? (solution.codeSnippet || "") : DUMMY_CODE;

  return (
    <div className="h-screen bg-[#060606] text-white font-sans flex flex-col overflow-hidden selection:bg-blue-500/30">

      {/* ── Topbar ── */}
      <header className="shrink-0 bg-[#0b0b0b] border-b border-white/[0.04] flex items-center justify-between px-4 lg:px-6" style={{height:'52px'}}>
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.07] transition-all">
            <ChevronLeft size={15} className="text-neutral-400" />
          </Link>
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "px-2 py-[3px] rounded-[4px] text-[9px] uppercase tracking-widest font-black border hidden sm:block",
              solution.difficulty === "Easy"   ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              solution.difficulty === "Medium" ? "bg-yellow-500/10  text-yellow-400  border-yellow-500/20" :
              solution.difficulty === "Hard"   ? "bg-red-500/10     text-red-400     border-red-500/20"    :
                                                 "bg-white/5        text-neutral-500  border-white/10"
            )}>{solution.difficulty}</span>
            <span className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-sm lg:max-w-md">{solution.title}</span>
            <span className="hidden md:block text-[10px] uppercase tracking-widest font-black text-neutral-600 border border-white/[0.05] px-2 py-1 rounded-md">{solution.platform}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isPremium && (
            <Link href="/pricing" className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-[0_2px_12px_rgba(234,179,8,0.3)] hover:brightness-110 transition-all">
              <Crown size={11} /> Go Pro
            </Link>
          )}
          <a href={solution.problemUrl} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 text-neutral-500 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">
            <LinkIcon size={11}/> Source
          </a>
          <div className="h-4 w-[1px] bg-white/[0.08] hidden sm:block" />
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-[5px] rounded-md text-indigo-400 text-[9px] uppercase tracking-widest font-black">
            <Bot size={12}/> {solution.modelUsed}
          </div>
        </div>
      </header>

      {/* ── Split ── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left Column */}
        <div
          className="lg:w-[46%] flex flex-col border-r border-white/[0.04] overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#1f2937 transparent" }}
        >
          <div className="p-6 lg:p-8 space-y-7 pb-20">

            {/* Complexity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-2"><Zap size={11}/>Time</div>
                <div className="font-mono text-xl font-black text-yellow-400">{solution.timeComplexity || "O(N)"}</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2"><BrainCircuit size={11}/>Space</div>
                <div className="font-mono text-xl font-black text-purple-400">{solution.spaceComplexity || "O(1)"}</div>
              </div>
            </div>

            {/* Key Facts */}
            {keyPoints.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={13} className="text-neutral-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Key Facts</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keyPoints.map((kp: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">{kp.label}:</span>
                      <span className="text-[11px] font-bold text-white">{kp.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core Insight */}
            {solution.solutionContent && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={14} className="text-blue-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Core Insight</span>
                </div>
                <p className="text-[14px] text-neutral-200 leading-relaxed font-medium">{solution.solutionContent}</p>
              </div>
            )}

            {/* Flowchart — gated for free */}
            <div>
              <CodeFlowchart code={solution.codeSnippet} isPremium={isPremium} />
            </div>

            {/* Step-by-step */}
            {steps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Step-by-Step Approach</span>
                </div>
                <div className="space-y-3">
                  {steps.map((step: any, i: number) => (
                    <div key={i} className="flex gap-3.5 group">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[11px] font-black text-neutral-400 group-hover:border-blue-500/40 group-hover:text-blue-400 transition-all">
                          {step.n || i + 1}
                        </div>
                        {i < steps.length - 1 && <div className="w-[1px] flex-1 mt-1.5 bg-white/[0.05]" />}
                      </div>
                      <div className="pb-5 min-w-0">
                        <p className="text-[13px] font-bold text-white mb-1 leading-tight">{step.title}</p>
                        <p className="text-[13px] text-neutral-400 leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="lg:w-[54%] flex flex-col h-[55vh] lg:h-full bg-[#1e1e1e]">

          {/* IDE bar */}
          <div className="flex items-center justify-between bg-[#181818] border-b border-[#252525] px-4 py-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex items-center gap-1.5 bg-[#252525] border border-[#333] px-2.5 py-1 rounded text-[11px] text-neutral-400 font-mono">
                solution.{isPremium ? langCfg.ext : "cpp"}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 border border-white/[0.06] px-2 py-0.5 rounded">
                {isPremium ? (solution.codeLanguage || "C++") : "C++"}
              </span>
            </div>
            <button
              onClick={copyCode}
              disabled={!isPremium}
              className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors",
                isPremium ? "text-neutral-500 hover:text-white" : "text-neutral-700 cursor-not-allowed"
              )}
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? "Copied!" : isPremium ? "Copy" : "Pro Only"}
            </button>
          </div>

          {/* Sandpack + blur gate for free */}
          <div className="flex-1 overflow-hidden relative">
            <SandpackProvider
              template="vanilla"
              files={{
                [isPremium ? langCfg.file : "/solution.cpp"]: {
                  code: displayCode,
                  active: true,
                  readOnly: !isPremium,
                }
              }}
              customSetup={{ entry: isPremium ? langCfg.file : "/solution.cpp" }}
              theme={{
                colors: {
                  surface1: "#1e1e1e",
                  surface2: "#252526",
                  surface3: "#2d2d2d",
                  clickable: "#6b7280",
                  base: "#d4d4d4",
                  disabled: "#4b5563",
                  hover: "#ffffff",
                  accent: "#569cd6",
                  error: "#f44747",
                  errorSurface: "#200000",
                },
                syntax: {
                  plain: "#d4d4d4",
                  comment: { color: "#6a9955", fontStyle: "italic" },
                  keyword: "#569cd6",
                  tag: "#4ec9b0",
                  punctuation: "#808080",
                  definition: "#dcdcaa",
                  property: "#9cdcfe",
                  static: "#ce9178",
                  string: "#ce9178",
                },
                font: {
                  body: "'Inter', sans-serif",
                  mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  size: "13.5px",
                  lineHeight: "1.75",
                },
              }}
              options={{ recompileMode: "immediate" }}
            >
              <SandpackLayout style={{ height: "100%", border: "none", borderRadius: 0, gap: 0 }}>
                <SandpackCodeEditor
                  showTabs={false}
                  showLineNumbers
                  showInlineErrors
                  wrapContent={false}
                  style={{ height: "100%", flex: 1, overflowY: "auto" }}
                />
              </SandpackLayout>
            </SandpackProvider>

            {/* Blur overlay for non-premium */}
            {!isPremium && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-[6px] bg-black/50">
                <div className="flex flex-col items-center gap-4 text-center px-8 max-w-xs">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                    <Lock size={24} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg tracking-tight leading-tight">Full Code Locked</p>
                    <p className="text-neutral-400 text-[12px] mt-1.5 leading-relaxed">
                      Upgrade to <span className="text-yellow-400 font-bold">Pro</span> to access the complete, optimised solution with inline comments.
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-black text-[12px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(234,179,8,0.35)] w-full justify-center"
                  >
                    <Crown size={14} /> Unlock Pro Access
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
