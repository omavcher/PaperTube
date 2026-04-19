"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users, Search, Trash2, Crown, Mail, Shield, Calendar,
  Clock, Coins, ChevronRight, X, RefreshCw, Loader2,
  CheckCircle2, AlertTriangle, Zap, Gift, Ban,
  CreditCard, BarChart2, SlidersHorizontal, Tag,
  ArrowUpRight, Info, ChevronDown, Plus, Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/config/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Membership {
  isActive: boolean;
  planId?: string;
  planName?: string;
  billingPeriod?: string;
  startedAt?: string;
  expiresAt?: string;
  lastPaymentId?: string;
}

interface Transaction {
  _id: string;
  paymentId: string;
  packageName: string;
  packageType: string;
  amount: number;
  tokens?: number;
  status: string;
  paymentMethod: string;
  timestamp: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  picture?: string;
  joinedAt: string;
  tokens: number;
  membership: Membership | null;
  isFake?: boolean;
}

interface UserDetail extends User {
  recentTransactions: Transaction[];
}

// ─── Constants ───────────────────────────────────────────────────────────────
const PLANS = [
  { id: "scholar", name: "Scholar", color: "from-blue-500 to-cyan-500" },
  { id: "pro", name: "Pro Scholar", color: "from-purple-500 to-pink-500" },
  { id: "power", name: "Power Scholar", color: "from-orange-500 to-red-500" },
];

const adminToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const daysAgo = (d?: string) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  return `${Math.ceil(diff / 86400000)} days ago`;
};

const isExpired = (expiresAt?: string) =>
  expiresAt ? new Date(expiresAt) < new Date() : true;

const planColor = (planId?: string) => {
  if (planId === "power") return "text-orange-400";
  if (planId === "pro") return "text-purple-400";
  return "text-blue-400";
};

// ─── User Drawer ─────────────────────────────────────────────────────────────
function UserDrawer({
  userId,
  onClose,
  onRefresh,
}: {
  userId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "subscription" | "tokens" | "history">(
    "overview"
  );

  // Grant subscription form state
  const [selPlan, setSelPlan] = useState("pro");
  const [selPeriod, setSelPeriod] = useState<"monthly" | "yearly">("monthly");
  const [custDays, setCustDays] = useState("");
  const [grantNote, setGrantNote] = useState("");
  const [grantingSubsc, setGrantingSubsc] = useState(false);
  const [revokingSubsc, setRevokingSubsc] = useState(false);

  // Token form state
  const [tokenAmt, setTokenAmt] = useState("");
  const [tokenMode, setTokenMode] = useState<"add" | "set">("add");
  const [tokenNote, setTokenNote] = useState("");
  const [grantingTokens, setGrantingTokens] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/user/${userId}/details`, {
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      setUser(res.data.data);
    } catch {
      toast.error("Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // ── Grant Subscription ────────────────────────────────────────
  const handleGrantSubscription = async () => {
    setGrantingSubsc(true);
    try {
      const body: any = { planId: selPlan, billingPeriod: selPeriod, note: grantNote };
      if (custDays) body.durationDays = parseInt(custDays);
      const res = await api.post(`/admin/user/${userId}/grant-subscription`, body, {
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      toast.success(res.data.message || "Subscription granted");
      await fetchUser();
      onRefresh();
      setGrantNote("");
      setCustDays("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to grant subscription");
    } finally {
      setGrantingSubsc(false);
    }
  };

  // ── Revoke Subscription ───────────────────────────────────────
  const handleRevokeSubscription = async () => {
    if (!confirm(`Revoke subscription for ${user?.name}?`)) return;
    setRevokingSubsc(true);
    try {
      const res = await api.post(`/admin/user/${userId}/revoke-subscription`, { note: grantNote }, {
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      toast.success(res.data.message || "Subscription revoked");
      await fetchUser();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to revoke subscription");
    } finally {
      setRevokingSubsc(false);
    }
  };

  // ── Grant / Set Tokens ────────────────────────────────────────
  const handleTokenAction = async () => {
    const amt = parseInt(tokenAmt);
    if (!amt || amt <= 0) return toast.error("Enter a valid token amount");
    setGrantingTokens(true);
    try {
      const endpoint = tokenMode === "add" ? "grant-tokens" : "set-tokens";
      const res = await api.post(
        `/admin/user/${userId}/${endpoint}`,
        { amount: amt, note: tokenNote },
        { headers: { Authorization: `Bearer ${adminToken()}` } }
      );
      toast.success(res.data.message || "Tokens updated");
      await fetchUser();
      onRefresh();
      setTokenAmt("");
      setTokenNote("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update tokens");
    } finally {
      setGrantingTokens(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#080808] border-l border-white/8 flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-black/30 shrink-0">
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              User Management
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUser}
              className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-colors"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-red-500" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-600">Loading user data…</p>
            </div>
          </div>
        ) : !user ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neutral-500 text-sm">User not found.</p>
          </div>
        ) : (
          <>
            {/* User Identity */}
            <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent shrink-0">
              <div className="flex items-center gap-4">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="h-14 w-14 rounded-2xl object-cover border border-white/10" />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center text-xl font-black text-white border border-white/10">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white truncate">{user.name}</h3>
                  <p className="text-[11px] text-neutral-500 font-mono truncate">{user.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {user.membership?.isActive && !isExpired(user.membership?.expiresAt) ? (
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", planColor(user.membership.planId))}>
                        ● {user.membership.planName}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">● Free</span>
                    )}
                    <span className="text-[9px] font-mono text-neutral-600">
                      <Coins size={9} className="inline mr-1" />{user.tokens ?? 0} tokens
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-0 shrink-0 overflow-x-auto border-b border-white/5">
              {(["overview", "subscription", "tokens", "history"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-t-lg transition-all whitespace-nowrap border-b-2",
                    tab === t
                      ? "text-red-400 border-red-500 bg-red-500/5"
                      : "text-neutral-600 border-transparent hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

              {/* ─── OVERVIEW ─── */}
              {tab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Tokens", value: user.tokens ?? 0, icon: <Coins size={14} className="text-yellow-400" />, color: "text-yellow-400" },
                      { label: "Joined", value: fmtDate(user.joinedAt), icon: <Calendar size={14} className="text-blue-400" />, color: "text-white" },
                      { label: "Plan", value: user.membership?.isActive && !isExpired(user.membership?.expiresAt) ? user.membership.planName : "Free", icon: <Crown size={14} className="text-purple-400" />, color: planColor(user.membership?.planId) },
                      { label: "Expires", value: user.membership?.isActive ? fmtDate(user.membership.expiresAt) : "—", icon: <Clock size={14} className="text-neutral-500" />, color: "text-white" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {s.icon}
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{s.label}</span>
                        </div>
                        <p className={cn("text-sm font-black", s.color)}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Membership card */}
                  <div className={cn(
                    "rounded-2xl p-5 border",
                    user.membership?.isActive && !isExpired(user.membership?.expiresAt)
                      ? "bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20"
                      : "bg-white/[0.02] border-white/5"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Subscription Status</span>
                      {user.membership?.isActive && !isExpired(user.membership?.expiresAt) ? (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
                      ) : (
                        <span className="text-[9px] font-black text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </div>
                    {user.membership?.isActive ? (
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-white">{user.membership.planName}</p>
                        <p className="text-[10px] text-neutral-500">
                          {user.membership.billingPeriod} · Expires {fmtDate(user.membership.expiresAt)}
                        </p>
                        {isExpired(user.membership.expiresAt) && (
                          <p className="text-[10px] text-red-400 font-bold">⚠ Expired</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-600">No active subscription. Use the Subscription tab to grant one.</p>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTab("subscription")}
                      className="flex-1 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[10px] font-black text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Crown size={12} /> Manage Plan
                    </button>
                    <button
                      onClick={() => setTab("tokens")}
                      className="flex-1 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] font-black text-yellow-400 hover:bg-yellow-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Coins size={12} /> Manage Tokens
                    </button>
                  </div>
                </div>
              )}

              {/* ─── SUBSCRIPTION ─── */}
              {tab === "subscription" && (
                <div className="space-y-5">
                  {/* Current status */}
                  <div className={cn(
                    "rounded-2xl p-4 border",
                    user.membership?.isActive && !isExpired(user.membership?.expiresAt)
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-white/[0.02] border-white/5"
                  )}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2">Current Subscription</p>
                    {user.membership?.isActive ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={cn("font-black text-sm", planColor(user.membership.planId))}>{user.membership.planName}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{user.membership.billingPeriod} · expires {fmtDate(user.membership.expiresAt)}</p>
                          {isExpired(user.membership.expiresAt) && (
                            <p className="text-[10px] text-red-400 font-bold mt-1">⚠ EXPIRED</p>
                          )}
                        </div>
                        {!isExpired(user.membership.expiresAt) && (
                          <button
                            onClick={handleRevokeSubscription}
                            disabled={revokingSubsc}
                            className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-[10px] font-black uppercase"
                          >
                            {revokingSubsc ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                            Revoke
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-600">No active subscription</p>
                    )}
                  </div>

                  {/* Grant form */}
                  <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Gift size={14} className="text-purple-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                        {user.membership?.isActive && !isExpired(user.membership?.expiresAt) ? "Extend / Change Plan" : "Grant Subscription"}
                      </p>
                    </div>

                    {/* Plan selector */}
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Select Plan</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PLANS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelPlan(p.id)}
                            className={cn(
                              "py-2.5 px-2 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all",
                              selPlan === p.id
                                ? `bg-gradient-to-b ${p.color} text-white border-transparent shadow-lg`
                                : "bg-white/[0.02] border-white/5 text-neutral-500 hover:text-white hover:border-white/10"
                            )}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Billing period */}
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Billing Period</label>
                      <div className="flex gap-2">
                        {(["monthly", "yearly"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setSelPeriod(p)}
                            className={cn(
                              "flex-1 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                              selPeriod === p
                                ? "bg-white text-black border-transparent"
                                : "bg-white/[0.02] border-white/5 text-neutral-500 hover:text-white"
                            )}
                          >
                            {p} {p === "yearly" && <span className="text-emerald-400">— 365d</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom duration */}
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">
                        Custom Duration (days) <span className="text-neutral-700">— optional override</span>
                      </label>
                      <input
                        type="number"
                        value={custDays}
                        onChange={(e) => setCustDays(e.target.value)}
                        placeholder={selPeriod === "monthly" ? "30" : "365"}
                        className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-purple-500/40 transition-colors"
                      />
                    </div>

                    {/* Note */}
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Admin Note (optional)</label>
                      <input
                        type="text"
                        value={grantNote}
                        onChange={(e) => setGrantNote(e.target.value)}
                        placeholder="e.g. Granted for beta testing"
                        className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/40 transition-colors"
                      />
                    </div>

                    <button
                      onClick={handleGrantSubscription}
                      disabled={grantingSubsc}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {grantingSubsc ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          {user.membership?.isActive && !isExpired(user.membership?.expiresAt)
                            ? "Extend / Change Plan"
                            : "Grant Subscription"}
                        </>
                      )}
                    </button>

                    <p className="text-[9px] text-neutral-600 text-center">
                      If user already has an active plan, duration will be stacked on remaining time.
                    </p>
                  </div>
                </div>
              )}

              {/* ─── TOKENS ─── */}
              {tab === "tokens" && (
                <div className="space-y-5">
                  {/* Balance display */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1">Current Balance</p>
                      <p className="text-3xl font-black text-yellow-400">{user.tokens ?? 0}</p>
                      <p className="text-[10px] text-neutral-600 mt-0.5">tokens</p>
                    </div>
                    <Coins size={36} className="text-yellow-400/30" />
                  </div>

                  {/* Mode toggle */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Operation Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTokenMode("add")}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                          tokenMode === "add"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/[0.02] border-white/5 text-neutral-500 hover:text-white"
                        )}
                      >
                        <Plus size={12} /> Add Tokens
                      </button>
                      <button
                        onClick={() => setTokenMode("set")}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                          tokenMode === "set"
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                            : "bg-white/[0.02] border-white/5 text-neutral-500 hover:text-white"
                        )}
                      >
                        <SlidersHorizontal size={12} /> Set Balance
                      </button>
                    </div>
                  </div>

                  {/* Quick amounts */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Quick Amounts</label>
                    <div className="flex flex-wrap gap-2">
                      {[10, 50, 100, 250, 500, 1000].map((v) => (
                        <button
                          key={v}
                          onClick={() => setTokenAmt(String(v))}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all",
                            tokenAmt === String(v)
                              ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                              : "bg-white/[0.02] border-white/5 text-neutral-500 hover:text-white"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">
                      {tokenMode === "add" ? "Amount to Add" : "Set Balance To"}
                    </label>
                    <input
                      type="number"
                      value={tokenAmt}
                      onChange={(e) => setTokenAmt(e.target.value)}
                      placeholder="Enter amount..."
                      min={tokenMode === "add" ? 1 : 0}
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3 text-lg text-white font-mono font-bold outline-none focus:border-yellow-500/40 transition-colors"
                    />
                    {tokenMode === "add" && tokenAmt && (
                      <p className="text-[10px] text-emerald-400 mt-1">
                        New balance: {(user.tokens ?? 0) + (parseInt(tokenAmt) || 0)} tokens
                      </p>
                    )}
                    {tokenMode === "set" && tokenAmt && (
                      <p className="text-[10px] text-orange-400 mt-1">
                        Will change from {user.tokens ?? 0} → {parseInt(tokenAmt) || 0} tokens
                      </p>
                    )}
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Admin Note (optional)</label>
                    <input
                      type="text"
                      value={tokenNote}
                      onChange={(e) => setTokenNote(e.target.value)}
                      placeholder="e.g. Compensation for outage"
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-500/40 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleTokenAction}
                    disabled={grantingTokens || !tokenAmt}
                    className={cn(
                      "w-full py-3 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg",
                      tokenMode === "add"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                        : "bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-black"
                    )}
                  >
                    {grantingTokens ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : tokenMode === "add" ? (
                      <><Plus size={14} /> Add {tokenAmt || "?"} Tokens</>
                    ) : (
                      <><SlidersHorizontal size={14} /> Set to {tokenAmt || "?"} Tokens</>
                    )}
                  </button>
                </div>
              )}

              {/* ─── HISTORY ─── */}
              {tab === "history" && (
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                    Recent Transactions (last 20)
                  </p>
                  {user.recentTransactions?.length === 0 ? (
                    <div className="py-12 text-center">
                      <BarChart2 size={32} className="text-neutral-700 mx-auto mb-3" />
                      <p className="text-xs text-neutral-600">No transactions yet</p>
                    </div>
                  ) : (
                    user.recentTransactions?.map((txn) => (
                      <div
                        key={txn._id}
                        className={cn(
                          "p-4 rounded-2xl border",
                          txn.paymentMethod === "admin_grant"
                            ? "bg-purple-500/5 border-purple-500/15"
                            : "bg-white/[0.02] border-white/5"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{txn.packageName}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className={cn(
                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                                txn.packageType === "subscription" ? "bg-purple-500/20 text-purple-400" : "bg-yellow-500/20 text-yellow-400"
                              )}>
                                {txn.packageType}
                              </span>
                              {txn.paymentMethod === "admin_grant" && (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                  Admin Grant
                                </span>
                              )}
                              <span className={cn(
                                "text-[8px] font-black uppercase",
                                txn.status === "success" ? "text-emerald-500" : "text-red-400"
                              )}>
                                {txn.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            {txn.amount > 0 && (
                              <p className="text-[10px] font-black text-white">₹{txn.amount}</p>
                            )}
                            {txn.tokens != null && txn.tokens > 0 && (
                              <p className="text-[10px] text-yellow-400 font-mono">+{txn.tokens} tkn</p>
                            )}
                            <p className="text-[9px] text-neutral-600 mt-1">{fmtDate(txn.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<"all" | "premium" | "free">("all");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users/details", {
        headers: { Authorization: `Bearer ${adminToken()}` },
        params: { search: debouncedSearch, page, limit: 25 },
      });
      setUsers(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(res.data.pagination?.totalItems || 0);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Local filter (client-side supplement for plan filter)
  const filtered = users.filter((u) => {
    if (filterActive === "premium") return u.membership?.isActive && !isExpired(u.membership?.expiresAt);
    if (filterActive === "free") return !u.membership?.isActive || isExpired(u.membership?.expiresAt);
    return true;
  });

  const premiumCount = users.filter((u) => u.membership?.isActive && !isExpired(u.membership?.expiresAt)).length;
  const freeCount = users.length - premiumCount;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">
            Personnel_Registry
          </h2>
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_red]" />
            {totalItems} Total Accounts
          </p>
        </div>

        {/* Stat chips */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterActive("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
              filterActive === "all" ? "bg-white text-black border-transparent" : "bg-black/40 border-white/8 text-neutral-400 hover:text-white"
            )}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setFilterActive("premium")}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5",
              filterActive === "premium" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent" : "bg-black/40 border-white/8 text-neutral-400 hover:text-white"
            )}
          >
            <Crown size={10} /> Premium ({premiumCount})
          </button>
          <button
            onClick={() => setFilterActive("free")}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
              filterActive === "free" ? "bg-white/10 border-white/20 text-white" : "bg-black/40 border-white/8 text-neutral-400 hover:text-white"
            )}
          >
            Free ({freeCount})
          </button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: totalItems, icon: <Users size={16} className="text-neutral-500" />, color: "text-white" },
          { label: "Premium", value: premiumCount, icon: <Crown size={16} className="text-purple-400" />, color: "text-purple-400" },
          { label: "Free Tier", value: freeCount, icon: <Tag size={16} className="text-neutral-500" />, color: "text-neutral-300" },
          { label: "Page", value: `${page}/${totalPages}`, icon: <BarChart2 size={16} className="text-blue-400" />, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="bg-black border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">{s.icon}<span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">{s.label}</span></div>
            <p className={cn("text-xl font-black", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={15} />
        <input
          type="text"
          placeholder="Search by name, email, or username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-bold text-white placeholder:text-neutral-700 focus:border-red-500/30 outline-none transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-black border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                {["User", "Subscription", "Tokens", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded-lg w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Users size={40} className="text-neutral-700 mx-auto mb-3" />
                    <p className="text-sm text-neutral-600">No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const active = user.membership?.isActive && !isExpired(user.membership?.expiresAt);
                  return (
                    <tr
                      key={user._id}
                      className="group hover:bg-white/[0.015] transition-colors cursor-pointer"
                      onClick={() => setSelectedUserId(user._id)}
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.picture ? (
                            <img src={user.picture} alt={user.name} className="h-9 w-9 rounded-xl object-cover border border-white/10 shrink-0" />
                          ) : (
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center text-[11px] font-black text-white shrink-0 border border-white/10">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-white truncate max-w-[160px]">{user.name}</p>
                            <p className="text-[9px] font-mono text-neutral-600 truncate max-w-[160px]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Subscription */}
                      <td className="px-6 py-4">
                        {active ? (
                          <div>
                            <span className={cn("text-[9px] font-black uppercase tracking-wider", planColor(user.membership?.planId))}>
                              {user.membership?.planName}
                            </span>
                            <p className="text-[8px] text-neutral-600 mt-0.5">
                              Exp: {fmtDate(user.membership?.expiresAt)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-neutral-600 uppercase tracking-wider">Free</span>
                        )}
                      </td>

                      {/* Tokens */}
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-sm font-black font-mono",
                          (user.tokens ?? 0) > 50 ? "text-yellow-400" : (user.tokens ?? 0) > 0 ? "text-neutral-300" : "text-red-400"
                        )}>
                          {user.tokens ?? 0}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4">
                        <p className="text-[10px] text-neutral-400">{fmtDate(user.joinedAt)}</p>
                        <p className="text-[9px] text-neutral-700">{daysAgo(user.joinedAt)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedUserId(user._id); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-red-500/10 border border-white/8 hover:border-red-500/20 rounded-lg text-[9px] font-black uppercase text-neutral-400 hover:text-red-400 transition-all"
                        >
                          <SlidersHorizontal size={11} /> Manage
                          <ChevronRight size={11} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/[0.04]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-2 bg-white/5 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={36} className="text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-600">No users found</p>
            </div>
          ) : (
            filtered.map((user) => {
              const active = user.membership?.isActive && !isExpired(user.membership?.expiresAt);
              return (
                <motion.div
                  key={user._id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedUserId(user._id)}
                  className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="h-11 w-11 rounded-xl object-cover border border-white/10 shrink-0" />
                    ) : (
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-white truncate">{user.name}</p>
                        <ChevronRight size={14} className="text-neutral-600 shrink-0 ml-2" />
                      </div>
                      <p className="text-[10px] text-neutral-600 font-mono truncate">{user.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {active ? (
                          <span className={cn("text-[9px] font-black uppercase", planColor(user.membership?.planId))}>
                            ● {user.membership?.planName}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-neutral-600 uppercase">● Free</span>
                        )}
                        <span className="text-[9px] text-yellow-500 font-mono">
                          {user.tokens ?? 0} tkn
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600">
            {filtered.length} shown · {totalItems} total
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-white/8 rounded-lg text-[9px] font-black text-neutral-500 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
            >
              Prev
            </button>
            <span className="text-[9px] text-neutral-500 px-1">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-white/8 rounded-lg text-[9px] font-black text-neutral-500 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Drawer */}
      <AnimatePresence>
        {selectedUserId && (
          <UserDrawer
            key={selectedUserId}
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onRefresh={fetchUsers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}