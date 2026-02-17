"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Download, QrCode, X, 
  Eye, EyeOff, Trash2, 
  Sparkles, Copy,
  Loader2, Settings, Palette,
  Camera, Share2,
  Text, Image as ImageIcon, Smartphone,
  Globe, Mail, Phone,
  Wifi, Edit, RefreshCw, RotateCw,
  History,
  Type, Zap, CheckCircle, ArrowLeft, Home, Grid
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";
import QRCode from "react-qr-code";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

// QR Code types
interface QRCodeData {
  id: string;
  type: 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'event';
  content: string;
  title: string;
  createdAt: Date;
  size: number;
  color: string;
  backgroundColor: string;
  logo?: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

interface QRCodeSettings {
  size: number;
  color: string;
  backgroundColor: string;
  margin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  logoSize: number;
  logoBackground: 'transparent' | 'white';
}

interface ContentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
  example: string;
}

export default function QRCodeGeneratorClient() {
  const [qrContent, setQrContent] = useState<string>('https://example.com');
  const [qrTitle, setQrTitle] = useState<string>('My QR Code');
  const [selectedType, setSelectedType] = useState<string>('url');
  const [showSettings, setShowSettings] = useState(true);
  const [history, setHistory] = useState<QRCodeData[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  useToolAnalytics("generate-qr", "QR FORGE", "Workflows");

  // QR Code settings
  const [settings, setSettings] = useState<QRCodeSettings>({
    size: 256,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    margin: 1,
    errorCorrection: 'M',
    logoSize: 60,
    logoBackground: 'white'
  });

  // Content types
  const contentTypes: ContentType[] = [
    {
      id: 'url',
      name: 'URL',
      icon: <Globe className="h-4 w-4" />,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50',
      placeholder: 'https://example.com',
      example: 'https://yourwebsite.com'
    },
    {
      id: 'text',
      name: 'Text',
      icon: <Text className="h-4 w-4" />,
      color: 'bg-green-500/10 text-green-400 border-green-500/50',
      placeholder: 'Enter any text or message',
      example: 'Hello! This is a secret message.'
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      color: 'bg-red-500/10 text-red-400 border-red-500/50',
      placeholder: 'email@example.com',
      example: 'mailto:contact@company.com?subject=Hello&body=Message'
    },
    {
      id: 'phone',
      name: 'Phone',
      icon: <Phone className="h-4 w-4" />,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/50',
      placeholder: '+1234567890',
      example: 'tel:+1234567890'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <Smartphone className="h-4 w-4" />,
      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
      placeholder: '+1234567890:Your message',
      example: 'sms:+1234567890?body=Hello there!'
    },
    {
      id: 'wifi',
      name: 'WiFi',
      icon: <Wifi className="h-4 w-4" />,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/50',
      placeholder: 'WIFI:S:NetworkName;T:WPA;P:Password;;',
      example: 'WIFI:S:MyWiFi;T:WPA;P:MyPassword123;;'
    },
  ];

  // Generate formatted content based on type
  const getFormattedContent = (type: string, content: string): string => {
    if (!content.trim()) return '';
    
    switch (type) {
      case 'email':
        return content.includes('mailto:') ? content : `mailto:${content}`;
      case 'phone':
        return content.includes('tel:') ? content : `tel:${content}`;
      case 'sms':
        return content.includes('sms:') ? content : `sms:${content}`;
      case 'wifi':
        if (!content.startsWith('WIFI:')) {
          const [ssid = 'MyWiFi', password = ''] = content.split(':');
          return `WIFI:S:${ssid};T:WPA;P:${password};;`;
        }
        return content;
      default:
        return content;
    }
  };

  // Load example content
  const loadExample = () => {
    const typeObj = contentTypes.find(t => t.id === selectedType);
    if (typeObj) {
      setQrContent(typeObj.example);
      toast.info(`LOADED EXAMPLE: ${selectedType.toUpperCase()}`);
    }
  };

  // Clear all content
  const clearContent = () => {
    setQrContent('');
    setQrTitle('My QR Code');
    setLogoPreview('');
    toast.success('CLEARED');
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('ERROR: Image files only');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('ERROR: File too large (>2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      toast.success('LOGO UPLOADED');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview('');
    toast.success('LOGO REMOVED');
  };

  const saveToHistory = () => {
    const newQR: QRCodeData = {
      id: Date.now().toString(),
      type: selectedType as any,
      content: qrContent,
      title: qrTitle,
      createdAt: new Date(),
      size: settings.size,
      color: settings.color,
      backgroundColor: settings.backgroundColor,
      logo: logoPreview,
      errorCorrection: settings.errorCorrection
    };
    
    setHistory(prev => [newQR, ...prev.slice(0, 9)]);
  };

  const downloadQRCode = () => {
    if (!qrContent.trim()) {
      toast.error('MISSING CONTENT');
      return;
    }

    setIsDownloading(true);
    
    try {
      const qrElement = qrCodeRef.current?.querySelector('svg');
      if (!qrElement) throw new Error('QR element missing');

      const canvas = document.createElement('canvas');
      const size = settings.size + (settings.margin * 8);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context failure');

      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, size, size);

      const svgData = new XMLSerializer().serializeToString(qrElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);

        const finalizeDownload = () => {
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${qrTitle.replace(/\s+/g, '_')}_qrcode.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(dataUrl);
            
            toast.success('DOWNLOAD COMPLETE');
            setIsDownloading(false);
            saveToHistory();
        };

        if (logoPreview) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = settings.logoSize;
            const centerX = size / 2 - logoSize / 2;
            const centerY = size / 2 - logoSize / 2;

            if (settings.logoBackground === 'white') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(centerX - 5, centerY - 5, logoSize + 10, logoSize + 10);
            }

            ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);
            finalizeDownload();
          };
          logoImg.src = logoPreview;
        } else {
          finalizeDownload();
        }
      };
      img.src = url;

    } catch (error) {
      console.error('Download error:', error);
      toast.error('DOWNLOAD FAILED');
      setIsDownloading(false);
    }
  };

  const formattedContent = getFormattedContent(selectedType, qrContent);

  useEffect(() => {
    const typeObj = contentTypes.find(t => t.id === selectedType);
    if (typeObj && !qrContent) {
      setQrContent(typeObj.example);
    }
  }, [selectedType]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30 font-sans flex flex-col">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-indigo-600/5 blur-[100px] pointer-events-none" />

      {/* --- Desktop Navbar --- */}
      <header className="hidden md:flex border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </Link>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <QrCode className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase">QR <span className="text-indigo-400">Forge</span></h1>
              <Badge variant="outline" className="ml-2 border-indigo-500/20 text-indigo-400 bg-indigo-500/5 uppercase tracking-widest text-[9px]">v2.0</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <QrCode className="text-indigo-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">QR FORGE</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <Sparkles className="h-3 w-3" /> Customizable • Dynamic • High Res
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">QR Code</span> Generator
          </h1>
          <p className="text-neutral-400 text-sm md:text-lg max-w-2xl">
            Create high-fidelity QR codes for any digital asset.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column - Content Input */}
          <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
            
            {/* Content Type Selection */}
            <Card className="border-white/10 bg-neutral-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                  <Type className="h-4 w-4 text-indigo-400" /> Data Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {contentTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "h-auto flex-col py-4 gap-2 border transition-all hover:scale-[1.02] active:scale-95 rounded-2xl",
                        selectedType === type.id
                          ? type.color
                          : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                      )}
                    >
                      <div className={cn("p-2 rounded-full bg-black/40", selectedType === type.id && "text-inherit")}>{type.icon}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest">{type.name}</div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Input */}
            <Card className="border-white/10 bg-neutral-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                    <Edit className="h-4 w-4 text-indigo-400" /> Content Input
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={loadExample} className="text-[10px] font-black uppercase tracking-wider h-7 px-3 text-neutral-400 hover:text-white bg-white/5 rounded-lg">Example</Button>
                        <Button variant="ghost" size="sm" onClick={clearContent} className="text-[10px] font-black uppercase tracking-wider h-7 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg">Clear</Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block pl-1">Label (Filename)</label>
                  <input
                    type="text"
                    value={qrTitle}
                    onChange={(e) => setQrTitle(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors text-white placeholder:text-neutral-700 font-bold"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block pl-1">
                    {contentTypes.find(t => t.id === selectedType)?.name} Payload
                  </label>
                  <textarea
                    value={qrContent}
                    onChange={(e) => setQrContent(e.target.value)}
                    rows={4}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:border-indigo-500 outline-none transition-colors font-mono text-indigo-100 placeholder:text-neutral-700 custom-scrollbar"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card className="border-white/10 bg-neutral-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-indigo-400" /> Branding Layer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors shadow-inner">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <Camera className="h-8 w-8 text-neutral-700 group-hover:text-indigo-500 transition-colors" />
                            )}
                        </div>
                        {logoPreview && (
                            <button onClick={(e) => { e.stopPropagation(); removeLogo(); }} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1.5 text-white shadow-lg hover:scale-110 transition-transform border border-black">
                                <X size={10} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                    <div>
                        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase tracking-widest border-white/10 h-9 rounded-xl hover:bg-white/5 hover:text-white">Upload Logo</Button>
                        <p className="text-[9px] text-neutral-500 mt-2 font-medium tracking-wide">PNG / JPG • Max 2MB</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - QR Code Preview & Settings */}
          <div className="lg:col-span-5 space-y-8 order-1 lg:order-2">
            <Card className="border-white/10 bg-neutral-900/40 backdrop-blur-md sticky top-24 rounded-[2.5rem] shadow-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-6 px-8 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                     <Eye className="h-4 w-4 text-indigo-400" /> Live Render
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="text-neutral-400 hover:text-white h-8 w-8 p-0 rounded-lg hover:bg-white/5">
                    {showSettings ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="mb-8 flex justify-center">
                  <div
                    ref={qrCodeRef}
                    className={cn(
                      "flex items-center justify-center p-8 rounded-[2rem] border-2 border-dashed min-h-[300px] w-full transition-all duration-500 relative",
                      qrContent.trim() ? "border-indigo-500/30 bg-white" : "border-neutral-800 bg-black/40"
                    )}
                  >
                    {qrContent.trim() ? (
                      <div className="relative">
                        <QRCode
                          value={formattedContent}
                          size={settings.size}
                          bgColor={settings.backgroundColor}
                          fgColor={settings.color}
                          level={settings.errorCorrection}
                        />
                        {logoPreview && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className={cn("rounded-full p-1", settings.logoBackground === 'white' ? 'bg-white' : 'bg-transparent')}>
                              <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center opacity-30">
                        <QrCode className="h-16 w-16 text-neutral-500 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Awaiting Signal...</p>
                      </div>
                    )}
                  </div>
                </div>

                {qrContent.trim() && (
                  <div className="space-y-4">
                    <Button
                      onClick={downloadQRCode}
                      disabled={isDownloading}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic tracking-wider h-14 rounded-2xl shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-transform"
                    >
                      {isDownloading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                      Export PNG
                    </Button>
                  </div>
                )}

                {/* Advanced Settings */}
                <AnimatePresence>
                    {showSettings && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-8 pt-6 border-t border-white/5 space-y-6 overflow-hidden">
                        
                        {/* Size Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Scale</label>
                                <span className="text-[10px] font-mono text-indigo-400 font-bold">{settings.size}px</span>
                            </div>
                            <input
                                type="range" min="128" max="512" step="32"
                                value={settings.size}
                                onChange={(e) => setSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                        
                        {/* Color Pickers */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Foreground</label>
                                <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl p-2">
                                    <input type="color" value={settings.color} onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
                                    <span className="text-[10px] font-mono text-neutral-400 uppercase">{settings.color}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Background</label>
                                <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl p-2">
                                    <input type="color" value={settings.backgroundColor} onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
                                    <span className="text-[10px] font-mono text-neutral-400 uppercase">{settings.backgroundColor}</span>
                                </div>
                            </div>
                        </div>

                        {/* Palettes */}
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Presets</label>
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {[
                                    { name: 'Classic', color: '#000000', bg: '#FFFFFF' },
                                    { name: 'Dark', color: '#FFFFFF', bg: '#1A1A1A' },
                                    { name: 'Blue', color: '#3B82F6', bg: '#EFF6FF' },
                                    { name: 'Green', color: '#10B981', bg: '#ECFDF5' },
                                    { name: 'Red', color: '#EF4444', bg: '#FEF2F2' },
                                    { name: 'Purple', color: '#8B5CF6', bg: '#F5F3FF' },
                                ].map((palette, i) => (
                                    <button 
                                    key={i}
                                    onClick={() => setSettings(prev => ({ ...prev, color: palette.color, backgroundColor: palette.bg }))}
                                    className="w-10 h-10 rounded-full border border-white/10 shrink-0 relative overflow-hidden transition-transform hover:scale-110 active:scale-95 shadow-md"
                                    title={palette.name}
                                    >
                                        <div className="absolute inset-0 top-0 h-1/2 w-full" style={{ backgroundColor: palette.color }} />
                                        <div className="absolute inset-0 top-1/2 h-1/2 w-full" style={{ backgroundColor: palette.bg }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* --- CORE PROMO --- */}
        <div className="mt-20 mb-10">
           <CorePromo />
        </div>

      </main>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-indigo-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}