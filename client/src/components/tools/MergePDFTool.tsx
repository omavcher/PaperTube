"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Upload, Download, Merge, X, FileText, 
  Eye, EyeOff, Trash2, ArrowUp, ArrowDown,
  Sparkles, ShieldCheck, Zap, Clock, CheckCircle,
  ChevronRight, FolderOpen, FileUp, GripVertical,
  Loader2, Home, Grid, Settings, Menu, MousePointer2
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
import CorePromo from "../CorePromo";

// --- Types ---
interface PDFFile {
  id: string;
  name: string;
  size: string;
  pages: number;
  lastModified: string;
  url?: string;
  data?: ArrayBuffer;
  order: number;
}

export default function MergePDFPage() {
  // --- Analytics & SEO Hooks ---
  useToolAnalytics("merge-pdf", "MERGE PDF", "Organize PDF");

  // --- State ---
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergedFile, setMergedFile] = useState<{ name: string; data: Uint8Array; pages: number } | null>(null);
  const [showFileList, setShowFileList] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // --- File Handlers ---
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    setIsProcessingFile(true);
    try {
      const newFiles: PDFFile[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        try {
          const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
          const pageCount = pdfDoc.getPageCount();
          newFiles.push({
            id: `${Date.now()}-${i}-${Math.random()}`,
            name: file.name,
            size: formatFileSize(file.size),
            pages: pageCount,
            lastModified: new Date(file.lastModified).toLocaleDateString(),
            url: URL.createObjectURL(file),
            data: arrayBuffer,
            order: files.length + i,
          });
        } catch (error) {
          toast.error(`Skipped ${file.name} - Invalid/Encrypted PDF`);
        }
      }
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} MODULES LOADED`);
      }
    } catch (error) {
      toast.error('SYSTEM ERROR: Failed to process files');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (droppedFiles.length === 0) {
      toast.error('INVALID INPUT: PDF ONLY');
      return;
    }
    setIsProcessingFile(true);
    try {
      const newFiles: PDFFile[] = [];
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        try {
          const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
          newFiles.push({
            id: `${Date.now()}-${i}-${Math.random()}`,
            name: file.name,
            size: formatFileSize(file.size),
            pages: pdfDoc.getPageCount(),
            lastModified: new Date().toLocaleDateString(),
            url: URL.createObjectURL(file),
            data: arrayBuffer,
            order: files.length + i,
          });
        } catch { /* skip invalid */ }
      }
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} MODULES INTEGRATED`);
      }
    } finally {
      setIsProcessingFile(false);
    }
  }, [files.length]);

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.url) URL.revokeObjectURL(fileToRemove.url);
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) return;
    const newFiles = [...files];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Drag Reorder Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  };
  const handleDropItem = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === dropIndex) return;
    const newFiles = [...files];
    const [draggedFile] = newFiles.splice(dragIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);
    setFiles(newFiles);
    setDragIndex(null);
  };

  // Logic
  const totalPages = files.reduce((sum, file) => sum + file.pages, 0);

  const mergeFiles = async () => {
    if (files.length < 2) return toast.error('PROTOCOL HALTED: Need 2+ files');
    setIsMerging(true);
    setMergeProgress(0);
    try {
      const mergedPdf = await PDFLib.PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        if (files[i].data) {
          const pdf = await PDFLib.PDFDocument.load(files[i].data!);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(page => mergedPdf.addPage(page));
          setMergeProgress(Math.floor(((i + 1) / files.length) * 100));
        }
      }
      const mergedPdfBytes = await mergedPdf.save();
      setMergedFile({ name: `MERGED_DOC_${Date.now()}.pdf`, data: mergedPdfBytes, pages: mergedPdf.getPageCount() });
      toast.success("FUSION COMPLETE");
    } catch (e) {
      toast.error('MERGE FAILED: Corrupt Data Stream');
    } finally {
      setIsMerging(false);
    }
  };

  const downloadMergedFile = () => {
    if (!mergedFile) return;
    const blob = new Blob([mergedFile.data.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mergedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => files.forEach(file => file.url && URL.revokeObjectURL(file.url));
  }, [files]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30 flex flex-col font-sans">
      
      {/* --- Ambient Background --- */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-red-600/5 blur-[100px] pointer-events-none" />

    

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-6 py-6 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
           <span className="text-lg font-black italic tracking-tighter text-white uppercase">
            PDF<span className="text-red-600">Forge</span>
          </span>
        </div>
        <Link href="/tools">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400"><X className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-5xl relative z-10">
        
        {/* --- Hero Section --- */}
        <div className="text-center mb-10 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-red-600/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-600/20 shadow-[0_0_10px_rgba(220,38,38,0.2)]">
            <ShieldCheck className="h-3 w-3" /> Secure • Local • Client-Side
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Merge <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800">PDFs</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-md mx-auto">
            Combine document streams into a single classified file.
          </p>
        </div>

        {/* --- Main Workspace --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Stats (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-4 space-y-4">
              <StatCard icon={<ShieldCheck className="text-red-600" />} label="ENCRYPTED" sub="Local execution only" />
              <StatCard icon={<Zap className="text-yellow-500" />} label="INSTANT" sub="Zero latency merge" />
              <StatCard icon={<Merge className="text-blue-500" />} label="UNLIMITED" sub="No file cap" />
          </div>

          {/* Right: Interaction Area */}
          <div className="lg:col-span-8">
            <Card className="border-white/10 bg-neutral-900/40 backdrop-blur-md overflow-hidden rounded-[2rem] shadow-2xl">
              <CardHeader className="border-b border-white/5 pb-4 px-6 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                    <div>
                        <CardTitle className="text-lg font-black italic uppercase text-white tracking-tighter">Workspace</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        {files.length > 0 ? `${files.length} Modules • ${totalPages} Pages` : "Awaiting Input..."}
                        </CardDescription>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setShowFileList(!showFileList)} className="text-neutral-500 hover:text-white">
                      {showFileList ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Dropzone */}
                {!mergedFile && (
                    <div 
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragOver(false); setIsDragging(false); }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "m-4 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[180px] group",
                        dragOver ? "border-red-600 bg-red-600/10 scale-[1.02]" : "border-white/10 hover:border-red-600/40 hover:bg-neutral-800/50"
                    )}
                    >
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf" multiple />
                    
                    <div className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-lg",
                        dragOver ? "bg-red-600 text-white" : "bg-neutral-900 text-red-600 border border-white/10 group-hover:scale-110"
                    )}>
                        {isProcessingFile ? <Loader2 className="animate-spin" /> : <FileUp size={24} />}
                    </div>
                    
                    <div>
                        <p className="text-sm font-black italic uppercase text-white tracking-wider">Initialize Upload</p>
                        <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1">Drag & Drop or Tap</p>
                    </div>
                    </div>
                )}

                {/* File List */}
                <AnimatePresence>
                  {showFileList && files.length > 0 && !mergedFile && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {files.map((file, index) => (
                          <motion.div 
                            key={file.id}
                            layout
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                            draggable
                            onDragStart={(e: any) => handleDragStart(e, index)}
                            onDragOver={(e: any) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e: any) => handleDropItem(e, index)}
                            className={cn(
                              "group flex items-center gap-3 p-3 rounded-xl border bg-black/40 hover:bg-neutral-800/50 transition-all",
                              dragIndex === index ? "opacity-50 border-red-600 bg-red-600/10" : "border-white/5 hover:border-red-600/30"
                            )}
                          >
                            <GripVertical className="h-4 w-4 text-neutral-700 cursor-move hover:text-white" />
                            
                            <div className="h-10 w-10 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                                <FileText className="text-red-600 h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate uppercase tracking-wide">{file.name}</p>
                              <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{file.size} • {file.pages} PG</p>
                            </div>

                            <div className="flex items-center gap-1">
                              <div className="flex flex-col gap-0.5">
                                <button onClick={() => moveFile(index, 'up')} disabled={index === 0} className="p-1 hover:text-white text-neutral-600 disabled:opacity-20"><ArrowUp size={10} /></button>
                                <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="p-1 hover:text-white text-neutral-600 disabled:opacity-20"><ArrowDown size={10} /></button>
                              </div>
                              <button onClick={() => removeFile(file.id)} className="p-2 bg-neutral-900 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-600/10 transition-colors ml-1">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="p-4 border-t border-white/5 bg-neutral-950/30">
                  {isMerging ? (
                    <div className="space-y-3 py-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400">
                          <span>Processing Logic...</span>
                          <span className="text-white">{mergeProgress}%</span>
                      </div>
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
                            initial={{ width: 0 }}
                            animate={{ width: `${mergeProgress}%` }} 
                            transition={{ ease: "linear" }}
                        />
                      </div>
                    </div>
                  ) : mergedFile ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-900/10 border border-green-500/20 flex items-center gap-4">
                        <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-900/20">
                            <CheckCircle className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-green-500 uppercase italic tracking-wider">Fusion Successful</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{mergedFile.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={downloadMergedFile} className="flex-1 bg-green-600 hover:bg-green-500 text-black font-black uppercase italic tracking-wider h-12 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                             Download File <Download className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => { setMergedFile(null); setFiles([]); }} className="border-white/10 bg-neutral-900 text-neutral-400 hover:text-white h-12 w-12 rounded-xl p-0">
                            <FolderOpen className="h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <Button 
                      onClick={mergeFiles} 
                      disabled={files.length < 2 || isMerging} 
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase italic tracking-wider h-14 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98]"
                    >
                      <Merge className="mr-2 h-4 w-4" /> Execute Merge ({files.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>            <CorePromo/>

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
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-red-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full" />
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