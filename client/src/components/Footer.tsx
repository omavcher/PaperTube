"use client";

import React from 'react';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { 
  FileText, Github, Twitter, Linkedin, 
  Youtube, ArrowRight, ShieldCheck, 
  Activity, Globe, Zap, Heart
} from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#000000] border-t border-white/5 overflow-hidden">
      <BackgroundBeamsWithCollision className="py-16 md:py-24">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
            
            {/* --- Brand Architecture --- */}
            <div className="md:col-span-5 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                   <FileText className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                    Paper<span className="text-red-600">Tube</span>
                  </h2>
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
                    Neural Video Synthesis v4.0
                  </p>
                </div>
              </div>
              
              <p className="text-neutral-500 text-base font-medium max-w-sm leading-relaxed">
                Transforming the global video stream into structured, high-fidelity knowledge nodes using advanced engineering protocols.
              </p>

              {/* Social Link Cluster */}
              <div className="flex items-center gap-4">
                <SocialIcon icon={<Twitter size={18} />} href="#" />
                <SocialIcon icon={<Github size={18} />} href="#" />
                <SocialIcon icon={<Linkedin size={18} />} href="#" />
                <SocialIcon icon={<Youtube size={18} />} href="#" />
              </div>
            </div>

            {/* --- Link Modules --- */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              
              <FooterColumn title="Engineering">
                <FooterLink href="/features" label="Core Protocol" />
                <FooterLink href="/pricing" label="Access Tiers" />
                <FooterLink href="/tools" label="Utility Matrix" />
                <FooterLink href="/exams" label="Data Repos" />
              </FooterColumn>

              <FooterColumn title="Ecosystem">
                <a href="https://www.heartecho.in" target="_blank" className="group flex items-center gap-2 text-white font-bold hover:text-red-500 transition-all text-sm">
                   <img src="/heartechor.png" alt="" className="h-4 w-4 grayscale group-hover:grayscale-0 transition-all" />
                   HeartEcho
                </a>
                <FooterLink href="#" label="Developer API" />
                <FooterLink href="#" label="System Docs" />
                <FooterLink href="/report-bug" label="Report a Bug" />
              </FooterColumn>

              <FooterColumn title="Security">
                <FooterLink href="#" label="Privacy Log" />
                <FooterLink href="#" label="Terms of Auth" />
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-600/5 border border-red-600/20">
                     <ShieldCheck size={12} className="text-red-500" />
                     <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">SSL Encrypted</span>
                  </div>
                </div>
              </FooterColumn>

            </div>
          </div>

          {/* --- Bottom Status Bar --- */}
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
                © {currentYear} PaperTube Archive
              </span>
              <div className="hidden md:flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">All Systems Operational</span>
              </div>
            </div>

            <div className="flex items-center gap-8 text-neutral-800">
               <StatusMetric icon={<Globe size={12} />} label="Nodes" value="142" />
               <StatusMetric icon={<Activity size={12} />} label="Latency" value="0.4ms" />
               <StatusMetric icon={<Zap size={12} />} label="Uptime" value="99.9%" />
            </div>
          </div>

        </div>
      </BackgroundBeamsWithCollision>
      
      {/* Decorative Red Line at the absolute bottom */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-20" />
    </footer>
  );
}

// --- Sub-Components ---

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] border-l-2 border-red-600 pl-3">
        {title}
      </h3>
      <ul className="space-y-4">
        {children}
      </ul>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="text-neutral-500 hover:text-red-500 transition-all text-sm font-medium flex items-center group">
        <ArrowRight size={12} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-600" />
        {label}
      </Link>
    </li>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a 
      href={href} 
      className="h-10 w-10 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-600 hover:text-white hover:border-red-600/50 hover:bg-red-600/10 transition-all shadow-xl"
    >
      {icon}
    </a>
  );
}

function StatusMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}: {value}</span>
    </div>
  );
}