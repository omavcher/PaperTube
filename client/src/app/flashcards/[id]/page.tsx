"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  IconArrowLeft,
  IconRotateClockwise,
  IconBrain,
  IconShare,
  IconDotsVertical,
  IconX,
  IconCheck,
  IconCards,
  IconKeyboard,
  IconPhoto,
  IconListDetails,
  IconAbc,
  IconLoader
} from "@tabler/icons-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Types ---
interface Flashcard {
  id: number;
  type: string;
  front: string;
  back: string;
  image?: string;
  mnemonic?: string;
  category: string;
  difficulty: string;
}

interface FlashcardSet {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  flashcards: Flashcard[];
  generationDetails: {
    cardCount: number;
    language: string;
    processingTime: number;
  };
  createdAt: string;
}

export default function FlashcardPlayer() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;

  // Data State
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  // Learning State
  const [masteredIds, setMasteredIds] = useState<number[]>([]);
  const [reviewIds, setReviewIds] = useState<number[]>([]);

  // Fetch flashcard data
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/flashcards/set/${slug}`, {
          headers: {
            'Auth': authToken,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flashcard set');
        }

        const data = await response.json();

        if (data.success) {
          setFlashcardSet(data.data);
        } else {
          throw new Error(data.message || 'Failed to load flashcards');
        }
      } catch (err: any) {
        console.error('Error fetching flashcards:', err);
        setError(err.message || 'Failed to load flashcards');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchFlashcardSet();
    }
  }, [slug, router]);

  // Define flashcards and currentCard variables
  const flashcards = flashcardSet?.flashcards || [];
  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;
  const masteryPercentage = flashcards.length > 0 ? Math.round((masteredIds.length / flashcards.length) * 100) : 0;

  // --- Handlers ---

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 200);
    }
  }, [currentIndex, flashcards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 200);
    }
  }, [currentIndex]);

  const handleRating = (rating: 'hard' | 'easy') => {
    if (!currentCard) return;

    if (rating === 'easy') {
      if (!masteredIds.includes(currentCard.id)) {
        setMasteredIds(prev => [...prev, currentCard.id]);
        setReviewIds(prev => prev.filter(id => id !== currentCard.id));
      }
    } else {
      if (!reviewIds.includes(currentCard.id)) {
        setReviewIds(prev => [...prev, currentCard.id]);
        setMasteredIds(prev => prev.filter(id => id !== currentCard.id));
      }
    }
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds([]);
    setReviewIds([]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isFlipped]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <IconLoader className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-neutral-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !flashcardSet) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <IconX className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-neutral-400 mb-4">{error || 'Flashcard set not found'}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  // Helper to render card type icon
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'visual': return <IconPhoto className="w-4 h-4" />;
      case 'detailed': return <IconListDetails className="w-4 h-4" />;
      case 'mnemonic': return <IconAbc className="w-4 h-4" />;
      default: return <IconBrain className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col items-center relative font-sans selection:bg-purple-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* --- Header --- */}
      <header className="w-full max-w-5xl mx-auto p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800">
            <IconArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {flashcardSet.thumbnail && (
                <Image 
                  src={flashcardSet.thumbnail} 
                  alt="Video thumbnail" 
                  width={32} 
                  height={18} 
                  className="w-8 h-4.5 rounded object-cover border border-neutral-700" 
                />
              )}
              <IconCards className="w-5 h-5 text-purple-400" />
              {flashcardSet.title}
            </h1>
            <span className="text-xs text-neutral-500">{flashcards.length} Cards • Generated from YouTube</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs text-neutral-400 mr-2">
             <IconKeyboard className="w-4 h-4" />
             <span>Space to flip</span>
           </div>
           <Button variant="outline" className="border-neutral-800 bg-black/50 hover:bg-neutral-900 text-neutral-300 gap-2 hidden sm:flex">
             <IconShare className="w-4 h-4" /> Share
           </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-10 h-10 p-0 rounded-full hover:bg-neutral-800">
                  <IconDotsVertical className="w-5 h-5 text-neutral-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-300">
                <DropdownMenuItem onClick={handleReset}><IconRotateClockwise className="w-4 h-4 mr-2"/> Reset Progress</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </header>

      {/* --- Main Game Area --- */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 relative z-10">
        
        {/* Progress Bars */}
        <div className="w-full max-w-xl mb-8 space-y-2">
           <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Card {currentIndex + 1} of {flashcards.length}</span>
              <span className="text-purple-400 font-medium">Mastery: {masteryPercentage}%</span>
           </div>
           <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
           </div>
           <div className="flex h-0.5 w-full rounded-full overflow-hidden opacity-50">
              <div style={{ width: `${(masteredIds.length / flashcards.length) * 100}%` }} className="bg-green-500 transition-all duration-500" />
              <div style={{ width: `${(reviewIds.length / flashcards.length) * 100}%` }} className="bg-red-500 transition-all duration-500" />
           </div>
        </div>

        {/* The Card Perspective Container */}
        <div className="relative w-full max-w-xl aspect-[4/3] sm:aspect-[16/10] perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction * 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full relative preserve-3d cursor-pointer group"
              onClick={handleFlip}
            >
              <motion.div
                className={cn(
                  "w-full h-full relative rounded-3xl transition-all duration-500 preserve-3d shadow-2xl",
                )}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
              >
                
                {/* --- FRONT SIDE --- */}
                <div className="absolute inset-0 backface-hidden bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:border-purple-500/30 transition-colors">
                  
                  {/* Decorative Header */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 uppercase tracking-widest border border-white/5 flex items-center gap-1">
                      {getTypeIcon(currentCard.type)}
                      {currentCard.type}
                    </span>
                  </div>

                  {/* VISUAL CARD LOGIC */}
                  {currentCard.type === 'visual' && (
                    <div className="absolute inset-0 z-0">
                       <img src={currentCard.image} alt="card visual" className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" />
                       <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent" />
                    </div>
                  )}

                  {/* Content Container */}
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                    
                    {/* MNEMONIC CARD LOGIC */}
                    {currentCard.type === 'mnemonic' && (
                      <div className="mb-4">
                        <span className="text-purple-400 text-xs font-bold tracking-[0.2em] uppercase bg-purple-500/10 px-3 py-1 rounded-full">Mnemonic Aid</span>
                      </div>
                    )}

                    <h2 className={cn(
                      "font-bold text-white leading-tight",
                      currentCard.type === 'mnemonic' ? "text-xl sm:text-2xl italic text-purple-100" : "text-2xl sm:text-4xl"
                    )}>
                      {currentCard.type === 'mnemonic' ? `"${currentCard.mnemonic}"` : currentCard.front}
                    </h2>

                    {currentCard.type === 'mnemonic' && (
                      <p className="mt-4 text-sm text-neutral-400">What does this stand for?</p>
                    )}

                    <p className="absolute bottom-8 text-neutral-500 text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Tap to Flip
                    </p>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />
                </div>

                {/* --- BACK SIDE --- */}
                <div 
                  className="absolute inset-0 backface-hidden bg-neutral-900 border border-purple-500/20 rounded-3xl flex flex-col p-8 sm:p-12"
                  style={{ transform: "rotateY(180deg)" }}
                >
                   {/* Decorative Header */}
                   <div className="absolute top-6 left-6">
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-purple-900/30 text-purple-300 uppercase tracking-widest border border-purple-500/20">
                      Answer
                    </span>
                  </div>

                  {/* Content */}
                  <div className={cn(
                    "flex-1 flex flex-col justify-center overflow-y-auto w-full custom-scrollbar",
                    currentCard.type === 'detailed' || currentCard.type === 'mnemonic' ? "items-start text-left" : "items-center text-center"
                  )}>
                     <div className="text-lg sm:text-xl text-neutral-200 leading-relaxed font-medium whitespace-pre-line">
                        {currentCard.back}
                     </div>
                  </div>

                  {/* Rating / Actions Area */}
                  <div className="w-full mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleRating('hard')}
                      className="group flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/50 transition-all"
                    >
                      <div className="p-2 rounded-full bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                        <IconX className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-red-400 uppercase tracking-wide">Review</span>
                    </button>

                    <button 
                      onClick={() => handleRating('easy')}
                      className="group flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 hover:border-green-500/50 transition-all"
                    >
                      <div className="p-2 rounded-full bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                        <IconCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-green-400 uppercase tracking-wide">Mastered</span>
                    </button>
                  </div>

                </div>

              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button 
             onClick={handlePrev}
             disabled={currentIndex === 0}
             className="absolute top-1/2 -left-4 sm:-left-16 -translate-y-1/2 p-3 rounded-full bg-neutral-800/50 text-white hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button 
             onClick={handleNext}
             disabled={currentIndex === flashcards.length - 1}
             className="absolute top-1/2 -right-4 sm:-right-16 -translate-y-1/2 p-3 rounded-full bg-neutral-800/50 text-white hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </main>

      {/* --- Footer / Legend --- */}
      <footer className="w-full p-6 text-center z-10">
        <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-neutral-900/80 border border-white/5 backdrop-blur-md">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
             <span className="text-xs text-neutral-400">Mastered: {masteredIds.length}</span>
           </div>
           <div className="w-px h-3 bg-white/10"></div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
             <span className="text-xs text-neutral-400">Review: {reviewIds.length}</span>
           </div>
           <div className="w-px h-3 bg-white/10"></div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-neutral-500"></div>
             <span className="text-xs text-neutral-400">Remaining: {flashcards.length - masteredIds.length - reviewIds.length}</span>
           </div>
        </div>
      </footer>

      {/* --- CSS Utilities for 3D Flip --- */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        /* Custom scrollbar for long answers */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
      `}</style>

    </div>
  );
}