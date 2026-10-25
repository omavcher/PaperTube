"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";
import { 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MermaidViewerProps {
  chart: string;
  className?: string;
}

// Global initialization of mermaid with sleek dark theme and error suppression
if (typeof window !== "undefined") {
  try {
    mermaid.initialize({
      startOnLoad: false,
      suppressErrorRendering: true,
      theme: "dark",
      securityLevel: "loose",
      themeVariables: {
        darkMode: true,
        background: "#121217",
        primaryColor: "#ef4444",
        primaryTextColor: "#f8fafc",
        primaryBorderColor: "#f87171",
        lineColor: "#94a3b8",
        secondaryColor: "#1e1e2d",
        tertiaryColor: "#181824",
        mainBkg: "#181824",
        nodeBorder: "#334155",
        clusterBkg: "#0f172a",
        clusterBorder: "#1e293b",
        defaultLinkColor: "#cbd5e1",
        titleColor: "#f1f5f9",
        edgeLabelBackground: "#1e293b",
        actorBkg: "#1e1e2d",
        actorBorder: "#f87171",
        actorTextColor: "#f8fafc",
        actorLineColor: "#64748b",
        signalColor: "#cbd5e1",
        signalTextColor: "#f8fafc",
        labelBoxBkgColor: "#1e1e2d",
        labelBoxBorderColor: "#334155",
        labelTextColor: "#f8fafc",
        loopTextColor: "#f8fafc",
        noteBorderColor: "#f59e0b",
        noteBkgColor: "#292524",
        noteTextColor: "#fef3c7"
      },
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    });
  } catch (e) {
    // Non-blocking
  }
}

// Remove any stray Mermaid error elements injected into document.body
function cleanupMermaidErrors() {
  if (typeof document !== "undefined") {
    try {
      const errNodes = document.querySelectorAll("[id^='dmermaid'], body > svg, svg[aria-roledescription='error']");
      errNodes.forEach(el => {
        if (el.parentElement === document.body || el.textContent?.includes("Syntax error in text")) {
          el.remove();
        }
      });
    } catch {}
  }
}

export function MermaidViewer({ chart, className }: MermaidViewerProps) {
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, "_");
  const [svgContent, setSvgContent] = useState<string>("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean raw mermaid code
  const cleanChart = (chart || "")
    .trim()
    .replace(/^```mermaid\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  // Detect diagram type
  const diagramType = (() => {
    const first = cleanChart.split("\n")[0].toLowerCase();
    if (first.includes("sequencediagram")) return "Sequence Architecture";
    if (first.includes("flowchart") || first.includes("graph")) return "Flowchart Architecture";
    if (first.includes("classdiagram")) return "Class Topology";
    if (first.includes("statediagram")) return "State Machine";
    if (first.includes("erdiagram")) return "Entity Relationship";
    if (first.includes("gitgraph")) return "Git Workflow";
    if (first.includes("mindmap")) return "Concept Mind Map";
    return "Visual Architecture";
  })();

  useEffect(() => {
    let isMounted = true;
    async function renderDiagram() {
      if (!cleanChart || cleanChart.length < 10) return;

      try {
        cleanupMermaidErrors();
        const isValid = await mermaid.parse(cleanChart).catch(() => false);
        cleanupMermaidErrors();

        if (!isValid) return;

        const renderId = `mm_${uniqueId}_${Date.now()}`;
        const { svg } = await mermaid.render(renderId, cleanChart);
        cleanupMermaidErrors();

        if (isMounted && svg) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err: any) {
        cleanupMermaidErrors();
      }
    }

    const timer = setTimeout(renderDiagram, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      cleanupMermaidErrors();
    };
  }, [cleanChart, uniqueId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cleanChart);
    setCopied(true);
    toast.success("Diagram code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `architecture_diagram_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded SVG diagram!");
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.4));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <>
      <div className={cn(
        "my-4 rounded-2xl border border-white/[0.08] bg-[#0c0c12]/95 overflow-hidden shadow-xl transition-all backdrop-blur-sm",
        className
      )}>
        {/* ──── MINIMALIST TOP TOOLBAR ──── */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500/80 animate-pulse" />
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium text-[12px] tracking-tight">
              <Layers size={13} className="text-red-400 opacity-85" />
              <span>{diagramType}</span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            {!renderError && svgContent && (
              <div className="flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded-lg border border-white/[0.05] text-neutral-400 text-[11px]">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 rounded hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-1 text-[10.5px] font-mono hover:text-white transition-colors cursor-pointer"
                  title="Reset zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 rounded hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn size={12} />
                </button>
              </div>
            )}

            {/* Download SVG */}
            {svgContent && !renderError && (
              <button
                type="button"
                onClick={handleDownloadSVG}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Download SVG"
              >
                <Download size={13} />
              </button>
            )}

            {/* Copy Diagram */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-neutral-400 hover:text-white transition-all cursor-pointer text-[11px]"
              title="Copy diagram markup"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Fullscreen Modal */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Expand fullscreen view"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* ──── CONTENT CANVAS ──── */}
        <div ref={containerRef} className="p-6 sm:p-8 overflow-x-auto custom-scrollbar flex items-center justify-center min-h-[180px] bg-[#09090d]">
          {svgContent ? (
            <div 
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
              className="w-full flex justify-center py-2 select-none [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:filter [&>svg]:drop-shadow-sm"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <div className="flex items-center gap-2 text-neutral-400 text-xs py-8">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              <span>Rendering visual architecture...</span>
            </div>
          )}
        </div>
      </div>

      {/* ──── FULLSCREEN MODAL OVERLAY ──── */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.1]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">{diagramType}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSVG}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-medium transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export SVG</span>
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-neutral-300 hover:text-white transition-all cursor-pointer"
                  title="Close fullscreen"
                >
                  <Minimize2 size={15} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-6 custom-scrollbar">
              {svgContent && (
                <div 
                  className="w-full max-w-5xl flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        body > [id^="dmermaid"],
        body > svg[aria-roledescription="error"],
        #dmermaid,
        .mermaid-error-modal,
        .error-icon,
        .error-text {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
    </>
  );
}
