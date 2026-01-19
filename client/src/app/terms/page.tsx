"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import {
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Lock,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  Target,
  Heart,
  Award,
  Terminal,
  Activity,
  ShieldCheck,
  Scale,
  Gavel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface TermSection {
  id: string;
  title: string;
  content: string[];
}

export default function TermsPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['acceptance', 'user-accounts']));

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const terms: TermSection[] = [
    {
      id: "acceptance",
      title: "01. Acceptance of Terms",
      content: [
        "By accessing and using PaperTube, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.",
        "These terms constitute a legally binding agreement between you and PaperTube. If you do not agree with any part of these terms, you must not use our services.",
        "We reserve the right to modify these terms at any time. Continued use of PaperTube after changes constitutes acceptance of the new terms."
      ]
    },
    {
      id: "user-accounts",
      title: "02. User Accounts & Registration",
      content: [
        "You must be at least 13 years old to use PaperTube. If you are under 18, you must have parental consent.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
        "You agree to provide accurate, current, and complete information during registration and keep it updated.",
        "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities."
      ]
    },
    {
      id: "services",
      title: "03. Services Description",
      content: [
        "PaperTube provides AI-powered tools to convert YouTube videos into organized notes and summaries.",
        "We offer both free and premium subscription plans with varying features and limitations.",
        "We may modify, suspend, or discontinue any aspect of our services at any time without prior notice."
      ]
    },
    {
        id: "user-content",
        title: "04. User Content Rights",
        content: [
          "You retain ownership of all content you create using PaperTube, including generated notes and summaries.",
          "By using our services, you grant PaperTube a license to process, store, and analyze your content to provide the service.",
          "You must not use PaperTube to create content that violates copyrights, privacy rights, or any applicable laws."
        ]
      },
      {
        id: "privacy",
        title: "06. Data Protection Protocol",
        content: [
          "Your privacy is critical. Please review our Privacy Policy to understand how we collect and use your data.",
          "We implement industry-standard security measures to protect your data, but cannot guarantee absolute security.",
          "We do not sell your personal data to third parties."
        ]
      },
  ];

  const keyPoints = [
    { icon: <CheckCircle className="text-emerald-500" />, text: "You own the generated artifacts", color: "text-emerald-500" },
    { icon: <AlertCircle className="text-yellow-500" />, text: "Respect global copyright laws", color: "text-yellow-500" },
    { icon: <Lock className="text-blue-500" />, text: "End-to-end data protection", color: "text-blue-500" },
    { icon: <XCircle className="text-red-500" />, text: "No automated scraping allowed", color: "text-red-500" },
    { icon: <Clock className="text-purple-500" />, text: "14-day refund guarantee", color: "text-purple-500" },
    { icon: <Globe className="text-cyan-500" />, text: "Governed by Indian Law", color: "text-cyan-500" }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans">
      {/* Background Matrix HUD */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-radial-gradient from-red-600/10 via-transparent to-transparent"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 overflow-hidden z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 rounded-full bg-red-600/10 border border-red-600/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                <Activity size={12} className="animate-pulse" /> Legal Protocol v2.4
              </motion.div>
              
              <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
                TERMS OF <br />
                <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">COMPLIANCE</span>
              </h1>
              
              <p className="text-lg text-neutral-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 uppercase tracking-tight">
                Review the governance framework of the PaperTube neural network. 
                <span className="text-white italic block mt-2 text-base">By using the terminal, you agree to these operational bounds.</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                <StatusMetric label="Registry Nodes" value="12" />
                <StatusMetric label="Sync Time" value="5m" />
                <StatusMetric label="Language" value="EN" />
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Gavel size={120} /></div>
                 <h3 className="text-xl font-black italic uppercase text-red-500 mb-6 flex items-center gap-2">
                    <Terminal size={20} /> Executive Summary
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {keyPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-black border border-white/5">
                        <div className="shrink-0">{point.icon}</div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{point.text}</span>
                      </div>
                    ))}
                 </div>
                 <div className="mt-6 p-4 rounded-2xl bg-emerald-600/5 border border-emerald-600/20 flex items-center gap-4">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest leading-relaxed">
                      This framework is designed for mutual protection and transparency.
                    </p>
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* --- TERMS LEDGER --- */}
      <section className="py-12 z-10 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 space-y-2">
             <Badge className="bg-white/5 text-neutral-500 border-white/10 font-black italic uppercase text-[10px] px-4">Neural Compliance Ledger</Badge>
             <h2 className="text-3xl font-black italic uppercase tracking-tighter">Full Regulatory Documentation</h2>
          </div>

          <div className="space-y-4">
            {terms.map((section) => (
              <div 
                key={section.id} 
                className={cn(
                    "border rounded-[2rem] overflow-hidden transition-all duration-500",
                    expandedSections.has(section.id) ? "bg-neutral-900 border-red-600/30" : "bg-neutral-950 border-white/5"
                )}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-3 rounded-xl transition-all duration-500",
                        expandedSections.has(section.id) ? "bg-red-600 text-white" : "bg-black border border-white/5 text-neutral-600 group-hover:text-red-500"
                    )}>
                      <Scale size={20} />
                    </div>
                    <span className={cn(
                        "font-black italic uppercase tracking-widest text-sm sm:text-base",
                        expandedSections.has(section.id) ? "text-white" : "text-neutral-400"
                    )}>{section.title}</span>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-700" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSections.has(section.id) && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                      <div className="px-8 pb-8 space-y-4">
                        <div className="h-px bg-white/5 w-full mb-6" />
                        {section.content.map((paragraph, idx) => (
                          <p key={idx} className="text-neutral-400 text-sm leading-relaxed font-medium uppercase tracking-tight">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-neutral-900/50 border border-white/10 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <Award size={20} className="text-yellow-600" />
                <p className="text-[10px] font-black uppercase italic tracking-widest">Acknowledgment of binding protocol established upon terminal access.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 z-10 relative border-t border-white/5 bg-neutral-900/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-[3rem] bg-gradient-to-r from-red-600 to-red-900 p-10 sm:p-20 text-center shadow-[0_0_100px_rgba(220,38,38,0.2)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] opacity-30" />
            
            <h2 className="text-3xl sm:text-5xl font-black text-white italic uppercase tracking-tighter mb-6 relative z-10">
              LEGAL <span className="text-black/30">QUERIES?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80 font-bold uppercase tracking-widest text-xs sm:text-sm relative z-10">
              Our compliance team is available to clarify any node within this regulatory framework.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Button 
                onClick={() => window.location.href = '/support'}
                className="h-16 px-10 bg-black text-white font-black italic uppercase rounded-2xl text-lg hover:bg-neutral-900 transition-all w-full sm:w-auto"
              >
                Direct Link
              </Button>
              <Button 
                variant="outline" 
                className="h-16 px-10 border-white/20 text-white font-black italic uppercase rounded-2xl text-lg hover:bg-white/10 w-full sm:w-auto"
                onClick={() => window.location.href = '/privacy'}
              >
                Privacy Logs
              </Button>
            </div>
            <p className="mt-8 text-[9px] font-black text-white/40 uppercase tracking-[0.4em] relative z-10">
              Response cycle: 7 business days • legal@papertube.ai
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* --- Visual Helpers --- */

const StatusMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="text-center lg:text-left">
    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-1">{label}</p>
    <p className="text-xl font-black italic uppercase text-white leading-none tracking-tighter">{value}</p>
  </div>
);