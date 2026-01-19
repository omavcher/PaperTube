"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  ArrowLeft, Download, Github, Terminal, 
  Cpu, Activity, Zap, ShieldAlert, 
  Search, Star, GitFork, Users, 
  Package, Code, Share2, Sparkles,
  MousePointer2, Globe, TrendingUp,
  Code2, Calendar, HardDrive, Binary
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function GithubWrappedPage() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // --- Logic: Deep Data Extraction ---
  const fetchDeepWrapped = async () => {
    if (!username.trim()) return toast.error("Personnel ID Required");
    
    setIsScanning(true);
    setUserData(null);
    const loadingToast = toast.loading(`Infiltrating ${username}'s repositories...`);

    try {
      // 1. Fetch User Profile
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      if (!userRes.ok) throw new Error("Personnel not found in Global Net");
      const profile = await userRes.json();

      // 2. Fetch Repos for deeper stats
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      const repos = await reposRes.json();

      // 3. Calculate Intelligence Metrics
      const totalStars = repos.reduce((acc: number, r: any) => acc + r.stargazers_count, 0);
      const totalForks = repos.reduce((acc: number, r: any) => acc + r.forks_count, 0);
      
      // Extract Languages
      const langMap: Record<string, number> = {};
      repos.forEach((r: any) => {
        if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
      });
      const topLanguages = Object.entries(langMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      // Determine Archetype
      let archetype = "Logic Initiate";
      if (profile.public_repos > 20) archetype = "Productivity Engine";
      if (totalStars > 10) archetype = "Community Catalyst";
      if (totalStars > 100) archetype = "Architect Prime";
      if (topLanguages.some(l => l[0] === 'TypeScript' || l[0] === 'JavaScript')) archetype = "Web Synthesis Lead";

      setUserData({
        ...profile,
        totalStars,
        totalForks,
        topLanguages,
        archetype,
        accountAge: new Date().getFullYear() - new Date(profile.created_at).getFullYear()
      });

      toast.success("Intelligence Sync Complete", { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;
    const loadingToast = toast.loading("Capturing Neural Blueprint...");
    try {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 3, backgroundColor: '#000' });
      const link = document.createElement("a");
      link.download = `PaperTube-Wrapped-${userData.login}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Blueprint Saved", { id: loadingToast });
    } catch {
      toast.error("Export Protocol Interrupted", { id: loadingToast });
    }
  }, [userData]);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans relative overflow-hidden">
      {/* Background Matrix */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <header className="relative z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <h1 className="text-sm font-black uppercase italic tracking-widest text-white">Neural <span className="text-red-600">Wrapped 2.0</span></h1>
          </div>
          {userData && (
            <Button onClick={handleExport} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <Download size={18} className="mr-2" /> Export Report
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        
        {!userData && !isScanning && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto py-32 space-y-8 text-center">
             <div className="space-y-4">
                <h2 className="text-6xl font-black uppercase italic tracking-tighter">DATA <br /><span className="text-red-600">HARVEST</span></h2>
                <p className="text-neutral-500 font-medium">Input GitHub Identity to begin deep-layer analysis.</p>
             </div>
             <div className="relative flex items-center bg-neutral-900 border border-white/10 rounded-2xl p-2 shadow-2xl">
                <Terminal className="ml-4 h-5 w-5 text-neutral-700" />
                <input 
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username..." 
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 text-white font-bold outline-none uppercase text-sm tracking-widest placeholder:text-neutral-800"
                  onKeyDown={(e) => e.key === 'Enter' && fetchDeepWrapped()}
                />
                <Button onClick={fetchDeepWrapped} className="bg-red-600 hover:bg-red-700 h-12 px-6 rounded-xl font-black italic uppercase">Initialize</Button>
             </div>
          </motion.div>
        )}

        {isScanning && (
          <div className="py-48 flex flex-col items-center gap-6">
             <div className="h-20 w-20 rounded-full border-b-2 border-red-600 animate-spin" />
             <p className="text-red-500 font-black uppercase italic tracking-[0.4em] animate-pulse">Syncing Neural Paths...</p>
          </div>
        )}

        <AnimatePresence>
          {userData && (
            <motion.div 
              ref={exportRef}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[#000000] border border-red-600/30 rounded-[4rem] p-12 md:p-20 shadow-[0_40px_100px_-20px_rgba(220,38,38,0.25)] relative overflow-hidden"
            >
              {/* Decorative HUD Elements */}
              <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />
              <div className="absolute top-10 right-10 opacity-5 pointer-events-none"><Github size={400} /></div>

              <div className="relative z-10 grid lg:grid-cols-12 gap-20">
                
                {/* --- Primary Identity Module --- */}
                <div className="lg:col-span-4 space-y-10">
                   <div className="relative w-fit">
                      <div className="absolute -inset-4 bg-red-600/20 blur-2xl rounded-full" />
                      <img src={userData.avatar_url} className="h-48 w-48 rounded-3xl border-4 border-red-600 relative z-10 shadow-2xl" />
                      <Badge className="absolute -bottom-3 -right-3 bg-red-600 text-white font-black px-4 py-2 rounded-xl italic shadow-xl z-20">LVL {userData.accountAge}</Badge>
                   </div>

                   <div className="space-y-2">
                      <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">{userData.name || userData.login}</h2>
                      <p className="text-red-500 font-mono text-sm tracking-[0.3em]">@{userData.login.toUpperCase()}</p>
                   </div>

                   <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md">
                      <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-4">Neural Archetype</p>
                      <div className="flex items-center gap-5">
                         <div className="p-4 rounded-2xl bg-red-600/10 text-red-500"><Cpu size={32} /></div>
                         <div>
                            <p className="text-2xl font-black text-white italic uppercase tracking-tight leading-none">{userData.archetype}</p>
                            <p className="text-[9px] font-bold text-neutral-500 uppercase mt-2 tracking-widest">Calculated from Commit Density</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* --- Intelligence Data Module --- */}
                <div className="lg:col-span-8 space-y-12">
                   
                   {/* Main Stats Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <MetricBox label="Repositories" value={userData.public_repos} icon={<Package />} />
                      <MetricBox label="Global Stars" value={userData.totalStars} icon={<Star />} />
                      <MetricBox label="Logic Forks" value={userData.totalForks} icon={<GitFork />} />
                      <MetricBox label="Followers" value={userData.followers} icon={<Users />} />
                   </div>

                   {/* Language Matrix */}
                   <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 flex items-center gap-2">
                            <Binary size={14} /> Language Matrix
                         </h4>
                         <div className="space-y-5">
                            {userData.topLanguages.map(([name, count]: any, i: number) => (
                              <div key={name} className="space-y-2">
                                 <div className="flex justify-between text-[10px] font-black uppercase italic">
                                    <span>{name}</span>
                                    <span className="text-neutral-500">{Math.round((count / userData.public_repos) * 100)}% Usage</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }} animate={{ width: `${(count / userData.public_repos) * 100}%` }}
                                      transition={{ delay: i * 0.2, duration: 1 }}
                                      className="h-full bg-red-600 shadow-[0_0_10px_red]" 
                                    />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Engineering Timeline */}
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2">
                            <Calendar size={14} /> Account Chronology
                         </h4>
                         <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-bold text-neutral-500 uppercase">Deployed Since</span>
                               <span className="text-sm font-black italic">{new Date(userData.created_at).getFullYear()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-bold text-neutral-500 uppercase">Last Sync</span>
                               <span className="text-sm font-black italic">{new Date(userData.updated_at).toLocaleDateString()}</span>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                               <TrendingUp className="text-emerald-500" size={14} />
                               <span className="text-[10px] font-black text-emerald-500 uppercase">Active Status: Optimal</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* --- BRAND WATERMARK --- */}
                   <div className="pt-12 flex justify-end items-center gap-3 select-none opacity-40">
                      <div className="h-5 w-px bg-white/10 mx-2" />
                      <span className="text-xl font-black tracking-[0.3em] uppercase italic text-white">
                        Paper<span className="text-red-600">Tube</span>
                      </span>
                   </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function MetricBox({ label, value, icon }: any) {
  return (
    <div className="space-y-3 p-6 rounded-3xl bg-neutral-950 border border-white/5 hover:border-red-600/30 transition-all group">
       <div className="text-neutral-700 group-hover:text-red-500 transition-colors">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
       </div>
       <div>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{label}</p>
          <p className="text-4xl font-black italic tracking-tighter text-white">{value}</p>
       </div>
    </div>
  );
}