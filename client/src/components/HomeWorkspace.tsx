"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Input } from "./ui/input";
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
  Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import { IconFolderCode } from "@tabler/icons-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// --- Types ---
interface Creator {
  _id: string;
  name: string;
  avatarUrl?: string;
}

interface Note {
  _id: string;
  slug: string;
  title: string;
  content: string;
  videoUrl?: string;
  updatedAt: string;
  createdAt: string;
  creator?: Creator;
  views?: number;
  thumbnail?: string;
  videoId?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    notes: Note[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalNotes: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// --- Helper: Extract YouTube Thumbnail ---
const getYouTubeThumbnail = (url: string | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` 
    : null;
};

// --- Helper: Get Creator Initial ---
const getCreatorInitial = (creator: Creator | undefined): string => {
  if (!creator || !creator.name) return '?';
  return creator.name.charAt(0).toUpperCase();
};

// --- Helper: Get Creator Display Name ---
const getCreatorName = (creator: Creator | undefined): string => {
  if (!creator || !creator.name) return 'Anonymous';
  return creator.name;
};

// --- Helper: Format creator name for URL ---
const formatCreatorNameForUrl = (name: string): string => {
  if (!name) return 'anonymous';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// --- Sub-Component: Note Card ---
const NoteCard = React.memo(({ 
  note, 
  viewMode, 
  searchQuery, 
  onClick, 
  highlightText, 
  formatDate, 
  cleanHtmlContent,
  showCreator = false
}: {
  note: Note;
  viewMode: string;
  searchQuery: string;
  onClick: (slug: string, creatorName?: string) => void;
  highlightText: (text: string, highlight: string) => string | JSX.Element;
  formatDate: (dateString: string, short?: boolean) => string;
  cleanHtmlContent: (content: string) => string;
  showCreator?: boolean;
}) => {
  const thumbnailUrl = note.thumbnail || getYouTubeThumbnail(note.videoUrl);

  const handleClick = () => {
    if (showCreator && note.creator) {
      onClick(note.slug, note.creator.name);
    } else {
      onClick(note.slug);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-[#fb2d37]/50 transition-all duration-300 rounded-xl overflow-hidden flex flex-col
        ${viewMode === "grid" 
          ? "h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-[#fb2d37]/10" 
          : "sm:flex-row h-auto hover:bg-zinc-800/50"
        }`}
    >
      {/* Thumbnail Section */}
      <div className={`relative overflow-hidden bg-zinc-800 flex-shrink-0 
        ${viewMode === "grid" 
          ? "w-full aspect-video" 
          : "w-full sm:w-48 h-32 sm:h-auto"
        }`}>
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
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="bg-[#fb2d37] rounded-full p-2 shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
             <PlayCircle className="text-white fill-white" size={20} />
           </div>
        </div>

        {/* Timestamp Badge (Bottom Right) */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1 backdrop-blur-sm">
          <Clock size={10} />
          {formatDate(note.updatedAt, true)} 
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex flex-col flex-1 ${viewMode === "grid" ? "p-3 sm:p-4" : "p-4"}`}>
        
        {/* Title */}
        <h3 className={`font-bold text-zinc-100 mb-1.5 leading-snug group-hover:text-[#fb2d37] transition-colors
          ${viewMode === 'grid' ? 'text-sm sm:text-base line-clamp-2' : 'text-lg line-clamp-1'}`}>
          {searchQuery ? highlightText(note.title, searchQuery) : note.title}
        </h3>

        {/* Description */}
        <p className={`text-zinc-400 text-xs sm:text-sm line-clamp-2 mb-3 flex-1 
          ${viewMode === 'grid' ? 'hidden sm:block' : 'block'}`}>
          {searchQuery ? highlightText(cleanHtmlContent(note.content), searchQuery) : cleanHtmlContent(note.content)}
        </p>

        {/* Footer Area */}
        <div className="mt-auto pt-3 border-t border-zinc-800/50 flex items-center justify-between text-xs">
           
           {/* Left side: Creator Info or Generic Label */}
           {showCreator ? (
             <div className="flex items-center gap-2 max-w-[70%]">
               <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                  {note.creator?.avatarUrl ? (
                    <img 
                      src={note.creator.avatarUrl} 
                      alt={getCreatorName(note.creator)} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-zinc-400 bg-zinc-800">
                      {getCreatorInitial(note.creator)}
                    </div>
                  )}
               </div>
               <span className="text-zinc-400 truncate hover:text-white transition-colors">
                 {getCreatorName(note.creator)}
               </span>
             </div>
           ) : (
             <span className="text-zinc-500 font-medium flex items-center gap-1">
               <IconFolderCode size={12} className="text-[#fb2d37]" />
               Personal
             </span>
           )}

           {/* Right side: Hostname or Views */}
           {note.videoUrl && (
             <span className="text-zinc-600 text-[10px] truncate max-w-[60px] sm:max-w-[100px]">
               {(() => {
                 try {
                   return new URL(note.videoUrl).hostname.replace('www.', '').replace('youtube.com', 'YouTube');
                 } catch {
                   return 'YouTube';
                 }
               })()}
             </span>
           )}
        </div>
      </div>
    </div>
  );
});
NoteCard.displayName = "NoteCard";

export default function NotesWorkspace() {
  const [activeTab, setActiveTab] = useState("explore");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastEdit");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Data State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [exploreNotes, setExploreNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
    if (!authToken) setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        setCurrentPage(1);
        fetchNotes(1, false, searchQuery, activeTab === 'explore' ? 'explore' : 'personal');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, sortBy, isAuthenticated]);

  // Initial Load
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(1);
      fetchNotes(1, false, searchQuery, activeTab === 'explore' ? 'explore' : 'personal');
    }
  }, [isAuthenticated]);

  // --- Main Fetch Logic ---
  const fetchNotes = useCallback(async (page = 1, append = false, search = '', type = 'personal') => {
    if (!isAuthenticated) return;

    try {
      if (!append) setLoading(true);
      
      const authToken = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: sortBy === 'lastEdit' ? 'updatedAt' : sortBy,
        sortOrder: 'desc'
      });

      if (search) params.append('search', search);

      const endpoint = type === 'explore' 
        ? `/notes/explore?${params.toString()}`
        : `/notes/get-all-notes?${params.toString()}`;

      const response = await api.get<ApiResponse>(endpoint, {
        headers: { 'Auth': authToken }
      }); 
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch notes');
      }
      
      const notesData = response.data.data.notes || [];
      const paginationData = response.data.data.pagination;
      
      if (type === 'explore') {
        setExploreNotes(prev => append ? [...prev, ...notesData] : notesData);
      } else {
        setNotes(prev => append ? [...prev, ...notesData] : notesData);
      }
      
      setCurrentPage(paginationData?.currentPage || 1);
      setHasMore(paginationData?.hasNext || false);
      
    } catch (err) {
      console.error("Fetch error:", err);
      // Reset states on error
      if (!append) {
        if (type === 'explore') {
          setExploreNotes([]);
        } else {
          setNotes([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sortBy]);

  // Handlers
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchNotes(currentPage + 1, true, searchQuery, activeTab === 'explore' ? 'explore' : 'personal');
    }
  };

  const handleNoteClick = useCallback((slug: string) => {
    router.push(`/notes/${slug}`);
  }, [router]);

  const handleExploreNoteClick = useCallback((slug: string, creatorName?: string) => {
    if (creatorName) {
      const formattedName = formatCreatorNameForUrl(creatorName);
      router.push(`/note/${formattedName}/${slug}`);
    } else {
      router.push(`/note/unknown/${slug}`);
    }
  }, [router]);

  const highlightText = useCallback((text: string, highlight: string): string | JSX.Element => {
    if (!highlight.trim() || !text) return text;
    try {
      const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      return (
        <>
          {parts.map((p, i) => 
            p.toLowerCase() === highlight.toLowerCase() ? 
              <mark key={i} className="bg-[#fb2d37]/30 text-white rounded px-0.5">{p}</mark> : 
              p
          )}
        </>
      );
    } catch {
      return text;
    }
  }, []);

  const formatDate = (dateString: string, short = false): string => {
    try {
      const date = new Date(dateString);
      if (short) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { 
      return ""; 
    }
  };

  const cleanHtmlContent = (content: string): string => {
    if (!content) return '';
    // Remove HTML tags and limit length
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > 100 ? text.slice(0, 100) + '...' : text;
  };

  const currentNotes = activeTab === 'explore' ? exploreNotes : notes;

  if (isAuthenticated === false && loading === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to access your notes</p>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-[#fb2d37] hover:bg-[#d42630] text-white"
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Header */}
        <div className="flex flex-col gap-6 mb-6">
           <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Library</h1>
              <Button 
                onClick={() => router.push('/')}
                className="bg-[#fb2d37] hover:bg-[#d42630] text-white rounded-full px-5 py-2 text-sm font-semibold shadow-lg shadow-[#fb2d37]/20 transition-all duration-300"
              >
                + New PDF
              </Button>
           </div>
        </div>

        <Tabs defaultValue="my-bag" value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Controls Bar */}
          <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-zinc-800 pb-4 mb-6 pt-2">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              
              {/* Tab Switcher */}
              <TabsList className="bg-zinc-900/50 p-1 rounded-full border border-zinc-800 w-full sm:w-auto grid grid-cols-2 sm:flex">
                <TabsTrigger 
                  value="explore"
                  className="rounded-full px-6 data-[state=active]:bg-[#fb2d37] data-[state=active]:text-white text-zinc-400 gap-2 transition-all duration-300"
                >
                  <Globe size={16} /> Explore
                </TabsTrigger>
                <TabsTrigger 
                  value="my-bag"
                  className="rounded-full px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 gap-2 transition-all duration-300"
                >
                  <IconFolderCode size={16} /> My Bag
                </TabsTrigger>
              </TabsList>

              {/* Search & Sort */}
              <div className="flex w-full lg:w-auto gap-2">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-9 bg-zinc-900/50 border-zinc-800 focus:border-[#fb2d37] focus:ring-0 rounded-xl h-10 text-sm transition-colors duration-300"
                  />
                </div>
                
                {/* View Toggles */}
                <div className="hidden sm:flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                  <button 
                    onClick={() => setViewMode("grid")} 
                    className={`p-1.5 rounded-lg transition-all duration-300 ${
                      viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")} 
                    className={`p-1.5 rounded-lg transition-all duration-300 ${
                      viewMode === "list" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white px-3 h-10 rounded-xl gap-2 transition-all duration-300"
                    >
                       <span className="hidden sm:inline">Sort</span> <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                    <DropdownMenuItem 
                      onClick={() => setSortBy("lastEdit")}
                      className="cursor-pointer hover:bg-zinc-800 transition-colors duration-300"
                    >
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy("dateCreated")}
                      className="cursor-pointer hover:bg-zinc-800 transition-colors duration-300"
                    >
                      Oldest
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy("alphabetical")}
                      className="cursor-pointer hover:bg-zinc-800 transition-colors duration-300"
                    >
                      A-Z
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[50vh]">
            {loading && currentNotes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fb2d37] mb-4" />
                  <p>Loading {activeTab === 'explore' ? 'community' : 'your'} notes...</p>
               </div>
            ) : currentNotes.length > 0 ? (
               <>
                 <TabsContent value="explore" className="mt-0 focus-visible:outline-none">
                    <div className={viewMode === "grid" 
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
                      : "flex flex-col gap-3"
                    }>
                      {exploreNotes.map((note) => (
                        <NoteCard 
                          key={note._id} 
                          note={note} 
                          viewMode={viewMode} 
                          searchQuery={searchQuery}
                          onClick={handleExploreNoteClick}
                          highlightText={highlightText}
                          formatDate={formatDate}
                          cleanHtmlContent={cleanHtmlContent}
                          showCreator={true} 
                        />
                      ))}
                    </div>
                 </TabsContent>

                 <TabsContent value="my-bag" className="mt-0 focus-visible:outline-none">
                    <div className={viewMode === "grid" 
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
                      : "flex flex-col gap-3"
                    }>
                      {notes.map((note) => (
                        <NoteCard 
                          key={note._id} 
                          note={note} 
                          viewMode={viewMode} 
                          searchQuery={searchQuery}
                          onClick={handleNoteClick}
                          highlightText={highlightText}
                          formatDate={formatDate}
                          cleanHtmlContent={cleanHtmlContent}
                          showCreator={false}
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
                       className="text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all duration-300 disabled:opacity-50"
                     >
                       {loading ? "Loading..." : "Load More"}
                     </Button>
                   </div>
                 )}
               </>
            ) : (
               <div className="py-12 flex justify-center">
                 <Empty className="max-w-md">
                    <EmptyHeader>
                      <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 mb-4">
                        {activeTab === 'explore' ? 
                          <Globe className="text-zinc-500" size={24} /> : 
                          <IconFolderCode className="text-zinc-500" size={24} />
                        }
                      </div>
                      <EmptyTitle className="text-white">
                        {activeTab === 'explore' ? 'No community notes found' : 'Your bag is empty'}
                      </EmptyTitle>
                      <EmptyDescription className="text-zinc-500">
                        {activeTab === 'explore' ? 
                          'Try adjusting your search filters or check back later for new content.' : 
                          'Start by pasting a video URL to generate your first PDF note.'
                        }
                      </EmptyDescription>
                    </EmptyHeader>
                    {activeTab === 'my-bag' && (
                      <EmptyContent className="mt-6 flex justify-center">
                         <Button 
                           onClick={() => router.push('/')} 
                           className="bg-[#fb2d37] hover:bg-[#d42630] text-white transition-all duration-300"
                         >
                           Create First Note
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