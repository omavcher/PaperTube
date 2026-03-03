"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, Edit3,
  X, Save, Loader2, Users, CheckCircle2,
  RefreshCw, Copy, ChevronDown, ChevronUp,
  Gift, Clock, ShieldOff, Shield, IndianRupee,
  ArrowRight, Zap, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";

// ─── All plan data (source of truth) ─────────────────────────
const ALL_PLANS = [
  // Subscriptions
  {
    id: "scholar", type: "subscription", label: "Scholar",
    monthlyPrice: 149, yearlyPrice: 1490,
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    id: "pro", type: "subscription", label: "Pro Scholar",
    monthlyPrice: 299, yearlyPrice: 2990,
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  {
    id: "power", type: "subscription", label: "Power Scholar",
    monthlyPrice: 599, yearlyPrice: 5990,
    tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  },
  // Token packs
  {
    id: "basic", type: "token", label: "Basic Chip",
    price: 99,
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  {
    id: "standard", type: "token", label: "Standard Core",
    price: 399,
    tagColor: "bg-teal-500/10 text-teal-400 border-teal-500/20"
  },
  {
    id: "premium", type: "token", label: "Premium Node",
    price: 699,
    tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
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

// Get all price points for a plan (could be monthly / yearly / flat)
function getPlanPrices(plan: typeof ALL_PLANS[number]): Array<{ label: string; price: number }> {
  if (plan.type === "token") {
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
  discountValue: 50,
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
function authHeader() {
  return { Auth: localStorage.getItem("authToken") };
}
function usagePct(code: PromoCode) {
  return Math.min(100, Math.round((code.usedCount / code.maxUsageLimit) * 100));
}
function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
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
    <div className="mt-6 col-span-full">
      <div className="flex items-center gap-2 mb-3">
        <Eye size={12} className="text-emerald-400" />
        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
          Live Discount Preview — what users will actually pay
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {eligible.map((plan) => {
          const prices = getPlanPrices(plan as any);
          return (
            <div key={plan.id} className={cn("rounded-xl border p-4 space-y-2", plan.tagColor)}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider">{plan.label}</span>
                <span className="text-[8px] font-bold opacity-60 uppercase">{plan.type}</span>
              </div>
              {prices.map(({ label, price }) => {
                const meetsMin = minOrderAmount === 0 || price >= minOrderAmount;
                if (!meetsMin) {
                  return (
                    <div key={label} className="flex items-center justify-between opacity-40">
                      <span className="text-[9px]">{label} — ₹{price}</span>
                      <span className="text-[8px] italic">Below min order</span>
                    </div>
                  );
                }
                const { discount, final } = calcDiscount(price, discountType, discountValue, maxDiscountCap);
                const gstFinal = +(final * 1.18).toFixed(2);
                return (
                  <div key={label} className="bg-black/30 rounded-lg p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold opacity-70">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] line-through opacity-40">₹{price}</span>
                        <ArrowRight size={8} className="opacity-40" />
                        <span className="text-[10px] font-black text-white">₹{final}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[8px] opacity-60">
                      <span className="text-red-400 font-bold">— ₹{discount} saved</span>
                      <span>+GST → ₹{gstFinal}</span>
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
      <span className="text-[9px] text-neutral-500 font-medium capitalize">
        {applicableTo === "all" ? "All Plans" : `All ${applicableTo} plans`}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {plans.map((p) => {
        const prices = getPlanPrices(p as any);
        return (
          <div key={p.id} className={cn("px-1.5 py-0.5 rounded border text-[8px] font-bold", p.tagColor)}>
            {p.label} ·{" "}
            {prices.map((pr, i) => (
              <span key={i}>
                {i > 0 && " / "}₹{pr.price}
                <span className="opacity-60 font-normal">/{pr.label.toLowerCase()}</span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
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

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/promo/all", { headers: authHeader() });
      if (res.data.success) setCodes(res.data.promoCodes || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load promo codes");
    } finally {
      setLoading(false);
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
      if (form.applicableTo === "token") return p.type === "token";
      return true;
    }), [form.applicableTo]);

  const totalActive = codes.filter(c => c.isActive).length;
  const totalUses = codes.reduce((s, c) => s + c.usedCount, 0);
  const totalLimit = codes.reduce((s, c) => s + c.maxUsageLimit, 0);

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Gift size={22} className="text-red-500" /> Promo Codes
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
            Create &amp; manage discount codes for users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchCodes} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95">
            <Plus size={15} /> New Code
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Codes", value: codes.length, icon: Tag, color: "text-white" },
          { label: "Active", value: totalActive, icon: Shield, color: "text-emerald-400" },
          { label: "Inactive", value: codes.length - totalActive, icon: ShieldOff, color: "text-neutral-500" },
          { label: "Total Uses", value: `${totalUses} / ${totalLimit}`, icon: Users, color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="bg-black border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <s.icon size={18} className={s.color} />
            <div>
              <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold">{s.label}</p>
              <p className={cn("text-lg font-black", s.color)}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Form Drawer ─── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-neutral-900/60 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                {editingId ? "Edit Code" : "Create New Code"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* Code */}
              <FormField label="Code *" hint="e.g. FIRST100">
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} disabled={!!editingId} placeholder="MYCODE2025" className="form-input font-mono tracking-widest" />
              </FormField>

              {/* Name */}
              <FormField label="Name *" hint="Friendly display name">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="First 100 Users" className="form-input" />
              </FormField>

              {/* Description */}
              <FormField label="Description" hint="Optional subtitle">
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="For our early supporters" className="form-input" />
              </FormField>

              {/* Discount Type */}
              <FormField label="Discount Type">
                <div className="flex gap-2">
                  {(["flat", "percent"] as const).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, discountType: t }))}
                      className={cn("flex-1 h-10 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                        form.discountType === t ? "bg-red-600 border-red-600 text-white" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white")}>
                      {t === "flat" ? "₹ Flat" : "% Percent"}
                    </button>
                  ))}
                </div>
              </FormField>

              {/* Discount Value */}
              <FormField label={`Discount Value (${form.discountType === "percent" ? "%" : "₹"})`}>
                <input type="number" value={form.discountValue} min={1} max={form.discountType === "percent" ? 100 : 99999}
                  onChange={e => setForm(f => ({ ...f, discountValue: +e.target.value }))} className="form-input" />
              </FormField>

              {/* Max Discount Cap */}
              {form.discountType === "percent" && (
                <FormField label="Max Discount Cap (₹)" hint="0 = no cap">
                  <input type="number" value={form.maxDiscountCap} min={0}
                    onChange={e => setForm(f => ({ ...f, maxDiscountCap: +e.target.value }))} className="form-input" />
                </FormField>
              )}

              {/* Applies To */}
              <FormField label="Applies To" hint="Which plan category">
                <select value={form.applicableTo}
                  onChange={e => setForm(f => ({ ...f, applicableTo: e.target.value as any, restrictedToPlans: [] }))}
                  className="form-input">
                  <option value="all">All Plans (Subscriptions + Token Packs)</option>
                  <option value="subscription">Subscriptions Only</option>
                  <option value="token">Token Packs Only</option>
                </select>
              </FormField>

              {/* Min Order Amount */}
              <FormField label="Min Order Amount (₹)" hint="0 = no minimum">
                <input type="number" value={form.minOrderAmount} min={0}
                  onChange={e => setForm(f => ({ ...f, minOrderAmount: +e.target.value }))} className="form-input" />
              </FormField>

              {/* Max Global Usage */}
              <FormField label="Max Total Uses" hint="Global limit across all users">
                <input type="number" value={form.maxUsageLimit} min={1}
                  onChange={e => setForm(f => ({ ...f, maxUsageLimit: +e.target.value }))} className="form-input" />
              </FormField>

              {/* Per User Limit */}
              <FormField label="Uses Per User" hint="Usually 1 (one-time per user)">
                <input type="number" value={form.perUserLimit} min={1}
                  onChange={e => setForm(f => ({ ...f, perUserLimit: +e.target.value }))} className="form-input" />
              </FormField>

              {/* Valid From */}
              <FormField label="Valid From" hint="Leave blank = immediately">
                <input type="date" value={form.validFrom}
                  onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className="form-input" />
              </FormField>

              {/* Valid Until */}
              <FormField label="Valid Until" hint="Leave blank = no expiry">
                <input type="date" value={form.validUntil}
                  onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="form-input" />
              </FormField>

              {/* Active toggle */}
              <FormField label="Status">
                <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={cn("flex items-center gap-3 h-10 px-4 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all",
                    form.isActive ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-neutral-500")}>
                  {form.isActive ? <Shield size={14} /> : <ShieldOff size={14} />}
                  {form.isActive ? "Active" : "Inactive"}
                </button>
              </FormField>

              {/* ─── Restrict to specific plans (full width) ─── */}
              <div className="col-span-full">
                <FormField label="Restrict to Specific Plans" hint="Click to select — leave all unselected = applies to all plans in category above">
                  <div className="flex flex-wrap gap-2 pt-1">
                    {filteredPlanOptions.map(p => {
                      const prices = getPlanPrices(p as any);
                      const selected = form.restrictedToPlans.includes(p.id);
                      return (
                        <button
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
                            "flex flex-col items-start px-3 py-2 rounded-xl border transition-all text-left",
                            selected
                              ? "border-red-600 bg-red-600/10 text-white"
                              : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white"
                          )}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">{p.label}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {prices.map((pr, i) => (
                              <span key={i} className={cn("text-[9px] font-bold", selected ? "text-red-300" : "text-neutral-500")}>
                                {pr.label}: <span className="text-white">₹{pr.price}</span>
                                {p.type === "subscription" && <span className="opacity-50">/{pr.label === "Monthly" ? "mo" : "yr"}</span>}
                              </span>
                            ))}
                          </div>
                          {selected && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle2 size={9} className="text-red-400" />
                              <span className="text-[8px] text-red-400 font-bold uppercase">Selected</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </FormField>
              </div>

              {/* ─── Live Discount Preview (full width) ─── */}
              <DiscountPreview
                applicableTo={form.applicableTo}
                restrictedToPlans={form.restrictedToPlans}
                discountType={form.discountType}
                discountValue={form.discountValue}
                maxDiscountCap={form.maxDiscountCap}
                minOrderAmount={form.minOrderAmount}
              />

            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 mt-8">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-neutral-200 transition-all disabled:opacity-50 active:scale-95">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editingId ? "Update Code" : "Create Code"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-neutral-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Code List ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-red-500" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
          <Gift size={40} className="text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No promo codes yet</p>
          <button onClick={openCreate} className="mt-4 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">
            Create First Code
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {codes.map(c => {
            const pct = usagePct(c);
            const isExpanded = expandedId === c._id;
            const usage = usageData[c._id];

            return (
              <motion.div key={c._id} layout
                className={cn("bg-black border rounded-2xl overflow-hidden transition-all duration-300",
                  c.isActive ? "border-white/10" : "border-white/5 opacity-60")}>

                {/* Main Row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">

                  {/* Code + Name + Plans */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={cn("p-2.5 rounded-xl border shrink-0 mt-0.5",
                      c.isActive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/5")}>
                      <Tag size={16} className={c.isActive ? "text-emerald-400" : "text-neutral-600"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Code + status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-white text-sm tracking-widest">{c.code}</span>
                        <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied!"); }}
                          className="text-neutral-600 hover:text-white transition-colors">
                          <Copy size={12} />
                        </button>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                          c.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-500")}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                        {c.discountType === "percent" ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                            {c.discountValue}% OFF{c.maxDiscountCap > 0 && ` (max ₹${c.maxDiscountCap})`}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                            ₹{c.discountValue} OFF
                          </span>
                        )}
                      </div>

                      {/* Name + description */}
                      <p className="text-xs text-neutral-400 font-medium mt-0.5 truncate">{c.name}</p>
                      {c.description && <p className="text-[10px] text-neutral-600 truncate">{c.description}</p>}

                      {/* ─── Plan chips with prices ─── */}
                      <div className="mt-2">
                        <p className="text-[8px] text-neutral-600 uppercase tracking-widest font-bold mb-1">Eligible Plans</p>
                        <PlanChips applicableTo={c.applicableTo} restrictedToPlans={c.restrictedToPlans} />
                      </div>

                      {/* ─── What user pays per plan preview (compact) ─── */}
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

                  {/* Right: usage + actions */}
                  <div className="flex flex-col gap-4 shrink-0">

                    {/* Usage Bar */}
                    <div className="w-full sm:w-44">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] text-neutral-500 font-bold uppercase">Usage</span>
                        <span className="text-[10px] font-black text-white">{c.usedCount} / {c.maxUsageLimit}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500",
                          pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-orange-500" : "bg-emerald-500")}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-[9px] text-neutral-600">{c.maxUsageLimit - c.usedCount} slots left</p>
                        <p className="text-[9px] text-neutral-600">{pct}% used</p>
                      </div>
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center gap-2 text-[9px] text-neutral-600">
                      <Clock size={10} />
                      <span>Expires: <span className="text-neutral-400 font-bold">{formatDate(c.validUntil)}</span></span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Toggle */}
                      <button onClick={() => handleToggle(c._id)} disabled={togglingId === c._id}
                        title={c.isActive ? "Deactivate" : "Activate"}
                        className={cn("p-2 rounded-xl border transition-all text-xs",
                          c.isActive
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                            : "bg-white/5 border-white/10 text-neutral-500 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400")}>
                        {togglingId === c._id ? <Loader2 size={14} className="animate-spin" /> : c.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>

                      {/* Edit */}
                      <button onClick={() => openEdit(c)} title="Edit"
                        className="p-2 rounded-xl border bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                        <Edit3 size={14} />
                      </button>

                      {/* Usage */}
                      <button onClick={() => fetchUsage(c._id)} title="View who used this"
                        className="p-2 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                        {loadingUsage === c._id ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                      </button>

                      {/* Delete */}
                      {confirmDeleteId === c._id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(c._id)} disabled={deletingId === c._id}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-[9px] font-black uppercase hover:bg-red-500 transition-all">
                            {deletingId === c._id ? <Loader2 size={11} className="animate-spin" /> : "Confirm"}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 text-neutral-400 text-[9px] font-black uppercase hover:text-white">
                            No
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(c._id)} title="Delete"
                          className="p-2 rounded-xl border bg-red-500/5 border-red-500/10 text-red-500/60 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}

                      {/* Expand */}
                      <button onClick={() => setExpandedId(isExpanded ? null : c._id)}
                        className="p-2 rounded-xl border bg-white/5 border-white/10 text-neutral-500 hover:text-white transition-all">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded: usage list + extra details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-white/5 pt-5 space-y-5">

                        {/* Extra details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: "Per User Limit", value: `${c.perUserLimit}x` },
                            { label: "Min Order", value: c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : "None" },
                            { label: "Valid From", value: formatDate(c.validFrom) },
                            { label: "Created", value: formatDate(c.createdAt) },
                          ].map(d => (
                            <div key={d.label} className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                              <p className="text-[9px] text-neutral-600 uppercase tracking-widest">{d.label}</p>
                              <p className="text-xs font-bold text-white mt-0.5">{d.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Usage list */}
                        {usage ? (
                          <div>
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">
                              Who Used This Code ({usage.usedBy?.length || 0} users)
                            </p>
                            {usage.usedBy?.length > 0 ? (
                              <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                                {usage.usedBy.map((u: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center text-[9px] font-black text-white">
                                        {(u.userId?.name || "U").charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold text-white">{u.userId?.name || "Unknown"}</p>
                                        <p className="text-[9px] text-neutral-500">{u.userId?.email || "—"}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] text-neutral-400 font-bold">{u.timesUsed}x used</p>
                                      <p className="text-[9px] text-neutral-600">{formatDate(u.usedAt)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-600 py-4 text-center">No one has used this code yet</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex justify-center py-4">
                            <Loader2 size={18} className="animate-spin text-neutral-600" />
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

      {/* Inline styles */}
      <style jsx global>{`
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          height: 40px;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 12px;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: rgba(255,255,255,0.25); }
        .form-input option { background: #111; color: white; }
      `}</style>
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
    <div className="mt-3">
      <p className="text-[8px] text-neutral-600 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1">
        <IndianRupee size={8} /> User pays after discount
      </p>
      <div className="flex flex-wrap gap-1.5">
        {eligible.map(plan => {
          const prices = getPlanPrices(plan as any);
          return prices.map(({ label, price }) => {
            const meetsMin = minOrderAmount === 0 || price >= minOrderAmount;
            const { discount, final } = calcDiscount(price, discountType, discountValue, maxDiscountCap);
            return (
              <div key={`${plan.id}-${label}`}
                className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px]",
                  meetsMin ? "border-white/10 bg-white/[0.03]" : "border-white/5 bg-white/[0.02] opacity-40")}>
                <span className="text-neutral-500 font-medium">{plan.label}</span>
                {plan.type === "subscription" && <span className="text-neutral-700">({label.toLowerCase()})</span>}
                <span className="text-neutral-600 line-through">₹{price}</span>
                {meetsMin ? (
                  <>
                    <ArrowRight size={8} className="text-neutral-700" />
                    <span className="font-black text-emerald-400">₹{final}</span>
                    <span className="text-neutral-600 text-[8px]">+GST ≈ ₹{+(final * 1.18).toFixed(0)}</span>
                  </>
                ) : (
                  <span className="text-[8px] italic text-neutral-600">min order not met</span>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

// ─── FormField helper ─────────────────────────────────────────
function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-start gap-1 flex-wrap">
        {label}
        {hint && <span className="text-neutral-600 normal-case tracking-normal font-medium">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
