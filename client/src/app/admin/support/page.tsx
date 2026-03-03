"use client";

import React, { useState, useEffect, useRef } from 'react';
import api from '@/config/api';
import { toast } from 'sonner';
import { 
  Terminal, Search, Loader2, ArrowLeft, Send, CheckCircle, 
  Clock, ShieldAlert, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { LoaderX } from '@/components/LoaderX';

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
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await api.get("/support/admin/all", { headers: { 'Auth': token } });
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (error) {
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
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

  const filteredTickets = tickets.filter(t => statusFilter === "All" ? true : t.status === statusFilter);

  const getStatusColor = (status: string) => {
    if (status === 'Resolved' || status === 'Closed') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (status === 'In Progress') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  };

  if (loading) {
    return <LoaderX />;
  }

  return (
    <div className="flex h-[85vh] gap-6">
      
      {/* ---------------- LEFT PANEL: TICKET LIST ---------------- */}
      <div className={cn(
        "flex flex-col bg-neutral-900/40 border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300",
        activeTicket ? "hidden md:flex w-full md:w-1/3 border-r-0 rounded-r-none" : "w-full"
      )}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <Terminal className="text-blue-500 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Support Ops</h1>
              <p className="text-xs text-neutral-500 font-medium">Manage user support tickets</p>
            </div>
          </div>
          
          <div className="flex gap-2 p-1 bg-black/40 rounded-xl overflow-x-auto no-scrollbar">
            {["All", "Open", "In Progress", "Resolved"].map(s => (
              <button 
                key={s} 
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors",
                  statusFilter === s ? "bg-white text-black" : "text-neutral-500 hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {filteredTickets.map(ticket => (
            <div 
              key={ticket._id} 
              onClick={() => setActiveTicket(ticket)}
              className={cn(
                "p-4 rounded-2xl border cursor-pointer transition-all group",
                activeTicket?._id === ticket._id 
                  ? "bg-blue-500/10 border-blue-500/30" 
                  : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-neutral-900/40"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-neutral-500 font-mono">#{ticket.ticketId}</span>
                <span className={cn("text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border", getStatusColor(ticket.status))}>
                  {ticket.status}
                </span>
              </div>
              <h4 className={cn(
                "font-bold text-sm mb-1 truncate",
                activeTicket?._id === ticket._id ? "text-blue-400" : "text-white"
              )}>{ticket.category}</h4>
              <p className="text-xs text-neutral-500 flex items-center gap-1.5 mb-2 truncate">
                {ticket.userEmail}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 font-mono mt-3">
                <Clock size={10} /> {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="text-center py-12 text-sm text-neutral-500">
              No tickets found.
            </div>
          )}
        </div>
      </div>

      {/* ---------------- RIGHT PANEL: TICKET DETAIL ---------------- */}
      {activeTicket ? (
        <div className="flex-1 flex flex-col bg-neutral-900/40 border border-white/5 rounded-[2rem] overflow-hidden md:rounded-l-none relative">
          
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTicket(null)} 
                className="md:hidden p-2 bg-white/5 rounded-full text-white"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                  Ticket #{activeTicket.ticketId}
                </h2>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                  User: {activeTicket.userEmail}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {["Open", "In Progress", "Resolved"].map(status => (
                 <button
                   key={status}
                   onClick={() => handleStatusChange(activeTicket._id, status)}
                   disabled={activeTicket.status === status}
                   className={cn(
                     "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                     activeTicket.status === status 
                       ? getStatusColor(status)
                       : "border-white/5 text-neutral-500 hover:text-white hover:bg-white/10"
                   )}
                 >
                   {status}
                 </button>
               ))}
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="w-full text-center pb-6 mb-6 border-b border-white/5">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">Original Ticket Detail</p>
                <p className="text-sm text-white font-medium bg-black/40 p-4 rounded-xl border border-white/5 mx-auto max-w-lg">
                  "{activeTicket.description}"
                </p>
                <p className="text-[10px] text-neutral-600 mt-2 font-mono">
                  Submitted {format(new Date(activeTicket.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              {activeTicket.chatHistory.map((msg, i) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div key={i} className={cn("flex w-full", isAdmin ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] md:max-w-[70%] p-4 text-sm rounded-2xl",
                      isAdmin
                        ? "bg-red-600/20 border border-red-500/20 text-white rounded-tr-sm"
                        : "bg-neutral-900 border border-white/10 text-neutral-200 rounded-tl-sm"
                    )}>
                      {isAdmin && (
                         <div className="flex items-center gap-2 mb-2 text-[10px] text-red-400 font-bold uppercase tracking-widest">
                           <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                             <ShieldAlert size={8} />
                           </div>
                           Admin Reply
                         </div>
                      )}
                      {!isAdmin && (
                         <div className="flex items-center gap-2 mb-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                           <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                             <Phone size={8} />
                           </div>
                           User Message
                         </div>
                      )}
                      
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <span className="text-[9px] text-neutral-500 mt-3 block font-mono">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
          </div>

          {/* Admin Reply Box */}
          <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
            <div className="flex gap-3">
                <input 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminReply()}
                  placeholder="Type official admin response..."
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20"
                />
                <button 
                  onClick={handleAdminReply}
                  disabled={!replyText.trim()}
                  className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={16} />
                </button>
            </div>
          </div>
          
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-900/20 border border-white/5 rounded-r-[2rem]">
          <div className="text-center">
             <div className="w-16 h-16 bg-neutral-900 mx-auto rounded-full flex items-center justify-center border border-white/5 mb-4 shadow-xl">
               <Terminal className="text-neutral-500" size={24} />
             </div>
             <h3 className="text-white font-bold tracking-tight mb-2">No Ticket Selected</h3>
             <p className="text-sm text-neutral-500 max-w-sm">
               Select a support ticket from the list on the left to view details and reply to the user.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
