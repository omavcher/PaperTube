"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, BookOpen, CheckCircle2, Zap, Info, 
  CloudSync, Award, Earth, Trophy, Sparkles,
  ArrowLeft, Home, Grid, Settings, TableRowsSplitIcon,
  PieChart, Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";
import { SYLLABUS_DATA } from "@/config/syllabus-data";
import { LoginDialog } from "@/components/LoginDialog";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

export default function SyllabusTrackerClient() {
  const [selectedExam, setSelectedExam] = useState<string>("GATE-CSE-2027");
  const [checkedTopics, setCheckedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useToolAnalytics("syllabus-tracker", "SYLLABUS", "Workflows");

  // --- Sync Logic ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      syncWithBackend(userData.id, selectedExam);
    } else {
      const saved = localStorage.getItem(`tracker_${selectedExam}`);
      if (saved) setCheckedTopics(JSON.parse(saved));
    }
  }, [selectedExam]);

  const syncWithBackend = async (userId: string, examId: string) => {
    try {
      const res = await api.get(`/user/progress/${userId}/${examId}`);
      if (res.data.success) setCheckedTopics(res.data.topics);
    } catch (e) {
      const saved = localStorage.getItem(`tracker_${examId}`);
      if (saved) setCheckedTopics(JSON.parse(saved));
    }
  };

  const toggleTopic = async (topic: string) => {
    const isChecking = !checkedTopics.includes(topic);
    const newTopics = isChecking 
      ? [...checkedTopics, topic] 
      : checkedTopics.filter(t => t !== topic);

    // LOSS AVERSION HOOK: Force login after 10 topics for guests
    if (!user && newTopics.length > 10 && newTopics.length % 5 === 0) {
      setIsLoginOpen(true);
      toast.info("Secure Your Progress", {
        description: "Login now to prevent data loss on browser clear.",
        duration: 5000,
      });
    }

    setCheckedTopics(newTopics);

    if (user) {
      setIsSyncing(true);
      try {
        await api.post("/user/update-syllabus", {
          userId: user.id,
          examId: selectedExam,
          topics: newTopics,
          email: user.email
        });
      } catch (err) {
        // Silent fail
      } finally {
        setIsSyncing(false);
      }
    } else {
      localStorage.setItem(`tracker_${selectedExam}`, JSON.stringify(newTopics));
    }

    if (isChecking) {
      toast.success("MODULE MASTERED", { 
        icon: <Sparkles className="text-cyan-500 w-4 h-4" />,
        duration: 1500
      });
    }
  };

  const currentExam = SYLLABUS_DATA[selectedExam] || SYLLABUS_DATA["GATE-CSE-2027"];
  const allTopics = useMemo(() => currentExam.subjects.flatMap((s: any) => s.topics), [currentExam]);
  const progressPercent = Math.round((checkedTopics.length / allTopics.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-cyan-600/5 blur-[100px] pointer-events-none" />

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <TableRowsSplitIcon className="text-cyan-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">TRACKER</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10">
        
        {/* --- Top Banner (FOMO) --- */}
        <div className="mb-8 bg-gradient-to-r from-cyan-900/10 to-transparent border-l-4 border-cyan-500 p-4 rounded-r-2xl flex items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 backdrop-blur-sm">
          <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
             <Trophy className="text-cyan-500 h-5 w-5 animate-pulse" />
          </div>
          <div>
             <p className="text-xs font-bold text-cyan-100 uppercase tracking-wide mb-0.5">Live Insight</p>
             <p className="text-[10px] text-cyan-400/80 leading-relaxed max-w-2xl">
               Top 1% of candidates have already completed 45% of this syllabus. Maintain momentum to stay ahead of the curve.
             </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Sidebar / HUD --- */}
          <aside className="lg:col-span-4 space-y-6 h-fit lg:sticky lg:top-32">
            <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md overflow-hidden relative group rounded-[2rem] shadow-2xl">
               {/* Background Decoration */}
               <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none rotate-12">
                 <Award size={180} />
               </div>

               <CardContent className="p-8 relative z-10 space-y-8">
                 {/* Exam Header */}
                 <div className="flex flex-col items-center text-center space-y-4">
                   <div className="w-24 h-24 rounded-[1.5rem] bg-white p-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                      {/* Placeholder for Exam Logo */}
                      {currentExam.logo ? (
                        <img src={currentExam.logo} alt="Exam" className="w-full h-full object-contain" />
                      ) : (
                        <BookOpen className="text-black h-10 w-10" />
                      )}
                   </div>
                   <div>
                     <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
                       {currentExam.name}
                     </h2>
                     <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mt-2">Prep Protocol Active</p>
                   </div>
                 </div>

                 {/* Progress Stats */}
                 <div className="grid grid-cols-2 gap-3">
                   <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center backdrop-blur-sm">
                      <p className="text-3xl font-black text-white">{checkedTopics.length}</p>
                      <p className="text-[9px] font-bold uppercase text-neutral-500 tracking-wider">Completed</p>
                   </div>
                   <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center backdrop-blur-sm">
                      <p className="text-3xl font-black text-neutral-600">{allTopics.length - checkedTopics.length}</p>
                      <p className="text-[9px] font-bold uppercase text-neutral-600 tracking-wider">Remaining</p>
                   </div>
                 </div>

                 {/* Main Progress Bar */}
                 <div className="space-y-3">
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest text-neutral-400">
                      <span>Completion Rate</span>
                      <span className="text-cyan-400">{progressPercent}%</span>
                   </div>
                   <Progress value={progressPercent} className="h-3 bg-neutral-800 rounded-full border border-white/5" indicatorClassName="bg-cyan-500" />
                 </div>

                 {/* User Status */}
                 {user ? (
                   <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 uppercase tracking-widest">
                      <Earth size={14} className={cn(isSyncing && "animate-spin")} />
                      {isSyncing ? "Syncing Cloud..." : `Linked: ${user.username}`}
                   </div>
                 ) : (
                   <Button 
                     onClick={() => setIsLoginOpen(true)}
                     className="w-full bg-white text-black hover:bg-neutral-200 font-black text-[10px] uppercase tracking-widest h-14 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]"
                   >
                      <Zap size={14} className="mr-2 fill-black" /> Sync Progress
                   </Button>
                 )}
               </CardContent>
            </Card>

            {/* Guest Warning */}
            {!user && (
              <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex gap-4 backdrop-blur-sm">
                 <Info className="text-red-500 shrink-0 mt-0.5" size={16} />
                 <p className="text-[10px] font-medium text-neutral-400 leading-relaxed uppercase tracking-wide">
                   <strong className="text-red-500 block mb-1">Volatile Memory</strong> 
                   Data is stored locally. Clearing cache will result in data loss.
                 </p>
              </div>
            )}
          </aside>

          {/* --- RIGHT: Content Modules --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Controls */}
            <div className="sticky top-20 z-30 bg-[#0a0a0a]/90 backdrop-blur-xl p-3 -mx-2 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3 shadow-2xl">
              <div className="relative w-full md:w-64">
                  <select 
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full h-12 appearance-none bg-neutral-900 border border-white/10 rounded-xl px-4 text-xs font-black uppercase text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                  >
                    {Object.keys(SYLLABUS_DATA).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                  <ArrowLeft className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[-90deg] pointer-events-none text-neutral-500" size={14} />
              </div>
              
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                 <input 
                   placeholder="SEARCH TOPICS..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full h-12 bg-neutral-900 border border-white/10 rounded-xl pl-12 pr-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-cyan-500 transition-all placeholder:text-neutral-700"
                 />
              </div>
            </div>

            {/* Subject Lists */}
            <div className="space-y-8 pb-10">
              {currentExam.subjects.map((subject: any) => {
                const filteredTopics = subject.topics.filter((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
                if (searchQuery && filteredTopics.length === 0) return null;
                
                const subDone = subject.topics.filter((t: string) => checkedTopics.includes(t)).length;
                const subPercent = Math.round((subDone / subject.topics.length) * 100);

                return (
                  <div key={subject.id} className="space-y-4">
                    <div className="flex items-end justify-between px-2 pb-2 border-b border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="h-8 w-1.5 bg-cyan-600 rounded-full shadow-[0_0_10px_rgba(8,145,178,0.5)]" />
                          <div>
                             <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">{subject.name}</h3>
                             <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">
                               {subDone} / {subject.topics.length} Units
                             </p>
                          </div>
                       </div>
                       <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/5 font-mono font-bold text-xs px-3 py-1">
                          {subPercent}%
                       </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredTopics.map((topic: string) => {
                        const isDone = checkedTopics.includes(topic);
                        return (
                          <button
                            key={topic}
                            onClick={() => toggleTopic(topic)}
                            className={cn(
                              "relative group flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300 overflow-hidden",
                              isDone 
                                ? "bg-cyan-500/10 border-cyan-500/30" 
                                : "bg-neutral-900/40 border-white/5 hover:border-white/20 hover:bg-neutral-800/60"
                            )}
                          >
                            <div className={cn(
                              "mt-0.5 h-5 w-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all z-10",
                              isDone 
                                ? "bg-cyan-500 border-cyan-500 scale-110 shadow-[0_0_10px_rgba(8,145,178,0.4)]" 
                                : "border-neutral-700 group-hover:border-neutral-500"
                            )}>
                               {isDone && <CheckCircle2 size={12} className="text-black" strokeWidth={4} />}
                            </div>
                            <span className={cn(
                              "text-xs font-bold uppercase tracking-wide leading-relaxed transition-colors z-10",
                              isDone ? "text-cyan-100 line-through opacity-50" : "text-neutral-400 group-hover:text-white"
                            )}>
                              {topic}
                            </span>
                            
                            {/* Glow Effect on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Empty State for Search */}
              {searchQuery && allTopics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                 <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-neutral-900/20">
                    <Search className="mx-auto h-10 w-10 text-neutral-700 mb-4" />
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No modules matching "{searchQuery}"</p>
                 </div>
              )}
            </div>

          </div>
        </div>

        {/* --- CORE PROMO --- */}
        <div className="mt-20 mb-10">
           <CorePromo />
        </div>

      </main>

      {/* --- Auth Dialog --- */}
      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={(token, info) => {
            const userObj = {
                id: info.id || "68ea440cce4c1f28b4be9627", 
                name: info.name,
                email: info.email,
                picture: info.picture,
                username: info.name.toLowerCase().replace(/\s/g, ""),
                googleId: info.sub
            };
            localStorage.setItem("user", JSON.stringify(userObj));
            setUser(userObj);
            setIsLoginOpen(false);
            api.post("/user/update-syllabus", { userId: userObj.id, topics: checkedTopics, examId: selectedExam });
            toast.success("IDENTITY VERIFIED");
        }}
      />

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-cyan-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}