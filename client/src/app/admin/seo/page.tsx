"use client";

import React, { useState } from "react";
import { 
  Search, Globe, TrendingUp, BarChart3, 
  MousePointer2, Eye, Link as LinkIcon, 
  CheckCircle2, AlertCircle, RefreshCw,
  ExternalLink, ArrowUpRight, Network, 
  Activity, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// --- Mock SEO Data ---
const SEO_ARTIFACTS = [
  { id: "NT_101", title: "Quantum Physics: Wave-Particle Duality", views: 1240, clicks: 180, ctr: "14.5%", indexed: true, position: 3.2, domain: "papertub.in" },
  { id: "NT_104", title: "Next.js 15 Server Components Guide", views: 2100, clicks: 420, ctr: "20.0%", indexed: true, position: 1.8, domain: "papertub.in" },
  { id: "NT_108", title: "Compiler Design: LALR Parsing", views: 450, clicks: 12, ctr: "2.6%", indexed: false, position: 45.0, domain: "gatecse.in" },
  { id: "NT_110", title: "Node.js Event Loop Deep Dive", views: 890, clicks: 110, ctr: "12.3%", indexed: true, position: 8.5, domain: "heartecho.in" },
];

export default function SEOTracker() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeDomain, setActiveDomain] = useState("All Domains");

  const syncSearchConsole = () => {
    setIsSyncing(true);
    toast.loading("Requesting Indexing Status from GSC API...");
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Indexing Data Synced Successfully.");
    }, 2000);
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER & GLOBAL METRICS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
             SEO_<span className="text-red-600">Visibility</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            Search Engine Indexing & Traffic Analytics
          </p>
        </div>
        
        <button 
          onClick={syncSearchConsole}
          disabled={isSyncing}
          className="flex items-center gap-3 px-8 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
        >
          {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Network size={14} />}
          {isSyncing ? "SYNCING_GSC" : "SYNC_SEARCH_CONSOLE"}
        </button>
      </div>

      {/* TOP ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <SEOMetric label="Total Impressions" value="84.2K" trend="+22%" icon={Eye} color="text-blue-500" />
         <SEOMetric label="Avg. Position" value="12.4" trend="-1.5" icon={TrendingUp} color="text-red-500" />
         <SEOMetric label="Total Clicks" value="12,402" trend="+8%" icon={MousePointer2} color="text-emerald-500" />
         <SEOMetric label="Indexing Rate" value="92%" trend="+4%" icon={CheckCircle2} color="text-purple-500" />
      </div>

      {/* DOMAIN & SEARCH FILTER */}
      <div className="flex flex-col lg:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-600 transition-colors" size={16} />
            <input 
              placeholder="Filter by Note Title or Artifact ID..." 
              className="w-full bg-black border border-white/5 h-16 pl-14 rounded-3xl focus:border-red-600/50 text-[10px] font-black uppercase tracking-widest text-white outline-none"
            />
         </div>
         
         <div className="flex bg-black border border-white/5 rounded-3xl p-1.5 gap-1">
            {["All Domains", "papertub.in", "heartecho.in", "gatecse.in"].map((domain) => (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain)}
                className={cn(
                  "px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                  activeDomain === domain ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-neutral-600 hover:text-white"
                )}
              >
                {domain === "All Domains" ? "Global" : domain.split('.')[0]}
              </button>
            ))}
         </div>
      </div>

      {/* SEARCH PERFORMANCE TABLE */}
      <div className="bg-black border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5">
                     <TableHead label="Artifact_Node" />
                     <TableHead label="Indexing_Status" />
                     <TableHead label="Impressions" />
                     <TableHead label="Clicks" />
                     <TableHead label="CTR" />
                     <TableHead label="Avg_Pos" />
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                  {SEO_ARTIFACTS.map((item) => (
                    <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="p-6">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-white tracking-widest mb-1">{item.title}</span>
                             <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-red-500 uppercase italic">{item.domain}</span>
                                <span className="text-[8px] font-mono text-neutral-700">{item.id}</span>
                             </div>
                          </div>
                       </td>
                       <td className="p-6">
                          {item.indexed ? (
                            <div className="flex items-center gap-2 text-emerald-500">
                               <CheckCircle2 size={12} />
                               <span className="text-[9px] font-black uppercase tracking-widest">Indexed</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600 animate-pulse">
                               <AlertCircle size={12} />
                               <span className="text-[9px] font-black uppercase tracking-widest">Crawled_Not_Indexed</span>
                            </div>
                          )}
                       </td>
                       <td className="p-6">
                          <span className="text-xs font-black text-white italic tracking-tighter">{item.views.toLocaleString()}</span>
                       </td>
                       <td className="p-6">
                          <span className="text-xs font-black text-neutral-400 italic tracking-tighter">{item.clicks}</span>
                       </td>
                       <td className="p-6">
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-neutral-500">
                             {item.ctr}
                          </Badge>
                       </td>
                       <td className="p-6">
                          <div className="flex items-center gap-2">
                             <span className={cn(
                                "text-sm font-black italic",
                                item.position < 5 ? "text-emerald-500" : item.position < 20 ? "text-blue-500" : "text-neutral-600"
                             )}>#{item.position}</span>
                             <ArrowUpRight size={10} className="text-neutral-800" />
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* PAGE BOTTOM: RE-INDEXING PROTOCOL */}
      <div className="grid md:grid-cols-2 gap-8">
         <Card className="bg-neutral-900/20 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl border-t-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6 flex items-center gap-3">
               <Zap size={14} className="text-red-500" /> Index_Injection_Protocol
            </h3>
            <p className="text-[9px] text-neutral-500 uppercase font-bold leading-relaxed mb-8">
               Force Google to crawl specific URLs from your PaperTube node. Use this for newly generated notes that aren't showing up.
            </p>
            <div className="flex gap-4">
               <input 
                 type="text" 
                 placeholder="Enter full URL to index..." 
                 className="flex-1 bg-black border border-white/5 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-red-600/40 transition-all" 
               />
               <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase text-white hover:bg-white/10 transition-all">
                  Inject
               </button>
            </div>
         </Card>

         <Card className="bg-black border border-white/5 rounded-[3rem] p-10 shadow-2xl border-t-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-6 flex items-center gap-3">
               <Activity size={14} className="text-blue-500" /> Site_Map_Status
            </h3>
            <div className="space-y-4">
               <SitemapStatus domain="papertub.in" status="Synced" date="1h ago" />
               <SitemapStatus domain="heartecho.in" status="Synced" date="12h ago" />
               <SitemapStatus domain="gatecse.in" status="Warning" date="2d ago" />
            </div>
         </Card>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SEOMetric({ label, value, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-black border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/40 transition-all duration-500 shadow-xl">
       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"><Icon size={120}/></div>
       <div className={cn("p-4 rounded-2xl bg-white/5 w-fit mb-6", color)}><Icon size={20}/></div>
       <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-1">{label}</p>
       <h4 className="text-3xl font-black italic tracking-tighter text-white mb-2">{value}</h4>
       <div className="flex items-center gap-2">
          <span className={cn("text-[9px] font-black", trend.startsWith('+') ? "text-emerald-500" : "text-red-600")}>{trend}</span>
          <span className="text-[8px] font-bold text-neutral-700 uppercase">vs Last Cycle</span>
       </div>
    </div>
  );
}

function SitemapStatus({ domain, status, date }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
       <div>
          <p className="text-[9px] font-black uppercase text-white">{domain}</p>
          <p className="text-[8px] font-bold text-neutral-600 uppercase mt-1">Last Sync: {date}</p>
       </div>
       <Badge className={cn(
         "text-[8px] font-black uppercase px-3 py-1 rounded-lg",
         status === "Synced" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-600/10 text-red-600"
       )}>{status}</Badge>
    </div>
  );
}

function TableHead({ label }: { label: string }) {
  return (
    <th className="p-6 text-[9px] font-black uppercase tracking-[0.4em] text-neutral-700 italic">
       {label}
    </th>
  );
}