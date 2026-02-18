"use client";

import { useState, useRef } from "react";
import { 
  Bug, 
  ArrowLeft, 
  Upload, 
  Send, 
  AlertTriangle, 
  Loader2, 
  Image as ImageIcon, 
  CheckCircle, 
  Info,
  Terminal,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";

export default function BugReportClient() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("low");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return toast.error("Please fill in all required fields.");

    setIsSubmitting(true);
    let evidenceUrl = "";

    try {
      // 1. Upload to Cloudinary
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", "bug_report"); 
        
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/dieklmzt6/image/upload`, {
          method: "POST",
          body: formData,
        });
        const cloudData = await cloudRes.json();
        evidenceUrl = cloudData.secure_url;
      }

      // 2. Get User Info safely
      let userId = 'guest';
      if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
              try {
                  const parsed = JSON.parse(storedUser);
                  userId = parsed.id || parsed._id || 'guest';
              } catch (e) {}
          }
      }

      // 3. Submit Report
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
      toast.success("Diagnostic report submitted successfully");
      
      // Reset form
      setTitle("");
      setDescription("");
      setSeverity("low");
      setSelectedFile(null);
      setPreview(null);

      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neutral-800 selection:text-white font-sans flex flex-col">
      
      {/* --- Background Atmosphere --- */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>

      {/* --- Header --- */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="group p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
               <ArrowLeft size={18} className="text-neutral-400 group-hover:text-white" />
            </Link>
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center">
                 <Bug size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-300">System Diagnostic</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
             <span>V4.0 Stable</span>
             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="relative z-10 flex-grow w-full max-w-5xl mx-auto px-6 py-12 md:py-20">
        
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 mb-4">
                Report an Issue
              </h1>
              <p className="text-neutral-400 font-light">
                Found a bug in the Neural Study system? Help us improve the algorithm by providing details below.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Issue Title</label>
                <div className="relative group">
                    <Terminal size={16} className="absolute left-4 top-4 text-neutral-600 group-focus-within:text-white transition-colors" />
                    <input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full bg-neutral-900/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all font-mono text-sm" 
                        placeholder="e.g. Note generation failed on Safari..." 
                    />
                </div>
              </div>

              {/* Severity Selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Impact Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['low', 'medium', 'critical'].map(s => (
                    <button 
                        key={s} 
                        type="button" 
                        onClick={() => setSeverity(s)} 
                        className={cn(
                            "h-10 rounded-lg border text-xs font-medium uppercase tracking-wide transition-all flex items-center justify-center gap-2",
                            severity === s 
                                ? s === 'critical' ? "bg-red-500/10 border-red-500 text-red-500" : "bg-white text-black border-white"
                                : "bg-neutral-900/40 border-white/5 text-neutral-500 hover:bg-neutral-800"
                        )}
                    >
                        {s === 'critical' && <AlertTriangle size={12} />}
                        {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Observation Data</label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full h-40 bg-neutral-900/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-neutral-700 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all resize-none leading-relaxed" 
                    placeholder="Describe the steps to reproduce the issue..." 
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={cn(
                    "w-full h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-white/5",
                    isSubmitting ? "bg-neutral-800 text-neutral-400 cursor-not-allowed" : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                <span>{isSubmitting ? "Transmitting..." : "Submit Report"}</span>
              </button>

            </form>
          </div>

          {/* Right Column: Upload & Context */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Upload Card */}
            <div className="bg-neutral-900/20 backdrop-blur-md border border-white/5 rounded-3xl p-1 overflow-hidden">
                <div className="bg-neutral-900/40 rounded-[20px] p-6 border border-white/5 relative">
                    
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <ImageIcon size={16} className="text-neutral-400" /> 
                            Visual Evidence
                        </h3>
                        <span className="text-[10px] uppercase text-neutral-600 font-bold tracking-wider">Optional</span>
                    </div>

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "aspect-video rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden",
                            preview ? "border-white/20 bg-black" : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
                        )}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        
                        {preview ? (
                            <>
                                <img src={preview} className="w-full h-full object-contain opacity-80" alt="Preview" />
                                <div className="absolute top-2 right-2 z-10" onClick={removeFile}>
                                    <div className="p-1.5 rounded-full bg-black/50 hover:bg-red-500/20 text-white/50 hover:text-red-500 backdrop-blur-md transition-all">
                                        <X size={14} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center space-y-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <Upload className="text-neutral-400 group-hover:text-white transition-colors" size={18} />
                                </div>
                                <p className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">Click to upload screenshot</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex items-start gap-3">
                        <Info size={14} className="text-neutral-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-neutral-500 leading-relaxed">
                            Images are processed via our secure cloud pipeline. 
                            Please do not upload sensitive personal data (PII) in screenshots.
                        </p>
                    </div>
                </div>
            </div>

            {/* Helper Info */}
            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                <h4 className="text-sm font-medium text-blue-200 mb-2">Bug Bounty Program</h4>
                <p className="text-xs text-blue-200/60 leading-relaxed">
                    Critical security vulnerabilities may be eligible for rewards. 
                    If you find a security flaw, please mark severity as 
                    <span className="text-blue-200 font-bold mx-1">Critical</span>.
                </p>
            </div>

          </div>
        </div>

      </main>

      <Footer />

      {/* --- Success Modal --- */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>
              
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 ring-1 ring-green-500/50">
                <CheckCircle size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Report Logged</h3>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                Thank you for your contribution. Our engineering team has been notified.
              </p>
              
              <button 
                onClick={() => setIsSuccess(false)} 
                className="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}