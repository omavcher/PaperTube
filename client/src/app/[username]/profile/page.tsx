"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User, Eye, FileText, Users, ThumbsUp, Crown, Award, Clock, Share2, 
  MoreVertical, ArrowLeft, Settings, Grid3x3, List, ChevronRight, 
  Zap, Loader2, Activity, ShieldCheck, ShieldAlert, Home, Edit3,
  UserPlus, UserMinus, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/Footer";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<{status: boolean; message: string}>({status: false, message: ""});
  const [user, setUser] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
          setErrorState({ status: true, message: res.data.message || "Personnel not found." });
          return;
        }
        setUser(res.data.user);
        setNotes(res.data.notes || []);
        setStats(res.data.stats);
      } catch (err: any) {
        setErrorState({ status: true, message: "Protocol Handshake Failed." });
      } finally { setLoading(false); }
    };
    loadProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    const token = getAuthToken();
    
    if (!token) {
      toast.error("Authentication Required", {
        description: "Please use the login button in the navigation bar to proceed.",
        action: { label: "Login Now", onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
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
        toast.success(res.data.isFollowing ? `Linked with ${user.name}` : `Unlinked from ${user.name}`);
      }
    } catch (err) {
      toast.error("Operation failed. Try again later.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (errorState.status) return <ErrorScreen message={errorState.message} router={router} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-white/5 text-neutral-500"><ArrowLeft size={20}/></Button>
            <div className="flex items-center gap-3">
               <Avatar className="h-9 w-9 border border-white/10 shadow-xl bg-neutral-900">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback className="bg-red-600 font-black text-[10px] italic">ID</AvatarFallback>
               </Avatar>
               <div className="hidden xs:block">
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-white truncate max-w-[120px]">@{user?.username}</p>
                  <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.2em] leading-none mt-0.5">Active Protocol</p>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => {
               navigator.clipboard.writeText(window.location.href);
               toast.success("Identity link copied");
             }} className="rounded-xl text-neutral-500 hover:text-red-500 transition-all"><Share2 size={18}/></Button>
             
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="rounded-xl text-neutral-500 hover:text-white"><MoreVertical size={18}/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-950 border-white/10 text-white rounded-2xl w-48 shadow-2xl p-2 z-[60]">
                   <DropdownMenuItem className="rounded-xl focus:bg-red-600 focus:text-white transition-colors cursor-pointer text-xs font-black uppercase italic">Report Entity</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 pb-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* --- LEFT: PERSONNEL HUD --- */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-[3rem] bg-neutral-900/40 border border-white/5 backdrop-blur-3xl shadow-2xl text-center lg:text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                 <ShieldCheck size={120} />
              </div>

              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-red-600/30 blur-3xl rounded-full animate-pulse opacity-50" />
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-red-600 relative z-10 shadow-[0_0_40px_rgba(220,38,38,0.2)] bg-black">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback className="text-red-600 text-5xl font-black italic uppercase">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                {user?.isPremium && (
                  <div className="absolute -top-1 -right-1 z-20 bg-amber-500 rounded-full p-2.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] border-2 border-black">
                    <Crown size={16} className="text-black" />
                  </div>
                )}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="space-y-1">
                   <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">{user?.name}</h2>
                   <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] pt-2">@{user?.username}</p>
                </div>
                
                <p className="text-neutral-500 text-xs font-medium uppercase tracking-tight border-t border-white/5 pt-4">
                  {user?.bio || "Neural node active. Identity parameters verified by the void."}
                </p>
                
                <div className="pt-6 space-y-4">
                  {isOwnProfile ? (
                    <Button 
                      onClick={() => router.push('/profile')} 
                      className="w-full h-14 bg-white text-black font-black uppercase italic rounded-2xl text-xs hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 group"
                    >
                       <Edit3 size={16} className="mr-2 group-hover:rotate-12 transition-transform" /> Edit Profile
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleFollowToggle} 
                      disabled={followLoading}
                      className={cn(
                        "w-full h-14 font-black uppercase italic rounded-2xl text-xs transition-all shadow-xl active:scale-95 group",
                        user?.isFollowing 
                          ? "bg-neutral-800 text-white border border-white/10 hover:bg-red-600/10 hover:text-red-500 hover:border-red-500/50" 
                          : "bg-red-600 hover:bg-red-700 text-white"
                      )}
                    >
                       {followLoading ? (
                         <Loader2 className="animate-spin" size={16} />
                       ) : user?.isFollowing ? (
                         <div className="flex items-center gap-2">
                           <Check size={16} className="group-hover:hidden" />
                           <UserMinus size={16} className="hidden group-hover:block" />
                           <span className="group-hover:hidden uppercase">Following</span>
                           <span className="hidden group-hover:block uppercase tracking-widest">Unfollow</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <UserPlus size={16} />
                           <span className="uppercase">Follow Node</span>
                         </div>
                       )}
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2">
                     <StatusMini label="Nodes" val={stats?.totalNotes || 0} />
                     <StatusMini label="Syncs" val={user?.followersCount || 0} />
                     <StatusMini label="Trust" val="100%" />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InfoNode label="Origin" val={user?.joinDate ? new Date(user?.joinDate).toLocaleDateString() : 'N/A'} icon={<Clock size={12}/>} />
               <InfoNode label="Access" val={user?.membershipPlan || "Standard"} icon={<Award size={12}/>} />
            </div>
          </div>

          {/* --- RIGHT: CONTENT MATRIX --- */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <HUDStat label="Intelligence Nodes" val={stats?.totalNotes || 0} icon={FileText} color="text-red-500" />
               <HUDStat label="Global Views" val={stats?.totalViews || 0} icon={Eye} color="text-blue-500" />
               <HUDStat label="Sync Rate" val={stats?.totalLikes || 0} icon={ThumbsUp} color="text-emerald-500" />
               <HUDStat label="Network Scale" val={user?.followersCount || 0} icon={Users} color="text-purple-500" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-2">
                  <TabsList className="bg-transparent p-0 h-auto gap-8">
                     <TabTrigger value="all" label="All Nodes" />
                     <TabTrigger value="premium" label="Elite Access" icon={<Crown size={12}/>} />
                  </TabsList>
                  
                  <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-xl border border-white/5 self-end">
                     <Button onClick={() => setViewMode('grid')} variant="ghost" size="icon" className={cn("h-9 w-10 rounded-lg", viewMode === 'grid' ? "bg-red-600 text-white" : "text-neutral-500")}><Grid3x3 size={16}/></Button>
                     <Button onClick={() => setViewMode('list')} variant="ghost" size="icon" className={cn("h-9 w-10 rounded-lg", viewMode === 'list' ? "bg-red-600 text-white" : "text-neutral-500")}><List size={16}/></Button>
                  </div>
               </div>

               <TabsContent value={activeTab} className="mt-0 outline-none">
                  {notes.length === 0 ? (
                    <div className="py-32 text-center bg-neutral-950/40 rounded-[3rem] border border-dashed border-white/5">
                       <Activity size={48} className="mx-auto text-neutral-900 mb-4" />
                       <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-neutral-700">Database Empty</p>
                    </div>
                  ) : (
                    <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                        {notes.map((note, i) => (
                          <NoteCard key={note._id} note={note} index={i} viewMode={viewMode} username={username} router={router} />
                        ))}
                    </div>
                  )}
               </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS (HUD STYLE) ---

const HUDStat = ({ label, val, icon: Icon, color }: any) => (
  <div className="bg-black border border-white/5 p-5 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/30 transition-all duration-500 shadow-2xl">
    <div className="flex justify-between items-start mb-5 relative z-10">
      <div className={cn("p-2.5 rounded-xl bg-neutral-900 border border-white/5 shadow-inner", color)}><Icon size={20}/></div>
      <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
    </div>
    <div className="relative z-10">
      <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest mb-1 leading-none">{label}</p>
      <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{val.toLocaleString() || 0}</p>
    </div>
  </div>
);

const NoteCard = ({ note, index, viewMode, username, router }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    onClick={() => router.push(`/note/${username}/${note.slug}`)}
    className={cn(
      "group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-neutral-950 transition-all duration-500 cursor-pointer hover:border-red-600/30",
      viewMode === 'list' ? "flex flex-col sm:flex-row items-center p-4 gap-6 min-h-32" : "flex flex-col"
    )}
  >
    <div className={cn("relative overflow-hidden shrink-0", viewMode === 'list' ? "h-24 w-full sm:w-44 rounded-2xl" : "aspect-video")}>
       <img src={note.thumbnail} alt="v" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
       {note.isPremium && <div className="absolute top-3 left-3 bg-red-600 p-2 rounded-xl z-10 border border-white/20"><Crown size={12} className="text-white fill-white"/></div>}
       <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
         <p className="text-[9px] font-black text-white italic uppercase tracking-widest flex items-center gap-1.5 leading-none"><Eye size={12} className="text-red-600"/> {note.views || 0}</p>
       </div>
    </div>
    <div className="p-6 flex-1 min-w-0">
       <h3 className="text-sm font-black italic uppercase tracking-tighter text-white truncate group-hover:text-red-500 transition-colors mb-2">{note.title}</h3>
       <div className="flex items-center justify-between font-bold text-[9px] text-neutral-600 uppercase">
          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:text-red-500"><ChevronRight size={20}/></Button>
       </div>
    </div>
  </motion.div>
);

const TabTrigger = ({ value, label, icon }: any) => (
  <TabsTrigger value={value} className="bg-transparent data-[state=active]:text-red-500 text-neutral-600 font-black uppercase italic text-[11px] tracking-[0.2em] p-0 rounded-none border-none transition-all relative group h-10">
     <div className="flex items-center gap-2">
      {icon && <span className="text-neutral-500 group-data-[state=active]:text-red-500 transition-colors">{icon}</span>}
      <span>{label}</span>
     </div>
     <motion.div layoutId="activeTab" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-600 opacity-0 group-data-[state=active]:opacity-100 shadow-[0_0_10px_red]" />
  </TabsTrigger>
);

const StatusMini = ({ label, val }: any) => (
  <div className="flex-1 bg-black/40 border border-white/5 p-4 rounded-3xl text-center">
     <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest mb-1.5 leading-none">{label}</p>
     <p className="text-sm font-black italic text-white leading-none">{val}</p>
  </div>
);

const InfoNode = ({ label, val, icon }: any) => (
  <div className="p-6 rounded-[2.5rem] bg-neutral-900/30 border border-white/5 flex items-center gap-4 shadow-2xl">
     <div className="text-red-600 p-3 bg-black rounded-2xl border border-white/5 shadow-inner">{icon}</div>
     <div>
        <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[11px] font-bold text-neutral-400 leading-none">{val}</p>
     </div>
  </div>
);

const ErrorScreen = ({ message, router }: { message: string; router: any }) => (
  <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
    <ShieldAlert size={64} className="text-red-600 animate-pulse mb-8" />
    <h2 className="text-4xl font-black italic uppercase text-white mb-4 tracking-tighter">Access Denied</h2>
    <p className="text-neutral-500 font-medium text-sm mb-12 uppercase tracking-tight italic">{message}</p>
    <Button onClick={() => router.push('/')} className="h-16 px-10 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-red-600 hover:text-white transition-all">
      <Home size={18} className="mr-3" /> Return to Void
    </Button>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
    <div className="h-24 w-24 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(220,38,38,0.3)]" />
    <p className="text-red-600 font-black uppercase italic tracking-[0.6em] animate-pulse text-xs">Accessing User Directory</p>
  </div>
);