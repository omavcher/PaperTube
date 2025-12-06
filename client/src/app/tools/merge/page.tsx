"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, Merge, X, FileText, 
  Eye, EyeOff, Trash2, ArrowUpDown, 
  Sparkles, ShieldCheck, Zap, Clock, CheckCircle,
  ChevronRight, FolderOpen, FileUp, GripVertical,
  Loader2, ArrowUp, ArrowDown
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
  lastModified: string;
  url?: string;
  data?: ArrayBuffer;
  order: number;
}

export default function MergePDFPage() {
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

  // Handle file selection
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
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: formatFileSize(file.size),
            pages: pageCount,
            lastModified: new Date(file.lastModified).toLocaleDateString(),
            url: URL.createObjectURL(file),
            data: arrayBuffer,
            order: files.length + i,
          });
        } catch (error) {
          console.error(`Failed to load PDF: ${file.name}`, error);
          toast.error(`Skipped ${file.name} - Invalid PDF file`);
        }
      }

      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} PDF file(s) added successfully`);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process some files');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    
    if (droppedFiles.length === 0) {
      toast.error('Please drop PDF files only');
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
          const pageCount = pdfDoc.getPageCount();
          
          newFiles.push({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: formatFileSize(file.size),
            pages: pageCount,
            lastModified: new Date().toLocaleDateString(),
            url: URL.createObjectURL(file),
            data: arrayBuffer,
            order: files.length + i,
          });
        } catch (error) {
          console.error(`Failed to load PDF: ${file.name}`, error);
          toast.error(`Skipped ${file.name} - Invalid PDF file`);
        }
      }

      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} PDF file(s) added successfully`);
      }
    } catch (error) {
      console.error('Error processing dropped files:', error);
      toast.error('Failed to process some files');
    } finally {
      setIsProcessingFile(false);
    }
  }, [files.length]);

  // Remove file
  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    setFiles(prev => prev.filter(file => file.id !== id));
    toast.success('File removed');
  };

  // Move file up/down
  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === files.length - 1)
    ) {
      return;
    }

    const newFiles = [...files];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    
    // Update order numbers
    newFiles.forEach((file, idx) => {
      file.order = idx;
    });
    
    setFiles(newFiles);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle drag start for reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDropItem = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null) return;

    const newFiles = [...files];
    const draggedFile = newFiles[dragIndex];
    newFiles.splice(dragIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);
    
    // Update order numbers
    newFiles.forEach((file, idx) => {
      file.order = idx;
    });
    
    setFiles(newFiles);
    setDragIndex(null);
  };

  // Calculate total pages
  const totalPages = files.reduce((sum, file) => sum + file.pages, 0);

  // Merge files using PDF-Lib
  const mergeFiles = async () => {
    if (files.length < 2) {
      toast.error('Please add at least 2 PDF files to merge');
      return;
    }

    setIsMerging(true);
    setMergeProgress(0);
    
    try {
      // Create a new PDF document
      const mergedPdf = await PDFLib.PDFDocument.create();
      
      // Process each file in order
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.data) {
          toast.error(`No data found for file: ${file.name}`);
          continue;
        }
        
        try {
          // Load the PDF
          const pdf = await PDFLib.PDFDocument.load(file.data);
          
          // Get all pages
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          
          // Add pages to merged document
          pages.forEach(page => mergedPdf.addPage(page));
          
          // Update progress
          const progress = Math.floor(((i + 1) / files.length) * 100);
          setMergeProgress(progress);
          
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`);
        }
      }
      
      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      
      // Set the merged file
      const fileName = `merged-${Date.now()}.pdf`;
      setMergedFile({
        name: fileName,
        data: mergedPdfBytes,
        pages: mergedPdf.getPageCount()
      });
      
      setMergeProgress(100);
      toast.success(`Successfully merged ${files.length} files into ${mergedPdf.getPageCount()} pages!`);
      
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Failed to merge PDF files');
    } finally {
      setIsMerging(false);
    }
  };

  // Download merged file
  const downloadMergedFile = () => {
    if (!mergedFile) return;
    
    try {
      const blob = new Blob([mergedFile.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = mergedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${mergedFile.name}`);
    } catch (error) {
      console.error('Error downloading merged file:', error);
      toast.error('Failed to download merged file');
    }
  };

  // Clear all files
  const clearAllFiles = () => {
    // Revoke object URLs
    files.forEach(file => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    
    setFiles([]);
    setMergedFile(null);
    setMergeProgress(0);
    toast.success('All files cleared');
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [files]);

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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/20">
            <Sparkles className="h-4 w-4" />
            100% Free • No Watermarks • Secure
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-red-500/10 p-2.5">
                  <Merge className="h-6 w-6 text-red-400" />
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  Most Popular
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Merge <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">PDF Files</span>
              </h1>
              
              <p className="text-lg text-neutral-300 mb-6">
                Combine multiple PDF documents into a single file while maintaining original quality.
                Reorder pages, remove duplicates, and create professional documents in seconds.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-red-500">∞</div>
                  <div className="text-xs text-neutral-400">Unlimited Files</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-red-500">100%</div>
                  <div className="text-xs text-neutral-400">Secure</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-red-500">0s</div>
                  <div className="text-xs text-neutral-400">No Waiting</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-red-500">✓</div>
                  <div className="text-xs text-neutral-400">No Limits</div>
                </div>
              </div>
            </div>

            {/* Right Column - Upload Area */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Upload PDF Files</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFileList(!showFileList)}
                      className="text-neutral-400 hover:text-white"
                      disabled={files.length === 0}
                    >
                      {showFileList ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {files.length > 0 
                      ? `${files.length} file(s) - ${totalPages} total pages` 
                      : 'Drag & drop or click to upload PDF files'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
                      dragOver 
                        ? "border-red-500 bg-red-500/10" 
                        : "border-neutral-700 hover:border-red-500/50 hover:bg-neutral-800/30"
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf"
                      multiple
                    />
                    
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        {isProcessingFile ? (
                          <Loader2 className="h-6 w-6 text-red-400 animate-spin" />
                        ) : (
                          <FileUp className="h-6 w-6 text-red-400" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">
                          {isProcessingFile ? 'Processing files...' : 'Drop PDF files here'}
                        </h3>
                        <p className="text-sm text-neutral-400">
                          {isProcessingFile ? 'Please wait...' : 'or click to browse files'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                        <CheckCircle className="h-3 w-3" />
                        <span>Supports multiple files</span>
                        <span>•</span>
                        <span>100% secure</span>
                        <span>•</span>
                        <span>No file size limits</span>
                      </div>
                    </div>
                  </div>

                  {/* File List */}
                  {files.length > 0 && showFileList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">Files to merge ({files.length})</h4>
                          <p className="text-xs text-neutral-400">{totalPages} total pages</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                            Drag to reorder
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFiles}
                            className="text-xs text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        <AnimatePresence>
                          {files.map((file, index) => (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOverItem(e, index)}
                              onDrop={(e) => handleDropItem(e, index)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50",
                                "hover:border-red-500/30 transition-colors cursor-move",
                                dragIndex === index && "border-red-500/50 bg-red-500/10"
                              )}
                            >
                              <GripVertical className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                              
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="h-8 w-8 text-red-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20">
                                      {file.pages} page{file.pages !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                                    <span>{file.size}</span>
                                    <span>•</span>
                                    <span>Modified: {file.lastModified}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveFile(index, 'up');
                                  }}
                                  disabled={index === 0}
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveFile(index, 'down');
                                  }}
                                  disabled={index === files.length - 1}
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(file.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* Merge Controls */}
                  <div className="mt-6 space-y-4">
                    {isMerging ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-300">Merging files...</span>
                          <span className="font-medium">{mergeProgress}%</span>
                        </div>
                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                            style={{ width: `${mergeProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing {files.length} files ({totalPages} pages)...
                        </div>
                      </div>
                    ) : mergedFile ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="flex-1">
                              <p className="font-medium text-green-400">Merge Complete!</p>
                              <p className="text-sm text-green-300/80">
                                {mergedFile.pages} page{mergedFile.pages !== 1 ? 's' : ''} merged from {files.length} files
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={downloadMergedFile}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download {mergedFile.name}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={clearAllFiles}
                            className="border-neutral-700"
                          >
                            <FolderOpen className="mr-2 h-4 w-4" />
                            New Merge
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={mergeFiles}
                          disabled={files.length < 2 || isMerging}
                          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                        >
                          {isMerging ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Merging...
                            </>
                          ) : (
                            <>
                              <Merge className="mr-2 h-5 w-5" />
                              Merge {files.length} PDF {files.length !== 1 ? 'Files' : 'File'}
                            </>
                          )}
                        </Button>
                        
                        {files.length >= 2 && (
                          <div className="text-center">
                            <p className="text-xs text-neutral-400">
                              Will create a {totalPages}-page document
                            </p>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <p className="text-xs text-neutral-500">
                            Files are processed securely in your browser
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
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
              Why Choose Our PDF Merger?
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Professional-grade merging with advanced features
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Bank-Level Security</h3>
              <p className="text-sm text-gray-400">
                Files are processed locally in your browser, no data is uploaded to servers
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Lightning Fast</h3>
              <p className="text-sm text-gray-400">
                Merge hundreds of pages in seconds with our optimized processing engine
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Merge className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Smart Merging</h3>
              <p className="text-sm text-gray-400">
                Maintains original quality, fonts, and formatting across all merged files
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">No Limits</h3>
              <p className="text-sm text-gray-400">
                Unlimited files, no watermarks, and no registration required
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
              How to Merge PDF Files
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Merge your documents in just 3 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-red-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 text-xl font-bold">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Upload Files</h3>
                <p className="text-sm text-gray-400">
                  Drag & drop or select PDF files from your computer. Add as many as you need.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-red-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 text-xl font-bold">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Arrange & Preview</h3>
                <p className="text-sm text-gray-400">
                  Reorder files using drag & drop or arrow buttons. Preview the merge order.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 text-xl font-bold">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Merge & Download</h3>
                <p className="text-sm text-gray-400">
                  Click merge and download your combined PDF instantly. All processing happens locally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 sm:py-16 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="text-3xl font-bold text-red-500">∞</div>
              <div className="text-sm font-medium mt-2">File Limit</div>
              <div className="text-xs text-neutral-400">Add unlimited PDFs</div>
            </div>
            <div className="text-center p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="text-3xl font-bold text-red-500">100%</div>
              <div className="text-sm font-medium mt-2">Quality Preserved</div>
              <div className="text-xs text-neutral-400">Original formatting intact</div>
            </div>
            <div className="text-center p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="text-3xl font-bold text-red-500">0s</div>
              <div className="text-sm font-medium mt-2">No Upload</div>
              <div className="text-xs text-neutral-400">Processed locally</div>
            </div>
            <div className="text-center p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="text-3xl font-bold text-red-500">✓</div>
              <div className="text-sm font-medium mt-2">Always Free</div>
              <div className="text-xs text-neutral-400">No hidden costs</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Ready to merge your documents?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400 sm:mt-4">
              Join millions of users who trust our platform for professional PDF processing
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:mt-8">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
                disabled={isProcessingFile}
              >
                {isProcessingFile ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload PDF Files
                  </>
                )}
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
              No registration required • 100% free • Secure local processing
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}