"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye, FileText, Share2, MoreHorizontal, ArrowLeft, Grid3x3, List, Zap, Loader2,
  ShieldAlert, Home, Edit3, Crown, Calendar, MapPin, UserX, Clock, X, AlertTriangle, 
  Heart, Users, UserPlus, UserCheck, ChevronLeft, ChevronRight, Search, MessageCircle,
  Award, Target, BookOpen, TrendingUp, Filter, Download, Bell, Settings, LogOut,
  Instagram, Twitter, Github, Linkedin, Globe, Mail, Link as LinkIcon, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
  const [activeTab, setActiveTab] = useState('notes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewerStatus, setViewerStatus] = useState<any>(null);
  const [relationship, setRelationship] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modal States
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [listTotal, setListTotal] = useState(0);
  const [listSearch, setListSearch] = useState("");

  // Get auth token with proper header format
  const getAuthHeaders = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("authToken");
      return token ? { 'Auth': token } : {};
    }
    return {};
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        setCurrentUser(JSON.parse(userStr));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        let res;
        
        if (isAuthenticated) {
          res = await api.get(`/users/profile/${username}`, {
            headers: getAuthHeaders()
          });
        } else {
          res = await api.get(`/users/public/profile/${username}`);
        }

        if (!res.data.success) {
          setErrorState({ status: true, message: res.data.message || "User not found." });
          return;
        }

        setUser(res.data.user);
        setNotes(res.data.notes || []);
        setStats(res.data.stats);
        
        if (res.data.viewerStatus) setViewerStatus(res.data.viewerStatus);
        if (res.data.relationship) setRelationship(res.data.relationship);
        
      } catch (err: any) {
        console.error("Profile load error:", err);
        
        if (err.response?.status === 401) {
          try {
            const publicRes = await api.get(`/users/public/profile/${username}`);
            if (publicRes.data.success) {
              setUser(publicRes.data.user);
              setNotes(publicRes.data.notes || []);
              setStats(publicRes.data.stats);
              setViewerStatus(publicRes.data.viewerStatus);
              setErrorState({ status: false, message: "" });
            }
          } catch (publicErr) {
            setErrorState({ status: true, message: "Unable to load profile data." });
          }
        } else {
          setErrorState({ status: true, message: "Unable to load profile data." });
        }
      } finally { 
        setLoading(false); 
      }
    };
    
    loadProfile();
  }, [username, isAuthenticated, getAuthHeaders]);

  // Load followers/following list
  const loadList = async (type: 'followers' | 'following', page: number = 1, search: string = "") => {
    if (!user?._id) return;
    
    try {
      setListLoading(true);
      const res = await api.get(`/users/${user._id}/${type}`, {
        params: { page, limit: 20, search },
        headers: getAuthHeaders()
      });

      if (res.data.success) {
        setSelectedList(res.data[type]);
        setListTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      toast.error(`Failed to load ${type}`);
    } finally {
      setListLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Authentication Required", {
        description: "Please login to follow creators.",
        action: { label: "Login", onClick: () => router.push('/login') },
      });
      return;
    }

    try {
      setFollowLoading(true);
      const res = await api.post(`/users/${user._id}/follow`, {}, { 
        headers: getAuthHeaders() 
      });

      if (res.data.success) {
        setUser((prev: any) => ({
          ...prev,
          isFollowing: res.data.isFollowing,
          followersCount: res.data.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1
        }));
        
        setViewerStatus((prev: any) => ({
          ...prev,
          isFollowing: res.data.isFollowing
        }));
        
        toast.success(res.data.isFollowing ? `Following ${user.name}` : `Unfollowed ${user.name}`);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = useMemo(() => {
    if (!currentUser || !user) return false;
    return (currentUser._id === user._id) || (currentUser.email === user.email);
  }, [currentUser, user]);

  if (loading) return <LoadingScreen />;
  if (errorState.status) return <ErrorScreen message={errorState.message} router={router} />;

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-red-500/20 selection:text-red-200">
      
      {/* Modals */}
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        userId={user?._id}
        userName={user?.name}
        getAuthHeaders={getAuthHeaders}
      />

      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        username={username}
        userName={user?.name}
      />

      <FollowersModal
        isOpen={isFollowersOpen}
        onClose={() => setIsFollowersOpen(false)}
        title="Followers"
        users={selectedList}
        loading={listLoading}
        total={listTotal}
        page={listPage}
        onPageChange={(page) => {
          setListPage(page);
          loadList('followers', page, listSearch);
        }}
        onSearch={(search) => {
          setListSearch(search);
          loadList('followers', 1, search);
        }}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        getAuthHeaders={getAuthHeaders}
        router={router}
      />

      <FollowingModal
        isOpen={isFollowingOpen}
        onClose={() => setIsFollowingOpen(false)}
        title="Following"
        users={selectedList}
        loading={listLoading}
        total={listTotal}
        page={listPage}
        onPageChange={(page) => {
          setListPage(page);
          loadList('following', page, listSearch);
        }}
        onSearch={(search) => {
          setListSearch(search);
          loadList('following', 1, search);
        }}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        getAuthHeaders={getAuthHeaders}
        router={router}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-black backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-neutral-400 hover:text-white -ml-2">
            <ArrowLeft size={18} className="mr-2" /> Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsShareOpen(true)} className="text-neutral-400 hover:text-white">
              <Share2 size={18}/>
            </Button>
             
            {!isOwnProfile && isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                    <MoreHorizontal size={18}/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-200">
                  <DropdownMenuItem onClick={() => setIsReportOpen(true)} className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                    <AlertTriangle size={14} className="mr-2" /> Report User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: Profile Info */}
          <aside className="lg:w-1/3 xl:w-1/4 flex-shrink-0 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Profile Image */}
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-blue-500/20 rounded-full blur-2xl opacity-50" />
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-neutral-950 shadow-2xl bg-neutral-900">
                  <AvatarImage src={user?.picture} className="object-cover" />
                  <AvatarFallback className="bg-neutral-800 text-neutral-400 text-3xl font-medium">
                    {user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {user?.isPremium && (
                  <div className="absolute bottom-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-500 p-1.5 rounded-full border-2 border-black" title="Premium Member">
                    <Crown size={16} className="text-black" />
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{user?.name}</h1>
                  <p className="text-neutral-500 font-medium text-sm">@{user?.username}</p>
                </div>

                {/* Bio */}
                {user?.bio && (
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
                    {user.bio}
                  </p>
                )}

                {/* Social Links */}
                {user?.socialLinks && Object.keys(user.socialLinks).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {user.socialLinks.website && (
                      <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" 
                         className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                        <Globe size={16} className="text-neutral-400" />
                      </a>
                    )}
                    {user.socialLinks.twitter && (
                      <a href={`https://twitter.com/${user.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer"
                         className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                        <Twitter size={16} className="text-neutral-400" />
                      </a>
                    )}
                    {user.socialLinks.github && (
                      <a href={`https://github.com/${user.socialLinks.github}`} target="_blank" rel="noopener noreferrer"
                         className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                        <Github size={16} className="text-neutral-400" />
                      </a>
                    )}
                    {user.socialLinks.linkedin && (
                      <a href={`https://linkedin.com/in/${user.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer"
                         className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                        <Linkedin size={16} className="text-neutral-400" />
                      </a>
                    )}
                  </div>
                )}

                {/* Meta Data */}
                <div className="flex flex-wrap gap-4 text-xs text-neutral-500 pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                          <Calendar size={14} />
                          <span>Joined {new Date(user?.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-900 border-neutral-800">
                        <p>Member since {new Date(user?.joinDate).toLocaleDateString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {user?.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>

                {/* Membership Badge */}
                {user?.membershipPlan && user.membershipPlan !== 'Free' && (
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                    <Crown size={12} className="text-amber-500" />
                    <span className="text-xs font-medium text-amber-500">{user.membershipPlan}</span>
                  </div>
                )}

                {/* Achievement Badges */}
                {user?.achievements && user.achievements.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {user.achievements.slice(0, 3).map((achievement: any, i: number) => (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800">
                              <Award size={14} className="text-amber-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-neutral-900 border-neutral-800">
                            <p className="text-xs">{achievement.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {user.achievements.length > 3 && (
                      <div className="px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800">
                        <span className="text-xs text-neutral-400">+{user.achievements.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex gap-3">
                {isOwnProfile ? (
                  <>
                    <Button 
                      onClick={() => router.push('/profile/edit')} 
                      variant="outline"
                      className="flex-1 h-10 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-200"
                    >
                      <Edit3 size={14} className="mr-2" /> Edit Profile
                    </Button>
                    <Button 
                      onClick={() => router.push('/settings')} 
                      variant="ghost"
                      className="h-10 w-10 p-0 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-200"
                    >
                      <Settings size={14} />
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleFollowToggle} 
                    disabled={followLoading}
                    className={cn(
                      "flex-1 h-10 font-medium transition-all",
                      viewerStatus?.isFollowing 
                        ? "bg-neutral-800 text-white hover:bg-red-900/20 hover:text-red-500 hover:border-red-500/20 border border-transparent" 
                        : "bg-white text-black hover:bg-neutral-200"
                    )}
                  >
                    {followLoading ? <Loader2 className="animate-spin" size={16} /> : 
                     viewerStatus?.isFollowing ? (
                      <>
                        <UserCheck size={14} className="mr-2" /> Following
                      </>
                     ) : (
                      <>
                        <UserPlus size={14} className="mr-2" /> Follow
                      </>
                     )}
                  </Button>
                )}
              </div>

              {/* Quick Stats - Clickable */}
              <div className="grid grid-cols-3 gap-3 py-6 border-b border-neutral-900">
                <StatItem 
                  label="Notes" 
                  value={stats?.totalNotes || 0} 
                  icon={<FileText size={16} />}
                  onClick={() => setActiveTab('notes')}
                />
                <StatItem 
                  label="Followers" 
                  value={user?.followersCount || 0} 
                  icon={<Users size={16} />}
                  onClick={() => {
                    setSelectedList([]);
                    setListPage(1);
                    setListSearch("");
                    loadList('followers');
                    setIsFollowersOpen(true);
                  }}
                />
                <StatItem 
                  label="Following" 
                  value={user?.followingCount || 0} 
                  icon={<UserPlus size={16} />}
                  onClick={() => {
                    setSelectedList([]);
                    setListPage(1);
                    setListSearch("");
                    loadList('following');
                    setIsFollowingOpen(true);
                  }}
                />
                <StatItem 
                  label="Views" 
                  value={stats?.totalViews || 0} 
                  icon={<Eye size={16} />}
                />
                <StatItem 
                  label="Likes" 
                  value={stats?.totalLikes || 0} 
                  icon={<Heart size={16} />}
                />
              </div>

          

              {/* Viewer Status */}
              {viewerStatus && !isOwnProfile && (
                <div className="mt-4 p-3 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    {viewerStatus.isFollowing ? (
                      <>
                        <UserCheck size={16} className="text-green-500" />
                        <span className="text-green-500">You follow this user</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="text-neutral-500" />
                        <span className="text-neutral-500">You are not following</span>
                      </>
                    )}
                  </div>
                  {relationship?.mutualFollowersCount > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                      <Users size={14} />
                      <span>{relationship.mutualFollowersCount} mutual followers</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </aside>

          {/* RIGHT: Content Area */}
          <div className="flex-1 min-w-0">
              
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-neutral-900 border border-neutral-800">
                  <TabsTrigger value="notes" className="data-[state=active]:bg-neutral-800">
                    <FileText size={14} className="mr-2" /> Notes
                  </TabsTrigger>
                  <TabsTrigger value="liked" className="data-[state=active]:bg-neutral-800">
                    <Heart size={14} className="mr-2" /> Liked
                  </TabsTrigger>
                  <TabsTrigger value="about" className="data-[state=active]:bg-neutral-800">
                    <Users size={14} className="mr-2" /> About
                  </TabsTrigger>
                </TabsList>

                {/* View Mode Toggle */}
                {activeTab === 'notes' && notes.length > 0 && (
                  <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                    <Button 
                      onClick={() => setViewMode('grid')} 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-8 w-8 rounded-md hover:bg-neutral-800",
                        viewMode === 'grid' && "bg-neutral-800 text-white shadow-sm"
                      )}
                    >
                      <Grid3x3 size={16}/>
                    </Button>
                    <Button 
                      onClick={() => setViewMode('list')} 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-8 w-8 rounded-md hover:bg-neutral-800",
                        viewMode === 'list' && "bg-neutral-800 text-white shadow-sm"
                      )}
                    >
                      <List size={16}/>
                    </Button>
                  </div>
                )}
              </div>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-0">
                <AnimatePresence mode="wait">
                  {notes.length === 0 ? (
                    <EmptyState 
                      icon={<FileText size={48} />}
                      title="No notes yet"
                      description={isOwnProfile ? "Create your first note to get started" : "This user hasn't published any notes yet"}
                      action={isOwnProfile ? {
                        label: "Create Note",
                        onClick: () => router.push('/create')
                      } : undefined}
                    />
                  ) : (
                    <div className={cn(
                      "grid gap-4 md:gap-6",
                      viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                    )}>
                      {notes.map((note, i) => (
                        <NoteCard 
                          key={note._id} 
                          note={note} 
                          index={i} 
                          viewMode={viewMode} 
                          username={username} 
                          router={router}
                          isAuthenticated={isAuthenticated}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Liked Notes Tab */}
              <TabsContent value="liked" className="mt-0">
                {!isAuthenticated ? (
                  <EmptyState 
                    icon={<Heart size={48} />}
                    title="Login to view liked notes"
                    description="Please login to see which notes this user has liked"
                    action={{
                      label: "Login",
                      onClick: () => router.push('/login')
                    }}
                  />
                ) : (
                  <LikedNotesList 
                    userId={user?._id}
                    isOwnProfile={isOwnProfile}
                    router={router}
                  />
                )}
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="mt-0">
                <AboutTab 
                  user={user}
                  stats={stats}
                  isOwnProfile={isOwnProfile}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- LIKED NOTES LIST COMPONENT ---
const LikedNotesList = ({ userId, isOwnProfile, router }: any) => {
  const [likedNotes, setLikedNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedNotes = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${userId}/liked-notes`);
        if (res.data.success) {
          setLikedNotes(res.data.notes);
        }
      } catch (err) {
        console.error("Failed to load liked notes:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadLikedNotes();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-neutral-600 animate-spin" />
      </div>
    );
  }

  if (likedNotes.length === 0) {
    return (
      <EmptyState 
        icon={<Heart size={48} />}
        title="No liked notes"
        description={isOwnProfile ? "You haven't liked any notes yet" : "This user hasn't liked any notes yet"}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {likedNotes.map((note: any) => (
        <div 
          key={note._id}
          onClick={() => router.push(`/note/${note.owner?.username}/${note.slug}`)}
          className="group bg-neutral-900/40 border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-neutral-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
              {note.thumbnail ? (
                <img src={note.thumbnail} alt={note.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText size={20} className="text-neutral-700" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate">{note.title}</h4>
              <p className="text-xs text-neutral-500 mt-1">
                by @{note.owner?.username}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {note.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} /> {note.likes || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- ABOUT TAB COMPONENT ---
const AboutTab = ({ user, stats, isOwnProfile }: any) => {
  return (
    <div className="space-y-6">
      {/* Bio Section */}
      {user?.bio && (
        <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-medium text-white mb-3">About</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-2">
            <Target size={16} />
            <span className="text-xs uppercase tracking-wider">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalViews?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-2">
            <Heart size={16} />
            <span className="text-xs uppercase tracking-wider">Total Likes</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalLikes?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-2">
            <BookOpen size={16} />
            <span className="text-xs uppercase tracking-wider">Notes Created</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalNotes || 0}</p>
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs uppercase tracking-wider">Avg. Views/Note</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats?.totalNotes ? Math.round(stats.totalViews / stats.totalNotes) : 0}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      {user?.recentActivity && user.recentActivity.length > 0 && (
        <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {user.recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-neutral-400">{activity.action}</span>
                <span className="text-neutral-600 text-xs">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SHARE MODAL COMPONENT ---
const ShareModal = ({ isOpen, onClose, username, userName }: any) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${username}/profile` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Share Profile</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Share {userName}'s profile with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Copy Link */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-400 truncate">
              {profileUrl}
            </div>
            <Button onClick={handleCopy} variant="outline" className="border-neutral-700">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>

          {/* Social Share */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=Check out ${userName}'s profile on NoteTakingApp!`)}
              variant="outline"
              className="border-neutral-700 hover:bg-blue-500/10"
            >
              <Twitter size={18} className="text-blue-400" />
            </Button>
            <Button
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`)}
              variant="outline"
              className="border-neutral-700 hover:bg-blue-500/10"
            >
              <Linkedin size={18} className="text-blue-400" />
            </Button>
            <Button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`)}
              variant="outline"
              className="border-neutral-700 hover:bg-blue-500/10"
            >
              <Facebook size={18} className="text-blue-400" />
            </Button>
            <Button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${userName}'s profile: ${profileUrl}`)}`)}
              variant="outline"
              className="border-neutral-700 hover:bg-green-500/10"
            >
              <MessageCircle size={18} className="text-green-400" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- FOLLOWERS MODAL COMPONENT ---
const FollowersModal = ({ 
  isOpen, onClose, title, users, loading, total, page, onPageChange, onSearch,
  currentUser, isAuthenticated, getAuthHeaders, router 
}: any) => {
  const [searchValue, setSearchValue] = useState("");
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
  };

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users");
      return;
    }

    try {
      const res = await api.post(`/users/${userId}/follow`, {}, {
        headers: getAuthHeaders()
      });

      if (res.data.success) {
        setFollowStates(prev => ({
          ...prev,
          [userId]: res.data.isFollowing
        }));
      }
    } catch (err) {
      toast.error("Failed to update follow status");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={18} />
            {title} ({total})
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-neutral-800 border-neutral-700 text-white"
          />
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-neutral-600 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No {title.toLowerCase()} found
            </div>
          ) : (
            users.map((user: any) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    onClose();
                    router.push(`/${user.username}/profile`);
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.picture} />
                    <AvatarFallback className="bg-neutral-700">{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-neutral-500">@{user.username}</p>
                  </div>
                </div>

                {isAuthenticated && user._id !== currentUser?._id && (
                  <Button
                    size="sm"
                    variant={followStates[user._id] ?? user.isFollowing ? "outline" : "default"}
                    onClick={() => handleFollow(user._id, followStates[user._id] ?? user.isFollowing)}
                    className={cn(
                      "ml-2",
                      (followStates[user._id] ?? user.isFollowing) 
                        ? "border-neutral-700 text-neutral-400 hover:bg-red-500/10 hover:text-red-500"
                        : "bg-white text-black hover:bg-neutral-200"
                    )}
                  >
                    {(followStates[user._id] ?? user.isFollowing) ? (
                      <>
                        <UserCheck size={12} className="mr-1" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} className="mr-1" /> Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="border-neutral-700"
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <span className="text-sm text-neutral-500">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="border-neutral-700"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// FollowingModal (similar to FollowersModal but with different title)
const FollowingModal = (props: any) => <FollowersModal {...props} title="Following" />;

// --- STAT ITEM COMPONENT ---
const StatItem = ({ label, value, icon, onClick }: any) => (
  <div 
    onClick={onClick}
    className={cn(
      "text-center p-3 rounded-xl bg-neutral-900/30 border border-white/5",
      onClick && "cursor-pointer hover:bg-neutral-900/50 transition-colors"
    )}
  >
    <div className="flex items-center justify-center gap-1 text-neutral-500 mb-1">
      {icon}
      <p className="text-[10px] uppercase tracking-wider font-medium">{label}</p>
    </div>
    <p className="text-lg font-bold text-white tracking-tight">{Number(value).toLocaleString()}</p>
  </div>
);

// --- EMPTY STATE COMPONENT ---
const EmptyState = ({ icon, title, description, action }: any) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-24 text-neutral-600 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20"
  >
    <div className="text-neutral-700 mb-4">{icon}</div>
    <p className="text-sm font-medium text-white mb-2">{title}</p>
    <p className="text-xs text-neutral-500 mb-6">{description}</p>
    {action && (
      <Button onClick={action.onClick} variant="outline" size="sm" className="border-neutral-700">
        {action.label}
      </Button>
    )}
  </motion.div>
);

// --- NOTE CARD COMPONENT ---
const NoteCard = ({ note, index, viewMode, username, router, isAuthenticated }: any) => {
  const [isLiked, setIsLiked] = useState(note.isLikedByViewer || false);
  const [likesCount, setLikesCount] = useState(note.likes || 0);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Login required", {
        description: "Please login to like notes",
        action: { label: "Login", onClick: () => router.push('/login') }
      });
      return;
    }

    try {
      const res = await api.post(`/notes/${note._id}/like`, {}, {
        headers: { 'Auth': localStorage.getItem('authToken') }
      });

      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likes);
      }
    } catch (err) {
      toast.error("Failed to like note");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/note/${username}/${note.slug}`)}
      className={cn(
        "group relative overflow-hidden bg-neutral-900/40 border border-white/5 rounded-2xl cursor-pointer hover:bg-neutral-900 hover:border-white/10 transition-all duration-300",
        viewMode === 'list' ? "flex flex-row items-stretch h-32" : "flex flex-col"
      )}
    >
      {/* Thumbnail */}
      <div className={cn(
        "relative overflow-hidden bg-neutral-800 shrink-0",
        viewMode === 'list' ? "w-48" : "aspect-[16/9]"
      )}>
        {note.thumbnail ? (
          <img 
            src={note.thumbnail} 
            alt={note.title} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-neutral-800">
            <Zap size={24} className="text-neutral-700"/>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {note.visibility && note.visibility !== 'public' && (
            <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
              <span className="text-[10px] uppercase text-neutral-300">{note.visibility}</span>
            </div>
          )}
          {note.generationDetails?.type === 'premium' && (
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-0.5 rounded-md">
              <Crown size={10} className="text-black" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-white leading-tight line-clamp-2 transition-colors">
            {note.title}
          </h3>
          <p className="text-xs text-neutral-500 line-clamp-2">
            {note.content ? note.content.substring(0, 100) + '...' : 'No description provided.'}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 mt-auto">
          <div className="flex items-center gap-3 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    <Clock size={12}/> 
                    {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-neutral-900 border-neutral-800">
                  <p>Created {new Date(note.createdAt).toLocaleDateString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="flex items-center gap-1">
              <Eye size={12}/> {note.views || 0}
            </span>
          </div>
          
          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full hover:bg-red-500/10",
              isLiked && "text-red-500"
            )}
            onClick={handleLikeClick}
          >
            <Heart 
              size={14} 
              className={cn(isLiked && "fill-red-500")} 
            />
            <span className="ml-1 text-xs">{likesCount}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// --- ERROR SCREEN COMPONENT ---
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
          {isNotFound ? <UserX size={64} strokeWidth={1} /> : <ShieldAlert size={64} strokeWidth={1} />}
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          {isNotFound ? "User Not Found" : "Profile Unavailable"}
        </h2>
        
        <p className="text-neutral-500 max-w-sm mb-10 text-base leading-relaxed">
          {isNotFound 
            ? "The profile you are looking for does not exist or may have been removed." 
            : message || "We couldn't load this profile information."}
        </p>

        <Button 
          onClick={() => router.push('/')} 
          className="h-12 px-8 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-transform active:scale-95"
        >
          <Home size={18} className="mr-2" /> Return to Home
        </Button>
      </motion.div>
    </div>
  );
};

// --- LOADING SCREEN COMPONENT ---
const LoadingScreen = () => (
  <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
      <Loader2 className="h-8 w-8 text-white animate-spin relative" />
    </div>
    <p className="text-neutral-500 text-xs font-medium uppercase tracking-widest">Loading Profile</p>
  </div>
);

// --- REPORT MODAL COMPONENT ---
const ReportModal = ({ isOpen, onClose, userId, userName, getAuthHeaders }: any) => {
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
      
      const res = await api.post(`/users/${userId}/report`, {
        reason,
        description
      }, { headers: getAuthHeaders() });

      if (res.data.success) {
        toast.success("Report submitted", { 
          description: "We will review your report shortly." 
        });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle size={18} />
            Report User
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            You are reporting <span className="text-white font-medium">{userName}</span>. This action is anonymous.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-neutral-400">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Missing icon import
import { Facebook, Check } from "lucide-react";