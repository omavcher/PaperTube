"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, FileText, Download, FileUp, Loader2, Sparkles, 
  Gauge, BatteryCharging, LineChart, Thermometer 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/config/api";

// --- Types ---
interface PDFFile {
  id: string;
  name: string;
  size: number;
  displaySize: string;
  url?: string;
  file: File;
  compressionLevel?: 'low' | 'medium' | 'high' | 'extreme';
  compressedSize?: number;
  compressionRatio?: number;
  isCompressing?: boolean;
  progress?: number;
}

interface CompressedResult {
  id: string;
  originalName: string;
  compressedName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  fileData: string; // base64
}

// Helper: Convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default function CompressPDFPage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedResult[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high' | 'extreme'>('medium');
  const [batchMode, setBatchMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('online');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressionSettings = {
    low: { name: 'Low', icon: <BatteryCharging size={14} />, color: 'bg-green-500/10 text-green-400' },
    medium: { name: 'Medium', icon: <Gauge size={14} />, color: 'bg-blue-500/10 text-blue-400' },
    high: { name: 'High', icon: <LineChart size={14} />, color: 'bg-orange-500/10 text-orange-400' },
    extreme: { name: 'Extreme', icon: <Thermometer size={14} />, color: 'bg-red-500/10 text-red-400' }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- RESTORED: removeFile Function ---
  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.url) URL.revokeObjectURL(fileToRemove.url);
      return prev.filter(file => file.id !== id);
    });
    setCompressedFiles(prev => prev.filter(f => f.id !== id));
    toast.info("Buffer cleared for specific asset");
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    
    const newFiles: PDFFile[] = Array.from(selectedFiles)
      .filter(f => f.type === 'application/pdf')
      .map((file, i) => ({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        displaySize: formatFileSize(file.size),
        file: file,
        compressionLevel: 'medium'
      }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const compressFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      const payload = batchMode ? files : [files[0]];
      payload.forEach(f => formData.append('pdfs', f.file));
      formData.append('level', compressionLevel);

      const response = await api.post('/pdf/compress', formData);
      if (response.data.success) {
        setCompressedFiles(response.data.results);
        toast.success("Neural Compression Complete");
      }
    } catch (error) {
      toast.error("Protocol Error: Check connection");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCompressedFile = (result: CompressedResult) => {
    try {
      const uint8Array = base64ToUint8Array(result.fileData);
      // FIX: Cast to ArrayBuffer to satisfy TypeScript/Vercel
      const blob = new Blob([uint8Array.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.compressedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Download Error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Info */}
            <div className="lg:w-1/2 space-y-6">
              <Badge variant="outline" className="border-purple-500/30 text-purple-500 px-4 py-1 uppercase font-black text-[10px] tracking-widest">
                <Sparkles size={12} className="mr-2 animate-pulse" /> AI Compression Node
              </Badge>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter italic">
                Shrink <span className="text-purple-600">Assets</span>
              </h1>
              <p className="text-neutral-500 text-lg font-medium leading-relaxed">
                Aggressive neural optimization for PDF buffers. Maximize storage without severing visual integrity.
              </p>
            </div>

            {/* Right: UI Deck */}
            <div className="lg:w-1/2">
              <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardContent className="p-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-white/5 rounded-3xl p-12 text-center hover:border-purple-500/40 transition-all bg-black/40 cursor-pointer"
                  >
                    <FileUp className="mx-auto h-12 w-12 text-neutral-800 group-hover:text-purple-500 transition-colors mb-4" />
                    <h3 className="text-lg font-black uppercase italic tracking-widest">Inject PDF Data</h3>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" multiple onChange={handleFileSelect} />
                  </div>

                  {files.length > 0 && (
                    <div className="mt-8 space-y-4">
                      {/* Controls */}
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(compressionSettings).map(([key, setting]) => (
                          <button
                            key={key}
                            onClick={() => setCompressionLevel(key as any)}
                            className={cn(
                              "p-3 rounded-xl border flex flex-col items-center gap-1 transition-all",
                              compressionLevel === key ? "bg-purple-600 border-purple-500" : "bg-white/5 border-white/5 text-neutral-500"
                            )}
                          >
                            {setting.icon}
                            <span className="text-[8px] font-black uppercase">{setting.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* List */}
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {files.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                              <FileText size={18} className="text-purple-500" />
                              <div className="text-left">
                                <p className="text-xs font-bold truncate max-w-[150px]">{file.name}</p>
                                <p className="text-[9px] text-neutral-600 uppercase font-black">{file.displaySize}</p>
                              </div>
                            </div>
                            <button onClick={() => removeFile(file.id)} className="text-neutral-700 hover:text-red-500 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={compressFiles} 
                        disabled={isProcessing}
                        className="w-full h-16 bg-white text-black hover:bg-neutral-200 font-black uppercase italic tracking-tighter rounded-2xl"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" /> : "Run Compression Protocol"}
                      </Button>
                    </div>
                  )}

                  {/* Output */}
                  {compressedFiles.length > 0 && (
                    <div className="mt-6 space-y-2">
                       <p className="text-[10px] font-black uppercase text-neutral-600 mb-2 tracking-[0.2em]">Ready for Extraction</p>
                       {compressedFiles.map((res, i) => (
                         <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-green-500/5 border border-green-500/20 animate-in fade-in slide-in-from-bottom-2">
                            <div>
                               <p className="text-xs font-bold text-white truncate max-w-[200px]">{res.compressedName}</p>
                               <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                                  Optimization Successful
                               </p>
                            </div>
                            <Button size="sm" onClick={() => downloadCompressedFile(res)} className="bg-green-600 hover:bg-green-700 text-[10px] font-black h-8 px-4">
                               <Download size={12} className="mr-1" /> SAVE
                            </Button>
                         </div>
                       ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}