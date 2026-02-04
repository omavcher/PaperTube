"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Share, 
  HelpCircle, 
  Bike, 
  Check, 
  ChevronDown, 
  MoreVertical, 
  RefreshCw,
  Share2,
  Copy
} from "lucide-react";

export default function UPIGenerator() {
  // --- State for Data ---
  const [formData, setFormData] = useState({
    app: "PhonePe", 
    name: "RAMESH NAYAK MUDAVAT",
    mobile: "9381978288",
    amount: "500",
    amountWords: "Five Hundred Only", // For Paytm
    time: "20 May 2023 at 10:58 AM",
    transId: "T2305201058366754628773",
    bankLast4: "8289",
    bankName: "HDFC Bank", // For Paytm
    utr: "350679646058",
  });

  // --- State for Dynamic Status Bar ---
  const [statusBar, setStatusBar] = useState({
    time: "10:58",
    network: "4G",
    battery: "100"
  });

  // --- Effects ---
  useEffect(() => {
    // 1. Set Random Network (4G or 5G)
    setStatusBar(prev => ({
      ...prev,
      network: Math.random() > 0.5 ? "5G" : "4G"
    }));

    // 2. Live Clock Function
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      // Format 12-hour clock for PhonePe/GPay status bar
      // (PhonePe usually just shows HH:MM in top bar)
      const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
      
      setStatusBar(prev => ({ ...prev, time: formattedTime }));
    };

    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000 * 60); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Render Helpers ---
  const renderStatusBar = (theme: "dark" | "light") => (
    <div className={`flex justify-between px-4 py-2 text-[12px] font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>
      <span>{statusBar.time}</span>
      <div className="flex gap-1.5 items-center">
        <span className="text-[10px]">VoLTE</span>
        <span>{statusBar.network}</span>
        <div className={`h-2.5 w-5 rounded-sm border ${theme === "dark" ? "border-gray-400" : "border-gray-600"} flex items-center px-0.5`}>
            <div className={`h-1.5 w-full ${theme === "dark" ? "bg-gray-300" : "bg-gray-800"}`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-900 md:p-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
        
        {/* --- LEFT COLUMN: Configuration --- */}
        <div className="rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
          <h1 className="mb-6 text-2xl font-bold text-gray-800 flex items-center gap-2">
            <RefreshCw className="text-blue-600"/> UPI Screenshot Gen
          </h1>
          
          <div className="space-y-5">
            {/* App Selector */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Select Application</label>
              <div className="grid grid-cols-3 gap-2">
                {["PhonePe", "Paytm", "GPay"].map((app) => (
                  <button
                    key={app}
                    onClick={() => setFormData({...formData, app})}
                    className={`rounded-lg border py-3 text-sm font-semibold transition-all ${
                      formData.app === app 
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200" 
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="input-label">Receiver Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="input-label">Mobile / UPI ID</label>
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="input-label">Amount (₹)</label>
                <input type="text" name="amount" value={formData.amount} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="input-label">Date & Time</label>
                <input type="text" name="time" value={formData.time} onChange={handleChange} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Transaction ID / Ref ID</label>
                <input type="text" name="transId" value={formData.transId} onChange={handleChange} className="input-field" />
              </div>
              
              {/* Conditional Inputs based on App */}
              {formData.app === "Paytm" && (
                <div className="md:col-span-2">
                   <label className="input-label">Amount in Words</label>
                   <input type="text" name="amountWords" value={formData.amountWords} onChange={handleChange} className="input-field" />
                </div>
              )}
               {formData.app === "Paytm" && (
                <div>
                   <label className="input-label">Bank Name</label>
                   <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="input-field" />
                </div>
              )}

              <div>
                <label className="input-label">Bank Last 4 Digits</label>
                <input type="text" name="bankLast4" value={formData.bankLast4} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="input-label">UTR Number</label>
                <input type="text" name="utr" value={formData.utr} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="mt-4 rounded bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              ⚠️ <strong>Disclaimer:</strong> This tool is for UI design & testing only. Misuse for fraud is illegal.
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Live Preview --- */}
        <div className="flex items-start justify-center bg-gray-200/50 p-8 rounded-3xl border-4 border-dashed border-gray-300 min-h-[900px]">
          
          {/* ================= PHONEPE PREVIEW ================= */}
          {formData.app === "PhonePe" && (
            <div className="relative h-[800px] w-[375px] overflow-hidden bg-[#16151f] font-sans text-white shadow-2xl ring-8 ring-black rounded-[30px]">
              {renderStatusBar("dark")}

              {/* Header */}
              <div className="bg-[#4aae58] px-4 pb-4 pt-2">
                <div className="mb-4 flex items-center justify-between">
                  <ArrowLeft className="h-6 w-6 text-white" />
                  <div className="text-center">
                    <h2 className="text-lg font-bold leading-tight">Transaction Successful</h2>
                    <p className="text-[11px] opacity-90">{formData.time}</p>
                  </div>
                  <div className="flex gap-4">
                     <span className="text-sm font-medium">Help</span> 
                     <Share className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3 px-3 py-4">
                {/* Trans ID */}
                <div className="rounded-xl bg-[#1f1e2e] p-4 shadow-sm">
                  <div className="mb-1 text-xs text-gray-400">Transaction ID</div>
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] tracking-wide text-gray-200">{formData.transId}</div>
                    <Copy className="h-4 w-4 text-[#8b89c6]" />
                  </div>
                </div>

                {/* Paid To */}
                <div className="rounded-xl bg-[#1f1e2e] p-4 shadow-sm">
                  <div className="mb-3 text-sm font-medium text-gray-200">Paid to</div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5f259f] text-xl font-bold text-white">
                        <span className="uppercase">{formData.name.charAt(0)}</span>
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                           <div className="h-3 w-3 rounded-full bg-[#5f259f]"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold uppercase text-gray-100">{formData.name}</h3>
                        <p className="text-sm text-gray-400">{formData.mobile}</p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white">₹ {formData.amount}</div>
                  </div>
                </div>

                {/* Debited From */}
                <div className="rounded-xl bg-[#1f1e2e] p-4 shadow-sm">
                  <div className="mb-3 text-sm font-medium text-gray-200">Debited from</div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-black text-[10px] font-bold border border-gray-200">
                          BANK
                       </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-100">XXXXXXXX{formData.bankLast4}</h3>
                        <p className="text-xs text-gray-400">UTR: {formData.utr}</p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white">₹ {formData.amount}</div>
                  </div>
                </div>

                {/* Footer Branding */}
                <div className="mt-12 flex flex-col items-center justify-center opacity-70">
                  <div className="text-[10px] text-gray-400">Powered by</div>
                  <div className="mt-1 flex items-center gap-2">
                     <span className="text-lg font-bold italic tracking-tighter text-gray-400">UPI</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PAYTM PREVIEW ================= */}
          {formData.app === "Paytm" && (
            <div className="relative h-[800px] w-[375px] overflow-hidden bg-[#f5f7fa] font-sans text-gray-900 shadow-2xl ring-8 ring-black rounded-[30px]">
               {renderStatusBar("light")}

               {/* Paytm Header */}
               <div className="flex flex-col items-center pt-4 pb-4 bg-white">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-2xl font-bold text-[#00b9f5] tracking-tight">Paytm</span>
                  </div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-gray-800">Payment Receipt</div>
               </div>

               {/* Blue Success Card */}
               <div className="mx-4 mt-2 rounded-t-xl bg-[#e8f6fd] p-6 text-center border-b-4 border-[#00b9f5]">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Successful</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-black">₹{formData.amount}</span>
                    <div className="bg-[#00b9f5] rounded-full p-1">
                      <Check className="w-3 h-3 text-white stroke-[4]" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Rupees {formData.amountWords}</p>
               </div>

               {/* Receipt Details */}
               <div className="mx-4 bg-white px-5 py-6 shadow-sm rounded-b-xl relative">
                  {/* Jagged Edge Effect (CSS approximation) */}
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white" style={{clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"}}></div>

                  <div className="space-y-6">
                    {/* To */}
                    <div>
                       <div className="flex justify-between items-start">
                          <span className="text-sm font-bold text-gray-900">To: {formData.name}</span>
                          <div className="h-8 w-8 rounded-full bg-gray-100"></div>
                       </div>
                    </div>

                    <div className="border-t border-dashed border-gray-300"></div>

                    {/* From */}
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="text-sm font-bold text-gray-900">From: You</div>
                          <div className="text-xs text-gray-500 mt-0.5">{formData.bankName} - {formData.bankLast4}</div>
                       </div>
                       <div className="h-6 w-8 border border-gray-200 flex items-center justify-center p-0.5">
                          {/* Bank Logo Placeholder */}
                          <div className="text-[6px] font-bold text-red-600">BANK</div>
                       </div>
                    </div>

                    {/* Ref ID & Time */}
                    <div className="text-xs text-gray-500 space-y-1 mt-4">
                       <p><span className="font-medium text-gray-600">UPI Ref ID:</span> {formData.transId.substring(0, 12)}</p>
                       <p>{formData.time}</p>
                    </div>
                  </div>
               </div>

               {/* Bottom Security */}
               <div className="absolute bottom-8 w-full text-center">
                  <div className="flex items-center justify-center gap-2 mb-4 text-[#00b9f5]">
                     <div className="border-2 border-[#00b9f5] rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                     </div>
                     <span className="text-xs font-bold text-[#1d2f50]">100% SECURE PAYMENTS</span>
                  </div>
                  <div className="opacity-60 flex flex-col items-center">
                     <span className="text-[8px] text-gray-500 uppercase tracking-widest">Powered by</span>
                     <span className="text-sm font-bold italic text-gray-400">UPI</span>
                  </div>
               </div>
            </div>
          )}

          {/* ================= GPAY PREVIEW ================= */}
          {formData.app === "GPay" && (
            <div className="relative h-[800px] w-[375px] overflow-hidden bg-white font-sans text-gray-900 shadow-2xl ring-8 ring-black rounded-[30px]">
              {renderStatusBar("light")}
              
              {/* Navbar */}
              <div className="flex items-center justify-between px-4 py-3">
                 <ArrowLeft className="text-gray-600 w-6 h-6" />
                 <div className="flex gap-4">
                    <RefreshCw className="text-gray-600 w-5 h-5" />
                    <MoreVertical className="text-gray-600 w-5 h-5" />
                 </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-col items-center mt-8 px-6">
                 {/* Logo/Icon */}
                 <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                    <Check className="text-white w-10 h-10 stroke-[3]" />
                 </div>

                 <h2 className="text-3xl font-normal text-gray-900 mb-1">₹{formData.amount}</h2>
                 
                 <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-medium mb-8">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Paid to {formData.name}
                 </div>

                 {/* Details Card */}
                 <div className="w-full border border-gray-200 rounded-xl p-5 space-y-5 bg-white shadow-sm">
                    
                    {/* Paid to */}
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {formData.name.charAt(0)}
                       </div>
                       <div>
                          <div className="text-sm font-medium text-gray-900">Paid to</div>
                          <div className="text-sm text-gray-600">{formData.name}</div>
                          <div className="text-xs text-gray-500">{formData.mobile}</div>
                       </div>
                    </div>
                    
                    <div className="h-px bg-gray-100 w-full"></div>

                    {/* Banking Info */}
                    <div>
                       <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900">HDFC Bank ••••{formData.bankLast4}</span>
                          <span className="text-xs font-medium text-gray-900">₹{formData.amount}</span>
                       </div>
                       <div className="text-[11px] text-gray-500">UPI transaction ID: {formData.transId}</div>
                    </div>
                    
                    <div className="h-px bg-gray-100 w-full"></div>

                    {/* Time */}
                    <div className="text-[11px] text-gray-500">
                       {formData.time}
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="flex gap-3 mt-6 w-full">
                    <button className="flex-1 border border-gray-300 rounded-full py-2 text-sm font-medium text-blue-700 flex items-center justify-center gap-2">
                       <Share2 className="w-4 h-4" /> Share receipt
                    </button>
                 </div>
              </div>

               {/* GPay Footer */}
               <div className="absolute bottom-6 w-full text-center">
                  <div className="text-[10px] text-gray-400">Powered by UPI</div>
               </div>
            </div>
          )}

        </div>
      </div>

      <style jsx global>{`
        .input-label {
          @apply mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide;
        }
        .input-field {
          @apply w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm font-medium text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all;
        }
      `}</style>
    </div>
  );
}