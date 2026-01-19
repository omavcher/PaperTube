"use client";

import { useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Trophy, Target, Clock, Zap, CheckCircle2, 
  XCircle, BarChart3, ArrowLeft, Download, 
  Share2, RotateCcw, ChevronRight, HelpCircle,
  TrendingUp, Award, Timer, Loader2, ShieldCheck, FileCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const useResultData = (id: string) => {
  return useMemo(() => ({
    examName: "GATE 2024 - Computer Science",
    candidateName: "Om Avchar",
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    totalMarks: 100,
    score: 72.33,
    rank: 42,
    totalCandidates: 12500,
    percentile: 99.66,
    accuracy: 85,
    timeTaken: "2h 45m",
    stats: { total: 65, answered: 58, correct: 50, incorrect: 8, unanswered: 7 },
    topicBreakdown: [
      { name: "Data Structures", correct: 10, total: 12 },
      { name: "Algorithms", correct: 8, total: 10 },
      { name: "Operating Systems", correct: 9, total: 9 },
      { name: "Computer Networks", correct: 5, total: 8 },
    ]
  }), [id]);
};

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const data = useResultData(params.id as string);
  const [isGenerating, setIsGenerating] = useState<null | 'report' | 'cert'>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  // --- PDF GENERATION LOGIC ---
  const generatePDF = async (type: 'report' | 'cert') => {
    setIsGenerating(type);
    const loadingToast = toast.loading(`Generating ${type === 'report' ? 'Result Report' : 'Official Certificate'}...`);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = type === 'report' ? reportRef.current : certificateRef.current;
      if (!element) return;

      // Ensure certificate element is positioned correctly
      if (type === 'cert' && certificateRef.current) {
        certificateRef.current.style.position = 'relative';
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc, element) => {
          // Remove any unsupported CSS properties
          const allElements = element.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Remove oklch and other unsupported color functions
            if (htmlEl.style.color?.includes('oklch')) {
              htmlEl.style.color = '#000000';
            }
            if (htmlEl.style.backgroundColor?.includes('oklch')) {
              htmlEl.style.backgroundColor = '#ffffff';
            }
            if (htmlEl.style.borderColor?.includes('oklch')) {
              htmlEl.style.borderColor = '#cccccc';
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image on the page
      const marginTop = (pageHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', 0, marginTop > 0 ? marginTop : 0, imgWidth, imgHeight);
      
      const safeName = data.candidateName.replace(/\s+/g, '_');
      const fileName = `${safeName}_${type === 'report' ? 'Report' : 'Certificate'}.pdf`;
      
      pdf.save(fileName);
      toast.dismiss(loadingToast);
      toast.success(`${type === 'report' ? 'Report' : 'Certificate'} downloaded successfully!`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/exams')} className="text-neutral-400 hover:text-yellow-500">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="font-bold tracking-tight">Performance: <span className="text-yellow-500">{data.examName}</span></h1>
          </div>
          <div className="flex gap-3">
            <Button 
              size="sm" 
              variant="outline" 
              disabled={!!isGenerating}
              onClick={() => generatePDF('report')}
              className="border-white/10 hover:bg-white/5"
            >
              {isGenerating === 'report' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Report
            </Button>
            <Button 
              size="sm" 
              disabled={!!isGenerating}
              onClick={() => generatePDF('cert')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            >
              {isGenerating === 'cert' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Award className="h-4 w-4 mr-2" />}
              Certificate
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8" ref={reportRef} id="report-area">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Trophy className="text-yellow-500" />} label="Score" value={`${data.score}/100`} sub="Top 1%" />
          <StatCard icon={<TrendingUp className="text-blue-500" />} label="Rank" value={`#${data.rank}`} sub={`vs ${data.totalCandidates}`} />
          <StatCard icon={<Target className="text-emerald-500" />} label="Accuracy" value={`${data.accuracy}%`} sub="+5% avg" />
          <StatCard icon={<Timer className="text-purple-500" />} label="Time" value={data.timeTaken} sub="Avg: 2h 50m" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader><CardTitle className="text-yellow-500">Question Statistics</CardTitle></CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center gap-10">
                 <div className="relative h-40 w-40">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="75, 100" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="15, 100" strokeDashoffset="-75" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">{data.stats.answered}</span>
                      <span className="text-[8px] text-neutral-500 uppercase font-bold">Attempted</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-3 bg-black/20 rounded-xl border border-white/5"><p className="text-[10px] text-neutral-500 font-bold uppercase">Correct</p><p className="text-xl font-black text-green-500">{data.stats.correct}</p></div>
                    <div className="p-3 bg-black/20 rounded-xl border border-white/5"><p className="text-[10px] text-neutral-500 font-bold uppercase">Wrong</p><p className="text-xl font-black text-red-500">{data.stats.incorrect}</p></div>
                    <div className="p-3 bg-black/20 rounded-xl border border-white/5"><p className="text-[10px] text-neutral-500 font-bold uppercase">Skipped</p><p className="text-xl font-black text-neutral-500">{data.stats.unanswered}</p></div>
                    <div className="p-3 bg-black/20 rounded-xl border border-white/5"><p className="text-[10px] text-neutral-500 font-bold uppercase">Total</p><p className="text-xl font-black text-yellow-500">{data.stats.total}</p></div>
                 </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-yellow-500" /> QUESTION REVIEW</h2>
              {[1, 2].map(n => (
                <div key={n} className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl flex justify-between gap-6">
                  <div>
                    <Badge variant="outline" className="mb-2">Q. No {n}</Badge>
                    <p className="text-neutral-300 font-medium">Which data structure uses LIFO principle?</p>
                    <div className="mt-4 flex gap-4 text-xs">
                      <span className="text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">Correct: Stack</span>
                      <span className="text-neutral-500 font-bold bg-white/5 px-2 py-1 rounded">Time: 42s</span>
                    </div>
                  </div>
                  <CheckCircle2 className="text-green-500 h-6 w-6" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
             <Card className="bg-yellow-500 border-none text-black">
                <CardContent className="pt-8 text-center">
                   <Award className="h-16 w-16 mx-auto mb-4" />
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter">Gold Tier Result</h3>
                   <p className="text-sm font-bold opacity-70 mb-8 tracking-tight uppercase">Certificate ID: {params.id}</p>
                   <Button onClick={() => generatePDF('cert')} className="w-full bg-black text-white hover:bg-neutral-900 font-black h-12 rounded-xl">CLAIM CERTIFICATE</Button>
                </CardContent>
             </Card>
             <Card className="bg-neutral-900 border-neutral-800 p-6">
                <CardTitle className="text-sm mb-4">Actions</CardTitle>
                <div className="grid gap-2">
                   <Button variant="outline" className="w-full justify-start border-white/5 h-12" onClick={() => router.push('/exams')}><RotateCcw className="mr-3 h-4 w-4 text-yellow-500" /> Retake Exam</Button>
                   <Button variant="outline" className="w-full justify-start border-white/5 h-12"><Share2 className="mr-3 h-4 w-4 text-blue-500" /> Share Result</Button>
                </div>
             </Card>
          </div>
        </div>
      </main>

      {/* --- HIDDEN CERTIFICATE TEMPLATE --- */}
      <div className="fixed left-[-9999px] top-0 no-print">
        <div 
          ref={certificateRef} 
          id="cert-area"
          className="w-[800px] h-[1131px] bg-white p-20 relative border-[20px] border-solid border-gray-200 flex flex-col items-center text-center text-black shadow-2xl"
          style={{
            position: 'relative',
            fontFamily: "'Helvetica', 'Arial', sans-serif"
          }}
        >
          <div className="absolute top-0 left-0 w-full h-4 bg-yellow-500"></div>
          <Award className="text-yellow-500 h-24 w-24 mb-10" />
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2" style={{ color: '#000000' }}>Certificate of Excellence</h1>
          <p className="text-sm tracking-[0.4em] font-bold text-gray-500 uppercase mb-20">Official Assessment Completion</p>
          
          <p className="text-xl font-serif italic mb-2" style={{ color: '#000000' }}>This is to certify that</p>
          <h2 className="text-5xl font-black tracking-tight underline underline-offset-[12px] decoration-yellow-500 mb-12" style={{ color: '#000000' }}>
            {data.candidateName}
          </h2>
          
          <p className="text-lg leading-relaxed max-w-2xl font-serif" style={{ color: '#000000' }}>
            Has successfully demonstrated exceptional proficiency in <br/>
            <strong className="text-2xl" style={{ color: '#000000' }}>{data.examName}</strong> <br/>
            achieving a remarkable score of <strong style={{ color: '#000000' }}>{data.score} out of 100</strong>.
          </p>

          <div className="mt-auto w-full flex justify-between items-end">
            <div className="text-left">
              <div className="w-48 h-[2px] bg-black mb-2" />
              <p className="text-xs font-black uppercase" style={{ color: '#000000' }}>Exam Controller</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PaperTube Official Assessment</p>
            </div>
            
            <div className="flex flex-col items-center gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
               <div className="bg-white p-1 border border-gray-200">
                  <div className="h-16 w-16 bg-black flex items-center justify-center text-white text-[8px] font-bold text-center uppercase p-1">Verify<br/>Result<br/>{params.id}</div>
               </div>
               <p className="text-[8px] font-mono font-bold text-gray-400">ID: {params.id}</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-black mb-1" style={{ color: '#000000' }}>DATE OF ISSUE</p>
              <p className="text-sm font-bold text-gray-500">{data.date}</p>
            </div>
          </div>
          <div className="absolute bottom-6 text-[8px] text-gray-300 tracking-[0.5em] uppercase font-mono">
            Verified Digital Document • Non-Transferable • © PaperTube 2026
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value, sub }: any) {
  return (
    <Card className="bg-neutral-900 border-neutral-800 shadow-xl">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black tracking-tighter">{value}</p>
          <p className="text-[10px] text-neutral-400 font-bold">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}