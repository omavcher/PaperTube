"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, Users, Zap, Ghost, 
  ArrowRight, MessageSquare, Info, 
  Lock, Globe, CheckCircle2, Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";

// --- Mock Data for the specific room ---
const ROOM_INTEL = {
  name: "Calculus Wizards",
  topic: "Integration by Parts & Special Functions",
  members: 1420,
  active: 24,
  intensity: 85,
  monitor: "Om Avcher",
  rules: ["No Spamming", "Study Only", "Respect Anonymity"],
  isPrivate: false,
};

export default function JoinClassroom() {
  const params = useParams();
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleJoin = () => {
    setJoining(true);
    // Logic to add user to classroom in DB
    setTimeout(() => {
      router.push(`/schools/${params.id}/${params.classId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden selection:bg-red-500/30">
      
      {/* Background FX */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#dc262615,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 pt-24 pb-40 lg:pt-32 flex flex-col items-center">
        
        {/* Invitation Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-neutral-950 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Header Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-red-600/10 text-red-500 border border-red-600/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
               Neural_Invitation_Protocol
            </Badge>
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            {/* Classroom Icon */}
            <div className="h-20 w-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] relative">
                <MessageSquare size={32} />
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-black rounded-full border-4 border-neutral-950 flex items-center justify-center">
                    <Zap size={14} className="text-yellow-500" />
                </div>
            </div>

            {/* Identity */}
            <div>
              <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-3">
                JOIN {ROOM_INTEL.name}
              </h1>
              <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                Current Sync: <span className="text-white">{ROOM_INTEL.topic}</span>
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-6 py-8 border-y border-white/5 w-full">
                <JoinStat label="Active" value={`${ROOM_INTEL.active} Syncing`} icon={<Zap size={14}/>} color="text-emerald-500" />
                <JoinStat label="Members" value={ROOM_INTEL.members.toLocaleString()} icon={<Users size={14}/>} />
                <JoinStat label="Monitor" value={`@${ROOM_INTEL.monitor}`} icon={<Crown size={14}/>} color="text-yellow-500" />
            </div>

            {/* Notice Board Preview */}
            <div className="w-full text-left space-y-4">
                <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Notice Board Rules</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROOM_INTEL.rules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <CheckCircle2 size={14} className="text-red-600" />
                            <span className="text-[10px] font-bold text-neutral-400 uppercase">{rule}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleJoin}
              disabled={joining}
              className="w-full h-16 bg-white text-black hover:bg-red-600 hover:text-white rounded-2xl font-black italic uppercase text-sm tracking-[0.3em] transition-all relative overflow-hidden group"
            >
              {joining ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Initializing...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                    Join Sync Session <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
            
            <p className="text-[9px] font-medium text-neutral-700 uppercase tracking-widest">
                By joining, you agree to the Monitor's rule-set.
            </p>
          </div>

          {/* Scanline FX */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </motion.div>

        {/* Floating FAQ Info */}
        <div className="mt-12 max-w-md text-center">
            <div className="inline-flex items-center gap-2 text-neutral-600 mb-2">
                <Info size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">About School Nodes</span>
            </div>
            <p className="text-[10px] font-medium text-neutral-700 leading-relaxed italic">
                You are entering a high-frequency study environment. Anonymous mode is available inside to allow you to ask doubts without friction.
            </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}

// --- Sub-Components ---

function JoinStat({ label, value, icon, color }: any) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className={cn("flex items-center gap-2", color || "text-neutral-500")}>
                {icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-xs font-bold text-white">{value}</span>
        </div>
    );
}

