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
  { id: "scholar", name: "Scholar", color: "from-blue-500/25 to-blue-500/5", border: "border-blue-500/30 text-blue-400" },
  { id: "pro", name: "Pro Scholar", color: "from-purple-500/25 to-purple-500/5", border: "border-purple-500/30 text-purple-400" },
  { id: "power", name: "Power Scholar", color: "from-orange-500/25 to-orange-500/5", border: "border-orange-500/30 text-orange-400" },
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
  const days = Math.ceil(diff / 86400000);
  return days === 1 ? "1 day ago" : `${days} days ago`;
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
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
            <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-bold">
              User_Admin_Console
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUser}
              className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-white transition-colors"
            >
              <RefreshCw size={12} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-red-500" />
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">Retrieving node data…</p>
          </div>
        ) : !user ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neutral-500 font-mono text-xs uppercase">Fault: User record empty.</p>
          </div>
        ) : (
          <>
            {/* User Identity Section */}
            <div className="px-5 py-4 border-b border-neutral-900/50 bg-gradient-to-r from-neutral-900/20 to-transparent shrink-0">
              <div className="flex items-center gap-3.5">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="h-12 w-12 rounded-xl object-cover border border-neutral-900 shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/10 to-purple-600/30 flex items-center justify-center text-base font-black text-white shrink-0 border border-neutral-800">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate leading-tight">{user.name}</h3>
                  <p className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">{user.email}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {user.membership?.isActive && !isExpired(user.membership?.expiresAt) ? (
                      <span className={cn("text-[9px] font-mono uppercase tracking-wider font-bold", planColor(user.membership.planId))}>
                        ● {user.membership.planName}
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-600 font-bold">● Free Tier</span>
                    )}
                    <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
                      <Coins size={9} className="text-yellow-500" />{user.tokens ?? 0} tokens
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Drawer Tabs */}
            <div className="flex gap-1 px-4 border-b border-neutral-900 bg-neutral-950 shrink-0 overflow-x-auto no-scrollbar">
              {(["overview", "subscription", "tokens", "history"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-2.5 text-[9px] font-mono uppercase tracking-widest transition-all whitespace-nowrap border-b-2",
                    tab === t
                      ? "text-red-400 border-red-500 bg-red-500/5 font-bold"
                      : "text-neutral-500 border-transparent hover:text-neutral-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Sub Drawer Body Pane */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar pb-24 md:pb-8">

              {/* ─── OVERVIEW PANEL ─── */}
              {tab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Token Balance", value: user.tokens ?? 0, icon: <Coins size={12} className="text-yellow-500" />, glow: "hover:border-yellow-500/20" },
                      { label: "Joined Date", value: fmtDate(user.joinedAt), icon: <Calendar size={12} className="text-blue-500" />, glow: "hover:border-blue-500/20" },
                      { label: "Plan Membership", value: user.membership?.isActive && !isExpired(user.membership?.expiresAt) ? user.membership.planName : "Free", icon: <Crown size={12} className="text-purple-400" />, glow: "hover:border-purple-500/20", color: planColor(user.membership?.planId) },
                      { label: "Expiration Time", value: user.membership?.isActive ? fmtDate(user.membership.expiresAt) : "—", icon: <Clock size={12} className="text-neutral-500" />, glow: "hover:border-neutral-800" },
                    ].map((s) => (
                      <div key={s.label} className={cn("bg-neutral-950 border border-neutral-900/60 rounded-xl p-3.5 transition-all duration-300", s.glow)}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {s.icon}
                          <span className="text-[8px] font-mono uppercase tracking-wider text-neutral-500">{s.label}</span>
                        </div>
                        <p className={cn("text-xs font-mono font-bold text-white", s.color)}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Active membership telemetry */}
                  <div className={cn(
                    "rounded-xl p-4 border transition-all",
                    user.membership?.isActive && !isExpired(user.membership?.expiresAt)
                      ? "bg-emerald-500/5 border-emerald-500/25"
                      : "bg-neutral-950 border-neutral-900"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">Subscription telemetry</span>
                      {user.membership?.isActive && !isExpired(user.membership?.expiresAt) ? (
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">Active</span>
                      ) : (
                        <span className="text-[8px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 font-bold uppercase">Inactive</span>
                      )}
                    </div>
                    {user.membership?.isActive ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white font-mono">{user.membership.planName}</p>
                        <p className="text-[9px] font-mono text-neutral-500 leading-normal">
                          Billing cycle: {user.membership.billingPeriod} · Expires on {fmtDate(user.membership.expiresAt)}
                        </p>
                        {isExpired(user.membership.expiresAt) && (
                          <p className="text-[9px] text-red-400 font-bold font-mono mt-1">⚠ PLAN CURRENTLY EXPIRED</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[9px] font-mono text-neutral-500 leading-relaxed">
                        User holds no active premium packages. Grant access via the Subscription console tab.
                      </p>
                    )}
                  </div>

                  {/* Drawer Operations Shortcut */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setTab("subscription")}
                      className="flex-1 py-2 rounded-xl bg-purple-500/5 border border-purple-500/20 text-[9px] font-mono uppercase tracking-wider text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Crown size={11} /> Plan Config
                    </button>
                    <button
                      onClick={() => setTab("tokens")}
                      className="flex-1 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-[9px] font-mono uppercase tracking-wider text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Coins size={11} /> Token Config
                    </button>
                  </div>
                </div>
              )}

              {/* ─── SUBSCRIPTION MANAGER PANEL ─── */}
              {tab === "subscription" && (
                <div className="space-y-5">
                  {/* Current Plan Status */}
                  <div className={cn(
                    "rounded-xl p-4 border",
                    user.membership?.isActive && !isExpired(user.membership?.expiresAt)
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-neutral-950 border-neutral-900"
                  )}>
                    <p className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-2">Current Membership status</p>
                    {user.membership?.isActive ? (
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className={cn("font-bold text-xs font-mono", planColor(user.membership.planId))}>{user.membership.planName}</p>
                          <p className="text-[9px] font-mono text-neutral-500 mt-0.5">{user.membership.billingPeriod} cycle · exp {fmtDate(user.membership.expiresAt)}</p>
                          {isExpired(user.membership.expiresAt) && (
                            <p className="text-[8px] text-red-500 font-bold font-mono mt-1 uppercase">⚠ EXPIRED</p>
                          )}
                        </div>
                        {!isExpired(user.membership.expiresAt) && (
                          <button
                            onClick={handleRevokeSubscription}
                            disabled={revokingSubsc}
                            className="px-2.5 py-1.5 bg-red-500/5 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 hover:border-red-500/35 transition-colors disabled:opacity-50 flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider"
                          >
                            {revokingSubsc ? <Loader2 size={10} className="animate-spin" /> : <Ban size={10} />}
                            Revoke
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-[9px] font-mono text-neutral-600 uppercase">No active plan recorded</p>
                    )}
                  </div>

                  {/* Provision form */}
                  <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
                      <Gift size={12} className="text-purple-400" />
                      <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-300">
                        {user.membership?.isActive && !isExpired(user.membership?.expiresAt) ? "Update / Extend Package" : "Provision Package"}
                      </p>
                    </div>

                    {/* Plan selection grid */}
                    <div>
                      <label className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 block">Select active tier</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PLANS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelPlan(p.id)}
                            className={cn(
                              "py-2 px-1 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider transition-all",
                              selPlan === p.id
                                ? `bg-gradient-to-r ${p.color} ${p.border} shadow-md`
                                : "bg-neutral-950 border-neutral-900 text-neutral-650 hover:text-white hover:border-neutral-800"
                            )}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Billing period choices */}
                    <div>
                      <label className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 block">Billing Period</label>
                      <div className="flex gap-2">
                        {(["monthly", "yearly"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setSelPeriod(p)}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider transition-all",
                              selPeriod === p
                                ? "bg-white text-black border-transparent"
                                : "bg-neutral-950 border-neutral-900 text-neutral-500 hover:text-white"
                            )}
                          >
                            {p} {p === "yearly" && <span className="text-emerald-500 font-mono text-[7px] ml-0.5">— 365d</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration override */}
                    <div>
                      <label className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 block">
                        Duration Override (Days) <span className="text-neutral-700">— optional</span>
                      </label>
                      <input
                        type="number"
                        value={custDays}
                        onChange={(e) => setCustDays(e.target.value)}
                        placeholder={selPeriod === "monthly" ? "30" : "365"}
                        className="w-full bg-black border border-neutral-900 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-purple-500/40 transition-colors"
                      />
                    </div>

                    {/* Note input */}
                    <div>
                      <label className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 block">Administrative Note</label>
                      <input
                        type="text"
                        value={grantNote}
                        onChange={(e) => setGrantNote(e.target.value)}
                        placeholder="e.g. Compensatory upgrade status"
                        className="w-full bg-black border border-neutral-900 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40 transition-colors"
                      />
                    </div>

                    {/* Execute action */}
                    <button
                      onClick={handleGrantSubscription}
                      disabled={grantingSubsc}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-mono font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      {grantingSubsc ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={12} />
                          {user.membership?.isActive && !isExpired(user.membership?.expiresAt)
                            ? "Extend / Modify Access"
                            : "Grant Membership Access"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TOKENS ADJUST PANEL ─── */}
              {tab === "tokens" && (
                <div className="space-y-5">
                  {/* Current Balance */}
                  <div className="bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Current Ledger Balance</p>
                      <p className="text-2xl font-mono font-black text-yellow-400 leading-none">{user.tokens ?? 0}</p>
                      <span className="text-[8px] font-mono text-neutral-600 uppercase mt-0.5 block">Total Tokens</span>
                    </div>
                    <Coins size={28} className="text-yellow-400/20" />
                  </div>

                  {/* Action mode */}
                  <div>
                    <label className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 block">Operation Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTokenMode("add")}
                        className={cn(
                          "flex-1 py-2 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1",
                          tokenMode === "add"
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                            : "bg-neutral-950 border-neutral-900 text-neutral-500 hover:text-white"
                        )}
                      >
                        <Plus size={10} /> Add tokens
                      </button>
                      <button
                        onClick={() => setTokenMode("set")}
                        className={cn(
                          "flex-1 py-2 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1",
                          tokenMode === "set"
                            ? "bg-orange-500/5 border-orange-500/20 text-orange-400"
                            : "bg-neutral-950 border-neutral-900 text-neutral-500 hover:text-white"
                        )}
                      >
                        <SlidersHorizontal size={10} /> Set absolute
                      </button>
                    </div>
                  </div>

                  {/* Quick tokens */}
                  <div>
                    <label className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 block">Quick values</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[10, 50, 100, 250, 500].map((v) => (
                        <button
                          key={v}
                          onClick={() => setTokenAmt(String(v))}
                          className={cn(
                            "px-2.5 py-1 rounded-md border text-[9px] font-mono font-bold transition-all",
                            tokenAmt === String(v)
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                              : "bg-neutral-950 border-neutral-900 text-neutral-650 hover:text-white"
                          )}
                        >
                          +{v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input value */}
                  <div>
                    <label className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 block">
                      {tokenMode === "add" ? "Token count to issue" : "Set ledger balance to"}
                    </label>
                    <input
                      type="number"
                      value={tokenAmt}
                      onChange={(e) => setTokenAmt(e.target.value)}
                      placeholder="Enter integer..."
                      min={tokenMode === "add" ? 1 : 0}
                      className="w-full bg-black border border-neutral-900 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold outline-none focus:border-yellow-500/40 transition-colors"
                    />
                    {tokenMode === "add" && tokenAmt && (
                      <p className="text-[9px] font-mono text-emerald-400 mt-1 uppercase">
                        Resulting user balance: {(user.tokens ?? 0) + (parseInt(tokenAmt) || 0)} tokens
                      </p>
                    )}
                    {tokenMode === "set" && tokenAmt && (
                      <p className="text-[9px] font-mono text-orange-400 mt-1 uppercase">
                        Ledger adjustment: {user.tokens ?? 0} → {parseInt(tokenAmt) || 0} tokens
                      </p>
                    )}
                  </div>

                  {/* Notes override */}
                  <div>
                    <label className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 block">Administrative Note</label>
                    <input
                      type="text"
                      value={tokenNote}
                      onChange={(e) => setTokenNote(e.target.value)}
                      placeholder="e.g. Service disruption compensation"
                      className="w-full bg-black border border-neutral-900 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-yellow-500/40 transition-colors"
                    />
                  </div>

                  {/* Execute button */}
                  <button
                    onClick={handleTokenAction}
                    disabled={grantingTokens || !tokenAmt}
                    className={cn(
                      "w-full py-2.5 font-mono font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-lg",
                      tokenMode === "add"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                        : "bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-black"
                    )}
                  >
                    {grantingTokens ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : tokenMode === "add" ? (
                      <><Plus size={12} /> Issue {tokenAmt || "?"} Tokens</>
                    ) : (
                      <><SlidersHorizontal size={12} /> Adjust to {tokenAmt || "?"} Tokens</>
                    )}
                  </button>
                </div>
              )}

              {/* ─── TRANSACTION LEDGER HISTORY PANEL ─── */}
              {tab === "history" && (
                <div className="space-y-3">
                  <p className="text-[8px] font-mono uppercase tracking-wider text-neutral-500">
                    Latest Payment Records (last 20)
                  </p>
                  {user.recentTransactions?.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-neutral-900 rounded-xl">
                      <BarChart2 size={24} className="text-neutral-700 mx-auto mb-2" />
                      <p className="text-[9px] font-mono text-neutral-500 uppercase">No ledger logs registered</p>
                    </div>
                  ) : (
                    user.recentTransactions?.map((txn) => (
                      <div
                        key={txn._id}
                        className={cn(
                          "p-3 rounded-lg border",
                          txn.paymentMethod === "admin_grant"
                            ? "bg-purple-500/5 border-purple-500/15"
                            : "bg-neutral-950 border-neutral-900/60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-white truncate">{txn.packageName}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={cn(
                                "text-[7px] font-mono uppercase px-1.5 py-0.2 rounded border",
                                txn.packageType === "subscription" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              )}>
                                {txn.packageType}
                              </span>
                              {txn.paymentMethod === "admin_grant" && (
                                <span className="text-[7px] font-mono uppercase px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-450 border border-blue-500/20">
                                  System Grant
                                </span>
                              )}
                              <span className={cn(
                                "text-[7px] font-mono uppercase font-bold",
                                txn.status === "success" ? "text-emerald-500" : "text-red-400"
                              )}>
                                {txn.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {txn.amount > 0 && (
                              <p className="text-[10px] font-mono font-bold text-white">${txn.amount}</p>
                            )}
                            {txn.tokens != null && txn.tokens > 0 && (
                              <p className="text-[9px] text-yellow-400 font-mono font-bold">+{txn.tokens} tkn</p>
                            )}
                            <p className="text-[8px] font-mono text-neutral-600 mt-1">{fmtDate(txn.timestamp)}</p>
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

// ─── Main Personnel Page ─────────────────────────────────────────────────────────────
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

  // Debounce search input
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

  // Client-side visual state filtering
  const filtered = users.filter((u) => {
    if (filterActive === "premium") return u.membership?.isActive && !isExpired(u.membership?.expiresAt);
    if (filterActive === "free") return !u.membership?.isActive || isExpired(u.membership?.expiresAt);
    return true;
  });

  const premiumCount = users.filter((u) => u.membership?.isActive && !isExpired(u.membership?.expiresAt)).length;
  const freeCount = users.length - premiumCount;
  
  // Calculate conversion ratio percentage
  const getConversionPct = () => {
    if (users.length === 0) return 0;
    return Math.round((premiumCount / users.length) * 100);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Registry Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
            Personnel_Registry
          </h2>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            Active Index Database // {totalItems} accounts
          </p>
        </div>

        {/* Tab selection widgets */}
        <div className="flex items-center overflow-x-auto no-scrollbar scroll-fade-x gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-900 shrink-0">
          <button
            onClick={() => setFilterActive("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all",
              filterActive === "all" ? "bg-neutral-900 border border-neutral-800 text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setFilterActive("premium")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all flex items-center gap-1",
              filterActive === "premium" ? "bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <Crown size={9} /> Premium ({premiumCount})
          </button>
          <button
            onClick={() => setFilterActive("free")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all",
              filterActive === "free" ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            Free ({freeCount})
          </button>
        </div>
      </div>

      {/* SECTION 1: PERSONNEL DASHBOARD METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Registry Entries", value: totalItems, sub: "Total registered nodes", icon: Users, color: "text-red-500 border-red-500/10 bg-red-500/5" },
          { label: "Premium Nodes", value: premiumCount, sub: "Active subscriptions", icon: Crown, color: "text-purple-400 border-purple-500/10 bg-purple-500/5" },
          { label: "Free Tier Nodes", value: freeCount, sub: "Awaiting upgrade sequence", icon: Tag, color: "text-yellow-500 border-yellow-500/10 bg-yellow-500/5" },
        ].map((s) => (
          <div key={s.label} className="bg-neutral-950/40 border border-neutral-900 p-4 rounded-xl flex flex-col justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono uppercase tracking-wider text-neutral-500">{s.label}</span>
              <div className={cn("p-1.5 rounded-lg border", s.color)}>
                <s.icon size={12} />
              </div>
            </div>
            <div>
              <p className="text-xl font-mono font-black text-white">{s.value.toLocaleString()}</p>
              <p className="text-[8px] font-mono text-neutral-600 mt-1 uppercase">{s.sub}</p>
            </div>
          </div>
        ))}
        
        {/* Speed Ratio dial */}
        <div className="bg-neutral-950/40 border border-neutral-900 p-4 rounded-xl flex items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex-1 min-w-0">
            <span className="text-[8px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">Premium Ratio</span>
            <p className="text-xl font-mono font-black text-white leading-none">{getConversionPct()}%</p>
            <p className="text-[8px] font-mono text-neutral-650 mt-1 uppercase truncate">Upgrade completion speed</p>
          </div>
          <div className="relative h-12 w-12 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-neutral-900" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-purple-500 shadow-sm" strokeDasharray={`${getConversionPct()}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
        </div>
      </div>

      {/* SECTION 2: SEARCH WIDGET */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-650 group-focus-within:text-red-500 transition-colors" size={14} />
        <input
          type="text"
          placeholder="Filter nodes by name, email, or database index ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-900 rounded-xl py-3 pl-11 pr-10 text-[10px] font-mono text-white placeholder:text-neutral-700 focus:border-red-500/20 focus:outline-none transition-colors"
        />
        {search && (
          <button 
            onClick={() => setSearch("")} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* SECTION 3: DIRECTORY LISTINGS */}
      <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl overflow-hidden backdrop-blur-md">
        
        {/* Desktop Directory Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/60">
                {["User Node", "Subscription", "Tokens", "Joined Date", "Operations"].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/60">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3.5 bg-neutral-900 rounded w-2/3" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Users size={32} className="text-neutral-800 mx-auto mb-3" />
                    <p className="text-[10px] uppercase text-neutral-600 tracking-wider">No matching active database nodes found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const active = user.membership?.isActive && !isExpired(user.membership?.expiresAt);
                  return (
                    <tr
                      key={user._id}
                      className="group hover:bg-neutral-950/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedUserId(user._id)}
                    >
                      {/* Identity */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {user.picture ? (
                            <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-lg object-cover border border-neutral-850 shrink-0" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-850 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white group-hover:text-red-400 transition-colors truncate max-w-[150px]">{user.name}</p>
                            <p className="text-[9px] text-neutral-500 truncate max-w-[150px]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Subscription Status */}
                      <td className="px-6 py-3.5">
                        {active ? (
                          <div className="leading-tight">
                            <span className={cn("text-[9px] font-black uppercase tracking-wider", planColor(user.membership?.planId))}>
                              {user.membership?.planName}
                            </span>
                            <p className="text-[7px] text-neutral-600 mt-0.5">
                              Exp: {fmtDate(user.membership?.expiresAt)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[9px] text-neutral-600 uppercase tracking-wider">Free Tier</span>
                        )}
                      </td>

                      {/* Tokens balance */}
                      <td className="px-6 py-3.5">
                        <span className={cn(
                          "text-xs font-bold font-mono",
                          (user.tokens ?? 0) > 50 ? "text-yellow-450" : (user.tokens ?? 0) > 0 ? "text-neutral-300" : "text-red-400/80"
                        )}>
                          {user.tokens ?? 0}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-3.5">
                        <p className="text-[10px] text-neutral-400">{fmtDate(user.joinedAt)}</p>
                        <p className="text-[8px] text-neutral-600 mt-0.5 uppercase">{daysAgo(user.joinedAt)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedUserId(user._id); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-red-500/5 border border-neutral-800 hover:border-red-500/20 rounded-lg text-[9px] font-black uppercase text-neutral-400 hover:text-red-400 transition-all"
                        >
                          <SlidersHorizontal size={10} /> Manage
                          <ChevronRight size={10} className="opacity-40 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Directory Cards Layout */}
        <div className="md:hidden divide-y divide-neutral-900/60 font-mono">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-neutral-900" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-neutral-900 rounded w-1/2" />
                    <div className="h-2.5 bg-neutral-900 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={28} className="text-neutral-800 mx-auto mb-2" />
              <p className="text-[10px] uppercase text-neutral-650 tracking-wider">No matching active database nodes found</p>
            </div>
          ) : (
            filtered.map((user) => {
              const active = user.membership?.isActive && !isExpired(user.membership?.expiresAt);
              return (
                <div
                  key={user._id}
                  onClick={() => setSelectedUserId(user._id)}
                  className="p-4 hover:bg-neutral-950/60 transition-colors cursor-pointer flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="h-9 w-9 rounded-lg object-cover border border-neutral-850 shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-850 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-white truncate">{user.name}</p>
                        <ChevronRight size={12} className="text-neutral-600 shrink-0 ml-1" />
                      </div>
                      <p className="text-[9px] text-neutral-500 truncate mt-0.5">{user.email}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {active ? (
                          <span className={cn("text-[8px] font-black uppercase tracking-wider", planColor(user.membership?.planId))}>
                            ● {user.membership?.planName}
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-neutral-600 uppercase tracking-wider">● Free Tier</span>
                        )}
                        <span className="text-[8px] text-yellow-500 font-mono flex items-center gap-0.5">
                          <Coins size={8} />{user.tokens ?? 0}
                        </span>
                        <span className="text-[7px] text-neutral-600 uppercase tracking-tight ml-auto font-sans">
                          {daysAgo(user.joinedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Directory Pagination Grid */}
        <div className="px-5 py-3 border-t border-neutral-900 bg-neutral-950/40 flex items-center justify-between font-mono">
          <p className="text-[8px] font-black uppercase tracking-wider text-neutral-600">
            {filtered.length} visible · {totalItems} entries
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-[9px] font-bold text-neutral-500 hover:text-white hover:border-neutral-700 disabled:opacity-30 transition-all uppercase tracking-tight"
            >
              Prev
            </button>
            <span className="text-[9px] text-neutral-500 px-1 font-bold">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-[9px] font-bold text-neutral-500 hover:text-white hover:border-neutral-700 disabled:opacity-30 transition-all uppercase tracking-tight"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-in Administration Panel */}
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