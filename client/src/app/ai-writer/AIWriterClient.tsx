"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PenTool,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Shield,
  Zap,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  X,
  Check,
  Copy,
  Download,
  Bold,
  Italic,
  Code,
  Heading,
  Edit3,
  Eye,
  RefreshCw,
  Coins,
  Cpu,
  Lock,
  Brain,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthLoginModal, PremiumUpgradeModal } from "@/components/AuthGuard";
import Link from "next/link";

import api from "@/config/api";
import { cn } from "@/lib/utils";

/* ─────────── Constants ─────────── */

const AI_MODELS = [
  { id: "flash",   name: "Flash",   accessTier: "Free",  desc: "Fast & lightweight for everyday writing", color: "sky",    hex: "#38bdf8" },
  { id: "canvas",  name: "Canvas",  accessTier: "Pro",   desc: "Rich formatting with deep comprehension", color: "violet", hex: "#a78bfa" },
  { id: "scholar", name: "Scholar", accessTier: "Pro",   desc: "Academic-grade citations & summaries",    color: "emerald",hex: "#34d399" },
  { id: "atlas",   name: "Atlas",   accessTier: "Power", desc: "Max-context reasoning for complex content",color: "amber",  hex: "#fbbf24" },
];

const LANGUAGES = ["English", "German", "Spanish", "French", "Japanese", "Arabic"];

const TONES = ["Academic", "Professional", "Creative", "Casual", "Persuasive"];

const ACADEMIC_LEVELS = [
  "High School Level",
  "College Level",
  "Graduate Level",
  "Doctoral Level",
  "Professional Level"
];

const ESSAY_TYPES = [
  "Research Paper",
  "Thesis / Dissertation",
  "Literature Review",
  "Analytical Essay",
  "Argumentative Essay",
  "Expository Essay",
  "Compare and Contrast Essay",
  "Critical Essay",
  "Cause and Effect Essay",
  "Reflective Essay",
  "Descriptive Essay"
];

const CITATION_STYLES = [
  "No Citation",
  "APA",
  "MLA",
  "Chicago",
  "Harvard",
  "IEEE",
  "ACS",
  "Turabian",
  "AMA",
  "Vancouver"
];

const WRITER_TOOLS = [
  { id: "ai-detector",       label: "AI Detector",          icon: Shield,      placeholder: "Paste text to check for AI-generated content...", hint: "Detects AI-written content with confidence scores." },
  { id: "ai-humanizer",      label: "AI Humanizer",         icon: Zap,         placeholder: "Paste AI-generated text to humanize it...", hint: "Rewrites AI text to sound naturally human." },
  { id: "essay-writer",      label: "AI Essay Writer",      icon: FileText,    placeholder: "Enter your essay topic or prompt...", hint: "Generates structured, academic-quality essays." },
  { id: "plagiarism",        label: "Plagiarism Checker",   icon: Search,      placeholder: "Paste your text to check for plagiarism...", hint: "Scans for copied content across the web." },
];

const TRIVIA_TIPS = [
  { title: "✍️ Academic Writing Tip", text: "Use the PEEL structure (Point, Evidence, Explanation, Link) for each paragraph to build strong academic arguments." },
  { title: "🔍 AI Detection Insight", text: "AI text tends to have very consistent sentence lengths and rarely uses contractions — key signals for detection algorithms." },
  { title: "📚 Citation Rule", text: "APA 7th edition requires a DOI for all journal articles when one is available — even for print sources." },
  { title: "🧠 Paraphrasing Tip", text: "True paraphrasing means restructuring the idea, not just swapping synonyms. Change sentence structure and vocabulary together." },
];

const LOADING_STEPS = [
  { id: 0, label: "Input Validation",      desc: "Validating text parameters and content boundaries" },
  { id: 1, label: "Semantic Parsing",      desc: "Extracting structural entities and key concepts" },
  { id: 2, label: "Language Model Query",  desc: "Sending payload to AI writing intelligence engine" },
  { id: 3, label: "Response Structuring",  desc: "Formatting and organizing AI output schema" },
  { id: 4, label: "Post-Processing",       desc: "Applying tone adjustments and academic formatting" },
  { id: 5, label: "Output Compilation",    desc: "Compiling final document with styles applied" },
  { id: 6, label: "Quality Verification",  desc: "Verifying output coherence and citation accuracy" },
  { id: 7, label: "Ready",                 desc: "Your document is ready to review and download" },
];

/* ─────────── Demo output map ─────────── */
const DEMO_OUTPUTS: Record<string, string> = {
  "ai-detector": `# AI Detection Report

**Analysis Score: 83% AI-Generated**

---

## Paragraph-Level Breakdown

| Segment | Confidence | Verdict |
|---------|-----------|---------|
| Paragraph 1 | 91% | 🔴 AI-Generated |
| Paragraph 2 | 67% | 🟡 Likely AI |
| Paragraph 3 | 34% | 🟢 Human-like |
| Paragraph 4 | 88% | 🔴 AI-Generated |

## Key Signals Detected
- **Uniform sentence cadence**: AI text tends to maintain very consistent sentence lengths across paragraphs.
- **Low perplexity score**: The language is too predictable — high-confidence indicator of LLM generation.
- **Absence of colloquialisms**: Human writers naturally include informal phrasing; this text lacks that.
- **Over-formal transitions**: Phrases like "Furthermore," and "In conclusion," appear at unusually high frequency.

## Recommendation
> Consider rewriting with more varied sentence structures and personal perspective to reduce detection probability.

*Powered by Paperxify AI Detection Engine v2.1*`,

  "ai-humanizer": `# Humanized Output

---

Here's what strikes me most about this topic: it's not just a technical problem — it's a deeply human one. When we talk about AI-generated content, we're really asking what it means to communicate authentically in a world where machines can mimic us so convincingly.

I've been thinking about this a lot lately. The writing that resonates, that actually stays with you, tends to have a kind of texture to it. It meanders a little, doubles back, changes its mind. It feels *inhabited*.

The version you gave me was competent. Clearly structured. But it read like something assembled rather than experienced. So I tried to put some of that lived quality back in — not dramatically, just enough to make it feel like a person wrote it at a kitchen table, maybe at midnight with a cup of tea going cold.

The result is messier in some ways. But that messiness is the point.

*Humanized by Paperxify AI Humanizer Engine*`,

  "essay-writer": `# The Ethics of Artificial Intelligence in Academic Settings

## Abstract
This essay examines the growing debate surrounding artificial intelligence tools in higher education. It argues that rather than banning these technologies, institutions must develop clear frameworks that promote AI literacy while preserving academic integrity.

## Introduction
The rapid emergence of large language models has fundamentally challenged traditional notions of academic authorship. When a student can generate a passable essay in seconds, questions arise about what education is actually measuring and developing.

## Body

### The Case for Integration
Educational institutions that ignore AI tools risk training students for a world that no longer exists. As Selwyn (2022) notes, "The question is not whether AI will enter the classroom, but how thoughtfully we prepare students to use it."

Key arguments for integration:
1. **Critical evaluation skills**: Students who work *with* AI must learn to assess, edit, and improve AI output — a sophisticated cognitive skill.
2. **Workforce preparation**: Most professional roles already involve AI collaboration.
3. **Equity concerns**: Banning AI disadvantages students who don't have access to premium tutoring.

### The Integrity Challenge
However, uncritical AI use undermines the core purposes of academic assessment. When assignments are designed to measure understanding, an AI-completed submission reveals nothing about the student's grasp of the material.

## Conclusion
The solution lies not in restriction but in redesign. Assessments should emphasize oral defense, iterative development, and applied problem-solving — skills that cannot be outsourced to a language model.

*Generated by Paperxify AI Essay Writer · Model: Flash*`,

  "plagiarism": `# Plagiarism Report

**Similarity Score: 12% — Low Risk ✅**

---

## Summary
Your text shows a **12% similarity** with online sources — well within the acceptable threshold for most institutions (typically <15-20%).

## Source Matches Found

| # | Matched Text (excerpt) | Source | Similarity |
|---|----------------------|--------|-----------|
| 1 | "fundamental challenge to academic..." | educationtoday.org/ai-2023 | 4.2% |
| 2 | "large language models have" | wikipedia.org/LLM | 3.1% |
| 3 | "traditional notions of authorship" | jstor.org/article/4429 | 2.8% |
| 4 | "institutions must develop clear..." | edpolicy.edu/ai-framework | 1.9% |

## Interpretation
- Matches 1-3 are **common academic phrasing** — not intentional copying.
- Match 4 appears in a cited passage — ensure proper citation is present.

## Recommendations
- ✅ Overall document is within safe limits
- ⚠️ Add a citation for Match 4 if quoting directly
- ✅ No block-copied text detected

*Scanned by Paperxify Plagiarism Engine · Database: 180M+ sources*`,
};

function convertMarkdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;
  let inCode = false;

  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("```")) {
      if (inCode) {
        html += "</code></pre>\n";
        inCode = false;
      } else {
        html += "<pre><code>";
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      html += trimmed + "\n";
      continue;
    }

    if (inList && !trimmed.startsWith("- ")) {
      html += "</ul>\n";
      inList = false;
    }

    if (trimmed.startsWith("# ")) {
      html += `<h1>${trimmed.slice(2)}</h1>\n`;
    } else if (trimmed.startsWith("## ")) {
      html += `<h2>${trimmed.slice(3)}</h2>\n`;
    } else if (trimmed.startsWith("### ")) {
      html += `<h3>${trimmed.slice(4)}</h3>\n`;
    } else if (trimmed.startsWith("- ")) {
      if (!inList) {
        html += "<ul>\n";
        inList = true;
      }
      html += `  <li>${trimmed.slice(2)}</li>\n`;
    } else if (trimmed.startsWith("> ")) {
      html += `<blockquote>${trimmed.slice(2)}</blockquote>\n`;
    } else if (trimmed === "---" || trimmed === "***") {
      html += `<hr />\n`;
    } else if (!trimmed) {
      html += `<p>&nbsp;</p>\n`;
    } else {
      html += `<p>${line}</p>\n`;
    }
  }

  if (inList) {
    html += "</ul>\n";
  }
  return html;
}

/* ─────────── Component ─────────── */

export default function AIWriterClient({ initialTool }: { initialTool?: string }) {
  const defaultTool = WRITER_TOOLS.find(t => t.id === initialTool) || WRITER_TOOLS[2];
  const [selectedTool, setSelectedTool] = useState(defaultTool);
  const [inputText, setInputText] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [outputLanguage, setOutputLanguage] = useState("English");
  const [selectedTone, setSelectedTone] = useState("Academic");

  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [documentContent, setDocumentContent] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // User & Access States matching AIDiagramClient.tsx
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [userPlanId, setUserPlanId] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<number | null>(null);
  
  // Modals state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // AI Detector Specific State
  const [detectorResult, setDetectorResult] = useState<any>(null);
  const [detectorError, setDetectorError] = useState<string | null>(null);
  const apiCallFinishedRef = useRef<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);

  // File Upload states
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; text: string; wordCount: number } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processingFileName, setProcessingFileName] = useState("");
  const [plagiarismReportHtml, setPlagiarismReportHtml] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [humanizerResult, setHumanizerResult] = useState<{
    originalText: string;
    humanizedText: string;
    metrics: {
      originalAiLikelihood: number;
      humanizedAiLikelihood: number;
      perplexityBoost: number;
      burstinessGain: number;
      readabilityShift: string;
    };
  } | null>(null);

  const [academicLevel, setAcademicLevel] = useState("College Level");
  const [essayType, setEssayType] = useState("Research Paper");
  const [citationStyle, setCitationStyle] = useState("APA");
  const [wordCount, setWordCount] = useState(1500);

  useEffect(() => {
    // Development auto-login convenience bypass
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      if (!localStorage.getItem("authToken")) {
        localStorage.setItem("authToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjUzYzZkMTkwYWY5YTc0ZWEwNjliYSIsImlhdCI6MTc4MDgyNjU2N30.NQhqTeQW_0Z8ZOZfcgB9EZG4HKlVwFp6c74OS2-fws0");
        localStorage.setItem("user", JSON.stringify({
          name: "Test Detector User",
          email: "test_detector@paperxify.com",
          membership: { isActive: true, planId: "pro", planName: "Pro Plan" }
        }));
      }
    }

    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          const res = await api.get('/users/tokens', { headers: { 'Auth': token } });
          if (res.data.success) {
            setUserTokens(res.data.tokens);
            if (res.data.isSubscribed) {
              setHasPremiumAccess(true);
              setUserPlanId(res.data.planId || null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch neural tokens:", error);
        }
      }
    };
    fetchUserData();
  }, []);
  // Sync URL parameters helper
  const syncParamsToURL = useCallback((toolId: string, currentPrompt: string, modelId: string, lang: string, tone: string) => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams();
      if (currentPrompt.trim()) {
        searchParams.set("prompt", currentPrompt.trim());
      }
      if (modelId && modelId !== "flash") {
        searchParams.set("model", modelId);
      }
      if (lang && lang !== "English") {
        searchParams.set("language", lang);
      }
      if (tone && tone !== "Academic") {
        searchParams.set("tone", tone);
      }
      const searchStr = searchParams.toString();
      const suffix = searchStr ? `?${searchStr}` : "";
      window.history.pushState(null, "", `/ai-writer/${toolId}${suffix}`);
    }
  }, []);

  // Pre-fill parameters from URL query parameters if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlPrompt = searchParams.get("prompt");
      if (urlPrompt) {
        setInputText(urlPrompt);
      }
      const urlModel = searchParams.get("model");
      if (urlModel) {
        const found = AI_MODELS.find(m => m.id.toLowerCase() === urlModel.toLowerCase());
        if (found) setSelectedModel(found);
      }
      const urlLang = searchParams.get("language") || searchParams.get("lang");
      if (urlLang) {
        const found = LANGUAGES.find(l => l.toLowerCase() === urlLang.toLowerCase());
        if (found) setOutputLanguage(found);
      }
      const urlTone = searchParams.get("tone");
      if (urlTone) {
        const found = TONES.find(t => t.toLowerCase() === urlTone.toLowerCase());
        if (found) setSelectedTone(found);
      }
    }
  }, []);

  // Automatically sync model, language, tone, tool selections to the URL
  useEffect(() => {
    syncParamsToURL(selectedTool.id, inputText, selectedModel.id, outputLanguage, selectedTone);
  }, [selectedModel.id, outputLanguage, selectedTone, selectedTool.id, syncParamsToURL]);

  // Track the previous initialTool to prevent resetting state on manual updates
  const prevInitialToolRef = useRef<string | undefined>(initialTool);

  // Sync when initialTool changes via route navigation
  useEffect(() => {
    if (initialTool && initialTool !== prevInitialToolRef.current) {
      prevInitialToolRef.current = initialTool;
      const foundTool = WRITER_TOOLS.find(t => t.id === initialTool);
      if (foundTool) {
        setSelectedTool(foundTool);
      }
    }
  }, [initialTool]);


  /* ── Stepper simulation ── */
  useEffect(() => {
    if (!isGenerating) { setCurrentStep(0); return; }

    const runStep = (step: number, delay: number) => {
      return setTimeout(() => {
        // If we are about to enter step 7, and we are running the AI Detector, Plagiarism, Humanizer, or Essay Writer,
        // hold at step 6 until the API call finishes.
        if (step === 7 && (selectedTool.id === "ai-detector" || selectedTool.id === "plagiarism" || selectedTool.id === "ai-humanizer" || selectedTool.id === "essay-writer") && !apiCallFinishedRef.current) {
          const interval = setInterval(() => {
            if (apiCallFinishedRef.current) {
              clearInterval(interval);
              setCurrentStep(7);
            }
          }, 200);
          return;
        }
        setCurrentStep(step);
      }, delay);
    };

    const timers = [
      runStep(1, 700),
      runStep(2, 1800),
      runStep(3, 3000),
      runStep(4, 4200),
      runStep(5, 5400),
      runStep(6, 6500),
      runStep(7, 7800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isGenerating, selectedTool.id]);

  /* ── Progress bar ── */
  useEffect(() => {
    if (!isGenerating) { setProgressPercent(0); return; }
    const targets = [10, 25, 38, 52, 65, 78, 92, 100];
    const target = targets[currentStep] ?? 100;
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= target) return prev;
        return Math.min(target, prev + 0.8 + Math.random() * 1.2);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isGenerating, currentStep]);

  /* ── Trivia tips rotation ── */
  useEffect(() => {
    if (!isGenerating) { setActiveTipIndex(0); return; }
    const i = setInterval(() => setActiveTipIndex(p => (p + 1) % TRIVIA_TIPS.length), 3800);
    return () => clearInterval(i);
  }, [isGenerating]);

  /* ── Transition to result ── */
  useEffect(() => {
    if (isGenerating && currentStep === 7 && progressPercent >= 100) {
      if ((selectedTool.id === "ai-detector" || selectedTool.id === "plagiarism" || selectedTool.id === "ai-humanizer" || selectedTool.id === "essay-writer") && detectorError) {
        setIsGenerating(false);
        toast.error(detectorError);
        return;
      }

      const t = setTimeout(() => {
        setIsGenerating(false);
        if (selectedTool.id !== "ai-detector" && selectedTool.id !== "plagiarism" && selectedTool.id !== "ai-humanizer" && selectedTool.id !== "essay-writer") {
          setDocumentContent(DEMO_OUTPUTS[selectedTool.id] || "# Result\n\nYour content has been generated.");
        }
        setShowResult(true);
        setIsPreviewMode(false);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [isGenerating, currentStep, progressPercent, selectedTool.id, detectorError]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTool.id === "plagiarism" && !attachedFile) {
      toast.error("Please upload a PDF, TXT, or MD document to check for plagiarism.");
      return;
    }

    const activeText = attachedFile ? attachedFile.text : inputText;
    if (!activeText.trim()) {
      toast.error("Please enter your text or upload a document first.");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    const premiumTools = ["ai-detector", "ai-humanizer", "plagiarism"];
    if (premiumTools.includes(selectedTool.id) && !hasPremiumAccess) {
      setPremiumFeatureName(`${selectedTool.label} Tool`);
      setShowPremiumModal(true);
      return;
    }

    // Pro model check
    if (selectedModel.accessTier === "Pro" && !hasPremiumAccess) {
      setPremiumFeatureName(selectedModel.name);
      setShowPremiumModal(true);
      return;
    }

    // Power model check
    if (selectedModel.accessTier === "Power" && (!hasPremiumAccess || userPlanId !== "power")) {
      setPremiumFeatureName(selectedModel.name);
      setShowPremiumModal(true);
      return;
    }

    setShowResult(false);
    setIsGenerating(true);
    toast.info("AI Writing Engine processing your request…", { duration: 1500 });

    if (selectedTool.id === "ai-detector") {
      apiCallFinishedRef.current = false;
      setDetectorResult(null);
      setDetectorError(null);

      api.post("/writer/detect", { text: activeText }, { headers: { Auth: authToken } })
        .then(res => {
          if (res.data.success) {
            setDetectorResult(res.data.result);

            // Format dynamic markdown report for editor/download fallback
            const rep = `# AI Detection Report

**Analysis Score: ${res.data.result.aiProbability}% AI-Generated**
**Verdict Confidence: ${res.data.result.confidence}%**

---

## Detailed Structural Feedback
- **Sentence Count**: ${res.data.result.features.sentenceCount}
- **Word Count**: ${res.data.result.features.wordCount}
- **Average Sentence Length**: ${res.data.result.features.avgSentenceLength} words
- **Burstiness (variation)**: ${res.data.result.features.burstiness}
- **Vocabulary Diversity**: ${res.data.result.features.diversity}
- **Readability (Flesch)**: ${res.data.result.features.readability}

### Key Signals Detected:
${res.data.result.llmFeedback.patterns.map((p: string) => `- ${p}`).join("\n")}

### Transitions Analyzed:
${res.data.result.llmFeedback.transitions.map((t: string) => `- ${t}`).join("\n")}

### Core structure:
${res.data.result.llmFeedback.structure}

*Powered by Paperxify AI Detection Engine v3.0*`;
            setDocumentContent(rep);
          } else {
            setDetectorError(res.data.message || "Detection failed.");
          }
          apiCallFinishedRef.current = true;
        })
        .catch(err => {
          console.error(err);
          setDetectorError(err.response?.data?.message || "Server error during AI detection.");
          apiCallFinishedRef.current = true;
        });
    }

    if (selectedTool.id === "plagiarism") {
      apiCallFinishedRef.current = false;
      setPlagiarismReportHtml(null);
      setDetectorError(null);

      api.post("/writer/plagiarism", { text: activeText }, { headers: { Auth: authToken } })
        .then(res => {
          if (res.data.success) {
            setPlagiarismReportHtml(res.data.reportHtml);
          } else {
            setDetectorError(res.data.message || "Plagiarism check failed.");
          }
          apiCallFinishedRef.current = true;
        })
        .catch(err => {
          console.error(err);
          setDetectorError(err.response?.data?.message || "Server error during plagiarism scan.");
          apiCallFinishedRef.current = true;
        });
    }

    if (selectedTool.id === "ai-humanizer") {
      apiCallFinishedRef.current = false;
      setDetectorError(null);
      setHumanizerResult(null);

      api.post("/writer/humanize", { 
        text: activeText,
        tone: selectedTone,
        language: outputLanguage
      }, { headers: { Auth: authToken } })
        .then(res => {
          if (res.data.success) {
            setDocumentContent(res.data.humanizedText);
            setHumanizerResult({
              originalText: activeText,
              humanizedText: res.data.humanizedText,
              metrics: res.data.metrics
            });
          } else {
            setDetectorError(res.data.message || "Humanization failed.");
          }
          apiCallFinishedRef.current = true;
        })
        .catch(err => {
          console.error(err);
          setDetectorError(err.response?.data?.message || "Server error during humanization.");
        });
    }

    if (selectedTool.id === "essay-writer") {
      apiCallFinishedRef.current = false;
      setDetectorError(null);

      api.post("/writer/essay", { 
        topic: activeText,
        academicLevel,
        essayType,
        citationStyle,
        wordCount
      }, { headers: { Auth: authToken } })
        .then(res => {
          if (res.data.success && res.data.essay) {
            window.location.href = `/ai-writer/essay-writer/${res.data.essay.slug}`;
          } else {
            setDetectorError(res.data.message || "Failed to generate essay.");
          }
          apiCallFinishedRef.current = true;
        })
        .catch(err => {
          console.error(err);
          setDetectorError(err.response?.data?.message || "Server error during essay generation.");
          apiCallFinishedRef.current = true;
        });
    }
  };

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    setProcessingFileName(file.name);
    setAttachedFile(null); // Clear previous

    try {
      let extractedText = "";
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          extractedText += pageText + "\n\n";
        }

        if (extractedText.trim().length === 0) {
          throw new Error("Could not extract any text from this PDF. It might be scanned or empty.");
        }
      } else if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        extractedText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject(new Error("Failed to read text file."));
          reader.readAsText(file);
        });
      } else if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
        throw new Error("Direct Word document upload (.docx/.doc) is not supported. Please save as PDF or TXT to extract text.");
      } else {
        throw new Error("Unsupported file type. Please upload a PDF, TXT, or markdown file.");
      }

      const words = extractedText.trim().split(/\s+/).filter(Boolean).length;
      setAttachedFile({
        name: file.name,
        type: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "text/plain"),
        text: extractedText,
        wordCount: words
      });
      setInputText(""); // Clear manual input to avoid confusion
      toast.success("Document attached successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process file.");
    } finally {
      setIsProcessingFile(false);
      setProcessingFileName("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = "";
  };

  const getWordCount = () => documentContent.trim().split(/\s+/).filter(Boolean).length;
  const getCharCount = () => documentContent.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent);
    toast.success("Copied to clipboard!");
  };

  const handleRedirectToHumanizer = () => {
    const activeText = attachedFile ? attachedFile.text : inputText;
    const humTool = WRITER_TOOLS.find(t => t.id === "ai-humanizer");
    if (humTool) {
      setSelectedTool(humTool);
      setInputText(activeText);
      setAttachedFile(null);
      setShowResult(false);
      setDetectorResult(null);
      setDetectorError(null);
      toast.success("Text transferred to AI Humanizer. Click 'Run AI Humanizer' to humanize it!");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([documentContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paperxify-${selectedTool.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully!");
  };

  const handleDownloadPlagiarismPdf = async () => {
    if (!plagiarismReportHtml) return;
    setIsDownloadingPdf(true);
    const downloadToast = toast.loading("Generating print-ready PDF report...");

    try {
      const authToken = localStorage.getItem("authToken");
      const res = await api.post(
        "/writer/plagiarism/pdf", 
        { 
          html: plagiarismReportHtml, 
          title: attachedFile?.name ? attachedFile.name.replace(/\.[^/.]+$/, "") : "plagiarism-report" 
        }, 
        { headers: { Auth: authToken } }
      );

      if (res.data.success && res.data.pdf) {
        // Decode base64 to blob
        const binaryString = window.atob(res.data.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = res.data.fileName || "plagiarism-report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("PDF report downloaded successfully!", { id: downloadToast });
      } else {
        toast.error(res.data.message || "Failed to generate PDF.", { id: downloadToast });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Server error while generating PDF.", { id: downloadToast });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadHumanizedPdf = async () => {
    if (!humanizerResult) return;
    setIsDownloadingPdf(true);
    const downloadToast = toast.loading("Generating print-ready Humanized PDF report...");

    try {
      const authToken = localStorage.getItem("authToken");
      const title = attachedFile?.name 
        ? attachedFile.name.replace(/\.[^/.]+$/, "") 
        : "humanized-document";
        
      const htmlContent = convertMarkdownToHtml(documentContent);
      
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0d0d0d;
    --paper: #faf9f6;
    --rule: #d4d0c4;
  }
  body {
    font-family: 'IBM Plex Serif', Georgia, serif;
    background: var(--paper);
    color: var(--ink);
    font-size: 15px;
    line-height: 1.8;
    padding: 50px 60px;
  }
  h1 {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.2;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 10px;
  }
  h2 {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    margin-top: 30px;
    margin-bottom: 15px;
  }
  h3 {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  p {
    margin-bottom: 18px;
    text-align: justify;
  }
  blockquote {
    border-left: 3px solid var(--ink);
    padding-left: 15px;
    font-style: italic;
    color: #444;
    margin: 20px 0;
  }
  pre {
    background: #f4f3ef;
    padding: 15px;
    border-radius: 4px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    overflow-x: auto;
    margin: 20px 0;
  }
  ul, ol {
    margin-left: 25px;
    margin-bottom: 18px;
  }
  li {
    margin-bottom: 6px;
  }
  hr {
    border: none;
    border-top: 1px solid var(--rule);
    margin: 30px 0;
  }
  .meta {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    margin-bottom: 40px;
  }
  @page {
    size: A4;
    margin: 20mm;
  }
  @media print {
    body {
      background: var(--paper) !important;
      padding: 0;
    }
  }
</style>
</head>
<body>
  <div class="meta">Humanized Document &middot; Paperxify AI</div>
  <h1>${title}</h1>
  <div class="content">
    ${htmlContent}
  </div>
</body>
</html>`;

      const res = await api.post(
        "/writer/plagiarism/pdf", 
        { 
          html: fullHtml, 
          title: title
        }, 
        { headers: { Auth: authToken } }
      );

      if (res.data.success && res.data.pdf) {
        const binaryString = window.atob(res.data.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = res.data.fileName || `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Humanized PDF downloaded successfully!", { id: downloadToast });
      } else {
        toast.error(res.data.message || "Failed to generate PDF.", { id: downloadToast });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Server error while generating PDF.", { id: downloadToast });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleTestInDetector = () => {
    const textToTest = documentContent;
    if (!textToTest.trim()) {
      toast.error("No text available to verify.");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    const detectorTool = WRITER_TOOLS.find(t => t.id === "ai-detector");
    if (!detectorTool) return;

    setSelectedTool(detectorTool);
    setInputText(textToTest);
    setAttachedFile(null);
    setShowResult(false);
    setIsGenerating(true);
    setDetectorResult(null);
    setDetectorError(null);
    apiCallFinishedRef.current = false;

    toast.info("Sending bypassed text to AI Detector...", { duration: 1500 });

    api.post("/writer/detect", { text: textToTest }, { headers: { Auth: authToken } })
      .then(res => {
        if (res.data.success) {
          setDetectorResult(res.data.result);
          const rep = `# AI Detection Report

**Analysis Score: ${res.data.result.aiProbability}% AI-Generated**
**Verdict Confidence: ${res.data.result.confidence}%**

---

## Detailed Structural Feedback
- **Sentence Count**: ${res.data.result.features.sentenceCount}
- **Word Count**: ${res.data.result.features.wordCount}
- **Average Sentence Length**: ${res.data.result.features.avgSentenceLength} words
- **Burstiness (variation)**: ${res.data.result.features.burstiness}
- **Vocabulary Diversity**: ${res.data.result.features.diversity}
- **Readability (Flesch)**: ${res.data.result.features.readability}

### Key Signals Detected:
${res.data.result.llmFeedback.patterns.map((p: string) => `- ${p}`).join("\n")}

### Transitions Analyzed:
${res.data.result.llmFeedback.transitions.map((t: string) => `- ${t}`).join("\n")}

### Core structure:
${res.data.result.llmFeedback.structure}

*Powered by Paperxify AI Detection Engine v3.0*`;
          setDocumentContent(rep);
        } else {
          setDetectorError(res.data.message || "Detection failed.");
        }
        apiCallFinishedRef.current = true;
      })
      .catch(err => {
        console.error(err);
        setDetectorError(err.response?.data?.message || "Server error during AI detection.");
        apiCallFinishedRef.current = true;
      });
  };

  const handleInsertFormat = (type: "bold" | "italic" | "code" | "header") => {
    const el = document.getElementById("writer-textarea") as HTMLTextAreaElement;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e);
    const map = { bold: `**${sel || "bold"}**`, italic: `*${sel || "italic"}*`, code: `\`${sel || "code"}\``, header: `\n## ${sel || "Section"}\n` };
    const next = value.slice(0, s) + map[type] + value.slice(e);
    setDocumentContent(next);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + 2, s + 2 + (sel || "text").length); }, 50);
  };

  // AI Detector Verdict Calculations
  const sentenceCounts = detectorResult?.sentences?.reduce(
    (acc: { ai: number; mixed: number; human: number }, s: any) => {
      if (s.label === "ai") acc.ai++;
      else if (s.label === "mixed") acc.mixed++;
      else if (s.label === "human") acc.human++;
      return acc;
    },
    { ai: 0, mixed: 0, human: 0 }
  ) || { ai: 0, mixed: 0, human: 0 };

  const getVerdictDetails = () => {
    if (!detectorResult) return {
      title: "No Analysis",
      desc: "",
      color: "text-neutral-400",
      bg: "bg-neutral-500/10 border-neutral-500/20",
      progressColor: "bg-neutral-500",
      recomm: "",
      verdictText: "Unknown"
    };

    const prob = detectorResult.aiProbability;
    if (prob >= 70) {
      return {
        title: "High AI Probability",
        desc: "Forensic signals suggest this document was mostly written by an AI language model.",
        color: "text-red-400",
        bg: "bg-red-500/10 border-red-500/20",
        progressColor: "bg-red-500 shadow-[0_0_8px_#ef4444]",
        recomm: "High risk of AI detection flag. We recommend using our AI Humanizer to convert this text into natural human style, varying your sentence lengths and structures.",
        verdictText: "Likely AI-Generated"
      };
    } else if (prob >= 35) {
      return {
        title: "Mixed AI Probability",
        desc: "Likely contains a blend of human writing and AI-generated passages.",
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        progressColor: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
        recomm: "Moderate risk of AI detection. Rephrase sentences highlighted in Red and Yellow, or use the AI Humanizer to lower likelihood scores.",
        verdictText: "Partially AI-Assisted"
      };
    } else {
      return {
        title: "Low AI Probability",
        desc: "Highly likely written by a human. Minimal AI stylistic markers detected.",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        progressColor: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
        recomm: "Safe to submit. The document shows natural variance in sentence structure and rich vocabulary choice typical of human writers.",
        verdictText: "Human-Written"
      };
    }
  };

  const verdict = getVerdictDetails();

  /* ──────────── JSX ──────────── */
  return (
    <>
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to access AI writing suite tools"
      />
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={premiumFeatureName || selectedModel.name}
      />
      <div className="flex flex-col items-center justify-start w-full">
        <section className="w-full min-h-screen relative flex flex-col items-center justify-start bg-black text-white px-4 py-10 font-sans selection:bg-amber-900/40 selection:text-white overflow-hidden">

        {/* ── INPUT OR LOADING ── */}
        <div className="relative z-10 w-full max-w-4xl mx-auto">

          {!isGenerating && !showResult ? (
            /* ════════ INPUT STATE ════════ */
            <div className="flex flex-col items-center space-y-8 sm:space-y-10 w-full">

              {/* Status Badge */}
              <div className="mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md shadow-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                Paperxify Writer Engine Active
              </div>

              {/* Hero Title */}
              <div className="text-center space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2">
                  Your AI-Powered{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-orange-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    Writing Suite
                  </span>
                </h1>
                <p className="text-neutral-500 text-sm sm:text-base font-light max-w-lg mx-auto">
                  Detect AI, humanize text, write essays, grade papers, generate citations &amp; more — all in one place.
                </p>
              </div>

              {/* ══ MAIN COMMAND CARD ══ */}
              <div className="w-full relative z-10">
                {/* Glow border */}
                <div className="absolute -inset-px rounded-[2.2rem] bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 bg-[#0c0c0c] border border-white/[0.08] rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] transition-all duration-500 focus-within:border-white/20">

                  {/* TEXT INPUT ROW */}
                  <div className="flex items-start gap-2.5 sm:gap-3 px-4 sm:px-5 pt-4 sm:pt-6 pb-2 w-full">
                    {selectedTool.id !== "plagiarism" && (
                      <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center mt-0.5">
                        <selectedTool.icon size={17} />
                      </div>
                    )}
                    {isProcessingFile ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 bg-[#0c0c0c] border border-white/[0.08] rounded-2xl text-center relative overflow-hidden w-full">
                        {/* Scanning beam effect */}
                        <style>{`
                          @keyframes scan {
                            0% { top: 0%; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { top: 100%; opacity: 0; }
                          }
                        `}</style>
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ animation: 'scan 2s ease-in-out infinite', position: 'absolute' }} />
                        
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
                          <FileText size={22} />
                        </div>
                        <h4 className="text-sm font-bold text-neutral-200">Analyzing Document Structure</h4>
                        <p className="text-xs text-neutral-500 mt-1.5 max-w-xs truncate">Reading text streams from: {processingFileName}</p>
                        
                        <div className="flex items-center gap-1.5 mt-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-[ping_1.4s_infinite]" />
                          <span className="text-[10px] text-amber-500/80 font-mono font-bold uppercase tracking-wider">Compiling Text Assets</span>
                        </div>
                      </div>
                    ) : attachedFile ? (
                      <div className="flex-1 flex flex-col items-start justify-start py-1 px-1">
                        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md w-full sm:max-w-md shadow-lg group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <div className="flex items-center gap-3 min-w-0 z-10">
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                              <FileText size={15} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-bold text-neutral-200 truncate">{attachedFile.name}</span>
                              <span className="text-[9px] text-neutral-500 font-medium">{attachedFile.wordCount} words attached</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setAttachedFile(null)}
                            className="shrink-0 p-1.5 rounded-lg bg-white/5 border border-white/5 text-neutral-500 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all z-10"
                            title="Remove file"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    ) : selectedTool.id === "plagiarism" ? (
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            await processFile(file);
                          }
                        }}
                        className={cn(
                          "flex-1 flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 w-full min-h-[220px]",
                          isDragging 
                            ? "border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]" 
                            : "border-white/10 hover:border-white/20 bg-neutral-950/20 hover:bg-neutral-950/40"
                        )}
                        onClick={() => {
                          document.getElementById("doc-file-upload")?.click();
                        }}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                          <Upload size={22} className="animate-bounce" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">Upload Your Document</h3>
                        <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                          Drag & drop your file here, or <span className="text-amber-400 font-bold underline">browse</span>.
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-4 text-[10px] text-neutral-600 font-semibold tracking-wider uppercase">
                          <span>PDF</span>
                          <span>•</span>
                          <span>TXT</span>
                          <span>•</span>
                          <span>MD</span>
                        </div>
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        placeholder={selectedTool.placeholder}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] sm:text-[16px] font-semibold text-white placeholder:text-neutral-500 sm:placeholder:text-neutral-600 outline-none min-w-0 px-1 resize-none leading-relaxed"
                      />
                    )}
                  </div>

                  {/* ADDITIONAL CONTEXT TEXTAREA */}
                  {selectedTool.id !== "plagiarism" && (
                    <div className="px-4 sm:px-6 pb-3">
                      <input
                        type="text"
                        placeholder="Add specific instructions, tone requirements, or context… (optional)"
                        value={additionalPrompt}
                        onChange={e => setAdditionalPrompt(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-[13px] sm:text-[14px] text-neutral-400 placeholder:text-neutral-700 outline-none leading-relaxed px-1"
                      />
                    </div>
                  )}

                  {/* TOOL CHIPS */}
                  <div className="px-4 sm:px-5 pb-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mb-2.5">Select Tool</p>
                    <div className="flex flex-wrap gap-1.5">
                      {WRITER_TOOLS.map(tool => {
                        const isActive = selectedTool.id === tool.id;
                        
                        // Build direct link URL containing current prompt, model, lang, tone
                        const params = new URLSearchParams();
                        if (inputText.trim()) params.set("prompt", inputText.trim());
                        if (selectedModel.id !== "flash") params.set("model", selectedModel.id);
                        if (outputLanguage !== "English") params.set("language", outputLanguage);
                        if (selectedTone !== "Academic") params.set("tone", selectedTone);
                        const queryStr = params.toString();
                        const href = `/ai-writer/${tool.id}${queryStr ? `?${queryStr}` : ""}`;

                        return (
                          <Link
                            key={tool.id}
                            href={href}
                            onClick={(e) => {
                              // Prevent full router transition, switch state instantly
                              e.preventDefault();
                              
                              const premiumTools = ["ai-detector", "ai-humanizer", "plagiarism"];
                              if (premiumTools.includes(tool.id) && !hasPremiumAccess) {
                                setPremiumFeatureName(`${tool.label} Tool`);
                                setShowPremiumModal(true);
                                return;
                              }
                              setSelectedTool(tool);
                            }}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap ${
                              isActive
                                ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                                : "bg-transparent border-white/[0.08] text-neutral-500 hover:text-neutral-300 hover:border-white/20"
                            }`}
                          >
                            <tool.icon size={11} />
                            {tool.label}
                          </Link>
                        );
                      })}
                    </div>
                    {/* Tool hint */}
                    <p className="text-[10px] text-amber-500/70 mt-2.5 font-medium flex items-center gap-1.5">
                      <selectedTool.icon size={10} />
                      {selectedTool.hint}
                    </p>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="px-4 sm:px-5 py-3 sm:py-4 bg-[#070707] border-t border-white/[0.04] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">

                      {/* Model Dropdown Selector */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 text-[10px] font-bold text-neutral-400 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedModel.hex, boxShadow: `0 0 6px ${selectedModel.hex}99` }} />
                          <span>{selectedModel.name}</span>
                          <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[280px] p-2.5 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] z-[300]" style={{ background: 'radial-gradient(ellipse at top left, #ffffff06 0%, #0a0a0a 60%)' }}>
                          {/* Header */}
                          <div className="px-3 py-2 mb-1 border-b border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500 flex items-center gap-1.5">
                              <Brain size={11} className="text-white/30" /> Intelligence Engine
                            </p>
                          </div>
                          {/* Model Cards */}
                          <div className="space-y-1 mt-1">
                            {AI_MODELS.map(m => {
                              const isLocked = m.accessTier === 'Pro' && !hasPremiumAccess;
                              const isPowerLocked = m.accessTier === 'Power' && (!hasPremiumAccess || userPlanId !== 'power');
                              const isActive = m.id === selectedModel.id;
                              const locked = isLocked || isPowerLocked;
                              const tierColor = m.accessTier === 'Free' ? '#38bdf8' : m.accessTier === 'Pro' ? '#a78bfa' : '#fbbf24';
                              return (
                                <DropdownMenuItem
                                  key={m.id}
                                  onClick={() => {
                                    if (locked) {
                                      setPremiumFeatureName(`${m.name} Model`);
                                      setShowPremiumModal(true);
                                      return;
                                    }
                                    setSelectedModel(m);
                                  }}
                                  className={cn(
                                    "cursor-pointer rounded-xl p-0 mb-0.5 transition-all duration-200 outline-none focus:bg-transparent",
                                    locked ? "opacity-60" : ""
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200",
                                      isActive
                                        ? "border-white/10 bg-white/[0.06]"
                                        : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.03]"
                                    )}
                                    style={isActive ? { boxShadow: `inset 0 0 20px ${m.hex}10` } : {}}
                                  >
                                    {/* Color dot */}
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                      style={{
                                        backgroundColor: `${m.hex}12`,
                                        borderColor: `${m.hex}25`,
                                        boxShadow: isActive ? `0 0 12px ${m.hex}30` : 'none',
                                      }}
                                    >
                                      <Cpu size={16} style={{ color: m.hex }} />
                                    </div>
                                    {/* Info */}
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className={cn("font-black text-[12px] tracking-tight", isActive ? "text-white" : "text-neutral-300")}>{m.name}</span>
                                        {/* Tier badge */}
                                        <span
                                          className="text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md border"
                                          style={{ color: tierColor, backgroundColor: `${tierColor}12`, borderColor: `${tierColor}25` }}
                                        >
                                          {m.accessTier}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-neutral-600 leading-tight truncate">{m.desc}</span>
                                    </div>
                                    {/* State icon */}
                                    {locked && (
                                      <div className="shrink-0 w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                        <Lock size={10} className="text-neutral-500" />
                                      </div>
                                    )}
                                    {!locked && isActive && (
                                      <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${m.hex}20`, boxShadow: `0 0 8px ${m.hex}40` }}>
                                        <Check size={11} style={{ color: m.hex }} />
                                      </div>
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Language · Tone Dropdown */}
                      {selectedTool.id !== "plagiarism" && selectedTool.id !== "essay-writer" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/[0.06] rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white transition-all">
                              <span>{outputLanguage} · {selectedTone}</span>
                              <ChevronDown size={10} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-neutral-900 border border-white/10 rounded-xl p-3 z-[300] w-64 space-y-3">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2">Language</p>
                              <div className="flex flex-wrap gap-1.5">
                                {LANGUAGES.map(lang => (
                                  <button
                                    key={lang}
                                    onClick={() => setOutputLanguage(lang)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                      outputLanguage === lang
                                        ? "bg-white text-black border-white"
                                        : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                                    }`}
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2">Writing Tone</p>
                              <div className="flex flex-wrap gap-1.5">
                                {TONES.map(tone => (
                                  <button
                                    key={tone}
                                    onClick={() => setSelectedTone(tone)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                      selectedTone === tone
                                        ? "bg-white text-black border-white"
                                        : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                                    }`}
                                  >
                                    {tone}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {/* Essay Writer Filters */}
                      {selectedTool.id === "essay-writer" && (
                        <>
                          {/* Academic Level */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/[0.06] rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white transition-all">
                                <span>{academicLevel}</span>
                                <ChevronDown size={10} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-neutral-900 border border-white/10 rounded-xl p-2.5 z-[300] w-48 max-h-60 overflow-y-auto space-y-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1 px-1">Academic Level</p>
                              {ACADEMIC_LEVELS.map(lvl => (
                                <DropdownMenuItem
                                  key={lvl}
                                  onClick={() => setAcademicLevel(lvl)}
                                  className={`px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                    academicLevel === lvl
                                      ? "bg-white text-black"
                                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {lvl}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Essay Type */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/[0.06] rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white transition-all">
                                <span>{essayType}</span>
                                <ChevronDown size={10} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-neutral-900 border border-white/10 rounded-xl p-2.5 z-[300] w-52 max-h-60 overflow-y-auto space-y-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1 px-1">Essay Type</p>
                              {ESSAY_TYPES.map(type => (
                                <DropdownMenuItem
                                  key={type}
                                  onClick={() => setEssayType(type)}
                                  className={`px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                    essayType === type
                                      ? "bg-white text-black"
                                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {type}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Citation Style */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/[0.06] rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white transition-all">
                                <span>{citationStyle}</span>
                                <ChevronDown size={10} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-neutral-900 border border-white/10 rounded-xl p-2.5 z-[300] w-48 max-h-60 overflow-y-auto space-y-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1 px-1">Citation Style</p>
                              {CITATION_STYLES.map(cit => (
                                <DropdownMenuItem
                                  key={cit}
                                  onClick={() => setCitationStyle(cit)}
                                  className={`px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                    citationStyle === cit
                                      ? "bg-white text-black"
                                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {cit}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Word Count */}
                          <div className="flex items-center gap-1 bg-white/5 border border-white/[0.06] rounded-lg px-2.5 py-1.5">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Words:</span>
                            <input
                              type="number"
                              min={300}
                              max={5000}
                              step={100}
                              value={wordCount}
                              onChange={e => setWordCount(Number(e.target.value))}
                              className="bg-transparent border-none text-[10px] font-bold text-white w-12 text-center focus:outline-none focus:ring-0 p-0"
                            />
                          </div>
                        </>
                      )}

                      {/* File Upload Input & Button */}
                      <div>
                        <input
                          type="file"
                          id="doc-file-upload"
                          className="hidden"
                          accept=".pdf,.txt,.md"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        {selectedTool.id !== "plagiarism" && (
                          <label
                            htmlFor="doc-file-upload"
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/[0.06] rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white transition-all cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Upload size={10} className="text-amber-500" />
                            <span>{isUploading ? 'Extracting...' : 'Upload Doc/PDF'}</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Generate CTA */}
                    <button
                      onClick={handleGenerate}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-amber-50 rounded-xl h-11 font-black uppercase tracking-widest text-[11px] transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]"
                    >
                      <Sparkles size={13} className="text-amber-500" />
                      Run {selectedTool.label}
                      <ArrowRight size={12} />
                    </button>
                  </div>

                </div>
              </div>
            </div>

          ) : isGenerating ? (
            /* ════════ LOADING STATE ════════ */
            <div className="w-full max-w-lg mx-auto bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center space-y-7 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)]">

              {/* Circular progress indicator */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff08" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="#f59e0b" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="text-2xl font-black text-white tracking-tighter">{Math.round(progressPercent)}%</span>
              </div>

              {/* Step info */}
              <div className="text-center space-y-1.5 w-full">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Stage {currentStep}: {LOADING_STEPS[currentStep]?.label || "Processing"}
                </h3>
                <p className="text-xs text-neutral-500 font-light px-2">
                  {LOADING_STEPS[currentStep]?.desc}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {LOADING_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                      idx < currentStep ? "w-2 h-2 bg-amber-400" :
                      idx === currentStep ? "w-3 h-3 bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" :
                      "w-1.5 h-1.5 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Trivia tip */}
              <div className="w-full p-4 rounded-2xl border border-white/[0.04] bg-neutral-950/60 min-h-[88px] flex flex-col justify-center">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-neutral-500 block mb-1">
                  {TRIVIA_TIPS[activeTipIndex].title}
                </span>
                <p className="text-neutral-400 text-[11px] leading-relaxed font-light">
                  {TRIVIA_TIPS[activeTipIndex].text}
                </p>
              </div>
            </div>

          ) : selectedTool.id === "ai-detector" && detectorResult ? (
            /* ════════ DETECTOR PROFESSIONAL WORKSPACE ════════ */
            <div className="w-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Top Overview Banner (Premium Verdict Board) */}
              <div className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
                {/* Background decorative atmosphere */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />
                
                {/* Large dial gauge */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff04" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={detectorResult.aiProbability >= 70 ? "#ef4444" : detectorResult.aiProbability >= 35 ? "#f59e0b" : "#10b981"}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - detectorResult.aiProbability / 100)}`}
                      className="transition-all duration-1000"
                      style={{ filter: `drop-shadow(0 0 6px ${detectorResult.aiProbability >= 70 ? "#ef444450" : detectorResult.aiProbability >= 35 ? "#f59e0b50" : "#10b98150"})` }}
                    />
                  </svg>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl font-black tracking-tight text-white">{detectorResult.aiProbability}%</span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500 mt-0.5">AI Index</span>
                  </div>
                </div>

                {/* Verdict Text & Horizontal Track */}
                <div className="flex-1 text-center md:text-left space-y-3 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${verdict.bg} ${verdict.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {verdict.title}
                    </span>
                    <span className="text-neutral-500 text-[11px] font-medium">
                      {detectorResult.features.wordCount} words · {detectorResult.features.sentenceCount} sentences
                    </span>
                  </div>
                  
                  <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-xl leading-relaxed">
                    {verdict.desc}
                  </p>

                  {/* Gradient Indicator Track */}
                  <div className="w-full relative pt-2">
                    <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-80" />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-neutral-950 shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-1000"
                      style={{ left: `calc(${detectorResult.aiProbability}% - 8px)` }}
                      title={`Verdict: ${detectorResult.aiProbability}% AI`}
                    />
                  </div>
                </div>

                {/* Vertical Sub-score metrics */}
                <div className="w-full md:w-auto grid grid-cols-3 md:flex md:flex-col gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/[0.06] md:pl-8">
                  <div className="flex flex-col items-center md:items-start p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Human Score</span>
                    <span className="text-sm font-black text-emerald-400 mt-0.5">{detectorResult.humanProbability}%</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Confidence</span>
                    <span className="text-sm font-black text-neutral-200 mt-0.5">{detectorResult.confidence}%</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Verdict</span>
                    <span className={`text-[10px] font-black uppercase mt-1 ${verdict.color}`}>
                      {verdict.verdictText}
                    </span>
                  </div>
                </div>

              </div>

              {/* Utility actions header */}
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Forensic Workspace</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setAttachedFile(null);
                      setInputText("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-[10px] font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={10} /> Scan New Document
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-[10px] font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    <Copy size={10} /> Copy Report
                  </button>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
                
                {/* Left Column: Highlighted Document (col-span-8) */}
                <div className="lg:col-span-8 flex flex-col space-y-4">
                  <div className="rounded-2xl border border-white/[0.08] bg-[#070707] shadow-xl p-5 md:p-6 flex flex-col h-[500px] lg:h-[550px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.04] mb-4">
                      <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
                        <FileText size={14} className="text-amber-500" /> Highlighted Source Document
                      </h3>
                      {/* Detailed sentence counts legend */}
                      <div className="flex items-center gap-3 text-[9px] text-neutral-500 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-red-500/10 border border-red-500/30" />
                          <strong className="text-red-400">{sentenceCounts.ai}</strong> AI
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/30" />
                          <strong className="text-amber-400">{sentenceCounts.mixed}</strong> Mixed
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-500/5 border border-emerald-500/20" />
                          <strong className="text-emerald-400">{sentenceCounts.human}</strong> Human
                        </span>
                      </div>
                    </div>

                    {/* Document Text Box */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar select-text leading-relaxed text-[15px] text-neutral-300 font-light space-y-4">
                      <div className="p-1">
                        {detectorResult.sentences.map((sent: any, idx: number) => {
                          let highlightStyle = "text-neutral-300 hover:bg-white/5";
                          
                          if (sent.label === "ai") {
                            highlightStyle = "bg-red-500/10 text-red-200 border-b-2 border-red-500/30 hover:bg-red-500/20 transition-all px-1.5 py-0.5 rounded cursor-help";
                          } else if (sent.label === "mixed") {
                            highlightStyle = "bg-amber-500/10 text-amber-200 border-b-2 border-amber-500/30 hover:bg-amber-500/20 transition-all px-1.5 py-0.5 rounded cursor-help";
                          } else if (sent.label === "human") {
                            highlightStyle = "bg-emerald-500/5 text-emerald-300/90 hover:bg-emerald-500/10 transition-all px-1.5 py-0.5 rounded cursor-help";
                          }

                          return (
                            <span
                              key={idx}
                              className={`inline mr-1.5 leading-loose ${highlightStyle}`}
                              title={`Verdict: ${sent.label.toUpperCase()} (${sent.score}% confidence)`}
                            >
                              {sent.text}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Statistics Sidebar (col-span-4) */}
                <div className="lg:col-span-4 flex flex-col space-y-6">
                  
                  {/* Linguistic Metrics Grid */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-5 space-y-4 shadow-lg">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-1.5 border-b border-white/[0.04] pb-3">
                      <Cpu size={12} className="text-amber-500" /> Linguistic Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Burstiness */}
                      <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.03] flex flex-col">
                        <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Burstiness</span>
                        <strong className="text-sm font-black text-white mt-1">{detectorResult.features.burstiness}</strong>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
                          <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, detectorResult.features.burstiness * 10)}%` }} />
                        </div>
                        <span className="text-[8px] text-neutral-600 font-medium mt-1 leading-tight">
                          {detectorResult.features.burstiness > 6 ? "High variance (Human)" : "Low variance (AI)"}
                        </span>
                      </div>

                      {/* Diversity */}
                      <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.03] flex flex-col">
                        <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Diversity (TTR)</span>
                        <strong className="text-sm font-black text-white mt-1">{detectorResult.features.diversity}</strong>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
                          <div className="h-full bg-amber-400" style={{ width: `${detectorResult.features.diversity * 100}%` }} />
                        </div>
                        <span className="text-[8px] text-neutral-600 font-medium mt-1 leading-tight">
                          {detectorResult.features.diversity > 0.65 ? "Rich Vocab (Human)" : "Uniform Vocab (AI)"}
                        </span>
                      </div>

                      {/* Readability */}
                      <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.03] flex flex-col">
                        <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Readability</span>
                        <strong className="text-sm font-black text-white mt-1">{detectorResult.features.readability}</strong>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
                          <div className="h-full bg-amber-400" style={{ width: `${Math.max(0, Math.min(100, detectorResult.features.readability))}%` }} />
                        </div>
                        <span className="text-[8px] text-neutral-600 font-medium mt-1 leading-tight">
                          {detectorResult.features.readability > 60 ? "Standard Ease" : "Academic Grade"}
                        </span>
                      </div>

                      {/* Avg Sentence Length */}
                      <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.03] flex flex-col">
                        <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Avg Sentence Len</span>
                        <strong className="text-sm font-black text-white mt-1">{detectorResult.features.avgSentenceLength} words</strong>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
                          <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (detectorResult.features.avgSentenceLength / 35) * 100)}%` }} />
                        </div>
                        <span className="text-[8px] text-neutral-600 font-medium mt-1 leading-tight">
                          Words per sentence
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Forensic Feedback & Critiques */}
                  {(detectorResult.llmFeedback.structure || detectorResult.llmFeedback.patterns.length > 0 || detectorResult.llmFeedback.transitions.length > 0) && (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-5 space-y-4 shadow-lg">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-1.5 border-b border-white/[0.04] pb-3">
                        <Brain size={12} className="text-amber-500" /> Forensic Analysis Feedback
                      </h4>
                      <div className="space-y-4 text-xs">
                        
                        {/* Core Structure */}
                        {detectorResult.llmFeedback.structure && (
                          <div className="space-y-1">
                            <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Structural Pattern</span>
                            <p className="text-neutral-300 font-light leading-relaxed">{detectorResult.llmFeedback.structure}</p>
                          </div>
                        )}

                        {/* Style Patterns */}
                        {detectorResult.llmFeedback.patterns.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">AI Stylistic Markers</span>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {detectorResult.llmFeedback.patterns.map((pat: string, i: number) => (
                                <span key={i} className="px-2 py-1 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[10px] text-neutral-400 font-medium">
                                  {pat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Style Transitions */}
                        {detectorResult.llmFeedback.transitions.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Transitions Used</span>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {detectorResult.llmFeedback.transitions.map((tr: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-mono font-bold">
                                  {tr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* Recommendations and Call-To-Action Card */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-5 space-y-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-amber-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-1.5">
                      <Zap size={12} className="text-amber-400" /> Next Actions
                    </h4>
                    <p className="text-neutral-300 text-xs leading-relaxed font-light font-sans">
                      {verdict.recomm}
                    </p>
                    
                    {detectorResult.aiProbability >= 35 && (
                      <button
                        onClick={handleRedirectToHumanizer}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-700 active:scale-[0.98] mt-2"
                      >
                        <Sparkles size={11} />
                        Humanize This Text (Bypass AI)
                      </button>
                    )}
                  </div>

                </div>

              </div>

            </div>
          ) : selectedTool.id === "plagiarism" && plagiarismReportHtml ? (
            /* ════════ PLAGIARISM PROFESSIONAL iframe WORKSPACE ════════ */
            <div className="w-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Utility actions header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Analysis Complete</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Academic Integrity Report</h2>
                  <p className="text-neutral-500 text-xs mt-0.5">Interactive print-ready scan result</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setAttachedFile(null);
                      setInputText("");
                      setPlagiarismReportHtml(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={10} /> Scan Another File
                  </button>
                  <button
                    onClick={handleDownloadPlagiarismPdf}
                    disabled={isDownloadingPdf}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-[0_0_12px_rgba(245,158,11,0.2)] ${
                      isDownloadingPdf ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {isDownloadingPdf ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Download size={12} />
                    )}
                    <span>{isDownloadingPdf ? "Generating PDF..." : "Download Official Report"}</span>
                  </button>
                </div>
              </div>

              {/* iframe Container */}
              <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/[0.08] bg-[#0c0c0c] shadow-2xl overflow-hidden flex flex-col h-[700px] sm:h-[800px] w-full relative">
                {/* Visual loading/frame overlay header */}
                <div className="px-5 py-3 border-b border-white/[0.05] bg-neutral-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono tracking-tight ml-2 truncate max-w-xs sm:max-w-md">
                      paperxify-plagscan-report.html
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 uppercase font-mono text-[8px] text-neutral-400 font-bold">
                      HTML Document
                    </span>
                  </div>
                </div>

                {/* Sandboxed iframe */}
                <div className="flex-1 w-full h-full bg-[#faf9f6]">
                  <iframe
                    srcDoc={plagiarismReportHtml}
                    sandbox="allow-scripts"
                    title="Plagiarism Checker Report"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>

            </div>
          ) : selectedTool.id === "ai-humanizer" && humanizerResult ? (
            /* ════════ HUMANIZER COMPARATIVE WORKSPACE ════════ */
            <div className="w-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Top Overview Banner */}
              <div className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
                
                {/* Dials: Before vs After */}
                <div className="flex flex-row items-center justify-center gap-6 sm:gap-10 shrink-0 w-full lg:w-auto">
                  {/* Before Dial */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff04" strokeWidth="6" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="#ef4444"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - humanizerResult.metrics.originalAiLikelihood / 100)}`}
                          className="transition-all duration-1000"
                          style={{ filter: "drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))" }}
                        />
                      </svg>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-black tracking-tight text-red-400">{humanizerResult.metrics.originalAiLikelihood}%</span>
                        <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500 mt-0.5">Original AI</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Before Bypass</span>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                    <ArrowRight size={16} />
                  </div>

                  {/* After Dial */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff04" strokeWidth="6" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="#10b981"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - humanizerResult.metrics.humanizedAiLikelihood / 100)}`}
                          className="transition-all duration-1000"
                          style={{ filter: "drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))" }}
                        />
                      </svg>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-black tracking-tight text-emerald-400">{humanizerResult.metrics.humanizedAiLikelihood}%</span>
                        <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500 mt-0.5">Likely AI</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">After Bypass</span>
                  </div>
                </div>

                {/* Status bar & info */}
                <div className="flex-1 text-center lg:text-left space-y-3 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Linguistic Bypass Successful
                    </span>
                    <span className="text-neutral-500 text-[11px] font-medium font-mono">
                      {inputText.trim().split(/\s+/).filter(Boolean).length} words original &middot; {getWordCount()} words humanized
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white tracking-tight">AI Stylistic Signatures Obfuscated</h3>
                  <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-xl leading-relaxed">
                    The AI Humanizer has successfully restructured your text. High-probability AI markers have been swapped with human-like variability, bursty cadence, and authentic vocab transitions.
                  </p>
                </div>

                {/* Sub-score metrics panel */}
                <div className="w-full lg:w-auto grid grid-cols-3 lg:flex lg:flex-col gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] lg:pl-8">
                  <div className="flex flex-col items-center lg:items-start p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Perplexity Boost</span>
                    <span className="text-sm font-black text-emerald-400 mt-0.5">+{humanizerResult.metrics.perplexityBoost}%</span>
                  </div>
                  <div className="flex flex-col items-center lg:items-start p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Burstiness Gain</span>
                    <span className="text-sm font-black text-emerald-400 mt-0.5">+{humanizerResult.metrics.burstinessGain}%</span>
                  </div>
                  <div className="flex flex-col items-center lg:items-start p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-neutral-500 text-[8px] uppercase tracking-wider font-extrabold">Readability Shift</span>
                    <span className="text-[10px] font-black text-neutral-200 mt-1 uppercase">
                      {humanizerResult.metrics.readabilityShift}
                    </span>
                  </div>
                </div>

              </div>

              {/* Utility actions header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Forensic Transformation Dashboard</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setHumanizerResult(null);
                      setAttachedFile(null);
                      setInputText("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-[10px] font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={10} /> Humanize New Document
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-[10px] font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    <Copy size={10} /> Copy Humanized Text
                  </button>
                  <button
                    onClick={handleDownloadHumanizedPdf}
                    disabled={isDownloadingPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-[10px] font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    {isDownloadingPdf ? <RefreshCw size={10} className="animate-spin" /> : <Download size={10} />}
                    <span>{isDownloadingPdf ? "Downloading..." : "Export Clean PDF"}</span>
                  </button>
                  <button
                    onClick={handleTestInDetector}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  >
                    <Shield size={10} className="text-amber-500" /> Test In AI Detector
                  </button>
                </div>
              </div>

              {/* Comparative side-by-side panes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                
                {/* Left Pane: Original AI-Generated Text */}
                <div className="rounded-2xl border border-red-500/20 bg-[#070707] shadow-xl p-5 md:p-6 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] mb-4">
                    <h3 className="text-xs uppercase tracking-wider text-red-400 font-bold flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500" /> Original AI-Generated Input
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-medium font-mono">
                      {humanizerResult.originalText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  
                  {/* Warning banner inside Left pane */}
                  <div className="mb-3 p-3 rounded-lg bg-red-950/20 border border-red-500/10 text-[11px] text-red-300 font-light flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 text-red-400 mt-0.5" />
                    <span>Linguistic analysis detected highly predictable patterns, uniform sentence layouts, and flat syntax distribution.</span>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar select-text leading-relaxed text-[14px] text-neutral-400 font-light whitespace-pre-wrap">
                    {humanizerResult.originalText}
                  </div>
                </div>

                {/* Right Pane: Humanized Output (Editable) */}
                <div className="rounded-2xl border border-emerald-500/20 bg-[#070707] shadow-xl p-5 md:p-6 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] mb-4">
                    <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" /> Humanized Workspace (Editable)
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-medium font-mono">
                      {getWordCount()} words
                    </span>
                  </div>

                  {/* Success verification banner */}
                  <div className="mb-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 text-[11px] text-emerald-300 font-light flex items-start gap-2">
                    <CheckCircle size={14} className="shrink-0 text-emerald-400 mt-0.5" />
                    <span>Sentence structures randomized. Vocabulary enriched. Safe for submission and professional compilation.</span>
                  </div>

                  {/* Interactive Textarea for editing */}
                  <textarea
                    value={documentContent}
                    onChange={e => setDocumentContent(e.target.value)}
                    className="flex-1 w-full p-0 bg-transparent text-[14px] text-neutral-200 font-sans font-light focus:outline-none resize-none leading-relaxed custom-scrollbar select-text"
                    placeholder="Humanized text is ready here..."
                  />
                </div>

              </div>

            </div>
          ) : (
            /* ════════ RESULT WORKSPACE ════════ */
            <div className="w-full flex flex-col space-y-4">

              {/* Result Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Result Ready</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{selectedTool.label}</h2>
                  <p className="text-neutral-500 text-xs mt-0.5">{getWordCount()} words · {getCharCount()} chars</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setShowResult(false); setInputText(""); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={12} /> New Request
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>

              {/* Editor workspace */}
              <div className="rounded-[2rem] border border-white/[0.06] bg-neutral-900/25 backdrop-blur-xl relative overflow-hidden flex flex-col h-[500px] sm:h-[580px]">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/[0.04] bg-neutral-950/20">
                  <div className="flex items-center gap-1.5">
                    {(["bold", "italic", "code", "header"] as const).map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => handleInsertFormat(fmt)}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors capitalize"
                        title={fmt}
                      >
                        {fmt === "bold" && <Bold size={12} />}
                        {fmt === "italic" && <Italic size={12} />}
                        {fmt === "code" && <Code size={12} />}
                        {fmt === "header" && <Heading size={12} />}
                      </button>
                    ))}
                  </div>

                  {/* View toggle */}
                  <div className="flex items-center bg-black border border-white/10 p-0.5 rounded-xl">
                    <button
                      onClick={() => setIsPreviewMode(false)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                        !isPreviewMode ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                      }`}
                    >
                      <Edit3 size={10} /> Editor
                    </button>
                    <button
                      onClick={() => setIsPreviewMode(true)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                        isPreviewMode ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                      }`}
                    >
                      <Eye size={10} /> Preview
                    </button>
                  </div>
                </div>

                {/* Editor body */}
                <div className="flex-1 relative bg-black/35 overflow-y-auto">
                  {!isPreviewMode ? (
                    <textarea
                      id="writer-textarea"
                      value={documentContent}
                      onChange={e => setDocumentContent(e.target.value)}
                      className="w-full h-full p-6 text-sm text-neutral-200 bg-transparent font-mono focus:outline-none resize-none leading-relaxed"
                    />
                  ) : (
                    <div className="p-6 text-sm leading-relaxed text-neutral-200 font-sans space-y-3">
                      {documentContent.split("\n").map((line, i) => {
                        if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-black text-white border-b border-white/10 pb-2 mb-2">{line.slice(2)}</h1>;
                        if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-white mt-4">{line.slice(3)}</h2>;
                        if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-neutral-200 mt-3">{line.slice(4)}</h3>;
                        if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc text-neutral-300">{line.slice(2)}</li>;
                        if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-amber-500/50 pl-3 text-neutral-400 italic">{line.slice(2)}</blockquote>;
                        if (line.startsWith("---")) return <hr key={i} className="border-white/10 my-3" />;
                        if (line.startsWith("```")) return <pre key={i} className="bg-black/50 border border-white/5 p-3 rounded-lg font-mono text-xs my-2 text-amber-300 overflow-x-auto">{line.replace(/```/g, "")}</pre>;
                        if (!line.trim()) return <div key={i} className="h-2" />;
                        return <p key={i} className="text-neutral-300 font-light">{line}</p>;
                      })}
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="px-5 py-3 border-t border-white/[0.04] bg-neutral-950/10 text-[10px] text-neutral-500 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-4">
                    <span>Words: <strong className="text-neutral-300">{getWordCount()}</strong></span>
                    <span>Chars: <strong className="text-neutral-300">{getCharCount()}</strong></span>
                    <span>Tool: <strong className="text-amber-400">{selectedTool.label}</strong></span>
                  </div>
                  <span className="font-mono text-[9px] text-neutral-600">Paperxify Writer Engine</span>
                </div>

              </div>
            </div>
          )}

        </div>
      </section>

      </div>
    </>
  );
}
