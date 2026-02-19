"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Trash2,
  Edit,
  Reply,
  User,
  Mail,
  Calendar,
  Clock,
  Heart,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Download,
  Activity,
  BarChart3,
  Globe,
  Lock,
  EyeOff,
  UserCircle,
  BookOpen,
  Tag,
  AtSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types based on the API response
interface UserDetails {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  username?: string;
  membership?: {
    isActive: boolean;
    planName?: string;
  };
  tokens?: number;
  joinedAt?: string;
}

interface NoteDetails {
  _id: string;
  title: string;
  slug: string;
  owner?: string;
  views?: number;
  visibility?: string;
  thumbnail?: string;
}

interface Reply {
  _id: string;
  content: string;
  user: string | { _id: string; name: string; email: string; picture?: string };
  likes: number;
  userLiked: string[];
  isAiResponse: boolean;
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  user: string; // User ID as string
  note: string; // Note ID as string
  likes: number;
  userLiked: string[];
  isAiResponse: boolean;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  userDetails: UserDetails; // Populated user details
  noteDetails: NoteDetails; // Populated note details
  replyUsers?: any[]; // For reply user details if needed
}

interface Stats {
  totalComments: number;
  totalReplies: number;
  aiComments: number;
  totalLikes: number;
  recentActivity: number;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedReply, setSelectedReply] = useState<{ commentId: string; reply: Reply } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(filterType !== 'all' && { isAiResponse: filterType === 'ai' ? 'true' : 'false' })
      });

      const response = await api.get(`/admin/comments?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setComments(response.data.data.comments);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [sortBy, filterType]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComments();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    setRefreshing(false);
    toast.success("Comments synced");
  };

  const handleUpdateComment = async () => {
    if (!selectedComment || !editContent.trim()) return;

    try {
      const response = await api.patch(
        `/admin/comments/${selectedComment._id}`,
        { content: editContent.trim() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Comment updated successfully");
        fetchComments();
        setShowEditModal(false);
        setSelectedComment(null);
        setEditContent("");
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error("Failed to update comment");
    }
  };

  const handleUpdateReply = async () => {
    if (!selectedReply || !editContent.trim()) return;

    try {
      const response = await api.patch(
        `/admin/comments/${selectedReply.commentId}/replies/${selectedReply.reply._id}`,
        { content: editContent.trim() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Reply updated successfully");
        fetchComments();
        setShowReplyModal(false);
        setSelectedReply(null);
        setEditContent("");
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error("Failed to update reply");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment and all its replies?")) return;

    try {
      const response = await api.delete(`/admin/comments/${commentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Comment deleted successfully");
        fetchComments();
        // Remove from selected if present
        setSelectedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment");
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    try {
      const response = await api.delete(`/admin/comments/${commentId}/replies/${replyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Reply deleted successfully");
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error("Failed to delete reply");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedComments.size === 0) return;

    try {
      const response = await api.post(
        '/admin/comments/bulk-delete',
        { commentIds: Array.from(selectedComments) },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Deleted ${response.data.data.deletedCount} comments`);
        setSelectedComments(new Set());
        setShowBulkDeleteModal(false);
        fetchComments();
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error("Failed to delete comments");
    }
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const selectAllComments = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(comments.map(c => c._id)));
    }
  };

  const getVisibilityIcon = (visibility?: string) => {
    switch(visibility) {
      case 'public': return <Globe size={12} className="text-emerald-500" />;
      case 'private': return <Lock size={12} className="text-red-500" />;
      case 'unlisted': return <EyeOff size={12} className="text-orange-500" />;
      default: return <Globe size={12} className="text-neutral-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
            <MessageSquare className="text-red-600" />
            Comment_<span className="text-red-600">Moderation</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mt-2">
            Manage all user comments and replies
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-black border border-white/5 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === 'list' ? "bg-red-600 text-white" : "text-neutral-500 hover:text-white"
              )}
            >
              <MessageSquare size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === 'grid' ? "bg-red-600 text-white" : "text-neutral-500 hover:text-white"
              )}
            >
              <BarChart3 size={16} />
            </button>
          </div>

          {selectedComments.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600/20 text-red-500 border border-red-600/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600/30 transition-all"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedComments.size})
            </button>
          )}
          
          <button
            onClick={handleRefresh}
            className={cn(
              "flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              refreshing ? "opacity-50" : "hover:text-white hover:border-red-600/50"
            )}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={cn(refreshing && "animate-spin")} />
            {refreshing ? "Syncing..." : "Sync Data"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Comments"
            value={stats.totalComments}
            icon={MessageSquare}
            color="text-blue-500"
          />
          <StatCard
            label="Total Replies"
            value={stats.totalReplies}
            icon={Reply}
            color="text-purple-500"
          />
          <StatCard
            label="AI Comments"
            value={stats.aiComments}
            icon={Activity}
            color="text-emerald-500"
          />
          <StatCard
            label="Total Likes"
            value={stats.totalLikes}
            icon={Heart}
            color="text-red-500"
          />
          <StatCard
            label="24h Activity"
            value={stats.recentActivity}
            icon={Clock}
            color="text-orange-500"
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
          <input
            type="text"
            placeholder="Search comments and replies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/5 h-14 pl-12 pr-4 rounded-2xl text-[10px] font-medium tracking-wider text-white placeholder:text-neutral-700 focus:border-red-600/50 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black border border-white/5 h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:border-red-600/50 focus:outline-none"
          >
            <option value="all">All Comments</option>
            <option value="user">User Comments</option>
            <option value="ai">AI Responses</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-black border border-white/5 h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:border-red-600/50 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_liked">Most Liked</option>
            <option value="most_replies">Most Replies</option>
          </select>
        </div>
      </div>

      {/* Select All Bar */}
      {comments.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedComments.size === comments.length}
              onChange={selectAllComments}
              className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-red-600"
            />
            <span className="text-[10px] font-medium text-neutral-400">
              {selectedComments.size === 0 
                ? `Select all ${comments.length} comments` 
                : `Selected ${selectedComments.size} of ${comments.length} comments`}
            </span>
          </div>
          {selectedComments.size > 0 && (
            <button
              onClick={() => setSelectedComments(new Set())}
              className="text-[8px] font-black text-neutral-600 hover:text-white uppercase tracking-wider"
            >
              Clear Selection
            </button>
          )}
        </div>
      )}

      {/* Comments List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden">
          <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-neutral-600" />
              <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wider">
                Comment Registry ({comments.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-neutral-700">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
              <p className="text-sm font-medium text-neutral-500">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-20 text-center">
              <MessageSquare size={40} className="text-neutral-700 mx-auto mb-4" />
              <p className="text-sm font-medium text-neutral-500">No comments found</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {comments.map((comment) => (
                <CommentListItem
                  key={comment._id}
                  comment={comment}
                  selectedComments={selectedComments}
                  expandedComments={expandedComments}
                  onToggleSelect={toggleCommentSelection}
                  onToggleExpand={toggleCommentExpansion}
                  onEdit={(comment) => {
                    setSelectedComment(comment);
                    setEditContent(comment.content);
                    setShowEditModal(true);
                  }}
                  onDelete={handleDeleteComment}
                  onEditReply={(commentId, reply) => {
                    setSelectedReply({ commentId, reply });
                    setEditContent(reply.content);
                    setShowReplyModal(true);
                  }}
                  onDeleteReply={handleDeleteReply}
                  getVisibilityIcon={getVisibilityIcon}
                  getInitials={getInitials}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
              <p className="text-sm font-medium text-neutral-500">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="col-span-full p-20 text-center">
              <MessageSquare size={40} className="text-neutral-700 mx-auto mb-4" />
              <p className="text-sm font-medium text-neutral-500">No comments found</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentGridItem
                key={comment._id}
                comment={comment}
                onEdit={(comment) => {
                  setSelectedComment(comment);
                  setEditContent(comment.content);
                  setShowEditModal(true);
                }}
                onDelete={handleDeleteComment}
                getInitials={getInitials}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      )}

      {/* Edit Comment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic flex items-center gap-2">
              <Edit className="text-red-600" />
              Edit_Comment
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-[10px] font-mono">
              Comment ID: {selectedComment?._id.slice(-8)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <textarea
              rows={6}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit comment content..."
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-medium resize-none focus:border-red-600/50 focus:outline-none text-white"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateComment}
              disabled={!editContent.trim()}
              className={cn(
                "flex-1 p-4 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                editContent.trim()
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-600/50 text-white/50 cursor-not-allowed"
              )}
            >
              Update Comment
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic flex items-center gap-2">
              <Reply className="text-red-600" />
              Edit_Reply
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-[10px] font-mono">
              Reply ID: {selectedReply?.reply._id.slice(-8)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit reply content..."
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-medium resize-none focus:border-red-600/50 focus:outline-none text-white"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setShowReplyModal(false)}
              className="flex-1 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateReply}
              disabled={!editContent.trim()}
              className={cn(
                "flex-1 p-4 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                editContent.trim()
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-600/50 text-white/50 cursor-not-allowed"
              )}
            >
              Update Reply
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic flex items-center gap-2">
              <AlertCircle className="text-red-600" />
              Confirm Bulk Delete
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-neutral-400">
              Are you sure you want to delete {selectedComments.size} selected comments? 
              This action cannot be undone and will also delete all associated replies.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setShowBulkDeleteModal(false)}
              className="flex-1 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex-1 p-4 bg-red-600 hover:bg-red-700 rounded-xl text-[9px] font-black uppercase tracking-wider"
            >
              Delete All
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// List View Item Component
function CommentListItem({ 
  comment, 
  selectedComments, 
  expandedComments,
  onToggleSelect,
  onToggleExpand,
  onEdit,
  onDelete,
  onEditReply,
  onDeleteReply,
  getVisibilityIcon,
  getInitials,
  formatDate 
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Checkbox for bulk actions */}
        <div className="pt-2">
          <input
            type="checkbox"
            checked={selectedComments.has(comment._id)}
            onChange={() => onToggleSelect(comment._id)}
            className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-red-600"
          />
        </div>

        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 overflow-hidden">
            {comment.userDetails?.picture ? (
              <img src={comment.userDetails.picture} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white font-black">
                {comment.userDetails?.name ? getInitials(comment.userDetails.name) : '?'}
              </div>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 space-y-3">
          {/* User Info and Badges */}
          <div className="flex items-center flex-wrap gap-3">
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider">
                {comment.userDetails?.name || 'Unknown User'}
              </p>
              <p className="text-[8px] text-neutral-500 flex items-center gap-1">
                <Mail size={8} />
                {comment.userDetails?.email || 'No email'}
              </p>
            </div>

            {comment.isAiResponse && (
              <div className="px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-[7px] font-black uppercase tracking-wider">
                AI Response
              </div>
            )}

            {comment.userDetails?.membership?.isActive && (
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[7px] font-black uppercase tracking-wider">
                {comment.userDetails.membership.planName || 'Premium'}
              </div>
            )}

            <div className="flex items-center gap-1 text-[8px] text-neutral-600">
              <Calendar size={8} />
              {formatDate(comment.createdAt)}
            </div>
          </div>

          {/* Comment Text */}
          <p className="text-sm text-white/90 bg-white/5 p-4 rounded-xl border border-white/5">
            {comment.content}
          </p>

          {/* Note Info */}
          {comment.noteDetails && (
            <div className="flex items-center gap-3 text-[8px] text-neutral-600 bg-white/[0.02] p-2 rounded-lg flex-wrap">
              {getVisibilityIcon(comment.noteDetails.visibility)}
              <span className="font-mono">Note:</span>
              <span className="text-white max-w-[200px] truncate">{comment.noteDetails.title}</span>
              <span className="text-neutral-700">|</span>
              <Eye size={8} />
              <span>{comment.noteDetails.views || 0}</span>
              <Heart size={8} className="ml-1" />
              <span>{comment.likes}</span>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-[8px] text-neutral-600">
            <span className="flex items-center gap-1">
              <Heart size={8} className="text-red-500" />
              {comment.likes} likes
            </span>
            <span className="flex items-center gap-1">
              <Reply size={8} className="text-blue-500" />
              {comment.replyCount} replies
            </span>
            {comment.userDetails?.tokens !== undefined && (
              <span className="flex items-center gap-1">
                <AtSign size={8} className="text-orange-500" />
                {comment.userDetails.tokens} tokens
              </span>
            )}
          </div>

          {/* Replies Section */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => onToggleExpand(comment._id)}
                className="flex items-center gap-2 text-[8px] font-black text-neutral-500 hover:text-white transition-colors mb-2"
              >
                {expandedComments.has(comment._id) ? (
                  <ChevronUp size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
                {comment.replies.length} Replies
              </button>

              <AnimatePresence>
                {expandedComments.has(comment._id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pl-6 border-l-2 border-white/5"
                  >
                    {comment.replies.map((reply: any) => (
                      <div key={reply._id} className="bg-white/[0.02] p-4 rounded-xl relative group">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-purple-600 overflow-hidden flex-shrink-0">
                            {reply.user?.picture ? (
                              <img src={reply.user.picture} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-white text-[10px] font-black">
                                {reply.user?.name ? getInitials(reply.user.name) : '?'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black text-white">
                                {reply.user?.name || 'Unknown User'}
                              </span>
                              {reply.isAiResponse && (
                                <span className="text-[6px] font-black bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded">
                                  AI
                                </span>
                              )}
                              <span className="text-[7px] text-neutral-600">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-white/80">{reply.content}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-[7px] text-neutral-600">
                                <Heart size={7} />
                                {reply.likes}
                              </span>
                            </div>
                          </div>

                          {/* Reply Actions */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditReply(comment._id, reply)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
                              title="Edit Reply"
                            >
                              <Edit size={10} />
                            </button>
                            <button
                              onClick={() => onDeleteReply(comment._id, reply._id)}
                              className="p-1.5 bg-red-600/10 hover:bg-red-600/20 rounded-lg text-red-500 transition-colors"
                              title="Delete Reply"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Comment Actions */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(comment)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
            title="Edit Comment"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(comment._id)}
            className="p-2 bg-red-600/10 hover:bg-red-600/20 rounded-lg text-red-500 transition-colors"
            title="Delete Comment"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Grid View Item Component
function CommentGridItem({ comment, onEdit, onDelete, getInitials, formatDate }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-red-600/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 overflow-hidden">
            {comment.userDetails?.picture ? (
              <img src={comment.userDetails.picture} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white font-black">
                {comment.userDetails?.name ? getInitials(comment.userDetails.name) : '?'}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-wider">
              {comment.userDetails?.name || 'Unknown'}
            </p>
            <p className="text-[8px] text-neutral-500 mt-1">
              {formatDate(comment.createdAt)}
            </p>
          </div>
        </div>
        
        {comment.isAiResponse && (
          <div className="px-2 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-[6px] font-black">
            AI
          </div>
        )}
      </div>

      {/* Comment Content */}
      <p className="text-sm text-white/80 mb-4 line-clamp-3">
        {comment.content}
      </p>

      {/* Note Info */}
      {comment.noteDetails && (
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 text-[7px] text-neutral-600 mb-1">
            <BookOpen size={10} />
            <span>Note:</span>
          </div>
          <p className="text-[9px] text-white truncate">{comment.noteDetails.title}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-[8px] text-neutral-600 mb-4">
        <span className="flex items-center gap-1">
          <Heart size={10} className="text-red-500" />
          {comment.likes}
        </span>
        <span className="flex items-center gap-1">
          <Reply size={10} className="text-blue-500" />
          {comment.replyCount}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={10} />
          {comment.noteDetails?.views || 0}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(comment)}
          className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(comment._id)}
          className="flex-1 py-2 bg-red-600/10 hover:bg-red-600/20 rounded-xl text-[8px] font-black uppercase tracking-wider text-red-500 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color, suffix = "" }: any) {
  return (
    <div className="bg-black border border-white/5 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{label}</p>
        <Icon size={14} className={color} />
      </div>
      <p className="text-2xl font-black text-white">
        {value}{suffix}
      </p>
    </div>
  );
}