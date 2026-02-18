"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  LifeBuoy, 
  Briefcase, 
  ArrowUpRight, 
  MapPin,
  Globe,
  Users
} from "lucide-react";
import Footer from "@/components/Footer";

// --- Configuration ---
const CONTACT_CHANNELS = [
  {
    id: "support",
    title: "Technical Support",
    description: "Issues with AI Note Generation or tool access?",
    action: "support@papertube.ai",
    icon: LifeBuoy,
    delay: 0.1
  },
  {
    id: "business",
    title: "Business & API",
    description: "For enterprise licensing and educational partnerships.",
    action: "partners@papertube.ai",
    icon: Briefcase,
    delay: 0.2
  },
  {
    id: "community",
    title: "Community",
    description: "Join our Discord to discuss features and games.",
    action: "discord.gg/papertube",
    icon: Users,
    delay: 0.3
  },
  {
    id: "general",
    title: "General Inquiries",
    description: "Feedback, suggestions, or just saying hello.",
    action: "hello@papertube.ai",
    icon: Mail,
    delay: 0.4
  }
];

export default function ContactClient() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-neutral-800 selection:text-white font-sans flex flex-col">
      
      {/* --- Background Atmosphere --- */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>
      
      {/* --- Main Content --- */}
      <main className="relative z-10 flex-grow w-full max-w-5xl mx-auto px-6 py-24 flex flex-col items-center justify-center">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-20 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            Communication Hub
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
            Get in Touch
          </h1>
          
          <p className="text-lg text-neutral-400 font-light leading-relaxed">
            We are here to help you optimize your learning workflow. 
            Choose a channel below to connect with the right team.
          </p>
        </motion.div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-16">
          {CONTACT_CHANNELS.map((channel) => (
            <motion.a
              key={channel.id}
              href={channel.action.includes('@') ? `mailto:${channel.action}` : `https://${channel.action}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: channel.delay, duration: 0.4 }}
              className="group relative p-8 rounded-3xl bg-neutral-900/40 border border-white/5 hover:bg-neutral-800/60 hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-48 overflow-hidden"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 rounded-xl bg-black border border-white/10 text-neutral-400 group-hover:text-white group-hover:border-white/20 transition-all">
                  <channel.icon size={24} />
                </div>
                <ArrowUpRight className="text-neutral-600 group-hover:text-white transition-colors" size={20} />
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">{channel.title}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2">{channel.description}</p>
                <div className="mt-4 text-xs font-mono text-neutral-400 uppercase tracking-wider group-hover:text-blue-400 transition-colors">
                  {channel.action}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Global Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-neutral-500 text-xs font-medium uppercase tracking-widest border-t border-white/5 pt-10 w-full"
        >
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>Remote / Global</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} />
            <span>UTC - UTC+5:30</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare size={14} />
            <span>Reply Time: ~24h</span>
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}