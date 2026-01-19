"use client";

import React, { useState } from "react";
import { 
  FileText, Search, Filter, Eye, 
  Trash2, Star, Globe, Lock, 
  Layers, ExternalLink, Download,
  CheckCircle2, AlertCircle, TrendingUp,
  BrainCircuit, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// --- Mock Archive Data ---
const INITIAL_CONTENT = [
  { id: "NT_101", title: "Quantum Physics: Wave-Particle Duality", owner: "Om_Prime", type: "Note", views: 1240, status: "Public", date: "15 Jan 2026" },
  { id: "FL_202", title: "React Hooks Mastery", owner: "Aryan_88", type: "Flashcards", views: 850, status: "Private", date: "16 Jan 2026" },
  { id: "QZ_303", title: "Database Normalization Quiz", owner: "Rahul_Forge", type: "Quiz", views: 420, status: "Public", date: "17 Jan 2026" },
  { id: "NT_104", title: "Next.js 15 Server Components", owner: "Sneha_Dev", type: "Note", views: 2100, status: "Public", date: "18 Jan 2026" },
];

export default function ContentArchive() {
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const handleDelete = (id: string) => {
    setContent(content.filter(item => item.id !== id));
    toast.error(`ARTIFACT_${id} PERMANENTLY REDACTED`);
  };

  const toggleVisibility = (id: string) => {
    setContent(content.map(item => {
      if (item.id === id) {
        const newStatus = item.status === "Public" ? "Private" : "Public";
        toast.info(`VISIBILITY_MOD: ${id} set to ${newStatus}`);
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER & METRICS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
             Knowledge_<span className="text-red-600 underline decoration-red-600/20 underline-offset-8">Archives</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            Indexing Artifacts across 10+ Neural Nodes
          </p>
        </div>
        
        <div className="flex gap-4">
           <ContentMetric icon={FileText} label="Notes" val="8,240" color="text-red-500" />
           <ContentMetric icon={BrainCircuit} label="Quizzes" val="2,102" color="text-blue-500" />
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-600 transition-colors" size={16} />
            <input 
              placeholder="Search Artifact Title or Creator..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/5 h-16 pl-14 rounded-3xl focus:border-red-600/50 text-[10px] font-black uppercase tracking-widest text-white outline-none"
            />
         </div>
         
         <div className="flex bg-black border border-white/5 rounded-3xl p-1.5 gap-1">
            {["All", "Note", "Flashcards", "Quiz"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-neutral-600 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
      </div>

      {/* CONTENT ARCHIVE TABLE */}
      <div className="bg-black border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5">
                     <TableHead label="Artifact_ID" />
                     <TableHead label="Knowledge_Unit" />
                     <TableHead label="Creator_Node" />
                     <TableHead label="View_Flux" />
                     <TableHead label="Visibility" />
                     <TableHead label="Operations" />
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                  <AnimatePresence mode="popLayout">
                    {filteredContent.map((item) => (
                      <motion.tr 
                        layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        key={item.id} className="group hover:bg-white/[0.02] transition-colors"
                      >
                         <td className="p-6">
                            <span className="text-[10px] font-mono font-black text-neutral-500 group-hover:text-red-500">{item.id}</span>
                         </td>
                         <td className="p-6">
                            <div>
                               <p className="text-[10px] font-black uppercase text-white tracking-widest mb-1">{item.title}</p>
                               <p className="text-[8px] font-bold text-neutral-600 uppercase italic">{item.type} // {item.date}</p>
                            </div>
                         </td>
                         <td className="p-6">
                            <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-neutral-500 py-1">
                               {item.owner}
                            </Badge>
                         </td>
                         <td className="p-6">
                            <div className="flex items-center gap-2 text-white font-black italic text-xs">
                               <TrendingUp size={12} className="text-emerald-500" /> {item.views}
                            </div>
                         </td>
                         <td className="p-6">
                            <button onClick={() => toggleVisibility(item.id)} className="flex items-center gap-2">
                               {item.status === "Public" ? (
                                 <div className="flex items-center gap-2 text-emerald-500">
                                    <Globe size={12} /> <span className="text-[8px] font-black uppercase tracking-widest">Public</span>
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-2 text-red-500">
                                    <Lock size={12} /> <span className="text-[8px] font-black uppercase tracking-widest">Private</span>
                                 </div>
                               )}
                            </button>
                         </td>
                         <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                               <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-all">
                                  <ExternalLink size={14} />
                               </button>
                               <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-400 hover:text-yellow-500 transition-all">
                                  <Star size={14} />
                               </button>
                               <button 
                                 onClick={() => handleDelete(item.id)}
                                 className="p-2.5 bg-red-600/5 border border-red-600/10 rounded-xl text-neutral-600 hover:text-red-500 transition-all"
                               >
                                  <Trash2 size={14} />
                               </button>
                            </div>
                         </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
         
         {/* Footer Info */}
         <div className="p-8 bg-white/[0.01] border-t border-white/5 text-center">
            <p className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.5em]">Total Archives Indexed: {filteredContent.length} // Sync_Stable</p>
         </div>
      </div>
    </div>
  );
}

// --- Visual Sub-Components ---

function ContentMetric({ icon: Icon, label, val, color }: any) {
  return (
    <div className="hidden sm:flex items-center gap-4 bg-black border border-white/5 px-6 py-3 rounded-2xl">
       <Icon size={16} className={color} />
       <div>
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-sm font-black italic text-white leading-none mt-1">{val}</p>
       </div>
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