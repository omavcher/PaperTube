"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart3, Globe, Smartphone, MousePointer2, 
  Activity, ArrowUpRight, Search, ShieldAlert,
  Laptop, ExternalLink, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";

// Types based on Controller Response
interface AnalyticsData {
  totals: {
    interactions: number;
    views: number;
    clicks: number;
  };
  topTools: Array<{ _id: string; count: number; category: string }>;
  trafficSources: Array<{ _id: string; count: number }>;
  deviceStats: Array<{ _id: string; count: number }>;
  recentActivity: Array<{
    _id: string;
    toolName: string;
    eventType: string;
    source: string;
    device: string;
    timestamp: string;
    userId?: { name: string; email: string };
  }>;
}

export default function ToolAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await api.get('/admin/analytics/tools', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to sync analytics stream");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-mono text-sm animate-pulse">
      ESTABLISHING_UPLINK...
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans selection:bg-red-600/30">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
          System_<span className="text-red-600">Diagnostics</span>
        </h1>
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2 mt-2">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_emerald]" />
          Live_Telemetry_Feed
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          label="Total Interactions" 
          value={data.totals.interactions.toLocaleString()} 
          icon={<Activity size={20} />} 
          color="text-red-500" 
        />
        <StatCard 
          label="Direct Page Views" 
          value={data.totals.views.toLocaleString()} 
          icon={<Globe size={20} />} 
          color="text-blue-500" 
        />
        <StatCard 
          label="Dashboard Clicks" 
          value={data.totals.clicks.toLocaleString()} 
          icon={<MousePointer2 size={20} />} 
          color="text-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Top Tools Chart */}
        <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black italic uppercase text-white">Top Performing Modules</h3>
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Most Accessed Tools</p>
            </div>
            <BarChart3 className="text-neutral-700" size={24} />
          </div>
          
          <div className="space-y-4">
            {data.topTools.map((tool, i) => {
              const maxVal = data.topTools[0].count;
              const percent = (tool.count / maxVal) * 100;
              
              return (
                <div key={tool._id} className="group">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white group-hover:text-red-500 transition-colors">{tool._id}</span>
                    <span className="text-neutral-500">{tool.count}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-red-600 to-red-900 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources & Device Stats */}
        <div className="grid grid-cols-1 gap-6">
          {/* Sources */}
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-4">Traffic Origins</h3>
            <div className="space-y-3">
              {data.trafficSources.map((src) => (
                <div key={src._id} className="flex items-center justify-between p-3 bg-black border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    {getSourceIcon(src._id)}
                    <span className="text-xs font-bold text-white uppercase">{src._id.replace('_', ' ')}</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">{src.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 flex items-center justify-around">
             {data.deviceStats.map((dev) => (
               <div key={dev._id} className="text-center">
                 <div className={cn(
                   "w-12 h-12 rounded-2xl flex items-center justify-center mb-2 mx-auto border border-white/10",
                   dev._id === 'mobile' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                 )}>
                   {dev._id === 'mobile' ? <Smartphone size={20} /> : <Laptop size={20} />}
                 </div>
                 <div className="text-2xl font-black italic text-white">{dev.count}</div>
                 <div className="text-[8px] font-bold uppercase tracking-widest text-neutral-600">{dev._id}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Live Log Stream */}
      <div className="bg-black border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Zap size={14} className="text-yellow-500" /> Real-time Activity Log
          </h3>
          <span className="text-[9px] font-bold text-neutral-600 bg-white/5 px-2 py-1 rounded">LAST 10 EVENTS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[9px] font-black uppercase text-neutral-500 tracking-widest">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Tool_ID</th>
                <th className="p-4">Source</th>
                <th className="p-4">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium text-neutral-300">
              {data.recentActivity.map((log) => (
                <tr key={log._id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-mono text-neutral-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[9px] font-black uppercase",
                      log.eventType === 'view' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className="p-4 text-white font-bold">{log.toolName}</td>
                  <td className="p-4 uppercase text-[10px] tracking-wide">{log.source}</td>
                  <td className="p-4">
                    {log.userId ? (
                      <span className="text-white">{log.userId.name}</span>
                    ) : (
                      <span className="text-neutral-600 italic">Anonymous</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// --- Sub-Components ---

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:bg-neutral-900/50 transition-colors">
      <div className={cn("absolute top-6 right-6 p-3 rounded-xl bg-white/5", color)}>{icon}</div>
      <div className="relative z-10">
        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-2">{label}</p>
        <h4 className="text-4xl font-black italic tracking-tighter text-white">{value}</h4>
      </div>
    </div>
  );
}

function getSourceIcon(source: string) {
  if (source.includes('google')) return <Search size={14} className="text-blue-400" />;
  if (source.includes('direct')) return <ExternalLink size={14} className="text-neutral-400" />;
  if (source.includes('dashboard')) return <Laptop size={14} className="text-red-500" />;
  return <Globe size={14} className="text-neutral-500" />;
}