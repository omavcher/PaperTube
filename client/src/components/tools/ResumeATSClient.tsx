"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  FileSearch, Upload, ArrowLeft, 
  CheckCircle2, AlertCircle, FileText, 
  Search, BarChart3, Zap, 
  Trash2, Copy, Sparkles, Briefcase, 
  FileUp, Target, 
  AlertTriangle, 
  Lightbulb, BarChart,
  Home, Grid, Settings, Loader2,
  ChevronDown, ChevronUp, RefreshCw,
  Clock, Users, Award, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

// Comprehensive keyword database for real ATS analysis
const KEYWORD_DATABASE: Record<string, { keywords: string[], description: string, industry: string[] }> = {
  "Full Stack": {
    keywords: [
      "React", "Node.js", "Express", "PostgreSQL", "MongoDB", "Docker", 
      "REST API", "GraphQL", "TypeScript", "JavaScript", "AWS", "Azure",
      "CI/CD", "Git", "Redux", "Next.js", "Vue", "Angular", "Python",
      "Java", "C#", "PHP", "Laravel", "Django", "Flask", "MySQL",
      "Firebase", "Supabase", "Prisma", "Sequelize", "Jest", "Cypress"
    ],
    description: "Full stack web development with modern frameworks",
    industry: ["Tech", "E-commerce", "SaaS", "Fintech"]
  },
  "Frontend": {
    keywords: [
      "HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", 
      "Vue", "Angular", "Svelte", "Tailwind CSS", "Sass", "Less", 
      "Redux", "Zustand", "Recoil", "Webpack", "Vite", "Parcel",
      "Figma", "Adobe XD", "Responsive Design", "Mobile First", "PWA",
      "Web Performance", "SEO", "Jest", "React Testing Library", "Cypress"
    ],
    description: "User interface and client-side development",
    industry: ["Tech", "E-commerce", "Media", "Design"]
  },
  "Backend": {
    keywords: [
      "Node.js", "Python", "Java", "Go", "Rust", "C#", "PHP", "Ruby",
      "Express", "Django", "Flask", "Spring Boot", "Laravel", "Rails",
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
      "REST API", "GraphQL", "gRPC", "WebSocket", "Microservices",
      "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Kafka", "RabbitMQ"
    ],
    description: "Server-side development and infrastructure",
    industry: ["Tech", "Fintech", "Healthcare", "Enterprise"]
  },
  "Data Science": {
    keywords: [
      "Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow",
      "PyTorch", "Keras", "Machine Learning", "Deep Learning", "NLP",
      "Computer Vision", "Data Visualization", "Matplotlib", "Seaborn",
      "Tableau", "Power BI", "Jupyter", "Colab", "Statistics", "Probability",
      "Big Data", "Spark", "Hadoop", "SQL", "NoSQL", "Data Mining"
    ],
    description: "Data analysis and machine learning",
    industry: ["Tech", "Finance", "Healthcare", "Research"]
  },
  "DevOps": {
    keywords: [
      "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform",
      "Ansible", "Puppet", "Chef", "Jenkins", "GitHub Actions", "GitLab CI",
      "CircleCI", "Travis CI", "Prometheus", "Grafana", "ELK Stack",
      "Linux", "Unix", "Bash", "Python", "Go", "Networking", "Security",
      "Monitoring", "Logging", "CI/CD", "Infrastructure as Code"
    ],
    description: "Infrastructure and deployment automation",
    industry: ["Tech", "Finance", "E-commerce", "Gaming"]
  },
  "Mobile Development": {
    keywords: [
      "iOS", "Android", "Swift", "Kotlin", "Java", "React Native",
      "Flutter", "Xamarin", "Ionic", "Mobile UI", "App Store", "Google Play",
      "REST API", "GraphQL", "Firebase", "SQLite", "Core Data", "Realm",
      "Push Notifications", "Camera", "GPS", "Sensors", "Material Design",
      "Human Interface Guidelines", "TestFlight", "App Distribution"
    ],
    description: "Mobile app development for iOS and Android",
    industry: ["Tech", "E-commerce", "Gaming", "Healthcare"]
  }
};

// Common ATS formatting issues
const COMMON_ISSUES = [
  { pattern: /table|column|row|grid/i, issue: "Tables detected (may break parsing)" },
  { pattern: /header|footer|page \d/i, issue: "Headers/Footers found (ATS might ignore)" },
  { pattern: /[^\x00-\x7F]/, issue: "Non-standard characters detected" },
  { pattern: /\.{2,}/, issue: " excessive periods detected" },
  { pattern: /[•●■♦]/, issue: "Graphic bullets detected (use standard dashes)" }
];

// Industry-specific keywords
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  "Tech": ["Agile", "Scrum", "JIRA", "Confluence", "SDLC", "Technical", "Engineering"],
  "Finance": ["Compliance", "Regulation", "Risk", "Audit", "Financial", "Banking"],
  "Healthcare": ["HIPAA", "Patient", "Clinical", "Medical", "Healthcare", "Compliance"],
  "E-commerce": ["Inventory", "Order", "Payment", "Shopping", "Cart", "Customer"],
  "SaaS": ["Subscription", "Billing", "Multi-tenant", "Cloud", "SaaS", "Platform"]
};

// Add type for results
interface ATSResults {
    score: number;
    found: { keyword: string; count: number; importance: number }[];
    missing: string[];
    formattingIssues: string[];
    recommendations: string[];
    detectedIndustries: string[];
    stats: {
        wordCount: number;
        pageCount: number;
        keywordDensity: number;
        readabilityScore: number;
        sentenceCount: number;
        uniqueWords: number;
    };
    roleFit: { role: string; score: number }[];
}

export default function ResumeATSClient() {
  const [resumeText, setResumeText] = useState("");
  const [selectedRole, setSelectedRole] = useState("Full Stack");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [results, setResults] = useState<ATSResults | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    keywords: true,
    missing: true,
    recommendations: true,
    roles: false
  });
  
  useToolAnalytics("resume-ats-checker", "ATS CHECK", "Workflows");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load PDF.js
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).pdfjsLib) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";
      script.type = "module";
      script.onload = () => {
        const win = window as any;
        win.pdfjsLib = win.pdfjsLib || {};
        win.pdfjsLib.GlobalWorkerOptions = win.pdfjsLib.GlobalWorkerOptions || {};
        win.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setIsLibLoaded(true);
      };
      document.head.appendChild(script);
    } else {
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
          toast.error("SYSTEM INIT: PDF Engine Loading...");
          return;
        }
        await extractTextFromPDF(file);
      } else {
        const text = await file.text();
        setResumeText(text);
        toast.success("FILE LOADED");
      }
    } catch (error) {
      toast.error("UPLOAD FAILED: Corrupt File");
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      const pdfjs = (window as any).pdfjsLib;
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setResumeText(fullText);
      toast.success(`PDF PARSED: ${pdf.numPages} Pages`);
    } catch (error) {
      console.error(error);
      toast.error("PARSE ERROR: Encrypted or Invalid PDF");
    }
  };

  // Real ATS Analysis Logic
  const analyzeATS = useCallback(() => {
    if (resumeText.length < 50) {
      toast.error("INPUT ERROR: Text too short");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate processing time for realistic feel
    setTimeout(() => {
      const text = resumeText.toLowerCase();
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      
      // Get target role keywords
      const targetRoleData = KEYWORD_DATABASE[selectedRole];
      const allKeywords = targetRoleData.keywords;
      
      // Calculate keyword matches with frequency
      const found = allKeywords
        .map(kw => {
          const regex = new RegExp(`\\b${kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          const matches = resumeText.match(regex);
          return { 
            keyword: kw, 
            count: matches ? matches.length : 0,
            importance: matches ? matches.length * 2 : 0
          };
        })
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count);
      
      // Calculate missing keywords
      const missing = allKeywords.filter(kw => 
        !found.some(f => f.keyword.toLowerCase() === kw.toLowerCase())
      );

      // Calculate weighted score based on keyword importance
      const totalWeight = allKeywords.length * 2; // Max possible weight
      const achievedWeight = found.reduce((sum, f) => sum + Math.min(f.count * 2, 10), 0);
      const baseScore = Math.min(Math.round((achievedWeight / totalWeight) * 100), 100);
      
      // Adjust score based on text length and formatting
      let score = baseScore;
      if (wordCount < 200) score -= 15;
      else if (wordCount < 300) score -= 5;
      else if (wordCount > 800) score += 5;
      
      // Detect formatting issues
      const formattingIssues: string[] = [];
      COMMON_ISSUES.forEach(({ pattern, issue }) => {
        if (pattern.test(resumeText)) {
          formattingIssues.push(issue);
        }
      });

      // Check for contact information
      if (!resumeText.match(/[\w.-]+@[\w.-]+\.\w+/)) {
        formattingIssues.push("MISSING: Email Address");
      }
      if (!resumeText.match(/[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/)) {
        formattingIssues.push("MISSING: Phone Number");
      }

      // Check for dates (employment history)
      if (!resumeText.match(/\b(19|20)\d{2}\b/)) {
        formattingIssues.push("MISSING: Employment Dates (Years)");
      }

      // Generate smart recommendations
      const recommendations: string[] = [];
      
      if (found.length < 10) {
        recommendations.push("KEYWORD GAP: Add more role-specific terms.");
      }
      if (missing.length > 10) {
        recommendations.push(`CRITICAL MISSING: ${missing.slice(0, 3).join(', ')}...`);
      }
      if (wordCount < 300) {
        recommendations.push("LENGTH WARNING: Expand to 300-500 words.");
      }
      if (wordCount > 1000) {
        recommendations.push("LENGTH WARNING: Condense content (Target < 2 pages).");
      }
      if (formattingIssues.length > 0) {
        recommendations.push("FORMAT ERROR: Fix detected layout issues.");
      }
      if (score < 50) {
        recommendations.push("STRATEGY: Use standard metrics (e.g., 'Improved X by Y%').");
      } else if (score < 70) {
        recommendations.push("STRATEGY: Add specific technical frameworks.");
      } else if (score < 85) {
        recommendations.push("OPTIMIZATION: Fine-tune for keyword density.");
      } else {
        recommendations.push("STATUS: ATS Optimized.");
      }

      // Calculate role fit for all roles
      const roleFit = Object.keys(KEYWORD_DATABASE).map(role => {
        const roleKeywords = KEYWORD_DATABASE[role].keywords;
        const matches = roleKeywords.filter(kw => 
          text.includes(kw.toLowerCase())
        ).length;
        const roleScore = Math.min(Math.round((matches / roleKeywords.length) * 100), 100);
        return { role, score: roleScore };
      }).sort((a, b) => b.score - a.score);

      // Detect industry
      const detectedIndustries: string[] = [];
      Object.entries(INDUSTRY_KEYWORDS).forEach(([industry, keywords]) => {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          detectedIndustries.push(industry);
        }
      });

      // Calculate readability score
      const sentences = resumeText.split(/[.!?]+/).filter(s => s.length > 0);
      const avgWordsPerSentence = wordCount / (sentences.length || 1);
      const readabilityScore = Math.min(Math.round(
        100 - (Math.abs(avgWordsPerSentence - 20) * 2)
      ), 95);

      // Calculate keyword density
      const keywordDensity = parseFloat(((found.length / Math.max(wordCount, 1)) * 100).toFixed(2));

      setResults({
        score: Math.min(Math.max(score, 0), 100),
        found,
        missing,
        formattingIssues,
        recommendations,
        detectedIndustries,
        stats: {
          wordCount,
          pageCount: Math.ceil(wordCount / 400),
          keywordDensity,
          readabilityScore,
          sentenceCount: sentences.length,
          uniqueWords: new Set(words).size
        },
        roleFit
      });
      
      setIsAnalyzing(false);
      toast.success("ANALYSIS COMPLETE");
    }, 1500); 
  }, [resumeText, selectedRole]);

  const clearResults = () => {
    setResults(null);
    setResumeText("");
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActiveTab("upload");
  };

  const copyResults = () => {
    if (!results) return;
    
    const summary = `
ATS ANALYSIS REPORT
━━━━━━━━━━━━━━━━━━━━━
SCORE: ${results.score}/100
WORDS: ${results.stats.wordCount}
DENSITY: ${results.stats.keywordDensity}%

FOUND: ${results.found.length}
MISSING: ${results.missing.length}
ISSUES: ${results.formattingIssues.length}

TOP FIXES:
${results.recommendations.slice(0, 3).map(r => `• ${r}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(summary);
    toast.success("REPORT COPIED");
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-pink-600/5 blur-[100px] pointer-events-none" />

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <FileSearch className="text-pink-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">ATS SCANNER</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-4xl relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-8 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-pink-600/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-pink-500 border border-pink-600/20 shadow-[0_0_10px_rgba(219,39,119,0.2)]">
            <Sparkles className="h-3 w-3" /> Resume Intelligence
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            ATS <span className="text-transparent bg-clip-text bg-gradient-to-b from-pink-500 to-purple-600">Scanner</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-lg">
            Audit your CV against 6 industry-standard algorithms.
          </p>
        </div>

        {/* --- Main Content --- */}
        <div className="space-y-6">
          
          {/* Input Section */}
          <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-black/50 border border-white/10 w-full rounded-xl p-1 mb-6 h-12">
                  <TabsTrigger value="upload" className="flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-pink-600 data-[state=active]:text-white">
                    <FileUp className="h-3 w-3 mr-2" /> Upload PDF
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-pink-600 data-[state=active]:text-white">
                    <FileText className="h-3 w-3 mr-2" /> Raw Text
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-0">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-pink-500/50 hover:bg-pink-500/5 cursor-pointer transition-all group min-h-[160px] flex flex-col items-center justify-center"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin h-8 w-8 text-pink-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Processing Document...</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-neutral-800 group-hover:bg-pink-600 flex items-center justify-center mb-4 transition-colors">
                          <FileUp className="h-6 w-6 text-neutral-400 group-hover:text-white" />
                        </div>
                        <p className="text-sm font-black italic uppercase tracking-wider text-white">
                          {uploadedFileName || "Tap to Upload Resume"}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mt-1">
                          PDF or TXT Formats
                        </p>
                      </>
                    )}
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.txt" 
                      onChange={handleFileUpload} 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="paste" className="mt-0">
                  <textarea 
                    ref={textareaRef}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full h-[200px] bg-black/50 border border-white/10 rounded-2xl p-6 text-xs text-neutral-300 focus:outline-none focus:border-pink-500/50 resize-none font-mono custom-scrollbar placeholder:text-neutral-700 leading-relaxed"
                    placeholder="// Paste raw resume text here for analysis..."
                    spellCheck={false}
                  />
                </TabsContent>
              </Tabs>

              {/* Role Selection */}
              <div className="mt-6 space-y-3">
                <Label className="text-[9px] uppercase tracking-widest text-neutral-500 font-black flex items-center gap-1.5 pl-1">
                  <Target className="h-3 w-3 text-pink-500" /> Target Role Algorithm
                </Label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(KEYWORD_DATABASE).map(role => (
                    <button 
                      key={role} 
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all active:scale-95", 
                        selectedRole === role 
                          ? "bg-pink-600 text-white border-pink-500 shadow-[0_0_15px_rgba(219,39,119,0.4)]" 
                          : "bg-neutral-900 text-neutral-500 border-white/5 hover:border-white/20 hover:text-white"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analyze Button */}
              <Button 
                onClick={analyzeATS} 
                disabled={isAnalyzing || !resumeText}
                className="w-full h-14 mt-6 bg-white text-black hover:bg-neutral-200 font-black uppercase italic text-sm tracking-wider rounded-xl disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Running Audit...</>
                ) : (
                  <><Zap className="mr-2 h-4 w-4 fill-black"/> Execute Analysis</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {results && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Score Card */}
                <Card className="bg-neutral-900 border-white/10 overflow-hidden rounded-[2rem] relative">
                  <div className={cn("absolute top-0 left-0 w-full h-1", 
                    results.score >= 80 ? "bg-emerald-500" : results.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                  )} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                        <Award className="h-3 w-3" /> ATS Score
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={copyResults} className="h-8 w-8 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={clearResults} className="h-8 w-8 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className={cn("text-6xl font-black italic tracking-tighter", getScoreColor(results.score))}>
                        {results.score}
                      </span>
                      <span className="text-sm text-neutral-600 font-black uppercase tracking-widest">/ 100</span>
                    </div>
                    
                    <Progress value={results.score} className="h-2 bg-white/5 rounded-full mb-6" />
                    
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 bg-black/40 rounded-xl p-4 border border-white/5">
                      <div className="text-center">
                        <div className="text-xs font-black text-white">{results.stats.wordCount}</div>
                        <div className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Words</div>
                      </div>
                      <div className="text-center border-l border-white/5">
                        <div className="text-xs font-black text-white">{results.stats.pageCount}</div>
                        <div className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Pages</div>
                      </div>
                      <div className="text-center border-l border-white/5">
                        <div className="text-xs font-black text-white">{results.stats.keywordDensity}%</div>
                        <div className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Density</div>
                      </div>
                      <div className="text-center border-l border-white/5">
                        <div className="text-xs font-black text-white">{results.stats.readabilityScore}</div>
                        <div className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Readability</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords Found */}
                {results.found.length > 0 && (
                  <Card className="bg-neutral-900/40 border-white/10 rounded-3xl overflow-hidden">
                    <CardHeader className="p-5 pb-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleSection('keywords')}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2 text-white tracking-wider">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Matches Detected ({results.found.length})
                        </CardTitle>
                        {expandedSections.keywords ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                        {expandedSections.keywords && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <CardContent className="p-5 pt-2">
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {results.found.map((f) => (
                                    <Badge 
                                    key={f.keyword} 
                                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] px-2.5 py-1 font-bold uppercase tracking-wide hover:bg-emerald-500/20"
                                    >
                                    {f.keyword} <span className="ml-1.5 opacity-50 border-l border-emerald-500/30 pl-1.5">{f.count}</span>
                                    </Badge>
                                ))}
                                </div>
                            </CardContent>
                        </motion.div>
                        )}
                    </AnimatePresence>
                  </Card>
                )}

                {/* Missing Keywords */}
                {results.missing.length > 0 && (
                  <Card className="bg-neutral-900/40 border-white/10 rounded-3xl overflow-hidden">
                    <CardHeader className="p-5 pb-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleSection('missing')}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2 text-white tracking-wider">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Critical Missing ({results.missing.length})
                        </CardTitle>
                        {expandedSections.missing ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                        {expandedSections.missing && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <CardContent className="p-5 pt-2">
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {results.missing.map((m) => (
                                    <Badge 
                                    key={m} 
                                    variant="outline" 
                                    className="text-red-400 border-red-500/20 text-[10px] px-2.5 py-1 font-bold uppercase tracking-wide bg-red-500/5 hover:bg-red-500/10"
                                    >
                                    {m}
                                    </Badge>
                                ))}
                                </div>
                            </CardContent>
                        </motion.div>
                        )}
                    </AnimatePresence>
                  </Card>
                )}

                {/* Role Compatibility */}
                <Card className="bg-neutral-900/40 border-white/10 rounded-3xl overflow-hidden">
                  <CardHeader className="p-5 pb-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleSection('roles')}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-black uppercase flex items-center gap-2 text-white tracking-wider">
                        <Briefcase className="h-4 w-4 text-pink-500" />
                        Role Matrix
                      </CardTitle>
                      {expandedSections.roles ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedSections.roles && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <CardContent className="p-5 pt-2 space-y-3">
                                {results.roleFit.slice(0, 4).map((role, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                                    <span className={cn(
                                        role.role === selectedRole ? "text-pink-500" : "text-neutral-500"
                                    )}>
                                        {role.role}
                                    </span>
                                    <span className={cn("font-mono", getScoreColor(role.score))}>
                                        {role.score}%
                                    </span>
                                    </div>
                                    <Progress value={role.score} className="h-1.5 bg-black border border-white/5" />
                                </div>
                                ))}
                            </CardContent>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Recommendations */}
                {(results.formattingIssues.length > 0 || results.recommendations.length > 0) && (
                  <Card className="bg-neutral-900/40 border-white/10 rounded-3xl overflow-hidden">
                    <CardHeader className="p-5 pb-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleSection('recommendations')}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2 text-white tracking-wider">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Action Items
                        </CardTitle>
                        {expandedSections.recommendations ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                        {expandedSections.recommendations && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <CardContent className="p-5 pt-2 space-y-4">
                                {results.formattingIssues.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-black text-yellow-500 uppercase mb-2 block tracking-widest">
                                    Format Warnings
                                    </span>
                                    <ul className="space-y-2">
                                    {results.formattingIssues.map((issue, idx) => (
                                        <li key={idx} className="text-[10px] text-yellow-500/80 flex items-start gap-2 bg-yellow-500/5 p-2 rounded-lg border border-yellow-500/10">
                                        <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                        <span>{issue}</span>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                                )}

                                {results.recommendations.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-black text-pink-500 uppercase mb-2 block tracking-widest">
                                    Optimization Strategy
                                    </span>
                                    <ul className="space-y-2">
                                    {results.recommendations.map((rec, idx) => (
                                        <li key={idx} className="text-[10px] text-pink-500/80 flex items-start gap-2 bg-pink-500/5 p-2 rounded-lg border border-pink-500/10">
                                        <Sparkles className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                        <span>{rec}</span>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                                )}
                            </CardContent>
                        </motion.div>
                        )}
                    </AnimatePresence>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- CORE PROMO --- */}
        <div className="mt-20 mb-10">
           <CorePromo />
        </div>

      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-pink-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-pink-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

    </div>
  );
}