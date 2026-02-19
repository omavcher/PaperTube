"use client";

import React from 'react';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Youtube, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Zap, 
  Heart,
  Mail, 
  Command,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-black border-t border-white/5 overflow-hidden font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* --- Background Atmosphere --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neutral-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16">
          
          {/* --- Brand Column --- */}
          <div className="md:col-span-5 space-y-8">
            <div className="space-y-4">
              <Link href="/" className="group block">
                    <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                      Paper<span className="text-red-600 group-hover:text-red-500 transition-colors">Tube</span>
                    </h2>
                  </Link>
              
              <p className="text-neutral-400 text-sm leading-relaxed max-w-sm font-light">
                The advanced interface for engineering intelligence. 
                Transform raw video data into structured knowledge nodes using our proprietary <span className="text-white font-medium">PaperTube</span>.
              </p>
            </div>

            {/* Newsletter Input */}
            <div className="max-w-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">
                    <Zap size={10} className="inline mr-1 text-yellow-500" /> 
                    Stay Synced
                </p>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 w-4 h-4" />
                        <input 
                            placeholder="Enter email address" 
                            className="w-full bg-neutral-900/50 border border-white/10 pl-9 pr-4 h-10 text-xs font-medium rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all text-white placeholder:text-neutral-700"
                        />
                    </div>
                    <button className="h-10 px-4 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                        Join
                    </button>
                </div>
            </div>

            {/* Social Cluster */}
            <div className="flex items-center gap-2">
              <SocialIcon icon={<Twitter size={16} />} href="https://twitter.com" />
              <SocialIcon icon={<Github size={16} />} href="https://github.com" />
              <SocialIcon icon={<Linkedin size={16} />} href="https://linkedin.com" />
              <SocialIcon icon={<Youtube size={16} />} href="https://youtube.com" />
            </div>
          </div>

          {/* --- Links Columns --- */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
            
            <FooterColumn title="Platform">
              <FooterLink href="/explore" label="Explore Notes" />
              <FooterLink href="/tools" label="Engineering Tools" />
              <FooterLink href="/blog" label="Tech Blog" />
              <FooterLink href="/games" label="Neural Arcade" />
            </FooterColumn>

            <FooterColumn title="Ecosystem">
              <a href="https://www.heartecho.in" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm">
                  <Heart size={12} className="text-neutral-600 group-hover:text-red-500 transition-colors" />
                  HeartEcho
              </a>
              <FooterLink href="/leaderboard" label="Global Rank" />
              <FooterLink href="/pricing" label="Pro Membership" badge="New" />
            </FooterColumn>

            <FooterColumn title="Support">
     <FooterLink href="/about" label="About Founder" />
              <FooterLink href="/contact" label="Help Center" />
              <FooterLink href="/privacy" label="Privacy Protocol" />
              <FooterLink href="/terms" label="Terms of Service" />
              <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-900 border border-white/5">
                      <ShieldCheck size={12} className="text-neutral-400" />
                      <span className="text-[10px] font-mono text-neutral-500">AES-256 Secured</span>
                  </div>
              </div>
            </FooterColumn>

          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              © {currentYear} PaperTube Inc.
            </span>
            
            {/* System Status Indicators */}
            <div className="flex items-center gap-4 border-l border-white/5 pl-6 hidden md:flex">
               <StatusDot label="Neural Engine" status="online" />
               <StatusDot label="API Gateway" status="online" />
            </div>
          </div>

          <div className="flex items-center gap-6 text-neutral-600">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors cursor-default">
                <Globe size={12} /> Global / EN
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors cursor-default">
                <Cpu size={12} /> V4.2.0 (Stable)
             </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

// --- Sub-Components ---

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
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
      <Link href={href} className="text-neutral-500 hover:text-white transition-all text-sm font-medium flex items-center justify-between group">
        <span className="group-hover:translate-x-1 transition-transform">{label}</span>
        {badge && (
            <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ml-2">
                {badge}
            </span>
        )}
      </Link>
    </li>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="h-9 w-9 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all group"
    >
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </a>
  );
}

function StatusDot({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="flex items-center gap-2">
            <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                status === 'online' ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                {label}
            </span>
        </div>
    )
}