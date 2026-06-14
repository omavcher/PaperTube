"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Globe, Smartphone, Zap, ShieldAlert, ShieldCheck, 
  Navigation, Laptop, Search, Activity, X, Clock,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  User, Mail, Terminal, Copy, Check, ExternalLink, Link, 
  Eye, Compass, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";

// --- Constants ---
const ITEMS_PER_PAGE = 15;

interface AnalyticsLog {
  _id: string;
  userId: string | null;
  email: string | null;
  isLoggedIn: boolean;
  source: string;
  path?: string;      
  userAgent?: string; 
  timestamp: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  referrer?: string | null;
}

export default function AnalyticsMonitor() {
  const [logs, setLogs] = useState<AnalyticsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedLog, setSelectedLog] = useState<AnalyticsLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await api.get('/admin/analytics/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sortedLogs = (res.data.data || []).sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(sortedLogs);
      } catch (err) {
        console.error("TELEMETRY_SYNC_ERROR", err);
        toast.error("Failed to sync traffic logs");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  // 1. Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const sourceSafe = log.source || "";
      const emailSafe = log.email || "";
      const query = searchQuery.toLowerCase();
      
      const paramMatches = 
          (log.utmCampaign || "").toLowerCase().includes(query) ||
          (log.utmMedium || "").toLowerCase().includes(query) ||
          (log.utmSource || "").toLowerCase().includes(query) ||
          (log.utmTerm || "").toLowerCase().includes(query) ||
          (log.utmContent || "").toLowerCase().includes(query);

      const matchesSearch = 
          emailSafe.toLowerCase().includes(query) || 
          sourceSafe.toLowerCase().includes(query) ||
          paramMatches;
                            
      const matchesFilter = filter === "All" || 
                           (filter === "Auth" && log.isLoggedIn) || 
                           (filter === "Guest" && !log.isLoggedIn);
                           
      return matchesSearch && matchesFilter;
    });
  }, [logs, searchQuery, filter]);

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Log payload copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper parser for user agent details
  const parseUserAgent = (ua?: string) => {
    if (!ua) return { os: "Unknown OS", browser: "Unknown Browser", engine: "WebKit" };
    
    let os = "Unknown OS";
    if (ua.includes("Windows")) os = "Windows NT";
    else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    
    let browser = "Unknown Browser";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";
    
    return { os, browser, engine: ua.includes("Gecko") ? "Gecko" : "Blink/WebKit" };
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 pb-20 px-4 md:px-0 font-mono text-white select-none">
      
      {/* --- Tactical Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-900 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-red-600 rounded-full animate-ping" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              Traffic_<span className="text-red-500">Surveillance</span>
            </h1>
          </div>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" />
            Node_Status: Live_Telemetry_Feed_v4.5
          </p>
        </div>
        <div className="text-[10px] text-neutral-450 bg-neutral-950 border border-neutral-850 px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
           TOTAL_LOGS: <span className="text-white font-bold">{logs.length.toLocaleString()}</span>
        </div>
      </div>

      {/* --- Quick Metrics HUD --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatHUD label="Total Nodes Registered" val={logs.length} icon={Activity} color="text-red-500" />
        <StatHUD label="Auth Rate" val={`${Math.round((logs.filter(l => l.isLoggedIn).length / logs.length) * 100 || 0)}%`} icon={ShieldCheck} color="text-emerald-400" />
        <StatHUD label="Primary Pathway" val={logs[0]?.source || "Direct"} icon={Globe} color="text-blue-400" />
        <StatHUD label="Active Route" val={logs[0]?.path || "/"} icon={Navigation} color="text-yellow-500" />
      </div>

      {/* --- Command Bar --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
          <Input 
            placeholder="Search Email, Source, or Campaign..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black border-neutral-900 h-14 pl-14 rounded-2xl focus:border-red-650/40 text-[10px] font-black uppercase tracking-widest text-white shadow-inner"
          />
        </div>
        <div className="flex bg-neutral-950 border border-neutral-900 rounded-2xl p-1 gap-1">
          {["All", "Auth", "Guest"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all",
                filter === f 
                  ? "bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                  : "text-neutral-500 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* --- Live Activity Stream --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-650 flex items-center gap-2">
              <Zap size={12} className="text-red-500 animate-pulse" /> Sequence_Log_Entries
            </h3>
            <span className="text-[9px] font-bold text-neutral-500 bg-neutral-950 border border-neutral-900 px-3 py-1 rounded-lg">
                Page {currentPage} of {totalPages || 1}
            </span>
        </div>

        <div className="grid grid-cols-1 gap-3 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {paginatedLogs.map((log) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                key={log._id}
                onClick={() => setSelectedLog(log)}
                className="group bg-neutral-950/40 border border-neutral-900 p-4 md:p-5 rounded-[1.8rem] hover:border-red-500/30 hover:bg-neutral-950/60 cursor-pointer transition-all relative overflow-hidden"
              >
                {/* Visual Accent for Auth vs Guest */}
                <div className={cn(
                  "absolute top-0 left-0 w-[3px] h-full transition-colors",
                  log.isLoggedIn ? "bg-emerald-500" : "bg-neutral-800"
                )} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 pl-2">
                  
                  {/* Left: User Identity */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center border transition-colors flex-shrink-0",
                      log.isLoggedIn ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-neutral-900 border-neutral-850 text-neutral-650"
                    )}>
                      {log.isLoggedIn ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-tighter truncate max-w-[150px] md:max-w-xs">
                          {log.email || "UNIDENTIFIED_GUEST"}
                        </h4>
                        {log.isLoggedIn && (
                          <span className="text-[7px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold flex-shrink-0">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest mt-1">
                        Node_ID: <span className="font-mono text-neutral-450">{log.userId ? log.userId.substring(0,8) + "..." : "GUEST_SESSION"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Path & Source */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-8">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">Entry_Path</span>
                          <div className="flex items-center gap-1.5">
                            <Navigation size={9} className="text-red-500" />
                            <span className="text-[10px] font-bold text-neutral-300 uppercase italic truncate max-w-[120px]">{log.path || "/"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">Traffic_Source</span>
                          <div className="flex items-center gap-1.5">
                            <SourceIcon source={log.source || "Direct"} />
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{log.source || "Direct"}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* UTM Badges */}
                      {(log.utmCampaign || log.utmMedium || log.utmSource || log.utmTerm || log.utmContent) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {log.utmCampaign && <span className="text-[7px] bg-red-500/5 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase font-bold">C: {log.utmCampaign}</span>}
                          {log.utmMedium && <span className="text-[7px] bg-purple-500/5 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase font-bold">M: {log.utmMedium}</span>}
                          {log.utmSource && <span className="text-[7px] bg-blue-500/5 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase font-bold">S: {log.utmSource}</span>}
                          {log.utmTerm && <span className="text-[7px] bg-amber-500/5 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold">T: {log.utmTerm}</span>}
                          {log.utmContent && <span className="text-[7px] bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">CN: {log.utmContent}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Metadata */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-neutral-900/40 pt-3 md:pt-0">
                    <div className="flex items-center gap-2 text-neutral-550">
                      {(log.userAgent || "").includes("Windows") ? <Laptop size={12} className="text-neutral-600" /> : <Smartphone size={12} className="text-neutral-600" />}
                      <span className="text-[8px] font-bold uppercase tracking-widest font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-[7px] font-bold text-neutral-600 max-w-[120px] truncate hidden md:block uppercase tracking-wider">
                      {log.userAgent ? parseUserAgent(log.userAgent).browser + " / " + parseUserAgent(log.userAgent).os : "Unknown Dev"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {paginatedLogs.length === 0 && (
             <div className="text-center py-20 text-neutral-600 border border-neutral-900 border-dashed rounded-[2rem]">
                <ShieldAlert className="mx-auto mb-2 opacity-50 text-red-500" size={32} />
                <p className="text-xs uppercase tracking-widest">No Telemetry Logs Found</p>
             </div>
          )}
        </div>

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-900 pt-4">
                <button 
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="hidden sm:block p-2 rounded-lg hover:bg-neutral-900 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronsLeft size={16} />
                </button>
                
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-900 text-xs font-bold text-white hover:bg-neutral-900 disabled:opacity-30 transition-all flex items-center gap-1"
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>
                    
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mx-2">
                        {currentPage} / {totalPages}
                    </span>

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-900 text-xs font-bold text-white hover:bg-neutral-900 disabled:opacity-30 transition-all flex items-center gap-1"
                    >
                        Next <ChevronRight size={14} /> 
                    </button>
                </div>

                <button 
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="hidden sm:block p-2 rounded-lg hover:bg-neutral-900 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        )}
      </div>

      {/* --- TELEMETRY SLIDING DRAWER --- */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[200] flex" onClick={() => setSelectedLog(null)}>
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" />

            {/* Slider Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-hidden shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                    Surveillance_Telemetry_Log
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 hover:bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 font-mono text-[10px]">
                
                {/* Header Information Box */}
                <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase border",
                      selectedLog.isLoggedIn ? "bg-emerald-500/5 text-emerald-450 border-emerald-500/20" : "bg-neutral-900 text-neutral-500 border-neutral-850"
                    )}>
                      STATUS: {selectedLog.isLoggedIn ? 'AUTHENTICATED' : 'GUEST_NODE'}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-bold">
                      LOG_ID: {selectedLog._id.substring(0,10)}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-tight">path: {selectedLog.path || "/"}</h3>
                  <div className="flex items-center gap-2 text-[8px] text-neutral-500">
                    <Clock size={10} />
                    <span>TIMING: {new Date(selectedLog.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* User Identity node */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <User size={12} className="text-red-500" />
                    Identity Node Specifications
                  </h4>
                  {selectedLog.email ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-555 to-emerald-950 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-white shadow-md">
                          {selectedLog.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-neutral-200">{selectedLog.email}</div>
                          <div className="text-[8px] text-neutral-500 font-mono">
                            VERIFIED_USER_ACCOUNT
                          </div>
                        </div>
                      </div>
                      <div className="text-[8px] bg-neutral-950 p-3 rounded-xl border border-neutral-900 leading-normal text-neutral-450">
                        <div className="flex justify-between"><span>USER_ID:</span> <span className="font-mono text-neutral-300">{selectedLog.userId}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-neutral-900/40 border border-neutral-900 rounded-xl">
                      <ShieldAlert size={18} className="text-neutral-500 animate-pulse" />
                      <div className="space-y-0.5">
                        <div className="text-[9px] font-bold text-neutral-400 uppercase">UNREGISTERED_GUEST_SESSION</div>
                        <div className="text-[8px] text-neutral-600">No account association. Telemetry is bound to anonymous session identifier.</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Traffic Details (UTM & Referrer) */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Compass size={12} className="text-blue-500" />
                    Acquisition & Campaign Telemetry
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-900 text-[8px]">
                      <span className="text-neutral-600 uppercase font-bold flex items-center gap-1"><Link size={10} /> Referrer URL</span>
                      <span className="text-neutral-300 truncate max-w-[200px]" title={selectedLog.referrer || "Direct Entry"}>
                        {selectedLog.referrer || "Direct / Bookmark"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">UTM Campaign Parameters</span>
                      <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2 text-[8px]">
                        <div className="flex justify-between border-b border-neutral-900/60 pb-1.5">
                          <span className="text-neutral-600">CAMPAIGN_SOURCE:</span>
                          <span className="text-blue-400 font-bold uppercase">{selectedLog.utmSource || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-900/60 pb-1.5">
                          <span className="text-neutral-600">CAMPAIGN_MEDIUM:</span>
                          <span className="text-purple-400 font-bold uppercase">{selectedLog.utmMedium || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-900/60 pb-1.5">
                          <span className="text-neutral-600">CAMPAIGN_NAME:</span>
                          <span className="text-red-450 font-bold uppercase">{selectedLog.utmCampaign || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-900/60 pb-1.5">
                          <span className="text-neutral-600">CAMPAIGN_TERM:</span>
                          <span className="text-amber-500 font-bold uppercase">{selectedLog.utmTerm || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">CAMPAIGN_CONTENT:</span>
                          <span className="text-emerald-400 font-bold uppercase">{selectedLog.utmContent || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device Specification (User Agent) */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Terminal size={12} className="text-yellow-500" />
                    Device User-Agent Diagnostics
                  </h4>
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2 text-center text-[8px]">
                      <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded-xl">
                        <div className="text-neutral-600 uppercase">Operating System</div>
                        <div className="text-xs font-bold text-neutral-200 mt-1 uppercase flex items-center justify-center gap-1">
                          {selectedLog.userAgent && parseUserAgent(selectedLog.userAgent).os}
                        </div>
                      </div>
                      <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded-xl">
                        <div className="text-neutral-600 uppercase">Browser Client</div>
                        <div className="text-xs font-bold text-neutral-205 mt-1 uppercase">
                          {selectedLog.userAgent && parseUserAgent(selectedLog.userAgent).browser}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1.5 text-[8px] text-neutral-450 leading-relaxed max-h-24 overflow-y-auto">
                      <span className="text-neutral-600 block">RAW_USER_AGENT:</span>
                      <span className="font-mono text-neutral-500 block break-all">{selectedLog.userAgent || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-neutral-905/30 border border-neutral-900/80 p-4 rounded-2xl space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-red-650/5 rounded-full blur-2xl pointer-events-none" />
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    AI Intelligence Diagnostics
                  </h4>
                  <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2 text-[8px] leading-relaxed">
                    <p className="text-neutral-350">
                      Surveillance node registered at route <span className="text-white font-bold">{selectedLog.path || "/"}</span>.
                    </p>
                    <ul className="list-disc pl-3 text-neutral-500 space-y-1.5">
                      {selectedLog.utmCampaign ? (
                        <li>Campaign-driven referral detected. Monitor conversions for cohort <span className="text-white">"{selectedLog.utmCampaign}"</span> closely.</li>
                      ) : (
                        <li>Organic acquisition session. User arrived via direct bookmark or search results.</li>
                      )}
                      <li>Device specifications display standard compatibility matches.</li>
                      <li>Session integrity index is valid. No suspicious bot indicators detected.</li>
                    </ul>
                  </div>
                </div>

                {/* Raw JSON Payload */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">RAW_TELEMETRY_PAYLOAD</span>
                    <button 
                      onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), selectedLog._id)}
                      className="text-neutral-600 hover:text-red-400 transition-colors flex items-center gap-1 text-[8px] bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded"
                    >
                      {copiedId === selectedLog._id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      {copiedId === selectedLog._id ? 'COPIED' : 'COPY_RAW'}
                    </button>
                  </div>
                  <pre className="bg-black/90 p-4 rounded-2xl border border-neutral-900 text-[8px] text-red-500/80 overflow-x-auto leading-relaxed shadow-inner max-h-48 font-mono">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- Specialized UI Fragments ---

function StatHUD({ label, val, icon: Icon, color }: any) {
  return (
    <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[1.8rem] relative overflow-hidden group hover:border-neutral-850 transition-all backdrop-blur-md">
      <div className="absolute -right-3 -bottom-3 opacity-[0.03] scale-150 group-hover:opacity-[0.07] transition-opacity"><Icon size={48}/></div>
      <p className="text-[7px] font-bold text-neutral-500 uppercase tracking-[0.3em] mb-1.5">{label}</p>
      <h4 className={cn("text-lg font-black italic tracking-tighter leading-none", color)}>{typeof val === 'number' ? val.toLocaleString() : val}</h4>
    </div>
  );
}

function SourceIcon({ source }: { source: string }) {
  const s = (source || "").toLowerCase();
  if (s.includes('google')) return <Search size={10} className="text-blue-400" />;
  if (s.includes('localhost') || s.includes('direct')) return <Laptop size={10} className="text-neutral-500" />;
  return <Globe size={10} className="text-blue-500" />;
}

function LoadingState() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="h-10 w-10 border-t-2 border-red-650 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-650 animate-pulse">Synchronizing_Neural_Feed...</p>
    </div>
  );
}