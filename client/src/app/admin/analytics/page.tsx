"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Globe, Smartphone, Zap, ShieldAlert, ShieldCheck, 
  Navigation, Laptop, Instagram, Search, Activity,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/config/api";

// --- Constants ---
const ITEMS_PER_PAGE = 15; // Only render 15 items at a time for performance

interface AnalyticsLog {
  _id: string;
  userId: string | null;
  email: string | null;
  isLoggedIn: boolean;
  source: string;
  path?: string;      
  userAgent?: string; 
  timestamp: string;
}

export default function AnalyticsMonitor() {
  const [logs, setLogs] = useState<AnalyticsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await api.get('/admin/analytics/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Sort by newest first just in case
        const sortedLogs = (res.data.data || []).sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(sortedLogs);
      } catch (err) {
        console.error("TELEMETRY_SYNC_ERROR", err);
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
      
      const matchesSearch = emailSafe.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sourceSafe.toLowerCase().includes(searchQuery.toLowerCase());
                            
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

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 pb-20 px-4 md:px-0">
      
      {/* --- Tactical Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Traffic_<span className="text-red-600 underline decoration-red-600/30 underline-offset-8">Surveillance</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" />
            Node_Status: Live_Telemetry_Feed_v4.0
          </p>
        </div>
        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
           Total Records: <span className="text-white">{logs.length}</span>
        </div>
      </div>

      {/* --- Quick Metrics HUD --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatHUD label="Total Nodes" val={logs.length} icon={Activity} color="text-red-600" />
        <StatHUD label="Auth Rate" val={`${Math.round((logs.filter(l => l.isLoggedIn).length / logs.length) * 100 || 0)}%`} icon={ShieldCheck} color="text-emerald-500" />
        <StatHUD label="Main Source" val={logs[0]?.source || "N/A"} icon={Instagram} color="text-pink-500" />
        <StatHUD label="Active Path" val={logs[0]?.path || "/"} icon={Navigation} color="text-blue-500" />
      </div>

      {/* --- Command Bar --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
          <Input 
            placeholder="Search Node Email or Source..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black border-white/5 h-14 pl-14 rounded-2xl focus:border-red-600/50 text-[10px] font-black uppercase tracking-widest text-white"
          />
        </div>
        <div className="flex bg-black border border-white/5 rounded-2xl p-1 gap-1">
          {["All", "Auth", "Guest"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-red-600 text-white" : "text-neutral-600 hover:text-white"
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
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700 flex items-center gap-2">
            <Zap size={12} className="text-red-600 animate-pulse" /> Sequence_Log_Entries
            </h3>
            <span className="text-[9px] font-bold text-neutral-600">
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
                transition={{ duration: 0.2 }} // Faster animation for performance
                key={log._id}
                className="group bg-neutral-900/20 border border-white/5 p-4 md:p-5 rounded-[2rem] hover:border-red-600/30 transition-all relative overflow-hidden"
              >
                {/* Visual Accent for Auth vs Guest */}
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  log.isLoggedIn ? "bg-emerald-500 shadow-[0_0_10px_emerald]" : "bg-neutral-800"
                )} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  
                  {/* Left: User Identity */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center border transition-colors flex-shrink-0",
                      log.isLoggedIn ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white/5 border-white/10 text-neutral-600"
                    )}>
                      {log.isLoggedIn ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black italic text-white uppercase tracking-tighter truncate max-w-[150px] md:max-w-xs">
                          {log.email || "UNIDENTIFIED_GUEST"}
                        </h4>
                        {log.isLoggedIn && (
                          <span className="text-[7px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase flex-shrink-0">Verified</span>
                        )}
                      </div>
                      <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">
                        Node_ID: <span className="font-mono">{log.userId ? log.userId.substring(0,8) + "..." : "GUEST"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Path & Source */}
                  <div className="flex flex-wrap items-center gap-3 md:gap-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest">Entry_Path</span>
                      <div className="flex items-center gap-1.5">
                        <Navigation size={10} className="text-red-600" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase italic truncate max-w-[100px]">{log.path || "/"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest">Traffic_Source</span>
                      <div className="flex items-center gap-1.5">
                        <SourceIcon source={log.source || "Direct"} />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{log.source || "Direct"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metadata */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                    <div className="flex items-center gap-2 text-neutral-600">
                      {(log.userAgent || "").includes("Windows") ? <Laptop size={12} /> : <Smartphone size={12} />}
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-[7px] font-medium text-neutral-700 max-w-[120px] truncate hidden md:block">
                      {log.userAgent || "Unknown Device"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {paginatedLogs.length === 0 && (
             <div className="text-center py-20 text-neutral-600">
                <ShieldAlert className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-xs uppercase tracking-widest">No Logs Found</p>
             </div>
          )}
        </div>

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <button 
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white/5 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronsLeft size={16} />
                </button>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-black border border-white/5 text-xs font-bold text-white hover:bg-white/5 disabled:opacity-30 transition-all flex items-center gap-1"
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>
                    
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mx-2">
                        {currentPage} / {totalPages}
                    </span>

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl bg-black border border-white/5 text-xs font-bold text-white hover:bg-white/5 disabled:opacity-30 transition-all flex items-center gap-1"
                    >
                        Next <ChevronRight size={14} /> 
                    </button>
                </div>

                <button 
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-white/5 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

// --- Specialized UI Fragments ---

function StatHUD({ label, val, icon: Icon, color }: any) {
  return (
    <div className="bg-black border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 group-hover:opacity-10 transition-opacity"><Icon size={40}/></div>
      <p className="text-[7px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-1">{label}</p>
      <h4 className={cn("text-xl font-black italic tracking-tighter", color)}>{val}</h4>
    </div>
  );
}

function SourceIcon({ source }: { source: string }) {
  const s = (source || "").toLowerCase();
  if (s.includes('instagram')) return <Instagram size={10} className="text-pink-500" />;
  if (s.includes('localhost')) return <Laptop size={10} className="text-purple-500" />;
  return <Globe size={10} className="text-blue-500" />;
}

function LoadingState() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="h-10 w-10 border-t-2 border-red-600 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-700 animate-pulse">Synchronizing_Neural_Feed...</p>
    </div>
  );
}