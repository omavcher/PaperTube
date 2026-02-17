"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Calculator, RefreshCw, Copy, History, Star,
  TrendingUp, Zap, Clock, Globe, Settings,
  Ruler, Scale, Thermometer, Droplets, 
  Battery, Smartphone,
  Sparkles, Check, ChevronRight, BookOpen, Target, BarChart,
  ArrowLeft, Home, Grid
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

// Unit conversion types and constants
type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'digital' | 'energy' | 'time' | 'currency';

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  category: UnitCategory;
  conversionRate: number; // Relative to base unit
  icon?: React.ReactNode;
}

interface ConversionHistory {
  id: string;
  fromValue: number;
  fromUnit: string;
  toValue: number;
  toUnit: string;
  category: UnitCategory;
  timestamp: Date;
}

interface CategoryInfo {
  id: UnitCategory;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  baseUnit: string;
}

interface CurrencyRates {
  [key: string]: number;
}

export default function UnitConverterClient() {
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('kilometer');
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('length');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(['meter-kilometer', 'celsius-fahrenheit']);
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates>({});
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [recentConversions, setRecentConversions] = useState<string[]>([]);
  
  useToolAnalytics("unit-converter", "Unit Converter", "Workflows");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Categories
  const categories: CategoryInfo[] = [
    { id: 'length', name: 'Length', description: 'Meters, feet, miles', icon: <Ruler className="h-5 w-5" />, color: 'from-blue-500 to-cyan-500', baseUnit: 'meter' },
    { id: 'weight', name: 'Weight', description: 'Kg, pounds, ounces', icon: <Scale className="h-5 w-5" />, color: 'from-emerald-500 to-green-500', baseUnit: 'kilogram' },
    { id: 'temperature', name: 'Temperature', description: 'Celsius, Fahrenheit', icon: <Thermometer className="h-5 w-5" />, color: 'from-red-500 to-orange-500', baseUnit: 'celsius' },
    { id: 'volume', name: 'Volume', description: 'Liters, gallons', icon: <Droplets className="h-5 w-5" />, color: 'from-purple-500 to-pink-500', baseUnit: 'liter' },
    { id: 'digital', name: 'Digital', description: 'Bytes, KB, MB', icon: <Smartphone className="h-5 w-5" />, color: 'from-indigo-500 to-blue-500', baseUnit: 'byte' },
    { id: 'energy', name: 'Energy', description: 'Joules, calories', icon: <Battery className="h-5 w-5" />, color: 'from-yellow-500 to-amber-500', baseUnit: 'joule' },
    { id: 'time', name: 'Time', description: 'Seconds, hours', icon: <Clock className="h-5 w-5" />, color: 'from-violet-500 to-purple-500', baseUnit: 'second' },
    { id: 'currency', name: 'Currency', description: 'USD, EUR, GBP', icon: <Globe className="h-5 w-5" />, color: 'from-green-500 to-emerald-500', baseUnit: 'USD' }
  ];

  // Units database (Expanded for completeness)
  const units: Unit[] = [
    // Length
    { id: 'meter', name: 'Meter', abbreviation: 'm', category: 'length', conversionRate: 1 },
    { id: 'kilometer', name: 'Kilometer', abbreviation: 'km', category: 'length', conversionRate: 1000 },
    { id: 'centimeter', name: 'Centimeter', abbreviation: 'cm', category: 'length', conversionRate: 0.01 },
    { id: 'millimeter', name: 'Millimeter', abbreviation: 'mm', category: 'length', conversionRate: 0.001 },
    { id: 'mile', name: 'Mile', abbreviation: 'mi', category: 'length', conversionRate: 1609.34 },
    { id: 'yard', name: 'Yard', abbreviation: 'yd', category: 'length', conversionRate: 0.9144 },
    { id: 'foot', name: 'Foot', abbreviation: 'ft', category: 'length', conversionRate: 0.3048 },
    { id: 'inch', name: 'Inch', abbreviation: 'in', category: 'length', conversionRate: 0.0254 },
    
    // Weight
    { id: 'kilogram', name: 'Kilogram', abbreviation: 'kg', category: 'weight', conversionRate: 1 },
    { id: 'gram', name: 'Gram', abbreviation: 'g', category: 'weight', conversionRate: 0.001 },
    { id: 'milligram', name: 'Milligram', abbreviation: 'mg', category: 'weight', conversionRate: 0.000001 },
    { id: 'pound', name: 'Pound', abbreviation: 'lb', category: 'weight', conversionRate: 0.453592 },
    { id: 'ounce', name: 'Ounce', abbreviation: 'oz', category: 'weight', conversionRate: 0.0283495 },
    
    // Temperature
    { id: 'celsius', name: 'Celsius', abbreviation: '°C', category: 'temperature', conversionRate: 1 },
    { id: 'fahrenheit', name: 'Fahrenheit', abbreviation: '°F', category: 'temperature', conversionRate: 1 },
    { id: 'kelvin', name: 'Kelvin', abbreviation: 'K', category: 'temperature', conversionRate: 1 },
    
    // Volume
    { id: 'liter', name: 'Liter', abbreviation: 'L', category: 'volume', conversionRate: 1 },
    { id: 'milliliter', name: 'Milliliter', abbreviation: 'mL', category: 'volume', conversionRate: 0.001 },
    { id: 'gallon', name: 'Gallon', abbreviation: 'gal', category: 'volume', conversionRate: 3.78541 },
    { id: 'cup', name: 'Cup', abbreviation: 'cup', category: 'volume', conversionRate: 0.24 },
    
    // Digital
    { id: 'byte', name: 'Byte', abbreviation: 'B', category: 'digital', conversionRate: 1 },
    { id: 'kilobyte', name: 'Kilobyte', abbreviation: 'KB', category: 'digital', conversionRate: 1024 },
    { id: 'megabyte', name: 'Megabyte', abbreviation: 'MB', category: 'digital', conversionRate: 1048576 },
    { id: 'gigabyte', name: 'Gigabyte', abbreviation: 'GB', category: 'digital', conversionRate: 1073741824 },
    { id: 'terabyte', name: 'Terabyte', abbreviation: 'TB', category: 'digital', conversionRate: 1099511627776 },

    // Energy
    { id: 'joule', name: 'Joule', abbreviation: 'J', category: 'energy', conversionRate: 1 },
    { id: 'calorie', name: 'Calorie', abbreviation: 'cal', category: 'energy', conversionRate: 4.184 },
    { id: 'kilocalorie', name: 'Kilocalorie', abbreviation: 'kcal', category: 'energy', conversionRate: 4184 },
    { id: 'watt-hour', name: 'Watt-hour', abbreviation: 'Wh', category: 'energy', conversionRate: 3600 },

    // Time
    { id: 'second', name: 'Second', abbreviation: 's', category: 'time', conversionRate: 1 },
    { id: 'minute', name: 'Minute', abbreviation: 'min', category: 'time', conversionRate: 60 },
    { id: 'hour', name: 'Hour', abbreviation: 'hr', category: 'time', conversionRate: 3600 },
    { id: 'day', name: 'Day', abbreviation: 'day', category: 'time', conversionRate: 86400 },

    // Currency (Base: USD)
    { id: 'USD', name: 'US Dollar', abbreviation: 'USD', category: 'currency', conversionRate: 1 },
    { id: 'EUR', name: 'Euro', abbreviation: 'EUR', category: 'currency', conversionRate: 0.85 },
    { id: 'GBP', name: 'British Pound', abbreviation: 'GBP', category: 'currency', conversionRate: 0.73 },
    { id: 'JPY', name: 'Japanese Yen', abbreviation: 'JPY', category: 'currency', conversionRate: 110.0 },
    { id: 'INR', name: 'Indian Rupee', abbreviation: 'INR', category: 'currency', conversionRate: 74.5 },
  ];

  const categoryUnits = units.filter(unit => unit.category === activeCategory);
  const currentFromUnit = units.find(u => u.id === fromUnit);
  const currentToUnit = units.find(u => u.id === toUnit);
  
  // Fetch currency rates
  useEffect(() => {
    if (activeCategory === 'currency') {
      fetchCurrencyRates();
    }
  }, [activeCategory]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (fromValue && !isNaN(parseFloat(fromValue)) && fromUnit && toUnit) {
        performConversion();
      }
    }, 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [fromValue, fromUnit, toUnit, activeCategory]);

  const fetchCurrencyRates = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      setCurrencyRates(data.rates);
      
      // Update local unit rates
      units.forEach(unit => {
        if (unit.category === 'currency' && data.rates[unit.id]) {
          unit.conversionRate = data.rates[unit.id];
        }
      });
      
      toast.success('Live currency rates updated');
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      toast.error('Using cached currency rates');
    }
  };

  const performConversion = () => {
    if (!fromValue || !fromUnit || !toUnit) return;
    setIsConverting(true);
    
    const numericValue = parseFloat(fromValue);
    if (isNaN(numericValue)) {
      setToValue('');
      setIsConverting(false);
      return;
    }

    let result: number;
    if (activeCategory === 'temperature') {
      result = convertTemperature(numericValue, fromUnit, toUnit);
    } else {
      const fromUnitData = units.find(u => u.id === fromUnit);
      const toUnitData = units.find(u => u.id === toUnit);
      if (!fromUnitData || !toUnitData) {
        setToValue('');
        setIsConverting(false);
        return;
      }
      
      if (activeCategory === 'currency') {
          // Currency specific math
          result = numericValue / (fromUnitData.conversionRate || 1) * (toUnitData.conversionRate || 1);
      } else {
          // Physical units math
          result = numericValue * fromUnitData.conversionRate / toUnitData.conversionRate;
      }
    }

    setToValue(formatNumber(result));
    addToHistory(numericValue, fromUnit, result, toUnit);
    setIsConverting(false);
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    let inCelsius: number;
    if (from === 'celsius') inCelsius = value;
    else if (from === 'fahrenheit') inCelsius = (value - 32) * 5/9;
    else inCelsius = value - 273.15; // kelvin

    if (to === 'celsius') return inCelsius;
    if (to === 'fahrenheit') return (inCelsius * 9/5) + 32;
    return inCelsius + 273.15; // kelvin
  };

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    const absNum = Math.abs(num);
    if (absNum >= 1000000 || absNum < 0.001) return num.toExponential(4);
    return num.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  const addToHistory = (fromVal: number, from: string, toVal: number, to: string) => {
    const newHistory: ConversionHistory = {
      id: Date.now().toString(),
      fromValue: fromVal, fromUnit: from,
      toValue: toVal, toUnit: to,
      category: activeCategory,
      timestamp: new Date()
    };
    setConversionHistory(prev => [newHistory, ...prev.slice(0, 9)]);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    toast.success('Units swapped');
  };

  const copyResult = () => {
    if (!toValue) return;
    navigator.clipboard.writeText(`${toValue} ${currentToUnit?.abbreviation || ''}`);
    toast.success('Copied to clipboard');
  };

  const toggleFavorite = () => {
    const key = `${fromUnit}-${toUnit}`;
    if (favorites.includes(key)) {
      setFavorites(prev => prev.filter(f => f !== key));
      toast.success('Removed from favorites');
    } else {
      setFavorites(prev => [...prev, key]);
      toast.success('Added to favorites');
    }
  };

  const loadFavorite = (key: string) => {
    const [from, to] = key.split('-');
    const fromUnitData = units.find(u => u.id === from);
    if (fromUnitData) {
      setActiveCategory(fromUnitData.category);
      setFromUnit(from);
      setToUnit(to);
      setFromValue('1');
    }
  };

  const popularConversions = {
    length: [{ from: 'meter', to: 'foot', label: 'm → ft' }, { from: 'kilometer', to: 'mile', label: 'km → mi' }],
    weight: [{ from: 'kilogram', to: 'pound', label: 'kg → lb' }, { from: 'pound', to: 'kilogram', label: 'lb → kg' }],
    temperature: [{ from: 'celsius', to: 'fahrenheit', label: '°C → °F' }],
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-purple-500/30 font-sans flex flex-col">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-purple-600/5 blur-[100px] pointer-events-none" />

      {/* --- Desktop Navbar --- */}
      <nav className="hidden md:flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl fixed top-0 w-full z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black italic tracking-tighter text-white uppercase">
            Paper<span className="text-purple-600 drop-shadow-[0_0_10px_rgba(147,51,234,0.5)]">Tube</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
            <Link href="/tools" className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors">Matrix</Link>
            <Badge variant="outline" className="border-purple-500/20 text-purple-400 uppercase tracking-widest text-[10px] bg-purple-500/5">Universal</Badge>
        </div>
      </nav>

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <RefreshCw className="text-purple-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">UNIT LAB</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-purple-600/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-purple-500 border border-purple-600/20 shadow-[0_0_10px_rgba(147,51,234,0.2)]">
            <Sparkles className="h-3 w-3" /> Real-time • Live Currency
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Universal <span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-500 to-purple-800">Convert</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Translate length, mass, energy, and value across standards.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left: Converter Module */}
          <div className="lg:col-span-8 space-y-6">
             <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
                <CardHeader className="pb-4 pt-6 px-6 border-b border-white/5">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Conversion Deck</CardTitle>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg"><History size={16} /></Button>
                         <Button variant="ghost" size="sm" onClick={fetchCurrencyRates} className="h-8 w-8 text-neutral-500 hover:text-green-400 hover:bg-white/5 rounded-lg" disabled={activeCategory !== 'currency'}><RefreshCw size={16} /></Button>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                   
                   {/* Categories */}
                   <div className="overflow-x-auto pb-2 custom-scrollbar">
                      <div className="flex gap-3 min-w-max">
                         {categories.map((cat) => (
                            <button
                               key={cat.id}
                               onClick={() => setActiveCategory(cat.id)}
                               className={cn(
                                  "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all min-w-[85px] group active:scale-95",
                                  activeCategory === cat.id 
                                     ? `bg-gradient-to-br ${cat.color} border-transparent text-white shadow-lg` 
                                     : "bg-black border-white/5 text-neutral-500 hover:border-white/20 hover:text-white"
                               )}
                            >
                               <div className={cn("mb-2 p-2 rounded-xl transition-colors", activeCategory === cat.id ? "bg-white/20" : "bg-neutral-900 group-hover:bg-white/5")}>{cat.icon}</div>
                               <span className="text-[9px] font-black uppercase tracking-widest">{cat.name}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Inputs */}
                   <div className="grid md:grid-cols-2 gap-8 items-start relative">
                      <div className="space-y-2">
                         <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Source Input</label>
                         <div className="flex gap-2">
                            <input 
                               type="text" value={fromValue} onChange={(e) => setFromValue(e.target.value)}
                               className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-lg font-mono text-white outline-none focus:border-purple-500 transition-colors"
                            />
                            <div className="relative">
                                <select 
                                value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
                                className="w-32 h-full bg-neutral-900 border border-white/10 rounded-xl px-3 text-[10px] font-black uppercase text-white outline-none appearance-none cursor-pointer hover:bg-neutral-800 transition-colors"
                                >
                                {categoryUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-neutral-500 pointer-events-none" size={12} />
                            </div>
                         </div>
                      </div>

                      {/* Swap Icon */}
                      <div className="absolute left-1/2 top-[38px] -translate-x-1/2 z-10 hidden md:flex">
                         <Button onClick={swapUnits} size="icon" className="rounded-full h-10 w-10 bg-neutral-800 border-4 border-[#0a0a0a] text-white hover:bg-purple-600 transition-all shadow-xl">
                            <RefreshCw size={16} />
                         </Button>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Target Output</label>
                         <div className="flex gap-2">
                            <div className="flex-1 bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-lg font-mono text-purple-400 flex items-center overflow-hidden">
                               {toValue || "..."}
                            </div>
                            <div className="relative">
                                <select 
                                value={toUnit} onChange={(e) => setToUnit(e.target.value)}
                                className="w-32 h-full bg-neutral-900 border border-white/10 rounded-xl px-3 text-[10px] font-black uppercase text-white outline-none appearance-none cursor-pointer hover:bg-neutral-800 transition-colors"
                                >
                                {categoryUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-neutral-500 pointer-events-none" size={12} />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Conversion Rate Info */}
                   {currentFromUnit && currentToUnit && (
                      <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex justify-between items-center">
                         <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                            1 {currentFromUnit.abbreviation} ≈ {formatNumber(activeCategory === 'currency' ? 1/(currentFromUnit.conversionRate || 1) * (currentToUnit.conversionRate || 1) : currentFromUnit.conversionRate / currentToUnit.conversionRate)} {currentToUnit.abbreviation}
                         </span>
                         <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-white/10" onClick={copyResult}><Copy size={14} /></Button>
                            <Button size="icon" variant="ghost" className={cn("h-8 w-8 rounded-lg hover:bg-white/10", favorites.includes(`${fromUnit}-${toUnit}`) && "text-yellow-400")} onClick={toggleFavorite}><Star size={14} /></Button>
                         </div>
                      </div>
                   )}

                </CardContent>
             </Card>

             {/* History Panel */}
             <AnimatePresence>
                {showHistory && conversionHistory.length > 0 && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Card className="bg-neutral-900/30 border-white/10 rounded-2xl overflow-hidden">
                         <CardHeader className="pb-2 pt-4 px-6"><CardTitle className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Recent Activity</CardTitle></CardHeader>
                         <CardContent className="px-6 pb-4 space-y-2">
                            {conversionHistory.map((h) => (
                               <div key={h.id} className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono hover:bg-white/5 transition-colors">
                                  <span className="text-white">{h.fromValue} {units.find(u=>u.id===h.fromUnit)?.abbreviation} <span className="text-neutral-600 mx-2">→</span> {formatNumber(h.toValue)} {units.find(u=>u.id===h.toUnit)?.abbreviation}</span>
                                  <span className="text-[9px] text-neutral-600 font-sans font-bold">{h.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                               </div>
                            ))}
                         </CardContent>
                      </Card>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Right: Quick Access & Info */}
          <div className="lg:col-span-4 space-y-6">
             {/* Favorites */}
             {favorites.length > 0 && (
                <Card className="bg-neutral-900/30 border-white/10 rounded-[2rem] overflow-hidden">
                   <CardHeader className="pb-3 pt-6 px-6 border-b border-white/5"><CardTitle className="text-[10px] font-black uppercase text-yellow-500 tracking-widest flex items-center gap-2"><Star size={14}/> Favorites</CardTitle></CardHeader>
                   <CardContent className="p-6 grid grid-cols-1 gap-2">
                      {favorites.map((fav, i) => {
                         const [f, t] = fav.split('-');
                         return (
                            <button key={i} onClick={() => loadFavorite(fav)} className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/5 hover:border-yellow-500/30 transition-all text-xs group active:scale-95">
                               <span className="font-bold text-white uppercase">{units.find(u=>u.id===f)?.name}</span> 
                               <ArrowLeft className="rotate-180 text-neutral-600 group-hover:text-yellow-500 transition-colors" size={12} />
                               <span className="font-bold text-white uppercase">{units.find(u=>u.id===t)?.name}</span>
                            </button>
                         )
                      })}
                   </CardContent>
                </Card>
             )}

             {/* Popular Presets */}
             <Card className="bg-neutral-900/30 border-white/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="pb-3 pt-6 px-6 border-b border-white/5"><CardTitle className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-2"><Target size={14}/> Quick Access</CardTitle></CardHeader>
                <CardContent className="p-6 flex flex-wrap gap-2">
                   {popularConversions[activeCategory as keyof typeof popularConversions]?.map((conv, i) => (
                      <Badge key={i} onClick={()=>{setFromUnit(conv.from); setToUnit(conv.to)}} className="cursor-pointer bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide">
                         {conv.label}
                      </Badge>
                   ))}
                   {activeCategory === 'currency' && <Badge onClick={()=>{setFromUnit('USD'); setToUnit('EUR')}} className="cursor-pointer bg-green-500/10 text-green-300 border-green-500/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide">$ → €</Badge>}
                </CardContent>
             </Card>

             {/* Trust Markers */}
             <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 text-center backdrop-blur-sm">
                   <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                   <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Instant</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 text-center backdrop-blur-sm">
                   <Globe className="h-6 w-6 text-green-500 mx-auto mb-2" />
                   <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Live Rates</p>
                </div>
             </div>
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
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-purple-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
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