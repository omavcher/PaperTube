"use client";

import React from 'react';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { 
  FileText, Github, Twitter, Linkedin, 
  Youtube, ArrowRight, ShieldCheck, 
  Activity, Globe, Zap, Heart,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#000000] border-t border-white/5 overflow-hidden">
      {/* Padding Adjustment: 
          pb-32 on mobile ensures content clears your Fixed Bottom Navbar.
      */}
      <div className="pt-16 pb-32 md:pt-24 md:pb-12">
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
            
            {/* --- Brand Architecture --- */}
            <div className="md:col-span-5 space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-14 h-14 bg-red-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-transform hover:rotate-6">
                   <FileText className="text-white w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                    Paper<span className="text-red-600">Tube</span>
                  </h2>
                  <p className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] mt-1">
                    Neural Knowledge Protocols
                  </p>
                </div>
              </div>
              
              <p className="text-neutral-500 text-sm md:text-base font-medium max-w-sm leading-relaxed">
                Engineering high-fidelity learning structures from the global video stream. 
                Optimized for engineers, researchers, and technical architects.
              </p>

              {/* Social Link Cluster */}
              <div className="flex items-center gap-3">
                <SocialIcon icon={<Twitter size={18} />} href="#" />
                <SocialIcon icon={<Github size={18} />} href="#" />
                <SocialIcon icon={<Linkedin size={18} />} href="#" />
                <SocialIcon icon={<Youtube size={18} />} href="#" />
              </div>
            </div>

            {/* --- Link Modules --- */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-4">
              
              <FooterColumn title="Protocol">
                <FooterLink href="/features" label="Core Specs" />
                <FooterLink href="/pricing" label="Access Tiers" />
                <FooterLink href="/tools" label="Utility Lab" />
                <FooterLink href="/explore" label="Node Map" />
              </FooterColumn>

              <FooterColumn title="Ecosystem">
                <a 
                  href="https://www.heartecho.in" 
                  target="_blank" 
                  className="group flex items-center gap-2 text-white font-bold hover:text-red-500 transition-all text-[13px] uppercase tracking-tighter"
                >
                   <div className="w-5 h-5 rounded-md bg-neutral-900 flex items-center justify-center border border-white/10 group-hover:border-red-600/50">
                     <Heart size={10} className="text-neutral-500 group-hover:text-red-500 fill-current transition-colors" />
                   </div>
                   HeartEcho
                </a>
                <FooterLink href="#" label="Developer API" />
                <FooterLink href="#" label="System Docs" />
                <FooterLink href="/report-bug" label="Bug Bounty" />
              </FooterColumn>

              <FooterColumn title="Security" className="col-span-2 sm:col-span-1">
                <FooterLink href="#" label="Privacy Log" />
                <FooterLink href="#" label="Legal Terms" />
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/5 border border-red-600/20 shadow-inner">
                     <ShieldCheck size={12} className="text-red-500" />
                     <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Quantum_SSL</span>
                  </div>
                </div>
              </FooterColumn>

            </div>
          </div>

          {/* --- Bottom Status Bar --- */}
          <div className="mt-16 md:mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
                © {currentYear} PaperTube Foundation
              </span>
              <div className="flex items-center gap-2 bg-neutral-900/50 px-3 py-1 rounded-full border border-white/5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-[0.2em]">Operational</span>
              </div>
            </div>

{/* Newsletter */}
            <div className="bg-gradient-to-br from-red-900/20 to-[#0f0f0f] border border-red-600/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-sm md:text-lg font-black italic uppercase text-white mb-1">Intel Updates</h3>
                <p className="text-[10px] md:text-xs text-neutral-300 mb-3 font-medium leading-relaxed">
                  Join 15,000+ engineers.
                </p>
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3 h-3" />
                    <Input 
                      placeholder="Email address" 
                      className="bg-black/50 border-white/10 pl-8 h-9 text-[10px] font-bold rounded-lg focus-visible:ring-red-600"
                    />
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[9px] h-9 rounded-lg">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>


            <div className="flex flex-wrap justify-center items-center gap-6 text-neutral-800">
               <StatusMetric icon={<Globe size={12} />} label="Nodes" value="4.2k" />
               <StatusMetric icon={<Activity size={12} />} label="Latency" value="12ms" />
               <StatusMetric icon={<Zap size={12} />} label="Uptime" value="99.9%" />
            </div>
          </div>

        </div>
      </div>
        

      {/* Decorative Glow Line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
    </footer>
  );
}

// --- Sub-Components ---

function FooterColumn({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-5", className)}>
      <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-2">
        <span className="w-1 h-3 bg-red-600 rounded-full" />
        {title}
      </h3>
      <ul className="space-y-3.5">
        {children}
      </ul>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="text-neutral-500 hover:text-white transition-all text-[13px] font-medium flex items-center group">
        <ArrowRight size={12} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-600" />
        <span className="group-hover:translate-x-1 transition-transform duration-300">{label}</span>
      </Link>
    </li>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a 
      href={href} 
      className="h-11 w-11 rounded-[0.9rem] bg-neutral-950 border border-white/5 flex items-center justify-center text-neutral-500 hover:text-white hover:border-red-600/50 hover:bg-red-600/5 transition-all shadow-2xl group"
    >
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </a>
  );
}

function StatusMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="text-neutral-700">{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-600 group hover:text-neutral-400 transition-colors">
        {label}: <span className="text-neutral-500">{value}</span>
      </span>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}