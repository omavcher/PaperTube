"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  CreditCard, 
  Server, 
  Eye, 
  CheckCircle
} from "lucide-react";
import Footer from "@/components/Footer";

// --- Configuration ---
const SECURITY_HIGHLIGHTS = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "All data in transit is encrypted via SSL/TLS protocols."
  },
  {
    icon: Server,
    title: "Ephemeral Processing",
    desc: "Video data is processed in real-time and not permanently stored."
  },
  {
    icon: Eye,
    title: "No Data Selling",
    desc: "We never sell your personal information to third-party advertisers."
  }
];

export default function PrivacyClient() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-neutral-800 selection:text-white font-sans flex flex-col">
      
      {/* --- Background Atmosphere --- */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>
      
      {/* --- Main Content --- */}
      <main className="relative z-10 flex-grow w-full max-w-4xl mx-auto px-6 py-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            <Shield size={12} className="text-emerald-500" />
            Data Protection v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
            Privacy Policy
          </h1>
          
          <p className="text-lg text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
            Your trust is our currency. We are transparent about how we handle your data, your notes, and your payments.
          </p>
        </motion.div>

        {/* --- Razorpay Secure Badge (Prominent) --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16 p-1 rounded-3xl bg-gradient-to-r from-blue-600/20 via-neutral-800/50 to-emerald-600/20"
        >
          <div className="bg-black/80 backdrop-blur-xl rounded-[22px] p-8 md:p-10 border border-white/10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
               <CreditCard size={32} />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-bold text-white">100% Secure Payments via Razorpay</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We do not store your credit card or banking details. All transactions are processed through 
                <span className="text-white font-bold"> Razorpay&apos;s </span> 
                encrypted infrastructure, ensuring banking-grade security (PCI-DSS Compliant).
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[140px]">
               <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-2 rounded-lg justify-center">
                 <CheckCircle size={14} /> Verified
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider bg-neutral-900 px-3 py-2 rounded-lg justify-center border border-white/5">
                 <Lock size={14} /> Encrypted
               </div>
            </div>
          </div>
        </motion.div>

        {/* --- Core Pillars Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {SECURITY_HIGHLIGHTS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5 hover:bg-neutral-800/60 transition-colors"
            >
              <item.icon size={24} className="text-neutral-300 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* --- Detailed Policy Sections --- */}
        <div className="space-y-12 border-t border-white/5 pt-12">
          
          <PolicySection title="1. Information We Collect">
            <p>We collect minimal data necessary to function:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400 mt-2">
              <li><strong>Account Info:</strong> Name and email address for login.</li>
              <li><strong>Usage Data:</strong> YouTube links you paste (to generate notes).</li>
              <li><strong>Analytics:</strong> Anonymous page view data to improve site performance.</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. How We Use Your Data">
            <p>Your data is used strictly to:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400 mt-2">
              <li>Generate summaries and notes from video content.</li>
              <li>Provide access to your saved history and dashboard.</li>
              <li>Send critical account updates (e.g., password resets).</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Third-Party Sharing">
            <p>
              We do not sell data. We share data only with essential service providers:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400 mt-2">
              <li><strong>Razorpay:</strong> For processing payments securely.</li>
              <li><strong>Google Auth:</strong> For secure sign-in verification.</li>
              <li><strong>Cloud Providers:</strong> For hosting our AI models securely.</li>
            </ul>
          </PolicySection>

        </div>

        <div className="mt-20 text-center text-xs text-neutral-600 uppercase tracking-widest">
           Last Updated: February 2024 • Legal Team
        </div>

      </main>

      <Footer />
    </div>
  );
}

// Helper Component for consistency
const PolicySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="space-y-4">
    <h2 className="text-xl font-bold text-white flex items-center gap-3">
      <div className="w-1 h-6 bg-white/20 rounded-full"></div>
      {title}
    </h2>
    <div className="text-neutral-400 text-sm leading-relaxed pl-4">
      {children}
    </div>
  </section>
);