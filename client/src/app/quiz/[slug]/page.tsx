"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowLeft,
  IconClock,
  IconTrophy,
  IconX,
  IconCheck,
  IconPuzzle,
  IconBulb,
  IconReload,
  IconArrowRight,
  IconShare,
  IconCheckbox,
  IconAbc,
  IconSelect,
  IconLoader2,
  IconAlertCircle
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import api from "@/config/api";
import { useParams, useRouter } from "next/navigation";

// --- Types ---
type QuestionType = "mcq" | "multi" | "truefalse" | "fill";
type Difficulty = "easy" | "medium" | "hard";

interface Question {
  _id: string;
  questionNumber: number;
  quizType: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
}

interface QuizData {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  videoUrl: string;
  videoId: string;
  settings: {
    language: string;
    difficulty: Difficulty;
    quizType: QuestionType;
    count: number;
    detailLevel: string;
    includeExplanation: boolean;
  };
  questions: Question[];
  transcriptSource: string;
  transcriptAvailable: boolean;
  createdAt: string;
}

export default function QuizPlayer() {
  const { slug } = useParams();
  const router = useRouter();
  
  // State
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Game State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fillInput, setFillInput] = useState("");
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(600);
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0
  });

  // Fetch quiz data
  useEffect(() => {
    if (slug) fetchQuizData();
  }, [slug]);

  // Timer effect
  useEffect(() => {
    if (!isCompleted && timeLeft > 0 && quizData) {
      const timer = setInterval(() => {
        setTimeLeft((t) => Math.max(0, t - 1));
        setTimeSpent((t) => t + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCompleted, timeLeft, quizData]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/quiz/get/${slug}`);
      
      if (response.data.success) {
        const data = response.data.data;

        // Ensure each question has proper formatting based on its type
        const formattedQuestions = data.questions.map((q: any, index: number) => {
          let options = q.options || [];
          if (q.quizType === 'truefalse' && options.length === 0) {
            options = ["True", "False"];
          }
          
          return {
            ...q,
            questionNumber: index + 1,
            options: options,
            // Ensure multi answers are arrays for easy comparison
            correctAnswer: q.quizType === 'multi' && typeof q.correctAnswer === 'string' 
              ? q.correctAnswer.split(',').map((s: string) => s.trim()) 
              : q.correctAnswer
          };
        });
        
        setQuizData({ ...data, questions: formattedQuestions });
        setTimeLeft(formattedQuestions.length * 45); // 45 seconds per question
      } else {
        setError(response.data.message || "Failed to load quiz");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = quizData?.questions[currentQIndex];
  const progress = quizData ? ((currentQIndex) / quizData.questions.length) * 100 : 0;

  // --- Answer Handling Logic ---

  const handleOptionClick = (optionText: string) => {
    if (isAnswered || !currentQuestion) return;

    if (currentQuestion.quizType === "multi") {
      const current = (selectedAnswer as string[]) || [];
      const newSelection = current.includes(optionText)
        ? current.filter(t => t !== optionText)
        : [...current, optionText];
      setSelectedAnswer(newSelection);
    } else {
      setSelectedAnswer(optionText);
      // For MCQ and T/F, we can auto-submit or wait for button
      if (currentQuestion.quizType === "truefalse") submitAnswer(optionText);
    }
  };

  const submitAnswer = (override?: string | string[]) => {
    if (!currentQuestion || isAnswered) return;
    
    const finalAnswer = override || selectedAnswer || fillInput;
    if (!finalAnswer && currentQuestion.quizType !== 'fill') return;

    setIsAnswered(true);
    let isCorrect = false;

    if (currentQuestion.quizType === "multi") {
      const userAnswers = Array.isArray(finalAnswer) ? [...finalAnswer].sort() : [];
      const correctAnswers = Array.isArray(currentQuestion.correctAnswer) 
        ? [...currentQuestion.correctAnswer].sort()
        : [String(currentQuestion.correctAnswer)].sort();
      isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
    } else if (currentQuestion.quizType === "fill") {
      const userText = String(finalAnswer).toLowerCase().trim();
      const correctText = String(currentQuestion.correctAnswer).toLowerCase().trim();
      isCorrect = userText === correctText;
    } else {
      isCorrect = String(finalAnswer) === String(currentQuestion.correctAnswer);
    }

    if (isCorrect) {
      setScore(s => s + 1);
      setStats(s => ({ ...s, correct: s.correct + 1 }));
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 }, colors: ['#f97316', '#ffffff'] });
    } else {
      setStats(s => ({ ...s, incorrect: s.incorrect + 1 }));
    }
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentQIndex < quizData.questions.length - 1) {
      setCurrentQIndex(i => i + 1);
      setSelectedAnswer(null);
      setFillInput("");
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  // --- Styling Helpers ---

  const getOptionStyle = (option: string) => {
    if (!currentQuestion) return "";
    const isSelected = Array.isArray(selectedAnswer) ? selectedAnswer.includes(option) : selectedAnswer === option;
    const isCorrect = Array.isArray(currentQuestion.correctAnswer) 
        ? currentQuestion.correctAnswer.includes(option) 
        : String(currentQuestion.correctAnswer) === option;

    if (!isAnswered) {
      return isSelected ? "border-orange-500 bg-orange-500/10" : "border-white/10 hover:bg-white/5";
    }

    if (isCorrect) return "border-green-500 bg-green-500/20 text-green-400";
    if (isSelected && !isCorrect) return "border-red-500 bg-red-500/20 text-red-400";
    return "border-white/5 opacity-40";
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <IconLoader2 className="w-10 h-10 text-orange-500 animate-spin" />
      <p className="text-neutral-500 font-medium">Initializing Quiz Engine...</p>
    </div>
  );

  if (error || !quizData) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <IconAlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold">Quiz Not Found</h2>
        <p className="text-neutral-400">{error || "This quiz has expired or moved."}</p>
        <Button onClick={() => router.push('/')} className="bg-orange-600">Return Home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center selection:bg-orange-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-950/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-4xl p-4 md:p-6 flex items-center justify-between relative z-10">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full hover:bg-white/5">
          <IconArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>

        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Session Active</span>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 border border-white/5 rounded-full">
                <IconClock className={cn("w-4 h-4", timeLeft < 30 ? "text-red-500 animate-pulse" : "text-orange-500")} />
                <span className="text-sm font-mono font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
            </div>
        </div>

        <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-neutral-500 uppercase">Accuracy</p>
            <p className="text-sm font-black text-white">{Math.round((score / Math.max(1, stats.correct + stats.incorrect)) * 100)}%</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl px-6 mb-8 relative z-10">
        <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
          <motion.div className="h-full bg-orange-600" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className="flex-1 w-full max-w-2xl px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key={currentQIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Question Header */}
              <div className="space-y-4">
                <Badge variant="outline" className="border-orange-500/30 text-orange-500 bg-orange-500/5 px-3 py-1 uppercase text-[10px] tracking-widest">
                  Question {currentQIndex + 1} • {currentQuestion?.quizType}
                </Badge>
                <h2 className="text-xl md:text-3xl font-bold leading-tight">
                  {currentQuestion?.question}
                </h2>
              </div>

              {/* Options Section */}
              <div className="grid gap-3">
                {currentQuestion?.quizType === "fill" ? (
                  <div className="space-y-4">
                    <Input
                      autoFocus
                      disabled={isAnswered}
                      value={fillInput}
                      onChange={(e) => setFillInput(e.target.value)}
                      placeholder="Type your answer here..."
                      className="h-16 text-xl bg-neutral-900/50 border-white/10 text-center focus:border-orange-500"
                    />
                    {!isAnswered && (
                        <Button onClick={() => submitAnswer()} disabled={!fillInput.trim()} className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-lg font-bold">
                            Submit Answer
                        </Button>
                    )}
                  </div>
                ) : (
                  currentQuestion?.options.map((option, i) => (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleOptionClick(option)}
                      className={cn(
                        "w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between group",
                        getOptionStyle(option)
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-500 group-hover:text-orange-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium">{option}</span>
                      </div>
                      {isAnswered && (
                        (Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.includes(option) : currentQuestion.correctAnswer === option) ? (
                            <IconCheck className="text-green-500 w-6 h-6" />
                        ) : (
                            (Array.isArray(selectedAnswer) ? selectedAnswer.includes(option) : selectedAnswer === option) && <IconX className="text-red-500 w-6 h-6" />
                        )
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Multi-Select Submit Button */}
              {!isAnswered && currentQuestion?.quizType === "multi" && (
                <Button 
                    onClick={() => submitAnswer()} 
                    disabled={!selectedAnswer || (selectedAnswer as string[]).length === 0}
                    className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-lg font-bold"
                >
                    Confirm Selection
                </Button>
              )}

              {/* MCQ Manual Submit (Optional, if you don't want auto-submit) */}
              {!isAnswered && currentQuestion?.quizType === "mcq" && selectedAnswer && (
                 <Button onClick={() => submitAnswer()} className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-lg font-bold">
                    Check Answer
                 </Button>
              )}

              {/* Explanation & Next Navigation */}
              {isAnswered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 flex gap-4">
                    <IconBulb className="w-6 h-6 text-orange-500 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-orange-500">Mastery Note</p>
                        <p className="text-neutral-300 leading-relaxed">{currentQuestion?.explanation}</p>
                    </div>
                  </div>
                  <Button onClick={handleNext} className="w-full h-16 bg-white text-black hover:bg-neutral-200 text-lg font-black uppercase tracking-tighter italic">
                    {currentQIndex < quizData.questions.length - 1 ? "Advance to Next Question" : "View Final Report"}
                    <IconArrowRight className="ml-2" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Results Screen */
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10 space-y-8">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-orange-600 blur-[80px] opacity-20" />
                    <div className="w-24 h-24 bg-gradient-to-tr from-orange-600 to-amber-400 rounded-3xl flex items-center justify-center mx-auto relative z-10 rotate-3">
                        <IconTrophy className="w-12 h-12 text-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Quiz Protocol Complete</h2>
                    <p className="text-neutral-500 font-medium">System analysis of your knowledge retention:</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Score</p>
                        <p className="text-2xl font-black">{score}/{quizData.questions.length}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Accuracy</p>
                        <p className="text-2xl font-black">{Math.round((score/quizData.questions.length)*100)}%</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Time</p>
                        <p className="text-2xl font-black">{Math.floor(timeSpent / 60)}m</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button onClick={() => window.location.reload()} className="h-14 bg-orange-600 hover:bg-orange-500 font-bold text-lg">
                        <IconReload className="mr-2" /> Retake Performance
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/')} className="h-14 hover:bg-white/5 font-bold">
                        Return to Dashboard
                    </Button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="w-full p-6 text-center text-[10px] font-bold text-neutral-700 uppercase tracking-[0.3em]">
        Neural Logic Engine v2.0 • {quizData.slug}
      </footer>
    </div>
  );
}