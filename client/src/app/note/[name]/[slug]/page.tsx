"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Download, ZoomIn, ZoomOut,
  ThumbsUp, Loader2, Eye, Shield, CheckCircle2, 
  UserPlus, UserMinus, Edit3, FileText, Zap, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface NoteData {
  _id: string;
  title: string;
  views: number;
  likes: number;
  isLiked?: boolean;
  isFollowing?: boolean;
  pdf_data: { viewLink: string };
  creator: {
    _id: string;
    name: string;
    username: string;
    avatarUrl: string;
    totalNotes: number;
  };
}

export default function NoteViewerPage() {
  const params = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pdf' | 'info'>('pdf');
  const [pdfScale, setPdfScale] = useState(100);
  const [isLiking, setIsLiking] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // --- Auth & Ownership Check ---
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch { return null; }
  }, []);

  const isOwner = useMemo(() => currentUser?._id === data?.creator?._id, [currentUser, data]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const slug = params?.slug as string;
      const res = await api.get(`/notes/allw/${slug}`);
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      toast.error("Artifact link severed");
    } finally { setLoading(false); }
  }, [params?.slug]);

  useEffect(() => {
    if (params?.slug) loadData();
  }, [loadData, params?.slug]);

  // --- Handlers ---
  const handleLike = async () => {
    if (!data) return;
    try {
      setIsLiking(true);
      const res = await api.post(
        `/notes/like/${data._id}`, 
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
          } 
        }
      );
      
      if (res.data.success) {
        // Based on your route response: { data: { likes: number } }
        setData(prev => prev ? { 
          ...prev, 
          likes: res.data.data.likes, 
          isLiked: true 
        } : null);
        toast.success("Note liked");
      }
    } catch (err: any) {
      // Handle the "Already Liked" response
      if (err.response?.data?.success === false) {
        toast.info(err.response.data.message);
        // Sync local state if backend says already liked
        setData(prev => prev ? { ...prev, isLiked: true } : null);
      } else {
        toast.error("Authentication required");
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!data || isOwner) return;
    try {
      setIsActionLoading(true);
      const endpoint = data.isFollowing ? `/users/unfollow/${data.creator._id}` : `/users/follow/${data.creator._id}`;
      const res = await api.post(endpoint);
      if (res.data.success) {
        setData(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
        toast.success(data.isFollowing ? "User Unlinked" : "User Linked");
      }
    } catch (err) { toast.error("Handshake Failed"); } finally { setIsActionLoading(false); }
  };

  if (loading) return <LoadingScreen />;
  if (!data) return <NotFoundScreen />;

  return (
    <div className="h-screen w-screen bg-[#050505] text-white overflow-hidden flex flex-col font-sans">
      
      {/* HEADER HUD */}
      <header className="z-[60] shrink-0 bg-black/80 backdrop-blur-2xl border-b border-white/5">
        <div className="h-16 flex items-center justify-between px-4 lg:px-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl text-neutral-500 hover:text-white">
              <ArrowLeft size={20}/>
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-[10px] font-black uppercase italic tracking-[0.2em] truncate max-w-[200px]">{data.title}</h1>
              <span className="text-[7px] font-bold text-neutral-600 uppercase">Protocol::Secure_Connection</span>
            </div>
          </div>
        </div>

        {/* MOBILE SUB-HEADER TABS */}
        <div className="lg:hidden flex border-t border-white/5 h-12">
            <button 
              onClick={() => setActiveTab('pdf')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all",
                activeTab === 'pdf' ? "text-red-500 border-b-2 border-red-600 bg-red-600/5" : "text-neutral-500"
              )}
            >
              <FileText size={14} /> Artifact
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all",
                activeTab === 'info' ? "text-red-500 border-b-2 border-red-600 bg-red-600/5" : "text-neutral-500"
              )}
            >
              <Zap size={14} /> Intel
            </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* PDF VIEWPORT */}
        <div className={cn(
          "flex-1 h-full bg-[#080808] relative flex flex-col items-center overflow-y-auto custom-scrollbar p-4 lg:p-12 transition-all",
          activeTab === 'info' ? "hidden lg:flex" : "flex"
        )}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              style={{ width: `${pdfScale}%`, maxWidth: '850px' }}
              className="shadow-2xl rounded-sm overflow-hidden bg-white shrink-0 mb-20"
            >
               <iframe 
                src={data.pdf_data.viewLink.replace('/view', '/preview')} 
                className="w-full h-[120vh] border-none" 
                title="Intel-Stream" 
              />
            </motion.div>

            <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 p-1 rounded-2xl flex items-center gap-1 z-50">
               <ControlBtn icon={<ZoomOut size={14}/>} onClick={() => setPdfScale(s => Math.max(60, s - 10))} />
               <div className="px-3 text-[10px] font-mono font-bold text-neutral-500">{pdfScale}%</div>
               <ControlBtn icon={<ZoomIn size={14}/>} onClick={() => setPdfScale(s => Math.min(140, s + 10))} />
            </div>
        </div>

        {/* INFO SIDEBAR */}
        <aside className={cn(
          "w-full lg:w-[380px] h-full bg-[#050505] border-l border-white/5 flex flex-col shrink-0 transition-all",
          activeTab === 'pdf' ? "hidden lg:flex" : "flex"
        )}>
          <ScrollArea className="flex-1">
            <div className="p-8 lg:p-10 space-y-12 pb-32">
              
              {/* Creator Personnel */}
              <section className="space-y-6">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border border-red-600/30">
                      <AvatarImage src={data.creator.avatarUrl} className="rounded-full" />
                      <AvatarFallback className="bg-neutral-900 text-red-600">ID</AvatarFallback>
                    </Avatar>
                    <div>
                       <h3 className="text-sm font-black uppercase italic tracking-tight">{data.creator.name}</h3>
                       <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest">@{data.creator.username}</p>
                    </div>
                 </div>

                 {isOwner ? (
                   <Button 
                    onClick={() => router.push('/profile')}
                    className="w-full h-11 bg-white text-black hover:bg-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                   >
                     <Edit3 size={14} className="mr-2" /> Edit Profile
                   </Button>
                 ) : (
                   <Button 
                    onClick={handleFollowToggle}
                    disabled={isActionLoading}
                    variant={data.isFollowing ? "outline" : "default"}
                    className={cn(
                      "w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      data.isFollowing ? "border-white/10 text-white" : "bg-red-600 text-white hover:bg-red-700"
                    )}
                   >
                     {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : (
                       data.isFollowing ? "Unfollow" : "Follow"
                     )}
                   </Button>
                 )}
              </section>

              <Separator className="bg-white/5" />

              {/* Stats */}
              <section className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-900/30 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <Eye size={18} className="text-neutral-600 mb-2"/>
                    <span className="text-xl font-black">{(data.views ?? 0).toLocaleString()}</span>
                    <span className="text-[7px] uppercase text-neutral-600 font-black tracking-widest">Views</span>
                  </div>
                  <div className="bg-neutral-900/30 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <ThumbsUp size={18} className={cn("mb-2", data.isLiked ? "text-red-500" : "text-neutral-600")}/>
                    <span className="text-xl font-black">{(data.likes ?? 0).toLocaleString()}</span>
                    <span className="text-[7px] uppercase text-neutral-600 font-black tracking-widest">Likes</span>
                  </div>
                </div>

                <Button 
                  onClick={handleLike} 
                  disabled={isLiking}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase italic tracking-widest text-[10px] transition-all border",
                    data.isLiked 
                      ? "bg-white text-black border-white shadow-xl shadow-white/5" 
                      : "bg-neutral-950 text-white border-white/5 hover:border-red-600/50"
                  )}
                >
                  {isLiking ? <Loader2 className="animate-spin" /> : (data.isLiked ? "Liked" : "Like")}
                </Button>
              </section>
            </div>
          </ScrollArea>
        </aside>
      </main>
    </div>
  );
}

const ControlBtn = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => (
  <Button variant="ghost" size="icon" onClick={onClick} className="h-8 w-8 rounded-lg text-neutral-500 hover:text-white transition-all">
    {icon}
  </Button>
);

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
    <div className="h-10 w-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-red-600 font-black uppercase italic tracking-[0.3em] text-[9px]">Establishing Secure Link...</p>
  </div>
);

const NotFoundScreen = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center">
      <Shield size={40} className="text-red-600 mb-6 opacity-20" />
      <h1 className="text-lg font-black uppercase text-white">404: Access Redacted</h1>
      <Button onClick={() => window.history.back()} className="mt-6 bg-white text-black font-black uppercase px-8 h-12 rounded-xl">Return to Base</Button>
  </div>
);