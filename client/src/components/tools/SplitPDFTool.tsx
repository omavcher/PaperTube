"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Upload, Download, Split, X, FileText, 
  Eye, EyeOff, Trash2, Scissors, Grid3X3,
  Sparkles, ShieldCheck, Zap, Clock, CheckCircle,
  ChevronRight, FolderOpen, FileUp, Filter,
  Loader2, Plus, Minus, Home, Grid, Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import * as PDFLib from "pdf-lib";
import Link from "next/link";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import Footer from "../Footer";
import CorePromo from "@/components/CorePromo";

// --- Types ---
interface PDFFile {
  id: string;
  name: string;
  size: string;
  pages: number;
  url?: string;
  data?: ArrayBuffer;
  order: number;
}

interface PageRange {
  id: string;
  start: number;
  end: number;
  name: string;
}

interface SplitResult {
  name: string;
  data: Uint8Array;
  pages: number;
}

const splitOptions = [
  { id: 'range', name: 'RANGE SPLIT', description: 'Extract custom page ranges.', icon: <Scissors className="h-5 w-5" /> },
  { id: 'every', name: 'BATCH SPLIT', description: 'Split every N pages.', icon: <Grid3X3 className="h-5 w-5" /> },
  { id: 'selected', name: 'SELECT PAGES', description: 'Click to extract pages.', icon: <Filter className="h-5 w-5" /> }
];

export default function SplitPDFTool() {
  // --- Analytics & SEO Hook ---
  useToolAnalytics("split-pdf", "SPLIT PDF", "Organize PDF");

  // --- State ---
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [splitMode, setSplitMode] = useState<'range' | 'every' | 'selected'>('range');
  const [pageRanges, setPageRanges] = useState<PageRange[]>([{ id: '1', start: 1, end: 1, name: 'Part 1' }]);
  const [pagesPerSplit, setPagesPerSplit] = useState<number>(1);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);

  // --- File Handlers ---
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    const selectedFile = selectedFiles[0];
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      setFile({
        id: Date.now().toString(),
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        pages: pageCount,
        url: URL.createObjectURL(selectedFile),
        data: arrayBuffer,
        order: 0
      });

      setTotalPages(pageCount);
      setPageRanges([{ id: '1', start: 1, end: 1, name: 'Part 1' }]);
      setSelectedPages([]);
      setSplitResults([]);
      toast.success('MODULE LOADED');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('FILE ERROR: Corrupt PDF');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      try {
        const arrayBuffer = await droppedFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        setFile({
          id: Date.now().toString(),
          name: droppedFile.name,
          size: formatFileSize(droppedFile.size),
          pages: pageCount,
          url: URL.createObjectURL(droppedFile),
          data: arrayBuffer,
          order: 0
        });

        setTotalPages(pageCount);
        setPageRanges([{ id: '1', start: 1, end: 1, name: 'Part 1' }]);
        setSelectedPages([]);
        setSplitResults([]);
        toast.success('MODULE LOADED');
      } catch (error) {
        toast.error('FILE ERROR: Corrupt PDF');
      }
    } else {
      toast.error('INVALID INPUT: PDF Only');
    }
  }, []);

  const removeFile = () => {
    if (file?.url) URL.revokeObjectURL(file.url);
    setFile(null);
    setSplitResults([]);
    setSelectedPages([]);
    setTotalPages(0);
  };

  // --- Split Logic ---
  const splitPDF = async () => {
    if (!file?.data) return;
    setIsProcessing(true);
    setProgress(0);
    setSplitResults([]);

    try {
      const originalPdf = await PDFLib.PDFDocument.load(file.data);
      const results: SplitResult[] = [];

      if (splitMode === 'range') {
        for (let i = 0; i < pageRanges.length; i++) {
          const range = pageRanges[i];
          const newPdf = await PDFLib.PDFDocument.create();
          const safeEnd = Math.min(range.end, totalPages);
          const safeStart = Math.min(range.start, safeEnd);
          
          const copiedPages = await newPdf.copyPages(originalPdf, 
            Array.from({ length: safeEnd - safeStart + 1 }, (_, k) => safeStart - 1 + k)
          );
          copiedPages.forEach(page => newPdf.addPage(page));
          const pdfBytes = await newPdf.save();
          results.push({
            name: `${file.name.replace('.pdf', '')}_${range.name || `part-${i + 1}`}.pdf`,
            data: pdfBytes,
            pages: safeEnd - safeStart + 1
          });
          setProgress(Math.floor((i + 1) / pageRanges.length * 100));
        }
      } else if (splitMode === 'every') {
        const totalFiles = Math.ceil(totalPages / pagesPerSplit);
        for (let i = 0; i < totalFiles; i++) {
          const newPdf = await PDFLib.PDFDocument.create();
          const startPage = i * pagesPerSplit;
          const endPage = Math.min(startPage + pagesPerSplit, totalPages);
          const copiedPages = await newPdf.copyPages(originalPdf, 
            Array.from({ length: endPage - startPage }, (_, k) => startPage + k)
          );
          copiedPages.forEach(page => newPdf.addPage(page));
          const pdfBytes = await newPdf.save();
          results.push({
            name: `${file.name.replace('.pdf', '')}_part-${i + 1}.pdf`,
            data: pdfBytes,
            pages: endPage - startPage
          });
          setProgress(Math.floor((i + 1) / totalFiles * 100));
        }
      } else if (splitMode === 'selected') {
        const sortedPages = [...selectedPages].sort((a,b) => a - b);
        for (let i = 0; i < sortedPages.length; i++) {
          const pageNum = sortedPages[i];
          const newPdf = await PDFLib.PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          results.push({
            name: `${file.name.replace('.pdf', '')}_page-${pageNum}.pdf`,
            data: pdfBytes,
            pages: 1
          });
          setProgress(Math.floor((i + 1) / sortedPages.length * 100));
        }
      }

      setSplitResults(results);
      toast.success(`OPERATION SUCCESS: ${results.length} Files Created`);
    } catch (error) {
      toast.error('SYSTEM ERROR: Separation Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (result: SplitResult) => {
    const blob = new Blob([result.data.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported: ${result.name}`);
  };

  const downloadAllFiles = () => {
    splitResults.forEach(downloadFile);
    toast.success(`Batch Export Initiated`);
  };

  // --- Helper Functions ---
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const togglePageSelection = (pageNum: number) => {
    if (splitMode === 'selected') {
      setSelectedPages(prev => prev.includes(pageNum) ? prev.filter(p => p !== pageNum) : [...prev, pageNum].sort((a,b) => a-b));
    }
  };

  const addPageRange = () => {
    const newId = (pageRanges.length + 1).toString();
    const lastEnd = pageRanges[pageRanges.length - 1]?.end || 0;
    const newStart = Math.min(lastEnd + 1, totalPages);
    const newEnd = Math.min(newStart, totalPages);
    setPageRanges(prev => [...prev, { id: newId, start: newStart, end: newEnd, name: `Part ${newId}` }]);
  };

  const updatePageRange = (id: string, field: 'start' | 'end' | 'name', value: any) => {
    setPageRanges(prev => prev.map(range => {
      if (range.id === id) {
        return { ...range, [field]: value };
      }
      return range;
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-green-600/5 blur-[100px] pointer-events-none" />

      {/* --- Mobile Header (Hidden on Desktop) --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Split className="text-green-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white">PDF FORGE</span>
        </div>
        <Link href="/tools">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><X className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-24 pb-32 md:pb-24 px-4 container mx-auto max-w-6xl relative z-10">
        
        {/* --- Hero --- */}
        <div className="text-center mb-10 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-green-600/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-green-500 border border-green-600/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <Sparkles className="h-3 w-3" /> Secure • Client-Side • Instant
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Split <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-500 to-green-800">PDFs</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-md mx-auto">
            Extract pages or fracture documents into multiple streams.
          </p>
        </div>

        {/* --- Workspace --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Info/Stats (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 space-y-4">
               <StatCard icon={<ShieldCheck className="text-green-500" />} label="ENCRYPTED" sub="Local execution only" />
               <StatCard icon={<Zap className="text-yellow-500" />} label="INSTANT" sub="Zero upload wait" />
               <StatCard icon={<Split className="text-blue-500" />} label="PRECISE" sub="Pixel perfect cuts" />
          </div>

          {/* Right: Interaction Area */}
          <div className="lg:col-span-8">
            <Card className="border-white/10 bg-neutral-900/40 backdrop-blur-md overflow-hidden rounded-[2rem] shadow-2xl">
              <CardHeader className="border-b border-white/5 pb-4 px-6 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2 w-2 rounded-full", file ? "bg-green-500 animate-pulse" : "bg-neutral-800")} />
                    <div>
                        <CardTitle className="text-lg font-black italic uppercase text-white tracking-tighter">Workspace</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        {file ? `${file.name} • ${file.pages} PGS` : "Awaiting Input..."}
                        </CardDescription>
                    </div>
                  </div>
                  {file && (
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="text-neutral-500 hover:text-white">
                      {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Dropzone */}
                {!file ? (
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragOver(false); setIsDragging(false); }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "m-4 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[180px] group",
                      dragOver ? "border-green-500 bg-green-500/10 scale-[1.02]" : "border-white/10 hover:border-green-500/40 hover:bg-neutral-800/50"
                    )}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf" />
                    
                    <div className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-lg",
                        dragOver ? "bg-green-500 text-white" : "bg-neutral-900 text-green-500 border border-white/10 group-hover:scale-110"
                    )}>
                        <FileUp size={24} />
                    </div>
                    
                    <div>
                        <p className="text-sm font-black italic uppercase text-white tracking-wider">Initialize Upload</p>
                        <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1">Drag & Drop or Tap</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* File Info */}
                    <div className="p-3 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                             <FileText className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                             <p className="text-xs font-black uppercase text-white truncate max-w-[150px] md:max-w-[300px]">{file.name}</p>
                             <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{file.size} • {file.pages} Pages</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-red-500 hover:bg-red-500/10" onClick={removeFile}><Trash2 className="h-4 w-4" /></Button>
                    </div>

                    {/* Split Modes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {splitOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSplitMode(opt.id as any)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all active:scale-95",
                            splitMode === opt.id ? "border-green-500 bg-green-500/10" : "border-white/10 bg-neutral-900/30 hover:bg-white/5"
                          )}
                        >
                          <div className={cn("mb-2 p-1.5 rounded-lg w-fit", splitMode === opt.id ? "bg-green-500 text-black" : "bg-black text-neutral-500")}>
                            {opt.icon}
                          </div>
                          <p className="text-[10px] font-black uppercase text-white tracking-wide">{opt.name}</p>
                          <p className="text-[9px] font-bold text-neutral-600 mt-0.5">{opt.description}</p>
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Configuration based on Split Mode */}
                    <div className="p-4 bg-neutral-950/50 rounded-2xl border border-white/5">
                        {/* MODE: RANGE */}
                        {splitMode === 'range' && (
                          <div className="space-y-3">
                             <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Defined Ranges</span>
                                <Button size="sm" variant="ghost" onClick={addPageRange} disabled={pageRanges.length >= 10} className="text-green-500 h-6 text-[9px] font-black uppercase hover:bg-green-500/10"><Plus className="h-3 w-3 mr-1" /> Add Segment</Button>
                             </div>
                             <div className="space-y-2">
                                {pageRanges.map((range, idx) => (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={range.id} className="flex gap-2 items-center">
                                        <span className="text-[10px] font-bold text-neutral-600 w-8">PT.{idx+1}</span>
                                        <div className="flex items-center gap-2 bg-black border border-white/10 rounded-lg px-2 py-1">
                                            <span className="text-[9px] text-neutral-500">START</span>
                                            <input type="number" value={range.start} onChange={(e) => updatePageRange(range.id, 'start', parseInt(e.target.value))} className="w-10 bg-transparent text-white text-xs font-mono font-bold text-center outline-none" min="1" max={totalPages} />
                                        </div>
                                        <div className="flex items-center gap-2 bg-black border border-white/10 rounded-lg px-2 py-1">
                                            <span className="text-[9px] text-neutral-500">END</span>
                                            <input type="number" value={range.end} onChange={(e) => updatePageRange(range.id, 'end', parseInt(e.target.value))} className="w-10 bg-transparent text-white text-xs font-mono font-bold text-center outline-none" min="1" max={totalPages} />
                                        </div>
                                        {pageRanges.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-600 hover:text-red-500" onClick={() => { setPageRanges(prev => prev.filter(r => r.id !== range.id)) }}><X className="h-3 w-3" /></Button>}
                                    </motion.div>
                                ))}
                             </div>
                          </div>
                        )}

                        {/* MODE: EVERY N PAGES */}
                        {splitMode === 'every' && (
                          <div className="flex items-center justify-between py-2">
                             <div>
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Batch Frequency</p>
                                 <p className="text-[9px] text-neutral-500">Split after every...</p>
                             </div>
                             <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl p-1">
                                <Button size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10" variant="ghost" onClick={() => setPagesPerSplit(Math.max(1, pagesPerSplit - 1))}><Minus className="h-3 w-3" /></Button>
                                <span className="text-sm font-black text-white w-8 text-center">{pagesPerSplit}</span>
                                <Button size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10" variant="ghost" onClick={() => setPagesPerSplit(Math.min(totalPages, pagesPerSplit + 1))}><Plus className="h-3 w-3" /></Button>
                             </div>
                          </div>
                        )}

                        {/* MODE: SELECTED PAGES */}
                        {splitMode === 'selected' && showPreview && (
                          <div className="space-y-2">
                              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Select Pages to Extract</p>
                              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                    {Array.from({length: totalPages}, (_, i) => i + 1).map(pageNum => (
                                        <button 
                                            key={pageNum}
                                            onClick={() => togglePageSelection(pageNum)}
                                            className={cn(
                                                "aspect-square rounded-lg flex items-center justify-center text-[10px] font-black border transition-all active:scale-90",
                                                selectedPages.includes(pageNum) 
                                                    ? "bg-green-500 text-black border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                                                    : "bg-black border-white/10 text-neutral-500 hover:border-white/30 hover:text-white"
                                            )}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                              </div>
                              <p className="text-[9px] text-neutral-600 text-right">{selectedPages.length} Pages Selected</p>
                          </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      onClick={splitPDF} 
                      disabled={isProcessing} 
                      className="w-full h-14 bg-green-600 hover:bg-green-500 text-black font-black uppercase italic tracking-wider rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" /> : <><Split className="mr-2 h-4 w-4" /> Execute Split Logic</>}
                    </Button>

                    {/* Results */}
                    <AnimatePresence>
                      {splitResults.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/10">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Operations Complete</span>
                              <Button size="sm" variant="outline" onClick={downloadAllFiles} className="h-8 text-[9px] font-black uppercase border-green-500/30 text-green-500 hover:bg-green-500/10">Download Batch</Button>
                           </div>
                           <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                              {splitResults.map((res, i) => (
                                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                       <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                            <FileText className="h-4 w-4" />
                                       </div>
                                       <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{res.name}</p>
                                            <p className="text-[9px] font-bold text-neutral-600 uppercase">{res.pages} Pages</p>
                                       </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => downloadFile(res)}><Download className="h-4 w-4" /></Button>
                                 </motion.div>
                              ))}
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- CORE PROMO (Placement) --- */}
        <div className="mt-24 mb-10">
           <CorePromo />
        </div>

      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-green-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

    </div>
  );
}

function StatCard({ icon, label, sub }: any) {
  return (
    <div className="p-4 rounded-2xl border border-white/5 bg-neutral-900/20 flex items-center gap-4 hover:border-white/10 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-black border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-black italic uppercase text-white tracking-wider">{label}</p>
        <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
}