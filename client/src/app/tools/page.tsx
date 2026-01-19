"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Merge, Split, Edit, FileSearch, 
  Sparkles, Zap, ShieldCheck, 
  Globe, CheckCircle, Search, ArrowRight, MousePointer2, Command,
  Loader2, Send, Terminal,
  FileCode,
  Database,
  GitCompare,
  Scan,
  ArrowRightLeft,
  Keyboard,
  ShieldAlert,
  Github,
  BookOpen,
  InspectionPanel,
  TableRowsSplitIcon,
  BinaryIcon,
  PercentCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import api from "@/config/api";
import { toast } from "sonner";

const pdfTools = [
  { id: "previous-year-papers", title: "Previous Year Exam Papers", description: "Access a comprehensive collection of competitive exam papers.", icon: <BookOpen />, category: "Workflows", path: "/exams", color: "text-pink-400", featured: true },
  { id: "merge-pdf", title: "Merge PDF", description: "Combine multiple PDFs into a single document effortlessly.", icon: <Merge />, category: "Organize PDF", path: "/tools/merge", color: "text-red-400", featured: true },
  { id: "split-pdf", title: "Split PDF", description: "Extract pages or split into multiple files instantly.", icon: <Split />, category: "Organize PDF", path: "/tools/split", color: "text-green-400", featured: true },
  { id: "cgpa-calculator", title: "CGPA Calculator", description: "Calculate your Cumulative Grade Point Average easily.", icon: <PercentCircle />, category: "Engineering Tools", path: "/tools/cgpa-calculator", color: "text-emerald-400", featured: true },
  { id: "json-formatter", title: "JSON Formatter", description: "Beautify, minify, and validate JSON data with one click.", icon: <BinaryIcon />, category: "Engineering Tools", path: "/tools/json-formatter", color: "text-blue-400", featured: true },
  { id: "resume-ats-checker", title: "Resume ATS Optimizer", description: "Check your resume against technical engineering keywords.", icon: <FileSearch />, category: "Workflows", path: "/tools/resume-checker", color: "text-pink-400", featured: true },
  { id: "matrix-calculator", title: "Matrix Calculator", description: "Perform matrix operations and calculations up to 5x5.", icon: <InspectionPanel />, category: "Engineering Tools", path: "/tools/matrix-calculator", color: "text-orange-400", featured: true },
  { id: "logic-gate-lab", title: "Logic Gate Lab", description: "Simulate and generate truth tables for boolean logic.", icon: <Zap />, category: "Engineering Tools", path: "/tools/logic-gate-lab", color: "text-yellow-400", featured: true },
  { id: "base-converter", title: "Number Base Converter", description: "Convert between Binary, Hex, Dec, and Octal.", icon: <Command />, category: "Engineering Tools", path: "/tools/base-converter", color: "text-slate-400", featured: true },
  { id: "syllabus-tracker", title: "Syllabus Tracker", description: "Track your exam progress with visual milestones.", icon: <TableRowsSplitIcon />, category: "Workflows", path: "/tools/syllabus-tracker", color: "text-cyan-400", featured: true },
  { id: "code-to-image", title: "Code Artifact Generator", description: "Transform raw snippets into images for documentation.", icon: <FileCode className="h-5 w-5" />, category: "Engineering Tools", path: "/tools/code-to-image", color: "text-red-500", featured: true },
  { id: "sql-architect", title: "SQL Query Architect", description: "Visualize relational database queries as technical schematics.", icon: <Database className="h-5 w-5" />, category: "Engineering Tools", path: "/tools/sql-architect", color: "text-blue-500", featured: true },
  { id: "git-forge", title: "Git Command Blueprint", description: "Generate complex Git sequences and visual branch flows.", icon: <GitCompare className="h-5 w-5" />, category: "Workflows", path: "/tools/git-forge", color: "text-orange-500", featured: true },
  { id: "bg-remover", title: "Neural BG Remover", description: "Isolate subjects from backgrounds using edge-detection AI.", icon: <Scan className="h-5 w-5" />, category: "Workflows", path: "/tools/bg-remover", color: "text-red-500", featured: true },
  { id: "image-converter", title: "Polyform Image Converter", description: "Transmute image formats locally. PNG, JPG, and WEBP.", icon: <ArrowRightLeft className="h-5 w-5" />, category: "Engineering Tools", path: "/tools/image-converter", color: "text-orange-500", featured: true },
  { id: "typing-speed-test", title: "Neural Velocity Test", description: "Measure your WPM and logic accuracy with high-precision.", icon: <Keyboard className="h-5 w-5" />, category: "Engineering Tools", path: "/tools/typing-test", color: "text-red-500", featured: true },
  { id: "ai-detector", title: "Neural AI Sentinel", description: "Forensic scans on images to detect AI platform signatures.", icon: <ShieldAlert className="h-5 w-5" />, category: "Engineering Tools", path: "/tools/sentinel", color: "text-red-600", featured: true },
  { id: "exif-sentinel", title: "EXIF Privacy Sentinel", description: "Identify and purge hidden location data from photos.", icon: <ShieldAlert className="h-5 w-5" />, category: "Workflows", path: "/tools/exif-sentinel", color: "text-red-600", featured: true },
  { id: "github-wrapped", title: "GitHub Neural Wrapped", description: "Visual summary of your GitHub engineering impact.", icon: <Github className="h-5 w-5" />, category: "Career", path: "/tools/github-wrapped", color: "text-white", featured: true },
];

const categories = [
  { id: "all", name: "All Matrix" },
  { id: "Workflows", name: "Workflows" },
  { id: "Organize PDF", name: "PDF Suite" },
  { id: "Engineering Tools", name: "Engineering Lab" },
];

export default function EnhancedToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [toolName, setToolName] = useState("");
  const [toolDesc, setToolDesc] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const filteredTools = useMemo(() => {
    return pdfTools.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [selectedCategory, searchQuery]);

  const handleSuggestTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName || !toolDesc) {
      toast.error("Please provide both tool name and purpose.");
      return;
    }
    setIsSuggesting(true);
    try {
      const token = localStorage.getItem("authToken");
      await api.post("/tools/suggest", {
        name: toolName,
        description: toolDesc,
        timestamp: new Date().toISOString()
      }, { headers: { 'Auth': token } });
      toast.success("Request logged in the Lab.");
      setToolName(""); setToolDesc(""); setIsModalOpen(false);
    } catch { toast.error("Handshake failed."); }
    finally { setIsSuggesting(false); }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px:24px]"></div>
      </div>

      {/* --- Hero Section --- */}
      <section className="relative pt-20 md:pt-32 pb-12 md:pb-16 z-10 px-4">
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-red-600/5 border border-red-600/20 px-3 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-red-500"
          >
            <Sparkles size={10} /> Empowering 50k+ Engineers
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 italic uppercase leading-[0.95]">
            THE <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">ENGINEER'S</span> <br />
            <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent text-2xl sm:text-5xl md:text-7xl">WORKBENCH</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-neutral-500 text-sm md:text-lg font-medium leading-relaxed px-2">
            Just pure engineering utility. Removing friction from your workflow.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-red-600/20 blur opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl"></div>
            <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-1 md:p-2 shadow-2xl">
              <Search className="ml-3 h-4 w-4 md:h-5 md:w-5 text-neutral-700" />
              <input 
                type="text" 
                placeholder="Search command..." 
                className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 text-white placeholder:text-neutral-800 font-bold outline-none uppercase text-xs md:text-sm tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Filter Navigation --- */}
      <section className="sticky top-0 z-40 border-y border-white/5 bg-black/90 backdrop-blur-2xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0",
                selectedCategory === cat.id 
                  ? "bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]" 
                  : "bg-neutral-900/50 border-white/5 text-neutral-600 hover:text-white"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* --- Main Tools Matrix --- */}
      <main className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} key={tool.id}>
                <Link href={tool.path} className="group block h-full">
                  <Card className="h-full bg-neutral-950 border border-white/5 group-hover:border-red-600/40 transition-all duration-500 overflow-hidden shadow-2xl">
                    <CardHeader className="p-5 md:p-6">
                      <div className="flex justify-between items-start mb-4 md:mb-6">
                        <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl bg-black border border-white/5 group-hover:bg-red-600 group-hover:text-white transition-all", tool.color)}>
                          {tool.icon}
                        </div>
                        <ArrowRight className="h-4 w-4 text-red-600 -rotate-45 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <CardTitle className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-red-500">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-neutral-600 text-[11px] md:text-xs font-medium leading-relaxed line-clamp-2 mt-2">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 pt-0 flex items-center justify-between mt-auto">
                      <Badge variant="outline" className="bg-black/50 text-[7px] md:text-[8px] uppercase font-black tracking-widest border-white/5 text-neutral-700">
                        {tool.category}
                      </Badge>
                      <span className="text-[9px] font-black text-neutral-800 group-hover:text-neutral-500 italic transition-colors">INIT_NODE</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- Footer HUD --- */}
      <section className="bg-neutral-950/50 border-t border-white/5 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatItem icon={<ShieldCheck className="text-red-600 h-5 w-5 md:h-6 md:w-6" />} title="Secure" desc="Encrypted logic." />
            <StatItem icon={<Zap className="text-yellow-500 h-5 w-5 md:h-6 md:w-6" />} title="Instant" desc="V8 optimized." />
            <StatItem icon={<CheckCircle className="text-emerald-500 h-5 w-5 md:h-6 md:w-6" />} title="Verified" desc="Engineering grade." />
            <StatItem icon={<Globe className="text-blue-500 h-5 w-5 md:h-6 md:w-6" />} title="Global" desc="Community driven." />
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="relative rounded-3xl md:rounded-[3.5rem] bg-red-600 overflow-hidden p-8 py-16 md:p-24 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] opacity-30"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
              MISSING A <span className="text-black/30">TOOL?</span>
            </h2>
            <p className="text-white/90 text-sm md:text-lg font-bold max-w-xl mx-auto uppercase tracking-wide">
              Suggest a module and our engineers will architect it.
            </p>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-black text-white hover:bg-neutral-900 rounded-xl md:rounded-2xl px-8 md:px-12 py-6 md:py-8 text-base md:text-xl font-black italic uppercase shadow-2xl active:scale-95">
                  Request Module <MousePointer2 className="ml-2 h-4 w-4 md:h-6 md:w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#050505] border-white/10 text-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 w-[95vw] max-w-lg">
                <DialogHeader className="space-y-3">
                  <Terminal className="text-red-500" />
                  <DialogTitle className="text-2xl md:text-3xl font-black uppercase italic">Submit Specification</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSuggestTool} className="space-y-4 md:space-y-6 mt-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Module Identity</label>
                    <Input value={toolName} onChange={(e) => setToolName(e.target.value)} className="bg-neutral-900 border-white/5 h-12 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Purpose</label>
                    <Textarea value={toolDesc} onChange={(e) => setToolDesc(e.target.value)} className="bg-neutral-900 border-white/5 min-h-[100px] rounded-xl resize-none" />
                  </div>
                  <Button type="submit" disabled={isSuggesting} className="w-full h-14 md:h-16 bg-red-600 font-black uppercase italic rounded-xl md:rounded-2xl shadow-xl">
                    {isSuggesting ? <Loader2 className="animate-spin" /> : <Send size={18} className="mr-2" />} Broadcast Request
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-2 md:space-y-4 text-center md:text-left">
      <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-black border border-white/5 flex items-center justify-center shadow-xl mx-auto md:mx-0">
        {icon}
      </div>
      <h4 className="text-sm md:text-xl font-black uppercase italic tracking-tighter">{title}</h4>
      <p className="text-neutral-500 text-[10px] md:text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}