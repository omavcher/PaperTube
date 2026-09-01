"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Workflow,
  Network,
  GitFork,
  Layout,
  Layers,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";

export interface AgenticAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGenerate?: (params: { prompt: string; diagramType: string; insertMode: "append" | "replace" }) => void;
  onInsertElements?: (elements: any[], mode: "append" | "replace", title?: string) => void;
  theme?: "dark" | "light";
}

const DIAGRAM_TYPES = [
  { id: "architecture", label: "Architecture", icon: Cpu, desc: "System tiers, microservices, cloud infra" },
  { id: "flowchart", label: "Flowchart", icon: Workflow, desc: "Decision logic, business workflows" },
  { id: "mindmap", label: "Mind Map", icon: Network, desc: "Brainstorming, concept clusters" },
  { id: "sequence", label: "Sequence", icon: GitFork, desc: "API requests, actor interactions" },
  { id: "wireframe", label: "UI Wireframe", icon: Layout, desc: "Landing pages, dashboard layout" },
  { id: "er", label: "Database ERD", icon: Database, desc: "Relational tables, schema keys" },
];

const SUGGESTIONS = [
  { type: "architecture", label: "E-Commerce Microservices", prompt: "Design a scalable E-Commerce Microservices Architecture with API Gateway, Auth Service, Product Catalog, Redis Cache, Stripe Payments, Kafka Event Bus, and PostgreSQL Database." },
  { type: "flowchart", label: "JWT Auth & Refresh Flow", prompt: "Create a complete User Authentication Flow with Access Token validation, 401 interceptor, Token Refresh with cookie, and Fallback Redirect to Login." },
  { type: "sequence", label: "Payment Webhook Lifecycle", prompt: "Sequence diagram for Razorpay/Stripe checkout session creation, client redirect, webhook event delivery, signature verification, and order fulfillment." },
  { type: "mindmap", label: "Full-Stack Web Dev Roadmap", prompt: "Mind map breaking down modern Full-Stack Web Development: Frontend (React, Next.js, Tailwind), Backend (Node, Express, GraphQL), Database (Postgres, Mongo, Redis), DevOps (Docker, CI/CD, AWS)." },
  { type: "wireframe", label: "SaaS Analytics Dashboard", prompt: "High-level wireframe for a SaaS Analytics Dashboard with Left Sidebar, KPI metric cards row, Main Line Chart, Recent Transactions table, and Header navigation." },
  { type: "er", label: "User & Orders Database ERD", prompt: "Entity Relationship diagram with users, orders, order_items, products, payments, and addresses tables with foreign keys and relationships." },
];

export function AgenticAIPanel({
  isOpen,
  onClose,
  onStartGenerate,
  theme = "dark",
}: AgenticAIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState("architecture");
  const [insertMode, setInsertMode] = useState<"append" | "replace">("append");

  const handleGenerate = (customPrompt?: string) => {
    const textToSubmit = (customPrompt || prompt).trim();
    if (!textToSubmit) {
      toast.error("Please describe the diagram you want to generate.");
      return;
    }

    onClose();
    if (onStartGenerate) {
      onStartGenerate({
        prompt: textToSubmit,
        diagramType: selectedType,
        insertMode,
      });
    }
  };

  const handleSuggestionClick = (item: typeof SUGGESTIONS[0]) => {
    setSelectedType(item.type);
    setPrompt(item.prompt);
    handleGenerate(item.prompt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="w-full max-w-2xl bg-[#0d0d0d] border border-violet-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(139,92,246,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">Agentic Whiteboard AI</h3>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400">
                      AGENT 2.0
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Generate architectures, mind maps, user flows & wireframes directly onto canvas
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 no-scrollbar">
              {/* 1. Diagram Type Selector */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">
                  Select Diagram Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIAGRAM_TYPES.map((dt) => {
                    const Icon = dt.icon;
                    const isSelected = selectedType === dt.id;
                    return (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setSelectedType(dt.id)}
                        className={cn(
                          "flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer",
                          isSelected
                            ? "bg-violet-500/15 border-violet-500/50 shadow-[inset_0_0_15px_rgba(139,92,246,0.15)] text-white"
                            : "bg-[#141414] border-white/[0.05] hover:border-white/20 text-neutral-400 hover:text-neutral-200"
                        )}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                            isSelected
                              ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                              : "bg-white/[0.06] text-neutral-400"
                          )}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-xs font-bold leading-tight", isSelected ? "text-white" : "text-neutral-300")}>
                            {dt.label}
                          </p>
                          <p className="text-[9.5px] text-neutral-500 truncate mt-0.5">{dt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Prompt Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Describe What You Want to Diagram
                  </label>
                  <span className="text-[10px] text-neutral-500">Natural language prompt</span>
                </div>

                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder={`e.g. "Create a modern ${selectedType} diagram showing microservices communicating via event stream with Redis caching and failover..."`}
                    rows={3}
                    className="w-full bg-[#121212] border border-white/[0.08] focus:border-violet-500/60 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              </div>

              {/* 3. Quick Starter Templates */}
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                  <Lightbulb size={12} className="text-amber-400" />
                  <span>Popular Architectures & Templates</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(item)}
                      className="px-2.5 py-1 rounded-xl bg-[#141414] hover:bg-violet-500/10 border border-white/[0.06] hover:border-violet-500/30 text-[11px] font-medium text-neutral-300 hover:text-violet-300 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles size={10} className="text-violet-400" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Canvas Insert Mode */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-xs">
                <span className="text-neutral-400 font-medium">Placement Mode:</span>
                <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setInsertMode("append")}
                    className={cn(
                      "px-3 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer",
                      insertMode === "append"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    Add to Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertMode("replace")}
                    className={cn(
                      "px-3 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer",
                      insertMode === "replace"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    Replace Canvas
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between shrink-0">
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <span>Press Ctrl + Enter to generate directly onto canvas</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim()}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer",
                    !prompt.trim()
                      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] active:scale-95"
                  )}
                >
                  <Sparkles size={14} className="animate-pulse" />
                  <span>Generate on Canvas</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
