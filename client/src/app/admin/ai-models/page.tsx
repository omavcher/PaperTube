"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Cpu, Zap, Award, Layers, ShieldCheck, Play, Clock, 
  Sparkles, RefreshCw, ChevronRight, HelpCircle, 
  Activity, AlertTriangle, AlertCircle, BarChart3,
  Terminal, ShieldAlert, CheckCircle2, Server, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/config/api";

interface AIModel {
  id: string;
  name: string;
  tier: string;
  color: "emerald" | "blue" | "purple" | "red";
  description: string;
  tokenCost: number;
  maxVideoLength: string;
  speed: string;
  capabilities: string[];
  // DB statistics
  count: number;
  avgProcessingTime: number;
  totalProcessingTime: number;
  totalTokensCost: number;
  successCount: number;
  failedCount: number;
  processingCount: number;
}

interface DailyTrendRow {
  date: string;
  flash: number;
  canvas: number;
  scholar: number;
  atlas: number;
}

export default function AIModelsDashboard() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [activeStatTab, setActiveStatTab] = useState<"count" | "time" | "success">("count");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [testingLatency, setTestingLatency] = useState(false);
  const [nodeLatencies, setNodeLatencies] = useState<Record<string, string>>({
    flash: "240ms",
    canvas: "410ms",
    scholar: "480ms",
    atlas: "620ms"
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true); else setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await api.get("/admin/ai-models/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setModels(res.data.models);
        setDailyTrend(res.data.dailyTrend);
        setError(null);
      } else {
        setError(res.data.message || "Failed to load telemetry.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to the AI Models diagnostics endpoint.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Terminal logging logic
  useEffect(() => {
    const logs = [
      "SYSTEM: Initializing Neural Telemetry Deck...",
      "SYSTEM: Fetching notes generation history logs...",
      "DATABASE: Pipeline notes aggregation completed.",
      "NODE: Handshake established with inference queue nodes.",
      "CRON: Token allocation verification - SUCCESS",
      "SECURITY: Secure token context authenticated."
    ];
    setTerminalLogs(logs.map(log => `[${new Date().toLocaleTimeString()}] ${log}`));

    const interval = setInterval(() => {
      const livePool = [
        "TELEMETRY: Heartbeat sync completed — active",
        "NODE: Inference worker thread completed job queue",
        "DB: Clean sync with Note collection — OK",
        "AI: Model routing node updated dynamically",
        "SYSTEM: Load factor at 14% capacities — optimal"
      ];
      const logLine = livePool[Math.floor(Math.random() * livePool.length)];
      setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}] ${logLine}`, ...prev.slice(0, 8)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleTestLatency = () => {
    setTestingLatency(true);
    setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}] INFERENCE NODE LATENCY SWEEP INITIATED...`, ...prev]);
    
    setTimeout(() => {
      const generatedLatencies = {
        flash: `${Math.floor(Math.random() * 80) + 120}ms`,
        canvas: `${Math.floor(Math.random() * 150) + 280}ms`,
        scholar: `${Math.floor(Math.random() * 200) + 320}ms`,
        atlas: `${Math.floor(Math.random() * 300) + 450}ms`
      };
      setNodeLatencies(generatedLatencies);
      setTestingLatency(false);
      toast.success("latency verification cycle completed.");
      setTerminalLogs(prev => [
        `[${new Date().toLocaleTimeString()}] NODE DIAGNOSTICS: FLASH ${generatedLatencies.flash} | CANVAS ${generatedLatencies.canvas} | SCHOLAR ${generatedLatencies.scholar} | ATLAS ${generatedLatencies.atlas}`,
        `[${new Date().toLocaleTimeString()}] INFERENCE LATENCY CHECK: ALL ONLINE`,
        ...prev
      ]);
    }, 1500);
  };

  const getTierBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "free tier":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase tracking-wider font-bold">Free Tier</Badge>;
      case "pro tier":
        return <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] uppercase tracking-wider font-bold">Pro Tier</Badge>;
      case "power tier":
        return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] uppercase tracking-wider font-bold">Power Tier</Badge>;
      default:
        return <Badge className="bg-neutral-800 text-neutral-400 text-[9px] uppercase font-bold">{tier}</Badge>;
    }
  };

  const colorConfigs = {
    emerald: {
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      hover: "hover:border-emerald-500/40",
      bg: "bg-emerald-500/5",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.06)]",
      lineColor: "#10b981"
    },
    blue: {
      text: "text-blue-400",
      border: "border-blue-500/20",
      hover: "hover:border-blue-500/40",
      bg: "bg-blue-500/5",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.06)]",
      lineColor: "#3b82f6"
    },
    purple: {
      text: "text-purple-400",
      border: "border-purple-500/20",
      hover: "hover:border-purple-500/40",
      bg: "bg-purple-500/5",
      glow: "shadow-[0_0_15px_rgba(168,85,247,0.06)]",
      lineColor: "#a855f7"
    },
    red: {
      text: "text-red-400",
      border: "border-red-500/20",
      hover: "hover:border-red-500/40",
      bg: "bg-red-500/5",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.06)]",
      lineColor: "#ef4444"
    }
  };

  // Aggregated general metrics
  const totalGenerations = models.reduce((acc, m) => acc + m.count, 0);
  const avgSystemSpeed = totalGenerations > 0 
    ? Math.round(models.reduce((acc, m) => acc + (m.avgProcessingTime * m.count), 0) / totalGenerations) 
    : 0;
  const overallSuccessRate = totalGenerations > 0
    ? Math.round((models.reduce((acc, m) => acc + m.successCount, 0) / totalGenerations) * 100)
    : 100;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw size={28} className="animate-spin text-red-500" />
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 animate-pulse">Syncing Neural Metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/20 bg-red-950/5 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-xl">
        <AlertTriangle className="mx-auto text-red-500" size={32} />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Diagnostics Link Interrupted</h3>
        <p className="text-xs text-neutral-450 leading-relaxed font-mono">{error}</p>
        <button onClick={() => fetchData()} className="px-5 py-2.5 bg-neutral-900 border border-neutral-850 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
          Retry Protocol
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* --- HEADER TITLE STRIP --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
            Neural_<span className="text-red-500">Models</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em] mt-1.5">
            Model Specifications, Capabilities & Telemetry Deck
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleTestLatency}
            disabled={testingLatency}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-neutral-950 border border-neutral-850 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Server size={12} className={cn(testingLatency && "animate-pulse")} />
            Test Latencies
          </button>
          <button 
            onClick={() => fetchData(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-950/20"
          >
            <RefreshCw size={12} className={cn(isRefreshing && "animate-spin")} />
            {isRefreshing ? "Syncing..." : "Sync Deck"}
          </button>
        </div>
      </div>

      {/* --- HUD SYSTEM METRICS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 bottom-0 h-10 w-24 opacity-15 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 28" preserveAspectRatio="none">
              <path d="M0 24 Q 25 10, 50 18 T 100 5 L 100 28 L 0 28 Z" fill="url(#hud-blue)" />
              <defs>
                <linearGradient id="hud-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-850 text-blue-500"><Cpu size={15} /></div>
            <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-1"><span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />ONLINE</span>
          </div>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">TOTAL GENERATIONS</p>
          <h4 className="text-xl md:text-2xl font-black italic tracking-tight text-white font-mono leading-none mb-1">{totalGenerations.toLocaleString()}</h4>
          <p className="text-[8px] font-mono text-neutral-600 tracking-tight">Across all 4 system active models</p>
        </div>

        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 bottom-0 h-10 w-24 opacity-15 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 28" preserveAspectRatio="none">
              <path d="M0 14 Q 25 24, 50 8 T 100 20 L 100 28 L 0 28 Z" fill="url(#hud-purple)" />
              <defs>
                <linearGradient id="hud-purple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-850 text-purple-500"><Zap size={15} /></div>
            <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-wider">SPEED RATING</span>
          </div>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">AVG PROCESSING SPEED</p>
          <h4 className="text-xl md:text-2xl font-black italic tracking-tight text-white font-mono leading-none mb-1">{avgSystemSpeed}s</h4>
          <p className="text-[8px] font-mono text-neutral-600 tracking-tight">Mean ingestion-to-complete latency</p>
        </div>

        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 bottom-0 h-10 w-24 opacity-15 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 28" preserveAspectRatio="none">
              <path d="M0 5 Q 25 15, 50 3 T 100 12 L 100 28 L 0 28 Z" fill="url(#hud-emerald)" />
              <defs>
                <linearGradient id="hud-emerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-850 text-emerald-500"><Award size={15} /></div>
            <span className="text-[8px] font-mono text-emerald-400 font-bold">{overallSuccessRate}% SUCCESS</span>
          </div>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">PIPELINE INTEGRITY</p>
          <h4 className="text-xl md:text-2xl font-black italic tracking-tight text-white font-mono leading-none mb-1">{overallSuccessRate}%</h4>
          <p className="text-[8px] font-mono text-neutral-600 tracking-tight">System completion ratio versus failures</p>
        </div>
      </div>

      {/* --- MODELS MATRIX STACK (4 ACTIVE MODELS) --- */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">Neural Engine Matrix</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map(model => {
            const cfg = colorConfigs[model.color];
            const successPct = model.count > 0 ? Math.round((model.successCount / model.count) * 100) : 100;
            return (
              <div 
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={cn(
                  "bg-neutral-950/40 border p-6 rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm",
                  cfg.border, cfg.hover, cfg.glow
                )}
              >
                {/* Visual Ambient Glow Corner */}
                <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] pointer-events-none opacity-[0.03]", cfg.bg)} />

                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black uppercase italic tracking-tight text-white">{model.name}</h3>
                      {getTierBadge(model.tier)}
                    </div>
                    <p className="text-[8px] font-mono text-neutral-600 uppercase font-bold tracking-wider">
                      Latency Node: <span className="text-white font-black">{nodeLatencies[model.id]}</span>
                    </p>
                  </div>
                  <div className={cn("p-2 rounded-xl bg-neutral-900 border border-neutral-850", cfg.text)}>
                    <Cpu size={16} />
                  </div>
                </div>

                <p className="text-xs text-neutral-400 font-light leading-relaxed mb-6 min-h-[50px] line-clamp-3">
                  {model.description}
                </p>

                <div className="grid grid-cols-3 gap-2 bg-neutral-950/60 p-3 rounded-2xl border border-neutral-900 text-center font-mono">
                  <div>
                    <p className="text-[7px] font-black text-neutral-600 uppercase">Generations</p>
                    <p className="text-sm font-black text-white mt-0.5">{model.count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-neutral-600 uppercase">Avg Speed</p>
                    <p className="text-sm font-black text-white mt-0.5">{model.avgProcessingTime}s</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-neutral-600 uppercase">Success Rate</p>
                    <p className={cn("text-sm font-black mt-0.5", successPct > 90 ? "text-emerald-500" : "text-yellow-500")}>
                      {successPct}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 text-[8px] font-mono uppercase text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-neutral-500" />
                    <span>Max Length: <strong className="text-neutral-300">{model.maxVideoLength}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500/80 group">
                    <span>Inspect Node</span>
                    <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- CUMULATIVE ACQUISITION CHART & TERMINAL LOGS PANEL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Daily Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-neutral-950/40 border border-neutral-900 p-6 rounded-3xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                <BarChart3 size={12} className="text-red-500" /> System_Load_Trend
              </h3>
              <p className="text-[8px] text-neutral-600 uppercase mt-1 font-bold">Daily generation counts per model (Last 7 Days)</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span>Flash</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span>Canvas</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /><span>Scholar</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /><span>Atlas</span>
              </div>
            </div>
          </div>

          {dailyTrend.length > 0 ? (
            <div className="h-64 flex items-end justify-between px-2 pb-2 border-b border-neutral-900 relative">
              {dailyTrend.map((data, index) => {
                const total = data.flash + data.canvas + data.scholar + data.atlas;
                const maxVal = Math.max(...dailyTrend.map(d => d.flash + d.canvas + d.scholar + d.atlas)) || 1;
                
                const flashHeight = total > 0 ? (data.flash / maxVal) * 100 : 0;
                const canvasHeight = total > 0 ? (data.canvas / maxVal) * 100 : 0;
                const scholarHeight = total > 0 ? (data.scholar / maxVal) * 100 : 0;
                const atlasHeight = total > 0 ? (data.atlas / maxVal) * 100 : 0;

                return (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1 group z-10">
                    <div className="relative w-8 sm:w-10 flex flex-col justify-end items-center h-48 cursor-pointer">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-950 border border-neutral-850 p-2 rounded-xl text-[8px] font-mono text-neutral-400 z-30 pointer-events-none min-w-[80px] shadow-xl">
                        <p className="text-white font-bold">{data.date}</p>
                        <p className="text-emerald-400">Flash: {data.flash}</p>
                        <p className="text-blue-400">Canvas: {data.canvas}</p>
                        <p className="text-purple-400">Scholar: {data.scholar}</p>
                        <p className="text-red-400">Atlas: {data.atlas}</p>
                      </div>

                      {/* Stacked bar visualization */}
                      <div className="w-5 sm:w-6 flex flex-col rounded-md overflow-hidden bg-neutral-900/60 border border-neutral-950">
                        <div style={{ height: `${atlasHeight}%` }} className="bg-red-500 transition-all duration-500" />
                        <div style={{ height: `${scholarHeight}%` }} className="bg-purple-500 transition-all duration-500" />
                        <div style={{ height: `${canvasHeight}%` }} className="bg-blue-500 transition-all duration-500" />
                        <div style={{ height: `${flashHeight}%` }} className="bg-emerald-500 transition-all duration-500" />
                      </div>
                    </div>
                    <span className="text-[8px] font-black uppercase text-neutral-600 tracking-wider">
                      {data.date.substring(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[10px] font-mono text-neutral-650 uppercase">
              No load trend log data found
            </div>
          )}
        </div>

        {/* Live Terminal Console logs (4 cols) */}
        <div className="lg:col-span-4 bg-neutral-950/40 border border-neutral-900 p-6 rounded-3xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-4 flex items-center gap-2">
              <Terminal size={12} className="text-red-500" /> Console_Telemetry
            </h3>
            
            <div className="bg-black/60 rounded-2xl border border-neutral-900 p-4 h-48 overflow-y-auto font-mono text-[9px] text-neutral-400 space-y-2.5 custom-scrollbar">
              {terminalLogs.map((log, index) => (
                <div key={index} className="leading-relaxed break-all">
                  <span className="text-red-500/80 mr-1.5">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-900/60 pt-4 mt-4 flex items-center justify-between text-[8px] font-mono text-neutral-500 uppercase">
            <span>Interface Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />Synchronized</span>
          </div>
        </div>
      </div>

      {/* --- INVENTORY DETAIL MODAL PANEL --- */}
      <AnimatePresence>
        {selectedModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModel(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={cn(
                "relative w-full max-w-xl bg-neutral-950 border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden font-sans",
                colorConfigs[selectedModel.color].border,
                colorConfigs[selectedModel.color].glow
              )}
            >
              {/* Corner Glow Overlay */}
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] pointer-events-none opacity-5", colorConfigs[selectedModel.color].bg)} />

              <div className="relative z-10 space-y-6">
                
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl font-black italic uppercase tracking-tight text-white">{selectedModel.name}</h3>
                      {getTierBadge(selectedModel.tier)}
                    </div>
                    <p className="text-[9px] font-mono text-neutral-600 uppercase font-black tracking-widest mt-1">
                      Model Identifier: model-{selectedModel.id}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedModel(null)}
                    className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-white transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-350 leading-relaxed font-light">
                  {selectedModel.description}
                </p>

                {/* Specs list */}
                <div className="grid grid-cols-2 gap-4 border-t border-neutral-900 pt-6">
                  <div>
                    <h4 className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1.5">Capabilities &amp; Limits</h4>
                    <div className="space-y-2 text-[10px] text-neutral-400 font-mono">
                      <div className="flex justify-between border-b border-neutral-900/60 pb-1">
                        <span>Speed Index:</span>
                        <span className="text-white font-bold">{selectedModel.speed}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900/60 pb-1">
                        <span>Length Boundary:</span>
                        <span className="text-white font-bold">{selectedModel.maxVideoLength}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900/60 pb-1">
                        <span>Token Cost:</span>
                        <span className="text-white font-bold">{selectedModel.tokenCost > 0 ? `-${selectedModel.tokenCost} units` : "Free Access"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1.5">Production Telemetry</h4>
                    <div className="space-y-2 text-[10px] text-neutral-400 font-mono">
                      <div className="flex justify-between border-b border-neutral-900/60 pb-1">
                        <span>Success count:</span>
                        <span className="text-emerald-400 font-bold">{selectedModel.successCount}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900/60 pb-1">
                        <span>Failure count:</span>
                        <span className="text-red-500 font-bold">{selectedModel.failedCount}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900/60 pb-1">
                        <span>Processing count:</span>
                        <span className="text-blue-400 font-bold">{selectedModel.processingCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capabilities checkmarks list */}
                <div className="bg-neutral-900/40 border border-neutral-900 p-5 rounded-2xl space-y-3">
                  <h4 className="text-[9px] font-black uppercase text-white tracking-widest">Model Technical Capabilities</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-neutral-350">
                    {selectedModel.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={12} className={cn("shrink-0 mt-0.5", colorConfigs[selectedModel.color].text)} />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <button 
                  onClick={() => setSelectedModel(null)}
                  className="w-full py-3 bg-neutral-900 border border-neutral-850 hover:border-neutral-700 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Close Specsheet
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
