"use client";

import React, { useState, useMemo } from "react";
import { 
  IndianRupee, ArrowUpRight, ArrowDownRight, 
  Search, Filter, Download, 
  CheckCircle2, XCircle, Clock,
  TrendingUp, Activity, Receipt,
  Calendar, CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- Mock Transaction Registry ---
const MOCK_TRANSACTIONS = [
  { id: "TXN_84920", user: "omawchar07@gmail.com", plan: "Pro Scholar", amount: 299, status: "Success", date: "2026-01-04 14:20" },
  { id: "TXN_84919", user: "john@edu.com", plan: "Scholar", amount: 149, status: "Success", date: "2026-01-04 12:05" },
  { id: "TXN_84918", user: "alpha@neural.io", plan: "Power Institute", amount: 599, status: "Failed", date: "2026-01-03 22:15" },
  { id: "TXN_84917", user: "guest_99@gmail.com", plan: "Pro Scholar", amount: 299, status: "Pending", date: "2026-01-03 18:40" },
  { id: "TXN_84916", user: "dev_test@gmail.com", plan: "Scholar", amount: 149, status: "Success", date: "2026-01-03 09:10" },
];

export default function FinancialLedger() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- Tactical Logic ---
  const filteredTxns = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(txn => {
      const matchesSearch = txn.user.toLowerCase().includes(searchQuery.toLowerCase()) || txn.id.includes(searchQuery);
      const matchesStatus = statusFilter === "All" || txn.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleExport = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: 'Compiling financial logs...',
      success: 'LEDGER_EXPORT_COMPLETE.CSV',
      error: 'Export failed: Sync timeout',
    });
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

      {/* --- Revenue HUD Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <FinanceCard label="Gross Revenue" val="₹1,24,500" trend="+18.4%" icon={IndianRupee} color="text-emerald-500" />
         <FinanceCard label="Success Ratio" val="94.2%" trend="-2.1%" icon={Activity} color="text-red-600" />
         <FinanceCard label="Avg Ticket" val="₹284" trend="+5.2%" icon={TrendingUp} color="text-blue-500" />
      </div>

      {/* --- Filter & Command Bar --- */}
      <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-600 transition-colors" size={16} />
            <Input 
              placeholder="Search Personnel or TXN_REF..." 
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
                     <TableHead label="Reference" />
                     <TableHead label="Personnel" />
                     <TableHead label="Tier" />
                     <TableHead label="Amount" />
                     <TableHead label="Status" />
                     <TableHead label="Timestamp" />
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                  <AnimatePresence mode="popLayout">
                    {filteredTxns.map((txn) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={txn.id} 
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                         <td className="p-6">
                            <span className="text-[10px] font-mono font-black text-neutral-500 group-hover:text-red-500 transition-colors">{txn.id}</span>
                         </td>
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-neutral-400">
                                  {txn.user.substring(0,2).toUpperCase()}
                               </div>
                               <p className="text-[10px] font-black text-white uppercase tracking-widest">{txn.user}</p>
                            </div>
                         </td>
                         <td className="p-6">
                            <Badge variant="outline" className="text-[8px] font-black uppercase italic border-white/10 text-neutral-500 rounded-lg py-1">
                               {txn.plan}
                            </Badge>
                         </td>
                         <td className="p-6">
                            <span className="text-xs font-black text-white italic tracking-tighter">₹{txn.amount}</span>
                         </td>
                         <td className="p-6">
                            <StatusIndicator status={txn.status} />
                         </td>
                         <td className="p-6">
                            <div className="flex items-center gap-2 text-[9px] font-black text-neutral-600 uppercase tracking-tighter">
                               <Calendar size={12}/> {txn.date}
                            </div>
                         </td>
                      </motion.tr>
                    ))}
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

function FinanceCard({ label, val, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-black border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/40 transition-all duration-500 shadow-xl">
       <div className="absolute -bottom-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 scale-150"><Icon size={120}/></div>
       <div className="relative z-10 flex flex-col h-full justify-between">
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-4">{label}</p>
          <div className="flex items-end justify-between">
             <h4 className="text-4xl font-black italic tracking-tighter text-white leading-none">{val}</h4>
             <span className={cn(
               "text-[9px] font-black px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1",
               trend.startsWith('+') ? "text-emerald-500" : "text-red-600"
             )}>
               {trend.startsWith('+') ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
               {trend}
             </span>
          </div>
       </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const configs: any = {
    Success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-600/10", border: "border-red-600/20" },
    Pending: { icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  };
  const { icon: Icon, color, bg, border } = configs[status];

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