"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ListChecks, Search, BookOpen, Trash2, 
  CheckCircle2, Circle, TrendingUp, Trophy,
  LayoutDashboard, Target, RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const SYLLABUS_DATA = {
  "GATE-CS": {
    name: "GATE Computer Science 2026",
    subjects: [
      { name: "Engineering Mathematics", topics: ["Discrete Mathematics", "Linear Algebra", "Calculus", "Probability & Statistics"] },
      { name: "Programming & Data Structures", topics: ["Programming in C", "Recursion", "Arrays", "Stacks", "Queues", "Linked Lists", "Trees", "Graphs"] },
      { name: "Algorithms", topics: ["Searching & Sorting", "Hashing", "Asymptotic Analysis", "Greedy Algorithms", "Dynamic Programming"] },
      { name: "Operating System", topics: ["Processes", "Threads", "CPU Scheduling", "Deadlock", "Memory Management", "File Systems"] },
      { name: "Computer Networks", topics: ["OSI & TCP/IP Stack", "Data Link Layer", "Network Layer", "Routing", "IPV4/IPV6"] },
    ]
  }
};

export default function SyllabusTrackerPage() {
  const [selectedExam, setSelectedExam] = useState<keyof typeof SYLLABUS_DATA>("GATE-CS");
  const [checkedTopics, setCheckedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`tracker_${selectedExam}`);
    if (saved) setCheckedTopics(JSON.parse(saved));
  }, [selectedExam]);

  const toggleTopic = (topic: string) => {
    const newChecked = checkedTopics.includes(topic)
      ? checkedTopics.filter(t => t !== topic)
      : [...checkedTopics, topic];
    
    setCheckedTopics(newChecked);
    localStorage.setItem(`tracker_${selectedExam}`, JSON.stringify(newChecked));
    if (!checkedTopics.includes(topic)) toast.success("Task Complete", { description: topic });
  };

  const currentExam = SYLLABUS_DATA[selectedExam];
  const allTopics = useMemo(() => currentExam.subjects.flatMap(s => s.topics), [selectedExam]);
  const overallProgress = Math.round((checkedTopics.length / allTopics.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
      {/* Header */}
      <section className="py-16 border-b border-white/5 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4 px-4 py-1 uppercase tracking-widest">
            Academic Performance
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
            SYLLABUS <span className="text-emerald-500 italic">TRACKER</span>
          </h1>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-3xl mx-auto mt-8">
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 w-full md:w-64"
            >
              {Object.keys(SYLLABUS_DATA).map(key => <option key={key} value={key}>{key}</option>)}
            </select>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input 
                type="text" placeholder="Search topic..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-emerald-500" /> PROGRESS DASHBOARD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 text-center">
                <div className="text-6xl font-black text-emerald-500 tracking-tighter">{overallProgress}%</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-2xl font-black">{checkedTopics.length}</p>
                    <p className="text-[9px] text-neutral-500 uppercase font-bold">Done</p>
                  </div>
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-2xl font-black text-neutral-400">{allTopics.length - checkedTopics.length}</p>
                    <p className="text-[9px] text-neutral-500 uppercase font-bold">Pending</p>
                  </div>
                </div>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black" onClick={() => window.print()}>
                  <Target className="h-4 w-4 mr-2" /> EXPORT PLAN
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Checklist */}
          <div className="lg:col-span-8 space-y-6">
            {currentExam.subjects.map((subject, idx) => {
              const filtered = subject.topics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
              if (searchQuery && filtered.length === 0) return null;
              const subProgress = Math.round((subject.topics.filter(t => checkedTopics.includes(t)).length / subject.topics.length) * 100);

              return (
                <Card key={idx} className="bg-neutral-900/40 border-neutral-800 overflow-hidden">
                  <div className="h-1 w-full bg-neutral-800">
                    <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${subProgress}%` }} />
                  </div>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-emerald-500/60" /> {subject.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/20">{subProgress}%</Badge>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    {filtered.map((topic, tIdx) => (
                      <div 
                        key={tIdx} onClick={() => toggleTopic(topic)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:translate-x-1",
                          checkedTopics.includes(topic) 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                            : "bg-black/20 border-white/5 text-neutral-400 hover:border-white/20"
                        )}
                      >
                        {checkedTopics.includes(topic) ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Circle className="h-4 w-4 shrink-0 opacity-20" />}
                        <span className="text-sm font-medium">{topic}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}