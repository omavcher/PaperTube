"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  ArrowLeft, Download, Terminal, Cpu, Activity, 
  ShieldCheck, Table, Filter, Layers, Sparkles, 
  Hash, Zap, Trophy, ShieldAlert, MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { LoginDialog } from "@/components/LoginDialog"; // Assumed path

// --- Logic: SQL Metadata Extraction ---
const parseSQL = (query: string) => {
  const tables = query.match(/FROM\s+(\w+)|JOIN\s+(\w+)/gi)?.map(t => t.split(/\s+/)[1]) || [];
  const columns = query.match(/SELECT\s+(.+?)\s+FROM/i)?.[1].split(",").map(c => c.trim()) || ["*"];
  const conditions = query.match(/WHERE\s+(.+?)($|GROUP|ORDER|LIMIT)/i)?.[1] || null;
  const joins = query.match(/JOIN/gi)?.length || 0;

  return { tables: [...new Set(tables)], columns, conditions, joins };
};

export default function SQLArchitectPage() {
  const [sql, setSql] = useState(`SELECT u.name, o.total, o.date
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.total > 500
ORDER BY o.date DESC;`);
  
  const [metadata, setMetadata] = useState(parseSQL(sql));
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setMetadata(parseSQL(sql));
  }, [sql]);

  const handleDownload = useCallback(async () => {
    if (!exportRef.current) return;
    const loadingToast = toast.loading("Synthesizing Neural Blueprint...");
    try {
      const dataUrl = await toPng(exportRef.current, { 
        pixelRatio: 3, 
        backgroundColor: '#000',
        cacheBust: true 
      });
      const link = document.createElement("a");
      link.download = `PaperTube-SQL-Architect.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Blueprint Exported to Foundry", { id: loadingToast });
    } catch (err) {
      toast.error("Handshake Failed", { id: loadingToast });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans pb-10">
      
      {/* 🔴 PSYCHOLOGY TRIGGER: Social Proof Pulse */}
      <div className="bg-red-600 py-1.5 px-4 text-center overflow-hidden">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white flex justify-center items-center gap-3">
          <Trophy size={10} /> Live: 1,242 Schematics generated in the last 24h
        </div>
      </div>

      <header className="sticky top-0 z-[100] border-b border-white/5 bg-black/80 backdrop-blur-2xl px-4 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl transition-all">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="hidden xs:flex flex-col">
              <h1 className="text-xs lg:text-sm font-black uppercase italic tracking-tighter">SQL Architect</h1>
              <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-1">
                <Activity size={8} className="text-blue-500" /> Mapping Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{user.username}</span>
              </div>
            ) : (
              <Button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-transparent hover:bg-white/5 text-white border border-white/10 text-[9px] font-black uppercase italic rounded-xl px-4 h-10 transition-all hidden sm:flex"
              >
                Sync Neural ID
              </Button>
            )}
            <Button 
              onClick={handleDownload} 
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-4 lg:px-8 h-10 lg:h-12 shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-90 transition-all text-[10px] lg:text-xs"
            >
              <Download size={16} className="mr-2" /> <span className="hidden sm:inline">Export</span> Blueprint
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* --- LEFT: INPUT TERMINAL --- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 flex items-center gap-2">
                <Terminal size={12} className="text-red-600" /> Input Stream
              </span>
              <Badge variant="outline" className="border-white/5 text-blue-500 font-mono text-[8px] tracking-widest">UTF-8 / SQL</Badge>
            </div>
            
            <Card className="bg-[#050505] border-white/5 rounded-[2.5rem] p-1 relative overflow-hidden group">
               <div className="absolute -inset-0.5 bg-blue-600/10 blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700" />
               <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                spellCheck={false}
                className="relative w-full h-[400px] lg:h-[550px] bg-black border-transparent rounded-[2.4rem] p-8 lg:p-10 font-mono text-xs lg:text-sm text-blue-100/80 focus:outline-none transition-all resize-none shadow-2xl no-scrollbar leading-relaxed"
                placeholder="Enter SQL Query for mapping..."
              />
            </Card>

            {/* 🔴 LOSS AVERSION TRIGGER */}
            {!user && (
               <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] flex gap-4 backdrop-blur-sm">
                  <ShieldAlert className="text-red-600 shrink-0 animate-pulse" size={20} />
                  <p className="text-[10px] font-medium text-zinc-400 leading-relaxed uppercase tracking-tight">
                    <span className="text-red-500 font-black italic">Unsynced Session Detected:</span> Your architectural preferences will be purged on exit. <span className="text-white underline cursor-pointer font-bold" onClick={() => setIsLoginOpen(true)}>Secure Identity</span>
                  </p>
               </div>
            )}
          </div>

          {/* --- RIGHT: ARCHITECTURAL VIEWPORT --- */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-800 italic flex items-center gap-2">
                <MousePointer2 size={10} /> Neural Schema Stage
              </span>
              <div className="flex gap-2">
                 <Badge variant="outline" className="border-white/5 text-neutral-600 text-[8px] font-black uppercase">{metadata.joins} Joins</Badge>
                 <Badge variant="outline" className="border-white/5 text-neutral-600 text-[8px] font-black uppercase">{metadata.tables.length} Tables</Badge>
              </div>
            </div>

            <div 
              ref={exportRef}
              className="relative rounded-[3rem] bg-[#000000] border border-white/10 p-10 lg:p-16 flex flex-col items-center justify-center min-h-[500px] lg:min-h-[600px] overflow-hidden shadow-2xl transition-all duration-1000"
            >
              {/* Schematic Background  */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] bg-[size:25px_25px]" />
              
              <div className="relative z-10 w-full max-w-2xl space-y-12">
                {/* Visual Mapping Logic
 */}
                <div className="flex flex-wrap justify-around items-start gap-8">
                  {metadata.tables.length > 0 ? metadata.tables.map((table, i) => (
                    <motion.div 
                      key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="p-5 lg:p-6 bg-neutral-950 border border-white/10 rounded-2xl flex flex-col items-center gap-3 w-36 lg:w-40 shadow-2xl relative group/table"
                    >
                      <Table className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{table}</span>
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-10 w-px bg-gradient-to-b from-blue-500/40 to-transparent" />
                    </motion.div>
                  )) : (
                    <div className="text-neutral-700 uppercase font-black text-[10px] tracking-widest italic animate-pulse">Initializing Data Stream...</div>
                  )}
                </div>

                <div className="flex justify-center">
                   <div className="p-8 lg:p-10 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center relative shadow-[0_0_50px_rgba(220,38,38,0.1)]">
                      <Cpu size={36} className="text-red-600 animate-pulse" />
                      <div className="absolute -top-1 -right-1">
                        <Sparkles size={18} className="text-red-400 animate-bounce" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {metadata.columns.slice(0, 9).map((col, i) => (
                    <motion.div 
                      key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-2 group/col hover:bg-white/[0.08] transition-all"
                    >
                      <Hash size={12} className="text-neutral-600 group-hover:text-blue-500 transition-colors" />
                      <span className="text-[9px] font-bold text-neutral-400 truncate uppercase tracking-tight">{col}</span>
                    </motion.div>
                  ))}
                  {metadata.columns.length > 9 && (
                    <div className="p-3 bg-transparent border border-dashed border-white/5 rounded-xl flex items-center justify-center">
                        <span className="text-[8px] font-black text-neutral-600">+{metadata.columns.length - 9} MORE</span>
                    </div>
                  )}
                </div>

                {metadata.conditions && (
                  <div className="mt-8 p-5 bg-red-600/5 border border-red-600/20 rounded-2xl flex items-center gap-5 backdrop-blur-xl">
                     <Filter size={18} className="text-red-600 shrink-0" />
                     <p className="text-[10px] font-mono text-red-200/50 leading-relaxed italic truncate">{metadata.conditions}</p>
                  </div>
                )}
              </div>

              {/* Watermark */}
              <div className="absolute bottom-8 right-10 flex items-center gap-2 select-none grayscale opacity-30">
                <div className="h-4 w-px bg-white/20" />
                <span className="text-[12px] font-black tracking-[0.3em] uppercase italic text-white">
                  Paper<span className="text-red-600">Tube</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Metrics */}
      <section className="container mx-auto px-4 pb-24 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-16">
          <Metric icon={<ShieldCheck size={20} className="text-emerald-500" />} title="Isolated Processing" desc="No database connection required. Queries are analyzed locally." />
          <Metric icon={<Layers size={20} className="text-blue-500" />} title="Relational Mapping" desc="Automatically identifies table associations and select paths." />
          <Metric icon={<Zap size={20} className="text-red-500" />} title="Rapid Prototyping" desc="Visualize complex query architectures instantly for review." />
        </div>
      </section>

      <Footer />
      
      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={(t, info) => {
          const u = { username: info.name.split(' ')[0], picture: info.picture };
          localStorage.setItem("user", JSON.stringify(u));
          setUser(u);
          setIsLoginOpen(false);
          toast.success("Neural Identity Verified");
        }} 
      />
    </div>
  );
}

function Metric({ icon, title, desc }: any) {
  return (
    <div className="space-y-3 group cursor-default">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">{icon}</div>
      <h4 className="text-xs font-black uppercase italic tracking-widest text-white">{title}</h4>
      <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}