"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Check, FileText, BarChart, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceDownloadCardProps {
  title: string;
  description: string;
  fileType: "PDF" | "Excel" | "Guide" | "Template";
  fileSize: string;
  downloadUrl: string;
  themeColor: "red" | "green" | "purple" | "cyan";
}

export default function ResourceDownloadCard({
  title,
  description,
  fileType,
  fileSize,
  downloadUrl,
  themeColor,
}: ResourceDownloadCardProps) {
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "completed">("idle");
  const [progress, setProgress] = useState(0);

  const startDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (downloadState !== "idle") return;

    setDownloadState("downloading");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadState("completed");
            // Perform actual dummy download trigger
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", title);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 80);
  };

  const getIcon = () => {
    switch (fileType) {
      case "PDF":
        return <FileText size={22} className="text-red-500" />;
      case "Excel":
        return <BarChart size={22} className="text-green-500" />;
      case "Template":
        return <Calendar size={22} className="text-cyan-500" />;
      default:
        return <ShieldCheck size={22} className="text-purple-500" />;
    }
  };

  const glowStyles = {
    red: "hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    green: "hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
    purple: "hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    cyan: "hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
  };

  const progressBg = {
    red: "bg-red-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
  };

  const badgeColor = {
    PDF: "bg-red-500/10 text-red-400 border-red-500/20",
    Excel: "bg-green-500/10 text-green-400 border-green-500/20",
    Template: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    Guide: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "relative p-6 md:p-8 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col justify-between transition-all duration-500 group overflow-hidden backdrop-blur-md shadow-lg",
        glowStyles[themeColor]
      )}
    >
      {/* Background Subtle Radial Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.01] to-white/0 pointer-events-none" />

      {/* Top section: Header info */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border", badgeColor[fileType])}>
              {fileType}
            </span>
            <span className="text-[9px] font-mono text-neutral-500">{fileSize}</span>
          </div>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight group-hover:text-red-500 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-neutral-400 text-xs mt-3 leading-relaxed font-light">
          {description}
        </p>
      </div>

      {/* Action button section */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <button
          onClick={startDownload}
          disabled={downloadState === "downloading"}
          className={cn(
            "w-full h-12 rounded-xl flex items-center justify-center gap-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 select-none relative overflow-hidden",
            downloadState === "idle" && "bg-neutral-900 border border-white/5 text-white hover:bg-neutral-800",
            downloadState === "downloading" && "bg-neutral-950 text-neutral-500 border border-white/5 cursor-wait",
            downloadState === "completed" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          )}
        >
          {downloadState === "idle" && (
            <>
              <span>Get Free Copy</span>
              <Download size={12} className="group-hover:translate-y-0.5 transition-transform duration-300" />
            </>
          )}

          {downloadState === "downloading" && (
            <div className="relative z-10 flex items-center gap-2">
              <span className="animate-pulse">Downloading {progress}%</span>
            </div>
          )}

          {downloadState === "completed" && (
            <>
              <span>Downloaded Successfully</span>
              <Check size={12} className="text-emerald-400 animate-bounce" />
            </>
          )}

          {/* Progress bar inside button */}
          {downloadState === "downloading" && (
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
              className={cn("absolute left-0 top-0 bottom-0 opacity-15", progressBg[themeColor])}
            />
          )}
        </button>
      </div>
    </motion.div>
  );
}
