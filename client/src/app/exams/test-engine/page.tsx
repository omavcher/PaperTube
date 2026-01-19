"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Calculator, ChevronLeft, ChevronRight, Clock, 
  X, Moon, Sun, Trash2, AlertTriangle, HelpCircle,
  Lock, Maximize, CheckCircle2, Monitor, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';
type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: { id: string; text: string }[];
  marks: number;
  negativeMarks: number;
}

// --- NTA Scientific Calculator Component ---
const NtaCalculator = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState(0);
  const [isRadian, setIsRadian] = useState(false);
  
  const [opCode, setOpCode] = useState(0);
  const [stackVal, setStackVal] = useState(0);
  const [boolClear, setBoolClear] = useState(true);

  const formatDisplay = (num: number) => {
    let res = num.toPrecision(10).replace(/\.?0+$/, "");
    return res === "-0" ? "0" : res;
  };

  const handleNumeric = (val: string) => {
    if (boolClear) {
      setDisplay(val === "." ? "0." : val);
      setBoolClear(false);
    } else {
      if (val === "." && display.includes(".")) return;
      if (display.length < 30) setDisplay(prev => prev + val);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
    setStackVal(0);
    setOpCode(0);
    setBoolClear(true);
  };

  const handleBackspace = () => {
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const performBinary = (opText: string, newCode: number) => {
    const current = parseFloat(display);
    let runningVal = stackVal;

    if (opCode !== 0) {
      switch (opCode) {
        case 1: runningVal += current; break;
        case 2: runningVal -= current; break;
        case 3: runningVal *= current; break;
        case 4: runningVal /= current; break;
        case 5: runningVal %= current; break;
        case 6: runningVal = Math.pow(runningVal, current); break;
        case 7: runningVal = Math.pow(runningVal, 1 / current); break;
        case 8: runningVal = Math.log(runningVal) / Math.log(current); break;
      }
      setDisplay(formatDisplay(runningVal));
      setStackVal(runningVal);
    } else {
      setStackVal(current);
    }

    setOpCode(newCode);
    setExpression(prev => prev + display + " " + opText + " ");
    setBoolClear(true);
  };

  const handleUnary = (type: string) => {
    const x = parseFloat(display);
    let res = 0;
    const rad = isRadian ? x : x * (Math.PI / 180);

    switch (type) {
      case 'sin': res = Math.sin(rad); break;
      case 'cos': res = Math.cos(rad); break;
      case 'tan': res = Math.tan(rad); break;
      case 'asin': res = Math.asin(x); res = isRadian ? res : res * (180 / Math.PI); break;
      case 'acos': res = Math.acos(x); res = isRadian ? res : res * (180 / Math.PI); break;
      case 'atan': res = Math.atan(x); res = isRadian ? res : res * (180 / Math.PI); break;
      case 'log': res = Math.log10(x); break;
      case 'ln': res = Math.log(x); break;
      case 'sqrt': res = Math.sqrt(x); break;
      case 'fact': 
        const f = (n: number): number => (n <= 1 ? 1 : n * f(n - 1));
        res = x > 170 ? Infinity : f(Math.floor(x));
        break;
      case 'inv': res = 1 / x; break;
      case 'square': res = x * x; break;
      case 'cube': res = x * x * x; break;
    }
    setDisplay(formatDisplay(res));
    setBoolClear(true);
  };

  const handleEqual = () => {
    const current = parseFloat(display);
    let result = stackVal;
    switch (opCode) {
      case 1: result += current; break;
      case 2: result -= current; break;
      case 3: result *= current; break;
      case 4: result /= current; break;
      case 5: result %= current; break;
      case 6: result = Math.pow(result, current); break;
      case 7: result = Math.pow(result, 1 / current); break;
      case 8: result = Math.log(result) / Math.log(current); break;
      default: result = current;
    }
    setDisplay(formatDisplay(result));
    setExpression("");
    setStackVal(0);
    setOpCode(0);
    setBoolClear(true);
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      drag dragMomentum={false}
      className="fixed top-24 left-24 z-[1000] w-[463px] bg-[#dbdbdb] border-x border-[#aaaaaa] border-b-[7px] border-b-[#999999] rounded-md shadow-2xl overflow-hidden p-[10px]"
    >
      <div className="flex justify-between items-center mb-2 cursor-move">
        <span className="text-black text-[12px] font-bold">Scientific Calculator</span>
        <button onClick={onClose} className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-[#c0392b] font-bold">X</button>
      </div>

      <input readOnly className="w-full h-[30px] bg-white border border-[#aaaaaa] border-b-[3px] text-right px-2 mb-1 text-sm font-mono text-[#666]" value={expression} />
      <div className="relative mb-2">
        <input readOnly className="w-full h-[30px] bg-white border border-[#aaaaaa] border-b-[3px] text-right px-2 text-xl font-mono font-bold text-black" value={display} />
        {memory !== 0 && <span className="absolute left-2 top-1 text-[10px] font-bold text-gray-500">M</span>}
      </div>

      <div className="flex flex-col gap-[5px]">
        <div className="flex gap-[5px]">
          <CalcBtn label="mod" onClick={() => performBinary("mod", 5)} />
          <div className="flex items-center gap-2 bg-[#f1f1f1] px-2 h-[25px] rounded border border-[#aaaaaa] text-[9px] text-black">
            <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={!isRadian} onChange={() => setIsRadian(false)} /> Deg</label>
            <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={isRadian} onChange={() => setIsRadian(true)} /> Rad</label>
          </div>
          <div className="flex-1" />
          <CalcBtn label="MC" onClick={() => setMemory(0)} color="bg-[#777] text-white" />
          <CalcBtn label="MR" onClick={() => { setDisplay(memory.toString()); setBoolClear(true); }} color="bg-[#777] text-white" />
          <CalcBtn label="MS" onClick={() => setMemory(parseFloat(display))} color="bg-[#777] text-white" />
          <CalcBtn label="M+" onClick={() => setMemory(m => m + parseFloat(display))} color="bg-[#777] text-white" />
          <CalcBtn label="M-" onClick={() => setMemory(m => m - parseFloat(display))} color="bg-[#777] text-white" />
        </div>

        <div className="flex gap-[5px]">
          <CalcBtn label="sinh" isMin /> <CalcBtn label="cosh" isMin /> <CalcBtn label="tanh" isMin />
          <CalcBtn label="Exp" /> <CalcBtn label="(" /> <CalcBtn label=")" />
          <CalcBtn label="←" onClick={handleBackspace} color="bg-[#e67e22] text-white text-lg" className="w-[76px]" />
          <CalcBtn label="C" onClick={handleClear} color="bg-[#e74c3c] text-white" />
          <CalcBtn label="+/-" onClick={() => handleUnary('sign')} /> <CalcBtn label="√" onClick={() => handleUnary('sqrt')} />
        </div>

        <div className="flex gap-[5px]">
          <CalcBtn label="sin⁻¹" onClick={() => handleUnary('asin')} isMin /> 
          <CalcBtn label="cos⁻¹" onClick={() => handleUnary('acos')} isMin /> 
          <CalcBtn label="tan⁻¹" onClick={() => handleUnary('atan')} isMin />
          <CalcBtn label="log₂x" isMin /> <CalcBtn label="ln" onClick={() => handleUnary('ln')} /> <CalcBtn label="log" onClick={() => handleUnary('log')} />
          <CalcBtn label="7" onClick={() => handleNumeric("7")} color="bg-white text-black" />
          <CalcBtn label="8" onClick={() => handleNumeric("8")} color="bg-white text-black" />
          <CalcBtn label="9" onClick={() => handleNumeric("9")} color="bg-white text-black" />
          <CalcBtn label="/" onClick={() => performBinary("/", 4)} /> <CalcBtn label="%" />
        </div>

        <div className="flex gap-[5px]">
          <CalcBtn label="π" onClick={() => handleNumeric(Math.PI.toString())} />
          <CalcBtn label="e" onClick={() => handleNumeric(Math.E.toString())} />
          <CalcBtn label="n!" onClick={() => handleUnary('fact')} />
          <CalcBtn label="logᵧx" onClick={() => performBinary("logy", 8)} isMin />
          <CalcBtn label="eˣ" isMin /> <CalcBtn label="10ˣ" isMin />
          <CalcBtn label="4" onClick={() => handleNumeric("4")} color="bg-white text-black" />
          <CalcBtn label="5" onClick={() => handleNumeric("5")} color="bg-white text-black" />
          <CalcBtn label="6" onClick={() => handleNumeric("6")} color="bg-white text-black" />
          <CalcBtn label="*" onClick={() => performBinary("*", 3)} /> <CalcBtn label="1/x" onClick={() => handleUnary('inv')} />
        </div>

        <div className="flex gap-[5px] relative">
          <CalcBtn label="sin" onClick={() => handleUnary('sin')} isMin />
          <CalcBtn label="cos" onClick={() => handleUnary('cos')} isMin />
          <CalcBtn label="tan" onClick={() => handleUnary('tan')} isMin />
          <CalcBtn label="xʸ" onClick={() => performBinary("^", 6)} />
          <CalcBtn label="x³" onClick={() => handleUnary('cube')} />
          <CalcBtn label="x²" onClick={() => handleUnary('square')} />
          <CalcBtn label="1" onClick={() => handleNumeric("1")} color="bg-white text-black" />
          <CalcBtn label="2" onClick={() => handleNumeric("2")} color="bg-white text-black" />
          <CalcBtn label="3" onClick={() => handleNumeric("3")} color="bg-white text-black" />
          <CalcBtn label="-" onClick={() => performBinary("-", 2)} />
          <button onClick={handleEqual} className="absolute right-0 bottom-50 w-[35px] h-[53px] bg-[#2ecc71] border border-[#27ae60] border-b-[3px] rounded-[4px] text-white text-xl font-bold hover:brightness-95 active:translate-y-[1px] active:border-b-[1px] transition-all">=</button>
        </div>

        <div className="flex gap-[5px]">
          <CalcBtn label="sin⁻¹" isMin /> <CalcBtn label="cos⁻¹" isMin /> <CalcBtn label="tan⁻¹" isMin />
          <CalcBtn label="ʸ√x" onClick={() => performBinary("yroot", 7)} isMin /> <CalcBtn label="∛x" /> <CalcBtn label="|x|" />
          <CalcBtn label="0" onClick={() => handleNumeric("0")} color="bg-white text-black" className="w-[76px]" />
          <CalcBtn label="." onClick={() => handleNumeric(".")} color="bg-white text-black" />
          <CalcBtn label="+" onClick={() => performBinary("+", 1)} />
          <div className="w-[35px]" />
        </div>
      </div>
    </motion.div>
  );
};

const CalcBtn = ({ label, onClick, color, isMin, className }: any) => (
  <button onClick={onClick} className={cn("w-[35px] h-[25px] border border-[#aaaaaa] border-b-[3px] rounded-[4px] flex items-center justify-center font-bold text-[#444] transition-all active:translate-y-[1px] active:border-b-[1px] hover:bg-[#eaeaea]", isMin ? "text-[10px]" : "text-[12px]", color ? color : "bg-[#f1f1f1]", className)}>
    {label}
  </button>
);

// --- Content Component (Uses useSearchParams) ---
const MOCK_QUESTIONS: Question[] = [
  { id: 1, type: 'MCQ', marks: 1, negativeMarks: 0.33, text: "Which of the following is a linear data structure?", options: [{ id: 'A', text: "Graph" }, { id: 'B', text: "Tree" }, { id: 'C', text: "Stack" }, { id: 'D', text: "BST" }] },
  { id: 2, type: 'NAT', marks: 2, negativeMarks: 0, text: "Calculate the value of x if 2x + 5 = 15. Write the numeric value only." },
  { id: 3, type: 'MSQ', marks: 2, negativeMarks: 0, text: "Which of the following are prime numbers?", options: [{ id: 'A', text: "2" }, { id: 'B', text: "4" }, { id: 'C', text: "5" }, { id: 'D', text: "9" }] }
];

function ExamEngineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

  const [isDark, setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [statuses, setStatuses] = useState<Record<number, QuestionStatus>>({ 1: 'not-visited', 2: 'not-visited', 3: 'not-visited' });
  const [showCalc, setShowCalc] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10800);

  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 1024);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    toast.success("Submitting Exam...");
    setTimeout(() => router.push(`/exams/result/${examId}`), 1000);
  };

  const handleOptionSelect = (optId: string) => {
    if (MOCK_QUESTIONS[currentIdx].type === 'MCQ') {
      setAnswers({ ...answers, [MOCK_QUESTIONS[currentIdx].id]: optId });
    } else {
      const current = answers[MOCK_QUESTIONS[currentIdx].id] || [];
      const next = current.includes(optId) ? current.filter((i: any) => i !== optId) : [...current, optId];
      setAnswers({ ...answers, [MOCK_QUESTIONS[currentIdx].id]: next });
    }
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
  };

  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-center p-10">
        <Smartphone className="h-20 w-20 text-yellow-500 mb-6" />
        <h1 className="text-3xl font-black text-white mb-4">DESKTOP REQUIRED</h1>
        <p className="text-neutral-400">Please switch to a PC or Laptop to take the exam.</p>
      </div>
    );
  }

  return (
    <div className={cn("h-screen w-screen flex flex-col overflow-hidden", isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f3f4f6] text-black")}>
      <NtaCalculator isOpen={showCalc} onClose={() => setShowCalc(false)} />
      
      <header className={cn("h-14 flex items-center justify-between px-6 border-b", isDark ? "bg-black border-white/10" : "bg-white border-gray-200 shadow-sm")}>
        <div className="flex items-center gap-4">
          <Badge className="bg-yellow-500 text-black font-black uppercase">GATE 2026</Badge>
          <span className="text-[10px] font-bold opacity-60 tracking-[0.2em]">OFFICIAL EXAM INTERFACE</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-2xl text-yellow-500 font-black tracking-tighter">
          <Clock className="h-6 w-6" /> {Math.floor(timeLeft/3600)}:{String(Math.floor((timeLeft%3600)/60)).padStart(2,'0')}:{String(timeLeft%60).padStart(2,'0')}
          <Button variant="outline" size="sm" onClick={() => setIsDark(!isDark)} className="ml-4">{isDark ? <Sun /> : <Moon />}</Button>
          <Button variant="secondary" size="sm" onClick={() => setShowCalc(!showCalc)} className="bg-[#337ab7] text-white"><Calculator className="h-4 w-4 mr-2" /> Calculator</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col border-r border-white/10 p-12">
          <Badge className="mb-4 w-fit">Question {MOCK_QUESTIONS[currentIdx].id}</Badge>
          <h2 className="text-2xl font-bold mb-10 leading-relaxed">{MOCK_QUESTIONS[currentIdx].text}</h2>
          
          <div className="grid gap-4 max-w-2xl">
            {MOCK_QUESTIONS[currentIdx].options?.map(opt => {
              const isChecked = MOCK_QUESTIONS[currentIdx].type === 'MCQ' ? answers[MOCK_QUESTIONS[currentIdx].id] === opt.id : (answers[MOCK_QUESTIONS[currentIdx].id] || []).includes(opt.id);
              return (
                <label key={opt.id} className={cn("flex items-center gap-5 p-5 rounded-xl border-2 cursor-pointer transition-all", isChecked ? "border-yellow-500 bg-yellow-500/10" : "border-white/5 bg-white/5 hover:border-white/10")}>
                  <input type={MOCK_QUESTIONS[currentIdx].type === 'MCQ' ? 'radio' : 'checkbox'} className="hidden" checked={isChecked} onChange={() => handleOptionSelect(opt.id)} />
                  <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center", isChecked ? "border-yellow-500" : "border-neutral-600")}>{isChecked && <div className="h-3 w-3 bg-yellow-500 rounded-full" />}</div>
                  <span className="text-lg font-bold">{opt.id}. {opt.text}</span>
                </label>
              );
            })}
          </div>

          <footer className="mt-auto p-5 border-t border-white/5 flex justify-between bg-black/20 rounded-t-2xl">
              <div className="flex gap-4">
                <Button variant="outline" className="text-purple-500 border-purple-500/50" onClick={() => {
                  setStatuses({...statuses, [MOCK_QUESTIONS[currentIdx].id]: answers[MOCK_QUESTIONS[currentIdx].id] ? 'answered-marked' : 'marked'});
                  if(currentIdx < MOCK_QUESTIONS.length - 1) setCurrentIdx(currentIdx + 1);
                }}>Mark for Review & Next</Button>
                <Button variant="ghost" className="text-red-500" onClick={() => setAnswers({...answers, [MOCK_QUESTIONS[currentIdx].id]: undefined})}>Clear Response</Button>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 px-12 font-black" onClick={() => {
                setStatuses({...statuses, [MOCK_QUESTIONS[currentIdx].id]: answers[MOCK_QUESTIONS[currentIdx].id] ? 'answered' : 'not-answered'});
                if(currentIdx < MOCK_QUESTIONS.length - 1) setCurrentIdx(currentIdx + 1);
              }}>Save & Next</Button>
          </footer>
        </main>

        <aside className="w-80 bg-neutral-900/50 flex flex-col p-6 border-l border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black">OA</div>
              <div><p className="font-black text-sm">OM AVCHAR</p><p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Candidate</p></div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-4 gap-3">
                {MOCK_QUESTIONS.map((q, idx) => (
                  <button key={q.id} onClick={() => setCurrentIdx(idx)} className={cn("h-10 w-10 text-xs font-black rounded-lg transition-all", currentIdx === idx ? "border-2 border-yellow-500 scale-110" : "opacity-60", statuses[q.id] === 'answered' ? "bg-green-600" : statuses[q.id] === 'not-answered' ? "bg-red-600" : (statuses[q.id] === 'marked' || statuses[q.id] === 'answered-marked') ? "bg-purple-600 rounded-full" : "bg-white/10")}>{q.id}</button>
                ))}
              </div>
            </div>
            <Button className="w-full bg-yellow-500 text-black font-black h-12 uppercase mt-6" onClick={handleSubmit}>Submit Test</Button>
        </aside>
      </div>

      {!isFullscreen && (
        <div className="fixed inset-0 z-[2000] bg-black/98 flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl">
           <Lock className="h-20 w-20 text-yellow-500 mb-8 animate-pulse" />
           <h1 className="text-4xl font-black mb-4 tracking-tighter">SECURE LOCKDOWN ACTIVE</h1>
           <p className="text-neutral-400 max-w-md mb-10">Academic integrity verified. This portal requires full-screen mode to prevent unauthorized tab switching.</p>
           <Button size="lg" className="bg-yellow-500 text-black font-black px-16 h-16 text-xl rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)]" onClick={enterFullscreen}>Initialize Secure Engine</Button>
        </div>
      )}
    </div>
  );
}

// --- Main Page Export (Wrapped in Suspense) ---
export default function ExamEnginePage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading Exam Engine...</div>}>
      <ExamEngineContent />
    </Suspense>
  );
}