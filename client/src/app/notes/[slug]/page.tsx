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
} from "lucide-react";

import api from "@/config/api";
import { LoaderX } from "@/components/LoaderX";
import { LoginDialog } from "@/components/LoginDialog";
import { redirect, useRouter } from "next/navigation";
 

// Auth helpers moved to module scope to keep stable references across renders
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("authToken");
  }
  return null;
};

const googleAccessToken =()=>{
    return localStorage.getItem("googleAccessToken");
}

const isAuthenticated = () => {
  return !!getAuthToken();
};

// Custom CSS for iPhone-like animations
const iphoneStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceFeedback {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out;
}

.animate-slide-in-from-right {
  animation: slideInFromRight 0.4s ease-out;
}

.animate-bounce-feedback {
  animation: bounceFeedback 0.2s ease-in-out;
}

.ease-ios {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-effect {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.iphone-scroll {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bounce-feedback:active {
  transform: scale(0.95);
}

.message-enter {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.message-enter-active {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-complete {
  transform: scale(1.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Optimize for large screens */
@media (min-width: 1536px) {
  .xl-optimized-layout {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .xl-optimized-panel {
    flex: 0 0 45% !important;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .mobile-compact {
    padding: 0.5rem !important;
  }
  
  .mobile-tight {
    gap: 0.5rem !important;
  }
  
  .mobile-text-sm {
    font-size: 0.8125rem !important;
  }
}

/* Fix for mobile keyboard not closing chat panel */
.keyboard-open {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh !important;
  width: 100% !important;
  z-index: 50;
  transform: translateX(0) !important;
}

/* Prevent body scroll when keyboard is open */
body.keyboard-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}
`;

// PDF Download Loader Component
const PDFDownloadLoader: React.FC<{
  isVisible: boolean;
  currentStep: number;
  steps: { text: string; status: 'pending' | 'processing' | 'completed' | 'error' }[];
  onCancel: () => void;
}> = ({ isVisible, currentStep, steps, onCancel }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsMounted(true);
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isMounted && !isVisible) return null;

  return (
    <div className={`
      fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4
      transition-all duration-500 ease-ios
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `}>
      <div className={`
        bg-zinc-900/90 glass-effect border border-zinc-700/50 rounded-3xl p-6 max-w-md w-full mx-auto
        transition-all duration-500 ease-ios
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Preparing PDF</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white smooth-transition bounce-feedback"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 mb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`
                flex items-center space-x-3 p-3 rounded-2xl border transition-all duration-500 ease-ios
                ${index === currentStep
                  ? "bg-blue-500/10 border-blue-500/30 scale-105"
                  : index < currentStep
                  ? "bg-green-500/10 border-green-500/30 step-complete"
                  : "bg-zinc-800/50 border-zinc-700/50 opacity-60"
                }
              `}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0 transition-all duration-500 ease-ios">
                {step.status === 'completed' ? (
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center scale-100 animate-scale-in">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                ) : step.status === 'error' ? (
                  <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center scale-100 animate-scale-in">
                    <X className="h-2.5 w-2.5 text-white" />
                  </div>
                ) : step.status === 'processing' ? (
                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center scale-110 animate-pulse">
                    <Loader2 className="h-2.5 w-2.5 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-zinc-600 flex items-center justify-center transition-all duration-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  </div>
                )}
              </div>

              {/* Step Text */}
              <div className="flex-1 min-w-0">
                <p className={`
                  text-sm font-medium transition-all duration-300 mobile-text-sm
                  ${index === currentStep
                    ? "text-white"
                    : index < currentStep
                    ? "text-green-400"
                    : "text-zinc-400"
                  }
                `}>
                  {step.text}
                </p>
                {index === currentStep && step.status === 'processing' && (
                  <p className="text-xs text-zinc-400 mt-1 animate-pulse">Processing...</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-zinc-400 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Cancel Button */}
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full h-9 rounded-xl border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white smooth-transition bounce-feedback text-sm"
        >
          Cancel Download
        </Button>
      </div>
    </div>
  );
};

// Multi-step loader component
const MultiStepLoader: React.FC<{ 
  steps: { 
    text: string, 
    icon?: React.ReactNode,
    thumbnail?: string,
    title?: string
  }[], 
  currentStep: number 
}> = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-start mb-3 animate-fade-in-up">
      <Avatar className="mr-2 h-6 w-6 flex-shrink-0 scale-100 animate-scale-in">
        <AvatarImage src="/ai-avatar.png" />
        <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed bg-zinc-900/80 glass-effect border border-zinc-800 text-zinc-200 animate-slide-in-right">
        <div className="space-y-1.5">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`
                flex items-center transition-all duration-500 ease-ios
                ${index < currentStep 
                  ? "text-green-400 transform -translate-x-0.5" 
                  : index === currentStep 
                    ? "text-white animate-pulse scale-105" 
                    : "text-zinc-500 opacity-70"
                }
              `}
            >
              <div className="w-4 h-4 mr-2 flex items-center justify-center flex-shrink-0 transition-all duration-300">
                {index < currentStep ? (
                  <div className="scale-100 animate-scale-in">
                    <Check className="w-3 h-3" />
                  </div>
                ) : index === currentStep ? (
                  <div className="animate-spin">
                    <Loader2 className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-current transition-all duration-300" />
                )}
              </div>
              <span className="text-xs break-words flex-1 mobile-text-sm">{step.text}</span>
              
              {step.thumbnail && index === currentStep && (
                <div className="ml-2 flex-shrink-0 scale-100 animate-scale-in">
                  <Image 
                    src={step.thumbnail} 
                    alt="Video thumbnail" 
                    width={40} 
                    height={26}
                    className="w-10 h-6 rounded-lg object-cover border border-zinc-700" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced PDF Preview Component
const PDFPreview: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="w-full h-full max-h-full border border-zinc-800 shadow-2xl overflow-hidden rounded-lg bg-white mx-auto animate-scale-in">
      <div 
        className="p-3 sm:p-4 md:p-6 bg-white text-black h-full overflow-auto iphone-scroll"
        style={{ 
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: 'clamp(8px, 1.2vw, 11px)',
          lineHeight: '1.4',
          color: '#000000',
          height: '100%'
        }}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className="pdf-content smooth-transition"
          style={{
            maxWidth: '210mm',
            margin: '0 auto'
          }}
        />
      </div>
    </div>
  );
};

// Format date for display
const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

// Format time for display
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Responsive Header Component
const ResponsiveHeader: React.FC<{ 
  title: string; 
  onMenuClick?: () => void;
  showChatMobile: boolean;
  onToggleChat: () => void;
}> = ({ title, onMenuClick, showChatMobile, onToggleChat }) => {
  const router = useRouter(); // Add useRouter hook

  const handleHomeClick = () => {
    router.push('/'); // Use router.push instead of redirect for client-side navigation
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-zinc-900 bg-zinc-950/80 glass-effect lg:hidden sticky top-0 z-40 animate-fade-in-up safe-area-inset-top">
      <div className="flex items-center gap-2 flex-1 min-w-0 mobile-tight">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHomeClick}
            className="h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 flex-shrink-0 smooth-transition bounce-feedback"
          >
            {/* Home icon */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate text-white animate-fade-in-up mobile-text-sm">{title}</h1>
        </div>
      </div>
      
      <Button 
        size="sm"
        variant={showChatMobile ? "secondary" : "default"}
        className="bg-red-600 hover:bg-red-700 text-white h-8 px-3 rounded-xl text-xs flex-shrink-0 ml-2 smooth-transition bounce-feedback"
        onClick={onToggleChat}
      >
        {showChatMobile ? "Close" : "Ask AI"}
      </Button>
    </div>
  );
};

// Locked Chat Section Component
const LockedChatSection: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  return (
    <div className="fixed lg:static top-0 right-0 h-[100dvh] w-full lg:w-auto bg-zinc-950/80 glass-effect flex flex-col border-l border-zinc-900 z-50 animate-slide-in-from-right safe-area-inset-bottom">
      {/* Chat Header */}
      <div className="p-3 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80 glass-effect safe-area-inset-top">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate text-white animate-fade-in-up">Note Preview</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-200 text-xs animate-scale-in">
              Locked
            </Badge>
          </div>
        </div>
      </div>

      {/* Locked Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-zinc-900/80 glass-effect border border-zinc-800 rounded-2xl p-6 max-w-md w-full animate-scale-in">
          <div className="flex justify-center mb-3 animate-bounce">
            <div className="bg-red-600/20 p-3 rounded-full">
              <Lock className="h-6 w-6 text-red-500" />
            </div>
          </div>
          
          <h2 className="text-lg font-bold text-white mb-2 animate-fade-in-up">Access Restricted</h2>
          <p className="text-zinc-400 text-sm mb-4 animate-fade-in-up mobile-text-sm">
            You don&apos;t have permission to access this note. Please login with the correct account.
          </p>
          
          <Button 
            onClick={onLoginClick}
            className="bg-red-600 hover:bg-red-700 text-white w-full h-9 rounded-xl text-sm smooth-transition bounce-feedback animate-fade-in-up"
          >
            Login to Access
          </Button>
          
          <p className="text-xs text-zinc-500 mt-3 animate-fade-in-up">
            This note belongs to another user. You need proper authorization to interact with it.
          </p>
        </div>
      </div>
    </div>
  );
};

// Note Not Found Component
const NoteNotFound: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 safe-area-inset-bottom">
      <div className="bg-zinc-900/80 glass-effect border border-zinc-800 rounded-2xl p-6 max-w-md w-full text-center animate-scale-in">
        <div className="flex justify-center mb-3 animate-bounce">
          <div className="bg-red-600/20 p-3 rounded-full">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-lg font-bold text-white mb-2 animate-fade-in-up">Note Not Found</h2>
        <p className="text-zinc-400 text-sm mb-4 animate-fade-in-up">
          The note you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        
        <Button 
          onClick={onGoHome}
          className="bg-red-600 hover:bg-red-700 text-white w-full h-9 rounded-xl text-sm smooth-transition bounce-feedback animate-fade-in-up"
        >
          Go Back Home
        </Button>
        
        <p className="text-xs text-zinc-500 mt-3 animate-fade-in-up">
          Check the URL or contact the note owner if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

// Define API response types
interface ApiMessage {
  _id: string;
  role: string;
  content: string;
  timestamp: string;
  videoLink?: string;
  feedback?: "good" | "bad" | null;
}

interface ApiMessagesResponse {
  messages: ApiMessage[];
}

interface UserData {
  name?: string;
  email?: string;
  picture?: string;
}

interface NoteData {
  _id: string;
  title: string;
  content: string;
  thumbnail?: string;
}

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

  const handleHomeClick = () => {
    router.push('/'); // Use router.push instead of redirect for client-side navigation
  };

  const [messages, setMessages] = useState<{ 
    id: string; 
    role: "user" | "assistant"; 
    content: string; 
    timestamp: Date;
    videoLink?: string;
    feedback?: "good" | "bad" | null; 
  }[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [manualChatState, setManualChatState] = useState(false); // NEW: Track manual state

  // PDF Download Loader States
  const [showPDFLoader, setShowPDFLoader] = useState(false);
  const [pdfDownloadStep, setPdfDownloadStep] = useState(0);
  const [pdfDownloadSteps, setPdfDownloadSteps] = useState<
    { text: string; status: 'pending' | 'processing' | 'completed' | 'error' }[]
  >([]);

  // Add custom styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = iphoneStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // SIMPLIFIED device detection - only check initial screen size
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 900);
      
      // Only set initial state, don't auto-toggle based on resize
      if (width >= 1024 && !manualChatState) {
        setShowChatMobile(true);
      }
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);
    
    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, [manualChatState]);

  // NEW: Handle manual chat toggle
  const handleToggleChat = () => {
    const newState = !showChatMobile;
    setShowChatMobile(newState);
    setManualChatState(newState); // Remember this was manually toggled
  };

  // NEW: Enhanced input focus handler
  const handleInputFocus = () => {
    if (isMobile) {
      setKeyboardOpen(true);
      // Always show chat when input is focused on mobile
      setShowChatMobile(true);
      // Add class to body to prevent scrolling
      document.body.classList.add('keyboard-open');
    }
  };

  // NEW: Enhanced input blur handler
  const handleInputBlur = () => {
    setTimeout(() => {
      setKeyboardOpen(false);
      document.body.classList.remove('keyboard-open');
    }, 100);
  };

  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const tinyMceRef = useRef<{ 
    undoManager: { undo: () => void; redo: () => void };
    execCommand: (command: string, ui?: boolean, value?: unknown) => void;
  } | null>(null);

  // Initialize PDF download steps
  const initializePDFSteps = () => [
    { text: "Connecting to server...", status: 'pending' as const },
    { text: "Checking PDF status...", status: 'pending' as const },
    { text: "Generating PDF document...", status: 'pending' as const },
    { text: "Waiting for file processing...", status: 'pending' as const },
    { text: "Preparing download...", status: 'pending' as const },
  ];

  // Enhanced PDF download function with retry logic
  const downloadAsPDF = useCallback(async () => {
    if (!hasPermission) {
      setShowLoginDialog(true);
      return;
    }

    if (!data?._id) {
      alert("Note data not available");
      return;
    }

    // Initialize loader
    const steps = initializePDFSteps();
    setPdfDownloadSteps(steps);
    setPdfDownloadStep(0);
    setShowPDFLoader(true);

    let currentStepIndex = 0;

    const updateStep = (index: number, status: 'processing' | 'completed' | 'error') => {
      setPdfDownloadSteps(prev => prev.map((step, i) => 
        i === index ? { ...step, status } : step
      ));
      setPdfDownloadStep(index);
    };

    const waitForPDFReady = async (noteId: string, maxRetries = 8, delay = 1500): Promise<unknown> => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await api.get(`/notes/genrate/pdf?noteId=${noteId}`, {
            headers: {
              'Auth': getAuthToken(),
              'x-google-access-token':googleAccessToken()
            }
          });

          // If PDF is already generated, return immediately
          if (response.data.message === "PDF already generated") {
            return response.data;
          }

          // If PDF was just generated, wait and check again
          if (response.data.message === "PDF generated and uploaded successfully") {
            if (attempt === maxRetries - 1) {
              // Last attempt, return what we have
              return response.data;
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          return response.data;
        } catch (error) {
          if (attempt === maxRetries - 1) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      throw new Error("PDF generation timeout");
    };

    try {
      // Step 1: Connecting to server
      updateStep(currentStepIndex++, 'processing');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStep(currentStepIndex - 1, 'completed');

      // Step 2: Checking PDF status
      updateStep(currentStepIndex++, 'processing');
      const response = await waitForPDFReady(data._id);
      updateStep(currentStepIndex - 1, 'completed');

      // Step 3: Generating PDF (if needed)
      updateStep(currentStepIndex++, 'processing');
      await new Promise(resolve => setTimeout(resolve, 600));
      updateStep(currentStepIndex - 1, 'completed');

      // Step 4: File processing
      updateStep(currentStepIndex++, 'processing');
      await new Promise(resolve => setTimeout(resolve, 400));
      updateStep(currentStepIndex - 1, 'completed');

      // Step 5: Prepare download
      updateStep(currentStepIndex++, 'processing');
      
      const pdfResponse = response as { 
        data?: { 
          pdfUrl?: string; 
          downloadUrl?: string;
          noteTitle?: string;
          fileSize?: number;
        }; 
        pdfUrl?: string;
        downloadUrl?: string;
        noteTitle?: string;
        fileSize?: number;
      };
      
      const pdfUrl = pdfResponse.data?.pdfUrl || pdfResponse.data?.downloadUrl || pdfResponse.pdfUrl || pdfResponse.downloadUrl;
      const noteTitle = pdfResponse.data?.noteTitle || pdfResponse.noteTitle || 'document';
      const fileSize = pdfResponse.data?.fileSize || pdfResponse.fileSize;
      
      if (!pdfUrl) {
        throw new Error("PDF URL not found in response");
      }

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${noteTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      updateStep(currentStepIndex - 1, 'completed');

      // Show success with file size
      setTimeout(() => {
        setShowPDFLoader(false);
        
        // Optional: Show success toast with file info
        if (fileSize) {
          console.log(`PDF downloaded successfully! File size: ${formatFileSize(fileSize)}`);
        }
      }, 800);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Mark current step as error
      if (currentStepIndex > 0) {
        updateStep(currentStepIndex - 1, 'error');
      }
      
      // Show error message
      setTimeout(() => {
        setShowPDFLoader(false);
        alert(`Failed to generate PDF: ${errorMessage}`);
      }, 1500);
    }
  }, [hasPermission, data?._id]);

  // Handle PDF download cancellation
  const handlePDFDownloadCancel = () => {
    setShowPDFLoader(false);
    setPdfDownloadStep(0);
    setPdfDownloadSteps([]);
  };

  // Handle login success
  const handleLoginSuccess = (userData: UserData, token: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowLoginDialog(false);
    setAuthError(null);
    // Reload the note data after successful login
    loadNoteData();
  };

  // Handle login dialog close without login
  const handleLoginClose = () => {
    setShowLoginDialog(false);
    // If user closes login dialog without logging in and doesn't have permission, redirect to home
    if (!hasPermission && !isAuthenticated()) {
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  };

  // Handle go home
  const handleGoHome = () => {
    router.push('/');
  };

  // Load note data and initialize messages
  const loadNoteData = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(null);
      setNoteNotFound(false);
      const authToken = getAuthToken();
      
      const res = await api.get(`/notes/slug/${slug}`, {
        headers: {
          'Auth': authToken
        }
      });
      
      setData(res.data);
      setMarkdownContent(res.data.content);
      setError(null);
      setHasPermission(true);

      // Load initial messages after note data is loaded
      try {
        const messagesRes = await api.get<ApiMessagesResponse>(`/chat/getMessages/${res.data._id}`, {
          headers: {
            'Auth': authToken
          }
        });
        const formattedMessages = messagesRes.data.messages.map(msg => ({
          id: msg._id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          videoLink: msg.videoLink,
          feedback: msg.feedback
        }));
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Failed to load initial messages:", err);
        // Set default message if no messages are available
        setMessages([{ 
          id: "default", 
          role: "assistant", 
          content: "Hello! Ask me about this guide.", 
          timestamp: new Date(Date.now() - 300000)
        }]);
      }
    } catch (error: unknown) {
      // Type guard to check if it's an Axios error
      const isAxiosError = (err: unknown): err is { response?: { status: number; data?: { message: string } } } => {
        return typeof err === 'object' && err !== null && 'response' in err;
      };
    
      if (isAxiosError(error)) {
        if (error.response?.status === 404 || 
            (error.response?.data?.message && error.response.data.message.includes("Note not found"))) {
          setNoteNotFound(true);
          setHasPermission(false);
        } else if (error.response?.status === 403 || 
            (error.response?.data?.message && error.response.data.message.includes("Access denied"))) {
          setAuthError("You don&apos;t have permission to access this note. Please login with the correct account.");
          setHasPermission(false);
          setShowLoginDialog(true);
        } else if (error.response?.status === 401) {
          setAuthError("Please login to access this note.");
          setHasPermission(false);
          setShowLoginDialog(true);
        } else {
          setError("Failed to load content. Please try again later.");
          setHasPermission(false);
        }
      } else {
        // Handle non-Axios errors
        setError("An unexpected error occurred. Please try again later.");
        setHasPermission(false);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadNoteData();
  }, [loadNoteData]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const [aiTypingContent, setAiTypingContent] = useState<string>("");
  const [aiTypingDuration, setAiTypingDuration] = useState<number | null>(null);

  const handleFeedback = useCallback(async (noteId: string, messageId: string, feedback: "good" | "bad") => {
    try {
      if (!isAuthenticated() || !hasPermission) {
        setShowLoginDialog(true);
        return;
      }

      // Update local state immediately for better UX
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              feedback: msg.feedback === feedback ? null : feedback 
            }
          : msg
      ));
      
      await api.post(`/chat/feedback`, { noteId, messageId, feedback }, {
        headers: {
          'Auth': getAuthToken()
        }
      });
      
      // Optional: Show subtle feedback instead of alert
      console.log(`Feedback ${feedback} submitted for message ${messageId}`);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Revert on error
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback: null }
          : msg
      ));
      alert("Failed to submit feedback. Please try again.");
    }
  }, [hasPermission]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isThinking || !hasPermission) return;

      // Check authentication before sending message
      if (!isAuthenticated()) {
        setShowLoginDialog(true);
        return;
      }

      const newMsg = { 
        id: Date.now().toString(), 
        role: "user" as const, 
        content: input, 
        timestamp: new Date() 
      };
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
      setIsThinking(true);
      setAiTypingContent("");
      setAiTypingDuration(null);

      // Define steps for the loader
      const loaderSteps = [
        { text: "Analyzing your question..." },
        { text: "Gathering information from PDF..." },
        { text: "Analyzing YouTube video...", thumbnail: data?.thumbnail, title: data?.title },
        { text: "Thinking..." },
        { text: "Formulating response..." }
      ];

      try {
        // Simulate the multi-step process while making API call
        for (let i = 0; i < loaderSteps.length; i++) {
          setCurrentStep(i);
          await new Promise(resolve => setTimeout(resolve, i === 2 ? 1500 : 1000));
        }

        // Make API call to get AI response
        const response = await api.post(`/chat/message`, {
          noteId: data?._id,
          message: input,
        }, {
          headers: {
            'Auth': getAuthToken()
          }
        });

        setIsThinking(false);
        setCurrentStep(0);

        // Typing effect for AI response
        const fullText = response.data.assistantMessage || "Sorry, I couldn&apos;t process your request.";
        const videoLink = response.data.videoLink || null;
        let shownText = "";
        let idx = 0;
        const typingStart = Date.now();

        const charsPerFrame = isMobile ? 2 : 4;

        function typeChar() {
          shownText += fullText.slice(idx, idx + charsPerFrame);
          idx += charsPerFrame;
          setAiTypingContent(shownText);

          if (idx < fullText.length) {
            requestAnimationFrame(typeChar);
          } else {
            const duration = Math.min(Math.round((Date.now() - typingStart) / 1000), 5);
            setAiTypingDuration(duration);
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant" as const,
                content: fullText,
                timestamp: new Date(),
                videoLink: videoLink,
              },
            ]);
            setAiTypingContent("");
          }
        }

        requestAnimationFrame(typeChar);

      } catch (error: unknown) {
        setIsThinking(false);
        setCurrentStep(0);
        setAiTypingContent("");
        setAiTypingDuration(null);
        
        // Type guard for Axios-like error structure
        const isAxiosError = (err: unknown): err is { response?: { status: number } } => {
          return typeof err === 'object' && err !== null && 'response' in err;
        };
      
        if (isAxiosError(error)) {
          if (error.response?.status === 403 || error.response?.status === 401) {
            setAuthError("Authentication failed. Please login again.");
            setHasPermission(false);
            setShowLoginDialog(true);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant" as const,
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                timestamp: new Date()
              },
            ]);
          }
        } else {
          // Handle non-Axios errors
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant" as const,
              content: "Sorry, I encountered an error while processing your request. Please try again.",
              timestamp: new Date()
            },
          ]);
        }
      }
    },
    [input, isThinking, data, hasPermission, isMobile]
  );

  const handleSave = useCallback(async () => {
    if (!data?._id || !hasPermission) return;
    
    if (!isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    try {
      const res = await api.put(`/notes/update/${data._id}`, { content: markdownContent }, {
        headers: {
          'Auth': getAuthToken()
        }
      });
      setData(res.data);
      setIsDirty(false);
    } catch (error: unknown) {
      // Type guard for Axios-like error structure
      const isAxiosError = (err: unknown): err is { response?: { status: number } } => {
        return typeof err === 'object' && err !== null && 'response' in err;
      };
    
      if (isAxiosError(error)) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          setAuthError("Authentication failed. Please login again.");
          setHasPermission(false);
          setShowLoginDialog(true);
        } else {
          alert("Failed to save changes.");
        }
      } else {
        // Handle non-Axios errors
        alert("Failed to save changes due to an unexpected error.");
      }
    }
  }, [data, markdownContent, hasPermission]);

  // Group messages by date
  const groupedMessages = () => {
    const groups: { date: string; messages: typeof messages }[] = [];
    
    messages.forEach((message) => {
      const dateStr = formatDate(message.timestamp);
      
      if (groups.length === 0 || groups[groups.length - 1].date !== dateStr) {
        groups.push({ date: dateStr, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    
    return groups;
  };

  // Show Note Not Found component if note doesn't exist
  if (noteNotFound) {
    return <NoteNotFound onGoHome={handleGoHome} />;
  }

  if (loading)
    return <LoaderX/>;

  if (error && !authError)
    return <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 text-center safe-area-inset-bottom">{error || "No data found."}</div>;

  return (
    <>
      <LoginDialog 
        isOpen={showLoginDialog} 
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />

      {/* PDF Download Loader Overlay */}
      <PDFDownloadLoader
        isVisible={showPDFLoader}
        currentStep={pdfDownloadStep}
        steps={pdfDownloadSteps}
        onCancel={handlePDFDownloadCancel}
      />
      
      {authError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg z-500 max-w-xs text-center text-xs animate-fade-in-up">
          {authError}
        </div>
      )}

      <div className="bg-black text-white h-screen w-screen overflow-hidden safe-area-inset-bottom">
        {/* Mobile Header */}
        <ResponsiveHeader 
          title={data?.title || "Note"} 
          showChatMobile={showChatMobile}
          onToggleChat={handleToggleChat} // Use new handler
        />

        <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)] lg:h-screen w-full overflow-hidden xl-optimized-layout">
          {/* Left: PDF + Editor */}
          <div className={`flex-1 lg:flex-[0_0_45%] xl-optimized-panel p-3 h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-900 flex flex-col items-center ${
            isMobile && showChatMobile ? 'hidden lg:flex' : 'flex'
          }`}>
            <Tabs defaultValue="preview" className="w-full h-full max-h-full flex flex-col animate-fade-in">
              <TabsList className="mb-2 grid w-full grid-cols-2 bg-zinc-900/50 h-8 rounded-lg flex-shrink-0">
                <TabsTrigger value="preview" className="text-xs px-3 py-1 flex items-center gap-1 rounded-lg smooth-transition mobile-text-sm">
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="text-xs px-3 py-1 flex items-center gap-1 rounded-lg smooth-transition mobile-text-sm">
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </TabsTrigger>
              </TabsList>

              {/* PDF Preview */}
              <TabsContent value="preview" className="mt-0 flex-1 flex flex-col min-h-0">
                <div className="lg:w-[80%] lg:ml-20 flex-1 flex items-center justify-center min-h-0 h-full">
                  <PDFPreview content={markdownContent} />
                </div>
              </TabsContent>

              {/* Editor */}
              <TabsContent value="editor" className="mt-0 flex-1 flex flex-col min-h-0 h-full">
                <div className="h-full border border-zinc-800 shadow-lg overflow-hidden flex flex-col rounded-lg bg-white flex-1 animate-scale-in">
                  {/* Enhanced Toolbar */}
                  <div className="p-1.5 flex flex-wrap gap-1 bg-zinc-950/80 glass-effect border-b border-zinc-800 rounded-t-lg flex-shrink-0 mobile-tight">
                    {/* File Operations */}
                    <div className="flex gap-1 border-r border-zinc-700 pr-2 mr-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-md hover:bg-zinc-800/50 smooth-transition bounce-feedback"
                        onClick={() => tinyMceRef.current?.undoManager.undo()}
                        disabled={!hasPermission}
                      >
                        <Undo className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-md hover:bg-zinc-800/50 smooth-transition bounce-feedback"
                        onClick={() => tinyMceRef.current?.undoManager.redo()}
                        disabled={!hasPermission}
                      >
                        <Redo className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Text Formatting */}
                    <div className="flex gap-1 border-r border-zinc-700 pr-2 mr-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-md hover:bg-zinc-800/50 smooth-transition bounce-feedback"
                        onClick={() => tinyMceRef.current?.execCommand('Bold')}
                        disabled={!hasPermission}
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-md hover:bg-zinc-800/50 smooth-transition bounce-feedback"
                        onClick={() => tinyMceRef.current?.execCommand('Italic')}
                        disabled={!hasPermission}
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Headings and Lists */}
                    <div className="flex gap-1 border-r border-zinc-700 pr-2 mr-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs rounded-md hover:bg-zinc-800/50 smooth-transition bounce-feedback"
                        onClick={() => tinyMceRef.current?.execCommand('FormatBlock', false, 'h1')}
                        disabled={!hasPermission}
                      >
                        H1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs rounded-md hover:bg-zinc-800/50 smooth-transition bounce-feedback"
                        onClick={() => tinyMceRef.current?.execCommand('FormatBlock', false, 'h2')}
                        disabled={!hasPermission}
                      >
                        H2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-md hover:bg-zinc-800/50 smooth-transition bounce-feedback"
                        onClick={() => tinyMceRef.current?.execCommand('InsertUnorderedList')}
                        disabled={!hasPermission}
                      >
                        <ListIcon className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Save Button */}
                    {isDirty && (
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white ml-auto h-7 px-3 rounded-md text-xs smooth-transition bounce-feedback" 
                        onClick={handleSave}
                        disabled={!hasPermission}
                      >
                        <Save className="mr-1 h-3 w-3" /> 
                        {hasPermission ? "Save" : "Login to Save"}
                      </Button>
                    )}
                  </div>

                  {/* TinyMCE Editor */}
                  <div className="flex-1 min-h-0 h-full">
                    <Editor
                      apiKey="xuwnpn5va0cwbivoch3ovgc44gtceufhg07937jqqu6dnl25"
                      onInit={(_, editor) => (tinyMceRef.current = editor)}
                      value={markdownContent}
                      init={{
                        height: '100%',
                        min_height: 300,
                        menubar: false,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: false,
                        content_style: `
                          body { 
                            font-family: 'Times New Roman', serif;
                            font-size: 11px;
                            line-height: 1.4;
                            color: #000;
                            margin: 12px;
                          }
                          h1 { font-size: 16px; margin: 20px 0 10px 0; }
                          h2 { font-size: 14px; margin: 16px 0 8px 0; }
                          h3 { font-size: 12px; margin: 12px 0 6px 0; }
                          p { margin: 6px 0; }
                        `,
                        branding: false,
                        statusbar: false,
                        paste_data_images: true,
                        images_upload_url: '/api/upload',
                        automatic_uploads: true
                      }}
                      onEditorChange={(content) => {
                        if (hasPermission) {
                          setMarkdownContent(content);
                          setIsDirty(true);
                        }
                      }}
                      disabled={!hasPermission}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Chat or Locked Section - SIMPLIFIED LOGIC */}
          {hasPermission ? (
            <div
              className={`flex-1 lg:flex-[0_0_55%] xl-optimized-panel fixed lg:static top-0 right-0 h-[100dvh] w-full lg:w-auto bg-zinc-950/80 glass-effect flex flex-col border-l border-zinc-900 transition-all duration-500 ease-ios z-50 ${
                // SIMPLIFIED: Only check showChatMobile state
                isMobile ? (showChatMobile ? "translate-x-0" : "translate-x-full") : "translate-x-0"
              } ${isMobile && !showChatMobile ? 'hidden lg:flex' : 'flex'}`}
            >
              {/* Chat Header */}
              <div className="p-3 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80 glass-effect flex-shrink-0 animate-fade-in-up safe-area-inset-top">
               <Button
            variant="ghost"
            size="icon"
            onClick={handleHomeClick}
            className="h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 flex-shrink-0 smooth-transition bounce-feedback"
          >
            {/* Home icon */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold truncate text-white mobile-text-sm">{data?.title}</h1>
                </div>
                
                <div className="flex items-center gap-2 ml-3 mobile-tight">
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white border-none h-8 px-3 rounded-xl text-xs smooth-transition bounce-feedback"
                    onClick={downloadAsPDF}
                    disabled={showPDFLoader}
                  >
                    <Download className="mr-1 h-3 w-3" /> 
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                  
                  {isMobile && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-3 rounded-xl text-xs smooth-transition bounce-feedback"
                      onClick={handleToggleChat}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages container with fixed height and scroll */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <ScrollArea className="flex-1 h-full iphone-scroll">
                  <div className="p-3 space-y-4 mobile-compact">
                    {groupedMessages().map((group, groupIndex) => (
                      <div key={groupIndex} className="animate-fade-in-up lg:w-full">
                        {/* Date separator */}
                        <div className="flex justify-center my-3">
                          <div className="text-xs text-zinc-500 bg-zinc-900/50 glass-effect px-3 py-1 rounded-full animate-scale-in mobile-text-sm">
                            {group.date}
                          </div>
                        </div>
                        
                        {/* Messages for this date */}
                        {group.messages.map((m, messageIndex) => (
                          <div 
                            key={m.id} 
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-3 message-enter-active`}
                            style={{ 
                              animationDelay: `${messageIndex * 80}ms`,
                              transitionDelay: `${messageIndex * 40}ms`
                            }}
                          >
                            {m.role === "assistant" && (
                              <Avatar className="mr-2 h-6 w-6 flex-shrink-0 animate-scale-in">
                                <AvatarImage src="/ai-avatar.png" />
                                <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex flex-col max-w-[80%]">
                              <div
                                className={`
                                  rounded-xl px-3 py-2 text-sm leading-relaxed break-words smooth-transition mobile-text-sm
                                  ${m.role === "user" 
                                    ? "bg-red-600 text-white animate-slide-in-right" 
                                    : "bg-zinc-900/80 glass-effect border border-zinc-800 text-zinc-200 animate-slide-in-right"
                                  }
                                `}
                              >
                                <div className="prose prose-invert prose-sm max-w-none">
                                  <ReactMarkdown>
                                    {m.content}
                                  </ReactMarkdown>
                                </div>
                                
                                {/* YouTube Video Link */}
                                {m.role === "assistant" && m.videoLink && (
                                  <div className="mt-2 p-2 bg-zinc-800/50 rounded-lg border border-zinc-700 animate-fade-in-up">
                                    <a 
                                      href={m.videoLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-all duration-300 group mobile-tight"
                                    >
                                      <div className="flex-shrink-0">
                                        <svg 
                                          className="w-4 h-4 group-hover:scale-110 transition-transform" 
                                          viewBox="0 0 24 24" 
                                          fill="currentColor"
                                        >
                                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium mobile-text-sm">Watch video for more</p>
                                        <p className="text-xs text-zinc-400 truncate mobile-text-sm">
                                          {m.videoLink.includes('youtube.com') || m.videoLink.includes('youtu.be') ? 'YouTube Video' : 'External Video'}
                                        </p>
                                      </div>
                                      <div className="flex-shrink-0">
                                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </div>
                                    </a>
                                  </div>
                                )}
                                
                                {/* Feedback Buttons */}
                                {m.role === "assistant" && (
                                  <div className="flex justify-end gap-1 mt-2 flex-wrap animate-fade-in-up mobile-tight">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 h-6 px-2 text-xs rounded-md smooth-transition bounce-feedback"
                                      onClick={async () => {
                                        await navigator.clipboard.writeText(m.content);
                                        setCopiedMessageId(m.id);
                                        setTimeout(() => setCopiedMessageId(null), 3000);
                                      }}
                                    >
                                      {copiedMessageId === m.id ? (
                                        <span className="flex items-center text-green-500 animate-scale-in text-xs">
                                          <Check className="h-2.5 w-2.5 mr-0.5" /> Copied
                                        </span>
                                      ) : (
                                        <> <FileDown className="h-2.5 w-2.5 mr-0.5" /> Copy </> 
                                      )}
                                    </Button>
                                    
                                    {/* Like Button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`w-6 h-6 rounded-md transition-all duration-300 ease-ios ${
                                        m.feedback === "good" 
                                          ? "text-green-500 bg-green-500/20 hover:bg-green-500/30 animate-bounce-feedback" 
                                          : "text-zinc-400 hover:text-green-500 hover:bg-zinc-800/50 bounce-feedback"
                                      }`}
                                      onClick={() => data?._id && handleFeedback(data._id, m.id, "good")}
                                    >
                                      <ThumbsUp className="h-2.5 w-2.5" />
                                    </Button>
                                    
                                    {/* Dislike Button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`w-6 h-6 rounded-md transition-all duration-300 ease-ios ${
                                        m.feedback === "bad" 
                                          ? "text-red-500 bg-red-500/20 hover:bg-red-500/30 animate-bounce-feedback" 
                                          : "text-zinc-400 hover:text-red-500 hover:bg-zinc-800/50 bounce-feedback"
                                      }`}
                                      onClick={() => data?._id && handleFeedback(data._id, m.id, "bad")}
                                    >
                                      <ThumbsDown className="h-2.5 w-2.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className={`text-xs text-zinc-500 mt-1 ${m.role === "user" ? "text-right" : "text-left"} animate-fade-in-up mobile-text-sm`}>
                                {formatTime(m.timestamp)}
                              </div>
                            </div>
                            {m.role === "user" && (
                              <Avatar className="ml-2 h-6 w-6 flex-shrink-0 animate-scale-in">
                                <AvatarImage src="/user-avatar.png" />
                                <AvatarFallback className="bg-zinc-700 text-white text-xs">U</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {/* Multi-step loader when thinking */}
                    {isThinking && (
                      <MultiStepLoader 
                        steps={[
                          { text: "Analyzing your question..." },
                          { text: "Gathering information from PDF..." },
                          { text: "Analyzing YouTube video...", thumbnail: data?.thumbnail, title: data?.title },
                          { text: "Thinking..." },
                          { text: "Formulating response..." }
                        ]} 
                        currentStep={currentStep} 
                      />
                    )}
                    
                    {/* AI Typing Indicator */}
                    {aiTypingContent && (
                      <div className="flex justify-start mb-3 animate-fade-in-up">
                        <Avatar className="mr-2 h-6 w-6 flex-shrink-0">
                          <AvatarImage src="/ai-avatar.png" />
                          <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col max-w-[80%]">
                          <div className="rounded-xl px-3 py-2 text-sm leading-relaxed bg-zinc-900/80 glass-effect border border-zinc-800 text-zinc-200 break-words animate-slide-in-right">
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown>
                                {aiTypingContent}
                              </ReactMarkdown>
                            </div>
                            {aiTypingDuration && (
                              <span className="ml-1 text-xs text-green-400 animate-fade-in-up mobile-text-sm">Generated in {aiTypingDuration} sec</span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1 text-left animate-fade-in-up mobile-text-sm">
                            {formatTime(new Date())}
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="border-t border-zinc-900 p-3 bg-zinc-950/80 glass-effect flex-shrink-0 safe-area-inset-bottom animate-fade-in-up">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                  <div className="flex gap-2 mobile-tight">
                    <Input
                      placeholder="Ask something about this content..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-red-500 text-sm h-9 rounded-lg flex-1 smooth-transition mobile-text-sm"
                      disabled={isThinking}
                    />
                    <Button 
                      type="submit" 
                      className="bg-red-600 hover:bg-red-700 text-white h-9 w-9 rounded-lg flex-shrink-0 smooth-transition bounce-feedback" 
                      disabled={isThinking || !input.trim()}
                    >
                      {isThinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 mobile-text-sm">
                    <span>{input.length} characters</span>
                    <span className="text-zinc-600">Press Enter to send</span>
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