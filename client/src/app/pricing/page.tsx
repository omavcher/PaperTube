"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Smartphone, Tag, Zap, User, Loader2, IndianRupee, 
  ShieldCheck, Activity, Terminal, CheckCircle2, XCircle, 
  CreditCard, TicketPercent, Sparkles, X, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import Script from "next/script";
import Footer from "@/components/Footer";
import { toast } from "sonner";

// --- Coupon Logic ---
interface Coupon {
  id: string;
  name: string;
  code: string;
  value: number;
  type: 'percent' | 'flat';
}

const AVAILABLE_COUPONS: Coupon[] = [
  { id: '1', name: 'Neural Welcome', code: 'VOID50', value: 50, type: 'percent' },
  { id: '2', name: 'Elite Protocol', code: 'ELITE55', value: 55, type: 'flat' },
  { id: '3', name: 'Flash Sync', code: 'SPEED20', value: 20.5, type: 'percent' },
  { id: '4', name: 'Starter Chip', code: 'FIRST50', value: 50, type: 'flat' },
];

// --- Custom Neural Modal (Z-Index Fixed) ---
function NeuralModal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-5xl bg-[#080808] border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[3rem] shadow-[0_0_100px_rgba(220,38,38,0.2)] overflow-hidden max-h-[100vh] md:max-h-[90vh] flex flex-col"
          >
            {/* Header / Close Button */}
            <div className="absolute top-6 right-6 z-[210]">
              <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 hover:bg-red-600 transition-colors text-white border border-white/5">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Purchase Interface Component ---
function PurchaseInterface({ packageData, user, onPurchase, isProcessing, onUpdateMobile, billingPeriod, activeOffers }: any) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [isMobileEditable, setIsMobileEditable] = useState(!user?.mobile);

  const baseAmount = packageData ? (billingPeriod === 'monthly' ? packageData.monthlyPrice : packageData.yearlyPrice) : 0;
  const bestOffer = activeOffers[0];
  const offerDiscount = bestOffer ? (baseAmount * bestOffer.discountPercent) / 100 : 0;
  
  const extraDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.type === 'percent' ? (baseAmount * appliedCoupon.value) / 100 : appliedCoupon.value;
  }, [appliedCoupon, baseAmount]);

  const totalDiscount = offerDiscount + extraDiscount;
  const discountedAmount = Math.max(0, baseAmount - totalDiscount);
  const gstAmount = discountedAmount * 0.18;
  const totalAmount = discountedAmount + gstAmount;

  const applyCode = (code: string) => {
    const found = AVAILABLE_COUPONS.find(c => c.code === code.toUpperCase().trim());
    if (found) {
      setAppliedCoupon(found);
      setCouponCode(found.code);
      toast.success(`${found.name} Applied`);
    } else {
      toast.error("Invalid Code");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
      {/* Left Section: Inputs */}
      <div className="lg:col-span-7 p-8 md:p-12 space-y-10 border-b lg:border-b-0 lg:border-r border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
            <CreditCard className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Acquisition Node</h2>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Secured Payment Terminal</p>
          </div>
        </div>

        {/* User HUD */}
       {/* Personnel Identity Section */}
<section className="space-y-4">
  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 flex items-center gap-2">
    <User size={14}/> Personnel Identity
  </label>
  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-5 group hover:bg-white/[0.04] transition-all">
    {/* Profile Image with Fallback to Initial */}
    <div className="h-16 w-16 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.1)]">
      {user?.picture ? (
        <img 
          src={user.picture} 
          alt={user.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <span className="text-red-600 font-black italic text-2xl uppercase">
          {user?.name?.charAt(0) || "U"}
        </span>
      )}
    </div>

    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <p className="font-black uppercase tracking-tighter text-lg text-white leading-none">
          {user?.name}
        </p>
        {/* Membership Badge based on success JSON */}
        {user?.membership?.isActive && (
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
            <ShieldCheck size={10} className="text-emerald-500" />
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
              {user.membership.planName}
            </span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase leading-none">
        {user?.email}
      </p>
    </div>
  </div> 
</section>

        {/* Mobile Input */}
        <section className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 flex items-center gap-2"><Smartphone size={14}/> Contact Link</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 font-black text-xs border-r border-white/5 pr-3">+91</span>
              <input 
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0,10))}
                disabled={!isMobileEditable}
                className="w-full bg-black border border-white/10 h-14 rounded-2xl pl-16 font-mono text-lg text-white focus:border-red-600/50 outline-none transition-all"
                placeholder="0000000000"
              />
            </div>
            <button 
              onClick={() => isMobileEditable ? onUpdateMobile(mobile).then(() => setIsMobileEditable(false)) : setIsMobileEditable(true)}
              className={cn("h-14 px-8 rounded-2xl font-black uppercase italic transition-all", isMobileEditable ? "bg-red-600 text-white" : "bg-neutral-900 text-neutral-400 border border-white/5")}
            >
              {isMobileEditable ? "Sync" : "Edit"}
            </button>
          </div>
        </section>

        {/* Coupons */}
        <section className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 flex items-center gap-2"><Tag size={14}/> Protocols Available</label>
          <div className="flex gap-3">
            <input 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 bg-black border border-white/10 h-12 rounded-xl px-5 font-mono text-sm uppercase outline-none focus:border-red-600/50"
              placeholder="MANUAL_ENTRY"
            />
            <button onClick={() => applyCode(couponCode)} className="px-8 h-12 bg-transparent border border-red-600 text-red-500 rounded-xl font-black uppercase italic hover:bg-red-600 hover:text-white transition-all text-xs">Verify</button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AVAILABLE_COUPONS.map(c => (
              <button 
                key={c.id}
                onClick={() => applyCode(c.code)}
                className="p-3 bg-white/[0.01] border border-dashed border-white/5 rounded-xl hover:border-red-600/50 hover:bg-red-600/[0.03] transition-all text-left group"
              >
                <p className="text-[10px] font-black group-hover:text-red-500 mb-1">{c.code}</p>
                <p className="text-[9px] font-black text-emerald-500 uppercase">
                  {c.type === 'percent' ? `-${c.value}%` : `₹${c.value} OFF`}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Right Section: Summary */}
      <div className="lg:col-span-5 bg-neutral-900/30 p-8 md:p-12 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="pb-8 border-b border-white/5">
             <Badge className="bg-red-600/10 text-red-500 border-none px-0 text-[8px] font-black uppercase tracking-[0.4em] mb-2">Billing Unit</Badge>
             <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">{packageData?.name} Plan</h3>
             <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-2">{billingPeriod} protocol enabled</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase text-neutral-500 tracking-widest">
               <span>Base Tier</span>
               <span className="text-white">₹{baseAmount.toFixed(2)}</span>
            </div>
            <AnimatePresence>
              {totalDiscount > 0 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-xs font-black uppercase text-emerald-500 tracking-widest">
                   <span className="flex items-center gap-1"><TicketPercent size={14}/> Total Savings</span>
                   <span>- ₹{totalDiscount.toFixed(2)}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-between text-xs font-bold uppercase text-neutral-500 tracking-widest">
               <span>Tax (GST 18%)</span>
               <span className="text-white">₹{gstAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-12">
          <div className="bg-black p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-red-500 mb-1 italic">Net Amount</span>
                <span className="text-6xl font-black italic tracking-tighter text-white">₹{Math.round(totalAmount)}</span>
             </div>
          </div>

          <button 
            onClick={() => onPurchase({ packageId: packageData.id, finalAmount: totalAmount, mobile })}
            disabled={isProcessing || mobile.length !== 10}
            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-2xl text-xl shadow-2xl shadow-red-900/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <><Zap fill="white" size={20}/> Execute Sync</>}
          </button>

          <div className="flex justify-center gap-6 text-[8px] font-black text-neutral-700 uppercase tracking-widest">
            <span className="flex items-center gap-1"><ShieldCheck size={10}/> 256-BIT SSL</span>
            <span className="flex items-center gap-1"><IndianRupee size={10}/> RAZORPAY SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Pricing Page Section ---
export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const plans = [
    { id: "scholar", name: "Scholar", monthlyPrice: 149, yearlyPrice: 1490, description: "Occasional learner protocol.", features: ["Model A + B", "1 Premium AI Model", "90 Min Video Limit"], cta: "Initialize" },
    { id: "pro", name: "Pro Scholar", monthlyPrice: 299, yearlyPrice: 2990, description: "Exam-ready synthesis engine.", popular: true, highlight: true, features: ["ALL 5 AI Models", "4 Hour Video Limit", "20 Batch Process"], cta: "Activate Pro" },
    { id: "power", name: "Power Institute", monthlyPrice: 599, yearlyPrice: 5990, description: "Research & Team grade.", features: ["All 5 AI Models", "8 Hour Video Limit", "Unlimited Batching"], cta: "Deploy Enterprise" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await api.get("/auth/get-profile", { headers: { 'Auth': token } });
        if (res.data.success) setUser(res.data.user);
      } catch (e) {}
    };
    fetchUser();
  }, []);

  const handleUpdateMobile = async (mobile: string) => {
    const token = localStorage.getItem("authToken");
    const res = await api.put("/auth/update-profile", { mobile }, { headers: { 'Auth': token } });
    if (res.data.success) {
      setUser({ ...user, mobile });
      toast.success("Identity Verified");
    }
  };

  const handlePurchase = async (details: any) => {
    setIsProcessing(details.packageId);
    // Integration logic...
    setTimeout(() => setIsProcessing(null), 2000);
    toast.info("Opening Gateway Terminal...");
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <NeuralModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <PurchaseInterface 
          packageData={selectedPackage} user={user} onPurchase={handlePurchase} 
          isProcessing={isProcessing === selectedPackage?.id} onUpdateMobile={handleUpdateMobile} 
          billingPeriod={billingPeriod} activeOffers={[{ name: "PROMO", discountPercent: 30 }]}
        />
      </NeuralModal>

      <section className="relative min-h-screen bg-[#050505] text-white py-24 px-4 font-sans overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 [background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] [background-size:40px_40px]" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-6">
             <Badge className="bg-red-600/10 text-red-500 border-red-600/20 px-4 py-1.5 uppercase font-black tracking-[0.3em] text-[10px]">Access Protocol</Badge>
             <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mb-4">
               SYNC <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">TIER</span>
             </h1>
          </div>

          {/* Billing Switcher */}
          <div className="flex justify-center mb-16">
            <div className="relative flex bg-neutral-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
               <button onClick={() => setBillingPeriod("monthly")} className={cn("px-10 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all z-10", billingPeriod === 'monthly' ? "text-white" : "text-neutral-600")}>Monthly</button>
               <button onClick={() => setBillingPeriod("yearly")} className={cn("px-10 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all z-10 relative", billingPeriod === 'yearly' ? "text-white" : "text-neutral-600")}>
                  Yearly <Badge className="absolute -top-3 -right-2 bg-emerald-600 text-[8px] px-2 py-0.5 border-none shadow-lg">SAVE 16%</Badge>
               </button>
               <motion.div animate={{ x: billingPeriod === 'monthly' ? 0 : '100%' }} className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(50%-6px)] bg-red-600 rounded-xl shadow-lg" />
            </div>
          </div>

          {/* Plan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className={cn("relative p-10 rounded-[3.5rem] border border-white/5 bg-neutral-950 flex flex-col group transition-all duration-500", plan.highlight && "border-red-600/40 shadow-2xl bg-[#080808]")}>
                {plan.popular && <Badge className="absolute top-10 right-10 bg-red-600 text-white font-black italic uppercase text-[8px] px-3 py-1 rounded-lg">Elite Class</Badge>}
                <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-8 group-hover:text-red-500 transition-colors">{plan.name}</h3>
                <div className="mb-10">
                  <span className="text-6xl font-black italic tracking-tighter">₹{billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}</span>
                  <span className="text-neutral-700 text-xs font-bold uppercase tracking-widest ml-2">/ {billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <div className="space-y-4 mb-12 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-tight text-neutral-400">
                      <CheckCircle2 size={16} className="text-red-600" /> {f}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => { setSelectedPackage(plan); setModalOpen(true); }}
                  className={cn("h-16 rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-2xl active:scale-95 transition-all", plan.highlight ? "bg-red-600 text-white hover:bg-red-700" : "bg-neutral-900 text-neutral-400 hover:bg-white hover:text-black")}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}