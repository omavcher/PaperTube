"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  User, CreditCard, History, Zap, 
  Flame, Shield, Settings, LogOut, 
  ChevronRight, Calendar, Smartphone, 
  Mail, Award, Coins, FileText, Layers,
  Download, Loader2, AlertCircle, ShieldCheck,
  MessageCircle, Clock, RefreshCw, TrendingUp
} from "lucide-react";
import { LoaderX } from "@/components/LoaderX";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/config/api"; 
import SupportTab from "./SupportTab";

// --- PDF Generation Libraries ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Helpers ---
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

// --- NUMBER TO WORDS (Indian Currency) ---
const numToWords = (n: number) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const numToWord = (num: number): string => {
        if ((num = num.toString().length > 9 ? parseFloat(num.toString().slice(0, 9)) : num) === 0) return '';
        if (num < 20) return a[num];
        if (num < 100) return b[Math.floor(num / 10)] + ' ' + a[num % 10];
        if (num < 1000) return a[Math.floor(num / 100)] + 'Hundred ' + numToWord(num % 100);
        if (num < 100000) return numToWord(Math.floor(num / 1000)) + 'Thousand ' + numToWord(num % 1000);
        if (num < 10000000) return numToWord(Math.floor(num / 100000)) + 'Lakh ' + numToWord(num % 100000);
        return numToWord(Math.floor(num / 10000000)) + 'Crore ' + numToWord(num % 10000000);
    };

    const [rupees, paise] = n.toFixed(2).split('.');
    let str = "Rupees " + (parseInt(rupees) === 0 ? "Zero " : numToWord(parseInt(rupees)));
    
    if (parseInt(paise) > 0) {
        str += "and " + numToWord(parseInt(paise)) + "Paise ";
    }
    
    return str + "Only";
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "billing" | "support">("overview");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- AUTH HELPER ---
  const getAuthToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("authToken") : null), []);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
           // Handle no token
        }

        const res = await api.get('/auth/get-profile', { 
          headers: { 'Auth': token } 
        });

        if (res.data.success) {
            setProfileData(res.data.user);
        } else {
            setError(res.data.message || "Failed to load profile");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
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
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const user = profileData;

    // --- Header ---
    doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(20, 20, 20);
    doc.text("Paperxify", 14, 22);
    
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
    doc.text("Nagpur, Maharashtra, India - 440034", 14, 29);
    doc.text("Email: paperxify@gmail.com", 14, 34);

    // --- Invoice Meta ---
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(20, 20, 20);
    doc.text("TAX INVOICE", pageWidth - 14, 22, { align: "right" });
    
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
    
    const invoiceNo = tx._id ? tx._id.toUpperCase() : 'DRAFT';
    
    doc.text(`Invoice No: INV-${invoiceNo}`, pageWidth - 14, 30, { align: "right" });
    doc.text(`Date: ${formatDate(tx.timestamp)}`, pageWidth - 14, 35, { align: "right" });

    doc.setDrawColor(220); doc.line(14, 48, pageWidth - 14, 48);

    // --- Bill To ---
    doc.setFont("helvetica", "bold"); doc.setTextColor(20, 20, 20);
    doc.text("Bill To:", 14, 58);
    doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    doc.text(user.name || "Customer", 14, 64);
    doc.text(user.email || "", 14, 69);
    if(user.mobile) doc.text(`Mobile: ${user.mobile}`, 14, 74);

    // --- Calculation ---
    const totalAmt = parseFloat(tx.amount);
    const gstRate = 0.18;
    const baseVal = totalAmt / (1 + gstRate);
    const gstVal = totalAmt - baseVal;
    
    autoTable(doc, {
        startY: 85,
        head: [['Description', 'SAC Code', 'Period', 'Taxable Value', 'IGST (18%)', 'Total']],
        body: [[
            `${tx.packageName || 'Subscription'} Plan`, '998431', tx.billingPeriod || 'Monthly', 
            `Rs. ${baseVal.toFixed(2)}`, `Rs. ${gstVal.toFixed(2)}`, `Rs. ${totalAmt.toFixed(2)}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5, textColor: [50, 50, 50] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;
    
    // --- Amount Words ---
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80, 80, 80);
    doc.text("Total Amount in Words:", 14, finalY);
    doc.setFont("helvetica", "bold"); doc.setTextColor(20, 20, 20);
    doc.text(numToWords(totalAmt), 14, finalY + 6);

    // --- Totals ---
    const rightColX = pageWidth - 60; const valueX = pageWidth - 14;
    doc.setFont("helvetica", "normal");
    doc.text("Sub Total:", rightColX, finalY); doc.text(baseVal.toFixed(2), valueX, finalY, { align: "right" });
    doc.text("IGST (18%):", rightColX, finalY + 6); doc.text(gstVal.toFixed(2), valueX, finalY + 6, { align: "right" });
    
    doc.setDrawColor(200); doc.line(rightColX, finalY + 10, pageWidth - 14, finalY + 10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("Grand Total:", rightColX, finalY + 18); doc.text(`Rs. ${totalAmt.toFixed(2)}`, valueX, finalY + 18, { align: "right" });

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
    doc.text("This is a computer generated invoice and does not require a physical signature.", 14, pageHeight - 30);
    doc.setFont("helvetica", "bold");
    doc.text("Paperxify - Empowering Knowledge", 14, pageHeight - 24);

    doc.save(`Invoice_${invoiceNo}.pdf`);
    setDownloadingId(null);
  };

  // --- SEND INVOICE EMAIL ---
  const sendInvoiceEmail = async (tx: any) => {
    if (!profileData) return;
    setEmailingId(tx._id);
    try {
      await api.post('/email/resend-invoice', { transactionId: tx._id }, {
        headers: { 'Auth': getAuthToken() }
      });
      // silent success
    } catch (e) {
      // swallow — don't alert user on email failure
      console.warn('Invoice email failed:', e);
    } finally {
      setEmailingId(null);
    }
  };

  // --- RENDER STATES ---
  if (loading) {
      return <LoaderX />;
  }

  if (error || !profileData) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-neutral-400">{error || "Profile not found"}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="border-white/10 text-white hover:bg-white/10">Retry</Button>
          </div>
      );
  }

  const user = profileData;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 md:pt-16 pb-24">
        
        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Profile Identity */}
          <div className="md:col-span-4 lg:col-span-3">
             <div className="md:sticky md:top-24 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                   
                   <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-white/10 to-transparent border border-white/5">
                         <Avatar className="w-full h-full">
                            <AvatarImage src={user.picture} />
                            <AvatarFallback className="bg-black text-white font-bold">{user.name?.charAt(0)}</AvatarFallback>
                         </Avatar>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1.5 border border-white/10">
                         {user.rank === 'legendary' ? (
                            <ShieldCheck className="text-yellow-500 fill-yellow-500/20" size={16} />
                         ) : (
                            <Shield className="text-neutral-500" size={16} />
                         )}
                      </div>
                   </div>

                   <h2 className="text-lg font-bold text-white mb-0.5">{user.name}</h2>
                   <p className="text-xs text-neutral-500 mb-6 font-mono">@{user.username}</p>

                   <div className="flex flex-col gap-2 w-full text-xs text-neutral-400">
                      <ProfileInfoRow icon={Mail} label="Email" value={user.email} />
                      <ProfileInfoRow icon={Smartphone} label="Mobile" value={user.mobile || "N/A"} />
                      <ProfileInfoRow icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
                   </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-col gap-1">
                   <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<User size={16} />} label="Overview" />
                   <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={16} />} label="Activity History" />
                   <NavButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard size={16} />} label="Billing & Plan" />
                   <NavButton active={activeTab === 'support'} onClick={() => setActiveTab('support')} icon={<MessageCircle size={16} className="text-blue-500" />} label="Support Center" />
                   
                   <div className="pt-4 mt-4 border-t border-white/5">
                      <button className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl w-full transition-colors uppercase tracking-wide">
                         <LogOut size={16} /> Sign Out
                      </button>
                   </div>
                </nav>

                {/* Mobile Tabs */}
                <div className="md:hidden bg-neutral-900/50 p-1 rounded-xl border border-white/5 flex flex-wrap gap-1">
                   {(['overview', 'history', 'billing', 'support'] as const).map((tab) => (
                      <button
                         key={tab}
                         onClick={() => setActiveTab(tab)}
                         className={cn(
                            "flex-1 min-w-[30%] py-2 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all",
                            activeTab === tab ? "bg-white text-black" : "text-neutral-500 hover:text-white"
                         )}
                      >
                         {tab}
                      </button>
                   ))}
                </div>

             </div>
          </div>

          {/* RIGHT COLUMN: Content Area */}
          <div className="md:col-span-8 lg:col-span-9">
             <AnimatePresence mode="wait">
                
                {/* --- TAB: OVERVIEW --- */}
                {activeTab === "overview" && (
                   <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                   >
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <StatCard label="Streak" value={`${user.streak?.count || 0}`} unit="Days" icon={<Flame className="text-orange-500" fill="currentColor" size={18} />} />
                         <StatCard 
                            label="Tokens" 
                            value={user.membership?.isActive ? "Unlimited" : (user.tokens !== undefined ? String(user.tokens) : '0')} 
                            unit={user.membership?.isActive ? "Premium Access" : "Today's Credits"} 
                            icon={<Coins className="text-yellow-400" fill="currentColor" size={18} />} 
                         />
                         <StatCard label="XP" value={user.xp?.toLocaleString() || '0'} unit="Points" icon={<Zap className="text-blue-500" fill="currentColor" size={18} />} />
                         <StatCard label="Rank" value={user.rank || "Novice"} unit="Your Level" icon={<Award className="text-purple-500" fill="currentColor" size={18} />} />
                      </div>

                      {/* Daily Stack widget */}
                      <DailyStackWidget user={user} />

                      {​/* Membership Banner */}
                      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/30 p-8">
                         <div className="absolute top-0 right-0 p-32 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
                         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                               <div className="flex items-center gap-3 mb-3">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Current Plan</span>
                                  {user.membership?.isActive && (
                                     <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                        Active
                                     </Badge>
                                  )}
                               </div>
                               <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{user.membership?.planName || "Free Plan"}</h3>
                               <p className="text-neutral-400 text-sm font-medium">
                                  {user.membership?.expiresAt ? `Renews on ${formatDate(user.membership.expiresAt)}` : "Upgrade to unlock premium features."}
                               </p>
                            </div>
                           
                         </div>
                      </div>

                      {​/* Recent Activity */}
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Recent Activity</h3>
                            <Button variant="link" className="text-white text-xs h-auto p-0" onClick={() => setActiveTab('history')}>View All</Button>
                         </div>
                         <div className="space-y-3">
                            {user.noteCreationHistory && user.noteCreationHistory.length > 0 ? (
                               user.noteCreationHistory.slice(0, 3).map((note: any) => (
                                  <ActivityItem key={note._id} item={note} type="note" />
                               ))
                            ) : (
                               <div className="p-8 text-center border border-white/5 rounded-2xl bg-neutral-900/20 text-neutral-500 text-sm">
                                  No recent activity found.
                               </div>
                            )}
                         </div>
                      </div>
                   </motion.div>
                )}

                {/* --- TAB: HISTORY --- */}
                {activeTab === "history" && (
                   <motion.div 
                      key="history"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                   >
                      <h2 className="text-2xl font-bold text-white tracking-tight">Activity Log</h2>
                      <div className="space-y-3">
                         {user.noteCreationHistory?.map((note: any) => <ActivityItem key={note._id} item={note} type="note" />)}
                         {(!user.noteCreationHistory?.length) && (
                            <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-3xl border border-white/5">
                               No activity history found.
                            </div>
                         )}
                      </div>
                   </motion.div>
                )}

                {/* --- TAB: BILLING --- */}
                {activeTab === "billing" && (
                   <motion.div 
                      key="billing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                   >
                      <h2 className="text-2xl font-bold text-white tracking-tight">Billing History</h2>
                      <div className="bg-neutral-900/40 border border-white/5 rounded-3xl overflow-hidden">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                               <thead className="bg-neutral-900/80 text-neutral-500 border-b border-white/5">
                                  <tr>
                                     <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Date</th>
                                     <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Plan</th>
                                     <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                                     <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                                     <th className="p-5 font-bold uppercase tracking-wider text-[10px] text-right">Invoice</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-white/5">
                                  {user.transactions && user.transactions.length > 0 ? (
                                     user.transactions.map((tx: any) => (
                                        <tr key={tx._id} className="hover:bg-white/5 transition-colors group">
                                           <td className="p-5 text-neutral-300 font-mono text-xs whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                                           <td className="p-5 font-medium text-white whitespace-nowrap">{tx.packageName}</td>
                                           <td className="p-5 text-neutral-300 font-mono text-xs whitespace-nowrap">{formatCurrency(tx.amount)}</td>
                                           <td className="p-5 whitespace-nowrap">
                                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-bold uppercase tracking-wide">
                                                 {tx.status}
                                              </Badge>
                                           </td>
                                           <td className="p-5 text-right whitespace-nowrap">
                                              <Button 
                                                 variant="ghost" size="sm" 
                                                 className="h-8 text-neutral-400 hover:text-white hover:bg-white/10"
                                                 onClick={() => generateInvoice(tx)}
                                                 disabled={downloadingId === tx._id}
                                              >
                                                 {downloadingId === tx._id ? (
                                                    <Loader2 className="animate-spin" size={14} />
                                                 ) : (
                                                    <Download size={14} />
                                                 )}
                                              </Button>
                                           </td>
                                        </tr>
                                     ))
                                  ) : (
                                     <tr>
                                        <td colSpan={5} className="p-12 text-center text-neutral-500 text-sm">No transactions found.</td>
                                     </tr>
                                  )}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </motion.div>
                )}

                 {/* --- TAB: SUPPORT --- */}
                 {activeTab === "support" && (
                   <motion.div 
                      key="support"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                   >
                     <SupportTab user={user} />
                   </motion.div>
                 )}

              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

// ── Daily Stack Widget ────────────────────────────────────────────
function DailyStackWidget({ user }: { user: any }) {
   const DAILY_CAP = user.membership?.isActive ? Infinity : 10;
   const tokensLeft = Math.max(0, user.tokens ?? 0);
   const usedToday = Math.max(0, DAILY_CAP - tokensLeft);
   const pct = DAILY_CAP === Infinity ? 0 : Math.min(100, Math.round((tokensLeft / DAILY_CAP) * 100));
   const isPremium = !!user.membership?.isActive;

   // Countdown to midnight
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
         setTimeToReset(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
   }, []);

   // Streak display
   const streak = user.streak?.count || 0;
   const lastVisit = user.streak?.lastVisit ? new Date(user.streak.lastVisit) : null;
   const visitedToday = lastVisit ? lastVisit.toDateString() === new Date().toDateString() : false;

   return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/30 p-6">
         {/* Background glow */}
         <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />

         <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
               <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-neutral-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Daily Stack</span>
               </div>
               {!isPremium && (
                  <div className="flex items-center gap-1.5 text-neutral-500">
                     <Clock size={11} />
                     <span className="text-[10px] font-mono font-bold text-neutral-400">Resets in {timeToReset}</span>
                  </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Streak block */}
               <div className={cn(
                  "p-4 rounded-2xl border flex flex-col gap-2",
                  visitedToday
                     ? "bg-orange-500/10 border-orange-500/20"
                     : "bg-white/[0.02] border-white/5"
               )}>
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Streak</span>
                     <Flame size={18} className={visitedToday ? "text-orange-400" : "text-neutral-700"} fill={visitedToday ? "currentColor" : "none"} />
                  </div>
                  <span className="text-3xl font-black text-white">{streak}</span>
                  <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wide">
                     {visitedToday ? "✓ Active today" : streak === 0 ? "Log in to start" : "Come back tomorrow!"}
                  </span>
               </div>

               {/* Token bar block */}
               <div className="md:col-span-2 p-4 rounded-2xl border bg-white/[0.02] border-white/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                        {isPremium ? "Premium Tokens" : "Daily Tokens"}
                     </span>
                     <div className="flex items-center gap-1">
                        <Coins size={12} className="text-yellow-400" />
                        <span className="text-[10px] font-black text-white">
                           {isPremium ? `${tokensLeft.toLocaleString()} left` : `${tokensLeft} / ${DAILY_CAP} left`}
                        </span>
                     </div>
                  </div>

                  {!isPremium && (
                     <>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={cn(
                                 "h-full rounded-full",
                                 pct > 60 ? "bg-emerald-500" : pct > 30 ? "bg-amber-500" : "bg-red-500"
                              )}
                           />
                        </div>
                        <div className="flex justify-between text-[9px] text-neutral-600 font-bold uppercase">
                           <span>{usedToday} used today</span>
                           <span className={pct === 0 ? "text-red-500" : ""}>
                              {pct === 0 ? "All used up — resets at midnight" : `${pct}% remaining`}
                           </span>
                        </div>
                     </>
                  )}

                  {isPremium && (
                     <div className="flex items-center gap-2 mt-1">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold">Premium — unlimited daily access</span>
                     </div>
                  )}

                  <div className="flex items-center gap-1 mt-auto">
                     <RefreshCw size={9} className="text-neutral-600" />
                     <span className="text-[9px] text-neutral-600">
                        {isPremium
                           ? `Plan expires: ${formatDate(user.membership?.expiresAt)}`
                           : `Replenished every day at 12:00 AM • Last reset: ${user.lastTokenReset ? formatDate(user.lastTokenReset) : 'Never'}`}
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function ProfileInfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between px-3 py-2.5 bg-black/40 border border-white/5 rounded-lg">
            <div className="flex items-center gap-2 text-neutral-500">
                <Icon size={12}/> <span className="font-medium">{label}</span>
            </div>
            <span className="text-neutral-300 font-medium truncate max-w-[140px]">{value}</span>
        </div>
    )
}

function StatCard({ label, value, icon, unit }: any) {
   return (
      <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:bg-neutral-900/60 transition-colors">
         <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{label}</span>
            <div className="bg-black p-1.5 rounded-lg border border-white/5 text-neutral-400 group-hover:text-white transition-colors">{icon}</div>
         </div>
         <div>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-[10px] text-neutral-600 font-medium uppercase tracking-wide mt-0.5">{unit}</div>
         </div>
      </div>
   )
}

function NavButton({ active, onClick, icon, label }: any) {
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wide rounded-xl transition-all w-full text-left",
            active ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:bg-white/5 hover:text-white"
         )}
      >
         {icon} {label}
         {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
      </button>
   )
}

function ActivityItem({ item, type }: { item: any, type: 'note' }) {
   return (
      <div className="flex items-center gap-4 bg-neutral-900/30 border border-white/5 p-4 rounded-2xl hover:bg-neutral-900/50 transition-colors group cursor-default">
         <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 bg-blue-500/10 text-blue-500">
            <FileText size={18} />
         </div>
         <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate pr-4">{item.videoTitle || "Untitled Project"}</h4>
            <div className="flex items-center gap-2 mt-1.5">
               <Badge variant="outline" className="border-white/10 text-neutral-500 text-[9px] px-1.5 py-0 uppercase font-bold tracking-wide">
                  {item.model || "AI Note"}
               </Badge>
               <span className="text-[10px] text-neutral-600 font-mono">{formatDate(item.createdAt)}</span>
            </div>
         </div>
         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={14} className="text-neutral-500" />
         </div>
      </div>
   )
}