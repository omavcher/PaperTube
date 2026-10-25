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
import { LoaderX } from "@/components/LoaderX";

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
        toast.success("Support ticket registered successfully.");
        setTickets([res.data.ticket, ...tickets]);
        setView("home");
        setSelectedIssue(null);
        setIssueDescription("");
      }
    } catch (err) {
      toast.error("Failed to submit support ticket.");
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
        setTickets(tickets.map(t => t._id === activeTicket._id ? res.data.ticket : t));
      }
    } catch (err) {
      toast.error("Failed to send message.");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Resolved' || status === 'Closed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'In Progress') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-neutral-300 bg-white/[0.05] border-white/[0.08]';
  };

  if (loading) {
    return <LoaderX />;
  }

  return (
    <div className="bg-[#0e0e12] border border-white/[0.08] rounded-2xl overflow-hidden min-h-[460px] flex flex-col font-sans select-none">
      {/* HEADER */}
      <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== "home" && (
            <button
              type="button"
              onClick={() => setView("home")}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300">
            {view === 'chat_bot' ? <MessageSquare size={15} /> : <Ticket size={15} />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {view === "home" ? "Help & Support Desk" : 
               view === "chat_bot" ? "Submit Support Query" : 
               `Ticket #${activeTicket?.ticketId}`}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {view === "home" ? "Track queries and get direct assistance" :
               view === "chat_bot" ? "Describe your issue for priority review" :
               `${activeTicket?.category} • ${activeTicket?.status}`}
            </p>
          </div>
        </div>
        
        {view === "home" && (
          <button
            type="button"
            onClick={() => setView("chat_bot")}
            className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare size={13} />
            <span>New Query</span>
          </button>
        )}
      </div>

      {/* BODY AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* --- VIEW 1: HOME (TICKETS LIST) --- */}
        {view === "home" && (
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto custom-scrollbar">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-2">
                <div className="w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center text-neutral-400 mb-1">
                  <CheckCircle size={18} />
                </div>
                <h4 className="text-sm font-medium text-white">No Active Support Tickets</h4>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  You do not have any open tickets. If you need assistance with your subscription or study tools, click New Query above.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {tickets.map(ticket => (
                  <div 
                    key={ticket._id} 
                    onClick={() => { setActiveTicket(ticket); setView("ticket_view"); }}
                    className="py-3 flex items-center justify-between gap-3 cursor-pointer group first:pt-1 last:pb-1"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-mono">#{ticket.ticketId}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase border", getStatusColor(ticket.status))}>
                          {ticket.status}
                        </span>
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                          <Clock size={10} /> {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <h4 className="font-medium text-neutral-200 group-hover:text-white text-xs truncate">{ticket.category}</h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">{ticket.description}</p>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.08] flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors shrink-0">
                      <ChevronRight size={13} />
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
             <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
                <div className="text-center pb-3 border-b border-white/[0.05] mb-3">
                  <p className="text-[11px] text-neutral-500">Ticket filed on {new Date(activeTicket.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-neutral-300 mt-1 bg-white/[0.03] px-3 py-2 rounded-xl border border-white/[0.05] inline-block max-w-md">
                    "{activeTicket.description}"
                  </p>
                </div>
                
                {activeTicket.chatHistory.map((msg, i) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div key={i} className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] sm:max-w-[70%] p-3 text-xs rounded-2xl",
                        isUser 
                          ? "bg-white text-black font-medium rounded-tr-sm" 
                          : "bg-white/[0.05] border border-white/[0.08] text-neutral-200 rounded-tl-sm"
                      )}>
                        {!isUser && (
                           <div className="flex items-center gap-1.5 mb-1.5 text-[9.5px] text-neutral-400 font-medium">
                             <span>Paperxify Support</span>
                           </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        <span className={cn(
                          "text-[9px] mt-1.5 block opacity-60 font-mono",
                          isUser ? "text-neutral-600" : "text-neutral-400"
                        )}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
             </div>

             {/* Message Input Area */}
             <div className="p-3.5 bg-black/40 border-t border-white/[0.06] flex gap-2">
                <input 
                  value={ticketReply}
                  onChange={(e) => setTicketReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReplyTicket()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                />
                <button 
                  type="button"
                  onClick={handleReplyTicket}
                  disabled={!ticketReply.trim()}
                  className="px-3.5 py-2 bg-white text-black rounded-xl text-xs font-medium hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                >
                  <Send size={13} />
                </button>
             </div>
          </div>
        )}

        {/* --- VIEW 3: NEW TICKET BOT --- */}
        {view === "chat_bot" && (
          <div className="flex-1 flex flex-col h-full absolute inset-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
              
              {/* Bot Welcome */}
              <div className="flex w-full justify-start">
                <div className="max-w-[85%] sm:max-w-[70%] p-3.5 bg-white/[0.05] border border-white/[0.08] text-neutral-200 rounded-2xl rounded-tl-sm text-xs space-y-2">
                  <p>Select the topic that best matches your request:</p>
                  
                  {!selectedIssue && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      {issueOptions.map(opt => (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => setSelectedIssue(opt)}
                          className="bg-white/[0.04] border border-white/[0.06] hover:bg-white hover:text-black py-2 px-3 rounded-lg text-xs font-medium transition-all text-left"
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
                <div className="flex w-full justify-end">
                  <div className="max-w-[85%] sm:max-w-[70%] p-2.5 bg-white text-black font-medium rounded-2xl rounded-tr-sm text-xs">
                    {selectedIssue}
                  </div>
                </div>
              )}

              {/* Followup */}
              {selectedIssue && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] sm:max-w-[70%] p-3.5 bg-white/[0.05] border border-white/[0.08] text-neutral-200 rounded-2xl rounded-tl-sm text-xs space-y-2.5">
                    <p>
                      Please describe your {selectedIssue.toLowerCase()} below. A support specialist will follow up directly on this ticket:
                    </p>
                    
                    <textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Enter relevant details, invoice numbers, or links..."
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 text-white text-xs resize-none h-20 placeholder:text-neutral-500 focus:outline-none focus:border-white/20"
                    />
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSubmitTicket}
                        disabled={!issueDescription.trim() || botLoading}
                        className="px-4 py-1.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-neutral-200 disabled:opacity-40 transition-all flex items-center gap-1.5"
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
