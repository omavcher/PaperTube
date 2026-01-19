"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, FileText, X, 
  Eye, EyeOff, Trash2, Image as ImageIcon,
  Sparkles, CheckCircle,
  FolderOpen, 
  Loader2, Settings,
  Maximize2, Minimize2,
  Filter, Layers, Sliders,
  Camera, FileUp, Eye as EyeIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

// --- Types ---
interface PDFFile {
  id: string;
  name: string;
  size: number;
  displaySize: string;
  pages: number;
  lastModified: string;
  url?: string;
  file: File;
  status: 'pending' | 'processing' | 'converted' | 'error';
  progress?: number;
}

interface ConversionSettings {
  format: 'jpg' | 'png' | 'webp';
  quality: number;
  dpi: number;
  pageRange: 'all' | 'range' | 'custom';
  customRange: string;
  startPage: number;
  endPage: number;
  resizeMode: 'original' | 'fit' | 'custom';
  maxWidth: number;
  maxHeight: number;
  rotation: number;
  colorMode: 'color' | 'grayscale' | 'bw';
}

// --- Logic ---
let pdfjsLib: any = null;

export default function PDFToJPGPage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<any[]>([]);
  const [showFileList, setShowFileList] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [isPDFJSLoaded, setIsPDFJSLoaded] = useState(false);
  
  const [conversionSettings, setConversionSettings] = useState<ConversionSettings>({
    format: 'jpg',
    quality: 85,
    dpi: 150,
    pageRange: 'all',
    customRange: '1-',
    startPage: 1,
    endPage: 10,
    resizeMode: 'original',
    maxWidth: 1920,
    maxHeight: 1080,
    rotation: 0,
    colorMode: 'color'
  });

  // --- PDF.js Initialization ---
  useEffect(() => {
    const initPDF = async () => {
      if (typeof window !== 'undefined' && !isPDFJSLoaded) {
        try {
          // 1. Import from 'pdfjs-dist' directly
          const pdfjs = await import("pdfjs-dist");
          // 2. Use CDN for the worker to avoid Webpack bundling issues
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
          pdfjsLib = pdfjs;
          setIsPDFJSLoaded(true);
        } catch (error) {
          console.error("Failed to load PDF.js:", error);
          toast.error("Converter engine failed to load. Please check your connection.");
        }
      }
    };
    initPDF();
  }, [isPDFJSLoaded]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || !isPDFJSLoaded) return;

    setIsProcessingFile(true);
    const newFiles: PDFFile[] = [];

    try {
      for (const file of Array.from(selectedFiles)) {
        if (file.type !== 'application/pdf') continue;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          displaySize: formatFileSize(file.size),
          pages: pdf.numPages,
          lastModified: new Date(file.lastModified).toLocaleDateString(),
          url: URL.createObjectURL(file),
          file: file,
          status: 'pending'
        });
      }
      setFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      toast.error("Error loading PDF");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const convertPDFToImages = async () => {
    if (!isPDFJSLoaded || files.length === 0) return;
    setIsConverting(true);
    setConvertProgress(0);

    const results: any[] = [];
    
    try {
      for (const pdfFile of files) {
        setFiles(prev => prev.map(f => f.id === pdfFile.id ? { ...f, status: 'processing' } : f));
        
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pagesToConvert = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
        
        const fileImages = [];
        for (const pageNum of pagesToConvert) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: conversionSettings.dpi / 72 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const dataUrl = canvas.toDataURL(`image/${conversionSettings.format}`, conversionSettings.quality / 100);
            fileImages.push({
              fileName: `${pdfFile.name.replace('.pdf', '')}_page_${pageNum}.${conversionSettings.format}`,
              dataUrl,
              pageNumber: pageNum
            });
          }
          setConvertProgress(Math.round((pageNum / pdf.numPages) * 100));
        }
        results.push(fileImages);
        setFiles(prev => prev.map(f => f.id === pdfFile.id ? { ...f, status: 'converted' } : f));
      }
      setConvertedImages(results);
      toast.success("Conversion successful!");
    } catch (err) {
      toast.error("Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
             <h1 className="text-5xl font-black italic uppercase tracking-tighter">
               PDF to <span className="text-pink-500">IMAGE</span>
             </h1>
             <p className="text-neutral-400">High-resolution client-side conversion.</p>
          </div>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-10 text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-800 rounded-3xl p-12 hover:border-pink-500/50 cursor-pointer transition-all bg-black/20"
              >
                <FileUp className="mx-auto h-12 w-12 text-pink-500 mb-4" />
                <h3 className="text-xl font-bold">Drop PDF files here</h3>
                <p className="text-neutral-500 text-sm mt-2">or click to browse from device</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf" 
                  multiple 
                  onChange={handleFileSelect} 
                />
              </div>

              {files.length > 0 && (
                <div className="mt-8 space-y-4">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-neutral-800">
                      <div className="flex items-center gap-4">
                        <FileText className="text-pink-500" />
                        <div className="text-left">
                          <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                          <p className="text-[10px] text-neutral-500">{file.displaySize} • {file.pages} Pages</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setFiles(f => f.filter(x => x.id !== file.id))}>
                        <Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-500" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="pt-6 border-t border-neutral-800">
                    <Button 
                      onClick={convertPDFToImages} 
                      disabled={isConverting || !isPDFJSLoaded}
                      className="w-full h-14 bg-pink-600 hover:bg-pink-700 font-bold text-lg rounded-2xl"
                    >
                      {isConverting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin" /> Processing {convertProgress}%
                        </span>
                      ) : "Start Conversion"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {convertedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {convertedImages.flat().map((img, i) => (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={i} className="group relative rounded-xl overflow-hidden border border-neutral-800">
                  <img src={img.dataUrl} className="w-full aspect-[3/4] object-cover bg-white" alt="page" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button size="sm" onClick={() => downloadImage(img.dataUrl, img.fileName)}>
                      <Download className="h-4 w-4 mr-2" /> Save
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}