"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Merge, Split, FileText, FileImage, Lock,  
  Unlock, RotateCw, Shield, Edit, Scan,
  Crop, SortAsc, Settings, Download, Upload,
  FileType, FileCode, Hash, Image as ImageIcon,
  FileSearch, BarChart, Grid3X3, MousePointerClick,
  Component,
  GlassWater,
  GitCompare,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  Globe,
  CheckCircle,
  Filter,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import Footer from "@/components/Footer";

const pdfTools = [
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDFs into a single document",
    icon: <Merge className="h-5 w-5" />,
    category: "Workflows",
    path: "/tools/merge",
    color: "bg-red-500/10 text-red-400",
    featured: true
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract pages or split into multiple files",
    icon: <Split className="h-5 w-5" />,
    category: "Organize PDF",
    path: "/tools/split",
    color: "bg-green-500/10 text-green-400",
    featured: true
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce file size while preserving quality",
    icon: <Component className="h-5 w-5" />,
    category: "Optimize PDF",
    path: "/tools/compress",
    color: "bg-purple-500/10 text-purple-400",
    featured: true
  },
];

const categories = [
  { id: "all", name: "All", count: pdfTools.length },
  { id: "workflows", name: "Workflows", count: pdfTools.filter(t => t.category === "Workflows").length },
  { id: "organize", name: "Organize PDF", count: pdfTools.filter(t => t.category === "Organize PDF").length },
  { id: "optimize", name: "Optimize PDF", count: pdfTools.filter(t => t.category === "Optimize PDF").length },
  { id: "convert", name: "Convert PDF", count: pdfTools.filter(t => t.category === "Convert PDF").length },
  { id: "edit", name: "Edit PDF", count: pdfTools.filter(t => t.category === "Edit PDF").length },
  { id: "security", name: "PDF Security", count: pdfTools.filter(t => t.category === "PDF Security").length },
];

export default function PDFToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAllTools, setShowAllTools] = useState<boolean>(false);

  const filteredTools = useMemo(() => {
    if (selectedCategory === "all") {
      return showAllTools ? pdfTools : pdfTools.filter(tool => tool.featured);
    }
    return pdfTools.filter(tool => {
      const categoryMap: Record<string, string> = {
        workflows: "Workflows",
        organize: "Organize PDF",
        optimize: "Optimize PDF",
        convert: "Convert PDF",
        edit: "Edit PDF",
        security: "PDF Security"
      };
      return tool.category === categoryMap[selectedCategory];
    });
  }, [selectedCategory, showAllTools]);

  const featuredToolsCount = pdfTools.filter(tool => tool.featured).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Full Height Grid */}
      <section className="relative min-h-[90vh] overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
          )}
        />
        {/* Radial gradient for the container to give a faded look */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

        <div className="container relative z-10 mx-auto px-4 py-16 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/20">
            <Sparkles className="h-4 w-4" />
            All tools are 100% free to use
          </div>
          
          <h1 className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
            Professional PDF Tools for{' '}
            <span className="bg-gradient-to-b from-red-700 to-red-400 bg-clip-text text-transparent">
              Modern Workflows
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-300 md:text-xl">
            Comprehensive suite of PDF tools designed for professionals. Process documents securely 
            with enterprise-grade features, all in your browser.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base font-medium">
              <Upload className="mr-2 h-5 w-5" />
              Upload PDF File
            </Button>
            <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-8 py-3 text-base font-medium">
              <Download className="mr-2 h-5 w-5" />
              View All Features
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">50M+</div>
              <div className="text-sm text-neutral-400">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">99.9%</div>
              <div className="text-sm text-neutral-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">256-bit</div>
              <div className="text-sm text-neutral-400">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">24/7</div>
              <div className="text-sm text-neutral-400">Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Category Filter */}
      <section className="sticky top-0 z-40 border-b border-neutral-800 bg-black/95 backdrop-blur-sm supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Mobile Filter Header */}
            <div className="flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-300">Filters</span>
              </div>
              {selectedCategory !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="h-8 text-xs text-neutral-400 hover:text-white"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            {/* Desktop Category Label */}
            <div className="hidden items-center gap-2 sm:flex">
              <div className="rounded-lg bg-neutral-800/50 p-2">
                <Filter className="h-4 w-4 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-300">Filter by category</p>
                <p className="text-xs text-neutral-500">Select a category to filter tools</p>
              </div>
            </div>

            {/* Category Buttons */}
            <div className="flex flex-1 flex-wrap items-center gap-1.5 sm:justify-end">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "h-8 rounded-full border transition-all duration-200",
                    "text-xs font-medium",
                    "hover:scale-105 active:scale-95",
                    selectedCategory === category.id
                      ? "border-red-500/50 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/10"
                      : "border-neutral-700 bg-neutral-900/50 text-neutral-400 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white"
                  )}
                >
                  <span>{category.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-1.5 h-4 min-w-[20px] px-1 text-[10px] font-semibold",
                      selectedCategory === category.id
                        ? "bg-red-500/20 text-red-300"
                        : "bg-neutral-700 text-neutral-300"
                    )}
                  >
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Active Filter Indicator */}
            {selectedCategory !== "all" && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-neutral-900/50 px-3 py-2 sm:hidden">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs text-neutral-300">
                    Filtered by: <span className="font-medium text-white">{categories.find(c => c.id === selectedCategory)?.name}</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="h-6 px-2 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                {selectedCategory === "all" ? "Popular PDF Tools" : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="mt-1 text-sm text-neutral-400 sm:mt-2">
                {selectedCategory === "all" 
                  ? `Featured tools • ${filteredTools.length} of ${pdfTools.length} tools`
                  : `${filteredTools.length} tools available`}
              </p>
            </div>
            
            {selectedCategory === "all" && !showAllTools && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllTools(true)}
                className="mt-3 border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white sm:mt-0"
              >
                View All {pdfTools.length} Tools
              </Button>
            )}
            
            {selectedCategory === "all" && showAllTools && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllTools(false)}
                className="mt-3 border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white sm:mt-0"
              >
                Show Only Featured
              </Button>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredTools.map((tool) => (
            <Link key={tool.id} href={tool.path}>
              <Card className="group relative cursor-pointer border border-neutral-800 bg-neutral-900 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 h-full flex flex-col overflow-hidden">
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="pb-3 flex-grow relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-2.5 ${tool.color} transition-transform duration-300 group-hover:scale-110`}>
                      {tool.icon}
                    </div>
                    {tool.badge && (
                      <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/10 border border-red-500/20 text-[10px] px-1.5 py-0.5">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-sm font-semibold text-white group-hover:text-red-400 line-clamp-1 transition-colors duration-300">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400 line-clamp-2 mt-1">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="bg-neutral-800/50 text-neutral-300 border-neutral-700 text-[10px] px-2 py-0.5 truncate max-w-[70%] group-hover:border-red-500/30 transition-colors duration-300"
                    >
                      {tool.category}
                    </Badge>
                    <span className="text-xs text-neutral-500 group-hover:text-red-400 font-medium transition-colors duration-300 flex items-center">
                      Open
                      <svg className="ml-1 h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Show More/Less for All category */}
        {selectedCategory === "all" && !showAllTools && filteredTools.length < pdfTools.length && (
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllTools(true)}
                  className="border-neutral-700 bg-black text-neutral-300 hover:bg-neutral-900 hover:text-white px-6"
                >
                  Show {pdfTools.length - featuredToolsCount} More Tools
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-neutral-950 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Enterprise-Grade PDF Processing
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Trusted by professionals worldwide for secure, reliable document processing
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Bank-Level Security</h3>
              <p className="text-sm text-gray-400">
                AES-256 encryption with automatic file deletion after processing
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Lightning Fast</h3>
              <p className="text-sm text-gray-400">
                Process documents in seconds with our optimized infrastructure
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">No Installation</h3>
              <p className="text-sm text-gray-400">
                All tools work directly in your browser, no downloads required
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">24/7 Availability</h3>
              <p className="text-sm text-gray-400">
                Access tools anytime, anywhere with 99.9% uptime guarantee
              </p>
            </div>
          </div>

          {/* Security Badges */}
          <div className="mt-12 sm:mt-16 rounded-lg border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm text-gray-300">No registration required</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm text-gray-300">No watermarks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm text-gray-300">No file limits</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm text-gray-300">SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Ready to streamline your document workflow?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400 sm:mt-4">
              Join thousands of teams who trust our platform for professional PDF processing
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:mt-8">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                Get Started Free
              </Button>
              <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                Contact Sales
              </Button>
            </div>
            <p className="mt-5 text-xs text-neutral-500 sm:mt-6">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}