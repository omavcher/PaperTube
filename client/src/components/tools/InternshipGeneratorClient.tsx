"use client";

import { useState, useMemo, useRef } from "react";
import { 
  Download, Edit3, FileCheck, Loader2, Grid, Home, Settings, Briefcase,
  ArrowLeft, CheckCircle2, Sparkles, Printer, User, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

// Configuration for Random Signatories
const SIGNATORIES = [
  { name: "Dr. Arvin Thorne", title: "Chief Operations Officer", signature: "https://api.dicebear.com/7.x/initials/svg?seed=AT&backgroundColor=transparent&textColor=000" },
  { name: "Sarah L. Jenkins", title: "Head of Talent Acquisition", signature: "https://api.dicebear.com/7.x/initials/svg?seed=SJ&backgroundColor=transparent&textColor=000" },
  { name: "Michael V. Ross", title: "Director of Engineering", signature: "https://api.dicebear.com/7.x/initials/svg?seed=MR&backgroundColor=transparent&textColor=000" },
];

const TEMPLATES = Array.from({ length: 9 }).map((_, i) => ({
  id: `temp-${i + 1}`,
  name: `Format #${i + 1}`,
  archetype: ['corporate', 'modern', 'minimal'][i % 3],
  color: ['#eab308', '#3b82f6', '#10b981', '#ef4444', '#6366f1'][i % 5],
  borderColor: ['#eab308', '#3b82f6', '#10b981', '#ef4444', '#6366f1'][i % 5],
}));

export default function InternshipGeneratorClient() {
  const [data, setData] = useState({
    userName: "Om Avchar",
    companyName: "Nexus Dynamics Ltd",
    role: "Full Stack Developer Intern",
    startDate: "2025-06-01",
    endDate: "2025-12-01",
  });
  
  useToolAnalytics("fake-internship-letter-generator", "INTERNSHIP GEN", "Engineering Tools");
  
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const currentTemplate = useMemo(() => 
    TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0]
  , [selectedTemplate]);
  
  const authFeatures = useMemo(() => {
    const randomSignatory = SIGNATORIES[Math.floor(Math.random() * SIGNATORIES.length)];
    const uniqueId = `CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    return { 
      signatory: randomSignatory, 
      id: uniqueId, 
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }, [selectedTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const loadingToast = toast.loading("Processing High-Quality PDF...");

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const element = certificateRef.current;
      if (!element) return;

      // Create a clone for PDF rendering to avoid dark mode conflicts
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px'; // Higher res width
      clone.style.height = 'auto';
      clone.style.transform = 'none';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2, // Retinal scale for crisp text
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4',
        compress: true 
      });
      
      const imgWidth = 210; 
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const positionY = (pageHeight - imgHeight) / 2; // Center vertically
      
      pdf.addImage(imgData, 'PNG', 0, positionY > 0 ? positionY : 0, imgWidth, imgHeight);

      const safeName = data.userName.trim() ? data.userName.replace(/\s+/g, '_') : "Student";
      pdf.save(`${safeName}_Internship_Certificate.pdf`);
      
      toast.dismiss(loadingToast);
      toast.success("Certificate Exported Successfully");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Generation failed. Try the Print option.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-yellow-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-yellow-600/5 blur-[100px] pointer-events-none" />

  

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40 no-print">
        <div className="flex items-center gap-2">
          <FileCheck className="text-yellow-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">INTERN FORGE</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10 no-print">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            <Sparkles className="h-3 w-3" /> Official Documentation
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Internship <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-700">Forge</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Generate authentic proof of work documents instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Data Entry & Config --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-4 pt-6 px-6 border-b border-white/5">
                <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Edit3 className="h-3 w-3 text-yellow-500" /> Candidate Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Intern Name</label>
                      <div className="relative">
                         <input 
                           name="userName" 
                           value={data.userName} 
                           onChange={handleInputChange} 
                           className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-yellow-500 outline-none transition-colors pl-10"
                           placeholder="John Doe"
                         />
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 h-4 w-4" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Company</label>
                      <div className="relative">
                         <input 
                           name="companyName" 
                           value={data.companyName} 
                           onChange={handleInputChange} 
                           className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-yellow-500 outline-none transition-colors pl-10"
                           placeholder="Tech Corp"
                         />
                         <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 h-4 w-4" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Role Title</label>
                      <input 
                        name="role" 
                        value={data.role} 
                        onChange={handleInputChange} 
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-yellow-500 outline-none transition-colors"
                        placeholder="Software Engineering Intern"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                         <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Start Date</label>
                         <input type="date" name="startDate" value={data.startDate} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-yellow-500 outline-none transition-colors" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">End Date</label>
                         <input type="date" name="endDate" value={data.endDate} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-yellow-500 outline-none transition-colors" />
                      </div>
                   </div>
                </div>

                <div className="pt-4 space-y-3 border-t border-white/5">
                   <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Grid size={12}/> Design Template</h3>
                   <div className="grid grid-cols-3 gap-3 h-[200px] overflow-y-auto custom-scrollbar pr-1">
                      {TEMPLATES.map((t) => (
                         <button
                           key={t.id}
                           onClick={() => setSelectedTemplate(t.id)}
                           className={cn(
                             "relative aspect-[3/4] rounded-lg border-2 transition-all p-1 bg-white flex flex-col items-center justify-center overflow-hidden hover:scale-105",
                             selectedTemplate === t.id ? "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]" : "border-neutral-800 opacity-60 hover:opacity-100"
                           )}
                         >
                            {/* Mini Mockup */}
                            <div className="w-full h-full flex flex-col gap-[1px] p-[2px]">
                               <div className="h-1.5 w-full rounded-sm" style={{ backgroundColor: t.color }}></div>
                               <div className="h-2 w-1/3 bg-gray-200 rounded-sm mt-1 mx-auto"></div>
                               <div className="mt-auto space-y-[1px]">
                                  <div className="h-[1px] w-full bg-gray-200"></div>
                                  <div className="h-[1px] w-full bg-gray-200"></div>
                               </div>
                            </div>
                            {selectedTemplate === t.id && (
                               <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                                  <CheckCircle2 className="text-yellow-600 drop-shadow-md h-4 w-4" />
                               </div>
                            )}
                         </button>
                      ))}
                   </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT: Live Preview (The Paper) --- */}
          <div className="lg:col-span-8 space-y-6 flex flex-col">
             
             {/* Action Bar */}
             <div className="flex justify-between items-center bg-neutral-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                   <Printer size={14} /> A4 Print Preview
                </div>
                <div className="flex gap-3">
                   <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 border-white/10 text-neutral-400 hover:text-white bg-black/50">
                      Print
                   </Button>
                   <Button size="sm" onClick={handleDownload} disabled={isGenerating} className="h-9 bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-wider shadow-lg shadow-yellow-900/20">
                      {isGenerating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                      Download PDF
                   </Button>
                </div>
             </div>

             {/* The Canvas (Paper) */}
             <div className="flex-1 bg-[#1a1a1a] rounded-[2rem] p-8 lg:p-12 border border-white/5 shadow-inner flex items-center justify-center overflow-x-auto">
                <div 
                  ref={certificateRef}
                  id="printable-area"
                  className={cn(
                    "bg-white text-black relative shadow-2xl transition-all duration-500 ease-in-out shrink-0",
                    currentTemplate.archetype === 'academic' ? "border-[20px] border-double" : "border-0"
                  )}
                  style={{ 
                    width: '210mm',
                    minHeight: '297mm', // A4 Aspect Ratio
                    padding: '20mm',
                    borderColor: currentTemplate.archetype === 'academic' ? currentTemplate.borderColor : 'transparent',
                  }}
                >
                   {/* --- CERTIFICATE CONTENT START --- */}
                   
                   {/* Watermark */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden">
                      <span className="text-[120px] font-black uppercase -rotate-45 select-none whitespace-nowrap" style={{ color: '#000' }}>
                         {data.companyName || "COMPANY"}
                      </span>
                   </div>

                   {/* Modern Stripe Decor */}
                   {currentTemplate.archetype === 'modern' && (
                      <div className="absolute left-0 top-0 bottom-0 w-6" style={{ backgroundColor: currentTemplate.color }}></div>
                   )}

                   {/* Tech Grid Decor */}
                   {currentTemplate.archetype === 'corporate' && ( // Reusing archetype logic
                      <div className="absolute top-0 right-0 p-10 opacity-10">
                         <Grid size={100} color={currentTemplate.color} />
                      </div>
                   )}

                   {/* Header */}
                   <div className="flex justify-between items-start mb-16 relative z-10">
                      <div>
                         <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2" style={{ color: currentTemplate.color }}>{data.companyName}</h1>
                         <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500">Official Certification</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-mono font-bold text-gray-400">ID: {authFeatures.id}</p>
                         <p className="text-[10px] font-mono font-bold text-gray-400">Date: {authFeatures.date}</p>
                      </div>
                   </div>

                   {/* Body */}
                   <div className="text-center py-10 relative z-10">
                      <h2 className={cn(
                         "text-5xl font-black mb-12 uppercase tracking-tight",
                         currentTemplate.archetype === 'academic' ? "font-serif italic" : "font-sans"
                      )} style={{ color: '#1a1a1a' }}>
                         Certificate of Internship
                      </h2>

                      <div className="text-lg leading-loose text-gray-700 font-medium px-10">
                         <p className="mb-8">This document serves to certify that</p>
                         
                         <div className="text-4xl font-black uppercase my-8 border-b-2 border-gray-200 pb-2 inline-block min-w-[300px]" style={{ color: '#000' }}>
                            {data.userName}
                         </div>

                         <p className="mb-8">has successfully completed the prescribed internship program as a</p>

                         <div className="text-2xl font-bold uppercase my-6" style={{ color: currentTemplate.color }}>
                            {data.role}
                         </div>

                         <p>
                            at <strong style={{color: '#000'}}>{data.companyName}</strong> from <span className="font-bold text-black border-b border-gray-300 mx-2">{formatDate(data.startDate)}</span> to <span className="font-bold text-black border-b border-gray-300 mx-2">{formatDate(data.endDate)}</span>.
                         </p>
                      </div>
                   </div>

                   {/* Footer / Signatures */}
                   <div className="absolute bottom-20 left-0 right-0 px-20 flex justify-between items-end">
                      <div className="text-center">
                         <div className="h-16 mb-2 flex items-end justify-center">
                            {/* Fake Signature */}
                            <img src={authFeatures.signatory.signature} alt="Sig" className="h-12 opacity-80" crossOrigin="anonymous" />
                         </div>
                         <div className="w-48 h-0.5 bg-black mb-2 mx-auto"></div>
                         <p className="text-sm font-bold uppercase text-black">{authFeatures.signatory.name}</p>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{authFeatures.signatory.title}</p>
                      </div>

                      <div className="text-right">
                         <div className="inline-block p-2 border-2 border-black">
                            <div className="h-16 w-16 bg-black flex items-center justify-center text-white font-bold text-xs text-center leading-tight">
                               VALID<br/>STAMP
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Bottom Bar */}
                   <div className="absolute bottom-0 left-0 right-0 h-4" style={{ backgroundColor: currentTemplate.color }}></div>

                   {/* --- CERTIFICATE CONTENT END --- */}
                </div>
             </div>

          </div>
        </div>

        {/* --- CORE PROMO --- */}
        <div className="mt-20 mb-10 no-print">
           <CorePromo />
        </div>

      </main>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe no-print">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-yellow-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #eab308; }

        @media print {
          body { background-color: white; color: black; }
          .no-print { display: none !important; }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 210mm;
            min-height: 297mm;
            border: none !important;
            box-shadow: none !important;
            transform: scale(1) !important;
          }
        }
      `}</style>
    </div>
  );
}