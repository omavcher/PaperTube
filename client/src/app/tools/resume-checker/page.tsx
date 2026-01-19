"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileSearch, Upload, ArrowLeft, Terminal, 
  CheckCircle2, AlertCircle, FileText, 
  Search, BarChart3, Zap, ShieldCheck, 
  Trash2, Copy, Sparkles, Briefcase, 
  LayoutDashboard, Info, Download, 
  FileUp, FileCheck, Target, 
  Check, X, AlertTriangle, 
  Lightbulb, BarChart,
  ArrowRight, File as FileIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

// --- Constants ---
const ROLE_KEYWORDS: Record<string, {
  keywords: string[];
  description: string;
  weight: number;
  industry: string[];
}> = {
  "Full Stack": {
    keywords: ["React", "Node.js", "Express", "PostgreSQL", "Docker", "REST API", "TypeScript", "Redux", "AWS", "CI/CD", "Next.js", "MongoDB", "GraphQL", "Jest", "WebSocket"],
    description: "Full stack web development with modern frameworks",
    weight: 1.0,
    industry: ["Tech", "E-commerce", "SaaS", "Fintech"]
  },
  "Frontend": {
    keywords: ["HTML5", "CSS3", "JavaScript", "React", "Next.js", "Tailwind CSS", "Redux", "Figma", "Web Performance", "Unit Testing", "Vue", "Svelte", "Webpack", "Vite"],
    description: "User interface and client-side development",
    weight: 1.0,
    industry: ["Tech", "E-commerce", "Media", "Design"]
  },
  "Backend": {
    keywords: ["Node.js", "Python", "Go", "Redis", "MongoDB", "SQL", "Microservices", "gRPC", "Docker", "Kubernetes", "Java", "Spring Boot", "PostgreSQL", "Apache Kafka"],
    description: "Server-side development and infrastructure",
    weight: 1.0,
    industry: ["Tech", "Fintech", "Healthcare", "Enterprise"]
  },
  "Data Science": {
    keywords: ["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "SQL", "Data Visualization", "Machine Learning", "Statistics", "PyTorch", "Jupyter", "Big Data", "Spark"],
    description: "Data analysis and machine learning",
    weight: 1.0,
    industry: ["Tech", "Finance", "Healthcare", "Research"]
  },
  "DevOps": {
    keywords: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins", "GitHub Actions", "Monitoring", "Linux", "Networking", "CI/CD", "Ansible", "Prometheus", "Grafana"],
    description: "Infrastructure and deployment automation",
    weight: 1.0,
    industry: ["Tech", "Finance", "E-commerce", "Gaming"]
  }
};

interface AnalysisResult {
  score: number;
  found: Array<{ keyword: string; count: number }>;
  missing: string[];
  formattingIssues: string[];
  recommendations: string[];
  stats: {
    wordCount: number;
    pageCount: number;
    keywordDensity: number;
    readabilityScore: number;
  };
  roleFit: Array<{ role: string; score: number }>;
}

export default function ResumeATSPage() {
  const [resumeText, setResumeText] = useState("");
  const [selectedRole, setSelectedRole] = useState("Full Stack");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Load PDF.js via CDN to avoid Vercel Build Errors ---
  useEffect(() => {
    if (typeof window !== "undefined" && !window.hasOwnProperty('pdfjsLib')) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";
      script.type = "module";
      script.onload = () => {
        // @ts-ignore
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setIsLibLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.hasOwnProperty('pdfjsLib')) {
      setIsLibLoaded(true);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      if (file.type === 'application/pdf') {
        if (!isLibLoaded) {
          toast.error("PDF engine is initializing. Please wait...");
          return;
        }
        await extractTextFromPDF(file);
      } else {
        const text = await file.text();
        setResumeText(text);
        toast.success("File loaded successfully");
      }
    } catch (error) {
      toast.error("Failed to process file");
    } finally {
      setIsUploading(false);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      // @ts-ignore
      const pdfjs = window.pdfjsLib;
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // @ts-ignore
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setResumeText(fullText);
      toast.success(`PDF processed: ${pdf.numPages} pages`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse PDF content");
    }
  };

  const analyzeATS = () => {
    if (resumeText.length < 50) {
      toast.error("Content too short for analysis");
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const targetKeywords = ROLE_KEYWORDS[selectedRole].keywords;
      const found = targetKeywords
        .map(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'gi');
          const matches = resumeText.match(regex);
          return { keyword: kw, count: matches ? matches.length : 0 };
        })
        .filter(item => item.count > 0);
      
      const missing = targetKeywords.filter(kw => 
        !found.some(f => f.keyword.toLowerCase() === kw.toLowerCase())
      );

      const words = resumeText.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      const score = Math.min(Math.round((found.length / targetKeywords.length) * 100), 100);

      setResults({
        score,
        found,
        missing,
        formattingIssues: wordCount < 200 ? ["Resume text seems very short"] : [],
        recommendations: missing.length > 0 ? [`Add keywords like ${missing.slice(0, 3).join(', ')}`] : ["Maintain this keyword density"],
        stats: {
          wordCount,
          pageCount: Math.ceil(wordCount / 400),
          keywordDensity: parseFloat(((found.length / Math.max(wordCount, 1)) * 100).toFixed(2)),
          readabilityScore: 85
        },
        roleFit: [{ role: selectedRole, score }]
      });
      
      setIsAnalyzing(false);
      toast.success("Analysis complete");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">ATS <span className="text-pink-400">Scanner</span></h1>
          <Badge variant="outline" className="text-pink-400 uppercase tracking-widest text-[10px]">PRO</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic uppercase">OPTIMIZE FOR <span className="text-pink-400">ATS</span></h2>
            <p className="text-neutral-400">Ensure your resume passes the machine filter</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-neutral-900 w-full rounded-2xl p-1 mb-6">
                  <TabsTrigger value="upload" className="flex-1 rounded-xl">Upload PDF</TabsTrigger>
                  <TabsTrigger value="paste" className="flex-1 rounded-xl">Paste Text</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center hover:border-pink-500/50 cursor-pointer bg-neutral-900/50 transition-all"
                  >
                    {isUploading ? <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" /> : <FileUp size={48} className="mx-auto mb-4 text-neutral-700" />}
                    <p className="font-bold">{uploadedFileName || "Drag & Drop PDF"}</p>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
                  </div>
                </TabsContent>

                <TabsContent value="paste">
                  <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full h-80 bg-neutral-900 border border-white/5 rounded-[2rem] p-6 text-sm focus:outline-none focus:ring-1 ring-pink-500/50"
                    placeholder="Paste your resume content here..."
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Select Targeting Node</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(ROLE_KEYWORDS).map(role => (
                    <button 
                      key={role} 
                      onClick={() => setSelectedRole(role)}
                      className={cn("px-4 py-2 rounded-xl text-xs font-bold border transition-all", selectedRole === role ? "bg-pink-500 text-black border-pink-500" : "bg-neutral-900 text-neutral-400 border-white/5")}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={analyzeATS} 
                disabled={isAnalyzing || !resumeText}
                className="w-full h-16 bg-pink-500 hover:bg-pink-600 text-black font-black text-lg rounded-2xl"
              >
                {isAnalyzing ? "ANALYZING..." : "RUN SCANNER"}
              </Button>
            </div>

            <div className="lg:col-span-5">
              <AnimatePresence>
                {results ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <Card className="bg-neutral-900 border-white/5 rounded-[2rem] p-8 text-center">
                      <p className="text-[10px] font-black uppercase text-neutral-500 mb-4 tracking-widest">Match Score</p>
                      <h3 className={cn("text-7xl font-black mb-2", results.score > 70 ? "text-emerald-500" : "text-yellow-500")}>
                        {results.score}%
                      </h3>
                      <Progress value={results.score} className="h-2 bg-white/5" />
                    </Card>

                    <Card className="bg-neutral-900 border-white/5 rounded-[2rem] p-6">
                      <h4 className="text-xs font-black uppercase text-pink-400 mb-4 tracking-widest">Critical Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.found.map(f => (
                          <Badge key={f.keyword} className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{f.keyword}</Badge>
                        ))}
                        {results.missing.map(m => (
                          <Badge key={m} className="bg-red-500/10 text-red-500 border-red-500/20">{m}</Badge>
                        ))}
                      </div>
                    </Card>

                    <Button variant="outline" className="w-full rounded-2xl border-white/10" onClick={() => setResults(null)}>
                      <Trash2 size={16} className="mr-2" /> Clear Analysis
                    </Button>
                  </motion.div>
                ) : (
                  <div className="h-full border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center text-neutral-600">
                    <BarChart size={48} className="mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Waiting for Scan</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}