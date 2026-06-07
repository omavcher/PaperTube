"use client";
import React, { useState, useCallback, useEffect, useMemo, JSX } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Grid,
  List,
  PlayCircle,
  Globe,
  Lock,
  User,
  FileText,
  Plus,
  Database,
  Loader2,
  ArrowUpDown,
  Eye,
  Clock,
  ChevronRight,
  Layers,
  X,
  Folder,
  FolderPlus,
  MoreVertical,
  Trash2,
  Edit3,
  FolderOpen,
  Brain,
  BookOpen,
  ClipboardList
} from "lucide-react";
import { IconFolderCode } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import { toast } from "sonner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";


// --- Types ---
interface Creator {
  _id: string;
  name: string;
  avatarUrl?: string;
  username?: string;
}

interface Note {
  _id: string;
  slug: string;
  title: string;
  content?: string;
  videoUrl?: string;
  updatedAt: string;
  createdAt: string;
  creator?: Creator;
  views?: number;
  thumbnail?: string;
  videoId?: string;
  visibility?: string;
  lastEdit?: string;
  type?: string;
  folderId?: string | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalNotes: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ExploreResponse {
  success: boolean;
  message?: string;
  data: {
    items: Note[]; 
    pagination: Pagination;
  };
}

interface PersonalNotesResponse {
  success: boolean;
  message?: string;
  data: {
    notes: Note[]; 
    pagination: Pagination;
  };
}

// --- Helpers ---
const getYouTubeThumbnail = (url: string | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` 
    : null;
};

const getCreatorInitial = (creator: Creator | undefined): string => {
  if (!creator || !creator.name) return '?';
  return creator.name.charAt(0).toUpperCase();
};

const getCreatorName = (creator: Creator | undefined): string => {
  if (!creator || !creator.name) return 'Anonymous';
  return creator.name;
};

const formatCreatorNameForUrl = (name: string): string => {
  if (!name) return 'anonymous';
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const formatDate = (dateString: string, short = false): string => {
  try {
    const date = new Date(dateString);
    if (short) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return ""; }
};

const formatTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(dateString, true);
  } catch { return ""; }
};




// --- Sub-Component: Grid Card ---
const GridCard = React.memo(({
  note, searchQuery, onClick, onProfileClick, highlightText, folders, onMoveItem, onDeleteItem, showCreator = false, isPersonal = false
}: {
  note: Note; searchQuery: string;
  onClick: (note: Note, isPersonal: boolean) => void;
  onProfileClick: (creatorName: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  folders: { _id: string; name: string }[];
  onMoveItem: (itemId: string, itemType: 'note' | 'flashcard' | 'test', folderId: string | null) => void;
  onDeleteItem: (itemId: string, itemType: 'note' | 'flashcard' | 'test') => void;
  showCreator?: boolean; isPersonal?: boolean;
}) => {
  const cardConfig = useMemo(() => {
    switch (note.type) {
      case 'flashcard':
        return {
          color: '#fbbf24', // Amber
          bgGradient: 'linear-gradient(135deg, #181003 0%, #0a0600 100%)',
          badgeText: 'Flashcards',
          badgeStyle: { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' },
          glowStyle: { boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.25), 0 8px 32px rgba(245,158,11,0.06)' },
          hoverTitleClass: 'group-hover:text-amber-400',
          overlayText: 'Study Deck',
          overlayBg: 'rgba(245,158,11,0.85)',
          Icon: Layers,
          fallbackIconBg: 'rgba(245,158,11,0.06)',
          fallbackIconBorder: '1px solid rgba(245,158,11,0.12)',
        };
      case 'test':
        return {
          color: '#10b981', // Emerald
          bgGradient: 'linear-gradient(135deg, #03120a 0%, #000502 100%)',
          badgeText: 'Practice Test',
          badgeStyle: { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' },
          glowStyle: { boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.25), 0 8px 32px rgba(16,185,129,0.06)' },
          hoverTitleClass: 'group-hover:text-emerald-400',
          overlayText: 'Take Test',
          overlayBg: 'rgba(16,185,129,0.85)',
          Icon: ClipboardList,
          fallbackIconBg: 'rgba(16,185,129,0.06)',
          fallbackIconBorder: '1px solid rgba(16,185,129,0.12)',
        };
      case 'note':
      default:
        return {
          color: '#ef4444', // Red/Ruby
          bgGradient: 'linear-gradient(135deg, #110303 0%, #050000 100%)',
          badgeText: 'Notes',
          badgeStyle: { background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444' },
          glowStyle: { boxShadow: 'inset 0 0 0 1px rgba(239, 68, 68, 0.25), 0 8px 32px rgba(239, 68, 68, 0.06)' },
          hoverTitleClass: 'group-hover:text-red-400',
          overlayText: 'Read Notes',
          overlayBg: 'rgba(239, 68, 68, 0.85)',
          Icon: BookOpen,
          fallbackIconBg: 'rgba(239, 68, 68, 0.06)',
          fallbackIconBorder: '1px solid rgba(239, 68, 68, 0.12)',
        };
    }
  }, [note.type]);

  const thumbnailUrl = note.thumbnail || getYouTubeThumbnail(note.videoUrl);
  const handleCardClick = () => onClick(note, isPersonal);
  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.creator?.username) onProfileClick(note.creator.username);
    else if (note.creator?.name) onProfileClick(note.creator.name);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group cursor-pointer flex flex-col h-full relative rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={cardConfig.glowStyle} />

      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-neutral-950 w-full aspect-video flex-shrink-0">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={note.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06] opacity-80 group-hover:opacity-100" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: cardConfig.bgGradient }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: cardConfig.fallbackIconBg, border: cardConfig.fallbackIconBorder }}>
              <cardConfig.Icon size={20} style={{ color: cardConfig.color, opacity: 0.7 }} />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

        {/* Top badges row */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md" style={cardConfig.badgeStyle}>
            <cardConfig.Icon size={9} /> {cardConfig.badgeText}
          </span>
          <span className="ml-auto text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {formatTimeAgo(note.updatedAt || note.createdAt)}
          </span>
        </div>


      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className={cn("font-semibold text-white leading-snug transition-colors duration-200 text-[13px] line-clamp-2 mb-3", cardConfig.hoverTitleClass)}>
          {searchQuery ? highlightText(note.title, searchQuery) : note.title}
        </h3>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2">
          {showCreator ? (
            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCreatorClick}>
              {note.creator?.avatarUrl
                ? <img src={note.creator.avatarUrl} alt="" className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0" />
                : <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0" style={{ background: `${cardConfig.color}25`, color: cardConfig.color }}>{getCreatorInitial(note.creator)}</div>
              }
              <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[80px]">{getCreatorName(note.creator)}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: `${cardConfig.color}cc` }}>
                <User size={10} /> Mine
              </span>
              {isPersonal && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={e => e.stopPropagation()}
                      className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-all shrink-0 relative z-30"
                    >
                      <MoreVertical size={12} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0d0d0d] border-white/[0.08] text-white rounded-xl p-1.5 w-48 shadow-2xl z-50">
                    <div className="text-[9px] font-bold text-neutral-500 px-3 py-1.5 uppercase tracking-widest">Move to Folder</div>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onMoveItem(note._id, note.type === 'flashcard' ? 'flashcard' : note.type === 'test' ? 'test' : 'note', null); }}
                      className={cn("text-[11px] font-medium rounded-lg cursor-pointer px-3 py-1.5 focus:bg-white/5", !note.folderId ? "text-red-400" : "text-neutral-400")}
                    >
                      Uncategorized
                    </DropdownMenuItem>
                    {folders.map(folder => (
                      <DropdownMenuItem
                        key={folder._id}
                        onClick={(e) => { e.stopPropagation(); onMoveItem(note._id, note.type === 'flashcard' ? 'flashcard' : note.type === 'test' ? 'test' : 'note', folder._id); }}
                        className={cn("text-[11px] font-medium rounded-lg cursor-pointer px-3 py-1.5 focus:bg-white/5", note.folderId === folder._id ? "text-red-400" : "text-neutral-400")}
                      >
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                    <div className="h-px bg-white/[0.08] my-1" />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onDeleteItem(note._id, note.type === 'flashcard' ? 'flashcard' : note.type === 'test' ? 'test' : 'note'); }}
                      className="text-[11px] font-medium rounded-lg cursor-pointer px-3 py-1.5 focus:bg-red-500/10 text-red-400 focus:text-red-400"
                    >
                      <Trash2 size={12} className="mr-2 inline" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
          {note.views !== undefined && note.views > 0 && !isPersonal && (
            <span className="flex items-center gap-1 text-[10px] text-neutral-600 group-hover:text-neutral-400 transition-colors">
              <Eye size={10} /> {note.views.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
GridCard.displayName = "GridCard";


// --- Sub-Component: List Card ---
const ListCard = React.memo(({ 
  note, 
  searchQuery, 
  onClick, 
  onProfileClick, 
  highlightText, 
  folders,
  onMoveItem,
  onDeleteItem,
  showCreator = false,
  isPersonal = false
}: {
  note: Note;
  searchQuery: string;
  onClick: (note: Note, isPersonal: boolean) => void;
  onProfileClick: (creatorName: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  folders: { _id: string; name: string }[];
  onMoveItem: (itemId: string, itemType: 'note' | 'flashcard' | 'test', folderId: string | null) => void;
  onDeleteItem: (itemId: string, itemType: 'note' | 'flashcard' | 'test') => void;
  showCreator?: boolean;
  isPersonal?: boolean;
}) => {
  const cardConfig = useMemo(() => {
    switch (note.type) {
      case 'flashcard':
        return {
          color: '#fbbf24', // Amber
          bgGradient: 'linear-gradient(135deg, #181003 0%, #0a0600 100%)',
          badgeText: 'Flashcards',
          badgeStyle: { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' },
          glowStyle: { boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.25), 0 8px 32px rgba(245,158,11,0.06)' },
          hoverTitleClass: 'group-hover:text-amber-400',
          overlayText: 'Study Deck',
          overlayBg: 'rgba(245,158,11,0.85)',
          Icon: Layers,
          fallbackIconBg: 'rgba(245,158,11,0.06)',
          fallbackIconBorder: '1px solid rgba(245,158,11,0.12)',
        };
      case 'test':
        return {
          color: '#10b981', // Emerald
          bgGradient: 'linear-gradient(135deg, #03120a 0%, #000502 100%)',
          badgeText: 'Practice Test',
          badgeStyle: { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' },
          glowStyle: { boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.25), 0 8px 32px rgba(16,185,129,0.06)' },
          hoverTitleClass: 'group-hover:text-emerald-400',
          overlayText: 'Take Test',
          overlayBg: 'rgba(16,185,129,0.85)',
          Icon: ClipboardList,
          fallbackIconBg: 'rgba(16,185,129,0.06)',
          fallbackIconBorder: '1px solid rgba(16,185,129,0.12)',
        };
      case 'note':
      default:
        return {
          color: '#ef4444', // Red/Ruby
          bgGradient: 'linear-gradient(135deg, #110303 0%, #050000 100%)',
          badgeText: 'Notes',
          badgeStyle: { background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444' },
          glowStyle: { boxShadow: 'inset 0 0 0 1px rgba(239, 68, 68, 0.25), 0 8px 32px rgba(239, 68, 68, 0.06)' },
          hoverTitleClass: 'group-hover:text-red-400',
          overlayText: 'Read Notes',
          overlayBg: 'rgba(239, 68, 68, 0.85)',
          Icon: BookOpen,
          fallbackIconBg: 'rgba(239, 68, 68, 0.06)',
          fallbackIconBorder: '1px solid rgba(239, 68, 68, 0.12)',
        };
    }
  }, [note.type]);

  const thumbnailUrl = note.thumbnail || getYouTubeThumbnail(note.videoUrl);
  const handleCardClick = () => onClick(note, isPersonal);
  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.creator?.username) onProfileClick(note.creator.username);
    else if (note.creator?.name) onProfileClick(note.creator.name);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="group cursor-pointer flex flex-row items-stretch relative rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Left accent line on hover */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
        style={{ backgroundColor: cardConfig.color }}
      />

      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-neutral-950 w-20 sm:w-32 md:w-44 flex-shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={note.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-90" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center min-h-[70px]" style={{ background: cardConfig.bgGradient }}>
            <cardConfig.Icon size={16} style={{ color: cardConfig.color, opacity: 0.4 }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 pointer-events-none" />
        
        {/* Left-top corner badge on thumbnail */}
        <div className="absolute top-1.5 left-1.5">
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider" style={cardConfig.badgeStyle}>
            <cardConfig.Icon size={7} /> {cardConfig.badgeText}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center px-4 py-3 gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className={cn("font-semibold text-white leading-snug transition-colors duration-200 text-sm line-clamp-1", cardConfig.hoverTitleClass)}>
            {searchQuery ? highlightText(note.title, searchQuery) : note.title}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {showCreator ? (
              <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCreatorClick}>
                {note.creator?.avatarUrl
                  ? <img src={note.creator.avatarUrl} alt="" className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0" style={{ background: `${cardConfig.color}25`, color: cardConfig.color }}>{getCreatorInitial(note.creator)}</div>
                }
                <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[120px]">{getCreatorName(note.creator)}</span>
              </div>
            ) : (
              <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: `${cardConfig.color}cc` }}>
                <User size={9} /> Mine
              </span>
            )}
            <span className="w-0.5 h-0.5 rounded-full bg-neutral-700 hidden sm:block" />
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-neutral-600">
              <Clock size={9} /> {formatTimeAgo(note.updatedAt || note.createdAt)}
            </span>
            {note.views !== undefined && note.views > 0 && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-neutral-700 hidden md:block" />
                <span className="hidden md:flex items-center gap-1 text-[10px] text-neutral-600">
                  <Eye size={9} /> {note.views.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Options & Arrow */}
        <div className="flex items-center gap-2 shrink-0 relative z-30">
          {isPersonal && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={e => e.stopPropagation()}
                  className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-all shrink-0"
                >
                  <MoreVertical size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0d0d0d] border-white/[0.08] text-white rounded-xl p-1.5 w-48 shadow-2xl z-50">
                <div className="text-[9px] font-bold text-neutral-500 px-3 py-1.5 uppercase tracking-widest">Move to Folder</div>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onMoveItem(note._id, note.type === 'flashcard' ? 'flashcard' : note.type === 'test' ? 'test' : 'note', null); }}
                  className={cn("text-[11px] font-medium rounded-lg cursor-pointer px-3 py-1.5 focus:bg-white/5", !note.folderId ? "text-red-400" : "text-neutral-400")}
                >
                  Uncategorized
                </DropdownMenuItem>
                {folders.map(folder => (
                  <DropdownMenuItem
                    key={folder._id}
                    onClick={(e) => { e.stopPropagation(); onMoveItem(note._id, note.type === 'flashcard' ? 'flashcard' : note.type === 'test' ? 'test' : 'note', folder._id); }}
                    className={cn("text-[11px] font-medium rounded-lg cursor-pointer px-3 py-1.5 focus:bg-white/5", note.folderId === folder._id ? "text-red-400" : "text-neutral-400")}
                  >
                    {folder.name}
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-white/[0.08] my-1" />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDeleteItem(note._id, note.type === 'flashcard' ? 'flashcard' : note.type === 'test' ? 'test' : 'note'); }}
                  className="text-[11px] font-medium rounded-lg cursor-pointer px-3 py-1.5 focus:bg-red-500/10 text-red-400 focus:text-red-400"
                >
                  <Trash2 size={12} className="mr-2 inline" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#555' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${cardConfig.color}15`; (e.currentTarget as HTMLElement).style.color = cardConfig.color; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
          >
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});
ListCard.displayName = "ListCard";


// --- Main Component ---
export default function NotesWorkspace() {
  const activeTab = "my-bag";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Data State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Folders State
  const [folders, setFolders] = useState<{ _id: string; name: string; count?: number }[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all"); // "all", "root", or custom folderId
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRenameFolder, setShowRenameFolder] = useState<{ _id: string; name: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");
  
  const router = useRouter();

  // 1. Auth Check
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
    if (!authToken) setLoading(false);
  }, []);

  // Fetch Folders List
  const fetchFolders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await api.get('/notes/folders', { headers: { 'Auth': authToken } });
      if (response.data.success) {
        setFolders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFolders();
    }
  }, [isAuthenticated, fetchFolders]);

  // 2. Fetch Personal Notes
  const fetchPersonalNotes = useCallback(async (page = 1, append = false, search = '') => {
    if (!isAuthenticated) return;
    try {
      if (!append) setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: page.toString(), limit: '12', sortBy, sortOrder: 'desc', search: search || ''
      });
      if (selectedFolderId && selectedFolderId !== 'all') {
        params.append('folderId', selectedFolderId);
      }
      const response = await api.get<PersonalNotesResponse>(`/notes/get-all-notes?${params.toString()}`, { headers: { 'Auth': authToken } }); 
      
      if (response.data.success) {
        const { notes: fetchedNotes, pagination } = response.data.data;
        setNotes(prev => append ? [...prev, ...fetchedNotes] : fetchedNotes);
        setCurrentPage(pagination.currentPage);
        setHasMore(pagination.hasNext);
        return fetchedNotes.length;
      }
    } catch (error) {
      console.error(error);
      if (!append) setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sortBy, selectedFolderId]);

  // Folder management handlers
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await api.post('/notes/folders', { name: newFolderName }, { headers: { 'Auth': authToken } });
      if (response.data.success) {
        toast.success("Folder created successfully");
        setNewFolderName("");
        setShowCreateFolder(false);
        fetchFolders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create folder");
    }
  };

  const handleRenameFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenameFolder || !renameFolderName.trim()) return;
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await api.put(`/notes/folders/${showRenameFolder._id}`, { name: renameFolderName }, { headers: { 'Auth': authToken } });
      if (response.data.success) {
        toast.success("Folder renamed successfully");
        setShowRenameFolder(null);
        setRenameFolderName("");
        fetchFolders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder? Notes inside will be moved to uncategorized.")) return;
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await api.delete(`/notes/folders/${folderId}`, { headers: { 'Auth': authToken } });
      if (response.data.success) {
        toast.success("Folder deleted");
        if (selectedFolderId === folderId) {
          setSelectedFolderId("all");
        }
        fetchFolders();
        fetchPersonalNotes(1, false, searchQuery);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete folder");
    }
  };

  const handleMoveItem = async (itemId: string, itemType: 'note' | 'flashcard' | 'test', folderId: string | null) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await api.put('/notes/notes/move', {
        itemId,
        itemType,
        folderId: folderId || 'root'
      }, { headers: { 'Auth': authToken } });
      if (response.data.success) {
        toast.success(`Moved successfully`);
        fetchFolders();
        fetchPersonalNotes(1, false, searchQuery);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to move item");
    }
  };

  const handleDeleteItem = async (itemId: string, type: 'note' | 'flashcard' | 'test') => {
    const typeLabel = type === 'flashcard' ? 'flashcard set' : type === 'test' ? 'practice test' : 'note';
    if (!confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;
    try {
      const authToken = localStorage.getItem('authToken');
      const endpoint = type === 'flashcard' 
        ? `/flashcards/${itemId}`
        : type === 'test'
        ? `/test/${itemId}`
        : `/notes/${itemId}`;
      const response = await api.delete(endpoint, { headers: { 'Auth': authToken } });
      if (response.data.success) {
        toast.success(`${type === 'flashcard' ? 'Flashcards' : type === 'test' ? 'Practice test' : 'Note'} deleted successfully`);
        fetchFolders();
        fetchPersonalNotes(1, false, searchQuery);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete item");
    }
  };

  // 4. Initial Load
  useEffect(() => {
    const init = async () => {
        if (isAuthenticated && !initialCheckDone) {
            await fetchPersonalNotes(1, false, "");
            setInitialCheckDone(true);
        }
    };
    init();
  }, [isAuthenticated, initialCheckDone, fetchPersonalNotes]);

  // 5. Standard Fetch
  useEffect(() => {
    if (!initialCheckDone) return;
    setCurrentPage(1);
    fetchPersonalNotes(1, false, searchQuery);
  }, [searchQuery, sortBy, initialCheckDone, fetchPersonalNotes]);

  // Handlers
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      fetchPersonalNotes(nextPage, true, searchQuery);
    }
  };

  const handleCardClick = useCallback((note: Note, isPersonal: boolean) => {
    if (note.type === 'flashcard') {
      router.push(`/flashcards/${note.slug}`);
    } else if (note.type === 'test') {
      router.push(`/yt-practice-test/${note.slug}`);
    } else {
      const creatorUsername = note.creator?.username || (note.creator?.name ? formatCreatorNameForUrl(note.creator.name) : 'anonymous');
      router.push(isPersonal ? `/notes/${note.slug}` : `/note/${creatorUsername}/${note.slug}`);
    }
  }, [router]);

  const highlightText = useCallback((text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return <>{parts.map((p, i) => p.toLowerCase() === highlight.toLowerCase() ? <mark key={i} className="bg-red-500/30 text-red-200 rounded px-0.5">{p}</mark> : p)}</>;
  }, []);

  const handleProfileClick = useCallback((name: string) => {
    router.push(`/${formatCreatorNameForUrl(name)}/profile`);
  }, [router]);

  const currentItems = useMemo(() => notes, [notes]);

  const sortLabel = useMemo(() => {
    switch(sortBy) {
      case "updatedAt": return "Recent";
      case "title": return "A-Z";
      default: return "Sort";
    }
  }, [sortBy]);

  // --- Not Authenticated ---
  if (isAuthenticated === false && loading === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans selection:bg-red-900/50">
        <div className="text-center space-y-6 max-w-sm p-8 bg-neutral-900/40 border border-white/10 rounded-3xl backdrop-blur-md">
          <div className="w-16 h-16 bg-red-600/10 rounded-2xl mx-auto flex items-center justify-center border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
             <Lock className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
             <h2 className="text-2xl font-bold tracking-tight">Access Restricted</h2>
             <p className="text-sm text-neutral-400 font-medium">Please initialize a session to access the neural library.</p>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs h-12 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
             Establish Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full bg-black text-white font-sans selection:bg-red-900/50 relative overflow-hidden">
      
      {/* Subtle Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent pointer-events-none opacity-60" />
           {/* --- HEADER BAR --- */}
      <div className="sticky top-0 z-40 w-full transform-gpu" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(220,38,38,0.5) 40%, rgba(220,38,38,0.5) 60%, transparent)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* === MAIN HEADER ROW === */}
          <div className="flex items-center gap-3 py-3 md:py-3.5">

            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl blur-md" style={{ background: 'rgba(220,38,38,0.4)' }} />
                <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#dc2626,#7f1d1d)', boxShadow: '0 0 0 1px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                  <Database size={15} style={{ color: '#fff' }} />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[15px] font-bold tracking-tight text-white leading-none mb-0.5">My Library</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full" style={{ background: '#dc2626' }} />
                  <p className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Personal Workspace</p>
                </div>
              </div>
            </div>

            {/* === RIGHT: Search + Controls === */}
            <div className="flex items-center gap-2 flex-grow justify-end">

              {/* Search bar */}
              <div className="relative group hidden md:flex w-52 lg:w-64">
                <div className="flex items-center w-full h-9 px-3 rounded-xl transition-all duration-200 gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(220,38,38,0.45)'; e.currentTarget.style.background = 'rgba(220,38,38,0.04)'; }}
                  onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <Search size={13} style={{ color: '#555', flexShrink: 0 }} className="group-focus-within:!text-red-500 transition-colors" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search notes…"
                    className="w-full bg-transparent border-none focus:outline-none text-[12px] text-white placeholder:text-neutral-600"
                    style={{ lineHeight: 1 }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="flex-shrink-0 text-neutral-600 hover:text-white transition-colors">
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* View mode pills */}
              <div className="flex items-center rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {([['grid', Grid], ['list', List]] as const).map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode as 'grid' | 'list')}
                    className="p-2 transition-all duration-150"
                    style={viewMode === mode
                      ? { background: 'rgba(220,38,38,0.2)', color: '#f87171' }
                      : { color: 'rgba(255,255,255,0.3)' }
                    }
                  >
                    <Icon size={13} />
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                  >
                    <ArrowUpDown size={11} />
                    <span className="hidden sm:inline">{sortLabel}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0d0d0d] border-white/[0.08] text-white rounded-xl p-1.5 w-48 shadow-2xl">
                  <DropdownMenuItem onClick={() => setSortBy('updatedAt')}
                    className={cn('text-[11px] font-medium rounded-lg cursor-pointer gap-2 px-3 py-2 focus:bg-white/5', sortBy === 'updatedAt' ? 'text-red-400' : 'text-neutral-400')}>
                    <Clock size={12} /> Newest First
                    {sortBy === 'updatedAt' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('title')}
                    className={cn('text-[11px] font-medium rounded-lg cursor-pointer gap-2 px-3 py-2 focus:bg-white/5', sortBy === 'title' ? 'text-red-400' : 'text-neutral-400')}>
                    <ArrowUpDown size={12} /> A → Z
                    {sortBy === 'title' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Note CTA */}
              <button
                onClick={() => router.push('/youtube-to-notes')}
                className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-200 active:scale-95 shrink-0"
                style={{ background: 'linear-gradient(135deg,#dc2626,#9f1c1c)', boxShadow: '0 0 18px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 28px rgba(220,38,38,0.55), inset 0 1px 0 rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 18px rgba(220,38,38,0.3),  inset 0 1px 0 rgba(255,255,255,0.12)')}
              >
                <Plus size={13} /> New Note
              </button>
            </div>
          </div>

          {/* === MOBILE: Search row === */}
          <div className="md:hidden pb-2.5 flex items-center w-full">
            {/* Mobile search */}
            <div className="flex items-center h-8 px-2.5 rounded-xl gap-1.5 w-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Search size={12} style={{ color: '#555', flexShrink: 0 }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notes…"
                className="w-full bg-transparent border-none focus:outline-none text-[11px] text-white placeholder:text-neutral-600" />
            </div>
          </div>

        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 min-h-[50vh] relative z-10">
         
         {/* Mobile Folders Scrollable List */}
         {activeTab === 'my-bag' && (
           <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-4 pt-1 mb-2 custom-scrollbar shrink-0">
             <button
               onClick={() => setSelectedFolderId('all')}
               className={cn(
                 "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shrink-0",
                 selectedFolderId === 'all'
                   ? "bg-white text-black"
                   : "bg-white/5 text-neutral-400 border border-white/5"
               )}
             >
               All
             </button>
             <button
               onClick={() => setSelectedFolderId('root')}
               className={cn(
                 "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shrink-0",
                 selectedFolderId === 'root'
                   ? "bg-white text-black"
                   : "bg-white/5 text-neutral-400 border border-white/5"
               )}
             >
               Uncategorized
             </button>
             {folders.map(folder => (
               <button
                 key={folder._id}
                 onClick={() => setSelectedFolderId(folder._id)}
                 className={cn(
                   "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-1.5",
                   selectedFolderId === folder._id
                     ? "bg-white text-black"
                     : "bg-white/5 text-neutral-400 border border-white/5"
                 )}
               >
                 <Folder size={10} />
                 <span>{folder.name}</span>
                 {folder.count !== undefined && folder.count > 0 && (
                   <span className={cn(
                     "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                     selectedFolderId === folder._id ? "bg-black/10 text-black" : "bg-white/10 text-neutral-400"
                   )}>
                     {folder.count}
                   </span>
                 )}
               </button>
             ))}
             
             <button
               onClick={() => setShowCreateFolder(true)}
               className="p-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 shrink-0 hover:bg-red-600/20 transition-all"
             >
               <Plus size={12} />
             </button>
           </div>
         )}

         {/* Layout container */}
         <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">

           {/* DESKTOP SIDEBAR */}
           {activeTab === 'my-bag' && (
             <div className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 space-y-5 border-r border-white/[0.04] pr-6 lg:pr-8">
               <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                   <FolderOpen size={12} /> Folders
                 </h3>
                 <button
                   onClick={() => setShowCreateFolder(true)}
                   className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-neutral-400 hover:text-red-400 transition-all"
                   title="Create New Folder"
                 >
                   <FolderPlus size={14} />
                 </button>
               </div>
               
               <div className="flex flex-col gap-1">
                 <button
                   onClick={() => setSelectedFolderId('all')}
                   className={cn(
                     "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border",
                     selectedFolderId === 'all'
                       ? "bg-white/5 border-white/10 text-white shadow-lg"
                       : "bg-transparent border-transparent text-neutral-400 hover:bg-white/[0.02] hover:text-white"
                   )}
                 >
                   <Database size={14} />
                   <span className="flex-1 truncate">All Library</span>
                 </button>

                 <button
                   onClick={() => setSelectedFolderId('root')}
                   className={cn(
                     "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border",
                     selectedFolderId === 'root'
                       ? "bg-white/5 border-white/10 text-white shadow-lg"
                       : "bg-transparent border-transparent text-neutral-400 hover:bg-white/[0.02] hover:text-white"
                   )}
                 >
                   <FileText size={14} />
                   <span className="flex-1 truncate">Uncategorized</span>
                 </button>

                 {folders.length > 0 && <div className="h-px bg-white/[0.04] my-2" />}
                 
                 <div className="flex flex-col gap-0.5 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                   {folders.map(folder => (
                     <div
                       key={folder._id}
                       className={cn(
                         "group/folder w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all relative",
                         selectedFolderId === folder._id
                           ? "bg-white/5 border-white/10 text-white shadow-lg"
                           : "bg-transparent border-transparent text-neutral-400 hover:bg-white/[0.02] hover:text-white"
                       )}
                     >
                       <button
                         onClick={() => setSelectedFolderId(folder._id)}
                         className="flex-1 flex items-center gap-2.5 text-left text-xs font-bold min-w-0"
                       >
                         <Folder size={14} className={cn(selectedFolderId === folder._id ? "text-red-500" : "text-neutral-500 group-hover/folder:text-neutral-300")} />
                         <span className="flex-1 truncate pr-14">{folder.name}</span>
                       </button>

                       <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/folder:opacity-100 transition-opacity">
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             setShowRenameFolder({ _id: folder._id, name: folder.name });
                             setRenameFolderName(folder.name);
                           }}
                           className="p-1 rounded hover:bg-white/10 text-neutral-500 hover:text-white transition-all"
                           title="Rename Folder"
                         >
                           <Edit3 size={11} />
                         </button>
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteFolder(folder._id);
                           }}
                           className="p-1 rounded hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-all"
                           title="Delete Folder"
                         >
                           <Trash2 size={11} />
                         </button>
                       </div>

                       {folder.count !== undefined && folder.count > 0 && (
                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full pointer-events-none group-hover/folder:hidden">
                           {folder.count}
                         </span>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}

           {/* MAIN CONTAINER */}
           <div className="flex-1 min-w-0">

             {/* Results Count */}
             {!loading && currentItems.length > 0 && (
               <div className="mb-5 flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#dc2626', boxShadow: '0 0 6px rgba(220,38,38,0.6)' }} />
                 <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                   {currentItems.length} {currentItems.length === 1 ? 'note' : 'notes'}
                 </span>
                 <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.06), transparent)' }} />
               </div>
             )}

             <AnimatePresence mode="wait">
               {loading && currentItems.length === 0 ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[40vh] space-y-5"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Loading Notes...</p>
                  </motion.div>
               ) : currentItems.length > 0 ? (
                  <motion.div 
                    key={`${activeTab}-${viewMode}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                     {/* GRID VIEW */}
                     {viewMode === "grid" && (
                       <div 
                         className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 animate-in fade-in duration-500"
                       >
                         {currentItems.map((note) => (
                           <GridCard 
                             key={note._id} 
                             note={note} 
                             searchQuery={searchQuery}
                             onClick={handleCardClick}
                             onProfileClick={handleProfileClick}
                             highlightText={highlightText}
                             folders={folders}
                             onMoveItem={handleMoveItem}
                             onDeleteItem={handleDeleteItem}
                             showCreator={false}
                             isPersonal={true}
                           />
                         ))}
                       </div>
                     )}

                     {/* LIST VIEW */}
                     {viewMode === "list" && (
                       <div 
                         className="flex flex-col gap-2 md:gap-2.5 animate-in fade-in duration-500"
                       >
                         {currentItems.map((note) => (
                           <ListCard 
                             key={note._id} 
                             note={note} 
                             searchQuery={searchQuery}
                             onClick={handleCardClick}
                             onProfileClick={handleProfileClick}
                             highlightText={highlightText}
                             folders={folders}
                             onMoveItem={handleMoveItem}
                             onDeleteItem={handleDeleteItem}
                             showCreator={false}
                             isPersonal={true}
                           />
                         ))}
                       </div>
                     )}
                 
                 {/* Load More */}
                 {hasMore && (
                   <div className="flex justify-center mt-10 md:mt-12 mb-6">
                     <Button 
                       variant="outline" 
                       onClick={handleLoadMore} 
                       disabled={loading} 
                       className="bg-transparent border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/5 hover:border-white/15 rounded-xl h-11 px-8 transition-all"
                     >
                        {loading ? <Loader2 className="animate-spin mr-2 h-3.5 w-3.5"/> : null}
                        {loading ? "Loading..." : "Load More"}
                     </Button>
                   </div>
                 )}
              </motion.div>
           ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="py-24 md:py-32 flex justify-center"
              >
                <Empty className="max-w-sm border border-white/[0.06] bg-neutral-900/30 rounded-[2rem] p-8 backdrop-blur-sm">
                   <EmptyHeader>
                     <div className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-black rounded-2xl flex items-center justify-center border border-white/[0.08] mb-5 shadow-xl">
                       {searchQuery ? <Search className="text-neutral-500" size={24} /> : <IconFolderCode className="text-neutral-500" size={24} />}
                     </div>
                     <EmptyTitle className="text-white text-lg md:text-xl font-bold tracking-tight">
                       {searchQuery ? 'No Notes Found' : 'Empty Library'}
                     </EmptyTitle>
                     <EmptyDescription className="text-neutral-400 text-xs md:text-sm mt-2 font-medium leading-relaxed">
                       {searchQuery ? 'Try a different search query.' : 'Generate your first AI note to get started.'}
                     </EmptyDescription>
                   </EmptyHeader>
                </Empty>
              </motion.div>
           )}
         </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-4 z-50">
        <Button 
          onClick={() => router.push('/youtube-to-notes')}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 p-0 shadow-[0_4px_20px_rgba(220,38,38,0.5)] active:scale-90 transition-all"
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* --- CREATE FOLDER DIALOG --- */}
      <AnimatePresence>
        {showCreateFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setShowCreateFolder(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-900 border border-white/10 p-6 shadow-2xl z-50"
            >
              <button type="button" onClick={() => setShowCreateFolder(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
              <h3 className="text-lg font-bold text-white mb-1">Create Folder</h3>
              <p className="text-xs text-neutral-400 mb-4">Organize your lecture notes into custom categories.</p>
              
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science, Math 101"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-black border border-white/10 focus:border-red-500 focus:outline-none text-xs text-white placeholder:text-neutral-600"
                  autoFocus
                />
                <div className="flex gap-2.5">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateFolder(false)} className="flex-1 text-xs text-neutral-400 hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl h-10">
                    Create
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- RENAME FOLDER DIALOG --- */}
      <AnimatePresence>
        {showRenameFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setShowRenameFolder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-900 border border-white/10 p-6 shadow-2xl z-50"
            >
              <button type="button" onClick={() => setShowRenameFolder(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
              <h3 className="text-lg font-bold text-white mb-1">Rename Folder</h3>
              <p className="text-xs text-neutral-400 mb-4">Enter a new name for the folder.</p>
              
              <form onSubmit={handleRenameFolder} className="space-y-4">
                <input
                  type="text"
                  required
                  value={renameFolderName}
                  onChange={e => setRenameFolderName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-black border border-white/10 focus:border-red-500 focus:outline-none text-xs text-white placeholder:text-neutral-600"
                  autoFocus
                />
                <div className="flex gap-2.5">
                  <Button type="button" variant="ghost" onClick={() => setShowRenameFolder(null)} className="flex-1 text-xs text-neutral-400 hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl h-10">
                    Rename
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}