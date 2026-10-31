"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { 
  Bot, 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Plus, 
  ArrowLeft, 
  ArrowRight,
  PenTool, 
  Presentation, 
  FileText, 
  Layers, 
  Zap, 
  Youtube, 
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BrainCircuit,
  MessageSquare,
  ArrowDown,
  Globe,
  SlidersHorizontal,
  X,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Play,
  PanelLeft,
  PanelLeftClose,
  Trash2,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import dynamic from "next/dynamic";
import api from "@/config/api";
import { toast } from "sonner";
import { AuthLoginModal } from "@/components/AuthGuard";
import { cn } from "@/lib/utils";
import { AgentPromptInput, AGENT_MODELS, AGENT_CAPABILITIES, getFileFormatMeta } from "@/components/agent/AgentPromptInput";
import { AgentActivityLog, type AgentActivityTrace } from "@/components/agent/AgentActivityLog";
import type { QuizQuestion } from "@/components/agent/InteractiveQuizViewer";
import type { FlashcardItem } from "@/components/agent/InteractiveFlashcardsViewer";
import type { SlideItem } from "@/components/agent/InteractiveSlidesViewer";
import type { PlanPhase, PlanTask } from "@/components/agent/InteractivePlanViewer";
import type { YouTubeNotesData } from "@/components/agent/InteractiveYouTubeNotesViewer";
import type { NewsItem } from "@/components/agent/InteractiveNewsViewer";
import Link from "next/link";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Dynamically load heavy interactive viewers to keep initial studio load under 50ms
const MermaidViewer = dynamic(() => import("@/components/agent/MermaidViewer").then(m => m.MermaidViewer), { ssr: false });
const InteractiveQuizViewer = dynamic(() => import("@/components/agent/InteractiveQuizViewer").then(m => m.InteractiveQuizViewer), { ssr: false });
const InteractiveFlashcardsViewer = dynamic(() => import("@/components/agent/InteractiveFlashcardsViewer").then(m => m.InteractiveFlashcardsViewer), { ssr: false });
const InteractiveSlidesViewer = dynamic(() => import("@/components/agent/InteractiveSlidesViewer").then(m => m.InteractiveSlidesViewer), { ssr: false });
const InteractivePlanViewer = dynamic(() => import("@/components/agent/InteractivePlanViewer").then(m => m.InteractivePlanViewer), { ssr: false });
const InteractiveYouTubeNotesViewer = dynamic(() => import("@/components/agent/InteractiveYouTubeNotesViewer").then(m => m.InteractiveYouTubeNotesViewer), { ssr: false });
const InteractiveImageViewer = dynamic(() => import("@/components/agent/InteractiveImageViewer").then(m => m.InteractiveImageViewer), { ssr: false });
const InteractiveNewsViewer = dynamic(() => import("@/components/agent/InteractiveNewsViewer").then(m => m.InteractiveNewsViewer), { ssr: false });
const InteractiveWebAppViewer = dynamic(() => import("@/components/agent/InteractiveWebAppViewer").then(m => m.InteractiveWebAppViewer), { ssr: false });
const InteractiveWhiteboardViewer = dynamic(() => import("@/components/agent/InteractiveWhiteboardViewer").then(m => m.InteractiveWhiteboardViewer), { ssr: false });
const InteractiveDeepSearchViewer = dynamic(() => import("@/components/agent/InteractiveDeepSearchViewer").then(m => m.InteractiveDeepSearchViewer), { ssr: false });
const ComposioIntegrationsModal = dynamic(() => import("@/components/agent/ComposioIntegrationsModal").then(m => m.ComposioIntegrationsModal), { ssr: false });
const VisualExplanationPlayer = dynamic(() => import("@/components/narration/VisualExplanationPlayer").then(m => m.VisualExplanationPlayer), { ssr: false });
const NarrationPanel = dynamic(() => import("@/components/narration/NarrationPanel").then(m => m.NarrationPanel), { ssr: false });



interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  model?: string;
  capability?: string;
  attachments?: any[];
  activityTrace?: AgentActivityTrace;
  suggestions?: string[];
  imageOptions?: {
    aspectRatio?: string;
    resolution?: string;
    style?: string;
    lighting?: string;
    camera?: string;
    seed?: number;
  };
  generatedImage?: any;
  capacityExceeded?: {
    title?: string;
    message?: string;
    solution?: string;
    planName?: string;
    code?: string;
    resetsAt?: string;
    upgradeUrl?: string;
  };
}

interface ConversationTurn {
  turnIndex: number;
  userMessage: ChatMessage;
  agentMessage?: ChatMessage;
  elementId: string;
}

// ─────────────────────────────────────────────────────────────
// CLEAN PLAIN-TEXT STRIPPER (Removes markdown syntax symbols)
// ─────────────────────────────────────────────────────────────
function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "") // Remove fenced code blocks
    .replace(/`([^`]+)`/g, "$1")     // Inline code
    .replace(/^#{1,6}\s+/gm, "")     // Headers (##, ###, etc.)
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold **
    .replace(/__([^_]+)__/g, "$1")     // Bold __
    .replace(/\*([^*]+)\*/g, "$1")     // Italic *
    .replace(/_([^_]+)_/g, "$1")       // Italic _
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links [text](url) -> text
    .replace(/^\s*[-*+]\s+/gm, "")     // Bullet points
    .replace(/^\s*\d+\.\s+/gm, "")     // Numbered lists
    .replace(/\$\$[\s\S]*?\$\$/g, "") // Block equations
    .replace(/\$([^$]+)\$/g, "$1")     // Inline equations
    .replace(/>\s*/gm, "")             // Blockquotes
    .replace(/\|.*?\|/g, "")           // Tables
    .replace(/\n+/g, " ")              // Newlines to single space
    .trim();
}

// ─────────────────────────────────────────────────────────────
// AUTO-DETECT MARKDOWN QUIZZES & CONVERT TO INTERACTIVE TEST
// ─────────────────────────────────────────────────────────────
function parseMarkdownQuiz(text: string): QuizQuestion[] | null {
  if (!text) return null;
  if (text.includes("```quiz") || text.includes("```json-quiz")) return null;

  const qRegex = /(?:^|\n)(?:###?\s*)?(?:\*\*)?Question\s*(\d+)[:.]?(?:\*\*)?\s*([\s\S]*?)(?=(?:\n(?:###?\s*)?(?:\*\*)?Question\s*\d+[:.]?)|$)/gi;
  const matches = [...text.matchAll(qRegex)];
  if (matches.length < 2) return null;

  const questions: QuizQuestion[] = [];
  for (const match of matches) {
    const block = match[2]?.trim();
    if (!block) continue;

    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;

    const questionText = lines[0].replace(/^\*\*|\*\*$/g, "").trim();
    const options: string[] = [];
    let answer = "";
    let explanation = "";

    for (const line of lines.slice(1)) {
      if (/^[a-d][.)]\s+/i.test(line) || /^[-*]\s+[a-d][.)]\s+/i.test(line)) {
        options.push(line.replace(/^[-*]\s+/, ""));
      } else if (/(?:correct answer|answer):\s*/i.test(line)) {
        answer = line.replace(/.*?(?:correct answer|answer):\s*/i, "").replace(/^\*\*|\*\*$/g, "").trim();
      } else if (/explanation:\s*/i.test(line)) {
        explanation = line.replace(/.*?explanation:\s*/i, "").replace(/^\*\*|\*\*$/g, "").trim();
      }
    }

    if (options.length >= 2) {
      questions.push({
        question: questionText,
        options,
        answer: answer || options[0],
        explanation
      });
    }
  }

  return questions.length >= 2 ? questions : null;
}

/**
 * Intelligent Markdown Slide Deck Parser (Transforms Slide 1, Slide 2... into interactive 16:9 presentation deck)
 */
function parseMarkdownSlides(text: string): SlideItem[] | null {
  if (!text) return null;
  const slideSplitRegex = /(?:^|\n)(?:###?\s*)?(?:\*\*)?Slide\s+(\d+)[:\s\-]+([^\n]+)/gi;
  const matches = [...text.matchAll(slideSplitRegex)];

  if (matches.length < 2) return null;

  const slides: SlideItem[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const slideNum = parseInt(match[1], 10) || i + 1;
    const rawTitle = match[2].replace(/\*\*/g, "").trim();

    const startIdx = match.index! + match[0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const chunk = text.slice(startIdx, endIdx);

    let layout = "";
    let speakerNotes = "";
    const bullets: string[] = [];

    const lines = chunk.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (/visual layout:\s*(.+)/i.test(line)) {
        layout = line.replace(/.*visual layout:\s*/i, "").replace(/\*\*/g, "").trim();
      } else if (/presenter notes:\s*(.+)/i.test(line)) {
        speakerNotes = line.replace(/.*presenter notes:\s*/i, "").replace(/\*\*/g, "").trim();
      } else if (/^[-*•]\s+(.+)/.test(line)) {
        const bulletText = line.replace(/^[-*•]\s+/, "").replace(/\*\*/g, "").trim();
        if (bulletText && !/bullet points:/i.test(bulletText)) {
          bullets.push(bulletText);
        }
      } else if (/^\d+\.\s+(.+)/.test(line)) {
        const bulletText = line.replace(/^\d+\.\s+/, "").replace(/\*\*/g, "").trim();
        if (bulletText) {
          bullets.push(bulletText);
        }
      }
    }

    slides.push({
      slide: slideNum,
      title: rawTitle || `Slide ${slideNum}`,
      layout: layout || undefined,
      bullets: bullets.length > 0 ? bullets : ["Key insights and strategic takeaways"],
      speakerNotes: speakerNotes || undefined
    });
  }

  return slides.length >= 2 ? slides : null;
}

/**
 * Intelligent Markdown Execution Plan Parser (Transforms Phase 1, Phase 2, Week 1... into interactive checklist roadmap)
 */
function parseMarkdownPlan(text: string): PlanPhase[] | null {
  if (!text) return null;
  const phaseRegex = /(?:^|\n)(?:###?\s*)?(?:\*\*)?(?:Phase|Module|Week|Sprint|Step)\s+(\d+)[:\s\-]+([^\n]+)/gi;
  const matches = [...text.matchAll(phaseRegex)];

  if (matches.length < 2) return null;

  const phases: PlanPhase[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const phaseNum = parseInt(match[1], 10) || i + 1;
    const rawTitle = match[2].replace(/\*\*/g, "").trim();

    const startIdx = match.index! + match[0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const chunk = text.slice(startIdx, endIdx);

    let timeframe = "";
    let objective = "";
    const tasks: PlanTask[] = [];
    const deliverables: string[] = [];

    const lines = chunk.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (/(?:timeframe|timeline|duration):\s*(.+)/i.test(line)) {
        timeframe = line.replace(/.*?(?:timeframe|timeline|duration):\s*/i, "").replace(/\*\*/g, "").trim();
      } else if (/objective:\s*(.+)/i.test(line)) {
        objective = line.replace(/.*?objective:\s*/i, "").replace(/\*\*/g, "").trim();
      } else if (/deliverables?:\s*(.+)/i.test(line)) {
        deliverables.push(line.replace(/.*?deliverables?:\s*/i, "").replace(/\*\*/g, "").trim());
      } else if (/^[-*•]\s+(?:\[([ xX])\]\s+)?(.+)/.test(line)) {
        const m = line.match(/^[-*•]\s+(?:\[([ xX])\]\s+)?(.+)/);
        if (m) {
          const isDone = m[1]?.toLowerCase() === "x";
          const taskText = m[2].replace(/\*\*/g, "").trim();
          if (taskText && !/milestones?|tasks?|checklist/i.test(taskText)) {
            tasks.push({ task: taskText, done: isDone });
          }
        }
      } else if (/^\d+\.\s+(.+)/.test(line)) {
        const taskText = line.replace(/^\d+\.\s+/, "").replace(/\*\*/g, "").trim();
        if (taskText) {
          tasks.push({ task: taskText, done: false });
        }
      }
    }

    phases.push({
      phase: phaseNum,
      title: rawTitle || `Phase ${phaseNum}`,
      timeframe: timeframe || undefined,
      objective: objective || undefined,
      tasks: tasks.length > 0 ? tasks : [{ task: "Complete core milestones and deliverables", done: false }],
      deliverables: deliverables.length > 0 ? deliverables : undefined
    });
  }

  return phases.length >= 2 ? phases : null;
}

/**
 * Ultra-Resilient News Intelligence Parser (Extracts structured JSON or regex items from any news block)
 */
function parseNewsData(text: string): NewsItem[] | null {
  if (!text) return null;

  // 1. Check if there are explicit ```news code blocks
  const blocks = [...text.matchAll(/```(?:news|news-json|news-briefing|breaking-news|json)?\s*([\s\S]*?)```/gi)];
  for (const block of blocks) {
    const rawContent = block[1]?.trim();
    if (!rawContent || !rawContent.includes("title")) continue;
    try {
      const cleaned = rawContent
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/,(\s*[\]}])/g, "$1")
        .trim();

      const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        const parsed = JSON.parse(arrayMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
          return parsed;
        }
      }

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        return parsed;
      }
      if (parsed?.articles && Array.isArray(parsed.articles) && parsed.articles.length > 0) {
        return parsed.articles;
      }
      if (parsed?.feed && Array.isArray(parsed.feed) && parsed.feed.length > 0) {
        return parsed.feed;
      }
    } catch {}
  }

  // 2. Direct array extraction anywhere in text
  try {
    const cleaned = text
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/,(\s*[\]}])/g, "$1")
      .trim();

    const arrayMatch = cleaned.match(/\[\s*\{\s*"title"[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        return parsed;
      }
    }
  } catch {}

  // 3. Regex fallback for streaming or slightly malformed JSON items
  try {
    const objectMatches = [...text.matchAll(/\{\s*"title"\s*:\s*"([^"]+)"[\s\S]*?"url"\s*:\s*"([^"]+)"[\s\S]*?\}/g)];
    if (objectMatches.length >= 1) {
      const items: NewsItem[] = [];
      for (const m of objectMatches) {
        try {
          const item = JSON.parse(m[0].replace(/,(\s*[\}])/g, "$1"));
          if (item.title) items.push(item);
        } catch {
          const title = m[0].match(/"title"\s*:\s*"([^"]+)"/)?.[1];
          const summary = m[0].match(/"summary"\s*:\s*"([^"]+)"/)?.[1] || "";
          const source = m[0].match(/"source"\s*:\s*"([^"]+)"/)?.[1] || "Verified Source";
          const url = m[0].match(/"url"\s*:\s*"([^"]+)"/)?.[1] || "#";
          const publishedAt = m[0].match(/"publishedAt"\s*:\s*"([^"]+)"/)?.[1] || "Today";
          const imageUrl = m[0].match(/"imageUrl"\s*:\s*"([^"]+)"/)?.[1] || m[0].match(/"mainImage"\s*:\s*"([^"]+)"/)?.[1];
          const category = m[0].match(/"category"\s*:\s*"([^"]+)"/)?.[1] || "Top Stories";
          const region = m[0].match(/"region"\s*:\s*"([^"]+)"/)?.[1] || "GLOBAL";
          if (title) items.push({ title, summary, source, url, publishedAt, imageUrl, category, region });
        }
      }
      if (items.length >= 1) return items;
    }
  } catch {}

  return null;
}

// ─────────────────────────────────────────────────────────────
// VS CODE HIGH-PRECISION SYNTAX HIGHLIGHTED CODE BLOCK & INTERACTIVE ENGINES
// ─────────────────────────────────────────────────────────────
function MarkdownCodeBlock({ inline, className, children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1].toLowerCase() : "";
  const codeString = String(children).replace(/\n$/, "");

  // 1. Render Interactive Architecture & Whiteboard Diagrams
  if (!inline && (lang === "mermaid" || lang === "whiteboard" || lang === "diagram")) {
    return <InteractiveWhiteboardViewer chart={codeString} />;
  }

  // 1b. Render Interactive Live Web Apps Sandbox
  if (!inline && (lang === "web-app" || lang === "webapp" || lang === "html" || (lang === "jsx" && (codeString.includes("<div") || codeString.includes("export default"))))) {
    if (codeString.includes("<") && codeString.includes(">")) {
      return <InteractiveWebAppViewer code={codeString} language={lang} />;
    }
  }

  // 1c. Render Interactive DeepSearch Research Dossier
  if (!inline && (lang === "deepsearch" || lang === "research-dossier" || lang === "dossier")) {
    return <InteractiveDeepSearchViewer rawText={codeString} />;
  }

  // 2. Render Interactive Quizzes
  if (!inline && (lang === "quiz" || lang === "json-quiz" || lang === "quiz-json" || lang === "interactive-quiz")) {
    try {
      const parsed = JSON.parse(codeString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return <InteractiveQuizViewer questions={parsed} />;
      }
    } catch {}
  }

  // 3. Render Interactive Flashcards
  if (!inline && (lang === "flashcards" || lang === "flashcard" || lang === "flashcards-json")) {
    try {
      const parsed = JSON.parse(codeString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return <InteractiveFlashcardsViewer cards={parsed} />;
      }
    } catch {}
  }

  // 4. Render Interactive 16:9 Keynote Slide Decks
  if (!inline && (lang === "slides" || lang === "slide" || lang === "slides-json" || lang === "presentation")) {
    try {
      const parsed = JSON.parse(codeString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return <InteractiveSlidesViewer slides={parsed} />;
      }
    } catch {}
  }

  // 5. Render Interactive Plan & Roadmaps
  if (!inline && (lang === "plan" || lang === "roadmap" || lang === "plan-json" || lang === "roadmap-json")) {
    try {
      const parsed = JSON.parse(codeString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return <InteractivePlanViewer phases={parsed} />;
      }
    } catch {}
  }

  // 6. Render Interactive YouTube Study Notes
  if (!inline && (lang === "youtube-notes" || lang === "yt-notes" || lang === "youtube" || lang === "lecture-notes")) {
    try {
      const parsed = JSON.parse(codeString);
      if (parsed && (parsed.chapters || parsed.summary)) {
        return <InteractiveYouTubeNotesViewer data={parsed} />;
      }
    } catch {}
  }

  // 7. Render Interactive Qwen Image 3 Generation
  if (!inline && (lang === "image-json" || lang === "image" || lang === "generated-image")) {
    let parsed: any = null;
    try {
      parsed = JSON.parse(codeString);
    } catch {
      // Robust regex extraction fallback for streaming or raw JSON strings
      const urlMatch = codeString.match(/"imageUrl"\s*:\s*"([^"]+)"/) || 
                       codeString.match(/"dataUrl"\s*:\s*"([^"]+)"/) ||
                       codeString.match(/https:\/\/[^\s"]+\.(?:png|jpg|jpeg|webp)/i);
      const promptMatch = codeString.match(/"originalPrompt"\s*:\s*"([^"]+)"/) || codeString.match(/"prompt"\s*:\s*"([^"]+)"/);
      const aspectMatch = codeString.match(/"aspectRatio"\s*:\s*"([^"]+)"/);
      const resMatch = codeString.match(/"resolution"\s*:\s*"([^"]+)"/);
      
      if (urlMatch) {
        parsed = {
          imageUrl: urlMatch[1] || urlMatch[0],
          originalPrompt: promptMatch ? promptMatch[1] : "",
          aspectRatio: aspectMatch ? aspectMatch[1] : "1:1",
          resolution: resMatch ? resMatch[1] : "1K"
        };
      }
    }

    if (parsed && (parsed.imageUrl || parsed.dataUrl || parsed.b64_json)) {
      return (
        <div className="w-full my-3">
          <InteractiveImageViewer
            imageData={parsed}
            imageUrl={parsed.imageUrl || parsed.dataUrl || (parsed.b64_json ? `data:${parsed.mediaType || "image/png"};base64,${parsed.b64_json}` : "")}
            prompt={parsed.originalPrompt || parsed.prompt || ""}
            enhancedPrompt={parsed.enhancedPrompt}
            aspectRatio={parsed.aspectRatio || "1:1"}
            resolution={parsed.resolution || "1K"}
            style={parsed.style || "photorealistic"}
          />
        </div>
      );
    }
  }

  // 8. Render Interactive Visual & Narration Video Explanation (Sarvam Bulbul V3)
  if (!inline && (lang === "visual-explanation" || lang === "video-explanation" || lang === "narration" || lang === "ai-video")) {
    try {
      const parsed = JSON.parse(codeString.replace(/,(\s*[\]}])/g, "$1"));
      if (parsed && (parsed.narration_segments || parsed.segments)) {
        const segs = parsed.narration_segments || parsed.segments;
        return (
          <div className="w-full my-4 space-y-4">
            <VisualExplanationPlayer
              manifest={
                parsed.timeline
                  ? parsed
                  : {
                      source_image: parsed.source_image,
                      animation_sequence: parsed.animation_sequence || [],
                      narration_segments: segs,
                      audio_segments: parsed.audio_segments || [],
                      timeline: segs.map((s: any, idx: number) => ({
                        segment_id: s.segment_id,
                        start_ms: idx * 4000,
                        end_ms: (idx + 1) * 4000,
                        animation_step_ids: s.animation_step_ids || []
                      })),
                      total_duration_ms: segs.length * 4000
                    }
              }
            />
            <NarrationPanel
              segments={segs}
              sourceImage={parsed.source_image}
              animationSequence={parsed.animation_sequence}
            />
          </div>
        );
      }
    } catch {}
  }

  // 9. Render Interactive News Intelligence Hub
  if (!inline && (lang === "news" || lang === "news-json" || lang === "news-briefing" || lang === "breaking-news" || lang === "newsfeed")) {

    const parsed = parseNewsData(codeString) || parseNewsData(`\`\`\`news\n${codeString}\n\`\`\``);
    if (parsed && parsed.length > 0) {
      return <InteractiveNewsViewer newsItems={parsed} />;
    }
    try {
      const directParsed = JSON.parse(codeString.replace(/,(\s*[\]}])/g, "$1"));
      if (Array.isArray(directParsed) && directParsed.length > 0) {
        return <InteractiveNewsViewer newsItems={directParsed} />;
      }
      if (directParsed && Array.isArray(directParsed.articles) && directParsed.articles.length > 0) {
        return <InteractiveNewsViewer newsItems={directParsed.articles} topic={directParsed.topic} />;
      }
      if (directParsed && Array.isArray(directParsed.feed) && directParsed.feed.length > 0) {
        return <InteractiveNewsViewer newsItems={directParsed.feed} topic={directParsed.topic} />;
      }
    } catch {}
  }

  // 9. Interactive Component Stream Shield: Prevent Raw JSON Flash During Active Streaming
  const INTERACTIVE_LANGS = [
    "image-json", "image", "generated-image",
    "quiz", "json-quiz", "quiz-json", "interactive-quiz",
    "flashcards", "flashcard", "flashcards-json",
    "slides", "slide", "slides-json", "presentation",
    "plan", "roadmap", "plan-json", "roadmap-json",
    "youtube-notes", "yt-notes", "youtube", "lecture-notes",
    "news", "news-json", "news-briefing", "breaking-news", "newsfeed",
    "web-app", "webapp", "deepsearch", "research-dossier", "whiteboard"
  ];

  if (!inline && INTERACTIVE_LANGS.includes(lang)) {
    if (lang.includes("image")) {
      const hasUrl = codeString.includes("http://") || codeString.includes("https://") || codeString.includes("data:image");
      if (!hasUrl) {
        return (
          <div className="my-4">
            <InteractiveImageViewer
              loading={true}
              prompt=""
              aspectRatio="1:1"
              resolution="1K"
            />
          </div>
        );
      }
    }

    let typeName = "Interactive Component";
    let iconColor = "text-red-400";
    if (lang.includes("quiz")) { typeName = "Practice Test & Quiz"; iconColor = "text-red-400"; }
    else if (lang.includes("flashcard")) { typeName = "3D Flashcard Deck"; iconColor = "text-red-400"; }
    else if (lang.includes("slide") || lang.includes("presentation")) { typeName = "16:9 Presentation Deck"; iconColor = "text-red-400"; }
    else if (lang.includes("plan") || lang.includes("roadmap")) { typeName = "Execution Roadmap & Plan"; iconColor = "text-emerald-400"; }
    else if (lang.includes("youtube") || lang.includes("yt") || lang.includes("lecture")) { typeName = "YouTube Study Companion"; iconColor = "text-rose-400"; }
    else if (lang.includes("news")) { typeName = "Live News Intelligence Hub"; iconColor = "text-amber-400"; }
    else if (lang.includes("web-app") || lang.includes("webapp")) { typeName = "Interactive Web Application"; iconColor = "text-sky-400"; }
    else if (lang.includes("whiteboard")) { typeName = "System Topology & Diagram"; iconColor = "text-violet-400"; }
    else if (lang.includes("deepsearch")) { typeName = "Deep Research Dossier"; iconColor = "text-red-400"; }

    return (
      <div className="my-4 rounded-2xl border border-white/[0.08] bg-[#0c0c14]/95 overflow-hidden shadow-2xl backdrop-blur-sm p-5 sm:p-6 space-y-4 font-sans select-none">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
              <Sparkles size={13} className={iconColor} />
              <span>Constructing {typeName}...</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Rendering live</span>
        </div>

        {/* Shimmering Skeleton Elements */}
        <div className="space-y-3 pt-1 animate-pulse">
          <div className="h-4 bg-white/[0.07] rounded-lg w-3/5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <div className="h-12 bg-white/[0.03] rounded-xl border border-white/[0.05]" />
            <div className="h-12 bg-white/[0.03] rounded-xl border border-white/[0.05]" />
            <div className="h-12 bg-white/[0.03] rounded-xl border border-white/[0.05]" />
            <div className="h-12 bg-white/[0.03] rounded-xl border border-white/[0.05]" />
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = lang === "javascript" || lang === "js" ? "js" :
                lang === "typescript" || lang === "ts" ? "ts" :
                lang === "python" || lang === "py" ? "py" :
                lang === "html" ? "html" :
                lang === "css" ? "css" :
                lang === "json" ? "json" :
                lang === "sql" ? "sql" : "txt";
    const blob = new Blob([codeString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-snippet.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code snippet downloaded!");
  };

  if (!inline && (match || codeString.includes("\n"))) {
    return (
      <div className="my-4 rounded-xl border border-white/[0.08] hover:border-red-500/30 bg-[#0c0c14] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.7)] font-mono text-[13px] transition-all group">
        {/* Paperxify Obsidian Code Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-red-950/20 via-[#0e0e16] to-[#0c0c14] border-b border-white/[0.08] text-xs text-neutral-400 select-none">
          <div className="flex items-center gap-2.5">
            {/* macOS 3 dots with subtle glow */}
            <div className="flex items-center gap-1.5 mr-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-red-400 font-semibold uppercase text-[10.5px] bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/25 tracking-wider font-mono">
              {lang || "code"}
            </span>
            <span className="text-[11px] text-neutral-500 font-sans hidden sm:inline">
              {codeString.split("\n").length} lines
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-all cursor-pointer px-2 py-1 rounded-md hover:bg-white/[0.06] active:scale-95 text-[11px]"
              title="Download code file"
            >
              <Download size={12} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-all cursor-pointer px-2.5 py-1 rounded-md hover:bg-white/[0.08] active:scale-95 text-[11px]"
              title="Copy code snippet"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* High-Precision Syntax Highlighting */}
        <div className="overflow-x-auto custom-scrollbar bg-[#09090f]">
          <SyntaxHighlighter
            language={lang || "javascript"}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "1rem 1.25rem",
              background: "transparent",
              fontSize: "12.5px",
              lineHeight: "1.7",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace"
            }}
            showLineNumbers={codeString.split("\n").length > 2}
            lineNumberStyle={{
              minWidth: "2.5em",
              paddingRight: "1em",
              color: "#4e4e5e",
              userSelect: "none"
            }}
            wrapLines={false}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <code className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-red-300 font-mono text-[12.5px] border border-white/[0.06]" {...props}>
      {children}
    </code>
  );
}

// ─────────────────────────────────────────────────────────────
// LUXURY MARKDOWN RENDER COMPONENT
// ─────────────────────────────────────────────────────────────
const markdownComponents = {
  code: MarkdownCodeBlock,
  pre: ({ children }: any) => <>{children}</>,
  h1: ({ children }: any) => (
    <h1 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 tracking-tight border-b border-white/[0.08] pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-base sm:text-lg font-bold text-neutral-100 mt-5 mb-2.5 tracking-tight flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
      <span>{children}</span>
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm sm:text-base font-semibold text-neutral-200 mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-neutral-200 text-[13.5px] sm:text-[14px] leading-relaxed mb-3.5">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="space-y-1.5 my-3 pl-5 list-disc text-neutral-200 text-[13.5px] sm:text-[14px] marker:text-red-500">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="space-y-1.5 my-3 pl-5 list-decimal text-neutral-200 text-[13.5px] sm:text-[14px] marker:text-red-400 font-medium">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed text-neutral-200">
      {children}
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-red-500 bg-red-500/5 px-3.5 py-2.5 rounded-r-xl my-3.5 text-neutral-300 text-[13.5px] italic">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c0c11]">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="bg-white/[0.05] text-neutral-200 font-semibold px-3.5 py-2.5 border-b border-white/[0.08]">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3.5 py-2.5 border-b border-white/[0.04] text-neutral-300">
      {children}
    </td>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors font-medium inline-flex items-center gap-0.5"
    >
      <span>{children}</span>
      <ExternalLink size={10} className="inline opacity-70" />
    </a>
  )
};

function formatSmartSessionTitle(prompt: string): string {
  if (!prompt || !prompt.trim()) return "Autonomous Agent Session";
  
  let clean = prompt
    .trim()
    .replace(/^((please|can you|could you|i want to|i need to|help me|tell me|make|generate|create|get|fetch|write|find|search for|give me|check|send)\s+)+/i, "")
    .replace(/[?.!,:;]+$/, "")
    .trim();

  if (!clean) clean = prompt.trim();

  const words = clean.split(/\s+/).slice(0, 6);
  const titled = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return titled.slice(0, 42) + (clean.length > 42 ? "..." : "");
}

/**
 * Apple iOS / macOS Minimalist Capacity Limit Card
 * Replaces ugly raw errors with a clean, calm system status card
 */
function AppleCapacityExceededCard({
  data
}: {
  data: {
    title?: string;
    message?: string;
    solution?: string;
    planName?: string;
    resetsAt?: string;
    code?: string;
    upgradeUrl?: string;
  };
}) {
  const handleOpenUpgrade = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-capacity-modal", { detail: data }));
    }
  };

  return (
    <div className="w-full max-w-2xl my-3 sm:my-4 rounded-2xl bg-[#0c0c11]/95 border border-white/[0.09] shadow-xl p-4 sm:p-5 space-y-3.5 select-none backdrop-blur-xl">
      {/* Header Capsule */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
            Study Capacity Reached
          </span>
        </div>
        <span className="text-[10.5px] font-mono text-neutral-400 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
          {data.resetsAt || "Resets tonight"}
        </span>
      </div>

      {/* Main Copy */}
      <div className="space-y-1.5">
        <h3 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight">
          {data.title || "100% Allocation Reached"}
        </h3>
        <p className="text-xs sm:text-[12.5px] text-neutral-300 leading-relaxed">
          {data.message || "You've processed your full AI allocation for this cycle. Capacity resets automatically."}
        </p>
        {data.solution && (
          <p className="text-[11.5px] text-neutral-400 leading-relaxed pt-0.5">
            {data.solution}
          </p>
        )}
      </div>

      {/* Segmented Capacity Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Usage</span>
          <span className="font-mono text-rose-400 font-semibold">100% (Exceeded)</span>
        </div>
        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full w-full" />
        </div>
      </div>

      {/* Apple Actions */}
      <div className="flex items-center gap-2.5 pt-1.5 flex-wrap">
        <button
          type="button"
          onClick={handleOpenUpgrade}
          className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold tracking-tight transition-all active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <span>Upgrade for Instant Access</span>
          <ArrowRight size={13} />
        </button>
        <button
          type="button"
          onClick={handleOpenUpgrade}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer"
        >
          View Capacity Details
        </button>
      </div>
    </div>
  );
}

export function AgentStudioClient() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "session";
  const initialQueryParam = searchParams.get("q");

  // Synchronously initialize state so the very first frame already renders the query & trace
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedChat = localStorage.getItem(`paperxify_workspace_chat_${slug}`) || localStorage.getItem(`paperxify_agent_chat_${slug}`);
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          return parsed.messages;
        }
      }
      const initKey = `paperxify_workspace_init_${slug}`;
      const legacyInitKey = `paperxify_agent_init_${slug}`;
      const stored = sessionStorage.getItem(initKey) || localStorage.getItem(initKey) || sessionStorage.getItem(legacyInitKey) || localStorage.getItem(legacyInitKey);
      if (stored) {
        const token = localStorage.getItem("authToken");
        if (!token || token === "null" || token === "undefined") {
          return []; // Do not display running trace for unauthenticated visitors
        }
        const parsed = JSON.parse(stored);
        const q = parsed.initialQuery || "";
        if (q) {
          return [
            {
              id: "msg_user_init",
              sender: "user",
              text: q,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              model: parsed.model || "paper-fast",
              capability: parsed.capability || "auto",
              attachments: parsed.attachments || []
            },
            {
              id: "msg_agent_init",
              sender: "agent",
              text: "",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              model: parsed.model || "paper-fast",
              capability: parsed.capability || "auto",
              activityTrace: {
                status: "running",
                title: `Researching: ${q.slice(0, 48)}...`,
                startTime: Date.now(),
                steps: [
                  {
                    id: "step_understand",
                    type: "phase",
                    phase: "understanding",
                    label: "Understanding your request & identifying topic",
                    status: "running"
                  }
                ],
                searchQueries: [],
                sources: [],
                stats: { tools: 0, searches: 0, sources: 0 }
              },
              suggestions: []
            }
          ];
        }
      }
    } catch {}
    return [];
  });

  const [sessionTitle, setSessionTitle] = useState(() => {
    if (typeof window === "undefined") return "Workspace Session";
    try {
      const savedChat = localStorage.getItem(`paperxify_workspace_chat_${slug}`) || localStorage.getItem(`paperxify_agent_chat_${slug}`);
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        if (parsed.title) return parsed.title;
      }
      const initKey = `paperxify_workspace_init_${slug}`;
      const legacyInitKey = `paperxify_agent_init_${slug}`;
      const stored = sessionStorage.getItem(initKey) || localStorage.getItem(initKey) || sessionStorage.getItem(legacyInitKey) || localStorage.getItem(legacyInitKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.initialQuery) {
          return parsed.initialQuery.slice(0, 48) + (parsed.initialQuery.length > 48 ? "..." : "");
        }
      }
    } catch {}
    return "Workspace Session";
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeStreamingId, setActiveStreamingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState("paper-fast");
  const [activeCapability, setActiveCapability] = useState("auto");
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isSessionsMenuOpen, setIsSessionsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showScrollBottomPill, setShowScrollBottomPill] = useState(false);
  const [pendingExecutionData, setPendingExecutionData] = useState<any>(null);

  // Resume pending execution when user completes sign-in
  useEffect(() => {
    const handleAuthChange = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (token && pendingExecutionData) {
        const dataToRun = { ...pendingExecutionData };
        setPendingExecutionData(null);
        toast.success("Signed in! Launching your autonomous agent workflow...");
        executeAgentTask(dataToRun);
      }
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [pendingExecutionData]);
  
  // Navigation & Turn Position Tracking
  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(0);
  const [hoveredTurnIndex, setHoveredTurnIndex] = useState<number | null>(null);
  const [ratedMessages, setRatedMessages] = useState<Record<string, "up" | "down">>({});
  const [openMoreMenuId, setOpenMoreMenuId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAgentTask, setPendingAgentTask] = useState<any>(null);

  const [isMobileHeaderMenuOpen, setIsMobileHeaderMenuOpen] = useState(false);
  const [sharecopied, setSharecopied] = useState(false);
  const [connectedAppNotification, setConnectedAppNotification] = useState<{
    appName: string;
    appId: string;
    logoUrl?: string;
  } | null>(null);
  const mobileHeaderMenuRef = useRef<HTMLDivElement>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isInitialRun = useRef(false);
  const isAutoScrollEnabled = useRef(true);
  const sessionsDropdownRef = useRef<HTMLDivElement>(null);

  // Detect ?connected= query param or "integration-connected" events
  useEffect(() => {
    const connectedParam = searchParams.get("connected");
    if (connectedParam) {
      const formattedName = connectedParam.charAt(0).toUpperCase() + connectedParam.slice(1);
      const logoMap: Record<string, string> = {
        gmail: "https://logos.composio.dev/api/gmail",
        linkedin: "https://logos.composio.dev/api/linkedin",
        googlecalendar: "https://logos.composio.dev/api/googlecalendar",
        googledrive: "https://logos.composio.dev/api/googledrive",
        github: "https://logos.composio.dev/api/github",
        notion: "https://logos.composio.dev/api/notion",
        slack: "https://logos.composio.dev/api/slack"
      };

      setConnectedAppNotification({
        appName: formattedName,
        appId: connectedParam.toLowerCase(),
        logoUrl: logoMap[connectedParam.toLowerCase()] || `https://logos.composio.dev/api/${connectedParam.toLowerCase()}`
      });

      // Clean up query param cleanly without full page refresh
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("connected");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        window.dispatchEvent(new Event("integrations-updated"));
      }
    }

    const handleCustomEvent = (e: any) => {
      if (e.detail?.appName) {
        setConnectedAppNotification({
          appName: e.detail.appName,
          appId: e.detail.appId || e.detail.appName.toLowerCase(),
          logoUrl: e.detail.logoUrl || `https://logos.composio.dev/api/${(e.detail.appId || e.detail.appName).toLowerCase()}`
        });
      }
    };

    window.addEventListener("integration-connected", handleCustomEvent);
    return () => {
      window.removeEventListener("integration-connected", handleCustomEvent);
    };
  }, [searchParams]);

  // Auto dismiss banner after 6 seconds
  useEffect(() => {
    if (connectedAppNotification) {
      const timer = setTimeout(() => {
        setConnectedAppNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [connectedAppNotification]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sessionsDropdownRef.current && !sessionsDropdownRef.current.contains(e.target as Node)) {
        setIsSessionsMenuOpen(false);
      }
      if (mobileHeaderMenuRef.current && !mobileHeaderMenuRef.current.contains(e.target as Node)) {
        setIsMobileHeaderMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Delete chat session from local storage & recent list
  const handleDeleteSession = async (slugToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(`paperxify_agent_chat_${slugToDelete}`);
        const updatedList = recentSessions.filter((s: any) => s.slug !== slugToDelete);
        localStorage.setItem("paperxify_agent_sessions_list", JSON.stringify(updatedList));
        setRecentSessions(updatedList);
        
        // Also remove from backend if user is authenticated
        const token = localStorage.getItem("authToken");
        if (token) {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          fetch(`${apiBase}/api/agent/sessions/${slugToDelete}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => {});
        }

        window.dispatchEvent(new Event("creation-saved"));
        toast.success("Chat removed from history");
        if (slugToDelete === slug) {
          handleStartNewChat();
        }
      }
    } catch {}
  };

  const filteredSessions = recentSessions.filter((s: any) => 
    !sessionSearchQuery.trim() || s.title?.toLowerCase().includes(sessionSearchQuery.toLowerCase())
  );

  // Compute conversation turns (User Prompt + AI Response pairs)
  const conversationTurns: ConversationTurn[] = [];
  let turnIdx = 0;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.sender === "user") {
      const nextMsg = messages[i + 1];
      if (nextMsg && nextMsg.sender === "agent") {
        conversationTurns.push({
          turnIndex: turnIdx,
          userMessage: m,
          agentMessage: nextMsg,
          elementId: `chat-turn-${turnIdx}`
        });
        turnIdx++;
        i++; // skip paired agent message
      } else {
        conversationTurns.push({
          turnIndex: turnIdx,
          userMessage: m,
          elementId: `chat-turn-${turnIdx}`
        });
        turnIdx++;
      }
    } else if (m.sender === "agent") {
      conversationTurns.push({
        turnIndex: turnIdx,
        userMessage: { id: "u0", sender: "user", text: "Prompt", timestamp: m.timestamp },
        agentMessage: m,
        elementId: `chat-turn-${turnIdx}`
      });
      turnIdx++;
    }
  }

  // Active turn detection on scroll using IntersectionObserver
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const indexStr = entry.target.getAttribute("data-turn-index");
            if (indexStr !== null) {
              const index = Number(indexStr);
              if (!isNaN(index)) {
                setActiveTurnIndex(index);
              }
            }
          }
        }
      },
      {
        root: container,
        rootMargin: "-5% 0px -55% 0px",
        threshold: 0.05
      }
    );

    const turnElements = container.querySelectorAll(".chat-turn-block");
    turnElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, conversationTurns.length]);

  // Smart auto-scroll physics
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const nearBottom = distanceFromBottom < 120;
      isAutoScrollEnabled.current = nearBottom;
      setShowScrollBottomPill(!nearBottom && messages.length > 0);
    }
  }, [messages.length]);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
      });
    }
  };

  useEffect(() => {
    if (isAutoScrollEnabled.current) {
      scrollToBottom(false);
    }
  }, [messages, isLoading]);

  // Load or initialize session
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem("paperxify_agent_sessions_list");
      if (storedSessions) {
        setRecentSessions(JSON.parse(storedSessions));
      }
    } catch {}

    if (!isInitialRun.current) {
      isInitialRun.current = true;

      // 1. Check if this session already has existing saved messages in localStorage
      const savedChat = typeof window !== "undefined" ? localStorage.getItem(`paperxify_agent_chat_${slug}`) : null;
      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            setMessages(parsed.messages);
            setSessionTitle(parsed.title || "Autonomous Agent Session");
            if (parsed.model) setActiveModel(parsed.model);
            
            // Clean ?q= from URL address bar so page refresh won't re-trigger query
            if (typeof window !== "undefined" && window.history?.replaceState) {
              window.history.replaceState(null, "", `/workspace/${slug}`);
            }
            return;
          }
        } catch {}
      }

      // 2. If this is a brand new session, check for incoming initial query
      const initKey = `paperxify_workspace_init_${slug}`;
      const legacyInitKey = `paperxify_agent_init_${slug}`;
      let storedInit: string | null = null;
      if (typeof window !== "undefined") {
        storedInit = sessionStorage.getItem(initKey) || localStorage.getItem(initKey) || sessionStorage.getItem(legacyInitKey) || localStorage.getItem(legacyInitKey);
        sessionStorage.removeItem(initKey);
        localStorage.removeItem(initKey);
        sessionStorage.removeItem(legacyInitKey);
        localStorage.removeItem(legacyInitKey);
      }
      
      let initialData: any = null;
      if (storedInit) {
        try {
          initialData = JSON.parse(storedInit);
        } catch {}
      }

      const queryToRun = initialData?.initialQuery || initialQueryParam;

      // Strip ?q= from URL immediately so refresh won't duplicate execution
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState(null, "", `/workspace/${slug}`);
      }

      if (queryToRun) {
        const title = queryToRun.slice(0, 48) + (queryToRun.length > 48 ? "..." : "");
        setSessionTitle(title);
        if (initialData?.model) setActiveModel(initialData.model);
        if (initialData?.capability) setActiveCapability(initialData.capability);

        // Strict Auth Gate: Prevent unauthenticated execution on initial load
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        if (!token || token === "null" || token === "undefined") {
          setPendingExecutionData({
            query: queryToRun,
            model: initialData?.model || "paper-fast",
            capability: initialData?.capability || "auto",
            attachments: initialData?.attachments || [],
            imageOptions: initialData?.imageOptions
          });
          toast.info("Please sign in to run your agent task.");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("open-login"));
          }
          return;
        }

        executeAgentTask({
          query: queryToRun,
          model: initialData?.model || "paper-fast",
          capability: initialData?.capability || "auto",
          attachments: initialData?.attachments || [],
          imageOptions: initialData?.imageOptions
        });
      }
    }
  }, [slug, initialQueryParam]);

  // Save session state to localStorage
  const persistSession = (newMessages: ChatMessage[], title: string, model: string) => {
    try {
      localStorage.setItem(
        `paperxify_agent_chat_${slug}`,
        JSON.stringify({
          slug,
          title,
          model,
          messages: newMessages,
          updatedAt: new Date().toISOString()
        })
      );

      const stored = localStorage.getItem("paperxify_agent_sessions_list");
      let list = stored ? JSON.parse(stored) : [];
      list = list.filter((s: any) => s.slug !== slug);
      list.unshift({
        slug,
        title,
        updatedAt: new Date().toISOString()
      });
      list = list.slice(0, 30);
      localStorage.setItem("paperxify_agent_sessions_list", JSON.stringify(list));
      setRecentSessions(list);
      // Dispatch event to notify DesktopSidebar history in real-time
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("creation-saved"));
      }
    } catch {}
  };

  const executeAgentTask = async ({
    query,
    model = activeModel,
    capability = activeCapability,
    attachments = [],
    imageOptions
  }: {
    query: string;
    model?: string;
    capability?: string;
    attachments?: any[];
    imageOptions?: {
      aspectRatio?: string;
      resolution?: "1K" | "2K";
      style?: string;
      magicEnhance?: boolean;
    };
  }) => {
    if (!query.trim() && attachments.length === 0) return;

    // Strict Auth Gate: Verify authentication before starting stream or burning tokens
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token || token === "null" || token === "undefined") {
      setPendingExecutionData({
        query,
        model,
        capability,
        attachments,
        imageOptions
      });
      toast.info("Please sign in to run autonomous agent workflows.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("open-login"));
      }
      return;
    }

    let activeTitle = sessionTitle;
    if (sessionTitle === "Autonomous Agent Session" || !sessionTitle || messages.length === 0) {
      activeTitle = formatSmartSessionTitle(query);
      setSessionTitle(activeTitle);
    }

    const userMessageId = Math.random().toString(36).substring(7);
    const agentMessageId = Math.random().toString(36).substring(7);

    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      model,
      capability,
      attachments,
      imageOptions
    };

    const initialActivityTrace: AgentActivityTrace = {
      status: "running",
      title: query ? `Researching: ${query.slice(0, 48)}...` : "Agent Task Started",
      startTime: Date.now(),
      steps: [
        {
          id: "step_understand",
          type: "phase",
          phase: "understanding",
          label: "Understanding your request & identifying topic",
          status: "running"
        }
      ],
      searchQueries: [],
      sources: [],
      stats: { tools: 0, searches: 0, sources: 0 }
    };

    const initialAgentMessage: ChatMessage = {
      id: agentMessageId,
      sender: "agent",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      model,
      capability,
      activityTrace: initialActivityTrace,
      suggestions: [],
      imageOptions
    };

    setMessages(prev => {
      const isPlaceholder = prev.length === 2 && prev[0].id === "msg_user_init" && prev[1].id === "msg_agent_init";
      const nextMessages = isPlaceholder ? [userMessage, initialAgentMessage] : [...prev, userMessage, initialAgentMessage];
      // Save turn immediately so prompt and session are never lost
      persistSession(nextMessages, activeTitle, model);
      return nextMessages;
    });
    setIsLoading(true);
    setActiveStreamingId(agentMessageId);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;

    try {
      const response = await fetch(`${apiBase}/api/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          query,
          capability,
          model,
          slug,
          attachments,
          imageOptions,
          userId: user?._id || user?.id,
          history: messages.slice(-6).map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event("open-login"));
          throw new Error("Please sign in to run autonomous agent workflows.");
        }
        if (response.status === 403) {
          const errData = await response.json().catch(() => ({}));
          window.dispatchEvent(new CustomEvent("open-capacity-modal", { detail: errData }));
          const capPayload = {
            title: errData.title || "100% Study Capacity Reached",
            message: errData.message || "You've processed your full AI allocation for this cycle. Capacity resets automatically.",
            solution: errData.solution || "Upgrade to Pro Scholar for expanded daily & monthly reasoning capacity.",
            planName: errData.planName || "Free Tier",
            resetsAt: errData.capacity?.resetsAt || errData.resetsAt || "Tonight at midnight"
          };
          setMessages(prev => {
            const nextList = prev.map(m => {
              if (m.id === agentMessageId) {
                return {
                  ...m,
                  text: "",
                  capacityExceeded: capPayload,
                  activityTrace: {
                    status: "completed" as const,
                    title: "Capacity Limit Reached",
                    steps: [
                      {
                        id: "cap",
                        label: "Study allowance limit reached",
                        status: "completed" as const
                      }
                    ]
                  }
                };
              }
              return m;
            });
            persistSession(nextList, activeTitle, model);
            return nextList;
          });
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to stream agent execution`);
      }

      if (!response.body) {
        throw new Error("No readable stream response from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let currentText = "";
      let currentGeneratedImage: any = null;
      let currentTrace: AgentActivityTrace = { 
        ...initialActivityTrace,
        searchQueries: [],
        sources: []
      };
      let currentSuggestions: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const event = JSON.parse(trimmed.slice(6));

            if (event.code === "AUTH_REQUIRED" || (event.type === "error" && event.code === "AUTH_REQUIRED")) {
              window.dispatchEvent(new Event("open-login"));
              toast.info("Please sign in to run autonomous agent workflows.");
              throw new Error("Authentication required. Please sign in.");
            }

            if (event.code === "QUOTA_EXCEEDED" || event.errorType === "CAPACITY_REACHED" || (event.type === "error" && event.code === "QUOTA_EXCEEDED")) {
              window.dispatchEvent(new CustomEvent("open-capacity-modal", { detail: event }));
              const capPayload = {
                title: event.title || "100% Study Capacity Reached",
                message: event.message || event.error || "You've processed your full AI allocation for this cycle. Capacity resets automatically.",
                solution: event.solution || "Upgrade to Pro Scholar for expanded daily & monthly reasoning capacity.",
                planName: event.planName || "Free Tier",
                resetsAt: event.capacity?.resetsAt || event.resetsAt || "Tonight at midnight"
              };
              setMessages(prev => {
                const nextList = prev.map(m => {
                  if (m.id === agentMessageId) {
                    return {
                      ...m,
                      text: "",
                      capacityExceeded: capPayload,
                      activityTrace: {
                        status: "completed" as const,
                        title: "Capacity Limit Reached",
                        steps: [
                          {
                            id: "cap",
                            label: "Study allowance limit reached",
                            status: "completed" as const
                          }
                        ]
                      }
                    };
                  }
                  return m;
                });
                persistSession(nextList, activeTitle, model);
                return nextList;
              });
              return;
            }

            if (event.type === "run.started") {
              currentTrace.runId = event.runId;
              currentTrace.title = event.title || currentTrace.title;
              currentTrace.startTime = event.timestamp || currentTrace.startTime;
              if (event.sessionTitle) {
                activeTitle = event.sessionTitle;
                setSessionTitle(event.sessionTitle);
              }
            } else if (event.type === "phase.started") {
              const existingIdx = currentTrace.steps.findIndex(s => s.phase === event.phase);
              if (existingIdx >= 0) {
                currentTrace.steps[existingIdx].label = event.label || currentTrace.steps[existingIdx].label;
                currentTrace.steps[existingIdx].status = "running";
              } else {
                currentTrace.steps = currentTrace.steps.map(s => s.status === "running" ? { ...s, status: "completed" as const } : s);
                currentTrace.steps.push({
                  id: `phase_${event.phase}`,
                  type: "phase",
                  phase: event.phase,
                  label: event.label,
                  status: "running"
                });
              }
            } else if (event.type === "phase.completed") {
              currentTrace.steps = currentTrace.steps.map(s => (s.phase === event.phase) ? { ...s, status: "completed" as const, durationMs: event.durationMs } : s);
            } else if (event.type === "search.started") {
              currentTrace.searchQueries = [];
            } else if (event.type === "search.query") {
              if (!currentTrace.searchQueries) currentTrace.searchQueries = [];
              const existingIdx = currentTrace.searchQueries.findIndex(q => q.query === event.query);
              if (existingIdx >= 0) {
                currentTrace.searchQueries[existingIdx].status = event.status || "running";
              } else {
                currentTrace.searchQueries.push({
                  query: event.query,
                  status: "running"
                });
              }
            } else if (event.type === "search.result") {
              if (!currentTrace.searchQueries) currentTrace.searchQueries = [];
              const target = currentTrace.searchQueries.find(q => q.query === event.query);
              if (target) {
                target.status = "completed";
                target.durationMs = event.durationMs;
                target.resultsCount = event.resultsCount;
              } else {
                currentTrace.searchQueries.push({
                  query: event.query,
                  status: "completed",
                  durationMs: event.durationMs,
                  resultsCount: event.resultsCount
                });
              }
            } else if (event.type === "search.completed") {
              if (currentTrace.stats) {
                currentTrace.stats.searches = event.totalQueries;
                currentTrace.stats.sources = event.totalSources;
              }
            } else if (event.type === "source.opened") {
              if (!currentTrace.sources) currentTrace.sources = [];
              if (!currentTrace.sources.some(s => s.url === event.url)) {
                currentTrace.sources.push({
                  id: event.id,
                  title: event.title,
                  url: event.url,
                  domain: event.domain,
                  snippet: event.snippet,
                  sourceType: event.sourceType,
                  faviconUrl: event.faviconUrl,
                  durationMs: event.durationMs
                });
              }
            } else if (event.type === "tool.started") {
              currentTrace.steps = currentTrace.steps.map(s => s.status === "running" ? { ...s, status: "completed" as const } : s);
              currentTrace.steps.push({
                id: event.toolCallId || `tool_${Date.now()}`,
                type: "tool",
                tool: event.tool,
                label: event.label,
                app: event.app,
                tier: event.tier,
                inputPreview: event.inputPreview,
                status: "running"
              });
            } else if (event.type === "tool.completed") {
              currentTrace.steps = currentTrace.steps.map(s => {
                if (s.id === event.toolCallId || (s.tool === event.tool && s.status === "running")) {
                  return {
                    ...s,
                    status: "completed" as const,
                    durationMs: event.durationMs,
                    resultSummary: event.resultSummary,
                    data: event.data
                  };
                }
                return s;
              });
            } else if (event.type === "connection.required") {
              const existingIdx = currentTrace.steps.findIndex(s => s.id === event.toolCallId || s.tool === event.tool);
              if (existingIdx >= 0) {
                currentTrace.steps[existingIdx] = {
                  ...currentTrace.steps[existingIdx],
                  status: "action_required" as const,
                  app: event.app || currentTrace.steps[existingIdx].app,
                  appName: event.appName || currentTrace.steps[existingIdx].appName,
                  connectionUrl: event.connectionUrl
                };
              } else {
                currentTrace.steps.push({
                  id: event.toolCallId || `conn_${Date.now()}`,
                  type: "connection",
                  tool: event.tool,
                  label: `${event.appName || event.app || "App"} authorization needed`,
                  app: event.app,
                  appName: event.appName,
                  status: "action_required" as const,
                  connectionUrl: event.connectionUrl
                });
              }
            } else if (event.type === "image.ready") {
              const imgPayload = event.imageData || event.data;
              if (imgPayload) {
                currentGeneratedImage = imgPayload;
                if (!currentText.includes("image-json")) {
                  currentText = `\`\`\`image-json\n${JSON.stringify(imgPayload, null, 2)}\n\`\`\`\n\n` + currentText;
                }
              }
            } else if (event.type === "message.delta") {
              currentText += event.text;
            } else if (event.type === "followups.generated") {
              currentSuggestions = event.suggestions || [];
            } else if (event.type === "run.completed") {
              currentTrace.status = "completed";
              currentTrace.totalDurationMs = event.totalDurationMs;
              currentTrace.stats = event.stats;
              if (event.sources && event.sources.length > 0) {
                currentTrace.sources = event.sources;
              }
              currentSuggestions = event.suggestions || currentSuggestions;
              currentTrace.steps = currentTrace.steps.map(s => s.status === "running" ? { ...s, status: "completed" as const } : s);
            } else if (event.type === "run.failed") {
              currentTrace.status = "failed";
              currentText += `\n\n⚠️ **Agent Notice**: ${event.message}`;
            }

            // Real-time React State Update
            setMessages(prev => prev.map(m => {
              if (m.id === agentMessageId) {
                return {
                  ...m,
                  text: currentText,
                  generatedImage: currentGeneratedImage || m.generatedImage,
                  activityTrace: { 
                    ...currentTrace,
                    searchQueries: currentTrace.searchQueries ? [...currentTrace.searchQueries] : [],
                    sources: currentTrace.sources ? [...currentTrace.sources] : []
                  },
                  suggestions: currentSuggestions
                };
              }
              return m;
            }));

          } catch (jsonErr) {}
        }
      }

      // Save to localStorage when stream finishes
      setMessages(prev => {
        const finalMessages = prev.map(m => {
          if (m.id === agentMessageId) {
            return {
              ...m,
              text: currentText || m.text,
              generatedImage: currentGeneratedImage || m.generatedImage,
              activityTrace: { ...currentTrace, status: "completed" as const },
              suggestions: currentSuggestions
            };
          }
          return m;
        });
        persistSession(finalMessages, activeTitle, model);
        return finalMessages;
      });

    } catch (err: any) {
      console.error("Agent execution error:", err);
      toast.error(err.message || "Agent execution failed. Please retry.");

      setMessages(prev => {
        const errorMessages = prev.map(m => {
          if (m.id === agentMessageId) {
            return {
              ...m,
              text: `⚠️ **Agent Notice**: Could not complete task. (${err.message || "Network or auth issue"})\n\nPlease check your query or retry.`,
              activityTrace: {
                status: "failed" as const,
                steps: [
                  {
                    id: "err",
                    label: `Execution notice: ${err.message || "Error"}`,
                    status: "failed" as const
                  }
                ]
              }
            };
          }
          return m;
        });
        persistSession(errorMessages, activeTitle, model);
        return errorMessages;
      });
    } finally {
      setIsLoading(false);
      setActiveStreamingId(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("capacity-updated"));
      }
    }
  };

  const handleCopyCleanText = (rawText: string, id: string) => {
    const cleanText = stripMarkdown(rawText);
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    toast.success("Copied clean text to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRate = (msgId: string, rating: "up" | "down") => {
    setRatedMessages(prev => ({
      ...prev,
      [msgId]: prev[msgId] === rating ? (undefined as any) : rating
    }));
    toast.success(rating === "up" ? "Thanks for your feedback!" : "Feedback recorded. We'll improve.");
  };

  const handleShare = async () => {
    try {
      const shareUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/workspace/${slug}`
          : `/workspace/${slug}`;
      await navigator.clipboard.writeText(shareUrl);
      setSharecopied(true);
      toast.success("Link copied! Share it with anyone.", {
        description: shareUrl,
        duration: 3500,
      });
      setTimeout(() => setSharecopied(false), 2000);
    } catch {
      toast.error("Could not copy link — please copy the URL from the address bar.");
    }
  };

  const handleExecuteComposioAction = async (actionName: string, inputParams: any = {}) => {
    try {
      setActionLoading(actionName);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? JSON.parse(userStr) : null;
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await api.post(
        "/agent/integrations/execute",
        {
          actionName,
          userId: user?._id || user?.id || "guest",
          input: {
            ...inputParams,
            recipientEmail: user?.email,
            title: sessionTitle
          }
        },
        { headers }
      );

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        if (data.calendarUrl || data.eventLink) {
          window.open(data.calendarUrl || data.eventLink, "_blank");
          toast.success("Opened Google Calendar event creation!");
        } else if (data.whiteboardUrl) {
          router.push(data.whiteboardUrl);
          toast.success("Opened Whiteboard Canvas with your architecture!");
        } else {
          toast.success(data.message || `Successfully executed ${actionName}`);
        }
      }
    } catch (err: any) {
      console.error("Action error:", err);
      toast.error(err.message || "Failed to execute integration action");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportMarkdown = () => {
    const mdContent = messages
      .map(m => `### ${m.sender === "user" ? "👤 You" : "🤖 Paperxify Agent"} (${m.timestamp})\n\n${m.text}\n\n---\n`)
      .join("\n");

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported Markdown notes!");
  };

  const handleConnectAppFromTrace = (url: string) => {
    if (!url) return;
    const width = 600;
    const height = 720;
    const left = typeof window !== "undefined" ? window.screen.width / 2 - width / 2 : 0;
    const top = typeof window !== "undefined" ? window.screen.height / 2 - height / 2 : 0;

    const popup = window.open(
      url,
      "ConnectIntegration",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    toast.info("Connecting integration via Composio...");

    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      if (popup?.closed || attempts > 60) {
        clearInterval(timer);
        toast.success("Account connected! You can now execute your action.");
      }
    }, 2000);
  };



  const handleStartNewChat = () => {
    const newSlug = `task-${Math.random().toString(36).substring(2, 9)}`;
    router.push(`/workspace/${newSlug}`);
  };

  const currentModelInfo = AGENT_MODELS.find(m => m.id === activeModel) || AGENT_MODELS[0];

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] flex bg-[#08080b] text-white font-sans overflow-hidden z-20">
      
      {/* ──── CELEBRATORY TOP CONNECTED BANNER NOTIFICATION ──── */}
      <AnimatePresence>
        {connectedAppNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[99999] w-[calc(100vw-24px)] max-w-lg select-none px-1"
          >
            <div className="rounded-2xl bg-[#0f0f16]/95 backdrop-blur-2xl border border-emerald-500/40 p-3 sm:p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.18)] flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-xl bg-[#161622] border border-white/[0.1] p-1.5 flex items-center justify-center shrink-0 shadow-inner">
                  {connectedAppNotification.logoUrl ? (
                    <img
                      src={connectedAppNotification.logoUrl}
                      alt={connectedAppNotification.appName}
                      className="w-full h-full object-contain"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Zap size={18} className="text-emerald-400" />
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-black font-bold shadow-md">
                    ✓
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                      <span>🎉</span> Connected {connectedAppNotification.appName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 shrink-0">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 truncate">
                    Paperxify AI can now run {connectedAppNotification.appName} tools & autonomous actions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setConnectedAppNotification(null);
                    setIsIntegrationsOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[11px] font-semibold text-white transition-all cursor-pointer border border-white/[0.08]"
                >
                  Tools
                </button>
                <button
                  type="button"
                  onClick={() => setConnectedAppNotification(null)}
                  className="w-7 h-7 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── MAIN AGENT CHAT WORKSPACE ──── */}
      <div className="flex-1 min-h-0 flex flex-col h-full relative overflow-hidden bg-[#08080b]">
        
        {/* ──── ULTRA-MINIMAL TOP NAVIGATION BAR (Optimized for Mobile & Desktop like ChatGPT/Claude) ──── */}
        <header className="min-h-[50px] sm:min-h-[48px] border-b border-white/[0.06] bg-[#08080b]/95 backdrop-blur-xl px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 shrink-0 z-30 pt-[max(0.25rem,env(safe-area-inset-top,0px))]">
          
          {/* Left: Sidebar Toggle + Return & Session Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-1 p-2 sm:px-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-colors text-xs font-medium cursor-pointer shrink-0 active:scale-95"
              title="Open Chat History & Studios (Sidebar)"
            >
              <PanelLeft size={16} className="text-neutral-300" />
              <span className="hidden md:inline text-[11px] font-medium text-neutral-300">History</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1 p-1 sm:p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors text-xs font-medium shrink-0"
              title="Return to Home"
            >
              <span className="font-bold italic tracking-tight text-white uppercase text-[11px]">
                PAPER<span className="text-red-500">XIFY</span>
              </span>
            </Link>

            <span className="text-neutral-700 hidden sm:inline">/</span>

            {/* Session Title Pill (Click opens full sidebar history) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs text-neutral-200 hover:text-white transition-all cursor-pointer max-w-[110px] xs:max-w-[140px] sm:max-w-xs truncate shrink"
              title="Click to view all sessions in sidebar"
            >
              <MessageSquare size={11} className="text-red-400 shrink-0" />
              <span className="truncate text-[11px] sm:text-[11.5px] font-medium">{sessionTitle}</span>
              <ChevronDown size={10} className="text-neutral-500 shrink-0" />
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Tools Button */}
            <button
              onClick={() => setIsIntegrationsOpen(true)}
              className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-[11.5px] font-medium text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Manage Connected Tools"
            >
              <Zap size={14} className="text-red-400" />
              <span className="hidden sm:inline">Tools</span>
            </button>

            {/* Desktop Actions */}
            <button
              onClick={handleShare}
              className={`hidden sm:flex items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                sharecopied
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] text-neutral-400 hover:text-white"
              }`}
              title="Copy shareable link"
            >
              {sharecopied ? <Check size={13} /> : <Share2 size={13} />}
            </button>

            <button
              onClick={handleExportMarkdown}
              className="hidden sm:flex p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Export as Markdown notes"
            >
              <Download size={13} />
            </button>

            {/* Mobile More Options Dropdown */}
            <div className="relative sm:hidden" ref={mobileHeaderMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileHeaderMenuOpen(!isMobileHeaderMenuOpen)}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-95"
                title="More Actions"
              >
                <MoreHorizontal size={15} />
              </button>

              <AnimatePresence>
                {isMobileHeaderMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[#12121b] border border-white/[0.1] shadow-2xl p-1 z-50 backdrop-blur-2xl text-xs space-y-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileHeaderMenuOpen(false);
                        handleShare();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Share2 size={12} className="text-neutral-400" />
                      <span>Share Session</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileHeaderMenuOpen(false);
                        handleExportMarkdown();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Download size={12} className="text-neutral-400" />
                      <span>Export Notes</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* New Task Button */}
            <button
              onClick={handleStartNewChat}
              className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white text-[11.5px] font-semibold transition-all cursor-pointer active:scale-95"
              title="Start a new task"
            >
              <Plus size={14} />
              <span className="hidden md:inline">New</span>
            </button>
          </div>

        </header>

        {/* ──── CHAT MESSAGES SCROLL AREA + INTERACTIVE SIDE TURN SCRUBBER ──── */}
        <div className="flex-1 min-h-0 relative flex overflow-hidden">
          
          <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-8 space-y-6 sm:space-y-8 max-w-4xl w-full mx-auto custom-scrollbar flex flex-col overscroll-contain"
          >

            {/* ──── EMPTY STATE HERO (Inspired by ChatGPT & Claude Mobile) ──── */}
            {conversationTurns.length === 0 && (
              <div className="my-auto py-8 sm:py-12 flex flex-col items-center justify-center text-center px-2 select-none">
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-red-600/25 blur-2xl rounded-full" />
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-[0_4px_24px_rgba(239,68,68,0.4)] border border-white/20">
                    <Sparkles size={24} className="fill-white/20" />
                  </div>
                </div>

                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white mb-1">
                  Paperxify AI Studio
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-xs sm:max-w-md mb-5 sm:mb-8 leading-relaxed">
                  Autonomous research, lecture notes, architecture diagrams, slides & code.
                </p>

                {/* Mobile-Friendly Quick Starter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-lg">
                  {[
                    {
                      icon: Youtube,
                      title: "YouTube to Notes",
                      desc: "Instant structured LaTeX notes from video URL",
                      query: "Analyze this YouTube lecture and create complete, structured study notes with key takeaways, formulas, and flashcards: "
                    },
                    {
                      icon: PenTool,
                      title: "Architecture Diagram",
                      desc: "Generate interactive Excalidraw system schematics",
                      query: "Draw an architecture diagram of a scalable modern cloud system using Excalidraw whiteboard"
                    },
                    {
                      icon: Presentation,
                      title: "Presentation Slides",
                      desc: "Create formatted slide decks ready to present",
                      query: "Create a 10-slide presentation deck covering the fundamentals of Artificial Intelligence"
                    },
                    {
                      icon: BrainCircuit,
                      title: "Deep Academic Research",
                      desc: "Multi-source synthesis with citations & proofs",
                      query: "Perform a deep academic research analysis on modern breakthroughs in quantum computing"
                    }
                  ].map((card, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => executeAgentTask({ query: card.query })}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-red-500/30 text-left transition-all active:scale-[0.98] group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-red-400 group-hover:text-red-300 shrink-0 group-hover:scale-105 transition-transform">
                        <card.icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold text-white group-hover:text-red-400 transition-colors">
                          {card.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                          {card.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ──── CONVERSATION TURNS (User Prompt + AI Response Pairs) ──── */}
            {conversationTurns.map((turn) => (
              <motion.div
                key={turn.turnIndex}
                id={turn.elementId}
                data-turn-index={turn.turnIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="chat-turn-block w-full space-y-4 pt-1"
              >
                {/* ──── USER MESSAGE (Minimalist Right-Aligned Pill) ──── */}
                <div className="w-full flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-2.5 bg-[#181113] border border-red-500/25 text-neutral-100 text-[13.5px] leading-relaxed shadow-sm">
                    {turn.userMessage.attachments && turn.userMessage.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2.5 pb-2 border-b border-white/[0.08]">
                        {turn.userMessage.attachments.map((att, idx) => {
                          if (att.type === "image" && (att.previewUrl || att.base64)) {
                            return (
                              <div
                                key={idx}
                                className="rounded-xl overflow-hidden border border-white/[0.12] bg-neutral-900 w-24 h-24 shrink-0 shadow-sm"
                              >
                                <img
                                  src={att.previewUrl || att.base64}
                                  alt={att.name}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => window.open(att.previewUrl || att.base64, "_blank")}
                                />
                              </div>
                            );
                          }

                          if (att.type === "youtube") {
                            const vidId = att.videoId || (att.name ? (att.name.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/) || [])[1] : null);
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-black/40 border border-red-500/30 text-xs text-neutral-200 shadow-sm max-w-sm"
                              >
                                <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-white/[0.08] bg-black">
                                  <img
                                    src={att.thumbnailUrl || (vidId ? `https://img.youtube.com/vi/${vidId}/hqdefault.jpg` : "")}
                                    alt={att.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
                                      <Play size={8} className="fill-white ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="truncate font-medium text-white text-[11.5px]">{att.name}</span>
                                  <span className="text-[10px] text-red-400 font-mono mt-0.5 flex items-center gap-1">
                                    <Youtube size={10} />
                                    <span>Lecture Attached</span>
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // Universal file attachment badge (PDF, Word, Excel, PPTX, Code, Audio, Archive, Text)
                          const meta = getFileFormatMeta(att.name, att.type);
                          const IconComp = meta.icon || FileText;

                          return (
                            <div
                              key={idx}
                              className={cn(
                                "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs text-neutral-200 shadow-sm",
                                meta.cardClass
                              )}
                            >
                              <div className={cn(
                                "min-w-5 h-5 px-1 rounded-md font-bold text-[9px] flex items-center justify-center border font-mono tracking-tight",
                                meta.badgeClass
                              )}>
                                {meta.label}
                              </div>
                              <div className="flex flex-col min-w-0 max-w-[170px]">
                                <span className="truncate font-medium text-[11.5px] text-neutral-200" title={att.name}>
                                  {att.name}
                                </span>
                                {att.size && (
                                  <span className="text-[9.5px] text-neutral-400 font-mono flex items-center gap-1">
                                    <IconComp size={9} className={meta.iconColor} />
                                    <span>{att.size}</span>
                                    {att.textContent && <span className="text-emerald-400/90 font-sans">• parsed</span>}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{turn.userMessage.text}</p>
                  </div>
                </div>

                {/* ──── AI AGENT RESPONSE (Clean, Apple-Grade Markdown Workspace) ──── */}
                {turn.agentMessage && (
                  <div className="w-full space-y-3">
                    
                    {/* Activity Log (Real Timeline, Live Search Tree, Google Favicons) */}
                    {turn.agentMessage.activityTrace && turn.agentMessage.activityTrace.steps && turn.agentMessage.activityTrace.steps.length > 0 && (
                      <AgentActivityLog
                        activityTrace={turn.agentMessage.activityTrace}
                        isStreaming={isLoading && activeStreamingId === turn.agentMessage.id}
                        onConnectApp={handleConnectAppFromTrace}
                      />
                    )}

                    {/* Apple iOS / macOS Minimalist Capacity Limit Card */}
                    {Boolean(
                      turn.agentMessage.capacityExceeded ||
                      (turn.agentMessage.text && (
                        turn.agentMessage.text.includes("capacity limit reached") ||
                        turn.agentMessage.text.includes("QUOTA_EXCEEDED") ||
                        turn.agentMessage.text.includes("CAPACITY_REACHED") ||
                        turn.agentMessage.text.includes("Study Capacity Reached") ||
                        turn.agentMessage.text.includes("Plan capacity limit reached")
                      ))
                    ) ? (
                      <AppleCapacityExceededCard
                        data={
                          turn.agentMessage.capacityExceeded || {
                            title: "100% Study Capacity Reached",
                            message: "You've processed your full AI allocation for this cycle. Capacity resets automatically or you can upgrade for unlimited workflows.",
                            solution: "Upgrade to Pro Scholar for expanded multi-model reasoning and visual synthesis.",
                            resetsAt: "Tonight at midnight"
                          }
                        }
                      />
                    ) : turn.agentMessage.text ? (
                      <div className="w-full text-neutral-200">
                        {/* 1. Direct Renderer for High-Res Generated AI Image */}
                        {turn.agentMessage.generatedImage && 
                         !turn.agentMessage.text.includes("image-json") && 
                         !turn.agentMessage.text.includes("```image") && (
                          <div className="w-full my-3">
                            <InteractiveImageViewer
                              imageData={turn.agentMessage.generatedImage}
                              imageUrl={turn.agentMessage.generatedImage.imageUrl || turn.agentMessage.generatedImage.dataUrl}
                              prompt={turn.agentMessage.generatedImage.originalPrompt || turn.userMessage?.text || ""}
                              aspectRatio={turn.agentMessage.generatedImage.aspectRatio || turn.userMessage?.imageOptions?.aspectRatio || "1:1"}
                              resolution={turn.agentMessage.generatedImage.resolution || turn.userMessage?.imageOptions?.resolution || "1K"}
                              style={turn.userMessage?.imageOptions?.style || "photorealistic"}
                            />
                          </div>
                        )}

                        {/* Unique Capability Pill on Chat Screen */}
                        {(() => {
                          const capId = turn.agentMessage.capability || turn.userMessage?.capability;
                          const capConfig = AGENT_CAPABILITIES.find(c => c.id === capId);
                          if (!capConfig || capId === "auto") return null;

                          const CapIcon = capConfig.icon || Sparkles;
                          return (
                            <div className="flex items-center gap-2 mb-3 select-none">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-[11.5px] font-medium shadow-[0_0_15px_rgba(239,68,68,0.15)] backdrop-blur-sm">
                                <CapIcon size={13} className="text-red-400" />
                                <span className="font-semibold text-neutral-200">{capConfig.name}</span>
                                <span className="w-1 h-1 rounded-full bg-red-400/60" />
                                <span className="text-[10px] text-neutral-400 font-normal">Active Studio Capability</span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2. Structured Components (Quiz, Slides, Plan, DeepSearch, Web Apps, Whiteboard, or Markdown) */}
                        {(() => {
                          // DeepSearch Autonomous Research Dossier
                          const isDeepSearchMode = (turn.agentMessage.capability === "deepsearch" || turn.userMessage?.capability === "deepsearch");
                          const hasAcademicRefs = !isLoading && (
                            turn.agentMessage.text.includes("## References") || 
                            turn.agentMessage.text.includes("## Sources") || 
                            turn.agentMessage.text.includes("## Verified Sources") || 
                            turn.agentMessage.text.includes("## Bibliography")
                          );
                          if (isDeepSearchMode || (hasAcademicRefs && turn.agentMessage.text.includes("http"))) {
                            return (
                              <InteractiveDeepSearchViewer
                                rawText={turn.agentMessage.text}
                                topic={sessionTitle || "Deep Research Dossier"}
                              />
                            );
                          }

                          // Web Apps Live Interactive Sandbox
                          const isWebAppMode = (turn.agentMessage.capability === "web-apps" || turn.userMessage?.capability === "web-apps");
                          if (isWebAppMode && !isLoading && (turn.agentMessage.text.includes("```html") || turn.agentMessage.text.includes("```web-app") || turn.agentMessage.text.includes("```webapp"))) {
                            const codeMatch = turn.agentMessage.text.match(/```(?:html|web-app|webapp)\s*([\s\S]*?)```/);
                            if (codeMatch) {
                              const introText = turn.agentMessage.text.split(/```(?:html|web-app|webapp)/)[0]?.trim();
                              return (
                                <div className="space-y-4">
                                  {introText && (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm, remarkMath]}
                                      rehypePlugins={[rehypeKatex]}
                                      components={markdownComponents}
                                    >
                                      {introText}
                                    </ReactMarkdown>
                                  )}
                                  <InteractiveWebAppViewer code={codeMatch[1]} title={sessionTitle || "Interactive Web Application"} />
                                </div>
                              );
                            }
                          }

                          // Whiteboard / Architecture Diagram
                          const isWhiteboardMode = (turn.agentMessage.capability === "whiteboard" || turn.userMessage?.capability === "whiteboard");
                          if (isWhiteboardMode && !isLoading && turn.agentMessage.text.includes("```mermaid")) {
                            const codeMatch = turn.agentMessage.text.match(/```mermaid\s*([\s\S]*?)```/);
                            if (codeMatch) {
                              const introText = turn.agentMessage.text.split(/```mermaid/)[0]?.trim();
                              return (
                                <div className="space-y-4">
                                  {introText && (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm, remarkMath]}
                                      rehypePlugins={[rehypeKatex]}
                                      components={markdownComponents}
                                    >
                                      {introText}
                                    </ReactMarkdown>
                                  )}
                                  <InteractiveWhiteboardViewer chart={codeMatch[1]} title={sessionTitle || "System Architecture & Topology"} />
                                </div>
                              );
                            }
                          }

                          const autoQuiz = !isLoading ? parseMarkdownQuiz(turn.agentMessage.text) : null;
                          if (autoQuiz) {
                            const introText = turn.agentMessage.text.split(/(?:###?\s*)?(?:\*\*)?Question\s*1/i)[0]?.trim();
                            return (
                              <div className="space-y-3">
                                {introText && (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={markdownComponents}
                                  >
                                    {introText}
                                  </ReactMarkdown>
                                )}
                                <InteractiveQuizViewer questions={autoQuiz} topic={sessionTitle} />
                              </div>
                            );
                          }

                          const autoSlides = !isLoading ? parseMarkdownSlides(turn.agentMessage.text) : null;
                          if (autoSlides) {
                            const introText = turn.agentMessage.text.split(/(?:###?\s*)?(?:\*\*)?Slide\s+1/i)[0]?.trim();
                            return (
                              <div className="space-y-3">
                                {introText && (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={markdownComponents}
                                  >
                                    {introText}
                                  </ReactMarkdown>
                                )}
                                <InteractiveSlidesViewer slides={autoSlides} topic={sessionTitle} />
                              </div>
                            );
                          }

                          const autoPlan = !isLoading ? parseMarkdownPlan(turn.agentMessage.text) : null;
                          if (autoPlan) {
                            const introText = turn.agentMessage.text.split(/(?:###?\s*)?(?:\*\*)?(?:Phase|Module|Week|Sprint|Step)\s+1/i)[0]?.trim();
                            return (
                              <div className="space-y-3">
                                {introText && (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={markdownComponents}
                                  >
                                    {introText}
                                  </ReactMarkdown>
                                )}
                                <InteractivePlanViewer phases={autoPlan} topic={sessionTitle} />
                              </div>
                            );
                          }

                          const autoNews = !isLoading ? parseNewsData(turn.agentMessage.text) : null;
                          if (autoNews && autoNews.length > 0) {
                            const introMatch = turn.agentMessage.text.split(/```(?:news|news-json|news-briefing|breaking-news|json)?\s*\[/i);
                            const introText = introMatch[0]?.trim();
                            const postMatch = turn.agentMessage.text.split(/\]\s*```/);
                            const postText = postMatch.length > 1 ? postMatch.slice(1).join("]").trim() : "";

                            return (
                              <div className="space-y-4">
                                {introText && (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={markdownComponents}
                                  >
                                    {introText}
                                  </ReactMarkdown>
                                )}
                                <InteractiveNewsViewer newsItems={autoNews} topic={sessionTitle || "Top Stories"} />
                                {postText && (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={markdownComponents}
                                  >
                                    {postText}
                                  </ReactMarkdown>
                                )}
                              </div>
                            );
                          }

                          const isYtMode = (turn.agentMessage.capability === "youtube-notes" || turn.userMessage?.capability === "youtube-notes");
                          if (isYtMode && !isLoading && (turn.agentMessage.text.includes("```youtube-notes") || turn.agentMessage.text.includes("```json") || turn.agentMessage.text.includes("chapters"))) {
                            const codeMatch = turn.agentMessage.text.match(/```(?:youtube-notes|yt-notes|youtube|json)\s*([\s\S]*?)```/);
                            if (codeMatch) {
                              try {
                                const parsedYt = JSON.parse(codeMatch[1]);
                                if (parsedYt && (parsedYt.chapters || parsedYt.summary)) {
                                  return <InteractiveYouTubeNotesViewer data={parsedYt} />;
                                }
                              } catch {}
                            }
                          }

                          const rawText = turn.agentMessage.text || "";
                          const cleanText = turn.agentMessage.generatedImage
                            ? rawText.replace(/```image-json[\s\S]*?```/gi, "").trim()
                            : rawText;

                          if (!cleanText) return null;

                          return (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={markdownComponents}
                            >
                              {cleanText}
                            </ReactMarkdown>
                          );
                        })()}

                        {/* 3. Active Image Generation Loading State (ONLY while streaming AND image not yet available) */}
                        {isLoading && activeStreamingId === turn.agentMessage.id &&
                          !turn.agentMessage.generatedImage &&
                          !turn.agentMessage.text.includes("image-json") &&
                          (turn.agentMessage.capability === "image" ||
                           turn.agentMessage.activityTrace?.steps?.some(s => s.tool === "QWEN_IMAGE_3" || s.phase === "generating_image")) && (() => {
                            const stepImgGen = turn.agentMessage?.activityTrace?.steps?.find(s => s.tool === "QWEN_IMAGE_3" || s.label?.includes("Image ("));
                            const aspectMatch = stepImgGen?.label?.match(/\(([\d:]+)\)/);
                            const resMatch = stepImgGen?.label?.match(/(\d+K)/i);
                            const targetAspectRatio = turn.userMessage?.imageOptions?.aspectRatio || 
                                                      turn.agentMessage?.imageOptions?.aspectRatio || 
                                                      (aspectMatch ? aspectMatch[1] : null) || 
                                                      "1:1";
                            const targetResolution = turn.userMessage?.imageOptions?.resolution || 
                                                     turn.agentMessage?.imageOptions?.resolution || 
                                                     (resMatch ? resMatch[1].toUpperCase() : null) || 
                                                     "1K";
                            return (
                              <div className="w-full my-4">
                                <InteractiveImageViewer
                                  loading={true}
                                  prompt={turn.userMessage.text}
                                  aspectRatio={targetAspectRatio}
                                  resolution={targetResolution}
                                  style={turn.userMessage?.imageOptions?.style || "photorealistic"}
                                />
                              </div>
                            );
                          })()}
                      </div>
                    ) : (
                      isLoading && activeStreamingId === turn.agentMessage.id && (() => {
                        const stepImgGen = turn.agentMessage?.activityTrace?.steps?.find(s => s.tool === "QWEN_IMAGE_3" || s.label?.includes("Image ("));
                        const aspectMatch = stepImgGen?.label?.match(/\(([\d:]+)\)/);
                        const resMatch = stepImgGen?.label?.match(/(\d+K)/i);
                        const targetAspectRatio = turn.userMessage?.imageOptions?.aspectRatio || 
                                                  turn.agentMessage?.imageOptions?.aspectRatio || 
                                                  (aspectMatch ? aspectMatch[1] : null) || 
                                                  "1:1";
                        const targetResolution = turn.userMessage?.imageOptions?.resolution || 
                                                 turn.agentMessage?.imageOptions?.resolution || 
                                                 (resMatch ? resMatch[1].toUpperCase() : null) || 
                                                 "1K";

                        if (turn.agentMessage?.generatedImage) {
                          return (
                            <div className="w-full my-4">
                              <InteractiveImageViewer
                                imageData={turn.agentMessage.generatedImage}
                                aspectRatio={turn.agentMessage.generatedImage.aspectRatio || targetAspectRatio}
                                resolution={turn.agentMessage.generatedImage.resolution || targetResolution}
                                style={turn.userMessage?.imageOptions?.style || "photorealistic"}
                              />
                            </div>
                          );
                        }

                        if (turn.agentMessage?.capability === "image" ||
                            turn.agentMessage?.activityTrace?.steps?.some(s => s.tool === "QWEN_IMAGE_3" || s.phase === "generating_image")) {
                          return (
                            <div className="w-full my-4">
                              <InteractiveImageViewer
                                loading={true}
                                prompt={turn.userMessage.text}
                                aspectRatio={targetAspectRatio}
                                resolution={targetResolution}
                                style={turn.userMessage?.imageOptions?.style || "photorealistic"}
                              />
                            </div>
                          );
                        }

                        return (
                          <div className="flex items-center gap-2 text-xs text-neutral-400 py-2 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            <span>Generating response...</span>
                          </div>
                        );
                      })()
                    )}

                    {/* Sleek Action Bar Matching Reference Screenshot */}
                    {turn.agentMessage.text && (
                      <div className="pt-2.5 flex items-center gap-1.5 text-neutral-400 relative">
                        {/* 1. Copy Clean Plain Text (Strips markdown # and *) */}
                        <button
                          type="button"
                          onClick={() => handleCopyCleanText(turn.agentMessage?.text || "", turn.agentMessage?.id || "")}
                          className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                          title="Copy clean text"
                        >
                          {copiedId === turn.agentMessage?.id ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>

                        {/* 2. Feedback (Thumbs Up / Down) */}
                        <button
                          type="button"
                          onClick={() => handleRate(turn.agentMessage!.id, "up")}
                          className={cn(
                            "p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer",
                            ratedMessages[turn.agentMessage.id] === "up" && "text-emerald-400 bg-emerald-500/10"
                          )}
                          title="Good response"
                        >
                          <ThumbsUp size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRate(turn.agentMessage!.id, "down")}
                          className={cn(
                            "p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer",
                            ratedMessages[turn.agentMessage.id] === "down" && "text-rose-400 bg-rose-500/10"
                          )}
                          title="Bad response"
                        >
                          <ThumbsDown size={14} />
                        </button>

                        {/* 3. Share Response */}
                        <button
                          type="button"
                          onClick={handleShare}
                          className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                          title="Share response link"
                        >
                          <Share2 size={14} />
                        </button>

                        {/* 4. Regenerate / Retry in Rounded Squircle Box */}
                        <button
                          type="button"
                          onClick={() => executeAgentTask({ query: turn.userMessage.text })}
                          disabled={isLoading}
                          className="p-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] text-neutral-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                          title="Regenerate response"
                        >
                          <RotateCcw size={14} className={cn(isLoading && activeStreamingId === turn.agentMessage.id && "animate-spin")} />
                        </button>

                        {/* 5. More Options (...) Popover */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenMoreMenuId(openMoreMenuId === turn.agentMessage?.id ? null : turn.agentMessage?.id || null)}
                            className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="More actions"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          <AnimatePresence>
                            {openMoreMenuId === turn.agentMessage?.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute left-0 bottom-full mb-1.5 w-52 rounded-xl bg-[#14141a]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl p-1.5 z-40 space-y-0.5"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMoreMenuId(null);
                                    handleExecuteComposioAction("WHITEBOARD_SYNC_CANVAS", {
                                      title: sessionTitle,
                                      prompt: sessionTitle
                                    });
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                                >
                                  <PenTool size={13} className="text-violet-400" />
                                  <span>Draw in Whiteboard</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMoreMenuId(null);
                                    handleExecuteComposioAction("GOOGLECALENDAR_CREATE_EVENT", {
                                      title: `Study: ${sessionTitle.slice(0, 30)}`,
                                      details: turn.agentMessage?.text?.slice(0, 300)
                                    });
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                                >
                                  <Zap size={13} className="text-blue-400" />
                                  <span>Add to Calendar</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMoreMenuId(null);
                                    router.push("/presentation-generator");
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                                >
                                  <Presentation size={13} className="text-orange-400" />
                                  <span>Convert to Slide Deck</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMoreMenuId(null);
                                    handleExportMarkdown();
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                                >
                                  <Download size={13} className="text-neutral-400" />
                                  <span>Export as Markdown</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Follow-up suggestion pills — Sleek Apple/Perplexity Horizontal Carousel */}
                    {turn.agentMessage.suggestions && turn.agentMessage.suggestions.length > 0 && (
                      <div className="pt-2.5 w-full overflow-x-auto no-scrollbar scroll-fade-x">
                        <div className="flex items-center gap-2 pb-1 pr-6 min-w-max">
                          {turn.agentMessage.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => executeAgentTask({ query: sug })}
                              className="whitespace-nowrap inline-flex items-center gap-1.5 text-[12px] px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/[0.08] hover:border-red-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm group font-medium"
                            >
                              <Sparkles size={11} className="text-red-400 opacity-80 group-hover:opacity-100 shrink-0" />
                              <span>{sug}</span>
                              <span className="text-neutral-500 group-hover:text-red-400 transition-colors ml-0.5 font-mono text-[11px]">→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </motion.div>
            ))}

          </div>

          {/* ──── SIDE AUTO-SCROLL SCRUBBER & TURN NAVIGATION TRACK (Only show when multiple turns exist) ──── */}
          {conversationTurns.length > 1 && (
            <div className="hidden md:flex flex-col items-center justify-center pr-3 py-6 shrink-0 select-none z-20">
              <div className="relative py-2.5 px-1.5 flex flex-col items-center gap-2 bg-[#0e0e14]/70 border border-white/[0.06] backdrop-blur-md rounded-full shadow-lg">
                {conversationTurns.map((turn, idx) => {
                  const isActive = activeTurnIndex === idx;
                  const isHovered = hoveredTurnIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="relative flex items-center justify-center"
                      onMouseEnter={() => setHoveredTurnIndex(idx)}
                      onMouseLeave={() => setHoveredTurnIndex(null)}
                    >
                      {/* Horizontal Tick Bar Indicator */}
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(turn.elementId);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className={cn(
                          "h-[2px] rounded-full transition-all duration-200 cursor-pointer block",
                          isActive
                            ? "w-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-x-125"
                            : "w-2.5 bg-neutral-600 hover:bg-neutral-300 hover:w-3.5"
                        )}
                      />

                      {/* Hover Tooltip Popover (Floating Left) */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, x: -8, scale: 0.96 }}
                            animate={{ opacity: 1, x: -16, scale: 1 }}
                            exit={{ opacity: 0, x: -8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-full top-1/2 -translate-y-1/2 w-64 rounded-xl bg-[#14141a]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl p-2.5 z-50 pointer-events-none text-left"
                          >
                            <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-white/[0.06] pb-1 mb-1 font-mono">
                              <span className="font-semibold text-red-400">TURN #{idx + 1}</span>
                              <span>{turn.userMessage.timestamp}</span>
                            </div>

                            <p className="text-xs font-medium text-white line-clamp-2">
                              &ldquo;{turn.userMessage.text}&rdquo;
                            </p>

                            {turn.agentMessage?.text && (
                              <p className="text-[10.5px] text-neutral-300 line-clamp-2 mt-1 leading-relaxed">
                                {stripMarkdown(turn.agentMessage.text).slice(0, 110)}...
                              </p>
                            )}

                            <div className="text-[9px] text-neutral-500 pt-1 mt-1 border-t border-white/[0.04] flex items-center justify-between">
                              <span>Click to jump</span>
                              {isActive && <span className="text-emerald-400 font-semibold">Current view</span>}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floating Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollBottomPill && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                type="button"
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-4 right-8 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-850 border border-white/[0.1] text-xs text-neutral-200 shadow-xl flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer hover:text-white z-20"
              >
                <span>Latest</span>
                <ArrowDown size={12} className="animate-bounce" />
              </motion.button>
            )}
          </AnimatePresence>

        </div>

        {/* ──── BOTTOM FLOATING INPUT BAR (CLEAN, NO BACKGROUND STRIP) ──── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="px-2.5 pb-2 pt-1 sm:px-6 sm:pb-3 max-w-4xl w-full mx-auto z-20 shrink-0 bg-transparent"
          style={{ paddingBottom: "max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.375rem))" }}
        >
          <AgentPromptInput
            size="compact"
            isLoading={isLoading}
            onOpenIntegrations={() => setIsIntegrationsOpen(true)}
            onSubmit={({ query, model, capability, attachments, imageOptions }) => {
              setActiveModel(model);
              setActiveCapability(capability);
              executeAgentTask({ query, model, capability, attachments, imageOptions });
            }}
          />
        </motion.div>

      </div>

      {/* Production Composio Integrations Modal */}
      <ComposioIntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
      />

      {/* ──── SLIDING LUXURY SIDEBAR / NAVIGATION DRAWER (Reference Image 2) ──── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40"
            />

            {/* Sliding Drawer Container */}
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0e0e14]/98 border-r border-white/[0.09] shadow-2xl z-50 flex flex-col justify-between p-4 backdrop-blur-3xl overflow-hidden font-sans select-none"
            >
              {/* Top & Main Section */}
              <div className="space-y-4 flex flex-col min-h-0 flex-1">
                
                {/* Brand Header + Close */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <Link href="/" className="flex items-center gap-1.5 group">
                    <span className="text-sm font-black italic tracking-tighter uppercase text-white">
                      PAPER<span className="text-red-500">XIFY</span>
                    </span>
                    <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                      AGENT
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Close sidebar"
                  >
                    <PanelLeftClose size={16} />
                  </button>
                </div>

                {/* New Agent Task Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    handleStartNewChat();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>New Agent Task</span>
                </button>

                {/* Search Sessions Input */}
                {recentSessions.length > 2 && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs">
                    <Search size={13} className="text-neutral-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={sessionSearchQuery}
                      onChange={(e) => setSessionSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-white placeholder:text-neutral-500 outline-none"
                    />
                    {sessionSearchQuery && (
                      <X size={12} className="text-neutral-400 hover:text-white cursor-pointer" onClick={() => setSessionSearchQuery("")} />
                    )}
                  </div>
                )}

                {/* Creative Studio Shortcuts */}
                <div className="space-y-1.5">
                  <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Creative Studios
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: "Whiteboard", href: "/whiteboard", icon: PenTool, color: "text-violet-400" },
                      { name: "Slide Deck", href: "/presentation-generator", icon: Presentation, color: "text-orange-400" },
                      { name: "YT Notes", href: "/youtube-to-notes", icon: Youtube, color: "text-red-400" },
                      { name: "Flashcards", href: "/youtube-to-flashcards", icon: Layers, color: "text-blue-400" }
                    ].map((tool, idx) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={idx}
                          href={tool.href}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.05] border border-white/[0.04] transition-colors"
                        >
                          <Icon size={13} className={tool.color} />
                          <span className="truncate text-[11px] font-medium">{tool.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Chats History (Reference Image 2) */}
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5 flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Recent Chats
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {recentSessions.length}
                    </span>
                  </div>

                  <div className="space-y-1 overflow-y-auto custom-scrollbar pr-1 flex-1">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-6 text-xs text-neutral-500">
                        {sessionSearchQuery ? "No matching chats" : "No recent chats yet"}
                      </div>
                    ) : (
                      filteredSessions.map((s, idx) => {
                        const isCurrent = s.slug === slug;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setIsSidebarOpen(false);
                              router.push(`/workspace/${s.slug}`);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer group relative",
                              isCurrent 
                                ? "bg-neutral-800/90 text-white font-medium border border-white/[0.09] shadow-sm" 
                                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                              <MessageSquare size={13} className={cn("shrink-0", isCurrent ? "text-red-400" : "text-neutral-500 group-hover:text-neutral-300")} />
                              <span className="truncate text-[11.5px]">{s.title}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteSession(s.slug, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/[0.1] text-neutral-500 hover:text-red-400 transition-opacity"
                              title="Delete chat"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsIntegrationsOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <Zap size={14} className="text-red-400" />
                  <span>Connected Tools</span>
                </button>

                <Link
                  href="/"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Return to Home</span>
                </Link>
              </div>

            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Auth Login Modal */}
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          if (pendingAgentTask) {
            executeAgentTask(pendingAgentTask);
            setPendingAgentTask(null);
          }
        }}
      />

    </div>
  );
}
