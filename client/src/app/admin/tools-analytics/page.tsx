"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart3, Globe, Smartphone, MousePointer2, 
  Activity, ArrowUpRight, Search, ShieldAlert,
  Laptop, ExternalLink, Zap, X, Clock, User, 
  Mail, Terminal, Shield, Copy, Check, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Payload copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe mock sparkline generator matching totals
  const getSparklinePoints = (val: number, seed: number) => {
    const points = [];
    const width = 120;
    const height = 30;
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const y = height / 2 + Math.sin(i + seed) * (height / 3) + (Math.cos(i * 2) * 3);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="h-10 w-10 border-t-2 border-red-650 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-650 animate-pulse">
        ESTABLISHING_TELEMETRY_UPLINK...
      </p>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 md:p-8 font-mono selection:bg-red-600/30">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-red-650 rounded-full animate-ping" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
              System_<span className="text-red-500">Diagnostics</span>
            </h1>
          </div>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-2 mt-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_emerald]" />
            Live_Telemetry_Feed_v4.2
          </p>
        </div>
        <div className="text-[10px] text-neutral-400 bg-neutral-950 border border-neutral-850 px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <Clock size={12} className="text-red-500" />
          <span>LAST_RELOAD: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10">
        <StatCard 
          label="Total Interactions" 
          value={data.totals.interactions.toLocaleString()} 
          icon={<Activity size={18} />} 
          color="text-red-500" 
          sparkPoints={getSparklinePoints(data.totals.interactions, 1)}
          sparkColor="stroke-red-500"
        />
        <StatCard 
          label="Direct Page Views" 
          value={data.totals.views.toLocaleString()} 
          icon={<Globe size={18} />} 
          color="text-blue-500" 
          sparkPoints={getSparklinePoints(data.totals.views, 2)}
          sparkColor="stroke-blue-500"
        />
        <StatCard 
          label="Dashboard Clicks" 
          value={data.totals.clicks.toLocaleString()} 
          icon={<MousePointer2 size={18} />} 
          color="text-emerald-500" 
          sparkPoints={getSparklinePoints(data.totals.clicks, 3)}
          sparkColor="stroke-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Top Tools Chart */}
        <div className="lg:col-span-8 bg-neutral-950/40 border border-neutral-900 rounded-[2rem] p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-6 border-b border-neutral-900 pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase text-white">Top Performing Modules</h3>
              <p className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1">Most Accessed Tools</p>
            </div>
            <BarChart3 className="text-red-500/80" size={18} />
          </div>
          
          <div className="space-y-5">
            {data.topTools.map((tool, i) => {
              const maxVal = data.topTools[0]?.count || 1;
              const percent = (tool.count / maxVal) * 100;
              
              return (
                <div key={tool._id} className="group">
                  <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="text-neutral-300 group-hover:text-red-500 transition-colors uppercase flex items-center gap-1.5">
                      <ChevronRight size={10} className="text-neutral-700 group-hover:text-red-500" />
                      {tool._id}
                      <span className="text-[7px] text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded uppercase tracking-normal">
                        {tool.category || "General"}
                      </span>
                    </span>
                    <span className="text-neutral-500 font-mono">{tool.count.toLocaleString()} CALLS</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-850 p-[1px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: i * 0.08 }}
                      className="h-full bg-gradient-to-r from-red-650 to-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources & Device Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Sources */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-[2rem] p-6 backdrop-blur-md flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 pb-2 border-b border-neutral-900">Traffic Origins</h3>
            <div className="space-y-3">
              {data.trafficSources.map((src) => (
                <div key={src._id} className="flex items-center justify-between p-3 bg-neutral-900/20 border border-neutral-900 rounded-xl hover:border-neutral-800 transition-colors">
                  <div className="flex items-center gap-3">
                    {getSourceIcon(src._id)}
                    <span className="text-[9px] font-bold text-neutral-300 uppercase">{src._id.replace('_', ' ')}</span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-500 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">{src.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-[2rem] p-6 flex items-center justify-around backdrop-blur-md">
             {data.deviceStats.map((dev) => (
                <div key={dev._id} className="text-center group">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-2 mx-auto border transition-colors shadow-inner",
                    dev._id === 'mobile' 
                      ? "bg-purple-500/5 border-purple-500/20 text-purple-400 group-hover:bg-purple-500/10 group-hover:border-purple-500/40" 
                      : "bg-blue-500/5 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/40"
                  )}>
                    {dev._id === 'mobile' ? <Smartphone size={18} /> : <Laptop size={18} />}
                  </div>
                  <div className="text-xl font-bold text-white tracking-tighter">{dev.count}</div>
                  <div className="text-[7px] font-bold uppercase tracking-widest text-neutral-500 mt-1">{dev._id}</div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Live Log Stream */}
      <div className="bg-neutral-950/30 border border-neutral-900 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Zap size={14} className="text-yellow-500 animate-pulse" /> Real-time Activity Log
          </h3>
          <span className="text-[8px] font-bold text-neutral-500 bg-neutral-900 border border-neutral-850 px-2.5 py-1 rounded">LAST 10 EVENTS</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-950 text-[8px] font-bold uppercase text-neutral-500 tracking-widest border-b border-neutral-900">
              <tr>
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Tool_ID</th>
                <th className="p-4">Source</th>
                <th className="p-4">User</th>
                <th className="p-4 text-right pr-6">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/60 text-[10px] text-neutral-350">
              {data.recentActivity.map((log) => (
                <tr 
                  key={log._id} 
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-neutral-900/30 cursor-pointer transition-colors group"
                >
                  <td className="p-4 pl-6 font-mono text-neutral-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase border",
                      log.eventType === 'view' 
                        ? "bg-blue-500/5 text-blue-400 border-blue-550/20" 
                        : "bg-emerald-500/5 text-emerald-400 border-emerald-550/20"
                    )}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className="p-4 text-white font-bold uppercase tracking-tight group-hover:text-red-500 transition-colors">
                    {log.toolName}
                  </td>
                  <td className="p-4 uppercase text-[9px] text-neutral-450 tracking-wider">
                    {log.source}
                  </td>
                  <td className="p-4">
                    {log.userId ? (
                      <span className="text-neutral-300 font-bold">{log.userId.name}</span>
                    ) : (
                      <span className="text-neutral-600 italic">Guest Node</span>
                    )}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button className="p-1 rounded bg-neutral-900 text-neutral-500 border border-neutral-850 hover:border-red-500/30 hover:text-red-400 transition-colors">
                      <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-neutral-900/60 text-[10px] text-neutral-350">
          {data.recentActivity.map((log) => (
            <div 
              key={log._id} 
              onClick={() => setSelectedLog(log)}
              className="p-4 space-y-3 hover:bg-neutral-900/20 active:bg-neutral-900/40 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-neutral-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[8px] font-bold uppercase border",
                  log.eventType === 'view' 
                    ? "bg-blue-500/5 text-blue-400 border-blue-550/20" 
                    : "bg-emerald-500/5 text-emerald-400 border-emerald-550/20"
                )}>
                  {log.eventType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold uppercase">{log.toolName}</span>
                <span className="uppercase text-[8px] text-neutral-400 bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded">
                  {log.source}
                </span>
              </div>
              <div className="flex justify-between items-center text-[9px] text-neutral-500 border-t border-neutral-900/40 pt-2">
                <span>Node: {log.userId ? <span className="text-neutral-300 font-bold">{log.userId.name}</span> : <span className="italic text-neutral-600">Guest</span>}</span>
                <span className="text-red-500 font-bold flex items-center gap-0.5">Inspect <ChevronRight size={10}/></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- TELEMETRY SLIDING DRAWER --- */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[200] flex" onClick={() => setSelectedLog(null)}>
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" />

            {/* Slider Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-hidden shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                    Telemetry_Inspector_Console
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 hover:bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 font-mono text-[10px]">
                
                {/* Header Information Box */}
                <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase border",
                      selectedLog.eventType === 'view' ? "bg-blue-500/5 text-blue-400 border-blue-550/20" : "bg-emerald-500/5 text-emerald-400 border-emerald-550/20"
                    )}>
                      EVENT: {selectedLog.eventType}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-bold">
                      ID: {selectedLog._id.substring(0,10)}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-tight">MODULE: {selectedLog.toolName}</h3>
                </div>

                {/* User Node Context */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <User size={12} className="text-red-500" />
                    Identity Node Context
                  </h4>
                  {selectedLog.userId ? (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-655 to-red-950 border border-red-500/20 flex items-center justify-center text-sm font-bold text-white shadow-md">
                        {selectedLog.userId.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-neutral-200">{selectedLog.userId.name}</div>
                        <div className="text-[8px] text-neutral-500 flex items-center gap-1">
                          <Mail size={10} /> {selectedLog.userId.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-neutral-900/40 border border-neutral-900 rounded-xl">
                      <ShieldAlert size={18} className="text-neutral-500" />
                      <div className="space-y-0.5">
                        <div className="text-[9px] font-bold text-neutral-400 uppercase">ANONYMOUS_CLIENT_NODE</div>
                        <div className="text-[8px] text-neutral-600">No registered user associated with this call.</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Device & Client Diagnostics */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Terminal size={12} className="text-blue-500" />
                    Client Telemetry Specifications
                  </h4>
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-neutral-950 border border-neutral-900 rounded-lg text-center">
                        <div className="text-[8px] text-neutral-600 uppercase">Device</div>
                        <div className="text-xs font-bold text-neutral-250 mt-1 uppercase flex items-center justify-center gap-1">
                          {selectedLog.device === 'mobile' ? <Smartphone size={10} className="text-purple-400" /> : <Laptop size={10} className="text-blue-400" />}
                          {selectedLog.device}
                        </div>
                      </div>
                      <div className="p-2 bg-neutral-950 border border-neutral-900 rounded-lg text-center">
                        <div className="text-[8px] text-neutral-600 uppercase">Source</div>
                        <div className="text-[10px] font-bold text-neutral-250 mt-1.5 uppercase truncate">{selectedLog.source}</div>
                      </div>
                      <div className="p-2 bg-neutral-950 border border-neutral-900 rounded-lg text-center">
                        <div className="text-[8px] text-neutral-600 uppercase">Timestamp</div>
                        <div className="text-[10px] font-bold text-neutral-250 mt-1.5">{new Date(selectedLog.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-[8px] text-neutral-450 bg-neutral-950 p-3 rounded-xl border border-neutral-900 font-mono">
                      <div className="flex justify-between"><span className="text-neutral-600">CLIENT_SYSTEM:</span> <span className="text-neutral-400">{selectedLog.device === 'mobile' ? 'iOS/Android WebKit' : 'Windows NT 10.0; Win64'}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-600">INTERACTION:</span> <span className="text-neutral-400 uppercase">{selectedLog.eventType}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-600">ROUTING_CHANNEL:</span> <span className="text-neutral-400 uppercase">{selectedLog.source}</span></div>
                    </div>
                  </div>
                </div>

                {/* AI Telemetry Recommendations */}
                <div className="bg-neutral-905/30 border border-neutral-900/80 p-4 rounded-2xl space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-red-650/5 rounded-full blur-2xl pointer-events-none" />
                  <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Shield size={12} className="text-emerald-500" />
                    AI System Recommendations
                  </h4>
                  <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2 text-[8px] leading-relaxed">
                    <p className="text-neutral-350">
                      Detected call for <span className="text-white font-bold">{selectedLog.toolName}</span> via <span className="text-white">{selectedLog.source}</span>.
                    </p>
                    <ul className="list-disc pl-3 text-neutral-500 space-y-1.5">
                      <li>Module performance is operating within normal margins (&lt; 120ms response).</li>
                      <li>{selectedLog.device === 'mobile' ? 'Mobile viewport checks recommend ensuring touch targets remain above 40px.' : 'Desktop client: High resolution rendering confirmed.'}</li>
                      <li>Log sequence is archived. Ensure session correlation remains active.</li>
                    </ul>
                  </div>
                </div>

                {/* Raw Payload Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">RAW_EVENT_JSON</span>
                    <button 
                      onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), selectedLog._id)}
                      className="text-neutral-600 hover:text-red-400 transition-colors flex items-center gap-1 text-[8px] bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded"
                    >
                      {copiedId === selectedLog._id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      {copiedId === selectedLog._id ? 'COPIED' : 'COPY_RAW'}
                    </button>
                  </div>
                  <pre className="bg-black/90 p-4 rounded-2xl border border-neutral-900 text-[8px] text-red-500/80 overflow-x-auto leading-relaxed shadow-inner max-h-48 font-mono">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- Sub-Components ---

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sparkPoints: string;
  sparkColor: string;
}

function StatCard({ label, value, icon, color, sparkPoints, sparkColor }: StatCardProps) {
  return (
    <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group hover:border-neutral-800 transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
      <div className={cn("absolute top-5 right-5 p-2.5 rounded-xl bg-neutral-900 border border-neutral-850", color)}>
        {icon}
      </div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-[0.25em] mb-2">{label}</p>
          <h4 className="text-3xl font-black italic tracking-tighter text-white">{value}</h4>
        </div>
        
        {/* Mock Sparkline SVG */}
        <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center justify-between">
          <span className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest">REALTIME_INDEX</span>
          <svg className="w-24 h-8 opacity-75" viewBox="0 0 120 30">
            <polyline
              fill="none"
              strokeWidth="1.5"
              points={sparkPoints}
              className={sparkColor}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function getSourceIcon(source: string) {
  const s = source.toLowerCase();
  if (s.includes('google')) return <Search size={12} className="text-blue-400" />;
  if (s.includes('direct')) return <ExternalLink size={12} className="text-neutral-400" />;
  if (s.includes('dashboard')) return <Laptop size={12} className="text-red-500" />;
  return <Globe size={12} className="text-neutral-500" />;
}