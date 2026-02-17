"use client";
import React, { useState, useCallback, useEffect, JSX } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  ChevronDown,
  Grid,
  List,
  Clock,
  PlayCircle,
  Globe,
  Lock,
  User,
  Sparkles,
  FileText,
  Plus,
  Compass
} from "lucide-react";
import { IconFolderCode } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import {
  Empty,
  EmptyContent,
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

// --- Sub-Component: Note Card ---
const NoteCard = React.memo(({ 
  note, 
  viewMode, 
  searchQuery, 
  onClick, 
  onProfileClick, 
  highlightText, 
  formatDate, 
  showCreator = false,
  isPersonal = false
}: {
  note: Note;
  viewMode: string;
  searchQuery: string;
  onClick: (slug: string, isPersonal: boolean, creatorUsername?: string) => void;
  onProfileClick: (creatorName: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  formatDate: (dateString: string, short?: boolean) => string;
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
    if (note.creator?.username) {
      onProfileClick(note.creator.username);
    } else if (note.creator?.name) {
      onProfileClick(note.creator.name);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer bg-neutral-900/50 border border-white/5 hover:border-white/10 active:scale-95 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col relative
        ${viewMode === "grid" 
          ? "h-full" 
          : "flex-row h-24 sm:h-auto"
        }`}
    >
      {/* Thumbnail Section */}
      <div className={`relative overflow-hidden bg-zinc-800 flex-shrink-0 
        ${viewMode === "grid" ? "w-full aspect-video" : "w-32 sm:w-48 h-full"}`}>
        
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={note.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                <PlayCircle size={16} />
             </div>
          </div>
        )}
        
        {/* Desktop Hover Overlay (Hidden on Mobile) */}
        <div className="hidden md:flex absolute inset-0 bg-black/40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="rounded-full p-2 bg-white/10 backdrop-blur-md text-white border border-white/20">
             <FileText size={16} />
           </div>
        </div>

        {/* Timestamp Badge (Compact) */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-zinc-300 font-bold backdrop-blur-sm border border-white/5">
          {formatDate(note.updatedAt || note.createdAt, true)} 
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex flex-col flex-1 ${viewMode === "grid" ? "p-3" : "p-3 sm:p-4"}`}>
        
        {/* Title */}
        <h3 className={`font-bold text-zinc-100 mb-1 leading-tight group-hover:text-white transition-colors
          ${viewMode === 'grid' ? 'text-xs sm:text-sm line-clamp-2' : 'text-sm sm:text-base line-clamp-1'}`}>
          {searchQuery ? highlightText(note.title, searchQuery) : note.title}
        </h3>

        {/* Footer Area */}
        <div className="mt-auto pt-2 flex items-center justify-between text-[10px] sm:text-xs text-zinc-500">
           
           {/* Left: Creator/Type */}
           {showCreator ? (
             <div className="flex items-center gap-1.5 max-w-[70%]" onClick={handleCreatorClick}>
               {note.creator?.avatarUrl ? (
                 <img src={note.creator.avatarUrl} alt="av" className="w-4 h-4 rounded-full border border-zinc-700" />
               ) : (
                 <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px]">
                   {getCreatorInitial(note.creator)}
                 </div>
               )}
               <span className="truncate">{getCreatorName(note.creator)}</span>
             </div>
           ) : (
             <span className="flex items-center gap-1">
               <User size={10} /> Personal
             </span>
           )}

           {/* Right: Views or Host */}
           {note.views !== undefined && note.views > 0 && (
             <span className="flex items-center gap-1">
               {note.views} views
             </span>
           )}
        </div>
      </div>
    </div>
  );
});
NoteCard.displayName = "NoteCard";

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
        return fetchedNotes.length; // Return count for logic
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

  // 4. Initial Load Logic - Auto Switch to Explore if Personal is Empty
  useEffect(() => {
    const init = async () => {
        if (isAuthenticated && !initialCheckDone) {
            // First fetch personal
            const count = await fetchPersonalNotes(1, false, "");
            setInitialCheckDone(true);
            
            // Logic: If user has 0 personal notes, switch to explore
            if (count === 0) {
                setActiveTab("explore");
            }
        }
    };
    init();
  }, [isAuthenticated, initialCheckDone, fetchPersonalNotes]);

  // 5. Standard Tab Switching Fetch
  useEffect(() => {
    if (!initialCheckDone) return; // Skip if initializing
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
    return <>{parts.map((p, i) => p.toLowerCase() === highlight.toLowerCase() ? <mark key={i} className="bg-yellow-500/30 text-yellow-200">{p}</mark> : p)}</>;
  }, []);

  const formatDate = (dateString: string, short = false) => {
    try {
      const date = new Date(dateString);
      if (short) return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return ""; }
  };

  const currentItems = activeTab === 'explore' ? exploreItems : notes;

  if (isAuthenticated === false && loading === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 mx-auto text-zinc-600" />
          <p className="text-lg text-zinc-400">Please login to access your library</p>
          <Button onClick={() => router.push('/login')} className="bg-white text-black">Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-zinc-800">
      
      {/* --- DESKTOP: Sticky Top Navbar --- */}
      <div className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-xl border-b border-white/5">
         <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
               <div className="md:hidden font-bold text-lg tracking-tight">Library</div>
               <div className="hidden md:block">
                  <h1 className="text-lg font-bold tracking-tight text-white">Library</h1>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Workspace</p>
               </div>
            </div>

            {/* Desktop Tabs & Search */}
            <div className="hidden md:flex flex-1 max-w-2xl gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList className="bg-zinc-900/50 border border-white/5 h-9">
                        <TabsTrigger value="explore" className="text-xs px-4">Community</TabsTrigger>
                        <TabsTrigger value="my-bag" className="text-xs px-4">Personal</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative flex-1 group">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={14} />
                   <input 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search..."
                     className="w-full bg-zinc-900/50 border border-white/5 rounded-lg h-9 pl-9 text-sm focus:outline-none focus:bg-zinc-900 focus:border-white/20 transition-all text-white placeholder:text-zinc-600"
                   />
                </div>
            </div>

            {/* Actions: Sort & Create */}
            <div className="flex items-center gap-2">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5 w-9 h-9">
                        <List size={18} />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-white">
                      <DropdownMenuItem onClick={() => setSortBy("updatedAt")}>Newest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("title")}>A-Z</DropdownMenuItem>
                      <div className="h-px bg-white/10 my-1" />
                      <DropdownMenuItem onClick={() => setViewMode("grid")}>Grid View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("list")}>List View</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <Button 
                  onClick={() => router.push('/')}
                  className="hidden md:flex bg-white hover:bg-neutral-200 text-black rounded-lg h-9 text-xs font-bold px-4"
               >
                  <Plus size={14} className="mr-1.5" /> New Note
               </Button>
            </div>
         </div>
      </div>

      {/* --- MOBILE: Sub-Header (Search) --- */}
      <div className="md:hidden px-4 py-2 sticky top-[57px] z-30 bg-black/95 backdrop-blur-md border-b border-white/5">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your notes..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl h-10 pl-9 text-sm focus:outline-none focus:border-zinc-700 text-white"
            />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8 min-h-[60vh]">
         {loading && currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
               <p className="text-xs uppercase tracking-widest">Syncing Library...</p>
            </div>
         ) : currentItems.length > 0 ? (
            <div className="animate-in fade-in duration-500">
               <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" : "flex flex-col gap-3"}>
                  {currentItems.map((note) => (
                    <NoteCard 
                      key={note._id} 
                      note={note} 
                      viewMode={viewMode} 
                      searchQuery={searchQuery}
                      onClick={handleCardClick}
                      onProfileClick={(name) => router.push(`/${formatCreatorNameForUrl(name)}/profile`)}
                      highlightText={highlightText}
                      formatDate={formatDate}
                      showCreator={activeTab === 'explore'}
                      isPersonal={activeTab === 'my-bag'}
                    />
                  ))}
               </div>
               
               {hasMore && (
                 <div className="flex justify-center mt-8">
                   <Button variant="ghost" onClick={handleLoadMore} disabled={loading} className="text-xs text-zinc-500 hover:text-white">
                      {loading ? "Loading..." : "Load More"}
                   </Button>
                 </div>
               )}
            </div>
         ) : (
            <div className="py-20 flex justify-center">
              <Empty className="max-w-xs">
                 <EmptyHeader>
                   <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 mb-4">
                     {activeTab === 'explore' ? <Globe className="text-zinc-500" size={24} /> : <IconFolderCode className="text-zinc-500" size={24} />}
                   </div>
                   <EmptyTitle className="text-white text-lg font-bold">
                     {activeTab === 'explore' ? 'No results' : 'Library Empty'}
                   </EmptyTitle>
                   <EmptyDescription className="text-zinc-500 text-xs mt-1">
                     {activeTab === 'explore' ? `Try a different search term.` : 'Create your first AI note to get started.'}
                   </EmptyDescription>
                 </EmptyHeader>
              </Empty>
            </div>
         )}
      </div>

      {/* --- MOBILE: Sticky Bottom Navigation --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black/90 backdrop-blur-xl border-t border-white/5 pb-safe">
         <div className="flex items-center justify-around h-16 px-2">
            
            {/* Tab: Personal */}
            <button 
               onClick={() => setActiveTab("my-bag")}
               className={cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16", activeTab === "my-bag" ? "text-white" : "text-zinc-600")}
            >
               <IconFolderCode size={20} stroke={activeTab === "my-bag" ? 2.5 : 2} />
               <span className="text-[9px] font-medium">Personal</span>
            </button>

            {/* Floating Action Button (Center) */}
            <button 
               onClick={() => router.push('/')}
               className="relative -top-5 bg-white text-black rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-transform"
            >
               <Plus size={28} />
            </button>

            {/* Tab: Explore */}
            <button 
               onClick={() => setActiveTab("explore")}
               className={cn("flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16", activeTab === "explore" ? "text-white" : "text-zinc-600")}
            >
               <Compass size={20} stroke={activeTab === "explore" ? 2.5 : 2} />
               <span className="text-[9px] font-medium">Explore</span>
            </button>
         </div>
      </div>

    </div>
  );
}