"use client";

import React, { useState } from "react";
import { 
  TrendingUp, ArrowLeft, Plus, Globe, CheckCircle2, 
  AlertCircle, ShieldAlert, BarChart3, Search, Calendar, 
  ExternalLink, Trash2, Award, Link2, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import initialBacklinks from "@/data/backlink-data.json";

// Types
interface BacklinkItem {
  id: string;
  domain: string;
  url: string;
  da: number;
  type: string;
  status: "Active" | "Missing" | "No-Follow";
  anchorText: string;
  dateDiscovered: string;
  lastChecked: string;
  notes: string;
}

export default function BacklinkDashboard() {
  const [links, setLinks] = useState<BacklinkItem[]>(initialBacklinks as BacklinkItem[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Missing" | "No-Follow">("All");
  
  // Form State
  const [newDomain, setNewDomain] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDa, setNewDa] = useState("30");
  const [newType, setNewType] = useState("Education Blog");
  const [newNotes, setNewNotes] = useState("");
  const [newAnchor, setNewAnchor] = useState("Paperxify");
  const [isAdding, setIsAdding] = useState(false);

  // Growth Chart Data (Mocking months)
  const growthData = [
    { month: "Jan", count: 8 },
    { month: "Feb", count: 15 },
    { month: "Mar", count: 24 },
    { month: "Apr", count: 32 },
    { month: "May", count: 42 },
    { month: "Jun", count: 50 },
  ];

  const maxVal = Math.max(...growthData.map(d => d.count));

  // Handlers
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !newUrl) {
      toast.error("Please fill in Domain and Target URL");
      return;
    }

    const newItem: BacklinkItem = {
      id: `link-${Date.now()}`,
      domain: newDomain,
      url: newUrl,
      da: parseInt(newDa) || 20,
      type: newType,
      status: "Active", // Defaults to Active when added manually
      anchorText: newAnchor || "Paperxify",
      dateDiscovered: new Date().toISOString().split("T")[0],
      lastChecked: new Date().toISOString(),
      notes: newNotes,
    };

    setLinks([newItem, ...links]);
    toast.success("Backlink target registered successfully!");
    
    // Reset form
    setNewDomain("");
    setNewUrl("");
    setNewNotes("");
    setNewAnchor("Paperxify");
    setIsAdding(false);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
    toast.success("Backlink entry removed.");
  };

  // Filtered links
  const filteredLinks = links.filter(link => {
    const matchesSearch = 
      link.domain.toLowerCase().includes(searchQuery.toLowerCase()) || 
      link.anchorText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" ? true : link.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = links.length;
  const activeCount = links.filter(l => l.status === "Active").length;
  const missingCount = links.filter(l => l.status === "Missing").length;
  const noFollowCount = links.filter(l => l.status === "No-Follow").length;
  const avgDa = Math.round(links.reduce((acc, curr) => acc + curr.da, 0) / (totalCount || 1));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12 pb-24 relative overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-950/10 blur-[120px] rounded-full opacity-40" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-950/10 blur-[120px] rounded-full opacity-25" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* Navigation Back */}
        <Link
          href="/admin/seo"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Back to GSC Panel
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
              Backlink_<span className="text-red-600">Authority</span>
            </h1>
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em]">
              Link Profile Health & Campaign Analytics
            </p>
          </div>
          
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
          >
            <Plus size={14} />
            Register Backlink
          </button>
        </div>

        {/* Form Expansion (Drawer/Section) */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-neutral-900/30 border border-white/5 p-8 rounded-[2rem] backdrop-blur-md">
                <form onSubmit={handleAddLink} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Referring Domain</label>
                    <input 
                      type="text" 
                      placeholder="e.g. edutopia.org" 
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      className="bg-black border border-white/5 rounded-xl h-12 px-4 text-xs text-white outline-none focus:border-red-600/40"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Target Page URL</label>
                    <input 
                      type="url" 
                      placeholder="https://edutopia.org/article/study-tools" 
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="bg-black border border-white/5 rounded-xl h-12 px-4 text-xs text-white outline-none focus:border-red-600/40"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Domain Authority (DA)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={newDa}
                      onChange={(e) => setNewDa(e.target.value)}
                      className="bg-black border border-white/5 rounded-xl h-12 px-4 text-xs text-white outline-none focus:border-red-600/40"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Anchor Text Used</label>
                    <input 
                      type="text" 
                      value={newAnchor}
                      onChange={(e) => setNewAnchor(e.target.value)}
                      className="bg-black border border-white/5 rounded-xl h-12 px-4 text-xs text-white outline-none focus:border-red-600/40"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Campaign Segment</label>
                    <select 
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="bg-black border border-white/5 rounded-xl h-12 px-4 text-xs text-white outline-none focus:border-red-600/40 appearance-none"
                    >
                      <option>Education Blog</option>
                      <option>Student Community</option>
                      <option>Tech Blog</option>
                      <option>University Portal</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Internal Notes</label>
                    <input 
                      type="text" 
                      placeholder="Guest post scheduled for publishing." 
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="bg-black border border-white/5 rounded-xl h-12 px-4 text-xs text-white outline-none focus:border-red-600/40"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAdding(false)}
                      className="px-6 py-3 bg-neutral-900 border border-white/5 text-xs text-neutral-400 rounded-xl hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-red-600 text-xs font-bold text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Register Link
                    </button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Registered Links" value={totalCount} icon={Link2} color="text-red-500" />
          <MetricCard label="Active Backlinks" value={activeCount} icon={CheckCircle2} color="text-emerald-500" />
          <MetricCard label="Average Authority" value={`DA ${avgDa}`} icon={Award} color="text-blue-500" />
          <MetricCard label="Health Issues (Missing)" value={missingCount} icon={AlertCircle} color="text-yellow-500" />
        </div>

        {/* GROWTH & ANALYSIS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trend Chart (2 Cols) */}
          <Card className="lg:col-span-2 bg-black border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                    <TrendingUp size={12} className="text-red-500" /> Acquisition_Velocity
                  </h3>
                  <p className="text-[8px] text-neutral-600 uppercase mt-1 font-bold">Monthly Cumulative Growth targets (6-Months)</p>
                </div>
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[8px] font-black uppercase">
                  Campaign Active
                </Badge>
              </div>

              {/* Chart Visualizer */}
              <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-white/5 relative">
                {growthData.map((data, index) => {
                  const pct = (data.count / maxVal) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center gap-3 flex-1 group z-10">
                      <div className="relative w-12 flex items-end justify-center">
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono text-white">
                          {data.count}
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${pct * 1.8}px` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="w-8 bg-gradient-to-t from-red-950 via-red-700 to-red-500 rounded-t-lg shadow-[0_0_15px_rgba(220,38,38,0.15)] group-hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      </div>
                      <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Health Distribution (1 Col) */}
          <Card className="bg-black border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6 flex items-center gap-2">
                <BarChart3 size={12} className="text-blue-500" /> Status_Distribution
              </h3>
              
              <div className="space-y-4 pt-4">
                <StatusItem label="Do-Follow (Active)" value={activeCount} percentage={Math.round((activeCount / (totalCount || 1)) * 100)} color="bg-emerald-500" />
                <StatusItem label="No-Follow" value={noFollowCount} percentage={Math.round((noFollowCount / (totalCount || 1)) * 100)} color="bg-amber-500" />
                <StatusItem label="Missing / Dead Link" value={missingCount} percentage={Math.round((missingCount / (totalCount || 1)) * 100)} color="bg-red-500" />
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 mt-6">
              <div className="flex items-center justify-between text-[9px] font-bold text-neutral-500 uppercase">
                <span>Verification Schedule</span>
                <span className="text-white">Daily 12:00 UTC</span>
              </div>
            </div>
          </Card>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-600 transition-colors" size={16} />
            <input 
              placeholder="Search by referring domain or anchor text..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/5 h-14 pl-14 rounded-2xl focus:border-red-600/50 text-[10px] font-black uppercase tracking-widest text-white outline-none"
            />
          </div>

          <div className="flex bg-black border border-white/5 rounded-2xl p-1 gap-1 overflow-x-auto no-scrollbar max-w-full">
            {(["All", "Active", "No-Follow", "Missing"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 flex-1 sm:flex-initial",
                  statusFilter === filter ? "bg-white text-black font-bold" : "text-neutral-500 hover:text-white"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE: SITES DIRECTORY (DESKTOP) */}
        <div className="hidden md:block bg-black border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5">
                  <th className="p-5 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 italic">Referring Site</th>
                  <th className="p-5 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 italic">Authority</th>
                  <th className="p-5 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 italic">Type</th>
                  <th className="p-5 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 italic">Anchor Text</th>
                  <th className="p-5 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 italic">Status</th>
                  <th className="p-5 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 italic text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <AnimatePresence>
                  {filteredLinks.map((link) => (
                    <motion.tr 
                      key={link.id}
                      layout
                      exit={{ opacity: 0, x: -10 }}
                      className="group hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-white tracking-widest mb-1">{link.domain}</span>
                          <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-neutral-500 font-mono flex items-center gap-1 hover:text-red-500 transition-colors truncate max-w-sm"
                          >
                            {link.url} <ExternalLink size={10} />
                          </a>
                        </div>
                      </td>
                      <td className="p-5">
                        <Badge variant="outline" className="border-white/10 text-white font-mono text-[9px] px-2.5 py-0.5">
                          DA {link.da}
                        </Badge>
                      </td>
                      <td className="p-5">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{link.type}</span>
                      </td>
                      <td className="p-5">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                          {link.anchorText}
                        </span>
                      </td>
                      <td className="p-5">
                        {link.status === "Active" && (
                          <div className="flex items-center gap-1.5 text-emerald-500">
                            <CheckCircle2 size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                          </div>
                        )}
                        {link.status === "No-Follow" && (
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <ShieldAlert size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Nofollow</span>
                          </div>
                        )}
                        {link.status === "Missing" && (
                          <div className="flex items-center gap-1.5 text-red-600">
                            <AlertCircle size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Missing</span>
                          </div>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredLinks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                      No matching backlinks tracked.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS VIEW */}
        <div className="md:hidden space-y-4">
          {filteredLinks.length === 0 ? (
            <div className="p-10 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-600 bg-black border border-white/5 rounded-3xl">
              No matching backlinks tracked.
            </div>
          ) : (
            filteredLinks.map((link) => (
              <div key={link.id} className="bg-neutral-950 border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xs font-black uppercase text-white tracking-widest truncate">{link.domain}</h3>
                    <a 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-neutral-500 font-mono flex items-center gap-1 hover:text-red-500 transition-colors mt-1.5"
                    >
                      <span className="truncate max-w-[200px]">{link.url}</span> <ExternalLink size={10} className="flex-shrink-0" />
                    </a>
                  </div>

                  <div className="flex-shrink-0">
                    {link.status === "Active" && (
                      <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                        <CheckCircle2 size={10} />
                        <span className="text-[7px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    )}
                    {link.status === "No-Follow" && (
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10">
                        <ShieldAlert size={10} />
                        <span className="text-[7px] font-black uppercase tracking-widest">Nofollow</span>
                      </div>
                    )}
                    {link.status === "Missing" && (
                      <div className="flex items-center gap-1 text-red-500 bg-red-500/5 px-2.5 py-1 rounded-full border border-red-500/10 animate-pulse">
                        <AlertCircle size={10} />
                        <span className="text-[7px] font-black uppercase tracking-widest">Missing</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                  <div>
                    <p className="text-[7px] font-black text-neutral-600 uppercase">Authority</p>
                    <p className="text-[10px] font-black text-white italic mt-1">DA {link.da}</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-neutral-600 uppercase">Segment</p>
                    <p className="text-[9px] font-black text-neutral-400 mt-1 truncate max-w-[80px] mx-auto">{link.type}</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-neutral-600 uppercase">Anchor</p>
                    <p className="text-[9px] font-bold text-neutral-500 mt-1 truncate max-w-[80px] mx-auto">{link.anchorText}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-wider text-neutral-400 hover:text-white transition-all hover:bg-white/10 flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={10} /> Visit Link
                  </a>
                  <button 
                    onClick={() => handleDeleteLink(link.id)}
                    className="flex-1 py-2.5 bg-red-600/5 border border-red-600/10 rounded-xl text-[8px] font-black uppercase tracking-wider text-neutral-500 hover:text-red-500 hover:bg-red-600/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

// Sub components
function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-black border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-red-600/40 transition-all duration-500 shadow-xl flex flex-col justify-between">
      <div className={cn("p-3.5 rounded-2xl bg-white/5 w-fit mb-4", color)}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-1">{label}</p>
        <h4 className="text-2xl font-black italic tracking-tighter text-white">{value}</h4>
      </div>
    </div>
  );
}

function StatusItem({ label, value, percentage, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
        <span className="text-neutral-400">{label}</span>
        <span className="text-white">{value} ({percentage}%)</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}
