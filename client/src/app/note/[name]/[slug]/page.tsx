"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Download,
  ThumbsUp,
  Share2,
  Eye,
  MessageSquare,
  Home,
  ArrowLeft,
  Youtube,
  UserCheck,
  MoreVertical,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit
} from "lucide-react";
import api from "@/config/api";
import { LoaderX } from "@/components/LoaderX";
import { LoginDialog } from "@/components/LoginDialog";
import { useRouter } from "next/navigation";

// --- HELPERS ---
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("authToken");
  }
  return null;
};

// --- TYPES ---
interface UserProfile {
  _id: string;
  name: string;
  username: string;
  picture?: string;
}

interface Creator {
  _id: string;
  name: string;
  avatarUrl: string;
  username: string;
  isVerified: boolean;
  isFollowing: boolean;
}

interface PublicNoteData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  videoUrl?: string;
  createdAt: string;
  views: number;
  likes: number;
  isLiked: boolean;
  commentsCount: number;
  creator: Creator;
  pdf_data?: {
    fileName: string;
    viewLink: string;
    thumbnailLink?: string;
  } | null;
}

interface Reply {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    picture?: string;
    username?: string;
  };
  likes: number;
  userLiked: boolean;
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    picture?: string;
    username?: string;
  };
  likes: number;
  userLiked: boolean;
  replies: Reply[];
  createdAt: string;
}

// --- STYLES ---
const iphoneStyles = `
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
.mobile-safe-bottom { padding-bottom: calc(4rem + env(safe-area-inset-bottom)); }
.h-dvh-screen { height: 100dvh; }
`;

// --- COMPONENTS ---

const NoteContentView: React.FC<{ data: PublicNoteData }> = ({ data }) => {
  return (
    <div className="w-full h-full border border-neutral-800 shadow-2xl overflow-hidden rounded-lg bg-white relative group animate-scale-in flex flex-col">
      <div className="bg-neutral-900/95 p-3 border-b border-neutral-700 flex items-center justify-between shrink-0 text-white">
        <div className="flex items-center gap-3 overflow-hidden">
           <div className="relative w-8 h-10 rounded overflow-hidden border border-neutral-700 shrink-0 bg-neutral-800 flex items-center justify-center">
             {data.pdf_data?.thumbnailLink ? (
                <Image src={data.pdf_data.thumbnailLink} alt="PDF" fill className="object-cover" />
             ) : (
                <span className="text-xs font-serif text-neutral-400">Aa</span>
             )}
           </div>
           <div className="min-w-0">
             <h3 className="text-sm font-semibold truncate">{data.title}</h3>
             <p className="text-xs text-neutral-400">{new Date(data.createdAt).toLocaleDateString()}</p>
           </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {data.videoUrl && (
             <Button size="sm" variant="outline" className="h-8 border-red-900/50 bg-red-950/30 text-red-200 hover:bg-red-900/50" onClick={() => window.open(data.videoUrl, '_blank')}>
               <Youtube className="h-3 w-3 mr-1" /> Watch
             </Button>
          )}
          {data.pdf_data?.viewLink && (
            <Button size="sm" variant="secondary" className="h-8" onClick={() => window.open(data.pdf_data!.viewLink, '_blank')}>
              <Download className="h-3 w-3 mr-1" /> PDF
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white p-4 lg:p-8 custom-scrollbar">
        <div 
          dangerouslySetInnerHTML={{ __html: data.content }} 
          className="prose max-w-none text-black"
          style={{ fontFamily: "'Times New Roman', serif", fontSize: '16px', lineHeight: '1.6' }} 
        />
      </div>
    </div>
  );
};

const MobileBottomNav: React.FC<{
  activeTab: 'read' | 'discuss';
  setActiveTab: (tab: 'read' | 'discuss') => void;
  onHome: () => void;
  commentsCount: number;
}> = ({ activeTab, setActiveTab, onHome, commentsCount }) => (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 z-50 flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
    <button onClick={onHome} className="flex flex-col items-center justify-center w-16 h-full text-neutral-400 hover:text-white transition-colors">
      <Home className="h-5 w-5 mb-1" />
      <span className="text-[10px] font-medium">Home</span>
    </button>
    <button onClick={() => setActiveTab('read')} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'read' ? 'text-red-500' : 'text-neutral-400'}`}>
      <Eye className="h-5 w-5 mb-1" />
      <span className="text-[10px] font-medium">Read</span>
    </button>
    <button onClick={() => setActiveTab('discuss')} className={`flex flex-col items-center justify-center w-16 h-full transition-colors relative ${activeTab === 'discuss' ? 'text-red-500' : 'text-neutral-400'}`}>
      {commentsCount > 0 && <div className="absolute top-2 right-2 bg-neutral-800 text-white text-[9px] px-1 rounded-full border border-neutral-700">{commentsCount}</div>}
      <MessageSquare className="h-5 w-5 mb-1" />
      <span className="text-[10px] font-medium">Discuss</span>
    </button>
  </div>
);

// --- MAIN PAGE ---
export default function PublicNotePage({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const { slug, username } = use(params);
  const router = useRouter();
  
  // Data
  const [data, setData] = useState<PublicNoteData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [mobileView, setMobileView] = useState<'read' | 'discuss'>('read');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  
  // Interactions
  const [isLiking, setIsLiking] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  // Reply State
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // commentId
  const [replyInput, setReplyInput] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = iphoneStyles;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // --- FETCHING ---
  const fetchCurrentUser = useCallback(async () => {
    const token = getAuthToken();
    if (token) {
        try {
            const res = await api.get('/auth/get-profile', { headers: { 'Authorization': `Bearer ${token}` }});
            // FIXED: Access res.data.user instead of res.data.data based on your JSON response
            if (res.data.success && res.data.user) {
                setCurrentUser(res.data.user);
            }
        } catch (e) { console.log("Guest user"); }
    }
  }, []);

  const loadComments = useCallback(async (noteId: string) => {
    try {
      setCommentsLoading(true);
      const token = getAuthToken();
      const res = await api.get(`/notes/${noteId}/comments`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.data.success) {
        setComments(res.data.data.comments);
      }
    } catch (e) {
      console.error("Failed to load comments", e);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const loadNoteData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await api.get(`/notes/allw/${slug}`, { 
        headers: token ? { 'Authorization': `Bearer ${token}` } : {} 
      });

      if (res.data.success) {
        setData(res.data.data);
        fetchCurrentUser();
        loadComments(res.data.data._id);
      } else {
        toast.error("Note not found");
        router.push('/');
      }
    } catch (error: any) {
      if(error.response?.status === 404) router.push('/404');
    } finally {
      setLoading(false);
    }
  }, [slug, router, loadComments, fetchCurrentUser]);

  useEffect(() => { loadNoteData(); }, [loadNoteData]);

  // --- HANDLERS ---

  const handleNoteLike = async () => {
  if (!data) return;
  const token = getAuthToken();
  if (!token) { setShowLoginDialog(true); return; }

  try {
    setIsLiking(true);
    
    const response = await api.post(`/notes/like/${data._id}`, {}, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });

    // Only update UI if the like was successful
    if (response.data && response.data.success) {
      setData(prev => prev ? { ...prev, isLiked: !prev.isLiked, likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1 } : null);
    } else if (response.data && !response.data.success && response.data.message === "You have already liked this note") {
      toast.info("You have already liked this note");
    }

  } catch (err) {
    // Check if error response contains the "already liked" message
    if (err.response?.data?.message === "You have already liked this note") {
      toast.info("You have already liked this note");
    } else {
      toast.error("Failed to like");
    }
  } finally {
    setIsLiking(false);
  }
};

  const handleFollow = async () => {
    if (!data) return;
    const token = getAuthToken();
    if (!token) { setShowLoginDialog(true); return; }

    // Prevent self-follow
    if (currentUser && currentUser._id === data.creator._id) {
        toast.error("You cannot follow yourself");
        return;
    }

    try {
      setIsFollowLoading(true);
      const endpoint = data.creator.isFollowing ? `/users/${data.creator._id}/unfollow` : `/users/${data.creator._id}/follow`;
      setData(prev => prev ? { ...prev, creator: { ...prev.creator, isFollowing: !prev.creator.isFollowing } } : null);
      const res = await api.post(endpoint, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.data.success) toast.success(data.creator.isFollowing ? "Unfollowed" : "Followed");
    } catch (err: any) {
      setData(prev => prev ? { ...prev, creator: { ...prev.creator, isFollowing: !prev.creator.isFollowing } } : null);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handlePostComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim() || !data) return;
    const token = getAuthToken();
    if (!token) { setShowLoginDialog(true); return; }

    setIsPostingComment(true);
    try {
      const res = await api.post(`/notes/${data._id}/comments`, 
        { content: commentInput }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (res.data.success) {
        setComments(prev => [res.data.data.comment, ...prev]);
        setCommentInput("");
        setData(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
        toast.success("Comment posted");
      }
    } catch (e) {
      toast.error("Failed to post comment");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const token = getAuthToken();
    if (!token) return;

    if(!confirm("Are you sure you want to delete this comment?")) return;

    // Optimistic Delete
    const prevComments = [...comments];
    setComments(prev => prev.filter(c => c._id !== commentId));
    setData(prev => prev ? { ...prev, commentsCount: prev.commentsCount - 1 } : null);

    try {
        await api.delete(`/notes/comments/${commentId}`, { headers: { 'Authorization': `Bearer ${token}` }});
        toast.success("Comment deleted");
    } catch (e) {
        setComments(prevComments); // Revert
        setData(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
        toast.error("Failed to delete");
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    const token = getAuthToken();
    if (!token) return;

    if(!confirm("Are you sure you want to delete this reply?")) return;

    // Optimistic Delete
    const prevComments = [...comments];
    setComments(prev => prev.map(c => {
        if(c._id === commentId) {
            return { ...c, replies: c.replies.filter(r => r._id !== replyId) };
        }
        return c;
    }));

    try {
        await api.delete(`/notes/comments/${commentId}/replies/${replyId}`, { headers: { 'Authorization': `Bearer ${token}` }});
        toast.success("Reply deleted");
    } catch (e) {
        setComments(prevComments); // Revert
        toast.error("Failed to delete");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const token = getAuthToken();
    if (!token) { setShowLoginDialog(true); return; }

    setComments(prev => prev.map(c => {
      if (c._id === commentId) {
        return { ...c, isLiked: !c.userLiked, likes: c.userLiked ? c.likes - 1 : c.likes + 1, userLiked: !c.userLiked };
      }
      return c;
    }));

    try {
      await api.post(`/notes/comments/${commentId}/like`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!replyInput.trim()) return;
    const token = getAuthToken();
    if (!token) { setShowLoginDialog(true); return; }

    setIsPostingReply(true);
    try {
      const res = await api.post(`/notes/comments/${commentId}/replies`, 
        { content: replyInput },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (res.data.success) {
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            return { ...c, replies: [...c.replies, res.data.data.reply] };
          }
          return c;
        }));
        setExpandedReplies(prev => new Set(prev).add(commentId)); // Auto-expand
        setReplyInput("");
        setReplyingTo(null);
        toast.success("Reply posted");
      }
    } catch (e) {
      toast.error("Failed to reply");
    } finally {
      setIsPostingReply(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
        const next = new Set(prev);
        if (next.has(commentId)) next.delete(commentId);
        else next.add(commentId);
        return next;
    });
  };

  const handleLikeReply = async (commentId: string, replyId: string) => {
    const token = getAuthToken();
    if (!token) { setShowLoginDialog(true); return; }

    setComments(prev => prev.map(c => {
      if (c._id === commentId) {
        return {
          ...c,
          replies: c.replies.map(r => {
            if (r._id === replyId) {
              return { ...r, userLiked: !r.userLiked, likes: r.userLiked ? r.likes - 1 : r.likes + 1 };
            }
            return r;
          })
        };
      }
      return c;
    }));

    try {
      await api.post(`/notes/comments/${commentId}/replies/${replyId}/like`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        action();
    }
  };

  if (loading) return <LoaderX />;

  // Derived state to check if current user is the owner
  const isOwnNote = currentUser && data && currentUser._id === data.creator._id;

  return (
    <div className="h-dvh-screen w-screen bg-black flex flex-col overflow-hidden text-neutral-200 font-sans">
      <LoginDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} onSuccess={() => {setShowLoginDialog(false); loadNoteData();}} />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col h-full lg:flex-row">
        
        {/* Header (Mobile) */}
        <div className="lg:hidden shrink-0 h-14 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 flex items-center px-4 sticky top-0 z-40 justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-neutral-400 hover:text-white -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => navigator.share({ title: data?.title, url: window.location.href }).catch(()=>{})}>
                <Share2 className="h-5 w-5"/>
             </Button>
          </div>
        </div>

        {/* LEFT: CONTENT */}
        <div className={`flex-1 flex flex-col min-h-0 lg:border-r border-neutral-800 ${mobileView === 'discuss' ? 'hidden lg:flex' : 'flex'}`}>
           <div className="hidden lg:flex p-3 border-b border-neutral-800 gap-2 items-center justify-between bg-neutral-900/50">
              <div className="flex gap-2 items-center">
                 <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-neutral-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4 mr-1"/> Back
                 </Button>
                 <span className="text-neutral-600">/</span>
                 <span className="text-sm font-medium text-neutral-300">@{username}</span>
              </div>
              <div className="flex gap-2">
                 <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}>
                    <Share2 className="h-4 w-4 mr-2"/> Share
                 </Button>
              </div>
           </div>
           <div className="flex-1 overflow-hidden relative mobile-safe-bottom bg-neutral-950">
              <div className="absolute inset-0 p-0 lg:p-6 overflow-hidden">
                <div className="h-full w-full max-w-4xl mx-auto flex flex-col">
                  {data && <NoteContentView data={data} />}
                </div>
              </div>
           </div>
        </div>

        {/* RIGHT: COMMUNITY */}
        <div className={`flex-1 lg:flex-[0_0_400px] xl:flex-[0_0_450px] bg-neutral-900/50 flex flex-col min-h-0 ${mobileView === 'discuss' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Creator & Stats */}
          <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur shrink-0">
             {data && (
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Link href={`/${data.creator.username}/profile`}>
                             <Avatar className="h-10 w-10 border border-neutral-700 cursor-pointer hover:opacity-80 transition">
                                <AvatarImage src={data.creator.avatarUrl} />
                                <AvatarFallback className="bg-red-900 text-red-200">{data.creator.name[0]}</AvatarFallback>
                             </Avatar>
                         </Link>
                         <div>
                            <Link href={`/${data.creator.username}/profile`} className="text-sm font-bold text-white hover:underline flex items-center gap-1">
                                {data.creator.name}
                                {data.creator.isVerified && <UserCheck className="h-3 w-3 text-blue-400" />}
                            </Link>
                            <p className="text-xs text-neutral-400">@{data.creator.username}</p>
                         </div>
                      </div>
                      
                      {/* CONDITIONAL BUTTON: Edit Profile OR Follow */}
                      {isOwnNote ? (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => router.push('/profile')} 
                            className="rounded-full px-4 h-9 font-medium bg-neutral-800 text-white hover:bg-neutral-700 transition-all border border-neutral-700"
                          >
                             <Edit className="h-3.5 w-3.5 mr-2" />
                             Edit Profile
                          </Button>
                      ) : (
                          <Button 
                            size="sm" 
                            variant={data.creator.isFollowing ? "secondary" : "default"} 
                            onClick={handleFollow} 
                            disabled={isFollowLoading} 
                            className={`rounded-full px-4 h-9 font-medium transition-all ${
                                data.creator.isFollowing 
                                ? "bg-neutral-800 text-white hover:bg-neutral-700" 
                                : "bg-white text-black hover:bg-neutral-200"
                            }`}
                          >
                             {data.creator.isFollowing ? "Following" : "Follow"}
                          </Button>
                      )}

                   </div>
                   <div className="flex items-center justify-between bg-neutral-900/50 rounded-xl p-2 px-4 border border-neutral-800/50">
                      <div className="text-xs text-neutral-400 flex items-center gap-2">
                         <span className="text-white font-semibold">{data.views}</span> views
                         <span className="w-1 h-1 bg-neutral-600 rounded-full"/>
                         <span>{new Date(data.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleNoteLike} className={`h-8 rounded-full flex gap-2 items-center hover:bg-neutral-800 ${data.isLiked ? "text-red-500" : "text-white"}`}>
                         <ThumbsUp className={`h-4 w-4 ${data.isLiked ? "fill-current" : ""}`} />
                         <span className="text-xs font-semibold">{data.likes}</span>
                      </Button>
                   </div>
                </div>
             )}
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-neutral-950/30">
             <div className="p-4 pb-2 flex items-center gap-2 sticky top-0 bg-neutral-950/90 backdrop-blur z-10">
                <h3 className="font-bold text-white">Comments</h3>
                <div className="flex-1"/>
             </div>

             <div className="p-4 space-y-6">
                {commentsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-neutral-500" /></div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Be the first to comment.</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="animate-fade-in-up">
                            {/* Parent Comment */}
                            <div className="flex gap-3 group relative">
                                <Link href={comment.user.username ? `/${comment.user.username}/profile` : "#"}>
                                    <Avatar className="h-8 w-8 mt-1 border border-neutral-800 cursor-pointer hover:opacity-80">
                                        <AvatarImage src={comment.user.picture || ""} />
                                        <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <div className="flex items-center gap-2">
                                            <Link href={comment.user.username ? `/${comment.user.username}/profile` : "#"}>
                                                <span className="text-xs font-semibold text-white hover:underline cursor-pointer">@{comment.user.name}</span>
                                            </Link>
                                            <span className="text-[10px] text-neutral-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {currentUser && currentUser._id === comment.user._id && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteComment(comment._id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-300 leading-relaxed">{comment.content}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <button onClick={() => handleLikeComment(comment._id)} className={`flex items-center gap-1 hover:text-white transition-colors ${comment.userLiked ? 'text-red-500' : 'text-neutral-500'}`}>
                                            <ThumbsUp className={`h-3 w-3 ${comment.userLiked ? 'fill-current' : ''}`} />
                                            <span className="text-xs">{comment.likes || ""}</span>
                                        </button>
                                        <button onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)} className="text-xs text-neutral-500 hover:text-white font-medium">Reply</button>
                                        
                                        {/* Reply Count Toggle */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <button 
                                                onClick={() => toggleReplies(comment._id)}
                                                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium ml-2 bg-blue-500/10 px-2 py-0.5 rounded-full"
                                            >
                                                {expandedReplies.has(comment._id) ? (
                                                    <><ChevronUp className="h-3 w-3"/> Close</>
                                                ) : (
                                                    <><ChevronDown className="h-3 w-3"/> {comment.replies.length} replies</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Reply Input */}
                                    {replyingTo === comment._id && (
                                       <div className="mt-3 flex gap-2 animate-fade-in-up">
                                          <Input 
                                            autoFocus
                                            value={replyInput}
                                            onKeyDown={(e) => handleKeyDown(e, () => handlePostReply(comment._id))}
                                            onChange={(e) => setReplyInput(e.target.value)}
                                            placeholder="Write a reply..."
                                            className="h-8 text-xs bg-neutral-900 border-neutral-700 text-white"
                                          />
                                          <Button size="sm" className="h-8 text-xs bg-white text-black hover:bg-neutral-200" onClick={() => handlePostReply(comment._id)} disabled={isPostingReply}>
                                            {isPostingReply ? "..." : "Reply"}
                                          </Button>
                                       </div>
                                    )}

                                    {/* Replies List (Conditional Render) */}
                                    {expandedReplies.has(comment._id) && comment.replies && comment.replies.length > 0 && (
                                       <div className="mt-3 pl-2 space-y-3">
                                          {comment.replies.map(reply => (
                                             <div key={reply._id} className="flex gap-3 relative group/reply animate-fade-in-up">
                                                {/* Connecting Line */}
                                                <div className="absolute -left-2 top-0 bottom-0 w-px bg-neutral-800" />
                                                <div className="absolute -left-2 top-3 w-2 h-px bg-neutral-800" />
                                                
                                                <Link href={reply.user.username ? `/${reply.user.username}/profile` : "#"}>
                                                    <Avatar className="h-6 w-6 mt-1 border border-neutral-800 cursor-pointer hover:opacity-80">
                                                       <AvatarImage src={reply.user.picture || ""} />
                                                       <AvatarFallback>{reply.user.name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                </Link>
                                                <div className="flex-1">
                                                   <div className="flex items-center justify-between mb-0.5">
                                                      <div className="flex items-center gap-2">
                                                          <Link href={reply.user.username ? `/${reply.user.username}/profile` : "#"}>
                                                              <span className="text-xs font-semibold text-neutral-300 hover:underline cursor-pointer">@{reply.user.name}</span>
                                                          </Link>
                                                          <span className="text-[10px] text-neutral-600">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                      </div>
                                                      {currentUser && currentUser._id === reply.user._id && (
                                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-neutral-600 hover:text-red-500 opacity-0 group-hover/reply:opacity-100 transition-opacity" onClick={() => handleDeleteReply(comment._id, reply._id)}>
                                                            <Trash2 className="h-2.5 w-2.5" />
                                                        </Button>
                                                      )}
                                                   </div>
                                                   <p className="text-xs text-neutral-400 leading-relaxed">{reply.content}</p>
                                                   <div className="flex items-center gap-4 mt-1.5">
                                                      <button onClick={() => handleLikeReply(comment._id, reply._id)} className={`flex items-center gap-1 hover:text-white transition-colors ${reply.userLiked ? 'text-red-500' : 'text-neutral-500'}`}>
                                                         <ThumbsUp className={`h-2.5 w-2.5 ${reply.userLiked ? 'fill-current' : ''}`} />
                                                         <span className="text-[10px]">{reply.likes || ""}</span>
                                                      </button>
                                                   </div>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>

          {/* Comment Input */}
          <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur shrink-0 mb-16 lg:mb-0">
             <form onSubmit={handlePostComment} className="flex gap-3 items-start">
                 <Avatar className="h-8 w-8 mt-1 hidden sm:block">
                     <AvatarFallback className="bg-neutral-800 text-neutral-400">Me</AvatarFallback>
                 </Avatar>
                 <div className="flex-1 relative">
                    <Input 
                        value={commentInput}
                        onKeyDown={(e) => handleKeyDown(e, () => handlePostComment())}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Add a public comment..."
                        className="bg-neutral-900 border-b border-neutral-700 border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:border-white px-0 text-sm text-white min-h-[40px]"
                    />
                    <div className="flex justify-end mt-2 gap-2">
                        {commentInput && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => setCommentInput("")} className="text-neutral-400 hover:text-white h-8">
                                Cancel
                            </Button>
                        )}
                         <Button type="submit" size="sm" disabled={!commentInput.trim() || isPostingComment} className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-full h-8 px-4 text-xs font-medium">
                            {isPostingComment ? "..." : "Comment"}
                        </Button>
                    </div>
                 </div>
             </form>
          </div>

        </div>
      </div>

      <MobileBottomNav activeTab={mobileView} setActiveTab={setMobileView} onHome={() => router.push('/')} commentsCount={data?.commentsCount || 0} />
    </div>
  );
}