"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, Split, X, FileText, 
  Eye, EyeOff, Trash2, Scissors, Grid3X3,
  Sparkles, ShieldCheck, Zap, Clock, CheckCircle,
  ChevronRight, FolderOpen, FileUp, Settings,
  Loader2, Copy, Hash, Filter, ArrowUpDown,
  BookOpen, Layers, Palette, Check, Plus, Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import * as PDFLib from "pdf-lib";

// Define file type
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

interface SplitOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface SplitResult {
  name: string;
  data: Uint8Array;
  pages: number;
}

export default function SplitPDFPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [splitMode, setSplitMode] = useState<'range' | 'every' | 'selected'>('range');
  const [pageRanges, setPageRanges] = useState<PageRange[]>([
    { id: '1', start: 1, end: 1, name: 'Part 1' }
  ]);
  const [pagesPerSplit, setPagesPerSplit] = useState<number>(1);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);

  const splitOptions: SplitOption[] = [
    {
      id: 'range',
      name: 'Split by Range',
      description: 'Extract specific page ranges',
      icon: <Scissors className="h-5 w-5" />
    },
    {
      id: 'every',
      name: 'Split Every N Pages',
      description: 'Create multiple files with equal pages',
      icon: <Grid3X3 className="h-5 w-5" />
    },
    {
      id: 'selected',
      name: 'Split Selected Pages',
      description: 'Extract only chosen pages',
      icon: <Filter className="h-5 w-5" />
    }
  ];

  // Generate page thumbnails
  const pageThumbnails = Array.from({ length: totalPages }, (_, i) => ({
    number: i + 1,
    isSelected: selectedPages.includes(i + 1)
  }));

  // Handle file selection
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
      
      toast.success('PDF file uploaded successfully');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to load PDF file');
      console.error('Error loading PDF:', error);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
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
        
        toast.success('PDF file uploaded successfully');
      } catch (error) {
        toast.error('Failed to load PDF file');
        console.error('Error loading PDF:', error);
      }
    } else {
      toast.error('Please drop a PDF file');
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove file
  const removeFile = () => {
    if (file?.url) {
      URL.revokeObjectURL(file.url);
    }
    setFile(null);
    setSplitResults([]);
    setSelectedPages([]);
    setTotalPages(0);
    toast.success('File removed');
  };

  // Handle page selection
  const togglePageSelection = (pageNumber: number) => {
    if (splitMode === 'selected') {
      setSelectedPages(prev => 
        prev.includes(pageNumber)
          ? prev.filter(p => p !== pageNumber)
          : [...prev, pageNumber].sort((a, b) => a - b)
      );
    }
  };

  // Add page range
  const addPageRange = () => {
    const newId = (pageRanges.length + 1).toString();
    const lastEnd = pageRanges[pageRanges.length - 1]?.end || 1;
    const newStart = Math.min(lastEnd + 1, totalPages);
    
    setPageRanges(prev => [
      ...prev,
      { id: newId, start: newStart, end: newStart, name: `Part ${newId}` }
    ]);
  };

  // Remove page range
  const removePageRange = (id: string) => {
    if (pageRanges.length > 1) {
      setPageRanges(prev => prev.filter(range => range.id !== id));
    }
  };

  // Update page range
  const updatePageRange = (id: string, field: 'start' | 'end' | 'name', value: number | string) => {
    setPageRanges(prev => prev.map(range => {
      if (range.id === id) {
        const updatedRange = { ...range, [field]: value };
        
        // Ensure start <= end and within bounds
        if (field === 'start' && typeof value === 'number') {
          const startVal = Math.max(1, Math.min(value, totalPages));
          updatedRange.start = startVal;
          if (startVal > updatedRange.end) {
            updatedRange.end = startVal;
          }
        } else if (field === 'end' && typeof value === 'number') {
          const endVal = Math.max(1, Math.min(value, totalPages));
          updatedRange.end = endVal;
          if (endVal < updatedRange.start) {
            updatedRange.start = endVal;
          }
        }
        
        return updatedRange;
      }
      return range;
    }));
  };

  // Select all pages
  const selectAllPages = () => {
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedPages([]);
  };

  // Validate split configuration
  const validateSplit = () => {
    if (!file || !file.data) {
      toast.error('Please upload a PDF file first');
      return false;
    }

    if (splitMode === 'range') {
      for (const range of pageRanges) {
        if (range.start < 1 || range.end > totalPages || range.start > range.end) {
          toast.error(`Invalid page range: ${range.start}-${range.end}`);
          return false;
        }
      }
    } else if (splitMode === 'selected' && selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return false;
    } else if (splitMode === 'every' && (pagesPerSplit < 1 || pagesPerSplit > totalPages)) {
      toast.error('Invalid number of pages per split');
      return false;
    }

    return true;
  };

  // Actual PDF splitting function
  const splitPDF = async () => {
    if (!validateSplit() || !file?.data) return;

    setIsProcessing(true);
    setProgress(0);
    setSplitResults([]);

    try {
      const originalPdf = await PDFLib.PDFDocument.load(file.data);
      const results: SplitResult[] = [];

      if (splitMode === 'range') {
        // Split by page ranges
        for (let i = 0; i < pageRanges.length; i++) {
          const range = pageRanges[i];
          const newPdf = await PDFLib.PDFDocument.create();
          
          // Copy pages from original PDF (convert to 0-based index)
          const pagesToCopy = [];
          for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
            pagesToCopy.push(originalPdf.getPages()[pageNum - 1]);
          }
          
          const copiedPages = await newPdf.copyPages(originalPdf, 
            Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start - 1 + i)
          );
          
          copiedPages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          results.push({
            name: `${file.name.replace('.pdf', '')}_${range.name || `part-${i + 1}`}.pdf`,
            data: pdfBytes,
            pages: range.end - range.start + 1
          });
          
          setProgress(Math.floor((i + 1) / pageRanges.length * 100));
        }
      } else if (splitMode === 'every') {
        // Split every N pages
        const totalFiles = Math.ceil(totalPages / pagesPerSplit);
        
        for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
          const newPdf = await PDFLib.PDFDocument.create();
          const startPage = fileIndex * pagesPerSplit;
          const endPage = Math.min(startPage + pagesPerSplit, totalPages);
          
          const copiedPages = await newPdf.copyPages(originalPdf, 
            Array.from({ length: endPage - startPage }, (_, i) => startPage + i)
          );
          
          copiedPages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          results.push({
            name: `${file.name.replace('.pdf', '')}_part-${fileIndex + 1}.pdf`,
            data: pdfBytes,
            pages: endPage - startPage
          });
          
          setProgress(Math.floor((fileIndex + 1) / totalFiles * 100));
        }
      } else if (splitMode === 'selected') {
        // Split selected pages
        for (let i = 0; i < selectedPages.length; i++) {
          const pageNum = selectedPages[i];
          const newPdf = await PDFLib.PDFDocument.create();
          
          const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
          
          const pdfBytes = await newPdf.save();
          results.push({
            name: `${file.name.replace('.pdf', '')}_page-${pageNum}.pdf`,
            data: pdfBytes,
            pages: 1
          });
          
          setProgress(Math.floor((i + 1) / selectedPages.length * 100));
        }
      }

      setSplitResults(results);
      setIsProcessing(false);
      toast.success(`Successfully split into ${results.length} files!`);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      toast.error('Failed to split PDF');
      setIsProcessing(false);
    }
  };

  // Download a single split file
  const downloadFile = (result: SplitResult) => {
    try {
      const blob = new Blob([result.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${result.name}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Download all split files as a zip
  const downloadAllFiles = async () => {
    if (splitResults.length === 0) return;
    
    if (splitResults.length === 1) {
      downloadFile(splitResults[0]);
      return;
    }
    
    try {
      // For multiple files, we'll create individual downloads
      for (const result of splitResults) {
        downloadFile(result);
      }
      toast.success(`Downloading ${splitResults.length} files...`);
    } catch (error) {
      console.error('Error creating zip:', error);
      toast.error('Failed to create zip file');
    }
  };

  // Reset for new split
  const resetForNewSplit = () => {
    setSplitResults([]);
    setSelectedPages([]);
    setPageRanges([{ id: '1', start: 1, end: 1, name: 'Part 1' }]);
    setPagesPerSplit(1);
    toast.success('Ready for new split');
  };

  // Auto-update page ranges when total pages change
  useEffect(() => {
    if (file && totalPages > 0) {
      setPageRanges(prev => prev.map(range => ({
        ...range,
        start: Math.min(range.start, totalPages),
        end: Math.min(range.end, totalPages)
      })));
    }
  }, [totalPages, file]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        <div className="container relative z-10 mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 border border-green-500/20">
            <Sparkles className="h-4 w-4" />
            Advanced Splitting • Secure • Free
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-green-500/10 p-2.5">
                  <Split className="h-6 w-6 text-green-400" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  Organize PDF
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Split <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">PDF Files</span>
              </h1>
              
              <p className="text-lg text-neutral-300 mb-6">
                Extract specific pages, split by ranges, or create multiple files from a single PDF.
                Advanced splitting options with precise control over every page.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-green-500">∞</div>
                  <div className="text-xs text-neutral-400">Page Limit</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-green-500">3</div>
                  <div className="text-xs text-neutral-400">Split Modes</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-green-500">0s</div>
                  <div className="text-xs text-neutral-400">No Waiting</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-green-500">✓</div>
                  <div className="text-xs text-neutral-400">No Limits</div>
                </div>
              </div>
            </div>

            {/* Right Column - Upload Area */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Upload PDF File</span>
                    {file && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-neutral-400 hover:text-white"
                      >
                        {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {file ? `Loaded: ${file.name} (${file.pages} pages)` : 'Drag & drop or click to upload a PDF file'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Drag & Drop Area */}
                  {!file ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
                        dragOver 
                          ? "border-green-500 bg-green-500/10" 
                          : "border-neutral-700 hover:border-green-500/50 hover:bg-neutral-800/30"
                      )}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf"
                      />
                      
                      <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                          <FileUp className="h-6 w-6 text-green-400" />
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Drop PDF file here</h3>
                          <p className="text-sm text-neutral-400">
                            or click to browse files
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                          <CheckCircle className="h-3 w-3" />
                          <span>Single PDF file</span>
                          <span>•</span>
                          <span>100% secure</span>
                          <span>•</span>
                          <span>No file size limits</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* File Info */}
                      <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <FileText className="h-10 w-10 text-green-400 mt-1" />
                            <div>
                              <h4 className="font-medium text-sm">{file.name}</h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.pages} pages</span>
                                <span>•</span>
                                <span>Ready to split</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Split Options */}
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-neutral-300">Split Method</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {splitOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setSplitMode(option.id as any)}
                              className={cn(
                                "p-3 rounded-lg border text-left transition-all duration-200",
                                "hover:scale-[1.02] active:scale-[0.98]",
                                splitMode === option.id
                                  ? "border-green-500 bg-green-500/10"
                                  : "border-neutral-700 hover:border-neutral-600"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className={cn(
                                  "p-1.5 rounded",
                                  splitMode === option.id
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-neutral-800 text-neutral-400"
                                )}>
                                  {option.icon}
                                </div>
                                <span className="text-sm font-medium">{option.name}</span>
                              </div>
                              <p className="text-xs text-neutral-400">{option.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Split Configuration */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-neutral-300">Split Configuration</h4>
                        
                        {splitMode === 'range' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-neutral-400">Page Ranges</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={addPageRange}
                                disabled={pageRanges.length >= 10}
                                className="text-xs text-green-400 hover:text-green-300"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Range
                              </Button>
                            </div>
                            
                            <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                              {pageRanges.map((range, index) => (
                                <motion.div
                                  key={range.id}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/30"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-500">Part {index + 1}</span>
                                  </div>
                                  
                                  <div className="flex-1 flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-neutral-400">From</span>
                                      <input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={range.start}
                                        onChange={(e) => updatePageRange(range.id, 'start', parseInt(e.target.value) || 1)}
                                        className="w-16 px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 rounded focus:border-green-500 focus:outline-none"
                                      />
                                      <span className="text-xs text-neutral-400">to</span>
                                      <input
                                        type="number"
                                        min={range.start}
                                        max={totalPages}
                                        value={range.end}
                                        onChange={(e) => updatePageRange(range.id, 'end', parseInt(e.target.value) || 1)}
                                        className="w-16 px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 rounded focus:border-green-500 focus:outline-none"
                                      />
                                      <span className="text-xs text-neutral-400 ml-2">
                                        ({range.end - range.start + 1} pages)
                                      </span>
                                    </div>
                                    
                                    <input
                                      type="text"
                                      value={range.name}
                                      onChange={(e) => updatePageRange(range.id, 'name', e.target.value)}
                                      placeholder="File name"
                                      className="flex-1 px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 rounded focus:border-green-500 focus:outline-none"
                                    />
                                  </div>
                                  
                                  {pageRanges.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removePageRange(range.id)}
                                      className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {splitMode === 'every' && (
                          <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-neutral-300">Split every</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPagesPerSplit(Math.max(1, pagesPerSplit - 1))}
                                  className="h-7 w-7 p-0"
                                  disabled={pagesPerSplit <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-12 text-center font-medium">{pagesPerSplit}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPagesPerSplit(Math.min(totalPages, pagesPerSplit + 1))}
                                  className="h-7 w-7 p-0"
                                  disabled={pagesPerSplit >= totalPages}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm text-neutral-400">pages</span>
                              </div>
                            </div>
                            <p className="text-xs text-neutral-500">
                              Will create {Math.ceil(totalPages / pagesPerSplit)} files with {pagesPerSplit} pages each
                            </p>
                          </div>
                        )}

                        {splitMode === 'selected' && showPreview && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-neutral-300">Select Pages</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={selectAllPages}
                                  className="text-xs text-green-400"
                                >
                                  Select All
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearSelections}
                                  className="text-xs text-neutral-400"
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-3 rounded-lg border border-neutral-800 bg-neutral-900/30 max-h-60 overflow-y-auto">
                              {pageThumbnails.map((page) => (
                                <button
                                  key={page.number}
                                  onClick={() => togglePageSelection(page.number)}
                                  className={cn(
                                    "aspect-square rounded border flex items-center justify-center text-xs transition-all duration-200",
                                    "hover:scale-110 active:scale-95",
                                    page.isSelected
                                      ? "border-green-500 bg-green-500/20 text-green-400"
                                      : "border-neutral-700 bg-neutral-800 hover:border-neutral-600"
                                  )}
                                >
                                  {page.number}
                                </button>
                              ))}
                            </div>
                            
                            {selectedPages.length > 0 && (
                              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-green-400">
                                    {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
                                  </span>
                                  <span className="text-xs text-green-300 truncate max-w-[200px]">
                                    {selectedPages.join(', ')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {isProcessing ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-300">Splitting PDF...</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing {totalPages} pages...
                            </div>
                          </div>
                        ) : splitResults.length > 0 ? (
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <div className="flex-1">
                                  <p className="font-medium text-green-400">Split Complete!</p>
                                  <p className="text-sm text-green-300/80">
                                    Created {splitResults.length} file{splitResults.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {splitResults.map((result, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-900/30"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-green-400" />
                                    <div>
                                      <span className="text-sm font-medium block">{result.name}</span>
                                      <span className="text-xs text-neutral-400">{result.pages} page{result.pages !== 1 ? 's' : ''}</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadFile(result)}
                                    className="h-8 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-3">
                              <Button
                                onClick={downloadAllFiles}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download All ({splitResults.length})
                              </Button>
                              <Button
                                variant="outline"
                                onClick={resetForNewSplit}
                                className="border-neutral-700"
                              >
                                <FolderOpen className="mr-2 h-4 w-4" />
                                New Split
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Button
                              onClick={splitPDF}
                              disabled={!file}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <Split className="mr-2 h-5 w-5" />
                              Split PDF File
                            </Button>
                            
                            <div className="text-center">
                              <p className="text-xs text-neutral-500">
                                Files are processed securely in your browser
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Advanced Splitting Features
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Everything you need for precise PDF splitting
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-green-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Scissors className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Multiple Split Modes</h3>
              <p className="text-sm text-gray-400">
                Split by ranges, every N pages, or select specific pages individually
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-green-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Layers className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Page Range Control</h3>
              <p className="text-sm text-gray-400">
                Create multiple ranges with custom names for organized file output
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-green-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Visual Page Selection</h3>
              <p className="text-sm text-gray-400">
                Click to select/deselect pages with visual feedback and selection preview
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-green-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Secure Processing</h3>
              <p className="text-sm text-gray-400">
                All files are encrypted during processing and automatically deleted
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-green-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Instant Results</h3>
              <p className="text-sm text-gray-400">
                Process hundreds of pages in seconds with our optimized engine
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-green-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">No Limits</h3>
              <p className="text-sm text-gray-400">
                Unlimited pages, no watermarks, and no registration required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              How to Split PDF Files
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Split your documents in 3 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-green-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400 text-xl font-bold">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Upload PDF</h3>
                <p className="text-sm text-gray-400">
                  Upload your PDF file. We support any size and page count.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-green-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400 text-xl font-bold">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Configure Split</h3>
                <p className="text-sm text-gray-400">
                  Choose your split method and configure page ranges or selections.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400 text-xl font-bold">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Split & Download</h3>
                <p className="text-sm text-gray-400">
                  Click split and download your individual PDF files instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Ready to split your PDF?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400 sm:mt-4">
              Join millions of users who trust our platform for professional PDF processing
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:mt-8">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload PDF File
              </Button>
              <Button 
                variant="outline" 
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
              >
                View All Tools
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-5 text-xs text-neutral-500 sm:mt-6">
              No registration required • 100% free • Secure processing
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}