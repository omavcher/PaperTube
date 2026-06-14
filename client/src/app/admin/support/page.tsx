"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '@/config/api';
import { toast } from 'sonner';
import { 
  Terminal, Search, Loader2, ArrowLeft, Send, CheckCircle, 
  Clock, ShieldAlert, Phone, User, Mail, Calendar, 
  ChevronRight, RefreshCw, Info, MessageSquare, Shield,
  Zap, Award, Coins, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { LoaderX } from '@/components/LoaderX';
import { motion, AnimatePresence } from 'framer-motion';

type Ticket = {
  _id: string;
  ticketId: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  userEmail: string;
  userId: { _id: string, name: string, email: string } | string;
  chatHistory: { sender: string; message: string; createdAt: string }[];
};

export default function AdminSupportCenter() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async (showSync = false) => {
    try {
      if (showSync) setIsRefreshing(true);
      else setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await api.get("/support/admin/all", { headers: { 'Auth': token } });
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (error) {
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.chatHistory]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.patch(`/support/admin/ticket/${ticketId}`, { status: newStatus }, { headers: { 'Auth': token } });
      if (res.data.success) {
        toast.success(`Ticket marked as ${newStatus}`);
        setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));
        if (activeTicket?._id === ticketId) {
          setActiveTicket({ ...activeTicket, status: newStatus });
        }
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleAdminReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post(`/support/admin/ticket/${activeTicket._id}/message`, {
        message: replyText,
        sender: "admin"
      }, { headers: { 'Auth': token } });

      if (res.data.success) {
        setActiveTicket(res.data.ticket);
        setReplyText("");
        setTickets(tickets.map(t => t._id === activeTicket._id ? res.data.ticket : t));
        toast.success("Reply sent to user");
      }
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  // Filter & Search tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === "" || 
        t.ticketId.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.userEmail.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  const getStatusColor = (status: string) => {
    if (status === 'Resolved' || status === 'Closed') return 'text-green-500 bg-green-500/5 border-green-500/10';
    if (status === 'In Progress') return 'text-yellow-500 bg-yellow-500/5 border-yellow-500/10';
    return 'text-blue-500 bg-blue-500/5 border-blue-500/10';
  };

  // User Context computed values
  const userProfile = useMemo(() => {
    if (!activeTicket) return null;
    const isUserObject = typeof activeTicket.userId === 'object' && activeTicket.userId !== null;
    
    // Parse name and email
    const name = isUserObject ? (activeTicket.userId as any).name : activeTicket.userEmail.split('@')[0];
    const email = activeTicket.userEmail;
    
    // Simulate user telemetry
    const plan = isUserObject && (activeTicket.userId as any).membership?.isActive ? "Premium Pro" : "Free Tier";
    const coins = isUserObject ? (activeTicket.userId as any).tokens || 50 : 25;
    const registrationDate = isUserObject && (activeTicket.userId as any).createdAt 
      ? new Date((activeTicket.userId as any).createdAt).toLocaleDateString()
      : "12 May, 2026";
      
    return {
      name,
      email,
      plan,
      coins,
      registrationDate,
      generationsCount: 14 // Mock stats
    };
  }, [activeTicket]);

  if (loading) {
    return <LoaderX />;
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-120px)] md:h-[83vh] gap-4 md:gap-5 font-mono text-[10px]">
      
      {/* ---------------- LEFT PANEL: TICKET LIST ---------------- */}
      <div className={cn(
        "flex flex-col bg-neutral-950/40 border border-neutral-900 rounded-[2rem] overflow-hidden transition-all duration-300 backdrop-blur-md shrink-0 shadow-xl",
        activeTicket ? "hidden md:flex w-full md:w-1/3" : "w-full"
      )}>
        
        {/* Header Search & Title */}
        <div className="p-5 border-b border-neutral-900 bg-neutral-950/60 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-500/5 rounded-xl flex items-center justify-center border border-blue-500/10 text-blue-400 shrink-0">
                <Terminal size={14} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-bold text-white tracking-tight uppercase">Support Queue</h1>
                <p className="text-[7.5px] text-neutral-500 uppercase tracking-widest mt-0.5">Infraction & Ticket Stream</p>
              </div>
            </div>
            
            <button 
              onClick={() => fetchTickets(true)} 
              disabled={isRefreshing}
              className="p-2 bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-lg transition-all"
            >
              <RefreshCw size={11} className={cn(isRefreshing && "animate-spin text-red-500")} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={12} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-850 h-9 pl-8 pr-3 rounded-lg text-[9px] text-white focus:outline-none focus:border-red-500/30"
            />
          </div>
          
          {/* Status filters */}
          <div className="flex bg-neutral-950 border border-neutral-900 rounded-xl p-1 gap-1 w-full overflow-x-auto no-scrollbar">
            {["All", "Open", "In Progress", "Resolved"].map(s => {
              const isActive = statusFilter === s;
              return (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider whitespace-nowrap transition-all relative z-10",
                    isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                  )}
                >
                  {s}
                  {isActive && (
                    <motion.div
                      layoutId="activeQueueStatus"
                      className="absolute inset-0 bg-red-500/5 border border-red-500/20 rounded-lg -z-10 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tickets Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredTickets.map(ticket => (
            <div 
              key={ticket._id} 
              onClick={() => setActiveTicket(ticket)}
              className={cn(
                "p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group",
                activeTicket?._id === ticket._id 
                  ? "bg-blue-500/5 border-blue-500/20 shadow-md" 
                  : "bg-neutral-900/10 border-neutral-900 hover:border-neutral-850 hover:bg-neutral-900/25"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8.5px] text-neutral-500 font-bold">#{ticket.ticketId}</span>
                <span className={cn("text-[7.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border shrink-0", getStatusColor(ticket.status))}>
                  {ticket.status}
                </span>
              </div>
              <h4 className={cn(
                "font-bold text-xs mb-1 truncate",
                activeTicket?._id === ticket._id ? "text-blue-400" : "text-white"
              )}>{ticket.category}</h4>
              <p className="text-[9px] text-neutral-550 truncate">{ticket.userEmail}</p>
              
              <div className="flex justify-between items-center text-[7.5px] text-neutral-600 mt-4 pt-1.5 border-t border-neutral-900/50">
                <span className="flex items-center gap-1">
                  <Clock size={9} /> {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                </span>
                <span className="text-red-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Uplink <ChevronRight size={8} />
                </span>
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              No tickets identified in active queue filters.
            </div>
          )}
        </div>
      </div>

      {/* ---------------- RIGHT PANEL: CHAT & CONTEXT SPLIT ---------------- */}
      {activeTicket ? (
        <div className="flex-1 flex bg-neutral-950/40 border border-neutral-900 rounded-[2rem] overflow-hidden shadow-xl relative backdrop-blur-md">
          
          {/* Chat Container */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            
            {/* Header info */}
            <div className="p-4 md:p-5 border-b border-neutral-900 flex items-center justify-between gap-4 bg-neutral-950/60 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <button 
                  onClick={() => setActiveTicket(null)} 
                  className="md:hidden p-2 bg-neutral-900 border border-neutral-850 hover:border-neutral-700 rounded-xl text-white flex-shrink-0"
                >
                  <ArrowLeft size={13} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_6px_#3b82f6]" />
                    Ticket #{activeTicket.ticketId}
                  </h2>
                  <p className="text-[7.5px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[150px] sm:max-w-none">
                    USER: {activeTicket.userEmail}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                 {/* Details toggle */}
                 <button
                   onClick={() => setShowContextPanel(!showContextPanel)}
                   title="Toggle User Profile Context"
                   className={cn(
                     "p-2 rounded-xl border transition-colors hidden sm:block",
                     showContextPanel ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white"
                   )}
                 >
                   <Info size={12} />
                 </button>

                 <div className="h-4 w-[1px] bg-neutral-900 hidden sm:block" />

                 {["Open", "In Progress", "Resolved"].map(status => (
                   <button
                     key={status}
                     onClick={() => handleStatusChange(activeTicket._id, status)}
                     disabled={activeTicket.status === status}
                     className={cn(
                       "px-2.5 py-1.5 rounded-lg text-[7.5px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                       activeTicket.status === status 
                         ? getStatusColor(status)
                         : "border-neutral-850 text-neutral-500 hover:text-white hover:bg-neutral-900/40"
                     )}
                   >
                     {status}
                   </button>
                 ))}
              </div>
            </div>

            {/* Chat message panel */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-neutral-900/10">
                
                {/* Original ticket details card */}
                <div className="w-full text-center pb-5 border-b border-neutral-900 mb-5">
                  <p className="text-[7px] text-neutral-500 font-bold uppercase tracking-widest mb-1.5">Original Infraction Logs</p>
                  <p className="text-[10px] text-neutral-300 font-medium bg-[#0b0b0b] p-3.5 rounded-xl border border-neutral-900 mx-auto max-w-lg leading-relaxed max-h-24 overflow-y-auto custom-scrollbar italic">
                    "{activeTicket.description}"
                  </p>
                  <p className="text-[7px] text-neutral-600 mt-2">
                    Filed {format(new Date(activeTicket.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>

                {/* Messages Loop */}
                {activeTicket.chatHistory.map((msg, i) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={i} className={cn("flex w-full", isAdmin ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl space-y-2 border",
                        isAdmin
                          ? "bg-red-500/5 border-red-500/15 text-white rounded-tr-sm"
                          : "bg-neutral-900/40 border-neutral-900 text-neutral-200 rounded-tl-sm"
                      )}>
                        <div className={cn(
                          "flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-widest border-b pb-1 border-neutral-900/50",
                          isAdmin ? "text-red-400" : "text-blue-400"
                        )}>
                          {isAdmin ? <Shield size={10} /> : <User size={10} />}
                          {isAdmin ? "OFFICIAL RESPONSE" : "USER QUERY"}
                        </div>
                        
                        <p className="whitespace-pre-wrap leading-relaxed text-[10px]">{msg.message}</p>
                        <span className="text-[7px] text-neutral-500 mt-2.5 block font-mono">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input responder */}
            <div className="p-4 bg-neutral-950/60 border-t border-neutral-900 backdrop-blur-md shrink-0">
              <div className="flex gap-2">
                  <input 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminReply()}
                    placeholder="Type official support response..."
                    className="flex-1 bg-neutral-900 border border-neutral-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500/30 font-bold placeholder-neutral-500"
                  />
                  <button 
                    onClick={handleAdminReply}
                    disabled={!replyText.trim()}
                    className="w-11 h-11 bg-white text-black hover:bg-red-650 hover:text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
                  >
                    <Send size={14} />
                  </button>
              </div>
            </div>
          </div>

          {/* User Context Panel (Desktop/Inline) */}
          <AnimatePresence>
            {showContextPanel && userProfile && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                className="hidden lg:flex flex-col bg-neutral-950/80 border-l border-neutral-900 w-[220px] shrink-0 h-full overflow-hidden font-mono text-[9px]"
              >
                {/* Header */}
                <div className="p-4 border-b border-neutral-900 bg-neutral-950/40 font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                  <User size={12} className="text-red-400" /> User Telemetry
                </div>

                {/* Details list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  
                  {/* Name and avatar */}
                  <div className="flex flex-col items-center text-center space-y-2 py-2 border-b border-neutral-900/60">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-neutral-850 flex items-center justify-center text-neutral-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white leading-tight uppercase">{userProfile.name}</p>
                      <p className="text-[7.5px] text-neutral-500 truncate max-w-[180px] mt-0.5">{userProfile.email}</p>
                    </div>
                  </div>

                  {/* Telemetry metrics */}
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-neutral-550 uppercase tracking-widest block text-[7.5px]">Membership Plan</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Award size={11} className="text-yellow-500" />
                        {userProfile.plan}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-neutral-550 uppercase tracking-widest block text-[7.5px]">Coins Telemetry</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Coins size={11} className="text-blue-400" />
                        {userProfile.coins} coins
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-neutral-550 uppercase tracking-widest block text-[7.5px]">Registration Link</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Calendar size={11} className="text-neutral-500" />
                        {userProfile.registrationDate}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-neutral-550 uppercase tracking-widest block text-[7.5px]">Material Generations</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <MessageSquare size={11} className="text-emerald-400" />
                        {userProfile.generationsCount} docs
                      </span>
                    </div>
                  </div>

                  {/* AI Quick insights */}
                  <div className="bg-neutral-900/20 border border-neutral-900 p-3 rounded-xl space-y-1.5">
                    <span className="text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Zap size={10} /> AI Diagnostic
                    </span>
                    <p className="text-[7.5px] text-neutral-500 leading-normal">
                      User has high coins consumption. Plan upgrade recommendation template suggested.
                    </p>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-950/20 border border-neutral-900 rounded-r-[2rem]">
          <div className="text-center font-mono space-y-3">
             <div className="w-14 h-14 bg-neutral-900/60 mx-auto rounded-full flex items-center justify-center border border-neutral-850 mb-2 shadow-xl">
               <HelpCircle className="text-neutral-550" size={20} />
             </div>
             <h3 className="text-white font-bold uppercase tracking-wider">No Active Support Connection</h3>
             <p className="text-neutral-500 max-w-xs mx-auto text-[9px] uppercase tracking-wider leading-relaxed">
               Select a support queue ticket from the list on the left to view user message logs and reply.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
