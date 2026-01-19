"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, CreditCard, 
  Cpu, Settings, LogOut, ShieldAlert, 
  Terminal, Activity, BarChart3, ChevronRight, 
  Menu, X, Sparkles, Bug, FileText, Share2, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // --- Security Protocol: Admin Only ---
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(userData);
      // AUTHORIZED EMAIL: omawchar07@gmail.com
      if (user.email === "omawchar07@gmail.com") {
        setIsAuthorized(true);
      } else {
        toast.error("UNAUTHORIZED ACCESS DETECTED");
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  }, [router]);

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
      {/* Background Grid - Dark Theme Consistency */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* --- TACTICAL SIDEBAR --- */}
      <aside className={cn(
        "relative z-50 border-r border-white/5 bg-black/60 backdrop-blur-3xl transition-all duration-500 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        {/* Brand Section */}
        <div className="p-6 mb-4 flex items-center justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <span className="text-sm font-black uppercase italic tracking-[0.3em] text-red-500 flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  Admin_OS <span className="text-[8px] text-white/30 font-mono">v2.0</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors">
            {isSidebarOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>

        {/* Navigation Layers */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
           <p className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">Core_Systems</p>
           <AdminNavLink href="/admin" icon={<LayoutDashboard size={18}/>} label="Diagnostics" active={pathname === "/admin"} expanded={isSidebarOpen} />
           <AdminNavLink href="/admin/users" icon={<Users size={18}/>} label="Personnel" active={pathname.includes("/users")} expanded={isSidebarOpen} />
           <AdminNavLink href="/admin/transactions" icon={<CreditCard size={18}/>} label="Financial Ledger" active={pathname.includes("/transactions")} expanded={isSidebarOpen} />

           <div className="h-4" />
           <p className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">Growth_Forge</p>
           <AdminNavLink href="/admin/growth" icon={<Sparkles size={18}/>} label="Shadow Users" active={pathname.includes("/growth")} expanded={isSidebarOpen} />
           <AdminNavLink href="/admin/referrals" icon={<Share2 size={18}/>} label="Referral Flux" active={pathname.includes("/referrals")} expanded={isSidebarOpen} />
           
           <div className="h-4" />
           <p className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">Intelligence_Ops</p>
           <AdminNavLink href="/admin/content" icon={<FileText size={18}/>} label="Note Library" active={pathname.includes("/content")} expanded={isSidebarOpen} />
           <AdminNavLink href="/admin/ai-models" icon={<Cpu size={18}/>} label="Neural Config" active={pathname.includes("/ai-models")} expanded={isSidebarOpen} />
           <AdminNavLink href="/admin/bugs" icon={<Bug size={18}/>} label="Bug Reports" active={pathname.includes("/bugs")} expanded={isSidebarOpen} />

           <div className="h-4" />
           <p className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">Analytics</p>
           <AdminNavLink href="/admin/analytics" icon={<BarChart3 size={18}/>} label="Engagement" active={pathname.includes("/analytics")} expanded={isSidebarOpen} />
           <AdminNavLink href="/admin/seo" icon={<Search size={18}/>} label="Index Tracker" active={pathname.includes("/seo")} expanded={isSidebarOpen} />
        </nav>

        {/* System Exit */}
        <div className="p-4 border-t border-white/5">
           <button onClick={() => router.push("/")} className="w-full flex items-center gap-4 p-4 rounded-2xl text-neutral-500 hover:text-red-500 hover:bg-red-500/5 transition-all group">
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
              {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Eject Console</span>}
           </button>
        </div>
      </aside>

      {/* --- MAIN STAGE --- */}
      <main className="flex-1 relative overflow-y-auto z-10 custom-scrollbar">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl px-8 py-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              <div className="flex flex-col">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">System Handshake: Stable</h2>
                 <span className="text-[8px] font-mono text-neutral-700 tracking-tighter">SECURE_NODE_07 // {new Date().toLocaleTimeString()}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black uppercase text-white leading-none">OM AWCHAR</p>
                 <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">Prime Architect</p>
              </div>
              <div className="h-10 w-10 rounded-xl border border-red-600/30 overflow-hidden shadow-2xl relative group cursor-pointer">
                 <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <img src="https://instagram.fnag6-3.fna.fbcdn.net/v/t51.2885-19/588716770_18107765224651561_1977598599250782792_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fnag6-3.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QGac27yPL45VW8hWPeWM3H4hJ0elgNS1P8-80daKBdg359aAPe8lDY5nnEK483r1AM&_nc_ohc=eY2X9DYxHI0Q7kNvwGJjgyc&_nc_gid=DM0O7pXnG5sI2ZxBoPN1hQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfpzYQFG0jeW5v8UuQ6K6SobwvpgfM4zTHZBls2hgggpQA&oe=69733117&_nc_sid=7a9f4b" alt="admin" className="object-cover h-full w-full grayscale group-hover:grayscale-0 transition-all" />
              </div>
           </div>
        </header>

        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label, active, expanded }: any) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden",
      active 
        ? "bg-red-600 text-white shadow-[0_10px_20px_-10px_rgba(220,38,38,0.5)]" 
        : "text-neutral-500 hover:text-white hover:bg-white/5"
    )}>
      {/* Active Indicator Glow */}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
      )}
      
      <div className={cn("transition-transform group-hover:scale-110", active && "text-white")}>{icon}</div>
      {expanded && (
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          {label}
        </span>
      )}
      {active && expanded && <ChevronRight size={14} className="ml-auto opacity-40 animate-pulse" />}
    </Link>
  );
}