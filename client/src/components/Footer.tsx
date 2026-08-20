"use client";

import React, { useState } from "react";
import { 
  Briefcase, BookOpen, Zap, Users, Crown, Check, ArrowRight, Mail, 
  ShieldCheck, RefreshCw, Award, Globe, ChevronDown, Instagram, Youtube, 
  Twitter, Linkedin
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [openMobileSec, setOpenMobileSec] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const toggleMobileSec = (sec: string) => {
    setOpenMobileSec(openMobileSec === sec ? null : sec);
  };

  return (
    <footer className="w-full bg-[#050507] border-t border-white/[0.06] text-neutral-400 font-sans relative overflow-hidden">
      
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 relative z-10">
        
        {/* ─── TOP SECTION: BRAND, LINK COLUMNS, PRO CARD ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          
          {/* ── COL 1: BRAND & NEWSLETTER ── */}
          <div className="lg:col-span-4 space-y-4">
            {/* Text-Based Logo */}
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black italic tracking-tighter uppercase text-white">
                  PAPER<span className="text-[#ef4444]">XIFY</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-normal tracking-wide mt-0.5">AI Study Workspace</p>
            </Link>

            <p className="text-xs text-neutral-400 font-normal leading-relaxed max-w-sm">
              The unified AI workspace for students, researchers, and educators. Turn any video or document into study materials instantly.
            </p>

            {/* Newsletter Box */}
            <div className="rounded-2xl bg-[#09090c] border border-white/[0.08] p-4 shadow-sm max-w-sm">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300 shrink-0">
                  <Mail size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Product Updates</h4>
                  <p className="text-[10.5px] text-neutral-400">Get release notes, study tips & new tools.</p>
                </div>
              </div>

              {subscribed ? (
                <div className="text-xs text-emerald-400 font-medium py-1.5 flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Subscribed successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 mt-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 text-xs px-3 py-2 rounded-xl text-white placeholder-neutral-500 focus:outline-none min-w-0 transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shrink-0 transition-all cursor-pointer active:scale-98"
                  >
                    <span>Join</span>
                    <ArrowRight size={12} />
                  </button>
                </form>
              )}
            </div>

            {/* Social Links (Desktop) */}
            <div className="hidden lg:block pt-2">
              <p className="text-xs text-neutral-400 font-medium mb-2.5">Connect with us</p>
              <div className="flex items-center gap-2">
                <a href="https://youtube.com/@Paperxify" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
                  <Youtube size={14} />
                </a>
                <a href="https://instagram.com/paperxify" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
                  <Instagram size={14} />
                </a>
                <a href="https://twitter.com/paperxify" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
                  <Twitter size={14} />
                </a>
                <a href="https://linkedin.com/company/paperxify" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
                  <Linkedin size={14} />
                </a>
              </div>
            </div>

          </div>

          {/* ── COL 2 & 3: LINKS GRID (DESKTOP) & ACCORDION (MOBILE) ── */}
          <div className="lg:col-span-5">
            {/* Desktop Links Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-6">
              
              {/* Category 1: AI STUDY SUITE */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={13} className="text-neutral-400" />
                  <span>AI Study Suite</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/youtube-to-notes" className="hover:text-white transition-colors">YouTube to Notes</Link></li>
                  <li><Link href="/presentation-generator" className="hover:text-white transition-colors">Presentation Generator</Link></li>
                  <li><Link href="/youtube-to-quiz" className="hover:text-white transition-colors">Quiz Generator</Link></li>
                  <li><Link href="/youtube-to-flashcards" className="hover:text-white transition-colors">AI Flashcards</Link></li>
                  <li><Link href="/ai-study/homework-helper" className="hover:text-white transition-colors">AI Homework Helper</Link></li>
                  <li><Link href="/ai-study/math-solver" className="hover:text-white transition-colors">AI Math Solver</Link></li>
                  <li><Link href="/ai-study/exam-planner" className="hover:text-white transition-colors">Exam Prep Planner</Link></li>
                  <li><Link href="/ai-study/language-tutor" className="hover:text-white transition-colors">AI Language Tutor</Link></li>
                </ul>
              </div>

              {/* Category 2: AI WRITER & DIAGRAMS */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={13} className="text-neutral-400" />
                  <span>Writer & Diagrams</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/ai-writer/ai-detector" className="hover:text-white transition-colors">AI Detector & Certs</Link></li>
                  <li><Link href="/ai-writer/ai-humanizer" className="hover:text-white transition-colors">AI Humanizer</Link></li>
                  <li><Link href="/ai-writer/essay-writer" className="hover:text-white transition-colors">AI Essay Writer</Link></li>
                  <li><Link href="/ai-writer/plagiarism" className="hover:text-white transition-colors">Plagiarism Checker</Link></li>
                  <li><Link href="/ai-diagram" className="hover:text-white transition-colors">AI Mind Maps & Diagrams</Link></li>
                  <li><Link href="/tools/code-to-image" className="hover:text-white transition-colors">Code to Image</Link></li>
                  <li><Link href="/tools" className="text-neutral-400 hover:text-white font-medium inline-flex items-center gap-1 pt-1">View All 25+ Tools <ArrowRight size={11} /></Link></li>
                </ul>
              </div>

              {/* Category 3: RESOURCES */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={13} className="text-neutral-400" />
                  <span>Resources</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog & Guides</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="/success-stories" className="hover:text-white transition-colors">Success Stories</Link></li>
                  <li><a href="https://youtube.com/@Paperxify" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">YouTube Tutorials</a></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Backpack Library</Link></li>
                </ul>
              </div>

              {/* Category 4: COMPANY */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={13} className="text-neutral-400" />
                  <span>Company</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/about" className="hover:text-white transition-colors">About Paperxify</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>

            </div>

            {/* Mobile Collapsible Accordions */}
            <div className="block lg:hidden space-y-1.5 border-t border-white/[0.08] pt-3">
              
              {/* Sec 1 */}
              <div className="border-b border-white/[0.06] pb-2">
                <button
                  onClick={() => toggleMobileSec("suite")}
                  className="w-full py-2 flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase size={14} className="text-neutral-400" />
                    AI Study Suite
                  </span>
                  <ChevronDown size={14} className={cn("transition-transform text-neutral-400", openMobileSec === "suite" && "rotate-180")} />
                </button>
                {openMobileSec === "suite" && (
                  <ul className="py-2 space-y-2 text-xs pl-6 text-neutral-300">
                    <li><Link href="/youtube-to-notes">YouTube to Notes</Link></li>
                    <li><Link href="/presentation-generator">Presentation Generator</Link></li>
                    <li><Link href="/youtube-to-quiz">Quiz Generator</Link></li>
                    <li><Link href="/youtube-to-flashcards">AI Flashcards</Link></li>
                    <li><Link href="/ai-study/homework-helper">AI Homework Helper</Link></li>
                    <li><Link href="/ai-study/math-solver">AI Math Solver</Link></li>
                    <li><Link href="/ai-study/exam-planner">Exam Prep Planner</Link></li>
                    <li><Link href="/ai-study/language-tutor">AI Language Tutor</Link></li>
                  </ul>
                )}
              </div>

              {/* Sec 2 */}
              <div className="border-b border-white/[0.06] pb-2">
                <button
                  onClick={() => toggleMobileSec("platform")}
                  className="w-full py-2 flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={14} className="text-neutral-400" />
                    Platform
                  </span>
                  <ChevronDown size={14} className={cn("transition-transform text-neutral-400", openMobileSec === "platform" && "rotate-180")} />
                </button>
                {openMobileSec === "platform" && (
                  <ul className="py-2 space-y-2 text-xs pl-6 text-neutral-300">
                    <li><Link href="/ai-study">AI Study Suite</Link></li>
                    <li><Link href="/dashboard">Backpack Library</Link></li>
                    <li><Link href="/tools">All Utilities</Link></li>
                    <li><Link href="/youtube-to-notes">Notes Generator</Link></li>
                  </ul>
                )}
              </div>

              {/* Sec 3 */}
              <div className="border-b border-white/[0.06] pb-2">
                <button
                  onClick={() => toggleMobileSec("resources")}
                  className="w-full py-2 flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Zap size={14} className="text-neutral-400" />
                    Resources
                  </span>
                  <ChevronDown size={14} className={cn("transition-transform text-neutral-400", openMobileSec === "resources" && "rotate-180")} />
                </button>
                {openMobileSec === "resources" && (
                  <ul className="py-2 space-y-2 text-xs pl-6 text-neutral-300">
                    <li><Link href="/blog">Blog & Guides</Link></li>
                    <li><Link href="/contact">Help Center</Link></li>
                    <li><Link href="/success-stories">Success Stories</Link></li>
                  </ul>
                )}
              </div>

              {/* Sec 4 */}
              <div className="border-b border-white/[0.06] pb-2">
                <button
                  onClick={() => toggleMobileSec("company")}
                  className="w-full py-2 flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Users size={14} className="text-neutral-400" />
                    Company
                  </span>
                  <ChevronDown size={14} className={cn("transition-transform text-neutral-400", openMobileSec === "company" && "rotate-180")} />
                </button>
                {openMobileSec === "company" && (
                  <ul className="py-2 space-y-2 text-xs pl-6 text-neutral-300">
                    <li><Link href="/about">About Paperxify</Link></li>
                    <li><Link href="/contact">Contact Us</Link></li>
                    <li><Link href="/careers">Careers</Link></li>
                  </ul>
                )}
              </div>

            </div>
          </div>

          {/* ── COL 3: PAPERXIFY PRO CARD ── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-[#09090c] border border-white/[0.08] hover:border-white/[0.14] p-5 shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-200 shrink-0">
                  <Crown size={17} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Upgrade Tier</p>
                  <h4 className="text-sm font-bold text-white">Paperxify <span className="text-[#ef4444]">Pro</span></h4>
                </div>
              </div>

              <div className="space-y-2 text-xs text-neutral-300 my-3">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-red-400 shrink-0" />
                  <span>Full access to all 20+ study tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-red-400 shrink-0" />
                  <span>LaTeX formulas & PPT export</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-red-400 shrink-0" />
                  <span>Priority GPU cloud processing</span>
                </div>
              </div>

              <Link
                href="/pricing"
                className="w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all mt-4"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

        </div>


        {/* ─── MIDDLE TRUST BADGES BAR (5 ITEMS) ─── */}
        <div className="rounded-2xl bg-[#09090c] border border-white/[0.06] p-4 my-6 sm:my-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 text-left">
            
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300 shrink-0">
                <ShieldCheck size={15} />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">Secure & Private</p>
                <p className="text-[10px] text-neutral-400">256-bit encrypted data</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300 shrink-0">
                <RefreshCw size={15} />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">Cancel Anytime</p>
                <p className="text-[10px] text-neutral-400">1-click cancellation</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300 shrink-0">
                <Award size={15} />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">7-Day Guarantee</p>
                <p className="text-[10px] text-neutral-400">Full refund policy</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300 shrink-0">
                <Zap size={15} />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">Instant Access</p>
                <p className="text-[10px] text-neutral-400">Start immediately</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300 shrink-0">
                <Users size={15} />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">200K+ Scholars</p>
                <p className="text-[10px] text-neutral-400">Across 120+ countries</p>
              </div>
            </div>

          </div>
        </div>


        {/* Mobile Follow Us Social Buttons */}
        <div className="block lg:hidden text-center my-6">
          <p className="text-xs text-neutral-400 font-medium mb-3">Connect with us</p>
          <div className="flex items-center justify-center gap-2.5">
            <a href="https://youtube.com/@Paperxify" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300">
              <Youtube size={14} />
            </a>
            <a href="https://instagram.com/paperxify" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300">
              <Instagram size={14} />
            </a>
            <a href="https://twitter.com/paperxify" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300">
              <Twitter size={14} />
            </a>
            <a href="https://linkedin.com/company/paperxify" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300">
              <Linkedin size={14} />
            </a>
          </div>
        </div>


        {/* ─── BOTTOM LEGAL & LANGUAGE BAR ─── */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400 text-center md:text-left">
          <p className="order-2 md:order-1">
            © {currentYear} Paperxify. All rights reserved.
          </p>

          <div className="order-1 md:order-2 flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-neutral-700">•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-neutral-700">•</span>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>

            {/* Language Selector Dropdown */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-neutral-300 cursor-pointer hover:border-white/20 transition-all ml-2">
              <Globe size={13} className="text-neutral-400" />
              <span>English</span>
              <ChevronDown size={12} className="text-neutral-500" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}