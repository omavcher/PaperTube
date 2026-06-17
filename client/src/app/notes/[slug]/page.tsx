"use client";

import React, { useState, useRef, useEffect, useCallback, use } from "react";
import { THEMES } from "@/config/themes";
import { Editor } from "@tinymce/tinymce-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
// @ts-ignore
import renderMathInElement from "katex/dist/contrib/auto-render";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
// @ts-ignore
import TurndownService from "turndown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

import {
  Download,
  Bold,
  Italic,
  List as ListIcon,
  Send,
  Save,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Edit,
  Lock,
  AlertCircle,
  X,
  FileText,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Home,
  RefreshCw,
  Plus,
  ChevronDown,
  BookOpen,
  Brain,
  HelpCircle,
  Lightbulb,
  Zap,
  ArrowRight,
  Check
} from "lucide-react";


import api from "@/config/api";
import { LoaderX } from "@/components/LoaderX";
import { MOCK_NOTES } from "@/config/mock-notes";
import { LoginDialog } from "@/components/LoginDialog";
import FlashcardViewer from "@/components/FlashcardViewer";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// --- AUTH HELPERS ---
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("authToken");
  }
  return null;
};

const isAuthenticated = () => !!getAuthToken();

// --- TYPES ---
interface ApiMessage { _id: string; role: string; content: string; timestamp: string; videoLink?: string; feedback?: "good" | "bad" | null; mode?: string; }
interface ApiMessagesResponse { messages: ApiMessage[]; }
interface NoteData { _id: string; title: string; content: string; thumbnail?: string; generationDetails?: any; videoUrl?: string; }

// --- STYLES ---
const iphoneStyles = `
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bounceFeedback { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.95); } }
@keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 8px rgba(220,38,38,0.4); } 50% { box-shadow: 0 0 20px rgba(220,38,38,0.8), 0 0 40px rgba(220,38,38,0.3); } }

.animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
.animate-slide-in-right { animation: slideInRight 0.4s ease-out; }
.animate-bounce-feedback { animation: bounceFeedback 0.2s ease-in-out; }
.animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
.animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }

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
.h-dvh-screen { height: 100dvh; }

/* PaperChat Input */
.paperchat-textarea {
  resize: none;
  background: transparent;
  border: none;
  outline: none;
  color: #e5e5e5;
  font-size: 14px;
  line-height: 1.6;
  width: 100%;
  min-height: 22px;
  max-height: 140px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #333 transparent;
}
.paperchat-textarea::placeholder { color: #555; }
.paperchat-textarea::-webkit-scrollbar { width: 4px; }
.paperchat-textarea::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

.paperchat-input-box {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.paperchat-input-box:focus-within {
  border-color: #3f3f3f;
  box-shadow: 0 0 0 1px rgba(220,38,38,0.15), 0 4px 20px rgba(0,0,0,0.4);
}

/* Chat prose overflow fix */
.chat-prose { word-break: break-word; overflow-wrap: anywhere; min-width: 0; }
.chat-prose pre { white-space: pre-wrap; word-break: break-word; overflow-x: auto; max-width: 100%; }
.chat-prose table { display: block; overflow-x: auto; max-width: 100%; }
.chat-prose img { max-width: 100%; }
.chat-prose * { max-width: 100%; }

.mode-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 8px;
  border-radius: 20px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  color: #888;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  white-space: nowrap;
}
.mode-chip:hover { background: #222; border-color: #3a3a3a; color: #aaa; }
.mode-chip.active { background: #1e0a0a; border-color: #dc2626; color: #f87171; }

.plus-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  display: flex; align-items: center; justify-content: center;
  color: #888;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.plus-btn:hover { background: #222; border-color: #444; color: #ccc; }

.send-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  display: flex; align-items: center; justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(220,38,38,0.3);
}
.send-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 4px 16px rgba(220,38,38,0.5); }
.send-btn:active:not(:disabled) { transform: scale(0.95); }
.send-btn:disabled { background: #2a2a2a; box-shadow: none; cursor: not-allowed; color: #555; }

.action-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 6px;
  min-width: 200px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  z-index: 100;
}
.action-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #ccc;
  font-size: 13px;
  transition: background 0.15s;
}
.action-menu-item:hover { background: #1a1a1a; color: #fff; }
.action-menu-item .icon-wrap { width: 24px; height: 24px; border-radius: 6px; background: #1a1a1a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.mode-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 40px;
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 6px;
  min-width: 220px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  z-index: 100;
}
.mode-menu-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #ccc;
  font-size: 13px;
  transition: background 0.15s;
}
.mode-menu-item:hover { background: #1a1a1a; }
.mode-menu-item.selected { background: #1e0a0a; color: #f87171; }
.mode-menu-item .check-icon { width: 14px; height: 14px; margin-left: auto; opacity: 0; color: #dc2626; flex-shrink: 0; }
.mode-menu-item.selected .check-icon { opacity: 1; }


/* ── Premium Colorful Note Renderer (PDF Matching Styles) ── */
.premium-note-render {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
  line-height: 1.7;
}
.premium-note-render h1 {
  color: #0f172a; 
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  line-height: 1.2;
}
.premium-note-render h2 {
  color: #1d4ed8 !important; 
  font-size: 22px;
  font-weight: 700;
  margin-top: 32px;
  margin-bottom: 14px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}
.premium-note-render h3 {
  color: #334155; 
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 10px;
}
.premium-note-render h4 {
  color: #475569;
  font-size: 15px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 8px;
}
.premium-note-render p {
  margin-bottom: 16px;
  font-size: 15px;
  color: #334155;
}
.premium-note-render img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  margin: 20px auto;
  display: block;
  border: 1px solid #e2e8f0;
}
.premium-note-render code {
  background-color: #f1f5f9;
  color: #0f172a;
  padding: 3px 6px;
  border-radius: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  border: 1px solid #e2e8f0;
}
.premium-note-render pre {
  background-color: #0f172a;
  color: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 20px 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.premium-note-render pre code {
  background-color: transparent;
  color: inherit;
  border: none;
  padding: 0;
}
.premium-note-render blockquote {
  background-color: #f8fafc;
  border-left: 4px solid #3b82f6 !important;
  padding: 14px 18px;
  border-radius: 0 12px 12px 0;
  margin: 20px 0;
  color: #475569;
  font-style: italic;
}
.premium-note-render table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  margin: 20px 0;
  font-size: 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.premium-note-render th, .premium-note-render td {
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 12px;
  text-align: left;
}
.premium-note-render th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #0f172a;
}
.premium-note-render tr:last-child td {
  border-bottom: none;
}
.premium-note-render ul, .premium-note-render ol {
  margin: 16px 0;
  padding-left: 20px;
  color: #334155;
}
.premium-note-render li {
  margin-bottom: 6px;
  font-size: 15px;
}
.premium-note-render li::marker {
  color: #3b82f6 !important;
  font-weight: 600;
}
.premium-note-render hr {
  border: none;
  border-top: 2px solid #e2e8f0;
  margin: 32px 0;
}
`;

// --- COMPONENTS ---

// 1. PDF Preview
const PDFPreviewWithThumbnail: React.FC<{ 
  content: string; 
  isGenerating?: boolean;
  onGeneratePDF?: () => void;
  themeId?: string;
}> = ({ content, isGenerating = false, onGeneratePDF, themeId = 'atmosphere' }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Simple check for HTML: Check if the content starts with an HTML tag
  const isHtml = /^\s*</.test(content);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  // All themes now use light backgrounds — use theme colors directly
  const displayBg = theme.bg;
  const displayText = theme.text;
  const displayBorder = theme.border;
  const displayCardBg = theme.cardBg;
  const displayFont = theme.font || "'Inter', sans-serif";

  useEffect(() => {
    const renderMath = (element: HTMLDivElement | null) => {
      if (element) {
        try {
          renderMathInElement(element, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\(", right: "\\)", display: false },
              { left: "\\[", right: "\\]", display: true }
            ],
            throwOnError: false
          });
        } catch (err) {
          console.error("Error rendering math with KaTeX:", err);
        }
      }
    };

    renderMath(containerRef.current);
    if (showFullPreview) {
      const timer = setTimeout(() => {
        renderMath(modalContainerRef.current);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [content, isGenerating, showFullPreview]);

  const renderContent = (className: string) => {
    if (isHtml) {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className={className}
        />
      );
    }
    return (
      <div className={className}>
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{content}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div 
      className="w-full h-full border-t sm:border border-neutral-800 shadow-2xl overflow-hidden rounded-none sm:rounded-lg relative group animate-scale-in flex flex-col premium-note-render-container"
      style={{ 
        backgroundColor: "#050505", 
        fontFamily: displayFont
      }}
    >
      {/* Load theme's Google Font */}
      {theme.googleFont && (
        <link rel="stylesheet" href={theme.googleFont} />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Override root element inline padding to prevent double-padding in preview */
        .premium-note-render-container .premium-note-render .max-w-none > *[style*="padding" i] {
          padding: 0px !important;
          padding-top: 0px !important;
          padding-bottom: 0px !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }
        /* Apply theme font to all note content */
        .premium-note-render-container,
        .premium-note-render-container .premium-note-render,
        .premium-note-render-container .premium-note-render * {
          font-family: ${displayFont} !important;
        }
        .premium-note-render-container .premium-note-render h1,
        .premium-note-render-container .premium-note-render h2,
        .premium-note-render-container .premium-note-render h3,
        .premium-note-render-container .premium-note-render h4 {
          color: ${theme.primary} !important;
          font-family: ${displayFont} !important;
        }
        .premium-note-render-container .premium-note-render h2 {
          border-bottom: 2px solid ${displayBorder} !important;
        }
        .premium-note-render-container .premium-note-render p,
        .premium-note-render-container .premium-note-render li {
          color: ${displayText} !important;
        }
        .premium-note-render-container .premium-note-render a {
          color: ${theme.link} !important;
        }
        .premium-note-render-container .premium-note-render blockquote {
          background-color: ${displayCardBg} !important;
          border-left: 4px solid ${theme.primary} !important;
          color: ${displayText} !important;
        }
        .premium-note-render-container .premium-note-render table {
          border: 1px solid ${displayBorder} !important;
          background-color: ${displayCardBg} !important;
        }
        .premium-note-render-container .premium-note-render th {
          background-color: ${displayBorder} !important;
          color: ${theme.primary} !important;
          border-bottom: 1px solid ${displayBorder} !important;
        }
        .premium-note-render-container .premium-note-render td {
          border-bottom: 1px solid ${displayBorder} !important;
          color: ${displayText} !important;
        }
        .premium-note-render-container .premium-note-render code {
          background-color: ${displayCardBg} !important;
          color: ${theme.accent} !important;
          border: 1px solid ${displayBorder} !important;
        }
        .premium-note-render-container .premium-note-render pre {
          background-color: ${displayCardBg} !important;
          border: 1px solid ${displayBorder} !important;
        }
        .premium-note-render-container .premium-note-render li::marker {
          color: ${theme.primary} !important;
        }
        @media print {
          * { font-family: ${displayFont} !important; }
          body { background: ${displayBg} !important; color: ${displayText} !important; }
        }
      `}} />
      {/* Content */}
      <div 
        className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 custom-scrollbar flex justify-center bg-[#070707] sm:bg-[#0c0c0c]"
      >
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-2" />
            <p className="text-neutral-600 text-sm">Creating PDF...</p>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="w-full max-w-[800px] shadow-2xl border rounded-lg p-5 sm:p-10 md:p-14 flex flex-col premium-note-render"
            style={{ 
              backgroundColor: displayBg, 
              color: displayText,
              borderColor: displayBorder,
              minHeight: "297mm",
              height: "fit-content"
            }}
          >
            {renderContent("max-w-none")}
          </div>
        )}
      </div>

      <button className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white rounded-full h-10 w-10 z-10 flex items-center justify-center" onClick={() => setShowFullPreview(true)}>
        <Eye className="h-5 w-5" />
      </button>

      {/* Fullscreen Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div 
            className="rounded-lg w-full max-w-4xl h-[90vh] flex flex-col relative animate-scale-in"
            style={{ 
              backgroundColor: "#050505", 
              fontFamily: displayFont
            }}
          >
            <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white z-20" onClick={() => setShowFullPreview(false)}>
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 custom-scrollbar flex justify-center">
              <div 
                ref={modalContainerRef}
                className="w-full max-w-[800px] shadow-2xl border rounded-lg p-5 sm:p-10 md:p-14 flex flex-col premium-note-render"
                style={{ 
                  backgroundColor: displayBg, 
                  color: displayText,
                  borderColor: displayBorder,
                  minHeight: "297mm",
                  height: "fit-content"
                }}
              >
                {renderContent("max-w-none")}
              </div>
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

// --- MODE-AWARE MESSAGE RENDERER ---
const ModeMessageRenderer: React.FC<{ content: string; mode?: string }> = ({ content, mode }) => {
  if (!content) return null;

  if (mode === 'quiz') {
    // Quiz: render with reveal-answer interactive UI
    return <QuizRenderer content={content} />;
  }

  if (mode === 'summarize') {
    return (
      <div style={{ fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '6px 10px', background: 'linear-gradient(90deg,#7c3aed22,#dc262622)', borderRadius: 8, border: '1px solid #7c3aed33' }}>
          <BookOpen size={13} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Summary Mode</span>
        </div>
        <div className="prose prose-invert prose-sm max-w-none chat-prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  if (mode === 'explain') {
    return (
      <div style={{ fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '6px 10px', background: 'linear-gradient(90deg,#d9770622,#dc262622)', borderRadius: 8, border: '1px solid #d9770633' }}>
          <Lightbulb size={13} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Explain Mode</span>
        </div>
        <div className="prose prose-invert prose-sm max-w-none chat-prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // Default (ask mode)
  return (
    <div className="prose prose-invert prose-sm max-w-none chat-prose">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

// --- QUIZ RENDERER ---
const QuizRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggleReveal = (idx: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // Parse quiz questions from markdown (Q1. ... ✅ Answer:)
  const sections = content.split(/\n(?=\*\*Q\d+\.)/).filter(Boolean);
  const hasStructure = sections.length > 1;

  if (!hasStructure) {
    // Fallback: just render markdown
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '6px 10px', background: 'linear-gradient(90deg,#05966922,#dc262622)', borderRadius: 8, border: '1px solid #05966933' }}>
          <Brain size={13} style={{ color: '#34d399' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quiz Mode</span>
        </div>
        <div className="prose prose-invert prose-sm max-w-none chat-prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '6px 10px', background: 'linear-gradient(90deg,#05966922,#0891b222)', borderRadius: 8, border: '1px solid #05966933' }}>
        <Brain size={13} style={{ color: '#34d399' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quiz Mode — {sections.length} Questions</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sections.map((section, idx) => {
          const isRevealed = revealed.has(idx);
          const answerMatch = section.match(/\u2705\s*\*\*Answer:\*\*([\s\S]*?)(?=\n---|$)/);
          const answerText = answerMatch ? answerMatch[1].trim() : null;
          const questionBody = answerText
            ? section.replace(/\u2705\s*\*\*Answer:\*\*[\s\S]*?(?=\n---|$)/, '').trim()
            : section.trim();

          return (
            <div key={idx} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px' }}>
                <div className="prose prose-invert prose-sm max-w-none chat-prose" style={{ marginBottom: answerText ? 8 : 0 }}>
                  <ReactMarkdown>{questionBody.replace(/^---\n/, '')}</ReactMarkdown>
                </div>
                {answerText && (
                  <button
                    onClick={() => toggleReveal(idx)}
                    style={{
                      marginTop: 6, padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: isRevealed ? '#059669' : '#1a1a1a',
                      color: isRevealed ? '#fff' : '#888',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 5
                    }}
                  >
                    {isRevealed ? '✅ Answer revealed' : '👁 Reveal Answer'}
                  </button>
                )}
              </div>
              <AnimatePresence>
                {isRevealed && answerText && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ background: '#0a1a12', borderTop: '1px solid #059669/30', padding: '8px 12px', overflow: 'hidden' }}
                  >
                    <div className="prose prose-invert prose-sm max-w-none chat-prose">
                      <ReactMarkdown>{`✅ **Answer:** ${answerText}`}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 10, color: '#555', marginTop: 10, textAlign: 'center' }}>🎯 Click "Reveal Answer" after attempting each question</p>
    </div>
  );
};

// --- CHAT AI MODELS ---
// tier: 'free'  → unlimited for everyone
// tier: 'pro'   → unlimited for pro + power, 2 free messages for free users
// tier: 'power' → unlimited for power only, 2 free messages for free/pro users
const CHAT_AI_MODELS = [
  {
    id: 'paperchat',
    name: 'PaperChat',
    desc: "Paperxify's own model",
    logoUrl: '/paperxify.jpeg',
    logoFallback: '\uD83D\uDCC4',
    tier: 'free' as const,
    accentColor: '#dc2626',
    freeLimit: Infinity,
    persona: "You are PaperChat, Paperxify's own advanced AI study assistant. You are expert at helping students understand notes, generate quizzes, and explain complex topics clearly."
  },
  {
    id: 'gpt4o',
    name: 'ChatGPT 4o',
    desc: 'OpenAI \u00b7 Frontier model',
    logoUrl: '/chatgpt.png',
    logoFallback: '\uD83E\uDD16',
    tier: 'pro' as const,
    accentColor: '#10b981',
    freeLimit: 2,
    persona: "You are ChatGPT 4o, OpenAI's most advanced model. You provide detailed, accurate, and well-reasoned responses with exceptional clarity."
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V4 Flash',
    desc: 'DeepSeek \u00b7 Speed & Precision',
    logoUrl: '/deepseek.png',
    logoFallback: '\uD83D\uDC33',
    tier: 'pro' as const,
    accentColor: '#1d4ed8',
    freeLimit: 2,
    persona: 'You are DeepSeek V4 Flash, an advanced language model trained by DeepSeek. You are highly accurate, extremely fast, and provide deep reasoning and clear assistance.'
  },
  {
    id: 'claude',
    name: 'Claude 3.5',
    desc: 'Anthropic \u00b7 Thoughtful AI',
    logoUrl: '/claude-color.png',
    logoFallback: '\uD83C\uDF1F',
    tier: 'power' as const,
    accentColor: '#f97316',
    freeLimit: 2,
    persona: 'You are Claude 3.5 by Anthropic. You are thoughtful, nuanced, and highly accurate. You excel at deep reasoning and safe, helpful responses.'
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0',
    desc: 'Google DeepMind \u00b7 Multimodal',
    logoUrl: '/gemini.png',
    logoFallback: '\u264A',
    tier: 'power' as const,
    accentColor: '#4285f4',
    freeLimit: 2,
    persona: 'You are Gemini 2.0 by Google DeepMind. You are a multimodal AI that provides precise, structured, and helpful academic assistance.'
  },
];

type UserPlan = 'free' | 'pro' | 'power';

// Which models are UNLIMITED for each plan
const PLAN_UNLIMITED: Record<UserPlan, string[]> = {
  free:  ['paperchat'],
  pro:   ['paperchat', 'gpt4o', 'deepseek'],
  power: ['paperchat', 'gpt4o', 'deepseek', 'claude', 'gemini'],
};

// Plan display metadata
const PLAN_META: Record<UserPlan, { label: string; color: string }> = {
  free:  { label: 'Free',  color: '#6b7280' },
  pro:   { label: 'Pro',   color: '#8b5cf6' },
  power: { label: 'Power', color: '#f59e0b' },
};

// Required plan to use each model tier
const TIER_REQUIRED_PLAN: Record<string, UserPlan> = {
  free:  'free',
  pro:   'pro',
  power: 'power',
};

interface PaperChatInputProps {
  input: string;
  setInput: (v: string) => void;
  isThinking: boolean;
  isSubscribed: boolean;
  canSendOverride: boolean;
  onSubmit: (e: React.FormEvent) => void;
  selectedMode: typeof CHAT_MODES[0];
  setSelectedMode: (m: typeof CHAT_MODES[0]) => void;
}

const CHAT_MODES = [
  { id: 'ask', label: 'Ask', description: 'Ask questions about the note', icon: HelpCircle },
  { id: 'summarize', label: 'Summarize', description: 'Summarize sections of the note', icon: BookOpen },
  { id: 'quiz', label: 'Quiz Me', description: 'Test your knowledge from the note', icon: Brain },
  { id: 'explain', label: 'Explain', description: 'Get a simpler explanation', icon: Lightbulb },
];

const QUICK_ACTIONS = [
  { label: 'Summarize this note', icon: BookOpen, color: '#7c3aed' },
  { label: 'What are the key concepts?', icon: Zap, color: '#0891b2' },
  { label: 'Quiz me on this topic', icon: Brain, color: '#059669' },
  { label: 'Explain in simple terms', icon: Lightbulb, color: '#d97706' },
  { label: 'List all important points', icon: FileText, color: '#dc2626' },
];

const PaperChatInput: React.FC<PaperChatInputProps> = ({
  input, setInput, isThinking, isSubscribed, canSendOverride, onSubmit, selectedMode, setSelectedMode
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [input]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowActionMenu(false);
        setShowModeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isThinking && canSendOverride) {
        onSubmit(e as any);
      }
    }
  };

  const applyQuickAction = (label: string) => {
    setInput(label);
    setShowActionMenu(false);
    textareaRef.current?.focus();
  };

  const canSend = input.trim().length > 0 && !isThinking && canSendOverride;

  return (
    <div
      className="p-3 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur shrink-0 mb-16 lg:mb-0 relative z-10"
      ref={wrapperRef}
    >
      {/* Input Box */}
      <div className="paperchat-input-box px-4 pt-3 pb-2">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="paperchat-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={canSendOverride ? `${selectedMode.description}... (Enter to send, Shift+Enter for newline)` : 'Limit reached — switch to PaperChat (Free)'}
          disabled={!canSendOverride}
          rows={1}
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between mt-2 gap-2">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            {/* + Actions button */}
            <div className="relative">
              <button
                className="plus-btn"
                onClick={() => { setShowActionMenu(p => !p); setShowModeMenu(false); }}
                disabled={!canSendOverride}
                title="Quick actions"
              >
                <Plus size={15} />
              </button>

              {/* Actions dropdown */}
              <AnimatePresence>
                {showActionMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="action-menu"
                  >
                    <p style={{ fontSize: 11, color: '#666', padding: '4px 12px 6px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Quick Prompts
                    </p>
                    {QUICK_ACTIONS.map(action => (
                      <div
                        key={action.label}
                        className="action-menu-item"
                        onClick={() => applyQuickAction(action.label)}
                      >
                        <span className="icon-wrap" style={{ background: action.color + '22' }}>
                          <action.icon size={13} style={{ color: action.color }} />
                        </span>
                        {action.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mode Selector */}
            <div className="relative">
              <button
                className={`mode-chip ${selectedMode.id !== 'ask' ? 'active' : ''}`}
                onClick={() => { setShowModeMenu(p => !p); setShowActionMenu(false); }}
                disabled={!isSubscribed}
              >
                <selectedMode.icon size={11} />
                {selectedMode.label}
                <ChevronDown size={10} style={{ opacity: 0.6 }} />
              </button>

              {/* Mode dropdown */}
              <AnimatePresence>
                {showModeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="mode-menu"
                  >
                    <p style={{ fontSize: 11, color: '#666', padding: '4px 12px 6px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Chat Mode
                    </p>
                    {CHAT_MODES.map(mode => (
                      <div
                        key={mode.id}
                        className={`mode-menu-item ${selectedMode.id === mode.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedMode(mode); setShowModeMenu(false); }}
                      >
                        <mode.icon size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 1 }}>{mode.label}</div>
                          <div style={{ fontSize: 11, opacity: 0.5 }}>{mode.description}</div>
                        </div>
                        <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Send button */}
            <button
              className="send-btn"
              disabled={!canSend}
              onClick={e => { if (canSend) onSubmit(e as any); }}
              title="Send (Enter)"
            >
              {isThinking
                ? <Loader2 size={14} className="animate-spin" />
                : <Send size={14} style={{ transform: 'translateX(1px)' }} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Hint text */}
      {isSubscribed && (
        <p style={{ textAlign: 'center', fontSize: 10, color: '#444', marginTop: 6 }}>
          Enter ↵ to send · Shift+Enter for new line · Context-aware AI
        </p>
      )}
    </div>
  );
};

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSubscribed: boolean;
  onExportPDF: () => void;
  onExportMarkdown: () => void;
  isGeneratingPDF: boolean;
  router: any;
  noteTitle: string;
  noteContent: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen, onClose, isSubscribed, onExportPDF, onExportMarkdown, isGeneratingPDF, router, noteTitle, noteContent
}) => {
  const [notionStep, setNotionStep] = useState<'options' | 'upgrade' | 'connect' | 'syncing'>('options');
  
  useEffect(() => {
    if (!isOpen) {
      setNotionStep('options');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNotionClick = () => {
    if (!isSubscribed) {
      setNotionStep('upgrade');
    } else {
      const savedToken = localStorage.getItem("notion_token");
      if (savedToken) {
        triggerNotionSync();
      } else {
        setNotionStep('connect');
      }
    }
  };

  const triggerNotionSync = async () => {
    setNotionStep('syncing');
    const notionToken = localStorage.getItem("notion_token");
    try {
      const isHtml = noteContent.includes('<h1') || noteContent.includes('<p>') || noteContent.includes('<div') || /<[a-z][\s\S]*>/i.test(noteContent);
      let markdown = noteContent;
      if (isHtml) {
        const turndownService = new TurndownService();
        markdown = turndownService.turndown(noteContent);
      }

      const response = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteTitle,
          noteContent: markdown,
          notionToken
        })
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success("Note synced to Notion successfully!");
        onClose();
        if (resData.pageUrl) {
          window.open(resData.pageUrl, '_blank');
        }
      } else {
        toast.error(resData.message || "Failed to sync to Notion");
        setNotionStep('options');
      }
    } catch (err) {
      console.error(err);
      toast.error("Notion sync failed due to network error.");
      setNotionStep('options');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.06)_0%,_transparent_75%)] pointer-events-none transform-gpu" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white bg-white/5 border border-white/10 rounded-full p-1.5 transition-all z-20"
        >
          <X size={14} />
        </button>

        {notionStep === 'options' && (
          <div className="space-y-5 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-medium uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Export Engine
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">EXPORT <span className="text-red-500">NOTE</span></h3>
              <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-sm">Convert and transfer your study notes into your preferred external formats.</p>
            </div>

            <div className="space-y-3">
              {/* PDF Card */}
              <button
                onClick={() => { onExportPDF(); onClose(); }}
                className="flex items-center gap-4 w-full p-4 rounded-2xl bg-neutral-950/40 border border-white/5 hover:border-red-500/30 hover:bg-neutral-800/40 text-left transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 group-hover:scale-105 transition-transform shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Export as PDF</div>
                  <div className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors line-clamp-1">Clean, print-ready document without watermarks</div>
                </div>
              </button>

              {/* Markdown Card */}
              <button
                onClick={() => { onExportMarkdown(); onClose(); }}
                className="flex items-center gap-4 w-full p-4 rounded-2xl bg-neutral-950/40 border border-white/5 hover:border-blue-500/30 hover:bg-neutral-800/40 text-left transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                  <Download size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Export as Markdown</div>
                  <div className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors line-clamp-1">Perfect for Obsidian, Notion, or local Markdown editors</div>
                </div>
              </button>

              {/* Notion Card */}
              <button
                onClick={handleNotionClick}
                className="flex items-center gap-4 w-full p-4 rounded-2xl bg-neutral-950/40 border border-white/5 hover:border-amber-500/30 hover:bg-neutral-800/40 text-left transition-all duration-300 group relative overflow-hidden shrink-0"
              >
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.459 4.208c.15-.226.338-.376.812-.489l11.458-1.579c.902-.131 1.09.113 1.09.808v16.143c0 .545-.169.752-.77.827L5.85 20.916c-.507.075-.77-.132-.77-.733V4.866c0-.282.169-.47.282-.658h.097zM2.017 3.325c-.244.188-.413.489-.413.921v16.293c0 .921.619 1.485 1.54 1.353l17.788-2.312c.732-.094.957-.451.957-1.127V2.518c0-.752-.451-1.071-1.127-.978L3.107 3.006c-.544.075-.92.15-1.09.319zm13.111 4.549c.282-.038.508.15.508.47v7.501c0 .282-.207.451-.508.489l-2.067.169v-.094c.169-.131.282-.376.282-.676v-5.263l-4.116 5.864c-.169.244-.413.395-.732.413l-1.955.15c-.282.019-.488-.169-.488-.47v-7.389c0-.282.207-.47.507-.507l1.936-.15v.094c-.15.113-.263.357-.263.639v5.094l3.966-5.714c.188-.263.413-.395.77-.413l2.171-.17v.019z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    Sync to Notion
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Pro</span>
                  </div>
                  <div className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors line-clamp-1">Push notes directly into your Notion workspace pages</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {notionStep === 'upgrade' && (
          <div className="text-center py-6 relative z-10 flex flex-col items-center">
            <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 animate-bounce shrink-0">
              <Lock size={36} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">PREMIUM LOCKED</h3>
            <p className="text-xs md:text-sm text-neutral-400 mt-2 max-w-xs leading-relaxed">
              Notion Sync is a Pro features integration. Upgrade now to unlock automated workspace syncing and premium PDF exports.
            </p>
            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setNotionStep('options')}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => router.push('/pricing')}
                className="flex-1 py-3 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl transition text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}

        {notionStep === 'connect' && (
          <div className="text-center py-6 relative z-10 flex flex-col items-center">
            <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 animate-pulse shrink-0">
              <Sparkles size={36} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">CONNECT NOTION</h3>
            <p className="text-xs md:text-sm text-neutral-400 mt-2 max-w-xs leading-relaxed">
              Securely grant Paperxify access to create study pages in your Notion workspace.
            </p>
            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setNotionStep('options')}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('notion_redirect_back', window.location.pathname);
                  window.location.href =
                    'https://api.notion.com/v1/oauth/authorize?client_id=36ad872b-594c-8107-a869-00370d5b7599&response_type=code&owner=user&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fnotion%2Fcallback';
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition text-xs"
              >
                Authorize Notion
              </button>
            </div>
          </div>
        )}

        {notionStep === 'syncing' && (
          <div className="text-center py-12 relative z-10 flex flex-col items-center">
            <Loader2 className="animate-spin text-red-500 mb-4 shrink-0" size={40} />
            <h3 className="text-lg font-bold text-white">SYNCING WORKSPACE</h3>
            <p className="text-xs text-neutral-400 mt-2 animate-pulse">Constructing blocks and publishing to Notion...</p>
          </div>
        )}
      </motion.div>
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
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  
  // Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan>('free');

  // Editor State
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const tinyMceRef = useRef<any>(null);

  // Chat State
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [selectedMode, setSelectedMode] = useState(CHAT_MODES[0]);

  // --- Persist model selection in localStorage ---
  const [selectedChatModel, setSelectedChatModelRaw] = useState(() => {
    if (typeof window === 'undefined') return CHAT_AI_MODELS[0];
    const saved = localStorage.getItem('paperchat_selected_model');
    if (saved) {
      const found = CHAT_AI_MODELS.find(m => m.id === saved);
      if (found) return found;
    }
    return CHAT_AI_MODELS[0];
  });

  const setSelectedChatModel = (m: typeof CHAT_AI_MODELS[0]) => {
    setSelectedChatModelRaw(m);
    if (typeof window !== 'undefined') {
      localStorage.setItem('paperchat_selected_model', m.id);
    }
  };

  const [showModelPicker, setShowModelPicker] = useState(false);
  const modelPickerRef = React.useRef<HTMLDivElement>(null);

  // --- Persist free message counts ---
  const [freeModelCounts, setFreeModelCountsRaw] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('paperchat_free_counts');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const setFreeModelCounts = (updater: (prev: Record<string, number>) => Record<string, number>) => {
    setFreeModelCountsRaw(prev => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        localStorage.setItem('paperchat_free_counts', JSON.stringify(next));
      }
      return next;
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // PDF State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Initialize Styles + close picker on outside click
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = iphoneStyles;
    document.head.appendChild(styleElement);

    const handleOutsideClick = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.head.removeChild(styleElement);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
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
          const active = !!userObj.membership?.isActive;
          setIsSubscribed(active);
          // Detect plan: look for 'power' or 'pro' in plan name
          if (active) {
            const planName = (userObj.membership?.plan || '').toLowerCase();
            if (planName.includes('power')) setUserPlan('power');
            else setUserPlan('pro');
          } else {
            setUserPlan('free');
          }
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }

      if (MOCK_NOTES[slug]) {
        const mockNote = MOCK_NOTES[slug];
        setData({
          _id: mockNote._id,
          title: mockNote.title,
          content: mockNote.content,
          videoUrl: mockNote.videoUrl,
          thumbnail: mockNote.thumbnail,
          generationDetails: mockNote.generationDetails
        });
        const rawContent = mockNote.content || "";
        const isRawHtml = /^\s*</.test(rawContent);
        let htmlContent = rawContent;
        if (!isRawHtml && rawContent.trim()) {
          htmlContent = marked.parse(rawContent) as string;
        }
        setMarkdownContent(htmlContent);
        setMessages(mockNote.messages);
        setLoading(false);
        return;
      }

      const res = await api.get(`/notes/slug/${slug}`, { headers: { 'Auth': authToken } });
      setData(res.data);
      
      const rawContent = res.data.content || "";
      const isRawHtml = /^\s*</.test(rawContent);
      const isFlashcardNote = res.data.generationDetails?.format === 'flashcards' || 
                              (rawContent.trim().startsWith('[') && rawContent.includes('"front"'));
      
      let htmlContent = rawContent;
      if (!isRawHtml && !isFlashcardNote && rawContent.trim()) {
        htmlContent = marked.parse(rawContent) as string;
      }
      setMarkdownContent(htmlContent);
      
      // Load Messages
      try {
        const msgRes = await api.get<ApiMessagesResponse>(`/chat/getMessages/${res.data._id}`, { headers: { 'Auth': authToken } });
        setMessages(msgRes.data.messages);
      } catch (e) {
        setMessages([{ _id: "welcome", role: "assistant", content: "Hello! I am PaperChat. How can I help you with this note?", timestamp: new Date().toISOString() }]);
      }

    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        setHasPermission(false);
        setShowLoginDialog(true);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadNoteData(); }, [loadNoteData]);
  
  const [thinkingMessage, setThinkingMessage] = useState("Thinking...");

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

  // Thinking Message Cycler
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isThinking) {
      const messages = ["Analyzing...", "Thinking...", "Reasoning...", "Synthesizing...", "Crafting Response..."];
      let i = 0;
      interval = setInterval(() => {
        setThinkingMessage(messages[i % messages.length]);
        i++;
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  // Notion Connection Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('notion_connected') === 'true') {
        const workspace = localStorage.getItem("notion_workspace") || "Notion Workspace";
        toast.success(`Successfully connected to workspace: ${workspace}`);
        
        // Clean URL parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        router.replace(newUrl);
        
        // Open export dialog so user can sync right away
        setShowExportDialog(true);
      }
    }
  }, [router]);

  // Actions
  const handleSave = async () => {
    if (!data?._id) return;
    if (data._id.startsWith("mock-note")) {
      setIsDirty(false);
      toast.success("Note saved successfully (Mock)");
      return;
    }
    try {
      await api.put(`/notes/update/${data._id}`, { content: markdownContent }, { headers: { 'Auth': getAuthToken() } });
      setIsDirty(false);
      toast.success("Note saved successfully");
    } catch (e) { 
      toast.error("Save failed");
    }
  };

  const handleFeedback = async (messageId: string, feedback: "good" | "bad") => {
    if (!data?._id) return;
    try {
      // Optimistic update
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, feedback } : msg
      ));

      if (data._id.startsWith("mock-note")) {
        toast.success(feedback === 'good' ? 'Great! Glad you liked it.' : 'Thanks for the feedback. We will improve.');
        return;
      }

      await api.post('/chat/feedback', {
        noteId: data._id,
        messageId,
        feedback
      });
      
      toast.success(feedback === 'good' ? 'Great! Glad you liked it.' : 'Thanks for the feedback. We will improve.');
    } catch (err) {
      console.error("Feedback error:", err);
      toast.error("Failed to save feedback");
    }
  };

  // Derived: can the current user send on the selected model?
  const currentModelFreeCount = freeModelCounts[selectedChatModel.id] || 0;
  const isModelUnlimited = PLAN_UNLIMITED[userPlan].includes(selectedChatModel.id);
  const canUseModel = isModelUnlimited || currentModelFreeCount < selectedChatModel.freeLimit;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    if (!canUseModel) return;
    
    const currentMode = selectedMode.id;
    const userMsg: ApiMessage = { 
      _id: Date.now().toString(), 
      role: "user", 
      content: input, 
      timestamp: new Date().toISOString(),
      mode: currentMode
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      if (data?._id && data._id.startsWith("mock-note")) {
        // Wait 1.2 seconds to simulate thinking
        setTimeout(() => {
          setIsThinking(false);
          const responses: Record<string, string[]> = {
            "mock-note-hackers": [
              "Interesting question! Under cybersecurity frameworks, detecting AI-powered attacks requires behavior-based anomaly detection. Traditional security filters can't catch perfect language, but they can catch unusual access patterns.",
              "Exactly. The primary takeaway from this lecture is that organizations need to shift from passive email filters to dynamic authentication and continuous user verification.",
              "Yes! That is a key vulnerability. Implementing multi-factor authentication (MFA) and strong encryption protocols significantly reduces the blast radius of voice cloning or phishing attempts."
            ],
            "mock-note-nextjs": [
              "Great point! Next.js 15 App Router renders components server-side first, generating HTML that is immediately streamable. Client-side hydration happens seamlessly without blocking the page display.",
              "Under the hood, Server Actions route requests through post handlers. Next.js manages these routes internally, bypassing standard REST configurations to optimize developer velocity.",
              "Absolutely. By disabling default caching for GET requests in Next.js 15, the framework aligns with standard web API expectations, reducing cache invalidation bugs."
            ],
            "mock-note-deepseek": [
              "DeepSeek R1's reasoning capability relies heavily on reinforcement learning to discover chains of thought. Traditional LLMs are only fine-tuned via human preference, making R1 more robust for logic.",
              "Indeed. Open-source weights allow research teams to run models locally, reducing data privacy issues and bringing high-quality reasoning to smaller consumer-grade machines.",
              "That is correct. While GPT-4o offers rich multimodality and speed, R1's reinforcement learning loops enable deep self-correction that prevents typical LLM logic failures."
            ],
            "mock-note-tailwind": [
              "Using Tailwind CSS Grid is perfect for major layouts. Keep in mind that responsive columns can be nested: you can have a Flex layout inside a Grid card to handle micro-alignments.",
              "For responsive layouts, remember Tailwind is mobile-first: `grid-cols-1 md:grid-cols-3` means 1 column by default, and 3 columns starting from the medium screen width breakpoint.",
              "Yes, spacing is key. Using utility classes like `gap-4` or `space-y-2` helps keep margins unified across elements without writing custom CSS properties."
            ],
            "mock-note-solid": [
              "Applying SOLID principles makes React components highly reusable. By separating API calls from presentational tags, you can mock and test your components without invoking a real server.",
              "The Open/Closed Principle in React is typically implemented using composition. By nesting components with `{children}`, you allow extensions without refactoring parent files.",
              "Interface segregation is about not forcing components to depend on props they don't use. In React, pass only the specific data a component needs rather than passing the entire big data object."
            ]
          };
          
          const list = responses[data._id] || [
            "That's a very good observation. Studies show that active recall and summarizing notes leads to a 50% increase in long-term retention compared to re-reading.",
            "I'm here to help! Could you clarify if you want me to expand on this point, or generate a quick practice quiz about it?",
            "Let's break this down further. If we analyze the core concepts in this section, we can see the relationship between input variables and the final generated output."
          ];
          
          // Pick a random response
          const content = list[Math.floor(Math.random() * list.length)];
          
          setMessages(prev => [...prev, {
            _id: (Date.now() + 1).toString(),
            role: "assistant",
            content,
            timestamp: new Date().toISOString(),
            mode: currentMode
          }]);
        }, 1200);
        return;
      }

      const authToken = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth': authToken || '',
        },
        body: JSON.stringify({ 
          noteId: data?._id, 
          message: userMsg.content,
          mode: currentMode,
          chatModelPersona: selectedChatModel.persona,
          chatModelId: selectedChatModel.id
        }),
      });

      if (!response.ok) throw new Error('Failed to connect to chat service');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // Initial empty AI message
      const aiMsgId = (Date.now() + 1).toString();
      const initialAiMsg: ApiMessage = {
        _id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        videoLink: data?.videoUrl,
        mode: currentMode
      };
      
      setMessages(prev => [...prev, initialAiMsg]);
      setIsThinking(false); // Stop thinking once stream starts

      let accumulatedContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  // Update the specific AI message with accumulated content
                  setMessages(prev => prev.map(msg => 
                    msg._id === aiMsgId ? { ...msg, content: accumulatedContent } : msg
                  ));
                }
              } catch (e) {
                console.warn("Error parsing chunk", e);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Chat Error:", e);
      setMessages(prev => [...prev, { 
        _id: "err-" + Date.now(), 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again.", 
        timestamp: new Date().toISOString() 
      }]);
    } finally {
      setIsThinking(false);
      // Increment free message counter if this model is NOT unlimited for this plan
      if (!isModelUnlimited) {
        setFreeModelCounts(prev => ({
          ...prev,
          [selectedChatModel.id]: (prev[selectedChatModel.id] || 0) + 1
        }));
      }
    }
  };

  // Generate PDF and instantly download
  const generatePDF = async () => {
    if (!data?._id) return;

    setIsGeneratingPDF(true);
    const toastId = toast.loading('⏳ Generating PDF — this may take 20–30 seconds…');

    try {
      let res;
      const authToken = getAuthToken();

      if (data._id.startsWith("mock-note")) {
        res = await api.post(`/notes/generate/pdf-from-content`, {
          content: markdownContent,
          title: data.title,
          theme: data.generationDetails?.theme || 'blueberry'
        }, {
          headers: { 'Auth': authToken },
          timeout: 120_000,   // 2-min timeout for large notes
        });
      } else {
        res = await api.get(`/notes/generate/pdf?noteId=${data._id}`, {
          headers: { 'Auth': authToken },
          timeout: 120_000,
        });
      }

      if (res.data.success && res.data.data?.pdf) {
        // Efficient base64 → Uint8Array (avoids intermediate sparse Array allocation)
        const base64 = res.data.data.pdf as string;
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = res.data.data.fileName || `${(data.title || 'Paperxify').replace(/[^\w\s.-]/gi, '_').substring(0, 80)}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Delay revocation — browser needs time to read the object URL and start the download
        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 3000);

        toast.success(`✅ PDF downloaded! (${res.data.data.imagesEmbedded || 0} images embedded)`, { id: toastId });
      } else {
        toast.error('PDF generation failed — please try again.', { id: toastId });
      }
    } catch (error: any) {
      console.error("PDF Generation Failed:", error);
      const msg = error.code === 'ECONNABORTED'
        ? 'Request timed out — the note may be too large. Try again.'
        : error.response?.data?.message || "Failed to generate PDF";
      toast.error(msg, { id: toastId });
    } finally {
      setIsGeneratingPDF(false);
    }
  };


  // Export markdown content as .md file
  const exportMarkdown = () => {
    if (!markdownContent || !data) return;
    try {
      const isHtml = markdownContent.includes('<h1') || markdownContent.includes('<p>') || markdownContent.includes('<div') || /<[a-z][\s\S]*>/i.test(markdownContent);
      let markdown = markdownContent;
      if (isHtml) {
        const turndownService = new TurndownService();
        markdown = turndownService.turndown(markdownContent);
      }
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const fileName = `${data.title.replace(/[^\w\s.-]/gi, '_').substring(0, 80)}.md`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Markdown file exported successfully");
    } catch (err) {
      console.error("Markdown Export Failed:", err);
      toast.error("Failed to export Markdown");
    }
  };
  
  const isFlashcard = data?.generationDetails?.format === 'flashcards' || 
                     (data?.content && data.content.trim().startsWith('[') && data.content.includes('"front"'));

  if (loading) return <LoaderX />;
  if (!hasPermission) return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <Lock className="h-12 w-12 text-red-500 mb-4"/>
      <h2 className="text-xl font-bold">Access Restricted</h2>
      <Button onClick={() => setShowLoginDialog(true)} className="mt-4 bg-red-600">Login</Button>
      <LoginDialog isOpen={showLoginDialog} onClose={() => router.push('/youtube-to-notes')} onSuccess={() => {setShowLoginDialog(false); loadNoteData();}} />
    </div>
  );

  return (
    <div className="h-dvh-screen w-screen bg-black flex flex-col overflow-hidden text-neutral-200">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.8%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22/%3E%3C/svg%3E')] opacity-[0.02] mix-blend-overlay" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-full lg:flex-row">
        
        {/* Header (Mobile Only) */}
        <div className="lg:hidden shrink-0">
          <Header title={data?.title || "Note"} onBack={() => router.push('/youtube-to-notes')} />
        </div>

        {/* LEFT PANEL: Editor & Preview */}
        <div className={`flex-1 flex flex-col min-h-0 lg:border-r border-neutral-800 ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Desktop Tabs */}
          <div className="hidden lg:flex p-2 border-b border-neutral-800 gap-2 items-center justify-between bg-neutral-900/50">
             <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/youtube-to-notes')}><ArrowLeft className="h-4 w-4 mr-1"/> Home</Button>
                <h2 className="font-semibold text-white self-center ml-2">{data?.title}</h2>
             </div>
             <div className="flex bg-black/50 p-1 rounded-lg">
                <Button size="sm" variant={mobileView === 'preview' ? 'secondary' : 'ghost'} onClick={() => setMobileView('preview')} className="text-xs h-7"><Eye className="h-3 w-3 mr-1"/> Preview</Button>
                <Button size="sm" variant={mobileView === 'editor' ? 'secondary' : 'ghost'} onClick={() => setMobileView('editor')} className="text-xs h-7"><Edit className="h-3 w-3 mr-1"/> Edit</Button>
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative mobile-safe-bottom">
            
            {/* VIEW: PREVIEW */}
            <div className={`absolute inset-0 p-0 sm:p-3 lg:p-6 transition-opacity duration-300 ${mobileView === 'preview' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
               <div className="h-full w-full max-w-4xl mx-auto flex flex-col">
                 <div className="flex justify-between items-center mb-4 px-4 sm:px-0 mt-3 sm:mt-0">
                    <h3 className="text-lg font-bold text-white">{isFlashcard ? 'Flashcards Preview' : 'Document Preview'}</h3>
                    {!isFlashcard && (
                      <Button size="sm" variant="outline" onClick={() => setShowExportDialog(true)} className="h-8 border-neutral-700 hover:bg-neutral-800 hover:text-white text-neutral-300">
                        <Download className="h-4 w-4 mr-2"/>
                        Export Note
                      </Button>
                    )}
                 </div>
                 <div className="flex-1 min-h-0">
                    {isFlashcard ? (
                       <div className="w-full h-full border border-neutral-800 shadow-2xl overflow-hidden rounded-lg bg-neutral-950 relative group flex flex-col">
                         <FlashcardViewer content={markdownContent} />
                       </div>
                    ) : (
                       <PDFPreviewWithThumbnail 
                         content={markdownContent} 
                         isGenerating={isGeneratingPDF}
                         onGeneratePDF={generatePDF}
                         themeId={data?.generationDetails?.theme || 'blueberry'}
                       />
                    )}
                 </div>
               </div>
            </div>

            {/* VIEW: EDITOR */}
            <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${mobileView === 'editor' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-300">Live Note Editor</span>
                 </div>
                 {isDirty && (
                   <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs font-semibold px-3 rounded-lg shadow-lg">
                     <Save className="h-3.5 w-3.5 mr-1.5"/> Save Changes
                   </Button>
                 )}
              </div>
              <div className="flex-1 bg-white">
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  onInit={(_, editor) => (tinyMceRef.current = editor)}
                  value={markdownContent}
                  init={{
                    height: '100%',
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                             'bold italic underline strikethrough | forecolor backcolor | ' +
                             'alignleft aligncenter alignright alignjustify | ' +
                             'bullist numlist outdent indent | table link image code | removeformat',
                    content_style: `
                      body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                        font-size: 16px; 
                        padding: 24px; 
                        color: #1e293b;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                      }
                      /* Override root element inline padding to prevent double-padding in editor */
                      body > *[style*="padding" i] {
                        padding: 0px !important;
                        padding-top: 0px !important;
                        padding-bottom: 0px !important;
                        padding-left: 0px !important;
                        padding-right: 0px !important;
                      }
                      h1, h2, h3, h4, h5, h6 {
                        color: #0f172a;
                        font-weight: 700;
                        margin-top: 24px;
                        margin-bottom: 12px;
                        font-family: inherit;
                      }
                      h1 { font-size: 28px; }
                      h2 { font-size: 22px; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; color: #1d4ed8; }
                      h3 { font-size: 18px; }
                      p { margin-bottom: 16px; }
                      ul, ol { margin-bottom: 16px; padding-left: 24px; }
                      li { margin-bottom: 6px; }
                      blockquote {
                        border-left: 4px solid #3b82f6;
                        padding-left: 16px;
                        color: #475569;
                        font-style: italic;
                        margin: 16px 0;
                        background-color: #f8fafc;
                        padding: 12px 16px;
                        border-radius: 0 8px 8px 0;
                      }
                      table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        margin: 16px 0;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        overflow: hidden;
                      }
                      th, td {
                        border-bottom: 1px solid #e2e8f0;
                        padding: 10px 12px;
                        text-align: left;
                      }
                      th {
                        background-color: #f8fafc;
                        font-weight: 600;
                        color: #0f172a;
                      }
                      tr:last-child td {
                        border-bottom: none;
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 16px auto;
                        display: block;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                      }
                      code {
                        background-color: #f1f5f9;
                        color: #0f172a;
                        padding: 2px 4px;
                        border-radius: 4px;
                        font-family: monospace;
                        font-size: 14px;
                      }
                    `,
                    statusbar: true,
                  }}
                  onEditorChange={(c) => { setMarkdownContent(c); setIsDirty(true); }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Chat */}
        <div className={`flex-1 lg:flex-[0_0_400px] xl:flex-[0_0_450px] bg-neutral-900/50 flex flex-col min-h-0 ${mobileView === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Chat Panel Header with Model Selector */}
          <div className="p-3 border-b border-neutral-800 bg-neutral-950/60 backdrop-blur shrink-0 relative z-30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Selected model logo */}
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900 flex items-center justify-center shrink-0">
                  <img
                    src={selectedChatModel.logoUrl}
                    alt={selectedChatModel.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                  />
                  <span className="absolute text-xs" style={{ display: 'none' }}>{selectedChatModel.logoFallback}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white leading-none">{selectedChatModel.name}</h3>
                  <p className="text-[10px] text-green-400 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                    Online
                    {/* Show free-messages-left only for models NOT unlimited on this plan */}
                    {!isModelUnlimited && selectedChatModel.freeLimit !== Infinity && (
                      <span className="text-neutral-600 ml-1">
                        &middot; {Math.max(0, selectedChatModel.freeLimit - currentModelFreeCount)} free left
                      </span>
                    )}
                    {isModelUnlimited && (
                      <span className="text-neutral-600 ml-1">&middot; Unlimited</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Model Picker Button */}
              <div className="relative" ref={modelPickerRef}>
                <button
                  onClick={() => setShowModelPicker(p => !p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                    showModelPicker
                      ? 'bg-white/[0.1] border-white/20 text-white'
                      : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/15 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={11} className={showModelPicker ? 'text-white' : 'text-neutral-500'} />
                  Switch Model
                  <ChevronDown size={10} className={`transition-transform ${showModelPicker ? 'rotate-180 text-white' : 'text-neutral-600'}`} />
                </button>

                {/* Model Picker Dropdown */}
                <AnimatePresence>
                  {showModelPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-[#09090b] border border-white/[0.08] rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50"
                      style={{ background: '#09090b' }}
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600 px-3 py-2">Select AI Model</p>
                      {CHAT_AI_MODELS.map(m => {
                        const count = freeModelCounts[m.id] || 0;
                        const isUnlimitedForUser = PLAN_UNLIMITED[userPlan].includes(m.id);
                        const remaining = isUnlimitedForUser ? Infinity : Math.max(0, m.freeLimit - count);
                        const requiredPlan = TIER_REQUIRED_PLAN[m.tier];
                        // "Locked" = needs an upgrade to get unlimited, AND free uses are exhausted
                        const isHardLocked = !isUnlimitedForUser && remaining === 0;
                        const isActive = selectedChatModel.id === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              setSelectedChatModel(m);
                              setShowModelPicker(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group/row"
                            style={{
                              background: isActive ? 'rgba(255,255,255,0.07)' : undefined,
                              border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                              opacity: isHardLocked ? 0.55 : 1,
                            }}
                          >
                            {/* Logo */}
                            <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden rounded-xl"
                              style={{
                                background: isActive ? `${m.accentColor}18` : 'rgba(255,255,255,0.04)',
                                border: isActive ? `1px solid ${m.accentColor}35` : '1px solid rgba(255,255,255,0.07)',
                              }}
                            >
                              <img
                                src={m.logoUrl}
                                alt={m.name}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = 'none';
                                  const fallback = el.nextSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                              <span className="text-sm hidden">{m.logoFallback}</span>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-neutral-300 group-hover/row:text-white'}`}>{m.name}</span>
                                {/* Access badge */}
                                {isUnlimitedForUser ? (
                                  <span
                                    className="text-[8px] font-black px-1.5 py-0.5 rounded border"
                                    style={{ color: PLAN_META[userPlan].color, borderColor: `${PLAN_META[userPlan].color}40`, background: `${PLAN_META[userPlan].color}15` }}
                                  >
                                    {userPlan === 'free' ? 'FREE ∞' : `${PLAN_META[userPlan].label} ∞`}
                                  </span>
                                ) : remaining > 0 ? (
                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400">
                                    {remaining} free
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/25 text-red-400 flex items-center gap-0.5">
                                    <Lock size={7} />USED
                                  </span>
                                )}
                                {/* Required plan tag (when not already at that plan) */}
                                {requiredPlan !== 'free' && !isUnlimitedForUser && (
                                  <span
                                    className="text-[8px] font-black px-1.5 py-0.5 rounded border"
                                    style={{ color: PLAN_META[requiredPlan].color, borderColor: `${PLAN_META[requiredPlan].color}35`, background: `${PLAN_META[requiredPlan].color}10` }}
                                  >
                                    {PLAN_META[requiredPlan].label}+
                                  </span>
                                )}
                              </div>
                              <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-neutral-400' : 'text-neutral-600 group-hover/row:text-neutral-500'}`}>{m.desc}</p>
                            </div>
                            {/* State icon */}
                            {isActive && (
                              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                                <Check size={9} className="text-black" strokeWidth={3} />
                              </div>
                            )}
                            {!isActive && isHardLocked && (
                              <Lock size={11} className="text-neutral-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                      {userPlan !== 'power' && (
                        <div className="mt-2 pt-2 border-t border-white/[0.05] px-3 pb-1">
                          <p className="text-[9px] text-neutral-600 leading-relaxed">
                            <span className="text-white font-bold">Upgrade</span> your plan to unlock more models with unlimited messages.
                          </p>
                          <button
                            onClick={() => router.push('/pricing')}
                            className="mt-2 w-full py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all"
                          >
                            View Plans →
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="relative flex-1 flex flex-col min-h-0">
            
            {/* Model-limit lock overlay — shown when free messages exhausted */}
            {!isModelUnlimited && !canUseModel && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border overflow-hidden"
                  style={{ background: `${selectedChatModel.accentColor}15`, borderColor: `${selectedChatModel.accentColor}35` }}
                >
                  <img src={selectedChatModel.logoUrl} alt={selectedChatModel.name} className="w-9 h-9 object-contain" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">{selectedChatModel.name} Limit Reached</h3>
                <p className="text-sm text-neutral-400 mb-1 max-w-xs">
                  You've used your {selectedChatModel.freeLimit} free messages on {selectedChatModel.name}.
                </p>
                <p className="text-xs text-neutral-600 mb-5 max-w-xs">
                  Upgrade to <span style={{ color: PLAN_META[TIER_REQUIRED_PLAN[selectedChatModel.tier]].color }} className="font-bold">
                    {PLAN_META[TIER_REQUIRED_PLAN[selectedChatModel.tier]].label}
                  </span> for unlimited {selectedChatModel.name} access.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button onClick={() => router.push('/pricing')} className="bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs h-11 rounded-xl">
                    Upgrade Plan <Sparkles className="ml-2 h-3 w-3" />
                  </Button>
                  <button
                    onClick={() => setSelectedChatModel(CHAT_AI_MODELS[0])}
                    className="text-xs text-neutral-400 hover:text-white transition-colors py-2"
                  >
                    Switch back to PaperChat (Free · Unlimited)
                  </button>
                </div>
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
                      {msg.role === 'user' ? (
                        <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <div style={{
                            background: '#dc2626', color: '#fff', borderRadius: '16px 16px 2px 16px',
                            padding: '10px 14px', fontSize: 13, lineHeight: 1.5,
                            wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap'
                          }}>
                            {msg.content}
                          </div>
                          {msg.mode && msg.mode !== 'ask' && (
                            <span style={{ fontSize: 9, color: '#666', display: 'flex', alignItems: 'center', gap: 3, paddingRight: 2 }}>
                              {msg.mode === 'summarize' && <><BookOpen size={9}/> Summarize</>}
                              {msg.mode === 'quiz' && <><Brain size={9}/> Quiz Me</>}
                              {msg.mode === 'explain' && <><Lightbulb size={9}/> Explain</>}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          maxWidth: '92%', background: '#1a1a1a', border: '1px solid #2a2a2a',
                          borderRadius: '2px 16px 16px 16px', padding: '12px 14px', fontSize: 13,
                          wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0, flex: '0 1 auto'
                        }}>
                          <ModeMessageRenderer content={msg.content} mode={msg.mode} />
                          {msg.videoLink && (
                            <a href={msg.videoLink} target="_blank" className="mt-2 block p-2 bg-black/20 rounded flex items-center gap-2 hover:bg-black/40 transition">
                               <ExternalLink className="h-3 w-3 text-red-400"/>
                               <span className="text-xs text-red-300">Watch Related Video</span>
                            </a>
                          )}
                          <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #ffffff08', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => handleFeedback(msg._id, 'good')}
                                style={{ padding: 4, borderRadius: 4, background: 'none', border: 'none', cursor: 'pointer', color: msg.feedback === 'good' ? '#4ade80' : '#555' }}
                              ><ThumbsUp size={11} /></button>
                              <button
                                onClick={() => handleFeedback(msg._id, 'bad')}
                                style={{ padding: 4, borderRadius: 4, background: 'none', border: 'none', cursor: 'pointer', color: msg.feedback === 'bad' ? '#f87171' : '#555' }}
                              ><ThumbsDown size={11} /></button>
                            </div>
                            <span style={{ fontSize: 9, color: '#444' }}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      )}
                   </motion.div>
                 ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-800 rounded-2xl p-3 shadow-sm border border-neutral-700 rounded-bl-none">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
                          </div>
                          <span className="text-xs font-medium text-neutral-400 animate-pulse">{thinkingMessage}</span>
                        </div>
                      </div>
                    </div>
                  )}
                 <div ref={messagesEndRef} />
               </div>
            </div>

            {/* Input Area */}
            <PaperChatInput
              input={input}
              setInput={setInput}
              isThinking={isThinking}
              isSubscribed={isSubscribed}
              canSendOverride={canUseModel}
              onSubmit={handleSendMessage}
              selectedMode={selectedMode}
              setSelectedMode={setSelectedMode}
            />
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <AnimatePresence>
        {showExportDialog && (
          <ExportDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            isSubscribed={isSubscribed}
            onExportPDF={generatePDF}
            onExportMarkdown={exportMarkdown}
            isGeneratingPDF={isGeneratingPDF}
            router={router}
            noteTitle={data?.title || "Note"}
            noteContent={markdownContent}
          />
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav 
        activeTab={mobileView} 
        setActiveTab={setMobileView} 
        onHome={() => router.push('/')}
      />
    </div>
  );
}