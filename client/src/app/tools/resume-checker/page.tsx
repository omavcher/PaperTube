"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileSearch, Upload, ArrowLeft, Terminal, 
  CheckCircle2, AlertCircle, FileText, 
  Search, BarChart3, Zap, ShieldCheck, 
  Trash2, Copy, Sparkles, Briefcase, 
  LayoutDashboard, Info, Download, Eye,
  FileUp, FileCheck, FileX, Target, TrendingUp,
  Edit, Check, X, AlertTriangle, Award,
  Lightbulb, Clock, Users, BarChart,
  ArrowRight, ExternalLink, Maximize,
  FilePdf, FileType, Filter, Hash,
  Link2, Mail, Phone, MapPin, Globe,
  Calendar, BookOpen, Award as AwardIcon,
  File
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

// Dynamic import for PDF.js to avoid server-side issues
let pdfjsLib: any;

// Only import on client side
if (typeof window !== 'undefined') {
  import('pdfjs-dist').then((pdfjs) => {
    pdfjsLib = pdfjs;
  });
}

// --- Extended Keyword Database for Engineering Roles ---
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
  },
  "Mobile": {
    keywords: ["React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin", "Mobile UI", "App Store", "Push Notifications", "Firebase", "Redux", "TypeScript"],
    description: "Cross-platform mobile development",
    weight: 1.0,
    industry: ["Tech", "Social Media", "Gaming", "Fintech"]
  },
  "QA Engineer": {
    keywords: ["Selenium", "Cypress", "Jest", "Test Automation", "Manual Testing", "Quality Assurance", "Bug Tracking", "API Testing", "Performance Testing", "Jira"],
    description: "Software testing and quality assurance",
    weight: 1.0,
    industry: ["Tech", "E-commerce", "Enterprise", "Gaming"]
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
  const [autoExtract, setAutoExtract] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamically load PDF.js on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('pdfjs-dist').then((module) => {
        pdfjsLib = module;
        // Use CDN for worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        setPdfjsLoaded(true);
      }).catch((error) => {
        console.error("Failed to load PDF.js:", error);
        toast.error("PDF processing library failed to load. Text upload still works.");
      });
    }
  }, []);

  // Load saved resume text from localStorage
  useEffect(() => {
    const savedText = localStorage.getItem('resume-text');
    if (savedText) {
      setResumeText(savedText);
    }
  }, []);

  // Save resume text to localStorage
  useEffect(() => {
    if (resumeText) {
      localStorage.setItem('resume-text', resumeText);
    }
  }, [resumeText]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      if (file.type === 'application/pdf') {
        if (!pdfjsLoaded) {
          toast.error("PDF processing is still loading. Please try again in a moment.");
          return;
        }
        await extractTextFromPDF(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        await extractTextFromFile(file);
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // For Word documents, we'll show an error and suggest conversion
        toast.error("Word documents require additional processing. Please convert to PDF or text first.", {
          action: {
            label: "Learn More",
            onClick: () => window.open("https://www.adobe.com/acrobat/online/pdf-to-word.html", "_blank")
          }
        });
        setUploadedFileName(null);
      } else {
        toast.error("Unsupported file format. Please upload PDF or text files.");
        setUploadedFileName(null);
      }
    } catch (error) {
      console.error("File processing error:", error);
      toast.error("Failed to process file");
      setUploadedFileName(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Extract text from PDF file
  const extractTextFromPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
        
        // Update progress for large PDFs
        if (pdf.numPages > 5 && i % 5 === 0) {
          toast.info(`Processing page ${i} of ${pdf.numPages}...`);
        }
      }
      
      setResumeText(fullText);
      toast.success(`PDF processed successfully (${pdf.numPages} pages)`);
    } catch (error) {
      console.error("PDF extraction error:", error);
      
      // Fallback: Try to read as plain text if PDF extraction fails
      toast.error("PDF extraction failed. Trying alternative method...");
      try {
        const text = await file.text();
        setResumeText(text);
        toast.success("Resume loaded as text");
      } catch (fallbackError) {
        toast.error("Failed to extract text from PDF. Please upload a text file instead.");
      }
    }
  };

  // Extract text from text file
  const extractTextFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text);
      toast.success("Text file loaded successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read text file");
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const inputEvent = {
        target: { files: e.dataTransfer.files }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    await handleFileUpload(inputEvent);
  };

  // --- Core Analysis Logic ---
  const analyzeATS = () => {
    if (resumeText.length < 50) {
      toast.error("Resume text too short for analysis. Minimum 50 characters required.");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate Processing Delay with actual analysis
    setTimeout(() => {
      const targetRoleData = ROLE_KEYWORDS[selectedRole];
      const targetKeywords = targetRoleData.keywords;
      
      // Find matched keywords with counts
      const found = targetKeywords
        .map(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'gi');
          const matches = resumeText.match(regex);
          return {
            keyword: kw,
            count: matches ? matches.length : 0
          };
        })
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count);
      
      // Find missing keywords
      const missing = targetKeywords.filter(kw => 
        !found.some(f => f.keyword.toLowerCase() === kw.toLowerCase())
      );

      // Check for formatting issues
      const issues: string[] = [];
      
      // Contact info checks
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      if (!emailRegex.test(resumeText)) {
        issues.push("Missing valid email address");
      }
      
      const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;
      if (!phoneRegex.test(resumeText)) {
        issues.push("Missing phone number");
      }
      
      const linkedinRegex = /linkedin\.com\/in\/|linkedin\.com\/pub\/|linkedin\.com\/company\//i;
      if (!linkedinRegex.test(resumeText)) {
        issues.push("LinkedIn profile not mentioned");
      }
      
      const githubRegex = /github\.com\/[a-zA-Z0-9-]+/i;
      if (!githubRegex.test(resumeText)) {
        issues.push("GitHub profile not mentioned");
      }

      // Content checks
      const words = resumeText.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      
      if (wordCount < 200) {
        issues.push("Resume might be too short (under 200 words)");
      }
      if (wordCount > 1000) {
        issues.push("Resume might be too long (over 1000 words)");
      }

      // Check for action verbs (important for ATS)
      const actionVerbs = ["developed", "implemented", "created", "managed", "led", "improved", "increased", "reduced", "optimized", "designed"];
      const hasActionVerbs = actionVerbs.some(verb => resumeText.toLowerCase().includes(verb));
      if (!hasActionVerbs) {
        issues.push("Consider adding more action verbs (developed, implemented, etc.)");
      }

      // Keyword density check
      const totalKeywords = found.reduce((sum, item) => sum + item.count, 0);
      const keywordDensity = (totalKeywords / wordCount) * 100;

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (missing.length > targetKeywords.length * 0.3) {
        const topMissing = missing.slice(0, 5);
        recommendations.push(`Add missing keywords: ${topMissing.join(', ')}`);
      }
      
      if (keywordDensity < 2) {
        recommendations.push("Increase keyword density by repeating important skills");
      }
      
      if (found.length < targetKeywords.length * 0.5) {
        recommendations.push("Consider adding more role-specific terminology");
      }

      // Calculate score (0-100)
      const baseScore = (found.length / targetKeywords.length) * 70;
      const densityBonus = Math.min(keywordDensity * 2, 20);
      const formattingPenalty = issues.length * 5;
      const score = Math.min(Math.max(baseScore + densityBonus - formattingPenalty, 0), 100);

      // Calculate role fit for all roles
      const roleFit = Object.entries(ROLE_KEYWORDS).map(([role, data]) => {
        const roleFound = data.keywords.filter(kw => 
          new RegExp(`\\b${kw}\\b`, 'i').test(resumeText)
        ).length;
        const roleScore = Math.round((roleFound / data.keywords.length) * 100);
        return { role, score: roleScore };
      }).sort((a, b) => b.score - a.score);

      // Calculate readability score (simplified Flesch Reading Ease)
      const sentences = resumeText.split(/[.!?]+/).length;
      const avgWordsPerSentence = wordCount / Math.max(sentences, 1);
      let readabilityScore = 100;
      if (avgWordsPerSentence > 20) readabilityScore -= 30;
      if (avgWordsPerSentence > 25) readabilityScore -= 20;
      readabilityScore = Math.max(30, Math.min(100, readabilityScore));

      setResults({
        score: Math.round(score),
        found,
        missing,
        formattingIssues: issues,
        recommendations,
        stats: {
          wordCount,
          pageCount: Math.ceil(wordCount / 300),
          keywordDensity: parseFloat(keywordDensity.toFixed(2)),
          readabilityScore: Math.round(readabilityScore)
        },
        roleFit
      });
      
      setIsAnalyzing(false);
      toast.success(`Analysis complete! Score: ${Math.round(score)}%`);
    }, 1500);
  };

  const clearWorkspace = () => {
    setResumeText("");
    setResults(null);
    setUploadedFileName(null);
    localStorage.removeItem('resume-text');
    toast.info("Workspace cleared");
  };

  const copyResumeText = () => {
    navigator.clipboard.writeText(resumeText)
      .then(() => toast.success("Resume text copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const downloadAnalysis = () => {
    if (!results) return;
    
    const analysisReport = `
ATS Resume Analysis Report
==========================
Generated: ${new Date().toLocaleString()}
Target Role: ${selectedRole}
Overall Score: ${results.score}%

--- KEYWORD ANALYSIS ---
Matched Keywords (${results.found.length}):
${results.found.map(f => `  • ${f.keyword}: ${f.count} occurrence${f.count > 1 ? 's' : ''}`).join('\n')}

Missing Keywords (${results.missing.length}):
${results.missing.map(m => `  • ${m}`).join('\n')}

--- STATISTICS ---
Word Count: ${results.stats.wordCount}
Estimated Pages: ${results.stats.pageCount}
Keyword Density: ${results.stats.keywordDensity}%
Readability Score: ${results.stats.readabilityScore}/100

--- RECOMMENDATIONS ---
${results.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${results.formattingIssues.length > 0 ? `\n--- FORMATTING ISSUES ---\n${results.formattingIssues.map((f, i) => `${i + 1}. ${f}`).join('\n')}` : ''}

--- BEST ROLE MATCHES ---
${results.roleFit.slice(0, 5).map(r => `• ${r.role}: ${r.score}%`).join('\n')}

--- ANALYSIS TIPS ---
• Aim for 70%+ score for optimal ATS compatibility
• Include specific technologies mentioned in job descriptions
• Use bullet points for readability
• Quantify achievements with numbers and metrics
• Keep resume length to 1-2 pages
• Include contact information clearly

Generated by Resume ATS Scanner
    `.trim();

    const blob = new Blob([analysisReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-analysis-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Analysis report downloaded");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-pink-500/30">
      {/* Header Section */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </Link>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                <FileSearch className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">ATS <span className="text-pink-400">Scanner</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Label className="text-xs text-neutral-400">Auto-extract</Label>
              <Switch
                checked={autoExtract}
                onCheckedChange={setAutoExtract}
                className="data-[state=checked]:bg-pink-500"
              />
            </div>
            
            <Badge variant="outline" className="border-pink-500/20 text-pink-400 uppercase tracking-widest text-[10px]">
              <Sparkles className="h-3 w-3 mr-1" /> Beta
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Tool Intro */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter italic uppercase">
                Optimize for the <span className="text-pink-400">Machine</span>
              </h2>
              <p className="text-neutral-400 text-lg">Upload your resume (PDF/TXT) and analyze ATS compatibility</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="border-pink-500/20 text-pink-400 hover:bg-pink-500/10"
              >
                {showAdvanced ? "Basic Mode" : "Advanced Mode"}
              </Button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center gap-3 bg-neutral-900 p-2 rounded-2xl border border-white/5 min-w-max">
              <span className="text-[10px] font-black uppercase text-neutral-500 ml-2 shrink-0">Target Role:</span>
              {Object.keys(ROLE_KEYWORDS).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                    selectedRole === role 
                      ? "bg-pink-500 text-black shadow-lg shadow-pink-500/20" 
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                  title={ROLE_KEYWORDS[role].description}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Input Side */}
            <div className="lg:col-span-7 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 bg-neutral-900 p-1 rounded-2xl">
                  <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-black">
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-black">
                    <FileText className="h-4 w-4 mr-2" /> Paste Text
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-black">
                    <Briefcase className="h-4 w-4 mr-2" /> Templates
                  </TabsTrigger>
                </TabsList>

                {/* Upload Tab */}
                <TabsContent value="upload" className="space-y-4">
                  <Card className="bg-neutral-900 border-dashed border-2 border-white/5 rounded-[2rem]">
                    <CardContent className="p-8 md:p-12 text-center">
                      <div 
                        className={cn(
                          "border-4 border-dashed rounded-3xl p-8 md:p-12 transition-colors cursor-pointer",
                          isUploading 
                            ? "border-pink-500/50 bg-pink-500/5" 
                            : "border-white/10 hover:border-pink-500/50"
                        )}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <div className="space-y-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto"></div>
                            <h3 className="text-xl font-bold text-neutral-300 mb-2">
                              Processing Resume...
                            </h3>
                            <p className="text-neutral-500 text-sm">
                              Extracting text from your file
                            </p>
                          </div>
                        ) : (
                          <>
                            <FileUp className="h-16 w-16 mx-auto mb-6 text-neutral-700" />
                            <h3 className="text-xl font-bold text-neutral-300 mb-2">
                              Drag & Drop Resume Here
                            </h3>
                            <p className="text-neutral-500 text-sm mb-6">
                              Supports PDF, TXT files. Max 10MB.
                            </p>
                            <Button className="bg-pink-500 hover:bg-pink-600 text-black font-bold">
                              <Upload className="h-4 w-4 mr-2" /> Choose File
                            </Button>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.txt,.md"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </div>
                      
                      {uploadedFileName && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-3 rounded-xl border border-emerald-500/20"
                        >
                          <FileCheck className="h-5 w-5" />
                          <div className="text-left">
                            <p className="text-sm font-medium">{uploadedFileName}</p>
                            <p className="text-xs text-emerald-500/70">Ready for analysis</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedFileName(null)}
                            className="ml-2 h-6 w-6 p-0 text-emerald-400 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      )}

                      {/* File Processing Tips */}
                      <div className="mt-8 text-left space-y-3">
                        <h4 className="text-sm font-bold text-pink-400 flex items-center gap-2">
                          <Info className="h-4 w-4" /> Tips for Best Results
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-500">
                          <li className="flex items-start gap-2">
                            <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                            <span>Use standard fonts (Arial, Calibri, Times New Roman)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                            <span>Save as PDF for best formatting preservation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                            <span>Include phone number and email in plain text</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                            <span>Keep resume length to 1-2 pages</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paste Tab */}
                <TabsContent value="paste">
                  <Card className="bg-neutral-900 border-white/5 rounded-[2rem]">
                    <div className="bg-black/50 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-pink-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Resume Text Input</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={copyResumeText}
                          disabled={!resumeText}
                          className="h-7 text-xs text-neutral-400 hover:text-pink-400"
                        >
                          <Copy size={12} /> Copy
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearWorkspace}
                          className="h-7 text-xs text-neutral-400 hover:text-red-400"
                        >
                          <Trash2 size={12} /> Clear
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder={`Paste your resume text here...

How to extract text from PDF:
1. Open PDF in Adobe Reader or Preview
2. Press Ctrl+A (Cmd+A on Mac) to select all
3. Press Ctrl+C (Cmd+C) to copy
4. Press Ctrl+V (Cmd+V) here

Example content:
John Doe
Senior Software Engineer
john.doe@email.com | (123) 456-7890
linkedin.com/in/johndoe | github.com/johndoe

EXPERIENCE
• Developed React applications serving 10K+ users
• Implemented REST APIs using Node.js and Express
• Deployed applications on AWS using Docker and Kubernetes
• Improved performance by 40% through code optimization

SKILLS
React, Node.js, TypeScript, AWS, Docker, PostgreSQL, REST APIs

EDUCATION
B.S. Computer Science - University Name (2020-2024)`}
                      className="w-full min-h-[400px] p-6 bg-transparent font-mono text-sm text-neutral-300 focus:outline-none transition-all resize-none placeholder:text-neutral-700 placeholder:leading-relaxed"
                      spellCheck={false}
                    />
                    <div className="p-4 bg-black/20 border-t border-white/5 text-xs text-neutral-500">
                      <div className="flex items-center gap-4">
                        <span>Characters: {resumeText.length}</span>
                        <span>Words: {resumeText.split(/\s+/).filter(w => w.length > 0).length}</span>
                        <span>Lines: {resumeText.split('\n').length}</span>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates">
                  <Card className="bg-neutral-900 border-white/5 rounded-[2rem]">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(ROLE_KEYWORDS).map(([role, data], index) => (
                          <Card 
                            key={index} 
                            className="bg-neutral-800/50 border-white/5 hover:border-pink-500/30 cursor-pointer transition-all hover:scale-[1.02]"
                            onClick={() => {
                              setSelectedRole(role);
                              setActiveTab("paste");
                              toast.success(`Switched to ${role} role. Paste your resume text to analyze.`);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-bold text-white">{role}</h4>
                                  <p className="text-xs text-neutral-400 mt-1">{data.description}</p>
                                  <Badge variant="outline" className="mt-2 text-[10px] border-pink-500/20 text-pink-400">
                                    {data.industry.join(", ")}
                                  </Badge>
                                </div>
                                <ArrowRight className="h-4 w-4 text-pink-400 mt-1" />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {data.keywords.slice(0, 5).map((kw, i) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-black/30 rounded text-neutral-400">
                                    {kw}
                                  </span>
                                ))}
                                {data.keywords.length > 5 && (
                                  <span className="text-xs px-2 py-1 bg-black/30 rounded text-neutral-600">
                                    +{data.keywords.length - 5} more
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Analysis Button */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                <Button 
                  onClick={analyzeATS} 
                  disabled={isAnalyzing || !resumeText}
                  className="w-full h-16 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-black font-black text-lg rounded-2xl transition-all shadow-xl shadow-pink-500/10 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-3 h-6 w-6 fill-black" />
                      Run ATS Analysis
                    </>
                  )}
                </Button>
              </div>

              {/* Text Stats */}
              {resumeText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-neutral-900 border-white/5 rounded-2xl">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Words</p>
                          <p className="text-2xl font-black text-white">
                            {resumeText.split(/\s+/).filter(w => w.length > 0).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Characters</p>
                          <p className="text-2xl font-black text-white">{resumeText.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Lines</p>
                          <p className="text-2xl font-black text-white">{resumeText.split('\n').length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Pages</p>
                          <p className="text-2xl font-black text-white">
                            {Math.ceil(resumeText.split(/\s+/).filter(w => w.length > 0).length / 300)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Results Side */}
            <div className="lg:col-span-5 space-y-6">
              <AnimatePresence mode="wait">
                {!results ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <Card className="bg-neutral-900/50 border-dashed border-2 border-white/5 h-full flex flex-col items-center justify-center p-12 text-center rounded-[2rem]">
                      <div className="p-6 bg-white/5 rounded-full mb-6">
                        <LayoutDashboard size={48} className="text-neutral-700" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-500 uppercase tracking-tighter">Awaiting Analysis</h3>
                      <p className="text-neutral-600 text-sm mt-2 max-w-md">
                        {resumeText 
                          ? "Click the 'Run ATS Analysis' button to start scanning your resume"
                          : "Upload your resume or paste text to begin analysis"}
                      </p>
                    </Card>

                    {/* Quick Tips */}
                    <Card className="bg-neutral-900 border-white/5 rounded-[2rem]">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold text-pink-400 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" /> ATS Optimization Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          "Use standard section headers: Experience, Education, Skills",
                          "Include specific technologies (React, AWS, Python, Docker)",
                          "Add quantifiable achievements with numbers",
                          "Use bullet points for readability",
                          "Avoid tables, images, and fancy formatting",
                          "Include contact information clearly",
                          "Use action verbs: developed, implemented, created",
                          "Keep resume length to 1-2 pages",
                          "Customize keywords for each job application",
                          "Include both hard and soft skills"
                        ].map((tip, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-neutral-400">
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    {/* Score Card */}
                    <Card className="bg-neutral-900 border-white/5 rounded-[2rem] overflow-hidden">
                      <CardContent className="p-8 text-center space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">ATS Score</p>
                          <Badge className={`${getScoreBg(results.score)} text-black font-bold`}>
                            {results.score >= 80 ? "Excellent" : results.score >= 60 ? "Good" : "Needs Work"}
                          </Badge>
                        </div>
                        <div className="relative inline-flex items-center justify-center">
                          <svg className="w-40 h-40 transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                              strokeDasharray={440} strokeDashoffset={440 - (440 * results.score) / 100}
                              className={cn("transition-all duration-1000", getScoreColor(results.score))}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-5xl font-black">
                            <span className={getScoreColor(results.score)}>{results.score}</span><span className="text-2xl text-neutral-500">%</span>
                          </span>
                        </div>
                        <Progress value={results.score} className="h-2 bg-white/5" />
                        <p className="text-sm text-neutral-400">
                          {results.score >= 80 
                            ? "Excellent! Your resume is well-optimized for ATS systems." 
                            : results.score >= 60 
                            ? "Good foundation. Add more specific keywords to improve." 
                            : "Needs improvement. Focus on adding missing keywords and optimizing format."}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Keywords Analysis */}
                    <Card className="bg-neutral-900 border-white/5 rounded-[2rem]">
                      <CardHeader>
                        <CardTitle className="text-xs font-black uppercase text-neutral-500 tracking-widest flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-pink-400" /> Keyword Analysis
                          </div>
                          <span className="text-xs text-neutral-500">
                            {results.found.length} of {ROLE_KEYWORDS[selectedRole].keywords.length} matched
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Found Keywords */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle2 size={12} /> Matched ({results.found.length})
                            </p>
                            <span className="text-xs text-emerald-400">
                              Strength: {Math.round((results.found.length / ROLE_KEYWORDS[selectedRole].keywords.length) * 100)}%
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {results.found.slice(0, 12).map(item => (
                              <Badge 
                                key={item.keyword} 
                                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group relative"
                                title={`Appears ${item.count} time${item.count > 1 ? 's' : ''}`}
                              >
                                {item.keyword} 
                                {item.count > 1 && (
                                  <span className="ml-1 text-xs opacity-75">×{item.count}</span>
                                )}
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                                  Found {item.count} time{item.count > 1 ? 's' : ''}
                                </span>
                              </Badge>
                            ))}
                            {results.found.length > 12 && (
                              <Badge variant="outline" className="text-xs text-neutral-500">
                                +{results.found.length - 12} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Missing Keywords */}
                        {results.missing.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={12} /> Missing ({results.missing.length})
                              </p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  const missingText = results.missing.join(', ');
                                  navigator.clipboard.writeText(missingText);
                                  toast.success("Missing keywords copied to clipboard");
                                }}
                                className="h-6 text-xs hover:bg-red-500/10 hover:text-red-400"
                              >
                                <Copy size={10} /> Copy
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {results.missing.slice(0, 12).map(kw => (
                                <Badge 
                                  key={kw} 
                                  className="bg-red-500/10 text-red-400 border-red-500/20 cursor-help hover:bg-red-500/20 transition-colors group relative"
                                  title="Add this keyword to improve your score"
                                >
                                  {kw}
                                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                                    Add this keyword to resume
                                  </span>
                                </Badge>
                              ))}
                              {results.missing.length > 12 && (
                                <Badge variant="outline" className="text-xs text-neutral-500">
                                  +{results.missing.length - 12} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="bg-neutral-900 border-white/5 rounded-[2rem]">
                      <CardHeader>
                        <CardTitle className="text-xs font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                          <AwardIcon size={14} className="text-pink-400" /> Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {results.recommendations.length > 0 ? (
                          results.recommendations.map((rec, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-pink-500/10"
                            >
                              <Target className="h-4 w-4 text-pink-400 mt-0.5 shrink-0" />
                              <p className="text-sm text-neutral-300">{rec}</p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <p className="text-sm text-emerald-500">No major recommendations. Your resume looks good!</p>
                          </div>
                        )}
                        
                        {results.formattingIssues.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                          >
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Formatting Issues:</p>
                            {results.formattingIssues.map((issue, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Stats & Role Fit */}
                    <Card className="bg-neutral-900 border-white/5 rounded-[2rem]">
                      <CardHeader>
                        <CardTitle className="text-xs font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                          <BarChart size={14} className="text-pink-400" /> Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Statistics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-neutral-500 uppercase">Word Count</p>
                            <p className="text-xl font-bold">{results.stats.wordCount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-neutral-500 uppercase">Readability</p>
                            <p className="text-xl font-bold">{results.stats.readabilityScore}/100</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-neutral-500 uppercase">Keyword Density</p>
                            <p className="text-xl font-bold">{results.stats.keywordDensity}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-neutral-500 uppercase">Estimated Pages</p>
                            <p className="text-xl font-bold">{results.stats.pageCount}</p>
                          </div>
                        </div>

                        {/* Role Fit */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Best Role Matches</p>
                          <div className="space-y-2">
                            {results.roleFit.slice(0, 3).map((fit, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-sm text-neutral-300">{fit.role}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={fit.score} className="w-24 h-2 bg-white/5" />
                                  <span className={cn("text-sm font-bold min-w-[40px] text-right", getScoreColor(fit.score))}>
                                    {fit.score}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-pink-500/20 text-pink-400 hover:bg-pink-500/10"
                        onClick={downloadAnalysis}
                      >
                        <Download className="h-4 w-4 mr-2" /> Export Report
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-white/10 text-neutral-400 hover:bg-white/5"
                        onClick={() => {
                          setResults(null);
                          toast.info("Starting new analysis");
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> New Analysis
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Guide Section */}
      <section className="bg-neutral-950/50 py-20 border-t border-white/5 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400">
                  <Search size={24} />
                </div>
                <h3 className="text-white font-bold text-lg italic uppercase">Keyword Matching</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Modern ATS systems scan for specific technical terms and keywords. Our analyzer identifies matches and suggests improvements to get your resume noticed.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400">
                  <File size={24} />
                </div>
                <h3 className="text-white font-bold text-lg italic uppercase">PDF & Text Support</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Upload PDF or text resumes. Our system extracts content, analyzes formatting, and provides actionable insights for ATS optimization.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-white font-bold text-lg italic uppercase">Score Calibration</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Aim for 70%+ score. This indicates strong ATS compatibility with proper keyword density, formatting, and role-specific terminology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}