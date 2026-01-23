"use client";

import React, { useState } from "react";
import { 
  Plus, Users, MessageSquare, Zap, 
  ArrowLeft, Filter, flame, Search,
  TrendingUp, ShieldCheck, Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Sample Classroom Data ---
const MOCK_CLASSROOMS = [
  { 
    id: "maths-adv-1", 
    name: "Calculus Deep-Dive", 
    topic: "Definite Integration & Areas", 
    members: 1420, 
    active: 24, 
    creator: "IITian_Pro",
    tags: ["Hard", "Maths"],
    intensity: 85 // 0-100
  },
  { 
    id: "physics-rot", 
    name: "Mechanics Masterclass", 
    topic: "Rotational Dynamics & Torque", 
    members: 850, 
    active: 12, 
    creator: "PhysicsWizard",
    tags: ["Concept", "Physics"],
    intensity: 60
  },
  { 
    id: "chem-org", 
    name: "Organic War-Room", 
    topic: "SN1/SN2 Reaction Mechanisms", 
    members: 2100, 
    active: 45, 
    creator: "ChemMaster",
    tags: ["Revision", "Chemistry"],
    intensity: 95
  }
];

export default function SchoolDashboard() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.id as string;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = MOCK_CLASSROOMS.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      
      {/* --- Header Navigation --- */}
      <div className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/schools')}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-neutral-500 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">
                {schoolId} <span className="text-red-600">Archive</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Sector_Active</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-neutral-900/50 border border-white/5 px-4 py-2 rounded-2xl">
            <Search size={16} className="text-neutral-600" />
            <input 
              type="text" 
              placeholder="SCAN CLASSROOMS..."
              className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-48 placeholder:text-neutral-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button className="bg-white text-black hover:bg-red-600 hover:text-white font-black italic uppercase text-[10px] tracking-widest px-6 rounded-xl transition-all">
            <Plus size={16} className="mr-2" /> Initialize_Node
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20 flex flex-col lg:flex-row gap-10">
        
        {/* --- Left Content: Classroom Feed --- */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
              <TrendingUp size={14} className="text-red-600" /> High_Frequency_Clusters
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase italic">
              Sort By: <span className="text-white cursor-pointer hover:text-red-500 transition-colors">Intensity</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredRooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ClassroomCard room={room} schoolId={schoolId} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* --- Right Sidebar: School Stats & Live Feed --- */}
        <div className="w-full lg:w-80 space-y-8">
          <div className="p-6 bg-neutral-950 border border-white/5 rounded-[2rem] space-y-6">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">School_Status</h3>
            
            <div className="space-y-4">
              <StatItem label="Global Rank" value="#04" icon={<ShieldCheck size={14} className="text-blue-500" />} />
              <StatItem label="Active Nodes" value={filteredRooms.length.toString()} icon={<Zap size={14} className="text-red-500" />} />
              <StatItem label="Next Test" value="04:20:00" icon={<Timer size={14} className="text-yellow-500" />} />
            </div>

            <div className="pt-6 border-t border-white/5">
                <p className="text-[9px] font-bold text-neutral-500 uppercase mb-4 tracking-widest">Top Performers</p>
                <div className="flex -space-x-3">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-black bg-neutral-900 flex items-center justify-center overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                        </div>
                    ))}
                    <div className="h-8 w-8 rounded-full border-2 border-black bg-red-600 flex items-center justify-center text-[8px] font-black">
                        +12
                    </div>
                </div>
            </div>
          </div>

          <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-[2rem]">
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">Neural_Broadcast</h3>
            <p className="text-[11px] font-medium text-neutral-400 leading-relaxed italic">
              "Attention aspirants: The Advanced Mock Test frequency will be live in 4 hours. Ensure your sync modules are calibrated."
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

// --- Sub-Components ---

function ClassroomCard({ room, schoolId }: { room: any, schoolId: string }) {
  return (
    <Link href={`/schools/${schoolId}/${room.id}`}>
      <div className="group relative bg-neutral-950 border border-white/5 rounded-3xl p-6 md:p-8 hover:border-red-600/40 transition-all duration-500 overflow-hidden">
        
        {/* Progress Fill Background (Subtle) */}
        <div 
          className="absolute inset-y-0 left-0 bg-red-600/5 transition-all duration-1000 group-hover:bg-red-600/10" 
          style={{ width: `${room.intensity}%` }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-neutral-900 rounded-2xl flex items-center justify-center text-red-600 border border-white/5">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter group-hover:text-red-600 transition-colors">
                  {room.name}
                </h3>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Authored_By: <span className="text-neutral-400">@{room.creator}</span>
                </p>
              </div>
            </div>
            
            <p className="text-xs font-medium text-neutral-400 leading-relaxed max-w-md">
              Current Session: <span className="text-white">{room.topic}</span>
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase text-neutral-600 tracking-widest mb-1">Active_Users</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-black text-white tabular-nums">{room.active}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase text-neutral-600 tracking-widest mb-1">Study_Intensity</span>
              <div className="flex items-center gap-2">
                 <span className="text-sm font-black text-red-500 tabular-nums">{room.intensity}%</span>
              </div>
            </div>

            <div className="h-10 w-10 bg-neutral-900 border border-white/5 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
               <Zap size={18} />
            </div>
          </div>
        </div>

        {/* Intensity Progress Bar at the absolute bottom */}
        <div className="absolute bottom-0 left-0 h-1 bg-neutral-900 w-full overflow-hidden">
            <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]"
                style={{ width: `${room.intensity}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
        </div>
      </div>
    </Link>
  );
}

function StatItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-black italic text-white">{value}</span>
    </div>
  );
}