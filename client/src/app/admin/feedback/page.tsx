"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  MessageSquare, Star, CheckCircle, Flame, 
  Trash2, Search, Filter, User, 
  MapPin, Clock, ShieldCheck, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";

interface Feedback {
  _id: string;
  userId: string;
  name: string;
  email: string;
  rating: number;
  quote: string;
  location?: string;
  profilePicture?: string;
  status: 'pending' | 'approved' | 'featured';
  createdAt: string;
}

export default function FeedbackLedger() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await api.get('/admin/feedback', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFeedbacks(response.data.data || []);
    } catch (error) {
      console.error("Feedback Sync Error:", error);
      toast.error("LEDGER_SYNC_FAILURE: Feedback data unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await api.patch(`/admin/feedback/${id}`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(`STATUS_UPDATED: ${newStatus.toUpperCase()}`);
      fetchFeedbacks();
    } catch (error) {
      toast.error("UPDATE_CRITICAL_FAILURE");
    }
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(fb => {
      const matchesSearch = fb.name.toLowerCase().includes(searchQuery.toLowerCase()) || fb.quote.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || fb.status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [feedbacks, searchQuery, statusFilter]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-10 pb-20">
      {/* --- Tactical Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Feedback_<span className="text-red-600 underline decoration-red-600/30 underline-offset-8">Intelligence</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" />
            Core_Engine: User_Sentiment_Analysis_Active
          </p>
        </div>
      </div>

      {/* --- Sentiment HUD --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Avg Rating" val={(feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length || 0).toFixed(1)} icon={Star} color="text-yellow-500" />
        <StatsCard label="Pending Approval" val={feedbacks.filter(f => f.status === 'pending').length} icon={Clock} color="text-orange-500" />
        <StatsCard label="Total Submissions" val={feedbacks.length} icon={MessageSquare} color="text-blue-500" />
      </div>

      {/* --- Filter Bar --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
          <Input 
            placeholder="Filter by Personnel or Content..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black border-white/5 h-16 pl-14 rounded-3xl focus:border-red-600/50 text-[10px] font-black uppercase tracking-widest text-white shadow-inner"
          />
        </div>
        <div className="flex bg-black border border-white/5 rounded-3xl p-1.5 gap-1">
          {["All", "Pending", "Approved", "Featured"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                statusFilter === s ? "bg-red-600 text-white" : "text-neutral-600 hover:text-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* --- Feedback Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredFeedbacks.map((fb) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={fb._id}
              className="bg-black border border-white/5 rounded-[2.5rem] p-8 hover:border-red-600/40 transition-all group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-neutral-800 to-black border border-white/10 flex items-center justify-center overflow-hidden">
                      {fb.profilePicture ? (
                        <img src={fb.profilePicture} alt="" className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <User className="text-neutral-600" size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black italic text-white uppercase tracking-tighter">{fb.name}</h4>
                      <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{fb.email}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "text-[8px] font-black uppercase px-3 py-1 rounded-full",
                    fb.status === 'featured' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    fb.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"
                  )}>
                    {fb.status}
                  </Badge>
                </div>

                <div className="mb-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < fb.rating ? "fill-red-600 text-red-600" : "text-neutral-800"} />
                    ))}
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed font-medium italic">"{fb.quote}"</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4 text-[9px] font-black text-neutral-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {fb.location || 'Global'}</span>
                    <span className="flex items-center gap-1"><Clock size={10}/> {new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {fb.status !== 'approved' && (
                      <ActionButton icon={CheckCircle} color="hover:text-emerald-500" onClick={() => handleUpdateStatus(fb._id, 'approved')} />
                    )}
                    {fb.status !== 'featured' && (
                      <ActionButton icon={Flame} color="hover:text-orange-500" onClick={() => handleUpdateStatus(fb._id, 'featured')} />
                    )}
                    <ActionButton icon={Trash2} color="hover:text-red-600" onClick={() => {}} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Internal UI Components ---

function StatsCard({ label, val, icon: Icon, color }: any) {
  return (
    <div className="bg-black border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl group">
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><Icon size={100}/></div>
      <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-4">{label}</p>
      <h4 className={cn("text-4xl font-black italic tracking-tighter leading-none", color)}>{val}</h4>
    </div>
  );
}

function ActionButton({ icon: Icon, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn("p-3 rounded-xl bg-white/5 border border-white/5 text-neutral-500 transition-all", color)}
    >
      <Icon size={14} />
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="h-12 w-12 border-t-2 border-red-600 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600">Decrypting_Feedback_Streams...</p>
    </div>
  );
}