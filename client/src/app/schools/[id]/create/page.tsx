"use client";

import React, { useState } from "react";
import { 
  Plus, ArrowLeft, Globe, Ghost as GhostIcon,
  Shield, Zap, MessageSquare, Info,
  Sparkles, Users, X, Check, Lock,
  PlusCircle, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CreateClassroom() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.id as string;

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    isPrivate: false,
    allowAnonymous: true,
    rules: ["Be Respectful", "No Spamming", "Study Only"],
  });

  const [newRule, setNewRule] = useState("");

  const addRule = () => {
    if (newRule.trim() && formData.rules.length < 6) {
      setFormData({ ...formData, rules: [...formData.rules, newRule.trim()] });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to sync with Backend API
    console.log("Initializing Node:", formData);
    router.push(`/schools/${schoolId}`);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-red-500/30 overflow-x-hidden">
      
      {/* Tactical Background */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#dc262615,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 md:px-6 pt-24 pb-32 lg:pt-32">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* --- LEFT: CONFIGURATION FORM --- */}
          <div className="flex-1 space-y-10">
            <div>
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Abort_Mission</span>
              </button>
              
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                CREATE <br />
                <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">CLASSROOM</span>
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Essential Intel */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <FormLabel label="Classroom Name" />
                    <input 
                      type="text"
                      placeholder="E.G. MATHS_ELITE"
                      required
                      className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <FormLabel label="Primary Topic" />
                    <input 
                      type="text"
                      placeholder="E.G. CALCULUS_SYNC"
                      required
                      className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToggleButton 
                  active={!formData.isPrivate} 
                  onClick={() => setFormData({...formData, isPrivate: false})}
                  icon={<Globe size={18} />}
                  label="Open Entry"
                  desc="Publicly viewable node"
                />
                <ToggleButton 
                  active={formData.allowAnonymous} 
                  onClick={() => setFormData({...formData, allowAnonymous: !formData.allowAnonymous})}
                  icon={<GhostIcon size={18} />}
                  label="Ghost Sync"
                  desc="Allow anonymous doubts"
                />
              </div>

              {/* Notice Board Rules */}
              <div className="space-y-4">
                <FormLabel label="Classroom Rules" />
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="ADD NEW RULE..."
                    className="flex-1 bg-neutral-900 border border-white/5 rounded-xl px-5 py-3 text-[10px] font-bold uppercase outline-none"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                  />
                  <Button type="button" onClick={addRule} className="bg-white text-black hover:bg-red-600 hover:text-white px-4">
                    <PlusCircle size={18} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.rules.map((rule, i) => (
                    <Badge key={i} className="bg-neutral-800 text-neutral-400 border-none px-3 py-1.5 flex items-center gap-2 group">
                      <span className="text-[9px] font-black uppercase italic">{rule}</span>
                      <button type="button" onClick={() => removeRule(i)}>
                        <X size={10} className="hover:text-red-500 transition-colors" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <Button 
                  type="submit"
                  className="w-full h-16 bg-white text-black hover:bg-red-600 hover:text-white rounded-2xl font-black italic uppercase text-xs tracking-[0.3em] transition-all shadow-[0_0_50px_rgba(255,255,255,0.05)]"
                >
                  <Sparkles size={16} className="mr-2" /> Initialize_Sync_Session
                </Button>
              </div>
            </form>
          </div>

          {/* --- RIGHT: TACTICAL PREVIEW --- */}
          <div className="w-full lg:w-96">
            <div className="lg:sticky lg:top-32 space-y-6">
              <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
                <Zap size={14} className="text-red-600" /> Virtual_Preview
              </h3>

              <div className="p-8 bg-neutral-950 border border-red-600/30 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">Active_Link</Badge>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                    <MessageSquare size={28} />
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter truncate leading-none">
                      {formData.name || "NEW_NODE"}
                    </h4>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-red-600" /> {formData.topic || "DEFINING_INTEL..."}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Users size={14} /> <span className="text-xs font-black">01</span>
                    </div>
                    {formData.allowAnonymous && (
                      <div className="flex items-center gap-2 text-red-500">
                        <GhostIcon size={14} /> <span className="text-[9px] font-black uppercase">Ghost_Sync</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decorative Grid on Card */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
              </div>

              {/* Monitor Instructions */}
              <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-red-500">
                  <Shield size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Class Monitor Rights</span>
                </div>
                <p className="text-[10px] font-medium text-neutral-500 italic leading-relaxed">
                  As the monitor, you can delete any message, ban users, and assign Vice-Monitors to assist with the notice board.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- Internal UI Components ---

function FormLabel({ label }: { label: string }) {
  return (
    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
      <span className="h-1 w-1 rounded-full bg-red-600" /> {label}
    </label>
  );
}

function ToggleButton({ active, onClick, icon, label, desc }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start p-6 rounded-[2rem] border transition-all duration-500 text-left group",
        active 
          ? "bg-red-600/10 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.15)]" 
          : "bg-neutral-950 border-white/5 opacity-50 hover:opacity-100"
      )}
    >
      <div className={cn(
        "p-3 rounded-xl mb-4 transition-all duration-500",
        active ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-neutral-900 text-neutral-500 group-hover:bg-white/10"
      )}>
        {icon}
      </div>
      <p className={cn("text-xs font-black uppercase italic mb-1", active ? "text-white" : "text-neutral-500")}>
        {label}
      </p>
      <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest leading-none">
        {desc}
      </p>
    </button>
  );
}