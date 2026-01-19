"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send, MapPin, Loader2, Mail, CheckCircle, Terminal, User, ShieldCheck } from "lucide-react";
import { LoginDialog } from "./LoginDialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/config/api";

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    quote: "",
    name: "",
    email: "",
    location: "",
  });

  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [isOpen, user]);

  const handleGetLocation = async () => {
    try {
      setIsGettingLocation(true);
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      setFormData(prev => ({ ...prev, location: `${data.city}, ${data.country_name}` }));
      toast.success("Coordinates acquired");
    } catch {
      toast.error("Location signal lost");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return setIsLoginDialogOpen(true);
    if (rating === 0) return toast.error("Please provide a rating");
    if (!formData.quote.trim()) return toast.error("Feedback buffer empty");

    setIsSubmitting(true);
    try {
      await api.post("/general/feedback/submit", {
        ...formData,
        rating,
        userId: user.id || user._id,
        profilePicture: user.picture
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({ quote: "", name: "", email: "", location: "" });
        setRating(0);
      }, 3000);
    } catch {
      toast.error("Handshake failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog   open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg mt-0 md:mt-15 bg-[#0a0a0a] border-white/5 text-white p-0 overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(220,38,38,0.05),transparent)] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 space-y-6 relative">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Terminal className="text-red-500" size={18} />
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Lab Feedback</DialogTitle>
                  </div>
                  <p className="text-neutral-500 text-sm">Transmitting your experience helps us optimize the core.</p>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Rating Logic */}
                  <div className="flex flex-col items-center py-4 bg-neutral-900/40 rounded-3xl border border-white/5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Satisfaction Level</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="transition-transform active:scale-90">
                          <Star className={cn("w-8 h-8 transition-all", (hoverRating || rating) >= star ? "fill-red-600 text-red-600 scale-110 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "text-neutral-800")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Transmission Data</Label>
                      <Textarea 
                        value={formData.quote} 
                        onChange={(e) => setFormData({...formData, quote: e.target.value})}
                        className="bg-neutral-900/50 border-white/5 min-h-[120px] rounded-2xl resize-none focus:border-red-600/40" 
                        placeholder="What should we architect next?" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Origin</Label>
                        <div className="relative">
                          <input 
                            value={formData.location} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full bg-neutral-900/50 border border-white/5 h-12 rounded-xl px-4 text-sm" 
                            placeholder="City, Country"
                          />
                          <button onClick={handleGetLocation} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-red-500 transition-colors">
                            {isGettingLocation ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Auth Profile</Label>
                        <div className="h-12 bg-neutral-900/50 border border-white/5 rounded-xl px-4 flex items-center gap-2 overflow-hidden">
                          <User size={14} className="text-neutral-700" />
                          <span className="text-xs font-bold text-neutral-400 truncate">{formData.email || "GUEST_USER"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" size={18} /> Broadcast Feedback</>}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <ShieldCheck size={40} className="text-black" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase italic">Received</h3>
                  <p className="text-neutral-500 text-sm mt-2">Your testimonial has been cached in the master registry.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </>
  );
}