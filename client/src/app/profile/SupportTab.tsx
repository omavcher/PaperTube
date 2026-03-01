"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Loader2, Send, Ticket, 
  ChevronRight, ArrowLeft, Clock, CheckCircle, AlertCircle, Phone
} from "lucide-react";
import api from "@/config/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type Ticket = {
  _id: string;
  ticketId: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  chatHistory: { sender: string; message: string; createdAt: string }[];
};

export default function SupportTab({ user }: { user: any }) {
  const [view, setView] = useState<"home" | "chat_bot" | "ticket_view">("home");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Bot Chat States
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [botLoading, setBotLoading] = useState(false);

  // Active Ticket States
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const issueOptions = [
    "Payment / Billing Issue",
    "Notes Generation Failed",
    "Account / Login Problem",
    "Feature Request",
    "Other"
  ];

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await api.get("/support/my-tickets", { headers: { 'Auth': token } });
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedIssue, activeTicket?.chatHistory]);

  const handleSubmitTicket = async () => {
    if (!issueDescription.trim() || !selectedIssue) return;
    try {
      setBotLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await api.post("/support/create", {
        category: selectedIssue,
        description: issueDescription,
        chatHistory: [
          { sender: "user", message: issueDescription }
        ]
      }, { headers: { 'Auth': token } });

      if (res.data.success) {
        toast.success("Ticket registered successfully!");
        setTickets([res.data.ticket, ...tickets]);
        setView("home");
        setSelectedIssue(null);
        setIssueDescription("");
      }
    } catch (err) {
      toast.error("Failed to submit ticket.");
    } finally {
      setBotLoading(false);
    }
  };

  const handleReplyTicket = async () => {
    if (!ticketReply.trim() || !activeTicket) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post(`/support/ticket/${activeTicket._id}/message`, {
        message: ticketReply,
        sender: "user"
      }, { headers: { 'Auth': token } });

      if (res.data.success) {
        setActiveTicket(res.data.ticket);
        setTicketReply("");
        // Update ticket in list
        setTickets(tickets.map(t => t._id === activeTicket._id ? res.data.ticket : t));
      }
    } catch (err) {
      toast.error("Failed to send message.");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Resolved' || status === 'Closed') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (status === 'In Progress') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20'; // Open
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-neutral-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
      {/* HEADER */}
      <div className="p-4 md:p-6 border-b border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== "home" && (
            <button onClick={() => setView("home")} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
            {view === 'chat_bot' ? <MessageSquare size={18} /> : <Ticket size={18} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {view === "home" ? "Support Center" : 
               view === "chat_bot" ? "AI Assistant" : 
               `Ticket #${activeTicket?.ticketId}`}
            </h3>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
              {view === "home" ? "Get help and track issues" :
               view === "chat_bot" ? "Let's diagnose your problem" :
               `${activeTicket?.category} • ${activeTicket?.status}`}
            </p>
          </div>
        </div>
        
        {view === "home" && (
          <button onClick={() => setView("chat_bot")} className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center gap-2">
            <MessageSquare size={14} /> New Query
          </button>
        )}
      </div>

      {/* BODY AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-black/20">
        
        {/* --- VIEW 1: HOME (TICKETS LIST) --- */}
        {view === "home" && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center border border-white/5 mb-4 shadow-xl">
                  <CheckCircle className="text-neutral-500" size={24} />
                </div>
                <h4 className="text-white font-bold mb-2">No Active Tickets</h4>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  You don't have any open support tickets right now. If you're facing any issues, click the button above to start a query.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <div 
                    key={ticket._id} 
                    onClick={() => { setActiveTicket(ticket); setView("ticket_view"); }}
                    className="p-4 bg-neutral-900/60 border border-white/5 hover:border-white/20 rounded-xl cursor-pointer transition-all hover:bg-neutral-900 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-mono">#{ticket.ticketId}</span>
                        <span className={cn("text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border", getStatusColor(ticket.status))}>
                          {ticket.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <Clock size={10} /> {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm mb-1">{ticket.category}</h4>
                        <p className="text-xs text-neutral-400 line-clamp-1 max-w-[80%]">{ticket.description}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 2: TICKET CHAT --- */}
        {view === "ticket_view" && activeTicket && (
          <div className="flex-1 flex flex-col h-full absolute inset-0">
             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                <div className="text-center pb-4 border-b border-white/5 mb-6">
                  <p className="text-xs text-neutral-500 mb-2">This ticket was created on {new Date(activeTicket.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-white font-medium bg-neutral-900/50 p-3 rounded-xl border border-white/5 inline-block">
                    " {activeTicket.description} "
                  </p>
                </div>
                
                {activeTicket.chatHistory.map((msg, i) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div key={i} className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] md:max-w-[70%] p-4 text-sm rounded-2xl",
                        isUser 
                          ? "bg-blue-600/20 border border-blue-500/20 text-white rounded-tr-sm" 
                          : "bg-neutral-900 border border-white/10 text-neutral-200 rounded-tl-sm"
                      )}>
                        {!isUser && (
                           <div className="flex items-center gap-2 mb-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                             <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-500">
                               <Phone size={8} />
                             </div>
                             Support Team
                           </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <span className="text-[9px] text-neutral-500 mt-2 block opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
             </div>

             {/* Message Input Area */}
             <div className="p-4 bg-black/60 border-t border-white/5 flex gap-3 backdrop-blur-md">
                {(activeTicket.status === 'Resolved' || activeTicket.status === 'Closed') && (
                  <div className="absolute -top-10 left-0 right-0 py-2 bg-green-500/10 border-t border-green-500/20 flex items-center justify-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle size={12} /> This ticket is marked as {activeTicket.status}
                  </div>
                )}
                <input 
                  value={ticketReply}
                  onChange={(e) => setTicketReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReplyTicket()}
                  placeholder="Type a reply..."
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20"
                />
                <button 
                  onClick={handleReplyTicket}
                  disabled={!ticketReply.trim()}
                  className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={16} />
                </button>
             </div>
          </div>
        )}

        {/* --- VIEW 3: NEW TICKET BOT --- */}
        {view === "chat_bot" && (
          <div className="flex-1 flex flex-col h-full absolute inset-0">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
              
              {/* Bot Welcome */}
              <div className="flex w-full justify-start">
                  <div className="max-w-[85%] md:max-w-[70%] p-4 bg-neutral-900 border border-white/10 text-neutral-200 rounded-2xl rounded-tl-sm text-sm">
                    <div className="flex items-center gap-2 mb-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-500">
                        <MessageSquare size={8} />
                      </div>
                      Support Bot
                    </div>
                    <p className="mb-4">Hello! I'm here to assist you. To get started, please select the category that best describes your issue:</p>
                    
                    {/* Category Options */}
                    {!selectedIssue && (
                      <div className="flex flex-col gap-2">
                        {issueOptions.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => setSelectedIssue(opt)}
                            className="bg-white/5 border border-white/10 hover:bg-white hover:text-black py-2.5 px-4 rounded-lg text-xs font-bold transition-all text-left"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
              </div>

              {/* User Selection */}
              {selectedIssue && (
                <div className="flex w-full justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="max-w-[85%] md:max-w-[70%] p-3.5 bg-blue-600/20 border border-blue-500/20 text-white rounded-2xl rounded-tr-sm text-sm">
                    {selectedIssue}
                  </div>
                </div>
              )}

              {/* Bot Followup */}
              {selectedIssue && (
                <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-both">
                  <div className="max-w-[85%] md:max-w-[70%] p-4 bg-neutral-900 border border-white/10 text-neutral-200 rounded-2xl rounded-tl-sm text-sm">
                     <p className="mb-3">
                       Thanks. Please describe your {selectedIssue.toLowerCase()} in detail below. I will create an official support ticket and our team will resolve it within 48-72 hours.
                     </p>
                     
                     <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <textarea
                          value={issueDescription}
                          onChange={(e) => setIssueDescription(e.target.value)}
                          placeholder="Describe the problem, when it occurred, and any other relevant details..."
                          className="w-full bg-transparent border-none outline-none text-white text-sm resize-none h-24 placeholder:text-neutral-600"
                        />
                     </div>
                     
                     <div className="mt-3 flex justify-end">
                       <button
                         onClick={handleSubmitTicket}
                         disabled={!issueDescription.trim() || botLoading}
                         className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-all flex items-center gap-2"
                       >
                         {botLoading ? <Loader2 size={12} className="animate-spin" /> : "Submit Ticket"}
                       </button>
                     </div>
                  </div>
                </div>
              )}
              
              <div ref={bottomRef} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
