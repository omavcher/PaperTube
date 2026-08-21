"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  User, CreditCard, History, Zap, Flame, ShieldCheck, Settings, LogOut, 
  ChevronRight, Calendar, Smartphone, Mail, Award, Coins, FileText, Layers,
  Download, Loader2, AlertCircle, MessageCircle, Clock, RefreshCw, TrendingUp, 
  Crown, Sparkles, Video, Presentation, HelpCircle, Check, ArrowRight,
  ExternalLink, CheckCircle2, Shield, Eye
} from "lucide-react";
import { LoaderX } from "@/components/LoaderX";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/config/api"; 
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

// --- NUMBER TO WORDS (US Dollars) ---
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

type TabType = "overview" | "quotas" | "history" | "billing" | "support";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [quotaData, setQuotaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- AUTH HELPER ---
  const getAuthToken = useCallback(() => (typeof window !== "undefined" ? localStorage.getItem("authToken") : null), []);

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

        if (res.data.success) {
          setProfileData(res.data.user);
        } else {
          setError(res.data.message || "Failed to load profile");
        }

        if (qRes?.data?.success) {
          setQuotaData(qRes.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError("An error occurred while fetching your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [getAuthToken]);

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

  if (loading) {
    return <LoaderX />;
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-white gap-4 p-4 font-sans">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Failed to load profile</h2>
        <p className="text-sm text-neutral-400 max-w-sm text-center">{error || "Profile not found"}</p>
        <Button onClick={() => window.location.reload()} className="bg-white text-black font-bold rounded-xl hover:bg-neutral-200">
          Try Again
        </Button>
      </div>
    );
  }

  const user = profileData;
  const isPremium = Boolean(user.membership?.isActive);
  const planName = user.membership?.planName || (isPremium ? "Pro Scholar ⭐" : "Free Tier");

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-red-500/30 selection:text-white pb-28">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-red-600/10 via-red-900/5 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[500px] bg-blue-600/5 blur-[160px]" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[500px] bg-purple-600/5 blur-[160px]" />
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10 space-y-8">
        
        {/* ─── Hero Profile Header Banner ──────────────────────────────────── */}
        <div className="relative rounded-3xl bg-[#0d0d12] border border-white/[0.08] p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* User Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-b from-red-500/40 via-white/10 to-transparent border border-white/10 shadow-xl overflow-hidden">
                  <Avatar className="w-full h-full rounded-[22px]">
                    <AvatarImage src={user.picture} className="object-cover" />
                    <AvatarFallback className="bg-neutral-900 text-white font-black text-2xl">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-[#0d0d12] border border-white/10 shadow-md">
                  {isPremium ? (
                    <Crown size={18} className="text-yellow-400 fill-yellow-400" />
                  ) : (
                    <Sparkles size={18} className="text-red-400" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{user.name}</h1>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                    isPremium 
                      ? "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)]" 
                      : "bg-white/[0.05] text-neutral-400 border-white/[0.08]"
                  )}>
                    {planName}
                  </span>
                </div>
                
                <p className="text-xs text-neutral-400 font-mono">@{user.username || "student"}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-neutral-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Mail size={13} className="text-neutral-500" />
                    <span>{user.email}</span>
                  </div>
                  {user.mobile && (
                    <div className="flex items-center gap-1.5">
                      <Smartphone size={13} className="text-neutral-500" />
                      <span>{user.mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-neutral-500" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0">
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-600/20 active:scale-98 flex items-center gap-2"
              >
                <Zap size={14} />
                <span>{isPremium ? "Extend / Manage Plan" : "Upgrade to Pro"}</span>
              </Link>
              <Link
                href="/youtube-to-notes"
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-semibold text-xs transition-all active:scale-98 flex items-center gap-1.5"
              >
                <Video size={14} />
                <span>Create Notes</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-red-500/15 border border-white/[0.06] hover:border-red-500/30 text-neutral-400 hover:text-red-400 text-xs font-semibold transition-all"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Flame size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Streak</p>
                <p className="text-lg font-black text-white leading-tight">{user.streak?.count || 0} <span className="text-xs font-normal text-neutral-400">Days</span></p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Zap size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Study XP</p>
                <p className="text-lg font-black text-white leading-tight">{(user.xp || 0).toLocaleString()} <span className="text-xs font-normal text-neutral-400">XP</span></p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Award size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Rank</p>
                <p className="text-lg font-black text-white leading-tight capitalize">{user.rank || "Scholar"}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Status</p>
                <p className="text-lg font-black text-white leading-tight">{isPremium ? "Pro Active" : "Free Plan"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Navigation Tabs ─────────────────────────────────────────────── */}
        <div className="flex p-1.5 rounded-2xl bg-[#0d0d12] border border-white/[0.08] overflow-x-auto scrollbar-none gap-1">
          {[
            { id: "overview", label: "Overview & Dashboard", icon: User },
            { id: "quotas", label: "Quotas & Feature Allowances", icon: Zap },
            { id: "history", label: "Creation History", icon: History },
            { id: "billing", label: "Billing & Invoices", icon: CreditCard },
            { id: "support", label: "Support & Help Desk", icon: MessageCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-white text-black shadow-md font-extrabold"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon size={14} className={isActive ? "text-black" : "text-neutral-400"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content Views ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Plan Quotas & Allowances Component */}
              <PlanQuotasCard quotaData={quotaData} isPremium={isPremium} />

              {/* Daily Streak & Stack tracker */}
              <DailyStackWidget user={user} />

              {/* Recent Notes & Creations */}
              <div className="rounded-3xl bg-[#0d0d12] border border-white/[0.08] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    <p className="text-xs text-neutral-400">Your recent AI study notes and learning documents</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {user.noteCreationHistory && user.noteCreationHistory.length > 0 ? (
                    user.noteCreationHistory.slice(0, 4).map((note: any) => (
                      <div
                        key={note._id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.04] hover:border-white/[0.1] transition-all group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate group-hover:text-red-300 transition-colors">
                              {note.title || "Lecture Study Guide"}
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono">{formatDate(note.createdAt)}</p>
                          </div>
                        </div>
                        {note.slug && (
                          <Link
                            href={`/notes/${note.slug}`}
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-bold flex items-center gap-1 shrink-0 ml-3"
                          >
                            <Eye size={12} />
                            <span className="hidden sm:inline">Open</span>
                          </Link>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-black/20 border border-white/[0.04] text-neutral-500 text-xs space-y-2">
                      <p>No study notes generated yet.</p>
                      <Link
                        href="/youtube-to-notes"
                        className="inline-block px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all"
                      >
                        Create Your First Note
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: QUOTAS & FEATURE ALLOWANCES */}
          {activeTab === "quotas" && (
            <motion.div
              key="quotas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <PlanQuotasCard quotaData={quotaData} isPremium={isPremium} />

              {/* Plan Comparison Breakdown Card */}
              <div className="rounded-3xl bg-[#0d0d12] border border-white/[0.08] p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Tier Comparison & Feature Matrix</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Upgrade anytime to expand your monthly limits, process longer lectures, and unlock turbo processing.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Free Plan */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Free Tier</span>
                      <h4 className="text-xl font-black text-white mt-1">$0 / ₹0</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">Daily basic quotas</p>
                    </div>
                    <ul className="text-xs text-neutral-300 space-y-2">
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> 5 notes / day (up to 60 min)</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> 2 slide decks / day (up to 8 slides)</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> 100 PaperChat messages / day</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> 5 quizzes & flashcard sets / day</li>
                    </ul>
                  </div>

                  {/* Pro Scholar */}
                  <div className="p-5 rounded-2xl bg-[#110c0e] border-2 border-red-500/50 shadow-xl space-y-4 relative">
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-extrabold uppercase tracking-widest">
                      POPULAR
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Pro Scholar ⭐</span>
                      <h4 className="text-xl font-black text-white mt-1">$9.99 / ₹799 <span className="text-xs font-normal text-neutral-400">/mo</span></h4>
                      <p className="text-xs text-neutral-400 mt-0.5">30 hrs AI content / month</p>
                    </div>
                    <ul className="text-xs text-neutral-200 space-y-2">
                      <li className="flex items-center gap-2"><Check size={13} className="text-red-400" /> 120 notes / month (up to 4 hrs)</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-red-400" /> 10 slide decks / month (20 slides)</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-red-400" /> 2,000 PaperChat messages / mo</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-red-400" /> Unlimited flashcards & 30 quizzes</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-red-400" /> Priority cloud queue</li>
                    </ul>
                  </div>

                  {/* Power Scholar */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Power Scholar 👑</span>
                      <h4 className="text-xl font-black text-white mt-1">$19.99 / ₹1,599 <span className="text-xs font-normal text-neutral-400">/mo</span></h4>
                      <p className="text-xs text-neutral-400 mt-0.5">100 hrs AI content / month</p>
                    </div>
                    <ul className="text-xs text-neutral-300 space-y-2">
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> 350 notes / month (up to 8 hrs)</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> 30 slide decks / month (40 slides)</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> 10,000 PaperChat messages / mo</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Unlimited quizzes & diagrams</li>
                      <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Instant Turbo processing</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all"
                  >
                    <span>View All Pricing Plans</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ACTIVITY HISTORY */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-3xl bg-[#0d0d12] border border-white/[0.08] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Full Activity Log</h3>
                    <p className="text-xs text-neutral-400">All lecture documents and summaries generated by your account</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {user.noteCreationHistory && user.noteCreationHistory.length > 0 ? (
                    user.noteCreationHistory.map((note: any) => (
                      <div
                        key={note._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-white/[0.04] hover:border-white/[0.1] transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{note.title || "Study Lecture Notes"}</p>
                            <p className="text-[11px] text-neutral-500 font-mono">Created on {formatDate(note.createdAt)}</p>
                          </div>
                        </div>

                        {note.slug && (
                          <Link
                            href={`/notes/${note.slug}`}
                            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all"
                          >
                            <span>Open Note</span>
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center rounded-2xl bg-black/20 border border-white/[0.04] text-neutral-500 text-sm space-y-2">
                      <p>No activity history logged yet.</p>
                      <Link
                        href="/youtube-to-notes"
                        className="inline-block px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                      >
                        Start Learning
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: BILLING & INVOICES */}
          {activeTab === "billing" && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Billing Header */}
              <div className="rounded-3xl bg-[#0d0d12] border border-white/[0.08] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Current Subscription</span>
                    <Badge className={cn("text-[9px] uppercase font-bold px-2 py-0.5", isPremium ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-white/10 text-neutral-400")}>
                      {isPremium ? "Active" : "Free"}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">{planName}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {user.membership?.expiresAt ? `Renews on ${formatDate(user.membership.expiresAt)}` : "Free Tier access with daily replenished quotas."}
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all self-start sm:self-auto"
                >
                  {isPremium ? "Extend / Change Plan" : "Upgrade to Pro"}
                </Link>
              </div>

              {/* Invoices List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Payment & Invoice History</h3>
                    <p className="text-xs text-neutral-400">Download authentic invoices and view receipts</p>
                  </div>
                </div>

                {user.transactions && user.transactions.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {user.transactions.map((tx: any) => (
                      <ReceiptCard
                        key={tx._id}
                        tx={tx}
                        user={user}
                        onDownload={() => generateInvoice(tx)}
                        downloading={downloadingId === tx._id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-[#0d0d12] border border-white/[0.08] p-12 text-center flex flex-col items-center justify-center space-y-3">
                    <History size={40} className="text-neutral-600" />
                    <h4 className="text-base font-bold text-white">No Transactions Yet</h4>
                    <p className="text-xs text-neutral-400 max-w-sm">
                      Your authentic billing invoices will automatically generate here whenever you upgrade or renew.
                    </p>
                    <Link
                      href="/pricing"
                      className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white font-bold text-xs"
                    >
                      View Pricing
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: SUPPORT */}
          {activeTab === "support" && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SupportTab user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function PlanQuotasCard({ quotaData, isPremium }: { quotaData: any; isPremium?: boolean }) {
  if (!quotaData) return null;
  const { planName, planDisplayName, period, features, maxVideoLengthMin, maxSlides, paperChatMessages } = quotaData;

  const quotaItems = [
    {
      key: "notes",
      title: "AI Video Notes",
      icon: "📹",
      used: features?.notes?.used ?? 0,
      limit: features?.notes?.limit ?? 5,
      unlimited: features?.notes?.unlimited ?? false,
      extra: `${maxVideoLengthMin >= 60 ? Math.round(maxVideoLengthMin / 60) + " hrs" : maxVideoLengthMin + " min"} max/video`,
    },
    {
      key: "presentations",
      title: "AI Slide Decks",
      icon: "📊",
      used: features?.presentations?.used ?? 0,
      limit: features?.presentations?.limit ?? 2,
      unlimited: features?.presentations?.unlimited ?? false,
      extra: `Up to ${maxSlides} slides/deck`,
    },
    {
      key: "paperchat",
      title: "PaperChat Messages",
      icon: "💬",
      used: quotaData.paperChatUsed ?? 0,
      limit: paperChatMessages ?? 100,
      unlimited: false,
      extra: `${period === "daily" ? "Daily reset" : "Monthly cycle"}`,
    },
    {
      key: "quizzes",
      title: "AI Quiz Sets",
      icon: "🧠",
      used: features?.quizzes?.used ?? 0,
      limit: features?.quizzes?.limit ?? 5,
      unlimited: features?.quizzes?.unlimited ?? false,
      extra: features?.quizzes?.unlimited ? "Unlimited" : "Practice sets",
    },
    {
      key: "flashcards",
      title: "Flashcard Sets",
      icon: "🃏",
      used: features?.flashcards?.used ?? 0,
      limit: features?.flashcards?.limit ?? 5,
      unlimited: features?.flashcards?.unlimited ?? false,
      extra: "Spaced repetition sets",
    },
    {
      key: "diagrams",
      title: "Mind Maps",
      icon: "🗺️",
      used: features?.diagrams?.used ?? 0,
      limit: features?.diagrams?.limit ?? 3,
      unlimited: features?.diagrams?.unlimited ?? false,
      extra: "Knowledge graphs",
    },
    {
      key: "study",
      title: "Math & Study Solves",
      icon: "📐",
      used: features?.study?.used ?? 0,
      limit: features?.study?.limit ?? 10,
      unlimited: features?.study?.unlimited ?? false,
      extra: "Step-by-step solves",
    },
  ];

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d12] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              {planDisplayName || planName}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-neutral-400 font-mono">
              {period === "daily" ? "Resets daily at 00:00 UTC" : "Monthly billing cycle"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1.5">Active Feature Allowances & Credits</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Real-time quota tracking against your current plan</p>
        </div>
        <Link
          href="/pricing"
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md active:scale-98 self-start sm:self-auto"
        >
          {planName === "Free" ? "Upgrade Plan" : "Extend / Manage Plan"}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {quotaItems.map((item) => {
          const pct = item.unlimited
            ? 0
            : item.limit > 0
            ? Math.min(100, Math.round((item.used / item.limit) * 100))
            : 0;

          return (
            <div
              key={item.key}
              className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] flex flex-col justify-between space-y-3 hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
                    <p className="text-[10.5px] text-neutral-400 leading-tight mt-0.5">{item.extra}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-200 shrink-0">
                  {item.unlimited ? "Unlimited" : `${item.used} / ${item.limit}`}
                </span>
              </div>

              {!item.unlimited ? (
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-400" : "bg-emerald-400"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 size={11} />
                  <span>Full access enabled</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailyStackWidget({ user }: { user: any }) {
  const isPremium = Boolean(user.membership?.isActive);
  const [timeToReset, setTimeToReset] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeToReset(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const streak = user.streak?.count || 0;
  const lastVisit = user.streak?.lastVisit ? new Date(user.streak.lastVisit) : null;
  const visitedToday = lastVisit ? lastVisit.toDateString() === new Date().toDateString() : false;

  return (
    <div className="rounded-3xl bg-[#0d0d12] border border-white/[0.08] p-6 relative overflow-hidden space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-red-400" />
          <h3 className="text-base font-bold text-white">Daily Learning Habit & Streak</h3>
        </div>
        {!isPremium && (
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono">
            <Clock size={12} />
            <span>Resets in {timeToReset}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center gap-3.5">
          <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border", visitedToday ? "bg-orange-500/15 border-orange-500/30 text-orange-400" : "bg-white/[0.05] border-white/[0.08] text-neutral-500")}>
            <Flame size={20} fill={visitedToday ? "currentColor" : "none"} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Active Streak</p>
            <p className="text-xl font-black text-white">{streak} <span className="text-xs font-normal text-neutral-400">Days</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Total XP</p>
            <p className="text-xl font-black text-white">{(user.xp || 0).toLocaleString()} <span className="text-xs font-normal text-neutral-400">XP</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Plan Status</p>
            <p className="text-sm font-bold text-white truncate">{isPremium ? "Pro Active" : "Daily Quota Active"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptCard({ tx, user, onDownload, downloading }: { tx: any; user: any; onDownload: () => void; downloading: boolean }) {
  const totalAmt = parseFloat(tx.amount || 0);

  return (
    <div className="rounded-3xl bg-neutral-900/40 border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-white/[0.14] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white">
            <Layers size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{tx.packageName || "Subscription Plan"}</h4>
            <p className="text-[11px] text-neutral-400 font-mono">INV-{tx._id.slice(-6).toUpperCase()} • {formatDate(tx.timestamp)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-black text-white">{formatCurrency(totalAmt)}</p>
          <span className="inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mt-1">
            {tx.status || "SUCCESS"}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-neutral-400">Period: <strong className="text-neutral-200 capitalize">{tx.billingPeriod || "Monthly"}</strong></span>
        <Button
          onClick={onDownload}
          disabled={downloading}
          className="h-8 px-3 rounded-lg bg-white/[0.08] hover:bg-white text-white hover:text-black text-xs font-bold transition-all flex items-center gap-1.5"
        >
          {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
          <span>PDF Invoice</span>
        </Button>
      </div>
    </div>
  );
}