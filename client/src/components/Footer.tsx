"use client";

import React, { useState } from 'react';
import { 
  Github, 
  Linkedin, 
  Youtube, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Zap, 
  Heart,
  Mail, 
  Cpu,
  Instagram,
  Sparkles,
  Database,
  ArrowUpRight,
  Activity,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative w-full bg-black border-t border-white/[0.04] overflow-hidden font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* --- Background Atmosphere / Radial Glows --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[380px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-purple-900/5 to-transparent rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)] pointer-events-none z-0" />

      {/* Top micro-gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        
        {/* --- Top Layout Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* --- Brand Column & newsletter --- */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <Link href="/" className="group inline-block">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Paper<span className="text-red-600 group-hover:text-red-500 transition-colors drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">XIFY</span>
                </h2>
              </Link>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-sm font-light">
                The global AI platform for automated study notes, presentations, flowcharts, and academic content generation. Optimize your study throughput instantly.
              </p>
            </div>

            {/* Newsletter Input */}
            <div className="max-w-sm bg-neutral-950/80 border border-white/5 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden group/card">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full pointer-events-none group-hover/card:bg-red-500/10 transition-colors duration-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3 flex items-center gap-1.5">
                <Zap size={11} className="text-yellow-500 fill-yellow-500/10 animate-pulse" /> 
                Weekly Research Updates
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 py-2">
                  <Check size={14} className="stroke-[3]" />
                  <span>You have been subscribed successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 w-3.5 h-3.5 group-focus-within/form:text-white transition-colors" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address" 
                      className="w-full h-10 bg-black/40 border border-white/10 pl-9 pr-4 text-xs font-semibold rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-red-500/20 transition-all text-white placeholder:text-neutral-700"
                    />
                  </div>
                  <button type="submit" className="h-10 px-4 bg-white text-black hover:bg-neutral-200 active:scale-95 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5">
                    Join <ArrowRight size={12} />
                  </button>
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <SocialIcon icon={<Instagram size={15} />} href="https://www.instagram.com/paperxify" label="Instagram" />
              <SocialIcon icon={<Github size={15} />} href="https://github.com/omavcher" label="GitHub" />
              <SocialIcon icon={<Linkedin size={15} />} href="https://www.linkedin.com/company/paperxify" label="LinkedIn" />
              <SocialIcon icon={<Youtube size={15} />} href="https://www.youtube.com/@Paperxify" label="YouTube" />
            </div>
          </div>

          {/* --- Links Grid Columns --- */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
            
            <FooterColumn title="AI Study Suite">
              <FooterLink href="/youtube-to-notes" label="YouTube to Notes" />
              <FooterLink href="/presentation-generator" label="Slide & PPT Maker" />
              <FooterLink href="/ai-diagram" label="AI Diagram Studio" />
              <FooterLink href="/ai-writer" label="AI Writer & Editor" />
              <FooterLink href="/ai-study" label="AI Homework Room" />
            </FooterColumn>

            <FooterColumn title="Platform">
              <FooterLink href="/tools" label="All Study Tools" />
              <FooterLink href="/success-stories" label="Success Stories" />
              <FooterLink href="/blog" label="Tech Blog" />
              <FooterLink href="/notegpt-alternative" label="NoteGPT Alternative" />
              <FooterLink href="/pricing" label="Pro Membership" badge="New" />
            </FooterColumn>

            <FooterColumn title="Security & Legal">
              <FooterLink href="/about" label="About Founder" />
              <FooterLink href="/contact" label="Help Center" />
              <FooterLink href="/privacy" label="Privacy Protocol" />
              <FooterLink href="/terms" label="Terms of Service" />
              <div className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/40 border border-white/5">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-bold font-mono text-neutral-400 tracking-wider">AES-256 SECURED</span>
                </div>
              </div>
            </FooterColumn>

          </div>
        </div>

        {/* --- Global Directories / Regional Links (SEO booster) --- */}
        <div className="py-6 border-t border-white/[0.04] border-b border-white/[0.04] mb-8 bg-neutral-900/[0.02] backdrop-blur-[2px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5 select-none">
              <Globe size={11} className="text-neutral-500 animate-spin-slow" /> Target Regions & Localized Engines:
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-neutral-400">
              <Link href="/us" className="hover:text-white transition-colors flex items-center gap-1">🇺🇸 <span className="underline decoration-white/0 hover:decoration-white/30 transition-all">United States</span></Link>
              <Link href="/uk" className="hover:text-white transition-colors flex items-center gap-1">🇬🇧 <span className="underline decoration-white/0 hover:decoration-white/30 transition-all">United Kingdom</span></Link>
              <Link href="/au" className="hover:text-white transition-colors flex items-center gap-1">🇦🇺 <span className="underline decoration-white/0 hover:decoration-white/30 transition-all">Australia</span></Link>
              <Link href="/ca" className="hover:text-white transition-colors flex items-center gap-1">🇨🇦 <span className="underline decoration-white/0 hover:decoration-white/30 transition-all">Canada</span></Link>
              <Link href="/de" className="hover:text-white transition-colors flex items-center gap-1">🇩🇪 <span className="underline decoration-white/0 hover:decoration-white/30 transition-all">Deutschland</span></Link>
              <Link href="/eu" className="hover:text-white transition-colors flex items-center gap-1">🇪🇺 <span className="underline decoration-white/0 hover:decoration-white/30 transition-all">Europe</span></Link>
            </div>
          </div>
        </div>

        {/* --- Bottom Status & Meta Bar --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest select-none">
              © {currentYear} Paperxify Inc.
            </span>
            
            {/* Status meters */}
            <div className="flex items-center gap-5 sm:border-l sm:border-white/5 sm:pl-6">
               <StatusDot label="AI Pipelines" status="online" />
               <StatusDot label="Sync Nodes" status="online" />
               <StatusDot label="API Latency" status="latency" />
            </div>
          </div>

          <div className="flex items-center gap-6 text-neutral-400 shrink-0">
             <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest hover:text-white transition-colors cursor-default select-none">
                <Globe size={11} /> Global / EN
             </div>
             <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest hover:text-white transition-colors cursor-default select-none">
                <Cpu size={11} /> V4.4.0 (STABLE)
             </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* --- Internal Helper Components --- */

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 select-none">
        {title}
      </h3>
      <ul className="space-y-3">
        {children}
      </ul>
    </div>
  );
}

function FooterLink({ href, label, badge }: { href: string; label: string, badge?: string }) {
  return (
    <li>
      <Link href={href} className="text-neutral-400 hover:text-white transition-all text-xs font-semibold flex items-center justify-between group">
        <span className="group-hover:translate-x-1 transition-transform">{label}</span>
        {badge && (
          <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wide ml-2">
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}

function SocialIcon({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      aria-label={label}
      className="h-9 w-9 rounded-xl bg-neutral-950 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-white/10 transition-all group"
    >
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </a>
  );
}

function StatusDot({ label, status }: { label: string, status: 'online' | 'offline' | 'latency' }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'online' ? "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" :
        status === 'latency' ? "bg-cyan-500 shadow-[0_0_8px_#06b6d4]" :
        "bg-red-500"
      )} />
      <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 flex items-center gap-1">
        {label}
        {status === 'latency' && (
          <span className="text-[8px] font-mono text-cyan-500 font-bold lowercase tracking-normal">42ms</span>
        )}
      </span>
    </div>
  );
}