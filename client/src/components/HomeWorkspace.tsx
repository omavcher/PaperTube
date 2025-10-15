"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  Grid,
  List,
  Calendar,
  FileText,
  StickyNote,
  Edit,
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import api from "@/config/api";

// Interface for Note data
interface Note {
  _id: string;
  slug: string;
  title: string;
  content: string;
  transcript?: string;
  videoUrl?: string;
  updatedAt: string;
  createdAt: string;
}

// Interface for API error response
interface ApiError {
  response?: {
    status: number;
    data?: unknown;
  };
  message?: string;
}

export default function NotesWorkspace() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastEdit");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalNotes, setTotalNotes] = useState(0);
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authToken = localStorage.getItem('authToken');
        setIsAuthenticated(!!authToken);
        
        if (!authToken) {
          setLoading(false);
          return false;
        }
        return true;
      } catch (err) {
        console.error("Error checking authentication:", err);
        setIsAuthenticated(false);
        setLoading(false);
        return false;
      }
    };

    checkAuth();
  }, []);

  const fetchNotes = useCallback(async (page = 1, append = false, search = '') => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
     
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: sortBy === 'lastEdit' ? 'updatedAt' : sortBy,
        sortOrder: 'desc'
      });

      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/notes/get-all-notes?${params.toString()}`, {
        headers: {
          'Auth': authToken
        }
      }); 
      
      // Handle the nested response structure
      const notesData = response.data.data.notes;
      const paginationData = response.data.data.pagination;
      
      if (append) {
        setNotes(prev => [...prev, ...notesData]);
      } else {
        setNotes(notesData);
      }
      
      setCurrentPage(paginationData.currentPage);
      setHasMore(paginationData.hasNext);
      setTotalNotes(paginationData.totalNotes);
      
    } catch (err: unknown) {
      console.error("Failed to fetch notes:", err);
      
      // Type guard to check if it's an API error
      const isApiError = (error: unknown): error is ApiError => {
        return typeof error === 'object' && error !== null && 'response' in error;
      };

      // If unauthorized, clear auth state
      if (isApiError(err) && err.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load notes. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sortBy]);

  useEffect(() => {
    fetchNotes(1, false, searchQuery);
  }, [isAuthenticated, sortBy, fetchNotes, searchQuery]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated) {
        fetchNotes(1, false, searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isAuthenticated, fetchNotes]);

  const handleLoadMore = () => {
    if (hasMore) {
      fetchNotes(currentPage + 1, true, searchQuery);
    }
  };

  // Optimized search and sort - now client-side only for better UX
  const filteredAndSortedNotes = useMemo(() => {
    if (!isAuthenticated) return [];
    
    let filtered = notes;
    
    // Client-side filtering for better responsiveness
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        (note.content && note.content.toLowerCase().includes(query)) ||
        (note.transcript && note.transcript.toLowerCase().includes(query))
      );
    }
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "lastEdit":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "dateCreated":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [notes, searchQuery, sortBy, isAuthenticated]);

  // Memoized event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSortChange = useCallback((sortType: string) => {
    setSortBy(sortType);
    // Reset to first page when changing sort
    setCurrentPage(1);
  }, []);

  const handleNoteClick = useCallback((slug: string) => {
    if (!isAuthenticated) return;
    router.push(`/notes/${slug}`);
  }, [router, isAuthenticated]);

  const handleEditNote = useCallback((e: React.MouseEvent, noteId: string) => {
    if (!isAuthenticated) return;
    e.stopPropagation();
    // Navigate to edit page or open edit modal
    router.push(`/notes/edit/${noteId}`);
  }, [router, isAuthenticated]);

  const highlightText = useCallback((text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
            <mark key={i} className="bg-[#fb2d37]/20 text-white px-1 rounded">{part}</mark> : 
            part
        )}
      </>
    );
  }, []);

  const handleLoginRedirect = useCallback(() => {
    router.push('/login');
  }, [router]);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  const cleanHtmlContent = useCallback((content: string) => {
    if (!content) return 'No content';
    // Remove HTML tags and limit length
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
  }, []);

  // Show loading state
  if (loading && notes.length === 0) {
    return (
      <div className="min-h-screen w-full max-w-7xl mx-auto flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fb2d37] mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your notes...</p>
        </div>
      </div>
    );
  }

  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full max-w-7xl mx-auto flex flex-col items-center justify-center bg-black text-white p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-zinc-400 mb-6">
            Please log in to access your notes.
          </p>
          <Button 
            onClick={handleLoginRedirect}
            className="bg-[#fb2d37] hover:bg-[#e1252f] text-white px-6 py-3 rounded-xl transition-colors duration-200 font-semibold"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto flex flex-col p-4 sm:p-6 lg:p-8 bg-black text-white">
      {/* Header */}
      <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 lg:mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#fb2d37]/10 rounded-xl border border-[#fb2d37]/20">
            <StickyNote className="text-[#fb2d37]" size={24} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              My Notes
            </h1>
            {totalNotes > 0 && (
              <span className="text-sm text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                {totalNotes} {totalNotes === 1 ? 'note' : 'notes'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Search + Filters - Only show when user has notes */}
      {totalNotes > 0 && (
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 lg:mb-12">
          <div className="relative w-full lg:w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500"
              size={20}
            />
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search in notes..."
              className="pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#fb2d37] focus:border-[#fb2d37] transition-all duration-200"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* View Toggle */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-[#fb2d37] text-white shadow-lg"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-[#fb2d37] text-white shadow-lg"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-colors duration-200 text-zinc-300">
                Sort
                <ChevronDown size={16} className="text-zinc-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="bg-zinc-900 border border-zinc-800 text-white mt-2 rounded-xl shadow-xl min-w-[200px]"
              >
                <DropdownMenuLabel className="text-zinc-400 px-4 py-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Sort by
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem 
                  onClick={() => handleSortChange("lastEdit")}
                  className="cursor-pointer px-4 py-3 focus:bg-zinc-800 focus:text-white transition-colors duration-200"
                >
                  Last Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange("dateCreated")}
                  className="cursor-pointer px-4 py-3 focus:bg-zinc-800 focus:text-white transition-colors duration-200"
                >
                  Date Created
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange("alphabetical")}
                  className="cursor-pointer px-4 py-3 focus:bg-zinc-800 focus:text-white transition-colors duration-200"
                >
                  Alphabetical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Empty State - No Notes */}
      {totalNotes === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
            <StickyNote size={48} className="text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            No Notes Yet
          </h3>
          <p className="text-zinc-400 max-w-md mb-8 text-lg">
            You haven&apos;t created any notes yet. Start by creating your first note to organize your thoughts and ideas!
          </p>
        </div>
      )}

      {/* Notes Grid/List - Only show when user has notes */}
      {totalNotes > 0 && (
        <>
          <div
            className={`w-full ${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "flex flex-col gap-4"
            }`}
          >
            {filteredAndSortedNotes.map((note) => (
              <div
                key={note._id}
                onClick={() => handleNoteClick(note.slug)}
                className={`group cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-[#fb2d37] transition-all duration-200 hover:shadow-lg hover:scale-105 flex flex-col h-full"
                    : "flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-[#fb2d37] transition-all duration-200 hover:shadow-lg"
                }`}
              >
                {/* Note Header */}
                <div className={`${viewMode === "grid" ? "p-4 pb-2" : "flex-1 p-2 sm:p-0"} flex flex-col h-full`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#fb2d37]/10 rounded-lg">
                        <StickyNote size={16} className="text-[#fb2d37]" />
                      </div>
                      <span className="text-xs text-zinc-500 bg-black px-2 py-1 rounded border border-zinc-800">
                        Note
                      </span>
                    </div>
                    
                    {/* Edit Button */}
                    <button
                      onClick={(e) => handleEditNote(e, note._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <Edit size={14} className="text-zinc-400" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base text-white line-clamp-2 group-hover:text-[#fb2d37] transition-colors duration-200 mb-3">
                    {searchQuery ? highlightText(note.title, searchQuery) : note.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                    <Calendar size={12} />
                    <span>Updated: {formatDate(note.updatedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                    <FileText size={12} />
                    <span className="line-clamp-2 flex-1">
                      {searchQuery ? highlightText(cleanHtmlContent(note.content), searchQuery) : cleanHtmlContent(note.content)}
                    </span>
                  </div>

                  {/* Tags or Categories could go here */}
                  {note.videoUrl && (
                    <div className="mt-auto pt-3 border-t border-zinc-800">
                      <span className="text-xs text-zinc-500">
                        From: {new URL(note.videoUrl).hostname}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Loading more indicator */}
          {loading && notes.length > 0 && (
            <div className="w-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fb2d37]"></div>
            </div>
          )}

          {/* Search Empty State */}
          {filteredAndSortedNotes.length === 0 && totalNotes > 0 && !loading && (
            <div className="w-full flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No notes found
              </h3>
              <p className="text-zinc-400 max-w-md">
                {`No results found for "${searchQuery}". Try adjusting your search terms.`}
              </p>
            </div>
          )}

          {/* Show More Button */}
          {hasMore && filteredAndSortedNotes.length > 0 && !loading && (
            <div className="w-full flex justify-center mt-8 lg:mt-12">
              <Button 
                onClick={handleLoadMore}
                className="bg-[#fb2d37] hover:bg-[#e1252f] text-white px-8 py-3 rounded-xl transition-colors duration-200 font-semibold"
              >
                Load More Notes
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}