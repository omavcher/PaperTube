"use client";

import { useState, useEffect, useCallback, JSX } from "react";
import { 
  Coins, 
  CreditCard, 
  IndianRupee,
  Loader2,
  ArrowLeft,
  Zap,
  Crown,
  Star,
  Sparkles,
  Check,
  Shield,
  Bolt,
  InfinityIcon,
  Gem,
  Rocket,
  Target,
  LogIn,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/config/api";
import Script from "next/script";

// Reuse the same Razorpay types from your profile
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: any) => void;
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

interface UserData {
  name: string;
  email: string;
  picture: string;
  _id?: string;
}

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
  bestValue?: boolean;
  icon?: JSX.Element;
  description?: string;
  features?: string[];
}

interface TransactionData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  packageId: string;
  amount: number;
  tokens: number;
}

export default function PricingPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Enhanced token packages with pure black and red theme
  const tokenPackages: TokenPackage[] = [
    { 
      id: "1", 
      name: "Starter", 
      tokens: 100, 
      price: 19,
      icon: <Zap className="h-5 w-5" />,
      description: "Perfect for trying out our AI features",
      features: ["100 AI Tokens", "Basic Support", "Standard Speed", "7-Day Access"]
    },
    { 
      id: "2", 
      name: "Pro", 
      tokens: 500, 
      price: 49, 
      popular: true,
      icon: <Rocket className="h-5 w-5" />,
      description: "Great for regular users and small projects",
      features: ["500 AI Tokens", "Priority Support", "Faster Responses", "Advanced Models", "30-Day Access"]
    },
    { 
      id: "3", 
      name: "Expert", 
      tokens: 1200, 
      price: 99, 
      bestValue: true,
      icon: <Crown className="h-5 w-5" />,
      description: "Best value for power users and developers",
      features: ["1200 AI Tokens", "24/7 Priority Support", "Ultra Fast", "All AI Models", "Early Access", "90-Day Access"]
    },
    { 
      id: "4", 
      name: "Master", 
      tokens: 3000, 
      price: 129,
      icon: <Gem className="h-5 w-5" />,
      description: "Maximum tokens for heavy usage and teams",
      features: ["3000 AI Tokens", "Dedicated Support", "Maximum Speed", "All Features", "Team Management", "Lifetime Access"]
    },
  ];

  // Get auth token
  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("authToken");
    }
    return null;
  }, []);

  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    }
    setIsLoading(false);
  }, [getAuthToken]);

  // Save transaction to database
  const saveTransactionToDB = async (transactionData: TransactionData, status: 'success' | 'failed', error?: string) => {
    try {
      const token = getAuthToken();
      const packageData = tokenPackages.find(pkg => pkg.id === transactionData.packageId);
      
      const payload = {
        razorpay_payment_id: transactionData.razorpay_payment_id,
        razorpay_order_id: transactionData.razorpay_order_id,
        razorpay_signature: transactionData.razorpay_signature,
        packageId: transactionData.packageId,
        amount: transactionData.amount,
        tokens: transactionData.tokens,
        status: status,
        userId: user?._id || user?.email,
        userEmail: user?.email,
        userName: user?.name,
        packageName: packageData?.name || `Package ${transactionData.packageId}`,
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
    } catch (error) {
      console.error("❌ Error saving transaction:", error);
      throw new Error("Failed to save transaction");
    }
  };

  // Handle token purchase with enhanced animations
  const handlePurchaseTokens = async (packageId: string) => {
    if (!user) {
      toast.error("Please login to purchase tokens", {
        action: {
          label: "Login",
          onClick: () => window.location.href = "/"
        }
      });
      return;
    }

    if (!mounted) return;
    
    setIsProcessing(packageId);
    
    try {
      const packageData = tokenPackages.find(pkg => pkg.id === packageId);
      if (!packageData) {
        toast.error("Package not found");
        setIsProcessing(null);
        return;
      }

      if (!window.Razorpay) {
        toast.error("Payment system is loading. Please try again in a moment.");
        setIsProcessing(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_y6rhmgP580s3Yc',
        amount: packageData.price * 100,
        currency: 'INR',
        name: 'AI Companion App',
        description: `Purchase ${packageData.tokens} tokens - ${packageData.name} Package`,
        handler: async function (response: any) {
          try {
            const transactionData: TransactionData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              packageId,
              amount: packageData.price,
              tokens: packageData.tokens
            };

            const saveResponse = await saveTransactionToDB(transactionData, 'success');
            
            if (saveResponse.success) {
              toast.success(`🎉 Payment Successful! ${packageData.tokens} tokens added to your account.`, {
                duration: 4000,
              });
              setTimeout(() => {
                window.location.href = "/profile";
              }, 2000);
            } else {
              throw new Error('Failed to save transaction');
            }
          } catch (error) {
            console.error("❌ Error processing payment success:", error);
            toast.error("Payment successful, but there was an issue saving the details. Please contact support.");
          } finally {
            setIsProcessing(null);
          }
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@example.com',
          contact: '9999999999'
        },
        theme: { 
          color: '#dc2626' // Red color
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(null);
            toast.info("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', async function (response: any) {
        console.error("❌ Payment failed:", response.error);
        
        try {
          const transactionData: TransactionData = {
            razorpay_payment_id: response.error.metadata?.payment_id || 'unknown',
            razorpay_order_id: response.error.metadata?.order_id || 'unknown',
            razorpay_signature: "",
            packageId,
            amount: packageData.price,
            tokens: packageData.tokens
          };

          await saveTransactionToDB(transactionData, 'failed', response.error.description);
          toast.error(`Payment failed: ${response.error.description}`);
        } catch (error) {
          console.error("❌ Error handling payment failure:", error);
          toast.error("Payment failed. Please try again.");
        } finally {
          setIsProcessing(null);
        }
      });

      rzp.open();
      
    } catch (error) {
      console.error("❌ Error initializing payment:", error);
      toast.error("Error initializing payment. Please try again.");
      setIsProcessing(null);
    }
  };

  const calculatePricePerToken = (price: number, tokens: number) => {
    return (price / tokens).toFixed(4);
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const handleGoToProfile = () => {
    window.location.href = "/profile";
  };

  const handleLogin = () => {
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg flex items-center gap-3">
          <div className="relative">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-red-300 rounded-full animate-spin animation-delay-500"></div>
          </div>
          Loading your experience...
        </div>
      </div>
    );
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
        onLoad={() => console.log("Razorpay SDK loaded successfully")}
        onError={() => console.error("Failed to load Razorpay SDK")}
      />
      
      <div className="min-h-screen bg-black pt-16 pb-10 px-4">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/3 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/2 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/1 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header with Smooth Animation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
            <div className="text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <Sparkles className="h-6 w-6 text-red-400" />
                </div>
                <Badge variant="secondary" className="bg-red-500/15 text-red-400 border-red-500/30 px-3 py-1 rounded-full">
                  ✨ Premium Tokens
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white">
                Choose Your
                <span className="block text-red-500">
                  Token Package
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                Get the perfect amount of tokens for your needs. All prices in Indian Rupees.
                {user ? (
                  <span className="text-red-400 ml-2 font-medium">
                    Welcome back, {user.name}!
                  </span>
                ) : (
                  <span className="text-yellow-400 ml-2 font-medium">
                    Please login to purchase tokens
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
              <Button 
                onClick={handleBackToHome}
                variant="outline"
                className="border-gray-800 bg-black text-white hover:bg-gray-900 hover:border-gray-700 transition-all duration-300 flex items-center gap-2 px-6 py-3 rounded-2xl group hover:text-red-400"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </Button>
              {user ? (
                <Button 
                  onClick={handleGoToProfile}
                  variant="outline"
                  className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all duration-300 px-6 py-3 rounded-2xl"
                >
                  View Profile
                </Button>
              ) : (
                <Button 
                  onClick={handleLogin}
                  className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300 px-6 py-3 rounded-2xl flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login to Purchase
                </Button>
              )}
            </div>
          </div>

          {/* Login Required Banner for Non-Logged In Users */}
          {!user && (
            <div className="animate-in fade-in duration-700 mb-8">
              <Card className="bg-yellow-500/10 border-yellow-500/30 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-500/20 rounded-full">
                        <Lock className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400">Login Required</h3>
                        <p className="text-yellow-300/80 text-sm">
                          You need to be logged in to purchase tokens. Your tokens will be added to your account immediately after payment.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleLogin}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pricing Cards with Enhanced Animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {tokenPackages.map((pkg, index) => (
              <div 
                key={pkg.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredCard(pkg.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card 
                  className={`
                    group relative border-0 transition-all duration-500 ease-out
                    hover:scale-105 hover:shadow-2xl cursor-pointer
                    ${!user ? 'opacity-80 grayscale' : ''}
                    ${pkg.popular ? 'bg-black border-red-500/50 shadow-2xl shadow-red-500/10' : 
                      pkg.bestValue ? 'bg-black border-red-500/60 shadow-2xl shadow-red-500/15' : 
                      'bg-black border-gray-800'}
                    rounded-3xl border-2
                    ${hoveredCard === pkg.id ? 'border-red-500/80' : ''}
                  `}
                >
                  {/* Overlay for non-logged in users */}
                  {!user && (
<div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl z-20 flex items-center justify-center">
  <div className="text-center p-6 bg-black/30 rounded-2xl backdrop-blur-sm border border-white/10 p-4">
    <Lock className="h-8 w-8 text-red-400 mx-auto mb-2" />
    <p className="text-white font-semibold">Login Required</p>
    <p className="text-white/80 text-sm mt-1">Sign in to purchase tokens</p>
  </div>
</div>
                  )}

                  {/* Animated Border Glow */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${hoveredCard === pkg.id ? 'animate-pulse' : ''}`}></div>
                  
                  {/* Popular/Best Value Badge */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-red-500 text-white px-4 py-2 rounded-full border-0 shadow-lg shadow-red-500/25 animate-pulse">
                        ⭐ MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  {pkg.bestValue && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full border-0 shadow-lg shadow-red-500/25">
                        🏆 BEST VALUE
                      </Badge>
                    </div>
                  )}

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <CardHeader className="text-center pb-4 relative z-10 pt-8">
                    <div className="flex justify-center mb-4">
                      <div className={`
                        p-4 rounded-2xl border transition-all duration-300 group-hover:scale-110
                        ${pkg.popular ? 'bg-red-500/10 border-red-500/30' :
                          pkg.bestValue ? 'bg-red-500/15 border-red-500/40' :
                          'bg-gray-900 border-gray-700'}
                        group-hover:bg-red-500/10 group-hover:border-red-500/30
                        ${!user ? 'grayscale' : ''}
                      `}>
                        <div className={pkg.popular || pkg.bestValue ? 'text-red-400' : 'text-gray-400 group-hover:text-red-400'}>
                          {pkg.icon}
                        </div>
                      </div>
                    </div>
                    
                    <CardTitle className="flex flex-col items-center gap-3">
                      <span className="text-2xl font-semibold text-white">
                        {pkg.name}
                      </span>
                      <div className="flex items-center gap-2 text-3xl font-bold text-white">
                        <Coins className="h-7 w-7 text-yellow-500" />
                        {pkg.tokens.toLocaleString()}
                        <span className="text-lg text-gray-400 font-normal">Tokens</span>
                      </div>
                    </CardTitle>
                    
                    <CardDescription className="text-gray-400 text-base mt-2">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center relative z-10 space-y-6">
                    {/* Price */}
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-white flex items-center justify-center gap-1">
                        <IndianRupee className="h-7 w-7 text-red-400" />
                        {pkg.price}
                      </div>
                      <p className="text-sm text-gray-400">
                        ₹{calculatePricePerToken(pkg.price, pkg.tokens)} per token
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                      {pkg.features?.map((feature, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 text-sm text-gray-300 animate-in fade-in duration-500"
                          style={{ animationDelay: `${idx * 100 + 500}ms` }}
                        >
                          <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-red-400" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Purchase Button */}
                    <Button 
                      className={`
                        w-full text-lg py-4 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden
                        border-0
                        ${!user 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : pkg.popular 
                            ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25' 
                            : pkg.bestValue
                              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25'
                              : 'bg-gray-800 hover:bg-red-600 text-white'
                        }
                        ${user ? 'hover:shadow-xl hover:scale-105' : ''}
                      `}
                      onClick={() => handlePurchaseTokens(pkg.id)}
                      disabled={!user || isProcessing === pkg.id}
                    >
                      {/* Button Shine Effect */}
                      {user && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      )}
                      
                      {!user ? (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Login to Purchase
                        </>
                      ) : isProcessing === pkg.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Purchase Now
                        </>
                      )}
                    </Button>

                    {/* Best Value Savings */}
                    {pkg.bestValue && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 animate-pulse">
                        <p className="text-sm text-red-400 font-semibold">
                          🎉 Save 40% compared to Starter!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Features & Benefits Section */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000">
            <Card className="bg-black border-gray-800 rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-white">
                  Why Choose Our Tokens?
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Unlock the full potential of our AI companion with premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <Bolt className="h-8 w-8" />,
                      title: "Lightning Fast",
                      description: "Get instant, high-quality responses from our advanced AI models",
                      color: "text-red-400"
                    },
                    {
                      icon: <Target className="h-8 w-8" />,
                      title: "Precision AI",
                      description: "Advanced models that understand context and deliver accurate results",
                      color: "text-red-400"
                    },
                    {
                      icon: <Shield className="h-8 w-8" />,
                      title: "Secure & Private",
                      description: "Enterprise-grade security with complete data privacy",
                      color: "text-red-400"
                    }
                  ].map((feature, index) => (
                    <div 
                      key={index}
                      className="text-center p-6 group hover:scale-105 transition-all duration-300 border border-gray-800 hover:border-red-500/30 rounded-3xl bg-black"
                    >
                      <div className={`inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-white mb-3 text-lg">{feature.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods Section */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1200 mt-12">
            <Card className="bg-black border-gray-800 rounded-3xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
                  <Shield className="h-6 w-6 text-red-400" />
                  Secure Payment Methods
                </h3>
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {['Credit/Debit Cards', 'UPI', 'Net Banking', 'Wallets', 'EMI'].map((method, index) => (
                    <div 
                      key={method}
                      className="flex items-center gap-3 bg-gray-900 border border-gray-800 px-5 py-3 rounded-2xl hover:border-red-500/50 transition-all duration-300 hover:scale-105 group"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-white font-medium group-hover:text-red-400 transition-colors">
                        {method}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-gray-500 text-sm">
                  🔒 All payments are secured with Razorpay. Your financial data is protected with bank-level security.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="animate-in fade-in duration-1000 delay-1500 mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-8 items-center text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-400" />
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-red-400" />
                <span>Instant Token Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <InfinityIcon className="h-4 w-4 text-red-400" />
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}