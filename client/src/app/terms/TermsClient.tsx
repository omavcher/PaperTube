"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import {
  Gamepad2,
  Check,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Configuration ---
const FEATURES = [
  { 
    label: "AI Suite", 
    value: "20+ Tools", 
    desc: "For productivity & study",
    icon: LayoutGrid 
  },
  { 
    label: "Gamified Learning", 
    value: "10+ Games", 
    desc: "Educational & fun",
    icon: Gamepad2 
  },
  { 
    label: "Core Feature", 
    value: "Note Gen", 
    desc: "YouTube to Notes AI",
    icon: Youtube 
  }
];

const TERMS_DATA = [
  {
    id: "intro",
    title: "1. Business Identity & Acceptance of Terms",
    content: [
      "Welcome to Paperxify (the 'Platform'), an AI-powered educational technology Software-as-a-Service (SaaS) platform owned and operated by Om Eknath Avchar ('Company', 'we', 'us', or 'our'), located in Maharashtra, India.",
      "By accessing or using Paperxify, registering an account, or purchasing any subscription, you agree to be bound by these Terms of Service, our Privacy Policy, Cancellation & Refund Policy, and Shipping & Delivery Policy.",
      "If you do not agree with any part of these terms, please discontinue use of our services immediately."
    ]
  },
  {
    id: "services",
    title: "2. Services & Digital Products Provided",
    content: [
      "Paperxify provides cloud-based digital study tools, including automated video lecture transcription, AI study notes generation, interactive PaperChat AI tutoring, automated quiz and flashcard creation, and AI presentation slide generation.",
      "Our services are delivered electronically across free and paid subscription tiers (Pro Scholar and Power Scholar).",
      "We continually maintain and enhance our AI algorithms to provide accurate educational summaries, though AI output should be used as an academic aid and verified by students for critical academic work."
    ]
  },
  {
    id: "subscriptions",
    title: "3. Subscriptions, Pricing & Payment Terms",
    content: [
      "Pricing for Paperxify paid tiers (Pro Scholar at ₹799/month or ₹6,999/year; Power Scholar at ₹1,599/month or ₹12,999/year, and corresponding USD tiers for global users) is transparently listed on our Pricing page.",
      "Payments are securely processed via certified, PCI-DSS and RBI compliant payment gateways (Razorpay, PayPal, LemonSqueezy). We never store your full credit card or banking credentials on our servers.",
      "Monthly subscriptions automatically renew every 30 days unless cancelled before the renewal date. Annual plans provide 365 days of access.",
      "Taxes, including 18% GST for Indian customers, are computed and clearly itemized at checkout."
    ]
  },
  {
    id: "cancellation_refund",
    title: "4. Cancellation & Refund Policy",
    content: [
      "You may cancel your subscription at any time directly through your user Profile dashboard. Access remains active until the end of your prepaid period.",
      "We provide a 7-day money-back guarantee for initial purchases. Approved refunds are credited to the original payment source (UPI, Card, Bank) within 5 to 7 business working days.",
      "For complete terms, please review our standalone Cancellation & Refund Policy."
    ]
  },
  {
    id: "delivery",
    title: "5. Digital Delivery Policy",
    content: [
      "All services and subscription capacities are digital goods and delivered electronically. Upon successful payment verification, your user account is credited immediately (within 0–5 minutes).",
      "No physical shipping or delivery is required. Invoices and receipts are transmitted electronically via email."
    ]
  },
  {
    id: "account",
    title: "6. User Accounts & Fair Usage",
    content: [
      "You are responsible for safeguarding your login credentials and for all activities under your account.",
      "You agree not to exploit our platform for abusive scraping, automated reverse-engineering, security probing, or violating third-party intellectual property rights.",
      "We reserve the right to suspend accounts that engage in fraudulent activities, payment chargeback abuse, or malicious system manipulation."
    ]
  },
  {
    id: "ownership",
    title: "7. Intellectual Property & Ownership",
    content: [
      "You retain full ownership of all original study documents, notes, and materials you upload or generate on the Platform.",
      "All platform software, branding, UI designs, and proprietary AI algorithms are the exclusive intellectual property of Paperxify and Om Eknath Avchar.",
      "You may export and use your generated study notes for personal educational or professional academic purposes."
    ]
  },
  {
    id: "governing_law",
    title: "8. Governing Law & Dispute Resolution",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of India.",
      "Any dispute, controversy, or claim arising out of or relating to your use of Paperxify or payments made on the platform shall be subject to the exclusive jurisdiction of the competent courts in Maharashtra, India."
    ]
  },
  {
    id: "contact_grievance",
    title: "9. Grievance Officer & Contact Information",
    content: [
      "In accordance with the Information Technology Act 2000 and consumer protection guidelines, if you have any questions, legal concerns, or payment disputes, contact our Grievance Officer:",
      "Name: Om Eknath Avchar | Platform: Paperxify | Operational Address: Maharashtra, India",
      "Email: support@paperxify.com or omawchar07@gmail.com | Hours: Monday to Saturday, 9:00 AM – 7:00 PM IST"
    ]
  }
];

export default function TermsClient() {
  const [expandedSection, setExpandedSection] = useState<string | null>("intro");

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neutral-800 selection:text-white flex flex-col">
      
      {/* Background Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>

      <main className="relative z-10 flex-grow w-full max-w-5xl mx-auto px-6 py-20">
        
        {/* --- Header Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            Updated Feb 2024
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
            Terms of Service
          </h1>
          
          <p className="max-w-xl mx-auto text-lg text-neutral-400 font-light leading-relaxed">
            Simple, transparent rules for using our ecosystem of tools and games.
          </p>
        </motion.div>

        {/* --- Feature Highlights --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16"
        >
          {FEATURES.map((feat, idx) => (
            <div key={idx} className="bg-neutral-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors group">
              <div className="p-3 bg-black rounded-xl text-neutral-400 group-hover:text-white transition-colors border border-white/5">
                <feat.icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{feat.value}</h3>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{feat.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* --- Terms List --- */}
        <div className="max-w-3xl mx-auto space-y-4">
           {TERMS_DATA.map((section, index) => {
             const isOpen = expandedSection === section.id;
             return (
               <motion.div
                 key={section.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 * index }}
                 className={cn(
                   "group rounded-2xl border transition-all duration-300 overflow-hidden",
                   isOpen 
                    ? "bg-neutral-900/40 border-white/10 shadow-lg" 
                    : "bg-transparent border-white/5 hover:bg-neutral-900/20"
                 )}
               >
                 <button
                   onClick={() => setExpandedSection(isOpen ? null : section.id)}
                   className="w-full px-6 py-5 flex items-center justify-between text-left outline-none"
                 >
                   <span className={cn(
                     "text-sm font-medium uppercase tracking-widest",
                     isOpen ? "text-white" : "text-neutral-400 group-hover:text-neutral-300"
                   )}>
                     {section.title}
                   </span>
                   {isOpen ? <ChevronUp size={16} className="text-white" /> : <ChevronDown size={16} className="text-neutral-600" />}
                 </button>

                 <AnimatePresence>
                   {isOpen && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.3, ease: "easeInOut" }}
                     >
                       <div className="px-6 pb-6 pt-0">
                         <div className="h-px w-full bg-white/5 mb-4"></div>
                         <ul className="space-y-3">
                           {section.content.map((point, i) => (
                             <li key={i} className="flex items-start gap-3 text-sm text-neutral-400 leading-relaxed">
                               <Check size={14} className="mt-1 text-green-500/50 shrink-0" />
                               <span>{point}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </motion.div>
             );
           })}
        </div>

        {/* --- Minimal Footer Area --- */}
        <div className="mt-20 text-center border-t border-white/5 pt-10">
          <p className="text-neutral-500 text-sm mb-4">Have questions about our tools?</p>
          <button className="px-6 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors">
            Contact Support
          </button>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}