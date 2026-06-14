"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  MessageSquare, Star, CheckCircle, Flame, 
  Trash2, Search, User, MapPin, Clock, 
  ShieldCheck, AlertCircle, X, Check, Copy, 
  Edit2, Sparkles, AlertOctagon, HelpCircle, Save
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
  adminResponse?: string;
}

export default function FeedbackLedger() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Drawer & Editing State
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editQuote, setEditQuote] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'featured'>('pending');
  const [adminResponse, setAdminResponse] = useState("");
  
  // AI Testimonial Booster Simulation State
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostedQuote, setBoostedQuote] = useState("");

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

  // Open Drawer and Populate Editing Fields
  const handleOpenDrawer = (fb: Feedback) => {
    setSelectedFeedback(fb);
    setEditName(fb.name || "");
    setEditEmail(fb.email || "");
    setEditLocation(fb.location || "");
    setEditQuote(fb.quote || "");
    setEditRating(fb.rating || 5);
    setEditStatus(fb.status || 'pending');
    setAdminResponse(fb.adminResponse || "");
    setBoostedQuote("");
  };

  // Update Feedback Details via API
  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('authToken');
      await api.patch(`/admin/feedback/${selectedFeedback._id}`, {
        name: editName,
        email: editEmail,
        location: editLocation,
        quote: editQuote,
        rating: editRating,
        status: editStatus,
        response: adminResponse
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("Feedback profile updated successfully");
      setSelectedFeedback(null);
      fetchFeedbacks();
    } catch (error) {
      console.error("Update Feedback Error:", error);
      toast.error("Failed to update feedback details");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Feedback via API
  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm("Are you sure you want to purge this testimonial node?")) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('authToken');
      await api.delete(`/admin/feedback/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("Testimonial deleted successfully");
      setSelectedFeedback(null);
      fetchFeedbacks();
    } catch (error) {
      console.error("Delete Feedback Error:", error);
      toast.error("Failed to delete testimonial");
    } finally {
      setIsUpdating(false);
    }
  };

  // Simulate AI Testimonial Booster
  const triggerAiBoost = () => {
    setIsBoosting(true);
    setTimeout(() => {
      // Formulate a polished marketing testimonial with highlighted conversions
      const phrases = [
        "Absolutely changed my study patterns! Saved me weeks of MCAT preparation.",
        "The mock exams and inline diagnostic checks are second to none. Worth every coin.",
        "Unbelievable user interface! The dashboard analytics helped me track details flawlessly."
      ];
      const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setBoostedQuote(`"🔥 Highly Recommend! ${editQuote.replace(/^["']|["']$/g, '')} — This is hands down the best tool I have used for tracking and mastering my practice papers!"`);
      setIsBoosting(false);
      toast.success("AI Testimonial Boost complete!");
    }, 1200);
  };

  const applyAiBoost = () => {
    if (boostedQuote) {
      setEditQuote(boostedQuote);
      toast.success("Boosted content applied to quote field");
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
    <div className="space-y-10 pb-20 px-4 md:px-0 font-mono text-white select-none">
      
      {/* --- Tactical Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-900 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-red-650 rounded-full animate-ping" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              Feedback_<span className="text-red-500">Intelligence</span>
            </h1>
          </div>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" />
            Sentiment_Core: User_Opinion_Ledger_Active
          </p>
        </div>
        <div className="text-[10px] text-neutral-450 bg-neutral-950 border border-neutral-850 px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
           LEDGER_COUNT: <span className="text-white font-bold">{feedbacks.length}</span>
        </div>
      </div>

      {/* --- Sentiment HUD --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard 
          label="Avg Rating Index" 
          val={(feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length || 0).toFixed(1)} 
          icon={Star} 
          color="text-yellow-500" 
        />
        <StatsCard 
          label="Pending Moderation" 
          val={feedbacks.filter(f => f.status === 'pending').length} 
          icon={Clock} 
          color="text-orange-500" 
          isPulse={feedbacks.filter(f => f.status === 'pending').length > 0}
        />
        <StatsCard 
          label="Total Testimonials" 
          val={feedbacks.length} 
          icon={MessageSquare} 
          color="text-blue-500" 
        />
      </div>

      {/* --- Filter Bar --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
          <Input 
            placeholder="Filter by Personnel or Content..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black border-neutral-900 h-16 pl-14 rounded-3xl focus:border-red-650/40 text-[10px] font-black uppercase tracking-widest text-white shadow-inner"
          />
        </div>
        <div className="flex bg-neutral-955 border border-neutral-900 rounded-3xl p-1.5 gap-1 overflow-x-auto">
          {["All", "Pending", "Approved", "Featured"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-5 py-2 rounded-2xl text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                statusFilter === s 
                  ? "bg-red-650 text-white shadow-[0_0_10px_rgba(239,68,68,0.25)]" 
                  : "text-neutral-500 hover:text-white"
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
              transition={{ duration: 0.2 }}
              key={fb._id}
              onClick={() => handleOpenDrawer(fb)}
              className="bg-neutral-950/40 border border-neutral-900 rounded-[2.2rem] p-6 hover:border-red-500/30 cursor-pointer transition-all group relative overflow-hidden backdrop-blur-md"
            >
              <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neutral-800 to-black border border-white/10 flex items-center justify-center overflow-hidden">
                        {fb.profilePicture ? (
                          <img src={fb.profilePicture} alt="" className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <User className="text-neutral-600" size={18} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">
                          {fb.name}
                        </h4>
                        <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">{fb.email}</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-[7px] font-bold uppercase px-3 py-1 rounded-full border",
                      fb.status === 'featured' ? "bg-orange-500/5 text-orange-400 border-orange-500/20" :
                      fb.status === 'approved' ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" :
                      "bg-neutral-900 text-neutral-500 border-neutral-850"
                    )}>
                      {fb.status}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <div className="flex gap-1 mb-2.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < fb.rating ? "fill-red-500 text-red-500" : "text-neutral-800"} />
                      ))}
                    </div>
                    <p className="text-neutral-300 text-[11px] leading-relaxed font-medium italic">
                      "{fb.quote}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-neutral-900/60 text-[8px] font-bold text-neutral-500 uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin size={10} className="text-red-500" /> {fb.location || 'Global'}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-red-500 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    MODERATE_NODE <Edit2 size={8} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredFeedbacks.length === 0 && (
           <div className="lg:col-span-2 text-center py-20 text-neutral-600 border border-neutral-900 border-dashed rounded-[2rem]">
              <AlertCircle className="mx-auto mb-2 opacity-50 text-red-500" size={32} />
              <p className="text-xs uppercase tracking-widest">No Feedback Logs Registered</p>
           </div>
        )}
      </div>

      {/* --- TELEMETRY SLIDING DRAWER --- */}
      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 z-[200] flex" onClick={() => setSelectedFeedback(null)}>
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
                    Feedback_Moderation_Inspector
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-1.5 hover:bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 font-mono text-[10px]">
                
                {/* Visual Identity */}
                <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neutral-800 to-black border border-white/10 flex items-center justify-center overflow-hidden">
                      {selectedFeedback.profilePicture ? (
                        <img src={selectedFeedback.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-neutral-500" size={18} />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white uppercase">{editName}</div>
                      <div className="text-[8px] text-neutral-500">{editEmail}</div>
                    </div>
                  </div>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">
                    ID: {selectedFeedback._id.substring(0,8)}
                  </span>
                </div>

                {/* Form Input fields */}
                <div className="space-y-4 bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl">
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Edit2 size={12} className="text-red-500" />
                    Modify Testimonial Parameters
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[7px] text-neutral-500 uppercase tracking-widest block mb-1">Contributor Name</label>
                      <Input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-black border-neutral-850 h-10 rounded-xl focus:border-red-500/40 text-[9px] uppercase font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[7px] text-neutral-500 uppercase tracking-widest block mb-1">Email Coordinates</label>
                      <Input 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="bg-black border-neutral-850 h-10 rounded-xl focus:border-red-500/40 text-[9px] text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[7px] text-neutral-500 uppercase tracking-widest block mb-1">Location Badging</label>
                        <Input 
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="bg-black border-neutral-850 h-10 rounded-xl focus:border-red-500/40 text-[9px] uppercase font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[7px] text-neutral-500 uppercase tracking-widest block mb-1">Rating Score</label>
                        <div className="flex items-center gap-1 h-10 bg-black border border-neutral-850 rounded-xl px-3">
                          {[1,2,3,4,5].map((star) => (
                            <button 
                              key={star} 
                              onClick={() => setEditRating(star)}
                              className="text-neutral-500 hover:scale-125 transition-transform"
                            >
                              <Star size={12} className={star <= editRating ? "fill-yellow-500 text-yellow-500" : "text-neutral-700"} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[7px] text-neutral-500 uppercase tracking-widest block mb-1">Testimonial Quote</label>
                      <textarea
                        value={editQuote}
                        onChange={(e) => setEditQuote(e.target.value)}
                        className="w-full bg-black border border-neutral-850 min-h-[70px] p-3 rounded-xl focus:border-red-500/40 text-[9px] text-neutral-300 font-sans outline-none focus:ring-1 focus:ring-red-500/20 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Sentiment Booster Simulator */}
                <div className="bg-neutral-905/30 border border-neutral-900 p-4 rounded-2xl space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-20 h-20 bg-red-650/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5">
                      <Sparkles size={12} className="text-yellow-500 animate-pulse" />
                      AI Testimonial Enhancer
                    </h4>
                    <button 
                      onClick={triggerAiBoost}
                      disabled={isBoosting}
                      className="text-[7px] bg-red-650 hover:bg-red-700 text-white px-2.5 py-1 rounded font-bold uppercase transition-all disabled:opacity-50"
                    >
                      {isBoosting ? 'BOOSTING...' : 'BOOST_QUOTE'}
                    </button>
                  </div>
                  {boostedQuote ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-black border border-neutral-900 rounded-xl text-[8px] leading-relaxed text-neutral-300 font-sans italic border-l-2 border-l-yellow-500">
                        {boostedQuote}
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={applyAiBoost}
                          className="text-[7px] bg-yellow-500/10 hover:bg-yellow-500/25 border border-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg uppercase transition-all flex items-center gap-1"
                        >
                          <Check size={8} /> Apply Enhanced Quote
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[7.5px] text-neutral-600 leading-normal">
                      Click BOOST to optimize vocabulary, correct syntax formatting, and highlight high-converting keywords for promo banners.
                    </div>
                  )}
                </div>

                {/* Status Moderation Selector */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl space-y-3">
                  <span className="text-[7px] text-neutral-500 uppercase tracking-widest block">Moderation Queue Allocation</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['pending', 'approved', 'featured'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setEditStatus(status)}
                        className={cn(
                          "py-2.5 rounded-xl border text-[8px] font-bold uppercase transition-all",
                          editStatus === status 
                            ? status === 'featured' ? "bg-orange-500/5 text-orange-400 border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.15)]" :
                              status === 'approved' ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]" :
                              "bg-neutral-900 text-neutral-300 border-neutral-700"
                            : "bg-neutral-950 border-neutral-900 text-neutral-600 hover:text-neutral-400"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Response coordinates */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl space-y-3">
                  <label className="text-[7px] text-neutral-500 uppercase tracking-widest block">Admin Response / Internal Note</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Enter internal comment or public response tag..."
                    className="w-full bg-black border border-neutral-850 min-h-[60px] p-3 rounded-xl focus:border-red-500/40 text-[9px] text-neutral-300 font-sans outline-none focus:ring-1 focus:ring-red-500/20 leading-relaxed placeholder:text-neutral-750"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 border-t border-neutral-900 pt-5">
                  <button
                    onClick={() => handleDeleteFeedback(selectedFeedback._id)}
                    disabled={isUpdating}
                    className="flex-1 py-3 bg-red-600/5 hover:bg-red-600/10 border border-red-655/20 hover:border-red-600/45 text-red-500 rounded-2xl text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 size={12} /> Purge Testimonial
                  </button>
                  <button
                    onClick={handleUpdateFeedback}
                    disabled={isUpdating}
                    className="flex-1 py-3 bg-red-650 hover:bg-red-700 text-white rounded-2xl text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                  >
                    <Save size={12} /> Save Updates
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

// --- Internal UI Components ---

interface StatsCardProps {
  label: string;
  val: string | number;
  icon: React.ComponentType<any>;
  color: string;
  isPulse?: boolean;
}

function StatsCard({ label, val, icon: Icon, color, isPulse }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-neutral-950/40 border p-5 rounded-[1.8rem] relative overflow-hidden shadow-xl group hover:border-neutral-800 transition-all backdrop-blur-md",
      isPulse ? "border-orange-550/30 shadow-[0_0_15px_rgba(249,115,22,0.05)]" : "border-neutral-900"
    )}>
      <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        <Icon size={80}/>
      </div>
      <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-[0.3em] mb-3">{label}</p>
      <h4 className={cn(
        "text-2xl font-black italic tracking-tighter leading-none flex items-center gap-2",
        color,
        isPulse && "animate-pulse"
      )}>
        {val}
        {isPulse && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block animate-ping" />}
      </h4>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-mono">
      <div className="h-10 w-10 border-t-2 border-red-650 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-650 animate-pulse">Decrypting_Feedback_Streams...</p>
    </div>
  );
}