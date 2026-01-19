"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, Download, User, Building2, 
  Briefcase, RefreshCw, Trash2, Edit3, 
  QrCode, CheckCircle2, Lock, Verified,
  Grid, FileCheck, HelpCircle, X, Printer, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useRef } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Head from "next/head";

// Configuration for Random Signatories
const SIGNATORIES = [
  { name: "Dr. Arvin Thorne", title: "Chief Operations Officer", signature: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Arvin&backgroundColor=transparent" },
  { name: "Sarah L. Jenkins", title: "Head of Talent Acquisition", signature: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah&backgroundColor=transparent" },
  { name: "Michael V. Ross", title: "Director of Engineering", signature: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Michael&backgroundColor=transparent" },
  { name: "Elena Rodriguez", title: "HR Business Partner", signature: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Elena&backgroundColor=transparent" },
  { name: "David Chen", title: "Senior Project Manager", signature: "https://api.dicebear.com/7.x/pixel-art/svg?seed=David&backgroundColor=transparent" },
  { name: "Katherine Watts", title: "VP of Human Capital", signature: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Katherine&backgroundColor=transparent" }
];

const TEMPLATES = Array.from({ length: 21 }).map((_, i) => ({
  id: `temp-${i + 1}`,
  name: `Format #${i + 1}`,
  archetype: ['corporate', 'modern', 'minimal', 'academic', 'tech'][i % 5],
  color: ['#3b82f6', '#eab308', '#10b981', '#ef4444', '#6366f1'][i % 5],
  borderColor: ['#3b82f6', '#eab308', '#10b981', '#ef4444', '#6366f1'][i % 5],
}));

export default function AuthenticInternshipGenerator() {
  const [data, setData] = useState({
    userName: "Om Avchar",
    companyName: "Nexus Dynamics Ltd",
    role: "Full Stack Developer Intern",
    startDate: "2025-06-01",
    endDate: "2025-12-01",
  });

  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const currentTemplate = useMemo(() => 
    TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0]
  , [selectedTemplate]);
  
  const authFeatures = useMemo(() => {
    const randomSignatory = SIGNATORIES[Math.floor(Math.random() * SIGNATORIES.length)];
    const uniqueId = `CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationUrl = `verify.internship-auth.com/v/${uniqueId.toLowerCase()}`;
    
    return { 
      signatory: randomSignatory, 
      id: uniqueId, 
      verifyUrl: verificationUrl,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }, [selectedTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const loadingToast = toast.loading("Processing High-Quality PDF...");

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const element = certificateRef.current;
      if (!element) return;

      // Create a clone for PDF rendering
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '700px';
      clone.style.zIndex = '-9999';
      document.body.appendChild(clone);

      // Clean CSS for html2canvas compatibility
      const cleanStylesForPDF = (element: HTMLElement) => {
        // Remove problematic CSS properties
        element.style.removeProperty('--tw-bg-opacity');
        element.style.removeProperty('--tw-text-opacity');
        element.style.removeProperty('--tw-border-opacity');
        element.style.removeProperty('--tw-shadow');
        element.style.removeProperty('--tw-gradient');
        
        // Convert any modern color functions to hex
        const computedStyle = window.getComputedStyle(element);
        
        // Clean background colors
        const bgColor = computedStyle.backgroundColor;
        if (bgColor.includes('oklch') || bgColor.includes('gradient')) {
          element.style.backgroundColor = '#ffffff';
        }
        
        // Clean text colors
        const textColor = computedStyle.color;
        if (textColor.includes('oklch')) {
          if (element.classList.contains('text-neutral-500') || element.classList.contains('text-neutral-400')) {
            element.style.color = '#666666';
          } else if (element.classList.contains('text-neutral-800')) {
            element.style.color = '#333333';
          } else {
            element.style.color = '#000000';
          }
        }
        
        // Clean border colors
        const borderColor = computedStyle.borderColor;
        if (borderColor.includes('oklch')) {
          if (element.classList.contains('border-neutral-700') || element.classList.contains('border-neutral-800')) {
            element.style.borderColor = '#444444';
          }
        }
        
        // Remove animations and transitions
        element.style.transition = 'none';
        element.style.animation = 'none';
        
        // Clean children recursively
        Array.from(element.children).forEach(child => 
          cleanStylesForPDF(child as HTMLElement)
        );
      };

      cleanStylesForPDF(clone);

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        onclone: (clonedDoc, element) => {
          // Additional cleanup in cloned document
          const allElements = element.querySelectorAll('*');
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            
            // Force standard colors
            const classes = htmlEl.className.toString();
            if (classes.includes('text-neutral-')) {
              htmlEl.style.color = '#333333';
            }
            if (classes.includes('bg-neutral-')) {
              htmlEl.style.backgroundColor = '#f5f5f5';
            }
            if (classes.includes('border-neutral-')) {
              htmlEl.style.borderColor = '#cccccc';
            }
            
            // Remove modern CSS functions
            htmlEl.style.removeProperty('backdrop-filter');
            htmlEl.style.removeProperty('background-image');
          });
        }
      });

      // Remove clone from DOM
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4',
        compress: true 
      });
      
      const imgWidth = 210; 
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image on the page
      const positionY = (pageHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', 0, positionY, imgWidth, imgHeight);

      // FIX: File naming logic as requested (Om_Avchar_certificate.pdf)
      const safeName = data.userName.trim() ? data.userName.replace(/\s+/g, '_') : "Student";
      const fileName = `${safeName}_certificate.pdf`;
      
      pdf.save(fileName);
      
      toast.dismiss(loadingToast);
      toast.success(`Successfully saved: ${fileName}`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Generation failed. Use the Print button as a backup.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <>
      <Head>
        <title>InternForge Pro | Authentic Certificate Generator</title>
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Navigation Bar */}
        <div className="border-b border-yellow-500/10 bg-black/50 backdrop-blur-md sticky top-0 z-50 no-print">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-500 p-1.5 rounded-lg"><FileCheck className="text-black h-5 w-5" /></div>
              <span className="font-bold tracking-tight text-lg">Intern<span className="text-yellow-500">Forge</span></span>
            </div>
            <div className="flex gap-3">
              <Button size="sm" onClick={handleDownload} disabled={isGenerating} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6">
                {isGenerating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />} 
                {isGenerating ? 'Processing...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Section: Inputs & Previews */}
            <div className="lg:col-span-4 space-y-6 no-print">
              <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-bold flex items-center gap-2"><Edit3 className="h-4 w-4 text-yellow-500" /> GENERATOR SETTINGS</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Intern Full Name</label>
                      <input name="userName" value={data.userName} onChange={handleInputChange} className="input-field" placeholder="e.g. Om Avchar" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Organization Name</label>
                      <input name="companyName" value={data.companyName} onChange={handleInputChange} className="input-field" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Internship Position</label>
                      <input name="role" value={data.role} onChange={handleInputChange} className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Start Date</label>
                        <input type="date" name="startDate" value={data.startDate} onChange={handleInputChange} className="input-field" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">End Date</label>
                        <input type="date" name="endDate" value={data.endDate} onChange={handleInputChange} className="input-field" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Template Select with Visual Previews */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2"><Grid className="h-4 w-4 text-yellow-500" /> Template Gallery</h3>
                <div className="grid grid-cols-3 gap-3 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={cn(
                        "relative aspect-[3/4] rounded-md border-2 transition-all p-1 bg-white flex flex-col items-center justify-center overflow-hidden",
                        selectedTemplate === t.id ? "border-yellow-500 scale-95" : "border-neutral-800 hover:border-neutral-600"
                      )}
                    >
                      {/* Mini Mockup UI */}
                      <div className="w-full h-full flex flex-col gap-[2px]">
                         <div className="h-1 w-full" style={{ backgroundColor: t.color }}></div>
                         <div className="flex flex-col items-center mt-2 gap-[1px]">
                            <div className="h-[2px] w-4 bg-gray-300"></div>
                            <div className="h-[3px] w-6 bg-gray-400"></div>
                         </div>
                         <div className="mt-4 space-y-1">
                            <div className="h-[1px] w-full bg-gray-200"></div>
                            <div className="h-[1px] w-full bg-gray-200"></div>
                            <div className="h-[1px] w-2/3 bg-gray-200"></div>
                         </div>
                         <div className="mt-auto flex justify-between w-full">
                            <div className="h-2 w-2 bg-gray-200"></div>
                            <div className="h-1 w-4 bg-gray-300"></div>
                         </div>
                      </div>
                      {selectedTemplate === t.id && (
                        <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-yellow-500 fill-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section: Real-time Certificate Canvas */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div 
                ref={certificateRef}
                id="printable-area"
                className={cn(
                  "bg-white text-black p-12 relative overflow-hidden min-h-[850px] w-full max-w-[700px] transition-all duration-700",
                  currentTemplate.archetype === 'academic' ? "border-[16px] border-double" : "border-0"
                )}
                style={{ 
                  boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)',
                  borderColor: currentTemplate.archetype === 'academic' ? currentTemplate.borderColor : 'transparent',
                  // Use hex colors instead of CSS functions for PDF compatibility
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              >
                {/* Archetype Design Logic */}
                {currentTemplate.archetype === 'modern' && (
                  <div className="absolute left-0 top-0 bottom-0 w-8" style={{ backgroundColor: currentTemplate.color }}></div>
                )}
                
                {currentTemplate.archetype === 'tech' && (
                  <div className="absolute inset-0 opacity-[0.04]" style={{ 
                    backgroundImage: `radial-gradient(${currentTemplate.color} 0.5px, transparent 0.5px)`, 
                    backgroundSize: '15px 15px' 
                  }}></div>
                )}

                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-35deg] text-8xl font-black select-none" style={{ color: '#cccccc' }}>
                  {data.companyName || "OFFICIAL"}
                </div>

                {/* Certificate Header */}
                <div className={cn(
                  "flex justify-between items-start mb-12",
                  currentTemplate.archetype === 'corporate' ? "flex-col items-center text-center gap-4" : ""
                )}>
                  <div className={currentTemplate.archetype === 'corporate' ? "border-b-4 pb-2" : ""} style={{ borderColor: currentTemplate.color }}>
                    <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">{data.companyName}</h1>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mt-1" style={{ color: '#666666' }}>Authorized Industry Partner</p>
                  </div>
                  <div className={cn("text-right", currentTemplate.archetype === 'corporate' ? "text-center mt-2" : "")}>
                    <p className="text-[10px] font-mono font-bold" style={{ color: '#333333' }}>Ref: {authFeatures.id}</p>
                    <p className="text-[10px] font-mono font-bold" style={{ color: '#333333' }}>Issued: {authFeatures.date}</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 py-10 relative">
                  <h2 className={cn(
                    "text-center text-4xl font-black mb-14 tracking-tight uppercase",
                    currentTemplate.archetype === 'academic' ? "font-serif italic" : "font-sans"
                  )} style={{ color: currentTemplate.color }}>
                    Completion Certificate
                  </h2>
                  
                  <div className="space-y-8 text-lg leading-relaxed text-neutral-800 text-justify" style={{ color: '#333333' }}>
                    <p>This is to formally certify that <strong className="text-black" style={{ color: '#000000' }}>{data.userName}</strong> has successfully concluded their professional internship program at <strong className="text-black" style={{ color: '#000000' }}>{data.companyName}</strong>.</p>
                    
                    <p>The candidate fulfilled the role of <strong className="text-black" style={{ color: '#000000' }}>{data.role}</strong> during the period from <strong style={{ color: '#000000' }}>{formatDate(data.startDate)}</strong> to <strong style={{ color: '#000000' }}>{formatDate(data.endDate)}</strong>. They were an integral part of our development cycle and delivered key project modules.</p>

                    <p>Throughout their tenure, {data.userName.split(' ')[0]} demonstrated exceptional problem-solving skills, leadership potential, and professional integrity. We are pleased to provide our highest recommendation for their future professional path.</p>
                  </div>
                </div>

                {/* Bottom Signatures & QR */}
                <div className="mt-16 flex justify-between items-end">
                  <div className="space-y-3">
                    <div className="h-16 w-32 relative flex items-center justify-center">
                       <img 
                        src={authFeatures.signatory.signature} 
                        alt="Signature" 
                        className="h-full w-auto object-contain brightness-0 opacity-80" 
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><text x="10" y="50" font-family="Arial" font-size="20">${authFeatures.signatory.name}</text></svg>`)}`;
                        }}
                       />
                    </div>
                    <div className="w-52 h-[2px] bg-black" style={{ backgroundColor: '#000000' }} />
                    <div>
                      <p className="text-sm font-black uppercase tracking-tighter" style={{ color: '#000000' }}>{authFeatures.signatory.name}</p>
                      <p className="text-[10px] text-neutral-500 font-bold" style={{ color: '#666666' }}>{authFeatures.signatory.title}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 bg-neutral-50 p-2 rounded-lg border border-neutral-100" style={{ backgroundColor: '#f9f9f9', borderColor: '#e5e5e5' }}>
                    <QrCode className="h-14 w-14" style={{ color: '#000000' }} />
                    <p className="text-[8px] text-neutral-400 font-mono font-bold" style={{ color: '#888888' }}>VERIFY-ID: {authFeatures.id}</p>
                  </div>
                </div>

                {/* Microprint Security */}
                <div className="absolute bottom-6 left-0 right-0 text-center">
                   <p className="text-[7px] text-neutral-300 font-mono tracking-[0.5em] uppercase" style={{ color: '#aaaaaa' }}>
                    Security Certificate • Issued on {authFeatures.date} • Verified ID: {authFeatures.id}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <style jsx global>{`
        .input-field {
          @apply w-full bg-neutral-800/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-neutral-600;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 20px; }
        
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          #printable-area { 
            box-shadow: none !important; 
            margin: 0 !important; 
            padding: 20mm !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
          }
        }
      `}</style>
    </>
  );
}