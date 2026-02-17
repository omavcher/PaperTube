"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  User, CreditCard, History, Zap, 
  Flame, Shield, Settings, LogOut, 
  ChevronRight, Calendar, Smartphone, 
  Mail, Award, Coins, FileText, Layers,
  Download, Loader2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/config/api"; // Ensure this imports your axios instance

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
        // Allow fetch even if token is missing (API might handle guest), or redirect.
        // For now, assuming token is required:
        if (!token) {
            // setError("Please login to view profile.");
            // setLoading(false);
            // return; 
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
    
    // Simulate slight delay for UI feedback
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
    
    // UPDATED: Using _id as Invoice Number
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
          <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-red-500" />
              <p className="text-neutral-500 text-sm animate-pulse">Loading Profile...</p>
          </div>
      );
  }

  if (error || !profileData) {
      return (
          <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-neutral-400">{error || "Profile not found"}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
      );
  }

  const user = profileData;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-neutral-900/50 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 md:pt-12 pb-20">
        
        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Profile Identity */}
          <div className="md:col-span-4 lg:col-span-3">
             <div className="md:sticky md:top-24 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                   <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
                   
                   <div className="relative mb-4">
                     <Avatar className="w-24 h-24 border-2 border-neutral-800 shadow-xl">
                        <AvatarImage src={user.picture} />
                        <AvatarFallback className="bg-neutral-900 text-2xl font-bold text-neutral-500">
                            {user.name?.charAt(0)}
                        </AvatarFallback>
                     </Avatar>
                     <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1 border border-neutral-800">
                        {user.rank === 'legendary' ? (
                            <Shield className="text-yellow-500 fill-yellow-500/20" size={20} />
                        ) : (
                            <Shield className="text-neutral-500" size={20} />
                        )}
                     </div>
                   </div>

                   <h2 className="text-xl font-bold text-white">{user.name}</h2>
                   <p className="text-sm text-neutral-500 mb-4">@{user.username}</p>

                   <div className="flex flex-col gap-2 w-full text-xs text-neutral-400">
                      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/50 rounded-lg">
                         <span className="flex items-center gap-2"><Mail size={12}/> Email</span>
                         <span className="truncate max-w-[120px]">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/50 rounded-lg">
                         <span className="flex items-center gap-2"><Smartphone size={12}/> Mobile</span>
                         <span>{user.mobile || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/50 rounded-lg">
                         <span className="flex items-center gap-2"><Calendar size={12}/> Joined</span>
                         <span>{formatDate(user.createdAt)}</span>
                      </div>
                   </div>

                   <div className="w-full mt-6">
                      <Button variant="outline" className="w-full bg-transparent border-white/10 hover:bg-white/5 text-xs h-9">
                         <Settings size={14} className="mr-2" /> Settings
                      </Button>
                   </div>
                </div>

                {/* --- MOBILE NAV (Tab Switcher) --- */}
                {/* Shows ONLY on Mobile, replaces Sticky Bottom Bar */}
                <div className="md:hidden bg-[#0A0A0A] p-1 rounded-xl border border-white/10 flex">
                   {(['overview', 'history', 'billing'] as const).map((tab) => (
                      <button
                         key={tab}
                         onClick={() => setActiveTab(tab)}
                         className={cn(
                            "flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-all",
                            activeTab === tab 
                               ? "bg-white text-black shadow-sm" 
                               : "text-neutral-500 hover:text-white"
                         )}
                      >
                         {tab}
                      </button>
                   ))}
                </div>

                {/* Desktop Navigation (Hidden on Mobile) */}
                <nav className="hidden md:flex flex-col gap-1">
                   <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<User size={16} />} label="Overview" />
                   <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={16} />} label="Activity History" />
                   <NavButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard size={16} />} label="Billing & Plan" />
                   <div className="pt-4 mt-4 border-t border-white/5">
                      <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl w-full transition-colors">
                         <LogOut size={16} /> Sign Out
                      </button>
                   </div>
                </nav>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                         <StatCard label="Streak" value={`${user.streak?.count || 0} Days`} icon={<Flame className="text-orange-500" fill="currentColor" size={20} />} sub="Keep it up!" />
                         <StatCard label="Tokens" value={user.token ? (user.token / 1000).toFixed(0) + 'k' : '0'} icon={<Coins className="text-yellow-400" fill="currentColor" size={20} />} sub="Available" />
                         <StatCard label="XP" value={user.xp?.toLocaleString() || 0} icon={<Zap className="text-blue-500" fill="currentColor" size={20} />} sub="Level 12" />
                         <StatCard label="Rank" value={user.rank || "Novice"} icon={<Award className="text-purple-500" fill="currentColor" size={20} />} sub="Top 5%" className="capitalize" />
                      </div>

                      {/* Membership Banner */}
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 to-black p-6 md:p-8">
                         <div className="absolute top-0 right-0 p-32 bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
                         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                               <div className="flex items-center gap-3 mb-2">
                                  <Badge className="bg-red-600 text-white hover:bg-red-700 border-none px-3 py-1 text-xs">CURRENT PLAN</Badge>
                                  {user.membership?.isActive && (
                                     <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active
                                     </span>
                                  )}
                               </div>
                               <h3 className="text-3xl font-bold text-white mb-1">{user.membership?.planName || "Free Plan"}</h3>
                               <p className="text-neutral-400 text-sm">
                                  {user.membership?.expiresAt ? `Valid until ${formatDate(user.membership.expiresAt)}` : "Upgrade to unlock features"}
                               </p>
                            </div>
                            <Button className="bg-white text-black hover:bg-neutral-200 font-semibold px-6">Manage Subscription</Button>
                         </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Recent Creations</h3>
                            <Button variant="link" className="text-neutral-500 text-xs p-0 h-auto hover:text-white" onClick={() => setActiveTab('history')}>View All</Button>
                         </div>
                         <div className="space-y-3">
                            {user.noteCreationHistory && user.noteCreationHistory.length > 0 ? (
                                user.noteCreationHistory.slice(0, 3).map((note: any) => (
                                    <ActivityItem key={note._id} item={note} type="note" />
                                ))
                            ) : (
                                <p className="text-sm text-neutral-500 italic">No recent activity.</p>
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
                      <h2 className="text-xl font-bold">Activity Log</h2>
                      <div className="space-y-3">
                         {user.noteCreationHistory?.map((note: any) => <ActivityItem key={note._id} item={note} type="note" />)}
                         {user.flashcardCreationHistory?.map((fc: any) => <ActivityItem key={fc._id} item={fc} type="flashcard" />)}
                         {(!user.noteCreationHistory?.length && !user.flashcardCreationHistory?.length) && (
                            <div className="text-center py-10 text-neutral-500">No activity history found.</div>
                         )}
                      </div>
                   </motion.div>
                )}

                {/* --- TAB: BILLING (With Invoice Generation) --- */}
                {activeTab === "billing" && (
                   <motion.div 
                     key="billing"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.2 }}
                     className="space-y-6"
                   >
                      <h2 className="text-xl font-bold">Billing History</h2>
                      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                               <thead className="bg-neutral-900/50 text-neutral-400 border-b border-white/5">
                                  <tr>
                                     <th className="p-4 font-medium whitespace-nowrap">Date</th>
                                     <th className="p-4 font-medium whitespace-nowrap">Plan</th>
                                     <th className="p-4 font-medium whitespace-nowrap">Amount</th>
                                     <th className="p-4 font-medium whitespace-nowrap">Status</th>
                                     <th className="p-4 font-medium text-right whitespace-nowrap">Invoice</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-white/5">
                                  {user.transactions && user.transactions.length > 0 ? (
                                    user.transactions.map((tx: any) => (
                                     <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-neutral-300 whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                                        <td className="p-4 font-medium text-white whitespace-nowrap">{tx.packageName}</td>
                                        <td className="p-4 text-neutral-300 whitespace-nowrap">{formatCurrency(tx.amount)}</td>
                                        <td className="p-4 whitespace-nowrap">
                                           <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 capitalize">
                                              {tx.status}
                                           </Badge>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                           <Button 
                                             variant="ghost" size="sm" 
                                             className="h-8 text-neutral-400 hover:text-white"
                                             onClick={() => generateInvoice(tx)}
                                             disabled={downloadingId === tx._id}
                                           >
                                              {downloadingId === tx._id ? (
                                                  <Loader2 className="animate-spin" size={14} />
                                              ) : (
                                                  <><Download size={14} className="mr-2" /> Download</>
                                              )}
                                           </Button>
                                        </td>
                                     </tr>
                                  ))
                                  ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-neutral-500">No transactions found.</td>
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
function StatCard({ label, value, icon, sub, className }: any) {
   return (
      <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4 flex flex-col gap-3 relative group hover:border-white/10 transition-colors">
         <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{label}</span>
            <div className="bg-neutral-900/50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
         </div>
         <div>
            <div className={cn("text-2xl font-bold text-white", className)}>{value}</div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">{sub}</div>
         </div>
      </div>
   )
}

function NavButton({ active, onClick, icon, label }: any) {
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all w-full text-left",
            active ? "bg-white text-black shadow-lg shadow-white/5" : "text-neutral-400 hover:bg-white/5 hover:text-white"
         )}
      >
         {icon} {label}
         {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
      </button>
   )
}

function ActivityItem({ item, type }: { item: any, type: 'note' | 'flashcard' }) {
   return (
      <div className="flex items-center gap-4 bg-[#0A0A0A] border border-white/5 p-4 rounded-xl hover:bg-neutral-900/40 transition-colors group cursor-pointer">
         <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/5",
            type === 'note' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
         )}>
            {type === 'note' ? <FileText size={18} /> : <Layers size={18} />}
         </div>
         <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate pr-4">{item.videoTitle || "Untitled"}</h4>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                  {type === 'note' ? (item.model || "AI Note") : `${item.cardCount || 0} Cards`}
               </span>
               <span className="text-[10px] text-neutral-500">• {formatDate(item.createdAt)}</span>
            </div>
         </div>
         <ChevronRight size={14} className="text-neutral-600 group-hover:text-white transition-colors" />
      </div>
   )
}