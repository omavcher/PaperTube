"use client";

import React, { use, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, FileText, IndianRupee, 
  Activity, ShieldCheck, ArrowUpRight,
  TrendingUp, Share2, MessageSquare, 
  Zap, Globe, MousePointer2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { headers } from "next/headers";

export default function AdminDashboard() {
   
  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        const response = await api.get('/admin/diagnostics', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        console.log('Diagnostics Data:', response.data);
      } catch (error) {
        console.error('Error fetching diagnostics data:', error);
      } finally {
      }
    };

    fetchDiagnostics();
  }, []);


       
  return (
    <div className="space-y-10 pb-20">
      {/* SECTION 1: GLOBAL HUD STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <AdminStatCard label="Total Personnel" value="5,820" sub="+12% Shadow Growth" icon={Users} color="text-red-500" />
         <AdminStatCard label="Knowledge forged" value="12,402" sub="Across 10+ Nodes" icon={FileText} color="text-blue-500" />
         <AdminStatCard label="Revenue Flux" value="₹42,500" sub="24h Cycle" icon={IndianRupee} color="text-emerald-500" />
         <AdminStatCard label="Engagement Rate" value="68.4%" sub="Session Depth" icon={Zap} color="text-purple-500" />
      </div>

      {/* SECTION 2: REFERRAL FLUX & GROWTH ANALYTICS */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Referral Source Tracker */}
        <Card className="lg:col-span-7 bg-black border-white/5 rounded-[3.5rem] p-10 shadow-2xl border overflow-hidden relative">
           <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
             <Share2 size={120} className="text-red-600" />
           </div>
           <div className="relative z-10">
              <h3 className="text-sm font-black uppercase italic tracking-[0.4em] mb-2 text-red-500">Referral_Flux</h3>
              <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-10">Active Marketing Source Distribution</p>
              
              <div className="space-y-8">
                <ReferralBar label="WhatsApp Status" percentage={45} color="bg-emerald-500" count="2,619" />
                <ReferralBar label="LinkedIn Organic" percentage={30} color="bg-blue-600" count="1,746" />
                <ReferralBar label="Direct / Search" percentage={15} color="bg-white" count="873" />
                <ReferralBar label="Shadow Seeding" percentage={10} color="bg-red-600" count="582" />
              </div>
           </div>
        </Card>

        {/* Growth Forge Quick-Actions */}
        <Card className="lg:col-span-5 bg-neutral-900/20 border-white/5 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl border">
           <h3 className="text-sm font-black uppercase italic tracking-[0.4em] mb-8 text-white">Growth_Forge</h3>
           <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 group hover:border-red-500/50 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Personnel Forge</span>
                  <Users size={16} className="text-red-500" />
                </div>
                <p className="text-[9px] text-neutral-600 uppercase font-bold">Deploy 50 new shadow profiles into system</p>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 group hover:border-red-500/50 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Comment Seeding</span>
                  <MessageSquare size={16} className="text-blue-500" />
                </div>
                <p className="text-[9px] text-neutral-600 uppercase font-bold">Auto-generate feedback for recent notes</p>
              </div>

              <div className="mt-6 p-6 rounded-3xl bg-red-600/5 border border-red-600/10">
                <div className="flex items-center gap-3 text-red-500 mb-2">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Protocol 77-B</span>
                </div>
                <p className="text-[9px] text-neutral-500 leading-relaxed font-medium uppercase">Shadow activity is currently synchronized with real user behavior patterns to avoid detection.</p>
              </div>
           </div>
        </Card>
      </div>

      {/* SECTION 3: LIVE SYSTEM LOGS */}
      <Card className="bg-black border-white/5 rounded-[3.5rem] p-10 shadow-2xl border">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl text-red-500"><Activity size={20}/></div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest italic">Live_Tactical_Feed</h3>
              <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Real-time engagement across PaperTube</p>
            </div>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border border-white/5 px-6 py-2 rounded-full">Flush Logs</button>
        </div>

        <div className="grid gap-4">
          <ActivityRow user="Om_Prime" action="System Override" detail="Shadow Growth Protocol Activated" time="Now" />
          <ActivityRow user="Aryan_88" action="Note Forge" detail="Linear Algebra // MIT Course" time="4m ago" />
          <ActivityRow user="Kiran_02" action="Feedback" detail="Featured Testimonial Approved" time="12m ago" />
          <ActivityRow user="Shadow_Bot_4" action="Personnel Sync" detail="Successfully forged profile: Rahul_J" time="1h ago" />
        </div>
      </Card>
    </div>
  );
}

// --- TACTICAL SUB-COMPONENTS ---

function AdminStatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-black border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/40 transition-all duration-500 shadow-xl">
       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"><Icon size={120}/></div>
       <div className={cn("p-4 rounded-2xl bg-white/5 w-fit mb-6 shadow-inner", color)}><Icon size={20}/></div>
       <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-1">{label}</p>
       <h4 className="text-3xl font-black italic tracking-tighter text-white mb-2">{value}</h4>
       <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-1">
          <TrendingUp size={10} className="text-emerald-500" /> {sub}
       </p>
    </div>
  );
}

function ReferralBar({ label, percentage, color, count }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</span>
        <span className="text-[10px] font-black text-white">{count} <span className="text-neutral-600 mx-1">/</span> {percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percentage}%` }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-[0_0_10px] shadow-current", color)} 
        />
      </div>
    </div>
  );
}

function ActivityRow({ user, action, detail, time }: any) {
  return (
    <div className="group flex items-center justify-between p-5 rounded-[2rem] hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all">
      <div className="flex items-center gap-5">
        <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-red-500">
          {user.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black uppercase text-white tracking-widest">{user}</p>
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-red-600/10 text-red-500">{action}</span>
          </div>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-tight mt-1">{detail}</p>
        </div>
      </div>
      <span className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.2em]">{time}</span>
    </div>
  );
}