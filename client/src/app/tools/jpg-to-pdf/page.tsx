"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, FileText, X, 
  Trash2, Loader2, FileUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PDFFile {
  id: string;
  name: string;
  size: number;
  displaySize: string;
  pages: number;
  file: File;
  status: 'pending' | 'processing' | 'converted' | 'error';
}

export default function PDFToJPGPage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<any[]>([]);
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Load PDF.js via CDN (Fixes Vercel Build Errors) ---
  useEffect(() => {
    if (typeof window !== "undefined" && !window.hasOwnProperty('pdfjsLib')) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";
      script.type = "module";
      script.onload = () => {
        // @ts-ignore
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setIsLibLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.hasOwnProperty('pdfjsLib')) {
      setIsLibLoaded(true);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    // @ts-ignore
    const pdfjs = window.pdfjsLib;

    if (!selectedFiles || !pdfjs) {
      toast.error("PDF engine not ready yet");
      return;
    }

    const newFiles: PDFFile[] = [];
    for (const file of Array.from(selectedFiles)) {
      if (file.type !== 'application/pdf') continue;
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          displaySize: formatFileSize(file.size),
          pages: pdf.numPages,
          file: file,
          status: 'pending'
        });
      } catch (e) {
        toast.error(`Error loading ${file.name}`);
      }
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const convertPDFToImages = async () => {
    // @ts-ignore
    const pdfjs = window.pdfjsLib;
    if (!pdfjs || files.length === 0) return;

    setIsConverting(true);
    const allResults: any[] = [];

    try {
      for (const pdfFile of files) {
        setFiles(prev => prev.map(f => f.id === pdfFile.id ? { ...f, status: 'processing' } : f));
        
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const fileImages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 }); // High quality scale
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            fileImages.push({
              fileName: `${pdfFile.name.replace('.pdf', '')}_p${i}.jpg`,
              dataUrl: canvas.toDataURL('image/jpeg', 0.9)
            });
          }
          setConvertProgress(Math.round((i / pdf.numPages) * 100));
        }
        allResults.push(...fileImages);
        setFiles(prev => prev.map(f => f.id === pdfFile.id ? { ...f, status: 'converted' } : f));
      }
      setConvertedImages(allResults);
      toast.success("All pages converted!");
    } catch (err) {
      toast.error("Conversion failed");
      console.error(err);
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
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
             <h1 className="text-5xl font-black italic uppercase tracking-tighter">
               PDF to <span className="text-pink-500">IMAGE</span>
             </h1>
             <p className="text-neutral-500 mt-2">Zero-Server, 100% Client-Side Encryption.</p>
          </div>

          <Card className="bg-neutral-900 border-neutral-800 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-800 rounded-3xl p-12 hover:border-pink-500/50 cursor-pointer transition-all bg-black/20 group"
              >
                <FileUp className="mx-auto h-12 w-12 text-neutral-700 group-hover:text-pink-500 transition-colors mb-4" />
                <h3 className="text-xl font-bold">Drop PDF files here</h3>
                <p className="text-neutral-500 text-sm mt-2">Maximum file size: 50MB</p>
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
                <div className="mt-8 space-y-3">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-neutral-800">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-pink-500/10 rounded-xl">
                           <FileText size={20} className="text-pink-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[250px]">{file.name}</p>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{file.pages} Pages • {file.displaySize}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          "text-[9px] uppercase font-black",
                          file.status === 'converted' ? "bg-green-500/20 text-green-500" : "bg-pink-500/20 text-pink-500"
                        )}>
                          {file.status}
                        </Badge>
                        <button onClick={() => setFiles(f => f.filter(x => x.id !== file.id))} className="text-neutral-600 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-6">
                    <Button 
                      onClick={convertPDFToImages} 
                      disabled={isConverting || !isLibLoaded}
                      className="w-full h-16 bg-pink-600 hover:bg-pink-700 font-black text-lg rounded-2xl italic tracking-tighter"
                    >
                      {isConverting ? (
                        <span className="flex items-center gap-3">
                          <Loader2 className="animate-spin" /> EXPORTING {convertProgress}%
                        </span>
                      ) : "INITIALIZE CONVERSION"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {convertedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {convertedImages.map((img, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={i} className="group relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
                  <img src={img.dataUrl} className="w-full aspect-[3/4] object-cover" alt="page" />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all p-4">
                    <p className="text-[10px] font-bold text-white mb-3 truncate w-full text-center">{img.fileName}</p>
                    <Button size="sm" className="w-full bg-white text-black hover:bg-pink-500 hover:text-white" onClick={() => downloadImage(img.dataUrl, img.fileName)}>
                      <Download className="h-4 w-4 mr-2" /> DOWNLOAD
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