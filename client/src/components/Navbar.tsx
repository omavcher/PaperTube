"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Menu as MenuIcon, X, ChevronDown, Cpu, Zap, 
  Home, Code, Compass, User, LogOut, ShieldCheck, 
  UserCircle, Crown, Calendar, Coins, PlusCircle,
  Flame, Trophy, BarChart3
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import api from "@/config/api";
import axios from "axios";

// --- PLAN DEFINITIONS ---
const PLANS = [
    { id: "scholar", name: "Scholar", color: "text-blue-400", border: "border-blue-500", bg: "bg-blue-500/10" },
    { id: "pro", name: "Pro Scholar", color: "text-yellow-500", border: "border-yellow-500", bg: "bg-yellow-500/10" },
    { id: "power", name: "Power Scholar", color: "text-cyan-400", border: "border-cyan-500", bg: "bg-cyan-500/10" },
];

export const Navbar = ({ 
  isLoggedIn, 
  user, 
  onLoginSuccess, 
  authLoading,
  hideDesktop,
  hideMobile 
}: any) => {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 60);
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      {/* --- DESKTOP NAVIGATION --- */}
      {!hideDesktop && (
        <nav className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-all duration-500 hidden lg:block", 
          visible ? "pt-4" : "pt-0"
        )}>
          <div className="container mx-auto px-4 flex justify-center">
            <motion.div
              animate={{
                width: visible ? "auto" : "100%",
                borderRadius: visible ? "2rem" : "0rem",
                backgroundColor: visible ? "rgba(5, 5, 5, 0.9)" : "rgba(0,0,0,0.4)",
                backdropFilter: "blur(16px)",
                borderBottom: visible ? "1px solid rgba(220, 38, 38, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)",
              }}
              className="flex items-center justify-between px-8 py-3 w-full max-w-7xl relative"
            >
              <LogoSection />

              <div className="flex items-center gap-1">
                <NavEntry href="/" icon={<Home size={14} />} label="Home" />
                <NavDropdown label="Lab Modules" items={SUPPORT_TOOLS} />
                <NavEntry href="/explore" icon={<Compass size={14} />} label="Explore" />
                <NavEntry href="/pricing" icon={<Zap size={14} />} label={user?.membership?.isActive ? "My Plan" : "Access"} />
              </div>

              <div className="flex items-center gap-4">
                {/* Logic: Only show tokens if user is NOT a subscriber */}
                {isLoggedIn && !user?.membership?.isActive && <TokenBadge user={user} />}
                
                {isLoggedIn ? (
                  <UserHUD user={user} onLogout={handleLogout} />
                ) : (
                  <GoogleLoginBtn onSuccess={onLoginSuccess} loading={authLoading} />
                )}
              </div>
            </motion.div>
          </div>
        </nav>
      )}

      {/* --- MOBILE: BOTTOM DOCK --- */}
      {!hideMobile && (
        <div className="fixed bottom-0 inset-x-0 z-[120] lg:hidden bg-black/90 backdrop-blur-2xl border-t border-white/10 pb-safe-area shadow-[0_-10px_40px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-6 h-20 max-w-md mx-auto">
            <MobileTab href="/" icon={<Home size={22} />} label="Home" />
            <MobileTab href="/explore" icon={<Compass size={22} />} label="Explore" />
            
            <Link href="/tools" className="relative -top-6 group">
               <div className="absolute inset-0 bg-red-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
               <div className="relative bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-full shadow-xl border border-white/20 active:scale-90 transition-transform">
                  <Zap size={26} className="text-white fill-current" />
               </div>
            </Link>

            <MobileTab href="/stack" icon={<Trophy size={22} />} label="Rank" />
            
            <button 
              onClick={() => setMobileOpen(true)} 
              className="flex flex-col items-center gap-1.5 p-2 text-neutral-500 active:text-white transition-colors"
            >
              {isLoggedIn ? (
                <div className={cn(
                    "h-7 w-7 rounded-full border-2 overflow-hidden bg-neutral-800",
                    user?.membership?.isActive ? "border-yellow-500" : "border-red-600"
                )}>
                  <img src={user?.picture || "/avatar.png"} alt="u" className="w-full h-full object-cover" />
                </div>
              ) : (
                <User size={22} />
              )}
              <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
            </button>
          </div>
        </div>
      )}

      <MobileDrawer 
        isOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        isLoggedIn={isLoggedIn} 
        user={user} 
        onLoginSuccess={onLoginSuccess}
        authLoading={authLoading}
        onLogout={handleLogout}
      />
    </>
  );
};

/* --- Optimized Sub-Components --- */

const TokenBadge = ({ user }: any) => {
  // Double check protection (though parent handles it too)
  if (user?.membership?.isActive) return null;
  const tokens = user?.tokens || 0;

  if (tokens === 0) {
    return (
      <Link href="/get/free-token">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/50 rounded-full cursor-pointer animate-pulse"
        >
          <PlusCircle size={12} className="text-red-500" />
          <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Get Tokens</span>
        </motion.div>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full group hover:bg-white/10 transition-colors">
      <Coins size={12} className="text-yellow-500 group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-black text-white tabular-nums">
        {tokens.toLocaleString()}
      </span>
      <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Credits</span>
    </div>
  );
};

const UserHUD = ({ user, onLogout }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const membership = user?.membership;
  const isActive = membership?.isActive === true;
  const planInfo = PLANS.find(p => p.id === membership?.planId) || { name: "Standard", color: "text-red-500", border: "border-red-600", bg: "bg-red-500/10" };
  
  const streakCount = user?.streak?.count || 0;
  const lastVisit = user?.streak?.lastVisit ? new Date(user.streak.lastVisit).toLocaleDateString() : "Just Started";

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">{user?.name}</span>
          <span className={cn("text-[8px] font-black uppercase tracking-widest flex items-center gap-1", planInfo.color)}>
            {isActive && <Crown size={8} className="fill-current" />}
            {isActive ? planInfo.name : "Free Tier"}
          </span>
        </div>
        <div className={cn(
          "h-10 w-10 rounded-full border-2 overflow-hidden shadow-lg transition-transform hover:scale-105",
          isActive ? planInfo.border : "border-red-600"
        )}>
          <img src={user?.picture || "/avatar.png"} alt="u" className="w-full h-full object-cover" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-4 shadow-2xl backdrop-blur-xl z-[110] overflow-hidden"
          >
            {/* --- User Header --- */}
            <div className="mb-4 flex items-center gap-4 p-2">
                 <div className={cn("h-12 w-12 rounded-full border-2 overflow-hidden", isActive ? planInfo.border : "border-neutral-700")}>
                    <img src={user?.picture} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tighter">{user?.name}</p>
                    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase", planInfo.bg, planInfo.color)}>
                        {isActive ? planInfo.name : "Free Account"}
                    </div>
                 </div>
            </div>

            {/* --- Streak Widget --- */}
            <div className="mb-2 p-4 bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Flame size={40} className={streakCount > 0 ? "text-orange-500" : "text-neutral-700"} />
                </div>
                
                <div className="relative z-10 flex flex-col gap-1">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Current Streak</span>
                    <div className="flex items-baseline gap-1">
                        <span className={cn("text-3xl font-black italic", streakCount > 0 ? "text-white" : "text-neutral-600")}>
                           {streakCount}
                        </span>
                        <span className="text-xs font-bold text-neutral-500 uppercase">Days</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-medium text-neutral-400">
                        <Calendar size={10} />
                        Last Active: {lastVisit}
                    </div>
                </div>
            </div>

            {/* --- Leaderboard CTA --- */}
            <Link href="/leaderboard" className="mb-4 block">
                <div className="flex items-center justify-between p-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                            <Trophy size={14} />
                        </div>
                        <span className="text-[10px] font-black text-red-500 uppercase italic tracking-wider">
                            View Leaderboard
                        </span>
                    </div>
                    <ChevronDown size={14} className="text-red-500 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

            {/* --- Menu Links --- */}
            <div className="space-y-1 border-t border-white/5 pt-2">
              <Link href="/profile" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group">
                <UserCircle size={16} className="text-neutral-400 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase italic text-neutral-400 group-hover:text-white transition-colors">Dashboard</span>
              </Link>
              
              <Link href="/billing" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group">
                <Coins size={16} className="text-neutral-400 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase italic text-neutral-400 group-hover:text-white transition-colors">Billing & Plan</span>
              </Link>

              <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 hover:bg-red-600/10 rounded-xl transition-all group text-neutral-500 hover:text-red-500">
                <LogOut size={16} />
                <span className="text-[10px] font-black uppercase italic">Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileDrawer = ({ isOpen, onClose, isLoggedIn, user, onLoginSuccess, authLoading, onLogout }: any) => {
  const isActive = user?.membership?.isActive;
  const planInfo = PLANS.find(p => p.id === user?.membership?.planId) || { name: "Standard", color: "text-red-500" };
  const streakCount = user?.streak?.count || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: "100%" }} 
          animate={{ x: 0 }} 
          exit={{ x: "100%" }} 
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[150] bg-black flex flex-col lg:hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-neutral-900/50">
             <LogoSection />
             <button onClick={onClose} className="p-2 bg-neutral-800 rounded-full text-white active:scale-90 transition-transform"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoggedIn ? (
                <div className="flex flex-col gap-6">
                    {/* User Card */}
                    <div className="flex items-center gap-4 p-4 bg-neutral-900/50 rounded-3xl border border-white/5">
                        <div className={cn("h-16 w-16 rounded-2xl border-2 overflow-hidden", isActive ? "border-yellow-500" : "border-red-600")}>
                            <img src={user?.picture} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white italic uppercase tracking-tighter">{user?.name}</p>
                            <p className={cn("text-[10px] font-black uppercase tracking-widest", planInfo.color)}>
                                {isActive ? planInfo.name : "Free Account"}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Streak Box */}
                        <div className="p-4 bg-neutral-900/30 rounded-2xl border border-white/5 flex flex-col gap-2">
                             <div className="flex items-center gap-2 text-neutral-500">
                                 <Flame size={14} className={streakCount > 0 ? "text-orange-500" : ""} />
                                 <span className="text-[8px] font-black uppercase tracking-widest">Streak</span>
                             </div>
                             <p className="text-xl font-black text-white italic">{streakCount} <span className="text-[10px] not-italic text-neutral-600">Days</span></p>
                        </div>

                        {/* Tokens Box (Only if NOT subscriber) */}
                        {!isActive ? (
                            <Link href="/get/free-token" onClick={onClose} className="p-4 bg-neutral-900/30 rounded-2xl border border-white/5 flex flex-col gap-2 active:bg-neutral-800 transition-colors">
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <Coins size={14} className="text-yellow-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Tokens</span>
                                </div>
                                <p className="text-xl font-black text-white italic">{user?.tokens || 0}</p>
                            </Link>
                        ) : (
                            <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-500">
                                    <Crown size={14} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Status</span>
                                </div>
                                <p className="text-xl font-black text-yellow-500 italic">ACTIVE</p>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Link Mobile */}
                    <Link href="/stack" onClick={onClose} className="flex items-center justify-between p-4 bg-red-600/10 rounded-2xl border border-red-600/20 active:scale-95 transition-transform">
                        <div className="flex items-center gap-3">
                            <Trophy size={18} className="text-red-500" />
                            <span className="text-xs font-black text-red-500 uppercase italic tracking-wider">Leaderboard</span>
                        </div>
                        <ChevronDown size={16} className="text-red-500 -rotate-90" />
                    </Link>

                    {/* Nav Links */}
                    <div className="flex flex-col gap-2 mt-2">
                        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-2 pl-1">Navigation</p>
                        {SUPPORT_TOOLS.map((tool, i) => (
                        <Link key={i} href={tool.href} onClick={onClose} className="flex items-center gap-4 p-4 bg-neutral-900/30 rounded-2xl border border-white/5 active:bg-neutral-800">
                            <div className="text-neutral-400">{tool.icon}</div>
                            <span className="text-xs font-black uppercase text-white tracking-wider">{tool.title}</span>
                        </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                    <div className="h-20 w-20 bg-neutral-900 rounded-full flex items-center justify-center border border-white/10">
                        <User size={32} className="text-neutral-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white italic uppercase">Guest Access</h3>
                        <p className="text-xs text-neutral-500 mt-2 max-w-[200px] mx-auto">Login to sync your streak, save progress, and access pro features.</p>
                    </div>
                    <GoogleLoginBtn onSuccess={onLoginSuccess} loading={authLoading} />
                </div>
            )}
          </div>

          {/* Logout Mobile */}
          {isLoggedIn && (
              <div className="p-6 border-t border-white/10 bg-neutral-900/50">
                  <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-4 bg-red-600 text-white rounded-xl font-black uppercase text-xs italic tracking-wider shadow-lg shadow-red-900/20 active:scale-95 transition-transform">
                      <LogOut size={16} /> Terminate Session
                  </button>
              </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* --- Global Utilities & Navigation Items --- */

const SUPPORT_TOOLS = [
    { title: "Snippets", desc: "Artifact Foundry.", href: "/tools/code-to-image", icon: <Code size={16} /> },
    { title: "AI Sentinel", desc: "Signature analysis.", href: "/tools/sentinel", icon: <ShieldCheck size={16} /> },
    { title: "Logic Lab", desc: "Boolean forge.", href: "/tools/logic-gate-lab", icon: <Cpu size={16} /> },
];

const LogoSection = () => (
    <Link href="/" className="group flex items-center shrink-0">
      <span className="text-xl font-black italic tracking-tighter uppercase text-white">
        Paper<span className="text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">Tube</span>
      </span>
    </Link>
);

const MobileTab = ({ href, icon, label }: any) => (
    <Link href={href} className="flex flex-col items-center gap-1.5 p-2 text-neutral-500 hover:text-white transition-colors">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </Link>
);

const NavEntry = ({ href, label, icon }: any) => (
    <Link href={href} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-all">{icon} {label}</Link>
);

const NavDropdown = ({ label, items }: any) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-all">
          {label} <ChevronDown size={10} className={cn("transition-transform", open && "rotate-180")} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-72 bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-4 shadow-2xl backdrop-blur-xl"
            >
              {items.map((item: any, i: number) => (
                <Link key={i} href={item.href} className="flex items-center gap-4 p-3 hover:bg-red-600/5 rounded-2xl group transition-all">
                  <div className="p-2.5 bg-neutral-900 rounded-xl group-hover:text-red-500 transition-colors">{item.icon}</div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">{item.title}</p>
                    <p className="text-[9px] text-neutral-600 font-medium leading-tight">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};

function GoogleLoginBtn({ onSuccess, loading }: any) {
    const login = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        const { data: userInfo } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const res = await api.post("/auth/google", { googleAccessToken: tokenResponse.access_token, authType: 'access_token' });
        onSuccess(tokenResponse.access_token, userInfo, res.data);
      },
    });
    return (
      <button onClick={() => login()} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase italic bg-white text-black rounded-xl hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50">
        {loading ? <div className="h-3 w-3 border-2 border-t-transparent border-black rounded-full animate-spin" /> : <FcGoogle size={16} />}
        LogIn
      </button>
    );
}