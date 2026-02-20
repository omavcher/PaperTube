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
  Compass,
  Database,
  Loader2
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
      className={`group cursor-pointer bg-neutral-900/40 border border-white/5 hover:border-red-600/30 hover:bg-neutral-900/60 active:scale-95 transition-all duration-300 rounded-2xl md:rounded-[1.5rem] overflow-hidden flex flex-col relative
        ${viewMode === "grid" 
          ? "h-full" 
          : "flex-row h-24 sm:h-auto"
        }`}
    >
      {/* Thumbnail Section */}
      <div className={`relative overflow-hidden bg-neutral-900 flex-shrink-0 
        ${viewMode === "grid" ? "w-full aspect-video border-b border-white/5" : "w-32 sm:w-48 h-full border-r border-white/5"}`}>
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none mix-blend-overlay" />

        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={note.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
             <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500">
                <PlayCircle size={20} />
             </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Desktop Hover Overlay (Hidden on Mobile) */}
        <div className="hidden md:flex absolute inset-0 bg-black/40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
           <div className="rounded-full p-3 bg-red-600/20 backdrop-blur-md text-red-500 border border-red-600/30 scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
             <FileText size={18} />
           </div>
        </div>

        {/* Timestamp Badge (Compact) */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] md:text-[9px] text-white font-bold uppercase tracking-widest border border-white/10 z-20">
          {formatDate(note.updatedAt || note.createdAt, true)} 
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex flex-col flex-1 ${viewMode === "grid" ? "p-3 md:p-5" : "p-3 sm:p-5"}`}>
        
        {/* Title */}
        <h3 className={`font-bold text-white mb-2 leading-tight group-hover:text-red-400 transition-colors
          ${viewMode === 'grid' ? 'text-xs md:text-sm line-clamp-2' : 'text-sm md:text-base line-clamp-1'}`}>
          {searchQuery ? highlightText(note.title, searchQuery) : note.title}
        </h3>

        {/* Footer Area */}
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
           
           {/* Left: Creator/Type */}
           {showCreator ? (
             <div className="flex items-center gap-2 max-w-[70%] hover:text-white transition-colors" onClick={handleCreatorClick}>
               {note.creator?.avatarUrl ? (
                 <img src={note.creator.avatarUrl} alt="av" className="w-5 h-5 rounded-md border border-white/10" />
               ) : (
                 <div className="w-5 h-5 rounded-md bg-neutral-800 flex items-center justify-center text-white border border-white/10">
                   {getCreatorInitial(note.creator)}
                 </div>
               )}
               <span className="truncate">{getCreatorName(note.creator)}</span>
             </div>
           ) : (
             <span className="flex items-center gap-1.5">
               <User size={12} className="text-red-500" /> Personal
             </span>
           )}

           {/* Right: Views */}
           {note.views !== undefined && note.views > 0 && (
             <span className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
               <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
               {note.views}
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
    return <>{parts.map((p, i) => p.toLowerCase() === highlight.toLowerCase() ? <mark key={i} className="bg-red-500/30 text-red-200 rounded px-0.5">{p}</mark> : p)}</>;
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
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-red-900/50">
      
      {/* --- DESKTOP & MOBILE Sticky Top Navbar --- */}
      <div className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-xl border-b border-white/5">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
            
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center text-black shrink-0">
                  <Database size={18} className="md:w-5 md:h-5" />
               </div>
               <div>
                  <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-tight">Data Library</h1>
                  <p className="text-[9px] md:text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Personal Workspace</p>
               </div>
            </div>

            {/* Desktop Tabs & Search */}
            <div className="hidden md:flex flex-1 max-w-2xl gap-4 ml-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList className="bg-neutral-900/50 border border-white/10 h-11 p-1 rounded-xl">
                        <TabsTrigger value="explore" className="text-xs font-bold uppercase tracking-wider px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all">Community</TabsTrigger>
                        <TabsTrigger value="my-bag" className="text-xs font-bold uppercase tracking-wider px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all">Personal</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative flex-1 group">
                   <div className="absolute -inset-0.5 bg-red-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                   <div className="relative flex items-center bg-black border border-white/10 rounded-xl h-11 px-4">
                      <Search className="text-neutral-500 mr-2 group-focus-within:text-red-500 transition-colors" size={16} />
                      <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search databases..."
                        className="w-full bg-transparent border-none focus:outline-none text-xs font-bold uppercase tracking-wider text-white placeholder:text-neutral-600"
                      />
                   </div>
                </div>
            </div>

            {/* Actions: Sort & Create */}
            <div className="flex items-center gap-2 md:gap-3">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/10 w-10 h-10 rounded-xl border border-white/5 bg-neutral-900/50">
                        <List size={16} />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl p-2 w-48 shadow-2xl">
                      <div className="px-2 pb-2 mb-2 border-b border-white/5">
                         <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">View Options</span>
                      </div>
                      <DropdownMenuItem onClick={() => setSortBy("updatedAt")} className="text-xs font-medium focus:bg-white/10 rounded-lg cursor-pointer">Newest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("title")} className="text-xs font-medium focus:bg-white/10 rounded-lg cursor-pointer">A-Z Alphabetical</DropdownMenuItem>
                      <div className="h-px bg-white/5 my-2" />
                      <DropdownMenuItem onClick={() => setViewMode("grid")} className="text-xs font-medium focus:bg-white/10 rounded-lg cursor-pointer">Grid View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("list")} className="text-xs font-medium focus:bg-white/10 rounded-lg cursor-pointer">List View</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <Button 
                  onClick={() => router.push('/')}
                  className="hidden md:flex bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 text-xs font-bold uppercase tracking-widest px-6 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
               >
                  <Plus size={16} className="mr-2" /> Init Note
               </Button>
            </div>
         </div>
      </div>

      {/* --- MOBILE ONLY: Sub-Header (Tabs & Search) --- */}
      <div className="md:hidden px-4 py-3 sticky top-[65px] z-30 bg-black/95 backdrop-blur-md border-b border-white/5 space-y-3">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-neutral-900 border border-white/10 h-10 p-1 rounded-xl w-full grid grid-cols-2">
                <TabsTrigger value="explore" className="text-[10px] font-bold uppercase tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all">Community</TabsTrigger>
                <TabsTrigger value="my-bag" className="text-[10px] font-bold uppercase tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all">Personal</TabsTrigger>
            </TabsList>
         </Tabs>
         
         <div className="relative group">
            <div className="absolute -inset-0.5 bg-red-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-black border border-white/10 rounded-xl h-10 px-3">
                <Search className="text-neutral-500 mr-2 group-focus-within:text-red-500 transition-colors" size={14} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search databases..."
                  className="w-full bg-transparent border-none focus:outline-none text-[10px] font-bold uppercase tracking-wider text-white placeholder:text-neutral-600"
                />
            </div>
         </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[60vh]">
         {loading && currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-neutral-500 gap-4">
               <Loader2 className="animate-spin text-red-500" size={32} />
               <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Syncing Database...</p>
            </div>
         ) : currentItems.length > 0 ? (
            <div className="animate-in fade-in duration-500">
               {/* Fixed Grid for Mobile to show 2 items per row */}
               <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5" : "flex flex-col gap-3 md:gap-4"}>
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
                 <div className="flex justify-center mt-12 mb-8">
                   <Button variant="outline" onClick={handleLoadMore} disabled={loading} className="bg-transparent border-white/10 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl h-12 px-8 transition-colors">
                      {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
                      {loading ? "Extracting..." : "Load More Nodes"}
                   </Button>
                 </div>
               )}
            </div>
         ) : (
            <div className="py-32 flex justify-center">
              <Empty className="max-w-sm border border-white/5 bg-neutral-900/30 rounded-[2rem] p-8 backdrop-blur-sm">
                 <EmptyHeader>
                   <div className="mx-auto w-16 h-16 bg-black rounded-2xl flex items-center justify-center border border-white/10 mb-6 shadow-xl">
                     {activeTab === 'explore' ? <Globe className="text-neutral-500" size={28} /> : <IconFolderCode className="text-neutral-500" size={28} />}
                   </div>
                   <EmptyTitle className="text-white text-xl font-bold tracking-tight">
                     {activeTab === 'explore' ? 'No Signals Found' : 'Empty Directory'}
                   </EmptyTitle>
                   <EmptyDescription className="text-neutral-400 text-sm mt-2 font-medium">
                     {activeTab === 'explore' ? `Adjust search parameters to locate files.` : 'Initialize your first AI note sequence.'}
                   </EmptyDescription>
                 </EmptyHeader>
              </Empty>
            </div>
         )}
      </div>

    </div>
  );
}