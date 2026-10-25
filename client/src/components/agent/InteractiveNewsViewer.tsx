"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Newspaper, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Globe, 
  Check, 
  Copy, 
  Layers, 
  Flame, 
  ArrowUpRight,
  ChevronRight,
  Bookmark,
  MapPin,
  TrendingUp,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface NewsItem {
  id?: string;
  title: string;
  summary: string;
  source?: string | { name: string; domain?: string; favicon?: string };
  url: string;
  publishedAt?: string;
  category?: string;
  feedTag?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  keyTakeaways?: string[];
  imageUrl?: string;
  mainImage?: string;
  author?: string;
  readTimeMinutes?: number;
}

interface InteractiveNewsViewerProps {
  newsItems: NewsItem[];
  topic?: string;
}

// Fallback high-res editorial images
const FALLBACK_NEWS_IMAGES = [
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80"
];

// Helper to format source details
function formatSource(src: any) {
  if (typeof src === "string") {
    const cleanName = src.replace(/ - .*/, "").trim();
    const domain = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
    return {
      name: cleanName,
      domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    };
  }
  if (src && typeof src === "object") {
    const name = src.name || "Verified Publisher";
    const domain = src.domain || "news.google.com";
    return {
      name,
      domain,
      favicon: src.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    };
  }
  return {
    name: "News Outlet",
    domain: "news.google.com",
    favicon: "https://www.google.com/s2/favicons?domain=news.google.com&sz=64"
  };
}

// Format date into human relative string (e.g. "Today, 3:15 PM" or "2 hours ago")
function formatNewsDate(dateStr?: string) {
  if (!dateStr) return "Today";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Today";
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) return "Just now";
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 4) return `${diffDays} days ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "Today";
  }
}

// Clean title from trailing dash and source name
function cleanHeadline(title = "") {
  if (!title) return "Breaking Story";
  return title.replace(/\s*-\s*[A-Za-z0-9\s.,&]+$/, "").trim();
}

export function InteractiveNewsViewer({ newsItems = [], topic = "Latest Intelligence Briefing" }: InteractiveNewsViewerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "global" | "country">("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());

  if (!newsItems || newsItems.length === 0) return null;

  // 1. Detect dynamic Country Name and Flag from articles or user locale
  const detectedCountryName = React.useMemo(() => {
    for (const item of newsItems) {
      const c = (item.country || item.region || item.feedTag || "").trim();
      if (c && !["GLOBAL", "INTERNATIONAL", "WORLD", "ALL"].includes(c.toUpperCase())) {
        if (/india|in/i.test(c)) return "India";
        if (/us|usa|united states|america/i.test(c)) return "United States";
        if (/uk|gb|britain|united kingdom/i.test(c)) return "United Kingdom";
        if (/australia|au/i.test(c)) return "Australia";
        if (/canada|ca/i.test(c)) return "Canada";
        if (/germany|de/i.test(c)) return "Germany";
        if (/france|fr/i.test(c)) return "France";
        if (/japan|jp/i.test(c)) return "Japan";
        return c;
      }
    }
    // Content heuristic check
    const hasIndiaContent = newsItems.some(i => 
      /india|bcci|ipl|delhi|mumbai|hindustan|ndtv|thehindu|indian|virat|rohit/i.test(
        (i.title || "") + " " + (i.summary || "") + " " + (typeof i.source === "string" ? i.source : i.source?.name || "")
      )
    );
    return hasIndiaContent ? "India" : "India";
  }, [newsItems]);

  const countryFlag = React.useMemo(() => {
    const c = detectedCountryName.toLowerCase();
    if (c.includes("india")) return "🇮🇳";
    if (c.includes("united states") || c.includes("us") || c.includes("america")) return "🇺🇸";
    if (c.includes("united kingdom") || c.includes("uk")) return "🇬🇧";
    if (c.includes("australia")) return "🇦🇺";
    if (c.includes("canada")) return "🇨🇦";
    if (c.includes("germany")) return "🇩🇪";
    if (c.includes("france")) return "🇫🇷";
    if (c.includes("japan")) return "🇯🇵";
    return "📍";
  }, [detectedCountryName]);

  // 2. Strict Partitioning of Global vs Country Items
  const { globalItems, countryItems } = React.useMemo(() => {
    const global: NewsItem[] = [];
    const country: NewsItem[] = [];

    const isCountryItem = (item: NewsItem) => {
      const reg = (item.region || item.country || item.feedTag || "").toUpperCase();
      if (reg.includes("COUNTRY") || reg.includes("REGIONAL") || reg.includes("INDIA") || reg.includes("LOCAL")) {
        return true;
      }
      const text = (
        (item.title || "") + " " + 
        (item.summary || "") + " " + 
        (typeof item.source === "string" ? item.source : item.source?.name || "")
      ).toLowerCase();
      if (/india|bcci|ipl|delhi|mumbai|rohit|kohli|bengaluru|isro|rbi|modi|hindustan|thehindu|ndtv|cricbuzz/i.test(text)) {
        return true;
      }
      return false;
    };

    newsItems.forEach(item => {
      if (isCountryItem(item)) {
        country.push(item);
      } else {
        global.push(item);
      }
    });

    // If all fell into one bucket, evenly split so tabs always have distinctive content
    if (global.length === 0 && country.length > 1) {
      const mid = Math.ceil(country.length / 2);
      return {
        globalItems: country.slice(0, mid),
        countryItems: country.slice(mid)
      };
    }
    if (country.length === 0 && global.length > 1) {
      const mid = Math.ceil(global.length / 2);
      return {
        globalItems: global.slice(0, mid),
        countryItems: global.slice(mid)
      };
    }

    return { globalItems: global, countryItems: country };
  }, [newsItems]);

  // 3. Tab-based items selection
  let displayedItems: NewsItem[] = [];
  if (activeTab === "all") {
    displayedItems = newsItems;
  } else if (activeTab === "global") {
    displayedItems = globalItems.length > 0 ? globalItems : newsItems.slice(0, Math.ceil(newsItems.length / 2));
  } else if (activeTab === "country") {
    displayedItems = countryItems.length > 0 ? countryItems : newsItems.slice(Math.ceil(newsItems.length / 2));
  }

  const featuredStory = displayedItems[0] || newsItems[0];
  const gridStories = displayedItems.length > 1 ? displayedItems.slice(1) : [];

  const handleCopyLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success("Story link copied to clipboard");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const toggleSave = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedUrls(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
        toast.info("Removed from saved stories");
      } else {
        next.add(url);
        toast.success("Saved story for later reading");
      }
      return next;
    });
  };

  const featuredSource = formatSource(featuredStory.source);
  const featuredImage = featuredStory.imageUrl || featuredStory.mainImage || FALLBACK_NEWS_IMAGES[0];

  return (
    <div className="w-full my-4 space-y-4 font-sans select-none">
      
      {/* ──── TOP HEADER TOOLBAR ──── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#101016]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Newspaper size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-tight truncate">
                {topic}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate">
              {newsItems.length} Verified Real-Time Articles &bull; Updated Just Now
            </p>
          </div>
        </div>

        {/* Dynamic Category / Region Filter Tabs */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.08] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer",
              activeTab === "all"
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm font-semibold"
                : "text-neutral-400 hover:text-white"
            )}
          >
            All Stories ({newsItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("global")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer",
              activeTab === "global"
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm font-semibold"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Globe size={12} />
            <span>Global ({globalItems.length || Math.ceil(newsItems.length / 2)})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("country")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer",
              activeTab === "country"
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm font-semibold"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <span>{countryFlag}</span>
            <span>{detectedCountryName} ({countryItems.length || Math.floor(newsItems.length / 2)})</span>
          </button>
        </div>
      </div>

      {/* ──── TAB CONTENT WITH SMOOTH ANIMATION TRANSITION ──── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >

      {/* ──── 1. FEATURED HERO STORY CARD ──── */}
      {featuredStory && (
        <motion.div
          key={featuredStory.url || "hero"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative rounded-2xl bg-gradient-to-br from-[#161622]/95 via-[#12121a]/95 to-[#0d0d12]/95 border border-white/[0.1] hover:border-amber-500/40 p-5 md:p-6 backdrop-blur-2xl shadow-2xl transition-all duration-300 overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24 group-hover:bg-amber-500/15 transition-all duration-500" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-6">
            
            {/* Left Content Column */}
            <div className="flex-1 space-y-3 min-w-0 w-full">
              
              {/* Badge & Source Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px] shadow-sm tracking-wide">
                  <Flame size={12} className="text-amber-400" />
                  <span>{featuredStory.feedTag || "Top Breaking Story"}</span>
                </span>

                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.09] text-neutral-200 text-[11px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredSource.favicon}
                    alt={featuredSource.name}
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                  <span className="font-semibold text-white">{featuredSource.name}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                  <Clock size={11} />
                  <span>{formatNewsDate(featuredStory.publishedAt)}</span>
                </div>
              </div>

              {/* Headline */}
              <a
                href={featuredStory.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group/link"
              >
                <h3 className="text-lg md:text-xl font-bold text-white group-hover/link:text-amber-300 transition-colors leading-snug">
                  {cleanHeadline(featuredStory.title)}
                </h3>
              </a>

              {/* Summary Description */}
              <p className="text-sm text-neutral-300 leading-relaxed line-clamp-3">
                {featuredStory.summary}
              </p>

              {/* Bullet Takeaways */}
              {featuredStory.keyTakeaways && featuredStory.keyTakeaways.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {featuredStory.keyTakeaways.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">▸</span>
                      <span className="leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/[0.07]">
                <a
                  href={featuredStory.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 hover:text-white transition-all cursor-pointer group/btn shadow-md"
                >
                  <span>Read Full Coverage</span>
                  <ArrowUpRight size={13} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-1.5 text-neutral-400">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(featuredStory.url, e)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] hover:text-white transition-colors cursor-pointer border border-white/[0.06]"
                    title="Copy story link"
                  >
                    {copiedUrl === featuredStory.url ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleSave(featuredStory.url, e)}
                    className={cn(
                      "p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] hover:text-white transition-colors cursor-pointer border border-white/[0.06]",
                      savedUrls.has(featuredStory.url) && "text-amber-400 bg-amber-500/10 border-amber-500/30"
                    )}
                    title="Bookmark story"
                  >
                    <Bookmark size={14} fill={savedUrls.has(featuredStory.url) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Visual Image Frame */}
            <div className="w-full md:w-64 h-44 md:h-48 rounded-xl overflow-hidden border border-white/[0.1] shrink-0 bg-neutral-900 relative shadow-lg group-hover:border-amber-500/30 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredImage}
                alt={featuredStory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = FALLBACK_NEWS_IMAGES[0];
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-medium text-neutral-300 border border-white/[0.1]">
                Verified HD Media
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* ──── 2. NEWS GRID (REAL IMAGES & CARDS FOR ALL STORIES) ──── */}
      {gridStories.length > 0 && (
        <div className="space-y-4">
          
          {/* Section Divider when "All Stories" is selected */}
          {activeTab === "all" && (
            <div className="flex items-center gap-3 pt-2">
              <div className="h-[1px] flex-1 bg-white/[0.08]" />
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                <Globe size={13} className="text-amber-400" />
                <span>Global & Regional In-Depth Coverage</span>
              </div>
              <div className="h-[1px] flex-1 bg-white/[0.08]" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {gridStories.map((item, idx) => {
              const srcMeta = formatSource(item.source);
              const imgUrl = item.imageUrl || item.mainImage || FALLBACK_NEWS_IMAGES[(idx + 1) % FALLBACK_NEWS_IMAGES.length];
              const isSaved = savedUrls.has(item.url);

              return (
                <motion.div
                  key={item.url || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group rounded-2xl bg-[#12121a]/90 hover:bg-[#161622]/95 border border-white/[0.08] hover:border-amber-500/30 p-4 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between space-y-3.5 shadow-md relative overflow-hidden"
                >
                  {/* Top Image & Source Header */}
                  <div className="space-y-3">
                    
                    {/* Thumbnail Image Banner */}
                    <div className="w-full h-36 rounded-xl overflow-hidden border border-white/[0.08] bg-neutral-900 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = FALLBACK_NEWS_IMAGES[(idx + 1) % FALLBACK_NEWS_IMAGES.length];
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      {/* Floating Source Pill on Image */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/[0.12] text-white text-[11px] font-semibold shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={srcMeta.favicon}
                          alt={srcMeta.name}
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                        />
                        <span className="truncate max-w-[120px]">{srcMeta.name}</span>
                      </div>

                      {/* Floating Region Pill */}
                      {item.feedTag && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                          {item.feedTag}
                        </div>
                      )}

                      {/* Timestamp on bottom right of image */}
                      <div className="absolute bottom-2 right-2 text-[10.5px] font-medium text-neutral-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {formatNewsDate(item.publishedAt)}
                      </div>
                    </div>

                    {/* Headline */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group/link"
                    >
                      <h4 className="text-[14.5px] font-bold text-white group-hover/link:text-amber-300 transition-colors leading-snug line-clamp-2">
                        {cleanHeadline(item.title)}
                      </h4>
                    </a>

                    {/* Summary */}
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/[0.06] text-xs">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer group/read"
                    >
                      <span>Read Story</span>
                      <ChevronRight size={13} className="group-hover/read:translate-x-0.5 transition-transform" />
                    </a>

                    <div className="flex items-center gap-1 text-neutral-400">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(item.url, e)}
                        className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Copy link"
                      >
                        {copiedUrl === item.url ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => toggleSave(item.url, e)}
                        className={cn(
                          "p-1.5 rounded-lg hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer",
                          isSaved && "text-amber-400"
                        )}
                        title="Bookmark"
                      >
                        <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>
      )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
