"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, ArrowUpRight, Search, Download, 
  CheckCircle2, XCircle, Clock, TrendingUp, Activity, 
  Receipt, Calendar, Coins, ShieldCheck, User, RefreshCw,
  Mail, Phone, MessageSquare, Send, Copy, Check,
  AlertTriangle, UserX, Sparkles, Filter, ExternalLink, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";

// --- Types based on API Response ---
interface Transaction {
  _id: string;
  paymentId: string;
  orderId: string;
  paytmOrderId?: string | null;
  paypalOrderId?: string | null;
  userId: string;
  packageId: string;
  packageName: string;
  packageType: 'subscription' | 'token';
  billingPeriod?: string;
  amount: number;
  currency?: string;
  currencySymbol?: string;
  status: string;
  failureReason?: string | null;
  resultCode?: string | null;
  paymentMethod?: string;
  paymentMode?: string;
  userEmail: string;
  userName: string;
  userMobile?: string | null;
  userCountry?: string;
  userCity?: string;
  userPicture?: string;
  hasActiveMembership?: boolean;
  currentPlan?: string;
  lastLogin?: string | null;
  timestamp: string;
  sourceType?: string;
}

interface RecoverableLead {
  userId: string;
  email: string;
  name: string;
  mobile: string | null;
  country: string;
  city: string;
  picture: string;
  lastAttemptDate: string;
  lastPlan: string;
  lastAmount: number;
  currency: string;
  currencySymbol: string;
  lastPaymentMethod: string;
  lastStatus: string;
  lastReason: string;
  attemptsCount: number;
  orderIds: string[];
}

interface LedgerSummary {
  totalAttempts: number;
  totalPaid: number;
  totalUnpaid: number;
  successRate: string;
  paidRevenueINR: number;
  paidRevenueUSD: number;
  lostRevenueINR: number;
  lostRevenueUSD: number;
  recoverableLeadsCount: number;
  recoverableLeads: RecoverableLead[];
}

const getAdminToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";

export default function FinancialLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "unpaid" | "leads" | "paytm" | "paypal">("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reach out modal state
  const [reachOutLead, setReachOutLead] = useState<RecoverableLead | null>(null);
  const [reachOutSubject, setReachOutSubject] = useState("");
  const [reachOutMessage, setReachOutMessage] = useState("");
  const [reachOutDiscount, setReachOutDiscount] = useState("STUDY30");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- Fetch Data ---
  const fetchTransactionData = async (showSync = false) => {
    try {
      if (showSync) setIsRefreshing(true);
      else setLoading(true);
      
      const token = getAdminToken();
      const response = await api.get('/admin/transactions', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.data.success) {
        setTransactions(response.data.data || []);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Failed to sync financial ledger");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
  }, []);

  // Open Reach Out Modal
  const openReachOutModal = (lead: RecoverableLead) => {
    setReachOutLead(lead);
    setReachOutSubject(`Special Assistance with your Paperxify (${lead.lastPlan}) checkout`);
    setReachOutMessage(
      `Hi ${lead.name || "Scholar"},\n\nWe noticed you recently tried subscribing to Paperxify (${lead.lastPlan}) via ${lead.lastPaymentMethod.toUpperCase()}, but the payment could not be completed (${lead.lastReason || "Incomplete checkout"}).\n\nTo help you access all our AI research tools, smart notes, and exam synthesis without friction, we have generated an exclusive follow-up discount code for you.\n\nPlease feel free to reply directly to this email if you need any assistance!`
    );
    setReachOutDiscount("STUDY30");
  };

  // Send Direct Reach-out Email
  const handleSendReachOutEmail = async () => {
    if (!reachOutLead) return;
    setIsSendingEmail(true);
    try {
      const token = getAdminToken();
      const res = await api.post(
        "/admin/transactions/reach-out",
        {
          email: reachOutLead.email,
          name: reachOutLead.name,
          subject: reachOutSubject,
          message: reachOutMessage,
          discountCode: reachOutDiscount,
          planName: reachOutLead.lastPlan,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        toast.success(`🎉 Reach-out email sent successfully to ${reachOutLead.email}!`);
        setReachOutLead(null);
      } else {
        toast.error(res.data?.message || "Failed to send email");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to send recovery email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalTxns = transactions.length;
    const successfulTxns = transactions.filter(t => t.status === 'success');
    const unpaidTxns = transactions.filter(t => t.status !== 'success');
    
    const grossRevenueINR = successfulTxns
      .filter(t => t.currency === 'INR')
      .reduce((sum, t) => sum + t.amount, 0);

    const grossRevenueUSD = successfulTxns
      .filter(t => t.currency !== 'INR')
      .reduce((sum, t) => sum + t.amount, 0);

    const lostRevenueINR = unpaidTxns
      .filter(t => t.currency === 'INR')
      .reduce((sum, t) => sum + t.amount, 0);

    const successRate = totalTxns > 0 ? (successfulTxns.length / totalTxns) * 100 : 0;
    const leadsCount = summary?.recoverableLeadsCount ?? 0;

    return {
      grossRevenueINR,
      grossRevenueUSD,
      lostRevenueINR,
      unpaidCount: unpaidTxns.length,
      paidCount: successfulTxns.length,
      successRate: successRate.toFixed(1),
      leadsCount,
    };
  }, [transactions, summary]);

  // Filtering Logic
  const filteredTxns = useMemo(() => {
    return transactions.filter(txn => {
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = 
        (txn.userName || "").toLowerCase().includes(searchLower) || 
        (txn.userEmail || "").toLowerCase().includes(searchLower) ||
        (txn.userMobile || "").toLowerCase().includes(searchLower) ||
        (txn.paymentId || "").toLowerCase().includes(searchLower) ||
        (txn.orderId || "").toLowerCase().includes(searchLower) ||
        (txn.packageName || "").toLowerCase().includes(searchLower) ||
        (txn.failureReason || "").toLowerCase().includes(searchLower) ||
        (txn._id || "").toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "paid") return txn.status === "success";
      if (activeTab === "unpaid") return txn.status !== "success";
      if (activeTab === "paytm") return txn.paymentMethod === "paytm" || txn.paymentMethod === "upi";
      if (activeTab === "paypal") return txn.paymentMethod === "paypal";

      return true;
    });
  }, [transactions, searchQuery, activeTab]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const headers = [
          "Order ID", "Payment ID", "Gateway", "User Name", "User Email", 
          "Mobile", "Country", "Package", "Amount", "Currency", "Status", "Failure Reason", "Timestamp"
        ];
        const rows = filteredTxns.map(t => [
          t.orderId || "",
          t.paymentId || "",
          t.paymentMethod || "paytm",
          t.userName || "Unknown",
          t.userEmail || "",
          t.userMobile || "",
          t.userCountry || "",
          t.packageName || "",
          t.amount,
          t.currency || "INR",
          t.status,
          t.failureReason || "",
          t.timestamp
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(",")].concat(rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `paperxify_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Ledger Exported Successfully");
      } catch (err) {
        console.error("Export failed:", err);
        toast.error("Failed to generate ledger export");
      } finally {
        setIsExporting(false);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-20">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-purple-400 bg-purple-500/5 border border-purple-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Ledger & Payments Hub
            </span>
            <span className="text-[9px] font-mono text-neutral-500">
              PAYTM_UPI · PAYPAL · RECOVERY_RADAR
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
            Payments_<span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Intelligence</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]" />
              Paytm UPI + PayPal Gateway Active
            </p>
            <span className="text-neutral-800 text-[9px] font-mono hidden xs:inline">|</span>
            <p className="text-[9px] font-mono text-amber-400 uppercase tracking-wider bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1.5">
              <UserX size={10} />
              {metrics.leadsCount} Unpaid Recoverable Leads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <button 
            onClick={() => fetchTransactionData(true)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={cn("text-neutral-500", isRefreshing && "animate-spin text-red-500")} />
            {isRefreshing ? "SYNCING..." : "SYNC NOW"}
          </button>
          
          <button 
            onClick={handleExport}
            disabled={isExporting || transactions.length === 0}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-white hover:border-red-500/20 rounded-xl transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw size={12} className="animate-spin text-red-500" />
                EXPORTING...
              </>
            ) : (
              <>
                <Download size={12} />
                EXPORT_CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- Revenue & Recovery HUD Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HUDCard 
          label="Gross Revenue" 
          value={`₹${Math.round(metrics.grossRevenueINR).toLocaleString()}`}
          sub={metrics.grossRevenueUSD > 0 ? `+ $${Math.round(metrics.grossRevenueUSD)} USD` : "Verified volume"}
          icon={DollarSign}
          color="emerald" 
        />
        
        <HUDCard 
          label="Conversion Ratio" 
          value={`${metrics.successRate}%`} 
          sub={`${metrics.paidCount} Paid / ${transactions.length} Attempts`} 
          icon={Activity} 
          color="purple" 
          circularProgress={parseFloat(metrics.successRate)}
        />
        
        <HUDCard 
          label="Unpaid Drop-offs" 
          value={metrics.unpaidCount} 
          sub={`₹${Math.round(metrics.lostRevenueINR).toLocaleString()} Potential Lost`} 
          icon={XCircle} 
          color="red" 
        />

        <HUDCard 
          label="Follow-up Leads" 
          value={metrics.leadsCount} 
          sub="Users who tried & didn't pay" 
          icon={Mail} 
          color="blue" 
        />
      </div>

      {/* --- View Mode Switcher (All Ledger vs Recoverable Leads) --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/60 p-1.5 rounded-2xl border border-neutral-900">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
              activeTab === "all"
                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            All Attempts ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab("paid")}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
              activeTab === "paid"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            Paid ({metrics.paidCount})
          </button>

          <button
            onClick={() => setActiveTab("unpaid")}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
              activeTab === "unpaid"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <AlertTriangle size={11} />
            Unpaid Drop-offs ({metrics.unpaidCount})
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
              activeTab === "leads"
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                : "text-blue-400/70 hover:text-blue-300"
            )}
          >
            <Sparkles size={11} className="text-blue-400" />
            Reach-out Leads ({metrics.leadsCount})
          </button>

          <button
            onClick={() => setActiveTab("paytm")}
            className={cn(
              "px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all hidden sm:inline-block",
              activeTab === "paytm"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            Paytm UPI
          </button>

          <button
            onClick={() => setActiveTab("paypal")}
            className={cn(
              "px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all hidden sm:inline-block",
              activeTab === "paypal"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            PayPal
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={13} />
          <input 
            placeholder="Search email, name, phone, orderId..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl py-2 pl-9 pr-8 text-[10px] font-mono text-white placeholder:text-neutral-600 focus:border-red-500/30 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ─── TAB VIEW: RECOVERABLE LEADS (Users Who Attempted Payment & Didn't Pay) ─── */}
      {activeTab === "leads" ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={13} />
                High-Intent Abandoned Checkout Leads
              </h3>
              <p className="text-[10px] font-mono text-neutral-400">
                These users attempted to buy a subscription but did not complete payment. Reach out with an email or WhatsApp to recover them!
              </p>
            </div>
            <span className="text-[9px] font-mono text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
              {summary?.recoverableLeads?.length || 0} PROSPECTIVE STUDENTS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-12 text-center text-neutral-500 text-[10px] font-mono uppercase tracking-widest animate-pulse">
                Finding recoverable leads...
              </div>
            ) : (!summary?.recoverableLeads || summary.recoverableLeads.length === 0) ? (
              <div className="col-span-full py-12 text-center text-neutral-600 text-[10px] font-mono uppercase tracking-widest">
                No unpaid leads found. All checkouts either succeeded or converted!
              </div>
            ) : (
              summary.recoverableLeads.map((lead) => (
                <div
                  key={lead.email}
                  className="bg-neutral-950/80 border border-neutral-900 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 relative group shadow-lg"
                >
                  <div className="space-y-3">
                    {/* User Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner">
                          {lead.name ? lead.name.charAt(0).toUpperCase() : lead.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white uppercase tracking-wider truncate">
                            {lead.name || "Scholar"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-mono text-neutral-400 truncate max-w-[150px]">
                              {lead.email}
                            </span>
                            <button
                              onClick={() => handleCopy(lead.email, `lead-email-${lead.email}`)}
                              className="text-neutral-500 hover:text-white transition-colors"
                              title="Copy Email"
                            >
                              {copiedKey === `lead-email-${lead.email}` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border text-amber-400 bg-amber-500/10 border-amber-500/20">
                        {lead.attemptsCount} {lead.attemptsCount > 1 ? "attempts" : "attempt"}
                      </span>
                    </div>

                    {/* Attempt Details */}
                    <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-850 space-y-2 text-[10px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Attempted Plan:</span>
                        <span className="text-white font-bold">{lead.lastPlan}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Target Value:</span>
                        <span className="text-white font-bold font-mono">
                          {lead.currencySymbol}{lead.lastAmount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Gateway:</span>
                        <span className="text-neutral-300 uppercase font-semibold">
                          {lead.lastPaymentMethod}
                        </span>
                      </div>
                      {lead.mobile && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Mobile Phone:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-400 font-bold">{lead.mobile}</span>
                            <button
                              onClick={() => handleCopy(lead.mobile!, `lead-phone-${lead.email}`)}
                              className="text-neutral-500 hover:text-white"
                            >
                              {copiedKey === `lead-phone-${lead.email}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="pt-1 border-t border-neutral-800">
                        <span className="text-neutral-500 block text-[9px]">Last Drop Reason:</span>
                        <span className="text-red-400 text-[9px] font-semibold line-clamp-2">
                          {lead.lastReason || "Incomplete checkout"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reach Out Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-900">
                    <button
                      onClick={() => openReachOutModal(lead)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-bold tracking-wider transition-colors shadow-md"
                    >
                      <Mail size={12} />
                      Reach Out
                    </button>

                    {lead.mobile && (
                      <a
                        href={`https://wa.me/${lead.mobile.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hi ${lead.name || "Scholar"}, this is Om from Paperxify. Noticed you were checking out ${lead.lastPlan}. Let me know if you need any help with UPI or payment!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold transition-colors flex items-center gap-1"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={12} />
                        WhatsApp
                      </a>
                    )}

                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(
                        `Special Assistance with your Paperxify (${lead.lastPlan}) checkout`
                      )}&body=${encodeURIComponent(
                        `Hi ${lead.name || "Scholar"},\n\nWe noticed you recently tried subscribing to Paperxify (${lead.lastPlan}), but the payment was not completed.\n\nReply to this email if you need any help or a special discount voucher!`
                      )}`}
                      className="py-2 px-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white text-neutral-400 text-[10px] transition-colors"
                      title="Open default email app"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ─── TAB VIEW: FULL FINANCIAL LEDGER TABLE ─── */
        <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl overflow-hidden backdrop-blur-md">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/60">
                  <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Reference / Gateway</th>
                  <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Personnel & Contact</th>
                  <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Package Detail</th>
                  <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Amount</th>
                  <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Status & Reason</th>
                  <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Timestamp</th>
                  <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/60">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 text-[10px] uppercase tracking-widest animate-pulse">
                        Syncing Financial Ledger...
                      </td>
                    </tr>
                  ) : filteredTxns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-600 text-[10px] uppercase tracking-widest">
                        No Transactions or Checkout Records Found
                      </td>
                    </tr>
                  ) : (
                    filteredTxns.map((txn) => {
                      const isSuccess = txn.status === "success";
                      const sym = txn.currencySymbol || (txn.currency === "INR" ? "₹" : "$");
                      return (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={txn._id || txn.orderId} 
                          className="group hover:bg-neutral-950/90 transition-colors cursor-default"
                        >
                          {/* Reference ID & Gateway */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                                <Receipt size={11} className="text-neutral-500" />
                                {txn.orderId || txn.paymentId || "ORDER_ID"}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "text-[7.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                  txn.paymentMethod === "paytm" || txn.paymentMethod === "upi"
                                    ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                )}>
                                  {txn.paymentMethod === "paytm" ? "Paytm UPI" : txn.paymentMethod?.toUpperCase() || "PAYPAL"}
                                </span>
                                {txn.paymentMode && (
                                  <span className="text-[7.5px] font-mono text-neutral-500">
                                    {txn.paymentMode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Personnel & Contact */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-inner">
                                {txn.userName ? txn.userName.charAt(0).toUpperCase() : (txn.userEmail ? txn.userEmail.charAt(0).toUpperCase() : <User size={10} />)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[160px]">
                                  {txn.userName || "Unknown Scholar"}
                                </p>
                                <div className="flex items-center gap-1">
                                  <p className="text-[8px] text-neutral-400 truncate max-w-[150px]">{txn.userEmail}</p>
                                  <button
                                    onClick={() => handleCopy(txn.userEmail, `t-email-${txn._id}`)}
                                    className="text-neutral-600 hover:text-white"
                                  >
                                    {copiedKey === `t-email-${txn._id}` ? <Check size={9} className="text-emerald-400" /> : <Copy size={9} />}
                                  </button>
                                </div>
                                {txn.userMobile && (
                                  <p className="text-[8px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                                    <Phone size={8} /> {txn.userMobile}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Package Detail */}
                          <td className="px-5 py-4">
                            <div className="flex items-center">
                              <span className={cn(
                                "text-[8px] font-bold uppercase tracking-wider rounded border py-1 px-2.5 flex items-center gap-1.5 shrink-0",
                                txn.packageId === 'power' 
                                  ? "text-amber-400 bg-amber-500/5 border-amber-500/10" 
                                  : "text-purple-400 bg-purple-500/5 border-purple-500/10"
                              )}>
                                <ShieldCheck size={9} />
                                {txn.packageName}
                              </span>
                            </div>
                          </td>
                          
                          {/* Amount */}
                          <td className="px-5 py-4">
                            <span className="text-[11px] font-bold text-white italic tracking-tighter">
                              {sym}{txn.amount}
                            </span>
                          </td>
                          
                          {/* Status & Reason */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1 items-start">
                              <StatusIndicator status={txn.status} />
                              {txn.failureReason && (
                                <span className="text-[7.5px] text-red-400/90 font-mono line-clamp-1 max-w-[200px]" title={txn.failureReason}>
                                  {txn.failureReason}
                                </span>
                              )}
                            </div>
                          </td>
                          
                          {/* Timestamp */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-neutral-500 uppercase tracking-tighter">
                              <Calendar size={11} className="text-neutral-600"/> 
                              {new Date(txn.timestamp).toLocaleString('en-US', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </div>
                          </td>

                          {/* Reach Out Action */}
                          <td className="px-5 py-4 text-right">
                            {!isSuccess && txn.userEmail && (
                              <button
                                onClick={() => openReachOutModal({
                                  userId: txn.userId,
                                  email: txn.userEmail,
                                  name: txn.userName,
                                  mobile: txn.userMobile || null,
                                  country: txn.userCountry || "IN",
                                  city: txn.userCity || "",
                                  picture: txn.userPicture || "",
                                  lastAttemptDate: txn.timestamp,
                                  lastPlan: txn.packageName,
                                  lastAmount: txn.amount,
                                  currency: txn.currency || "INR",
                                  currencySymbol: sym,
                                  lastPaymentMethod: txn.paymentMethod || "paytm",
                                  lastStatus: txn.status,
                                  lastReason: txn.failureReason || "Incomplete checkout",
                                  attemptsCount: 1,
                                  orderIds: [txn.orderId],
                                })}
                                className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-500/30 text-neutral-300 hover:text-white text-[9px] font-mono font-bold inline-flex items-center gap-1 transition-all"
                              >
                                <Mail size={10} className="text-red-400" />
                                Reach Out
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-neutral-900/60 bg-neutral-950/20">
            {loading ? (
              <div className="p-10 text-center text-neutral-500 text-[10px] font-mono uppercase tracking-widest animate-pulse">
                Syncing Financial Ledger...
              </div>
            ) : filteredTxns.length === 0 ? (
              <div className="p-10 text-center text-neutral-600 text-[10px] font-mono uppercase tracking-widest">
                No Transactions Found
              </div>
            ) : (
              filteredTxns.map((txn) => {
                const sym = txn.currencySymbol || (txn.currency === "INR" ? "₹" : "$");
                return (
                  <div key={txn._id || txn.orderId} className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-white break-all flex items-center gap-1.5">
                          <Receipt size={10} className="text-neutral-500 shrink-0" />
                          {txn.orderId || txn.paymentId}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border text-blue-400 bg-blue-500/10 border-blue-500/20">
                            {txn.paymentMethod || "Paytm"}
                          </span>
                          <span className="text-[7.5px] font-mono text-neutral-500">
                            {txn.paymentMode || "UPI"}
                          </span>
                        </div>
                      </div>
                      <StatusIndicator status={txn.status} />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {txn.userName ? txn.userName.charAt(0).toUpperCase() : (txn.userEmail ? txn.userEmail.charAt(0).toUpperCase() : <User size={10} />)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate">
                          {txn.userName || "Unknown Scholar"}
                        </p>
                        <p className="text-[8px] text-neutral-500 truncate">{txn.userEmail}</p>
                        {txn.userMobile && (
                          <p className="text-[8px] text-emerald-400 font-mono">{txn.userMobile}</p>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-white italic tracking-tighter shrink-0">
                        {sym}{txn.amount}
                      </span>
                    </div>

                    {txn.failureReason && (
                      <p className="text-[8px] font-mono text-red-400/90 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                        Reason: {txn.failureReason}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-900/60">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider rounded border py-0.5 px-2 text-purple-400 bg-purple-500/5 border-purple-500/10">
                        {txn.packageName}
                      </span>
                      
                      {txn.status !== "success" && (
                        <button
                          onClick={() => openReachOutModal({
                            userId: txn.userId,
                            email: txn.userEmail,
                            name: txn.userName,
                            mobile: txn.userMobile || null,
                            country: txn.userCountry || "IN",
                            city: txn.userCity || "",
                            picture: txn.userPicture || "",
                            lastAttemptDate: txn.timestamp,
                            lastPlan: txn.packageName,
                            lastAmount: txn.amount,
                            currency: txn.currency || "INR",
                            currencySymbol: sym,
                            lastPaymentMethod: txn.paymentMethod || "paytm",
                            lastStatus: txn.status,
                            lastReason: txn.failureReason || "Incomplete checkout",
                            attemptsCount: 1,
                            orderIds: [txn.orderId],
                          })}
                          className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[9px] font-mono font-bold text-white flex items-center gap-1"
                        >
                          <Mail size={10} className="text-red-400" />
                          Reach Out
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Table Footer */}
          <div className="p-5 bg-neutral-950/60 border-t border-neutral-900/65 text-center">
            <p className="text-[8px] font-mono font-black text-neutral-600 uppercase tracking-[0.3em]">
              Financial Intelligence Node // Total Indexed Attempts: {filteredTxns.length}
            </p>
          </div>
        </div>
      )}

      {/* ─── REACH OUT MODAL (Email / WhatsApp Follow-up) ─── */}
      <AnimatePresence>
        {reachOutLead && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Reach Out to Abandoned Lead</h3>
                    <p className="text-[10px] font-mono text-neutral-500">
                      Sending recovery assistance to {reachOutLead.name} ({reachOutLead.email})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReachOutLead(null)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Lead Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-850 text-[10px] font-mono">
                <div>
                  <span className="text-neutral-500 block text-[8.5px]">Attempted Plan</span>
                  <span className="text-white font-bold">{reachOutLead.lastPlan}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[8.5px]">Value</span>
                  <span className="text-white font-bold font-mono">
                    {reachOutLead.currencySymbol}{reachOutLead.lastAmount}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[8.5px]">Gateway</span>
                  <span className="text-blue-400 font-bold uppercase">{reachOutLead.lastPaymentMethod}</span>
                </div>
                <div className="col-span-full pt-1 border-t border-neutral-800/80">
                  <span className="text-neutral-500 block text-[8.5px]">Reported Failure / Cancellation Reason</span>
                  <span className="text-red-400 font-semibold">{reachOutLead.lastReason || "Incomplete checkout"}</span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Subject Line
                  </label>
                  <input
                    value={reachOutSubject}
                    onChange={(e) => setReachOutSubject(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-red-500/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Email Message Body
                  </label>
                  <textarea
                    rows={5}
                    value={reachOutMessage}
                    onChange={(e) => setReachOutMessage(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-white focus:border-red-500/40 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Optional Voucher Code (Embedded in Email)
                  </label>
                  <input
                    value={reachOutDiscount}
                    onChange={(e) => setReachOutDiscount(e.target.value)}
                    placeholder="e.g. STUDY30 or OM50"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-red-500/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-900">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {reachOutLead.mobile && (
                    <a
                      href={`https://wa.me/${reachOutLead.mobile.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hi ${reachOutLead.name}, this is Om from Paperxify. Noticed you were checking out ${reachOutLead.lastPlan}. Let me know if you need any help with UPI or payment!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare size={13} />
                      WhatsApp
                    </a>
                  )}

                  <a
                    href={`mailto:${reachOutLead.email}?subject=${encodeURIComponent(reachOutSubject)}&body=${encodeURIComponent(reachOutMessage)}`}
                    className="py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white text-neutral-400 text-xs font-mono transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    Open in Gmail
                  </a>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setReachOutLead(null)}
                    className="py-2.5 px-4 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-mono transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSendReachOutEmail}
                    disabled={isSendingEmail}
                    className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-2 shadow-lg"
                  >
                    {isSendingEmail ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Send via Paperxify
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Specialized UI Components ---

interface HUDCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: any;
  color: "emerald" | "purple" | "blue" | "red";
  circularProgress?: number;
}

function HUDCard({ label, value, sub, icon: Icon, color, circularProgress }: HUDCardProps) {
  let hoverBorder = "hover:border-red-500/40";
  let textColor = "text-red-400";
  let strokeColor = "#ef4444";
  
  if (color === "emerald") {
    hoverBorder = "hover:border-emerald-500/45";
    textColor = "text-emerald-400";
    strokeColor = "#10b981";
  } else if (color === "blue") {
    hoverBorder = "hover:border-blue-500/45";
    textColor = "text-blue-400";
    strokeColor = "#3b82f6";
  } else if (color === "purple") {
    hoverBorder = "hover:border-purple-500/45";
    textColor = "text-purple-400";
    strokeColor = "#a855f7";
  }

  return (
    <div className={cn(
      "bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group transition-all duration-300 shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[140px]",
      hoverBorder
    )}>
      {/* Decorative Glow */}
      <div 
        className="absolute -top-12 -left-12 w-24 h-24 rounded-full filter blur-[30px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none" 
        style={{ backgroundColor: strokeColor }} 
      />

      <div className="flex items-start justify-between relative z-10 gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-[0.25em] mb-1.5">{label}</p>
          <h4 className="text-2xl sm:text-3xl font-mono font-black italic tracking-tight text-white leading-none truncate">
            {value}
          </h4>
        </div>
        
        {circularProgress !== undefined ? (
          <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-neutral-900" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-purple-500" strokeDasharray={`${circularProgress}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-[8px] font-mono font-black text-white">{Math.round(circularProgress)}%</span>
          </div>
        ) : (
          <div className={cn("p-2 rounded-xl bg-neutral-900 border border-neutral-850 shrink-0", textColor)}>
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="mt-4 pt-2.5 border-t border-neutral-900/40 flex items-center justify-between relative z-10">
        <span className="text-[8px] font-mono text-neutral-500 tracking-tight flex items-center gap-1.5 truncate">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          {sub}
        </span>
        
        {color === "blue" && (
          <span className="text-[7px] font-mono font-bold text-blue-400 bg-blue-500/5 border border-blue-500/15 px-1.5 py-0.5 rounded uppercase shrink-0">
            RADAR ACTIVE
          </span>
        )}
        {color === "emerald" && (
          <span className="text-[7px] font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 shrink-0">
            <ArrowUpRight size={8} /> LIVE
          </span>
        )}
        {color === "red" && (
          <span className="text-[7px] font-mono font-bold text-red-400 bg-red-500/5 border border-red-500/15 px-1.5 py-0.5 rounded uppercase shrink-0">
            UNCONVERTED
          </span>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const s = status.toLowerCase();
  
  if (s === "success" || s === "activated") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[8px] font-bold uppercase tracking-wider shrink-0 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
        <CheckCircle2 size={9} />
        <span>PAID</span>
      </span>
    );
  }

  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[8px] font-bold uppercase tracking-wider shrink-0 bg-amber-500/10 border-amber-500/20 text-amber-400">
        <AlertTriangle size={9} />
        <span>CANCELLED</span>
      </span>
    );
  }

  if (s === "abandoned" || s === "created") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[8px] font-bold uppercase tracking-wider shrink-0 bg-slate-500/10 border-slate-500/20 text-neutral-400">
        <Clock size={9} />
        <span>ABANDONED</span>
      </span>
    );
  }

  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[8px] font-bold uppercase tracking-wider shrink-0 bg-orange-500/10 border-orange-500/20 text-orange-400">
        <Clock size={9} />
        <span>PENDING</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[8px] font-bold uppercase tracking-wider shrink-0 bg-red-500/10 border-red-500/20 text-red-400">
      <XCircle size={9} />
      <span>FAILED</span>
    </span>
  );
}
