"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  IndianRupee, ArrowUpRight, ArrowDownRight, 
  Search, Filter, Download, 
  CheckCircle2, XCircle, Clock,
  TrendingUp, Activity, Receipt,
  Calendar, CreditCard, Coins, ShieldCheck, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";

// --- Types based on your API Response ---
interface Transaction {
  _id: string;
  paymentId: string;
  orderId: string;
  userId: string;
  packageId: string;
  packageName: string;
  packageType: 'subscription' | 'token';
  amount: number;
  status: string;
  userEmail: string;
  userName: string;
  timestamp: string;
}

export default function FinancialLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  // --- Fetch Data ---
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await api.get('/admin/transactions', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.data.success) {
          setTransactions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error("Failed to sync financial ledger");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, []);

  // --- Real-time Metrics Calculation ---
  const metrics = useMemo(() => {
    const totalTxns = transactions.length;
    const successfulTxns = transactions.filter(t => t.status === 'success');
    
    // 1. Gross Revenue (Sum of successful payments)
    const grossRevenue = successfulTxns.reduce((sum, t) => sum + t.amount, 0);
    
    // 2. Success Ratio
    const successRate = totalTxns > 0 ? (successfulTxns.length / totalTxns) * 100 : 0;
    
    // 3. Average Ticket Size
    const avgTicket = successfulTxns.length > 0 ? grossRevenue / successfulTxns.length : 0;

    return {
      grossRevenue,
      successRate: successRate.toFixed(1),
      avgTicket: avgTicket.toFixed(0)
    };
  }, [transactions]);

  // --- Filtering Logic ---
  const filteredTxns = useMemo(() => {
    return transactions.filter(txn => {
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = 
        (txn.userName || "").toLowerCase().includes(searchLower) || 
        (txn.userEmail || "").toLowerCase().includes(searchLower) ||
        (txn.paymentId || "").toLowerCase().includes(searchLower) ||
        (txn.packageName || "").toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "All" || txn.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const handleExport = () => {
    // Logic to convert `transactions` to CSV
    const csvContent = "data:text/csv;charset=utf-8," 
        + ["ID,User,Package,Amount,Status,Date"].join(",") + "\n" 
        + transactions.map(e => `${e.paymentId},${e.userEmail},${e.packageName},${e.amount},${e.status},${e.timestamp}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_ledger.csv");
    document.body.appendChild(link);
    link.click();
    
    toast.success("Ledger Exported Successfully");
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Financial_<span className="text-red-600 underline decoration-red-600/30 underline-offset-8">Ledger</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_emerald]" />
            Gateway: Razorpay_Secure_Link_Established
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="group flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-red-600/50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          <Download size={14} className="group-hover:-translate-y-1 transition-transform" /> Export_Data
        </button>
      </div>

      {/* --- Revenue HUD Grid (Real Data) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <FinanceCard 
   label="Gross Revenue" 
   val={`₹${Math.round(metrics.grossRevenue).toLocaleString()}`} 
   sub="Total Verified Volume" 
   icon={IndianRupee} 
   color="text-emerald-500" 
/>
         <FinanceCard 
            label="Success Ratio" 
            val={`${metrics.successRate}%`} 
            sub={`${transactions.length} Total Attempts`} 
            icon={Activity} 
            color="text-red-600" 
         />
         <FinanceCard 
            label="Avg Ticket" 
            val={`₹${metrics.avgTicket}`} 
            sub="Per User Spend" 
            icon={TrendingUp} 
            color="text-blue-500" 
         />
      </div>

      {/* --- Filter & Command Bar --- */}
      <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-600 transition-colors" size={16} />
            <Input 
              placeholder="Search User, Payment ID, or Package..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black border-white/5 h-16 pl-14 rounded-3xl focus:border-red-600/50 text-[10px] font-black uppercase tracking-widest text-white shadow-inner"
            />
         </div>
         
         <div className="flex bg-black border border-white/5 rounded-3xl p-1.5 gap-1">
            {["All", "Success", "Failed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                  statusFilter === status ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-neutral-600 hover:text-white"
                )}
              >
                {status}
              </button>
            ))}
         </div>
      </div>

      {/* --- Transaction Registry Table --- */}
      <div className="bg-black border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl border-t-0">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5">
                     <TableHead label="Reference ID" />
                     <TableHead label="Personnel" />
                     <TableHead label="Package Detail" />
                     <TableHead label="Amount" />
                     <TableHead label="Status" />
                     <TableHead label="Timestamp" />
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                       <tr>
                         <td colSpan={6} className="p-10 text-center text-neutral-500 text-xs font-mono uppercase animate-pulse">Syncing Ledger...</td>
                       </tr>
                    ) : filteredTxns.length === 0 ? (
                       <tr>
                         <td colSpan={6} className="p-10 text-center text-neutral-500 text-xs font-mono uppercase">No Transactions Found</td>
                       </tr>
                    ) : (
                      filteredTxns.map((txn) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={txn._id} 
                          className="group hover:bg-white/[0.02] transition-colors"
                        >
                           <td className="p-6">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono font-black text-white group-hover:text-red-500 transition-colors">
                                    {txn.paymentId?.split('_')[1] || "MANUAL"}
                                </span>
                                <span className="text-[8px] font-mono text-neutral-600">
                                    {txn.orderId?.slice(0, 15)}...
                                </span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-neutral-400">
                                    <User size={12} />
                                 </div>
                                 <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{txn.userName || "Unknown"}</p>
                                    <p className="text-[8px] text-neutral-500">{txn.userEmail}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn(
                                    "text-[8px] font-black uppercase italic border-white/10 rounded-lg py-1 px-2 gap-1",
                                    txn.packageType === 'token' ? "text-blue-400 bg-blue-500/5" : "text-purple-400 bg-purple-500/5"
                                )}>
                                   {txn.packageType === 'token' ? <Coins size={10} /> : <ShieldCheck size={10} />}
                                   {txn.packageName}
                                </Badge>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className="text-xs font-black text-white italic tracking-tighter">₹{txn.amount.toFixed(2)}</span>
                           </td>
                           <td className="p-6">
                              <StatusIndicator status={txn.status} />
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-2 text-[9px] font-black text-neutral-600 uppercase tracking-tighter">
                                 <Calendar size={12}/> 
                                 {new Date(txn.timestamp).toLocaleString('en-IN', { 
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                 })}
                              </div>
                           </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
         
         {/* Table Footer */}
         <div className="p-8 bg-white/[0.01] border-t border-white/5 text-center">
            <p className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.5em]">End of Ledger Sync // Total Indexed: {filteredTxns.length}</p>
         </div>
      </div>
    </div>
  );
}

// --- Specialized UI Components ---

function FinanceCard({ label, val, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-black border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/40 transition-all duration-500 shadow-xl">
       <div className="absolute -bottom-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 scale-150"><Icon size={120}/></div>
       <div className="relative z-10 flex flex-col h-full justify-between">
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-4">{label}</p>
          <div className="flex items-end justify-between">
             <h4 className="text-4xl font-black italic tracking-tighter text-white leading-none">{val}</h4>
             <span className={cn(
               "text-[9px] font-black px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1",
               color
             )}>
               <ArrowUpRight size={10}/>
               {sub}
             </span>
          </div>
       </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const s = status.toLowerCase();
  const configs: any = {
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-600/10", border: "border-red-600/20" },
    pending: { icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  };
  const config = configs[s] || configs.pending;
  const { icon: Icon, color, bg, border } = config;

  return (
    <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border", bg, border)}>
       <Icon size={10} className={color} />
       <span className={cn("text-[8px] font-black uppercase tracking-widest", color)}>{status}</span>
    </div>
  );
}

function TableHead({ label }: { label: string }) {
  return (
    <th className="p-6 text-[9px] font-black uppercase tracking-[0.4em] text-neutral-700 italic">
       {label}
    </th>
  );
}