"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, 
  Coins, 
  CreditCard, 
  Settings, 
  History, 
  Shield,
  Bell,
  Globe,
  Key,
  Trash2,
  Plus,
  Zap,
  IndianRupee,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import api from "@/config/api";
import Script from "next/script";

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
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
}

interface TransactionData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  packageId: string;
  amount: number;
  tokens: number;
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [user, setUser] = useState<UserData | null>(null);
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [usedTokenCount, setUsedTokenCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Updated token packages with Indian Rupees pricing
  const tokenPackages: TokenPackage[] = [
    { id: "1", name: "Starter", tokens: 100, price: 19 },
    { id: "2", name: "Pro", tokens: 500, price: 49, popular: true },
    { id: "3", name: "Expert", tokens: 1200, price: 99, bestValue: true },
    { id: "4", name: "Master", tokens: 3000, price: 129 },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchTokenCount(token);
      fetchTransactionHistory(token);
    } else {
      window.location.href = "/";
    }
  }, []);

  // Updated API call for token count
  const fetchTokenCount = async (authToken: string) => {
    try {
      const response = await api.get("/payment/token-balance", {
        headers: {
          'Auth': authToken
        }
      });
      
      if (response.data.success) {
        // Use availableToken if available, otherwise fall back to token
        setTokenCount(response.data.availableToken || response.data.token || 0);
      }
    } catch (error) {
      console.error("❌ Error fetching token count:", error);
      // If the new endpoint fails, try the old one as fallback
      try {
        const fallbackResponse = await api.get("/auth/getToken", {
          headers: {
            'Auth': authToken
          }
        });
        
        if (fallbackResponse.data.success) {
          setTokenCount(fallbackResponse.data.token || 0);
          setUsedTokenCount(fallbackResponse.data.usedToken || 0);
        }
      } catch (fallbackError) {
        console.error("❌ Error fetching token count from fallback:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Updated API call for transaction history
  const fetchTransactionHistory = async (authToken: string) => {
    try {
      const response = await api.get("/payment/transactions", {
        headers: {
          'Auth': authToken
        }
      });
      
      if (response.data.success) {
        setTransactionHistory(response.data.transactions || []);
      }
    } catch (error) {
      console.error("❌ Error fetching transaction history:", error);
      setTransactionHistory([]);
    }
  };

  // Save transaction to database
  const saveTransactionToDB = async (transactionData: TransactionData, status: 'success' | 'failed', error?: string) => {
    try {
      const token = localStorage.getItem("authToken");
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
      throw error;
    }
  };

  // Handle token purchase - FIXED: Removed duplicate token addition
  const handlePurchaseTokens = async (packageId: string) => {
    setIsProcessing(packageId);
    
    try {
      const packageData = tokenPackages.find(pkg => pkg.id === packageId);
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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_y6rhmgP580s3Yc',
        amount: packageData.price * 100, // Amount in paise
        currency: 'INR',
        name: 'AI Companion App',
        description: `Purchase ${packageData.tokens} tokens - ${packageData.name} Package`,
        handler: async function (response: any) {
          try {
            // Payment successful
            const transactionData: TransactionData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              packageId,
              amount: packageData.price,
              tokens: packageData.tokens
            };

            // Save successful transaction to DB - THIS ALREADY ADDS TOKENS IN BACKEND
            const saveResponse = await saveTransactionToDB(transactionData, 'success');
            
            if (saveResponse.success) {
              // ✅ REMOVED: No need to call addTokensToUser separately
              // The saveTransaction backend function already adds tokens when status is 'success'
              
              // Update token count and transaction history
              const token = localStorage.getItem("authToken");
              if (token) {
                await fetchTokenCount(token);
                await fetchTransactionHistory(token);
              }
              
              toast.success(`Payment Successful! ${packageData.tokens} tokens have been added to your account. 🎉`);
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
          
          // Refresh transaction history
          const token = localStorage.getItem("authToken");
          if (token) {
            await fetchTransactionHistory(token);
          }

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

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  // Delete Account Function
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await api.delete("/auth/delete-account", {
        headers: {
          'Auth': token
        }
      });

      if (response.data.success) {
        // Clear local storage
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        
        // Show success message
        toast.success("Account deleted successfully");
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
        
      } else {
        throw new Error(response.data.message || "Failed to delete account");
      }
    } catch (error: any) {
      console.error("❌ Error deleting account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Function to calculate price per token
  const calculatePricePerToken = (price: number, tokens: number) => {
    return (price / tokens).toFixed(4);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Recent';
    }
  };

  // Calculate overview statistics
  const totalPurchases = transactionHistory.filter(t => t.status === 'success').length;
  const totalMoneySpent = transactionHistory
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Please log in to view your profile</div>
        <Button 
          onClick={() => window.location.href = "/login"}
          className="ml-4 bg-blue-600 hover:bg-blue-700"
        >
          Login
        </Button>
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
      
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Your Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              This action cannot be undone. This will permanently delete your account 
              and remove all your data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile information</li>
                <li>All remaining tokens ({tokenCount.toLocaleString()})</li>
                <li>Your transaction history</li>
                <li>All conversation data</li>
              </ul>
              <p className="mt-3 text-red-400 font-semibold">
                You will be logged out and redirected to the home page.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-neutral-800 text-white border-neutral-600 hover:bg-neutral-700"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen pt-20 pb-10 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-neutral-600">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback className="bg-neutral-700 text-neutral-300 text-2xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                <p className="text-neutral-400">{user.email}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              className="border-neutral-600 text-white hover:bg-neutral-800"
            >
              Back to Home
            </Button>
          </div>

          {/* Token Balance Card */}
          <Card className="bg-neutral-900 border-neutral-700 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-full">
                    <Coins className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{tokenCount.toLocaleString()} Tokens</h3>
                    <p className="text-neutral-400">Available balance</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-neutral-900 p-1">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-neutral-700 text-white"
              >
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="tokens" 
                className="flex items-center gap-2 data-[state=active]:bg-neutral-700 text-white"
              >
                <Coins className="h-4 w-4" />
                Buy Tokens
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 data-[state=active]:bg-neutral-700 text-white"
              >
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-2 data-[state=active]:bg-neutral-700 text-white"
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 border-neutral-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Tokens Used</CardTitle>
                    <Zap className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{usedTokenCount}</div>
                    <p className="text-xs text-neutral-400">Lifetime usage</p>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Purchases</CardTitle>
                    <CreditCard className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {totalPurchases}
                    </div>
                    <p className="text-xs text-neutral-400">Successful transactions</p>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Money Spent</CardTitle>
                    <IndianRupee className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      ₹{totalMoneySpent}
                    </div>
                    <p className="text-xs text-neutral-400">Total payments</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-neutral-400">Manage your account and tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => setActiveTab('tokens')}
                      className="flex items-center gap-2 justify-start h-auto p-4 bg-neutral-800 hover:bg-neutral-700 border-0"
                    >
                      <Plus className="h-5 w-5 text-green-400" />
                      <div className="text-left">
                        <div className="font-semibold text-white">Buy More Tokens</div>
                        <div className="text-sm text-neutral-400">Get additional API credits</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => setActiveTab('history')}
                      className="flex items-center gap-2 justify-start h-auto p-4 bg-neutral-800 hover:bg-neutral-700 border-0"
                    >
                      <History className="h-5 w-5 text-blue-400" />
                      <div className="text-left">
                        <div className="font-semibold text-white">Transaction History</div>
                        <div className="text-sm text-neutral-400">View your payment history</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Buy Tokens Tab */}
            <TabsContent value="tokens" className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-white">Choose Your Token Package</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Select a package that fits your needs. More tokens = better value! All prices in Indian Rupees.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tokenPackages.map((pkg) => (
                      <Card 
                        key={pkg.id}
                        className={`bg-neutral-800 border-2 relative overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                          pkg.popular ? 'border-yellow-500' : 
                          pkg.bestValue ? 'border-purple-500' : 'border-neutral-600'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                            MOST POPULAR
                          </div>
                        )}
                        {pkg.bestValue && (
                          <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            BEST VALUE
                          </div>
                        )}
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="flex items-center justify-center gap-2 text-white">
                            <Coins className="h-5 w-5 text-yellow-400" />
                            {pkg.tokens.toLocaleString()} Tokens
                          </CardTitle>
                          <CardDescription className="text-neutral-400">{pkg.name} Package</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-1">
                            <IndianRupee className="h-5 w-5" />
                            {pkg.price}
                          </div>
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-500 text-white"
                            onClick={() => handlePurchaseTokens(pkg.id)}
                            disabled={isProcessing === pkg.id}
                          >
                            {isProcessing === pkg.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              "Purchase Now"
                            )}
                          </Button>
                          <p className="text-xs text-neutral-400 mt-2">
                            ₹{calculatePricePerToken(pkg.price, pkg.tokens)} per token
                          </p>
                          {pkg.bestValue && (
                            <p className="text-xs text-green-400 mt-1 font-semibold">
                              🎉 Save 40% compared to Starter
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-8 p-6 bg-neutral-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                      <CreditCard className="h-5 w-5" />
                      Accepted Payment Methods
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'].map((method, index) => (
                        <div key={method} className="flex items-center gap-2 bg-neutral-700 px-3 py-2 rounded-lg">
                          <div className={`w-6 h-4 rounded ${
                            index === 0 ? 'bg-orange-500' :
                            index === 1 ? 'bg-blue-500' :
                            index === 2 ? 'bg-green-500' :
                            index === 3 ? 'bg-purple-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm text-white">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-white">Transaction History</CardTitle>
                  <CardDescription className="text-neutral-400">Your token purchases and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionHistory.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-4">No transactions yet</p>
                      <Button 
                        onClick={() => setActiveTab('tokens')}
                        className="bg-green-600 hover:bg-green-500 text-white"
                      >
                        Buy Your First Tokens
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactionHistory.map((transaction, index) => (
                        <div key={transaction._id || transaction.paymentId || index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              transaction.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}>
                              {transaction.status === 'success' ? (
                                <Coins className="h-4 w-4 text-green-400" />
                              ) : (
                                <CreditCard className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {transaction.packageName || 'Token Purchase'}
                              </div>
                              <div className="text-sm text-neutral-400">
                                {transaction.timestamp ? formatDate(transaction.timestamp) : 
                                 transaction.createdAt ? formatDate(transaction.createdAt) : 'Recent'}
                              </div>
                              {transaction.error && (
                                <div className="text-xs text-red-400 mt-1">
                                  {transaction.error}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              transaction.status === 'success' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              +{transaction.tokens} Tokens
                            </div>
                            <div className="text-sm text-neutral-400 flex items-center justify-end gap-1">
                              <IndianRupee className="h-3 w-3" />
                              {transaction.amount}
                            </div>
                            <Badge 
                              className={`mt-1 ${
                                transaction.status === 'success' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-700 border-red-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-neutral-400 text-sm">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading profile...
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}