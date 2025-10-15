"use client"; 
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Editor } from "@tinymce/tinymce-react";
import TurndownService from "turndown";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Download,
  FileDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  List as ListIcon,
  ListOrdered,
  Image as ImageIcon,
  Code as CodeIcon,
  Table as TableIcon,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Link,
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
import { LoaderThreeDemo } from "@/components/LoaderThreeDemo";
import { LoginDialog } from "@/components/LoginDialog";
import { useRouter } from "next/navigation";

// PDF Download Loader Component
const PDFDownloadLoader: React.FC<{
  isVisible: boolean;
  currentStep: number;
  steps: { text: string; status: 'pending' | 'processing' | 'completed' | 'error' }[];
  onCancel: () => void;
}> = ({ isVisible, currentStep, steps, onCancel }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white">Preparing PDF Download</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-7 w-7 sm:h-8 sm:w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                index === currentStep
                  ? "bg-zinc-800 border border-zinc-700"
                  : index < currentStep
                  ? "bg-green-900/20 border border-green-800/30"
                  : "bg-zinc-800/50 border border-zinc-700/50"
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                  </div>
                ) : step.status === 'error' ? (
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                  </div>
                ) : step.status === 'processing' ? (
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-zinc-600 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-zinc-400" />
                  </div>
                )}
              </div>

              {/* Step Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium transition-colors ${
                  index === currentStep
                    ? "text-white"
                    : index < currentStep
                    ? "text-green-400"
                    : "text-zinc-400"
                }`}>
                  {step.text}
                </p>
                {index === currentStep && step.status === 'processing' && (
                  <p className="text-xs text-zinc-400 mt-0.5">Processing...</p>
                )}
                {step.status === 'error' && (
                  <p className="text-xs text-red-400 mt-0.5">Failed - retrying</p>
                )}
              </div>

              {/* Animated dots for current step */}
              {index === currentStep && step.status === 'processing' && (
                <div className="flex space-x-0.5 sm:space-x-1">
                  <div className="h-1 w-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1 w-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1 w-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between text-xs text-zinc-400 mb-1 sm:mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Cancel Button */}
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white text-sm h-9 sm:h-10"
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
    <div className="flex justify-start mb-2 sm:mb-3 md:mb-4">
      <Avatar className="mr-2 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0">
        <AvatarImage src="/ai-avatar.png" />
        <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
      </Avatar>
      <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm leading-relaxed bg-zinc-900 border border-zinc-800 text-zinc-200">
        <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex items-center transition-all duration-500 ${
                index < currentStep 
                  ? "text-green-400" 
                  : index === currentStep 
                    ? "text-white animate-pulse" 
                    : "text-zinc-500"
              }`}
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 flex items-center justify-center flex-shrink-0">
                {index < currentStep ? (
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : index === currentStep ? (
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-current"></div>
                )}
              </div>
              <span className="text-xs sm:text-sm break-words flex-1">{step.text}</span>
              
              {step.thumbnail && index === currentStep && (
                <div className="ml-1 sm:ml-2 flex-shrink-0">
                  <img src={step.thumbnail} alt="Video thumbnail" className="w-6 h-4 sm:w-8 sm:h-6 md:w-12 md:h-8 rounded object-cover" />
                  {step.title && (
                    <div className="text-xs mt-0.5 text-zinc-400 truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px]">{step.title}</div>
                  )}
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
    <div className="w-full h-full max-h-full border border-zinc-800 shadow-2xl overflow-hidden rounded-sm bg-white mx-auto">
      <div 
        className="p-4 sm:p-6 md:p-8 lg:p-12 bg-white text-black h-full overflow-auto scrollbar-hide"
        style={{ 
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: 'clamp(9px, 1.5vw, 12px)',
          lineHeight: '1.5',
          color: '#000000',
          height: '100%'
        }}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className="pdf-content"
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
}> = ({ title, onMenuClick, showChatMobile, onToggleChat }) => (
  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-zinc-900 bg-zinc-950 lg:hidden sticky top-0 z-40">
    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-400 hover:text-white hover:bg-zinc-800 flex-shrink-0"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg font-bold truncate text-white">{title}</h1>
      </div>
    </div>
    
    <Button 
      size="sm"
      variant={showChatMobile ? "secondary" : "default"}
      className="bg-red-600 hover:bg-red-700 text-white h-8 px-2 sm:px-3 text-xs flex-shrink-0 ml-2"
      onClick={onToggleChat}
    >
      {showChatMobile ? "Close" : "Ask AI"}
    </Button>
  </div>
);

// Locked Chat Section Component
const LockedChatSection: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  return (
    <div className="fixed lg:static top-0 right-0 h-[100dvh] sm:h-[90vh] w-full lg:w-auto bg-zinc-950 flex flex-col border-l border-zinc-900 z-50">
      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold truncate text-white">Note Preview</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-200 text-xs">
              Locked
            </Badge>
          </div>
        </div>
      </div>

      {/* Locked Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-red-600/20 p-3 sm:p-4 rounded-full">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </div>
          
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-zinc-400 text-sm sm:text-base mb-4 sm:mb-6">
            You don't have permission to access this note. Please login with the correct account to view the full content and chat features.
          </p>
          
          <Button 
            onClick={onLoginClick}
            className="bg-red-600 hover:bg-red-700 text-white w-full h-10 sm:h-11 text-sm sm:text-base"
          >
            Login to Access
          </Button>
          
          <p className="text-xs text-zinc-500 mt-3 sm:mt-4">
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="bg-red-600/20 p-3 sm:p-4 rounded-full">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Note Not Found</h2>
        <p className="text-zinc-400 text-sm sm:text-base mb-4 sm:mb-6">
          The note you're looking for doesn't exist or may have been removed.
        </p>
        
        <Button 
          onClick={onGoHome}
          className="bg-red-600 hover:bg-red-700 text-white w-full h-10 sm:h-11 text-sm sm:text-base"
        >
          Go Back Home
        </Button>
        
        <p className="text-xs text-zinc-500 mt-3 sm:mt-4">
          Check the URL or contact the note owner if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

/* ----------------- Main Component ----------------- */
export default function NotePage({ params }: { params: { slug: string } }) {
  interface NoteData {
    _id: string;
    title: string;
    content: string;
    thumbnail?: string;
    // Add other properties as needed
  }
  const [data, setData] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [noteNotFound, setNoteNotFound] = useState(false);
  const router = useRouter();

  const [messages, setMessages] = useState<{ 
    id: string; 
    role: "user" | "assistant"; 
    content: string; 
    timestamp: Date;
    videoLink?: string;
    feedback?: "good" | "bad" | null ; 
  }[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);

  // PDF Download Loader States
  const [showPDFLoader, setShowPDFLoader] = useState(false);
  const [pdfDownloadStep, setPdfDownloadStep] = useState(0);
  const [pdfDownloadSteps, setPdfDownloadSteps] = useState<
    { text: string; status: 'pending' | 'processing' | 'completed' | 'error' }[]
  >([]);

  // Device detection with improved responsive breakpoints
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-show chat on larger screens, hide on mobile by default
      if (width >= 1024) {
        setShowChatMobile(true);
      } else {
        setShowChatMobile(false);
      }
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const tinyMceRef = useRef<{ 
    undoManager: { undo: () => void; redo: () => void };
    execCommand: (command: string, ui?: boolean, value?: any) => void;
  } | null>(null);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);

  // Initialize turndown service
  const turndownService = useRef(new TurndownService()).current;

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("authToken");
    }
    return null;
  };

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!getAuthToken();
  }, []);

  
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

    const waitForPDFReady = async (noteId: string, maxRetries = 8, delay = 1500): Promise<any> => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await api.get(`/notes/genrate/pdf?noteId=${noteId}`, {
            headers: {
              'Auth': getAuthToken()
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
      
      const pdfUrl = response.data.pdfUrl || response.data.downloadUrl;
      const noteTitle = response.data.noteTitle || 'document';
      const fileSize = response.data.fileSize;
      
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
        alert(`Failed to generate PDF: ${error.message || "Please try again"}`);
      }, 1500);
    }
  }, [hasPermission, data?._id, isAuthenticated]);


  // Handle PDF download cancellation
  const handlePDFDownloadCancel = () => {
    setShowPDFLoader(false);
    setPdfDownloadStep(0);
    setPdfDownloadSteps([]);
  };

  // Handle login success
  interface UserData {
    name?: string;
    email?: string;
    picture?: string;
  }
  
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
      
      const res = await api.get(`/notes/slug/${params.slug}`, {
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
          setAuthError("You don't have permission to access this note. Please login with the correct account.");
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
  }, [params.slug]);

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
      setAiTypingStart(Date.now());
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
          noteId: data._id,
          message: input,
        }, {
          headers: {
            'Auth': getAuthToken()
          }
        });

        setIsThinking(false);
        setCurrentStep(0);

        // Typing effect for AI response
        const fullText = response.data.assistantMessage || "Sorry, I couldn't process your request.";
        const videoLink = response.data.videoLink || null;
        let shownText = "";
        let idx = 0;
        const typingStart = Date.now();
        setAiTypingStart(typingStart);

        const charsPerFrame = isMobile ? 3 : 5;

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
  }, [data, markdownContent, hasPermission , isAuthenticated]);

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
    return <LoaderThreeDemo />;

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
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg z-500 max-w-xs sm:max-w-md text-center text-sm">
          {authError}
        </div>
      )}

      <div className="bg-black text-white h-screen w-screen overflow-hidden safe-area-inset-bottom">
        {/* Mobile Header */}
        <ResponsiveHeader 
          title={data?.title || "Note"} 
          onMenuClick={() => setShowChatMobile(!showChatMobile)}
          showChatMobile={showChatMobile}
          onToggleChat={() => setShowChatMobile(!showChatMobile)}
        />

        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-[calc(100vh-0px)] w-full overflow-hidden">
          {/* Left: PDF + Editor */}
          <div className={`flex-1 lg:flex-[0_0_40%] xl:flex-[0_0_40%] p-2 sm:p-3 lg:p-4 h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-900 flex flex-col items-center ${
            isMobile && showChatMobile ? 'hidden lg:flex' : 'flex'
          }`}>
            <Tabs defaultValue="preview" className="w-full h-full max-h-full flex flex-col">
              <TabsList className="mb-2 sm:mb-3 grid w-full grid-cols-2 bg-zinc-900/50 h-8 sm:h-9 flex-shrink-0">
                <TabsTrigger value="preview" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Preview</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2">
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Edit</span>
                </TabsTrigger>
              </TabsList>

              {/* PDF Preview */}
              <TabsContent value="preview" className="mt-0 flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex items-center justify-center min-h-0 h-full">
                  <PDFPreview content={markdownContent} />
                </div>
              </TabsContent>

              {/* Editor */}
              <TabsContent value="editor" className="mt-0 flex-1 flex flex-col min-h-0 h-full">
                <div className="w-full h-full border border-zinc-800 shadow-lg overflow-hidden flex flex-col rounded-md bg-white flex-1">
                  {/* Enhanced Toolbar */}
                  <div className="p-1.5 sm:p-2 flex flex-wrap gap-1 bg-zinc-950 border-b border-zinc-800 rounded-t-md flex-shrink-0">
                    {/* File Operations */}
                    <div className="flex gap-1 border-r border-zinc-700 pr-2 mr-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-zinc-800"
                        onClick={() => tinyMceRef.current?.undoManager.undo()}
                        disabled={!hasPermission}
                      >
                        <Undo className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-zinc-800"
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
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-zinc-800"
                        onClick={() => tinyMceRef.current?.execCommand('Bold')}
                        disabled={!hasPermission}
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-zinc-800"
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
                        className="h-7 px-2 text-xs hover:bg-zinc-800"
                        onClick={() => tinyMceRef.current?.execCommand('FormatBlock', false, 'h1')}
                        disabled={!hasPermission}
                      >
                        H1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-zinc-800"
                        onClick={() => tinyMceRef.current?.execCommand('FormatBlock', false, 'h2')}
                        disabled={!hasPermission}
                      >
                        H2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-zinc-800"
                        onClick={() => tinyMceRef.current?.execCommand('InsertUnorderedList')}
                        disabled={!hasPermission}
                      >
                        <ListIcon className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Save Button */}
                    {isDirty && (
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white ml-auto h-7 sm:h-8 px-2 sm:px-3 text-xs" 
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
                            font-size: 12px;
                            line-height: 1.6;
                            color: #000;
                            margin: 15px;
                          }
                          h1 { font-size: 18px; margin: 24px 0 12px 0; }
                          h2 { font-size: 16px; margin: 20px 0 10px 0; }
                          h3 { font-size: 14px; margin: 16px 0 8px 0; }
                          p { margin: 8px 0; }
                        `,
                        branding: false,
                        statusbar: false,
                        paste_data_images: true,
                        images_upload_url: '/api/upload',
                        automatic_uploads: true,
                        readonly: !hasPermission
                      }}
                      onEditorChange={(content) => {
                        if (hasPermission) {
                          setMarkdownContent(content); // Save HTML directly
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

          {/* Right: Chat or Locked Section */}
          {hasPermission ? (
            <div
              className={`flex-1 lg:flex-[0_0_60%] xl:flex-[0_0_60%] fixed lg:static top-0 right-0 h-[100dvh] sm:h-[95vh] w-full lg:w-auto bg-zinc-950 flex flex-col border-l border-zinc-900 transition-transform duration-300 z-50 ${
                isMobile ? (showChatMobile ? "translate-x-0" : "translate-x-full") : "translate-x-0"
              } ${isMobile && !showChatMobile ? 'hidden lg:flex' : 'flex'}`}

              style={{
                height:'100%'
              }}
            >
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold truncate text-white">{data?.title}</h1>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white border-none h-8 sm:h-9 px-2 sm:px-3 text-xs"
                    onClick={downloadAsPDF}
                    disabled={showPDFLoader}
                  >
                    <Download className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> 
                    <span className="hidden sm:inline">Download PDF</span>
                  </Button>
                  
                  {isMobile && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 sm:h-9 px-2 sm:px-3 text-xs"
                      onClick={() => setShowChatMobile(false)}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages container with fixed height and scroll */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <ScrollArea className="flex-1 h-full">
                  <div className="p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4 md:space-y-6">
                    {groupedMessages().map((group, groupIndex) => (
                      <div key={groupIndex}>
                        {/* Date separator */}
                        <div className="flex justify-center my-2 sm:my-3 md:my-4">
                          <div className="text-xs text-zinc-500 bg-zinc-900 px-2 sm:px-3 py-1 rounded-full">
                            {group.date}
                          </div>
                        </div>
                        
                        {/* Messages for this date */}
                        {group.messages.map((m) => (
                          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-2 sm:mb-3 md:mb-4`}>
                            {m.role === "assistant" && (
                              <Avatar className="mr-2 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0">
                                <AvatarImage src="/ai-avatar.png" />
                                <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex flex-col max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
                              <div
                                className={`rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm leading-relaxed break-words ${m.role === "user" ? "bg-red-600 text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-200"}`}
                              >
                                <div className="prose prose-invert prose-sm max-w-none">
                                  <ReactMarkdown>
                                    {m.content}
                                  </ReactMarkdown>
                                </div>
                                
                                {/* YouTube Video Link */}
                                {m.role === "assistant" && m.videoLink && (
                                  <div className="mt-2 p-2 sm:p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                                    <a 
                                      href={m.videoLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 sm:gap-3 text-red-400 hover:text-red-300 transition-colors group"
                                    >
                                      <div className="flex-shrink-0">
                                        <svg 
                                          className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" 
                                          viewBox="0 0 24 24" 
                                          fill="currentColor"
                                        >
                                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium">Watch video for more</p>
                                        <p className="text-xs text-zinc-400 truncate">
                                          {m.videoLink.includes('youtube.com') || m.videoLink.includes('youtu.be') ? 'YouTube Video' : 'External Video'}
                                        </p>
                                      </div>
                                      <div className="flex-shrink-0">
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </div>
                                    </a>
                                  </div>
                                )}
                                
                                {/* Feedback Buttons */}
                                {m.role === "assistant" && (
                                  <div className="flex justify-end gap-1 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                                      onClick={async () => {
                                        await navigator.clipboard.writeText(m.content);
                                        setCopiedMessageId(m.id);
                                        setTimeout(() => setCopiedMessageId(null), 3000);
                                      }}
                                    >
                                      {copiedMessageId === m.id ? (
                                        <span className="flex items-center text-green-500 animate-in fade-in duration-300">
                                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" /> Copied
                                        </span>
                                      ) : (
                                        <> <FileDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" /> Copy </> 
                                      )}
                                    </Button>
                                    
                                    {/* Like Button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-200 ${
                                        m.feedback === "good" 
                                          ? "text-green-500 bg-green-500/20 hover:bg-green-500/30" 
                                          : "text-zinc-400 hover:text-green-500 hover:bg-zinc-800"
                                      }`}
                                      onClick={() => data?._id && handleFeedback(data._id, m.id, "good")}
                                    >
                                      <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                    
                                    {/* Dislike Button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-200 ${
                                        m.feedback === "bad" 
                                          ? "text-red-500 bg-red-500/20 hover:bg-red-500/30" 
                                          : "text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
                                      }`}
                                      onClick={() => data?._id && handleFeedback(data._id, m.id, "bad")}
                                    >
                                      <ThumbsDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className={`text-xs text-zinc-500 mt-0.5 sm:mt-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                                {formatTime(m.timestamp)}
                              </div>
                            </div>
                            {m.role === "user" && (
                              <Avatar className="ml-2 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0">
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
                      <div className="flex justify-start mb-2 sm:mb-3 md:mb-4">
                        <Avatar className="mr-2 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0">
                          <AvatarImage src="/ai-avatar.png" />
                          <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
                          <div className="rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm leading-relaxed bg-zinc-900 border border-zinc-800 text-zinc-200 break-words">
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown>
                                {aiTypingContent}
                              </ReactMarkdown>
                            </div>
                            {aiTypingDuration && (
                              <span className="ml-1 sm:ml-2 text-xs text-green-400">Generated in {aiTypingDuration} sec</span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5 sm:mt-1 text-left">
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
              <div className="border-t border-zinc-900 p-2 sm:p-3 md:p-4 bg-zinc-950 flex-shrink-0 safe-area-inset-bottom">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-1.5 sm:gap-2">
                  <div className="flex gap-1.5 sm:gap-2">
                    <Input
                      placeholder="Ask something about this content..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 focus-visible:ring-red-500 text-xs sm:text-sm h-9 sm:h-10 md:h-11 flex-1"
                      disabled={isThinking}
                    />
                    <Button 
                      type="submit" 
                      className="bg-red-600 hover:bg-red-700 text-white h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 flex-shrink-0" 
                      disabled={isThinking || !input.trim()}
                    >
                      {isThinking ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Send className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>{input.length} characters</span>
                    <span className="text-zinc-600 hidden xs:inline">Press Enter to send</span>
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