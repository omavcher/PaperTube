"use client";

import { useState } from "react";
import { 
  FileCode, Copy, Trash2, Check, 
  Download, Upload, Braces, AlignLeft, 
  FileJson, AlertCircle, CheckCircle2,
  ArrowLeft, Terminal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function JsonFormatterPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // --- Core Logic ---
  const handleFormat = () => {
    if (!jsonInput.trim()) {
      toast.error("Please enter some JSON first");
      return;
    }
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
      setError(null);
      setIsValid(true);
      toast.success("JSON Beautified");
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
      toast.error("Invalid JSON Structure");
    }
  };

  const handleMinify = () => {
    if (!jsonInput.trim()) {
      toast.error("Please enter some JSON first");
      return;
    }
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj));
      setError(null);
      setIsValid(true);
      toast.success("JSON Minified");
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
      toast.error("Invalid JSON Structure");
    }
  };

  const handleClear = () => {
    setJsonInput("");
    setError(null);
    setIsValid(null);
    toast.info("Editor cleared");
  };

  const handleCopy = () => {
    if (!jsonInput.trim()) {
      toast.error("No content to copy");
      return;
    }
    navigator.clipboard.writeText(jsonInput)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      toast.error("Please upload a valid JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Try to parse to validate
        JSON.parse(content);
        setJsonInput(content);
        setError(null);
        setIsValid(true);
        toast.success("JSON file loaded successfully");
      } catch (err: any) {
        setError(err.message);
        setIsValid(false);
        toast.error("Invalid JSON in file");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
    
    // Reset input to allow uploading same file again
    e.target.value = '';
  };

  const handleDownload = () => {
    if (!jsonInput.trim()) {
      toast.error("No content to download");
      return;
    }
    
    try {
      // Validate JSON before download
      JSON.parse(jsonInput);
      
      const blob = new Blob([jsonInput], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `formatted-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("JSON downloaded");
    } catch (err) {
      toast.error("Invalid JSON cannot be downloaded");
    }
  };

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setError(null);
      setIsValid(null);
      return;
    }
    
    try {
      JSON.parse(value);
      setError(null);
      setIsValid(true);
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    validateJson(value);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
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
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <FileCode className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">JSON <span className="text-blue-400">Lab</span></h1>
            </div>
          </div>
          <Badge variant="outline" className="border-blue-500/20 text-blue-400 uppercase tracking-widest text-[10px]">Engineering Tool</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Tool Description */}
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tighter sm:text-4xl italic uppercase">
              Format, Validate & <span className="text-blue-400 px-2 bg-blue-500/5 rounded-xl">Optimize</span>
            </h2>
            <p className="text-neutral-400 mt-2 text-lg">Enter your raw JSON below to clean it up or find syntax errors.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Editor Sidebar (Controls) */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-xs font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="h-3 w-3 text-blue-400" /> Control Panel
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button onClick={handleFormat} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold justify-start">
                    <Braces className="mr-2 h-4 w-4" /> Beautify JSON
                  </Button>
                  <Button onClick={handleMinify} variant="outline" className="w-full border-neutral-700 hover:bg-neutral-800 justify-start">
                    <AlignLeft className="mr-2 h-4 w-4" /> Minify JSON
                  </Button>
                  <div className="h-px bg-white/5 my-2" />
                  <Button onClick={handleCopy} variant="ghost" className="w-full hover:bg-white/5 justify-start text-neutral-400">
                    <Copy className="mr-2 h-4 w-4" /> Copy Content
                  </Button>
                  <Button onClick={handleDownload} variant="ghost" className="w-full hover:bg-white/5 justify-start text-neutral-400">
                    <Download className="mr-2 h-4 w-4" /> Export (.json)
                  </Button>
                  <Button onClick={handleClear} variant="ghost" className="w-full hover:bg-red-500/10 hover:text-red-400 justify-start text-neutral-400">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All
                  </Button>
                </CardContent>
              </Card>

              {/* Status Indicator */}
              {isValid !== null && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Card className={cn(
                    "border-2 transition-colors",
                    isValid ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                  )}>
                    <CardContent className="p-4 flex items-center gap-3">
                      {isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className={cn("text-xs font-bold uppercase tracking-widest", isValid ? "text-emerald-500" : "text-red-500")}>
                          {isValid ? "Valid JSON" : "Syntax Error"}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {isValid ? "Ready to use" : "Check formatting"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tips Card */}
              <Card className="bg-neutral-900/50 border-neutral-800">
                <CardContent className="p-4">
                  <p className="text-xs text-neutral-500 mb-2 font-bold">💡 QUICK TIPS</p>
                  <ul className="space-y-1.5">
                    <li className="text-[10px] text-neutral-400 flex items-start gap-1.5">
                      <span className="text-blue-400">•</span> Use <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[9px]">Ctrl+A</kbd> to select all
                    </li>
                    <li className="text-[10px] text-neutral-400 flex items-start gap-1.5">
                      <span className="text-blue-400">•</span> Drag & drop JSON files
                    </li>
                    <li className="text-[10px] text-neutral-400 flex items-start gap-1.5">
                      <span className="text-blue-400">•</span> Auto-validation on type
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Main Editor Area */}
            <div className="lg:col-span-9 space-y-4">
              <div className="relative group">
                {/* Visual Accent */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-transparent rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
                
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <input 
                      type="file" 
                      id="json-upload" 
                      className="hidden" 
                      accept=".json,application/json" 
                      onChange={handleFileUpload}
                    />
                    <label 
                      htmlFor="json-upload" 
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors border border-white/5"
                    >
                      <Upload className="h-3 w-3" /> Upload File
                    </label>
                    
                    {/* Word Counter */}
                    <div className="text-xs text-neutral-500 bg-black/30 px-3 py-1.5 rounded-md border border-white/5">
                      {jsonInput.length} chars
                    </div>
                  </div>

                  <textarea
                    value={jsonInput}
                    onChange={handleInputChange}
                    onPaste={(e) => {
                      const pastedText = e.clipboardData.getData('text');
                      setTimeout(() => validateJson(pastedText), 0);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file && (file.name.endsWith('.json') || file.type === 'application/json')) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const content = event.target?.result as string;
                            JSON.parse(content);
                            setJsonInput(content);
                            setError(null);
                            setIsValid(true);
                            toast.success("JSON file loaded via drag & drop");
                          } catch (err: any) {
                            setError(err.message);
                            setIsValid(false);
                            toast.error("Invalid JSON in file");
                          }
                        };
                        reader.readAsText(file);
                      } else {
                        toast.error("Please drop a valid JSON file");
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    placeholder={`Paste your JSON string here... e.g.\n{\n  "name": "Om",\n  "status": "coding",\n  "tools": ["JSON Formatter", "TypeScript", "React"]\n}`}
                    className="w-full min-h-[500px] p-8 rounded-[2rem] bg-neutral-900 border-2 border-white/5 font-mono text-sm text-blue-100 focus:outline-none focus:border-blue-500/40 transition-all resize-y placeholder:text-neutral-700 placeholder:leading-6"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Error Log */}
              {error && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 font-mono text-xs text-red-400 flex gap-3">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold mb-1">JSON Parse Error:</p>
                      <p className="text-red-300">{error}</p>
                      <p className="text-neutral-500 mt-2 text-[10px]">
                        💡 Check for missing commas, quotes, or brackets
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sample JSON Quick Actions */}
              {!jsonInput && (
                <div className="animate-in fade-in duration-500">
                  <Card className="bg-neutral-900/30 border-neutral-800">
                    <CardContent className="p-4">
                      <p className="text-xs text-neutral-500 mb-3 font-bold">TRY SAMPLE DATA:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-neutral-700 hover:bg-neutral-800 h-8"
                          onClick={() => {
                            const sample = JSON.stringify({
                              name: "Om",
                              status: "coding",
                              projects: ["JSON Formatter", "React Apps", "AI Tools"],
                              contact: {
                                email: "hello@example.com",
                                website: "https://example.com"
                              },
                              skills: ["TypeScript", "Next.js", "UI/UX"]
                            }, null, 2);
                            setJsonInput(sample);
                            validateJson(sample);
                          }}
                        >
                          Simple Object
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-neutral-700 hover:bg-neutral-800 h-8"
                          onClick={() => {
                            const sample = JSON.stringify([
                              { id: 1, name: "Product A", price: 29.99 },
                              { id: 2, name: "Product B", price: 49.99 },
                              { id: 3, name: "Product C", price: 19.99 }
                            ], null, 2);
                            setJsonInput(sample);
                            validateJson(sample);
                          }}
                        >
                          Array of Objects
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-neutral-700 hover:bg-neutral-800 h-8"
                          onClick={() => {
                            const sample = JSON.stringify({
                              users: [
                                {
                                  id: 101,
                                  name: "Alice",
                                  preferences: {
                                    theme: "dark",
                                    notifications: true
                                  }
                                }
                              ],
                              settings: {
                                version: "1.0.0",
                                features: ["format", "validate", "minify"]
                              }
                            }, null, 2);
                            setJsonInput(sample);
                            validateJson(sample);
                          }}
                        >
                          Nested Structure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Feature Education Section */}
      <section className="bg-neutral-950/50 py-16 border-t border-white/5 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Check className="text-blue-500 h-5 w-5" /> 100% Client-Side
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Your data never touches our servers. All formatting and validation happens locally in your browser for maximum privacy.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <AlignLeft className="text-blue-500 h-5 w-5" /> Minify for Production
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Reduce API payload sizes by removing all unnecessary whitespace and comments from your JSON structure.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FileJson className="text-blue-500 h-5 w-5" /> Schema Ready
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Supports deep nested objects and arrays. Perfect for debugging complex configuration files or API responses.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}