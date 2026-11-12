"use client";

import React from "react";
import { 
  Github, Twitter, Linkedin, Mail, 
  Terminal, Cpu, Code2, Globe, 
  ArrowUpRight, Sparkles, Zap, Award,
  ShieldCheck, CheckCircle2, UserCheck, Building2, ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { SITE_METRICS } from "@/config/siteMetrics";

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900/50 overflow-x-hidden">
      
      {/* --- Background Atmosphere --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-20 md:py-28 max-w-6xl">
        
        {/* --- Company Mission Header --- */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-red-400">
            <Sparkles size={11} />
            <span>Company &amp; Platform Profile</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            About Paperxify
          </h1>

          {/* Prominent Legal Ownership Badge */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-400 shadow-sm">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Owned By Om Eknath Avchar</span>
            </div>
          </div>

          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-light pt-2">
            Paperxify is an Indian Educational Technology (EdTech) Software-as-a-Service platform <strong className="text-white font-semibold">owned and operated by Om Eknath Avchar</strong> in Maharashtra, India. We build cutting-edge AI learning systems that transform complex video lectures, academic papers, and coursework into interactive study materials, smart flashcards, automated quizzes, and slide decks for students and researchers across the globe.
          </p>
        </div>

        {/* --- Official Business & Legal Ownership Info Card --- */}
        <div className="rounded-3xl bg-[#0a0a0e] border border-white/[0.08] p-6 sm:p-8 mb-20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[90px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">
                <Building2 size={12} />
                <span>Business Identity &amp; Platform Ownership</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Official Entity &amp; Merchant Information
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 shrink-0">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Verified Entity: Owned by Om Eknath Avchar</span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider block">Proprietor / Legal Owner</span>
              <p className="text-base font-bold text-white">Om Eknath Avchar</p>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Registered platform owner &amp; principal software engineer behind Paperxify.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider block">Platform &amp; Service Nature</span>
              <p className="text-base font-bold text-white">Paperxify (EdTech SaaS)</p>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Cloud-hosted AI lecture synthesis, smart notes, slides, and academic study tooling.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider block">Operational Location &amp; Inquiries</span>
              <p className="text-base font-bold text-white">Maharashtra, India</p>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Direct inquiries: <a href="mailto:support@paperxify.com" className="text-neutral-200 underline">support@paperxify.com</a> or <a href="mailto:omawchar07@gmail.com" className="text-neutral-200 underline">omawchar07@gmail.com</a>
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-white/[0.06] text-xs">
            <span className="text-neutral-400">Compliance &amp; Legal Policies:</span>
            <Link href="/terms" className="text-neutral-300 hover:text-white underline underline-offset-2">Terms of Service</Link>
            <span className="text-neutral-600">·</span>
            <Link href="/refund-policy" className="text-neutral-300 hover:text-white underline underline-offset-2">Cancellation &amp; Refund Policy</Link>
            <span className="text-neutral-600">·</span>
            <Link href="/shipping-policy" className="text-neutral-300 hover:text-white underline underline-offset-2">Shipping &amp; Delivery Policy</Link>
            <span className="text-neutral-600">·</span>
            <Link href="/privacy" className="text-neutral-300 hover:text-white underline underline-offset-2">Privacy Policy</Link>
            <span className="text-neutral-600">·</span>
            <Link href="/contact" className="text-neutral-300 hover:text-white underline underline-offset-2">Contact Us</Link>
          </div>
        </div>

        {/* --- Hero Section --- */}
        <div className="flex flex-col md:flex-row gap-16 items-center mb-24">
          
          {/* Left: Image Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full md:w-5/12 aspect-[4/5] md:aspect-square max-w-md mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-blue-600 rounded-[2.5rem] blur-2xl opacity-20 animate-pulse" />
            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-neutral-900/50 shadow-2xl group">
              <img 
                src="/omawchar.webp" 
                alt="Om Eknath Avchar" 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0" 
              />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">System Online</span>
                 </div>
                 <Badge variant="outline" className="border-white/10 text-white text-[9px] font-bold uppercase tracking-widest">
                    IND • 2026
                 </Badge>
              </div>
            </div>
          </motion.div>

          {/* Right: Bio Content */}
          <div className="w-full md:w-7/12 space-y-8 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6">
                <Terminal size={12} className="text-red-500" />
                <span>Founder &amp; Owner</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-2 leading-[0.95]">
                Om Eknath <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-200 to-neutral-600">Avchar.</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium text-neutral-400">
                Full Stack Developer, AI Engineer &amp; <span className="text-white">Owner of Paperxify</span>
              </p>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-400 leading-relaxed text-sm md:text-base font-light max-w-2xl mx-auto md:mx-0"
            >
              I am a Computer Science Engineer with a passion for building scalable, high-performance systems. 
              As the sole owner and architect behind <span className="text-white font-medium">Paperxify</span>, my goal is to revolutionize how students and educators consume information and master academic concepts.
              <br /><br />
              My philosophy is simple: <span className="text-white italic">Code until it compiles, ship until it scales.</span>
            </motion.p>

            {/* Social Matrix */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center md:justify-start gap-4 pt-4"
            >
               <SocialLink href="https://github.com/omavchar" icon={<Github size={18} />} label="GitHub" />
               <SocialLink href="https://x.com/omAvcher07" icon={<Twitter size={18} />} label="Twitter" />
               <SocialLink href="https://www.linkedin.com/in/omAvcher" icon={<Linkedin size={18} />} label="LinkedIn" />
               <SocialLink href="mailto:support@paperxify.com" icon={<Mail size={18} />} label="Contact" />
            </motion.div>
          </div>
        </div>

        {/* --- Stats / Stack Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
           <StatCard label="Experience" value="3+ Years" icon={<Award className="text-yellow-500" />} />
           <StatCard label="Projects Shipped" value="10+" icon={<Zap className="text-red-500" />} />
           <StatCard label="Users Served" value={SITE_METRICS.usersServed} icon={<Globe className="text-blue-500" />} />
           <StatCard label="Tech Stack" value="MERN + AI" icon={<Cpu className="text-emerald-500" />} />
        </div>

        {/* --- "The Philosophy" Section --- */}
        <div className="bg-neutral-900/20 border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden text-center md:text-left">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-12">
              <div className="max-w-2xl space-y-6">
                 <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                    Why I Built <span className="text-red-600">Paperxify?</span>
                 </h2>
                 <p className="text-neutral-400 leading-relaxed font-light">
                    As a student, I realized the inefficiency of manually taking notes from hours of video content. 
                    I wanted a tool that could <span className="text-white">synthesize intelligence</span> directly from the source signal.
                    <br/><br/>
                    Paperxify is not just an app; it's an extension of my own workflow—designed for speed, precision, and clarity.
                 </p>
                 <div className="pt-4">
                    <img src="/sign.png" alt="Signature" className="h-12" /> 
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 mt-2">Founder &amp; Owner Signature (Om Eknath Avchar)</p>
                 </div>
              </div>

              {/* Stack Pills */}
              <div className="w-full md:w-auto flex flex-wrap md:flex-col gap-3 justify-center md:justify-start">
                 <TechPill label="Next.js 14" />
                 <TechPill label="TypeScript" />
                 <TechPill label="Tailwind CSS" />
                 <TechPill label="Python AI" />
                 <TechPill label="Node.js" />
                 <TechPill label="MongoDB" />
              </div>
           </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

// --- Sub-Components ---

const SocialLink = ({ href, icon, label }: { href: string, icon: any, label: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-neutral-900 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all"
  >
    <div className="text-neutral-400 group-hover:text-white transition-colors">{icon}</div>
    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 group-hover:text-white transition-colors">{label}</span>
  </a>
);

const StatCard = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
  <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-3 group hover:bg-neutral-900/50 transition-colors">
     <div className="p-3 rounded-2xl bg-black border border-white/10 group-hover:scale-110 transition-transform duration-300">
        {React.cloneElement(icon, { size: 20 })}
     </div>
     <div>
        <div className="text-2xl md:text-3xl font-black text-white tracking-tight">{value}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{label}</div>
     </div>
  </div>
);

const TechPill = ({ label }: { label: string }) => (
  <div className="px-4 py-2 rounded-lg border border-white/5 bg-black/40 text-neutral-400 text-xs font-mono uppercase tracking-wider text-center md:text-right hover:text-white hover:border-white/20 transition-colors cursor-default">
     {label}
  </div>
);