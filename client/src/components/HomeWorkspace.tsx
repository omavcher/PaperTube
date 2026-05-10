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
  X
} from "lucide-react";
import { IconFolderCode } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/config/api";
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
  note, searchQuery, onClick, onProfileClick, highlightText, showCreator = false, isPersonal = false
}: {
  note: Note; searchQuery: string;
  onClick: (note: Note, isPersonal: boolean) => void;
  onProfileClick: (creatorName: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  showCreator?: boolean; isPersonal?: boolean;
}) => {
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
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(220,38,38,0.3), 0 8px 32px rgba(220,38,38,0.08)' }} />

      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-neutral-950 w-full aspect-video flex-shrink-0">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={note.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06] opacity-80 group-hover:opacity-100" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#111,#0a0a0a)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
              <FileText size={20} style={{ color: '#dc2626', opacity: 0.6 }} />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

        {/* Top badges row */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {note.type === 'flashcard' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
              <Layers size={8} /> Cards
            </span>
          )}
          <span className="ml-auto text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {formatTimeAgo(note.updatedAt || note.createdAt)}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs" style={{ background: 'rgba(220,38,38,0.9)', color: '#fff', backdropFilter: 'blur(8px)' }}>
            <FileText size={13} /> Open Note
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className="font-semibold text-white leading-snug group-hover:text-red-400 transition-colors duration-200 text-[13px] line-clamp-2 mb-3">
          {searchQuery ? highlightText(note.title, searchQuery) : note.title}
        </h3>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2">
          {showCreator ? (
            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCreatorClick}>
              {note.creator?.avatarUrl
                ? <img src={note.creator.avatarUrl} alt="" className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0" />
                : <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.2)', color: '#f87171' }}>{getCreatorInitial(note.creator)}</div>
              }
              <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[80px]">{getCreatorName(note.creator)}</span>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'rgba(220,38,38,0.7)' }}>
              <User size={10} /> Mine
            </span>
          )}
          {note.views !== undefined && note.views > 0 && (
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
  showCreator = false,
  isPersonal = false
}: {
  note: Note;
  searchQuery: string;
  onClick: (note: Note, isPersonal: boolean) => void;
  onProfileClick: (creatorName: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  showCreator?: boolean;
  isPersonal?: boolean;
}) => {
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
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-neutral-950 w-20 sm:w-32 md:w-44 flex-shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={note.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-90" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center min-h-[70px]" style={{ background: 'linear-gradient(135deg,#0d0d0d,#111)' }}>
            <FileText size={16} style={{ color: '#dc2626', opacity: 0.4 }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 pointer-events-none" />
        {note.type === 'flashcard' && (
          <div className="absolute top-1.5 left-1.5">
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>
              <Layers size={7} /> Cards
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center px-4 py-3 gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="font-semibold text-white leading-snug group-hover:text-red-400 transition-colors duration-200 text-sm line-clamp-1">
            {searchQuery ? highlightText(note.title, searchQuery) : note.title}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {showCreator ? (
              <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCreatorClick}>
                {note.creator?.avatarUrl
                  ? <img src={note.creator.avatarUrl} alt="" className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0" style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171' }}>{getCreatorInitial(note.creator)}</div>
                }
                <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[120px]">{getCreatorName(note.creator)}</span>
              </div>
            ) : (
              <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: 'rgba(220,38,38,0.6)' }}>
                <User size={9} /> Personal
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

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.03)', color: '#555' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.1)'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
        >
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
});
ListCard.displayName = "ListCard";


// --- Main Component ---
export default function NotesWorkspace() {
  const [activeTab, setActiveTab] = useState("my-bag");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Data State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [exploreItems, setExploreItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  const router = useRouter();

  // 1. Auth Check
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
    if (!authToken) setLoading(false);
  }, []);

  // 2. Fetch Personal Notes
  const fetchPersonalNotes = useCallback(async (page = 1, append = false, search = '') => {
    if (!isAuthenticated) return;
    try {
      if (!append) setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: page.toString(), limit: '12', sortBy, sortOrder: 'desc', search: search || ''
      });
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
  }, [isAuthenticated, sortBy]);

  // 3. Fetch Explore Data
  const fetchExploreData = useCallback(async (page = 1, append = false, search = '') => {
    if (!isAuthenticated) return;
    try {
      if (!append) setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: page.toString(), limit: '12', sortBy: 'createdAt', sortOrder: 'desc', type: 'notes', search: search || ''
      });
      const response = await api.get<ExploreResponse>(`/notes/explore?${params.toString()}`, { headers: { 'Auth': authToken } }); 
      
      if (response.data.success) {
        const { items, pagination } = response.data.data;
        setExploreItems(prev => append ? [...prev, ...items] : items);
        setCurrentPage(pagination.currentPage);
        setHasMore(pagination.hasNext);
      }
    } catch (error) {
      console.error(error);
      if (!append) setExploreItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sortBy]);

  // 4. Initial Load — Auto Switch to Explore if Personal is Empty
  useEffect(() => {
    const init = async () => {
        if (isAuthenticated && !initialCheckDone) {
            const count = await fetchPersonalNotes(1, false, "");
            setInitialCheckDone(true);
            if (count === 0) setActiveTab("explore");
        }
    };
    init();
  }, [isAuthenticated, initialCheckDone, fetchPersonalNotes]);

  // 5. Standard Tab Switching Fetch
  useEffect(() => {
    if (!initialCheckDone) return;
    setCurrentPage(1);
    if (activeTab === 'explore') fetchExploreData(1, false, searchQuery);
    else fetchPersonalNotes(1, false, searchQuery);
  }, [activeTab, searchQuery, sortBy, initialCheckDone]);

  // Handlers
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      activeTab === 'explore' ? fetchExploreData(nextPage, true, searchQuery) : fetchPersonalNotes(nextPage, true, searchQuery);
    }
  };

  const handleCardClick = useCallback((note: Note, isPersonal: boolean) => {
    if (note.type === 'flashcard') {
      router.push(`/flashcards/${note.slug}`);
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

  const currentItems = useMemo(() => activeTab === 'explore' ? exploreItems : notes, [activeTab, exploreItems, notes]);

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

            {/* === CENTRE: Tab switcher (desktop) === */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center p-1 rounded-xl gap-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { id: 'explore', label: 'Community', icon: Globe },
                  { id: 'my-bag',  label: 'Personal',  icon: User  },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200"
                    style={activeTab === id
                      ? { background: '#fff', color: '#000', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
                      : { color: 'rgba(255,255,255,0.35)' }
                    }
                    onMouseEnter={e => { if (activeTab !== id) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                    onMouseLeave={e => { if (activeTab !== id) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
                  >
                    <Icon size={12} />
                    {label}
                    {id === 'my-bag' && notes.length > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                        style={activeTab === id
                          ? { background: 'rgba(0,0,0,0.15)', color: '#000' }
                          : { background: 'rgba(220,38,38,0.2)', color: '#f87171' }
                        }>
                        {notes.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* === RIGHT: Search + Controls === */}
            <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">

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
                onClick={() => router.push('/')}
                className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-200 active:scale-95 shrink-0"
                style={{ background: 'linear-gradient(135deg,#dc2626,#9f1c1c)', boxShadow: '0 0 18px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 28px rgba(220,38,38,0.55), inset 0 1px 0 rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 18px rgba(220,38,38,0.3),  inset 0 1px 0 rgba(255,255,255,0.12)')}
              >
                <Plus size={13} /> New Note
              </button>
            </div>
          </div>

          {/* === MOBILE: Tab switcher row === */}
          <div className="md:hidden pb-2.5 flex items-center gap-2">
            <div className="flex flex-1 items-center p-0.5 rounded-xl gap-0.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { id: 'explore', label: 'Community' },
                { id: 'my-bag',  label: 'Personal' },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-150"
                  style={activeTab === id ? { background: '#fff', color: '#000' } : { color: 'rgba(255,255,255,0.35)' }}>
                  {label}
                </button>
              ))}
            </div>
            {/* Mobile search */}
            <div className="flex items-center h-8 px-2.5 rounded-xl gap-1.5 flex-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Search size={12} style={{ color: '#555', flexShrink: 0 }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent border-none focus:outline-none text-[11px] text-white placeholder:text-neutral-600" />
            </div>
          </div>

        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 min-h-[50vh] relative z-10">
         
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
                         showCreator={activeTab === 'explore'}
                         isPersonal={activeTab === 'my-bag'}
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
                         showCreator={activeTab === 'explore'}
                         isPersonal={activeTab === 'my-bag'}
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
                       {activeTab === 'explore' ? <Globe className="text-neutral-500" size={24} /> : <IconFolderCode className="text-neutral-500" size={24} />}
                     </div>
                     <EmptyTitle className="text-white text-lg md:text-xl font-bold tracking-tight">
                       {activeTab === 'explore' ? 'No Notes Found' : 'Empty Library'}
                     </EmptyTitle>
                     <EmptyDescription className="text-neutral-400 text-xs md:text-sm mt-2 font-medium leading-relaxed">
                       {activeTab === 'explore' ? `Try a different search query.` : 'Generate your first AI note to get started.'}
                     </EmptyDescription>
                   </EmptyHeader>
                </Empty>
              </motion.div>
           )}
         </AnimatePresence>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-4 z-50">
        <Button 
          onClick={() => router.push('/')}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 p-0 shadow-[0_4px_20px_rgba(220,38,38,0.5)] active:scale-90 transition-all"
        >
          <Plus size={20} />
        </Button>
      </div>
    </section>
  );
}