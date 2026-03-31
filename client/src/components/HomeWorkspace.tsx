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
  onClick: (slug: string, isPersonal: boolean, creatorUsername?: string) => void;
  onProfileClick: (creatorName: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  showCreator?: boolean;
  isPersonal?: boolean;
}) => {
  const thumbnailUrl = note.thumbnail || getYouTubeThumbnail(note.videoUrl);
  
  const handleCardClick = () => {
    const creatorUsername = note.creator?.username || (note.creator?.name ? formatCreatorNameForUrl(note.creator.name) : undefined);
    onClick(note.slug, isPersonal, creatorUsername);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.creator?.username) onProfileClick(note.creator.username);
    else if (note.creator?.name) onProfileClick(note.creator.name);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-neutral-900/40 border border-white/[0.06] hover:border-red-500/25 hover:bg-neutral-900/70 active:scale-[0.97] transition-all duration-300 rounded-2xl md:rounded-[1.5rem] overflow-hidden flex flex-col relative h-full animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-neutral-950 w-full aspect-video border-b border-white/[0.04] flex-shrink-0">
        {/* Hover glow */}
        <div className="absolute inset-0 bg-red-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none mix-blend-overlay" />

        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={note.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
             <div className="w-10 h-10 rounded-full bg-neutral-800/60 flex items-center justify-center text-neutral-600">
                <PlayCircle size={20} />
             </div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Desktop hover play */}
        <div className="hidden md:flex absolute inset-0 bg-black/40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
           <div className="rounded-full p-3 bg-red-600/20 backdrop-blur-md text-red-500 border border-red-500/30 scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
             <FileText size={16} />
           </div>
        </div>

        {/* Timestamp */}
        <div className="absolute top-2 right-2 md:top-2.5 md:right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] md:text-[9px] text-white/80 font-bold uppercase tracking-wider border border-white/[0.06] z-20">
          {formatTimeAgo(note.updatedAt || note.createdAt)} 
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 md:p-4">
        <h3 className="font-bold text-white mb-auto leading-snug group-hover:text-red-400 transition-colors text-xs md:text-sm line-clamp-2">
          {searchQuery ? highlightText(note.title, searchQuery) : note.title}
        </h3>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
           {showCreator ? (
             <div className="flex items-center gap-1.5 max-w-[70%] hover:text-white transition-colors cursor-pointer" onClick={handleCreatorClick}>
               {note.creator?.avatarUrl ? (
                 <img src={note.creator.avatarUrl} alt="" className="w-4 h-4 md:w-5 md:h-5 rounded-md border border-white/10 flex-shrink-0" />
               ) : (
                 <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-neutral-800 flex items-center justify-center text-white text-[8px] border border-white/10 flex-shrink-0">
                   {getCreatorInitial(note.creator)}
                 </div>
               )}
               <span className="truncate">{getCreatorName(note.creator)}</span>
             </div>
           ) : (
             <span className="flex items-center gap-1">
               <User size={10} className="text-red-500" /> Personal
             </span>
           )}

           {note.views !== undefined && note.views > 0 && (
             <span className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
               <Eye size={10} />
               {note.views}
             </span>
           )}
        </div>
      </div>
    </div>
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
  onClick: (slug: string, isPersonal: boolean, creatorUsername?: string) => void;
  onProfileClick: (creatorName: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  showCreator?: boolean;
  isPersonal?: boolean;
}) => {
  const thumbnailUrl = note.thumbnail || getYouTubeThumbnail(note.videoUrl);
  
  const handleCardClick = () => {
    const creatorUsername = note.creator?.username || (note.creator?.name ? formatCreatorNameForUrl(note.creator.name) : undefined);
    onClick(note.slug, isPersonal, creatorUsername);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.creator?.username) onProfileClick(note.creator.username);
    else if (note.creator?.name) onProfileClick(note.creator.name);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-neutral-900/30 border border-white/[0.06] hover:border-red-500/20 hover:bg-neutral-900/60 active:scale-[0.99] transition-all duration-300 rounded-xl md:rounded-2xl overflow-hidden flex flex-row items-stretch relative animate-in fade-in slide-in-from-bottom-1 duration-300"
    >
      {/* Thumbnail Section */}
      <div className="relative overflow-hidden bg-neutral-950 w-24 sm:w-36 md:w-48 flex-shrink-0 border-r border-white/[0.04]">
        {/* Hover glow */}
        <div className="absolute inset-0 bg-red-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none mix-blend-overlay" />

        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={note.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-75 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black min-h-[72px]">
            <PlayCircle size={18} className="text-neutral-600" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0 flex items-center px-3 sm:px-4 md:px-5 py-3 md:py-4 gap-3 md:gap-4">
        
        {/* Main Info */}
        <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
          {/* Title */}
          <h3 className="font-bold text-white leading-snug group-hover:text-red-400 transition-colors text-xs sm:text-sm md:text-base line-clamp-1 md:line-clamp-2">
            {searchQuery ? highlightText(note.title, searchQuery) : note.title}
          </h3>
          
          {/* Meta row */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* Creator or Personal badge */}
            {showCreator ? (
              <div 
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                onClick={handleCreatorClick}
              >
                {note.creator?.avatarUrl ? (
                  <img src={note.creator.avatarUrl} alt="" className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-white text-[7px] font-bold border border-white/10 flex-shrink-0">
                    {getCreatorInitial(note.creator)}
                  </div>
                )}
                <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate max-w-[100px] md:max-w-[160px]">
                  {getCreatorName(note.creator)}
                </span>
              </div>
            ) : (
              <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                <User size={10} className="text-red-500" /> Personal
              </span>
            )}

            {/* Divider dot */}
            <span className="w-1 h-1 rounded-full bg-neutral-700 hidden sm:block" />

            {/* Time */}
            <span className="hidden sm:flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              <Clock size={10} className="text-neutral-600" />
              {formatTimeAgo(note.updatedAt || note.createdAt)}
            </span>

            {/* Views */}
            {note.views !== undefined && note.views > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-neutral-700 hidden md:block" />
                <span className="hidden md:flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  <Eye size={10} className="text-neutral-600" />
                  {note.views.toLocaleString()} views
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mobile time badge */}
        <div className="sm:hidden text-[8px] font-bold text-neutral-600 uppercase tracking-wider flex-shrink-0">
          {formatTimeAgo(note.updatedAt || note.createdAt)}
        </div>

        {/* Arrow indicator */}
        <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] text-neutral-600 group-hover:text-red-500 group-hover:bg-red-500/10 transition-all flex-shrink-0">
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
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
        page: page.toString(), limit: '12', sortBy, sortOrder: 'desc', type: 'notes', search: search || ''
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

  const handleCardClick = useCallback((slug: string, isPersonal: boolean, creatorUsername?: string) => {
    router.push(isPersonal ? `/notes/${slug}` : `/note/${creatorUsername || 'anonymous'}/${slug}`);
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
      <div className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-white/[0.06] transform-gpu">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-4">
            
            {/* Logo/Title */}
            <div className="flex items-center gap-2.5 md:gap-3">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl md:rounded-[0.85rem] flex items-center justify-center text-black shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.08)]">
                  <Database size={16} className="md:w-5 md:h-5" />
               </div>
               <div>
                  <h1 className="text-base md:text-xl font-bold tracking-tight text-white leading-tight">My Library</h1>
                  <p className="text-[8px] md:text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Personal Workspace</p>
               </div>
            </div>

            {/* Desktop Tabs & Search */}
            <div className="hidden md:flex flex-1 max-w-2xl gap-3 ml-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList className="bg-neutral-900/60 border border-white/[0.08] h-10 p-1 rounded-xl">
                        <TabsTrigger value="explore" className="text-[10px] font-bold uppercase tracking-wider px-5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all data-[state=active]:shadow-sm">Community</TabsTrigger>
                        <TabsTrigger value="my-bag" className="text-[10px] font-bold uppercase tracking-wider px-5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all data-[state=active]:shadow-sm">Personal</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative flex-1 group">
                   <div className="absolute -inset-0.5 bg-red-600/15 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                   <div className="relative flex items-center bg-black border border-white/[0.08] rounded-xl h-10 px-3.5">
                      <Search className="text-neutral-500 mr-2 group-focus-within:text-red-500 transition-colors" size={14} />
                      <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notes..."
                        className="w-full bg-transparent border-none focus:outline-none text-xs font-medium text-white placeholder:text-neutral-600"
                      />
                   </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
               {/* View Mode Toggle */}
               <div className="hidden md:flex items-center bg-neutral-900/50 border border-white/[0.06] rounded-lg p-0.5">
                  <button 
                    onClick={() => setViewMode("grid")} 
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
                    )}
                  >
                    <Grid size={14} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")} 
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === "list" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
                    )}
                  >
                    <List size={14} />
                  </button>
               </div>

               {/* Sort */}
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/[0.06] bg-neutral-900/50 h-8 md:h-9 px-2.5 md:px-3 text-[10px] font-bold uppercase tracking-wider gap-1.5">
                        <ArrowUpDown size={12} />
                        <span className="hidden md:inline">{sortLabel}</span>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 text-white rounded-xl p-1.5 w-44 shadow-2xl">
                      <DropdownMenuItem onClick={() => setSortBy("updatedAt")} className={cn("text-xs font-medium focus:bg-white/10 rounded-lg cursor-pointer gap-2", sortBy === "updatedAt" && "text-red-400")}>
                        <Clock size={12} /> Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("title")} className={cn("text-xs font-medium focus:bg-white/10 rounded-lg cursor-pointer gap-2", sortBy === "title" && "text-red-400")}>
                        <ArrowUpDown size={12} /> Alphabetical
                      </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               {/* Mobile View Toggle */}
               <div className="md:hidden flex items-center bg-neutral-900/50 border border-white/[0.06] rounded-lg p-0.5">
                  <button 
                    onClick={() => setViewMode("grid")} 
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"
                    )}
                  >
                    <Grid size={13} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")} 
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === "list" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"
                    )}
                  >
                    <List size={13} />
                  </button>
               </div>

               {/* Generate Button (Desktop) */}
               <Button 
                  onClick={() => router.push('/')}
                  className="hidden md:flex bg-red-600 hover:bg-red-700 text-white rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest px-5 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all"
               >
                  <Plus size={14} className="mr-1.5" /> New Note
               </Button>
            </div>
         </div>
      </div>

      {/* --- MOBILE: Sub-Header (Tabs & Search) --- */}
      <div className="md:hidden px-4 py-2.5 sticky top-[57px] z-30 bg-black/95 backdrop-blur-sm border-b border-white/[0.04] space-y-2.5 transform-gpu">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-neutral-900 border border-white/[0.08] h-9 p-0.5 rounded-xl w-full grid grid-cols-2">
                <TabsTrigger value="explore" className="text-[9px] font-bold uppercase tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all">Community</TabsTrigger>
                <TabsTrigger value="my-bag" className="text-[9px] font-bold uppercase tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all">Personal</TabsTrigger>
            </TabsList>
         </Tabs>
         
         <div className="relative group">
            <div className="absolute -inset-0.5 bg-red-600/15 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-black border border-white/[0.08] rounded-xl h-9 px-3">
                <Search className="text-neutral-500 mr-2 group-focus-within:text-red-500 transition-colors" size={13} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-transparent border-none focus:outline-none text-[11px] font-medium text-white placeholder:text-neutral-600"
                />
            </div>
         </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 min-h-[50vh] relative z-10">
         
         {/* Results Count Badge */}
         {!loading && currentItems.length > 0 && (
           <div className="mb-4 md:mb-6 flex items-center gap-2">
             <span className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
               {currentItems.length} {currentItems.length === 1 ? 'Note' : 'Notes'}
             </span>
             <div className="flex-1 h-px bg-white/[0.04]" />
           </div>
         )}

         <AnimatePresence mode="wait">
           {loading && currentItems.length === 0 ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[40vh] space-y-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin relative z-10" />
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