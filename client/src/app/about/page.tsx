"use client";

import React from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import Footer from "@/components/Footer";

function AboutPage() {
  const teamMembers = [
    {
      quote:
        "Turning ideas into action and leading our team to make PaperTube a seamless learning tool for everyone.",
      name: "Om Avchar",
      designation: "Founder & Team Lead",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
    },
    {
      quote:
        "Bringing creative UI concepts and smart design ideas that make PaperTube's experience smooth and beautiful.",
      name: "Gulshan Sahu",
      designation: "Frontend Developer",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop",
    },
    {
      quote:
        "Focused on performance, logic, and making sure our backend stays fast and reliable for every user.",
      name: "Prajwal Charthad",
      designation: "Backend Developer",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
    },
    {
      quote:
        "Ensuring a smooth user journey and meaningful experiences throughout the platform.",
      name: "Sakshi Taksande",
      designation: "UI/UX Designer",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop",
    },
    {
      quote:
        "Dedicated to ensuring every feature runs flawlessly and every learner gets the best PaperTube experience.",
      name: "Chetan Balki",
      designation: "Quality & Testing",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto text-center">
        {/* --- Hero Section --- */}
        <div className="mb-20">
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              About <span className="text-[#da3023]">PaperTube</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              PaperTube is your AI-powered learning companion — transforming long
              YouTube lectures into clear, time-stamped, and beautifully designed
              notes within minutes.  
              <br className="hidden md:block" />
              Our mission is to make learning smarter, faster, and more enjoyable
              for every student, creator, and lifelong learner.
            </p>
          </div>
        </div>

        {/* --- Mission Section --- */}
        <div className="mb-20">
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-2xl">
            <h2 className="text-2xl md:text-4xl font-semibold text-white mb-6 tracking-tight">
              🌟 Our Vision & Mission
            </h2>
            <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              We believe that knowledge should be accessible, organized, and fun.
              With PaperTube, you don't just watch — you <span className="font-bold">understand</span>, <span className="font-bold">summarize</span>,
              and <span className="font-bold">remember</span> better.
              Our team is passionate about using AI to simplify education and
              empower millions to learn in their own style.
            </p>
          </div>
        </div>

        {/* --- Team Section --- */}
        <div className="mt-20">
          <div className="mb-16">
            <div className="glass-card p-8 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Meet the Team
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto font-light">
                A small but dedicated group of dreamers, builders, and learners
                working together to change how people take notes.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-2xl">
            <AnimatedTestimonials testimonials={teamMembers} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.02) 100%);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .glass-card:hover {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.07) 0%,
            rgba(255, 255, 255, 0.03) 100%);
          border-color: rgba(255, 255, 255, 0.12);
          transition: all 0.3s ease;
        }
      `}</style>
   <div className="mt-20">
   <Footer/>
   </div>
    </div>);
}

export default AboutPage;