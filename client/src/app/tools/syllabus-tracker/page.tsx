"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, BookOpen, CheckCircle2, Zap, Info, CloudSync, Award, Earth, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";
import { SYLLABUS_DATA } from "@/config/syllabus-data";
import { LoginDialog } from "@/components/LoginDialog";

export default function SyllabusTrackerPage() {
  const [selectedExam, setSelectedExam] = useState<string>("GATE-CSE-2026");
  const [checkedTopics, setCheckedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Logic: Guest vs Authenticated
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

    // LOSS AVERSION HOOK: Force login after 10 topics
    if (!user && newTopics.length > 10) {
      setIsLoginOpen(true);
      toast.info("Secure Your Hard Work", {
        description: "You've mastered 10 modules! Login to ensure this data is never lost."
      });
      return;
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
        toast.error("Sync Interrupted. Retrying locally...");
      } finally {
        setIsSyncing(false);
      }
    } else {
      localStorage.setItem(`tracker_${selectedExam}`, JSON.stringify(newTopics));
    }

    if (isChecking) {
      toast.success("Module Mastered!", { icon: <Sparkles className="text-yellow-500 w-4 h-4" /> });
    }
  };

  const currentExam = SYLLABUS_DATA[selectedExam] || SYLLABUS_DATA["GATE-CSE-2026"];
  const allTopics = useMemo(() => currentExam.subjects.flatMap(s => s.topics), [selectedExam]);
  const progressPercent = Math.round((checkedTopics.length / allTopics.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 lg:pb-12 pt-16 font-sans">
      
      {/* 🟢 TOP TRENDING BANNER (FOMO) */}
      <div className="bg-red-600/10 border-b border-red-600/20 py-2 px-4 flex justify-center items-center gap-6 overflow-hidden">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 animate-pulse">
          <Trophy size={12} /> Live: Top 1% candidates are syncing progress
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-10 grid lg:grid-cols-12 gap-10">
        
        {/* 🟢 SIDEBAR: EXAM HUD */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="bg-zinc-900/40 border-white/5 rounded-[3rem] backdrop-blur-3xl p-8 relative overflow-hidden group border-t-red-600/20">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award size={120} />
            </div>

            <div className="space-y-8 relative z-10">
                {/* DYNAMIC LOGO HUD */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-[2rem] bg-white p-4 shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center">
                    <img 
                      src={currentExam.logo} 
                      alt="Exam Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                      {currentExam.name}
                    </h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2">Neural Prep Protocol</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center transition-transform hover:scale-105">
                        <p className="text-3xl font-black">{checkedTopics.length}</p>
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Mastered</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center transition-transform hover:scale-105">
                        <p className="text-3xl font-black text-zinc-700">{allTopics.length - checkedTopics.length}</p>
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Locked</p>
                    </div>
                </div>

                {user ? (
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10 uppercase tracking-widest">
                        <Earth size={14} className={cn(isSyncing && "animate-spin")} />
                        Authenticated // {user.username}
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsLoginOpen(true)}
                        className="w-full bg-white text-black py-5 rounded-3xl font-black text-[11px] uppercase italic hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                    >
                        <Zap size={14} fill="currentColor" /> Initialize Cloud Sync
                    </button>
                )}
            </div>
          </Card>

          {/* LOSS AVERSION NUDGE */}
          {!user && (
            <div className="bg-zinc-900/50 border border-white/5 p-7 rounded-[2.5rem] flex gap-5 backdrop-blur-sm group">
                <Info className="text-red-600 shrink-0 group-hover:rotate-12 transition-transform" size={24} />
                <p className="text-[11px] font-medium text-zinc-400 leading-relaxed uppercase tracking-tight">
                    <span className="text-red-500 font-black italic mr-1 tracking-widest text-[13px]">Critical:</span> 
                    Session is <span className="text-white font-bold underline">Temporary</span>. 
                    Login to PaperTube to sync this progress to your mobile and other devices.
                </p>
            </div>
          )}
        </aside>

        {/* 🟢 RIGHT COLUMN: SUBJECT MODULES */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col md:flex-row gap-5 items-center justify-between sticky top-20 z-10 py-2">
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full md:w-72 bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:ring-2 ring-red-600 transition-all cursor-pointer hover:bg-zinc-800"
            >
              {Object.keys(SYLLABUS_DATA).map(key => <option key={key} value={key}>{key}</option>)}
            </select>
            
            <div className="relative w-full md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                    placeholder="Filter specific modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-700"
                />
            </div>
          </div>

          {currentExam.subjects.map((subject) => {
            const filteredTopics = subject.topics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            if (searchQuery && filteredTopics.length === 0) return null;
            
            const subDone = subject.topics.filter(t => checkedTopics.includes(t)).length;
            const subPercent = Math.round((subDone / subject.topics.length) * 100);

            return (
              <div key={subject.id} className="space-y-6 group">
                <div className="flex items-end justify-between px-3">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-1.5 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:scale-y-110 transition-transform" />
                        <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-white/90">{subject.name}</h3>
                            <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-2 italic">{subDone}/{subject.topics.length} Nodes Mastered</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-red-500 border-red-600/30 px-4 py-1 rounded-full text-[10px] font-black italic bg-red-600/5">{subPercent}%</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredTopics.map((topic) => {
                    const isDone = checkedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={cn(
                          "flex items-center gap-5 p-6 rounded-[2rem] border text-left transition-all active:scale-[0.97] group/item relative overflow-hidden",
                          isDone 
                            ? "bg-red-600/10 border-red-600/30 shadow-[0_0_40px_rgba(220,38,38,0.05)]" 
                            : "bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-800/40"
                        )}
                      >
                        <div className={cn(
                          "h-7 w-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-500",
                          isDone ? "bg-red-600 border-red-600 rotate-12 scale-110 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "border-zinc-800"
                        )}>
                          {isDone && <CheckCircle2 size={16} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className={cn(
                          "text-[14px] font-bold tracking-tight",
                          isDone ? "text-white" : "text-zinc-500 group-hover/item:text-zinc-300"
                        )}>{topic}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

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
            toast.success("Identity Verified. Cloud Sync Active.");
        }}
      />
    </div>
  );
}