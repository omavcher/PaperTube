"use client";

import React, { useState, useRef, useEffect, useCallback, use } from "react";
import { Editor } from "@tinymce/tinymce-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

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
  MessageSquare,
  Home,
  RefreshCw
} from "lucide-react";

import api from "@/config/api";
import { LoaderX } from "@/components/LoaderX";
import { LoginDialog } from "@/components/LoginDialog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- AUTH HELPERS ---
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("authToken");
  }
  return null;
};

const getGoogleToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("googleAccessToken");
  }
  return null;
};

const isAuthenticated = () => !!getAuthToken();

// --- TYPES ---
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

interface ApiMessage { _id: string; role: string; content: string; timestamp: string; videoLink?: string; feedback?: "good" | "bad" | null; }
interface ApiMessagesResponse { messages: ApiMessage[]; }
interface NoteData { _id: string; title: string; content: string; thumbnail?: string; }

// --- STYLES ---
const iphoneStyles = `
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bounceFeedback { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.95); } }
@keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

.animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
.animate-slide-in-right { animation: slideInRight 0.4s ease-out; }
.animate-bounce-feedback { animation: bounceFeedback 0.2s ease-in-out; }
.animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }

.glass-effect { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.smooth-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.bounce-feedback:active { transform: scale(0.95); }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }

/* Mobile Optimizations */
.mobile-safe-bottom { padding-bottom: calc(4rem + env(safe-area-inset-bottom)); }
.h-dvh-screen { height: 100dvh; } /* Dynamic viewport height */

@media (max-width: 1023px) {
  .tinymce-mobile-height { height: calc(100dvh - 180px) !important; }
}
`;

// --- COMPONENTS ---

// 1. PDF Preview
const PDFPreviewWithThumbnail: React.FC<{ 
  content: string; 
  pdfData?: PDFPreviewData | null;
  isGenerating?: boolean;
  onGeneratePDF?: () => void;
  onViewInTab?: () => void;
}> = ({ content, pdfData, isGenerating = false, onGeneratePDF, onViewInTab }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  return (
    <div className="w-full h-full border border-neutral-800 shadow-2xl overflow-hidden rounded-lg bg-white relative group animate-scale-in flex flex-col">
      {/* Header */}
      {(pdfData || isGenerating) && (
        <div className="bg-neutral-900/95 p-3 border-b border-neutral-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {pdfData?.thumbnailLink && (
              <div className="relative w-8 h-10 rounded overflow-hidden border border-neutral-700 shrink-0">
                <Image src={pdfData.thumbnailLink} alt="PDF" fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{pdfData?.fileName || "Generating..."}</h3>
              {pdfData?.fileSize && <p className="text-xs text-neutral-400">{typeof pdfData.fileSize === 'string' ? pdfData.fileSize : "PDF Ready"}</p>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
             {!pdfData && onGeneratePDF && (
              <Button size="sm" className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs" onClick={onGeneratePDF} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3 mr-1" />}
                {isGenerating ? "..." : "Generate"}
              </Button>
            )}
            {pdfData?.viewLink && (
              <Button size="sm" variant="outline" className="h-8 border-neutral-600 text-white hover:bg-neutral-800" onClick={() => window.open(pdfData.viewLink, '_blank')}>
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white p-4 custom-scrollbar">
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-2" />
            <p className="text-neutral-600 text-sm">Creating PDF...</p>
          </div>
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: content }} 
            className="prose max-w-none text-black"
            style={{ fontFamily: "'Times New Roman', serif", fontSize: '14px', lineHeight: '1.5' }} 
          />
        )}
      </div>

      <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white rounded-full h-10 w-10 z-10" onClick={() => setShowFullPreview(true)}>
        <Eye className="h-5 w-5" />
      </Button>

      {/* Fullscreen Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col relative animate-scale-in">
             <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/10 hover:bg-black/20 rounded-full text-black z-20" onClick={() => setShowFullPreview(false)}>
              <X className="h-5 w-5" />
            </Button>
            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
               <div dangerouslySetInnerHTML={{ __html: content }} style={{ fontFamily: "'Times New Roman', serif", fontSize: '16px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto', color: 'black' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Mobile Bottom Navigation
const MobileBottomNav: React.FC<{
  activeTab: 'preview' | 'editor' | 'chat';
  setActiveTab: (tab: 'preview' | 'editor' | 'chat') => void;
  onHome: () => void;
}> = ({ activeTab, setActiveTab, onHome }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 z-50 flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
      <button onClick={onHome} className="flex flex-col items-center justify-center w-16 h-full text-neutral-400 hover:text-white transition-colors">
        <Home className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-medium">Home</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('preview')} 
        className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'preview' ? 'text-red-500' : 'text-neutral-400'}`}
      >
        <Eye className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-medium">Read</span>
      </button>

      <button 
        onClick={() => setActiveTab('editor')} 
        className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'editor' ? 'text-red-500' : 'text-neutral-400'}`}
      >
        <Edit className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-medium">Edit</span>
      </button>

      <button 
        onClick={() => setActiveTab('chat')} 
        className={`flex flex-col items-center justify-center w-16 h-full transition-colors relative ${activeTab === 'chat' ? 'text-red-500' : 'text-neutral-400'}`}
      >
        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${activeTab === 'chat' ? 'bg-red-500' : 'bg-transparent'}`} />
        <MessageSquare className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-medium">PaperChat</span>
      </button>
    </div>
  );
};

// 3. Header Component
const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="h-14 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 flex items-center px-4 sticky top-0 z-40">
    <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-neutral-400 hover:text-white">
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <h1 className="text-white font-semibold truncate text-sm sm:text-base">{title}</h1>
  </div>
);

// 4. Google Re-login Modal
const GoogleReLoginModal = ({ isOpen, onClose, onLogin }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <AlertCircle size={24} />
          <h3 className="text-lg font-bold text-white">Google Session Expired</h3>
        </div>
        
        <p className="text-neutral-400 mb-6">
          Your Google session has expired. To continue using features like PDF generation with images, please login again.
        </p>
        
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 hover:bg-neutral-800 text-neutral-400"
          >
            Later
          </Button>
          <Button 
            onClick={onLogin}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw size={16} className="mr-2" />
            Login Again
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// 5. Token Expired Banner
const TokenExpiredBanner = ({ onLogin }: any) => {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-red-500" />
        <p className="text-xs text-red-500">Google access expired. PDF generation requires login.</p>
      </div>
      <Button 
        size="sm" 
        onClick={onLogin}
        className="h-7 bg-red-600 hover:bg-red-700 text-white text-xs"
      >
        Login
      </Button>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  
  // Data State
  const [data, setData] = useState<NoteData | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'preview' | 'editor' | 'chat'>('preview');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  
  // Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Google Token State
  const [showGoogleReLogin, setShowGoogleReLogin] = useState(false);
  const [googleTokenExpired, setGoogleTokenExpired] = useState(false);
  const [pendingPDFGeneration, setPendingPDFGeneration] = useState(false);

  // Editor State
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const tinyMceRef = useRef<any>(null);

  // Chat State
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // PDF State
  const [pdfPreviewData, setPdfPreviewData] = useState<PDFPreviewData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Google Login Hook for re-authentication
  const handleGoogleReLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        toast.loading("Re-authenticating...");
        
        // Get user info from Google
        const { data: userInfo } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        
        // Send to your backend
        const res = await api.post("/auth/google", {
          googleAccessToken: tokenResponse.access_token,
          authType: 'access_token'
        });
        
        if (res.data.success) {
          // Store new tokens
          localStorage.setItem("authToken", res.data.data.token);
          localStorage.setItem("googleAccessToken", tokenResponse.access_token);
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
          
          // Update state
          setShowGoogleReLogin(false);
          setGoogleTokenExpired(false);
          
          toast.dismiss();
          toast.success("Re-authentication successful");
          
          // If there was a pending PDF generation, trigger it
          if (pendingPDFGeneration) {
            setPendingPDFGeneration(false);
            generatePDF();
          }
        }
      } catch (error) {
        console.error("Re-login failed:", error);
        toast.error("Re-authentication failed. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      toast.error("Google login failed");
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    flow: 'implicit',
  });

  // Check Google token validity
  const checkGoogleToken = useCallback(async () => {
    const token = getGoogleToken();
    
    if (!token) {
      setGoogleTokenExpired(true);
      return false;
    }

    try {
      // Simple check if token might be expired (you can enhance this)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= exp) {
          console.log("Google token expired");
          setGoogleTokenExpired(true);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Token check error:", error);
      return true; // Assume valid if check fails
    }
  }, []);

  // Initialize Styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = iphoneStyles;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  // Fetch Data and Check Subscription
  const loadNoteData = useCallback(async () => {
    try {
      setLoading(true);
      const authToken = getAuthToken();

      // Check Subscription Status from LocalStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          setIsSubscribed(!!userObj.membership?.isActive);
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }

      const res = await api.get(`/notes/slug/${slug}`, { headers: { 'Auth': authToken } });
      setData(res.data);
      setMarkdownContent(res.data.content);
      
      // Check Google token
      await checkGoogleToken();
      
      // Load Messages
      try {
        const msgRes = await api.get<ApiMessagesResponse>(`/chat/getMessages/${res.data._id}`, { headers: { 'Auth': authToken } });
        setMessages(msgRes.data.messages);
      } catch (e) {
        setMessages([{ _id: "welcome", role: "assistant", content: "Hello! I am PaperChat. How can I help you with this note?", timestamp: new Date().toISOString() }]);
      }

      // Check PDF
      try {
        const pdfRes = await api.get(`/notes/generate/pdf?noteId=${res.data._id}`, { 
          headers: { 
            'Auth': authToken,
            'x-google-access-token': getGoogleToken() || ''
          } 
        });
        if (pdfRes.data.success && pdfRes.data.data) {
          setPdfPreviewData(pdfRes.data.data.pdf_data || pdfRes.data.data);
        }
      } catch (e) { 
        console.log("No existing PDF");
      }

    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        setHasPermission(false);
        setShowLoginDialog(true);
      }
    } finally {
      setLoading(false);
    }
  }, [slug, checkGoogleToken]);

  useEffect(() => { loadNoteData(); }, [loadNoteData]);
  
  // Auto-scroll effect
  useEffect(() => {
    if (mobileView === 'chat' || window.innerWidth >= 1024) {
      const timer = setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages, isThinking, mobileView]);

  // Actions
  const handleSave = async () => {
    if (!data?._id) return;
    try {
      await api.put(`/notes/update/${data._id}`, { content: markdownContent }, { headers: { 'Auth': getAuthToken() } });
      setIsDirty(false);
      toast.success("Note saved successfully");
    } catch (e) { 
      toast.error("Save failed");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking || !isSubscribed) return;
    
    const userMsg = { _id: Date.now().toString(), role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await api.post(`/chat/message`, { noteId: data?._id, message: userMsg.content }, { headers: { 'Auth': getAuthToken() } });
      const aiMsg = { 
        _id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: res.data.assistantMessage, 
        timestamp: new Date().toISOString(),
        videoLink: res.data.videoLink 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { _id: "err", role: "assistant", content: "Error processing request.", timestamp: new Date().toISOString() }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Generate PDF with token check
  const generatePDF = async () => {
    if (!data?._id) return;
    
    // Check if Google token is valid
    const tokenValid = await checkGoogleToken();
    
    if (!tokenValid) {
      setShowGoogleReLogin(true);
      setPendingPDFGeneration(true);
      return;
    }
    
    setIsGeneratingPDF(true);
    try {
      const res = await api.get(`/notes/generate/pdf?noteId=${data._id}`, { 
        headers: { 
          'Auth': getAuthToken(),
          'x-google-access-token': getGoogleToken() || ''
        } 
      });
      
      if (res.data.success) {
        if (res.data.data.pdf) {
          // If PDF is returned as base64, download it
          const pdfData = res.data.data.pdf;
          const byteCharacters = atob(pdfData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        } else {
          // If Drive link is available, use that
          setPdfPreviewData(res.data.data.pdf_data || res.data.data);
        }
        
        toast.success(`PDF generated with ${res.data.data.imagesEmbedded || 0} images`);
      }
    } catch (error: any) {
      console.error("PDF Generation Failed:", error);
      
      // Check if error is due to token expiration
      if (error.response?.status === 401 || 
          error.response?.data?.error === 'token_expired' ||
          error.response?.data?.message?.includes('token')) {
        setShowGoogleReLogin(true);
        setPendingPDFGeneration(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to generate PDF");
      }
    } finally { 
      setIsGeneratingPDF(false); 
    }
  };

  if (loading) return <LoaderX />;
  if (!hasPermission) return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <Lock className="h-12 w-12 text-red-500 mb-4"/>
      <h2 className="text-xl font-bold">Access Restricted</h2>
      <Button onClick={() => setShowLoginDialog(true)} className="mt-4 bg-red-600">Login</Button>
      <LoginDialog isOpen={showLoginDialog} onClose={() => router.push('/')} onSuccess={() => {setShowLoginDialog(false); loadNoteData();}} />
    </div>
  );

  return (
    <div className="h-dvh-screen w-screen bg-black flex flex-col overflow-hidden text-neutral-200">
      
      {/* Re-login Modal */}
      <GoogleReLoginModal 
        isOpen={showGoogleReLogin}
        onClose={() => {
          setShowGoogleReLogin(false);
          setPendingPDFGeneration(false);
        }}
        onLogin={handleGoogleReLogin}
      />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-full lg:flex-row">
        
        {/* Header (Mobile Only) */}
        <div className="lg:hidden shrink-0">
          <Header title={data?.title || "Note"} onBack={() => router.push('/')} />
        </div>

        {/* LEFT PANEL: Editor & Preview */}
        <div className={`flex-1 flex flex-col min-h-0 lg:border-r border-neutral-800 ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Desktop Tabs */}
          <div className="hidden lg:flex p-2 border-b border-neutral-800 gap-2 items-center justify-between bg-neutral-900/50">
             <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')}><ArrowLeft className="h-4 w-4 mr-1"/> Home</Button>
                <h2 className="font-semibold text-white self-center ml-2">{data?.title}</h2>
             </div>
             <div className="flex bg-black/50 p-1 rounded-lg">
                <Button size="sm" variant={mobileView === 'preview' ? 'secondary' : 'ghost'} onClick={() => setMobileView('preview')} className="text-xs h-7"><Eye className="h-3 w-3 mr-1"/> Preview</Button>
                <Button size="sm" variant={mobileView === 'editor' ? 'secondary' : 'ghost'} onClick={() => setMobileView('editor')} className="text-xs h-7"><Edit className="h-3 w-3 mr-1"/> Edit</Button>
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative mobile-safe-bottom">
            
            {/* Token Expired Banner (shown when needed) */}
            {googleTokenExpired && mobileView === 'preview' && (
              <div className="absolute top-0 left-0 right-0 z-20 p-3">
                <TokenExpiredBanner onLogin={() => setShowGoogleReLogin(true)} />
              </div>
            )}
            
            {/* VIEW: PREVIEW */}
            <div className={`absolute inset-0 p-3 lg:p-6 transition-opacity duration-300 ${mobileView === 'preview' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
               <div className="h-full w-full max-w-4xl mx-auto flex flex-col">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Document Preview</h3>
                    <Button size="sm" variant="outline" onClick={generatePDF} disabled={isGeneratingPDF} className="h-8 border-neutral-700">
                      {isGeneratingPDF ? <Loader2 className="animate-spin h-4 w-4"/> : <Download className="h-4 w-4 mr-2"/>}
                      Export PDF
                    </Button>
                 </div>
                 <div className="flex-1 min-h-0">
                    <PDFPreviewWithThumbnail 
                      content={markdownContent} 
                      pdfData={pdfPreviewData} 
                      isGenerating={isGeneratingPDF}
                      onGeneratePDF={generatePDF}
                    />
                 </div>
               </div>
            </div>

            {/* VIEW: EDITOR */}
            <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${mobileView === 'editor' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className="p-2 bg-neutral-900 border-b border-neutral-800 flex flex-wrap gap-2 items-center justify-between shrink-0">
                 <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400" onClick={() => tinyMceRef.current?.execCommand('Bold')}><Bold className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400" onClick={() => tinyMceRef.current?.execCommand('Italic')}><Italic className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400" onClick={() => tinyMceRef.current?.execCommand('InsertUnorderedList')}><ListIcon className="h-4 w-4"/></Button>
                 </div>
                 {isDirty && (
                   <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs">
                     <Save className="h-3 w-3 mr-1"/> Save Changes
                   </Button>
                 )}
              </div>
              <div className="flex-1 bg-white">
                <Editor
                  apiKey="xuwnpn5va0cwbivoch3ovgc44gtceufhg07937jqqu6dnl25"
                  onInit={(_, editor) => (tinyMceRef.current = editor)}
                  value={markdownContent}
                  init={{
                    height: '100%',
                    menubar: false,
                    plugins: ['lists', 'link', 'image', 'code', 'help', 'wordcount'],
                    toolbar: false,
                    content_style: `body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; padding: 16px; }`,
                    statusbar: false,
                  }}
                  onEditorChange={(c) => { setMarkdownContent(c); setIsDirty(true); }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Chat */}
        <div className={`flex-1 lg:flex-[0_0_400px] xl:flex-[0_0_450px] bg-neutral-900/50 flex flex-col min-h-0 ${mobileView === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="p-3 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur shrink-0 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Avatar className="h-8 w-8 border border-neutral-700">
                 <AvatarImage src="/ai-avatar.png" />
                 <AvatarFallback className="bg-red-600 text-xs">AI</AvatarFallback>
               </Avatar>
               <div>
                 <h3 className="text-sm font-semibold text-white">PaperChat</h3>
                 <p className="text-[10px] text-green-400 flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"/>Online</p>
               </div>
             </div>
          </div>

          <div className="relative flex-1 flex flex-col min-h-0">
            
            {/* Premium Lock Overlay */}
            {!isSubscribed && (
              <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-4 border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">PaperChat Locked</h3>
                <p className="text-sm text-neutral-400 mb-6 font-medium">Upgrade to Pro to interact dynamically with your generated notes using our advanced neural assistant.</p>
                <Button onClick={() => router.push('/pricing')} className="bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                   Unlock Premium <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Chat Messages */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4 custom-scrollbar"
            >
               <div className="space-y-4">
                 {messages.map((msg, idx) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} 
                     animate={{ opacity: 1, y: 0 }} 
                     key={idx} 
                     className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                   >
                      <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-red-600 text-white rounded-br-none' 
                          : 'bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-bl-none'
                      }`}>
                         <div className="prose prose-invert prose-sm max-w-none">
                           <ReactMarkdown>{msg.content}</ReactMarkdown>
                         </div>
                         {msg.videoLink && (
                           <a href={msg.videoLink} target="_blank" className="mt-2 block p-2 bg-black/20 rounded flex items-center gap-2 hover:bg-black/40 transition">
                              <ExternalLink className="h-3 w-3 text-red-400"/>
                              <span className="text-xs text-red-300">Watch Related Video</span>
                           </a>
                         )}
                         <div className="mt-1 text-[10px] opacity-50 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                   </motion.div>
                 ))}
                 {isThinking && (
                   <div className="flex items-center gap-2 text-neutral-500 text-xs ml-2">
                     <Loader2 className="h-3 w-3 animate-spin"/> Thinking...
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur shrink-0 mb-16 lg:mb-0 relative z-10">
               <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                  <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask a question..." 
                    disabled={!isSubscribed}
                    className="bg-neutral-900 border-neutral-700 text-white rounded-full pl-4 pr-12 focus-visible:ring-red-500 disabled:opacity-50"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!input.trim() || isThinking || !isSubscribed}
                    className="absolute right-1 top-1 bottom-1 h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    {isThinking ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                  </Button>
               </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav 
        activeTab={mobileView} 
        setActiveTab={setMobileView} 
        onHome={() => router.push('/')}
      />
    </div>
  );
}