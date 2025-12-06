"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, QrCode, X, 
  Eye, EyeOff, Trash2, 
  Sparkles, Copy,
  ChevronRight, FolderOpen, 
  Loader2, Settings, Palette,
  Camera, Scan, Share2, Link,
  Text, Image as ImageIcon, Smartphone,
  Globe, Mail, Phone, MapPin,
  Calendar, User, Hash, CreditCard,
  Wifi, Gift, Music, Video,
  Edit, RefreshCw, RotateCw,
  Lock, History, Star,
  Type, Zap, CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import QRCode from "react-qr-code";

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

export default function QRCodeGeneratorPage() {
  const [qrContent, setQrContent] = useState<string>('https://example.com');
  const [qrTitle, setQrTitle] = useState<string>('My QR Code');
  const [selectedType, setSelectedType] = useState<string>('url');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [history, setHistory] = useState<QRCodeData[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
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
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      placeholder: 'https://example.com',
      example: 'https://yourwebsite.com'
    },
    {
      id: 'text',
      name: 'Text',
      icon: <Text className="h-4 w-4" />,
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
      placeholder: 'Enter any text or message',
      example: 'Hello! This is a secret message.'
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      color: 'bg-red-500/10 text-red-400 border-red-500/20',
      placeholder: 'email@example.com',
      example: 'mailto:contact@company.com?subject=Hello&body=Message'
    },
    {
      id: 'phone',
      name: 'Phone',
      icon: <Phone className="h-4 w-4" />,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      placeholder: '+1234567890',
      example: 'tel:+1234567890'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <Smartphone className="h-4 w-4" />,
      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      placeholder: '+1234567890:Your message',
      example: 'sms:+1234567890?body=Hello there!'
    },
    {
      id: 'wifi',
      name: 'WiFi',
      icon: <Wifi className="h-4 w-4" />,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
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
        // Basic WiFi QR format
        if (!content.startsWith('WIFI:')) {
          // Simple format: SSID:Password
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
      toast.info(`Loaded ${selectedType.toUpperCase()} example`);
    }
  };

  // Clear all content
  const clearContent = () => {
    setQrContent('');
    setQrTitle('My QR Code');
    setLogoPreview('');
    toast.success('Content cleared');
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo too large (max 2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      toast.success('Logo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const removeLogo = () => {
    setLogoPreview('');
    toast.success('Logo removed');
  };

  // Save QR code to history
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
    
    setHistory(prev => [newQR, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Download QR Code as PNG
  const downloadQRCode = () => {
    if (!qrContent.trim()) {
      toast.error('Please enter content for the QR code');
      return;
    }

    setIsDownloading(true);
    
    try {
      const qrElement = qrCodeRef.current?.querySelector('svg');
      if (!qrElement) {
        throw new Error('QR code element not found');
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      const size = settings.size + (settings.margin * 8);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set background
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(qrElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        // Draw QR code
        ctx.drawImage(img, 0, 0, size, size);

        // Draw logo if exists
        if (logoPreview) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = settings.logoSize;
            const centerX = size / 2 - logoSize / 2;
            const centerY = size / 2 - logoSize / 2;

            // Draw logo background
            if (settings.logoBackground === 'white') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(centerX - 5, centerY - 5, logoSize + 10, logoSize + 10);
            }

            // Draw logo
            ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);

            // Convert to data URL and download
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${qrTitle.replace(/\s+/g, '_')}_qrcode.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(dataUrl);
            
            toast.success('QR Code downloaded successfully!');
            setIsDownloading(false);
            
            // Save to history
            saveToHistory();
          };
          logoImg.src = logoPreview;
        } else {
          // Convert to data URL and download
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${qrTitle.replace(/\s+/g, '_')}_qrcode.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Cleanup
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(dataUrl);
          
          toast.success('QR Code downloaded successfully!');
          setIsDownloading(false);
          
          // Save to history
          saveToHistory();
        }
      };
      img.src = url;

    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
      setIsDownloading(false);
    }
  };

  // Copy QR Code to clipboard
  const copyQRCode = async () => {
    if (!qrContent.trim()) {
      toast.error('Please enter content for the QR code');
      return;
    }

    try {
      const qrElement = qrCodeRef.current?.querySelector('svg');
      if (!qrElement) {
        throw new Error('QR code element not found');
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      const size = settings.size + (settings.margin * 8);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set background
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(qrElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        // Draw QR code
        ctx.drawImage(img, 0, 0, size, size);

        // Draw logo if exists
        if (logoPreview) {
          const logoImg = new Image();
          logoImg.onload = async () => {
            const logoSize = settings.logoSize;
            const centerX = size / 2 - logoSize / 2;
            const centerY = size / 2 - logoSize / 2;

            // Draw logo background
            if (settings.logoBackground === 'white') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(centerX - 5, centerY - 5, logoSize + 10, logoSize + 10);
            }

            // Draw logo
            ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);

            // Convert to blob and copy
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  await navigator.clipboard.write([
                    new ClipboardItem({
                      [blob.type]: blob
                    })
                  ]);
                  toast.success('QR Code copied to clipboard!');
                  
                  // Save to history
                  saveToHistory();
                } catch (error) {
                  console.error('Copy failed:', error);
                  toast.error('Failed to copy QR code');
                }
              }
            }, 'image/png', 1.0);
          };
          logoImg.src = logoPreview;
        } else {
          // Convert to blob and copy
          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({
                    [blob.type]: blob
                  })
                ]);
                toast.success('QR Code copied to clipboard!');
                
                // Save to history
                saveToHistory();
              } catch (error) {
                console.error('Copy failed:', error);
                toast.error('Failed to copy QR code');
              }
            }
          }, 'image/png', 1.0);
        }

        // Cleanup
        URL.revokeObjectURL(url);
      };
      img.src = url;

    } catch (error) {
      console.error('Error copying QR code:', error);
      toast.error('Failed to copy QR code');
    }
  };

  // Share QR Code
  const shareQRCode = async () => {
    if (!qrContent.trim()) {
      toast.error('Please enter content for the QR code');
      return;
    }

    try {
      const qrElement = qrCodeRef.current?.querySelector('svg');
      if (!qrElement) {
        throw new Error('QR code element not found');
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      const size = settings.size + (settings.margin * 8);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set background
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(qrElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        // Draw QR code
        ctx.drawImage(img, 0, 0, size, size);

        // Draw logo if exists
        if (logoPreview) {
          const logoImg = new Image();
          logoImg.onload = async () => {
            const logoSize = settings.logoSize;
            const centerX = size / 2 - logoSize / 2;
            const centerY = size / 2 - logoSize / 2;

            // Draw logo background
            if (settings.logoBackground === 'white') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(centerX - 5, centerY - 5, logoSize + 10, logoSize + 10);
            }

            // Draw logo
            ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);

            // Convert to blob
            canvas.toBlob(async (blob) => {
              if (blob) {
                const file = new File([blob], `${qrTitle}_qrcode.png`, { type: 'image/png' });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                  try {
                    await navigator.share({
                      files: [file],
                      title: qrTitle,
                      text: `Check out this QR code: ${qrContent}`
                    });
                    
                    // Save to history
                    saveToHistory();
                  } catch (error) {
                    console.error('Share failed:', error);
                    // Fallback to download
                    downloadQRCode();
                  }
                } else {
                  // Fallback: download
                  downloadQRCode();
                }
              }
            }, 'image/png', 1.0);
          };
          logoImg.src = logoPreview;
        } else {
          // Convert to blob
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `${qrTitle}_qrcode.png`, { type: 'image/png' });

              if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                  await navigator.share({
                    files: [file],
                    title: qrTitle,
                    text: `Check out this QR code: ${qrContent}`
                  });
                  
                  // Save to history
                  saveToHistory();
                } catch (error) {
                  console.error('Share failed:', error);
                  // Fallback to download
                  downloadQRCode();
                }
              } else {
                // Fallback: download
                downloadQRCode();
              }
            }
          }, 'image/png', 1.0);
        }

        // Cleanup
        URL.revokeObjectURL(url);
      };
      img.src = url;

    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast.error('Sharing not supported, downloading instead');
      downloadQRCode();
    }
  };

  // Load from history
  const loadFromHistory = (qr: QRCodeData) => {
    setQrContent(qr.content);
    setQrTitle(qr.title);
    setSelectedType(qr.type);
    setSettings(prev => ({
      ...prev,
      size: qr.size,
      color: qr.color,
      backgroundColor: qr.backgroundColor,
      errorCorrection: qr.errorCorrection
    }));
    if (qr.logo) setLogoPreview(qr.logo);
    toast.success(`Loaded QR code: ${qr.title}`);
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  // Predefined color palettes
  const colorPalettes = [
    { name: 'Classic', color: '#000000', bg: '#FFFFFF' },
    { name: 'Dark', color: '#FFFFFF', bg: '#1A1A1A' },
    { name: 'Blue', color: '#3B82F6', bg: '#EFF6FF' },
    { name: 'Green', color: '#10B981', bg: '#ECFDF5' },
    { name: 'Red', color: '#EF4444', bg: '#FEF2F2' },
    { name: 'Purple', color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  // Apply color palette
  const applyColorPalette = (palette: typeof colorPalettes[0]) => {
    setSettings(prev => ({
      ...prev,
      color: palette.color,
      backgroundColor: palette.bg
    }));
    toast.success(`Applied ${palette.name} color scheme`);
  };

  // Get formatted content for QR code
  const formattedContent = getFormattedContent(selectedType, qrContent);

  // Initialize with example
  useEffect(() => {
    const typeObj = contentTypes.find(t => t.id === selectedType);
    if (typeObj && !qrContent) {
      setQrContent(typeObj.example);
    }
  }, [selectedType]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-4 w-4" />
            Customizable • Dynamic • High Quality
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-indigo-500/10 p-2.5">
                  <QrCode className="h-6 w-6 text-indigo-400" />
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  Most Popular
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">QR Code</span> Generator
              </h1>
              
              <p className="text-lg text-neutral-300 mb-6">
                Create beautiful, customizable QR codes for URLs, text, contact info, WiFi, and more.
                Design with colors, logos, and advanced styling options.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                  <div className="text-2xl font-bold text-indigo-500">6+</div>
                  <div className="text-sm text-neutral-400">Content Types</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                  <div className="text-2xl font-bold text-indigo-500">✓</div>
                  <div className="text-sm text-neutral-400">Logo Support</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                  <div className="text-2xl font-bold text-indigo-500">HD</div>
                  <div className="text-sm text-neutral-400">High Quality</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                  <div className="text-2xl font-bold text-indigo-500">100%</div>
                  <div className="text-sm text-neutral-400">Free</div>
                </div>
              </div>
            </div>

            {/* Right Column - QR Code Preview */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>QR Code Preview</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-neutral-400 hover:text-white"
                      >
                        {showSettings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      {qrContent.trim() && (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                          Ready
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {qrContent.trim() ? 'Scan-ready QR code' : 'Enter content to generate'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* QR Code Preview Area */}
                  <div className="mb-6">
                    <div
                      ref={qrCodeRef}
                      className={cn(
                        "flex items-center justify-center p-8 rounded-lg border-2 border-dashed min-h-[300px]",
                        qrContent.trim() 
                          ? "border-indigo-500/30 bg-indigo-500/5" 
                          : "border-neutral-700 bg-neutral-800/30"
                      )}
                    >
                      {qrContent.trim() ? (
                        <div className="text-center space-y-4">
                          <div className="relative inline-block">
                            <div className="relative">
                              <QRCode
                                value={formattedContent}
                                size={settings.size}
                                bgColor={settings.backgroundColor}
                                fgColor={settings.color}
                                level={settings.errorCorrection}
                                margin={settings.margin}
                              />
                              {logoPreview && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className={cn(
                                    "rounded-full p-2",
                                    settings.logoBackground === 'white' ? 'bg-white' : 'bg-transparent'
                                  )}>
                                    <img
                                      src={logoPreview}
                                      alt="Logo"
                                      className="w-12 h-12 object-contain"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-neutral-400">
                            Size: {settings.size}px • Error Correction: {settings.errorCorrection}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="mx-auto w-24 h-24 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                            <QrCode className="h-12 w-12 text-neutral-600" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">QR Code Preview</h3>
                            <p className="text-sm text-neutral-400">
                              Enter content and download to create your QR code
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {qrContent.trim() && (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button
                          onClick={downloadQRCode}
                          disabled={isDownloading}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download PNG
                        </Button>
                        <Button
                          onClick={copyQRCode}
                          variant="outline"
                          className="border-neutral-700"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Image
                        </Button>
                        <Button
                          onClick={shareQRCode}
                          variant="outline"
                          className="border-neutral-700"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Quick Color Palettes */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm font-medium">Quick Color Palettes</span>
                      </div>
                      <Badge variant="outline" className="text-xs">One-click apply</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {colorPalettes.map((palette, index) => (
                        <button
                          key={index}
                          onClick={() => applyColorPalette(palette)}
                          className="group relative"
                          title={palette.name}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden border border-neutral-700 group-hover:border-indigo-500 transition-colors">
                            <div 
                              className="h-2/3 w-full"
                              style={{ backgroundColor: palette.bg }}
                            />
                            <div 
                              className="h-1/3 w-full"
                              style={{ backgroundColor: palette.color }}
                            />
                          </div>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black px-1.5 py-0.5 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {palette.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Content Input */}
          <div className="lg:col-span-2 space-y-8">
            {/* Content Type Selection */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-indigo-400" />
                  Content Type
                </CardTitle>
                <CardDescription>
                  Choose what type of content you want to encode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {contentTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      onClick={() => {
                        setSelectedType(type.id);
                        if (!qrContent.trim()) {
                          setQrContent(type.example);
                        }
                      }}
                      className={cn(
                        "h-auto flex-col py-3 px-2",
                        selectedType === type.id
                          ? type.color
                          : "border-neutral-700 bg-neutral-800/50"
                      )}
                    >
                      <div className="mb-2">{type.icon}</div>
                      <div className="text-xs font-medium">{type.name}</div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Input */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-indigo-400" />
                    Content Details
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadExample}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Example
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearContent}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Enter the content you want to encode in the QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">QR Code Title</label>
                  <input
                    type="text"
                    value={qrTitle}
                    onChange={(e) => setQrTitle(e.target.value)}
                    placeholder="My QR Code"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {contentTypes.find(t => t.id === selectedType)?.name} Content
                  </label>
                  <textarea
                    value={qrContent}
                    onChange={(e) => setQrContent(e.target.value)}
                    placeholder={contentTypes.find(t => t.id === selectedType)?.placeholder}
                    rows={4}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm resize-none"
                  />
                </div>
                
                <div className="text-xs text-neutral-400">
                  <span className="font-medium">Example:</span> {contentTypes.find(t => t.id === selectedType)?.example}
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-indigo-400" />
                  Logo & Branding
                </CardTitle>
                <CardDescription>
                  Add your logo to the center of the QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Logo Preview</div>
                      <div className="text-xs text-neutral-400">PNG or JPG, max 2MB</div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload Logo
                      </Button>
                      {logoPreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeLogo}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {logoPreview && (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain rounded border border-neutral-700"
                        />
                        <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Logo added</div>
                        <div className="text-xs text-neutral-400">
                          Will be placed in the center of the QR code
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={downloadQRCode}
                  disabled={isDownloading || !qrContent.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(qrContent)}
                    disabled={!qrContent.trim()}
                    className="border-neutral-700"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Text
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearContent}
                    className="border-neutral-700"
                  >
                    <RotateCw className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            {showSettings && (
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-400" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>
                    Customize the appearance of your QR code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Size */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Size: {settings.size}px</label>
                      <div className="text-xs text-neutral-400">128-1024px</div>
                    </div>
                    <input
                      type="range"
                      min="128"
                      max="1024"
                      step="64"
                      value={settings.size}
                      onChange={(e) => setSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                    />
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">QR Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.color}
                          onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.color}
                          onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                          className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Correction */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Error Correction</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'L', label: 'Low', desc: '7%' },
                        { value: 'M', label: 'Medium', desc: '15%' },
                        { value: 'Q', label: 'Quartile', desc: '25%' },
                        { value: 'H', label: 'High', desc: '30%' },
                      ].map((level) => (
                        <Button
                          key={level.value}
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings(prev => ({ ...prev, errorCorrection: level.value as any }))}
                          className={cn(
                            "h-auto flex-col py-2",
                            settings.errorCorrection === level.value
                              ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                              : "border-neutral-700"
                          )}
                        >
                          <div className="text-xs font-medium">{level.label}</div>
                          <div className="text-[10px] text-neutral-400">{level.desc}</div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Margin */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Margin: {settings.margin}</label>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 4].map((margin) => (
                        <Button
                          key={margin}
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings(prev => ({ ...prev, margin }))}
                          className={cn(
                            "flex-1 text-xs py-1",
                            settings.margin === margin
                              ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                              : "border-neutral-700"
                          )}
                        >
                          {margin}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Background */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Logo Background</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['transparent', 'white'] as const).map((bg) => (
                        <Button
                          key={bg}
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings(prev => ({ ...prev, logoBackground: bg }))}
                          className={cn(
                            "h-auto flex-col py-2",
                            settings.logoBackground === bg
                              ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                              : "border-neutral-700"
                          )}
                        >
                          <div className="text-xs font-medium capitalize">{bg}</div>
                          <div className="text-[10px] text-neutral-400">
                            {bg === 'white' ? 'White background' : 'Transparent'}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History */}
            {history.length > 0 && (
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-indigo-400" />
                      Recent QR Codes
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
                    {history.map((qr) => (
                      <div
                        key={qr.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/30 hover:border-indigo-500/30 cursor-pointer transition-colors"
                        onClick={() => loadFromHistory(qr)}
                      >
                        <div className="relative">
                          <div 
                            className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center"
                            style={{ backgroundColor: qr.backgroundColor }}
                          >
                            <QrCode 
                              className="h-5 w-5" 
                              style={{ color: qr.color }}
                            />
                          </div>
                          {qr.logo && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-800 overflow-hidden">
                              <img src={qr.logo} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{qr.title}</div>
                          <div className="text-xs text-neutral-400 truncate">
                            {qr.content.substring(0, 30)}...
                          </div>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {new Date(qr.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Professional QR Code Features</h2>
            <p className="mt-4 text-gray-400">Everything you need for perfect QR codes</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-3">
                <Palette className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Customizable Design</h3>
              <p className="text-sm text-gray-400">
                Full control over colors, logos, and styling options
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Error Correction</h3>
              <p className="text-sm text-gray-400">
                Multiple error correction levels for durability and scan reliability
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-3">
                <Camera className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Logo Integration</h3>
              <p className="text-sm text-gray-400">
                Add your brand logo while maintaining scan reliability
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-3">
                <Download className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">High Resolution</h3>
              <p className="text-sm text-gray-400">
                Download high-resolution PNG images ready for print and web
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to create your perfect QR code?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-gray-400">
              Join thousands of businesses and individuals who use our QR code generator
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={downloadQRCode}
                disabled={isDownloading || !qrContent.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3"
              >
                {isDownloading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download QR Code
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-8 py-3"
                onClick={loadExample}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Example
              </Button>
            </div>
            <p className="mt-6 text-sm text-neutral-500">
              No registration • 100% free • Unlimited QR codes • Commercial use allowed
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}