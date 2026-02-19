"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  User, CreditCard, History, Zap, 
  Flame, Shield, Settings, LogOut, 
  ChevronRight, Calendar, Smartphone, 
  Mail, Award, Coins, FileText, Layers,
  Download, Loader2, AlertCircle, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/config/api"; 

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
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "billing">("overview");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
    doc.text("PeprTub", 14, 22);
    
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
    doc.text("Nagpur, Maharashtra, India - 440034", 14, 29);
    doc.text("Email: papertub.support@gmail.com", 14, 34);
    doc.text("GSTIN: 27AAAAA0000A1Z5", 14, 39); 

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
    doc.text("PeprTub - Empowering Knowledge", 14, pageHeight - 24);

    doc.save(`Invoice_${invoiceNo}.pdf`);
    setDownloadingId(null);
  };

  // --- RENDER STATES ---
  if (loading) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest animate-pulse">Fetching Neural Data...</p>
          </div>
      );
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
                   
                   <div className="pt-4 mt-4 border-t border-white/5">
                      <button className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl w-full transition-colors uppercase tracking-wide">
                         <LogOut size={16} /> Sign Out
                      </button>
                   </div>
                </nav>

                {/* Mobile Tabs */}
                <div className="md:hidden bg-neutral-900/50 p-1 rounded-xl border border-white/5 flex">
                   {(['overview', 'history', 'billing'] as const).map((tab) => (
                      <button
                         key={tab}
                         onClick={() => setActiveTab(tab)}
                         className={cn(
                            "flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all",
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
                         <StatCard label="Tokens" value={user.token ? (user.token / 1000).toFixed(1) + 'k' : '0'} unit="Credits" icon={<Coins className="text-yellow-400" fill="currentColor" size={18} />} />
                         <StatCard label="XP" value={user.xp?.toLocaleString() || 0} unit="Points" icon={<Zap className="text-blue-500" fill="currentColor" size={18} />} />
                         <StatCard label="Rank" value={user.rank || "Novice"} unit="Top 5%" icon={<Award className="text-purple-500" fill="currentColor" size={18} />} />
                      </div>

                      {/* Membership Banner */}
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

                      {/* Recent Activity */}
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
                         {user.flashcardCreationHistory?.map((fc: any) => <ActivityItem key={fc._id} item={fc} type="flashcard" />)}
                         {(!user.noteCreationHistory?.length && !user.flashcardCreationHistory?.length) && (
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

             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

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

function ActivityItem({ item, type }: { item: any, type: 'note' | 'flashcard' }) {
   return (
      <div className="flex items-center gap-4 bg-neutral-900/30 border border-white/5 p-4 rounded-2xl hover:bg-neutral-900/50 transition-colors group cursor-default">
         <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5",
            type === 'note' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
         )}>
            {type === 'note' ? <FileText size={18} /> : <Layers size={18} />}
         </div>
         <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate pr-4">{item.videoTitle || "Untitled Project"}</h4>
            <div className="flex items-center gap-2 mt-1.5">
               <Badge variant="outline" className="border-white/10 text-neutral-500 text-[9px] px-1.5 py-0 uppercase font-bold tracking-wide">
                  {type === 'note' ? (item.model || "AI Note") : `${item.cardCount || 0} Cards`}
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