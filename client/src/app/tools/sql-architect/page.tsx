"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  ArrowLeft, Download, Database, Layout, 
  Terminal, Cpu, Activity, Share2, 
  ShieldCheck, ArrowRight, Table, Filter, 
  Layers, Sparkles, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";

// --- Logic: Basic SQL Metadata Parser ---
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
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMetadata(parseSQL(sql));
  }, [sql]);

  const handleDownload = useCallback(async () => {
    if (exportRef.current === null) return;
    const loadingToast = toast.loading("Rendering Schema Artifact...");
    try {
      const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#000' });
      const link = document.createElement("a");
      link.download = `PaperTube-SQL-Blueprint.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Blueprint Exported", { id: loadingToast });
    } catch (err) {
      toast.error("Render Failed", { id: loadingToast });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans">
      {/* Background Matrix */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <header className="relative z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <h1 className="text-sm font-black uppercase italic tracking-widest text-white">SQL Blueprint <span className="text-red-600">Architect</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Relational Mapper v1.2</span>
              </div>
            </div>
          </div>
          <Button onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <Download size={18} className="mr-2" /> Export Schematic
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* --- Query Input Terminal --- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 flex items-center gap-2">
                <Terminal size={12} className="text-red-600" /> Source Query
              </span>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-blue-600/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-700 rounded-[2.5rem]" />
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                spellCheck={false}
                className="relative w-full h-[500px] bg-neutral-950 border border-white/5 rounded-[2.5rem] p-10 font-mono text-sm text-blue-100 focus:outline-none focus:border-blue-500/40 transition-all resize-none shadow-2xl no-scrollbar"
                placeholder="Enter SQL Query..."
              />
            </div>
          </div>

          {/* --- Logic Visualization Render --- */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-800">Architectural View</span>
              <Badge variant="outline" className="border-white/5 text-neutral-600 font-bold uppercase text-[8px]">{metadata.joins} Joins Detected</Badge>
            </div>

            <div 
              ref={exportRef}
              className="relative rounded-[3rem] bg-[#000000] border border-white/10 p-16 flex flex-col items-center justify-center min-h-[500px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
            >
              {/* Technical Schematic Background */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              <div className="relative z-10 w-full max-w-2xl space-y-12">
                {/* Tables Row */}
                <div className="flex justify-around items-start gap-8">
                  {metadata.tables.length > 0 ? metadata.tables.map((table, i) => (
                    <motion.div 
                      key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="p-6 bg-neutral-900 border border-white/10 rounded-2xl flex flex-col items-center gap-3 w-40 shadow-2xl relative"
                    >
                      <Table className="text-blue-500" size={24} />
                      <span className="text-xs font-black uppercase tracking-widest text-white">{table}</span>
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-10 w-px bg-gradient-to-b from-blue-500/40 to-transparent" />
                    </motion.div>
                  )) : (
                    <div className="text-neutral-700 uppercase font-black text-xs tracking-widest italic animate-pulse">Awaiting Schema Data...</div>
                  )}
                </div>

                {/* Processing Node */}
                <div className="flex justify-center">
                   <div className="p-8 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center relative shadow-[0_0_40px_rgba(220,38,38,0.1)]">
                      <Cpu size={32} className="text-red-500" />
                      <div className="absolute -top-2 -right-2"><Sparkles size={16} className="text-red-400 animate-bounce" /></div>
                   </div>
                </div>

                {/* Columns Output */}
                <div className="grid grid-cols-3 gap-3">
                  {metadata.columns.map((col, i) => (
                    <motion.div 
                      key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2"
                    >
                      <Hash size={12} className="text-neutral-500" />
                      <span className="text-[10px] font-bold text-neutral-400 truncate uppercase">{col}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Where Clause HUD */}
                {metadata.conditions && (
                  <div className="mt-8 p-4 bg-red-600/5 border border-red-600/20 rounded-2xl flex items-center gap-4">
                     <Filter size={16} className="text-red-600 shrink-0" />
                     <p className="text-[10px] font-mono text-red-200/60 leading-relaxed italic">{metadata.conditions}</p>
                  </div>
                )}
              </div>

              {/* --- BRAND WATERMARK --- */}
              <div className="absolute bottom-8 right-10 flex items-center gap-2 select-none opacity-40">
                <div className="h-4 w-px bg-white/10 mx-2" />
                <span className="text-[14px] font-black tracking-[0.3em] uppercase italic text-white">
                  Paper<span className="text-red-600">Tube</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Trust Metrics */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-8 border-t border-white/5 pt-16">
          <Metric icon={<ShieldCheck size={20} className="text-emerald-500" />} title="Zero Server Logs" desc="Queries are parsed locally using Client-Side Regex engines." />
          <Metric icon={<Layers size={20} className="text-blue-500" />} title="Relational Mapping" desc="Identifies complex JOIN structures and primary key relationships." />
          <Metric icon={<Activity size={20} className="text-red-500" />} title="Performance Ready" desc="Blueprint helps visualize sub-optimal WHERE clauses early." />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Metric({ icon, title, desc }: any) {
  return (
    <div className="space-y-3">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">{icon}</div>
      <h4 className="text-sm font-black uppercase italic tracking-widest text-white">{title}</h4>
      <p className="text-xs text-neutral-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}