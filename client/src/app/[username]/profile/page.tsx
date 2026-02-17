"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye, FileText, Share2, MoreHorizontal, ArrowLeft, Grid3x3, List, Zap, Loader2,
  ShieldAlert, Home, Edit3, Crown, Calendar, MapPin, UserX, Clock, X, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/Footer";

// --- MAIN COMPONENT ---
export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<{ status: boolean; message: string }>({ status: false, message: "" });
  const [user, setUser] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);

  const getAuthToken = useCallback(() => typeof window !== 'undefined' ? localStorage.getItem("authToken") : null, []);

  const isOwnProfile = useMemo(() => {
    if (!currentUser || !user) return false;
    return (currentUser._id === user._id) || (currentUser.username === user.username);
  }, [currentUser, user]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      try {
        setLoading(true);
        const res = await api.get(`/users/${username}/profile`);
        if (!res.data.success || !res.data.user) {
          setErrorState({ status: true, message: res.data.message || "User not found." });
          return;
        }
        setUser(res.data.user);
        setNotes(res.data.notes || []);
        setStats(res.data.stats);
      } catch (err: any) {
        setErrorState({ status: true, message: "Unable to load profile data." });
      } finally { setLoading(false); }
    };
    loadProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication Required", {
        description: "Please login to follow creators.",
        action: { label: "Login", onClick: () => router.push('/login') },
      });
      return;
    }

    try {
      setFollowLoading(true);
      const res = await api.post(`/users/${user._id}/follow`, {}, { headers: { 'Auth': token } });

      if (res.data.success) {
        setUser((prev: any) => ({
          ...prev,
          isFollowing: res.data.isFollowing,
          followersCount: res.data.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1
        }));
        toast.success(res.data.isFollowing ? `Following ${user.name}` : `Unfollowed ${user.name}`);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (errorState.status) return <ErrorScreen message={errorState.message} router={router} />;

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-red-500/20 selection:text-red-200">
      
      {/* Report Modal Integration */}
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        userId={user?._id}
        userName={user?.name}
      />

      {/* --- Navbar --- */}
      <header className="sticky top-0 z-50 bg-black backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-neutral-400 hover:text-white -ml-2">
            <ArrowLeft size={18} className="mr-2" /> Back
          </Button>
          
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Profile link copied");
             }} className="text-neutral-400 hover:text-white"><Share2 size={18}/></Button>
             
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><MoreHorizontal size={18}/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-200">
                   <DropdownMenuItem 
                      onClick={() => setIsReportOpen(true)}
                      className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                    >
                      Report User
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- LEFT: Sidebar / Profile Info --- */}
          <aside className="lg:w-1/3 xl:w-1/4 flex-shrink-0 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Profile Image Group */}
              <div className="relative inline-block mb-4">
                 <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-blue-500/20 rounded-full blur-2xl opacity-50" />
                 <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-neutral-950 shadow-2xl bg-neutral-900">
                    <AvatarImage src={user?.picture} className="object-cover" />
                    <AvatarFallback className="bg-neutral-800 text-neutral-400 text-3xl font-medium">{user?.name?.[0]}</AvatarFallback>
                 </Avatar>
                 {user?.isPremium && (
                    <div className="absolute bottom-2 right-2 bg-neutral-950 p-1.5 rounded-full border border-neutral-800" title="Premium Member">
                       <Crown size={16} className="text-amber-500 fill-amber-500" />
                    </div>
                 )}
              </div>

              {/* User Details */}
              <div className="space-y-3">
                 <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{user?.name}</h1>
                    <p className="text-neutral-500 font-medium text-sm">@{user?.username}</p>
                 </div>

                 {/* Meta Data */}
                 <div className="flex flex-wrap gap-4 text-xs text-neutral-500 pt-2">
                    <div className="flex items-center gap-1.5">
                       <Calendar size={14} />
                       <span>Joined {new Date(user?.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}</span>
                    </div>
                    {user?.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span>{user.location}</span>
                      </div>
                    )}
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex gap-3">
                 {isOwnProfile ? (
                    <Button 
                       onClick={() => router.push('/profile')} 
                       variant="outline"
                       className="w-full h-10 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-200"
                    >
                       <Edit3 size={14} className="mr-2" /> Edit Profile
                    </Button>
                 ) : (
                    <Button 
                       onClick={handleFollowToggle} 
                       disabled={followLoading}
                       className={cn(
                          "w-full h-10 font-medium transition-all",
                          user?.isFollowing 
                             ? "bg-neutral-800 text-white hover:bg-red-900/20 hover:text-red-500 hover:border-red-500/20 border border-transparent" 
                             : "bg-white text-black hover:bg-neutral-200"
                       )}
                    >
                       {followLoading ? <Loader2 className="animate-spin" size={16} /> : 
                        user?.isFollowing ? "Following" : "Follow"}
                    </Button>
                 )}
              </div>

              {/* Quick Stats (Sidebar) */}
              <div className="grid grid-cols-3 gap-2 py-6 border-b border-neutral-900 lg:border-none">
                 <StatItem label="Notes" value={stats?.totalNotes || 0} />
                 <StatItem label="Followers" value={user?.followersCount || 0} />
                 <StatItem label="Views" value={stats?.totalViews || 0} />
              </div>
            </motion.div>
          </aside>

          {/* --- RIGHT: Content Area --- */}
          <div className="flex-1 min-w-0">
              
             {/* Main Tabs */}
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                   
                   <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 self-end sm:self-auto">
                      <Button onClick={() => setViewMode('grid')} variant="ghost" size="icon" className={cn("h-8 w-8 rounded-md hover:bg-neutral-800", viewMode === 'grid' && "bg-neutral-800 text-white shadow-sm")}><Grid3x3 size={16}/></Button>
                      <Button onClick={() => setViewMode('list')} variant="ghost" size="icon" className={cn("h-8 w-8 rounded-md hover:bg-neutral-800", viewMode === 'list' && "bg-neutral-800 text-white shadow-sm")}><List size={16}/></Button>
                   </div>
                </div>

                <TabsContent value={activeTab} className="mt-0">
                   <AnimatePresence mode="wait">
                      {notes.length === 0 ? (
                          <motion.div 
                             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                             className="flex flex-col items-center justify-center py-24 text-neutral-600 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20"
                          >
                             <FileText size={48} className="mb-4 opacity-50" />
                             <p className="text-sm font-medium">No notes published yet.</p>
                          </motion.div>
                      ) : (
                          <div className={cn("grid gap-4 md:gap-6", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                             {notes.map((note, i) => (
                                <NoteCard key={note._id} note={note} index={i} viewMode={viewMode} username={username} router={router} />
                             ))}
                          </div>
                      )}
                   </AnimatePresence>
                </TabsContent>
             </Tabs>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

// 1. REPORT MODAL COMPONENT (New)
const ReportModal = ({ isOpen, onClose, userId, userName }: any) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      
      const res = await api.post(`/users/${userId}/report`, {
        reason,
        description
      }, { headers: { 'Auth': token } });

      if (res.data.success) {
        toast.success("Report submitted", { description: "We will review your report shortly." });
        onClose();
        setReason("");
        setDescription("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-500">
             <AlertTriangle size={20} />
             <h3 className="font-bold text-lg text-white">Report User</h3>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-neutral-400 mb-6">
          You are reporting <span className="text-white font-medium">{userName}</span>. This action is anonymous.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500 uppercase">Reason</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="" disabled>Select a reason...</option>
              <option value="spam">Spam or Bot</option>
              <option value="harassment">Harassment or Bullying</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="impersonation">Impersonation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500 uppercase">Description (Optional)</label>
            <textarea 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-500 min-h-[100px] resize-none"
              placeholder="Please provide more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="ghost" onClick={onClose} className="flex-1 hover:bg-neutral-800 text-neutral-400">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Submit Report"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string, value: number | string }) => (
   <div className="text-center p-3 rounded-xl bg-neutral-900/30 border border-white/5">
      <p className="text-lg font-bold text-white tracking-tight">{Number(value).toLocaleString()}</p>
      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{label}</p>
   </div>
);

const NoteCard = ({ note, index, viewMode, username, router }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    onClick={() => router.push(`/note/${username}/${note.slug}`)}
    className={cn(
      "group relative overflow-hidden bg-neutral-900/40 border border-white/5 rounded-2xl cursor-pointer hover:bg-neutral-900 hover:border-white/10 transition-all duration-300",
      viewMode === 'list' ? "flex flex-row items-stretch h-32" : "flex flex-col"
    )}
  >
    <div className={cn("relative overflow-hidden bg-neutral-800 shrink-0", viewMode === 'list' ? "w-48" : "aspect-[16/9]")}>
       {note.thumbnail ? (
          <img src={note.thumbnail} alt={note.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
       ) : (
          <div className="h-full w-full flex items-center justify-center bg-neutral-800"><Zap size={24} className="text-neutral-700"/></div>
       )}
       
       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
       
       {note.isPremium && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
             <Crown size={12} className="text-amber-400" />
          </div>
       )}
    </div>

    <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
       <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-white leading-tight line-clamp-2 transition-colors">
             {note.title}
          </h3>
          <p className="text-xs text-neutral-500 line-clamp-1">{note.excerpt || "No description provided."}</p>
       </div>
       
       <div className="flex items-center justify-between pt-4 mt-auto">
          <div className="flex items-center gap-3 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
             <span className="flex items-center gap-1"><Clock size={12}/> {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
             <span className="flex items-center gap-1"><Eye size={12}/> {note.views || 0}</span>
          </div>
       </div>
    </div>
  </motion.div>
);

const ErrorScreen = ({ message, router }: { message: string; router: any }) => {
  const isNotFound = message?.toLowerCase().includes("found");

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className={cn(
          "p-6 rounded-3xl mb-8 border backdrop-blur-sm",
          isNotFound 
            ? "bg-neutral-900/50 border-white/5 text-neutral-400" 
            : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {isNotFound ? (
             <UserX size={64} strokeWidth={1} /> 
          ) : (
             <ShieldAlert size={64} strokeWidth={1} />
          )}
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          {isNotFound ? "User Not Found" : "User Not Found"}
        </h2>
        
        <p className="text-neutral-500 max-w-sm mb-10 text-base leading-relaxed">
          {isNotFound 
            ? "The profile you are looking for does not exist or may have been removed." 
            : message || "We couldn't load this information."}
        </p>

        <Button 
          onClick={() => router.push('/')} 
          className="h-12 px-8 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-transform active:scale-95"
        >
          <Home size={18} className="mr-2" /> 
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
    <Loader2 className="h-8 w-8 text-white animate-spin" />
    <p className="text-neutral-500 text-xs font-medium uppercase tracking-widest">Loading Profile</p>
  </div>
);