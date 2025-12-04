// components/pricing-section.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, ArrowRight, Zap, Info, Coins, IndianRupee, Loader2, Smartphone, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/config/api";
import Script from "next/script";

// Declare Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      payment_id?: string;
      order_id?: string;
    };
  };
}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        open: () => void;
        on: (event: string, callback: (response: RazorpayError) => void) => void;
      };
    };
  }
}

interface UserData {
  name: string;
  email: string;
  picture: string;
  mobile?: string;
  _id?: string;
  token?: number;
  usedToken?: number;
  transactions?: any[];
  tokenUsageHistory?: any[];
  joinedAt?: string;
  tokenTransactions?: any[];
  notes?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
  highlight?: boolean;
}

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  description?: string;
  popular?: boolean;
  discount?: string;
}

interface PurchaseRequestPayload {
  packageId: string;
  packageType: 'subscription' | 'token';
  finalAmount: number;
  baseAmount: number;
  discountAmount: number;
  gstAmount: number;
  billingPeriod: 'monthly' | 'yearly';
  couponCode?: string;
}

interface TransactionData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  packageId: string;
  amount: number;
  tokens: number;
  packageType: 'subscription' | 'token';
  planName?: string;
  billingPeriod?: 'monthly' | 'yearly';
  baseAmount: number;
  discountAmount: number;
  gstAmount: number;
  couponCode?: string;
}

// Purchase Dialog Component
interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: PricingPlan | TokenPackage | null;
  packageType: 'subscription' | 'token';
  user: UserData | null;
  onPurchase: (payload: PurchaseRequestPayload) => void;
  isProcessing: boolean;
  onUpdateMobile: (mobile: string) => Promise<void>;
  billingPeriod?: 'monthly' | 'yearly';
}

function PurchaseDialog({ 
  open, 
  onOpenChange, 
  packageData, 
  packageType,
  user, 
  onPurchase, 
  isProcessing,
  onUpdateMobile,
  billingPeriod = 'monthly'
}: PurchaseDialogProps) {
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [isUpdatingMobile, setIsUpdatingMobile] = useState(false);
  const [isMobileEditable, setIsMobileEditable] = useState(!user?.mobile);

  // Calculate prices with 18% GST included in final amount
  const getBaseAmount = () => {
    if (!packageData) return 0;
    if (packageType === 'subscription') {
      const plan = packageData as PricingPlan;
      return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    } else {
      const tokenPkg = packageData as TokenPackage;
      return tokenPkg.price;
    }
  };

  const baseAmount = getBaseAmount();
  const discountedAmount = baseAmount - discount;
  const gstAmount = discountedAmount * 0.18; // 18% GST
  const totalAmount = discountedAmount + gstAmount;

  const getPackageDescription = () => {
    if (!packageData) return '';
    if (packageType === 'subscription') {
      const plan = packageData as PricingPlan;
      return `${plan.name} Plan - ${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`;
    } else {
      const tokenPkg = packageData as TokenPackage;
      return `${tokenPkg.tokens.toLocaleString()} Tokens - ${tokenPkg.name}`;
    }
  };

  const handleApplyCoupon = () => {
    // Simple coupon logic - you can extend this
    if (couponCode.toUpperCase() === "WELCOME10") {
      setDiscount(baseAmount * 0.1); // 10% discount
      toast.success("Coupon applied successfully! 10% discount added.");
    } else if (couponCode) {
      toast.error("Invalid coupon code");
      setDiscount(0);
    }
  };

  const handleUpdateMobile = async () => {
    if (!mobile.trim()) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    if (mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsUpdatingMobile(true);
    try {
      await onUpdateMobile(mobile);
      toast.success("Mobile number updated successfully!");
      setIsMobileEditable(false); // Make it non-editable after successful update
    } catch (error) {
      toast.error("Failed to update mobile number");
    } finally {
      setIsUpdatingMobile(false);
    }
  };

  const handleEditMobile = () => {
    setIsMobileEditable(true);
  };

  const handlePurchase = () => {
    if (packageData) {
      // Validate mobile number before purchase
      if (!mobile || mobile.length !== 10) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }
      onPurchase({
        packageId: packageData.id,
        packageType,
        finalAmount: Math.round(totalAmount),
        baseAmount,
        discountAmount: discount,
        gstAmount,
        billingPeriod,
        couponCode: couponCode || undefined,
      });
    }
  };

  const resetDialog = () => {
    setCouponCode("");
    setDiscount(0);
    setMobile(user?.mobile || "");
    setIsMobileEditable(!user?.mobile); // Reset to non-editable if user has mobile
  };

  if (!packageData) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-4xl bg-neutral-900 border-neutral-700 text-white max-h-[90vh] overflow-y-auto">
       
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mt-4 pb-4">
          {/* Left Section - User Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white border-b border-neutral-700 pb-2">
                Customer Information
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-neutral-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={user?.name || ""}
                      disabled
                      className="bg-neutral-800 border-neutral-600 text-white h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-neutral-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-neutral-800 border-neutral-600 text-white h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Number *
                    {!isMobileEditable && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                        Verified
                      </Badge>
                    )}
                  </Label>
                  
                  {isMobileEditable ? (
                    <>
                      <div className="flex gap-2">
                        <Input
                          id="mobile"
                          placeholder="Enter 10-digit mobile number"
                          value={mobile}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setMobile(value);
                          }}
                          className="bg-neutral-800 border-neutral-600 text-white flex-1 h-10"
                        />
                        <Button
                          onClick={handleUpdateMobile}
                          disabled={isUpdatingMobile || mobile.length !== 10}
                          variant="outline"
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white whitespace-nowrap h-10 px-3"
                        >
                          {isUpdatingMobile ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                      {mobile.length > 0 && mobile.length !== 10 && (
                        <p className="text-red-400 text-sm">Please enter a valid 10-digit mobile number</p>
                      )}
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="mobile"
                        value={user?.mobile}
                        disabled
                        className="bg-neutral-800 border-neutral-600 text-white flex-1 h-10"
                      />
                      <Button
                        onClick={handleEditMobile}
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white whitespace-nowrap h-10 px-3"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-neutral-500">
                    * Mobile number is required for payment processing and order updates
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon" className="text-sm font-medium text-neutral-300">
                    Coupon Code (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-neutral-800 border-neutral-600 text-white h-10"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      variant="outline"
                      className="border-neutral-600 text-white hover:bg-neutral-700 whitespace-nowrap h-10 px-4"
                    >
                      Apply
                    </Button>
                  </div>
                  {discount > 0 && (
                    <p className="text-green-400 text-sm">
                      🎉 10% discount applied! You saved ₹{discount.toFixed(2)}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500">
                    Try code: WELCOME10 for 10% discount
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white border-b border-neutral-700 pb-2">
                Order Summary
              </h3>
              
              <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-700">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Coins className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base">{getPackageDescription()}</h4>
                    <p className="text-sm text-neutral-400">
                      {packageType === 'token' ? `${(packageData as TokenPackage).tokens.toLocaleString()} Tokens` : 'Subscription Plan'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-300">Package Price:</span>
                    <span className="text-white flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {baseAmount.toFixed(2)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-300">Discount:</span>
                      <span className="text-green-400 flex items-center gap-1">
                        - <IndianRupee className="h-3 w-3" />
                        {discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-300">Subtotal:</span>
                    <span className="text-white flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {discountedAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-300">GST (18%):</span>
                    <span className="text-white flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {gstAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-neutral-700">
                    <span className="text-neutral-300 font-semibold text-base">Total Amount:</span>
                    <span className="text-white font-bold text-lg flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mt-4">
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold">
                      {packageType === 'subscription' ? 'You will get:' : "You'll receive:"}
                    </span>
                  </div>
                  <p className="text-white font-bold text-lg mt-1">
                    {packageType === 'token' 
                      ? `${(packageData as TokenPackage).tokens.toLocaleString()} Tokens`
                      : `Full access to ${packageData.name} features`
                    }
                  </p>
                  <p className="text-neutral-400 text-xs mt-1">
                    {packageType === 'subscription' 
                      ? 'Subscription will be activated instantly after successful payment'
                      : 'Tokens will be credited instantly after successful payment'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y sticky bottom-[-27] bg-neutral-900 pt-4 pb-2">
              <Button
                onClick={handlePurchase}
                disabled={isProcessing || !mobile || mobile.length !== 10}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 text-lg font-semibold h-12"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₹${Math.round(totalAmount)}`
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-neutral-400">
                  🔒 Secure payment powered by Razorpay
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<UserData | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PricingPlan | TokenPackage | null>(null);
  const [selectedPackageType, setSelectedPackageType] = useState<'subscription' | 'token'>('subscription');
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: "scholar-plan",
      name: "Scholar",
      description: "Perfect for the occasional learner",
      monthlyPrice: 149,
      yearlyPrice: 1490,
      features: [
        { text: "Model A (Basic Summary) + Model B", included: true },
        { text: "ONE Premium AI Model of choice", included: true },
        { text: "Up to 90 minutes video length", included: true },
        { text: "Batch processing (5 videos)", included: true },
        { text: "No watermark, basic templates", included: true },
        { text: "Full in-browser editor", included: true },
        { text: "All 5 AI Models", included: false },
        { text: "Flashcard Creator", included: false },
        { text: "4+ hours video length", included: false },
      ],
      cta: "Get Started",
    },
    {
      id: "pro-scholar-plan",
      name: "Pro Scholar",
      description: "Best value - exam-ready notes",
      monthlyPrice: 299,
      yearlyPrice: 2990,
      popular: true,
      highlight: true,
      features: [
        { text: "ALL 5 AI Models (Deep Diver, etc.)", included: true },
        { text: "Up to 4 hours video length", included: true },
        { text: "Batch processing (20 videos)", included: true },
        { text: "No watermark, all templates", included: true },
        { text: "Flashcard Creator", included: true },
        { text: "Full in-browser editor + highlights", included: true },
        { text: "Print-saver mode", included: true },
        { text: "Priority processing", included: true },
      ],
      cta: "Get Pro Scholar",
    },
    {
      id: "power-institute-plan",
      name: "Power Institute",
      description: "For institutes & serious researchers",
      monthlyPrice: 599,
      yearlyPrice: 5990,
      features: [
        { text: "All 5 AI Models + Priority Access", included: true },
        { text: "Up to 8 hours video length", included: true },
        { text: "Unlimited batch processing", included: true },
        { text: "Fully custom branding", included: true },
        { text: "Team features", included: true },
        { text: "Centralized storage", included: true },
        { text: "Dedicated support", included: true },
        { text: "Custom AI model training", included: true },
      ],
      cta: "Get Power Institute",
    },
  ];

  const tokenPackages: TokenPackage[] = [
    {
      id: "micro-pack",
      name: "Micro Study Pack",
      price: 99,
      tokens: 500,
      description: "Perfect for one deep-dive report",
      popular: false,
    },
    {
      id: "revision-bundle",
      name: "Revision Bundle",
      price: 249,
      tokens: 1500,
      description: "Best for quick test prep",
      popular: true,
      discount: "Save 25%",
    },
    {
      id: "expert-pack",
      name: "Expert Pack",
      price: 499,
      tokens: 3500,
      description: "For serious learners",
      popular: false,
      discount: "Save 30%",
    },
    {
      id: "master-pack",
      name: "Master Pack",
      price: 899,
      tokens: 7000,
      description: "Maximum value",
      popular: false,
      discount: "Save 35%",
    },
  ];

  // Get auth token
  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("authToken");
    }
    return null;
  }, []);

  // Fetch user profile from API
  const fetchUserProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }

    setIsLoadingUser(true);
    try {
      const response = await api.get("/auth/get-profile", {
        headers: {
          'Auth': token
        }
      });

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        // Also update localStorage to keep it in sync
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.error("Failed to fetch user profile:", response.data.message);
        // Fallback to localStorage if API fails
        const localUser = localStorage.getItem("user");
        if (localUser) {
          setUser(JSON.parse(localUser));
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to localStorage if API fails
      const localUser = localStorage.getItem("user");
      if (localUser) {
        setUser(JSON.parse(localUser));
      }
    } finally {
      setIsLoadingUser(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Update mobile number
  const handleUpdateMobile = async (mobile: string) => {
    try {
      if (!user) {
        throw new Error("User not available");
      }
      const token = getAuthToken();
      const response = await api.put(
        "/auth/update-profile",
        { mobile },
        {
          headers: {
            'Auth': token
          }
        }
      );

      if (response.data.success) {
        // Update local user data
        const updatedUser: UserData = { ...user, mobile };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to update mobile number");
      }
    } catch (error) {
      console.error("❌ Error updating mobile number:", error);
      throw error;
    }
  };

  // Save transaction to database
  const saveTransactionToDB = async (transactionData: TransactionData, status: 'success' | 'failed', error?: string) => {
    try {
      const token = getAuthToken();
      
      const payload = {
        razorpay_payment_id: transactionData.razorpay_payment_id,
        razorpay_order_id: transactionData.razorpay_order_id,
        razorpay_signature: transactionData.razorpay_signature,
        packageId: transactionData.packageId,
        amount: transactionData.amount,
        baseAmount: transactionData.baseAmount,
        discountAmount: transactionData.discountAmount,
        gstAmount: transactionData.gstAmount,
        tokens: transactionData.tokens,
        status: status,
        userId: user?._id || user?.email,
        userEmail: user?.email,
        userName: user?.name,
        userMobile: user?.mobile,
        packageName: transactionData.planName || `Package ${transactionData.packageId}`,
        packageType: transactionData.packageType,
        billingPeriod: transactionData.billingPeriod,
        couponCode: transactionData.couponCode,
        error: error
      };

      const response = await api.post(
        "/payment/save-transaction",
        payload,
        {
          headers: {
            'Auth': token
          }
        }
      );

      return response.data;
    } catch {
      console.error("❌ Error saving transaction:");
      throw new Error("Failed to save transaction");
    }
  };

  // Open purchase dialog
  const handleOpenPurchaseDialog = (packageData: PricingPlan | TokenPackage, packageType: 'subscription' | 'token') => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please log in to make a purchase");
      window.location.href = '/login';
      return;
    }

    if (!user) {
      toast.error("Please wait while we load your profile...");
      return;
    }

    setSelectedPackage(packageData);
    setSelectedPackageType(packageType);
    setPurchaseDialogOpen(true);
  };

  // Handle purchase from dialog
  const handlePurchase = async (purchaseDetails: PurchaseRequestPayload) => {
    const {
      packageId,
      packageType,
      finalAmount,
      billingPeriod: requestedBillingPeriod,
      couponCode,
      baseAmount,
      discountAmount,
      gstAmount,
    } = purchaseDetails;

    setIsProcessing(packageId);
    
    try {
      let packageData: PricingPlan | TokenPackage | undefined;
      let tokens = 0;
      let planName = '';
      const billingCycle = requestedBillingPeriod || billingPeriod;

      if (packageType === 'subscription') {
        packageData = plans.find(plan => plan.id === packageId);
        planName = packageData?.name || '';
      } else {
        packageData = tokenPackages.find(pkg => pkg.id === packageId);
        tokens = packageData?.tokens || 0;
        planName = packageData?.name || '';
      }

      if (!packageData) {
        toast.error("Package not found");
        setIsProcessing(null);
        return;
      }

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast.error("Payment system is loading. Please try again in a moment.");
        setIsProcessing(null);
        return;
      }

      // Ensure mobile number is available
      if (!user?.mobile) {
        toast.error("Mobile number is required for payment");
        setIsProcessing(null);
        return;
      }

      const description = packageType === 'subscription' 
        ? `${planName} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Subscription${couponCode ? ` (Coupon: ${couponCode})` : ''}`
        : `Purchase ${tokens} tokens - ${planName}${couponCode ? ` (Coupon: ${couponCode})` : ''}`;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_y6rhmgP580s3Yc',
        amount: Math.round(finalAmount * 100), // Amount in paise (including GST)
        currency: 'INR',
        name: 'AI Companion App',
        description: description,
        handler: async function (response: RazorpayResponse) {
          try {
            // Payment successful
            const transactionData: TransactionData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              packageId,
              amount: finalAmount,
              tokens: tokens,
              packageType: packageType,
              planName: planName,
              billingPeriod: billingCycle,
              baseAmount,
              discountAmount,
              gstAmount,
              couponCode
            };

            // Save successful transaction to DB
            const saveResponse = await saveTransactionToDB(transactionData, 'success');
            
            if (saveResponse.success) {
              setPurchaseDialogOpen(false);
              
              if (packageType === 'token') {
                toast.success(`Payment Successful! ${tokens} tokens have been added to your account. 🎉`);
              } else {
                toast.success(`Payment Successful! Your ${planName} subscription has been activated. 🎉`);
              }
              // Refresh user data to get updated info
              fetchUserProfile();
            } else {
              throw new Error('Failed to save transaction');
            }
          } catch {
            console.error("❌ Error processing payment success:");
            toast.error("Payment successful, but there was an issue saving the details. Please contact support.");
          } finally {
            setIsProcessing(null);
          }
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@example.com',
          contact: user?.mobile || '9999999999'
        },
        theme: { 
          color: '#4f46e5' 
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(null);
            toast.info("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', async function (response: RazorpayError) {
        console.error("❌ Payment failed:", response.error);
        
        try {
          const transactionData: TransactionData = {
            razorpay_payment_id: response.error.metadata?.payment_id || 'unknown',
            razorpay_order_id: response.error.metadata?.order_id || 'unknown',
            razorpay_signature: "",
            packageId,
            amount: finalAmount,
            tokens: tokens,
            packageType: packageType,
            planName: planName,
            billingPeriod: billingCycle,
            baseAmount,
            discountAmount,
            gstAmount,
            couponCode
          };

          await saveTransactionToDB(transactionData, 'failed', response.error.description);
          toast.error(`Payment failed: ${response.error.description}`);
        } catch {
          console.error("❌ Error handling payment failure:");
          toast.error("Payment failed. Please try again.");
        } finally {
          setIsProcessing(null);
          setPurchaseDialogOpen(false);
        }
      });

      rzp.open();
      
    } catch {
      console.error("❌ Error initializing payment:");
      toast.error("Error initializing payment. Please try again.");
      setIsProcessing(null);
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
        onLoad={() => console.log("Razorpay SDK loaded successfully")}
        onError={() => console.error("Failed to load Razorpay SDK")}
      />
      
      {/* Purchase Dialog */}
      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        packageData={selectedPackage}
        packageType={selectedPackageType}
        user={user}
        onPurchase={handlePurchase}
        isProcessing={isProcessing === selectedPackage?.id}
        onUpdateMobile={handleUpdateMobile}
        billingPeriod={billingPeriod}
      />

      <section className="relative min-h-screen bg-black text-white py-20 px-4 overflow-hidden font-sans selection:bg-red-500/30">
        {/* Background Ambience - Subtle red glow to break the flat black */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto z-10">
          
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="border-red-500/50 text-red-400 px-4 py-1 mb-4 bg-red-950/10 backdrop-blur-sm">
              Unlock Your Potential
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Simple Pricing, <span className="text-red-500">Maximum Impact</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Transform YouTube videos into exam-ready notes. <br className="hidden md:block" />
              <span className="text-white font-medium">Invest just ₹10 a day</span> to save hundreds of hours studying.
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-16">
            <div className="relative flex bg-neutral-900/80 p-1 rounded-full border border-white/10 backdrop-blur-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingPeriod === "monthly" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingPeriod === "yearly" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Yearly
              </button>
              
              {/* Sliding Background */}
              <div
                className={`absolute top-1 bottom-1 rounded-full bg-red-600 shadow-lg shadow-red-900/50 transition-all duration-300 ease-out w-[calc(50%-4px)] ${
                  billingPeriod === "monthly" ? "left-1" : "left-[calc(50%)]"
                }`}
              />
              
              {/* Discount Badge */}
              <div className="absolute -top-3 -right-6 md:-right-10 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full transform rotate-12 shadow-lg border border-red-500">
                SAVE 17%
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-6 lg:gap-8 mb-24 relative">
            
            {/* Mobile Scroll Container */}
            <div className="flex md:contents overflow-x-auto pb-8 md:pb-0 gap-4 snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
              
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={cn(
                    "min-w-[85vw] md:min-w-0 snap-center flex flex-col", // Mobile styling
                    plan.highlight ? "md:-mt-4 md:mb-4" : "" // Desktop vertical pop
                  )}
                >
                  <div className={cn(
                    "relative h-full flex flex-col p-6 rounded-2xl border transition-all duration-300 group",
                    plan.highlight 
                      ? "bg-neutral-900 border-red-600 shadow-2xl shadow-red-900/20" 
                      : "bg-neutral-950 border-white/10 hover:border-white/20 hover:bg-neutral-900/50"
                  )}>
                    
                    {plan.popular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <div className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-red-900/50 flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" /> Most Popular
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-neutral-400 text-sm h-10">{plan.description}</p>
                    </div>

                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        ₹{billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                      </span>
                      <span className="text-neutral-500 text-sm">
                        /{billingPeriod === "monthly" ? "mo" : "yr"}
                      </span>
                    </div>

                    <Button 
                      className={cn(
                        "w-full mb-8 h-12 text-base font-semibold transition-all duration-300",
                        plan.highlight 
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30" 
                          : "bg-white text-black hover:bg-neutral-200"
                      )}
                      onClick={() => user ? handleOpenPurchaseDialog(plan, 'subscription') : handleLoginRedirect()}
                      disabled={isProcessing === plan.id || isLoadingUser}
                    >
                      {isProcessing === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : isLoadingUser ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        <>
                          {plan.cta} <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <div className="space-y-4 flex-grow">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Features</p>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          {feature.included ? (
                            <div className="mt-0.5 rounded-full bg-red-500/10 p-0.5 flex-shrink-0">
                              <Check className="w-3.5 h-3.5 text-red-500" />
                            </div>
                          ) : (
                            <X className="w-4 h-4 text-neutral-700 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-sm leading-tight",
                            feature.included ? "text-neutral-300" : "text-neutral-700 line-through decoration-neutral-800"
                          )}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tokens Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Pay As You Go <span className="text-red-500">Tokens</span></h2>
              <p className="text-neutral-400">Need a one-time boost? Grab a token pack.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {tokenPackages.map((pkg) => (
                <Card key={pkg.id} className="bg-neutral-900/50 border-white/10 hover:border-red-500/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg text-white">{pkg.name}</CardTitle>
                      <p className="text-sm text-neutral-400 mt-1">{pkg.description}</p>
                    </div>
                    {pkg.discount && (
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">{pkg.discount}</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between mt-4">
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-bold text-white">₹{pkg.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-400 font-semibold bg-red-950/30 px-3 py-1 rounded-md border border-red-900/50">
                        <Zap className="w-4 h-4" />
                        {pkg.tokens.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full border-white/10 hover:bg-white hover:text-black text-white hover:border-white"
                      onClick={() => user ? handleOpenPurchaseDialog(pkg, 'token') : handleLoginRedirect()}
                      disabled={isProcessing === pkg.id || isLoadingUser}
                    >
                      {isProcessing === pkg.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : isLoadingUser ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        "Buy Pack"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Token Consumption Guide */}
            <div className="bg-neutral-900/30 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6 justify-center text-neutral-300">
                <Info className="w-4 h-4" />
                <h3 className="font-semibold text-sm uppercase tracking-wide">How Tokens Work</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-neutral-400">Basic Transcript</span>
                    <span className="text-white font-mono">1 Token / min</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-neutral-400">Deep Diver Model Q&A</span>
                    <span className="text-white font-mono">10 Tokens / video</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-neutral-400">Flashcard Generation</span>
                    <span className="text-white font-mono">5 Tokens / video</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-neutral-500 italic">Example: 30-min video + Q&A</span>
                    <span className="text-red-400 font-bold font-mono">40 Tokens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Free Plan Footer */}
          <div className="mt-20 text-center">
            <p className="text-neutral-500 mb-4">Not ready to commit?</p>
            <button className="text-white underline decoration-neutral-700 hover:decoration-red-500 underline-offset-4 transition-all">
              Start with the Free Forever Plan
            </button>
          </div>

        </div>

        {/* Global Style for hiding scrollbar on cross-browser */}
        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    </>
  );
}