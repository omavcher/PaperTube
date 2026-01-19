"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  Filter
} from "lucide-react";
import {
  IconCards,
  IconPuzzle,
  IconChartBar,
  IconFileText,
  IconFolderCode,
  IconLayoutGrid
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

// --- Types ---
interface Creator {
  _id: string;
  name: string;
  avatarUrl?: string;
  username?: string;
}

type NoteType = 'note' | 'flashcard' | 'quiz';

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
  type?: NoteType;
  flashcardsCount?: number;
  generationDetails?: any;
  questionsCount?: number;
  settings?: any;
  transcriptAvailable?: boolean;
  visibility?: string;
  fileType?: string;
  commentsCount?: number;
  likesCount?: number;
  contentCount?: number;
  status?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  totalNotes?: number;
  totalFlashcards?: number;
  totalQuizzes?: number;
  hasNext: boolean;
  hasPrev: boolean;
  page?: number;
  limit?: number;
  total?: number;
  counts?: {
    notes: number;
    flashcards: number;
    quizzes: number;
  };
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
  data: Note[];
  pagination: Pagination;
}

// --- Configuration ---
const CONTENT_TYPES = [
  { id: 'all', label: 'All', icon: IconLayoutGrid, color: 'text-zinc-400', bg: 'bg-zinc-800' },
  { id: 'note', label: 'Notes', icon: IconFileText, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { id: 'flashcard', label: 'Flashcards', icon: IconCards, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'quiz', label: 'Quizzes', icon: IconPuzzle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
];

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

// --- Normalize Note Data ---
const normalizeNote = (note: any): Note => {
  // Handle both explore and personal note structures
  return {
    _id: note._id,
    slug: note.slug,
    title: note.title,
    videoUrl: note.videoUrl,
    updatedAt: note.updatedAt,
    createdAt: note.createdAt,
    creator: note.creator,
    views: note.views,
    thumbnail: note.thumbnail,
    videoId: note.videoId,
    type: note.type as NoteType || (note.fileType as NoteType),
    flashcardsCount: note.flashcardsCount,
    generationDetails: note.generationDetails,
    questionsCount: note.questionsCount,
    settings: note.settings,
    transcriptAvailable: note.transcriptAvailable,
    visibility: note.visibility,
    fileType: note.fileType,
    commentsCount: note.commentsCount,
    likesCount: note.likesCount,
    contentCount: note.contentCount || note.questionsCount || note.flashcardsCount,
    status: note.status
  };
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
  cleanHtmlContent,
  showCreator = false,
  isPersonal = false
}: {
  note: Note;
  viewMode: string;
  searchQuery: string;
  onClick: (slug: string, type: string, isPersonal: boolean, creatorUsername?: string) => void;
  onProfileClick: (creatorName: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  formatDate: (dateString: string, short?: boolean) => string;
  cleanHtmlContent: (content: string) => string;
  showCreator?: boolean;
  isPersonal?: boolean;
}) => {
  const thumbnailUrl = note.thumbnail || getYouTubeThumbnail(note.videoUrl);
  
  // Determine Type Visuals
  const noteType = note.type || 'note';
  const typeConfig = CONTENT_TYPES.find(t => t.id === noteType) || CONTENT_TYPES[1];
  const TypeIcon = typeConfig.icon;

  const handleCardClick = () => {
    const creatorUsername = note.creator?.username || (note.creator?.name ? formatCreatorNameForUrl(note.creator.name) : undefined);
    onClick(note.slug, noteType, isPersonal, creatorUsername);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.creator?.username) {
      onProfileClick(note.creator.username);
    } else if (note.creator?.name) {
      onProfileClick(note.creator.name);
    }
  };

  // Get display content
  const getDisplayContent = () => {
    if (noteType === 'flashcard') {
      return `${note.flashcardsCount || 0} flashcards`;
    } else if (noteType === 'quiz') {
      return `${note.questionsCount || 0} questions`;
    }
    return '';
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 rounded-xl overflow-hidden flex flex-col relative
        ${viewMode === "grid" 
          ? "h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50" 
          : "sm:flex-row h-auto hover:bg-zinc-800/50"
        }`}
    >
      {/* Type Indicator Line */}
      <div className={cn("absolute top-0 left-0 w-1 h-full z-10 opacity-0 group-hover:opacity-100 transition-opacity", typeConfig.color.replace('text-', 'bg-'))} />

      {/* Thumbnail Section */}
      <div className={`relative overflow-hidden bg-zinc-800 flex-shrink-0 
        ${viewMode === "grid" ? "w-full aspect-video" : "w-full sm:w-48 h-32 sm:h-auto"}`}>
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={note.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
             <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                <PlayCircle size={20} />
             </div>
          </div>
        )}
        
        {/* Type Badge */}
        <div className={cn(
          "absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border flex items-center gap-1 shadow-sm",
          typeConfig.bg,
          typeConfig.color.replace('text-', 'text-')
        )}>
           <TypeIcon size={12} />
           {typeConfig.label}
        </div>

        {/* Content Count Badge */}
        {(noteType === 'flashcard' && note.flashcardsCount) || (noteType === 'quiz' && note.questionsCount) ? (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs text-white font-medium">
            {noteType === 'flashcard' ? `${note.flashcardsCount} cards` : `${note.questionsCount} questions`}
          </div>
        ) : null}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className={cn("rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform bg-white text-black")}>
             <TypeIcon size={20} fill="currentColor" className={typeConfig.color} />
           </div>
        </div>

        {/* Timestamp Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-zinc-400 font-medium flex items-center gap-1 backdrop-blur-sm border border-white/5">
          <Clock size={10} />
          {formatDate(note.updatedAt, true)} 
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex flex-col flex-1 ${viewMode === "grid" ? "p-3 sm:p-4" : "p-4"}`}>
        
        {/* Title */}
        <h3 className={`font-bold text-zinc-100 mb-1.5 leading-snug group-hover:text-white transition-colors
          ${viewMode === 'grid' ? 'text-sm sm:text-base line-clamp-2' : 'text-lg line-clamp-1'}`}>
          {searchQuery ? highlightText(note.title, searchQuery) : note.title}
        </h3>

        {/* Description/Content */}
        <p className={`text-zinc-400 text-xs sm:text-sm line-clamp-2 mb-3 flex-1 
          ${viewMode === 'grid' ? 'hidden sm:block' : 'block'}`}>
          {searchQuery ? highlightText(getDisplayContent(), searchQuery) : getDisplayContent()}
        </p>

        {/* Footer Area */}
        <div className="mt-auto pt-3 border-t border-zinc-800/50 flex items-center justify-between text-xs">
           
           {/* Left side: Creator Info or Personal Label */}
           {showCreator ? (
             <div 
                className="flex items-center gap-2 max-w-[70%] group/creator cursor-pointer" 
                onClick={handleCreatorClick}
                title="View Profile"
             >
               <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 group-hover/creator:border-white transition-colors">
                  {note.creator?.avatarUrl ? (
                    <img src={note.creator.avatarUrl} alt={getCreatorName(note.creator)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-zinc-400 bg-zinc-800">
                      {getCreatorInitial(note.creator)}
                    </div>
                  )}
               </div>
               <span className="text-zinc-400 truncate group-hover/creator:text-white transition-colors underline-offset-2 group-hover/creator:underline">
                 {getCreatorName(note.creator)}
               </span>
             </div>
           ) : (
             <span className="text-zinc-500 font-medium flex items-center gap-1">
               <User size={12} />
               Personal
             </span>
           )}

           {/* Right side: Views or Hostname */}
           {note.views !== undefined ? (
             <span className="text-zinc-600 text-[10px] flex items-center gap-1">
               👁️ {note.views || 0}
             </span>
           ) : note.videoUrl ? (
             <span className="text-zinc-600 text-[10px] truncate max-w-[60px] sm:max-w-[100px]">
               {(() => {
                 try {
                   return new URL(note.videoUrl).hostname.replace('www.', '').replace('youtube.com', 'YouTube');
                 } catch { return 'YouTube'; }
               })()}
             </span>
           ) : null}
        </div>
      </div>
    </div>
  );
});
NoteCard.displayName = "NoteCard";

export default function NotesWorkspace() {
  const [activeTab, setActiveTab] = useState("my-bag");
  const [contentType, setContentType] = useState("all"); 
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastEdit");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Data State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [exploreItems, setExploreItems] = useState<Note[]>([]);
  const [explorePagination, setExplorePagination] = useState<Pagination | null>(null);
  const [personalPagination, setPersonalPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
    if (!authToken) setLoading(false);
  }, []);

  // Fetch explore data
  const fetchExploreData = useCallback(async (page = 1, append = false, search = '') => {
    if (!isAuthenticated) return;

    try {
      if (!append) setLoading(true);
      
      const authToken = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: sortBy === 'lastEdit' ? 'updatedAt' : sortBy,
        sortOrder: 'desc',
        type: contentType === 'all' ? 'all' : contentType,
        search: search || ''
      });

      const response = await api.get<ExploreResponse>(`/notes/explore?${params.toString()}`, {
        headers: { 'Auth': authToken }
      }); 
      
      if (response.data.success) {
        const { items, pagination: paginationData } = response.data.data;
        const normalizedItems = items.map(normalizeNote);
        
        if (append) {
          setExploreItems(prev => [...prev, ...normalizedItems]);
        } else {
          setExploreItems(normalizedItems);
        }
        
        setExplorePagination(paginationData);
        setCurrentPage(paginationData.currentPage);
        setHasMore(paginationData.hasNext);
      }
    } catch (error) {
      console.error("Error fetching explore data:", error);
      if (!append) {
        setExploreItems([]);
        setExplorePagination(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sortBy, contentType]);

  // Fetch personal notes
  const fetchPersonalNotes = useCallback(async (page = 1, append = false, search = '') => {
    if (!isAuthenticated) return;

    try {
      if (!append) setLoading(true);
      
      const authToken = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: sortBy === 'lastEdit' ? 'updatedAt' : sortBy,
        sortOrder: 'desc',
        search: search || ''
      });

      const response = await api.get<PersonalNotesResponse>(`/notes/get-all-notes?${params.toString()}`, {
        headers: { 'Auth': authToken }
      }); 
      
      if (response.data.success) {
        const fetchedNotes = response.data.data || [];
        const paginationData = response.data.pagination;
        const normalizedNotes = fetchedNotes.map(normalizeNote);
        
        if (append) {
          setNotes(prev => [...prev, ...normalizedNotes]);
        } else {
          setNotes(normalizedNotes);
        }
        
        setPersonalPagination(paginationData);
        setCurrentPage(paginationData?.page || 1);
        setHasMore(paginationData ? (paginationData.page < paginationData.totalPages) : false);
      }
    } catch (error) {
      console.error("Error fetching personal notes:", error);
      if (!append) {
        setNotes([]);
        setPersonalPagination(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sortBy]);

  // Debounced search & filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        setCurrentPage(1);
        if (activeTab === 'explore') {
          fetchExploreData(1, false, searchQuery);
        } else {
          fetchPersonalNotes(1, false, searchQuery);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, sortBy, isAuthenticated, contentType]);

  // Switch tabs
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(1);
      if (activeTab === 'explore') {
        fetchExploreData(1, false, searchQuery);
      } else {
        fetchPersonalNotes(1, false, searchQuery);
      }
    }
  }, [activeTab, isAuthenticated]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      if (activeTab === 'explore') {
        fetchExploreData(nextPage, true, searchQuery);
      } else {
        fetchPersonalNotes(nextPage, true, searchQuery);
      }
    }
  };

  const handleCardClick = useCallback((slug: string, type: string, isPersonal: boolean = false, creatorUsername?: string) => {
    if (isPersonal) {
      // For personal notes: /notes/slug
      const route = type === 'note' ? `/notes/${slug}` 
                  : type === 'quiz' ? `/quiz/${slug}`
                  : type === 'flashcard' ? `/flashcards/${slug}`
                  : `/notes/${slug}`;
      router.push(route);
    } else {
      // For explore notes: /note/username/slug
      const username = creatorUsername || 'anonymous';
      const route = type === 'note' ? `/note/${username}/${slug}` 
                  : type === 'quiz' ? `/quiz/${username}/${slug}`
                  : type === 'flashcard' ? `/flashcards/${username}/${slug}`
                  : `/note/${username}/${slug}`;
      router.push(route);
    }
  }, [router]);

  const handleProfileClick = useCallback((creatorName: string) => {
    const formattedName = formatCreatorNameForUrl(creatorName);
    router.push(`/${formattedName}/profile`);
  }, [router]);

  // Utils
  const highlightText = useCallback((text: string, highlight: string): string | JSX.Element => {
    if (!highlight.trim() || !text) return text;
    try {
      const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      return <>{parts.map((p, i) => p.toLowerCase() === highlight.toLowerCase() ? <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{p}</mark> : p)}</>;
    } catch { return text; }
  }, []);

  const formatDate = (dateString: string, short = false): string => {
    try {
      const date = new Date(dateString);
      if (short) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return ""; }
  };

  const cleanHtmlContent = (content: string): string => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > 100 ? text.slice(0, 100) + '...' : text;
  };

  // Get current items based on active tab
  const currentItems = activeTab === 'explore' ? exploreItems : notes;
  const currentPagination = activeTab === 'explore' ? explorePagination : personalPagination;

  // Filter items by type (client-side for personal notes, server-side for explore)
  const filteredItems = useMemo(() => {
    if (activeTab === 'explore') {
      // Explore already filtered server-side by contentType
      return currentItems;
    } else {
      // Personal notes need client-side filtering
      if (contentType === 'all') return currentItems;
      return currentItems.filter(item => (item.type || 'note') === contentType);
    }
  }, [currentItems, contentType, activeTab]);

  if (isAuthenticated === false && loading === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 mx-auto text-zinc-600" />
          <p className="text-lg text-zinc-400">Please login to access your library</p>
          <Button onClick={() => router.push('/login')} className="bg-white text-black hover:bg-zinc-200">Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Top Header */}
        <div className="flex flex-col gap-6 mb-8">
           <div className="flex items-center justify-between">
              <div>
                 <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Library</h1>
                 <p className="text-zinc-400 text-sm">Manage your AI-generated knowledge base.</p>
              </div>
              <Button 
                onClick={() => router.push('/')}
                className="bg-white hover:bg-zinc-200 text-black rounded-full px-6 py-2 text-sm font-semibold shadow-lg transition-all duration-300"
              >
                + New Generation
              </Button>
           </div>
        </div>

        <Tabs defaultValue="my-bag" value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Controls Bar */}
          <div className=" z-20 bg-black/80 backdrop-blur-xl border-b border-zinc-800 pb-4 mb-6 pt-2">
            <div className="flex flex-col gap-4">
              
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                {/* Main Tabs */}
                <TabsList className="bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto grid grid-cols-2 sm:flex h-auto">
                  <TabsTrigger value="explore" className="rounded-lg px-6 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 gap-2 transition-all">
                    <Globe size={16} /> Community
                  </TabsTrigger>
                  <TabsTrigger value="my-bag" className="rounded-lg px-6 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 gap-2 transition-all">
                    <IconFolderCode size={16} /> Personal
                  </TabsTrigger>
                </TabsList>

                {/* Search & View Controls */}
                <div className="flex w-full lg:w-auto gap-2">
                  <div className="relative flex-1 lg:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, content..."
                      className="pl-9 bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 rounded-xl h-10 text-sm"
                    />
                  </div>
                  
                  <div className="hidden sm:flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}>
                      <Grid size={16} />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}>
                      <List size={16} />
                    </button>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white px-3 h-10 rounded-xl gap-2">
                         <span className="hidden sm:inline">Sort</span> <ChevronDown size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                      <DropdownMenuItem onClick={() => setSortBy("lastEdit")}>Newest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("dateCreated")}>Oldest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>A-Z</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Secondary Filter (Type Pills) */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {CONTENT_TYPES.map(type => {
                    const Icon = type.icon;
                    const isActive = contentType === type.id;
                    return (
                       <button
                          key={type.id}
                          onClick={() => setContentType(type.id)}
                          className={cn(
                             "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                             isActive 
                               ? `${type.bg} ${type.color.replace('text-', 'text-')} border-transparent`
                               : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          )}
                       >
                          <Icon size={14} />
                          {type.label}
                       </button>
                    )
                 })}
              </div>

            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[50vh]">
            {loading && filteredItems.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4" />
                  <p>Fetching your content...</p>
               </div>
            ) : filteredItems.length > 0 ? (
               <>
                 <TabsContent value="explore" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                      {filteredItems.map((note) => (
                        <NoteCard 
                          key={note._id} 
                          note={note} 
                          viewMode={viewMode} 
                          searchQuery={searchQuery}
                          onClick={handleCardClick}
                          onProfileClick={handleProfileClick}
                          highlightText={highlightText}
                          formatDate={formatDate}
                          cleanHtmlContent={cleanHtmlContent}
                          showCreator={true}
                          isPersonal={false}
                        />
                      ))}
                    </div>
                 </TabsContent>

                 <TabsContent value="my-bag" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                      {filteredItems.map((note) => (
                        <NoteCard 
                          key={note._id} 
                          note={note} 
                          viewMode={viewMode} 
                          searchQuery={searchQuery}
                          onClick={handleCardClick}
                          onProfileClick={handleProfileClick}
                          highlightText={highlightText}
                          formatDate={formatDate}
                          cleanHtmlContent={cleanHtmlContent}
                          showCreator={false}
                          isPersonal={true}
                        />
                      ))}
                    </div>
                 </TabsContent>

                 {hasMore && (
                   <div className="flex justify-center mt-12 mb-8">
                     <Button 
                       variant="ghost" 
                       onClick={handleLoadMore} 
                       disabled={loading}
                       className="text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
                     >
                       {loading ? "Loading..." : "Load More"}
                     </Button>
                   </div>
                 )}
               </>
            ) : (
               <div className="py-20 flex justify-center">
                 <Empty className="max-w-md">
                    <EmptyHeader>
                      <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-4 shadow-xl">
                        {activeTab === 'explore' ? <Globe className="text-zinc-500" size={32} /> : <Sparkles className="text-zinc-500" size={32} />}
                      </div>
                      <EmptyTitle className="text-white text-xl font-bold">
                        {activeTab === 'explore' ? 'No community content found' : 'Your library is empty'}
                      </EmptyTitle>
                      <EmptyDescription className="text-zinc-500 max-w-xs mx-auto mt-2">
                        {activeTab === 'explore' 
                          ? `Try adjusting your filters or check back later.` 
                          : 'Paste a YouTube URL to generate your first Notes, Flashcards, or Quiz.'
                        }
                      </EmptyDescription>
                    </EmptyHeader>
                    {activeTab === 'my-bag' && (
                      <EmptyContent className="mt-8 flex justify-center">
                         <Button onClick={() => router.push('/')} className="bg-white text-black hover:bg-zinc-200 rounded-full px-8">
                           Create Now
                         </Button>
                      </EmptyContent>
                    )}
                 </Empty>
               </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}