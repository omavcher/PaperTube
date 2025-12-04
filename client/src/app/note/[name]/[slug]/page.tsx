"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Share,
  Send,
  Clock,
  User,
  Eye,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Home,
  Heart,
  MoreHorizontal,
  Bookmark,
  BarChart3,
  Bot
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import api from "@/config/api";
import { LoginDialog } from "@/components/LoginDialog";

// Types
interface UserData {
  name?: string;
  email?: string;
  picture?: string;
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    picture?: string;
  };
  createdAt: string;
  likes: number;
  userLiked: boolean;
  replies: Reply[];
  isAiResponse?: boolean;
  engagement?: {
    likes: number;
    replies: number;
    shares: number;
  };
}

interface Reply {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    picture?: string;
  };
  createdAt: string;
  likes: number;
  userLiked: boolean;
  isAiResponse?: boolean;
}

interface NoteData {
  _id: string;
  title: string;
  content: string;
  thumbnail?: string;
  videoUrl?: string;
  creator: {
    _id: string;
    name: string;
    picture?: string;
    email?: string;
  };
  views: number;
  likes: number;
  userLiked: boolean;
  bookmarks: number;
  userBookmarked: boolean;
  createdAt: string;
  transcript?: string;
  img_with_url?: Array<{
    title: string;
    img_url: string;
    _id: string;
  }>;
}

// Auth helpers
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("authToken");
  }
  return null;
};

const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Format date - Twitter style
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 60) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Twitter-style Comment Component
const CommentItem: React.FC<{
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
  onShare: (commentId: string) => void;
}> = ({ comment, onLike, onReply, onLikeReply, onShare }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    await onLike(comment._id);
    setIsLiking(false);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onReply(comment._id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors duration-200 animate-fade-in">
      {/* Main Comment */}
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
          <AvatarImage src={comment.user.picture} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {comment.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                {comment.user.name}
              </span>
              {comment.isAiResponse && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0 border border-blue-500/30">
                  <Bot className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
              <span className="text-zinc-500 text-sm">
                · {formatDate(comment.createdAt)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-blue-500/10"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-zinc-100 text-sm mb-3 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
          
          {/* Engagement Bar - Twitter Style */}
          <div className="flex items-center justify-between max-w-md text-zinc-500">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 group hover:text-blue-400 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-xs min-w-[20px]">{comment.replies.length || ""}</span>
            </button>
            
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 group transition-colors ${
                comment.userLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                comment.userLiked 
                  ? 'bg-red-500/20' 
                  : 'group-hover:bg-red-500/10'
              }`}>
                <Heart className={`h-4 w-4 ${comment.userLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-xs min-w-[20px]">
                {comment.likes > 0 ? comment.likes : ""}
              </span>
            </button>

            <button
              onClick={() => onShare(comment._id)}
              className="flex items-center space-x-1 group hover:text-green-400 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Share className="h-4 w-4" />
              </div>
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 ml-2 pl-4 border-l-2 border-zinc-700 animate-slide-down">
              <form onSubmit={handleSubmitReply} className="space-y-3">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Post your reply..."
                  className="bg-zinc-800 border-zinc-600 text-sm resize-none focus:border-blue-500 transition-colors min-h-[80px]"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReplyForm(false)}
                    className="text-xs h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyContent.trim() || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Reply"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-13 mt-3 space-y-3 border-l-2 border-zinc-700 pl-4">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="flex space-x-3 animate-fade-in group hover:bg-zinc-800/30 rounded-lg p-2 transition-colors">
              <Avatar className="h-8 w-8 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                <AvatarImage src={reply.user.picture} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                  {reply.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-white text-sm">
                    {reply.user.name}
                  </span>
                  {reply.isAiResponse && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0">
                      <Bot className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                  <span className="text-zinc-500 text-xs">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                
                <p className="text-zinc-200 text-sm mb-2 whitespace-pre-wrap leading-relaxed">
                  {reply.content}
                </p>
                
                <div className="flex items-center space-x-4 text-zinc-500">
                  <button
                    onClick={() => onLikeReply(comment._id, reply._id)}
                    className={`flex items-center space-x-1 text-xs transition-colors ${
                      reply.userLiked ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${reply.userLiked ? 'fill-current' : ''}`} />
                    <span>{reply.likes > 0 ? reply.likes : ''}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Floating Action Button for Mobile
const FloatingActions: React.FC<{
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  isLiked: boolean;
  isBookmarked: boolean;
  likes: number;
}> = ({ onLike, onBookmark, onShare, isLiked, isBookmarked, likes }) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50 lg:hidden">
      <Button
        onClick={onLike}
        size="icon"
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
          isLiked 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        }`}
      >
        <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
      </Button>
      <Button
        onClick={onBookmark}
        size="icon"
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
          isBookmarked 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        }`}
      >
        <Bookmark className={`h-6 w-6 ${isBookmarked ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};

export default function NoteDiscussionPage({ params }: { params: Promise<{ creator: string; slug: string }> }) {
  const { creator, slug } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<NoteData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [activeTab, setActiveTab] = useState("preview"); // Set preview as default since PDF is main feature
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-show login dialog after 20 seconds if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      const timer = setTimeout(() => {
        setShowLoginDialog(true);
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Load note data and comments
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = getAuthToken();
      
      // Load note data from the new endpoint
      const noteRes = await api.get(`/notes/allw/${slug}`, {
        headers: { 'Auth': authToken }
      });
      
      if (noteRes.data.success) {
        setData(noteRes.data.data);
        
        // Load comments for this note
        await loadComments(noteRes.data.data._id);
      } else {
        setError(noteRes.data.message || "Failed to load note");
      }

    } catch (error: any) {
      console.error("Load data error:", error);
      if (error.response?.status === 404) {
        setError("Note not found");
      } else if (error.response?.status === 403 || error.response?.status === 401) {
        setHasPermission(false);
        setError("You don't have permission to access this note");
        setShowLoginDialog(true);
      } else {
        setError(error.response?.data?.message || "Failed to load content");
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Load comments separately
  const loadComments = async (noteId: string) => {
    try {
      setCommentsLoading(true);
      const authToken = getAuthToken();
      
      const commentsRes = await api.get(`/notes/${noteId}/comments`, {
        headers: { 'Auth': authToken }
      });
      
      if (commentsRes.data.success) {
        setComments(commentsRes.data.data.comments || []);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle login success
  const handleLoginSuccess = (userData: UserData, token: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowLoginDialog(false);
    setHasPermission(true);
    loadData();
  };

  // Handle new comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !data || isSubmitting) return;

    if (!isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(
        `/notes/${data._id}/comments`,
        { content: newComment },
        { headers: { 'Auth': getAuthToken() } }
      );

      if (response.data.success) {
        setComments(prev => [response.data.data.comment, ...prev]);
        setNewComment("");
        if (commentInputRef.current) {
          commentInputRef.current.style.height = 'auto';
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Failed to submit comment:", error);
      alert(error.response?.data?.message || "Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    try {
      await api.post(
        `/notes/comments/${commentId}/like`,
        {},
        { headers: { 'Auth': getAuthToken() } }
      );

      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { 
              ...comment, 
              likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
              userLiked: !comment.userLiked
            }
          : comment
      ));
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  // Handle like reply
  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    try {
      await api.post(
        `/notes/comments/${commentId}/replies/${replyId}/like`,
        {},
        { headers: { 'Auth': getAuthToken() } }
      );

      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? {
              ...comment,
              replies: comment.replies.map(reply =>
                reply._id === replyId
                  ? {
                      ...reply,
                      likes: reply.userLiked ? reply.likes - 1 : reply.likes + 1,
                      userLiked: !reply.userLiked
                    }
                  : reply
              )
            }
          : comment
      ));
    } catch (error) {
      console.error("Failed to like reply:", error);
    }
  };

  // Handle reply to comment
  const handleReply = async (commentId: string, content: string) => {
    if (!isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    try {
      const response = await api.post(
        `/notes/comments/${commentId}/replies`,
        { content },
        { headers: { 'Auth': getAuthToken() } }
      );

      if (response.data.success) {
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, replies: [...comment.replies, response.data.data.reply] }
            : comment
        ));
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Failed to submit reply:", error);
      throw new Error(error.response?.data?.message || "Failed to submit reply");
    }
  };

  // Handle share comment
  const handleShareComment = async (commentId: string) => {
    if (!isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    try {
      const commentUrl = `${window.location.origin}/comment/${commentId}`;
      await navigator.clipboard.writeText(commentUrl);
      // You can add a toast notification here
      alert('Comment link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share comment:', error);
    }
  };

  // Handle like note
  const handleLikeNote = async () => {
    if (!data || !isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      const response = await api.post(
        `/notes/${data._id}/like`,
        {},
        { headers: { 'Auth': getAuthToken() } }
      );

      if (response.data.success) {
        setData(prev => prev ? {
          ...prev,
          likes: response.data.data.likes,
          userLiked: response.data.data.userLiked
        } : null);
      }
    } catch (error) {
      console.error('Failed to like note:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle bookmark note
  const handleBookmarkNote = async () => {
    if (!data || !isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    if (isBookmarking) return;
    setIsBookmarking(true);

    try {
      const response = await api.post(
        `/notes/${data._id}/bookmark`,
        {},
        { headers: { 'Auth': getAuthToken() } }
      );

      if (response.data.success) {
        setData(prev => prev ? {
          ...prev,
          bookmarks: response.data.data.bookmarks,
          userBookmarked: response.data.data.userBookmarked
        } : null);
      }
    } catch (error) {
      console.error('Failed to bookmark note:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  // Handle share note
  const handleShareNote = async () => {
    const noteUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(noteUrl);
      // You can add a toast notification here
      alert('Note link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share note:', error);
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-lg">Loading discussion...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 rounded-full">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={() => router.back()} variant="outline" className="rounded-full">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <LoginDialog 
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={handleLoginSuccess}
      />

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate text-white mb-1">{data.title}</h1>
                <div className="flex items-center space-x-4 text-zinc-400 text-sm flex-wrap gap-2">
                  <div className="flex items-center space-x-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={data.creator.picture} />
                      <AvatarFallback className="text-xs">
                        {data.creator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hover:text-white cursor-pointer">{data.creator.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{data.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(data.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  onClick={handleLikeNote}
                  variant="ghost"
                  size="sm"
                  disabled={isLiking}
                  className={`rounded-full ${
                    data.userLiked ? 'text-red-500' : 'text-zinc-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${data.userLiked ? 'fill-current' : ''}`} />
                  {data.likes}
                </Button>
                <Button
                  onClick={handleBookmarkNote}
                  variant="ghost"
                  size="sm"
                  disabled={isBookmarking}
                  className={`rounded-full ${
                    data.userBookmarked ? 'text-blue-500' : 'text-zinc-400'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${data.userBookmarked ? 'fill-current' : ''}`} />
                  {data.bookmarks}
                </Button>
                <Button
                  onClick={handleShareNote}
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-zinc-400"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 rounded-2xl p-1">
              <TabsTrigger 
                value="preview" 
                className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <Eye className="h-4 w-4" />
                <span>PDF Preview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="discussion" 
                className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Discussion</span>
              </TabsTrigger>
            </TabsList>

            {/* Preview Tab - PDF-like viewer */}
            <TabsContent value="preview" className="mt-6">
              <div className="flex justify-center items-center min-h-[70vh]">
                <div 
                  className="bg-white text-black rounded-lg shadow-2xl p-8 max-w-[210mm] w-full mx-auto overflow-auto border border-gray-200"
                  style={{ aspectRatio: '210 / 297' }} // A4 aspect ratio
                >
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Discussion Tab */}
            <TabsContent value="discussion" className="mt-6 space-y-6">
              {/* Comment Input */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 animate-fade-in">
                <div className="flex space-x-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={JSON.parse(localStorage.getItem('user') || '{}').picture} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {JSON.parse(localStorage.getItem('user') || '{}').name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <form onSubmit={handleSubmitComment} className="flex-1">
                    <Textarea
                      ref={commentInputRef}
                      value={newComment}
                      onChange={handleTextareaChange}
                      placeholder="Share your thoughts..."
                      className="bg-transparent border-0 text-sm resize-none focus:ring-0 p-0 min-h-[60px] text-white placeholder-zinc-400"
                      rows={1}
                      disabled={!hasPermission}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center space-x-2 text-zinc-500">
                        <span className="text-xs">
                          {newComment.length}/280
                        </span>
                      </div>
                      <Button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting || !hasPermission}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9 px-6 rounded-full transition-all duration-200 hover:scale-105"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Post"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-1">
                {commentsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-16 animate-fade-in">
                    <MessageCircle className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-zinc-400 mb-2">
                      No discussions yet
                    </h3>
                    <p className="text-zinc-500 text-sm">
                      Be the first to start a conversation
                    </p>
                  </div>
                ) : (
                  <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800 overflow-hidden">
                    {comments.map((comment, index) => (
                      <CommentItem
                        key={comment._id}
                        comment={comment}
                        onLike={handleLikeComment}
                        onReply={handleReply}
                        onLikeReply={handleLikeReply}
                        onShare={handleShareComment}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Action Buttons for Mobile */}
        <FloatingActions
          onLike={handleLikeNote}
          onBookmark={handleBookmarkNote}
          onShare={handleShareNote}
          isLiked={data.userLiked}
          isBookmarked={data.userBookmarked}
          likes={data.likes}
        />
      </div>
    </>
  );
}