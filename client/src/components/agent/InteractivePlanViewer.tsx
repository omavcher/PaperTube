"use client";

import React, { useState } from "react";
import { 
  ListTodo, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flag, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Calendar,
  Layers,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface PlanTask {
  id?: string;
  task: string;
  timeEstimate?: string;
  priority?: "High" | "Medium" | "Low" | "Critical";
  done?: boolean;
}

export interface PlanPhase {
  phase: number | string;
  title: string;
  timeframe?: string;
  objective?: string;
  tasks: PlanTask[];
  deliverables?: string[];
}

interface InteractivePlanViewerProps {
  phases: PlanPhase[];
  topic?: string;
  className?: string;
}

export function InteractivePlanViewer({ phases, topic = "Execution Roadmap", className }: InteractivePlanViewerProps) {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 0: true });
  const [copied, setCopied] = useState(false);

  if (!phases || phases.length === 0) return null;

  // Flatten all tasks to calculate completion progress
  let totalTasksCount = 0;
  phases.forEach((p, pIdx) => {
    p.tasks.forEach((_, tIdx) => {
      totalTasksCount++;
    });
  });

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  const toggleTask = (phaseIdx: number, taskIdx: number) => {
    const key = `${phaseIdx}-${taskIdx}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePhase = (phaseIdx: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseIdx]: !prev[phaseIdx]
    }));
  };

  const handleCopyPlan = () => {
    let text = `# Execution Plan: ${topic}\n\n`;
    phases.forEach((p, idx) => {
      text += `## Phase ${idx + 1}: ${p.title} (${p.timeframe || ""})\n`;
      if (p.objective) text += `*Objective:* ${p.objective}\n`;
      text += `### Milestones:\n`;
      p.tasks.forEach((t, tIdx) => {
        const isDone = completedTasks[`${idx}-${tIdx}`];
        text += `- [${isDone ? "x" : " "}] ${t.task} (${t.timeEstimate || "N/A"})\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Execution plan copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "my-5 rounded-2xl border border-white/[0.08] bg-[#0c0c12]/95 overflow-hidden shadow-2xl backdrop-blur-sm font-sans w-full",
      className
    )}>
      {/* ──── TOP BAR (PAPERXIFY RED & OBSIDIAN ROADMAP THEME) ──── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950/25 via-[#0d0d16] to-[#0c0c14] border-b border-white/[0.08] text-xs select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <ListTodo size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-[13px] tracking-tight">Execution Roadmap</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-neutral-400 truncate max-w-sm">{topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-neutral-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
            {completedCount}/{totalTasksCount} tasks ({progressPercent}%)
          </span>
          <button
            type="button"
            onClick={handleCopyPlan}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-300 hover:text-white transition-all text-[11px] font-medium active:scale-95 cursor-pointer"
            title="Copy Markdown Roadmap"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} className="text-neutral-400" />
                <span className="hidden sm:inline">Copy Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ──── DYNAMIC PROGRESS BAR ──── */}
      <div className="h-1 w-full bg-white/[0.04] overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ──── ROADMAP PHASES LIST ──── */}
      <div className="p-4 sm:p-6 space-y-3.5">
        {phases.map((phase, pIdx) => {
          const isExpanded = expandedPhases[pIdx] !== false;
          const phaseTasksCompleted = phase.tasks.filter((_, tIdx) => completedTasks[`${pIdx}-${tIdx}`]).length;
          const phaseProgress = phase.tasks.length > 0 ? Math.round((phaseTasksCompleted / phase.tasks.length) * 100) : 0;

          return (
            <div 
              key={pIdx}
              className="rounded-xl border border-white/[0.07] bg-[#12121b]/90 overflow-hidden shadow-lg transition-all"
            >
              {/* Phase Header Accordion */}
              <div 
                onClick={() => togglePhase(pIdx)}
                className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer select-none border-b border-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {pIdx + 1}
                  </span>
                  <div>
                    <h4 className="text-[14px] sm:text-[15px] font-semibold text-white tracking-tight flex items-center gap-2">
                      <span>{phase.title}</span>
                      {phase.timeframe && (
                        <span className="text-[11px] font-normal text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.05]">
                          {phase.timeframe}
                        </span>
                      )}
                    </h4>
                    {phase.objective && (
                      <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                        {phase.objective}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {phaseTasksCompleted} / {phase.tasks.length}
                  </span>
                  {isExpanded ? <ChevronDown size={15} className="text-neutral-400" /> : <ChevronRight size={15} className="text-neutral-400" />}
                </div>
              </div>

              {/* Tasks List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 sm:p-4 space-y-2 bg-[#0e0e16]/60"
                  >
                    {phase.tasks.map((taskItem, tIdx) => {
                      const isDone = !!completedTasks[`${pIdx}-${tIdx}`];
                      return (
                        <div
                          key={tIdx}
                          onClick={() => toggleTask(pIdx, tIdx)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-left text-xs sm:text-[13px] transition-all cursor-pointer select-none",
                            isDone 
                              ? "border-emerald-500/40 bg-emerald-950/20 text-neutral-300" 
                              : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] text-neutral-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="shrink-0 p-0.5 text-emerald-400"
                              tabIndex={-1}
                            >
                              {isDone ? <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-500/20" /> : <Circle size={16} className="text-neutral-500" />}
                            </button>
                            <span className={cn("leading-relaxed", isDone && "line-through text-neutral-400")}>
                              {taskItem.task}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {taskItem.timeEstimate && (
                              <span className="flex items-center gap-1 text-[10.5px] text-neutral-400 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.04]">
                                <Clock size={10} />
                                <span>{taskItem.timeEstimate}</span>
                              </span>
                            )}
                            {taskItem.priority && (
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                                taskItem.priority === "Critical" || taskItem.priority === "High" 
                                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                                  : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                              )}>
                                {taskItem.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Deliverables */}
                    {phase.deliverables && phase.deliverables.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center gap-2 text-xs text-neutral-400">
                        <Award size={13} className="text-amber-400 shrink-0" />
                        <span className="font-medium text-neutral-300">Deliverables:</span>
                        <span className="text-neutral-400">{phase.deliverables.join(" • ")}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
