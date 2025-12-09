"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Share2, Download, Maximize2, Minimize2, ZoomIn, ZoomOut,
  MoreVertical, ThumbsUp, Loader2, FileText, X, ChevronRight,
  Image as ImageIcon, Paperclip, Crown, CalendarDays, MessageCircle, 
  ShieldCheck, Eye, Clock, MessageSquare, Heart, Send, UserPlus,
  Trash2, Edit, Reply, ChevronDown, ChevronUp, Globe, Mail,
  ExternalLink, Users, Award, BookOpen, Check, ImagePlus, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import { LoginDialog } from "@/components/LoginDialog";

// --- Types ---
interface UserData {
  id: string;
  name: string;
  email: string;
  picture?: string;
  googleId?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  isPremium?: boolean;
  joinDate?: string;
  totalComments?: number;
  totalFollowers?: number;
  totalNotes?: number;
  isFollowing?: boolean;
}

interface UserProfile extends UserData {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isPremium?: boolean;
  joinDate?: string;
  totalComments?: number;
  totalFollowers?: number;
  totalNotes?: number;
  bio?: string;
  website?: string;
  location?: string;
  isFollowing?: boolean;
}

interface Comment {
  _id: string;
  content: string;
  user: UserProfile;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  userLiked: boolean;
  replies: Comment[];
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf' | 'link';
  parentComment?: string;
  isEdited?: boolean;
}

interface NoteData {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  category: string;
  pdf_data: {
    viewLink: string;
    downloadLink: string;
    fileName: string;
    fileSize: number;
    pages?: number;
  };
  creator: UserProfile;
  views: number;
  likes: number;
  downloads: number;
  isFollowing?: boolean;
  followersCount?: number;
}

interface UploadedFile {
  file: File;
  previewUrl: string;
  type: 'image';
  name: string;
  size: number;
}

export default function NoteViewerPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pdf' | 'comments'>('pdf');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  // User state
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // PDF State
  const [pdfScale, setPdfScale] = useState(100);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Comments State
  const [comments, setComments] = useState<Comment[]>([
    {
      _id: "1",
      content: "Does this PDF cover the new header bidding wrapper integration steps? I see page 4 mentions it but I'm looking for code examples.",
      user: { 
        _id: "1", 
        name: "Sarah Jenkins",
        username: "sarahj",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", 
        isPremium: true, 
        totalComments: 42, 
        totalFollowers: 1200,
        totalNotes: 15,
        joinDate: "2024-01-10", 
        bio: "Full Stack Developer | AdTech Specialist",
        location: "San Francisco, CA",
        website: "sarahjenkins.dev",
        isFollowing: false
      },
      createdAt: "2024-03-10T10:30:00Z",
      likes: 24,
      userLiked: false,
      replies: [
        {
          _id: "1-1",
          content: "Yes, check page 6. There's a complete example with React and Node.js implementation.",
          user: { 
            _id: "creator", 
            name: "Om Awchar",
            username: "omawchar",
            avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocI9Nfqu4mJ19RkFL1qfLd9nurbxz9pXNE0WJpBgHYexk30uZ-4X=s96-c", 
            isPremium: true, 
            totalComments: 142,
            totalFollowers: 5000,
            totalNotes: 45,
            joinDate: "2023-08-15", 
            bio: "Tech educator focused on AdTech and Web Development.",
            isFollowing: true
          },
          createdAt: "2024-03-10T14:20:00Z",
          likes: 8,
          userLiked: false,
          replies: []
        }
      ]
    },
    {
      _id: "2",
      content: "The optimization tips on page 7 are gold. Thanks for sharing this note!",
      user: { 
        _id: "2", 
        name: "Dev Miller",
        username: "devm",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev", 
        isPremium: false, 
        totalComments: 5,
        totalFollowers: 120,
        totalNotes: 3,
        joinDate: "2025-02-20",
        bio: "Frontend Developer | Learning AdTech",
        isFollowing: false
      },
      createdAt: "2024-03-08T09:15:00Z",
      likes: 12,
      userLiked: false,
      replies: []
    },
    {
      _id: "3",
      content: "I found a small typo in the formula on slide 3, but otherwise this is perfect. Attached a screenshot of what I think it should be.",
      user: { 
        _id: "3", 
        name: "Alex Chen",
        username: "alexc",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", 
        isPremium: true, 
        totalComments: 89,
        totalFollowers: 3200,
        totalNotes: 28,
        joinDate: "2023-11-05", 
        bio: "Data Scientist @ TechCorp | AdTech Analytics",
        location: "New York, NY",
        website: "alexchenanalytics.com",
        isFollowing: true
      },
      createdAt: "2024-03-05T16:45:00Z",
      likes: 8,
      userLiked: false,
      replies: [],
      mediaUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      mediaType: 'image'
    }
  ]);
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Mobile Comments Drawer
  const [commentsOpen, setCommentsOpen] = useState(false);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current user from localStorage
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        
        if (userStr && token) {
          const userData: UserData = JSON.parse(userStr);
          setCurrentUser(userData);
          setIsAuthenticated(true);
          
          // Set auth token for API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    
    loadCurrentUser();
  }, []);

  // --- Helpers ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  // --- Fetch Data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { slug } = params as { slug: string };
        const response = await api.get(`/notes/allw/${slug}`);
        if (response.data.success) {
          const noteData = response.data.data;
          setData({
            ...noteData,
            creator: {
              ...noteData.creator,
              username: noteData.creator.username || noteData.creator.name.toLowerCase().replace(/\s+/g, ''),
              _id: noteData.creator._id,
              name: noteData.creator.name,
              avatarUrl: noteData.creator.avatarUrl,
              isPremium: noteData.creator.isPremium || false,
              totalComments: noteData.creator.totalComments || 0,
              totalFollowers: noteData.creator.followersCount || 0,
              totalNotes: noteData.creator.notesCount || 0,
              isFollowing: noteData.creator.isFollowing || false
            },
            isFollowing: noteData.isFollowing || false,
            followersCount: noteData.followersCount || 120
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load note");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params]);

  // --- Follow Handler ---
  const handleFollow = async () => {
    if (!data) return;
    
    try {
      if (!isAuthenticated) {
        setLoginDialogOpen(true);
        return;
      }

      setIsSubmitting(true);
      const response = await api.post(`/users/${data.creator._id}/follow`, {
        follow: !data.isFollowing
      });
      
      if (response.data.success) {
        setData(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing 
            ? prev.followersCount! - 1 
            : prev.followersCount! + 1,
          creator: {
            ...prev.creator,
            isFollowing: !prev.isFollowing,
            totalFollowers: prev.isFollowing 
              ? prev.creator.totalFollowers! - 1 
              : prev.creator.totalFollowers! + 1
          }
        } : null);
        
        toast.success(data.isFollowing ? "Unfollowed" : "Followed successfully!");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setLoginDialogOpen(true);
      } else {
        toast.error("Failed to update follow status");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Comment Handlers ---
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // 5MB limit
        const reader = new FileReader();
        reader.onloadend = () => {
          const uploadedFile: UploadedFile = {
            file,
            previewUrl: reader.result as string,
            type: 'image',
            name: file.name,
            size: file.size
          };
          setUploadedFiles(prev => [...prev, uploadedFile]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Only images under 5MB are allowed");
      }
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    if (!newComment.trim() && uploadedFiles.length === 0) {
      toast.error("Please add a comment or image");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload images if any
      const mediaUrls: string[] = [];
      for (const fileData of uploadedFiles) {
        const formData = new FormData();
        formData.append('image', fileData.file);
        
        const uploadResponse = await api.post('/upload/comment-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadResponse.data.success) {
          mediaUrls.push(uploadResponse.data.url);
        }
      }

      // Create comment
      const commentData = {
        content: replyingTo ? replyContent.trim() : newComment.trim(),
        mediaUrls,
        noteId: data?._id,
        parentComment: replyingTo
      };

      const response = await api.post('/comments', commentData);
      
      if (response.data.success) {
        const newCommentData: Comment = {
          _id: response.data.data._id,
          content: replyingTo ? replyContent.trim() : newComment.trim(),
          user: {
            _id: currentUser?.id || '',
            name: currentUser?.name || 'You',
            username: currentUser?.username || currentUser?.name?.toLowerCase().replace(/\s+/g, '') || 'user',
            avatarUrl: currentUser?.picture,
            email: currentUser?.email,
            isPremium: currentUser?.isPremium || false,
            totalComments: 1,
            totalFollowers: 0,
            totalNotes: 0,
            isFollowing: false
          },
          createdAt: new Date().toISOString(),
          likes: 0,
          userLiked: false,
          replies: [],
          mediaUrl: mediaUrls[0],
          mediaType: mediaUrls.length > 0 ? 'image' : undefined
        };

        if (replyingTo) {
          setComments(prev => prev.map(comment => {
            if (comment._id === replyingTo) {
              return {
                ...comment,
                replies: [...comment.replies, newCommentData]
              };
            }
            return comment;
          }));
          setReplyingTo(null);
          setReplyContent("");
        } else {
          setComments(prev => [newCommentData, ...prev]);
          setNewComment("");
        }

        setUploadedFiles([]);
        toast.success("Comment posted!");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setLoginDialogOpen(true);
      } else {
        toast.error("Failed to post comment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    try {
      const response = await api.post(`/comments/${commentId}/like`);
      
      if (response.data.success) {
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likes: response.data.data.likes,
              userLiked: response.data.data.userLiked
            };
          }
          return comment;
        }));
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setLoginDialogOpen(true);
      }
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // --- Login Success Handler ---
  const handleLoginSuccess = (userData: UserData, token: string) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    toast.success("Logged in successfully!");
  };

  // --- PDF Controls ---
  const toggleFullscreen = () => {
    if (!pdfContainerRef.current) return;
    if (!isPdfFullscreen) {
      pdfContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsPdfFullscreen(!isPdfFullscreen);
  };

  // --- User Profile Handlers ---
  const handleViewProfile = (user: UserProfile) => {
    router.push(`/${user.username}/profile`);
  };

  const handleUserHover = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const handleFollowUser = async (userId: string) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    try {
      const response = await api.post(`/users/${userId}/follow`);
      if (response.data.success) {
        setSelectedUser(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          totalFollowers: prev.isFollowing 
            ? prev.totalFollowers! - 1 
            : prev.totalFollowers! + 1
        } : null);
        
        // Update in comments if needed
        setComments(prev => prev.map(comment => {
          if (comment.user._id === userId) {
            return {
              ...comment,
              user: {
                ...comment.user,
                isFollowing: !comment.user.isFollowing,
                totalFollowers: comment.user.isFollowing 
                  ? comment.user.totalFollowers! - 1 
                  : comment.user.totalFollowers! + 1
              }
            };
          }
          return comment;
        }));
        
        toast.success(response.data.message);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setLoginDialogOpen(true);
      } else {
        toast.error("Failed to follow user");
      }
    }
  };

  // Handle mobile swipes between PDF and Comments
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const startX = e.touches[0].clientX;
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        const currentX = moveEvent.touches[0].clientX;
        const diff = startX - currentX;
        
        // Swipe left (show comments)
        if (diff > 100 && activeTab === 'pdf') {
          setActiveTab('comments');
        }
        // Swipe right (show PDF)
        else if (diff < -100 && activeTab === 'comments') {
          setActiveTab('pdf');
        }
      };
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [activeTab]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-950 text-white"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!data) return <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">Note not found</div>;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="h-14 flex-none border-b border-zinc-800 bg-zinc-950/95 backdrop-blur flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold truncate max-w-[150px] sm:max-w-md text-zinc-100">{data.title}</h1>
            <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-2">
               PDF Note • {formatFileSize(data.pdf_data.fileSize)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Comment Trigger Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden text-zinc-400 hover:text-white hover:bg-zinc-800 relative"
            onClick={() => setCommentsOpen(true)}
          >
            <MessageSquare className="h-5 w-5" />
            {comments.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] bg-blue-600">
                {comments.length}
              </Badge>
            )}
          </Button>
          
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all">
            <Download className="h-4 w-4 sm:mr-2" /> 
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">DL</span>
          </Button>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="flex sm:hidden border-b border-zinc-800 bg-zinc-900/50">
        <button
          className={cn(
            "flex-1 py-3 text-sm font-medium relative",
            activeTab === 'pdf' ? 'text-white' : 'text-zinc-500'
          )}
          onClick={() => setActiveTab('pdf')}
        >
          PDF Viewer
          {activeTab === 'pdf' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button
          className={cn(
            "flex-1 py-3 text-sm font-medium relative flex items-center justify-center gap-2",
            activeTab === 'comments' ? 'text-white' : 'text-zinc-500'
          )}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare className="h-4 w-4" />
          Comments
          {comments.length > 0 && (
            <Badge className="h-4 px-1 text-[10px] bg-zinc-700">
              {comments.length}
            </Badge>
          )}
          {activeTab === 'comments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* PDF Viewer */}
        <div className={cn(
          "w-full lg:w-1/2 h-full bg-zinc-900/50 relative flex flex-col transition-transform duration-300",
          activeTab === 'pdf' ? 'translate-x-0' : '-translate-x-full',
          "lg:translate-x-0 lg:border-r lg:border-zinc-800"
        )}>
          <div ref={pdfContainerRef} className="flex-1 w-full h-full relative flex items-center justify-center group bg-zinc-900">
            {data.pdf_data?.viewLink ? (
              <iframe 
                src={data.pdf_data.viewLink.replace('/view', '/preview')} 
                className="w-full h-full border-none bg-zinc-900"
                title="PDF Viewer"
                allow="autoplay"
              />
            ) : (
              <div className="text-zinc-500 flex flex-col items-center">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <p>No PDF attached</p>
              </div>
            )}

            {/* Floating PDF Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950/90 backdrop-blur border border-zinc-800 p-1.5 rounded-full shadow-2xl flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-800 text-zinc-400" onClick={() => setPdfScale(s => Math.max(50, s - 10))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono w-12 text-center text-zinc-300">{pdfScale}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-800 text-zinc-400" onClick={() => setPdfScale(s => Math.min(200, s + 10))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-4 bg-zinc-700 mx-1 hidden sm:block" />
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-800 text-zinc-400" onClick={toggleFullscreen}>
                {isPdfFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>

            {/* Mobile Swipe Hint */}
            <div className="absolute bottom-4 right-4 sm:hidden flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <ChevronRight className="h-3 w-3" />
              Swipe for comments
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className={cn(
          "w-full lg:w-1/2 h-full bg-zinc-950 absolute lg:relative transition-transform duration-300",
          activeTab === 'comments' ? 'translate-x-0' : 'translate-x-full',
          "lg:translate-x-0"
        )}>
          <ScrollArea className="h-full">
            <div className="flex flex-col min-h-full p-4 sm:p-8 max-w-2xl mx-auto w-full">
              
              {/* Mobile Comments Header */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setActiveTab('pdf')} className="text-zinc-400">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setActiveTab('pdf')} className="text-zinc-400">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Note Metadata */}
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl font-bold text-zinc-100 leading-tight">{data.title}</h1>
                </div>

                <div className="flex items-center justify-between">
                  {/* Creator Hover Card */}
                  <div onMouseEnter={() => handleUserHover(data.creator)}>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" className="pl-0 h-auto py-2 hover:bg-transparent group">
                          <Avatar className="h-10 w-10 mr-3 border border-zinc-800 group-hover:border-blue-500 transition-colors">
                            <AvatarImage src={data.creator.avatarUrl} />
                            <AvatarFallback>{data.creator.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                              {data.creator.name}
                              {data.creator.isPremium && <Crown className="h-3 w-3 inline ml-1 text-amber-500" />}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                               <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(data.createdAt)}</span>
                               <span>•</span>
                               <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {data.views} views</span>
                               <span>•</span>
                               <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {data.followersCount} followers</span>
                            </div>
                          </div>
                        </Button>
                      </HoverCardTrigger>
                      <UserHoverCard 
                        user={data.creator}
                        onViewProfile={handleViewProfile}
                        onFollow={handleFollowUser}
                        currentUserId={currentUser?.id}
                      />
                    </HoverCard>
                  </div>

                  <Button 
                    variant={data.isFollowing ? "default" : "secondary"}
                    className={cn(
                      "rounded-full px-6 transition-all",
                      data.isFollowing 
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                    )}
                    onClick={handleFollow}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : data.isFollowing ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator className="bg-zinc-800/50 mb-8" />

              {/* Comment Input - Only show if user is authenticated */}
              {isAuthenticated ? (
                <CommentInput 
                  newComment={newComment}
                  setNewComment={setNewComment}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  handleFileUpload={handleFileUpload}
                  removeUploadedFile={removeUploadedFile}
                  handleSubmitComment={handleSubmitComment}
                  isSubmitting={isSubmitting}
                  fileInputRef={fileInputRef}
                  currentUser={currentUser}
                  commentsCount={comments.length}
                />
              ) : (
                <div className="mb-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <LogIn className="h-5 w-5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">Login to join the discussion</p>
                        <p className="text-xs text-zinc-500">Share your thoughts and ask questions</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setLoginDialogOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6 pb-20">
                {comments.map((comment) => (
                  <CommentItem 
                    key={comment._id}
                    comment={comment}
                    onLike={handleLikeComment}
                    onReply={(commentId) => {
                      if (!isAuthenticated) {
                        setLoginDialogOpen(true);
                        return;
                      }
                      setReplyingTo(commentId);
                      setReplyContent("");
                      document.querySelector('.scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onViewProfile={handleViewProfile}
                    onUserHover={handleUserHover}
                    expandedReplies={expandedReplies}
                    toggleReplies={toggleReplies}
                    currentUserId={currentUser?.id}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Comments Sheet */}
      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] rounded-t-2xl border-t border-zinc-800 bg-zinc-950"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left flex items-center justify-between">
              <span>Comments ({comments.length})</span>
              <Button variant="ghost" size="icon" onClick={() => setCommentsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4">
            {comments.slice(0, 3).map((comment) => (
              <MobileCommentItem 
                key={comment._id}
                comment={comment}
                onLike={handleLikeComment}
                onReply={(commentId) => {
                  if (!isAuthenticated) {
                    setLoginDialogOpen(true);
                    return;
                  }
                  setReplyingTo(commentId);
                  setCommentsOpen(false);
                  setActiveTab('comments');
                }}
                onViewProfile={handleViewProfile}
                currentUserId={currentUser?.id}
              />
            ))}
            {comments.length > 3 && (
              <Button variant="ghost" className="w-full text-blue-400" onClick={() => {
                setCommentsOpen(false);
                setActiveTab('comments');
              }}>
                View all {comments.length} comments
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Login Dialog */}
      <LoginDialog 
        isOpen={loginDialogOpen} 
        onClose={() => setLoginDialogOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* User Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">User Profile</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  View and manage user profile
                </DialogDescription>
              </DialogHeader>
              <UserProfileDetail 
                user={selectedUser}
                onViewProfile={handleViewProfile}
                onFollow={handleFollowUser}
                currentUserId={currentUser?.id}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Component: Comment Input ---
function CommentInput({
  newComment,
  setNewComment,
  replyContent,
  setReplyContent,
  replyingTo,
  setReplyingTo,
  uploadedFiles,
  setUploadedFiles,
  handleFileUpload,
  removeUploadedFile,
  handleSubmitComment,
  isSubmitting,
  fileInputRef,
  currentUser,
  commentsCount
}: {
  newComment: string;
  setNewComment: (value: string) => void;
  replyContent: string;
  setReplyContent: (value: string) => void;
  replyingTo: string | null;
  setReplyingTo: (value: string | null) => void;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  removeUploadedFile: (index: number) => void;
  handleSubmitComment: () => Promise<void>;
  isSubmitting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  currentUser: UserData | null;
  commentsCount: number;
}) {
  const currentContent = replyingTo ? replyContent : newComment;
  const setCurrentContent = replyingTo ? setReplyContent : setNewComment;

  return (
    <div className="mb-6">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={currentUser?.picture} />
          <AvatarFallback className="bg-blue-600 text-white">
            {currentUser?.name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="relative">
            <Textarea 
              placeholder={replyingTo ? "Write your reply..." : "Add a comment..."} 
              className="bg-zinc-900/50 border-zinc-800 min-h-[44px] max-h-[120px] focus:ring-1 focus:ring-blue-500/50 resize-none rounded-xl p-3 text-sm text-zinc-200"
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              rows={1}
            />
            {(currentContent.trim() || uploadedFiles.length > 0) && (
              <div className="absolute right-2 bottom-2">
                <Button 
                  size="sm" 
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 h-7"
                  onClick={handleSubmitComment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : replyingTo ? (
                    <Send className="h-3 w-3" />
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* File Previews */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-700">
                    <img 
                      src={file.previewUrl} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeUploadedFile(index)}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Input Actions */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-zinc-500 hover:text-blue-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs text-zinc-500">
              {commentsCount} comments
            </span>
          </div>
        </div>
      </div>
      
      {/* Reply Cancel */}
      {replyingTo && (
        <div className="mt-3 ml-12 flex items-center justify-between bg-zinc-900/50 rounded-lg p-2">
          <span className="text-xs text-zinc-400">
            Replying to comment...
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs"
            onClick={() => {
              setReplyingTo(null);
              setReplyContent("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

// --- Component: User Hover Card ---
function UserHoverCard({ 
  user, 
  onViewProfile, 
  onFollow,
  currentUserId
}: { 
  user: UserProfile; 
  onViewProfile: (user: UserProfile) => void;
  onFollow: (userId: string) => void;
  currentUserId?: string;
}) {
  const isCurrentUser = user._id === currentUserId;
  
  return (
    <HoverCardContent className="w-80 p-0 overflow-hidden bg-zinc-900 border-zinc-800 shadow-2xl z-[100]" align="start" sideOffset={8}>
      {/* Banner */}
      <div className="h-20 bg-gradient-to-r from-blue-900/40 to-purple-900/40 w-full relative">
        {user.isPremium && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 border-none text-white shadow-lg flex gap-1 items-center px-2 py-0.5">
              <Crown className="h-3 w-3 fill-current" /> Premium
            </Badge>
          </div>
        )}
      </div>
      
      <div className="px-5 pb-5 -mt-10 relative">
        <div className="flex justify-between items-end">
          <Avatar className="h-20 w-20 border-4 border-zinc-900 shadow-lg bg-zinc-800">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="text-xl font-bold text-zinc-400">{user.name[0]}</AvatarFallback>
          </Avatar>
          
          {!isCurrentUser && (
            <div className="flex flex-col items-end gap-2">
              <Button 
                size="sm"
                variant={user.isFollowing ? "outline" : "default"}
                className={cn(
                  "rounded-full px-3 text-xs h-7",
                  user.isFollowing 
                    ? "border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                onClick={() => onFollow(user._id)}
              >
                {user.isFollowing ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Follow
                  </>
                )}
              </Button>
              <Button 
                size="sm"
                variant="ghost"
                className="rounded-full px-3 text-xs h-7 text-zinc-400 hover:text-white"
                onClick={() => onViewProfile(user)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Profile
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            {user.name} 
            {user.isPremium && <ShieldCheck className="h-4 w-4 text-blue-400" />}
          </h4>
          {user.username && (
            <p className="text-sm text-zinc-500">@{user.username}</p>
          )}
          <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{user.bio || "No bio available."}</p>
        </div>

        {/* User Info */}
        <div className="space-y-2 mt-4 pt-4 border-t border-zinc-800">
          {user.location && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Globe className="h-3 w-3" />
              {user.location}
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <ExternalLink className="h-3 w-3" />
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-800">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-zinc-200">{user.totalComments || 0}</span>
            <span className="text-xs text-zinc-500">Comments</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-zinc-200">{user.totalFollowers || 0}</span>
            <span className="text-xs text-zinc-500">Followers</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-zinc-200">{user.totalNotes || 0}</span>
            <span className="text-xs text-zinc-500">Notes</span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 h-8 text-xs font-medium border border-zinc-700/50"
          onClick={() => onViewProfile(user)}
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          View Full Profile
        </Button>
      </div>
    </HoverCardContent>
  );
}

// --- Component: Comment Item ---
function CommentItem({ 
  comment, 
  onLike, 
  onReply, 
  onViewProfile,
  onUserHover,
  expandedReplies,
  toggleReplies,
  currentUserId
}: { 
  comment: Comment;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onViewProfile: (user: UserProfile) => void;
  onUserHover: (user: UserProfile) => void;
  expandedReplies: Set<string>;
  toggleReplies: (id: string) => void;
  currentUserId?: string;
}) {
  const hasReplies = comment.replies.length > 0;
  const isExpanded = expandedReplies.has(comment._id);
  const isCurrentUserComment = comment.user._id === currentUserId;

  return (
    <div className="flex gap-3 group animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Avatar with Hover Card */}
      <div 
        onMouseEnter={() => onUserHover(comment.user)}
        className="cursor-pointer"
      >
        <HoverCard>
          <HoverCardTrigger asChild>
            <Avatar className="h-10 w-10 border border-zinc-800 mt-1 transition-transform hover:scale-105">
              <AvatarImage src={comment.user.avatarUrl} />
              <AvatarFallback className="bg-zinc-800 text-zinc-400 font-semibold">
                {comment.user.name[0]}
              </AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <UserHoverCard 
            user={comment.user}
            onViewProfile={onViewProfile}
            onFollow={() => {}}
            currentUserId={currentUserId}
          />
        </HoverCard>
      </div>
      
      <div className="flex-1">
        <div className="bg-transparent">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <div 
              onMouseEnter={() => onUserHover(comment.user)}
              className="cursor-pointer"
            >
              <HoverCard>
                <HoverCardTrigger asChild>
                  <span className="font-bold text-sm text-zinc-200 hover:text-blue-400 cursor-pointer">
                    {comment.user.name}
                    {comment.user.isPremium && <Crown className="h-3 w-3 inline ml-1 text-amber-500" />}
                    {isCurrentUserComment && (
                      <Badge className="ml-2 text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        You
                      </Badge>
                    )}
                  </span>
                </HoverCardTrigger>
                <UserHoverCard 
                  user={comment.user}
                  onViewProfile={onViewProfile}
                  onFollow={() => {}}
                  currentUserId={currentUserId}
                />
              </HoverCard>
            </div>
            <span className="text-xs text-zinc-600">•</span>
            <span className="text-xs text-zinc-500">
              {getTimeAgo(comment.createdAt)}
              {comment.isEdited && " (edited)"}
            </span>
          </div>
          
          {/* Content */}
          <div className="text-zinc-300 text-sm leading-relaxed mb-3 break-words">
            {comment.content}
          </div>

          {/* Media Attachment */}
          {comment.mediaUrl && comment.mediaType === 'image' && (
            <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800 max-w-sm group/image relative">
              <img 
                src={comment.mediaUrl} 
                alt="Attachment" 
                className="w-full h-auto object-cover max-h-[300px]"
                loading="lazy"
              />
              <a 
                href={comment.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors"
              />
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-zinc-900 rounded-full border border-zinc-800/60 p-0.5">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-7 px-3 rounded-l-full gap-1.5 transition-colors",
                  comment.userLiked 
                    ? "text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    : "text-zinc-400 hover:text-blue-400 hover:bg-zinc-800"
                )}
                onClick={() => onLike(comment._id)}
              >
                <ThumbsUp className={cn("h-3.5 w-3.5", comment.userLiked && "fill-current")} />
                <span className="text-xs font-semibold">{comment.likes}</span>
              </Button>
              <Separator orientation="vertical" className="h-4 bg-zinc-800" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 rounded-r-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                onClick={() => onReply(comment._id)}
              >
                <Reply className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Replies Toggle */}
            {hasReplies && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-zinc-500 hover:text-zinc-200 gap-2 hover:bg-transparent"
                onClick={() => toggleReplies(comment._id)}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {isExpanded ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            )}
            
            {/* More Options */}
            {isCurrentUserComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-zinc-600 hover:text-zinc-300">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 border-zinc-800 w-48">
                  <DropdownMenuItem className="text-zinc-300 hover:text-white focus:text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-zinc-300 hover:text-white focus:text-white">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem className="text-red-500 hover:text-red-400 focus:text-red-400">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Replies */}
          {isExpanded && hasReplies && (
            <div className="mt-6 ml-4 pl-4 border-l border-zinc-800 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply._id} className="flex gap-3">
                  <div 
                    onMouseEnter={() => onUserHover(reply.user)}
                    className="cursor-pointer"
                  >
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Avatar className="h-8 w-8 border border-zinc-800">
                          <AvatarImage src={reply.user.avatarUrl} />
                          <AvatarFallback className="text-xs bg-zinc-800 text-zinc-400">
                            {reply.user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <UserHoverCard 
                        user={reply.user}
                        onViewProfile={onViewProfile}
                        onFollow={() => {}}
                        currentUserId={currentUserId}
                      />
                    </HoverCard>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        onMouseEnter={() => onUserHover(reply.user)}
                        className="cursor-pointer"
                      >
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <span className="font-semibold text-xs text-zinc-200 hover:text-blue-400">
                              {reply.user.name}
                              {reply.user._id === currentUserId && (
                                <Badge className="ml-1 text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  You
                                </Badge>
                              )}
                            </span>
                          </HoverCardTrigger>
                          <UserHoverCard 
                            user={reply.user}
                            onViewProfile={onViewProfile}
                            onFollow={() => {}}
                            currentUserId={currentUserId}
                          />
                        </HoverCard>
                      </div>
                      <span className="text-xs text-zinc-500">{getTimeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-2">{reply.content}</p>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-zinc-500 hover:text-blue-400"
                        onClick={() => onLike(reply._id)}
                      >
                        <ThumbsUp className={cn("h-3 w-3 mr-1", reply.userLiked && "fill-current text-red-500")} />
                        {reply.likes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-200"
                        onClick={() => onReply(comment._id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Component: Mobile Comment Item ---
function MobileCommentItem({ 
  comment, 
  onLike, 
  onReply,
  onViewProfile,
  currentUserId
}: { 
  comment: Comment;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onViewProfile: (user: UserProfile) => void;
  currentUserId?: string;
}) {
  const isCurrentUserComment = comment.user._id === currentUserId;

  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Avatar 
        className="h-9 w-9 flex-shrink-0 border border-zinc-800" 
        onClick={() => onViewProfile(comment.user)}
      >
        <AvatarImage src={comment.user.avatarUrl} />
        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-semibold">
          {comment.user.name[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="bg-transparent">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span 
              className="font-semibold text-sm text-zinc-200 truncate" 
              onClick={() => onViewProfile(comment.user)}
            >
              {comment.user.name}
              {isCurrentUserComment && (
                <Badge className="ml-1 text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                  You
                </Badge>
              )}
            </span>
            {comment.user.isPremium && (
              <Crown className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
            <span className="text-xs text-zinc-500 shrink-0">{getTimeAgo(comment.createdAt)}</span>
          </div>
          
          {/* Content */}
          <div className="text-zinc-300 text-sm leading-relaxed mb-3 break-words">
            {comment.content}
          </div>

          {/* Media Attachment */}
          {comment.mediaUrl && comment.mediaType === 'image' && (
            <div className="mb-3 rounded-lg overflow-hidden border border-zinc-800 max-w-[200px]">
              <img 
                src={comment.mediaUrl} 
                alt="Attachment" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-zinc-400 hover:text-blue-400 gap-1.5"
                onClick={() => onLike(comment._id)}
              >
                <ThumbsUp className={cn("h-4 w-4", comment.userLiked && "fill-current text-red-500")} />
                <span className="text-xs">{comment.likes}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-zinc-400 hover:text-zinc-200 gap-1.5"
                onClick={() => onReply(comment._id)}
              >
                <Reply className="h-4 w-4" />
                {comment.replies.length > 0 && (
                  <span className="text-xs">{comment.replies.length}</span>
                )}
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-800 w-48">
                <DropdownMenuItem 
                  className="text-zinc-300 hover:text-white"
                  onClick={() => onViewProfile(comment.user)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isCurrentUserComment ? 'Delete' : 'Report'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Replies Preview */}
          {comment.replies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                <MessageCircle className="h-3 w-3" />
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </div>
              {comment.replies.slice(0, 1).map((reply) => (
                <div key={reply._id} className="flex gap-2 text-sm">
                  <span className="font-medium text-zinc-300">{reply.user.name}:</span>
                  <span className="text-zinc-400 truncate">{reply.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Component: User Profile Detail ---
function UserProfileDetail({ 
  user, 
  onViewProfile,
  onFollow,
  currentUserId
}: { 
  user: UserProfile; 
  onViewProfile: (user: UserProfile) => void;
  onFollow: (userId: string) => void;
  currentUserId?: string;
}) {
  const isCurrentUser = user._id === currentUserId;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-24 w-24 border-4 border-zinc-800">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="text-2xl font-bold text-zinc-400">
            {user.name[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {user.name}
                {user.isPremium && <Crown className="h-5 w-5 inline ml-2 text-amber-500" />}
              </h3>
              {user.username && (
                <p className="text-zinc-400">@{user.username}</p>
              )}
            </div>
            {!isCurrentUser && (
              <Button 
                size="sm"
                variant={user.isFollowing ? "outline" : "default"}
                className={cn(
                  "rounded-full",
                  user.isFollowing 
                    ? "border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                onClick={() => onFollow(user._id)}
              >
                {user.isFollowing ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="mt-3 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{user.totalNotes || 0}</div>
              <div className="text-xs text-zinc-500">Notes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{user.totalFollowers || 0}</div>
              <div className="text-xs text-zinc-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{user.totalComments || 0}</div>
              <div className="text-xs text-zinc-500">Comments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="text-zinc-300 text-sm">{user.bio}</div>
      )}

      {/* Info */}
      <div className="space-y-2">
        {user.location && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Globe className="h-4 w-4" />
            {user.location}
          </div>
        )}
        {user.website && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <ExternalLink className="h-4 w-4" />
            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {user.website}
            </a>
          </div>
        )}
        {user.joinDate && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CalendarDays className="h-4 w-4" />
            Joined {formatDate(user.joinDate)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <Button 
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
          onClick={() => onViewProfile(user)}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full Profile
        </Button>
        {!isCurrentUser && (
          <Button 
            variant="outline" 
            className="border-zinc-700 text-zinc-300 hover:text-white"
          >
            <Mail className="h-4 w-4 mr-2" />
            Message
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper function for getTimeAgo
function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// Helper function for formatDate
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}