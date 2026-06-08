import { useState, useEffect } from "react";
import testimonialsData from "@/data/testimonials-local.json";

export interface RegionConfig {
  region: string;
  locale: string;
  currency: string;
  currencySymbol: string;
  exams: string[];
  universities: string[];
  cities: string[];
  heroTitle: string;
  heroSubtitle: string;
  supportEmail: string;
}

export interface University {
  name: string;
  city: string;
}

export interface Testimonial {
  name: string;
  university: string;
  course: string;
  quote: string;
  rating: number;
  exam: string;
}

const configs: Record<string, RegionConfig> = {
  us: {
    region: "us",
    locale: "en-US",
    currency: "USD",
    currencySymbol: "$",
    exams: ["SAT", "ACT", "AP Calculus", "AP Chemistry", "AP US History", "AP Biology"],
    universities: ["Stanford University", "MIT", "Harvard University", "Princeton University", "Yale University", "UC Berkeley"],
    cities: ["Stanford", "Cambridge", "Boston", "Princeton", "New Haven", "Berkeley"],
    heroTitle: "Convert YouTube Lectures to SAT, ACT & AP Study Notes Instantly",
    heroSubtitle: "The best free AI note taker and study summaries generator for college-bound students at Stanford, MIT, and Ivy League schools.",
    supportEmail: "support.us@paperxify.com"
  },
  uk: {
    region: "uk",
    locale: "en-GB",
    currency: "GBP",
    currencySymbol: "£",
    exams: ["GCSEs", "A-Levels", "Oxbridge Entrance", "BMAT", "PAT"],
    universities: ["University of Oxford", "University of Cambridge", "LSE", "UCL", "Imperial College London"],
    cities: ["Oxford", "Cambridge", "London", "Edinburgh", "Manchester"],
    heroTitle: "Convert YouTube Lectures to A-Level & GCSE Study Notes Instantly",
    heroSubtitle: "Master your GCSE and A-Level courses with Paperxify. The ultimate AI study notes, flashcards, and Oxbridge preparation hack.",
    supportEmail: "support.uk@paperxify.com"
  },
  ca: {
    region: "ca",
    locale: "en-CA",
    currency: "CAD",
    currencySymbol: "CA$",
    exams: ["Provincial Exams", "OSSLT", "SAT Prep", "AP Calculus", "AP Biology"],
    universities: ["University of Toronto", "UBC", "McGill University", "University of Waterloo", "McMaster University"],
    cities: ["Toronto", "Vancouver", "Montreal", "Waterloo", "Hamilton"],
    heroTitle: "Convert YouTube Lectures to Canadian Study Notes Instantly",
    heroSubtitle: "Prepare for Provincial Exams, OSSLT, and AP tests. Generate clear structured notes and sync to Notion at U of T, UBC, or McGill.",
    supportEmail: "support.ca@paperxify.com"
  },
  au: {
    region: "au",
    locale: "en-AU",
    currency: "AUD",
    currencySymbol: "A$",
    exams: ["NSW HSC", "Victorian VCE", "WACE", "QCE", "ATAR Physics", "ATAR Chemistry"],
    universities: ["University of Melbourne", "University of Sydney", "Australian National University", "UNSW Sydney", "Monash University"],
    cities: ["Melbourne", "Sydney", "Canberra", "Brisbane"],
    heroTitle: "Convert YouTube Lectures to HSC, VCE & ATAR Notes Instantly",
    heroSubtitle: "Get high ATAR scores. Convert physics, math, and chemistry videos into structured summaries and active recall flashcards.",
    supportEmail: "support.au@paperxify.com"
  },
  de: {
    region: "de",
    locale: "de-DE",
    currency: "EUR",
    currencySymbol: "€",
    exams: ["Abitur Mathematik", "Abitur Physik", "Abitur Deutsch", "Numerus Clausus Prep"],
    universities: ["LMU München", "TU Berlin", "Heidelberg Universität", "RWTH Aachen", "Karlsruher Institut für Technologie"],
    cities: ["München", "Berlin", "Heidelberg", "Aachen", "Karlsruhe"],
    heroTitle: "YouTube-Vorlesungen sofort in strukturierte Notizen umwandeln",
    heroSubtitle: "Bereiten Sie sich perfekt auf Ihr Abitur und das Studium vor. Extrahieren Sie Formeln, Code-Blöcke und Diagramme auf Deutsch.",
    supportEmail: "support.de@paperxify.com"
  },
  global: {
    region: "global",
    locale: "en-US",
    currency: "USD",
    currencySymbol: "$",
    exams: ["AP Exams", "SAT", "GCSEs", "A-Levels", "HSC", "JEE", "GATE"],
    universities: ["Stanford", "MIT", "Oxford", "Cambridge", "University of Toronto", "Melbourne University", "IIT Bombay"],
    cities: ["New York", "London", "Toronto", "Sydney", "Mumbai"],
    heroTitle: "YouTube to Notes AI | Convert YouTube Video to Study Notes",
    heroSubtitle: "Paste a YT link to generate structured study guides, active recall flashcards, and printable PDFs in seconds.",
    supportEmail: "support@paperxify.com"
  }
};

const localizedContent: Record<string, Record<string, string>> = {
  ctaButton: {
    us: "Start Free AP/SAT Prep",
    uk: "Start Free A-Level Prep",
    ca: "Start Free Study Guide",
    au: "Calculate My ATAR Notes",
    de: "Kostenlos Zusammenfassen",
    global: "Convert YouTube to Notes"
  },
  featuresTitle: {
    us: "Specialized AI study notes matching US College standards",
    uk: "Oxbridge-tier lecture transcription & concept mapping",
    ca: "Canadian high school & university syllabus-optimized AI notes",
    au: "ATAR Physics, Math & Chemistry revision frameworks",
    de: "Akademische Textzusammenfassungen & Formelextraktion auf Deutsch",
    global: "Convert video lectures, crash courses & tutorials into notes"
  }
};

export function getRegionConfig(region: string): RegionConfig {
  const norm = (region || "global").toLowerCase();
  return configs[norm] || configs.global;
}

export function getLocalizedContent(key: string, region: string): string {
  const norm = (region || "global").toLowerCase();
  const dict = localizedContent[key];
  if (!dict) return "";
  return dict[norm] || dict.global || "";
}

export function formatCurrency(amount: number, region: string): string {
  const config = getRegionConfig(region);
  return `${config.currencySymbol}${amount.toFixed(2)}`;
}

export function getUniversityList(region: string): University[] {
  const config = getRegionConfig(region);
  return config.universities.map((name, idx) => ({
    name,
    city: config.cities[idx % config.cities.length]
  }));
}

export function getLocalizedTestimonials(region: string): Testimonial[] {
  const norm = (region || "global").toLowerCase();
  const data = (testimonialsData as any)[norm];
  if (data && data.testimonials) {
    return data.testimonials;
  }
  return (testimonialsData as any).us.testimonials;
}

export function useRegionConfig(region?: string) {
  const [activeRegion, setActiveRegion] = useState("global");

  useEffect(() => {
    if (region) {
      setActiveRegion(region);
    } else {
      const path = window.location.pathname;
      const firstSegment = path.split("/")[1];
      const validRegions = ["us", "uk", "ca", "au", "de"];
      if (firstSegment && validRegions.includes(firstSegment.toLowerCase())) {
        setActiveRegion(firstSegment.toLowerCase());
      }
    }
  }, [region]);

  const config = getRegionConfig(activeRegion);
  const testimonials = getLocalizedTestimonials(activeRegion);

  return {
    config,
    testimonials,
    activeRegion,
    t: (key: string) => getLocalizedContent(key, activeRegion),
    formatPrice: (amount: number) => formatCurrency(amount, activeRegion),
    getUnis: () => getUniversityList(activeRegion)
  };
}
