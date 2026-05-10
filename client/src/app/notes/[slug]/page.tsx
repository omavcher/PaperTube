"use client";

import React, { useState, useRef, useEffect, useCallback, use } from "react";
import { Editor } from "@tinymce/tinymce-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
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
  Zap
} from "lucide-react";


import api from "@/config/api";
import { LoaderX } from "@/components/LoaderX";
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

@media (max-width: 1023px) {
  .tinymce-mobile-height { height: calc(100dvh - 180px) !important; }
}
`;

// --- COMPONENTS ---

// 1. PDF Preview
const PDFPreviewWithThumbnail: React.FC<{ 
  content: string; 
  isGenerating?: boolean;
  onGeneratePDF?: () => void;
}> = ({ content, isGenerating = false, onGeneratePDF }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Simple check for HTML
  const isHtml = content.includes('<h1') || content.includes('<p>') || content.includes('<div');

  const renderContent = (className: string, style: React.CSSProperties) => {
    if (isHtml) {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className={className}
          style={style} 
        />
      );
    }
    return (
      <div className={className} style={style}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="w-full h-full border border-neutral-800 shadow-2xl overflow-hidden rounded-lg bg-white relative group animate-scale-in flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-auto bg-white p-4 custom-scrollbar">
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-2" />
            <p className="text-neutral-600 text-sm">Creating PDF...</p>
          </div>
        ) : (
          renderContent("prose max-w-none text-black", { fontFamily: "'Times New Roman', serif", fontSize: '14px', lineHeight: '1.5' })
        )}
      </div>

      <button className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white rounded-full h-10 w-10 z-10 flex items-center justify-center" onClick={() => setShowFullPreview(true)}>
        <Eye className="h-5 w-5" />
      </button>

      {/* Fullscreen Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col relative animate-scale-in">
            <button className="absolute top-2 right-2 bg-black/10 hover:bg-black/20 rounded-full p-2 text-black z-20" onClick={() => setShowFullPreview(false)}>
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
              {renderContent("prose max-w-none text-black", { fontFamily: "'Times New Roman', serif", fontSize: '16px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto' })}
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

// --- PAPERCHAT INPUT COMPONENT ---
interface PaperChatInputProps {
  input: string;
  setInput: (v: string) => void;
  isThinking: boolean;
  isSubscribed: boolean;
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
  input, setInput, isThinking, isSubscribed, onSubmit, selectedMode, setSelectedMode
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
      if (input.trim() && !isThinking && isSubscribed) {
        onSubmit(e as any);
      }
    }
  };

  const applyQuickAction = (label: string) => {
    setInput(label);
    setShowActionMenu(false);
    textareaRef.current?.focus();
  };

  const canSend = input.trim().length > 0 && !isThinking && isSubscribed;

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
          placeholder={isSubscribed ? `${selectedMode.description}... (Enter to send, Shift+Enter for newline)` : 'Upgrade to Pro to use PaperChat...'}
          disabled={!isSubscribed}
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
                disabled={!isSubscribed}
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

  // Editor State
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const tinyMceRef = useRef<any>(null);

  // Chat State
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [selectedMode, setSelectedMode] = useState(CHAT_MODES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // PDF State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  const handleFeedback = async (messageId: string, feedback: "good" | "bad") => {
    if (!data?._id) return;
    try {
      // Optimistic update
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, feedback } : msg
      ));

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking || !isSubscribed) return;
    
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
          mode: currentMode
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
    }
  };

  // Generate PDF and instantly download
  const generatePDF = async () => {
    if (!data?._id) return;
    
    setIsGeneratingPDF(true);
    try {
      const res = await api.get(`/notes/generate/pdf?noteId=${data._id}`, { 
        headers: { 
          'Auth': getAuthToken()
        } 
      });
      
      if (res.data.success) {
        if (res.data.data.pdf) {
          // If PDF is returned as base64, download it directly
          const pdfData = res.data.data.pdf;
          const byteCharacters = atob(pdfData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = res.data.data.fileName || 'Paperxify-Note.pdf';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        
        toast.success(`PDF generated with ${res.data.data.imagesEmbedded || 0} images`);
      }
    } catch (error: any) {
      console.error("PDF Generation Failed:", error);
      toast.error(error.response?.data?.message || "Failed to generate PDF");
    } finally { 
      setIsGeneratingPDF(false); 
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
      <LoginDialog isOpen={showLoginDialog} onClose={() => router.push('/')} onSuccess={() => {setShowLoginDialog(false); loadNoteData();}} />
    </div>
  );

  return (
    <div className="h-dvh-screen w-screen bg-black flex flex-col overflow-hidden text-neutral-200">
      
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
            
            {/* VIEW: PREVIEW */}
            <div className={`absolute inset-0 p-3 lg:p-6 transition-opacity duration-300 ${mobileView === 'preview' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
               <div className="h-full w-full max-w-4xl mx-auto flex flex-col">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">{isFlashcard ? 'Flashcards Preview' : 'Document Preview'}</h3>
                    {!isFlashcard && (
                      <Button size="sm" variant="outline" onClick={generatePDF} disabled={isGeneratingPDF} className="h-8 border-neutral-700">
                        {isGeneratingPDF ? <Loader2 className="animate-spin h-4 w-4"/> : <Download className="h-4 w-4 mr-2"/>}
                        Export PDF
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
                       />
                    )}
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
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
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
              onSubmit={handleSendMessage}
              selectedMode={selectedMode}
              setSelectedMode={setSelectedMode}
            />
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