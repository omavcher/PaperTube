"use client";
import React from "react";
import { MessageSquarePlus, Bug, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function FeebackDailogBox() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/10 p-8 md:p-16 text-center">
        
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            Public Beta Channel
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-2xl">
            ENCOUNTERING A <span className="text-red-500">GLITCH?</span>
          </h2>
          
          <p className="text-neutral-400 text-sm md:text-lg max-w-xl leading-relaxed">
            PaperTube is evolving rapidly. Your feedback helps us calibrate the neural engine. 
            Report bugs or request features directly to the core team.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-8 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <MessageSquarePlus className="mr-2 h-4 w-4" /> 
              Request Feature
            </Button>
            
            <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-white/10 bg-transparent text-white hover:bg-red-600 hover:border-red-600 hover:text-white font-bold rounded-xl transition-all">
              <Bug className="mr-2 h-4 w-4" /> 
              Report Bug
            </Button>
          </div>
        </div>

        {/* Decorative Grid Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_top,black,transparent)] pointer-events-none" />
      </div>
    </div>
  );
}

export default FeebackDailogBox;