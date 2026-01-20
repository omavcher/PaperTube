"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Merge, Split, FileSearch, Sparkles, Zap, ShieldCheck, 
  Globe, CheckCircle, Search, ArrowRight, MousePointer2, 
  Loader2, Send, Terminal, FileCode, Database, GitCompare, 
  Scan, ArrowRightLeft, Keyboard, ShieldAlert, Github, 
  BookOpen, InspectionPanel, TableRowsSplitIcon, BinaryIcon, PercentCircle 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";
import { toast } from "sonner";

const pdfTools = [
  { id: "previous-year-papers", title: "EXAM PAPERS", description: "Competitive exam repository.", icon: <BookOpen />, category: "Workflows", path: "/exams", color: "text-pink-400", isNew: false },
  { id: "merge-pdf", title: "MERGE PDF", description: "Combine multiple PDFs.", icon: <Merge />, category: "Organize PDF", path: "/tools/merge", color: "text-red-400", isNew: true },
  { id: "split-pdf", title: "SPLIT PDF", description: "Extract or split pages.", icon: <Split />, category: "Organize PDF", path: "/tools/split", color: "text-green-400", isNew: false },
  { id: "cgpa-calculator", title: "CGPA CALC", description: "Grade Point Average.", icon: <PercentCircle />, category: "Engineering Tools", path: "/tools/cgpa-calculator", color: "text-emerald-400", isNew: false },
  { id: "json-formatter", title: "JSON FIX", description: "Beautify & validate JSON.", icon: <BinaryIcon />, category: "Engineering Tools", path: "/tools/json-formatter", color: "text-blue-400", isNew: true },
  { id: "resume-ats-checker", title: "ATS CHECK", description: "Optimize for keywords.", icon: <FileSearch />, category: "Workflows", path: "/tools/resume-checker", color: "text-pink-400", isNew: false },
  { id: "matrix-calculator", title: "MATRIX LAB", description: "Up to 5x5 operations.", icon: <InspectionPanel />, category: "Engineering Tools", path: "/tools/matrix-calculator", color: "text-orange-400", isNew: false },
  { id: "logic-gate-lab", title: "LOGIC GATE", description: "Boolean simulation.", icon: <Zap />, category: "Engineering Tools", path: "/tools/logic-gate-lab", color: "text-yellow-400", isNew: false },
  { id: "base-converter", title: "BASE CONV", description: "Binary to Hex/Dec.", icon: <Terminal />, category: "Engineering Tools", path: "/tools/base-converter", color: "text-slate-400", isNew: false },
  { id: "syllabus-tracker", title: "SYLLABUS", description: "Track exam milestones.", icon: <TableRowsSplitIcon />, category: "Workflows", path: "/tools/syllabus-tracker", color: "text-cyan-400", isNew: true },
  { id: "code-to-image", title: "CODE SNAP", description: "Snippets to images.", icon: <FileCode />, category: "Engineering Tools", path: "/tools/code-to-image", color: "text-red-500", isNew: false },
  { id: "sql-architect", title: "SQL ARCH", description: "Visualize DB queries.", icon: <Database />, category: "Engineering Tools", path: "/tools/sql-architect", color: "text-blue-500", isNew: false },
  { id: "git-forge", title: "GIT FORGE", description: "Blueprint git flows.", icon: <GitCompare />, category: "Workflows", path: "/tools/git-forge", color: "text-orange-500", isNew: false },
  { id: "bg-remover", title: "BG REMOVE", description: "Neural edge-detection.", icon: <Scan />, category: "Workflows", path: "/tools/bg-remover", color: "text-red-500", isNew: false },
  { id: "image-converter", title: "IMAGE CONV", description: "PNG/JPG/WEBP conv.", icon: <ArrowRightLeft />, category: "Engineering Tools", path: "/tools/image-converter", color: "text-orange-500", isNew: false },
  { id: "typing-speed-test", title: "VELOCITY", description: "Precision WPM test.", icon: <Keyboard />, category: "Engineering Tools", path: "/tools/typing-test", color: "text-red-500", isNew: false },
  { id: "ai-detector", title: "SENTINEL", description: "Forensic image scans.", icon: <ShieldAlert />, category: "Engineering Tools", path: "/tools/sentinel", color: "text-red-600", isNew: true },
  { id: "github-wrapped", title: "WRAPPED", description: "Visual GitHub impact.", icon: <Github />, category: "Career", path: "/tools/github-wrapped", color: "text-white", isNew: true },
];

const categories = [
  { id: "all", name: "All Matrix" },
  { id: "Workflows", name: "Workflows" },
  { id: "Organize PDF", name: "PDF Suite" },
  { id: "Engineering Tools", name: "Lab" },
];

export default function MobileOptimizedTools() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [toolName, setToolName] = useState("");
  const [toolDesc, setToolDesc] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTools = useMemo(() => {
    return pdfTools.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [selectedCategory, searchQuery]);

  const handleSuggestTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuggesting(true);
    try {
      await api.post("/tools/suggest", { name: toolName, description: toolDesc });
      toast.success("LAB_REQUEST_RECEIVED");
      setIsModalOpen(false);
    } catch { toast.error("CONNECTION_ERROR"); }
    finally { setIsSuggesting(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      
      {/* --- HUD Header --- */}
      <section className="pt-16 pb-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-red-600/10 blur-[120px] rounded-full" />
        
        <div className="container mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5"
          >
            <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">54.2k Engineers Active</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.8] mb-6">
            CORE_<span className="text-red-600">TOOL</span><br />MATRIX
          </h1>

          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-red-600/20 blur opacity-0 group-focus-within:opacity-100 transition duration-500 rounded-2xl" />
            <div className="relative flex items-center bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
              <Search className="ml-4 h-5 w-5 text-neutral-600" />
              <input 
                type="text" 
                placeholder="EXECUTE SEARCH..." 
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 text-white font-black uppercase text-xs tracking-widest outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Swippable Filter --- */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-y border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-6 py-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                selectedCategory === cat.id 
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                  : "bg-white/5 text-neutral-500 border border-white/5 hover:text-white"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* --- Tools Matrix (2-Column Mobile) --- */}
      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={tool.id}
              >
                <Link href={tool.path} className="group relative block h-full">
                  <Card className="h-full bg-neutral-900/30 border-white/5 group-hover:border-red-600/50 transition-all duration-300 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-4 md:p-6 pb-2">
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-2.5 md:p-4 rounded-xl bg-black border border-white/10 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner", tool.color)}>
                          {tool.icon}
                        </div>
                        {tool.isNew && (
                          <Badge className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0">NEW</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xs md:text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-red-500 line-clamp-1">
                        {tool.title}
                      </CardTitle>
                      <p className="text-neutral-600 text-[9px] md:text-xs font-bold leading-tight mt-1 line-clamp-2 uppercase">
                        {tool.description}
                      </p>
                    </CardHeader>
                    <div className="p-4 md:p-6 pt-0 mt-2 flex justify-between items-center">
                       <span className="text-[8px] font-black text-neutral-800 uppercase tracking-tighter">NODE_ACCESS</span>
                       <ArrowRight size={12} className="text-red-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- Request FOMO Section --- */}
      <section className="px-4 py-20">
        <div className="relative rounded-[2.5rem] bg-red-600 p-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4 text-white">
              NEED A<br /><span className="text-black/40">NEW MODULE?</span>
            </h2>
            <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-white/80 mb-8 max-w-xs mx-auto">
              Queue your request to our engineering lab for priority development.
            </p>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-black text-white hover:bg-neutral-900 rounded-2xl px-10 py-7 text-sm font-black italic uppercase shadow-2xl active:scale-95 transition-transform">
                  REQUEST_BUILD <MousePointer2 className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-white/10 text-white rounded-[2.5rem] p-8 w-[95vw] max-w-md">
                <DialogHeader>
                  <Terminal className="text-red-600 mb-2" />
                  <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Submit_Spec</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSuggestTool} className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">Tool Name</label>
                    <Input value={toolName} onChange={(e) => setToolName(e.target.value)} className="bg-white/5 border-white/5 h-12 rounded-xl" placeholder="e.g. HEX_ENCODER" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">Purpose</label>
                    <Textarea value={toolDesc} onChange={(e) => setToolDesc(e.target.value)} className="bg-white/5 border-white/5 min-h-[100px] rounded-xl" placeholder="Detailed engineering specification..." />
                  </div>
                  <Button type="submit" disabled={isSuggesting} className="w-full h-14 bg-red-600 rounded-2xl font-black uppercase italic">
                    {isSuggesting ? <Loader2 className="animate-spin" /> : <Send size={16} className="mr-2" />} BROADCAST_REQUEST
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* --- Footer HUD --- */}
      <footer className="border-t border-white/5 py-10 px-6 bg-neutral-950">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 container mx-auto">
          <StatHUD icon={<ShieldCheck className="text-red-600" size={16} />} label="SECURE_NODE" desc="End-to-end logic." />
          <StatHUD icon={<Zap className="text-yellow-500" size={16} />} label="V8_ENGINE" desc="Instant execution." />
          <StatHUD icon={<CheckCircle className="text-emerald-500" size={16} />} label="VERIFIED" desc="Engineering grade." />
          <StatHUD icon={<Globe className="text-blue-500" size={16} />} label="OPEN_STACK" desc="Community driven." />
        </div>
      </footer>
    </div>
  );
}

function StatHUD({ icon, label, desc }: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">{icon}</div>
      <h4 className="text-[10px] font-black uppercase italic tracking-tighter text-white">{label}</h4>
      <p className="text-[9px] font-bold text-neutral-600 leading-tight uppercase">{desc}</p>
    </div>
  );
}