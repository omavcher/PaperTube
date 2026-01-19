"use client";
import React, { useState, useRef, useEffect, useCallback, use } from "react";
import { Editor } from "@tinymce/tinymce-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import {
  Download,
  FileDown,
  Bold,
  Italic,
  List as ListIcon,
  Undo,
  Redo,
  Send,
  Save,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Check,
  Eye,
  Edit,
  Lock,
  AlertCircle,
  X,
  Menu,
  FileText,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";

import api from "@/config/api";
import { LoaderX } from "@/components/LoaderX";
import { LoginDialog } from "@/components/LoginDialog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";

// Auth helpers moved to module scope to keep stable references across renders
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("authToken");
  }
  return null;
};

const googleAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("googleAccessToken");
  }
  return null;
}

const isAuthenticated = () => {
  return !!getAuthToken();
};

// PDF Preview Interface
interface PDFPreviewData {
  fileId: string;
  fileName: string;
  viewLink: string;
  downloadLink: string;
  thumbnailLink: string;
  fileSize: number | string;
  uploadedAt: string;
  generatedAt?: string;
  noteTitle?: string;
}

// Custom CSS for iPhone-like animations
const iphoneStyles = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInFromRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes bounceFeedback {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.95); }
}
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
.animate-slide-in-right { animation: slideInRight 0.4s ease-out; }
.animate-slide-in-from-right { animation: slideInFromRight 0.4s ease-out; }
.animate-bounce-feedback { animation: bounceFeedback 0.2s ease-in-out; }
.animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
.ease-ios { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
.glass-effect { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.iphone-scroll { -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }
.smooth-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.bounce-feedback:active { transform: scale(0.95); }
.message-enter { opacity: 0; transform: translateY(8px) scale(0.98); }
.message-enter-active { opacity: 1; transform: translateY(0) scale(1); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.step-complete { transform: scale(1.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

/* Optimize for large screens */
@media (min-width: 1536px) {
  .xl-optimized-layout { max-width: 1400px; margin: 0 auto; }
  .xl-optimized-panel { flex: 0 0 45% !important; }
}
/* Mobile optimizations */
@media (max-width: 768px) {
  .mobile-compact { padding: 0.5rem !important; }
  .mobile-tight { gap: 0.5rem !important; }
  .mobile-text-sm { font-size: 0.8125rem !important; }
}
/* Fix for mobile keyboard not closing chat panel */
.keyboard-open { position: fixed; top: 0; right: 0; height: 100dvh !important; width: 100% !important; z-index: 50; transform: translateX(0) !important; }
body.keyboard-open { overflow: hidden; position: fixed; width: 100%; height: 100%; }
`;

// PDF Preview Component with Thumbnail
const PDFPreviewWithThumbnail: React.FC<{ 
  content: string; 
  pdfData?: PDFPreviewData | null;
  isGenerating?: boolean;
  onGeneratePDF?: () => void;
  onViewInTab?: () => void;
}> = ({ content, pdfData, isGenerating = false, onGeneratePDF, onViewInTab }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  const handleViewInTab = () => {
    if (pdfData?.viewLink) {
      window.open(pdfData.viewLink, '_blank');
    } else if (onViewInTab) {
      onViewInTab();
    }
  };

  return (
    <div className="w-full h-full max-h-full border border-neutral-800 shadow-2xl overflow-hidden rounded-lg bg-white mx-auto animate-scale-in relative group">
      {/* PDF Header with Thumbnail and Actions */}
      {(pdfData || isGenerating) && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-neutral-900/95 to-neutral-800/95 backdrop-blur-sm z-10 p-3 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pdfData?.thumbnailLink && (
              <div className="relative w-12 h-16 rounded overflow-hidden border border-neutral-700 shadow-lg">
                <Image
                  src={pdfData.thumbnailLink}
                  alt="PDF Thumbnail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 48px) 100vw, 48px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {pdfData?.fileName || "Generating PDF..."}
              </h3>
              {pdfData?.fileSize && (
                <p className="text-xs text-neutral-400">
                  {typeof pdfData.fileSize === 'string' 
                    ? pdfData.fileSize 
                    : formatFileSize(pdfData.fileSize)}
                </p>
              )}
              {pdfData?.generatedAt && (
                <p className="text-xs text-neutral-500">
                  Generated: {new Date(pdfData.generatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {pdfData?.viewLink && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 rounded-lg border-neutral-600 bg-neutral-800/50 text-white hover:bg-neutral-700 smooth-transition bounce-feedback"
                onClick={handleViewInTab}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                <span className="text-xs">View</span>
              </Button>
            )}
            
            {!pdfData && onGeneratePDF && (
              <Button
                size="sm"
                variant="default"
                className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white smooth-transition bounce-feedback"
                onClick={onGeneratePDF}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <FileText className="h-3 w-3 mr-1" />
                )}
                <span className="text-xs">
                  {isGenerating ? "Generating..." : "Generate PDF"}
                </span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* PDF Content */}
      <div 
        className={`p-3 sm:p-4 md:p-6 bg-white text-black overflow-auto iphone-scroll custom-scrollbar ${(pdfData || isGenerating) ? 'pt-16' : ''}`} 
        style={{ 
          fontFamily: "'Times New Roman', Times, serif", 
          fontSize: 'clamp(8px, 1.2vw, 11px)', 
          lineHeight: '1.4', 
          color: '#000000',
          height: '100%'
        }}
      >
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center animate-spin mb-4">
              <Loader2 className="h-6 w-6 text-white" />
            </div>
            <p className="text-neutral-600 text-sm">Generating PDF preview...</p>
            <p className="text-neutral-500 text-xs mt-2">This may take a moment</p>
          </div>
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: content }} 
            className="pdf-content smooth-transition" 
            style={{ maxWidth: '210mm', margin: '0 auto' }} 
          />
        )}
      </div>

      {/* View Fullscreen Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute bottom-4 right-4 bg-neutral-800/80 backdrop-blur-sm hover:bg-neutral-700/80 text-white border border-neutral-700 rounded-full w-10 h-10 p-0 smooth-transition bounce-feedback"
        onClick={() => setShowFullPreview(true)}
      >
        <Eye className="h-4 w-4" />
      </Button>

      {/* Fullscreen Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setShowFullPreview(false)} />
          <div className="relative bg-white rounded-lg overflow-hidden w-full max-w-4xl h-[90vh] z-10 animate-scale-in">
            <div className="absolute top-4 right-4 z-20">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10"
                onClick={() => setShowFullPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-full overflow-auto p-6">
              <div 
                dangerouslySetInnerHTML={{ __html: content }} 
                className="pdf-content" 
                style={{ 
                  fontFamily: "'Times New Roman', Times, serif", 
                  fontSize: '14px', 
                  lineHeight: '1.6',
                  maxWidth: '210mm',
                  margin: '0 auto'
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// PDF Download Loader Component (Themed Red/Orange)
const PDFDownloadLoader: React.FC<{
  isVisible: boolean;
  currentStep: number;
  steps: { text: string; status: 'pending' | 'processing' | 'completed' | 'error' }[];
  onCancel: () => void;
  pdfData?: PDFPreviewData | null;
}> = ({ isVisible, currentStep, steps, onCancel, pdfData }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isVisible) { setIsMounted(true); } 
    else { const timer = setTimeout(() => setIsMounted(false), 300); return () => clearTimeout(timer); }
  }, [isVisible]);

  if (!isMounted && !isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 transition-all duration-500 ease-ios ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className={`bg-neutral-900/90 glass-effect border border-neutral-700/50 rounded-3xl p-6 max-w-md w-full mx-auto relative overflow-hidden transition-all duration-500 ease-ios ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        {/* Red Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient-x" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileDown className="w-5 h-5 text-red-400" /> 
            {pdfData ? 'PDF Ready!' : 'Preparing PDF'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-full bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-white smooth-transition bounce-feedback">
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* PDF Preview in Loader */}
        {pdfData && (
          <div className="mb-4 p-4 bg-neutral-800/30 rounded-2xl border border-neutral-700 animate-fade-in-up">
            <div className="flex items-center gap-3">
              {pdfData.thumbnailLink && (
                <div className="relative w-16 h-20 rounded overflow-hidden border border-neutral-700">
                  <Image
                    src={pdfData.thumbnailLink}
                    alt="PDF Thumbnail"
                    fill
                    className="object-cover"
                    sizes="(max-width: 64px) 100vw, 64px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">{pdfData.fileName}</h4>
                <p className="text-xs text-neutral-400">
                  Size: {typeof pdfData.fileSize === 'string' ? pdfData.fileSize : formatFileSize(pdfData.fileSize)}
                </p>
                <div className="flex gap-2 mt-2">
                  {pdfData.viewLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs border-neutral-600 bg-neutral-800/50 hover:bg-neutral-700 smooth-transition"
                      onClick={() => window.open(pdfData.viewLink, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                  {pdfData.downloadLink && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 smooth-transition"
                      onClick={() => window.open(pdfData.downloadLink, '_blank')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {steps.map((step, index) => (
            <div key={index} className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all duration-500 ease-ios ${index === currentStep ? "bg-red-500/10 border-red-500/30 scale-105" : index < currentStep ? "bg-green-500/10 border-green-500/30 step-complete" : "bg-neutral-800/50 border-neutral-700/50 opacity-60"}`}>
              <div className="flex-shrink-0 transition-all duration-500 ease-ios">
                {step.status === 'completed' ? (
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center scale-100 animate-scale-in"><Check className="h-2.5 w-2.5 text-white" /></div>
                ) : step.status === 'error' ? (
                  <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center scale-100 animate-scale-in"><X className="h-2.5 w-2.5 text-white" /></div>
                ) : step.status === 'processing' ? (
                  <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center scale-110 animate-pulse"><Loader2 className="h-2.5 w-2.5 text-white animate-spin" /></div>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-neutral-600 flex items-center justify-center transition-all duration-300"><div className="h-1.5 w-1.5 rounded-full bg-neutral-400" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-all duration-300 mobile-text-sm ${index === currentStep ? "text-white" : index < currentStep ? "text-green-400" : "text-neutral-400"}`}>{step.text}</p>
                {index === currentStep && step.status === 'processing' && <p className="text-xs text-neutral-400 mt-1 animate-pulse">Processing...</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-neutral-400 mb-2">
            <span>Progress</span><span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000 ease-out rounded-full" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
          </div>
        </div>

        <Button onClick={onCancel} variant="outline" className="w-full h-9 rounded-xl border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700 hover:text-white smooth-transition bounce-feedback text-sm">
          {pdfData ? 'Close' : 'Cancel Download'}
        </Button>
      </div>
    </div>
  );
};

// Multi-step loader component (Themed Red)
const MultiStepLoader: React.FC<{ steps: { text: string, icon?: React.ReactNode, thumbnail?: string, title?: string }[], currentStep: number }> = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-start mb-3 animate-fade-in-up">
      <div className="mr-3 mt-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed bg-neutral-900/80 glass-effect border border-neutral-800 text-neutral-200 animate-slide-in-right">
        <div className="space-y-1.5">
          {steps.map((step, index) => (
            <div key={index} className={`flex items-center transition-all duration-500 ease-ios ${index < currentStep ? "text-green-400 transform -translate-x-0.5" : index === currentStep ? "text-red-400 animate-pulse scale-105 font-medium" : "text-neutral-500 opacity-70"}`}>
              <div className="w-4 h-4 mr-2 flex items-center justify-center flex-shrink-0 transition-all duration-300">
                {index < currentStep ? ( <div className="scale-100 animate-scale-in"><Check className="w-3 h-3" /></div> ) : index === currentStep ? ( <div className="animate-spin"><Loader2 className="w-3 h-3" /></div> ) : ( <div className="w-1.5 h-1.5 rounded-full bg-current transition-all duration-300" /> )}
              </div>
              <span className="text-xs break-words flex-1 mobile-text-sm">{step.text}</span>
              {step.thumbnail && index === currentStep && (
                <div className="ml-2 flex-shrink-0 scale-100 animate-scale-in">
                  <Image src={step.thumbnail} alt="Video thumbnail" width={40} height={26} className="w-10 h-6 rounded-lg object-cover border border-neutral-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper Functions
const formatDate = (date: Date): string => {
  const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  else if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const formatTime = (date: Date): string => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Responsive Header Component (Red Themed)
const ResponsiveHeader: React.FC<{ title: string; onMenuClick?: () => void; showChatMobile: boolean; onToggleChat: () => void; }> = ({ title, onMenuClick, showChatMobile, onToggleChat }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between p-3 border-b border-neutral-900 bg-neutral-950/80 glass-effect lg:hidden sticky top-0 z-40 animate-fade-in-up safe-area-inset-top">
      <div className="flex items-center gap-2 flex-1 min-w-0 mobile-tight">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="h-8 w-8 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/50 flex-shrink-0 smooth-transition bounce-feedback">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate text-white animate-fade-in-up mobile-text-sm">{title}</h1>
        </div>
      </div>
      <Button size="sm" variant={showChatMobile ? "secondary" : "default"} className="bg-red-600 hover:bg-red-700 text-white h-8 px-3 rounded-xl text-xs flex-shrink-0 ml-2 smooth-transition bounce-feedback" onClick={onToggleChat}>
        {showChatMobile ? "Close" : "Ask AI"}
      </Button>
    </div>
  );
};

// Locked Chat Section Component
const LockedChatSection: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  return (
    <div className="fixed lg:static top-0 right-0 h-[100dvh] w-full lg:w-auto bg-neutral-950/80 glass-effect flex flex-col border-l border-neutral-900 z-50 animate-slide-in-from-right safe-area-inset-bottom">
      <div className="p-3 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/80 glass-effect safe-area-inset-top">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate text-white animate-fade-in-up">Note Preview</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-neutral-800/50 text-neutral-200 text-xs animate-scale-in">Locked</Badge>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-neutral-900/80 glass-effect border border-neutral-800 rounded-2xl p-6 max-w-md w-full animate-scale-in">
          <div className="flex justify-center mb-3 animate-bounce">
            <div className="bg-red-600/20 p-3 rounded-full"><Lock className="h-6 w-6 text-red-500" /></div>
          </div>
          <h2 className="text-lg font-bold text-white mb-2 animate-fade-in-up">Access Restricted</h2>
          <p className="text-neutral-400 text-sm mb-4 animate-fade-in-up mobile-text-sm">You don&apos;t have permission to access this note. Please login with the correct account.</p>
          <Button onClick={onLoginClick} className="bg-red-600 hover:bg-red-700 text-white w-full h-9 rounded-xl text-sm smooth-transition bounce-feedback animate-fade-in-up">Login to Access</Button>
          <p className="text-xs text-neutral-500 mt-3 animate-fade-in-up">This note belongs to another user. You need proper authorization to interact with it.</p>
        </div>
      </div>
    </div>
  );
};

// Note Not Found Component
const NoteNotFound: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 safe-area-inset-bottom">
      <div className="bg-neutral-900/80 glass-effect border border-neutral-800 rounded-2xl p-6 max-w-md w-full text-center animate-scale-in">
        <div className="flex justify-center mb-3 animate-bounce">
          <div className="bg-red-600/20 p-3 rounded-full"><AlertCircle className="h-6 w-6 text-red-500" /></div>
        </div>
        <h2 className="text-lg font-bold text-white mb-2 animate-fade-in-up">Note Not Found</h2>
        <p className="text-neutral-400 text-sm mb-4 animate-fade-in-up">The note you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
        <Button onClick={onGoHome} className="bg-red-600 hover:bg-red-700 text-white w-full h-9 rounded-xl text-sm smooth-transition bounce-feedback animate-fade-in-up">Go Back Home</Button>
      </div>
    </div>
  );
};

// Types
interface ApiMessage { _id: string; role: string; content: string; timestamp: string; videoLink?: string; feedback?: "good" | "bad" | null; }
interface ApiMessagesResponse { messages: ApiMessage[]; }
interface NoteData { _id: string; title: string; content: string; thumbnail?: string; }

/* ----------------- Main Component ----------------- */
export default function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [noteNotFound, setNoteNotFound] = useState(false);
  const router = useRouter();

  const handleHomeClick = () => { router.push('/'); };

  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string; timestamp: Date; videoLink?: string; feedback?: "good" | "bad" | null; }[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [manualChatState, setManualChatState] = useState(false);

  const [showPDFLoader, setShowPDFLoader] = useState(false);
  const [pdfDownloadStep, setPdfDownloadStep] = useState(0);
  const [pdfDownloadSteps, setPdfDownloadSteps] = useState<{ text: string; status: 'pending' | 'processing' | 'completed' | 'error' }[]>([]);
  const [pdfPreviewData, setPdfPreviewData] = useState<PDFPreviewData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Styles Injection
  useEffect(() => {
    const styleElement = document.createElement('style'); styleElement.textContent = iphoneStyles; document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  // Device Detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      if (width >= 1024 && !manualChatState) { setShowChatMobile(true); }
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => { window.removeEventListener("resize", checkDevice); };
  }, [manualChatState]);

  const handleToggleChat = () => { const newState = !showChatMobile; setShowChatMobile(newState); setManualChatState(newState); };
  const handleInputFocus = () => { if (isMobile) { setKeyboardOpen(true); setShowChatMobile(true); document.body.classList.add('keyboard-open'); } };
  const handleInputBlur = () => { setTimeout(() => { setKeyboardOpen(false); document.body.classList.remove('keyboard-open'); }, 100); };

  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const tinyMceRef = useRef<{ undoManager: { undo: () => void; redo: () => void }; execCommand: (command: string, ui?: boolean, value?: unknown) => void; } | null>(null);

  const initializePDFSteps = () => [
    { text: "Connecting to server...", status: 'pending' as const },
    { text: "Checking PDF status...", status: 'pending' as const },
    { text: "Generating PDF document...", status: 'pending' as const },
    { text: "Uploading to Google Drive...", status: 'pending' as const },
    { text: "Preparing preview...", status: 'pending' as const },
  ];

  // Check for existing PDF
  const checkExistingPDF = useCallback(async (noteId: string) => {
    try {
      const response = await api.get(`/notes/generate/pdf?noteId=${noteId}`, { 
        headers: { 
          'Auth': getAuthToken(), 
          'x-google-access-token': googleAccessToken() 
        } 
      });
      
      if (response.data.success && response.data.data) {
        // Handle both response formats
        const pdfData = response.data.data.pdf_data || response.data.data;
        setPdfPreviewData(pdfData);
        return pdfData;
      }
    } catch (error) {
      // PDF not generated yet, ignore error
      console.log("No existing PDF found");
    }
    return null;
  }, []);

  const generatePDF = useCallback(async () => {
    if (!hasPermission) { setShowLoginDialog(true); return; }
    if (!data?._id) { alert("Note data not available"); return; }

    setIsGeneratingPDF(true);
    const steps = initializePDFSteps();
    setPdfDownloadSteps(steps);
    setPdfDownloadStep(0);
    setShowPDFLoader(true);
    let currentStepIndex = 0;

    const updateStep = (index: number, status: 'processing' | 'completed' | 'error') => {
      setPdfDownloadSteps(prev => prev.map((step, i) => i === index ? { ...step, status } : step));
      setPdfDownloadStep(index);
    };

    try {
      // Step 1: Connecting to server
      updateStep(currentStepIndex++, 'processing');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep(currentStepIndex - 1, 'completed');

      // Step 2: Checking PDF status
      updateStep(currentStepIndex++, 'processing');
      const existingPDF = await checkExistingPDF(data._id);
      if (existingPDF) {
        // PDF already exists
        updateStep(currentStepIndex - 1, 'completed');
        updateStep(currentStepIndex++, 'completed'); // Skip generation
        updateStep(currentStepIndex++, 'completed'); // Skip upload
        updateStep(currentStepIndex++, 'processing'); // Preparing preview
        setPdfPreviewData(existingPDF);
        setIsGeneratingPDF(false);
        await new Promise(resolve => setTimeout(resolve, 500));
        updateStep(currentStepIndex - 1, 'completed');
        return;
      }
      updateStep(currentStepIndex - 1, 'completed');

      // Step 3: Generating PDF
      updateStep(currentStepIndex++, 'processing');
      const generateResponse = await api.get(`/notes/generate/pdf?noteId=${data._id}`, {
        headers: {
          'Auth': getAuthToken(),
          'x-google-access-token': googleAccessToken()
        }
      });

      if (!generateResponse.data.success) {
        throw new Error(generateResponse.data.message || "Failed to generate PDF");
      }

      updateStep(currentStepIndex - 1, 'completed');

      // Step 4: Uploading to Google Drive
      updateStep(currentStepIndex++, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStep(currentStepIndex - 1, 'completed');

      // Step 5: Preparing preview
      updateStep(currentStepIndex++, 'processing');
      
      // Get the final PDF data
      const pdfData = generateResponse.data.data.pdf_data || generateResponse.data.data;
      setPdfPreviewData(pdfData);
      setIsGeneratingPDF(false);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep(currentStepIndex - 1, 'completed');

    } catch (error: any) {
      console.error("PDF generation error:", error);
      setIsGeneratingPDF(false);
      if (currentStepIndex > 0) updateStep(currentStepIndex - 1, 'error');
      
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      setTimeout(() => {
        setShowPDFLoader(false);
        alert(`Failed to generate PDF: ${errorMessage}`);
      }, 1500);
    }
  }, [hasPermission, data?._id, checkExistingPDF]);

  const handleViewPDFInTab = () => {
    if (pdfPreviewData?.viewLink) {
      window.open(pdfPreviewData.viewLink, '_blank');
    } else {
      generatePDF();
    }
  };

  const handlePDFDownloadCancel = () => { 
    setShowPDFLoader(false); 
    setPdfDownloadStep(0); 
    setPdfDownloadSteps([]); 
    setIsGeneratingPDF(false);
  };

  const handleLoginSuccess = async () => { 
    setShowLoginDialog(false); 
    setAuthError(null); 
    loadNoteData(); 
  };
  
  const handleLoginClose = () => { 
    setShowLoginDialog(false); 
    if (!hasPermission && !isAuthenticated()) { 
      setTimeout(() => { router.push('/'); }, 500); 
    } 
  };
  
  const handleGoHome = () => { router.push('/'); };

  const loadNoteData = useCallback(async () => {
    try {
      setLoading(true); 
      setAuthError(null); 
      setNoteNotFound(false); 
      const authToken = getAuthToken();
      
      const res = await api.get(`/notes/slug/${slug}`, { headers: { 'Auth': authToken } });
      setData(res.data); 
      setMarkdownContent(res.data.content); 
      setError(null); 
      setHasPermission(true);

      // Check for existing PDF
      await checkExistingPDF(res.data._id);

      try {
        const messagesRes = await api.get<ApiMessagesResponse>(`/chat/getMessages/${res.data._id}`, { headers: { 'Auth': authToken } });
        const formattedMessages = messagesRes.data.messages.map(msg => ({ id: msg._id, role: msg.role as "user" | "assistant", content: msg.content, timestamp: new Date(msg.timestamp), videoLink: msg.videoLink, feedback: msg.feedback }));
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Failed to load initial messages:", err);
        setMessages([{ id: "default", role: "assistant", content: "Hello! Ask me about this guide.", timestamp: new Date(Date.now() - 300000) }]);
      }
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.data?.message?.includes("Note not found")) { 
        setNoteNotFound(true); 
        setHasPermission(false); 
      } 
      else if (error.response?.status === 403 || error.response?.status === 401) { 
        setAuthError("Please login to access this note."); 
        setHasPermission(false); 
        setShowLoginDialog(true); 
      } 
      else { 
        setError("Failed to load content. Please try again later."); 
        setHasPermission(false); 
      }
    } finally { 
      setLoading(false); 
    }
  }, [slug, checkExistingPDF]);

  useEffect(() => { loadNoteData(); }, [loadNoteData]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isThinking]);

  const [aiTypingContent, setAiTypingContent] = useState<string>("");
  const [aiTypingDuration, setAiTypingDuration] = useState<number | null>(null);

  const handleFeedback = useCallback(async (noteId: string, messageId: string, feedback: "good" | "bad") => {
    try {
      if (!isAuthenticated() || !hasPermission) { setShowLoginDialog(true); return; }
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback: msg.feedback === feedback ? null : feedback } : msg));
      await api.post(`/chat/feedback`, { noteId, messageId, feedback }, { headers: { 'Auth': getAuthToken() } });
    } catch (error) {
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback: null } : msg));
      alert("Failed to submit feedback.");
    }
  }, [hasPermission]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking || !hasPermission) return;
    if (!isAuthenticated()) { setShowLoginDialog(true); return; }

    const newMsg = { id: Date.now().toString(), role: "user" as const, content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    setInput(""); setIsThinking(true); setAiTypingContent(""); setAiTypingDuration(null);

    const loaderSteps = [
      { text: "Analyzing your question..." },
      { text: "Gathering information from PDF..." },
      { text: "Analyzing YouTube video...", thumbnail: data?.thumbnail, title: data?.title },
      { text: "Thinking..." },
      { text: "Formulating response..." }
    ];

    try {
      for (let i = 0; i < loaderSteps.length; i++) { setCurrentStep(i); await new Promise(resolve => setTimeout(resolve, i === 2 ? 1500 : 1000)); }
      const response = await api.post(`/chat/message`, { noteId: data?._id, message: input }, { headers: { 'Auth': getAuthToken() } });
      setIsThinking(false); setCurrentStep(0);

      const fullText = response.data.assistantMessage || "Sorry, I couldn't process your request.";
      const videoLink = response.data.videoLink || null;
      let shownText = ""; let idx = 0; const typingStart = Date.now(); const charsPerFrame = isMobile ? 2 : 4;

      function typeChar() {
        shownText += fullText.slice(idx, idx + charsPerFrame); idx += charsPerFrame; setAiTypingContent(shownText);
        if (idx < fullText.length) { requestAnimationFrame(typeChar); } 
        else {
          const duration = Math.min(Math.round((Date.now() - typingStart) / 1000), 5); setAiTypingDuration(duration);
          setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant" as const, content: fullText, timestamp: new Date(), videoLink: videoLink }]);
          setAiTypingContent("");
        }
      }
      requestAnimationFrame(typeChar);
    } catch (error: any) {
      setIsThinking(false); setCurrentStep(0); setAiTypingContent(""); setAiTypingDuration(null);
      if (error.response?.status === 403 || error.response?.status === 401) { setAuthError("Authentication failed. Please login again."); setHasPermission(false); setShowLoginDialog(true); } 
      else { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant" as const, content: "Sorry, I encountered an error.", timestamp: new Date() }]); }
    }
  }, [input, isThinking, data, hasPermission, isMobile]);

  const handleSave = useCallback(async () => {
    if (!data?._id || !hasPermission) return;
    if (!isAuthenticated()) { setShowLoginDialog(true); return; }
    try {
      const res = await api.put(`/notes/update/${data._id}`, { content: markdownContent }, { headers: { 'Auth': getAuthToken() } });
      setData(res.data); setIsDirty(false);
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) { setAuthError("Authentication failed."); setHasPermission(false); setShowLoginDialog(true); } 
      else { alert("Failed to save changes."); }
    }
  }, [data, markdownContent, hasPermission]);

  const groupedMessages = () => {
    const groups: { date: string; messages: typeof messages }[] = [];
    messages.forEach((message) => {
      const dateStr = formatDate(message.timestamp);
      if (groups.length === 0 || groups[groups.length - 1].date !== dateStr) { groups.push({ date: dateStr, messages: [message] }); } 
      else { groups[groups.length - 1].messages.push(message); }
    });
    return groups;
  };

  if (noteNotFound) return <NoteNotFound onGoHome={handleGoHome} />;
  if (loading) return <LoaderX/>;
  if (error && !authError) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 text-center safe-area-inset-bottom">{error || "No data found."}</div>;

  return (
    <>
      <LoginDialog isOpen={showLoginDialog} onClose={handleLoginClose} onSuccess={handleLoginSuccess} />
      <PDFDownloadLoader 
        isVisible={showPDFLoader} 
        currentStep={pdfDownloadStep} 
        steps={pdfDownloadSteps} 
        onCancel={handlePDFDownloadCancel}
        pdfData={pdfPreviewData}
      />
      {authError && ( <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg z-500 max-w-xs text-center text-xs animate-fade-in-up">{authError}</div> )}

      <div className="bg-black text-white h-screen w-screen overflow-hidden safe-area-inset-bottom selection:bg-red-500/30">
        
        {/* Background Ambience (Red/Orange) */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <ResponsiveHeader title={data?.title || "Note"} showChatMobile={showChatMobile} onToggleChat={handleToggleChat} />

        <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)] lg:h-screen w-full overflow-hidden xl-optimized-layout relative z-10">
          {/* Left: PDF + Editor */}
          <div className={`flex-1 lg:flex-[0_0_45%] xl-optimized-panel p-3 h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-900 flex flex-col items-center ${isMobile && showChatMobile ? 'hidden lg:flex' : 'flex'}`}>
            <Tabs defaultValue="preview" className="w-full h-full max-h-full flex flex-col animate-fade-in">
              <TabsList className="mb-2 grid w-full grid-cols-2 bg-neutral-900/50 h-8 rounded-lg flex-shrink-0">
                <TabsTrigger value="preview" className="text-xs px-3 py-1 flex items-center gap-1 rounded-lg smooth-transition mobile-text-sm"><Eye className="h-3 w-3" /><span>Preview</span></TabsTrigger>
                <TabsTrigger value="editor" className="text-xs px-3 py-1 flex items-center gap-1 rounded-lg smooth-transition mobile-text-sm"><Edit className="h-3 w-3" /><span>Edit</span></TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-0 flex-1 flex flex-col min-h-0">
                <div className="lg:w-[80%] lg:ml-20 flex-1 flex items-center justify-center min-h-0 h-full">
                  <PDFPreviewWithThumbnail 
                    content={markdownContent} 
                    pdfData={pdfPreviewData}
                    isGenerating={isGeneratingPDF}
                    onGeneratePDF={generatePDF}
                    onViewInTab={handleViewPDFInTab}
                  />
                </div>
              </TabsContent>

              <TabsContent value="editor" className="mt-0 flex-1 flex flex-col min-h-0 h-full">
                <div className="h-full border border-neutral-800 shadow-lg overflow-hidden flex flex-col rounded-lg bg-white flex-1 animate-scale-in">
                  <div className="p-1.5 flex flex-wrap gap-1 bg-neutral-950/80 glass-effect border-b border-neutral-800 rounded-t-lg flex-shrink-0 mobile-tight">
                    <div className="flex gap-1 border-r border-neutral-700 pr-2 mr-2">
                      <Button variant="outline" size="sm" className="h-7 w-7 rounded-md hover:bg-neutral-800/50 smooth-transition bounce-feedback" onClick={() => tinyMceRef.current?.undoManager.undo()} disabled={!hasPermission}><Undo className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 rounded-md hover:bg-neutral-800/50 smooth-transition bounce-feedback" onClick={() => tinyMceRef.current?.undoManager.redo()} disabled={!hasPermission}><Redo className="h-3 w-3" /></Button>
                    </div>
                    <div className="flex gap-1 border-r border-neutral-700 pr-2 mr-2">
                      <Button variant="outline" size="sm" className="h-7 w-7 rounded-md hover:bg-neutral-800/50 smooth-transition bounce-feedback" onClick={() => tinyMceRef.current?.execCommand('Bold')} disabled={!hasPermission}><Bold className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 rounded-md hover:bg-neutral-800/50 smooth-transition bounce-feedback" onClick={() => tinyMceRef.current?.execCommand('Italic')} disabled={!hasPermission}><Italic className="h-3 w-3" /></Button>
                    </div>
                    <div className="flex gap-1 border-r border-neutral-700 pr-2 mr-2">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs rounded-md hover:bg-neutral-800/50 smooth-transition bounce-feedback" onClick={() => tinyMceRef.current?.execCommand('FormatBlock', false, 'h1')} disabled={!hasPermission}>H1</Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs rounded-md hover:bg-neutral-800/50 smooth-transition bounce-feedback" onClick={() => tinyMceRef.current?.execCommand('FormatBlock', false, 'h2')} disabled={!hasPermission}>H2</Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 rounded-md hover:bg-neutral-800/50 smooth-transition bounce-feedback" onClick={() => tinyMceRef.current?.execCommand('InsertUnorderedList')} disabled={!hasPermission}><ListIcon className="h-3 w-3" /></Button>
                    </div>
                    {isDirty && (
                      <Button className="bg-green-600 hover:bg-green-700 text-white ml-auto h-7 px-3 rounded-md text-xs smooth-transition bounce-feedback" onClick={handleSave} disabled={!hasPermission}>
                        <Save className="mr-1 h-3 w-3" /> {hasPermission ? "Save" : "Login to Save"}
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 h-full">
                    <Editor apiKey="xuwnpn5va0cwbivoch3ovgc44gtceufhg07937jqqu6dnl25" onInit={(_, editor) => (tinyMceRef.current = editor)} value={markdownContent} init={{ height: '100%', min_height: 300, menubar: false, plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'], toolbar: false, content_style: `body { font-family: 'Times New Roman', serif; font-size: 11px; line-height: 1.4; color: #000; margin: 12px; } h1 { font-size: 16px; margin: 20px 0 10px 0; } h2 { font-size: 14px; margin: 16px 0 8px 0; } h3 { font-size: 12px; margin: 12px 0 6px 0; } p { margin: 6px 0; }`, branding: false, statusbar: false, paste_data_images: true, images_upload_url: '/api/upload', automatic_uploads: true }} onEditorChange={(content) => { if (hasPermission) { setMarkdownContent(content); setIsDirty(true); } }} disabled={!hasPermission} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Chat or Locked Section */}
          {hasPermission ? (
            <div className={`flex-1 lg:flex-[0_0_55%] xl-optimized-panel fixed lg:static top-0 right-0 h-[100dvh] w-full lg:w-auto bg-neutral-950/80 glass-effect flex flex-col border-l border-neutral-900 transition-all duration-500 ease-ios z-50 ${isMobile ? (showChatMobile ? "translate-x+0" : "translate-x-full") : "translate-x-0"} ${isMobile && !showChatMobile ? 'hidden lg:flex' : 'flex'}`}>
              
              {/* Chat Header */}
              <div className="p-3 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/80 glass-effect flex-shrink-0 animate-fade-in-up safe-area-inset-top">
                <Button variant="ghost" size="icon" onClick={handleHomeClick} className="h-8 w-8 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/50 flex-shrink-0 smooth-transition bounce-feedback">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold truncate text-white mobile-text-sm ml-2">{data?.title}</h1>
                </div>
                <div className="flex items-center gap-2 ml-3 mobile-tight">
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white border-none h-8 px-3 rounded-xl text-xs smooth-transition bounce-feedback" 
                    onClick={generatePDF} 
                    disabled={showPDFLoader || isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : pdfPreviewData ? (
                      <ExternalLink className="mr-1 h-3 w-3" />
                    ) : (
                      <Download className="mr-1 h-3 w-3" />
                    )}
                    <span className="hidden sm:inline">
                      {isGeneratingPDF ? "Generating..." : pdfPreviewData ? "View PDF" : "Generate PDF"}
                    </span>
                    <span className="sm:hidden">
                      {isGeneratingPDF ? "..." : pdfPreviewData ? "View" : "PDF"}
                    </span>
                  </Button>
                  {isMobile && ( <Button size="sm" variant="outline" className="h-8 px-3 rounded-xl text-xs smooth-transition bounce-feedback" onClick={handleToggleChat}>Close</Button> )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <ScrollArea className="flex-1 h-full iphone-scroll">
                  <div className="p-3 space-y-4 mobile-compact">
                    {groupedMessages().map((group, groupIndex) => (
                      <div key={groupIndex} className="animate-fade-in-up lg:w-full">
                        <div className="flex justify-center my-3">
                          <div className="text-xs text-neutral-500 bg-neutral-900/50 glass-effect px-3 py-1 rounded-full animate-scale-in mobile-text-sm">{group.date}</div>
                        </div>
                        {group.messages.map((m, messageIndex) => (
                          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-3 message-enter-active`} style={{ animationDelay: `${messageIndex * 80}ms`, transitionDelay: `${messageIndex * 40}ms` }}>
                            {m.role === "assistant" && (
                              <Avatar className="mr-2 h-6 w-6 flex-shrink-0 animate-scale-in">
                                <AvatarImage src="/ai-avatar.png" />
                                <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex flex-col max-w-[80%]">
                              <div className={`rounded-xl px-3 py-2 text-sm leading-relaxed break-words smooth-transition mobile-text-sm ${m.role === "user" ? "bg-red-600 text-white animate-slide-in-right" : "bg-neutral-900/80 glass-effect border border-neutral-800 text-neutral-200 animate-slide-in-right"}`}>
                                <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                                {m.role === "assistant" && m.videoLink && (
                                  <div className="mt-2 p-2 bg-neutral-800/50 rounded-lg border border-neutral-700 animate-fade-in-up">
                                    <a href={m.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-all duration-300 group mobile-tight">
                                      <div className="flex-shrink-0"><svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
                                      <div className="flex-1 min-w-0"><p className="text-xs font-medium mobile-text-sm">Watch video</p><p className="text-xs text-neutral-400 truncate mobile-text-sm">{m.videoLink.includes('youtube.com') || m.videoLink.includes('youtu.be') ? 'YouTube Video' : 'External Video'}</p></div>
                                    </a>
                                  </div>
                                )}
                                {m.role === "assistant" && (
                                  <div className="flex justify-end gap-1 mt-2 flex-wrap animate-fade-in-up mobile-tight">
                                    <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white hover:bg-neutral-800/50 h-6 px-2 text-xs rounded-md smooth-transition bounce-feedback" onClick={async () => { await navigator.clipboard.writeText(m.content); setCopiedMessageId(m.id); setTimeout(() => setCopiedMessageId(null), 3000); }}>
                                      {copiedMessageId === m.id ? <span className="flex items-center text-green-500 animate-scale-in text-xs"><Check className="h-2.5 w-2.5 mr-0.5" /> Copied</span> : <><FileDown className="h-2.5 w-2.5 mr-0.5" /> Copy</>}
                                    </Button>
                                    <Button variant="ghost" size="icon" className={`w-6 h-6 rounded-md transition-all duration-300 ease-ios ${m.feedback === "good" ? "text-green-500 bg-green-500/20 hover:bg-green-500/30 animate-bounce-feedback" : "text-neutral-400 hover:text-green-500 hover:bg-neutral-800/50 bounce-feedback"}`} onClick={() => data?._id && handleFeedback(data._id, m.id, "good")}><ThumbsUp className="h-2.5 w-2.5" /></Button>
                                    <Button variant="ghost" size="icon" className={`w-6 h-6 rounded-md transition-all duration-300 ease-ios ${m.feedback === "bad" ? "text-red-500 bg-red-500/20 hover:bg-red-500/30 animate-bounce-feedback" : "text-neutral-400 hover:text-red-500 hover:bg-neutral-800/50 bounce-feedback"}`} onClick={() => data?._id && handleFeedback(data._id, m.id, "bad")}><ThumbsDown className="h-2.5 w-2.5" /></Button>
                                  </div>
                                )}
                              </div>
                              <div className={`text-xs text-neutral-500 mt-1 ${m.role === "user" ? "text-right" : "text-left"} animate-fade-in-up mobile-text-sm`}>{formatTime(m.timestamp)}</div>
                            </div>
                            {m.role === "user" && ( <Avatar className="ml-2 h-6 w-6 flex-shrink-0 animate-scale-in"><AvatarImage src="/user-avatar.png" /><AvatarFallback className="bg-neutral-700 text-white text-xs">U</AvatarFallback></Avatar> )}
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {isThinking && ( <MultiStepLoader steps={[{ text: "Analyzing your question..." }, { text: "Gathering information from PDF..." }, { text: "Analyzing YouTube video...", thumbnail: data?.thumbnail, title: data?.title }, { text: "Thinking..." }, { text: "Formulating response..." }]} currentStep={currentStep} /> )}
                    
                    {aiTypingContent && (
                      <div className="flex justify-start mb-3 animate-fade-in-up">
                        <Avatar className="mr-2 h-6 w-6 flex-shrink-0"><AvatarImage src="/ai-avatar.png" /><AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback></Avatar>
                        <div className="flex flex-col max-w-[80%]">
                          <div className="rounded-xl px-3 py-2 text-sm leading-relaxed bg-neutral-900/80 glass-effect border border-neutral-800 text-neutral-200 break-words animate-slide-in-right">
                            <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{aiTypingContent}</ReactMarkdown></div>
                            {aiTypingDuration && ( <span className="ml-1 text-xs text-green-400 animate-fade-in-up mobile-text-sm">Generated in {aiTypingDuration} sec</span> )}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 text-left animate-fade-in-up mobile-text-sm">{formatTime(new Date())}</div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="border-t border-neutral-900 p-3 bg-neutral-950/80 glass-effect flex-shrink-0 safe-area-inset-bottom animate-fade-in-up">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                  <div className="flex gap-2 mobile-tight">
                    <Input placeholder="Ask something about this content..." value={input} onChange={(e) => setInput(e.target.value)} onFocus={handleInputFocus} onBlur={handleInputBlur} className="bg-neutral-900/50 border-neutral-800 focus-visible:ring-red-500 text-sm h-9 rounded-lg flex-1 smooth-transition mobile-text-sm" disabled={isThinking} />
                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white h-9 w-9 rounded-lg flex-shrink-0 smooth-transition bounce-feedback" disabled={isThinking || !input.trim()}>
                      {isThinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-500 mobile-text-sm">
                    <span>{input.length} characters</span><span className="text-neutral-600">Press Enter to send</span>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <LockedChatSection onLoginClick={() => setShowLoginDialog(true)} />
          )}
        </div>
      </div>
    </>
  );
}