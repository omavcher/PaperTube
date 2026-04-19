"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, CheckCircle2, XCircle, 
  Flag, Calculator, Clock, Play, GraduationCap, ArrowRight,
  RefreshCw, CheckSquare, Brain, Medal, Lock, X, LayoutGrid, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import api from '@/config/api';

export default function PracticeTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [started, setStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Time tracking
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await api.get(`/test/${slug}`, {
          headers: { 'Auth': token }
        });
        if (res.data?.success && res.data?.test) {
          setTestData(res.data.test);
          setTimeLeft(res.data.test.questions?.length ? res.data.test.questions.length * 60 : 30 * 60);
        } else {
          setError('Failed to load test data.');
        }
      } catch (err) {
        setError('Test not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [slug]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (started && !submitted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !submitted) {
      calculateScore();
    }
    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (qId: string, val: any, type: string) => {
    if (type === 'MSQ') {
      setAnswers(prev => {
        const current = prev[qId] || [];
        if (current.includes(val)) return { ...prev, [qId]: current.filter((v: string) => v !== val) };
        return { ...prev, [qId]: [...current, val] };
      });
    } else {
      setAnswers(prev => ({ ...prev, [qId]: val }));
    }
  };

  const calculateScore = () => {
    if (!testData || !testData.questions) return;
    let newScore = 0;
    testData.questions.forEach((q: any) => {
      const uAns = answers[q.id];
      if (uAns === undefined || uAns === '') return;

      if (q.type === 'MCQ' || q.type === 'FITB') {
        if (typeof uAns === 'string' && uAns.toLowerCase().trim() === (q.correctAnswer || '').toLowerCase().trim()) {
          newScore++;
        }
      } else if (q.type === 'NAT') {
        const diff = Math.abs(parseFloat(uAns) - parseFloat(q.correctAnswer));
        if (diff <= (q.tolerance || 0)) {
          newScore++;
        }
      } else if (q.type === 'MSQ') {
        const correct = q.correctAnswers || [];
        if (Array.isArray(uAns) && correct.length === uAns.length && correct.every((v: string) => uAns.includes(v))) {
          newScore++;
        }
      }
    });
    setScore(newScore);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white pb-32">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="font-mono text-sm text-neutral-400 animate-pulse">Loading secure test environment...</p>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <XCircle className="text-red-500 mb-6" size={64} />
        <h2 className="text-2xl font-bold mb-4">{error || "Test Not Found"}</h2>
        <Link href="/" className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const QUESTIONS = testData.questions || [];
  
  if (!started) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden pb-12 pt-28">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full relative z-10 text-center">
            <div className="w-16 h-16 bg-[#0a0a0a] border border-white/10 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm">
               <GraduationCap size={28} className="text-white" strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
               {testData.title || "Practice Test"}
            </h1>
            
            <p className="text-lg text-neutral-400 mb-12 max-w-lg mx-auto leading-relaxed">
               Ready to test your knowledge? This timed evaluation adapts to your pace. Stay focused.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-16">
               <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg mb-3"><LayoutGrid size={16} className="text-blue-500" /></div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{QUESTIONS.length} Questions</span>
               </div>
               <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="p-2 bg-purple-500/10 rounded-lg mb-3"><Clock size={16} className="text-purple-500" /></div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{Math.floor(timeLeft/60)} Minutes</span>
               </div>
               <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="p-2 bg-orange-500/10 rounded-lg mb-3"><Brain size={16} className="text-orange-500" /></div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Adaptive</span>
               </div>
               <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="p-2 bg-emerald-500/10 rounded-lg mb-3"><Medal size={16} className="text-emerald-500" /></div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Scored</span>
               </div>
            </div>

            <button onClick={() => setStarted(true)} className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95">
               <Play size={16} className="text-black fill-black" /> Start Test Now
            </button>
            <div className="mt-6">
              <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Cancel & Return</Link>
            </div>
         </motion.div>
      </div>
    );
  }

  if (submitted) {
    const percentage = Math.round((score / QUESTIONS.length) * 100) || 0;
    return (
      <div className="min-h-[100dvh] bg-[#060606] text-white font-sans pb-32">
        <header className="fixed top-0 inset-x-0 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 flex items-center px-4 lg:px-8 z-50">
           <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft size={16} /> Dashboard
           </Link>
           <div className="ml-auto font-mono text-xs tracking-widest font-bold text-white">SCORECARD</div>
        </header>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto pt-40 px-4 mb-20 text-center">
             <div className="mb-10">
                <div className="w-40 h-40 mx-auto rounded-full border-4 border-white/5 bg-[#0a0a0a] flex items-center justify-center flex-col relative shadow-sm">
                   <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Score</span>
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter text-white">{percentage}</span>
                      <span className="text-xl text-neutral-500 font-bold">%</span>
                   </div>
                </div>
             </div>
             
             <h2 className="text-2xl font-bold mb-3 tracking-tight">{percentage >= 75 ? "Excellent Work" : percentage >= 40 ? "Good Effort" : "Keep Practicing"}</h2>
             <p className="text-neutral-400 mb-8 max-w-sm mx-auto text-sm">You successfully answered <span className="font-bold text-white text-base">{score}</span> out of <span className="font-bold text-white text-base">{QUESTIONS.length}</span> questions correctly.</p>
             
             <div className="flex justify-center gap-3">
                <button onClick={() => { setStarted(false); setSubmitted(false); setAnswers({}); setCurrentQIndex(0); setTimeLeft(QUESTIONS.length * 60); }} className="px-6 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex justify-center items-center gap-2">
                    <RefreshCw size={14} /> Retry Test
                </button>
             </div>
        </motion.div>

        {/* Review Section */}
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg"><CheckSquare size={16} className="text-blue-500" /></div>
             <h3 className="text-xl font-bold tracking-tight">Review Answers</h3>
          </div>
          
          {QUESTIONS.map((q: any, i: number) => {
             const uAns = answers[q.id];
             let isCorrect = false;
             if (q.type === 'MCQ' || q.type === 'FITB') {
               isCorrect = typeof uAns === 'string' && uAns.toLowerCase().trim() === (q.correctAnswer || '').toLowerCase().trim();
             } else if (q.type === 'NAT') {
               isCorrect = Math.abs(parseFloat(uAns) - parseFloat(q.correctAnswer as string)) <= (q.tolerance||0);
             } else if (q.type === 'MSQ') {
               isCorrect = Array.isArray(q.correctAnswers) && Array.isArray(uAns) && q.correctAnswers.length === uAns.length && q.correctAnswers.every((v: string) => uAns.includes(v));
             }

             return (
               <div key={q.id} className={cn("p-6 md:p-8 rounded-2xl border", isCorrect ? "bg-[#0a0a0a] border-white/[0.05]" : "bg-red-500/5 border-red-500/20")}>
                  <div className="relative">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 text-white rounded gap-2 inline-flex items-center uppercase tracking-widest border border-white/5">Q{i+1}</span>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{q.type}</span>
                        <div className="ml-auto">{isCorrect ? <CheckCircle2 className="text-green-500" size={18} /> : <XCircle className="text-red-500" size={18} />}</div>
                      </div>
                      
                      <h4 className="text-lg md:text-xl font-medium mb-6 leading-relaxed text-white max-w-2xl">{q.question}</h4>
                      
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-2">Your Answer:</p>
                            <p className={cn("font-medium", isCorrect ? "text-green-400" : "text-red-400")}>{Array.isArray(uAns) ? uAns.join(', ') : (uAns || "Not answered")}</p>
                          </div>
                          
                          {!isCorrect && (
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-2">Correct Answer:</p>
                              <p className="text-white font-medium">{Array.isArray(q.correctAnswers) ? q.correctAnswers.join(', ') : q.correctAnswer}</p>
                            </div>
                          )}
                      </div>

                      <div className="p-5 bg-[#0a0a0a] rounded-2xl border border-white/5 flex gap-4">
                        <div className="mt-1">
                            <Brain size={18} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-1.5">Explanation</p>
                            <p className="text-sm text-neutral-400 leading-relaxed">{q.explanation || 'No explanation provided.'}</p>
                        </div>
                      </div>
                  </div>
               </div>
             )
          })}
        </div>
      </div>
    );
  }

  // Active Test UI
  const q = QUESTIONS[currentQIndex];
  
  return (
    <div className="min-h-[100dvh] bg-[#060606] text-white flex flex-col font-sans selection:bg-blue-500/30 selection:text-white pb-32 lg:pb-0">
      
      <header className="fixed top-0 inset-x-0 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 lg:px-8 z-50 transform-gpu shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-neutral-900 border border-white/[0.08] hover:bg-white/10 rounded-lg transition-all">
              <X size={14} />
          </Link>
          <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-white block truncate max-w-[200px] lg:max-w-md">{testData.title || "Practice Test"}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Practice Mode</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
           {/* Timer */}
           <div className={cn("flex flex-col items-end sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm transition-colors min-w-[80px] text-right", timeLeft < 300 ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-neutral-900/50 border-white/5 text-neutral-300")}>
              <Clock size={14} className="hidden sm:block" /> {formatTime(timeLeft)}
           </div>
           
           <button onClick={() => {if(confirm("Are you sure you want to completely finish the test?")) calculateScore();}} className="bg-white text-black font-black uppercase tracking-widest text-[10px] md:text-xs px-5 py-2.5 rounded-xl hover:bg-neutral-200 transition-colors shadow-lg active:scale-95">
              Force Finish
           </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full pt-20 pb-32 lg:pb-12 px-4 lg:gap-8">
        
        {/* Main Content */}
        <main className="flex-1 w-full relative max-w-3xl mx-auto lg:mx-0 pt-8">
          <AnimatePresence mode="wait">
            <motion.div 
               key={q.id || currentQIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
            >
               <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                     Question {currentQIndex + 1} of {QUESTIONS.length}
                  </span>
                  <div className="flex gap-2">
                     <span className={cn("text-[9px] font-bold border px-2 py-1 rounded shadow-sm uppercase tracking-widest", 
                        q.type === 'MCQ' ? "border-blue-500/30 bg-blue-500/10 text-blue-400" :
                        q.type === 'MSQ' ? "border-purple-500/30 bg-purple-500/10 text-purple-400" :
                        q.type === 'NAT' ? "border-orange-500/30 bg-orange-500/10 text-orange-400" :
                        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                     )}>
                        {q.type}
                     </span>
                  </div>
               </div>
               
               <h2 className="text-xl md:text-2xl lg:text-3xl font-medium leading-[1.4] mb-10 text-white">
                  {q.question}
                  {q.type === 'MSQ' && <span className="block mt-2 text-[11px] uppercase tracking-widest font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md w-max">Select one or more options</span>}
               </h2>

               <div className="space-y-4">
                  {q.type === 'MCQ' && (q.options||[]).map((opt: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => handleAnswerChange(q.id, opt, q.type)}
                      className={cn(
                        "w-full text-left p-4 md:p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group active:scale-[0.99]",
                        answers[q.id] === opt 
                          ? "bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500" 
                          : "bg-[#0c0c0c] border-white/10 hover:border-white/30 hover:bg-neutral-900"
                      )}
                    >
                       <div className={cn("w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors", answers[q.id] === opt ? "bg-blue-500 border-blue-500 text-white" : "border-neutral-700 text-neutral-500 group-hover:border-neutral-500")}>
                          {String.fromCharCode(65 + i)}
                       </div>
                       <span className={cn("text-[15px] md:text-base leading-relaxed", answers[q.id] === opt ? "text-white font-medium" : "text-neutral-300 font-medium")}>{opt}</span>
                    </button>
                  ))}

                  {q.type === 'MSQ' && (q.options||[]).map((opt: string, i: number) => {
                    const isSelected = (answers[q.id] || []).includes(opt);
                    return (
                      <button 
                        key={i} 
                        onClick={() => handleAnswerChange(q.id, opt, q.type)}
                        className={cn(
                          "w-full text-left p-4 md:p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group active:scale-[0.99]",
                          isSelected 
                            ? "bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500" 
                            : "bg-[#0c0c0c] border-white/10 hover:border-white/30 hover:bg-neutral-900"
                        )}
                      >
                         <div className={cn("w-8 h-8 shrink-0 rounded-lg border-2 flex items-center justify-center transition-colors", isSelected ? "bg-purple-500 border-purple-500 text-white" : "border-neutral-700 group-hover:border-neutral-500")}>
                            {isSelected && <CheckSquare size={16} />}
                         </div>
                         <span className={cn("text-[15px] md:text-base leading-relaxed", isSelected ? "text-white font-medium" : "text-neutral-300 font-medium")}>{opt}</span>
                      </button>
                    )
                  })}

                  {q.type === 'NAT' && (
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center shadow-lg transform-gpu hover:border-orange-500/30 transition-colors">
                       <Calculator size={40} className="text-orange-500/50 mb-8" strokeWidth={1.5} />
                       <input 
                         type="number" 
                         step="any"
                         placeholder="0.00"
                         value={answers[q.id] || ''}
                         onChange={(e) => handleAnswerChange(q.id, e.target.value, q.type)}
                         className="w-full max-w-xs bg-transparent border-b-[3px] border-neutral-700 focus:border-orange-500 pb-4 text-center text-4xl font-mono text-white outline-none transition-colors placeholder:text-neutral-700"
                       />
                       <p className="mt-6 text-xs text-neutral-500 uppercase tracking-widest font-bold">Use numeric keypad</p>
                    </div>
                  )}

                  {q.type === 'FITB' && (
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 md:p-12 shadow-lg hover:border-emerald-500/30 transition-colors text-center">
                       <div className="w-16 h-16 bg-neutral-900 border border-white/10 rounded-2xl mx-auto flex items-center justify-center mb-8">
                          <CheckSquare size={24} className="text-emerald-500/50" />
                       </div>
                       <input 
                         type="text" 
                         placeholder="Type the exact word or phrase..."
                         value={answers[q.id] || ''}
                         onChange={(e) => handleAnswerChange(q.id, e.target.value, q.type)}
                         className="w-full max-w-md bg-neutral-900/50 border border-white/10 focus:border-emerald-500 focus:bg-neutral-900 rounded-2xl px-6 py-5 text-xl font-medium text-center text-white outline-none transition-all shadow-inner"
                       />
                    </div>
                  )}
               </div>
            </motion.div>
          </AnimatePresence>
        </main>

        <aside className="hidden lg:block w-80 shrink-0 pt-8">
           <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 sticky top-[80px]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
                 <LayoutGrid size={14} /> Question Map
              </h3>
              <div className="grid grid-cols-5 gap-2">
                 {QUESTIONS.map((mockQ: any, i: number) => {
                    const isAnswered = answers[mockQ.id] !== undefined && answers[mockQ.id] !== '' && (!Array.isArray(answers[mockQ.id]) || answers[mockQ.id].length > 0);
                    return (
                        <button 
                            key={mockQ.id || i}
                            onClick={() => setCurrentQIndex(i)}
                            className={cn(
                                "aspect-square rounded-xl font-bold text-xs flex items-center justify-center transition-all bg-[#0a0a0a]",
                                currentQIndex === i ? "border-[2px] border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-110" :
                                isAnswered ? "border border-blue-500/30 text-blue-400 bg-blue-500/10" :
                                "border border-white/10 text-neutral-500 hover:border-white/30 hover:text-white"
                            )}
                        >
                            {i + 1}
                        </button>
                    )
                 })}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                 <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                    <div className="w-4 h-4 rounded border-2 border-white bg-white shrink-0"></div> Current Question
                 </div>
                 <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                    <div className="w-4 h-4 rounded border border-blue-500/30 bg-blue-500/10 shrink-0"></div> Answered
                 </div>
                 <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                    <div className="w-4 h-4 rounded border border-white/10 bg-[#0a0a0a] shrink-0"></div> Unanswered
                 </div>
              </div>
              
              {currentQIndex === QUESTIONS.length - 1 && (
                <div className="mt-8 pt-6 border-t border-white/5">
                    <button onClick={calculateScore} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95">
                       Submit Full Test <CheckCircle2 size={16} />
                    </button>
                </div>
              )}
           </div>
        </aside>
      </div>

      <footer className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 pb-safe z-40 transform-gpu">
         <div className="h-1.5 bg-neutral-900 w-full relative">
            <div 
              className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-300" 
              style={{ width: `${((currentQIndex + 1) / QUESTIONS.length) * 100}%` }}
            />
         </div>
         
         <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button 
               onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
               disabled={currentQIndex === 0}
               className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 active:scale-95"
            >
               <ChevronLeft size={20} />
            </button>
            
            <button 
               onClick={() => setShowMobileMap(true)}
               className="flex-1 mx-3 h-12 bg-neutral-900/50 border border-white/5 hover:border-white/20 hover:bg-white/5 rounded-xl flex items-center justify-center gap-2 transition-colors group"
            >
               <LayoutGrid size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
               <span className="font-mono font-bold text-sm text-white">
                  {currentQIndex + 1} / {QUESTIONS.length}
               </span>
            </button>

            {currentQIndex === QUESTIONS.length - 1 ? (
              <button 
                 onClick={calculateScore}
                 className="flex items-center justify-center w-12 h-12 bg-white text-black rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95"
              >
                 <CheckCircle2 size={20} />
              </button>
            ) : (
              <button 
                 onClick={() => setCurrentQIndex(prev => Math.min(QUESTIONS.length - 1, prev + 1))}
                 className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
              >
                 <ChevronRight size={20} />
              </button>
            )}
         </div>
      </footer>

      <AnimatePresence>
        {showMobileMap && (
          <motion.div 
             initial={{ y: "100%" }}
             animate={{ y: 0 }}
             exit={{ y: "100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="lg:hidden fixed inset-0 z-[100] bg-[#0c0c0c] flex flex-col"
          >
             <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                   <LayoutGrid size={18} className="text-white" />
                   <span className="text-sm font-bold text-white uppercase tracking-widest">Question Map</span>
                </div>
                <button onClick={() => setShowMobileMap(false)} className="p-2 bg-neutral-900 rounded-full text-white"><X size={20} /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 pb-safe">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                   {QUESTIONS.map((mockQ: any, i: number) => {
                      const isAnswered = answers[mockQ.id] !== undefined && answers[mockQ.id] !== '' && (!Array.isArray(answers[mockQ.id]) || answers[mockQ.id].length > 0);
                      return (
                          <button 
                              key={mockQ.id || i}
                              onClick={() => { setCurrentQIndex(i); setShowMobileMap(false); }}
                              className={cn(
                                  "aspect-square rounded-2xl font-bold text-lg flex items-center justify-center transition-all bg-[#0a0a0a]",
                                  currentQIndex === i ? "border-[2px] border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" :
                                  isAnswered ? "border border-blue-500/30 text-blue-400 bg-blue-500/10" :
                                  "border border-white/10 text-neutral-500"
                              )}
                          >
                              {i + 1}
                          </button>
                      )
                   })}
                </div>
                
                <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                   <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <div className="w-5 h-5 rounded flex-shrink-0 border-2 border-white bg-white"></div> Current Question
                   </div>
                   <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <div className="w-5 h-5 rounded flex-shrink-0 border border-blue-500/30 bg-blue-500/10"></div> Answered
                   </div>
                   <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <div className="w-5 h-5 rounded flex-shrink-0 border border-white/10 bg-[#0a0a0a]"></div> Unanswered
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
