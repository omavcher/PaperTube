"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  User, CreditCard, History, Zap, Flame, ShieldCheck, Settings, LogOut, 
  ChevronRight, Calendar, Smartphone, Mail, Award, FileText, Layers,
  Download, Loader2, AlertCircle, MessageCircle, Clock, RefreshCw, TrendingUp, 
  Crown, Sparkles, Video, Check, ArrowRight, ExternalLink, CheckCircle2, 
  X, ChevronDown, Laptop, Shield, Search, ArrowLeft, BarChart2, Activity,
  Globe, Cpu, CheckSquare, Boxes, HardDrive, Bell, Moon, Sun, Lock
} from "lucide-react";
import { LoaderX } from "@/components/LoaderX";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/config/api"; 
import { toast } from "sonner";
import SupportTab from "./SupportTab";
import Link from "next/link";

// --- PDF Generation Libraries ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Helpers ---
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

// --- NUMBER TO WORDS (US Dollars for Invoices) ---
const numToWords = (n: number) => {
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const numToWord = (num: number): string => {
    if ((num = num.toString().length > 9 ? parseFloat(num.toString().slice(0, 9)) : num) === 0) return "";
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10];
    if (num < 1000) return a[Math.floor(num / 100)] + "Hundred " + numToWord(num % 100);
    if (num < 1000000) return numToWord(Math.floor(num / 1000)) + "Thousand " + numToWord(num % 1000);
    if (num < 1000000000) return numToWord(Math.floor(num / 1000000)) + "Million " + numToWord(num % 1000000);
    return numToWord(Math.floor(num / 1000000000)) + "Billion " + numToWord(num % 1000000000);
  };

  const [dollars, cents] = n.toFixed(2).split(".");
  let str = "US Dollars " + (parseInt(dollars) === 0 ? "Zero " : numToWord(parseInt(dollars)));
  if (parseInt(cents) > 0) {
    str += "and " + numToWord(parseInt(cents)) + "Cents ";
  }
  return str + "Only";
};

type SettingsTab = "usage" | "profile" | "billing" | "history" | "integrations" | "support";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("usage");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [quotaData, setQuotaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingQuota, setRefreshingQuota] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncingPaypal, setIsSyncingPaypal] = useState(false);
  const [showPaypalSyncModal, setShowPaypalSyncModal] = useState(false);
  const [customOrderId, setCustomOrderId] = useState("");

  // --- AUTH HELPER ---
  const getAuthToken = useCallback(() => (typeof window !== "undefined" ? localStorage.getItem("authToken") : null), []);

  const handleSyncPaypalOrder = useCallback(async (orderIdToSync?: string) => {
    try {
      setIsSyncingPaypal(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      let targetId = orderIdToSync || customOrderId.trim();
      if (!targetId && typeof window !== "undefined") {
        const pendingStr = localStorage.getItem("paperxify_pending_paypal_order");
        if (pendingStr) {
          try {
            const parsed = JSON.parse(pendingStr);
            targetId = parsed.orderId;
          } catch {}
        }
      }

      if (!targetId) {
        toast.error("Please provide your PayPal Order ID or Transaction ID.");
        setIsSyncingPaypal(false);
        return;
      }

      const res = await api.post(
        "/payment/paypal/sync-order",
        { orderId: targetId },
        { headers: { Auth: token } }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "PayPal subscription successfully verified and activated!");
        if (typeof window !== "undefined") {
          localStorage.removeItem("paperxify_pending_paypal_order");
        }
        if (res.data.user) {
          setProfileData(res.data.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(res.data.user));
            window.dispatchEvent(new Event("auth-change"));
            window.dispatchEvent(new Event("capacity-updated"));
          }
        }
        setShowPaypalSyncModal(false);
        setCustomOrderId("");
      } else {
        toast.error(res.data?.message || "Could not sync PayPal order.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to sync PayPal order. Please check the ID.");
    } finally {
      setIsSyncingPaypal(false);
    }
  }, [customOrderId]);

  // --- REFRESH QUOTA STATUS ---
  const handleRefreshQuota = async () => {
    try {
      setRefreshingQuota(true);
      const token = getAuthToken();
      if (!token) return;
      const qRes = await api.get("/users/quota-status", { headers: { Auth: token } });
      if (qRes?.data?.success) {
        setQuotaData(qRes.data.data);
        toast.success("Usage limits and compute quotas updated.");
      }
    } catch {
      toast.error("Could not refresh quota status.");
    } finally {
      setRefreshingQuota(false);
    }
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
          window.location.href = "/";
          return;
        }

        const [res, qRes] = await Promise.all([
          api.get("/auth/get-profile", { headers: { Auth: token } }),
          api.get("/users/quota-status", { headers: { Auth: token } }).catch(() => null),
        ]);

        if (res.data?.success && res.data?.user) {
          setProfileData(res.data.user);
          try {
            localStorage.setItem("user", JSON.stringify(res.data.user));
            window.dispatchEvent(new Event("auth-change"));
          } catch {}
        } else {
          setError(res.data?.message || "Failed to load profile");
        }

        if (qRes?.data?.success) {
          setQuotaData(qRes.data.data);
        }

        // Auto-check for any pending unconfirmed PayPal payment
        const pendingStr = localStorage.getItem("paperxify_pending_paypal_order");
        if (pendingStr) {
          try {
            const p = JSON.parse(pendingStr);
            if (p?.orderId && Date.now() - (p.timestamp || 0) < 24 * 60 * 60 * 1000) {
              handleSyncPaypalOrder(p.orderId);
            }
          } catch {}
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError("An error occurred while fetching your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [getAuthToken, handleSyncPaypalOrder]);

  // --- PDF GENERATION LOGIC ---
  const generateInvoice = async (tx: any) => {
    if (!profileData) return;
    setDownloadingId(tx._id);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const user = profileData;

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("Paperxify", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Email: support@paperxify.com", 14, 29);
    doc.text("paperxify.com", 14, 34);

    // --- Invoice Meta ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("INVOICE", pageWidth - 14, 22, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    const invoiceNo = tx._id ? tx._id.toUpperCase() : "DRAFT";

    doc.text(`Invoice No: INV-${invoiceNo}`, pageWidth - 14, 30, { align: "right" });
    doc.text(`Date: ${formatDate(tx.timestamp)}`, pageWidth - 14, 35, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, 48, pageWidth - 14, 48);

    // --- Bill To ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("Bill To:", 14, 58);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(user.name || "Customer", 14, 64);
    doc.text(user.email || "", 14, 69);
    if (user.mobile) doc.text(`Mobile: ${user.mobile}`, 14, 74);

    const totalAmt = parseFloat(tx.amount || 0);

    autoTable(doc, {
      startY: 85,
      head: [["Description", "Period", "Amount"]],
      body: [[`${tx.packageName || "Subscription"} Plan`, tx.billingPeriod || "Monthly", `$${totalAmt.toFixed(2)}`]],
      theme: "grid",
      headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 5, textColor: [50, 50, 50] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Total Amount in Words:", 14, finalY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(numToWords(totalAmt), 14, finalY + 6);

    const rightColX = pageWidth - 60;
    const valueX = pageWidth - 14;
    doc.setDrawColor(200);
    doc.line(rightColX, finalY + 10, pageWidth - 14, finalY + 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text("Grand Total:", rightColX, finalY + 18);
    doc.text(`$${totalAmt.toFixed(2)}`, valueX, finalY + 18, { align: "right" });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer generated invoice and does not require a physical signature.", 14, pageHeight - 30);
    doc.setFont("helvetica", "bold");
    doc.text("Paperxify - Empowering Knowledge", 14, pageHeight - 24);

    doc.save(`Invoice_${invoiceNo}.pdf`);
    setDownloadingId(null);
  };

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const user = profileData || {};
  const isPremium = Boolean(user.membership?.isActive);
  const planName = user.membership?.planName || (isPremium ? "Pro Scholar" : "Free Plan");

  // Capacity calculations
  const cap = quotaData?.capacity;
  const capPercentage = cap?.percentage ?? 0;
  const capRemaining = cap?.remainingPercentage ?? Math.max(0, 100 - capPercentage);
  const period = quotaData?.period || (isPremium ? "monthly" : "daily");
  const resetsAtDesc = cap?.resetsAt || (period === "daily" ? "Tonight at 00:00 UTC" : "Next monthly cycle");
  const maxVideoLengthMin = quotaData?.maxVideoLengthMin || (isPremium ? 240 : 60);

  // Dynamic calculations for real analytics
  const totalNotes = user.noteCreationHistory?.length || 0;
  const totalXP = user.xp || 120;
  const streakCount = user.streak?.count || 1;
  const usedCapUnits = quotaData?.capacity?.usedUnits || 0;



  // Navigation Items
  const navItems = [
    { id: "usage", label: "Usage", icon: Zap, badge: `${capRemaining}% left` },
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard, badge: isPremium ? "Active" : undefined },
    { id: "history", label: "History", icon: History, count: totalNotes },
    { id: "integrations", label: "Integrations & Tools", icon: Boxes },
    { id: "support", label: "Help & Support", icon: MessageCircle },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Early returns (after all React hooks have executed unconditionally)
  if (loading) {
    return <LoaderX />;
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white gap-3 p-4 font-sans select-none">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-red-400 mb-1">
          <AlertCircle size={22} />
        </div>
        <h2 className="text-base font-semibold tracking-tight">Unable to Load Account</h2>
        <p className="text-xs text-neutral-400 max-w-xs text-center">{error || "Account information could not be retrieved."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-100 font-sans selection:bg-red-500/20 selection:text-white flex flex-col md:flex-row antialiased">
      
      {/* ─── CHATGPT STYLE LEFT SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#070709] flex flex-col shrink-0 select-none">
        
        {/* Top Header & Back to App */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to app</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-white/[0.05] text-neutral-400 hover:text-white"
          >
            <ChevronDown size={14} className={cn("transition-transform", mobileMenuOpen && "rotate-180")} />
          </button>
        </div>

        {/* Search Bar (ChatGPT Settings Style) */}
        <div className="p-3 border-b border-white/[0.04]">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Navigation Categories */}
        <div className={cn("flex-1 overflow-y-auto p-3 space-y-4", !mobileMenuOpen && "hidden md:block")}>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-3 py-1 block">
              Personal
            </span>

            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id as SettingsTab);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left",
                    isActive
                      ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={14} className={isActive ? "text-white" : "text-neutral-400"} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded-md",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/[0.05] text-neutral-400 border border-white/[0.08]"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && !item.badge && (
                    <span className="text-[10px] font-mono text-neutral-500">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: User Card & Sign Out */}
        <div className="p-3 border-t border-white/[0.06] bg-[#050507]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-8 h-8 rounded-xl border border-white/[0.1] shrink-0">
                <AvatarImage src={user.picture} className="object-cover" />
                <AvatarFallback className="bg-neutral-800 text-white font-medium text-xs">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px] text-neutral-500 truncate font-mono">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-h-screen p-5 sm:p-8 lg:p-12 max-w-5xl">
        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: USAGE (DIRECTLY INSPIRED BY CHATGPT & MODERN AI APPS)
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "usage" && (
            <motion.div
              key="usage"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Usage</h1>
              </div>

              {/* Plan limits (Direct replica of ChatGPT screenshot) */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">Plan limits</h2>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Shared across Lecture Synthesizer, Autonomous Agent, PaperChat Tutor, and Visual Studio.
                    Conversations and cached revisions are not counted. To increase usage,{" "}
                    <Link href="/pricing" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                      upgrade your plan
                    </Link>
                    .
                  </p>
                </div>

                {/* Single Clean Full-Width Usage Meter (Just like ChatGPT) */}
                <div className="p-5 rounded-2xl bg-[#0c0c10] border border-white/[0.08] space-y-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">
                        {period === "daily" ? "Daily usage limit" : "Monthly usage limit"}
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5 font-mono">
                        Resets {resetsAtDesc}
                      </span>
                    </div>
                    <span className="font-semibold font-mono text-white text-sm">
                      {capRemaining}% remaining
                    </span>
                  </div>

                  {/* Full-width Sleek Minimalist Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-[#1e1e24] overflow-hidden p-0">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, capRemaining))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Usage limit resets (Direct replica of ChatGPT Section 2) */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">Usage limit resets</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Use automatic replenishment or upgrade to expand your monthly computing capacity.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0c0c10] border border-white/[0.08] p-5 space-y-4">
                  <div className="flex items-center gap-4 text-xs pb-3 border-b border-white/[0.06]">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <span>Available</span>
                      <span className="px-1.5 py-0.2 rounded bg-white/[0.1] text-neutral-300 font-mono text-[10px]">1</span>
                    </span>
                    <span className="text-neutral-500">History</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {isPremium ? "Full reset (Monthly)" : "Daily Auto-Refresh"}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-mono mt-1">
                        Next cycle: {resetsAtDesc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleRefreshQuota}
                        disabled={refreshingQuota}
                        className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={cn(refreshingQuota && "animate-spin text-blue-400")} />
                        <span>{refreshingQuota ? "Refreshing..." : "Sync Status"}</span>
                      </button>

                      {!isPremium && (
                        <Link
                          href="/pricing"
                          className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all shadow-sm"
                        >
                          Upgrade
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Workspace Capabilities (Clean, no micro-counters) */}
              <div className="space-y-3 pt-2">
                <h2 className="text-sm font-semibold text-white">Workspace Capabilities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#0c0c10] border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Video size={14} className="text-blue-400" />
                      <span>Lecture Processing</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Up to {maxVideoLengthMin >= 60 ? `${Math.round(maxVideoLengthMin / 60)} hours` : `${maxVideoLengthMin} mins`} per video with structured timestamp synthesis.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0c0c10] border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Cpu size={14} className="text-purple-400" />
                      <span>Autonomous Agent</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {isPremium ? "Full access to live Composio tools, web browsing & workspace actions." : "Standard reasoning agent for study synthesis and queries."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0c0c10] border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Visual Studio Concept Art</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {isPremium ? "High-definition diagram generation and creative concept illustrations." : "Standard AI concept diagrams embedded in study notes."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0c0c10] border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <MessageCircle size={14} className="text-emerald-400" />
                      <span>PaperChat Tutor</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Context-aware interactive conversational tutor attached to all your lecture material.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: PROFILE & IDENTITY
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
                <p className="text-xs text-neutral-400 mt-1">Manage your identity, study habit records, and account credentials.</p>
              </div>

              {/* Apple ID Style Identity Card */}
              <div className="rounded-2xl bg-[#0c0c10] border border-white/[0.08] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-white/[0.12] bg-[#16161c]">
                        <AvatarImage src={user.picture} className="object-cover" />
                        <AvatarFallback className="bg-neutral-800 text-white font-medium text-xl">
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isPremium && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md border-2 border-[#0c0c10]">
                          <Crown size={12} className="fill-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white truncate">
                          {user.name}
                        </h2>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide border",
                          isPremium
                            ? "bg-red-500/10 text-red-400 border-red-500/25"
                            : "bg-white/[0.05] text-neutral-400 border-white/[0.08]"
                        )}>
                          {planName}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 truncate font-mono">
                        {user.email}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-0.5 font-mono">
                        <span>@{user.username || "scholar"}</span>
                        <span>•</span>
                        <span>Member since {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all self-start sm:self-auto shadow-sm"
                  >
                    {isPremium ? "Manage Plan" : "Upgrade Plan"}
                  </Link>
                </div>

                {/* 4 Apple Activity Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06]">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] uppercase font-semibold">
                      <Flame size={12} className="text-amber-400" />
                      <span>Daily Streak</span>
                    </div>
                    <span className="text-base font-semibold text-white font-mono mt-1 block">
                      {streakCount} <span className="text-xs font-normal text-neutral-400 font-sans">days</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] uppercase font-semibold">
                      <Award size={12} className="text-purple-400" />
                      <span>Study XP</span>
                    </div>
                    <span className="text-base font-semibold text-white font-mono mt-1 block">
                      {totalXP.toLocaleString()} <span className="text-xs font-normal text-neutral-400 font-sans">pts</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] uppercase font-semibold">
                      <FileText size={12} className="text-blue-400" />
                      <span>Notes Synthesized</span>
                    </div>
                    <span className="text-base font-semibold text-white font-mono mt-1 block">
                      {totalNotes}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] uppercase font-semibold">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      <span>Security</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 mt-1 block">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Security Inset Table */}
              <div className="rounded-2xl bg-[#0c0c10] border border-white/[0.08] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Account Details</h3>

                <div className="divide-y divide-white/[0.04] text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-neutral-400">Email Address</span>
                    <span className="text-neutral-200 font-mono">{user.email}</span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <span className="text-neutral-400">Account ID</span>
                    <span className="text-neutral-400 font-mono">
                      USR-{String(user._id || "").slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <span className="text-neutral-400">Study Engine Priority</span>
                    <span className="text-white font-medium">
                      {isPremium ? "Priority Cloud GPU" : "Standard Cloud Inference"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: BILLING & INVOICES
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "billing" && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Billing</h1>
                <p className="text-xs text-neutral-400 mt-1">Manage subscriptions, view active plans, and download computer-generated tax invoices.</p>
              </div>

              {/* Active Plan Card */}
              <div className="rounded-2xl bg-[#0c0c10] border border-white/[0.08] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Current Plan</span>
                    <span className={cn(
                      "text-[9px] font-mono px-2 py-0.5 rounded-full border",
                      isPremium ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-white/[0.05] text-neutral-400 border-white/[0.08]"
                    )}>
                      {isPremium ? "Active" : "Free"}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{planName}</h3>
                  <p className="text-xs text-neutral-400">
                    {user.membership?.expiresAt 
                      ? `Renews automatically on ${formatDate(user.membership.expiresAt)}` 
                      : "Daily replenished allowances with standard synthesis queues."}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPaypalSyncModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} className={cn(isSyncingPaypal && "animate-spin text-blue-400")} />
                    <span>Sync PayPal</span>
                  </button>

                  <Link
                    href="/pricing"
                    className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-colors shadow-sm"
                  >
                    {isPremium ? "Change Plan" : "Upgrade Plan"}
                  </Link>
                </div>
              </div>

              {/* Purchase & Invoice Receipts Table */}
              <div className="rounded-2xl bg-[#0c0c10] border border-white/[0.08] p-5 space-y-3">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white">Payment & Invoice Receipts</h3>
                  <p className="text-[11px] text-neutral-400">Download authentic computer-generated PDF tax invoices</p>
                </div>

                {user.transactions && user.transactions.length > 0 ? (
                  <div className="divide-y divide-white/[0.04]">
                    {user.transactions.map((tx: any) => (
                      <div
                        key={tx._id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-1"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300 shrink-0">
                            <CreditCard size={15} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-white">{tx.packageName || "Subscription Plan"}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                {tx.status || "Paid"}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-neutral-500 font-mono mt-0.5">
                              INV-{tx._id.slice(-6).toUpperCase()} • {formatDate(tx.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:justify-end">
                          <span className="text-xs font-semibold text-white font-mono">
                            {formatCurrency(parseFloat(tx.amount || 0))}
                          </span>
                          <button
                            type="button"
                            onClick={() => generateInvoice(tx)}
                            disabled={downloadingId === tx._id}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {downloadingId === tx._id ? (
                              <Loader2 size={12} className="animate-spin text-neutral-400" />
                            ) : (
                              <Download size={12} />
                            )}
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-neutral-500 space-y-1">
                    <p>No billing transactions found.</p>
                    <p className="text-[11px] text-neutral-600">Your receipts will automatically generate here when you upgrade.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 4: CREATION HISTORY
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Creation History</h1>
                <p className="text-xs text-neutral-400 mt-1">All synthesized lecture notes, study decks, and summaries generated by your account.</p>
              </div>

              <div className="rounded-2xl bg-[#0c0c10] border border-white/[0.08] p-5 space-y-3">
                <div className="divide-y divide-white/[0.04]">
                  {user.noteCreationHistory && user.noteCreationHistory.length > 0 ? (
                    user.noteCreationHistory.map((note: any) => (
                      <div
                        key={note._id}
                        className="py-3 flex items-center justify-between gap-3 group first:pt-1 last:pb-1"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300 shrink-0">
                            <FileText size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-neutral-200 group-hover:text-white truncate transition-colors">
                              {note.title || "Study Lecture Notes"}
                            </p>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              Created on {formatDate(note.createdAt)}
                            </span>
                          </div>
                        </div>

                        {note.slug && (
                          <Link
                            href={`/notes/${note.slug}`}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink size={11} className="text-neutral-400" />
                          </Link>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-neutral-500">
                      No activity history logged yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 5: INTEGRATIONS & CONNECTED APPS
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "integrations" && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Integrations & Tools</h1>
                <p className="text-xs text-neutral-400 mt-1">Manage connected third-party toolkits and autonomous agent app actions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "Google Drive & Docs", desc: "Directly sync lecture study notes and PDFs to your Google Drive.", icon: HardDrive, active: true },
                  { name: "GitHub Integration", desc: "Allow autonomous agent to inspect repositories and code examples.", icon: Cpu, active: true },
                  { name: "Notion Workspace", desc: "One-click export of structured study notes and flashcards into Notion.", icon: FileText, active: true },
                  { name: "Slack & Discord", desc: "Receive instant study reminders and lecture digest notifications.", icon: Bell, active: false },
                ].map((app, idx) => {
                  const Icon = app.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-[#0c0c10] border border-white/[0.08] flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className="text-neutral-300" />
                          <h4 className="text-xs font-semibold text-white">{app.name}</h4>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{app.desc}</p>
                      </div>

                      <span className={cn(
                        "text-[9px] font-mono px-2 py-0.5 rounded-full shrink-0 border",
                        app.active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-white/[0.04] text-neutral-500 border-white/[0.06]"
                      )}>
                        {app.active ? "Enabled" : "Available"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 6: HELP & SUPPORT
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "support" && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <SupportTab user={user} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── PAYPAL SYNC MODAL ────────────────────────────────────────────── */}
        <AnimatePresence>
          {showPaypalSyncModal && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPaypalSyncModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.15 }}
                className="relative z-10 w-full max-w-sm rounded-2xl bg-[#14141a] border border-white/[0.12] p-5 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <h4 className="text-sm font-semibold text-white">Sync PayPal Subscription</h4>
                  <button
                    type="button"
                    onClick={() => setShowPaypalSyncModal(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enter your PayPal Order ID or Transaction ID to immediately verify and activate your subscription.
                </p>

                <input
                  type="text"
                  value={customOrderId}
                  onChange={(e) => setCustomOrderId(e.target.value)}
                  placeholder="e.g. 5O190127TN364715T"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                />

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPaypalSyncModal(false)}
                    className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-neutral-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSyncPaypalOrder()}
                    disabled={isSyncingPaypal}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSyncingPaypal ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    <span>{isSyncingPaypal ? "Verifying…" : "Sync Order"}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}