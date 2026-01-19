"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import {
  Headphones,
  MessageSquare,
  HelpCircle,
  Mail,
  Clock,
  CheckCircle,
  Users,
  BookOpen,
  Video,
  FileText,
  CreditCard,
  Smartphone,
  Globe,
  Zap,
  Sparkles,
  Search,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  Wrench,
  Rocket,
  Shield,
  Terminal,
  Activity,
  Send,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'billing' | 'features';
  icon: React.ReactNode;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'technical' | 'billing' | 'feature' | 'other';
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '', email: '', subject: '', message: '', category: 'technical'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqItems: FAQItem[] = [
    {
      question: "How do I generate notes from YouTube videos?",
      answer: "Simply paste any YouTube URL into the command console on our homepage, select your preferred neural model, and execute. Your artifacts will be synthesized in seconds.",
      category: 'general',
      icon: <Video className="h-5 w-5" />
    },
    {
        question: "What video lengths does PaperTube support?",
        answer: "Free tier supports up to 90 minutes. Premium protocols extend this to 8 hours for deep-dive technical lectures.",
        category: 'features',
        icon: <Clock className="h-5 w-5" />
      },
      {
        question: "How do I download my notes as PDF?",
        answer: "Navigate to the note viewer and select 'Export Artifact'. Choose your visual template and download the high-fidelity PDF instantly.",
        category: 'features',
        icon: <FileText className="h-5 w-5" />
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major global credit cards, UPI, and digital wallets through our secure Razorpay handshake.",
        category: 'billing',
        icon: <CreditCard className="h-5 w-5" />
      },
      {
        question: "Is PaperTube available on mobile?",
        answer: "Affirmative. PaperTube is optimized for all mobile viewports and can be installed as a Progressive Web App.",
        category: 'technical',
        icon: <Smartphone className="h-5 w-5" />
      },
      {
        question: "How accurate are the AI-generated notes?",
        answer: "Our V8 neural engines achieve 95%+ accuracy for educational content with clear audio signatures.",
        category: 'technical',
        icon: <Zap className="h-5 w-5" />
      },
  ];

  const categories = [
    { id: 'all', label: 'All Protocols', count: faqItems.length },
    { id: 'general', label: 'General', count: faqItems.filter(f => f.category === 'general').length },
    { id: 'features', label: 'Features', count: faqItems.filter(f => f.category === 'features').length },
    { id: 'billing', label: 'Billing', count: faqItems.filter(f => f.category === 'billing').length },
    { id: 'technical', label: 'Technical', count: faqItems.filter(f => f.category === 'technical').length },
  ];

  const filteredFAQs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Signal transmitted. Our engineers will respond within the next cycle.");
    setContactForm({ name: '', email: '', subject: '', message: '', category: 'technical' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans">
      {/* Dynamic Background Matrix */}
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
                <Activity size={12} className="animate-pulse" /> Support Protocol Active
              </motion.div>
              
              <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
                SYSTEM <br />
                <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">ASSISTANCE</span>
              </h1>
              
              <p className="text-lg text-neutral-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 uppercase tracking-tight">
                Access the knowledge base or initialize a direct handshake with our engineering team. 
                <span className="text-white italic block mt-2">Maximum resolution, minimum friction.</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <StatusMetric label="Live Uptime" value="99.9%" />
                <StatusMetric label="Avg Sync" value="2h" />
                <StatusMetric label="Verified" value="98%" />
                <StatusMetric label="Secure" value="AES" />
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><LifeBuoy size={120} /></div>
                 <h3 className="text-xl font-black italic uppercase text-red-500 mb-6 flex items-center gap-2">
                    <Terminal size={20} /> Fast-Track Support
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <QuickHelpBtn icon={<BookOpen size={16}/>} title="Docs" sub="System Manuals" href="/docs" />
                    <QuickHelpBtn icon={<Video size={16}/>} title="Tutorials" sub="Video Walkthroughs" href="/tutorials" />
                 </div>
                 <div className="mt-6 p-4 rounded-2xl bg-blue-600/5 border border-blue-600/20 flex items-center gap-4">
                    <Clock className="text-blue-500" size={20} />
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Global response cycle: &lt; 24 hours</p>
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEARCH ENGINE --- */}
      <section className="py-12 z-10 relative">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="relative group">
            <div className="absolute -inset-1 bg-red-600/20 blur opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl" />
            <div className="relative flex items-center bg-neutral-900/80 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
              <Search className="ml-4 h-5 w-5 text-neutral-700" />
              <input 
                type="text" 
                placeholder="Search maintenance logs (e.g. PDF, Billing, AI)..." 
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 text-white font-bold outline-none uppercase text-sm tracking-widest placeholder:text-neutral-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-12 z-10 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  activeCategory === cat.id 
                    ? "bg-red-600 border-red-500 text-white shadow-lg" 
                    : "bg-neutral-900 border-white/5 text-neutral-500 hover:text-white"
                )}
              >
                {cat.label} <span className="ml-2 opacity-40">[{cat.count}]</span>
              </button>
            ))}
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={index}
                >
                  <Card className="h-full bg-neutral-950 border-white/5 hover:border-red-600/30 transition-all duration-500 rounded-3xl p-8 group">
                    <div className="flex items-start gap-6">
                      <div className="p-4 rounded-2xl bg-black border border-white/5 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                        {faq.icon}
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">{faq.question}</h3>
                        <p className="text-sm text-neutral-500 font-medium leading-relaxed tracking-tight">{faq.answer}</p>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-600 group-hover:text-red-500">
                          LOG::{faq.category}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* --- CONTACT HANDSHAKE SECTION --- */}
      <section className="py-24 z-10 relative border-t border-white/5 bg-neutral-900/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Direct Contact Side */}
            <div className="lg:col-span-4 space-y-8">
               <div className="space-y-4 text-center lg:text-left">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">DIRECT <span className="text-red-600">LINK</span></h2>
                  <p className="text-sm text-neutral-600 font-bold uppercase tracking-widest leading-loose">Initialize manual communication with our neural operations center.</p>
               </div>
               
               <div className="space-y-4">
                  <ContactCard icon={<Mail className="text-red-500"/>} title="Email" val="support@papertube.ai" />
                  <ContactCard icon={<MessageSquare className="text-emerald-500"/>} title="Live Chat" val="Awaiting Peer..." />
               </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-8">
               <Card className="bg-neutral-950 border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                  <form onSubmit={handleSubmitContact} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Personnel Identity</Label>
                        <Input 
                          placeholder="Name..." 
                          className="bg-black border-white/5 h-14 rounded-2xl focus:border-red-600/40 text-sm font-bold uppercase tracking-widest"
                          value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Digital Address</Label>
                        <Input 
                          type="email" placeholder="Email..." 
                          className="bg-black border-white/5 h-14 rounded-2xl focus:border-red-600/40 text-sm font-bold"
                          value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Incident Category</Label>
                      <div className="flex flex-wrap gap-2">
                        {['technical', 'billing', 'feature', 'other'].map((cat) => (
                          <button
                            key={cat} type="button"
                            onClick={() => setContactForm({...contactForm, category: cat as any})}
                            className={cn(
                              "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                              contactForm.category === cat ? "bg-white text-black border-white" : "bg-black border-white/5 text-neutral-600 hover:border-white/20"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Incident Description</Label>
                      <Textarea 
                        placeholder="Detail the technical anomaly..." 
                        className="min-h-[150px] bg-black border-white/5 rounded-[2rem] focus:border-red-600/40 text-sm font-medium resize-none p-6"
                        value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-[2rem] text-lg shadow-xl shadow-red-900/20 active:scale-95 transition-all">
                      {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send size={20} className="mr-2" />}
                      Transmit Message
                    </Button>
                  </form>
               </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* --- Visual Components --- */

const StatusMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="text-center lg:text-left">
    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-1">{label}</p>
    <p className="text-xl font-black italic uppercase text-white leading-none tracking-tighter">{value}</p>
  </div>
);

const QuickHelpBtn = ({ icon, title, sub, href }: any) => (
  <button onClick={() => window.location.href = href} className="flex items-center gap-4 p-4 rounded-2xl bg-black border border-white/5 hover:border-red-600/40 transition-all text-left group">
    <div className="p-3 rounded-xl bg-neutral-900 group-hover:bg-red-600 text-neutral-500 group-hover:text-white transition-all">{icon}</div>
    <div>
      <p className="text-xs font-black uppercase italic text-white tracking-widest">{title}</p>
      <p className="text-[9px] font-bold text-neutral-600 uppercase">{sub}</p>
    </div>
  </button>
);

const ContactCard = ({ icon, title, val }: any) => (
  <div className="p-6 rounded-[2rem] bg-neutral-950 border border-white/5 flex items-center gap-6">
    <div className="p-3 bg-black rounded-2xl border border-white/5">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase text-neutral-700 tracking-widest mb-1">{title}</p>
      <p className="text-sm font-bold text-neutral-200">{val}</p>
    </div>
  </div>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
);