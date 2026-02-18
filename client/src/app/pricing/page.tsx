"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Smartphone, Tag, Zap, User, Loader2, IndianRupee, 
  ShieldCheck, Activity, CheckCircle2, CreditCard, 
  TicketPercent, X, ArrowRight, Timer, Flame,
  Coins, Database, Cpu, Lock, Sparkles, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import Script from "next/script";
import Footer from "@/components/Footer";
import { toast } from "sonner";

// --- Types ---
interface Coupon {
  id: string;
  name: string;
  code: string;
  value: number;
  type: 'percent' | 'flat';
}

interface PaymentData {
  packageId: string;
  packageType: 'subscription' | 'token';
  finalAmount: number;
  baseAmount: number;
  discountAmount: number;
  gstAmount: number;
  mobile: string;
  couponCode?: string;
  billingPeriod?: 'monthly' | 'yearly';
  packageName?: string;
}

interface TransactionResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
}

interface VerifyResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  data?: {
    transactionId: string;
    orderId: string;
    paymentId: string;
    tokens: number;
    tokensAwarded: number;
    membership: any;
    status: string;
  };
}

// --- Coupon Logic ---
const AVAILABLE_COUPONS: Coupon[] = [
  { id: '1', name: 'Neural Welcome', code: 'VOID50', value: 50, type: 'percent' },
  { id: '2', name: 'Elite Protocol', code: 'ELITE55', value: 55, type: 'flat' },
  { id: '3', name: 'Flash Sync', code: 'SPEED20', value: 20.5, type: 'percent' },
  { id: '4', name: 'Starter Chip', code: 'FIRST50', value: 50, type: 'flat' },
];

// --- Custom Neural Modal ---
function NeuralModal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[100vh] md:max-h-[90vh] flex flex-col"
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
                    <Terminal size={12} /> Secure Gateway
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-colors text-neutral-400">
                    <X size={18} />
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

// --- Success Modal ---
function SuccessModal({ isOpen, onClose, transactionData }: { isOpen: boolean, onClose: () => void, transactionData: any }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-neutral-900 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/10 blur-[60px] pointer-events-none" />

            <div className="text-center space-y-6 relative z-10">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Payment Successful</h3>
                <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest">
                    ID: {transactionData?.paymentId?.slice(0, 16)}...
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-neutral-400 font-medium">Package</span>
                    <span className="text-sm text-white font-bold">{transactionData?.packageName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400 font-medium">Amount</span>
                    <span className="text-xl font-bold text-emerald-400">₹{transactionData?.amount}</span>
                  </div>
                </div>

                {transactionData?.tokensAwarded > 0 && (
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-emerald-500/80">Tokens Added</span>
                    <span className="text-lg font-bold text-emerald-400">+{transactionData?.tokensAwarded}</span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-white text-black font-bold uppercase tracking-wide text-xs rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Purchase Interface ---
function PurchaseInterface({ packageData, user, onPurchase, isProcessing, onUpdateMobile, billingPeriod, activeOffers, onClose }: any) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [isMobileEditable, setIsMobileEditable] = useState(!user?.mobile);
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const isTokenPackage = packageData.type === 'token';

  // Determine base amount
  let baseAmount = 0;
  if (isTokenPackage) {
    baseAmount = packageData.price;
  } else {
    baseAmount = billingPeriod === 'monthly' ? packageData.monthlyPrice : packageData.yearlyPrice;
  }

  const bestOffer = activeOffers[0];
  const offerDiscount = bestOffer && !isTokenPackage ? (baseAmount * bestOffer.discountPercent) / 100 : 0;
  
  const extraDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.type === 'percent' ? (baseAmount * appliedCoupon.value) / 100 : appliedCoupon.value;
  }, [appliedCoupon, baseAmount]);

  const totalDiscount = offerDiscount + extraDiscount;
  const discountedAmount = Math.max(0, baseAmount - totalDiscount);
  const gstAmount = discountedAmount * 0.18;
  const totalAmount = discountedAmount + gstAmount;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

  const handlePurchase = () => {
    const paymentData: PaymentData = {
      packageId: packageData.id,
      packageType: isTokenPackage ? 'token' : 'subscription',
      finalAmount: totalAmount,
      baseAmount: baseAmount,
      discountAmount: totalDiscount,
      gstAmount: gstAmount,
      mobile: mobile,
      couponCode: appliedCoupon?.code,
      billingPeriod: isTokenPackage ? undefined : billingPeriod,
      packageName: packageData.name
    };
    onPurchase(paymentData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full font-sans">
      {/* Left Section: Details */}
      <div className="lg:col-span-7 p-6 md:p-10 space-y-8 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0a0a0a]">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center">
              <CreditCard size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Checkout</h2>
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Secure Payment Node</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <Timer size={14} className="text-red-500 animate-pulse" />
            <span className="font-mono text-sm font-bold text-red-500">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* User Info */}
        <section className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
            <User size={12}/> Account Identity
          </label>
          <div className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-neutral-400 font-bold text-lg uppercase">{user?.name?.charAt(0) || "U"}</span>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-sm">{user?.name}</p>
                {user?.membership?.isActive && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] px-1.5 py-0">
                    {user.membership.planName}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 font-mono">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Mobile Input */}
        <section className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
            <Smartphone size={12}/> Verification Contact
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-sm border-r border-white/10 pr-3">+91</span>
              <input 
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0,10))}
                disabled={!isMobileEditable}
                className="w-full bg-neutral-900/40 border border-white/10 h-12 rounded-xl pl-14 font-mono text-sm text-white focus:border-white/20 focus:ring-0 outline-none transition-all placeholder:text-neutral-700"
                placeholder="9876543210"
              />
            </div>
            <button 
              onClick={() => isMobileEditable ? onUpdateMobile(mobile).then(() => setIsMobileEditable(false)) : setIsMobileEditable(true)}
              className={cn("h-12 px-6 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all", 
                isMobileEditable ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-900 text-neutral-400 border border-white/5 hover:border-white/20")}
            >
              {isMobileEditable ? "Save" : "Change"}
            </button>
          </div>
        </section>

        {/* Coupons */}
        <section className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
            <Tag size={12}/> Promo Protocols
          </label>
          <div className="flex gap-2 mb-3">
            <input 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 bg-neutral-900/40 border border-white/10 h-10 rounded-lg px-4 font-mono text-xs uppercase outline-none focus:border-white/20 text-white placeholder:text-neutral-700"
              placeholder="ENTER CODE"
            />
            <button 
              onClick={() => applyCode(couponCode)}
              className="px-6 h-10 bg-white/5 border border-white/10 text-white rounded-lg font-bold uppercase text-[10px] hover:bg-white hover:text-black transition-all"
            >
              Apply
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COUPONS.map(c => (
              <button 
                key={c.id}
                onClick={() => applyCode(c.code)}
                className="px-3 py-2 bg-neutral-900/60 border border-white/5 rounded-lg hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group flex items-center gap-2"
              >
                <span className="text-[10px] font-mono font-bold text-neutral-400 group-hover:text-emerald-400">{c.code}</span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {c.type === 'percent' ? `-${c.value}%` : `₹${c.value}`}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Right Section: Summary */}
      <div className="lg:col-span-5 bg-neutral-900/20 p-6 md:p-10 flex flex-col justify-between h-full">
        <div className="space-y-6">
          <div className="pb-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Selected Plan</span>
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{packageData?.name}</h3>
            
            <p className="text-xs text-neutral-500 mt-2 font-medium">
               {isTokenPackage ? "Lifetime Validity • One-time Payment" : `Billed ${billingPeriod === 'monthly' ? 'Monthly' : 'Annually'} • Cancel Anytime`}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-medium text-neutral-400">
              <span>Subtotal</span>
              <span className="text-white font-mono">₹{baseAmount.toFixed(2)}</span>
            </div>
            <AnimatePresence>
              {totalDiscount > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex justify-between text-xs font-bold text-emerald-500">
                  <span className="flex items-center gap-1"><TicketPercent size={12}/> Discount</span>
                  <span className="font-mono">- ₹{totalDiscount.toFixed(2)}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-between text-xs font-medium text-neutral-400">
              <span>GST (18%)</span>
              <span className="text-white font-mono">₹{gstAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold uppercase text-neutral-500 mb-1">Total Payable</span>
              <span className="text-4xl font-bold text-white tracking-tighter">₹{Math.round(totalAmount)}</span>
            </div>
          </div>

          <button 
            onClick={handlePurchase}
            disabled={isProcessing || mobile.length !== 10}
            className="w-full h-14 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-wide text-sm rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Lock size={16}/> Pay Securely</>}
          </button>

          <div className="flex justify-center gap-4 text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
             <span className="flex items-center gap-1"><ShieldCheck size={10}/> SSL Encrypted</span>
             <span className="flex items-center gap-1"><Zap size={10}/> Instant Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function PricingSection() {
  const [viewMode, setViewMode] = useState<"subscription" | "token">("subscription");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [activeSyncs] = useState(8420);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // --- Data Definition ---
  const subscriptionPlans = [
    { 
      id: "scholar", 
      type: "subscription",
      name: "Scholar", 
      monthlyPrice: 149, 
      yearlyPrice: 1490, 
      description: "Essential toolkit for survival.", 
      features: ["Access to All Premium Models", "Unlimited AI Quiz", "6hr Video Processing/Day", "Basic Game Access", "Standard Tools"], 
      cta: "Start Protocol", 
      slots: "High Demand"
    },
    { 
      id: "pro", 
      type: "subscription",
      name: "Pro Scholar", 
      monthlyPrice: 299, 
      yearlyPrice: 2990, 
      description: "The choice of toppers.", 
      popular: true, 
      highlight: true, 
      features: ["Everything in Scholar", "Priority 'Fast-Lane' Speed", "Verified Scholar Badge", "Zero Ads", "12hr Video Processing/Day", "Beta Tools Access"], 
      cta: "Upgrade to Pro", 
      slots: "97% Capacity" 
    },
    { 
      id: "power", 
      type: "subscription",
      name: "Power Scholar", 
      monthlyPrice: 599, 
      yearlyPrice: 5990, 
      description: "God-mode for Engineers.", 
      features: ["Everything in Pro", "Unlimited Processing", "Instant Image Gen", "Bulk Documentation", "Career Roadmap", "VIP Support"], 
      cta: "Unlock God Mode", 
      slots: "Limited Access" 
    },
  ];

  const tokenPackages = [
    {
      id: "basic",
      type: "token",
      name: "Basic Chip",
      tokens: 100,
      price: 99,
      description: "Emergency supply.",
      features: ["100 Neural Tokens", "Valid Forever", "Instant Credit", "Access Basic Models"],
      cta: "Inject Tokens",
      icon: Database
    },
    {
      id: "standard",
      type: "token",
      name: "Standard Core",
      tokens: 500,
      price: 399,
      description: "Standard supply for projects.",
      popular: true,
      highlight: true,
      features: ["500 Neural Tokens", "Valid Forever", "Instant Credit", "Access All Models", "Priority Queue"],
      cta: "Inject Tokens",
      icon: Cpu
    },
    {
      id: "premium",
      type: "token",
      name: "Premium Node",
      tokens: 1000,
      price: 699,
      description: "Massive supply for heavy lifting.",
      features: ["1000 Neural Tokens", "Valid Forever", "Instant Credit", "Access All Models", "Top Priority Queue", "Bulk Operations"],
      cta: "Inject Tokens",
      icon: Coins
    }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await api.get("/auth/get-profile", { headers: { 'Auth': token } });
        if (res.data.success) setUser(res.data.user);
      } catch (e) {
        console.error("Failed to fetch user:", e);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateMobile = async (mobile: string) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await api.put("/auth/update-profile", { mobile }, { headers: { 'Auth': token } });
      if (res.data.success) {
        setUser({ ...user, mobile });
        toast.success("Identity Verified");
        return true;
      }
    } catch (error) {
      toast.error("Failed to update mobile");
    }
    return false;
  };

  const createRazorpayOrder = async (paymentData: PaymentData): Promise<TransactionResponse | null> => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.post("/payment/create-order", paymentData, {
        headers: { 'Auth': token }
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        toast.error("Failed to create order");
        return null;
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create payment order");
      return null;
    }
  };

  const verifyPayment = async (paymentData: any): Promise<VerifyResponse | null> => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.post("/payment/verify", paymentData, {
        headers: { 'Auth': token }
      });
      
      if (response.data.success) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error("Verification error:", error);
      return null;
    }
  };

  const handlePayment = async (paymentData: PaymentData) => {
    if (!razorpayLoaded) {
      toast.error("Payment system loading... Please try again");
      return;
    }

    setIsProcessing(true);
    
    try {
      toast.loading("Creating payment order...");
      const orderData = await createRazorpayOrder(paymentData);
      
      if (!orderData) {
        setIsProcessing(false);
        return;
      }
      
      toast.dismiss();
      toast.success("Payment gateway opened");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Neural Protocol",
        description: `${paymentData.packageName}`,
        image: "/logo.png",
        order_id: orderData.order.id,
        handler: async (response: any) => {
          setIsProcessing(true);
          toast.loading("Verifying payment...");
          
          const verifyData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            ...paymentData,
            userId: user?._id,
            userEmail: user?.email,
            userName: user?.username,
            status: "success"
          };

          const verifyResult = await verifyPayment(verifyData);
          
          if (verifyResult?.success) {
            toast.dismiss();
            toast.success("Payment Successful!");
            
            setTransactionResult({
              ...verifyResult.data,
              paymentId: response.razorpay_payment_id,
              amount: paymentData.finalAmount,
              packageName: paymentData.packageName
            });
            
            setModalOpen(false);
            setSuccessModalOpen(true);
            
            const token = localStorage.getItem("authToken");
            const res = await api.get("/auth/get-profile", { headers: { 'Auth': token } });
            if (res.data.success) setUser(res.data.user);
            
          } else {
            toast.dismiss();
            toast.error("Payment verification failed");
            
            await api.post("/payment/save-transaction", {
              ...verifyData,
              status: "failed",
              error: "Verification failed"
            }, {
              headers: { 'Auth': localStorage.getItem("authToken") }
            });
          }
          
          setIsProcessing(false);
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: paymentData.mobile || ""
        },
        notes: {
          package: paymentData.packageName,
          userId: user?._id
        },
        theme: {
          color: "#000000"
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setIsProcessing(false);
            
            api.post("/payment/save-transaction", {
              ...paymentData,
              status: "failed",
              error: "User cancelled payment",
              userId: user?._id,
              userEmail: user?.email,
              userName: user?.name
            }, {
              headers: { 'Auth': localStorage.getItem("authToken") }
            }).catch(console.error);
          }
        }
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
      />
      
      <NeuralModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <PurchaseInterface 
          packageData={selectedPackage} 
          user={user} 
          onPurchase={handlePayment}
          isProcessing={isProcessing}
          onUpdateMobile={handleUpdateMobile}
          billingPeriod={billingPeriod}
          activeOffers={[{ name: "PROMO", discountPercent: 30 }]}
          onClose={() => setModalOpen(false)}
        />
      </NeuralModal>

      <SuccessModal 
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        transactionData={transactionResult}
      />

      <section className="relative min-h-screen bg-black text-white py-24 px-4 font-sans overflow-hidden selection:bg-neutral-800 selection:text-white">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-neutral-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* Live Counter */}
        <div className="relative z-20 flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            {activeSyncs.toLocaleString()} Active Nodes
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none">
              Sync <span className="text-white">Tier.</span>
            </h1>
            <p className="text-lg text-neutral-400 font-light max-w-lg mx-auto leading-relaxed">
              Upgrade your cognitive throughput. Select a subscription tier to eliminate process latency.
            </p>
          </div>

          {/* Type Switcher */}
          <div className="flex justify-center mb-12">
             <div className="p-1 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-xl flex gap-1">
                <button 
                  onClick={() => setViewMode("subscription")} 
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                    viewMode === "subscription" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
                  )}
                >
                  <ShieldCheck size={14} /> Protocol Memberships
                </button>
                <button 
                   onClick={() => setViewMode("token")} 
                   className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                    viewMode === "token" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
                  )}
                >
                  <Coins size={14} /> Token Injectors
                </button>
             </div>
          </div>

          {/* Billing Switcher */}
          <AnimatePresence mode="wait">
            {viewMode === "subscription" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center mb-16"
              >
                <div className="flex items-center gap-4">
                    <span className={cn("text-xs font-medium cursor-pointer transition-colors", billingPeriod === 'monthly' ? 'text-white' : 'text-neutral-600')} onClick={() => setBillingPeriod('monthly')}>Monthly</span>
                    <button 
                        onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-12 h-6 rounded-full bg-neutral-900 border border-white/10 relative px-1 transition-colors"
                    >
                        <motion.div 
                            animate={{ x: billingPeriod === 'yearly' ? 24 : 0 }}
                            className="w-4 h-4 rounded-full bg-white shadow-md"
                        />
                    </button>
                    <span className={cn("text-xs font-medium cursor-pointer transition-colors flex items-center gap-2", billingPeriod === 'yearly' ? 'text-white' : 'text-neutral-600')} onClick={() => setBillingPeriod('yearly')}>
                        Yearly <Badge className="bg-white text-black border-none text-[9px] px-1.5 py-0">SAVE 16%</Badge>
                    </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Plan Grid */}
          <motion.div 
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
          >
            {(viewMode === "subscription" ? subscriptionPlans : tokenPackages).map((plan: any) => (
              <div key={plan.id} className={cn(
                  "relative p-8 rounded-[2.5rem] border flex flex-col transition-all duration-500 hover:-translate-y-2", 
                  plan.highlight 
                    ? "bg-neutral-900/30 backdrop-blur-xl border-white/10 shadow-2xl z-10" 
                    : "bg-black/40 border-white/5"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Most Popular
                  </div>
                )}
                
                {/* Header */}
                <div className="mb-8 space-y-4">
                    <div className="flex items-center justify-between">
                        {viewMode === 'token' ? (
                            <div className="p-2.5 bg-neutral-900 rounded-xl border border-white/5">
                                <plan.icon size={18} className="text-white" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                <Flame size={12} className={cn(plan.highlight ? "text-orange-500" : "text-neutral-600")} />
                                {plan.slots}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{plan.name}</h3>
                        <p className="text-xs text-neutral-500 mt-2 font-medium leading-relaxed">{plan.description}</p>
                    </div>
                </div>
                
                {/* Price */}
                <div className="mb-8 pb-8 border-b border-white/5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white tracking-tighter">
                      ₹{viewMode === "subscription" ? (billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice) : plan.price}
                    </span>
                    {viewMode === "subscription" && (
                        <span className="text-neutral-500 text-sm font-medium">/ {billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-neutral-600">
                    {viewMode === "subscription" 
                        ? `≈ ₹${((billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice) / (billingPeriod === 'monthly' ? 30 : 365)).toFixed(2)} / day`
                        : `${plan.tokens.toLocaleString()} Tokens`
                    }
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                          "mt-0.5 p-0.5 rounded-full flex items-center justify-center shrink-0",
                          plan.highlight ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"
                      )}>
                          <CheckCircle2 size={10} strokeWidth={4} />
                      </div>
                      <span className={cn("text-xs font-medium leading-tight", plan.highlight ? "text-neutral-200" : "text-neutral-500")}>
                          {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => { 
                    setSelectedPackage(plan); 
                    setModalOpen(true); 
                  }}
                  className={cn(
                    "w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95",
                    plan.highlight 
                      ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                      : "bg-neutral-900 text-white border border-white/5 hover:bg-neutral-800"
                  )}
                >
                  {plan.cta} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </motion.div>
          
          {/* Trust Footer */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-x-12 gap-y-6">
            <TrustItem icon={ShieldCheck} text="256-Bit SSL Encryption" />
            <TrustItem icon={Activity} text="99.9% System Uptime" />
            <TrustItem icon={IndianRupee} text="Secure Razorpay Gateway" />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

const TrustItem = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-3 text-neutral-500 group hover:text-white transition-colors cursor-default">
        <Icon size={14} className="text-neutral-600 group-hover:text-white transition-colors" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{text}</span>
    </div>
);