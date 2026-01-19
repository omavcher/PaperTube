"use client";

import React from "react";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { 
  Sparkles, Target, Zap, Users, Globe, BookOpen, Heart, 
  Lightbulb, Rocket, TrendingUp, Shield, Clock, FileText, 
  Brain, Cpu, Code, Palette, CheckCircle, ArrowRight, 
  Linkedin, Github, Twitter, Mail, Activity, Terminal, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";

function AboutPage() {
  const founderInfo = {
    name: "Om Avchar",
    role: "Founder & CEO",
    bio: "A passionate developer and entrepreneur with a vision to revolutionize how people learn from video content. With background in computer science and AI, Om started PaperTube to solve the problem of information overload in educational videos.",
    education: "B.Tech in Computer Science",
    expertise: ["AI/ML", "Full-Stack Dev", "Neural Logic", "System Architecture"],
    social: {
      linkedin: "https://linkedin.com/in/omavchar",
      github: "https://github.com/omavchar",
      twitter: "https://twitter.com/omavchar",
      email: "om@papertube.ai"
    },
    quote: "Education should be accessible, organized, and efficient. That's why we built PaperTube.",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  };

  const coreValues = [
    { icon: <Lightbulb />, title: "Innovation First", description: "Constantly pushing boundaries in AI-powered learning technology", color: "text-blue-500", bg: "bg-blue-500/5" },
    { icon: <Heart />, title: "User-Centric", description: "Every feature is designed with the learner's experience in mind", color: "text-red-500", bg: "bg-red-500/5" },
    { icon: <Shield />, title: "Secure Data", description: "Learning materials protected with enterprise-grade encryption", color: "text-emerald-500", bg: "bg-emerald-500/5" },
    { icon: <Globe />, title: "Accessibility", description: "Making quality education tools available to everyone, everywhere", color: "text-purple-500", bg: "bg-purple-500/5" },
    { icon: <Rocket />, title: "Fast Evolution", description: "Evolving at light-speed to meet modern learning demands", color: "text-orange-500", bg: "bg-orange-500/5" },
    { icon: <Users />, title: "Community Driven", description: "Building tools that empower global learning communities", color: "text-indigo-500", bg: "bg-indigo-500/5" },
  ];

  const milestones = [
    { year: "2023", title: "Concept Sync", description: "PaperTube conceived during an intense engineering hackathon.", icon: <Lightbulb /> },
    { year: "2024 Q1", title: "Kernel Prototype", description: "First AI synthesis model deployed for video parsing.", icon: <Code /> },
    { year: "2024 Q2", title: "Beta Protocol", description: "System released to initial 1,000 verified testers.", icon: <Rocket /> },
    { year: "Present", title: "Scaling Nodes", description: "Supporting thousands of global students monthly.", icon: <Globe /> },
  ];

  const technologyStack = [
    { category: "Frontend", techs: ["Next.js 15", "React", "Tailwind"], icon: <Palette /> },
    { category: "Backend", techs: ["Node.js", "Redis", "Docker"], icon: <Cpu /> },
    { category: "AI/ML", techs: ["LangChain", "OpenAI", "Whisper"], icon: <Brain /> },
    { category: "Cloud", techs: ["AWS", "Vercel", "Cloudflare"], icon: <ShieldCheck /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans">
      {/* Background Matrix HUD */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-radial-gradient from-red-600/10 via-transparent to-transparent"></div>
      </div>

      {/* --- HERO SECTION: Mission Briefing --- */}
      <section className="relative pt-32 pb-20 overflow-hidden z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-3/5 space-y-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 rounded-full bg-red-600/10 border border-red-600/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                <Activity size={12} /> Personnel Dossier v1.0
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
                WE FORGE <br />
                <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">KNOWLEDGE</span>
              </h1>
              
              <p className="text-lg text-neutral-500 font-medium leading-relaxed max-w-2xl uppercase tracking-tight">
                PaperTube is your AI-powered learning companion — transforming raw 
                YouTube data into high-density, timestamped intelligence artifacts. 
                Our mission: <span className="text-white italic">Eradicate information overload.</span>
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusMetric label="Established" value="2023" />
                <StatusMetric label="Personnel" value="01" />
                <StatusMetric label="Active Nodes" value="5K+" />
                <StatusMetric label="Uptime" value="99.9%" />
              </div>
            </div>

            <div className="lg:w-2/5 w-full">
              <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={120} /></div>
                 <h3 className="text-xl font-black italic uppercase text-red-500 mb-6 flex items-center gap-2">
                    <ShieldCheck size={20} /> Operational Vision
                 </h3>
                 <p className="text-sm text-neutral-400 leading-relaxed font-medium mb-8">
                    To build the world's most intuitive learning terminal, converting passive consumption into a tactile, active performance of the mind.
                 </p>
                 <div className="space-y-3">
                    <CheckItem text="Accessible education infrastructure" />
                    <CheckItem text="70% average study time compression" />
                    <CheckItem text="Personalized neural mapping" />
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOUNDER SECTION: The Architect --- */}
      <section className="py-24 relative z-10 bg-neutral-900/30 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
             <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">THE <span className="text-red-600">ARCHITECT</span></h2>
             <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.4em]">Verified Personnel Signature</p>
          </div>

          <div className="max-w-5xl mx-auto rounded-[3.5rem] p-1 bg-gradient-to-br from-red-600/20 to-transparent border border-white/5 shadow-3xl overflow-hidden">
            <div className="bg-[#080808] rounded-[3.4rem] p-8 md:p-16 flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/3 flex flex-col items-center space-y-6">
                <div className="relative h-64 w-64 rounded-3xl overflow-hidden border-4 border-red-600/20 shadow-2xl">
                   <Image src={founderInfo.src} alt={founderInfo.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="text-center">
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter">{founderInfo.name}</h3>
                   <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{founderInfo.role}</p>
                </div>
                <div className="flex gap-4">
                  <SocialBtn icon={<Linkedin size={18}/>} link={founderInfo.social.linkedin} />
                  <SocialBtn icon={<Github size={18}/>} link={founderInfo.social.github} />
                  <SocialBtn icon={<Twitter size={18}/>} link={founderInfo.social.twitter} />
                </div>
              </div>

              <div className="md:w-2/3 space-y-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2"><Terminal size={12} className="text-red-500"/> Core Profile</h4>
                  <p className="text-neutral-400 font-medium leading-relaxed italic">"{founderInfo.bio}"</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Specialized Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {founderInfo.expertise.map((exp) => (
                      <Badge key={exp} variant="outline" className="bg-white/5 border-white/10 text-neutral-400 font-black uppercase text-[9px] px-3 py-1 italic">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-red-600/5 border border-red-600/20 relative">
                   <p className="text-white font-black italic uppercase tracking-tight text-lg leading-tight">
                     "{founderInfo.quote}"
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* --- CORE VALUES: System Modules --- */}
<section className="py-24 z-10 relative">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coreValues.map((v, i) => (
        <Card key={i} className="bg-neutral-950 border-white/5 rounded-3xl p-8 hover:border-red-600/30 transition-all duration-500 group">
          <div className={cn("inline-flex p-4 rounded-2xl mb-6 transition-all duration-500 group-hover:scale-110", v.color, v.bg)}>
            {/* FIX: Cast the icon to an element that accepts a size prop */}
            {React.isValidElement(v.icon) ? 
              React.cloneElement(v.icon as React.ReactElement<{ size?: number }>, { size: 28 }) 
              : null
            }
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-3">{v.title}</h3>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed uppercase tracking-tight">{v.description}</p>
        </Card>
      ))}
    </div>
  </div>
</section>

      {/* --- TECH STACK: The Engine --- */}
      <section className="py-24 bg-black relative z-10 overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-4">
           <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/3">
                 <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">THE <span className="text-red-600">STACK</span></h2>
                 <p className="text-neutral-500 font-bold uppercase text-xs tracking-[0.2em]">System Architecture & Infrastructure</p>
              </div>
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {technologyStack.map((s, i) => (
                   <div key={i} className="p-6 rounded-[2rem] bg-neutral-900 border border-white/5 flex items-center gap-6">
                      <div className="text-red-600">{s.icon}</div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-neutral-600 tracking-widest mb-1">{s.category}</p>
                         <p className="text-sm font-bold text-neutral-200">{s.techs.join(" • ")}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* --- JOURNEY: Operation Log --- */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
           <div className="text-center mb-16">
              <Badge className="bg-red-600 text-white font-black italic uppercase px-4 py-1 mb-4">Operational Timeline</Badge>
           </div>
           <div className="relative border-l-2 border-red-600/20 ml-4 md:ml-0 md:pl-0">
              {milestones.map((m, i) => (
                <div key={i} className="mb-12 relative pl-10">
                   <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-black border-4 border-red-600 z-20 shadow-[0_0_15px_red]" />
                   <div className="bg-neutral-950 border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-red-500 font-black italic font-mono text-xl">{m.year}</span>
                        <div className="h-px bg-white/10 flex-1" />
                        <div className="text-neutral-700">{m.icon}</div>
                      </div>
                      <h4 className="text-lg font-black italic uppercase tracking-widest text-white mb-2">{m.title}</h4>
                      <p className="text-sm text-neutral-500 font-medium uppercase tracking-tight">{m.description}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- FINAL CTA: Join System --- */}
      <section className="container mx-auto px-4 py-24 z-10 relative">
        <div className="relative rounded-[4rem] bg-red-600 overflow-hidden p-16 md:p-24 text-center shadow-[0_0_100px_rgba(220,38,38,0.2)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] opacity-30" />
          <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-8 leading-none">
            READY TO <span className="text-black/40">EVOLVE?</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
             <Button onClick={() => window.location.href = '/'} className="h-16 px-10 bg-black text-white font-black italic uppercase rounded-2xl text-lg hover:bg-neutral-900 transition-all shadow-2xl">
               Start Generating Notes <ArrowRight className="ml-2" />
             </Button>
             <Button onClick={() => window.location.href = '/pricing'} variant="outline" className="h-16 px-10 border-white/20 text-white font-black italic uppercase rounded-2xl text-lg hover:bg-white/10">
               View Access Tiers
             </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* --- Visual Helpers --- */

const StatusMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="text-left space-y-1">
     <p className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-600">{label}</p>
     <p className="text-2xl font-black uppercase italic text-white leading-none">{value}</p>
  </div>
);

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
      <CheckCircle size={12} />
    </div>
    <span className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">{text}</span>
  </div>
);

const SocialBtn = ({ icon, link }: { icon: React.ReactNode, link: string }) => (
  <button onClick={() => window.open(link, '_blank')} className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 hover:text-red-500 hover:border-red-600/40 transition-all active:scale-90">
    {icon}
  </button>
);

export default AboutPage;