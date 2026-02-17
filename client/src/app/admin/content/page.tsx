"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  FileText, Search, Filter, Eye, 
  Trash2, Star, Globe, Lock, 
  Layers, ExternalLink, Download,
  CheckCircle2, AlertCircle, TrendingUp,
  BrainCircuit, BookOpen, User, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/config/api";

// --- Types based on your API Response ---
interface NoteData {
  note: {
    _id: string;
    owner: string;
    title: string;
    visibility: string;
    thumbnail: string;
    generationDetails: {
      model: string;
      type: string;
      language: string;
      processingTime: number;
    };
    views: number;
    likes: number;
    createdAt: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    picture: string;
  } | null;
}

interface MappedContent {
  id: string;
  title: string;
  ownerName: string;
  ownerEmail: string;
  type: string; // 'Note'
  views: number;
  status: string; // 'public' | 'private'
  date: string;
  model: string;
  thumbnail: string;
}

export default function ContentArchive() {
  const [content, setContent] = useState<MappedContent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await api.get('/admin/creations', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.data.success && response.data.data.notes) {
          // Map API Response to UI Structure
          const mappedData: MappedContent[] = response.data.data.notes.map((item: NoteData) => ({
            id: item.note._id,
            title: item.note.title,
            ownerName: item.user ? item.user.name : "Unknown User",
            ownerEmail: item.user ? item.user.email : "N/A",
            type: "Note",
            views: item.note.views || 0,
            status: item.note.visibility,
            date: item.note.createdAt,
            model: item.note.generationDetails?.model || "Standard",
            thumbnail: item.note.thumbnail
          }));
          setContent(mappedData);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error("Failed to sync content archive");
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, []);

  // --- Actions ---

  const handleDelete = async (id: string) => {
    const originalContent = [...content];
    
    // Optimistic UI Update
    setContent(content.filter(item => item.id !== id));
    toast.loading("Redacting artifact...");

    try {
      const token = localStorage.getItem('authToken');
      // Actual API Call
      await api.delete(`/admin/note/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.dismiss();
      toast.success(`ARTIFACT_${id.slice(0,6)} PERMANENTLY DELETED`);
    } catch (error) {
      // Revert if failed
      setContent(originalContent);
      console.error("Delete failed", error);
      toast.dismiss();
      toast.error("Deletion failed. Access Denied.");
    }
  };

  const toggleVisibility = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "public" ? "private" : "public";
    
    // Optimistic UI Update
    setContent(content.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));

    try {
      const token = localStorage.getItem('authToken');
      await api.put(`/admin/note/${id}/visibility`, { visibility: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.info(`VISIBILITY_MOD: ${id.slice(0,6)} set to ${newStatus.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to update visibility");
      // Revert
      setContent(content.map(item => 
        item.id === id ? { ...item, status: currentStatus } : item
      ));
    }
  };

  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(searchLower) || 
                            item.ownerName.toLowerCase().includes(searchLower) ||
                            item.ownerEmail.toLowerCase().includes(searchLower);
      
      // Since API currently only returns Notes, this filter is mostly prepared for future expansion
      const matchesTab = activeTab === "All" || item.type === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [content, searchQuery, activeTab]);

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER & METRICS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
             Knowledge_<span className="text-red-600 underline decoration-red-600/20 underline-offset-8">Archives</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            Indexing Artifacts across Neural Nodes
          </p>
        </div>
        
        <div className="flex gap-4">
           <ContentMetric icon={FileText} label="Total Notes" val={content.length.toString()} color="text-red-500" />
           <ContentMetric icon={TrendingUp} label="Total Views" val={content.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()} color="text-blue-500" />
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-600 transition-colors" size={16} />
            <input 
              placeholder="Search Artifact Title, Creator ID or Email..." 
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
                     <TableHead label="Stats" />
                     <TableHead label="Visibility" />
                     <TableHead label="Operations" />
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                       <tr><td colSpan={6} className="p-10 text-center text-xs font-mono uppercase text-neutral-500 animate-pulse">Retrieving Data Stream...</td></tr>
                    ) : filteredContent.length === 0 ? (
                       <tr><td colSpan={6} className="p-10 text-center text-xs font-mono uppercase text-neutral-500">No Artifacts Found</td></tr>
                    ) : (
                      filteredContent.map((item) => (
                        <motion.tr 
                          layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          key={item.id} className="group hover:bg-white/[0.02] transition-colors"
                        >
                           <td className="p-6 align-top">
                              <span className="text-[10px] font-mono font-black text-neutral-500 group-hover:text-red-500 transition-colors">
                                {item.id.substring(item.id.length - 8)}
                              </span>
                           </td>
                           <td className="p-6">
                              <div className="max-w-[300px]">
                                 <p className="text-[10px] font-black uppercase text-white tracking-widest mb-1 line-clamp-2 leading-relaxed">
                                   {item.title}
                                 </p>
                                 <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-[7px] font-bold border-white/10 text-neutral-500 px-1.5 py-0.5 rounded-sm">
                                      {item.type.toUpperCase()}
                                    </Badge>
                                    <span className="text-[8px] font-mono text-neutral-600">
                                      {new Date(item.date).toLocaleDateString()}
                                    </span>
                                    {item.model && (
                                      <span className="text-[7px] font-bold text-blue-500 flex items-center gap-1">
                                        <Cpu size={8} /> {item.model}
                                      </span>
                                    )}
                                 </div>
                              </div>
                           </td>
                           <td className="p-6 align-top">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500">
                                  <User size={12} />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-white uppercase">{item.ownerName}</p>
                                  <p className="text-[8px] text-neutral-600 truncate max-w-[150px]">{item.ownerEmail}</p>
                                </div>
                              </div>
                           </td>
                           <td className="p-6 align-top">
                              <div className="flex items-center gap-2 text-white font-black italic text-xs">
                                 <TrendingUp size={12} className="text-emerald-500" /> {item.views}
                              </div>
                           </td>
                           <td className="p-6 align-top">
                              <button onClick={() => toggleVisibility(item.id, item.status)} className="flex items-center gap-2">
                                 {item.status === "public" ? (
                                   <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                      <Globe size={10} /> <span className="text-[8px] font-black uppercase tracking-widest">Public</span>
                                   </div>
                                 ) : (
                                   <div className="flex items-center gap-2 text-neutral-500 bg-neutral-800 px-3 py-1 rounded-full border border-white/5">
                                      <Lock size={10} /> <span className="text-[8px] font-black uppercase tracking-widest">Private</span>
                                   </div>
                                 )}
                              </button>
                           </td>
                           <td className="p-6 align-top text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-neutral-400 hover:text-white transition-all hover:bg-white/10">
                                    <ExternalLink size={14} />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(item.id)}
                                   className="p-2 bg-red-600/5 border border-red-600/10 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-600/10 transition-all"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           </td>
                        </motion.tr>
                      ))
                    )}
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
    <th className="p-6 text-[9px] font-black uppercase tracking-[0.4em] text-neutral-700 italic align-top">
       {label}
    </th>
  );
}