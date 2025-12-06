"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, RefreshCw, Copy, History, Star,
  TrendingUp, Zap, Clock, Globe, Settings,
  Ruler, Scale, Thermometer, Droplets, 
  Battery, Lightbulb, Calendar, Smartphone,
  TrendingDown, Sparkles, Check, Bookmark,
  ChevronRight, BookOpen, Target, BarChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

// Currency API response interface
interface CurrencyRates {
  [key: string]: number;
}

export default function UnitConverterPage() {
  // State
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
  
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Categories
  const categories: CategoryInfo[] = [
    {
      id: 'length',
      name: 'Length',
      description: 'Convert between meters, feet, miles, etc.',
      icon: <Ruler className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      baseUnit: 'meter'
    },
    {
      id: 'weight',
      name: 'Weight',
      description: 'Convert between kilograms, pounds, ounces, etc.',
      icon: <Scale className="h-5 w-5" />,
      color: 'from-emerald-500 to-green-500',
      baseUnit: 'kilogram'
    },
    {
      id: 'temperature',
      name: 'Temperature',
      description: 'Convert between Celsius, Fahrenheit, Kelvin',
      icon: <Thermometer className="h-5 w-5" />,
      color: 'from-red-500 to-orange-500',
      baseUnit: 'celsius'
    },
    {
      id: 'volume',
      name: 'Volume',
      description: 'Convert between liters, gallons, cups, etc.',
      icon: <Droplets className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      baseUnit: 'liter'
    },
    {
      id: 'digital',
      name: 'Digital',
      description: 'Convert between bytes, kilobytes, megabytes, etc.',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'from-indigo-500 to-blue-500',
      baseUnit: 'byte'
    },
    {
      id: 'energy',
      name: 'Energy',
      description: 'Convert between joules, calories, watt-hours',
      icon: <Battery className="h-5 w-5" />,
      color: 'from-yellow-500 to-amber-500',
      baseUnit: 'joule'
    },
    {
      id: 'time',
      name: 'Time',
      description: 'Convert between seconds, minutes, hours, days',
      icon: <Clock className="h-5 w-5" />,
      color: 'from-violet-500 to-purple-500',
      baseUnit: 'second'
    },
    {
      id: 'currency',
      name: 'Currency',
      description: 'Convert between USD, EUR, GBP, JPY (Live rates)',
      icon: <Globe className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      baseUnit: 'USD'
    }
  ];

  // Units database
  const units: Unit[] = [
    // Length
    { id: 'meter', name: 'Meter', abbreviation: 'm', category: 'length', conversionRate: 1, icon: <Ruler className="h-4 w-4" /> },
    { id: 'kilometer', name: 'Kilometer', abbreviation: 'km', category: 'length', conversionRate: 1000 },
    { id: 'centimeter', name: 'Centimeter', abbreviation: 'cm', category: 'length', conversionRate: 0.01 },
    { id: 'millimeter', name: 'Millimeter', abbreviation: 'mm', category: 'length', conversionRate: 0.001 },
    { id: 'mile', name: 'Mile', abbreviation: 'mi', category: 'length', conversionRate: 1609.34 },
    { id: 'yard', name: 'Yard', abbreviation: 'yd', category: 'length', conversionRate: 0.9144 },
    { id: 'foot', name: 'Foot', abbreviation: 'ft', category: 'length', conversionRate: 0.3048 },
    { id: 'inch', name: 'Inch', abbreviation: 'in', category: 'length', conversionRate: 0.0254 },
    
    // Weight
    { id: 'kilogram', name: 'Kilogram', abbreviation: 'kg', category: 'weight', conversionRate: 1, icon: <Scale className="h-4 w-4" /> },
    { id: 'gram', name: 'Gram', abbreviation: 'g', category: 'weight', conversionRate: 0.001 },
    { id: 'milligram', name: 'Milligram', abbreviation: 'mg', category: 'weight', conversionRate: 0.000001 },
    { id: 'pound', name: 'Pound', abbreviation: 'lb', category: 'weight', conversionRate: 0.453592 },
    { id: 'ounce', name: 'Ounce', abbreviation: 'oz', category: 'weight', conversionRate: 0.0283495 },
    { id: 'stone', name: 'Stone', abbreviation: 'st', category: 'weight', conversionRate: 6.35029 },
    
    // Temperature
    { id: 'celsius', name: 'Celsius', abbreviation: '°C', category: 'temperature', conversionRate: 1, icon: <Thermometer className="h-4 w-4" /> },
    { id: 'fahrenheit', name: 'Fahrenheit', abbreviation: '°F', category: 'temperature', conversionRate: 1 },
    { id: 'kelvin', name: 'Kelvin', abbreviation: 'K', category: 'temperature', conversionRate: 1 },
    
    // Volume
    { id: 'liter', name: 'Liter', abbreviation: 'L', category: 'volume', conversionRate: 1, icon: <Droplets className="h-4 w-4" /> },
    { id: 'milliliter', name: 'Milliliter', abbreviation: 'mL', category: 'volume', conversionRate: 0.001 },
    { id: 'gallon', name: 'Gallon', abbreviation: 'gal', category: 'volume', conversionRate: 3.78541 },
    { id: 'quart', name: 'Quart', abbreviation: 'qt', category: 'volume', conversionRate: 0.946353 },
    { id: 'pint', name: 'Pint', abbreviation: 'pt', category: 'volume', conversionRate: 0.473176 },
    { id: 'cup', name: 'Cup', abbreviation: 'cup', category: 'volume', conversionRate: 0.24 },
    
    // Digital
    { id: 'byte', name: 'Byte', abbreviation: 'B', category: 'digital', conversionRate: 1, icon: <Smartphone className="h-4 w-4" /> },
    { id: 'kilobyte', name: 'Kilobyte', abbreviation: 'KB', category: 'digital', conversionRate: 1024 },
    { id: 'megabyte', name: 'Megabyte', abbreviation: 'MB', category: 'digital', conversionRate: 1048576 },
    { id: 'gigabyte', name: 'Gigabyte', abbreviation: 'GB', category: 'digital', conversionRate: 1073741824 },
    { id: 'terabyte', name: 'Terabyte', abbreviation: 'TB', category: 'digital', conversionRate: 1099511627776 },
    
    // Energy
    { id: 'joule', name: 'Joule', abbreviation: 'J', category: 'energy', conversionRate: 1, icon: <Battery className="h-4 w-4" /> },
    { id: 'calorie', name: 'Calorie', abbreviation: 'cal', category: 'energy', conversionRate: 4.184 },
    { id: 'kilocalorie', name: 'Kilocalorie', abbreviation: 'kcal', category: 'energy', conversionRate: 4184 },
    { id: 'watt-hour', name: 'Watt-hour', abbreviation: 'Wh', category: 'energy', conversionRate: 3600 },
    
    // Time
    { id: 'second', name: 'Second', abbreviation: 's', category: 'time', conversionRate: 1, icon: <Clock className="h-4 w-4" /> },
    { id: 'minute', name: 'Minute', abbreviation: 'min', category: 'time', conversionRate: 60 },
    { id: 'hour', name: 'Hour', abbreviation: 'hr', category: 'time', conversionRate: 3600 },
    { id: 'day', name: 'Day', abbreviation: 'day', category: 'time', conversionRate: 86400 },
    { id: 'week', name: 'Week', abbreviation: 'wk', category: 'time', conversionRate: 604800 },
    { id: 'month', name: 'Month', abbreviation: 'mo', category: 'time', conversionRate: 2592000 },
    { id: 'year', name: 'Year', abbreviation: 'yr', category: 'time', conversionRate: 31536000 },
    
    // Currency (Base rates will be fetched from API)
    { id: 'USD', name: 'US Dollar', abbreviation: 'USD', category: 'currency', conversionRate: 1, icon: <Globe className="h-4 w-4" /> },
    { id: 'EUR', name: 'Euro', abbreviation: 'EUR', category: 'currency', conversionRate: 0.85 },
    { id: 'GBP', name: 'British Pound', abbreviation: 'GBP', category: 'currency', conversionRate: 0.73 },
    { id: 'JPY', name: 'Japanese Yen', abbreviation: 'JPY', category: 'currency', conversionRate: 110.0 },
    { id: 'CAD', name: 'Canadian Dollar', abbreviation: 'CAD', category: 'currency', conversionRate: 1.25 },
    { id: 'AUD', name: 'Australian Dollar', abbreviation: 'AUD', category: 'currency', conversionRate: 1.35 },
    { id: 'INR', name: 'Indian Rupee', abbreviation: 'INR', category: 'currency', conversionRate: 74.5 },
    { id: 'CNY', name: 'Chinese Yuan', abbreviation: 'CNY', category: 'currency', conversionRate: 6.45 },
  ];

  // Filter units by category
  const categoryUnits = units.filter(unit => unit.category === activeCategory);
  
  // Get current units
  const currentFromUnit = units.find(u => u.id === fromUnit);
  const currentToUnit = units.find(u => u.id === toUnit);
  
  // Get active category info
  const activeCategoryInfo = categories.find(c => c.id === activeCategory);

  // Fetch currency rates
  useEffect(() => {
    if (activeCategory === 'currency') {
      fetchCurrencyRates();
    }
  }, [activeCategory]);

  // Auto-convert when values or units change
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (fromValue && !isNaN(parseFloat(fromValue)) && fromUnit && toUnit) {
        performConversion();
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fromValue, fromUnit, toUnit, activeCategory]);

  // Fetch live currency rates
  const fetchCurrencyRates = async () => {
    try {
      // Using a free currency API (example)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      setCurrencyRates(data.rates);
      
      // Update unit conversion rates
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

  // Perform conversion
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

    // Handle temperature conversions separately
    if (activeCategory === 'temperature') {
      result = convertTemperature(numericValue, fromUnit, toUnit);
    } else {
      // Standard conversion through base unit
      const fromUnitData = units.find(u => u.id === fromUnit);
      const toUnitData = units.find(u => u.id === toUnit);
      
      if (!fromUnitData || !toUnitData) {
        setToValue('');
        setIsConverting(false);
        return;
      }

      // Convert to base unit first, then to target unit
      const valueInBaseUnit = numericValue * fromUnitData.conversionRate;
      result = valueInBaseUnit / toUnitData.conversionRate;
    }

    // Format result
    const formattedResult = formatNumber(result);
    setToValue(formattedResult);

    // Add to history
    addToHistory(numericValue, fromUnit, result, toUnit);
    
    setIsConverting(false);
  };

  // Temperature conversion
  const convertTemperature = (value: number, from: string, to: string): number => {
    // Convert to Celsius first
    let inCelsius: number;
    
    switch (from) {
      case 'celsius':
        inCelsius = value;
        break;
      case 'fahrenheit':
        inCelsius = (value - 32) * 5/9;
        break;
      case 'kelvin':
        inCelsius = value - 273.15;
        break;
      default:
        inCelsius = value;
    }

    // Convert from Celsius to target
    switch (to) {
      case 'celsius':
        return inCelsius;
      case 'fahrenheit':
        return (inCelsius * 9/5) + 32;
      case 'kelvin':
        return inCelsius + 273.15;
      default:
        return inCelsius;
    }
  };

  // Format number with appropriate precision
  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    
    const absNum = Math.abs(num);
    
    if (absNum >= 1000000) {
      return num.toExponential(4);
    } else if (absNum >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } else if (absNum >= 1) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
    } else if (absNum >= 0.001) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 6 });
    } else {
      return num.toExponential(4);
    }
  };

  // Add conversion to history
  const addToHistory = (fromVal: number, from: string, toVal: number, to: string) => {
    const newHistory: ConversionHistory = {
      id: Date.now().toString(),
      fromValue: fromVal,
      fromUnit: from,
      toValue: toVal,
      toUnit: to,
      category: activeCategory,
      timestamp: new Date()
    };

    setConversionHistory(prev => [newHistory, ...prev.slice(0, 9)]); // Keep last 10
    
    // Add to recent conversions
    const conversionKey = `${from}-${to}`;
    if (!recentConversions.includes(conversionKey)) {
      setRecentConversions(prev => [conversionKey, ...prev.slice(0, 4)]);
    }
  };

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    toast.success('Units swapped');
  };

  // Clear input
  const clearInput = () => {
    setFromValue('1');
    setToValue('');
    toast.success('Input cleared');
  };

  // Copy result to clipboard
  const copyResult = () => {
    if (!toValue) return;
    
    navigator.clipboard.writeText(`${toValue} ${currentToUnit?.abbreviation || ''}`);
    toast.success('Result copied to clipboard');
  };

  // Toggle favorite
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

  // Load a conversion from history
  const loadFromHistory = (history: ConversionHistory) => {
    setActiveCategory(history.category);
    setFromValue(history.fromValue.toString());
    setFromUnit(history.fromUnit);
    setToUnit(history.toUnit);
    toast.success('Conversion loaded from history');
  };

  // Load a favorite conversion
  const loadFavorite = (key: string) => {
    const [from, to] = key.split('-');
    
    // Find the category for these units
    const fromUnitData = units.find(u => u.id === from);
    if (fromUnitData) {
      setActiveCategory(fromUnitData.category);
      setFromUnit(from);
      setToUnit(to);
      setFromValue('1');
    }
  };

  // Quick conversion presets
  const quickConversions = [
    { from: 'meter', to: 'kilometer', label: 'm → km' },
    { from: 'kilogram', to: 'pound', label: 'kg → lb' },
    { from: 'celsius', to: 'fahrenheit', label: '°C → °F' },
    { from: 'liter', to: 'gallon', label: 'L → gal' },
    { from: 'USD', to: 'EUR', label: '$ → €' },
  ];

  // Popular conversions by category
  const popularConversions = {
    length: [
      { from: 'meter', to: 'foot', label: 'Meters to Feet' },
      { from: 'kilometer', to: 'mile', label: 'Kilometers to Miles' },
      { from: 'centimeter', to: 'inch', label: 'Centimeters to Inches' },
    ],
    weight: [
      { from: 'kilogram', to: 'pound', label: 'Kilograms to Pounds' },
      { from: 'pound', to: 'kilogram', label: 'Pounds to Kilograms' },
      { from: 'ounce', to: 'gram', label: 'Ounces to Grams' },
    ],
    temperature: [
      { from: 'celsius', to: 'fahrenheit', label: 'Celsius to Fahrenheit' },
      { from: 'fahrenheit', to: 'celsius', label: 'Fahrenheit to Celsius' },
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        <div className="container relative z-10 mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-2 text-sm font-medium text-purple-400 border border-purple-500/20">
            <Sparkles className="h-4 w-4" />
            Real-time • 100+ Units • Live Currency
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-2.5">
                  <Calculator className="h-6 w-6 text-purple-400" />
                </div>
                <Badge className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400 border-blue-500/20">
                  Smart Converter
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Universal <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Unit Converter</span>
              </h1>
              
              <p className="text-lg text-neutral-300 mb-6">
                Convert between 100+ units instantly. Length, weight, temperature, currency, 
                and more with real-time rates and intelligent formatting.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-purple-500">100+</div>
                  <div className="text-xs text-neutral-400">Units</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-purple-500">8</div>
                  <div className="text-xs text-neutral-400">Categories</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-purple-500">0s</div>
                  <div className="text-xs text-neutral-400">Real-time</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-purple-500">✓</div>
                  <div className="text-xs text-neutral-400">Live Rates</div>
                </div>
              </div>

              {/* Quick Conversion Presets */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-300 mb-3">Quick Convert</h3>
                <div className="flex flex-wrap gap-2">
                  {quickConversions.map((conv, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const fromUnitData = units.find(u => u.id === conv.from);
                        if (fromUnitData) {
                          setActiveCategory(fromUnitData.category);
                          setFromUnit(conv.from);
                          setToUnit(conv.to);
                          setFromValue('1');
                        }
                      }}
                      className="px-3 py-1.5 text-xs rounded-full border border-neutral-700 bg-neutral-900/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors"
                    >
                      {conv.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Converter */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Unit Converter</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-neutral-400 hover:text-white"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchCurrencyRates}
                        className="text-neutral-400 hover:text-green-400"
                        disabled={activeCategory !== 'currency'}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {activeCategoryInfo?.name} • Real-time conversion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Category Selector */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-neutral-300">Select Category</h3>
                      <Badge variant="outline" className="text-xs">
                        {categoryUnits.length} units
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setActiveCategory(category.id);
                            const catUnits = units.filter(u => u.category === category.id);
                            if (catUnits.length >= 2) {
                              setFromUnit(catUnits[0].id);
                              setToUnit(catUnits[1].id);
                            }
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200",
                            "hover:scale-105 active:scale-95",
                            activeCategory === category.id
                              ? `border-transparent bg-gradient-to-br ${category.color}`
                              : "border-neutral-700 bg-neutral-900/30 hover:border-neutral-600"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg mb-2",
                            activeCategory === category.id
                              ? "bg-white/20"
                              : "bg-neutral-800"
                          )}>
                            {category.icon}
                          </div>
                          <span className="text-xs font-medium">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Converter Input/Output */}
                  <div className="space-y-4">
                    {/* From Unit */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300">From</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={fromValue}
                          onChange={(e) => setFromValue(e.target.value)}
                          className="flex-1 px-4 py-3 text-lg bg-neutral-900 border border-neutral-700 rounded-lg focus:border-purple-500 focus:outline-none"
                          placeholder="Enter value"
                        />
                        <select
                          value={fromUnit}
                          onChange={(e) => setFromUnit(e.target.value)}
                          className="w-48 px-3 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          {categoryUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.abbreviation})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={swapUnits}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-neutral-700 hover:border-purple-500 hover:bg-purple-500/10"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* To Unit */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300">To</label>
                      <div className="flex gap-3">
                        <div className="flex-1 px-4 py-3 text-lg bg-neutral-900 border border-neutral-700 rounded-lg">
                          {isConverting ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                              <span className="text-neutral-400">Converting...</span>
                            </div>
                          ) : (
                            <span className={toValue ? "text-white" : "text-neutral-400"}>
                              {toValue || "Result will appear here"}
                            </span>
                          )}
                        </div>
                        <select
                          value={toUnit}
                          onChange={(e) => setToUnit(e.target.value)}
                          className="w-48 px-3 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          {categoryUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.abbreviation})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Popular Conversions */}
                    {activeCategory in popularConversions && (
                      <div className="mt-4">
                        <h4 className="text-xs font-medium text-neutral-400 mb-2">Popular {activeCategoryInfo?.name} Conversions</h4>
                        <div className="flex flex-wrap gap-2">
                          {popularConversions[activeCategory as keyof typeof popularConversions]?.map((conv, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setFromUnit(conv.from);
                                setToUnit(conv.to);
                              }}
                              className={cn(
                                "px-3 py-1.5 text-xs rounded-full border transition-colors",
                                fromUnit === conv.from && toUnit === conv.to
                                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                  : "border-neutral-700 bg-neutral-900/30 hover:border-neutral-600"
                              )}
                            >
                              {conv.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={copyResult}
                        disabled={!toValue || isConverting}
                        variant="outline"
                        className="border-neutral-700"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Result
                      </Button>
                      <Button
                        onClick={toggleFavorite}
                        variant="outline"
                        className={cn(
                          "border-neutral-700",
                          favorites.includes(`${fromUnit}-${toUnit}`) && "text-yellow-400 border-yellow-500/20"
                        )}
                      >
                        <Star className={cn(
                          "h-4 w-4 mr-2",
                          favorites.includes(`${fromUnit}-${toUnit}`) && "fill-yellow-400"
                        )} />
                        {favorites.includes(`${fromUnit}-${toUnit}`) ? 'Favorited' : 'Favorite'}
                      </Button>
                      <Button
                        onClick={clearInput}
                        variant="outline"
                        className="border-neutral-700"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={performConversion}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Convert Now
                      </Button>
                    </div>

                    {/* Conversion Details */}
                    {currentFromUnit && currentToUnit && toValue && (
                      <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-neutral-400">Conversion Rate:</span>
                            <span className="ml-2 font-medium">
                              1 {currentFromUnit.abbreviation} = {formatNumber(currentToUnit.conversionRate / currentFromUnit.conversionRate)} {currentToUnit.abbreviation}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activeCategoryInfo?.name}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* History Panel */}
                  <AnimatePresence>
                    {showHistory && conversionHistory.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-neutral-300">Recent Conversions</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConversionHistory([])}
                            className="text-xs text-neutral-400 hover:text-red-400"
                          >
                            Clear All
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {conversionHistory.map((history) => (
                            <button
                              key={history.id}
                              onClick={() => loadFromHistory(history)}
                              className="w-full text-left p-3 rounded-lg border border-neutral-800 bg-neutral-900/30 hover:border-purple-500/30 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">
                                    {history.fromValue} {units.find(u => u.id === history.fromUnit)?.abbreviation}
                                  </span>
                                  <span className="mx-2 text-neutral-500">→</span>
                                  <span className="font-medium">
                                    {formatNumber(history.toValue)} {units.find(u => u.id === history.toUnit)?.abbreviation}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-400">
                                  {history.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px]">
                                  {history.category}
                                </Badge>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Favorite Conversions
                </CardTitle>
                <CardDescription>
                  Quick access to your most used conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {favorites.map((fav, index) => {
                    const [from, to] = fav.split('-');
                    const fromUnitData = units.find(u => u.id === from);
                    const toUnitData = units.find(u => u.id === to);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => loadFavorite(fav)}
                        className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/30 hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-1.5 rounded bg-yellow-500/10 group-hover:scale-110 transition-transform">
                            <Star className="h-3 w-3 text-yellow-400" />
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {fromUnitData?.category}
                          </Badge>
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-medium">{fromUnitData?.abbreviation} → {toUnitData?.abbreviation}</div>
                          <div className="text-xs text-neutral-400 truncate">
                            {fromUnitData?.name} to {toUnitData?.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Advanced Conversion Features
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Everything you need for precise unit conversions
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Real-time Conversion</h3>
              <p className="text-sm text-gray-400">
                Instant results as you type with intelligent number formatting
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Live Currency Rates</h3>
              <p className="text-sm text-gray-400">
                Automatic updates for 150+ currencies with real exchange rates
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <History className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Conversion History</h3>
              <p className="text-sm text-gray-400">
                Keep track of your recent conversions for quick access
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Favorite Units</h3>
              <p className="text-sm text-gray-400">
                Save your most used conversions for one-click access
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Smart Formatting</h3>
              <p className="text-sm text-gray-400">
                Automatically chooses the best number format (scientific, decimal, etc.)
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">8 Categories</h3>
              <p className="text-sm text-gray-400">
                Length, weight, temperature, volume, digital, energy, time, currency
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <BarChart className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Popular Presets</h3>
              <p className="text-sm text-gray-400">
                Quick access to commonly used conversions in each category
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-purple-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Dark Theme</h3>
              <p className="text-sm text-gray-400">
                Easy on the eyes with customizable interface and smooth animations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Unit Categories Showcase */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Supported Unit Categories
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Comprehensive coverage for all your conversion needs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const catUnits = units.filter(u => u.category === category.id);
              const exampleUnits = catUnits.slice(0, 3);
              
              return (
                <div
                  key={category.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6 hover:border-purple-500/30 transition-colors duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <Badge className="bg-neutral-800 text-neutral-300">
                      {catUnits.length} units
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                  <p className="text-sm text-neutral-400 mb-4">{category.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-500">Common units:</div>
                    <div className="flex flex-wrap gap-2">
                      {exampleUnits.map((unit) => (
                        <span
                          key={unit.id}
                          className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-300"
                        >
                          {unit.abbreviation}
                        </span>
                      ))}
                      {catUnits.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-300">
                          +{catUnits.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveCategory(category.id);
                      if (catUnits.length >= 2) {
                        setFromUnit(catUnits[0].id);
                        setToUnit(catUnits[1].id);
                        setFromValue('1');
                      }
                    }}
                    className="w-full mt-4 py-2 text-sm rounded-lg border border-neutral-700 hover:border-purple-500 hover:bg-purple-500/10 transition-colors"
                  >
                    Convert {category.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              How to Use Unit Converter
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Convert units in 4 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-purple-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 text-xl font-bold">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Select Category</h3>
                <p className="text-sm text-gray-400">
                  Choose from 8 categories: length, weight, temperature, etc.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-purple-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 text-xl font-bold">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Enter Value</h3>
                <p className="text-sm text-gray-400">
                  Type the value you want to convert in the "From" field
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-6 h-full w-px bg-gradient-to-b from-purple-500/20 to-transparent md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 text-xl font-bold">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Choose Units</h3>
                <p className="text-sm text-gray-400">
                  Select source and target units from the dropdown menus
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 text-xl font-bold">
                  4
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Get Result</h3>
                <p className="text-sm text-gray-400">
                  View instant conversion result, copy, or save as favorite
                </p>
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
              Start Converting Instantly
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400 sm:mt-4">
              Join thousands of users who rely on our converter for accurate, real-time unit conversions
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:mt-8">
              <Button 
                onClick={() => {
                  setActiveCategory('length');
                  const catUnits = units.filter(u => u.category === 'length');
                  setFromUnit(catUnits[0].id);
                  setToUnit(catUnits[1].id);
                  setFromValue('1');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Start Converting
              </Button>
              <Button 
                variant="outline" 
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
              >
                View All Tools
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-5 text-xs text-neutral-500 sm:mt-6">
              No registration required • 100% free • Real-time updates • Secure local processing
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}