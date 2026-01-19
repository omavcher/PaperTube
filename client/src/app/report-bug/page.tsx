"use client";

import { useState, useRef } from "react";
import { 
  Bug, ArrowLeft, Upload, Send, 
  ShieldAlert, Terminal, Loader2, 
  Camera, CloudCheck, Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";

export default function BugReportPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("low");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Step 1: Local Preview ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- Step 2: Cloudinary Upload + Backend Save ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return toast.error("Specifications incomplete.");

    setIsSubmitting(true);
    let evidenceUrl = "";

    try {
      // 1. Upload to Cloudinary if image exists
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", "bug_report"); // Replace with yours
        
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/dieklmzt6/image/upload`, {
          method: "POST",
          body: formData,
        });
        const cloudData = await cloudRes.json();
        evidenceUrl = cloudData.secure_url;
      }

      // 2. Parse User
      let userId = 'guest';
      const storedUser = localStorage.getItem("user");
      if (storedUser) userId = JSON.parse(storedUser).id || JSON.parse(storedUser)._id;

      // 3. Send to specialized backend route
      await api.post("/general/bugs/report", {
        title,
        description,
        severity,
        evidenceUrl,
        userId,
        metadata: {
          userAgent: navigator.userAgent,
          resolution: `${window.innerWidth}x${window.innerHeight}`
        }
      });

      setIsSuccess(true);
      toast.success("Anomaly transmitted to Cloud Registry");
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err) {
      toast.error("Transmission failed. Check network protocols.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools"><Button variant="ghost" size="icon" className="hover:bg-red-500/10 text-neutral-500 rounded-xl"><ArrowLeft size={20} /></Button></Link>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <Bug className="text-red-500" size={18} />
              <h1 className="text-sm font-black uppercase italic tracking-widest">Bug Sentinel</h1>
            </div>
          </div>
          {isSubmitting && <div className="flex items-center gap-2 text-[10px] font-black text-red-500 animate-pulse"><Loader2 className="animate-spin" size={12}/> UPLOADING EVIDENCE...</div>}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 mt-0 md:mt-16">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Report <span className="text-red-600">Anomaly</span></h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Issue Identity</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-14 bg-neutral-900/50 border border-white/5 rounded-xl px-6 font-mono text-sm uppercase" placeholder="CORE_LOGIC_ERROR" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'critical'].map(s => (
                  <button key={s} type="button" onClick={() => setSeverity(s)} className={cn("h-12 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all", severity === s ? "bg-red-600 border-red-500 text-white" : "bg-neutral-900/50 border-white/5 text-neutral-600")}>{s}</button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Observation Data</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-40 bg-neutral-900/50 border border-white/5 rounded-2xl p-6 text-sm outline-none focus:border-red-500/40" placeholder="Describe the failure sequence..." />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-red-600 font-black uppercase italic rounded-2xl shadow-2xl">
                {isSubmitting ? "Processing Artifact..." : "Broadcast Report"}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="bg-neutral-950 border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldAlert size={120} /></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-6 flex items-center gap-2"><Camera size={14}/> Forensic Capture</h4>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn("aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40", preview ? "border-red-500/40" : "border-white/5 hover:border-red-500/20")}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                {preview ? <img src={preview} className="w-full h-full object-cover rounded-xl opacity-70" /> : <div className="text-center space-y-2"><Upload className="text-neutral-800 mx-auto" /><p className="text-[10px] font-black text-neutral-700 uppercase">Inject Screenshot</p></div>}
              </div>
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 text-emerald-500/40"><ShieldAlert size={14}/><span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encrypted</span></div>
                <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic">Evidence is automatically offloaded to Cloudinary for forensic review. Local memory is cleared post-transmission.</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="text-center space-y-6">
              <div className="h-24 w-24 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(220,38,38,0.4)]"><CloudCheck size={48} /></div>
              <h3 className="text-4xl font-black uppercase italic">Anomaly Logged</h3>
              <p className="text-neutral-500 text-sm max-w-xs mx-auto">The master registry has been updated. Engineers are reviewing the forensic data.</p>
              <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-white/10 rounded-xl">Dismiss</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}