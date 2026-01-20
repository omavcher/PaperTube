"use client";

import React, { useEffect, useState } from "react";
import { 
  Bug, AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, Image as ImageIcon, X,
  Monitor, Smartphone, Globe, Terminal,
  AlertOctagon, Eye, AlertCircle, ExternalLink,
  User, Shield, Globe as GlobeIcon, FileText
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
  const [error, setError] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    return "";
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
  useEffect(() => {
    const fetchBugData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setError("Authentication required");
          toast.error("Please log in to view bug reports");
          return;
        }
        
        const response = await api.get('/admin/bugs', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        console.log('Bug Reports Data:', response.data);
        
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
      }
    };

    fetchBugData();
  }, []);

  const cycleStatus = (id: string, currentStatus: string) => {
    const statusFlow: { [key: string]: string } = {
      "Open": "Investigating",
      "Investigating": "Resolved",
      "Resolved": "Open"
    };
    const nextStatus = statusFlow[currentStatus];
    
    setBugs(bugs.map(bug => bug.id === id ? { ...bug, status: nextStatus as any } : bug));
    
    if (nextStatus === "Resolved") {
      toast.success(`BUG_${id} RESOLVED`);
    } else {
      toast.info(`STATUS UPDATE: ${id} -> ${nextStatus.toUpperCase()}`);
    }
  };

  const filteredBugs = bugs.filter(bug => {
    const statusMatch = statusFilter === "All" || bug.status === statusFilter;
    const searchMatch = !searchQuery || 
      bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const criticalCount = bugs.filter(b => 
    (b.severity === "Critical" || b.severity === "High") && 
    b.status !== "Resolved"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Loading Bug Reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 rounded-3xl bg-red-600/5 border border-red-600/20 max-w-md">
          <AlertTriangle size={24} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Error Loading Data</h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-10 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
             Bug_<span className="text-red-600">Tracker</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            System Health Monitor // {bugs.length} Active Tickets
          </p>
        </div>
        
        {criticalCount > 0 && (
          <div className="px-4 md:px-6 py-3 bg-red-600/10 border border-red-600/30 rounded-2xl flex items-center gap-3 md:gap-4 animate-pulse">
             <AlertOctagon size={18} className="text-red-600" />
             <div>
                <p className="text-[10px] font-black uppercase text-red-600 tracking-widest leading-none">Critical Alert</p>
                <p className="text-sm font-black italic text-white leading-none mt-1">{criticalCount} High Priority Issues</p>
             </div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-600 transition-colors" size={16} />
          <input 
            placeholder="Search by ID, title, or description..." 
            className="w-full bg-black border border-white/5 h-12 md:h-16 pl-14 pr-4 rounded-3xl focus:border-red-600/50 text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-white outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 bg-black border border-white/5 rounded-3xl p-1.5">
          {["All", "Open", "Investigating", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 md:px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                statusFilter === status ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-neutral-600 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Total Reports</p>
          <p className="text-xl md:text-2xl font-black text-white">{bugs.length}</p>
        </div>
        <div className="bg-black border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Critical Issues</p>
          <p className="text-xl md:text-2xl font-black text-red-500">{criticalCount}</p>
        </div>
        <div className="bg-black border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Open Tickets</p>
          <p className="text-xl md:text-2xl font-black text-orange-500">
            {bugs.filter(b => b.status === "Open").length}
          </p>
        </div>
        <div className="bg-black border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Resolved</p>
          <p className="text-xl md:text-2xl font-black text-emerald-500">
            {bugs.filter(b => b.status === "Resolved").length}
          </p>
        </div>
      </div>

      {/* BUG LIST VIEW */}
      <div className="space-y-4">
        {filteredBugs.length === 0 ? (
          <div className="text-center py-12">
            <Bug size={48} className="text-neutral-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Bugs Found</h3>
            <p className="text-sm text-neutral-500">
              {searchQuery || statusFilter !== "All" 
                ? "No bugs match your current filters."
                : "No bug reports found in the system."
              }
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredBugs.map((bug) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={bug.id}
                className={cn(
                  "group relative overflow-hidden bg-black border rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 transition-all",
                  bug.status === "Resolved" ? "border-white/5 opacity-60 hover:opacity-100" : 
                  bug.severity === "Critical" || bug.severity === "High" ? 
                    "border-red-600/30 shadow-[0_0_20px_rgba(220,38,38,0.1)]" : 
                    "border-white/5 hover:border-white/10"
                )}
              >
                {/* Severity Stripe */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 md:w-2", 
                  bug.severity === "Critical" ? "bg-red-600" : 
                  bug.severity === "High" ? "bg-orange-500" :
                  bug.severity === "Medium" ? "bg-yellow-500" : "bg-blue-500"
                )} />

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between pl-4 md:pl-6">
                  {/* LEFT: Info */}
                  <div className="space-y-3 md:space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                      <span className="text-[10px] font-mono font-black text-neutral-500">{bug.id}</span>
                      <SeverityBadge severity={bug.severity} />
                      <StatusBadge status={bug.status} />
                    </div>
                    
                    <div>
                      <h3 className="text-base md:text-lg font-black italic uppercase text-white tracking-tight mb-2">
                        {bug.title}
                      </h3>
                      <p className="text-xs md:text-sm text-neutral-400 mb-3 line-clamp-2">
                        {bug.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                          <User size={12} /> 
                          <span className="truncate max-w-[100px] md:max-w-none">User: {bug.userId.substring(0, 8)}...</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={12} /> {bug.date}
                        </span>
                        <span className="flex items-center gap-2">
                          {bug.system.includes("Mobile") ? <Smartphone size={12}/> : <Monitor size={12}/>} 
                          {bug.system.split('/')[0]}
                        </span>
                        <span className="flex items-center gap-2">
                          <GlobeIcon size={12}/> IP: {bug.ip}
                        </span>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-[8px]">
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-neutral-500 font-bold mb-1">Resolution</div>
                          <div className="text-white font-mono">{bug.resolution}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-neutral-500 font-bold mb-1">Browser</div>
                          <div className="text-white truncate">{bug.metadata.userAgent.split(' ').find(p => p.includes('/')) || 'Unknown'}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-neutral-500 font-bold mb-1">Reported</div>
                          <div className="text-white">{new Date(bug.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Actions & Evidence */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:border-l border-white/5 md:pl-6">
                    {bug.proof && (
                      <button 
                        onClick={() => setSelectedEvidence(bug.proof)}
                        className="relative group/btn flex flex-col items-center justify-center h-20 md:h-24 w-full md:w-24 bg-neutral-950 border border-white/10 rounded-xl md:rounded-2xl overflow-hidden hover:border-red-500/50 transition-all"
                      >
                        <img 
                          src={bug.proof} 
                          alt="proof" 
                          className="absolute inset-0 object-cover opacity-30 grayscale group-hover/btn:grayscale-0 group-hover/btn:opacity-50 transition-all"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop";
                          }}
                        />
                        <div className="relative z-10 p-2 bg-black/60 backdrop-blur-sm rounded-lg text-neutral-300 group-hover/btn:text-red-500 transition-colors">
                          <Eye size={18} />
                        </div>
                        <span className="relative z-10 text-[8px] font-black uppercase tracking-widest mt-1 text-neutral-400">Evidence</span>
                      </button>
                    )}

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      <StatusButton 
                        status={bug.status} 
                        onClick={() => cycleStatus(bug.id, bug.status)} 
                      />
                      <button 
                        onClick={() => window.open(bug.proof, '_blank')}
                        className="flex items-center justify-center gap-2 w-full md:w-40 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:border-white/20 transition-all"
                      >
                        <ExternalLink size={12} />
                        Open Full Size
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* EVIDENCE VIEWER MODAL */}
      <AnimatePresence>
        {selectedEvidence && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedEvidence(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full bg-neutral-900 border border-white/10 rounded-2xl md:rounded-[3rem] p-4 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 md:px-6 py-4 mb-2">
                <h3 className="text-sm font-black uppercase italic tracking-widest text-white flex items-center gap-3">
                  <ImageIcon size={18} className="text-red-500"/> Evidence Viewer
                </h3>
                <button 
                  onClick={() => setSelectedEvidence(null)} 
                  className="p-2 bg-white/5 hover:bg-red-600/20 rounded-full text-neutral-400 hover:text-red-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="rounded-xl md:rounded-[2.5rem] overflow-hidden border border-white/5 bg-black relative h-[60vh] md:h-[70vh]">
                <img 
                  src={selectedEvidence} 
                  alt="evidence full" 
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop";
                  }}
                />
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Components ---

interface SeverityBadgeProps {
  severity: "Critical" | "High" | "Medium" | "Low";
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colors = {
    Critical: "bg-red-600/10 text-red-600 border-red-600/50 animate-pulse",
    High: "bg-orange-500/10 text-orange-500 border-orange-500/50",
    Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50",
    Low: "bg-blue-500/10 text-blue-500 border-blue-500/50",
  }[severity];

  return (
    <Badge variant="outline" className={cn("text-[9px] font-black uppercase italic tracking-widest py-1 px-3 border", colors)}>
      {severity === "Critical" && <AlertTriangle size={10} className="mr-2" />}
      {severity}
    </Badge>
  );
}

interface StatusBadgeProps {
  status: "Open" | "Investigating" | "Resolved";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    Open: "bg-red-600/10 text-red-600 border-red-600/30",
    Investigating: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    Resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  }[status];

  return (
    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest py-1 px-3 border", colors)}>
      {status}
    </Badge>
  );
}

interface StatusButtonProps {
  status: "Open" | "Investigating" | "Resolved";
  onClick: () => void;
}

function StatusButton({ status, onClick }: StatusButtonProps) {
  const config = {
    Open: { 
      icon: AlertCircle, 
      text: "Open Ticket", 
      bg: "bg-red-600", 
      hover: "hover:bg-red-700",
      iconSize: 14 
    },
    Investigating: { 
      icon: Clock, 
      text: "Investigating", 
      bg: "bg-orange-500", 
      hover: "hover:bg-orange-600",
      iconSize: 14 
    },
    Resolved: { 
      icon: CheckCircle2, 
      text: "Resolved", 
      bg: "bg-emerald-500", 
      hover: "hover:bg-emerald-600",
      iconSize: 14 
    },
  }[status];
  
  const Icon = config.icon;

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full md:w-40 px-4 py-2 md:py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95",
        config.bg, config.hover
      )}
    >
      <span>{config.text}</span>
      <Icon size={config.iconSize} />
    </button>
  );
}