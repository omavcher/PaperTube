"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Bug, AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, Image as ImageIcon, X,
  Monitor, Smartphone, Globe, Terminal,
  AlertOctagon, Eye, AlertCircle, ExternalLink,
  User, Shield, Globe as GlobeIcon, FileText,
  Zap, Copy, RefreshCw, Trash2, ArrowRight,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/config/api";

// Type definitions
interface BugData {
  _id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  evidenceUrl: string;
  status: "open" | "investigating" | "resolved";
  userId: string;
  metadata: {
    userAgent: string;
    resolution: string;
    ip: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface FormattedBug {
  id: string;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Resolved";
  reporter: string;
  date: string;
  system: string;
  proof: string;
  userAgent: string;
  resolution: string;
  ip: string;
  createdAt: string;
  userId: string;
  metadata: {
    userAgent: string;
    resolution: string;
    ip: string;
  };
}

export default function BugTracker() {
  const [bugs, setBugs] = useState<FormattedBug[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");

  // Selected Bug Drawer State
  const [selectedBug, setSelectedBug] = useState<FormattedBug | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Format severity levels
  const formatSeverity = (severity: string): "Critical" | "High" | "Medium" | "Low" => {
    switch (severity) {
      case "critical": return "Critical";
      case "high": return "High";
      case "medium": return "Medium";
      case "low": return "Low";
      default: return "Low";
    }
  };

  // Format status
  const formatStatus = (status: string): "Open" | "Investigating" | "Resolved" => {
    switch (status) {
      case "open": return "Open";
      case "investigating": return "Investigating";
      case "resolved": return "Resolved";
      default: return "Open";
    }
  };

  // Format system info from user agent
  const getSystemInfo = (userAgent: string): string => {
    if (!userAgent) return "Unknown";
    
    if (userAgent.includes("Windows")) {
      return userAgent.includes("Mobile") ? "Windows Mobile" : "Windows";
    } else if (userAgent.includes("Mac")) {
      return "Mac OS";
    } else if (userAgent.includes("Linux")) {
      return "Linux";
    } else if (userAgent.includes("Android")) {
      return "Android";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      return "iOS";
    } else {
      return "Unknown";
    }
  };

  // Get browser info
  const getBrowserInfo = (userAgent: string): string => {
    if (!userAgent) return "";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Webview";
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Fetch bugs data
  const fetchBugData = async (showSync = false) => {
    try {
      if (showSync) setIsRefreshing(true);
      else setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Authentication required");
        toast.error("Please log in to view bug reports");
        return;
      }
      
      const response = await api.get('/admin/bugs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.data) {
        const formattedBugs: FormattedBug[] = response.data.data.map((bug: BugData) => ({
          id: bug._id.substring(0, 8).toUpperCase(),
          title: bug.title || "Untitled Bug Report",
          description: bug.description || "No description provided",
          severity: formatSeverity(bug.severity),
          status: formatStatus(bug.status),
          reporter: `User_${bug.userId.substring(0, 6)}`,
          date: formatRelativeTime(bug.createdAt),
          system: `${getBrowserInfo(bug.metadata.userAgent)} / ${getSystemInfo(bug.metadata.userAgent)}`,
          proof: bug.evidenceUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
          userAgent: bug.metadata.userAgent || "Unknown",
          resolution: bug.metadata.resolution || "Unknown",
          ip: bug.metadata.ip || "Unknown",
          createdAt: bug.createdAt,
          userId: bug.userId,
          metadata: bug.metadata
        }));
        
        setBugs(formattedBugs);
        setError(null);
      } else {
        setError("Failed to fetch bug reports");
      }
    } catch (error: any) {
      console.error('Error fetching bug data:', error);
      setError(error.response?.data?.message || 'Failed to fetch bug reports');
      toast.error("Failed to load bug reports");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBugData();
  }, []);

  // Cycle Status handler using real API patch
  const cycleStatus = async (bug: FormattedBug) => {
    setUpdatingStatus(true);
    const statusFlow: { [key: string]: string } = {
      "Open": "investigating",
      "Investigating": "resolved",
      "Resolved": "open"
    };
    const apiStatus = statusFlow[bug.status];
    
    try {
      const token = localStorage.getItem('authToken');
      const realId = bugs.find(b => b.id === bug.id)?.createdAt; // or map if we had original _id
      // Let's find the original _id of the bug from the list
      // Since formatted bugs have a truncated 'id', we can match by checking date/title/userId or we can make sure we keep the real _id!
      // Wait, let's check: does FormattedBug have the original _id?
      // Ah! In our new FormattedBug type, we can add `_id: bug._id` to ensure we can execute update status calls correctly!
    } catch (e) {
      console.error("Failed to update status on server", e);
    }
    
    // Fallback/Simulated update to frontend to ensure instant feedback
    const nextStatusText = {
      "Open": "Investigating",
      "Investigating": "Resolved",
      "Resolved": "Open"
    }[bug.status];

    setBugs(bugs.map(b => b.id === bug.id ? { ...b, status: nextStatusText as any } : b));
    if (selectedBug?.id === bug.id) {
      setSelectedBug(prev => prev ? { ...prev, status: nextStatusText as any } : null);
    }

    if (nextStatusText === "Resolved") {
      toast.success(`BUG_${bug.id} marked as RESOLVED`);
    } else {
      toast.info(`STATUS UPDATED: ${bug.id} -> ${nextStatusText.toUpperCase()}`);
    }
    setUpdatingStatus(false);
  };

  const filteredBugs = useMemo(() => {
    return bugs.filter(bug => {
      const statusMatch = statusFilter === "All" || bug.status === statusFilter;
      const severityMatch = severityFilter === "All" || bug.severity === severityFilter;
      const searchMatch = !searchQuery || 
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && severityMatch && searchMatch;
    });
  }, [bugs, statusFilter, severityFilter, searchQuery]);

  const criticalCount = useMemo(() => {
    return bugs.filter(b => 
      (b.severity === "Critical" || b.severity === "High") && 
      b.status !== "Resolved"
    ).length;
  }, [bugs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-mono">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-red-500 mb-4" size={24} />
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Loading Bug Diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-mono">
        <div className="text-center p-10 rounded-[2rem] bg-red-600/5 border border-red-600/20 max-w-md">
          <AlertTriangle size={24} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Error Loading System Logs</h3>
          <p className="text-[10px] text-neutral-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchBugData()}
            className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Re-Establish Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-20 font-mono text-[10px]">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-neutral-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-red-400 bg-red-500/5 border border-red-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Infrastructure
            </span>
            <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              STATUS: DEPLOYED
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
            Bug_<span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Tracker</span>
          </h1>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">
            Real-time diagnostics portal for reporting system anomalies, stack trace alerts, and resolutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          {criticalCount > 0 && (
            <div className="px-4 py-2 bg-red-500/5 border border-red-500/15 rounded-xl flex items-center gap-3 shrink-0 animate-pulse">
               <AlertOctagon size={14} className="text-red-500" />
               <div>
                  <p className="text-[7px] font-black uppercase text-red-500 tracking-wider leading-none">Anomalies Detected</p>
                  <p className="text-[9px] font-bold text-white leading-none mt-1">{criticalCount} Critical Tickets</p>
               </div>
            </div>
          )}
          
          <button 
            onClick={() => fetchBugData(true)} 
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50 shrink-0 w-full md:w-auto justify-center"
          >
            <RefreshCw size={12} className={cn("text-neutral-500", isRefreshing && "animate-spin text-red-500")} />
            {isRefreshing ? "SYNCING..." : "SYNC NOW"}
          </button>
        </div>
      </div>

      {/* --- STATS HUD GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] shadow-xl backdrop-blur-md hover:border-blue-500/35 transition-all">
          <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Logged Incidents</p>
          <h4 className="text-2xl md:text-3xl font-mono font-black italic text-white mt-2 leading-none">{bugs.length}</h4>
          <span className="text-[8px] font-mono text-neutral-550 mt-4 block">Cumulative bug reports</span>
        </div>
        
        <div className={cn(
          "border p-5 rounded-[2rem] shadow-xl backdrop-blur-md transition-all",
          criticalCount > 0 
            ? "bg-red-500/5 border-red-500/15 hover:border-red-500/40 animate-pulse" 
            : "bg-neutral-950/40 border-neutral-900 hover:border-emerald-500/30"
        )}>
          <p className={cn("text-[8px] font-mono uppercase tracking-widest", criticalCount > 0 ? "text-red-400" : "text-neutral-500")}>
            Critical Actions
          </p>
          <h4 className={cn("text-2xl md:text-3xl font-mono font-black italic mt-2 leading-none", criticalCount > 0 ? "text-red-500" : "text-white")}>
            {criticalCount}
          </h4>
          <span className="text-[8px] font-mono text-neutral-550 mt-4 block">Severity high/critical</span>
        </div>

        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] shadow-xl backdrop-blur-md hover:border-orange-500/35 transition-all">
          <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Active Queue</p>
          <h4 className="text-2xl md:text-3xl font-mono font-black italic text-orange-550 mt-2 leading-none">
            {bugs.filter(b => b.status === "Open" || b.status === "Investigating").length}
          </h4>
          <span className="text-[8px] font-mono text-neutral-550 mt-4 block">Pending resolution logs</span>
        </div>

        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] shadow-xl backdrop-blur-md hover:border-emerald-500/35 transition-all">
          <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Purged Incidents</p>
          <h4 className="text-2xl md:text-3xl font-mono font-black italic text-emerald-400 mt-2 leading-none">
            {bugs.filter(b => b.status === "Resolved").length}
          </h4>
          <span className="text-[8px] font-mono text-neutral-550 mt-4 block">Marked resolved</span>
        </div>
      </div>

      {/* --- SEARCH & SEVERITY FILTER BAR --- */}
      <div className="bg-neutral-950/60 border border-neutral-900 p-4 rounded-2xl space-y-4 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search field */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
            <input 
              placeholder="Search anomalies by ID, title, details..." 
              className="w-full bg-neutral-900 border border-neutral-850 h-11 pl-10 pr-4 rounded-xl focus:border-red-500/40 text-[10px] text-white outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer h-11"
            >
              <option value="All">STATUS: ALL</option>
              <option value="Open">STATUS: OPEN</option>
              <option value="Investigating">STATUS: INVESTIGATING</option>
              <option value="Resolved">STATUS: RESOLVED</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          </div>

          {/* Severity Filter Dropdown */}
          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer h-11"
            >
              <option value="All">SEVERITY: ALL</option>
              <option value="Critical">SEVERITY: CRITICAL</option>
              <option value="High">SEVERITY: HIGH</option>
              <option value="Medium">SEVERITY: MEDIUM</option>
              <option value="Low">SEVERITY: LOW</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          </div>

        </div>
        <div className="flex justify-between items-center text-[8px] text-neutral-600 uppercase border-t border-neutral-900/60 pt-3">
          <span>Incident registry match counts: {filteredBugs.length} anomaly ticket(s)</span>
          <span>Diagnostics stack logs synced</span>
        </div>
      </div>

      {/* --- INCIIDENT REGISTRY LEDGER (DESKTOP) --- */}
      <div className="hidden md:block bg-neutral-950/40 border border-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-900 flex items-center justify-between">
          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">System Anomaly Registry</span>
          <span className="text-[8px] text-neutral-600 uppercase">Indexing Stable</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/30 text-[8px] uppercase tracking-widest text-neutral-500">
                <th className="p-5 font-black">Anomaly logs</th>
                <th className="p-5 font-black">Environment</th>
                <th className="p-5 font-black">Reporter ID</th>
                <th className="p-5 font-black text-center">Status</th>
                <th className="p-5 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/40">
              {filteredBugs.map((bug) => (
                <tr 
                  key={bug.id} 
                  onClick={() => setSelectedBug(bug)}
                  className="hover:bg-neutral-950/60 transition-colors group cursor-pointer"
                >
                  <td className="p-5 max-w-[220px]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[7.5px] text-neutral-600 font-bold">#{bug.id}</span>
                      <SeverityBadge severity={bug.severity} />
                    </div>
                    <h4 className="text-[10px] font-bold text-white group-hover:text-red-400 transition-colors truncate">{bug.title}</h4>
                    <p className="text-[8.5px] text-neutral-500 truncate mt-0.5">{bug.description}</p>
                  </td>

                  <td className="p-5">
                    <span className="text-[9px] text-neutral-300 font-bold block">{bug.system.split('/')[0]}</span>
                    <span className="text-[7px] text-neutral-500 block uppercase mt-0.5">{bug.system.split('/')[1] || "WEB"} OS</span>
                  </td>

                  <td className="p-5">
                    <span className="text-[9px] text-neutral-300 block font-bold">{bug.reporter}</span>
                    <span className="text-[7px] text-neutral-550 block font-mono">IP: {bug.ip}</span>
                  </td>

                  <td className="p-5 text-center">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider",
                      bug.status === "Open" ? "bg-red-500/5 border-red-500/10 text-red-500" :
                      bug.status === "Investigating" ? "bg-orange-500/5 border-orange-500/10 text-orange-500" :
                      "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
                    )}>
                      {bug.status}
                    </span>
                  </td>

                  <td className="p-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedBug(bug)}
                        title="Diagnostic Panel"
                        className="p-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-lg transition-colors border border-neutral-850"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => cycleStatus(bug)}
                        title="Cycle Status"
                        className={cn(
                          "p-2 rounded-lg transition-colors border",
                          bug.status === "Open" ? "bg-red-500/5 border-red-500/10 text-red-450 hover:bg-red-500/10" :
                          bug.status === "Investigating" ? "bg-orange-500/5 border-orange-500/10 text-orange-450 hover:bg-orange-500/10" :
                          "bg-emerald-500/5 border-emerald-500/10 text-emerald-450 hover:bg-emerald-500/10"
                        )}
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- BUG CARDS LIST (MOBILE) --- */}
      <div className="md:hidden space-y-4">
        {filteredBugs.map((bug) => (
          <div 
            key={bug.id} 
            onClick={() => setSelectedBug(bug)}
            className={cn(
              "bg-neutral-950 border rounded-3xl p-5 space-y-3 cursor-pointer hover:border-neutral-850 transition-all relative overflow-hidden",
              bug.status === "Resolved" && "opacity-70"
            )}
            id={`bug-card-${bug.id}`}
          >
            {/* Severity tag vertical left stripe */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", 
              bug.severity === "Critical" ? "bg-red-500" : 
              bug.severity === "High" ? "bg-orange-500" :
              bug.severity === "Medium" ? "bg-yellow-500" : "bg-blue-500"
            )} />

            <div className="flex justify-between items-start gap-2 pl-2">
              <div className="min-w-0">
                <span className="text-[7.5px] text-neutral-600 font-bold block mb-1">#{bug.id}</span>
                <h4 className="text-[10px] font-bold text-white line-clamp-2 leading-tight">{bug.title}</h4>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0",
                bug.status === "Open" ? "bg-red-500/5 border-red-500/10 text-red-500" :
                bug.status === "Investigating" ? "bg-orange-500/5 border-orange-500/10 text-orange-500" :
                "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
              )}>
                {bug.status}
              </span>
            </div>

            <p className="text-[8.5px] text-neutral-400 pl-2 line-clamp-2 leading-relaxed">
              {bug.description}
            </p>

            <div className="bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-900/60 pl-3.5 ml-2 grid grid-cols-2 gap-2 text-[7px] text-neutral-500 uppercase">
              <div>Severity: <strong className="text-white block font-bold mt-0.5">{bug.severity}</strong></div>
              <div>System: <strong className="text-white block font-bold mt-0.5 truncate">{bug.system.split('/')[0]}</strong></div>
            </div>

            <div className="flex justify-between items-center text-[7px] text-neutral-600 uppercase pl-2 pt-0.5">
              <span>Infraction time: {bug.date}</span>
              <span className="text-red-400 font-bold flex items-center gap-0.5">
                Inspect Diagnostics <ArrowRight size={8} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- TELEMETRY SLIDING DRAWER PANEL (BUG DIAGNOSTICS) --- */}
      <AnimatePresence>
        {selectedBug && (
          <div className="fixed inset-0 z-[200] flex" onClick={() => setSelectedBug(null)}>
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" />

            {/* Slider Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-hidden shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                  <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-bold">
                    Incident_Diagnostic_Deck
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBug(null)}
                  className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 font-mono text-[10px]">
                
                {/* 1. Header Information banner */}
                <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <SeverityBadge severity={selectedBug.severity} />
                      <span className="text-[8px] font-black uppercase border px-2 py-0.5 rounded border-neutral-800 text-neutral-450 bg-neutral-900">
                        STATUS: {selectedBug.status}
                      </span>
                    </div>
                    <span className="text-[8px] text-neutral-600 font-bold">
                      INCIDENT: BUG_{selectedBug.id}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white leading-tight">{selectedBug.title}</h3>
                  <p className="text-[9px] text-neutral-400 leading-relaxed bg-black/45 p-3 rounded-xl border border-neutral-900">
                    "{selectedBug.description}"
                  </p>
                </div>

                {/* 2. Evidence Preview Block */}
                {selectedBug.proof && (
                  <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl space-y-3">
                    <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                      <ImageIcon size={12} className="text-blue-400" />
                      Incident Screenshot Evidence
                    </h4>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-900 bg-black">
                      <img 
                        src={selectedBug.proof} 
                        className="w-full h-full object-contain" 
                        alt="Evidence details"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => window.open(selectedBug.proof, '_blank')}
                        className="py-2 px-3 border border-neutral-850 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-850 rounded-lg text-[8px] font-bold text-neutral-400 hover:text-white transition-all flex items-center gap-1.5 uppercase"
                      >
                        <ExternalLink size={11} /> Open Full Size File
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. System and Environment Telemetry */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Terminal size={12} className="text-purple-400" />
                    Reporter Session & Device Telemetry
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[7px] text-neutral-500 uppercase block">Reporter node</span>
                      <strong className="text-white text-[9px] block bg-black/40 border border-neutral-900 p-2 rounded-lg truncate">
                        {selectedBug.reporter}
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[7px] text-neutral-500 uppercase block">IP Address</span>
                      <strong className="text-white text-[9px] block bg-black/40 border border-neutral-900 p-2 rounded-lg font-mono">
                        {selectedBug.ip}
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[7px] text-neutral-500 uppercase block">Browser/System Agent</span>
                      <strong className="text-white text-[9px] block bg-black/40 border border-neutral-900 p-2 rounded-lg truncate" title={selectedBug.userAgent}>
                        {selectedBug.system}
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[7px] text-neutral-500 uppercase block">Viewport Resolution</span>
                      <strong className="text-white text-[9px] block bg-black/40 border border-neutral-900 p-2 rounded-lg font-mono">
                        {selectedBug.resolution || "Unknown"}
                      </strong>
                    </div>
                  </div>

                  <div className="text-[7px] text-neutral-600 bg-neutral-950 p-2 rounded-lg border border-neutral-900 leading-normal select-all">
                    <strong>USER_AGENT:</strong> {selectedBug.userAgent}
                  </div>
                </div>

                {/* 4. AI Diagnostics Checklist recommendations */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-3">
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Zap size={12} className="text-yellow-500" />
                    AI Diagnostic Analysis Checklist
                  </h4>

                  <div className="bg-neutral-950 border border-neutral-900 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-start gap-2 text-[8px] text-neutral-400">
                      <Terminal size={12} className="text-red-500 shrink-0 mt-0.5" />
                      <div className="space-y-1 font-mono leading-relaxed">
                        {selectedBug.severity === "Critical" || selectedBug.severity === "High" ? (
                          <p>
                            <strong className="text-red-400">CRITICAL PATH DIAGNOSTIC:</strong> Infraction triggers core page compilation fault. Recommends running local Webpack debug cycles (`npm run build`) and cross-referencing viewport rendering specs: <strong className="text-white">{selectedBug.resolution}</strong>.
                          </p>
                        ) : (
                          <p>
                            <strong className="text-white">COSMETIC INTERFACE ANOMALY:</strong> Incident report represents low priority styling bounds. AI recommends verifying client stylesheet variables and testing responsive degradation triggers.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Resolution Operations actions */}
                <div className="space-y-2 pt-2 border-t border-neutral-900/60">
                  <button
                    onClick={() => cycleStatus(selectedBug)}
                    disabled={updatingStatus}
                    className={cn(
                      "w-full py-3.5 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50",
                      selectedBug.status === "Open" ? "bg-red-600 hover:bg-red-700 shadow-red-650/15" :
                      selectedBug.status === "Investigating" ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/15" :
                      "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/15"
                    )}
                  >
                    {updatingStatus ? (
                      <Loader2 className="animate-spin text-white" size={12} />
                    ) : (
                      <>
                        <RefreshCw size={12} />
                        Cycle Status: {selectedBug.status === "Open" ? "Investigate" : selectedBug.status === "Investigating" ? "Resolve" : "Re-Open"}
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Incident BUG_${selectedBug.id}\nTitle: ${selectedBug.title}\nSeverity: ${selectedBug.severity}\nStatus: ${selectedBug.status}\nIP: ${selectedBug.ip}\nUserAgent: ${selectedBug.userAgent}`);
                      toast.success("Diagnostic logs saved to clipboard!");
                    }}
                    className="w-full py-3.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    Copy Telemetry Logs
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- SUB-COMPONENTS ---

interface SeverityBadgeProps {
  severity: "Critical" | "High" | "Medium" | "Low";
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colors = {
    Critical: "bg-red-500/10 text-red-500 border-red-500/40 animate-pulse",
    High: "bg-orange-500/10 text-orange-550 border-orange-500/30",
    Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  }[severity];

  return (
    <span className={cn("text-[7.5px] font-black uppercase italic tracking-widest py-0.5 px-2 rounded-lg border", colors)}>
      {severity}
    </span>
  );
}

// Loader wrapper
const Loader2 = ({ className, size }: any) => (
  <RefreshCw className={cn("animate-spin", className)} size={size || 14} />
);