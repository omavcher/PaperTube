"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Search, 
  Globe, 
  Calendar, 
  Mail, 
  FileText, 
  Github, 
  MessageSquare, 
  ExternalLink,
  Zap,
  Terminal,
  Database,
  ArrowUpRight,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AgentSearchItem {
  query: string;
  status: "pending" | "running" | "completed";
  durationMs?: number;
  resultsCount?: number;
}

export interface AgentSourceItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  imageUrl?: string | null;
  sourceType?: string;
  faviconUrl?: string;
  durationMs?: number;
}

export interface AgentActivityStep {
  id: string;
  type?: "phase" | "tool" | "connection" | "search" | "source";
  phase?: string;
  tool?: string;
  label: string;
  app?: string;
  tier?: "read" | "create" | "side_effect";
  status: "pending" | "running" | "completed" | "failed" | "action_required";
  durationMs?: number;
  inputPreview?: string;
  resultSummary?: string;
  connectionUrl?: string;
  appName?: string;
  data?: any;
}

export interface AgentActivityTrace {
  runId?: string;
  title?: string;
  status: "running" | "completed" | "failed";
  startTime?: number;
  endTime?: number;
  totalDurationMs?: number;
  steps: AgentActivityStep[];
  searchQueries?: AgentSearchItem[];
  sources?: AgentSourceItem[];
  stats?: {
    searches?: number;
    tools?: number;
    sources?: number;
    apps?: number;
  };
}

interface AgentActivityLogProps {
  activityTrace: AgentActivityTrace;
  isStreaming?: boolean;
  onConnectApp?: (connectionUrl: string) => void;
  onConfirmAction?: (toolCallId: string, approved: boolean) => void;
  defaultExpanded?: boolean;
}

// Real Official Vector SVG Logos for Integrations
function AppBrandLogo({ app = "", tool = "", className = "w-3.5 h-3.5" }: { app?: string; tool?: string; className?: string }) {
  const a = (app || "").toLowerCase();
  const t = (tool || "").toLowerCase();

  // 1. Gmail (Official Google 4-Color Envelope)
  if (a.includes("gmail") || a.includes("mail") || t.includes("mail")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M22 6L12 13 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z" fill="#EA4335" />
        <path d="M22 6L12 13 2 6 4.3 4.3C4.7 4 5.3 4 5.8 4H18.2C18.7 4 19.3 4 19.7 4.3L22 6Z" fill="#FBBC05" />
        <path d="M2 6L12 13 7 17.5 2 13.5V6Z" fill="#4285F4" />
        <path d="M22 6L12 13 17 17.5 22 13.5V6Z" fill="#34A853" />
      </svg>
    );
  }

  // 2. Google Calendar
  if (a.includes("calendar") || t.includes("calendar")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" fill="#4285F4" />
        <path d="M3 4H21V9H3V4Z" fill="#1A73E8" />
        <rect x="7" y="2" width="2" height="4" rx="1" fill="#EA4335" />
        <rect x="15" y="2" width="2" height="4" rx="1" fill="#EA4335" />
        <text x="12" y="18" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">31</text>
      </svg>
    );
  }

  // 3. Google Drive
  if (a.includes("drive") || t.includes("drive")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M8.5 2.5L2 14H8L14.5 2.5H8.5Z" fill="#0066DA" />
        <path d="M14.5 2.5L21 14H15L8.5 2.5H14.5Z" fill="#00AC47" />
        <path d="M2 14L5.2 19.5C5.7 20.4 6.7 21 7.7 21H16.3C17.3 21 18.3 20.4 18.8 19.5L22 14H2Z" fill="#EA4335" />
        <path d="M8 14H22L18.8 19.5C18.3 20.4 17.3 21 16.3 21H7.7C6.7 21 5.7 20.4 5.2 19.5L2 14H8Z" fill="#FFBA00" />
      </svg>
    );
  }

  // 4. Notion
  if (a.includes("notion") || t.includes("notion")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.458-.84c1.12-.093 1.306-.42 1.306-.98 0-.606-.327-.933-1.027-.886L5.393 2.808c-.7.047-.934.373-.934.84v.56zm.56 2.894v12.27c0 .84.42 1.26 1.213 1.26l11.97-.84c.794-.047 1.168-.513 1.168-1.26V6.26l-14.35.842zm9.894 10.314c0 .467-.28.7-.746.747l-1.354.093c-.467.047-.7-.14-.7-.607l.093-4.527-2.613 4.807c-.187.327-.467.467-.794.467-.326 0-.56-.14-.746-.467l-2.007-3.873v3.78c0 .466-.28.7-.746.746l-1.12.094c-.467.046-.7-.14-.7-.607V9.715c0-.467.28-.7.747-.747l1.493-.093c.467-.047.747.14.934.467l2.8 4.714v-4.48c0-.467.28-.7.747-.747l1.12-.093c.467-.047.7.14.7.607v7.607z" />
      </svg>
    );
  }

  // 5. GitHub
  if (a.includes("github") || t.includes("github")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }

  // 6. Slack
  if (a.includes("slack") || t.includes("slack")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
      </svg>
    );
  }

  // 7. YouTube
  if (a.includes("youtube") || t.includes("youtube")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
      </svg>
    );
  }

  // 8. LinkedIn
  if (a.includes("linkedin") || a.includes("linkdin") || a.includes("linkind") || t.includes("linkedin")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 0 0-1.64 1.64c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64A1.64 1.64 0 0 0 7.83 6.2Z" />
      </svg>
    );
  }

  if (t.includes("search") || a.includes("search") || a.includes("web")) {
    return <Search size={13} className="text-sky-400" />;
  }

  if (t.includes("code") || t.includes("terminal")) {
    return <Terminal size={13} className="text-emerald-400" />;
  }

  return <Zap size={13} className="text-rose-400" />;
}

// Composio Official App Logo with Live CDN + Inline SVG Fallback
// Composio Universal App Logo (Direct CDN across all 1000+ Connectors)
export function ComposioAppLogo({ app = "", tool = "", className = "w-3.5 h-3.5" }: { app?: string; tool?: string; className?: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  
  // Dynamically resolve standard Composio toolkit slug (e.g., "SLACK_SEND_MESSAGE" -> "slack", "LINKEDIN_GET_PROFILE" -> "linkedin")
  const raw = (app || (tool ? tool.split('_')[0] : "")).trim().toLowerCase();
  const slug = raw.replace(/[^a-z0-9_-]/g, "");

  const logoUrl = slug ? `https://logos.composio.dev/api/${slug}` : "";

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={app || tool || "Integration"}
        onError={() => setImgFailed(true)}
        className={cn(className, "object-contain rounded-md shrink-0")}
        loading="lazy"
      />
    );
  }

  return <AppBrandLogo app={app} tool={tool} className={className} />;
}

// Icon helper by tool / app name
function getAppIcon(app: string = "", tool: string = "") {
  return <ComposioAppLogo app={app} tool={tool} className="w-3.5 h-3.5" />;
}

// Source Favicon with rich platform brand icons matching user reference
function SourceFavicon({ domain = "", faviconUrl, title = "" }: { domain: string; faviconUrl?: string; title: string }) {
  const [imgError, setImgError] = useState(false);
  const d = (domain || "").toLowerCase();

  // 1. Reddit (Official Snoo logo on orange circle)
  if (d.includes("reddit.com")) {
    return (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FF4500" />
        <circle cx="8.5" cy="11.5" r="1.3" fill="white" />
        <circle cx="15.5" cy="11.5" r="1.3" fill="white" />
        <ellipse cx="12" cy="14" rx="3" ry="1.2" stroke="white" strokeWidth="1.2" fill="none" />
      </svg>
    );
  }

  // 2. AWS / Amazon (Dark container with orange smile arrow)
  if (d.includes("aws.amazon.com") || d.includes("amazon.com")) {
    return (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#232F3E" />
        <path d="M5.5 15.5C9 18 15 18 18.5 15" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
        <text x="12" y="11" fill="white" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">aws</text>
      </svg>
    );
  }

  // 3. IBM (Dark blue with IBM logo)
  if (d.includes("ibm.com")) {
    return (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#002D9C" />
        <text x="12" y="15" fill="white" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.8">IBM</text>
      </svg>
    );
  }

  // 4. GeeksforGeeks (Green with white brackets)
  if (d.includes("geeksforgeeks.org")) {
    return (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#2F8D46" />
        <text x="12" y="16.5" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">{"{ }"}</text>
      </svg>
    );
  }

  // 5. Postman (Orange circle with Postman logo)
  if (d.includes("postman.com")) {
    return (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FF6C37" />
        <path d="M16 11l-4-3-4 3v4l4-3 4 3v-4z" fill="white" />
        <circle cx="12" cy="7" r="1.3" fill="white" />
      </svg>
    );
  }

  // 6. Wikipedia (White with serif W)
  if (d.includes("wikipedia.org")) {
    return (
      <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-serif font-bold text-[11px] shrink-0">
        W
      </div>
    );
  }

  // 7. GitHub (Dark with white Octocat)
  if (d.includes("github.com")) {
    return (
      <svg className="w-5 h-5 shrink-0 text-white fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }

  // 8. Stack Overflow
  if (d.includes("stackoverflow.com")) {
    return (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#1E1E24" />
        <path d="M6 18h12v-2H6v2zm1-5l10 2 .4-1.9-10-2.1-.4 2zm2.1-4.7l9.3 4.5.9-1.8-9.3-4.5-.9 1.8zm4.3-4.4l7.6 7.6 1.4-1.4-7.6-7.6-1.4 1.4z" fill="#F48024" />
      </svg>
    );
  }

  // 9. YouTube
  if (d.includes("youtube.com")) {
    return (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  // 10. Multi-tier High-Res Google Favicon Fallback
  const letter = (domain || title || "W").charAt(0).toUpperCase();

  if (imgError || (!faviconUrl && !domain)) {
    return (
      <div className="w-5 h-5 rounded-md bg-neutral-800 text-neutral-400 flex items-center justify-center text-[10px] font-bold shrink-0 border border-neutral-700/60">
        {letter}
      </div>
    );
  }

  const src = faviconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <img
      src={src}
      alt={domain}
      onError={() => setImgError(true)}
      className="w-5 h-5 rounded-md shrink-0 object-contain"
    />
  );
}

export function AgentActivityLog({
  activityTrace,
  isStreaming = false,
  onConnectApp,
  onConfirmAction,
  defaultExpanded = false
}: AgentActivityLogProps) {
  const isCompleted = activityTrace.status === "completed";
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ? true : false);

  // Auto-collapse when streaming finishes
  useEffect(() => {
    if (isCompleted && !isStreaming) {
      setIsExpanded(false);
    }
  }, [isCompleted, isStreaming]);

  // Clean and deduplicate steps
  const rawSteps = activityTrace.steps || [];
  const seenPhases = new Set<string>();
  const steps: AgentActivityStep[] = [];

  for (const s of rawSteps) {
    if (s.phase) {
      if (seenPhases.has(s.phase)) continue;
      seenPhases.add(s.phase);
    }
    steps.push(s);
  }

  const searchQueries = activityTrace.searchQueries || [];
  const sources = activityTrace.sources || [];
  const durationSec = activityTrace.totalDurationMs 
    ? (activityTrace.totalDurationMs / 1000).toFixed(1)
    : "3.2";

  // Build high-level badge stats
  const searchCount = activityTrace.stats?.searches || searchQueries.length || 0;
  const sourceCount = activityTrace.stats?.sources || sources.length || 0;
  const toolCount = activityTrace.stats?.tools || 0;

  const statsSummary = [
    searchCount > 0 ? `${searchCount} search${searchCount > 1 ? "es" : ""}` : null,
    sourceCount > 0 ? `${sourceCount} source${sourceCount > 1 ? "s" : ""}` : null,
    toolCount > 0 ? `${toolCount} tool${toolCount > 1 ? "s" : ""}` : null
  ].filter(Boolean).join(" · ");

  // Active running step title
  const activeStep = steps.find(s => s.status === "running");
  const activeStepLabel = activeStep?.label || "Thinking & executing...";

  return (
    <div className="mb-3 max-w-full rounded-2xl border border-white/[0.08] bg-[#0c0c10] hover:bg-[#0f0f14] backdrop-blur-xl shadow-sm transition-all duration-200 overflow-hidden">
      {/* ──── ULTRA-SLEEK COMPACT HEADER BAR ──── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer group select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors",
            isCompleted
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-red-500/20 text-red-400 border border-red-500/40"
          )}>
            {isCompleted ? (
              <Check size={10} className="stroke-[2.5]" />
            ) : (
              <Sparkles size={10} className="animate-spin" />
            )}
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="text-[12.5px] font-semibold text-neutral-200 group-hover:text-white transition-colors">
              {isCompleted ? `Thought for ${durationSec}s` : activeStepLabel}
            </span>

            {statsSummary && (
              <span className="text-[11.5px] text-neutral-400 font-normal hidden sm:inline-block">
                · {statsSummary}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isCompleted && isStreaming && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>Thinking</span>
            </div>
          )}
          <div className="text-neutral-500 group-hover:text-neutral-300 transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* ──── EXPANDED WORK LOG CHECKLIST (Matching User Reference Image) ──── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="border-t border-white/[0.06] bg-black/40 text-xs"
          >
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar px-4 py-3 space-y-3">
              {steps.map((step) => {
                const isStepRunning = step.status === "running";
                const isStepCompleted = step.status === "completed";
                const isStepActionReq = step.status === "action_required";
                const isResearchPhase = step.phase === "research" || step.tool === "WEB_SEARCH";
                const isSourcesPhase = step.phase === "sources";

                return (
                  <div key={step.id} className="group">
                    {/* Checklist Item Row */}
                    <div className="flex items-center gap-2.5">
                      {/* Green Check Circle */}
                      <div className="shrink-0">
                        {isStepCompleted ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                            <Check size={10} className="stroke-[2.5]" />
                          </div>
                        ) : isStepRunning ? (
                          <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          </div>
                        ) : isStepActionReq ? (
                          <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-amber-400">!</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-500 flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-neutral-500" />
                          </div>
                        )}
                      </div>

                      {/* Label + App Badge + Duration */}
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className={cn(
                          "text-[12.5px] font-medium leading-normal",
                          isStepRunning ? "text-red-300 font-semibold" : isStepCompleted ? "text-neutral-200" : "text-neutral-400"
                        )}>
                          {step.label}
                        </span>

                        {step.app && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.07] text-[10px] text-neutral-300 font-mono">
                            <ComposioAppLogo app={step.app} tool={step.tool} className="w-3 h-3" />
                            <span className="capitalize">{step.app}</span>
                          </span>
                        )}

                        {step.durationMs !== undefined && step.durationMs > 0 && (
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {(step.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Clean Result Micro-Chip */}
                    {step.resultSummary && (
                      <div className="text-[11px] text-neutral-400 bg-white/[0.02] border border-white/[0.05] rounded-md px-2.5 py-1 mt-1.5 ml-6 font-mono truncate max-w-full">
                        <span className="text-emerald-400 font-medium">✓ </span>
                        {step.resultSummary.replace(/^✓\s*/, "")}
                      </div>
                    )}

                    {/* ──── NESTED SEARCH SUB-TREE (Sleek Search Query Pills) ──── */}
                    {isResearchPhase && searchQueries.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-6">
                        {searchQueries.map((sq, idx) => {
                          const cleanQuery = sq.query.replace(/^["']|["']$/g, "");
                          return (
                            <div 
                              key={idx} 
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141418] border border-white/[0.08] hover:border-white/[0.2] text-[11.5px] text-neutral-300 transition-colors shadow-xs group/query"
                            >
                              {sq.status === "completed" ? (
                                <Search size={11} className="text-sky-400/90 shrink-0" />
                              ) : sq.status === "running" ? (
                                <Loader2 size={11} className="text-red-400 animate-spin shrink-0" />
                              ) : (
                                <Search size={11} className="text-sky-400/90 shrink-0" />
                              )}
                              <span className="font-sans text-neutral-300 group-hover/query:text-white">
                                "{cleanQuery}"
                              </span>
                              {sq.durationMs !== undefined && sq.durationMs > 0 && (
                                <span className="text-[10.5px] text-neutral-500 font-mono ml-0.5">
                                  {(sq.durationMs / 1000).toFixed(1)}s
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ──── NESTED SOURCE CARDS (Grid Matching User Reference Image) ──── */}
                    {isSourcesPhase && sources.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2.5 ml-6">
                        {sources.map((src, idx) => (
                          <a
                            key={src.id || idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/card flex items-center justify-between p-2.5 rounded-xl bg-[#121217] hover:bg-[#181820] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-150 text-left shadow-xs cursor-pointer min-w-0"
                            title={src.title}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* Brand Logo / Favicon */}
                              <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                <SourceFavicon domain={src.domain} faviconUrl={src.faviconUrl} title={src.title} />
                              </div>

                              {/* Title + Domain */}
                              <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-semibold text-neutral-200 group-hover/card:text-white truncate leading-tight">
                                  {src.title || src.domain}
                                </p>
                                <p className="text-[11px] text-neutral-500 truncate mt-0.5 leading-none">
                                  {src.domain || "source"}
                                </p>
                              </div>
                            </div>

                            {/* External Link Arrow */}
                            <ArrowUpRight size={13} className="text-neutral-500 group-hover/card:text-neutral-200 shrink-0 ml-2 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Action Required: OAuth Connection Card */}
                    {isStepActionReq && step.connectionUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 3, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 ml-6 p-2.5 rounded-xl border border-white/[0.08] bg-[#111116] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-md"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center p-1 shrink-0">
                            <ComposioAppLogo app={step.app || step.appName} tool={step.tool} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white text-xs tracking-tight">
                                Connect {step.appName || "Account"}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <p className="text-[10.5px] text-neutral-400 truncate mt-0.2">
                              Authorize Paperxify to interact with {step.appName || "tool"}.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onConnectApp && step.connectionUrl) {
                              onConnectApp(step.connectionUrl);
                            } else if (step.connectionUrl) {
                              const width = 600;
                              const height = 720;
                              const left = window.screen.width / 2 - width / 2;
                              const top = window.screen.height / 2 - height / 2;
                              window.open(step.connectionUrl, `Connect${step.appName || "App"}`, `width=${width},height=${height},top=${top},left=${left}`);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer shrink-0"
                        >
                          <span>Connect {step.appName || "App"}</span>
                          <ArrowUpRight size={11} className="stroke-[2.5]" />
                        </button>
                      </motion.div>
                    )}

                    {/* Action Required: Side-Effect Safety Confirmation */}
                    {step.tier === "side_effect" && step.status === "action_required" && !step.connectionUrl && (
                      <div className="mt-2 ml-6 p-2.5 rounded-xl border border-white/[0.08] bg-[#141419] flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-red-400 font-semibold text-xs">
                          <ShieldAlert size={13} />
                          <span>Action Confirmation Required</span>
                        </div>
                        <p className="text-[10.5px] text-neutral-300">
                          The agent is ready to execute: <span className="font-mono text-white">{step.inputPreview || step.label}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <button
                            type="button"
                            onClick={() => onConfirmAction && onConfirmAction(step.id, false)}
                            className="px-2.5 py-0.5 rounded-md border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => onConfirmAction && onConfirmAction(step.id, true)}
                            className="px-3 py-0.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold"
                          >
                            Confirm & Execute
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
