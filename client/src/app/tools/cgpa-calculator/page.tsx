"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, GraduationCap, TrendingUp, Target, 
  BarChart3, PieChart, History, Download,
  Info, Sparkles, Award, Trophy,
  RefreshCw, Share2, Copy, BookOpen,
  School, Globe, Clock, CheckCircle,
  AlertCircle, HelpCircle, Settings,
  ExternalLink, ChevronRight, Star,
  Zap,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Head from "next/head";

interface ConversionResult {
  cgpa: number;
  percentage: number;
  grade: string;
  classification: string;
  scale: string;
  timestamp: Date;
}

interface GradingScale {
  id: string;
  name: string;
  description: string;
  scale: number;
  countries: string[];
  formula: (cgpa: number) => number;
  color: string;
}

interface University {
  id: string;
  name: string;
  country: string;
  gradingSystem: string;
  conversionFormula: string;
  scale: number;
}

export default function CGPAToPercentagePage() {
  const [cgpa, setCgpa] = useState<string>('3.5');
  const [selectedScale, setSelectedScale] = useState<string>('4.0');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [history, setHistory] = useState<ConversionResult[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Grading scales
  const gradingScales: GradingScale[] = [
    {
      id: '4.0',
      name: '4.0 Scale',
      description: 'Most common in US, Canada',
      scale: 4.0,
      countries: ['USA', 'Canada', 'Singapore'],
      formula: (cgpa: number) => (cgpa / 4.0) * 100,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: '5.0',
      name: '5.0 Scale',
      description: 'Used in some Indian universities',
      scale: 5.0,
      countries: ['India', 'Bangladesh'],
      formula: (cgpa: number) => (cgpa / 5.0) * 100,
      color: 'bg-green-500/10 text-green-400 border-green-500/20'
    },
    {
      id: '10.0',
      name: '10.0 Scale',
      description: 'Common in European countries',
      scale: 10.0,
      countries: ['Germany', 'France', 'Italy'],
      formula: (cgpa: number) => (cgpa / 10.0) * 100,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      id: '9.0',
      name: '9.0 Scale',
      description: 'Some Indian universities',
      scale: 9.0,
      countries: ['India'],
      formula: (cgpa: number) => (cgpa / 9.0) * 100,
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    },
    {
      id: '7.0',
      name: '7.0 Scale',
      description: 'Australian universities',
      scale: 7.0,
      countries: ['Australia', 'New Zealand'],
      formula: (cgpa: number) => (cgpa / 7.0) * 100,
      color: 'bg-red-500/10 text-red-400 border-red-500/20'
    },
    {
      id: 'custom',
      name: 'Custom Scale',
      description: 'Set your own scale',
      scale: 0,
      countries: ['Custom'],
      formula: (cgpa: number) => 0,
      color: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  ];

  // Universities database
  const universities: University[] = [
    {
      id: 'mit',
      name: 'MIT',
      country: 'USA',
      gradingSystem: '4.0 Scale',
      conversionFormula: 'CGPA × 25',
      scale: 4.0
    },
    {
      id: 'stanford',
      name: 'Stanford University',
      country: 'USA',
      gradingSystem: '4.0 Scale',
      conversionFormula: 'CGPA × 25',
      scale: 4.0
    },
    {
      id: 'harvard',
      name: 'Harvard University',
      country: 'USA',
      gradingSystem: '4.0 Scale',
      conversionFormula: 'CGPA × 25',
      scale: 4.0
    },
    {
      id: 'iitb',
      name: 'IIT Bombay',
      country: 'India',
      gradingSystem: '10.0 Scale',
      conversionFormula: 'CGPA × 10',
      scale: 10.0
    },
    {
      id: 'iitd',
      name: 'IIT Delhi',
      country: 'India',
      gradingSystem: '10.0 Scale',
      conversionFormula: 'CGPA × 10',
      scale: 10.0
    },
    {
      id: 'oxford',
      name: 'University of Oxford',
      country: 'UK',
      gradingSystem: '100% Scale',
      conversionFormula: 'Direct Conversion',
      scale: 100
    },
    {
      id: 'cambridge',
      name: 'University of Cambridge',
      country: 'UK',
      gradingSystem: 'Class System',
      conversionFormula: 'Class-based',
      scale: 100
    },
    {
      id: 'nus',
      name: 'National University of Singapore',
      country: 'Singapore',
      gradingSystem: '5.0 Scale',
      conversionFormula: 'CGPA × 20',
      scale: 5.0
    },
    {
      id: 'tsinghua',
      name: 'Tsinghua University',
      country: 'China',
      gradingSystem: '100% Scale',
      conversionFormula: 'Direct Conversion',
      scale: 100
    },
    {
      id: 'eth',
      name: 'ETH Zurich',
      country: 'Switzerland',
      gradingSystem: '6.0 Scale',
      conversionFormula: 'CGPA × 16.67',
      scale: 6.0
    }
  ];

  // Custom scale state
  const [customScale, setCustomScale] = useState<string>('4.0');

  // Get selected scale
  const getSelectedScale = () => {
    if (selectedScale === 'custom') {
      const scale = parseFloat(customScale) || 4.0;
      return {
        ...gradingScales.find(s => s.id === '4.0')!,
        scale,
        formula: (cgpa: number) => (cgpa / scale) * 100
      };
    }
    return gradingScales.find(scale => scale.id === selectedScale) || gradingScales[0];
  };

  // Calculate percentage
  const calculatePercentage = () => {
    const cgpaValue = parseFloat(cgpa);
    
    if (isNaN(cgpaValue) || cgpaValue < 0) {
      toast.error('Please enter a valid CGPA');
      return;
    }

    const scale = getSelectedScale();
    const percentage = scale.formula(cgpaValue);
    
    // Get grade and classification
    let grade = '';
    let classification = '';
    
    if (percentage >= 90) {
      grade = 'A+';
      classification = 'Outstanding';
    } else if (percentage >= 80) {
      grade = 'A';
      classification = 'Excellent';
    } else if (percentage >= 70) {
      grade = 'B';
      classification = 'Good';
    } else if (percentage >= 60) {
      grade = 'C';
      classification = 'Average';
    } else if (percentage >= 50) {
      grade = 'D';
      classification = 'Pass';
    } else {
      grade = 'F';
      classification = 'Fail';
    }

    const result: ConversionResult = {
      cgpa: cgpaValue,
      percentage: parseFloat(percentage.toFixed(2)),
      grade,
      classification,
      scale: scale.name,
      timestamp: new Date()
    };

    setResults([result]);
    setHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
    
    toast.success('Calculation completed!');
  };

  // Calculate for all scales
  const calculateAllScales = () => {
    const cgpaValue = parseFloat(cgpa);
    
    if (isNaN(cgpaValue) || cgpaValue < 0) {
      toast.error('Please enter a valid CGPA');
      return;
    }

    const allResults: ConversionResult[] = gradingScales
      .filter(scale => scale.id !== 'custom')
      .map(scale => {
        const percentage = scale.formula(cgpaValue);
        
        let grade = '';
        let classification = '';
        
        if (percentage >= 90) {
          grade = 'A+';
          classification = 'Outstanding';
        } else if (percentage >= 80) {
          grade = 'A';
          classification = 'Excellent';
        } else if (percentage >= 70) {
          grade = 'B';
          classification = 'Good';
        } else if (percentage >= 60) {
          grade = 'C';
          classification = 'Average';
        } else if (percentage >= 50) {
          grade = 'D';
          classification = 'Pass';
        } else {
          grade = 'F';
          classification = 'Fail';
        }

        return {
          cgpa: cgpaValue,
          percentage: parseFloat(percentage.toFixed(2)),
          grade,
          classification,
          scale: scale.name,
          timestamp: new Date()
        };
      });

    setResults(allResults);
    toast.success('Calculated for all grading scales!');
  };

  // Clear all
  const clearAll = () => {
    setCgpa('3.5');
    setResults([]);
    toast.success('Cleared all calculations');
  };

  // Copy results
  const copyResults = () => {
    if (results.length === 0) {
      toast.error('No results to copy');
      return;
    }

    const text = results.map(r => 
      `CGPA: ${r.cgpa} (${r.scale} scale)\nPercentage: ${r.percentage}%\nGrade: ${r.grade} (${r.classification})`
    ).join('\n\n');

    navigator.clipboard.writeText(text);
    toast.success('Results copied to clipboard!');
  };

  // Share results
  const shareResults = async () => {
    if (results.length === 0) {
      toast.error('No results to share');
      return;
    }

    const result = results[0];
    const text = `My CGPA ${result.cgpa} (${result.scale} scale) is ${result.percentage}% - Grade ${result.grade}`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CGPA to Percentage Calculator',
          text,
          url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${text}\n\n${url}`);
      toast.success('Link copied to clipboard!');
    }
  };

  // Download results as text
  const downloadResults = () => {
    if (results.length === 0) {
      toast.error('No results to download');
      return;
    }

    const text = results.map(r => 
      `CGPA to Percentage Conversion Result\n` +
      `==============================\n` +
      `CGPA: ${r.cgpa}\n` +
      `Grading Scale: ${r.scale}\n` +
      `Percentage: ${r.percentage}%\n` +
      `Grade: ${r.grade}\n` +
      `Classification: ${r.classification}\n` +
      `Calculated: ${r.timestamp.toLocaleString()}\n` +
      `==============================`
    ).join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cgpa-conversion-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Results downloaded!');
  };

  // Load example
  const loadExample = () => {
    setCgpa('3.75');
    setSelectedScale('4.0');
    toast.success('Loaded example CGPA');
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  // Load from history
  const loadFromHistory = (result: ConversionResult) => {
    setCgpa(result.cgpa.toString());
    setSelectedScale(gradingScales.find(s => s.name === result.scale)?.id || '4.0');
    toast.success(`Loaded CGPA ${result.cgpa}`);
  };

  // Initialize with calculation
  useEffect(() => {
    calculatePercentage();
  }, []);

  // Get selected university
  const selectedUni = universities.find(u => u.id === selectedUniversity);

  return (
    <>
      <Head>
        <title>CGPA to Percentage Calculator | Accurate Conversion Tool</title>
        <meta name="description" content="Convert CGPA to percentage for multiple grading scales. Supports 4.0, 5.0, 10.0 scales and university-specific conversions." />
        <meta name="keywords" content="cgpa to percentage, gpa calculator, grade conversion, academic calculator, university grading" />
        <meta property="og:title" content="CGPA to Percentage Calculator" />
        <meta property="og:description" content="Accurate CGPA to percentage conversion for all grading systems" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CGPA to Percentage Calculator" />
        <meta name="twitter:description" content="Convert CGPA to percentage instantly with our advanced calculator" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12">
          <div className="container relative z-10 mx-auto px-4">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 border border-green-500/20">
              <Sparkles className="h-4 w-4" />
              Accurate • Multiple Scales • University Specific
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Title and Description */}
              <div className="lg:w-1/2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-green-500/10 p-2.5">
                    <Calculator className="h-6 w-6 text-green-400" />
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    Most Accurate
                  </Badge>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">CGPA</span> to Percentage Calculator
                </h1>
                
                <p className="text-lg text-neutral-300 mb-6">
                  Convert your CGPA to percentage accurately across multiple grading scales. 
                  Supports 4.0, 5.0, 10.0 scales and university-specific conversion formulas.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="text-2xl font-bold text-green-500">6+</div>
                    <div className="text-sm text-neutral-400">Scales</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="text-2xl font-bold text-green-500">10+</div>
                    <div className="text-sm text-neutral-400">Universities</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="text-2xl font-bold text-green-500">✓</div>
                    <div className="text-sm text-neutral-400">Real-time</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="text-2xl font-bold text-green-500">100%</div>
                    <div className="text-sm text-neutral-400">Free</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-neutral-900/30 rounded-lg p-4 border border-neutral-800 mb-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Popular Conversions:
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">3.0 CGPA (4.0 scale)</span>
                      <span className="text-green-400">75.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">8.5 CGPA (10.0 scale)</span>
                      <span className="text-green-400">85.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">4.0 CGPA (5.0 scale)</span>
                      <span className="text-green-400">80.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">6.0 CGPA (7.0 scale)</span>
                      <span className="text-green-400">85.7%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Calculator */}
              <div className="lg:w-1/2">
                <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>CGPA Calculator</span>
                      <div className="flex items-center gap-2">
                        {results.length > 0 && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            Calculated
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Enter your CGPA and select grading scale
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* CGPA Input */}
                    <div className="mb-6">
                      <label className="text-sm font-medium mb-2 block">Enter CGPA</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.01"
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-lg pl-12"
                          placeholder="e.g., 3.5"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <GraduationCap className="h-5 w-5 text-neutral-400" />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="text-xs text-neutral-500">Enter value between 0-10</div>
                        <div className="text-xs text-neutral-500">
                          Scale: {getSelectedScale().scale.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Grading Scale Selection */}
                    <div className="mb-6">
                      <label className="text-sm font-medium mb-2 block">Grading Scale</label>
                      <div className="grid grid-cols-3 gap-2">
                        {gradingScales.map((scale) => (
                          <Button
                            key={scale.id}
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedScale(scale.id)}
                            className={cn(
                              "h-auto flex-col py-2",
                              selectedScale === scale.id
                                ? scale.color
                                : "border-neutral-700 bg-neutral-800/50"
                            )}
                          >
                            <div className="text-xs font-medium">{scale.name}</div>
                            <div className="text-[10px] text-neutral-400 mt-1">{scale.scale.toFixed(1)}</div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Scale Input */}
                    {selectedScale === 'custom' && (
                      <div className="mb-6">
                        <label className="text-sm font-medium mb-2 block">Custom Scale Value</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="0.1"
                          value={customScale}
                          onChange={(e) => setCustomScale(e.target.value)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
                          placeholder="e.g., 4.0"
                        />
                        <div className="text-xs text-neutral-500 mt-1">
                          Enter the maximum CGPA value for your grading system
                        </div>
                      </div>
                    )}

                    {/* University Selection */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">University (Optional)</label>
                        <Badge variant="outline" className="text-xs">Auto-scale</Badge>
                      </div>
                      <select
                        value={selectedUniversity}
                        onChange={(e) => {
                          setSelectedUniversity(e.target.value);
                          if (e.target.value) {
                            const uni = universities.find(u => u.id === e.target.value);
                            if (uni) {
                              const scale = gradingScales.find(s => s.scale === uni.scale);
                              if (scale) setSelectedScale(scale.id);
                            }
                          }
                        }}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select a university...</option>
                        {universities.map((uni) => (
                          <option key={uni.id} value={uni.id}>
                            {uni.name} ({uni.country}) - {uni.gradingSystem}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Results Display */}
                    {results.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium">Conversion Results</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {results.length} result{results.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        <AnimatePresence>
                          {results.map((result, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={cn(
                                "p-4 rounded-lg border mb-3",
                                result.percentage >= 90 ? "border-green-500/30 bg-green-500/5" :
                                result.percentage >= 80 ? "border-blue-500/30 bg-blue-500/5" :
                                result.percentage >= 70 ? "border-yellow-500/30 bg-yellow-500/5" :
                                result.percentage >= 60 ? "border-orange-500/30 bg-orange-500/5" :
                                "border-red-500/30 bg-red-500/5"
                              )}
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-neutral-400">CGPA</div>
                                  <div className="text-xl font-bold">{result.cgpa.toFixed(2)}</div>
                                  <div className="text-xs text-neutral-500">{result.scale}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-neutral-400">Percentage</div>
                                  <div className="text-xl font-bold text-green-400">{result.percentage.toFixed(2)}%</div>
                                  <div className="text-xs text-neutral-500">Equivalent</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <div className="text-xs text-neutral-400">Grade</div>
                                  <div className="text-lg font-medium">{result.grade}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-neutral-400">Classification</div>
                                  <div className="text-lg font-medium">{result.classification}</div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Button
                        onClick={calculatePercentage}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate
                      </Button>
                      <Button
                        onClick={calculateAllScales}
                        variant="outline"
                        className="border-neutral-700"
                      >
                        <PieChart className="h-4 w-4 mr-2" />
                        All Scales
                      </Button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyResults}
                        disabled={results.length === 0}
                        className="border-neutral-700"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadResults}
                        disabled={results.length === 0}
                        className="border-neutral-700"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareResults}
                        disabled={results.length === 0}
                        className="border-neutral-700"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Advanced Options */}
            <div className="lg:col-span-2 space-y-8">
              {/* Grade Distribution */}
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Grade Distribution & Analysis
                  </CardTitle>
                  <CardDescription>
                    Understand how your CGPA compares to grading standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Grade Chart */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {[
                        { grade: 'A+', min: 90, color: 'bg-green-500' },
                        { grade: 'A', min: 80, color: 'bg-green-400' },
                        { grade: 'B', min: 70, color: 'bg-yellow-500' },
                        { grade: 'C', min: 60, color: 'bg-orange-500' },
                        { grade: 'D/F', min: 0, color: 'bg-red-500' }
                      ].map((item) => {
                        const percentage = results[0]?.percentage || 0;
                        const isActive = percentage >= item.min;
                        return (
                          <div key={item.grade} className="text-center">
                            <div className={cn(
                              "h-2 rounded-t-lg mb-2",
                              item.color,
                              isActive ? "opacity-100" : "opacity-30"
                            )} />
                            <div className={cn(
                              "text-sm font-medium",
                              isActive ? "text-white" : "text-neutral-400"
                            )}>
                              {item.grade}
                            </div>
                            <div className="text-xs text-neutral-500">{item.min}%+</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Performance Analysis */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-neutral-800/50">
                        <div className="text-xs text-neutral-400 mb-1">Current CGPA</div>
                        <div className="text-xl font-bold">{parseFloat(cgpa) || 0}</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-neutral-800/50">
                        <div className="text-xs text-neutral-400 mb-1">Target %</div>
                        <div className="text-xl font-bold text-green-400">
                          {results[0]?.percentage ? `${results[0].percentage.toFixed(1)}%` : '--'}
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-neutral-800/50">
                        <div className="text-xs text-neutral-400 mb-1">Grade</div>
                        <div className="text-xl font-bold">
                          {results[0]?.grade || '--'}
                        </div>
                      </div>
                    </div>

                    {/* Improvement Calculator */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Improvement Calculator</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-neutral-400 mb-1">
                            <span>Target Percentage</span>
                            <span>Required CGPA</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={results[0]?.percentage || 75}
                              onChange={(e) => {
                                const targetPercentage = parseFloat(e.target.value);
                                const scale = getSelectedScale();
                                const requiredCGPA = (targetPercentage / 100) * scale.scale;
                                setCgpa(requiredCGPA.toFixed(2));
                              }}
                              className="flex-1"
                            />
                            <div className="w-16 text-center">
                              <div className="text-sm font-bold">{results[0]?.percentage || 75}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Formulas */}
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-400" />
                    Conversion Formulas & Methods
                  </CardTitle>
                  <CardDescription>
                    Different methods used by universities worldwide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <div className="text-xs text-blue-400 mb-1">Simple Percentage Method</div>
                        <div className="text-sm">(CGPA / Scale) × 100</div>
                        <div className="text-xs text-neutral-500 mt-1">Most common method</div>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                        <div className="text-xs text-green-400 mb-1">Multiply Method</div>
                        <div className="text-sm">CGPA × Conversion Factor</div>
                        <div className="text-xs text-neutral-500 mt-1">Used by many universities</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-neutral-400">
                      <p className="mb-2">
                        <span className="font-medium text-white">Note:</span> Different universities use different conversion formulas. 
                        Always check with your institution for the official conversion method.
                      </p>
                      <p>
                        Some universities use: <code className="bg-neutral-800 px-1 rounded">CGPA × 9.5</code> for 10-point scale, 
                        while others use <code className="bg-neutral-800 px-1 rounded">CGPA × 10</code>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Tools & History */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={loadExample}
                    variant="outline"
                    className="w-full border-neutral-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Example
                  </Button>
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    className="w-full border-neutral-700 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    variant="outline"
                    className="w-full border-neutral-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </Button>
                </CardContent>
              </Card>

              {/* History */}
              {history.length > 0 && (
                <Card className="border-neutral-800 bg-neutral-900/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-green-400" />
                        Recent Calculations
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {history.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/30 hover:border-green-500/30 cursor-pointer transition-colors"
                          onClick={() => loadFromHistory(item)}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold">{item.cgpa}</div>
                            <div className="text-[10px] text-neutral-500">CGPA</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-neutral-600" />
                          <div className="text-center flex-1">
                            <div className="text-lg font-bold text-green-400">{item.percentage}%</div>
                            <div className="text-[10px] text-neutral-500">{item.grade}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Tips */}
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-green-400" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Always verify with your university's official conversion formula</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Different countries use different grading scales</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Save your calculations for future reference</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Grading Scales Comparison */}
        <section className="py-12 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white">Grading Scales Comparison</h2>
              <p className="mt-4 text-gray-400">Understand different grading systems worldwide</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="py-3 px-4 text-left text-sm font-medium text-neutral-400">Scale</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-neutral-400">Countries</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-neutral-400">Formula</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-neutral-400">Example (3.5 CGPA)</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-neutral-400">Grade Equivalent</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingScales.filter(s => s.id !== 'custom').map((scale) => {
                    const exampleCGPA = 3.5;
                    const percentage = scale.formula(exampleCGPA);
                    let grade = '';
                    if (percentage >= 90) grade = 'A+';
                    else if (percentage >= 80) grade = 'A';
                    else if (percentage >= 70) grade = 'B';
                    else if (percentage >= 60) grade = 'C';
                    else if (percentage >= 50) grade = 'D';
                    else grade = 'F';
                    
                    return (
                      <tr key={scale.id} className="border-b border-neutral-800 hover:bg-neutral-900/30">
                        <td className="py-3 px-4">
                          <div className="font-medium">{scale.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-neutral-300">{scale.countries.join(', ')}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-mono">(CGPA ÷ {scale.scale}) × 100</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-green-400 font-medium">{percentage.toFixed(1)}%</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={cn(
                            "text-xs",
                            grade === 'A+' || grade === 'A' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            grade === 'B' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            grade === 'C' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                            "bg-red-500/10 text-red-400 border-red-500/20"
                          )}>
                            {grade}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Need Accurate CGPA Conversions?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-gray-400">
                Get precise percentage conversions for job applications, further studies, or academic evaluations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={calculatePercentage}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Now
                </Button>
                <Button 
                  variant="outline" 
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-8 py-3"
                  onClick={calculateAllScales}
                >
                  <PieChart className="mr-2 h-5 w-5" />
                  Compare All Scales
                </Button>
              </div>
              <p className="mt-6 text-sm text-neutral-500">
                No registration required • 100% accurate • Multiple grading systems • Free forever
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}