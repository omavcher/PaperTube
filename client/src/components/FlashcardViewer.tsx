"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Image as ImageIcon, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardViewer({ content }: { content: string }) {
  // Parse content
  let cards: Flashcard[] = [];
  try {
    const rawJSON = content.replace(/^```[a-zA-Z]*\s*\n?/m, '').replace(/```\s*$/m, '').trim();
    cards = JSON.parse(rawJSON);
    if (!Array.isArray(cards)) throw new Error("Not an array");
  } catch (e) {
    return <div className="p-10 text-red-500 flex flex-col items-center justify-center w-full h-full">
        <h2 className="text-xl font-bold mb-2">Error parsing flashcards</h2>
        <p className="text-sm opacity-70">The AI model did not return a valid JSON format.</p>
    </div>;
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleExportSelected = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    toast.info("Generating image...", { id: "export-toast" });
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#0a0a0a', useCORS: true });
      canvas.toBlob((blob) => {
        if (blob) {
            saveAs(blob, `flashcard-${activeIndex + 1}.png`);
            toast.success("Downloaded successfully!", { id: "export-toast" });
        }
      });
    } catch (e) {
      toast.error("Export failed!", { id: "export-toast" });
    }
    setIsExporting(false);
  };

  if (!cards.length) return <div className="p-10 w-full h-full flex items-center justify-center">No flashcards generated.</div>;

  const currentCard = cards[activeIndex];

  return (
    <div className="flex w-full h-full bg-neutral-950 text-white overflow-hidden pb-[70px] lg:pb-0">
      
      {/* Sidebar List */}
      <div className="w-[100px] lg:w-72 border-r border-white/10 flex flex-col h-full bg-neutral-900/40 backdrop-blur-md z-10 shrink-0">
         <div className="p-5 border-b border-white/5 hidden lg:block bg-black/20">
            <h2 className="font-black text-xl tracking-tight text-white/90">Deck Stack <span className="text-red-500 ml-1 font-mono">{cards.length}</span></h2>
         </div>
         <div className="flex-1 overflow-y-auto w-full custom-scrollbar p-3 space-y-3">
            {cards.map((card, idx) => (
               <button 
                  key={idx}
                  onClick={() => { setActiveIndex(idx); setIsFlipped(false); }}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                      idx === activeIndex 
                          ? 'bg-red-600/10 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.15)]' 
                          : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
               >
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center justify-between ${idx === activeIndex ? 'text-red-400' : 'text-neutral-500'}`}>
                      <span className="hidden lg:inline">Card</span>
                      <span className="lg:hidden mx-auto">#{idx + 1}</span>
                      <span className="hidden lg:inline font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                  </div>
                  <div className={`font-bold lg:text-sm text-[10px] line-clamp-3 leading-relaxed truncate lg:whitespace-normal ${idx === activeIndex ? 'text-white' : 'text-neutral-400'}`}>
                      {card.front}
                  </div>
               </button>
            ))}
         </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col relative px-4 lg:px-12 py-10 items-center justify-center overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]">
         
         {/* Export Controls */}
         <div className="absolute top-6 right-6 flex gap-3 z-20">
            <button 
              onClick={handleExportSelected} 
              disabled={isExporting}
              className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
            >
               {isExporting ? <span className="animate-pulse">Saving...</span> : <><Download size={14} /> Save PNG</>}
            </button>
         </div>

         {/* 3D Flip Card */}
         <div className="w-full max-w-3xl aspect-[4/3] lg:aspect-[16/9] mt-6" style={{ perspective: '1500px' }}>
            <motion.div 
               ref={cardRef}
               className="w-full h-full relative cursor-pointer group"
               animate={{ rotateX: isFlipped ? 180 : 0 }}
               transition={{ duration: 0.7, type: "spring", stiffness: 60, damping: 15 }}
               onClick={() => setIsFlipped(!isFlipped)}
               style={{ transformStyle: 'preserve-3d' }}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
            >
               {/* FRONT */}
               <div 
                  className="absolute inset-0 w-full h-full rounded-[2rem] bg-neutral-900 border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 lg:p-16 text-center" 
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateX(0deg)' }}
               >
                  <span className="absolute top-8 left-8 text-[11px] font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500"></span> Concept
                  </span>
                  
                  {/* Subtle decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay rounded-[2rem] pointer-events-none" />
                  
                  <h2 className="text-2xl lg:text-4xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 max-w-[90%] z-10">
                      {currentCard.front}
                  </h2>
                  
                  <span className="absolute bottom-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-400 uppercase tracking-widest animate-pulse backdrop-blur-md">
                      Tap to reveal
                  </span>
               </div>
               
               {/* BACK */}
               <div 
                  className="absolute inset-0 w-full h-full rounded-[2rem] bg-[#050505] border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.1)] flex flex-col items-center justify-center p-8 lg:p-16 text-center" 
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
               >
                  <span className="absolute top-8 left-8 text-[11px] font-bold tracking-widest text-red-500 uppercase flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></span> Knowledge
                  </span>
                  
                  <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay rounded-[2rem] pointer-events-none" />
                  
                  <div className="w-full flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar relative z-10 mt-12 mb-12">
                     <p className="text-base lg:text-xl font-medium leading-relaxed text-neutral-200">
                         {currentCard.back}
                     </p>
                  </div>
               </div>
            </motion.div>
         </div>

         {/* Navigation */}
         <div className="mt-12 flex items-center gap-6 bg-black/40 p-2 rounded-full border border-white/5 backdrop-blur-md">
            <button 
              onClick={() => { setActiveIndex(Math.max(0, activeIndex - 1)); setIsFlipped(false); }}
              disabled={activeIndex === 0}
              className="p-4 bg-white/5 rounded-full hover:bg-white/10 hover:text-white text-neutral-400 disabled:opacity-20 disabled:pointer-events-none transition-all"
            >
               <ChevronLeft size={20} />
            </button>
            
            <div className="flex flex-col items-center min-w-[60px]">
               <span className="font-mono font-bold text-white text-lg tracking-widest">
                  {(activeIndex + 1).toString().padStart(2, '0')}<span className="text-neutral-600">/{(cards.length).toString().padStart(2, '0')}</span>
               </span>
            </div>
            
            <button 
              onClick={() => { setActiveIndex(Math.min(cards.length - 1, activeIndex + 1)); setIsFlipped(false); }}
              disabled={activeIndex === cards.length - 1}
              className="p-4 bg-white/5 rounded-full hover:bg-white/10 hover:text-white text-neutral-400 disabled:opacity-20 disabled:pointer-events-none transition-all"
            >
               <ChevronRight size={20} />
            </button>
         </div>

      </div>
    </div>
  );
}
