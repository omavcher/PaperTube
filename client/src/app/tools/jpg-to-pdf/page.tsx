"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, FileText, X, 
  Eye, EyeOff, Trash2, Image as ImageIcon,
  Sparkles, CheckCircle,
  ChevronRight, FolderOpen, 
  Loader2, Settings, Grid3x3,
  Palette, Crop, Maximize2, Minimize2,
  ZoomIn, ZoomOut, RotateCw, Filter,
  Layers, Wand2, Sliders,
  ArrowRightLeft, Camera, FileImage,
  FileUp, Eye as EyeIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

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
  thumbnails?: string[];
  status: 'pending' | 'processing' | 'converted' | 'error';
  progress?: number;
}

interface ExtractedImage {
  page: number;
  dataUrl: string;
  width: number;
  height: number;
  format: string;
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

// PDF.js lazy loading
let pdfjsLib: any = null;

const loadPDFJS = async () => {
  if (typeof window === 'undefined') return null;
  
  if (!pdfjsLib) {
    try {
      // Dynamically import PDF.js
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
      pdfjsLib = pdfjs;
      
      // Set worker source
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker?url');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
      
      return pdfjsLib;
    } catch (error) {
      console.error('Failed to load PDF.js:', error);
      throw error;
    }
  }
  return pdfjsLib;
};

export default function PDFToJPGPage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<Array<{
    fileName: string;
    dataUrl: string;
    pageNumber: number;
    format: string;
    blob?: Blob;
  }>[]>([]);
  const [showFileList, setShowFileList] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [isPDFJSLoaded, setIsPDFJSLoaded] = useState(false);
  
  // Conversion settings
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

  // Load PDF.js on mount
  useEffect(() => {
    loadPDFJS().then(() => {
      setIsPDFJSLoaded(true);
    }).catch(error => {
      console.error('Failed to load PDF.js:', error);
      toast.error('Failed to load PDF converter. Please refresh the page.');
    });
  }, []);

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
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          toast.error(`Skipped ${file.name} - Not a PDF file`);
          continue;
        }
        
        // Validate file size (max 30MB for performance)
        if (file.size > 30 * 1024 * 1024) {
          toast.error(`Skipped ${file.name} - File too large (max 30MB)`);
          continue;
        }
        
        try {
          // Load PDF to get page count
          const arrayBuffer = await file.arrayBuffer();
          const pdfjs = await loadPDFJS();
          if (!pdfjs) {
            throw new Error('PDF.js not loaded');
          }
          
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const pageCount = pdf.numPages;
          
          newFiles.push({
            id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            displaySize: formatFileSize(file.size),
            pages: pageCount,
            lastModified: new Date(file.lastModified).toLocaleDateString(),
            url: URL.createObjectURL(file),
            file: file,
            status: 'pending'
          });
        } catch (error) {
          console.error(`Failed to load PDF: ${file.name}`, error);
          toast.error(`Skipped ${file.name} - Invalid or corrupted PDF file`);
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
    e.stopPropagation();
    setDragOver(true);
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (droppedFiles.length === 0) {
      return;
    }

    setIsProcessingFile(true);
    
    try {
      const newFiles: PDFFile[] = [];
      
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        
        // Only accept PDF files
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          continue;
        }
        
        if (file.size > 30 * 1024 * 1024) {
          toast.error(`Skipped ${file.name} - File too large (max 30MB)`);
          continue;
        }
        
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfjs = await loadPDFJS();
          if (!pdfjs) {
            throw new Error('PDF.js not loaded');
          }
          
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const pageCount = pdf.numPages;
          
          newFiles.push({
            id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            displaySize: formatFileSize(file.size),
            pages: pageCount,
            lastModified: new Date().toLocaleDateString(),
            url: URL.createObjectURL(file),
            file: file,
            status: 'pending'
          });
        } catch (error) {
          console.error(`Failed to load PDF: ${file.name}`, error);
          toast.error(`Skipped ${file.name} - Invalid PDF file`);
        }
      }

      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} PDF file(s) added successfully`);
      } else {
        toast.error('No valid PDF files found');
      }
    } catch (error) {
      console.error('Error processing dropped files:', error);
      toast.error('Failed to process files');
    } finally {
      setIsProcessingFile(false);
    }
  }, []);

  // Remove file
  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    setFiles(prev => prev.filter(file => file.id !== id));
    setPreviewImages([]);
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

  // Preview PDF pages as images
  const previewPDFPages = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    try {
      setIsProcessingFile(true);
      setPreviewImages([]);
      
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfjs = await loadPDFJS();
      if (!pdfjs) {
        throw new Error('PDF.js not loaded');
      }
      
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      
      const images: string[] = [];
      const pagesToPreview = Math.min(3, totalPages);
      
      for (let i = 1; i <= pagesToPreview; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          await page.render(renderContext).promise;
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          images.push(dataUrl);
        }
        
        // Update progress
        const progress = Math.floor((i / pagesToPreview) * 100);
        setConvertProgress(progress);
      }
      
      setPreviewImages(images);
      setSelectedPage(0);
      toast.success(`Generated ${images.length} page preview(s)`);
      
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast.error('Failed to preview PDF pages');
    } finally {
      setIsProcessingFile(false);
      setConvertProgress(0);
    }
  };

  // Convert PDF to images
  const convertPDFToImages = async () => {
    if (files.length === 0) {
      toast.error('Please add PDF files to convert');
      return;
    }

    if (!isPDFJSLoaded) {
      toast.error('PDF converter is still loading. Please try again.');
      return;
    }

    setIsConverting(true);
    setConvertProgress(0);
    setConvertedImages([]);
    
    try {
      const allConvertedImages: Array<{
        fileName: string;
        dataUrl: string;
        pageNumber: number;
        format: string;
        blob?: Blob;
      }>[] = [];
      
      let totalPagesToProcess = 0;
      let processedPages = 0;
      
      // Calculate total pages to process
      for (const file of files) {
        if (conversionSettings.pageRange === 'all') {
          totalPagesToProcess += file.pages;
        } else if (conversionSettings.pageRange === 'range') {
          const start = Math.max(1, conversionSettings.startPage);
          const end = Math.min(file.pages, conversionSettings.endPage);
          totalPagesToProcess += Math.max(0, end - start + 1);
        } else {
          // For custom range, we'll handle it per file
          totalPagesToProcess += file.pages; // Estimate
        }
      }
      
      // Process each file
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        
        try {
          // Update file status
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'processing' } : f
          ));

          const arrayBuffer = await file.file.arrayBuffer();
          const pdfjs = await loadPDFJS();
          if (!pdfjs) {
            throw new Error('PDF.js not loaded');
          }
          
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const totalPages = pdf.numPages;
          
          // Determine which pages to convert
          let pagesToConvert: number[] = [];
          
          if (conversionSettings.pageRange === 'all') {
            pagesToConvert = Array.from({ length: totalPages }, (_, i) => i + 1);
          } else if (conversionSettings.pageRange === 'range') {
            const start = Math.max(1, conversionSettings.startPage);
            const end = Math.min(totalPages, conversionSettings.endPage);
            if (start <= end) {
              pagesToConvert = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            }
          } else if (conversionSettings.pageRange === 'custom') {
            // Parse custom range like "1-3,5,7-9"
            const ranges = conversionSettings.customRange.split(',');
            pagesToConvert = [];
            ranges.forEach(range => {
              range = range.trim();
              if (range.includes('-')) {
                const [startStr, endStr] = range.split('-');
                const start = parseInt(startStr) || 1;
                const end = parseInt(endStr) || start;
                for (let i = start; i <= end; i++) {
                  if (i >= 1 && i <= totalPages && !pagesToConvert.includes(i)) {
                    pagesToConvert.push(i);
                  }
                }
              } else if (range) {
                const page = parseInt(range);
                if (!isNaN(page) && page >= 1 && page <= totalPages && !pagesToConvert.includes(page)) {
                  pagesToConvert.push(page);
                }
              }
            });
          }
          
          if (pagesToConvert.length === 0) {
            toast.warning(`No valid pages found for ${file.name}`);
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'error' } : f
            ));
            continue;
          }
          
          const convertedImagesForFile: Array<{
            fileName: string;
            dataUrl: string;
            pageNumber: number;
            format: string;
            blob?: Blob;
          }> = [];
          
          // Convert each page
          for (let i = 0; i < pagesToConvert.length; i++) {
            const pageNum = pagesToConvert[i];
            
            try {
              const page = await pdf.getPage(pageNum);
              
              // Calculate scale based on DPI
              const scale = conversionSettings.dpi / 72;
              let viewport = page.getViewport({ scale: scale });
              
              // Apply rotation
              if (conversionSettings.rotation !== 0) {
                viewport = page.getViewport({ 
                  scale: scale, 
                  rotation: conversionSettings.rotation 
                });
              }
              
              // Apply resize mode
              let finalWidth = viewport.width;
              let finalHeight = viewport.height;
              
              if (conversionSettings.resizeMode === 'fit') {
                const ratio = Math.min(
                  conversionSettings.maxWidth / viewport.width,
                  conversionSettings.maxHeight / viewport.height
                );
                finalWidth = viewport.width * ratio;
                finalHeight = viewport.height * ratio;
              } else if (conversionSettings.resizeMode === 'custom') {
                finalWidth = conversionSettings.maxWidth;
                finalHeight = conversionSettings.maxHeight;
              }
              
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = finalWidth;
              canvas.height = finalHeight;
              
              if (context) {
                // Apply color mode
                if (conversionSettings.colorMode === 'grayscale') {
                  context.filter = 'grayscale(100%)';
                } else if (conversionSettings.colorMode === 'bw') {
                  context.filter = 'grayscale(100%) contrast(200%)';
                }
                
                // Clear canvas
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                // Calculate scale for rendering
                const renderScale = finalWidth / viewport.width;
                const renderViewport = page.getViewport({ 
                  scale: renderScale,
                  rotation: conversionSettings.rotation
                });
                
                await page.render({
                  canvasContext: context,
                  viewport: renderViewport
                }).promise;
                
                // Convert to blob with proper format
                const mimeType = conversionSettings.format === 'jpg' 
                  ? 'image/jpeg' 
                  : conversionSettings.format === 'png'
                  ? 'image/png'
                  : 'image/webp';
                
                const quality = conversionSettings.quality / 100;
                
                // Convert canvas to blob
                const blob = await new Promise<Blob | null>((resolve) => {
                  canvas.toBlob(
                    (blob) => resolve(blob),
                    mimeType,
                    quality
                  );
                });
                
                if (blob) {
                  const dataUrl = URL.createObjectURL(blob);
                  const fileName = `${file.name.replace(/\.pdf$/i, '')}_page${pageNum}.${conversionSettings.format}`;
                  
                  convertedImagesForFile.push({
                    fileName,
                    dataUrl,
                    pageNumber: pageNum,
                    format: conversionSettings.format,
                    blob
                  });
                }
              }
              
              // Update progress
              processedPages++;
              const progress = Math.floor((processedPages / totalPagesToProcess) * 100);
              setConvertProgress(progress);
              
            } catch (error) {
              console.error(`Error converting page ${pageNum}:`, error);
              toast.error(`Failed to convert page ${pageNum} of ${file.name}`);
            }
          }
          
          if (convertedImagesForFile.length > 0) {
            allConvertedImages.push(convertedImagesForFile);
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'converted', progress: 100 } : f
            ));
            toast.success(`Converted ${file.name}: ${convertedImagesForFile.length} page(s) extracted`);
          } else {
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'error' } : f
            ));
            toast.error(`No images could be extracted from ${file.name}`);
          }
          
        } catch (error) {
          console.error(`Error converting ${file.name}:`, error);
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' } : f
          ));
          toast.error(`Failed to convert ${file.name}`);
        }
      }
      
      // Set converted images
      setConvertedImages(allConvertedImages);
      
      if (allConvertedImages.length > 0) {
        const totalImages = allConvertedImages.reduce((sum, images) => sum + images.length, 0);
        toast.success(`Successfully converted ${totalImages} page(s) to ${conversionSettings.format.toUpperCase()}`);
      } else {
        toast.error('No images were converted');
      }
      
    } catch (error) {
      console.error('Error converting files:', error);
      toast.error('Failed to convert PDF files');
    } finally {
      setIsConverting(false);
    }
  };

  // Download individual image
  const downloadImage = (dataUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded ${fileName}`);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  // Download all images as ZIP
  const downloadAllImages = async () => {
    try {
      // For now, we'll download images individually
      // In a real implementation, you would use JSZip
      const allImages = convertedImages.flat();
      
      if (allImages.length === 1) {
        downloadImage(allImages[0].dataUrl, allImages[0].fileName);
        return;
      }
      
      // Download sequentially with delay
      for (let i = 0; i < allImages.length; i++) {
        setTimeout(() => {
          downloadImage(allImages[i].dataUrl, allImages[i].fileName);
        }, i * 300);
      }
      
      toast.info(`Starting download of ${allImages.length} images...`);
      
    } catch (error) {
      console.error('Error downloading all images:', error);
      toast.error('Failed to download images');
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
    
    // Revoke preview images
    previewImages.forEach(img => URL.revokeObjectURL(img));
    
    // Revoke converted images
    convertedImages.forEach(imageGroup => {
      imageGroup.forEach(img => {
        URL.revokeObjectURL(img.dataUrl);
      });
    });
    
    setFiles([]);
    setConvertedImages([]);
    setPreviewImages([]);
    setConvertProgress(0);
    toast.success('All files cleared');
  };

  // Reset for new conversion
  const startNewConversion = () => {
    clearAllFiles();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
      previewImages.forEach(img => URL.revokeObjectURL(img));
      convertedImages.forEach(imageGroup => {
        imageGroup.forEach(img => {
          URL.revokeObjectURL(img.dataUrl);
        });
      });
    };
  }, [files, previewImages, convertedImages]);

  // Calculate total pages
  const totalPages = files.reduce((sum, file) => sum + file.pages, 0);

  // Format options
  const formatOptions = [
    { value: 'jpg', label: 'JPG', desc: 'Best quality/size' },
    { value: 'png', label: 'PNG', desc: 'Lossless quality' },
    { value: 'webp', label: 'WebP', desc: 'Modern format' },
  ];

  // Color mode options
  const colorModeOptions = [
    { value: 'color', label: 'Color', color: 'bg-gradient-to-r from-red-500 to-blue-500' },
    { value: 'grayscale', label: 'Grayscale', color: 'bg-gradient-to-r from-gray-400 to-gray-600' },
    { value: 'bw', label: 'Black & White', color: 'bg-gradient-to-r from-black to-white' },
  ];

  // Resize mode options
  const resizeModeOptions = [
    { value: 'original', label: 'Original Size', icon: <Maximize2 className="h-4 w-4" /> },
    { value: 'fit', label: 'Fit to Size', icon: <Minimize2 className="h-4 w-4" /> },
    { value: 'custom', label: 'Custom Size', icon: <Crop className="h-4 w-4" /> },
  ];

  // DPI options
  const dpiOptions = [72, 150, 300];

  // Rotation options
  const rotationOptions = [0, 90, 180, 270];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12">
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-400 border border-pink-500/20 mb-4">
                  <Sparkles className="h-4 w-4" />
                  High-Resolution • Batch Conversion • Multiple Formats
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  PDF to <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Image</span>
                </h1>
                
                <p className="text-lg text-neutral-300 mb-6">
                  Convert PDF pages to high-quality images. Extract individual pages or batch convert 
                  entire documents with customizable resolution and formatting options.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="text-2xl font-bold text-pink-500">300</div>
                    <div className="text-sm text-neutral-400">DPI Max</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="text-2xl font-bold text-pink-500">3</div>
                    <div className="text-sm text-neutral-400">Formats</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="text-2xl font-bold text-pink-500">✓</div>
                    <div className="text-sm text-neutral-400">Batch Export</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="text-2xl font-bold text-pink-500">100%</div>
                    <div className="text-sm text-neutral-400">Client-side</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Upload Area */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Upload PDF to Convert</span>
                    {files.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFileList(!showFileList)}
                        className="text-neutral-400 hover:text-white h-8 w-8 p-0"
                      >
                        {showFileList ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {files.length > 0 
                      ? `${files.length} file(s) - ${totalPages} total pages` 
                      : 'Drag & drop or click to upload PDF files'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* Conversion Settings */}
                  {files.length > 0 && (
                    <div className="mb-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm font-medium">Conversion Settings</span>
                        </div>
                        <Badge variant="outline" className="bg-pink-500/10 text-pink-400 border-pink-500/20 text-xs">
                          Advanced
                        </Badge>
                      </div>
                      
                      {/* Format Selection */}
                      <div className="space-y-3">
                        <label className="text-xs font-medium text-neutral-300">Output Format</label>
                        <div className="grid grid-cols-3 gap-2">
                          {formatOptions.map((option) => (
                            <Button
                              key={option.value}
                              variant="outline"
                              size="sm"
                              onClick={() => setConversionSettings(prev => ({ ...prev, format: option.value as any }))}
                              className={cn(
                                "h-12 flex-col py-2",
                                conversionSettings.format === option.value
                                  ? "border-pink-500 bg-pink-500/10 text-pink-400"
                                  : "border-neutral-700 bg-neutral-800/50"
                              )}
                            >
                              <div className="text-xs font-medium">{option.label}</div>
                              <div className="text-[10px] text-neutral-400">{option.desc}</div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Quality & DPI */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-neutral-300">Quality: {conversionSettings.quality}%</label>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={conversionSettings.quality}
                            onChange={(e) => setConversionSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500"
                          />
                          <div className="flex justify-between text-xs text-neutral-500">
                            <span>Low</span>
                            <span>High</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-neutral-300">DPI</label>
                          </div>
                          <div className="flex gap-1">
                            {dpiOptions.map((dpi) => (
                              <Button
                                key={dpi}
                                variant="outline"
                                size="sm"
                                onClick={() => setConversionSettings(prev => ({ ...prev, dpi }))}
                                className={cn(
                                  "flex-1 text-xs py-1",
                                  conversionSettings.dpi === dpi
                                    ? "border-pink-500 bg-pink-500/10 text-pink-400"
                                    : "border-neutral-700"
                                )}
                              >
                                {dpi}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Page Range */}
                      <div className="space-y-3">
                        <label className="text-xs font-medium text-neutral-300">Page Range</label>
                        <div className="flex gap-1">
                          {[
                            { value: 'all', label: 'All Pages' },
                            { value: 'range', label: 'Range' },
                            { value: 'custom', label: 'Custom' }
                          ].map((option) => (
                            <Button
                              key={option.value}
                              variant="outline"
                              size="sm"
                              onClick={() => setConversionSettings(prev => ({ ...prev, pageRange: option.value as any }))}
                              className={cn(
                                "flex-1 text-xs py-2",
                                conversionSettings.pageRange === option.value
                                  ? "border-pink-500 bg-pink-500/10 text-pink-400"
                                  : "border-neutral-700"
                              )}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                        
                        {conversionSettings.pageRange === 'range' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max={totalPages}
                              value={conversionSettings.startPage}
                              onChange={(e) => setConversionSettings(prev => ({ ...prev, startPage: parseInt(e.target.value) || 1 }))}
                              className="w-20 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                              placeholder="Start"
                            />
                            <span className="text-xs text-neutral-400">to</span>
                            <input
                              type="number"
                              min="1"
                              max={totalPages}
                              value={conversionSettings.endPage}
                              onChange={(e) => setConversionSettings(prev => ({ ...prev, endPage: parseInt(e.target.value) || 1 }))}
                              className="w-20 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                              placeholder="End"
                            />
                            <span className="text-xs text-neutral-400 ml-2">
                              (Max: {totalPages})
                            </span>
                          </div>
                        )}
                        
                        {conversionSettings.pageRange === 'custom' && (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={conversionSettings.customRange}
                              onChange={(e) => setConversionSettings(prev => ({ ...prev, customRange: e.target.value }))}
                              placeholder="e.g., 1-3,5,7-9"
                              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-xs"
                            />
                            <p className="text-xs text-neutral-500">
                              Enter page numbers or ranges separated by commas
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Advanced Options */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-xs font-medium text-neutral-300">Image Size</label>
                          <div className="grid grid-cols-3 gap-1">
                            {resizeModeOptions.map((option) => (
                              <Button
                                key={option.value}
                                variant="outline"
                                size="sm"
                                onClick={() => setConversionSettings(prev => ({ ...prev, resizeMode: option.value as any }))}
                                className={cn(
                                  "h-12 flex-col py-2 px-1 text-xs",
                                  conversionSettings.resizeMode === option.value
                                    ? "border-pink-500 bg-pink-500/10 text-pink-400"
                                    : "border-neutral-700"
                                )}
                              >
                                <div className="mb-1">{option.icon}</div>
                                {option.label}
                              </Button>
                            ))}
                          </div>
                          
                          {conversionSettings.resizeMode !== 'original' && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <label className="text-xs text-neutral-400">Max Width</label>
                                <input
                                  type="number"
                                  min="100"
                                  max="3840"
                                  value={conversionSettings.maxWidth}
                                  onChange={(e) => setConversionSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || 1920 }))}
                                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-neutral-400">Max Height</label>
                                <input
                                  type="number"
                                  min="100"
                                  max="2160"
                                  value={conversionSettings.maxHeight}
                                  onChange={(e) => setConversionSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || 1080 }))}
                                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs mt-1"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-xs font-medium text-neutral-300">Color Mode</label>
                          <div className="space-y-2">
                            {colorModeOptions.map((option) => (
                              <div key={option.value} className="flex items-center gap-2">
                                <div className="relative">
                                  <input
                                    type="radio"
                                    id={`color-${option.value}`}
                                    name="colorMode"
                                    value={option.value}
                                    checked={conversionSettings.colorMode === option.value}
                                    onChange={(e) => setConversionSettings(prev => ({ ...prev, colorMode: e.target.value as any }))}
                                    className="sr-only"
                                  />
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer",
                                    conversionSettings.colorMode === option.value 
                                      ? "border-pink-500" 
                                      : "border-neutral-600 hover:border-neutral-500"
                                  )}>
                                    {conversionSettings.colorMode === option.value && (
                                      <div className="w-2 h-2 rounded-full bg-pink-500" />
                                    )}
                                  </div>
                                </div>
                                <label htmlFor={`color-${option.value}`} className="text-xs text-neutral-300 cursor-pointer flex items-center gap-2">
                                  <div className={`w-6 h-3 rounded ${option.color}`} />
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-neutral-300">Rotation</label>
                            </div>
                            <div className="flex gap-1">
                              {rotationOptions.map((angle) => (
                                <Button
                                  key={angle}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setConversionSettings(prev => ({ ...prev, rotation: angle }))}
                                  className={cn(
                                    "flex-1 text-xs py-1",
                                    conversionSettings.rotation === angle
                                      ? "border-pink-500 bg-pink-500/10 text-pink-400"
                                      : "border-neutral-700"
                                  )}
                                >
                                  {angle}°
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Images */}
                  {previewImages.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <EyeIcon className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm font-medium">Image Preview</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                          {previewImages.length} page{previewImages.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {previewImages.map((img, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative rounded-lg overflow-hidden border-2 cursor-pointer",
                              selectedPage === index 
                                ? "border-pink-500" 
                                : "border-neutral-800 hover:border-neutral-600"
                            )}
                            onClick={() => setSelectedPage(index)}
                          >
                            <img
                              src={img}
                              alt={`Page ${index + 1} preview`}
                              className="w-full h-24 object-cover bg-white"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs text-center py-1">
                              Page {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 mb-4",
                      dragOver 
                        ? "border-pink-500 bg-pink-500/10" 
                        : isProcessingFile
                        ? "border-neutral-700 bg-neutral-800/50 cursor-wait"
                        : "border-neutral-700 hover:border-pink-500/50 hover:bg-neutral-800/30"
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,application/pdf"
                      multiple
                      disabled={isProcessingFile}
                    />
                    
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                        {isProcessingFile ? (
                          <Loader2 className="h-6 w-6 text-pink-400 animate-spin" />
                        ) : (
                          <Upload className="h-6 w-6 text-pink-400" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">
                          {isProcessingFile ? 'Processing files...' : 'Drop PDF files here'}
                        </h3>
                        <p className="text-sm text-neutral-400">
                          {isProcessingFile ? 'Please wait...' : 'or click to select files'}
                        </p>
                      </div>
                      
                      <div className="text-xs text-neutral-500">
                        Max 30MB per file • All processing in browser
                      </div>
                    </div>
                  </div>

                  {/* File List */}
                  {files.length > 0 && showFileList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-sm">Files to convert ({files.length})</h4>
                          <p className="text-xs text-neutral-400">
                            {totalPages} pages • Output: {conversionSettings.format.toUpperCase()} • {conversionSettings.dpi} DPI
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFiles}
                            className="text-xs text-neutral-400 hover:text-red-400 h-7 px-2"
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
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={cn(
                                "p-3 rounded-lg border",
                                file.status === 'processing' 
                                  ? "border-blue-500/30 bg-blue-500/5"
                                  : file.status === 'converted'
                                  ? "border-green-500/30 bg-green-500/5"
                                  : file.status === 'error'
                                  ? "border-red-500/30 bg-red-500/5"
                                  : "border-neutral-800 bg-neutral-900/50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <FileText className={cn(
                                    "h-6 w-6",
                                    file.status === 'converted' ? "text-green-400" : 
                                    file.status === 'error' ? "text-red-400" : 
                                    file.status === 'processing' ? "text-blue-400" : 
                                    "text-pink-400"
                                  )} />
                                  {file.status === 'processing' && (
                                    <Loader2 className="absolute -bottom-1 -right-1 h-3 w-3 text-blue-400 animate-spin" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-pink-500/10 text-pink-400 border-pink-500/20">
                                      {file.pages} page{file.pages !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs text-neutral-400">
                                    <span>{file.displaySize}</span>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => previewPDFPages(file.id)}
                                        disabled={isProcessingFile}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <EyeIcon className="h-3 w-3 mr-1" />
                                        Preview
                                      </Button>
                                      <span className={cn(
                                        "text-xs font-medium",
                                        file.status === 'converted' && "text-green-400",
                                        file.status === 'error' && "text-red-400",
                                        file.status === 'processing' && "text-blue-400"
                                      )}>
                                        {file.status === 'processing' ? 'Processing...' :
                                         file.status === 'converted' ? 'Ready' :
                                         file.status === 'error' ? 'Failed' : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                                  onClick={() => removeFile(file.id)}
                                  disabled={file.status === 'processing'}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {/* Progress bar for processing files */}
                              {file.status === 'processing' && (
                                <div className="mt-2">
                                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                                      style={{ width: `${file.progress || 0}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* Converted Images */}
                  {convertedImages.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">Converted Images</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                          {convertedImages.flat().length} images
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {convertedImages.flat().map((image, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-900/30"
                          >
                            <div className="flex items-center gap-3">
                              <ImageIcon className="h-5 w-5 text-pink-400" />
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">{image.fileName}</p>
                                <p className="text-xs text-neutral-400">Page {image.pageNumber}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => downloadImage(image.dataUrl, image.fileName)}
                              className="bg-pink-600 hover:bg-pink-700"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversion Controls */}
                  <div className="space-y-4">
                    {isConverting ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-300">Converting PDF to images...</span>
                          <span className="font-medium">{convertProgress}%</span>
                        </div>
                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${convertProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing {files.length} file{files.length !== 1 ? 's' : ''} ({totalPages} pages)...
                        </div>
                      </div>
                    ) : convertedImages.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <Button
                            onClick={downloadAllImages}
                            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download All Images
                          </Button>
                          <Button
                            variant="outline"
                            onClick={startNewConversion}
                            className="border-neutral-700"
                          >
                            <FolderOpen className="mr-2 h-4 w-4" />
                            Convert More
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={convertPDFToImages}
                          disabled={files.length === 0 || isConverting || !isPDFJSLoaded}
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                        >
                          {isConverting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Converting...
                            </>
                          ) : !isPDFJSLoaded ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading PDF Converter...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Convert {files.length} PDF to {conversionSettings.format.toUpperCase()}
                            </>
                          )}
                        </Button>
                        
                        {files.length > 0 && (
                          <div className="text-center">
                            <p className="text-xs text-neutral-400">
                              Will create ~{totalPages} image{totalPages !== 1 ? 's' : ''} at {conversionSettings.dpi} DPI
                            </p>
                          </div>
                        )}
                        
                        {!isPDFJSLoaded && (
                          <div className="text-center">
                            <p className="text-xs text-yellow-400">
                              PDF converter is loading. Please wait...
                            </p>
                          </div>
                        )}
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
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Professional PDF to Image Conversion</h2>
            <p className="mt-4 text-gray-400">Advanced features for perfect image extraction</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3">
                <Camera className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">High Resolution</h3>
              <p className="text-sm text-gray-400">
                Convert up to 300 DPI with perfect clarity for printing and presentations
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3">
                <Layers className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Batch Processing</h3>
              <p className="text-sm text-gray-400">
                Convert multiple PDFs or all pages at once with consistent settings
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3">
                <Filter className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Multiple Formats</h3>
              <p className="text-sm text-gray-400">
                Export to JPG, PNG, or WebP with customizable quality and compression
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3">
                <Sliders className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Advanced Editing</h3>
              <p className="text-sm text-gray-400">
                Resize, rotate, adjust colors, and customize output with precision controls
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to convert your PDFs to images?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-gray-400">
              All processing happens in your browser - no uploads, 100% private
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3"
                disabled={isProcessingFile || !isPDFJSLoaded}
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
              {!isPDFJSLoaded && (
                <div className="text-sm text-yellow-400">
                  PDF converter is loading...
                </div>
              )}
            </div>
            <p className="mt-6 text-sm text-neutral-500">
              Client-side processing • No uploads • 100% private • No watermarks
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}