"use client";

import React, { useState, useCallback, useEffect, useMemo, JSX } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Grid,
  List,
  FileText,
  Plus,
  Loader2,
  ArrowUpDown,
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
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import { toast } from "sonner";
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
  type?: string; // 'note' | 'flashcard' | 'test'
  folderId?: string | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalNotes: number;
  hasNext: boolean;
  hasPrev: boolean;
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
  return match && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`
    : null;
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

// --- Sub-Component: Apple iOS Style Grid Card ---
const GridCard = React.memo(
  ({
    note,
    searchQuery,
    onClick,
    highlightText,
    folders,
    onMoveItem,
    onDeleteItem,
  }: {
    note: Note;
    searchQuery: string;
    onClick: (note: Note) => void;
    highlightText: (text: string, highlight: string) => string | JSX.Element;
    folders: { _id: string; name: string }[];
    onMoveItem: (
      itemId: string,
      itemType: "note" | "flashcard" | "test",
      folderId: string | null
    ) => void;
    onDeleteItem: (
      itemId: string,
      itemType: "note" | "flashcard" | "test"
    ) => void;
  }) => {
    const cardConfig = useMemo(() => {
      switch (note.type) {
        case "flashcard":
          return {
            color: "#fbbf24",
            badgeText: "Flashcards",
            badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            Icon: Layers,
          };
        case "test":
          return {
            color: "#10b981",
            badgeText: "Practice Test",
            badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            Icon: ClipboardList,
          };
        case "note":
        default:
          return {
            color: "#ef4444",
            badgeText: "Notes",
            badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
            Icon: BookOpen,
          };
      }
    }, [note.type]);

    const thumbnailUrl = note.thumbnail || getYouTubeThumbnail(note.videoUrl);

    return (
      <motion.div
        onClick={() => onClick(note)}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="group cursor-pointer flex flex-col h-full bg-[#0c0c10] hover:bg-[#111116] border border-white/[0.07] hover:border-white/[0.16] rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-xl relative"
      >
        {/* Thumbnail Box */}
        <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={note.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
              <cardConfig.Icon size={24} className="text-neutral-600 group-hover:text-white transition-colors" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Top Left Tag */}
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider border backdrop-blur-md",
                cardConfig.badgeClass
              )}
            >
              <cardConfig.Icon size={10} />
              <span>{cardConfig.badgeText}</span>
            </span>
          </div>

          {/* Top Right Date */}
          <div className="absolute top-2 right-2">
            <span className="text-[8px] sm:text-[9px] font-mono text-neutral-300 font-bold bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
              {formatTimeAgo(note.updatedAt || note.createdAt)}
            </span>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
          <h3 className="text-xs sm:text-[13.5px] font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
            {searchQuery ? highlightText(note.title, searchQuery) : note.title}
          </h3>

          {/* Footer Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] mt-auto">
            <div className="flex items-center gap-1 text-[9.5px] sm:text-[10.5px] text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-[120px]">
                {note.folderId
                  ? folders.find((f) => f._id === note.folderId)?.name || "Folder"
                  : "Uncategorized"}
              </span>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <MoreVertical size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#0c0c0e] border border-white/10 text-white rounded-xl p-1.5 w-48 shadow-2xl z-50 backdrop-blur-xl"
              >
                <div className="text-[9px] font-bold text-neutral-500 px-2.5 py-1 uppercase tracking-widest">
                  Move to Folder
                </div>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveItem(
                      note._id,
                      note.type === "flashcard"
                        ? "flashcard"
                        : note.type === "test"
                        ? "test"
                        : "note",
                      null
                    );
                  }}
                  className={cn(
                    "text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5 focus:bg-white/5",
                    !note.folderId ? "text-red-400" : "text-neutral-400"
                  )}
                >
                  Uncategorized
                </DropdownMenuItem>
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveItem(
                        note._id,
                        note.type === "flashcard"
                          ? "flashcard"
                          : note.type === "test"
                          ? "test"
                          : "note",
                        folder._id
                      );
                    }}
                    className={cn(
                      "text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5 focus:bg-white/5",
                      note.folderId === folder._id
                        ? "text-red-400"
                        : "text-neutral-400"
                    )}
                  >
                    {folder.name}
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-white/[0.08] my-1" />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(
                      note._id,
                      note.type === "flashcard"
                        ? "flashcard"
                        : note.type === "test"
                        ? "test"
                        : "note"
                    );
                  }}
                  className="text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5 text-red-400 hover:text-red-300 focus:bg-red-500/10"
                >
                  <Trash2 size={12} className="mr-2 inline" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    );
  }
);
GridCard.displayName = "GridCard";

// --- Sub-Component: Apple iOS Style List Card ---
const ListCard = React.memo(
  ({
    note,
    searchQuery,
    onClick,
    highlightText,
    folders,
    onMoveItem,
    onDeleteItem,
  }: {
    note: Note;
    searchQuery: string;
    onClick: (note: Note) => void;
    highlightText: (text: string, highlight: string) => string | JSX.Element;
    folders: { _id: string; name: string }[];
    onMoveItem: (
      itemId: string,
      itemType: "note" | "flashcard" | "test",
      folderId: string | null
    ) => void;
    onDeleteItem: (
      itemId: string,
      itemType: "note" | "flashcard" | "test"
    ) => void;
  }) => {
    const cardConfig = useMemo(() => {
      switch (note.type) {
        case "flashcard":
          return {
            color: "#fbbf24",
            badgeText: "Flashcards",
            badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            Icon: Layers,
          };
        case "test":
          return {
            color: "#10b981",
            badgeText: "Practice Test",
            badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            Icon: ClipboardList,
          };
        case "note":
        default:
          return {
            color: "#ef4444",
            badgeText: "Notes",
            badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
            Icon: BookOpen,
          };
      }
    }, [note.type]);

    const thumbnailUrl = note.thumbnail || getYouTubeThumbnail(note.videoUrl);

    return (
      <motion.div
        onClick={() => onClick(note)}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="group cursor-pointer flex items-center bg-[#0c0c10] hover:bg-[#111116] border border-white/[0.07] hover:border-white/[0.16] rounded-xl sm:rounded-2xl p-2 sm:p-3 gap-3 transition-all duration-200"
      >
        {/* Left Thumbnail */}
        <div className="relative w-20 sm:w-28 aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-neutral-950 shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={note.title}
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900">
              <cardConfig.Icon size={16} className="text-neutral-500" />
            </div>
          )}
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border",
                cardConfig.badgeClass
              )}
            >
              {cardConfig.badgeText}
            </span>
            <span className="text-[9px] sm:text-[10px] text-neutral-500 font-mono">
              {formatTimeAgo(note.updatedAt || note.createdAt)}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">
            {searchQuery ? highlightText(note.title, searchQuery) : note.title}
          </h3>

          <p className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
            <Folder size={10} className="text-neutral-500" />
            <span>
              {note.folderId
                ? folders.find((f) => f._id === note.folderId)?.name || "Folder"
                : "Uncategorized"}
            </span>
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#0c0c0e] border border-white/10 text-white rounded-xl p-1.5 w-48 shadow-2xl z-50 backdrop-blur-xl"
            >
              <div className="text-[9px] font-bold text-neutral-500 px-2.5 py-1 uppercase tracking-widest">
                Move to Folder
              </div>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveItem(
                    note._id,
                    note.type === "flashcard"
                      ? "flashcard"
                      : note.type === "test"
                      ? "test"
                      : "note",
                    null
                  );
                }}
                className={cn(
                  "text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5 focus:bg-white/5",
                  !note.folderId ? "text-red-400" : "text-neutral-400"
                )}
              >
                Uncategorized
              </DropdownMenuItem>
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveItem(
                      note._id,
                      note.type === "flashcard"
                        ? "flashcard"
                        : note.type === "test"
                        ? "test"
                        : "note",
                      folder._id
                    );
                  }}
                  className={cn(
                    "text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5 focus:bg-white/5",
                    note.folderId === folder._id
                      ? "text-red-400"
                      : "text-neutral-400"
                  )}
                >
                  {folder.name}
                </DropdownMenuItem>
              ))}
              <div className="h-px bg-white/[0.08] my-1" />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(
                    note._id,
                    note.type === "flashcard"
                      ? "flashcard"
                      : note.type === "test"
                      ? "test"
                      : "note"
                  );
                }}
                className="text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5 text-red-400 hover:text-red-300 focus:bg-red-500/10"
              >
                <Trash2 size={12} className="mr-2 inline" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center text-neutral-600 group-hover:text-white transition-colors">
            <ChevronRight size={15} />
          </div>
        </div>
      </motion.div>
    );
  }
);
ListCard.displayName = "ListCard";

// --- Main HomeWorkspace Component ---
export default function HomeWorkspace() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "note" | "flashcard" | "test">("all");
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
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRenameFolder, setShowRenameFolder] = useState<{ _id: string; name: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");

  const router = useRouter();

  // 1. Auth Check
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    setIsAuthenticated(!!authToken);
    if (!authToken) setLoading(false);
  }, []);

  // Fetch Folders List
  const fetchFolders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await api.get("/notes/folders", {
        headers: { Auth: authToken },
      });
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
  const fetchPersonalNotes = useCallback(
    async (page = 1, append = false, search = "") => {
      if (!isAuthenticated) return;
      try {
        if (!append) setLoading(true);
        const authToken = localStorage.getItem("authToken");
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          sortBy,
          sortOrder: "desc",
          search: search || "",
        });
        if (selectedFolderId && selectedFolderId !== "all") {
          params.append("folderId", selectedFolderId);
        }
        const response = await api.get<PersonalNotesResponse>(
          `/notes/get-all-notes?${params.toString()}`,
          { headers: { Auth: authToken } }
        );

        if (response.data.success) {
          const { notes: fetchedNotes, pagination } = response.data.data;
          setNotes((prev) => (append ? [...prev, ...fetchedNotes] : fetchedNotes));
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
    },
    [isAuthenticated, sortBy, selectedFolderId]
  );

  // Folder management handlers
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await api.post(
        "/notes/folders",
        { name: newFolderName },
        { headers: { Auth: authToken } }
      );
      if (response.data.success) {
        toast.success("Folder created");
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
      const authToken = localStorage.getItem("authToken");
      const response = await api.put(
        `/notes/folders/${showRenameFolder._id}`,
        { name: renameFolderName },
        { headers: { Auth: authToken } }
      );
      if (response.data.success) {
        toast.success("Folder renamed");
        setShowRenameFolder(null);
        setRenameFolderName("");
        fetchFolders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this folder? Notes inside will be moved to uncategorized."
      )
    )
      return;
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await api.delete(`/notes/folders/${folderId}`, {
        headers: { Auth: authToken },
      });
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

  const handleMoveItem = async (
    itemId: string,
    itemType: "note" | "flashcard" | "test",
    folderId: string | null
  ) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await api.put(
        "/notes/notes/move",
        {
          itemId,
          itemType,
          folderId: folderId || "root",
        },
        { headers: { Auth: authToken } }
      );
      if (response.data.success) {
        toast.success("Moved successfully");
        fetchFolders();
        fetchPersonalNotes(1, false, searchQuery);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to move item");
    }
  };

  const handleDeleteItem = async (
    itemId: string,
    type: "note" | "flashcard" | "test"
  ) => {
    const typeLabel =
      type === "flashcard"
        ? "flashcard set"
        : type === "test"
        ? "practice test"
        : "note";
    if (!confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;
    try {
      const authToken = localStorage.getItem("authToken");
      const endpoint =
        type === "flashcard"
          ? `/flashcards/${itemId}`
          : type === "test"
          ? `/test/${itemId}`
          : `/notes/${itemId}`;
      const response = await api.delete(endpoint, {
        headers: { Auth: authToken },
      });
      if (response.data.success) {
        toast.success("Deleted successfully");
        fetchFolders();
        fetchPersonalNotes(1, false, searchQuery);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete item");
    }
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
      if (isAuthenticated && !initialCheckDone) {
        await fetchPersonalNotes(1, false, "");
        setInitialCheckDone(true);
      }
    };
    init();
  }, [isAuthenticated, initialCheckDone, fetchPersonalNotes]);

  // Standard Fetch
  useEffect(() => {
    if (!initialCheckDone) return;
    setCurrentPage(1);
    fetchPersonalNotes(1, false, searchQuery);
  }, [searchQuery, sortBy, initialCheckDone, fetchPersonalNotes]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      fetchPersonalNotes(nextPage, true, searchQuery);
    }
  };

  const handleCardClick = useCallback(
    (note: Note) => {
      if (note.type === "flashcard") {
        router.push(`/flashcards/${note.slug}`);
      } else if (note.type === "test") {
        router.push(`/yt-practice-test/${note.slug}`);
      } else {
        router.push(`/notes/${note.slug}`);
      }
    },
    [router]
  );

  const highlightText = useCallback((text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const parts = text.split(
      new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    );
    return (
      <>
        {parts.map((p, i) =>
          p.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-red-500/30 text-red-200 rounded px-0.5">
              {p}
            </mark>
          ) : (
            p
          )
        )}
      </>
    );
  }, []);

  // Filter notes by type
  const filteredNotes = useMemo(() => {
    if (typeFilter === "all") return notes;
    return notes.filter((n) => {
      if (typeFilter === "note") return !n.type || n.type === "note";
      return n.type === typeFilter;
    });
  }, [notes, typeFilter]);

  if (isAuthenticated === false && !loading) {
    return null;
  }

  return (
    <section className="w-full bg-black text-white font-sans selection:bg-neutral-800 pb-28 sm:pb-16">
      
      {/* ─── 1. APPLE STYLE HEADER BAR ─── */}
      <div className="w-full bg-black/90 border-b border-white/[0.06] backdrop-blur-2xl sticky top-0 z-30 py-3 sm:py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Title & Count */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                <BookOpen size={15} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none">
                    My Library
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300">
                    {filteredNotes.length}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
                  Your personal workspace & generated study sets
                </p>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden items-center bg-black/50 border border-white/[0.08] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "grid" ? "bg-white/15 text-white" : "text-neutral-500"
                )}
              >
                <Grid size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list" ? "bg-white/15 text-white" : "text-neutral-500"
                )}
              >
                <List size={13} />
              </button>
            </div>
          </div>

          {/* Right: Controls & Search */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* Search Input */}
            <div className="flex-1 sm:w-56 md:w-64 flex items-center h-8 sm:h-9 px-2.5 rounded-xl bg-black/60 border border-white/[0.08] focus-within:border-white/20 transition-all gap-1.5">
              <Search size={13} className="text-neutral-500 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full bg-transparent border-none text-xs text-white placeholder:text-neutral-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Desktop View Mode */}
            <div className="hidden md:flex items-center bg-black/60 border border-white/[0.08] rounded-xl p-0.5 h-9">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-2.5 h-full rounded-lg text-xs font-bold flex items-center gap-1 transition-all",
                  viewMode === "grid" ? "bg-white/15 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <Grid size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-2.5 h-full rounded-lg text-xs font-bold flex items-center gap-1 transition-all",
                  viewMode === "list" ? "bg-white/15 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <List size={13} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 sm:h-9 px-3 rounded-xl bg-black/60 border border-white/[0.08] hover:border-white/20 text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowUpDown size={12} />
                  <span className="hidden sm:inline">
                    {sortBy === "updatedAt" ? "Recent" : "A-Z"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#0c0c0e] border border-white/10 text-white rounded-xl p-1.5 w-44 shadow-2xl z-50"
              >
                <DropdownMenuItem
                  onClick={() => setSortBy("updatedAt")}
                  className={cn(
                    "text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5",
                    sortBy === "updatedAt" ? "text-red-400 font-bold" : "text-neutral-400"
                  )}
                >
                  <Clock size={12} className="mr-2" /> Newest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("title")}
                  className={cn(
                    "text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5",
                    sortBy === "title" ? "text-red-400 font-bold" : "text-neutral-400"
                  )}
                >
                  <ArrowUpDown size={12} className="mr-2" /> Alphabetical (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Folder Button */}
            <button
              type="button"
              onClick={() => setShowCreateFolder(true)}
              className="h-8 sm:h-9 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FolderPlus size={13} />
              <span className="hidden sm:inline">New Folder</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN WORKSPACE CONTAINER ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        
        {/* Type Filter Tabs (All / Notes / Flashcards / Practice Tests) */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-3 mb-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "All Items", icon: BookOpen },
              { id: "note", label: "Notes", icon: FileText },
              { id: "flashcard", label: "Flashcards", icon: Layers },
              { id: "test", label: "Practice Tests", icon: ClipboardList },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  typeFilter === tab.id
                    ? "bg-white text-black shadow-sm"
                    : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.05]"
                )}
              >
                <tab.icon size={12} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* New Note Action */}
          <button
            type="button"
            onClick={() => router.push("/youtube-to-notes")}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={13} />
            <span>Generate New</span>
          </button>
        </div>

        {/* ─── 3. FOLDERS RAIL / SEGMENTS ─── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-4">
          <button
            type="button"
            onClick={() => setSelectedFolderId("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer",
              selectedFolderId === "all"
                ? "bg-red-500/15 border-red-500/30 text-red-400"
                : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white"
            )}
          >
            <FolderOpen size={12} />
            <span>All Folders</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFolderId("root")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer",
              selectedFolderId === "root"
                ? "bg-red-500/15 border-red-500/30 text-red-400"
                : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white"
            )}
          >
            <FileText size={12} />
            <span>Uncategorized</span>
          </button>

          {folders.map((folder) => (
            <div
              key={folder._id}
              className={cn(
                "group/folder flex items-center rounded-xl border transition-all shrink-0",
                selectedFolderId === folder._id
                  ? "bg-red-500/15 border-red-500/30 text-red-400"
                  : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white"
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedFolderId(folder._id)}
                className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Folder size={12} />
                <span>{folder.name}</span>
                {folder.count !== undefined && folder.count > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-white">
                    {folder.count}
                  </span>
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="pr-2 text-neutral-500 hover:text-white transition-colors"
                  >
                    <MoreVertical size={11} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#0c0c0e] border border-white/10 text-white rounded-xl p-1.5 w-36 shadow-2xl z-50"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setShowRenameFolder({ _id: folder._id, name: folder.name });
                      setRenameFolderName(folder.name);
                    }}
                    className="text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5"
                  >
                    <Edit3 size={11} className="mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteFolder(folder._id)}
                    className="text-xs font-medium rounded-lg cursor-pointer px-2.5 py-1.5 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={11} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {/* ─── 4. NOTES LISTING ─── */}
        <AnimatePresence mode="wait">
          {loading && filteredNotes.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[30vh] space-y-3 py-16"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Loading Library...
              </p>
            </motion.div>
          ) : filteredNotes.length > 0 ? (
            <motion.div
              key={`${typeFilter}-${viewMode}-${selectedFolderId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {filteredNotes.map((note) => (
                    <GridCard
                      key={note._id}
                      note={note}
                      searchQuery={searchQuery}
                      onClick={handleCardClick}
                      highlightText={highlightText}
                      folders={folders}
                      onMoveItem={handleMoveItem}
                      onDeleteItem={handleDeleteItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  {filteredNotes.map((note) => (
                    <ListCard
                      key={note._id}
                      note={note}
                      searchQuery={searchQuery}
                      onClick={handleCardClick}
                      highlightText={highlightText}
                      folders={folders}
                      onMoveItem={handleMoveItem}
                      onDeleteItem={handleDeleteItem}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8 sm:mt-10">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="h-10 px-6 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {loading && <Loader2 className="animate-spin" size={13} />}
                    <span>{loading ? "Loading..." : "Load More Notes"}</span>
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 sm:py-24 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#09090c] border border-white/[0.06] max-w-md mx-auto"
            >
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500 mb-3 shadow-inner">
                {searchQuery ? <Search size={22} /> : <BookOpen size={22} />}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                {searchQuery ? "No Notes Matching Search" : "No Notes Yet"}
              </h3>
              <p className="text-xs text-neutral-400 mb-4 max-w-xs leading-relaxed">
                {searchQuery
                  ? "Try searching for a different keyword or topic."
                  : "Convert your first YouTube lecture into smart study notes."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/youtube-to-notes")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold shadow-md hover:from-red-500 hover:to-red-600 transition-all cursor-pointer"
              >
                Generate Notes →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 5. CREATE FOLDER MODAL ─── */}
      <AnimatePresence>
        {showCreateFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowCreateFolder(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#0c0c0e] border border-white/10 p-6 shadow-2xl z-50"
            >
              <button
                type="button"
                onClick={() => setShowCreateFolder(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
              <h3 className="text-base font-bold text-white mb-1">Create Folder</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Organize your study notes into dedicated subjects.
              </p>

              <form onSubmit={handleCreateFolder} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="e.g. Biology, Economics, CS50"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-black border border-white/10 focus:border-red-500 focus:outline-none text-xs text-white placeholder:text-neutral-500"
                  autoFocus
                />
                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateFolder(false)}
                    className="flex-1 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl h-10"
                  >
                    Create
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 6. RENAME FOLDER MODAL ─── */}
      <AnimatePresence>
        {showRenameFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowRenameFolder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#0c0c0e] border border-white/10 p-6 shadow-2xl z-50"
            >
              <button
                type="button"
                onClick={() => setShowRenameFolder(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
              <h3 className="text-base font-bold text-white mb-1">Rename Folder</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Enter a new name for this folder.
              </p>

              <form onSubmit={handleRenameFolder} className="space-y-4">
                <input
                  type="text"
                  required
                  value={renameFolderName}
                  onChange={(e) => setRenameFolderName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-black border border-white/10 focus:border-red-500 focus:outline-none text-xs text-white placeholder:text-neutral-500"
                  autoFocus
                />
                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowRenameFolder(null)}
                    className="flex-1 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl h-10"
                  >
                    Save
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