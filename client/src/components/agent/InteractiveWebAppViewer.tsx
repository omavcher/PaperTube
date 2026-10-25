"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Globe, 
  Code2, 
  Eye, 
  RotateCcw, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sparkles,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface InteractiveWebAppViewerProps {
  code: string;
  title?: string;
  language?: string;
}

export function InteractiveWebAppViewer({
  code,
  title = "Interactive Web Application",
  language = "html"
}: InteractiveWebAppViewerProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract clean code (stripping markdown fences if present)
  const cleanCode = useMemo(() => {
    let clean = code.trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/```$/, "").trim();
    }
    return clean;
  }, [code]);

  // Construct complete HTML runnable template with modern Tailwind + Inter font
  const fullHtml = useMemo(() => {
    if (cleanCode.includes("<html") || cleanCode.includes("<!DOCTYPE") || cleanCode.includes("<body")) {
      // If code already contains HTML structure, inject modern styles if missing
      if (!cleanCode.includes("tailwindcss") && !cleanCode.includes("<style")) {
        return cleanCode.replace(
          "<head>",
          `<head><script src="https://cdn.tailwindcss.com"></script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;}</style>`
        );
      }
      return cleanCode;
    }

    // Wrap snippet into full responsive dark-friendly modern canvas
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 1rem;
      background-color: #0b0b12;
      color: #f3f4f6;
      min-height: 100vh;
    }
    /* Sleek scrollbar for embedded app */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(239, 68, 68, 0.5); }
  </style>
</head>
<body>
  ${cleanCode}
</body>
</html>`;
  }, [cleanCode, title]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    toast.success("Web app code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded standalone HTML app!");
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case "mobile": return "max-w-[375px]";
      case "tablet": return "max-w-[768px]";
      default: return "w-full";
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "my-5 rounded-2xl border border-white/[0.08] bg-[#0c0c14]/95 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl font-sans w-full transition-all group",
        isFullscreen ? "fixed inset-0 z-[999999] rounded-none my-0 h-screen flex flex-col" : "relative"
      )}
    >
      {/* ──── TOP HEADER TOOLBAR (PAPERXIFY OBSIDIAN & RED THEME) ──── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-red-950/30 via-[#0d0d16] to-[#0d0d16] border-b border-white/[0.08] text-xs select-none">
        
        {/* Left: App Badge & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <Globe size={13} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-white tracking-tight text-[12.5px] truncate">
              {title}
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-[9px] font-bold text-red-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE APP
            </span>
          </div>
        </div>

        {/* Center: Preview vs Code Tabs */}
        <div className="flex items-center p-0.5 rounded-xl bg-black/60 border border-white/[0.08] text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer",
              activeTab === "preview"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Eye size={12} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer",
              activeTab === "code"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Code2 size={12} />
            <span>Code</span>
          </button>
        </div>

        {/* Right: Viewport Controls + Export Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Viewport switcher (Active in Preview tab) */}
          {activeTab === "preview" && (
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] mr-1">
              <button
                type="button"
                onClick={() => setViewportMode("desktop")}
                title="Desktop View (100%)"
                className={cn(
                  "p-1 rounded transition-colors",
                  viewportMode === "desktop" ? "text-red-400 bg-white/[0.08]" : "text-neutral-400 hover:text-white"
                )}
              >
                <Monitor size={12} />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("tablet")}
                title="Tablet View (768px)"
                className={cn(
                  "p-1 rounded transition-colors",
                  viewportMode === "tablet" ? "text-red-400 bg-white/[0.08]" : "text-neutral-400 hover:text-white"
                )}
              >
                <Tablet size={12} />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("mobile")}
                title="Mobile View (375px)"
                className={cn(
                  "p-1 rounded transition-colors",
                  viewportMode === "mobile" ? "text-red-400 bg-white/[0.08]" : "text-neutral-400 hover:text-white"
                )}
              >
                <Smartphone size={12} />
              </button>
            </div>
          )}

          {/* Reload Iframe */}
          {activeTab === "preview" && (
            <button
              type="button"
              onClick={() => setIframeKey(k => k + 1)}
              title="Refresh App"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {/* Open in New Window */}
          <button
            type="button"
            onClick={handleOpenNewTab}
            title="Open Fullscreen in New Window"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
          >
            <ExternalLink size={12} />
          </button>

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>

          {/* Download HTML */}
          <button
            type="button"
            onClick={handleDownload}
            title="Download HTML file"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
          >
            <Download size={12} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>

      </div>

      {/* ──── CONTENT BODY ──── */}
      <div className={cn("relative w-full bg-[#07070b]", isFullscreen ? "flex-1 overflow-hidden" : "")}>
        {activeTab === "preview" ? (
          <div className="w-full flex items-center justify-center p-2 sm:p-4 bg-gradient-to-b from-[#09090f] to-[#060609] min-h-[460px] sm:min-h-[520px]">
            <div className={cn(
              "w-full transition-all duration-300 rounded-xl overflow-hidden border border-white/[0.1] shadow-2xl bg-[#0e0e16]",
              getViewportWidth(),
              isFullscreen ? "h-full min-h-[calc(100vh-80px)]" : "h-[480px] sm:h-[540px]"
            )}>
              <iframe
                key={iframeKey}
                title={title}
                srcDoc={fullHtml}
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                className="w-full h-full border-0 bg-transparent"
              />
            </div>
          </div>
        ) : (
          <div className={cn(
            "w-full overflow-auto custom-scrollbar bg-[#09090e] p-2 sm:p-4 font-mono text-[12.5px]",
            isFullscreen ? "h-[calc(100vh-60px)]" : "max-h-[540px]"
          )}>
            <SyntaxHighlighter
              language={language || "html"}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "transparent",
                fontSize: "12.5px",
                lineHeight: "1.65",
                fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace"
              }}
              showLineNumbers={true}
              lineNumberStyle={{
                minWidth: "2.5em",
                paddingRight: "1em",
                color: "#52525b",
                userSelect: "none"
              }}
            >
              {cleanCode}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* ──── FOOTER STATUS BAR ──── */}
      <div className="px-4 py-2 bg-[#090910] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 font-mono">Tailwind CSS • HTML5 • Responsive Sandbox</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10.5px]">
          <span>{cleanCode.length.toLocaleString()} chars</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-300 uppercase">{viewportMode}</span>
        </div>
      </div>
    </div>
  );
}
