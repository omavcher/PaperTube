"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Merge, Split, FileSearch, Zap, Search, ArrowRight, MousePointer2, 
  Loader2, Send, Terminal, FileCode, Database, GitCompare, 
  ShieldAlert, Github, BookOpen, InspectionPanel, TableRowsSplitIcon, 
  BinaryIcon, CalculatorIcon, KeyRoundIcon, FileText, QrCode, FileSignature,
  Home, Grid, Settings, ArrowRightLeft, Keyboard, Wrench, Code2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";
import { toast } from "sonner";
import { IconCalculatorFilled } from "@tabler/icons-react";

// --- Tool Data ---
const pdfTools = [
  { id: "previous-year-papers", title: "EXAM PAPERS", description: "Competitive exam repository.", icon: <BookOpen />, category: "Workflows", path: "/exams", color: "text-pink-400", isNew: false },
  { id: "merge-pdf", title: "MERGE PDF", description: "Combine multiple PDFs.", icon: <Merge />, category: "Organize PDF", path: "/tools/merge", color: "text-red-400", isNew: true },
  { id: "split-pdf", title: "SPLIT PDF", description: "Extract or split pages.", icon: <Split />, category: "Organize PDF", path: "/tools/split", color: "text-green-400", isNew: false },
  { id: "json-formatter", title: "JSON FIX", description: "Beautify & validate JSON.", icon: <BinaryIcon />, category: "Engineering Tools", path: "/tools/json-formatter", color: "text-blue-400", isNew: true },
  { id: "resume-ats-checker", title: "ATS CHECK", description: "Optimize for keywords.", icon: <FileSearch />, category: "Workflows", path: "/tools/resume-checker", color: "text-pink-400", isNew: false },
  { id: "matrix-calculator", title: "MATRIX LAB", description: "Up to 5x5 operations.", icon: <InspectionPanel />, category: "Engineering Tools", path: "/tools/matrix-calculator", color: "text-orange-400", isNew: false },
  { id: "logic-gate-lab", title: "LOGIC GATE", description: "Boolean simulation.", icon: <Zap />, category: "Engineering Tools", path: "/tools/logic-gate-lab", color: "text-yellow-400", isNew: false },
  { id: "base-converter", title: "BASE CONV", description: "Binary to Hex/Dec.", icon: <Terminal />, category: "Engineering Tools", path: "/tools/base-converter", color: "text-slate-400", isNew: false },
  { id: "syllabus-tracker", title: "SYLLABUS", description: "Track exam milestones.", icon: <TableRowsSplitIcon />, category: "Workflows", path: "/tools/syllabus-tracker", color: "text-cyan-400", isNew: true },
  { id: "code-to-image", title: "CODE SNAP", description: "Snippets to images.", icon: <FileCode />, category: "Engineering Tools", path: "/tools/code-to-image", color: "text-red-500", isNew: false },
  { id: "sql-architect", title: "SQL ARCH", description: "Visualize DB queries.", icon: <Database />, category: "Engineering Tools", path: "/tools/sql-architect", color: "text-blue-500", isNew: false },
  { id: "git-forge", title: "GIT FORGE", description: "Blueprint git flows.", icon: <GitCompare />, category: "Workflows", path: "/tools/git-forge", color: "text-orange-500", isNew: false },
  { id: "image-converter", title: "IMAGE CONV", description: "PNG/JPG/WEBP conv.", icon: <ArrowRightLeft />, category: "Engineering Tools", path: "/tools/image-converter", color: "text-orange-500", isNew: false },
  { id: "typing-speed-test", title: "VELOCITY", description: "Precision WPM test.", icon: <Keyboard />, category: "Engineering Tools", path: "/tools/typing-test", color: "text-red-500", isNew: false },
  { id: "ai-detector", title: "SENTINEL", description: "Forensic image scans.", icon: <ShieldAlert />, category: "Engineering Tools", path: "/tools/sentinel", color: "text-red-600", isNew: true },
  { id: "github-wrapped", title: "WRAPPED", description: "Visual GitHub impact.", icon: <Github />, category: "Career", path: "/tools/github-wrapped", color: "text-white", isNew: true },
  { id: "unit-converter", title: "Unit Converter", description: "Universal Unit Converter.", icon: <CalculatorIcon />, category: "Workflows", path: "/tools/unit-converter", color: "text-violet-400", isNew: true },
  { id: "password-generator", title: "KEY GEN", description: "Secure random secrets.", icon: <KeyRoundIcon />, category: "Engineering Tools", path: "/tools/password-generator", color: "text-violet-400", isNew: true },
  { id: "markdown-editor", title: "MD EDITOR", description: "Real-time syntax preview.", icon: <FileText />, category: "Workflows", path: "/tools/markdown-editor", color: "text-violet-400", isNew: true },
  { id: "generate-qr", title: "QR FORGE", description: "Text to 2D barcode synthesis.", icon: <QrCode />, category: "Workflows", path: "/tools/generate-qr", color: "text-violet-400", isNew: true },
  { id: "fake-internship-letter-generator", title: "INTERNSHIP GEN", description: "Generate realistic offer letters.", icon: <FileSignature />, category: "Career", path: "/tools/fake-internship-letter-generator", color: "text-yellow-400", isNew: true },
  { id: "emi-calculator", title: "EMI CALC", description: "Plan loan repayments.", icon: <IconCalculatorFilled />, category: "Engineering Tools", path: "/tools/emi-calculator", color: "text-green-400", isNew: true },
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

  // --- ANALYTICS ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) return; 

    api.post("/analytics/track-tools", {
      toolId: "dashboard_main",
      toolName: "Main Tools Dashboard",
      category: "System",
      eventType: "view",
      source: document.referrer.includes(window.location.host) ? "internal" : "direct_or_external"
    }).catch(err => console.error("Analytics Error", err));
  }, []);

  const handleToolClick = (tool: typeof pdfTools[0]) => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) return;

    try {
      api.post("/analytics/track-tools", {
        toolId: tool.id,
        toolName: tool.title,
        category: tool.category,
        eventType: "click",
        source: "dashboard_grid"
      });
    } catch (e) { /* Ignore */ }
  };

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
      toast.success("Request received! The engineers are on it.");
      setIsModalOpen(false);
    } catch { toast.error("Connection error. Try again."); }
    finally { setIsSuggesting(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-900/50 flex flex-col font-sans overflow-x-hidden">
      
      {/* --- Ambient Background Glow --- */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-red-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* --- HEADER SECTION --- */}
      {/* pt-2 on mobile removes the top space, md:pt-20 keeps desktop normal */}
      <header className="pt-2 md:pt-20 pb-4 px-4 md:px-6 relative z-10">
         <div className="container mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
            <div className="space-y-2 md:space-y-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                   className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                   <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-red-500">
                     PaperTube Engine v2.0
                   </span>
                </motion.div>
                
                <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none">
                  Tools <span className="text-red-500">Matrix.</span>
                </h1>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-auto relative group mt-2 md:mt-0">
                <div className="absolute -inset-0.5 bg-red-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <div className="relative flex items-center bg-neutral-900/80 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 w-full md:w-[320px] backdrop-blur-md">
                   <Search className="h-4 w-4 text-neutral-500 mr-3 group-focus-within:text-red-500 transition-colors" />
                   <input 
                      type="text" 
                      placeholder="SEARCH MODULES..." 
                      className="bg-transparent border-none focus:ring-0 p-0 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white w-full placeholder:text-neutral-600 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
            </div>
         </div>
      </header>

      {/* --- FILTER TAB BAR --- */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-y border-white/5 py-3 md:py-4 mb-4 md:mb-8">
        <div className="container mx-auto px-4 md:px-6">
           {/* Hiding scrollbar purely via Tailwind classes */}
           <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 border",
                    selectedCategory === cat.id 
                      ? "bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]" 
                      : "bg-neutral-900/40 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white"
                  )}
                >
                  {cat.name}
                </button>
              ))}
           </div>
        </div>
      </nav>

      {/* --- TOOLS GRID --- */}
      <main className="container mx-auto px-4 md:px-6 flex-1 pb-32 md:pb-20">
        {/* grid-cols-2 explicitly handles the 2 items per row on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={tool.id}
              >
                <Link 
                  href={tool.path} 
                  className="group relative block h-full"
                  onClick={() => handleToolClick(tool)} 
                >
                  <Card className="h-full bg-neutral-900/30 border-white/5 group-hover:border-red-600/30 transition-all duration-300 rounded-[1.25rem] md:rounded-3xl overflow-hidden backdrop-blur-sm flex flex-col justify-between relative z-10 hover:bg-neutral-900/50">
                    
                    {/* Header Section */}
                    <div className="p-3.5 md:p-6 pb-2">
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className={cn(
                            "h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center bg-black border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-red-900/20", 
                            tool.color
                        )}>
                          <div className="scale-75 md:scale-110">{tool.icon}</div>
                        </div>
                        {tool.isNew && (
                          <Badge className="bg-red-600 text-white border-none text-[6px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-2 md:py-0.5">
                            NEW
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-[11px] md:text-lg font-bold text-white tracking-tight group-hover:text-red-400 transition-colors leading-tight mb-1 md:mb-2 line-clamp-1 md:line-clamp-none">
                        {tool.title}
                      </CardTitle>
                      
                      <p className="text-[9px] md:text-xs text-neutral-500 font-medium leading-snug line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                    
                    {/* Footer Section */}
                    <div className="p-3.5 md:p-6 pt-0 mt-2 flex justify-between items-center border-t border-white/5 md:pt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="text-[7px] md:text-[9px] font-mono text-neutral-600 uppercase tracking-widest line-clamp-1 pr-2">{tool.category}</span>
                        <ArrowRight size={12} className="text-neutral-500 group-hover:text-white -rotate-45 group-hover:rotate-0 transition-all duration-300 shrink-0 md:w-3.5 md:h-3.5" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- FLOATING ACTION BUTTON (MOBILE) --- */}
      <div className="fixed bottom-24 right-4 z-40 md:hidden">
         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="h-12 w-12 bg-red-600 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center text-white border border-white/20"
                >
                    <Wrench size={20} />
                </motion.button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white rounded-[2rem] p-6 w-[90vw] max-w-sm">
                <RequestForm 
                    toolName={toolName} setToolName={setToolName}
                    toolDesc={toolDesc} setToolDesc={setToolDesc}
                    isSuggesting={isSuggesting} handleSuggestTool={handleSuggestTool}
                />
            </DialogContent>
         </Dialog>
      </div>

      {/* --- DESKTOP REQUEST SECTION --- */}
      <section className="hidden md:block py-16 border-t border-white/5 bg-neutral-900/20 backdrop-blur-sm">
         <div className="container mx-auto px-6 text-center">
             <div className="max-w-2xl mx-auto bg-black border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
                 
                 <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Missing a Module?</h2>
                 <p className="text-neutral-400 text-sm mb-8 max-w-md mx-auto">
                    Submit a request for a new engineering tool. Our dev team reviews the priority queue daily.
                 </p>

                 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-8 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            Request Build <Code2 className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0a0a0a] border-white/10 text-white rounded-[2rem] p-8 max-w-md">
                        <RequestForm 
                            toolName={toolName} setToolName={setToolName}
                            toolDesc={toolDesc} setToolDesc={setToolDesc}
                            isSuggesting={isSuggesting} handleSuggestTool={handleSuggestTool}
                        />
                    </DialogContent>
                 </Dialog>
             </div>
         </div>
      </section>

    </div>
  );
}

// --- Sub-Components ---

function RequestForm({ toolName, setToolName, toolDesc, setToolDesc, isSuggesting, handleSuggestTool }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
                    <Terminal className="text-red-500 h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">System Request</h3>
                    <p className="text-xs text-neutral-500 font-medium">Submit Specifications</p>
                </div>
            </div>
            
            <form onSubmit={handleSuggestTool} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest pl-1">Module Name</label>
                    <Input 
                        value={toolName} 
                        onChange={(e) => setToolName(e.target.value)} 
                        className="bg-neutral-900/50 border-white/10 h-12 rounded-xl focus:border-red-600/50 transition-colors text-white placeholder:text-neutral-700 font-medium" 
                        placeholder="E.G. HEX_DECODER" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest pl-1">Logic Specs</label>
                    <Textarea 
                        value={toolDesc} 
                        onChange={(e) => setToolDesc(e.target.value)} 
                        className="bg-neutral-900/50 border-white/10 min-h-[120px] rounded-xl focus:border-red-600/50 transition-colors text-white placeholder:text-neutral-700 font-medium resize-none" 
                        placeholder="Describe the desired input/output logic..." 
                    />
                </div>
                <Button type="submit" disabled={isSuggesting} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-900/20">
                    {isSuggesting ? <Loader2 className="animate-spin" /> : <><Send size={16} className="mr-2" /> Initialize Request</>} 
                </Button>
            </form>
        </div>
    );
}

function MobileNavItem({ href, icon, label, active }: any) {
    return (
        <Link href={href} className={cn("flex flex-col items-center gap-1 transition-colors relative w-full h-full justify-center pt-2", active ? "text-red-500" : "text-neutral-500 hover:text-white")}>
            {active && <div className="absolute top-0 w-8 h-[3px] bg-red-600 rounded-b-full shadow-[0_0_10px_#dc2626]" />}
            <div className={cn("p-1 transition-all", active && "scale-110")}>
                {icon}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
        </Link>
    )
}