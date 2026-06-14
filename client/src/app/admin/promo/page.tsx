"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, Edit3,
  X, Save, Loader2, Users, CheckCircle2,
  RefreshCw, Copy, ChevronDown, ChevronUp,
  Gift, Clock, ShieldOff, Shield, DollarSign,
  ArrowRight, Zap, Eye, Calendar, Sparkles, Percent, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";

// ─── All plan data (source of truth) ─────────────────────────
const ALL_PLANS = [
  // Subscriptions — Stripe USD plans
  {
    id: "pro", type: "subscription", label: "Pro",
    monthlyPrice: 14, yearlyPrice: 168,
    tagColor: "bg-blue-500/5 text-blue-400 border-blue-500/10 hover:border-blue-500/20"
  },
  {
    id: "power", type: "subscription", label: "Power",
    monthlyPrice: 29, yearlyPrice: 348,
    tagColor: "bg-purple-500/5 text-purple-400 border-purple-500/10 hover:border-purple-500/20"
  },
] as const;

type PlanId = typeof ALL_PLANS[number]["id"];

// Compute discount for a given base price
function calcDiscount(
  basePrice: number,
  type: "flat" | "percent",
  value: number,
  cap: number
): { discount: number; final: number } {
  let discount =
    type === "percent"
      ? (basePrice * value) / 100
      : Math.min(value, basePrice);
  if (type === "percent" && cap > 0) discount = Math.min(discount, cap);
  discount = Math.min(discount, basePrice);
  return { discount: +discount.toFixed(2), final: +(basePrice - discount).toFixed(2) };
}

// Get all price points for a plan
function getPlanPrices(plan: typeof ALL_PLANS[number]): Array<{ label: string; price: number }> {
  if ((plan.type as string) === "token") {
    return [{ label: "One-time", price: (plan as any).price }];
  }
  return [
    { label: "Monthly", price: (plan as any).monthlyPrice },
    { label: "Yearly", price: (plan as any).yearlyPrice },
  ];
}

// ─── Types ────────────────────────────────────────────────────
interface PromoCode {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: "percent" | "flat";
  discountValue: number;
  applicableTo: "all" | "subscription" | "token";
  restrictedToPlans: string[];
  minOrderAmount: number;
  maxDiscountCap: number;
  maxUsageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

const BLANK_FORM = {
  code: "",
  name: "",
  description: "",
  discountType: "flat" as "flat" | "percent",
  discountValue: 10,
  applicableTo: "all" as "all" | "subscription" | "token",
  restrictedToPlans: [] as string[],
  minOrderAmount: 0,
  maxDiscountCap: 0,
  maxUsageLimit: 100,
  perUserLimit: 1,
  isActive: true,
  validFrom: "",
  validUntil: "",
};

// ─── Helpers ──────────────────────────────────────────────────
const getAdminToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";

function authHeader() {
  const token = getAdminToken();
  return { 
    Auth: token,
    Authorization: `Bearer ${token}`
  };
}

function usagePct(code: PromoCode) {
  return Math.min(100, Math.round((code.usedCount / code.maxUsageLimit) * 100));
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Discount Preview Component ───────────────────────────────
function DiscountPreview({
  applicableTo,
  restrictedToPlans,
  discountType,
  discountValue,
  maxDiscountCap,
  minOrderAmount,
}: {
  applicableTo: string;
  restrictedToPlans: string[];
  discountType: "flat" | "percent";
  discountValue: number;
  maxDiscountCap: number;
  minOrderAmount: number;
}) {
  const eligible = useMemo(() => {
    return ALL_PLANS.filter((p) => {
      if (applicableTo !== "all" && p.type !== applicableTo) return false;
      if (restrictedToPlans.length > 0 && !restrictedToPlans.includes(p.id)) return false;
      return true;
    });
  }, [applicableTo, restrictedToPlans]);

  if (eligible.length === 0) return null;

  return (
    <div className="mt-6 border-t border-neutral-900 pt-5">
      <div className="flex items-center gap-1.5 mb-3">
        <Eye size={12} className="text-emerald-400" />
        <p className="text-[9px] font-mono font-bold text-emerald-450 uppercase tracking-wider">
          LIVE DISCOUNT PREVIEW
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {eligible.map((plan) => {
          const prices = getPlanPrices(plan as any);
          return (
            <div key={plan.id} className={cn("rounded-xl border p-4 space-y-2.5", plan.tagColor)}>
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">{plan.label}</span>
                <span className="text-[8px] font-mono font-bold opacity-50 uppercase tracking-wider">{plan.type}</span>
              </div>
              {prices.map(({ label, price }) => {
                const meetsMin = minOrderAmount === 0 || price >= minOrderAmount;
                if (!meetsMin) {
                  return (
                    <div key={label} className="flex items-center justify-between opacity-30 text-[9px] font-mono">
                      <span>{label} — ${price}</span>
                      <span className="text-[8px] italic text-red-500 font-bold">Below min order</span>
                    </div>
                  );
                }
                const { discount, final } = calcDiscount(price, discountType, discountValue, maxDiscountCap);
                return (
                  <div key={label} className="bg-black/30 rounded-lg p-2.5 space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-neutral-400">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] line-through text-neutral-600">${price}</span>
                        <ArrowRight size={8} className="text-neutral-600" />
                        <span className="text-[10px] font-black text-white">${final}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[8px]">
                      <span className="text-emerald-450 font-bold">— ${discount} saved</span>
                      <span className="text-neutral-600">excl. tax</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Plan chips for code card row ─────────────────────────────
function PlanChips({ applicableTo, restrictedToPlans }: { applicableTo: string; restrictedToPlans: string[] }) {
  const plans = useMemo(() => {
    return ALL_PLANS.filter((p) => {
      if (applicableTo !== "all" && p.type !== applicableTo) return false;
      if (restrictedToPlans.length > 0 && !restrictedToPlans.includes(p.id)) return false;
      return true;
    });
  }, [applicableTo, restrictedToPlans]);

  if (plans.length === ALL_PLANS.length || plans.length === 0) {
    return (
      <span className="text-[9px] text-neutral-500 font-mono uppercase font-bold tracking-wider">
        {applicableTo === "all" ? "All Platform Plans" : `All ${applicableTo} plans`}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {plans.map((p) => {
        const prices = getPlanPrices(p as any);
        return (
          <div key={p.id} className={cn("px-2 py-0.5 rounded border text-[8px] font-mono font-bold tracking-wider shrink-0", p.tagColor)}>
            {p.label} ·{" "}
            {prices.map((pr, i) => (
              <span key={i}>
                {i > 0 && " / "}${pr.price}
                <span className="opacity-50 font-normal">/{pr.label.slice(0, 2).toLowerCase()}</span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Compact price preview on each code card ──────────────────
function CompactPricePreview({ applicableTo, restrictedToPlans, discountType, discountValue, maxDiscountCap, minOrderAmount }: {
  applicableTo: string; restrictedToPlans: string[];
  discountType: "flat" | "percent"; discountValue: number;
  maxDiscountCap: number; minOrderAmount: number;
}) {
  const eligible = useMemo(() =>
    ALL_PLANS.filter(p => {
      if (applicableTo !== "all" && p.type !== applicableTo) return false;
      if (restrictedToPlans.length > 0 && !restrictedToPlans.includes(p.id)) return false;
      return true;
    }), [applicableTo, restrictedToPlans]);

  if (eligible.length === 0) return null;

  return (
    <div className="mt-3 bg-neutral-950/60 border border-neutral-900/50 rounded-xl p-2.5">
      <p className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
        <DollarSign size={9} className="text-neutral-600" /> User Pay Ledger
      </p>
      <div className="flex flex-wrap gap-1.5">
        {eligible.map(plan => {
          const prices = getPlanPrices(plan as any);
          return prices.map(({ label, price }) => {
            const meetsMin = minOrderAmount === 0 || price >= minOrderAmount;
            const { discount, final } = calcDiscount(price, discountType, discountValue, maxDiscountCap);
            return (
              <div key={`${plan.id}-${label}`}
                className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-mono",
                  meetsMin ? "border-neutral-900 bg-neutral-950/80" : "border-neutral-950 bg-neutral-950/20 opacity-30")}>
                <span className="text-neutral-400 font-bold">{plan.label}</span>
                {plan.type === "subscription" && <span className="text-neutral-600">({label.slice(0, 2).toLowerCase()})</span>}
                <span className="text-neutral-600 line-through">${price}</span>
                {meetsMin ? (
                  <>
                    <ArrowRight size={8} className="text-neutral-700" />
                    <span className="font-bold text-emerald-450">${final}</span>
                  </>
                ) : (
                  <span className="text-[7px] italic text-red-500/80">min error</span>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────
export default function PromoAdminPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<Record<string, any>>({});
  const [loadingUsage, setLoadingUsage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCodes = async (showSync = false) => {
    if (showSync) setIsRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await api.get("/admin/promo/all", { headers: authHeader() });
      if (res.data.success) setCodes(res.data.promoCodes || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load promo codes");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchCodes(); }, []);

  const openCreate = () => { setForm({ ...BLANK_FORM }); setEditingId(null); setShowForm(true); };

  const openEdit = (c: PromoCode) => {
    setForm({
      code: c.code, name: c.name, description: c.description,
      discountType: c.discountType, discountValue: c.discountValue,
      applicableTo: c.applicableTo, restrictedToPlans: c.restrictedToPlans || [],
      minOrderAmount: c.minOrderAmount, maxDiscountCap: c.maxDiscountCap,
      maxUsageLimit: c.maxUsageLimit, perUserLimit: c.perUserLimit,
      isActive: c.isActive,
      validFrom: c.validFrom ? c.validFrom.slice(0, 10) : "",
      validUntil: c.validUntil ? c.validUntil.slice(0, 10) : "",
    });
    setEditingId(c._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error("Code and Name are required"); return; }
    if (form.discountType === "percent" && (form.discountValue <= 0 || form.discountValue > 100)) {
      toast.error("Percent discount must be between 1–100"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, validFrom: form.validFrom || null, validUntil: form.validUntil || null };
      if (editingId) {
        const res = await api.put(`/admin/promo/update/${editingId}`, payload, { headers: authHeader() });
        if (res.data.success) { toast.success("Promo code updated!"); setShowForm(false); fetchCodes(); }
      } else {
        const res = await api.post("/admin/promo/create", payload, { headers: authHeader() });
        if (res.data.success) { toast.success(`Code "${res.data.promoCode.code}" created!`); setShowForm(false); fetchCodes(); }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save promo code");
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await api.patch(`/admin/promo/toggle/${id}`, {}, { headers: authHeader() });
      if (res.data.success) {
        setCodes(prev => prev.map(c => c._id === id ? { ...c, isActive: res.data.isActive } : c));
        toast.success(`Code ${res.data.isActive ? "activated" : "deactivated"}`);
      }
    } catch { toast.error("Failed to toggle code"); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await api.delete(`/admin/promo/delete/${id}`, { headers: authHeader() });
      if (res.data.success) { toast.success(res.data.message); setCodes(prev => prev.filter(c => c._id !== id)); setConfirmDeleteId(null); }
    } catch { toast.error("Failed to delete code"); }
    finally { setDeletingId(null); }
  };

  const fetchUsage = async (id: string) => {
    if (usageData[id]) { setExpandedId(expandedId === id ? null : id); return; }
    setLoadingUsage(id);
    try {
      const res = await api.get(`/admin/promo/usage/${id}`, { headers: authHeader() });
      if (res.data.success) { setUsageData(prev => ({ ...prev, [id]: res.data })); setExpandedId(id); }
    } catch { toast.error("Failed to load usage data"); }
    finally { setLoadingUsage(null); }
  };

  // Filtered plan options based on applicableTo
  const filteredPlanOptions = useMemo(() =>
    ALL_PLANS.filter(p => {
      if (form.applicableTo === "subscription") return p.type === "subscription";
      if (form.applicableTo === "token") return (p.type as string) === "token";
      return true;
    }), [form.applicableTo]);

  const totalActive = codes.filter(c => c.isActive).length;
  const totalUses = codes.reduce((s, c) => s + c.usedCount, 0);
  const totalLimit = codes.reduce((s, c) => s + c.maxUsageLimit, 0);

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-20">

      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-purple-400 bg-purple-500/5 border border-purple-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Campaign Node
            </span>
            <span className="text-[9px] font-mono text-neutral-500">
              TELEMETRY: ONLINE
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
            Promo_<span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Nodes</span>
          </h1>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]" />
            Active_Marketing_Discount_System
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <button 
            onClick={() => fetchCodes(true)} 
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={cn("text-neutral-500", isRefreshing && "animate-spin text-red-500")} />
            {isRefreshing ? "SYNCING..." : "SYNC NOW"}
          </button>
          
          <button 
            onClick={openCreate} 
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-mono font-bold uppercase text-[10px] tracking-wider transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] active:scale-95 shrink-0"
          >
            <Plus size={12} /> NEW_PROMO_CODE
          </button>
        </div>
      </div>

      {/* --- Stats Banner --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Codes" value={codes.length} sub="Campaign nodes" icon={Tag} color="blue" />
        <StatsCard label="Active Status" value={totalActive} sub={`${codes.length - totalActive} dormant nodes`} icon={Shield} color="emerald" />
        <StatsCard label="Global Uses" value={`${totalUses} / ${totalLimit}`} sub="Redeemed slot limits" icon={Users} color="purple" />
        <StatsCard 
          label="Est. Savings" 
          value={`$${codes.reduce((sum, c) => sum + (c.discountType === "flat" ? c.usedCount * c.discountValue : c.usedCount * Math.min(c.maxDiscountCap || 15, 25)), 0).toLocaleString()}`} 
          sub="Total discount volume" 
          icon={DollarSign} 
          color="orange" 
        />
      </div>

      {/* --- Promo Code Registry --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={24} className="animate-spin text-red-500" />
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">Querying Promo Nodes Database…</p>
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-20 border border-neutral-900 bg-neutral-950/20 rounded-2xl">
          <Gift size={32} className="text-neutral-800 mx-auto mb-3" />
          <p className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">No active promotion codes registered</p>
          <button onClick={openCreate} className="mt-4 px-4 py-2 bg-red-600/10 border border-red-600/25 hover:bg-red-600/20 text-red-400 rounded-xl font-mono text-[9px] uppercase tracking-wider transition-all">
            Deploy First Promo Code
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {codes.map(c => {
            const pct = usagePct(c);
            const isExpanded = expandedId === c._id;
            const usage = usageData[c._id];

            return (
              <motion.div 
                key={c._id} 
                layout
                className={cn(
                  "bg-neutral-950/40 border rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-md",
                  c.isActive 
                    ? "border-neutral-900 hover:border-neutral-800" 
                    : "border-neutral-900/40 opacity-50 hover:opacity-75"
                )}
              >
                {/* Main Card Header Panel */}
                <div className="p-5 flex flex-col md:flex-row md:items-start gap-4 justify-between">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className={cn(
                      "p-2.5 rounded-xl border shrink-0 mt-0.5",
                      c.isActive ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" : "bg-neutral-900 border-neutral-800 text-neutral-600"
                    )}>
                      <Tag size={14} />
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-white text-xs tracking-wider select-all bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                          {c.code}
                        </span>
                        
                        <button 
                          onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied!"); }}
                          className="text-neutral-600 hover:text-white transition-colors p-1"
                        >
                          <Copy size={11} />
                        </button>
                        
                        <span className={cn(
                          "text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                          c.isActive ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" : "bg-neutral-900 border-neutral-850 text-neutral-500"
                        )}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                        
                        {c.discountType === "percent" ? (
                          <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/10 bg-blue-500/5 text-blue-400 uppercase">
                            {c.discountValue}% OFF {c.maxDiscountCap > 0 && `(cap $${c.maxDiscountCap})`}
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-purple-500/10 bg-purple-500/5 text-purple-400 uppercase">
                            ${c.discountValue} FLAT OFF
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-neutral-300 truncate">{c.name}</p>
                        {c.description && <p className="text-[9px] text-neutral-500 font-mono truncate">{c.description}</p>}
                      </div>

                      {/* Applicable Plan Lists */}
                      <div className="pt-1">
                        <PlanChips applicableTo={c.applicableTo} restrictedToPlans={c.restrictedToPlans} />
                      </div>

                      {/* Pay Preview Widget */}
                      <CompactPricePreview
                        applicableTo={c.applicableTo}
                        restrictedToPlans={c.restrictedToPlans}
                        discountType={c.discountType}
                        discountValue={c.discountValue}
                        maxDiscountCap={c.maxDiscountCap}
                        minOrderAmount={c.minOrderAmount}
                      />
                    </div>
                  </div>

                  {/* Operational Controls & Telemetry */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-900">
                    {/* Usage Progress Telemetry */}
                    <div className="w-40 md:w-36 font-mono">
                      <div className="flex justify-between items-center text-[8px] mb-1">
                        <span className="text-neutral-500 uppercase">Redemption</span>
                        <span className="text-neutral-300 font-bold">{c.usedCount} / {c.maxUsageLimit}</span>
                      </div>
                      <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500",
                          pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-orange-500" : "bg-emerald-500")}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between mt-1 text-[7px] text-neutral-600 uppercase">
                        <span>{c.maxUsageLimit - c.usedCount} left</span>
                        <span>{pct}% USED</span>
                      </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleToggle(c._id)} 
                        disabled={togglingId === c._id}
                        title={c.isActive ? "Deactivate" : "Activate"}
                        className={cn(
                          "p-2 rounded-xl border transition-all text-xs",
                          c.isActive
                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-450 hover:bg-red-500/5 hover:border-red-500/10 hover:text-red-400"
                            : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:bg-emerald-500/5 hover:border-emerald-500/10 hover:text-emerald-450"
                        )}
                      >
                        {togglingId === c._id ? <Loader2 size={12} className="animate-spin" /> : c.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                      </button>

                      <button 
                        onClick={() => openEdit(c)} 
                        title="Edit Node Settings"
                        className="p-2 rounded-xl border bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white transition-all"
                      >
                        <Edit3 size={12} />
                      </button>

                      <button 
                        onClick={() => fetchUsage(c._id)} 
                        title="Audit Usage Ledgers"
                        className="p-2 rounded-xl border bg-blue-500/5 border-blue-500/10 text-blue-400 hover:bg-blue-500/15 transition-all"
                      >
                        {loadingUsage === c._id ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />}
                      </button>

                      {confirmDeleteId === c._id ? (
                        <div className="flex items-center gap-1 font-mono">
                          <button 
                            onClick={() => handleDelete(c._id)} 
                            disabled={deletingId === c._id}
                            className="px-2 py-1.5 rounded-lg bg-red-600/90 text-white text-[8px] font-bold uppercase hover:bg-red-500 transition-all"
                          >
                            {deletingId === c._id ? <Loader2 size={10} className="animate-spin" /> : "Confirm"}
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-[8px] font-bold uppercase hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteId(c._id)} 
                          title="Purge Campaign"
                          className="p-2 rounded-xl border bg-red-500/5 border-red-500/10 text-red-500/60 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : c._id)}
                        className="p-2 rounded-xl border bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white transition-all ml-1"
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- Collapsible Drawer Section --- */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      transition={{ duration: 0.2 }} 
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-neutral-900 pt-5 space-y-5">
                        {/* Meta telemetry details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                          {[
                            { label: "User Limit", value: `${c.perUserLimit}x / account` },
                            { label: "Min Order", value: c.minOrderAmount > 0 ? `$${c.minOrderAmount}` : "No threshold" },
                            { label: "Valid From", value: formatDate(c.validFrom) },
                            { label: "Expires At", value: formatDate(c.validUntil) },
                          ].map(d => (
                            <div key={d.label} className="p-3 bg-neutral-900/30 rounded-xl border border-neutral-900/60">
                              <p className="text-[8px] text-neutral-500 uppercase tracking-widest">{d.label}</p>
                              <p className="text-[10px] font-bold text-white mt-0.5">{d.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Audited user registrations */}
                        {usage ? (
                          <div className="font-mono">
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Database size={11} className="text-neutral-600" />
                              AUDITED USER REDEMPTIONS ({usage.usedBy?.length || 0} RECORDS)
                            </p>
                            
                            {usage.usedBy?.length > 0 ? (
                              <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                                {usage.usedBy.map((u: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-2.5 bg-neutral-900/20 rounded-xl border border-neutral-900/60 hover:border-neutral-800 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-850 border border-neutral-800 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                                        {(u.userId?.name || "U").charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-white truncate max-w-[150px]">{u.userId?.name || "Anonymous Member"}</p>
                                        <p className="text-[8px] text-neutral-500 truncate max-w-[150px]">{u.userId?.email || "—"}</p>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-[9px] text-neutral-300 font-bold">{u.timesUsed}x redeemed</p>
                                      <p className="text-[7px] text-neutral-600 uppercase mt-0.5">{formatDate(u.usedAt)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] text-neutral-600 py-6 text-center uppercase tracking-wide">No active redemptions logged in ledger</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex justify-center py-6">
                            <Loader2 size={16} className="animate-spin text-neutral-600" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* --- Right sliding console Drawer --- */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex justify-end" onClick={() => setShowForm(false)}>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-hidden shadow-2xl relative z-10"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                  <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-bold">
                    {editingId ? "Modify_Promo_Node" : "Configure_Promo_Node"}
                  </span>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 custom-scrollbar">
                
                {/* Code Field */}
                <DrawerField label="Promo Coupon Code *" hint="MUST BE ALPHANUMERIC UPPERCASE">
                  <input 
                    value={form.code} 
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))} 
                    disabled={!!editingId} 
                    placeholder="COUPON2026" 
                    className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white placeholder:text-neutral-700 focus:outline-none focus:shadow-[0_0_10px_rgba(239,68,68,0.02)] transition-all disabled:opacity-50" 
                  />
                </DrawerField>

                {/* Name */}
                <DrawerField label="Campaign Name *" hint="Short identification label">
                  <input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    placeholder="Early Adopters Special" 
                    className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white placeholder:text-neutral-700 focus:outline-none focus:shadow-[0_0_10px_rgba(239,68,68,0.02)] transition-all" 
                  />
                </DrawerField>

                {/* Description */}
                <DrawerField label="Detailed Description" hint="Campaign purpose details">
                  <input 
                    value={form.description} 
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                    placeholder="Discount applicable on yearly checkouts" 
                    className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white placeholder:text-neutral-700 focus:outline-none focus:shadow-[0_0_10px_rgba(239,68,68,0.02)] transition-all" 
                  />
                </DrawerField>

                <div className="grid grid-cols-2 gap-4">
                  {/* Discount Type */}
                  <DrawerField label="Discount Engine">
                    <div className="flex bg-neutral-900 border border-neutral-850 rounded-xl p-1 gap-1">
                      {(["flat", "percent"] as const).map(t => (
                        <button 
                          type="button"
                          key={t} 
                          onClick={() => setForm(f => ({ ...f, discountType: t }))}
                          className={cn(
                            "flex-1 h-9 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5",
                            form.discountType === t 
                              ? "bg-red-650 text-white shadow" 
                              : "text-neutral-500 hover:text-white"
                          )}
                        >
                          {t === "flat" ? <DollarSign size={10} /> : <Percent size={10} />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </DrawerField>

                  {/* Discount Value */}
                  <DrawerField label="Discount Amount">
                    <input 
                      type="number" 
                      value={form.discountValue} 
                      min={1} 
                      max={form.discountType === "percent" ? 100 : 9999}
                      onChange={e => setForm(f => ({ ...f, discountValue: +e.target.value }))} 
                      className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white focus:outline-none focus:shadow-[0_0_10px_rgba(239,68,68,0.02)]" 
                    />
                  </DrawerField>
                </div>

                {/* Percentage Cap */}
                {form.discountType === "percent" && (
                  <DrawerField label="Max Discount Threshold Amount ($)" hint="0 = unrestricted cap limit">
                    <input 
                      type="number" 
                      value={form.maxDiscountCap} 
                      min={0}
                      onChange={e => setForm(f => ({ ...f, maxDiscountCap: +e.target.value }))} 
                      className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white focus:outline-none" 
                    />
                  </DrawerField>
                )}

                {/* Applies To */}
                <DrawerField label="Target Plan Class Scope" hint="Restrict by general category">
                  <select 
                    value={form.applicableTo}
                    onChange={e => setForm(f => ({ ...f, applicableTo: e.target.value as any, restrictedToPlans: [] }))}
                    className="w-full bg-neutral-900 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="all">All Subscriptions &amp; Coin Packs</option>
                    <option value="subscription">Subscriptions Plans Only</option>
                    <option value="token">Token Package Tiers Only</option>
                  </select>
                </DrawerField>

                <div className="grid grid-cols-2 gap-4">
                  {/* Minimum Order */}
                  <DrawerField label="Min Checkout Limit ($)" hint="0 = no minimum">
                    <input 
                      type="number" 
                      value={form.minOrderAmount} 
                      min={0}
                      onChange={e => setForm(f => ({ ...f, minOrderAmount: +e.target.value }))} 
                      className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white focus:outline-none" 
                    />
                  </DrawerField>

                  {/* Uses Limit */}
                  <DrawerField label="Max Global Slots" hint="Global usage bounds">
                    <input 
                      type="number" 
                      value={form.maxUsageLimit} 
                      min={1}
                      onChange={e => setForm(f => ({ ...f, maxUsageLimit: +e.target.value }))} 
                      className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white focus:outline-none" 
                    />
                  </DrawerField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Per User */}
                  <DrawerField label="Redemptions Per Node" hint="Max times per account">
                    <input 
                      type="number" 
                      value={form.perUserLimit} 
                      min={1}
                      onChange={e => setForm(f => ({ ...f, perUserLimit: +e.target.value }))} 
                      className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-xs font-mono text-white focus:outline-none" 
                    />
                  </DrawerField>

                  {/* Status Toggle */}
                  <DrawerField label="Deploy Status">
                    <button 
                      type="button"
                      onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      className={cn(
                        "flex items-center gap-2 h-11 px-4 w-full rounded-xl border text-[10px] font-mono font-bold uppercase transition-all justify-center",
                        form.isActive ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-450" : "bg-neutral-900 border-neutral-850 text-neutral-500"
                      )}
                    >
                      {form.isActive ? <Shield size={12} /> : <ShieldOff size={12} />}
                      {form.isActive ? "ACTIVE_CAMPAIGN" : "DORMANT_CAMPAIGN"}
                    </button>
                  </DrawerField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Valid From */}
                  <DrawerField label="Campaign Release Date" hint="YYYY-MM-DD">
                    <input 
                      type="date" 
                      value={form.validFrom}
                      onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} 
                      className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-[11px] font-mono text-white focus:outline-none" 
                    />
                  </DrawerField>

                  {/* Valid Until */}
                  <DrawerField label="Campaign Expiry Date" hint="YYYY-MM-DD">
                    <input 
                      type="date" 
                      value={form.validUntil}
                      onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} 
                      className="w-full bg-neutral-900/50 border border-neutral-850 focus:border-red-500/30 rounded-xl h-11 px-4 text-[11px] font-mono text-white focus:outline-none" 
                    />
                  </DrawerField>
                </div>

                {/* Plan restriction selections */}
                <DrawerField label="Restrict to Specific Plan Identifiers" hint="Unselected defaults to all plans inside Target Class scope">
                  <div className="flex flex-wrap gap-2 pt-1">
                    {filteredPlanOptions.map(p => {
                      const prices = getPlanPrices(p as any);
                      const selected = form.restrictedToPlans.includes(p.id);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() =>
                            setForm(f => ({
                              ...f,
                              restrictedToPlans: selected
                                ? f.restrictedToPlans.filter(x => x !== p.id)
                                : [...f.restrictedToPlans, p.id],
                            }))
                          }
                          className={cn(
                            "flex flex-col items-start px-3.5 py-2.5 rounded-xl border transition-all text-left font-mono min-w-[120px]",
                            selected
                              ? "border-red-500 bg-red-500/5 text-white"
                              : "border-neutral-905 bg-neutral-900/40 text-neutral-450 hover:border-neutral-800 hover:text-white"
                          )}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
                          <div className="flex flex-col gap-0.5 mt-1">
                            {prices.map((pr, i) => (
                              <span key={i} className="text-[8px] text-neutral-500">
                                {pr.label}: <span className="text-white">${pr.price}</span>
                                {p.type === "subscription" && <span>/{pr.label === "Monthly" ? "mo" : "yr"}</span>}
                              </span>
                            ))}
                          </div>
                          {selected && (
                            <div className="flex items-center gap-1 mt-1.5 border-t border-red-500/20 pt-1 w-full">
                              <CheckCircle2 size={8} className="text-red-400" />
                              <span className="text-[7px] text-red-400 font-bold uppercase">Restricted</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </DrawerField>

                {/* Live Discount Calculator */}
                <DiscountPreview
                  applicableTo={form.applicableTo}
                  restrictedToPlans={form.restrictedToPlans}
                  discountType={form.discountType}
                  discountValue={form.discountValue}
                  maxDiscountCap={form.maxDiscountCap}
                  minOrderAmount={form.minOrderAmount}
                />

              </div>

              {/* Drawer Action Buttons */}
              <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-neutral-900 bg-neutral-950/90 backdrop-blur-md flex items-center gap-3 shrink-0">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-black font-mono font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-neutral-250 transition-all disabled:opacity-50 w-1/2"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  SAVE_CAMPAIGN_NODE
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3.5 bg-neutral-900 border border-neutral-800 text-neutral-450 font-mono font-bold uppercase text-[10px] tracking-widest rounded-xl hover:text-white transition-all w-1/2"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── StatsCard Subcomponent ───────────────────────────────────
function StatsCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub: string; icon: any; color: "blue" | "emerald" | "purple" | "orange" }) {
  let text = "text-red-400";
  let border = "hover:border-red-500/40";
  
  if (color === "blue") {
    text = "text-blue-400";
    border = "hover:border-blue-500/40";
  } else if (color === "emerald") {
    text = "text-emerald-400";
    border = "hover:border-emerald-500/40";
  } else if (color === "purple") {
    text = "text-purple-400";
    border = "hover:border-purple-500/40";
  } else if (color === "orange") {
    text = "text-orange-400";
    border = "hover:border-orange-500/40";
  }

  return (
    <div className={cn("bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[115px]", border)}>
      <div className="absolute bottom-2 right-2 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-500 scale-125">
        <Icon size={70} />
      </div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-1">{label}</p>
          <h4 className="text-2xl font-mono font-black italic tracking-tight text-white leading-none">
            {value}
          </h4>
        </div>
        <div className={cn("p-1.5 rounded-lg bg-neutral-900 border border-neutral-850 shrink-0", text)}>
          <Icon size={12} />
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-neutral-900/40 relative z-10 flex items-center justify-between text-[7px] font-mono text-neutral-550 uppercase">
        <span>{sub}</span>
        <span className={cn("flex items-center gap-0.5 font-bold", text)}>
          <Sparkles size={7} /> live
        </span>
      </div>
    </div>
  );
}

// ─── DrawerField Helper ───────────────────────────────────────
function DrawerField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center flex-wrap gap-x-2">
        <label className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest">{label}</label>
        {hint && <span className="text-[8px] font-mono text-neutral-600 tracking-tight">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
