"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, ArrowUpRight, Search, Download, 
  CheckCircle2, XCircle, Clock, TrendingUp, Activity, 
  Receipt, Calendar, Coins, ShieldCheck, User, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";

// --- Types based on API Response ---
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

const getAdminToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";

export default function FinancialLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Fetch Data ---
  const fetchTransactionData = async (showSync = false) => {
    try {
      if (showSync) setIsRefreshing(true);
      else setLoading(true);
      
      const token = getAdminToken();
      const response = await api.get('/admin/transactions', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.data.success) {
        setTransactions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Failed to sync financial ledger");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
  }, []);

  // --- Real-time Metrics Calculation ---
  const metrics = useMemo(() => {
    const totalTxns = transactions.length;
    const successfulTxns = transactions.filter(t => t.status === 'success');
    
    // 1. Gross Revenue
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

  // --- Dynamic Sparkline Generation ---
  const revenueSparkline = useMemo(() => {
    const sorted = [...transactions]
      .filter(t => t.status === 'success')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (sorted.length === 0) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    let runningTotal = 0;
    const totals = sorted.map(t => {
      runningTotal += t.amount;
      return runningTotal;
    });
    
    if (totals.length < 10) {
      const pad = Array(10 - totals.length).fill(0);
      return [...pad, ...totals];
    }
    
    const step = Math.floor(totals.length / 10) || 1;
    const downsampled = [];
    for (let i = 0; i < 10; i++) {
      downsampled.push(totals[Math.min(i * step, totals.length - 1)]);
    }
    return downsampled;
  }, [transactions]);

  // --- Filtering Logic ---
  const filteredTxns = useMemo(() => {
    return transactions.filter(txn => {
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = 
        (txn.userName || "").toLowerCase().includes(searchLower) || 
        (txn.userEmail || "").toLowerCase().includes(searchLower) ||
        (txn.paymentId || "").toLowerCase().includes(searchLower) ||
        (txn.packageName || "").toLowerCase().includes(searchLower) ||
        (txn._id || "").toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "All" || txn.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        const headers = ["Transaction ID", "Stripe Payment ID", "User Name", "User Email", "Package Name", "Package Type", "Amount", "Status", "Timestamp"];
        const rows = transactions.map(t => [
          t._id,
          t.paymentId || "MANUAL",
          t.userName || "Unknown",
          t.userEmail || "",
          t.packageName || "",
          t.packageType || "",
          t.amount,
          t.status,
          t.timestamp
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(",")].concat(rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Ledger Exported Successfully");
      } catch (err) {
        console.error("Export failed:", err);
        toast.error("Failed to generate ledger export");
      } finally {
        setIsExporting(false);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-20">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-purple-400 bg-purple-500/5 border border-purple-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Ledger Node
            </span>
            <span className="text-[9px] font-mono text-neutral-500">
              GATEWAY_VERIFIED: SECURE
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
            Financial_<span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Ledger</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]" />
              Stripe_Secure_Link
            </p>
            <span className="text-neutral-800 text-[9px] font-mono hidden xs:inline">|</span>
            <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1.5">
              <span className="h-1 w-1 bg-emerald-400 rounded-full animate-ping" />
              Webhook: Active_Handshake_Verified
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <button 
            onClick={() => fetchTransactionData(true)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={cn("text-neutral-500", isRefreshing && "animate-spin text-red-500")} />
            {isRefreshing ? "SYNCING..." : "SYNC NOW"}
          </button>
          
          <button 
            onClick={handleExport}
            disabled={isExporting || transactions.length === 0}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-white hover:border-red-500/20 rounded-xl transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw size={12} className="animate-spin text-red-500" />
                EXPORTING...
              </>
            ) : (
              <>
                <Download size={12} />
                EXPORT_DATA
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- Revenue HUD Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <HUDCard 
          label="Gross Revenue" 
          value={`$${Math.round(metrics.grossRevenue).toLocaleString()}`}
          sub="Total Verified Volume"
          icon={DollarSign}
          color="emerald" 
          sparklineData={revenueSparkline}
        />
        
        <HUDCard 
          label="Success Ratio" 
          value={`${metrics.successRate}%`} 
          sub={`${transactions.length} Total Attempts`} 
          icon={Activity} 
          color="purple" 
          circularProgress={parseFloat(metrics.successRate)}
        />
        
        <HUDCard 
          label="Average Ticket" 
          value={`$${metrics.avgTicket}`} 
          sub="Per User Spend" 
          icon={TrendingUp} 
          color="blue" 
        />
      </div>

      {/* --- Filter & Command Bar --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
          <input 
            placeholder="FILTER LEDGER BY EMAIL, PAYMENT ID, OR PRODUCT..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950/80 border border-neutral-900 rounded-xl py-3.5 pl-11 pr-10 text-[10px] font-mono text-white placeholder:text-neutral-700 focus:border-red-500/20 focus:outline-none transition-all shadow-inner focus:shadow-[0_0_12px_rgba(239,68,68,0.02)]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
        
        <div className="flex bg-neutral-950 border border-neutral-900 rounded-xl p-1 gap-1 shrink-0 relative">
          {["All", "Success", "Failed"].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="px-5 py-2 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all relative z-10 whitespace-nowrap min-w-[80px]"
                style={{ color: isActive ? '#fff' : '#666' }}
              >
                {status}
                {isActive && (
                  <motion.div
                    layoutId="activeFilterOutline"
                    className="absolute inset-0 bg-red-500/5 border border-red-500/20 rounded-lg -z-10 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Transaction Registry Table --- */}
      <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl overflow-hidden backdrop-blur-md">
         
         {/* Desktop Table View */}
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
               <thead>
                  <tr className="border-b border-neutral-900 bg-neutral-950/60">
                     <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Reference ID</th>
                     <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Personnel</th>
                     <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Package Detail</th>
                     <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Amount</th>
                     <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Status</th>
                     <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Timestamp</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-neutral-900/60">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                       <tr>
                         <td colSpan={6} className="px-6 py-10 text-center text-neutral-500 text-[10px] uppercase tracking-widest animate-pulse">Syncing Ledger...</td>
                       </tr>
                    ) : filteredTxns.length === 0 ? (
                       <tr>
                         <td colSpan={6} className="px-6 py-10 text-center text-neutral-650 text-[10px] uppercase tracking-widest">No Transactions Found</td>
                       </tr>
                    ) : (
                      filteredTxns.map((txn) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={txn._id} 
                          className="group hover:bg-neutral-950 transition-colors cursor-default"
                        >
                           {/* Reference ID */}
                           <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[10px] font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                                    <Receipt size={11} className="text-neutral-500" />
                                    {txn.paymentId ? (txn.paymentId.startsWith("pi_") ? txn.paymentId.substring(0, 14) + "..." : txn.paymentId) : "MANUAL_OP"}
                                 </span>
                                 <span className="text-[8px] text-neutral-605 select-all">
                                    ID: {txn._id}
                                 </span>
                              </div>
                           </td>
                           
                           {/* Personnel */}
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-inner">
                                    {txn.userName ? txn.userName.charAt(0).toUpperCase() : (txn.userEmail ? txn.userEmail.charAt(0).toUpperCase() : <User size={10} />)}
                                 </div>
                                 <div className="flex flex-col min-w-0">
                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[150px]">{txn.userName || "Unknown Node"}</p>
                                    <p className="text-[8px] text-neutral-500 truncate max-w-[150px]">{txn.userEmail}</p>
                                 </div>
                              </div>
                           </td>
                           
                           {/* Package Detail */}
                           <td className="px-6 py-4">
                              <div className="flex items-center">
                                 <span className={cn(
                                     "text-[8px] font-bold uppercase tracking-wider rounded border py-1 px-2.5 flex items-center gap-1.5 shrink-0",
                                     txn.packageType === 'token' 
                                      ? "text-blue-400 bg-blue-500/5 border-blue-500/10" 
                                      : "text-purple-400 bg-purple-500/5 border-purple-500/10"
                                 )}>
                                    {txn.packageType === 'token' ? <Coins size={9} /> : <ShieldCheck size={9} />}
                                    {txn.packageName}
                                 </span>
                              </div>
                           </td>
                           
                           {/* Amount */}
                           <td className="px-6 py-4">
                              <span className="text-[11px] font-bold text-white italic tracking-tighter">${txn.amount.toFixed(2)}</span>
                           </td>
                           
                           {/* Status */}
                           <td className="px-6 py-4">
                              <StatusIndicator status={txn.status} />
                           </td>
                           
                           {/* Timestamp */}
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-[9px] font-bold text-neutral-500 uppercase tracking-tighter">
                                 <Calendar size={12} className="text-neutral-605"/> 
                                 {new Date(txn.timestamp).toLocaleString('en-US', { 
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

         {/* Mobile Card View */}
         <div className="md:hidden divide-y divide-neutral-900/60 bg-neutral-950/20">
            {loading ? (
               <div className="p-10 text-center text-neutral-500 text-[10px] font-mono uppercase tracking-widest animate-pulse">Syncing Ledger...</div>
            ) : filteredTxns.length === 0 ? (
               <div className="p-10 text-center text-neutral-600 text-[10px] font-mono uppercase tracking-widest">No Transactions Found</div>
            ) : (
               filteredTxns.map((txn) => (
                  <div key={txn._id} className="p-5 space-y-4">
                     <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 min-w-0">
                           <span className="text-[10px] font-mono font-bold text-white break-all flex items-center gap-1.5">
                              <Receipt size={10} className="text-neutral-500 shrink-0" />
                              {txn.paymentId || "MANUAL_OP"}
                           </span>
                           <p className="text-[8px] font-mono text-neutral-600 break-all select-all">
                              ID: {txn._id}
                           </p>
                        </div>
                        <StatusIndicator status={txn.status} />
                     </div>
                     
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                           {txn.userName ? txn.userName.charAt(0).toUpperCase() : (txn.userEmail ? txn.userEmail.charAt(0).toUpperCase() : <User size={10} />)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{txn.userName || "Unknown Node"}</p>
                           <p className="text-[8px] text-neutral-500 truncate">{txn.userEmail}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-white italic tracking-tighter shrink-0">${txn.amount.toFixed(2)}</span>
                     </div>

                     <div className="flex items-center justify-between pt-3 border-t border-neutral-900/60">
                        <span className={cn(
                            "text-[8px] font-mono font-bold uppercase tracking-wider rounded border py-0.5 px-2 flex items-center gap-1 shrink-0",
                            txn.packageType === 'token' 
                              ? "text-blue-400 bg-blue-500/5 border-blue-500/10" 
                              : "text-purple-400 bg-purple-500/5 border-purple-500/10"
                        )}>
                           {txn.packageType === 'token' ? <Coins size={8} /> : <ShieldCheck size={8} />}
                           {txn.packageName}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-[8px] font-mono text-neutral-500 uppercase tracking-tighter">
                           <Calendar size={10} className="text-neutral-600" /> 
                           {new Date(txn.timestamp).toLocaleString('en-US', { 
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                           })}
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
         
         {/* Table Footer */}
         <div className="p-6 bg-neutral-950/60 border-t border-neutral-900/65 text-center">
            <p className="text-[8px] font-mono font-black text-neutral-600 uppercase tracking-[0.3em]">
              End of Ledger Sync // Total Indexed: {filteredTxns.length}
            </p>
         </div>
      </div>
    </div>
  );
}

// --- Specialized UI Components ---

interface HUDCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: any;
  color: "emerald" | "purple" | "blue";
  sparklineData?: number[];
  circularProgress?: number;
}

function HUDCard({ label, value, sub, icon: Icon, color, sparklineData, circularProgress }: HUDCardProps) {
  let hoverBorder = "hover:border-red-500/40";
  let textColor = "text-red-400";
  let strokeColor = "#ef4444";
  
  if (color === "emerald") {
    hoverBorder = "hover:border-emerald-500/45";
    textColor = "text-emerald-400";
    strokeColor = "#10b981";
  } else if (color === "blue") {
    hoverBorder = "hover:border-blue-500/45";
    textColor = "text-blue-400";
    strokeColor = "#3b82f6";
  } else if (color === "purple") {
    hoverBorder = "hover:border-purple-500/45";
    textColor = "text-purple-400";
    strokeColor = "#a855f7";
  }

  // Draw sparkline SVG coordinates
  let fillPoints = "";
  let points = "";
  const width = 140;
  const height = 40;
  
  if (sparklineData && sparklineData.length > 1) {
    const minVal = Math.min(...sparklineData);
    const maxVal = Math.max(...sparklineData);
    const range = maxVal - minVal || 1;
    
    points = sparklineData.map((val: number, i: number) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 8) - 4;
      return `${x},${y}`;
    }).join(" ");
    
    fillPoints = `0,${height} ${points} ${width},${height}`;
  }

  return (
    <div className={cn(
      "bg-neutral-950/40 border border-neutral-900 p-6 rounded-[2rem] relative overflow-hidden group transition-all duration-300 shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[145px]",
      hoverBorder
    )}>
      {/* Background SVG Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="absolute bottom-0 right-0 h-14 w-36 opacity-20 group-hover:opacity-35 transition-opacity">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`glow-card-tx-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={fillPoints} fill={`url(#glow-card-tx-${color})`} />
            <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Decorative Glow */}
      <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full filter blur-[30px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none" style={{ backgroundColor: strokeColor }} />

      <div className="flex items-start justify-between relative z-10 gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-[0.25em] mb-1.5">{label}</p>
          <h4 className="text-3xl font-mono font-black italic tracking-tight text-white leading-none truncate">
            {value}
          </h4>
        </div>
        
        {circularProgress !== undefined ? (
          <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-neutral-900" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-purple-500" strokeDasharray={`${circularProgress}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-[8px] font-mono font-black text-white">{Math.round(circularProgress)}%</span>
          </div>
        ) : (
          <div className={cn("p-2 rounded-xl bg-neutral-900 border border-neutral-850 shrink-0", textColor)}>
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="mt-5 pt-2.5 border-t border-neutral-900/40 flex items-center justify-between relative z-10">
        <span className="text-[8px] font-mono text-neutral-500 tracking-tight flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {sub}
        </span>
        
        {color === "blue" && (
          <span className="text-[7px] font-mono font-bold text-blue-400 bg-blue-500/5 border border-blue-500/15 px-1.5 py-0.5 rounded uppercase">
            EST. VOLATILITY: LOW
          </span>
        )}
        {color === "emerald" && (
          <span className="text-[7px] font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
            <ArrowUpRight size={8} /> +9.2%
          </span>
        )}
        {color === "purple" && (
          <span className="text-[7px] font-mono font-bold text-purple-400 bg-purple-500/5 border border-purple-500/15 px-1.5 py-0.5 rounded uppercase">
            TARGET: &gt;95%
          </span>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const s = status.toLowerCase();
  const configs: any = {
    success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
    failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/10" },
    pending: { icon: Clock, color: "text-orange-400", bg: "bg-orange-500/5", border: "border-orange-500/10" },
  };
  const config = configs[s] || configs.pending;
  const { icon: Icon, color, bg, border } = config;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[8px] font-bold uppercase tracking-wider shrink-0", bg, border, color)}>
       <Icon size={9} />
       <span>{status}</span>
    </span>
  );
}