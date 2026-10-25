"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  PenTool, 
  Maximize2, 
  Minimize2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Layers,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { MermaidViewer } from "./MermaidViewer";

interface InteractiveWhiteboardViewerProps {
  chart: string;
  title?: string;
  description?: string;
  whiteboardUrl?: string;
}

export function InteractiveWhiteboardViewer({
  chart,
  title = "Architecture & System Diagram",
  description = "Interactive system topology and flowchart designed with autonomous reasoning",
  whiteboardUrl = "/whiteboard"
}: InteractiveWhiteboardViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanChart = chart.replace(/^```mermaid\n?/, "").replace(/```$/, "").trim();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cleanChart);
    setCopied(true);
    toast.success("Mermaid architecture syntax copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) {
      toast.error("Could not capture SVG diagram.");
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-diagram.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded architecture diagram as SVG!");
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

  return (
    <div 
      ref={containerRef}
      className={cn(
        "my-5 rounded-2xl border border-white/[0.08] bg-[#0c0c14]/95 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl font-sans w-full transition-all group",
        isFullscreen ? "fixed inset-0 z-[999999] rounded-none my-0 h-screen flex flex-col" : "relative"
      )}
    >
      {/* ──── TOP HEADER (PAPERXIFY RED & VIOLET WHITEBOARD THEME) ──── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-red-950/25 via-[#0d0d16] to-violet-950/20 border-b border-white/[0.08] text-xs select-none">
        
        {/* Left: Whiteboard Title & Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <PenTool size={13} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-white tracking-tight text-[12.5px] truncate">
              {title}
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[9px] font-bold text-violet-300 shrink-0">
              <Sparkles size={9} />
              EXCALIDRAW COMPATIBLE
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] mr-1">
            <button
              type="button"
              onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.15))}
              title="Zoom Out"
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              <ZoomOut size={12} />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-neutral-400 min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.15))}
              title="Zoom In"
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              <ZoomIn size={12} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              <RotateCcw size={11} />
            </button>
          </div>

          {/* Copy Mermaid Syntax */}
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy Mermaid Syntax"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>

          {/* Download SVG */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            title="Download SVG Diagram"
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

          {/* Open in Paperxify Whiteboard */}
          <Link
            href={whiteboardUrl}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-red-600/20 active:scale-95 ml-1"
          >
            <span>Open in Whiteboard</span>
            <ExternalLink size={11} />
          </Link>
        </div>

      </div>

      {/* ──── DIAGRAM CANVAS AREA (DARK GRID PATTERN) ──── */}
      <div className={cn(
        "relative w-full bg-[#08080d] flex items-center justify-center overflow-auto custom-scrollbar p-4 sm:p-8 min-h-[380px]",
        isFullscreen ? "flex-1" : "max-h-[600px]"
      )}>
        {/* Architectural Subtle Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: "20px 20px"
          }}
        />

        <div 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
          className="transition-transform duration-150 ease-out max-w-full flex items-center justify-center relative z-10"
        >
          <MermaidViewer chart={cleanChart} />
        </div>
      </div>

      {/* ──── FOOTER STATUS BAR ──── */}
      <div className="px-4 py-2 bg-[#090910] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 select-none">
        <span className="text-neutral-400 truncate max-w-md">{description}</span>
        <div className="flex items-center gap-2">
          <Link
            href={whiteboardUrl}
            target="_blank"
            className="sm:hidden text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
          >
            <span>Whiteboard Studio</span>
            <ExternalLink size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}
