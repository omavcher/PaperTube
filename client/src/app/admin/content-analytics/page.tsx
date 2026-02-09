"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Trophy, 
  Eye, 
  Share2,
  PieChart,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";

// --- TYPES BASED ON YOUR API RESPONSE ---
interface Overview {
  totalViews: number;
  totalShares: number;
  avgReadTime: string;
  conversionRate: string; // Available but hidden in UI
}

interface TopBlog {
  _id: string;
  title: string;
  views: number;
  shares: number;
  conversion: string;
}

interface TopStory {
  _id: string;
  name: string;
  rank: string;
  views: number;
  shares: number;
  conversion: string;
}

interface AnalyticsData {
  overview: Overview;
  topBlogs: TopBlog[];
  topStories: TopStory[];
  distribution: {
    blogPercent: number;
    storyPercent: number;
  };
}

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState<"overview" | "blogs" | "stories">("overview");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        
        // Pass the selected time range to the backend
        const response = await api.get(`/admin/content-analytics?range=${timeRange}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Analytics Sync Failed", error);
        toast.error("Failed to sync telemetry data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]); // Re-fetch when timeRange changes

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans pb-20 selection:bg-red-900/50">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
            Neural <span className="text-red-600">Analytics</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">
            Real-Time Data Stream
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
            {["overview", "blogs", "stories"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                  activeTab === tab ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
            {["24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                  timeRange === range ? "bg-red-600 text-white shadow-lg" : "text-neutral-500 hover:text-white"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          
        </div>
      </header>

      {/* --- KPI CARDS (Conversion Hidden) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard 
          label="Total Traffic" 
          value={data.overview.totalViews.toLocaleString()} 
          change="LIVE" 
          trend="up" 
          icon={Eye} 
          delay={0} 
        />
        <StatsCard 
          label="Avg. Read Time" 
          value={data.overview.avgReadTime} 
          change="vs. 3m avg" 
          trend="up" 
          icon={Clock} 
          delay={0.1} 
        />
        <StatsCard 
          label="Social Shares" 
          value={data.overview.totalShares.toLocaleString()} 
          change="Active" 
          trend="up" 
          icon={Share2} 
          delay={0.2} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- MAIN CONTENT AREA (Detailed Tables) --- */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 gap-6">
            
            {/* Top Blogs Table */}
            {(activeTab === "all" || activeTab === "overview" || activeTab === "blogs") && (
              <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" /> Top Performing Blogs
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02]">
                      <tr>
                        <th className="p-4 text-[10px] font-black uppercase text-neutral-500">Title</th>
                        <th className="p-4 text-[10px] font-black uppercase text-neutral-500 text-right">Views</th>
                        <th className="p-4 text-[10px] font-black uppercase text-neutral-500 text-right">Shares</th>
                        <th className="p-4 text-[10px] font-black uppercase text-neutral-500 text-right">Perf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.topBlogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-4 text-xs font-bold text-white max-w-[200px] truncate">{blog.title}</td>
                          <td className="p-4 text-xs font-mono text-neutral-400 text-right">{blog.views}</td>
                          <td className="p-4 text-xs font-mono text-blue-400 text-right">{blog.shares}</td>
                          <td className="p-4 text-right">
                            <div className="w-24 h-1.5 bg-white/10 rounded-full ml-auto overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ width: `${data.topBlogs[0].views > 0 ? (blog.views / data.topBlogs[0].views) * 100 : 0}%` }} 
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {data.topBlogs.length === 0 && (
                        <tr><td colSpan={4} className="p-6 text-center text-xs text-neutral-500 italic">No blog data available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Stories Table */}
            {(activeTab === "all" || activeTab === "overview" || activeTab === "stories") && (
              <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                    <Trophy size={14} className="text-yellow-500" /> Top Success Stories
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02]">
                      <tr>
                        <th className="p-4 text-[10px] font-black uppercase text-neutral-500">Candidate</th>
                        <th className="p-4 text-[10px] font-black uppercase text-neutral-500 text-right">Views</th>
                        <th className="p-4 text-[10px] font-black uppercase text-neutral-500 text-right">Shares</th>
                        <th className="p-4 text-[10px] font-black uppercase text-neutral-500 text-right">Perf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.topStories.map((story) => (
                        <tr key={story._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-4 text-xs font-bold text-white max-w-[200px] truncate">
                            {story.name} 
                            <span className="text-neutral-500 ml-1 font-medium">#{story.rank}</span>
                          </td>
                          <td className="p-4 text-xs font-mono text-neutral-400 text-right">{story.views}</td>
                          <td className="p-4 text-xs font-mono text-yellow-500 text-right">{story.shares}</td>
                          <td className="p-4 text-right">
                            <div className="w-24 h-1.5 bg-white/10 rounded-full ml-auto overflow-hidden">
                              <div 
                                className="h-full bg-yellow-600 rounded-full" 
                                style={{ width: `${data.topStories[0]?.views > 0 ? (story.views / data.topStories[0].views) * 100 : 0}%` }} 
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {data.topStories.length === 0 && (
                        <tr><td colSpan={4} className="p-6 text-center text-xs text-neutral-500 italic">No story data available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* --- RIGHT SIDEBAR (Insights) --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Content Breakdown Pie */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-6 flex items-center gap-2">
              <PieChart size={14} className="text-purple-500" /> Content Ratio
            </h3>
            
            <div className="relative h-48 w-48 mx-auto mb-6">
              {/* Dynamic Conic Gradient */}
              <div 
                className="w-full h-full rounded-full transition-all duration-1000" 
                style={{ background: `conic-gradient(#DC2626 0% ${data.distribution.storyPercent}%, #2563EB ${data.distribution.storyPercent}% 100%)` }}
              ></div>
              <div className="absolute inset-4 bg-[#0a0a0a] rounded-full flex items-center justify-center flex-col shadow-inner">
                <span className="text-3xl font-black text-white">{data.distribution.storyPercent}%</span>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Stories</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                  <div className="w-2 h-2 rounded-full bg-red-600" /> Success Stories
                </span>
                <span className="text-xs font-mono text-white font-bold">{data.distribution.storyPercent}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                  <div className="w-2 h-2 rounded-full bg-blue-600" /> Tech Blogs
                </span>
                <span className="text-xs font-mono text-white font-bold">{data.distribution.blogPercent}%</span>
              </div>
            </div>
          </div>

          {/* Engagement Funnel (Modified: Views -> Shares) */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-green-500" /> Engagement Funnel
            </h3>
            
            <div className="space-y-2">
              <FunnelStep label="Page Views" value={data.overview.totalViews} percent={100} color="bg-white/10" />
              <div className="flex justify-center"><div className="w-[1px] h-3 bg-white/10" /></div>
              
              {/* Estimated Reads (60% of views) */}
              <FunnelStep label="Reads (>1min)" value={Math.floor(data.overview.totalViews * 0.6)} percent={60} color="bg-white/20" />
              <div className="flex justify-center"><div className="w-[1px] h-3 bg-white/10" /></div>
              
              <FunnelStep 
                label="Shares" 
                value={data.overview.totalShares} 
                percent={data.overview.totalViews > 0 ? Math.round((data.overview.totalShares / data.overview.totalViews) * 100) : 0} 
                color="bg-red-600/40" 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const StatsCard = ({ label, value, change, trend, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-red-600/30 transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg text-neutral-400 group-hover:text-white transition-colors">
        <Icon size={18} />
      </div>
      <span className={cn(
        "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
        trend === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
      )}>
        {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}
      </span>
    </div>
    <h3 className="text-2xl font-black text-white">{value}</h3>
    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">{label}</p>
    
    <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
      <Icon size={80} />
    </div>
  </motion.div>
);

const FunnelStep = ({ label, value, percent, color }: any) => (
  <div className="relative h-12 flex items-center justify-between px-4 rounded-xl overflow-hidden bg-[#111] border border-white/5">
    <div 
      className={cn("absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out", color)} 
      style={{ width: `${percent}%` }} 
    />
    <span className="relative z-10 text-[10px] font-bold uppercase text-neutral-300 drop-shadow-md">{label}</span>
    <span className="relative z-10 text-xs font-black text-white drop-shadow-md">{value.toLocaleString()} <span className="text-[9px] text-white/50 font-normal ml-1">({percent}%)</span></span>
  </div>
);