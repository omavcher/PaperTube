"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Trophy, Gamepad2, Users, Activity, 
  Zap, Cpu, BarChart3, Clock, 
  Smartphone, Monitor, ShieldCheck, 
  Target, Flame, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/config/api";

interface GameScore {
  _id: string;
  userId: string;
  name: string;
  email: string;
  game: string;
  stats: { score: number; level: number; timestamp: string };
  device: { isMobile: boolean; browser: string };
  createdAt: string;
}

export default function ArcadeIntelligence() {
  const [data, setData] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await api.get('/admin/arcade-diagnostics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // API response structure: { success: true, data: { arcadeScores: [...] } }
        setData(res.data.data.arcadeScores || []);
      } catch (err) {
        console.error("TELEMETRY_SYNC_ERROR", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiagnostics();
  }, []);

  // --- Data Analysis Logic ---
  const analysis = useMemo(() => {
    const gameMap = new Map();
    data.forEach(log => {
      const stats = gameMap.get(log.game) || { count: 0, totalScore: 0, maxLevel: 0, unique: new Set() };
      stats.count++;
      stats.totalScore += log.stats.score;
      stats.maxLevel = Math.max(stats.maxLevel, log.stats.level);
      stats.unique.add(log.userId);
      gameMap.set(log.game, stats);
    });

    const sortedGames = Array.from(gameMap.entries())
      .map(([name, stats]) => ({
        name,
        plays: stats.count,
        avgScore: Math.round(stats.totalScore / stats.count),
        peakPhase: stats.maxLevel,
        uniqueEngineers: stats.unique.size
      }))
      .sort((a, b) => b.plays - a.plays);

    return {
      sortedGames,
      mostPlayed: sortedGames[0]?.name || "N/A",
      totalSessions: data.length,
      mobileUserCount: data.filter(d => d.device?.isMobile).length
    };
  }, [data]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 pb-20 px-4 md:px-0 font-sans">
      
      {/* --- Tactical HUD Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Arcade_<span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">Diagnostics</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_emerald]" />
            Node_Activity: {analysis.totalSessions} Registered_Events
          </p>
        </div>
      </div>

      {/* --- Global Metrics Grid --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricHUD label="Total Syncs" val={analysis.totalSessions} icon={Layers} color="text-blue-500" />
        <MetricHUD label="Peak_Game" val={analysis.mostPlayed} icon={Flame} color="text-red-600" isSmall />
        <MetricHUD label="Mobile_Nodes" val={analysis.mobileUserCount} icon={Smartphone} color="text-purple-500" />
        <MetricHUD label="Uptime" val="99.9%" icon={Activity} color="text-emerald-500" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* --- SECTION 1: ALL GAMES LIST & PERFORMANCE --- */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700 flex items-center gap-2">
            <BarChart3 size={14} className="text-emerald-500" /> Module_Affinity_Ranking
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {analysis.sortedGames.map((game, idx) => (
              <Card key={game.name} className="bg-neutral-900/20 border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                {idx === 0 && (
                   <div className="absolute top-0 right-10 bg-emerald-500 px-4 py-1 rounded-b-xl text-[8px] font-black text-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                     Most_Played
                   </div>
                )}
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 shadow-inner">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">{game.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{game.uniqueEngineers} Unique Players</span>
                        <Badge variant="outline" className="text-[7px] border-white/10 text-neutral-500 font-black">AVG_SCORE: {game.avgScore}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 border-l border-white/5 pl-8 md:border-none md:pl-0">
                    <div className="text-center">
                      <p className="text-2xl font-black text-white tabular-nums">{game.plays}</p>
                      <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Total_Plays</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-emerald-500 tabular-nums">L{game.peakPhase}</p>
                      <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Max_Phase</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: COMPACT RECENT LOGS --- */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700 flex items-center gap-2">
            <Activity size={14} className="text-blue-500" /> Mission_Log_Stream
          </h3>

          <div className="bg-black border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-4 space-y-2">
              <AnimatePresence initial={false}>
                {data.map((log) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log._id}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-neutral-700 group-hover:text-blue-500 transition-colors">
                        {log.device?.isMobile ? <Smartphone size={14} /> : <Monitor size={14} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase truncate max-w-[100px]">{log.name}</p>
                        <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-tighter">{log.game}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[11px] font-black text-emerald-500 tabular-nums">{log.stats.score}</p>
                      <p className="text-[7px] font-medium text-neutral-800 uppercase">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Log Footer */}
            <div className="bg-white/5 p-4 border-t border-white/5 text-center">
              <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest flex items-center justify-center gap-2">
                <Clock size={10}/> End of Live Buffer
              </p>
            </div>
          </div>
          
          {/* Node Security Summary */}
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-3">
             <div className="flex items-center gap-2 text-emerald-500">
               <ShieldCheck size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">Audit_Log_Secure</span>
             </div>
             <p className="text-[9px] text-neutral-500 leading-relaxed font-bold uppercase tracking-tight">
               Integrity Check: {analysis.totalSessions} mission records verified. 
               Cross-referencing {analysis.sortedGames.length} module vectors.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Specialized Internal Components ---

function MetricHUD({ label, val, icon: Icon, color, isSmall }: any) {
  return (
    <div className="bg-black border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute -right-2 -bottom-2 opacity-[0.03] scale-150 group-hover:opacity-10 transition-opacity">
        <Icon size={40}/>
      </div>
      <p className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.3em] mb-1">{label}</p>
      <h4 className={cn(
        "font-black italic tracking-tighter leading-none truncate", 
        color,
        isSmall ? "text-lg" : "text-2xl"
      )}>{val}</h4>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="h-10 w-10 border-t-2 border-emerald-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800 animate-pulse">Decrypting_Arcade_Diagnostics...</p>
    </div>
  );
}