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
    title: "1. Introduction",
    content: [
      "Welcome to our platform. By using our website, you agree to these simple rules.",
      "Our main goal is to help you learn faster using AI tools and educational games.",
      "If you do not agree with these terms, please do not use our services."
    ]
  },
  {
    id: "services",
    title: "2. What We Offer",
    content: [
      "We provide access to over 20+ productivity tools and 10+ educational games.",
      "Our primary service allows you to paste a YouTube video link and generate summarized notes using AI.",
      "We constantly update our tools to ensure the best learning experience."
    ]
  },
  {
    id: "account",
    title: "3. Your Account",
    content: [
      "You are responsible for keeping your account password safe.",
      "Please provide accurate information when signing up.",
      "We may suspend accounts that try to hack or misuse our system."
    ]
  },
  {
    id: "ownership",
    title: "4. Ownership & Content",
    content: [
      "The notes you generate from YouTube videos are for your personal use.",
      "We respect copyright laws. Do not use our tools to infringe on video creators' rights.",
      "You own the content you create, but you grant us permission to process it to provide the service."
    ]
  },
  {
    id: "privacy",
    title: "5. Privacy & Security",
    content: [
      "We take your data security seriously.",
      "We do not sell your personal information to third parties.",
      "Please read our Privacy Policy to understand how we handle your data."
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