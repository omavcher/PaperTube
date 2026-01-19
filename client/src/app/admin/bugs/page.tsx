"use client";

import React, { useState } from "react";
import { 
  Bug, AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, Image as ImageIcon, X,
  Monitor, Smartphone, Globe, Terminal,
  AlertOctagon, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// --- Mock Bug Data with Proof Images ---
// Using placeholder images from Unsplash for demo purposes
const MOCK_BUGS = [
  { 
    id: "BUG_0x7A", title: "Payment Gateway Timeout on Sankshipta", severity: "Critical", status: "Open", 
    reporter: "Om_Prime", date: "2m ago", system: "Chrome / Windows",
    proof: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: "BUG_0x7B", title: "Flashcard Image Alignment Issue on Mobile", severity: "Moderate", status: "Investigating", 
    reporter: "Aryan_88", date: "45m ago", system: "Safari / iOS",
    proof: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: "BUG_0x7C", title: "Typo in Vyavastha Dashboard Header", severity: "Low", status: "Open", 
    reporter: "Shadow_Node_4", date: "2h ago", system: "Firefox / Mac OS",
    proof: "https://images.unsplash.com/photo-1607706189992-eae578626c86?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: "BUG_0x7D", title: "Quiz Generator Producing Duplicate Options", severity: "Critical", status: "Resolved", 
    reporter: "Rahul_Dev", date: "1d ago", system: "Backend API Log",
    proof: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1000&auto=format&fit=crop"
  },
];

export default function BugTracker() {
  const [bugs, setBugs] = useState(MOCK_BUGS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  const cycleStatus = (id: string, currentStatus: string) => {
    const statusFlow: { [key: string]: string } = {
      "Open": "Investigating",
      "Investigating": "Resolved",
      "Resolved": "Open"
    };
    const nextStatus = statusFlow[currentStatus];
    
    setBugs(bugs.map(bug => bug.id === id ? { ...bug, status: nextStatus } : bug));
    
    if (nextStatus === "Resolved") {
      toast.success(`ANOMALY_${id} MITIGATED`);
    } else {
      toast.info(`STATUS UPDATE: ${id} -> ${nextStatus.toUpperCase()}`);
    }
  };

  const filteredBugs = bugs.filter(bug => 
    statusFilter === "All" || bug.status === statusFilter
  );

  const criticalCount = bugs.filter(b => b.severity === "Critical" && b.status !== "Resolved").length;

  return (
    <div className="space-y-10 pb-20 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
             Anomaly_<span className="text-red-600">Tracker</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            System Health Monitor // Active Tickets
          </p>
        </div>
        
        {criticalCount > 0 && (
          <div className="px-6 py-3 bg-red-600/10 border border-red-600/30 rounded-2xl flex items-center gap-4 animate-pulse">
             <AlertOctagon animate-pulse size={20} className="text-red-600" />
             <div>
                <p className="text-[10px] font-black uppercase text-red-600 tracking-widest leading-none">Critical Alert</p>
                <p className="text-sm font-black italic text-white leading-none mt-1">{criticalCount} Systems Compromised</p>
             </div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-600 transition-colors" size={16} />
            <input 
              placeholder="Search Anomaly ID or Keyword..." 
              className="w-full bg-black border border-white/5 h-16 pl-14 rounded-3xl focus:border-red-600/50 text-[10px] font-black uppercase tracking-widest text-white outline-none"
            />
         </div>
         
         <div className="flex bg-black border border-white/5 rounded-3xl p-1.5 gap-1">
            {["All", "Open", "Investigating", "Resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                  statusFilter === status ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-neutral-600 hover:text-white"
                )}
              >
                {status}
              </button>
            ))}
         </div>
      </div>

      {/* BUG LIST VIEW */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredBugs.map((bug) => (
            <motion.div
              layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              key={bug.id}
              className={cn(
                "group relative overflow-hidden bg-black border rounded-[2.5rem] p-6 md:p-8 transition-all",
                bug.status === "Resolved" ? "border-white/5 opacity-60 hover:opacity-100" : 
                bug.severity === "Critical" ? "border-red-600/30 shadow-[0_0_20px_rgba(220,38,38,0.1)]" : "border-white/5 hover:border-white/10"
              )}
            >
               {/* Severity Stripe */}
               <div className={cn("absolute left-0 top-0 bottom-0 w-2", 
                 bug.severity === "Critical" ? "bg-red-600" : 
                 bug.severity === "Moderate" ? "bg-orange-500" : "bg-blue-500"
               )} />

               <div className="flex flex-col md:flex-row gap-6 justify-between pl-6">
                  {/* LEFT: Info */}
                  <div className="space-y-4 flex-1">
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono font-black text-neutral-500">{bug.id}</span>
                        <SeverityBadge severity={bug.severity} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black italic uppercase text-white tracking-tight mb-2">{bug.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                           <span className="flex items-center gap-2"><Terminal size={12} /> Reported By: {bug.reporter}</span>
                           <span className="flex items-center gap-2"><Clock size={12} /> {bug.date}</span>
                           <span className="flex items-center gap-2">
                              {bug.system.includes("Mobile") ? <Smartphone size={12}/> : <Monitor size={12}/>} {bug.system}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* RIGHT: Actions & Evidence */}
                  <div className="flex items-center gap-4 md:border-l border-white/5 md:pl-6">
                     <button 
                       onClick={() => setSelectedEvidence(bug.proof)}
                       className="relative group/btn flex flex-col items-center justify-center h-24 w-24 bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all"
                     >
                        <img src={bug.proof} alt="proof" className="absolute inset-0 object-cover opacity-30 grayscale group-hover/btn:grayscale-0 group-hover/btn:opacity-50 transition-all" />
                        <div className="relative z-10 p-2 bg-black/60 backdrop-blur-sm rounded-xl text-neutral-300 group-hover/btn:text-red-500 transition-colors">
                          <Eye size={20} />
                        </div>
                        <span className="relative z-10 text-[8px] font-black uppercase tracking-widest mt-1 text-neutral-400">View Proof</span>
                     </button>

                     <div className="flex flex-col gap-3">
                        <StatusButton status={bug.status} onClick={() => cycleStatus(bug.id, bug.status)} />
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* EVIDENCE VIEWER MODAL */}
      <AnimatePresence>
        {selectedEvidence && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setSelectedEvidence(null)}
          >
             <motion.div 
               initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
               className="relative max-w-5xl w-full bg-neutral-900 border border-white/10 rounded-[3rem] p-4 overflow-hidden shadow-2xl"
               onClick={(e) => e.stopPropagation()}
             >
                <div className="flex items-center justify-between px-6 py-4 mb-2">
                   <h3 className="text-sm font-black uppercase italic tracking-widest text-white flex items-center gap-3">
                      <ImageIcon size={18} className="text-red-500"/> Evidence Artifact View
                   </h3>
                   <button onClick={() => setSelectedEvidence(null)} className="p-2 bg-white/5 hover:bg-red-600/20 rounded-full text-neutral-400 hover:text-red-500 transition-all">
                      <X size={20} />
                   </button>
                </div>
                <div className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-black relative h-[70vh]">
                   <img src={selectedEvidence} alt="evidence full" className="object-contain w-full h-full" />
                   <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Tactical Sub-Components ---

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    Critical: "bg-red-600/10 text-red-600 border-red-600/50 animate-pulse",
    Moderate: "bg-orange-500/10 text-orange-500 border-orange-500/50",
    Low: "bg-blue-500/10 text-blue-500 border-blue-500/50",
  }[severity];

  return (
    <Badge variant="outline" className={cn("text-[9px] font-black uppercase italic tracking-widest py-1 px-3 border", colors)}>
      {severity === "Critical" && <AlertTriangle size={10} className="mr-2" />}
      {severity}_Risk
    </Badge>
  );
}

function StatusButton({ status, onClick }: { status: "Open" | "Investigating" | "Resolved"; onClick: () => void }) {
  const config = {
    Open: { icon: AlertCircle, text: "Open Ticket", bg: "bg-red-600", hover: "hover:bg-red-700" },
    Investigating: { icon: Clock, text: "Investigating", bg: "bg-orange-500", hover: "hover:bg-orange-600" },
    Resolved: { icon: CheckCircle2, text: "Resolved", bg: "bg-emerald-500", hover: "hover:bg-emerald-600" },
  }[status];
  const Icon = config.icon;

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-40 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95",
        config.bg, config.hover
      )}
    >
       <span>{config.text}</span>
       <Icon size={14} />
    </button>
  );
}

import { AlertCircle } from "lucide-react";