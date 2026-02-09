"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Send, Trophy, User, CheckCircle2, 
  Loader2, Camera, AtSign, X, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/config/api";
import { cn } from "@/lib/utils";

// --- Configuration ---
const CLOUDINARY_UPLOAD_PRESET = "share-story"; // Replace with your preset
const CLOUDINARY_CLOUD_NAME = "dieklmzt6";       // Replace with your cloud name

const EXAM_OPTIONS = [
  "GATE", "NEET", "JEE Mains", 
  "JEE Advanced", "UPSC", "CAT","MPSC" ,"Gov", "Other"
];

export default function ShareStoryPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    avatar: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setError(null);
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setFormData(prev => ({ ...prev, avatar: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, avatar: null }));
    setPreviewUrl(null);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );
    
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const json = await res.json();
    return json.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.exam) {
      setError("Please select an exam name.");
      return;
    }
    
    setLoading(true);

    try {
      let avatarUrl = "";
      
      // 1. Upload to Cloudinary if image exists
      if (formData.avatar) {
        avatarUrl = await uploadToCloudinary(formData.avatar);
      }

      // 2. Prepare formatted data for backend
      const finalJourney = [
        { title: "The Challenge", content: formData.challenge },
        { title: "The Solution", content: formData.solution },
        { title: "The Result", content: formData.result }
      ];

      const payload = {
        name: formData.name,
        handle: formData.handle.startsWith('@') ? formData.handle : `@${formData.handle}`,
        avatar: avatarUrl, // The Cloudinary link
        exam: formData.exam,
        rank: formData.rank,
        heroTitle: formData.headline,
        summary: formData.summary,
        fullJourney: finalJourney,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      // 3. Send to your Backend API
      const response = await api.post("/general/success-stories/share", payload);
      
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || "Failed to save story.");
      }
    } catch (err) {
      setError("Connection error. Could not sync with the database.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">Uplink Successful</h2>
          <p className="text-neutral-500 font-medium">Your success journey has been saved to the database and sent for final review.</p>
          <Button onClick={() => window.location.href = "/success-stories"} className="bg-white text-black hover:bg-red-600 hover:text-white rounded-xl px-10 h-14 font-black uppercase tracking-widest">Return to Base</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-900/50 pb-20 pt-12">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/10 blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
            SHARE YOUR <span className="text-red-600 uppercase">STORY</span>
          </h1>
          <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-[10px]">Help others learn from your success</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 bg-neutral-950/50 border border-white/5 p-8 md:p-12 rounded-[3rem] backdrop-blur-xl shadow-2xl relative">
          
          {/* Error Message Handler */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase italic"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Identity Section */}
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Step 01: Identification</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                <Input name="name" onChange={handleInputChange} placeholder="Your Full Name" className="bg-black/50 border-white/10 pl-12 h-14 font-bold rounded-2xl" required />
              </div>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                <Input name="handle" onChange={handleInputChange} placeholder="Social Handle (e.g. name_123)" className="bg-black/50 border-white/10 pl-12 h-14 font-bold rounded-2xl" required />
              </div>
            </div>
          </div>

          {/* Achievement Section */}
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Step 02: Exam Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select name="exam" onChange={handleInputChange} className="bg-black/50 border border-white/10 h-14 font-bold rounded-2xl px-4 text-sm focus:outline-none focus:border-red-600 transition-all appearance-none text-neutral-400" required>
                <option value="">Select Exam</option>
                {EXAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <Input name="rank" onChange={handleInputChange} placeholder="Rank or Score (e.g. AIR 84)" className="bg-black/50 border-white/10 h-14 font-bold rounded-2xl" required />
            </div>
            <Input name="headline" onChange={handleInputChange} placeholder="Main Headline (e.g. How I used AI to crack GATE...)" className="bg-black/50 border-white/10 h-14 font-bold rounded-2xl" required />
            <Textarea name="summary" onChange={handleInputChange} placeholder="Brief summary of your success..." className="bg-black/50 border-white/10 rounded-2xl min-h-[100px] p-6 text-sm font-medium" required />
          </div>

          {/* Narrative Section */}
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Step 03: Your Journey</p>
            <div className="space-y-4">
              <Textarea name="challenge" onChange={handleInputChange} placeholder="The Challenge: What was your biggest struggle during preparation?" className="bg-black/50 border-white/10 rounded-2xl p-6 min-h-[120px] text-sm" required />
              <Textarea name="solution" onChange={handleInputChange} placeholder="The Solution: How did our tools help you overcome it?" className="bg-black/50 border-white/10 rounded-2xl p-6 min-h-[120px] text-sm" required />
              <Textarea name="result" onChange={handleInputChange} placeholder="The Result: What was the final outcome?" className="bg-black/50 border-white/10 rounded-2xl p-6 min-h-[120px] text-sm" required />
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Step 04: Profile Image</p>
            {previewUrl ? (
              <div className="relative w-32 h-32 mx-auto">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl border-2 border-red-600 shadow-xl shadow-red-900/10" />
                <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-all shadow-lg"><X size={14} /></button>
              </div>
            ) : (
              <div className="relative h-32 bg-black/50 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center group hover:border-red-600/50 transition-all cursor-pointer">
                <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" required />
                <Camera size={24} className="text-neutral-600 mb-2 group-hover:text-red-500 transition-colors" />
                <span className="text-[10px] font-black uppercase text-neutral-500 group-hover:text-white">Upload Professional Photo</span>
              </div>
            )}
          </div>

          {/* Submit Trigger */}
          <Button type="submit" disabled={loading} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-red-900/20 transition-all active:scale-95 group">
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" size={20} />
                <span>Processing Sync...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>Submit Your Journey</span>
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>

        </form>
      </div>
    </div>
  );
}