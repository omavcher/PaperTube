"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Trash2, Edit3, Plus, Search, 
  Eye, Clock, ShieldCheck, AlertCircle, Loader2, 
  X, Camera, Send, AtSign, User, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/config/api";
import { cn } from "@/lib/utils";

// --- Configuration ---
const CLOUDINARY_UPLOAD_PRESET = "share-story";
const CLOUDINARY_CLOUD_NAME = "dieklmzt6";
const EXAM_OPTIONS = ["GATE", "NEET", "JEE Mains", "JEE Advanced", "UPSC", "CAT", "MPSC", "Gov", "Other"];

interface Story {
  _id: string;
  name: string;
  handle: string;
  exam: string;
  rank: string;
  heroTitle: string;
  summary: string;
  fullJourney: { title: string; content: string }[];
  isApproved: boolean;
  date: string;
  avatar: string;
}

export default function AdminSuccessStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const authToken = localStorage.getItem("authToken") || ""; 
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    exam: "",
    rank: "",
    headline: "",
    summary: "",
    challenge: "",
    solution: "",
    result: "",
    avatarFile: null as File | null,
    existingAvatar: ""
  });

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/success-stories/all", { headers: { Authorization: `Bearer ${authToken}` } });
      setStories(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch stories from buffer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStories(); }, []);

  const resetForm = () => {
    setFormData({
      name: "", handle: "", exam: "", rank: "", headline: "",
      summary: "", challenge: "", solution: "", result: "",
      avatarFile: null, existingAvatar: ""
    });
    setPreviewUrl(null);
    setEditId(null);
  };

  const openEdit = (story: Story) => {
    setEditId(story._id);
    setFormData({
      name: story.name,
      handle: story.handle.replace('@', ''),
      exam: story.exam,
      rank: story.rank,
      headline: story.heroTitle,
      summary: story.summary,
      challenge: story.fullJourney[0]?.content || "",
      solution: story.fullJourney[1]?.content || "",
      result: story.fullJourney[2]?.content || "",
      avatarFile: null,
      existingAvatar: story.avatar
    });
    setPreviewUrl(story.avatar);
    setIsModalOpen(true);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const json = await res.json();
    return json.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let avatarUrl = formData.existingAvatar;
      if (formData.avatarFile) {
        avatarUrl = await uploadToCloudinary(formData.avatarFile);
      }

      const payload = {
        name: formData.name,
        handle: `@${formData.handle.replace('@', '')}`,
        avatar: avatarUrl,
        exam: formData.exam,
        rank: formData.rank,
        heroTitle: formData.headline,
        summary: formData.summary,
        fullJourney: [
          { title: "The Challenge", content: formData.challenge },
          { title: "The Solution", content: formData.solution },
          { title: "The Result", content: formData.result }
        ],
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      if (editId) {
        await api.patch(`/admin/success-stories/update/${editId}` , payload , { headers: { Authorization: `Bearer ${authToken}` } });
        toast.success("Story updated successfully");
      } else {
        await api.post("/general/success-stories/share", { ...payload, isApproved: true });
        toast.success("New story deployed to public node");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchStories();
    } catch (err) {
      toast.error("Uplink failed. Check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/success-stories/approve/${id}` , {} , { headers: { Authorization: `Bearer ${authToken}` } });
      toast.success("Protocol Synced to Public Node");
      fetchStories();
    } catch (err) { toast.error("Approval sequence failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm data purge?")) return;
    try {
      await api.delete(`/admin/success-stories/delete/${id}` , { headers: { Authorization: `Bearer ${authToken}` } });
      toast.success("Data Terminated");
      fetchStories();
    } catch (err) { toast.error("Deletion failed"); }
  };

  const filteredStories = stories.filter(s => {
    if (filter === "pending") return !s.isApproved;
    if (filter === "approved") return s.isApproved;
    return true;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase italic text-white">Success_Story <span className="text-red-500">Manager</span></h2>
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-1">Status: Neural Link Stable</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black uppercase italic text-[10px] h-12 px-6">
            <Plus size={16} className="mr-2" /> New Entry
          </Button>
          <div className="bg-neutral-900 border border-white/5 rounded-xl p-1 flex">
            {(['all', 'pending', 'approved'] as const).map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={cn("px-4 py-2 rounded-lg text-[8px] font-black uppercase transition-all", filter === t ? "bg-red-600 text-white" : "text-neutral-500 hover:text-neutral-300")}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <Card className="bg-black border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-neutral-500">Student</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-neutral-500">Achievement</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={3} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-red-500" /></td></tr>
              ) : filteredStories.map((story) => (
                <motion.tr layout key={story._id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-red-500/10">
                        <AvatarImage src={story.avatar} />
                        <AvatarFallback>{story.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-black uppercase italic text-white">{story.name}</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5">{story.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase", story.isApproved ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500 animate-pulse")}>
                        {story.exam}
                      </div>
                      <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">{story.heroTitle}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      {!story.isApproved && (
                        <button onClick={() => handleApprove(story._id)} className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle2 size={16} /></button>
                      )}
                      <button onClick={() => openEdit(story)} className="p-2 hover:bg-white/5 text-neutral-400 rounded-lg"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(story._id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- MODAL: CREATE / EDIT --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase italic text-white">{editId ? "Edit" : "Manual"} <span className="text-red-500">Uplink</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-neutral-500 transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="bg-white/5 border-white/10 h-14 font-bold" required />
                  <Input value={formData.handle} onChange={(e) => setFormData({...formData, handle: e.target.value})} placeholder="Handle (no @)" className="bg-white/5 border-white/10 h-14 font-bold" required />
                  <select value={formData.exam} onChange={(e) => setFormData({...formData, exam: e.target.value})} className="bg-white/5 border border-white/10 h-14 rounded-xl px-4 text-sm font-bold text-neutral-400" required>
                    <option value="">Select Exam</option>
                    {EXAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <Input value={formData.rank} onChange={(e) => setFormData({...formData, rank: e.target.value})} placeholder="Rank / Score" className="bg-white/5 border-white/10 h-14 font-bold" required />
                </div>

                <Input value={formData.headline} onChange={(e) => setFormData({...formData, headline: e.target.value})} placeholder="Hero Headline" className="bg-white/5 border-white/10 h-14 font-bold" required />
                <Textarea value={formData.summary} onChange={(e) => setFormData({...formData, summary: e.target.value})} placeholder="Brief Summary" className="bg-white/5 border-white/10 min-h-[100px]" required />

                <div className="space-y-4">
                  <Textarea value={formData.challenge} onChange={(e) => setFormData({...formData, challenge: e.target.value})} placeholder="Phase 1: The Challenge" className="bg-white/5 border-white/10" required />
                  <Textarea value={formData.solution} onChange={(e) => setFormData({...formData, solution: e.target.value})} placeholder="Phase 2: The Solution" className="bg-white/5 border-white/10" required />
                  <Textarea value={formData.result} onChange={(e) => setFormData({...formData, result: e.target.value})} placeholder="Phase 3: The Result" className="bg-white/5 border-white/10" required />
                </div>

                <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                  {previewUrl ? (
                    <div className="relative h-24 w-24">
                      <img src={previewUrl} className="h-full w-full object-cover rounded-2xl border-2 border-red-600" />
                      <button type="button" onClick={() => { setFormData({...formData, avatarFile: null}); setPreviewUrl(formData.existingAvatar || null); }} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"><X size={12}/></button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-neutral-600"><Camera size={32}/></div>
                  )}
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-neutral-500 mb-2 tracking-widest">Profile Visual</p>
                    <input type="file" onChange={(e) => { if(e.target.files?.[0]) { setFormData({...formData, avatarFile: e.target.files[0]}); setPreviewUrl(URL.createObjectURL(e.target.files[0])); }}} accept="image/*" className="text-xs text-neutral-400" />
                  </div>
                </div>

                <Button disabled={submitting} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest rounded-2xl">
                  {submitting ? <Loader2 className="animate-spin" /> : editId ? "Execute Update" : "Deploy Story"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}