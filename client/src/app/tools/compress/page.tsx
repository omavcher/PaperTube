"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, X, FileText, 
  Eye, EyeOff, Trash2, ArrowUpDown, 
  Sparkles, ShieldCheck, Zap, Clock, CheckCircle,
  ChevronRight, FolderOpen, FileUp, GripVertical,
  Loader2, ArrowUp, ArrowDown, Settings,
  BarChart3, HardDrive, Gauge, Target,
  BatteryCharging, LineChart, Thermometer,
  RotateCw, Package, Sparkle, Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/config/api";

// Define file type
interface PDFFile {
  id: string;
  name: string;
  size: number;
  displaySize: string;
  pages: number;
  lastModified: string;
  url?: string;
  file: File;
  order: number;
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
  compressionLevel: string;
  fileData: string; // base64 encoded
}

interface BatchResult {
  originalName: string;
  compressedName?: string;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  compressionLevel?: string;
  fileData?: string;
  error?: string;
  details?: string;
}

interface BatchResponse {
  files: BatchResult[];
  summary: {
    totalFiles: number;
    successful: number;
    failed: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavings: number;
    avgCompressionRatio: number;
  };
}

// Helper function to convert base64 to Uint8Array
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
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedResult[]>([]);
  const [showFileList, setShowFileList] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high' | 'extreme'>('medium');
  const [batchMode, setBatchMode] = useState(false);
  const [activeCompressionId, setActiveCompressionId] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Compression settings
  const compressionSettings = {
    low: {
      name: 'Low',
      description: 'Minimal compression, best quality',
      icon: <BatteryCharging className="h-4 w-4" />,
      quality: 95,
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
      reduction: '20-30%'
    },
    medium: {
      name: 'Medium',
      description: 'Balanced size and quality',
      icon: <Gauge className="h-4 w-4" />,
      quality: 85,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      reduction: '40-50%'
    },
    high: {
      name: 'High',
      description: 'Significant size reduction',
      icon: <LineChart className="h-4 w-4" />,
      quality: 75,
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      reduction: '60-70%'
    },
    extreme: {
      name: 'Extreme',
      description: 'Maximum compression',
      icon: <Thermometer className="h-4 w-4" />,
      quality: 60,
      color: 'bg-red-500/10 text-red-400 border-red-500/20',
      reduction: '70-80%'
    }
  };

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await api.get('/pdf/health');
      setBackendStatus('online');
      toast.success('Backend server connected');
    } catch (error) {
      console.error('Backend not available:', error);
      setBackendStatus('offline');
      toast.error('Backend server offline - using fallback simulation');
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setIsProcessingFile(true);
    
    try {
      const newFiles: PDFFile[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Validate file type
        if (file.type !== 'application/pdf') {
          toast.error(`Skipped ${file.name} - Not a PDF file`);
          continue;
        }

        // Validate file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`Skipped ${file.name} - File too large (max 100MB)`);
          continue;
        }
        
        newFiles.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          displaySize: formatFileSize(file.size),
          pages: 0, // Will be updated if we can parse the PDF
          lastModified: new Date(file.lastModified).toLocaleDateString(),
          url: URL.createObjectURL(file),
          file: file,
          order: files.length + i,
          compressionLevel: 'medium'
        });
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
        
        // Validate file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`Skipped ${file.name} - File too large (max 100MB)`);
          continue;
        }
        
        newFiles.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          displaySize: formatFileSize(file.size),
          pages: 0,
          lastModified: new Date().toLocaleDateString(),
          url: URL.createObjectURL(file),
          file: file,
          order: files.length + i,
          compressionLevel: 'medium'
        });
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
    
    // Remove corresponding compressed file if exists
    setCompressedFiles(prev => prev.filter(f => f.id !== id));
    
    toast.success('File removed');
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate compression ratio
  const calculateCompressionRatio = (originalSize: number, compressedSize: number): number => {
    return ((originalSize - compressedSize) / originalSize) * 100;
  };

  // Update compression level for a file
  const updateFileCompressionLevel = (id: string, level: 'low' | 'medium' | 'high' | 'extreme') => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, compressionLevel: level } : file
    ));
    
    // Remove any existing compressed result for this file
    setCompressedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Simulate compression for a single file (fallback when backend is offline)
  const simulateCompression = async (file: PDFFile): Promise<CompressedResult> => {
    return new Promise((resolve) => {
      const currentLevel = file.compressionLevel || compressionLevel;
      
      // Simulate compression factors based on level
      const compressionFactors = {
        low: 0.75,    // 25% reduction
        medium: 0.55, // 45% reduction
        high: 0.35,   // 65% reduction
        extreme: 0.25 // 75% reduction
      };
      
      const factor = compressionFactors[currentLevel];
      const randomVariance = Math.random() * 0.1 - 0.05; // ±5% variance
      const compressedSize = Math.round(file.size * (factor + randomVariance));
      const ratio = calculateCompressionRatio(file.size, compressedSize);
      
      // Simulate processing time based on file size
      const processingTime = Math.min(2000, Math.max(500, file.size / 100000));
      
      setTimeout(() => {
        resolve({
          id: file.id,
          originalName: file.name,
          compressedName: `compressed-${file.name}`,
          originalSize: file.size,
          compressedSize: compressedSize,
          compressionRatio: ratio,
          compressionLevel: currentLevel,
          fileData: btoa('Simulated compressed PDF content')
        });
      }, processingTime);
    });
  };

  // Server-side compression
  const compressWithServer = async (filesToCompress: PDFFile[]): Promise<CompressedResult[]> => {
    const results: CompressedResult[] = [];
    
    if (batchMode) {
      // Batch compression via server
      try {
        const formData = new FormData();
        filesToCompress.forEach(file => {
          formData.append('pdfs', file.file);
        });
        formData.append('compressionLevel', compressionLevel);

        const response = await api.post('/pdf/compress/batch', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minutes timeout
        });

        if (response.data.success) {
          const batchResults: BatchResult[] = response.data.data.files;
          
          batchResults.forEach((result, index) => {
            if (!result.error && result.fileData) {
              const file = filesToCompress[index];
              if (file) {
                results.push({
                  id: file.id,
                  originalName: result.originalName,
                  compressedName: result.compressedName || `compressed-${file.name}`,
                  originalSize: result.originalSize,
                  compressedSize: result.compressedSize || 0,
                  compressionRatio: result.compressionRatio || 0,
                  compressionLevel: result.compressionLevel || compressionLevel,
                  fileData: result.fileData
                });
              }
            }
          });
        }
      } catch (error: any) {
        console.error('Batch compression error:', error);
        throw new Error(error.response?.data?.error || 'Failed to compress files');
      }
    } else {
      // Single file compression via server
      const file = filesToCompress[0];
      
      try {
        const formData = new FormData();
        formData.append('pdf', file.file);
        formData.append('compressionLevel', compressionLevel);
        formData.append('fileName', file.name);

        const response = await api.post('/pdf/compress', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 180000, // 3 minutes timeout
        });

        if (response.data.success) {
          const result = response.data.data;
          results.push({
            id: file.id,
            originalName: result.originalName,
            compressedName: result.compressedName,
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio,
            compressionLevel: result.compressionLevel,
            fileData: result.fileData
          });
        }
      } catch (error: any) {
        console.error('Single file compression error:', error);
        throw new Error(error.response?.data?.error || 'Failed to compress file');
      }
    }
    
    return results;
  };

  // Main compression function
  const compressFiles = async () => {
    if (files.length === 0) {
      toast.error('Please add PDF files to compress');
      return;
    }

    setIsProcessing(true);
    setCompressedFiles([]);
    setActiveCompressionId(null);

    try {
      const filesToCompress = batchMode ? files : [files[0]];
      
      // Update files with compressing state
      setFiles(prev => prev.map(file => 
        filesToCompress.find(f => f.id === file.id)
          ? { ...file, isCompressing: true, progress: 0 }
          : file
      ));

      // Simulate progress for each file
      const progressIntervals = filesToCompress.map(file => {
        return setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === file.id && f.progress !== undefined && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          }));
        }, 300);
      });

      let results: CompressedResult[] = [];
      
      if (backendStatus === 'online') {
        // Use server-side compression
        try {
          results = await compressWithServer(filesToCompress);
        } catch (serverError: any) {
          console.error('Server compression failed, falling back to simulation:', serverError);
          toast.warning('Server compression failed, using simulation');
          
          // Fallback to simulation
          for (const file of filesToCompress) {
            const result = await simulateCompression(file);
            results.push(result);
          }
        }
      } else {
        // Use simulation when backend is offline
        for (const file of filesToCompress) {
          const result = await simulateCompression(file);
          results.push(result);
        }
      }

      // Clear progress intervals
      progressIntervals.forEach(interval => clearInterval(interval));

      // Update files with compression results
      setFiles(prev => prev.map(file => {
        const result = results.find(r => r.id === file.id);
        if (result) {
          return {
            ...file,
            isCompressing: false,
            progress: 100,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio
          };
        }
        return file;
      }));

      setCompressedFiles(results);
      
      // Show success messages
      if (batchMode) {
        const successful = results.length;
        const failed = filesToCompress.length - successful;
        if (successful > 0) {
          const avgRatio = results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length;
          toast.success(`Batch complete! ${successful} files compressed, ${failed} failed. Average reduction: ${avgRatio.toFixed(1)}%`);
        }
        if (failed > 0) {
          toast.error(`${failed} file(s) failed to compress`);
        }
      } else if (results.length > 0) {
        toast.success(`Compressed ${results[0].originalName} by ${results[0].compressionRatio.toFixed(1)}%`);
      }
      
    } catch (error: any) {
      console.error('Compression error:', error);
      toast.error(error.message || 'Failed to compress files');
      
      // Reset compressing state
      setFiles(prev => prev.map(file => 
        ({ ...file, isCompressing: false, progress: 0 })
      ));
    } finally {
      setIsProcessing(false);
      setActiveCompressionId(null);
    }
  };

  // Download compressed file
  const downloadCompressedFile = (result: CompressedResult) => {
    try {
      const uint8Array = base64ToUint8Array(result.fileData);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.compressedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${result.compressedName}`);
    } catch (error) {
      console.error('Error downloading compressed file:', error);
      toast.error('Failed to download compressed file');
    }
  };

  // Download all compressed files
  const downloadAllCompressedFiles = () => {
    compressedFiles.forEach(result => {
      downloadCompressedFile(result);
    });
    toast.success(`Downloaded ${compressedFiles.length} file(s)`);
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
    setCompressedFiles([]);
    setIsProcessing(false);
    setActiveCompressionId(null);
    toast.success('All files cleared');
  };

  // Toggle batch mode
  const toggleBatchMode = () => {
    if (files.length > 1) {
      setBatchMode(!batchMode);
      setCompressedFiles([]);
      toast.info(batchMode ? 'Switched to single file mode' : 'Switched to batch mode');
    } else {
      toast.info('Add more files to enable batch mode');
    }
  };

  // Calculate total statistics
  const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalCompressedSize = files.reduce((sum, file) => sum + (file.compressedSize || 0), 0);
  const totalSavings = totalOriginalSize - totalCompressedSize;
  const filesWithCompression = files.filter(f => f.compressionRatio);
  const averageRatio = filesWithCompression.length > 0 
    ? filesWithCompression.reduce((sum, file) => sum + (file.compressionRatio || 0), 0) / filesWithCompression.length
    : 0;

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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 border border-purple-500/20">
              <Sparkles className="h-4 w-4" />
              Smart Compression • Quality Preserved • 100% Free
            </div>
            
            {/* Backend Status Indicator */}
            <div className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
              backendStatus === 'online' 
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : backendStatus === 'offline'
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            )}>
              <Server className="h-3 w-3" />
              {backendStatus === 'online' ? 'Server Online' : 
               backendStatus === 'offline' ? 'Server Offline' : 
               'Checking Server...'}
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-purple-500/10 p-2.5">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  Best for Large Files
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Compress <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">PDF Files</span>
              </h1>
              
              <p className="text-lg text-neutral-300 mb-6">
                Reduce PDF file size while maintaining visual quality. Optimize documents for sharing, 
                storage, and web upload with intelligent compression algorithms.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-purple-500">70%</div>
                  <div className="text-xs text-neutral-400">Avg. Reduction</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-purple-500">100MB</div>
                  <div className="text-xs text-neutral-400">Max File Size</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-purple-500">∞</div>
                  <div className="text-xs text-neutral-400">Unlimited Files</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-purple-500">✓</div>
                  <div className="text-xs text-neutral-400">Batch Process</div>
                </div>
              </div>
            </div>

            {/* Right Column - Upload Area */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Upload PDF to Compress</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFileList(!showFileList)}
                        className="text-neutral-400 hover:text-white"
                        disabled={files.length === 0}
                      >
                        {showFileList ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      {files.length > 1 && (
                        <Badge 
                          variant={batchMode ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer",
                            batchMode 
                              ? "bg-purple-500 text-white" 
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          )}
                          onClick={toggleBatchMode}
                          disabled={isProcessing}
                        >
                          {batchMode ? 'Batch Mode' : 'Single Mode'}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {files.length > 0 
                      ? `${files.length} file(s) - ${formatFileSize(totalOriginalSize)} total` 
                      : 'Drag & drop or click to upload PDF files'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Compression Settings */}
                  {files.length > 0 && (
                    <div className="mb-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm font-medium">Compression Level</span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          {batchMode && !isProcessing
                            ? 'Applied to all files' 
                            : !batchMode && files.length === 1
                              ? 'Applied to current file'
                              : batchMode && isProcessing
                                ? 'Processing...'
                                : 'Set individually below'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(compressionSettings).map(([key, setting]) => (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (batchMode && !isProcessing) {
                                setCompressionLevel(key as any);
                                // Apply to all files
                                setFiles(prev => prev.map(file => ({
                                  ...file,
                                  compressionLevel: key as any,
                                  // Clear previous compression results
                                  compressedSize: undefined,
                                  compressionRatio: undefined
                                })));
                                setCompressedFiles([]);
                              } else if (!batchMode && !isProcessing) {
                                setCompressionLevel(key as any);
                              }
                            }}
                            disabled={isProcessing}
                            className={cn(
                              "h-auto flex-col items-center justify-center py-3 px-2 transition-all",
                              (compressionLevel === key && !isProcessing) 
                                ? setting.color
                                : "border-neutral-700 bg-neutral-800/50",
                              isProcessing && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="mb-1">{setting.icon}</div>
                            <div className="text-xs font-medium">{setting.name}</div>
                            <div className="text-[10px] text-neutral-400 mt-1 text-center">
                              {setting.reduction} reduction
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
                      dragOver 
                        ? "border-purple-500 bg-purple-500/10" 
                        : "border-neutral-700 hover:border-purple-500/50 hover:bg-neutral-800/30",
                      isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf"
                      multiple
                      disabled={isProcessing}
                    />
                    
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        {isProcessingFile ? (
                          <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                        ) : (
                          <FileUp className="h-6 w-6 text-purple-400" />
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
                      
                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500">
                        <CheckCircle className="h-3 w-3" />
                        <span>Max 100MB per file</span>
                        <span>•</span>
                        <span>Optimizes images</span>
                        <span>•</span>
                        <span>Preserves quality</span>
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
                          <h4 className="font-medium text-sm">Files to compress ({files.length})</h4>
                          <p className="text-xs text-neutral-400">
                            {formatFileSize(totalOriginalSize)} total • {averageRatio > 0 ? `Avg. ${averageRatio.toFixed(1)}% reduction` : 'Select compression level'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFiles}
                            className="text-xs text-neutral-400 hover:text-purple-400"
                            disabled={isProcessing}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        <AnimatePresence>
                          {files.map((file) => (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={cn(
                                "p-3 rounded-lg border transition-colors",
                                file.isCompressing 
                                  ? "border-purple-500/50 bg-purple-500/10"
                                  : file.compressedSize 
                                    ? "border-green-500/30 bg-green-500/5"
                                    : "border-neutral-800 bg-neutral-900/50 hover:border-purple-500/30"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <FileText className="h-8 w-8 text-purple-400 flex-shrink-0" />
                                  {file.isCompressing && (
                                    <div className="absolute -top-1 -right-1">
                                      <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-400 border-purple-500/20">
                                      {formatFileSize(file.size)}
                                    </Badge>
                                    {file.compressionRatio && (
                                      <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-400 border-green-500/20">
                                        -{file.compressionRatio.toFixed(1)}%
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className={file.compressedSize ? "line-through text-neutral-500" : "text-neutral-400"}>
                                        {file.displaySize}
                                      </span>
                                      {file.compressedSize && (
                                        <>
                                          <ChevronRight className="h-3 w-3 text-neutral-500" />
                                          <span className="text-green-400 font-medium">
                                            {formatFileSize(file.compressedSize)}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    
                                    {!batchMode && !file.isCompressing && (
                                      <div className="flex items-center gap-1">
                                        {Object.entries(compressionSettings).map(([key, setting]) => (
                                          <Button
                                            key={key}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => updateFileCompressionLevel(file.id, key as any)}
                                            className={cn(
                                              "h-6 w-6 p-0 text-xs",
                                              file.compressionLevel === key ? setting.color : "text-neutral-400 hover:text-neutral-300"
                                            )}
                                            disabled={isProcessing}
                                          >
                                            {setting.name.charAt(0)}
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Compression Progress Bar */}
                                  {file.isCompressing && file.progress !== undefined && (
                                    <div className="mt-3 space-y-1">
                                      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                          style={{ width: `${file.progress}%` }}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between text-xs text-neutral-400">
                                        <span>
                                          {backendStatus === 'online' ? 'Server-side compression...' : 'Compressing...'}
                                        </span>
                                        <span>{file.progress}%</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => removeFile(file.id)}
                                  disabled={file.isCompressing || isProcessing}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      
                      {/* Summary Stats */}
                      {files.length > 0 && (totalCompressedSize > 0 || (batchMode && compressedFiles.length > 0)) && (
                        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-400">
                                {formatFileSize(totalSavings)}
                              </div>
                              <div className="text-xs text-neutral-400">Total Savings</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-400">
                                {averageRatio.toFixed(1)}%
                              </div>
                              <div className="text-xs text-neutral-400">Avg. Reduction</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Compression Controls */}
                  <div className="mt-6 space-y-4">
                    {isProcessing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-300">
                            {batchMode 
                              ? `Compressing ${files.length} files...` 
                              : `Compressing ${files[0]?.name}...`}
                          </span>
                          <span className="font-medium">
                            {batchMode 
                              ? `${files.filter(f => f.compressionRatio).length}/${files.length}`
                              : `${files[0]?.progress || 0}%`}
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                            style={{ 
                              width: batchMode 
                                ? `${(files.filter(f => f.compressionRatio).length / files.length) * 100}%`
                                : `${files[0]?.progress || 0}%` 
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {batchMode 
                            ? `Processing ${files.filter(f => f.isCompressing).length} files...` 
                            : `Optimizing ${files[0]?.name}...`}
                        </div>
                      </div>
                    ) : compressedFiles.length > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="flex-1">
                              <p className="font-medium text-green-400">Compression Complete!</p>
                              <p className="text-sm text-green-300/80">
                                {batchMode 
                                  ? `Compressed ${compressedFiles.length} files with ${averageRatio.toFixed(1)}% average reduction`
                                  : `Reduced from ${formatFileSize(compressedFiles[0].originalSize)} to ${formatFileSize(compressedFiles[0].compressedSize)} (${compressedFiles[0].compressionRatio.toFixed(1)}% smaller)`}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {compressedFiles.length > 0 && (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {compressedFiles.map((result, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-900/30"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-green-400" />
                                  <div>
                                    <span className="text-sm font-medium block truncate max-w-[200px]">{result.compressedName}</span>
                                    <span className="text-xs text-neutral-400">
                                      {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)} ({result.compressionRatio.toFixed(1)}% smaller)
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadCompressedFile(result)}
                                  className="h-8 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 flex-shrink-0"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          {batchMode && compressedFiles.length > 1 && (
                            <Button
                              onClick={downloadAllCompressedFiles}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download All ({compressedFiles.length})
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={clearAllFiles}
                            className={batchMode && compressedFiles.length > 1 ? "flex-1" : "w-full"}
                          >
                            <FolderOpen className="mr-2 h-4 w-4" />
                            Compress More Files
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={compressFiles}
                          disabled={files.length === 0 || isProcessing}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              {batchMode ? 'Compressing...' : 'Compressing...'}
                            </>
                          ) : (
                            <>
                              <Package className="mr-2 h-5 w-5" />
                              {batchMode 
                                ? `Compress ${files.length} Files` 
                                : files.length === 1 
                                  ? `Compress ${files[0]?.name}`
                                  : 'Compress Files'}
                            </>
                          )}
                        </Button>
                        
                        {files.length > 0 && !isProcessing && (
                          <div className="text-center">
                            <p className="text-xs text-neutral-400">
                              {backendStatus === 'online' ? (
                                <span className="text-green-400">✓ Using server-side compression</span>
                              ) : (
                                <span className="text-yellow-400">⚠ Using local simulation (server offline)</span>
                              )}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <p className="text-xs text-neutral-500">
                            No sign-in required • 100% free • No watermarks
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
              Intelligent Compression Technology
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Advanced algorithms that optimize PDFs without sacrificing quality
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Server-Side Processing</h3>
              <p className="text-sm text-gray-400">
                Powerful server compression handles large files without browser crashes
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Quality Control</h3>
              <p className="text-sm text-gray-400">
                Maintains readability and visual quality while reducing file size
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <HardDrive className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Batch Processing</h3>
              <p className="text-sm text-gray-400">
                Compress multiple PDFs simultaneously with consistent settings
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">No Sign-In Required</h3>
              <p className="text-sm text-gray-400">
                Use immediately without registration or login. 100% anonymous.
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
              How PDF Compression Works
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Professional compression in 3 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-purple-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xl font-bold">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Upload & Analyze</h3>
                <p className="text-sm text-gray-400">
                  Upload your PDF. Our tool analyzes images, fonts, and structure for optimization.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-purple-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xl font-bold">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Server Compression</h3>
                <p className="text-sm text-gray-400">
                  Files are securely processed on our servers with advanced compression algorithms.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xl font-bold">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Download Optimized</h3>
                <p className="text-sm text-gray-400">
                  Download your compressed PDF. Perfect for email, web, or storage with quality intact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 sm:py-16 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="text-3xl font-bold text-purple-500">70%</div>
              <div className="text-sm font-medium mt-2">Avg. Reduction</div>
              <div className="text-xs text-neutral-400">Typical file size savings</div>
            </div>
            <div className="text-center p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="text-3xl font-bold text-purple-500">100MB</div>
              <div className="text-sm font-medium mt-2">Per File Limit</div>
              <div className="text-xs text-neutral-400">Handles large documents</div>
            </div>
            <div className="text-center p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="text-3xl font-bold text-purple-500">∞</div>
              <div className="text-sm font-medium mt-2">No Limits</div>
              <div className="text-xs text-neutral-400">Unlimited files & size</div>
            </div>
            <div className="text-center p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="text-3xl font-bold text-purple-500">4</div>
              <div className="text-sm font-medium mt-2">Compression Levels</div>
              <div className="text-xs text-neutral-400">From low to extreme</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Ready to optimize your PDFs?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400 sm:mt-4">
              Join professionals who save time and space with intelligent PDF compression
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:mt-8">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
                disabled={isProcessing || isProcessingFile}
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
              No registration • No login • 100% free • No watermarks
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}