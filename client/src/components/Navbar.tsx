"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Menu as MenuIcon, X, ChevronDown, Cpu, Zap, 
  Home, Code, Compass, User, LogOut, ShieldCheck, 
  UserCircle, Crown, Calendar, Coins, PlusCircle,
  Flame, Trophy, BarChart3, Command, Terminal
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
    { id: "power", name: "Power Scholar", color: "text-purple-400", border: "border-purple-500", bg: "bg-purple-500/10" },
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
          "fixed top-0 inset-x-0 z-[100] transition-all duration-500 hidden lg:block font-sans", 
          visible ? "pt-4" : "pt-0"
        )}>
          <div className="container mx-auto px-4 flex justify-center">
            <motion.div
              animate={{
                width: visible ? "auto" : "100%",
                maxWidth: visible ? "1200px" : "1280px",
                borderRadius: visible ? "24px" : "0px",
                backgroundColor: visible ? "rgba(10, 10, 10, 0.85)" : "transparent",
                backdropFilter: visible ? "blur(20px)" : "blur(0px)",
                border: visible ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid transparent",
                y: visible ? 0 : 0
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between px-6 py-4 w-full relative"
            >
              <Link href="/" className="group flex items-center shrink-0">
      <span className="text-xl font-black italic tracking-tighter uppercase text-white">
        Paper<span className="text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">Tube</span>
      </span>
    </Link>

              {/* Center Nav */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-2xl border border-white/5 backdrop-blur-md mx-5">
  <NavEntry href="/" icon={<Home size={14} />} label="Home" />
  <NavDropdown label="Modules" items={SUPPORT_TOOLS} />
  <NavEntry href="/explore" icon={<Compass size={14} />} label="Explore" />
  <NavEntry href="/pricing" icon={<Zap size={14} />} label={user?.membership?.isActive ? "My Plan" : "Access"} />
</div>

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                {/* Token Counter (Non-Subscribers) */}
                
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
        <div className="fixed bottom-0 left-0 right-0 z-[120] lg:hidden">
  {/* Glass Container */}
  <div className="w-full bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 h-[80px] pb-safe shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.8)]">
    
    <div className="grid grid-cols-5 h-full items-center px-1 relative">
      
      {/* 1. Home Tab */}
      <Link href="/" className="flex flex-col items-center justify-center gap-1.5 group w-full h-full pt-2">
        <div className="p-1 rounded-xl group-active:bg-white/5 transition-colors">
          <Home size={22} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white transition-colors" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-300">Home</span>
      </Link>

      {/* 2. Explore Tab */}
      <Link href="/explore" className="flex flex-col items-center justify-center gap-1.5 group w-full h-full pt-2">
        <div className="p-1 rounded-xl group-active:bg-white/5 transition-colors">
          <Compass size={22} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white transition-colors" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-300">Explore</span>
      </Link>
      
      {/* 3. Central Action (Floating) */}
      <div className="relative flex justify-center -top-6 h-full pointer-events-none">
        <Link href="/tools" className="group relative pointer-events-auto">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
          
          {/* Button */}
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)] border-[6px] border-[#0a0a0a] active:scale-90 transition-transform duration-200 z-10 relative">
            <Zap size={26} className="text-black fill-black" strokeWidth={2} />
          </div>
        </Link>
      </div>

      {/* 4. Rank Tab */}
      <Link href="/leaderboard" className="flex flex-col items-center justify-center gap-1.5 group w-full h-full pt-2">
        <div className="p-1 rounded-xl group-active:bg-white/5 transition-colors">
          <Trophy size={22} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white transition-colors" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-300">Rank</span>
      </Link>
      
      {/* 5. Profile Tab */}
      <button 
        onClick={() => setMobileOpen(true)} 
        className="flex flex-col items-center justify-center gap-1.5 group w-full h-full outline-none pt-2"
      >
        <div className="p-0.5 rounded-full group-active:scale-95 transition-transform">
          {isLoggedIn ? (
            <div className={cn(
              "h-7 w-7 rounded-full border-2 overflow-hidden shadow-sm",
              user?.membership?.isActive ? "border-yellow-500" : "border-neutral-700"
            )}>
              <img 
                src={user?.picture || "/avatar.png"} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <User size={22} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white transition-colors" />
          )}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-300">Profile</span>
      </button>

    </div>
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


const UserHUD = ({ user, onLogout }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const membership = user?.membership;
  const isActive = membership?.isActive === true;
  const planInfo = PLANS.find(p => p.id === membership?.planId) || { name: "Standard", color: "text-neutral-400", border: "border-neutral-600", bg: "bg-neutral-800" };
  
  const streakCount = user?.streak?.count || 0;
  const lastVisit = user?.streak?.lastVisit ? new Date(user.streak.lastVisit).toLocaleDateString() : "Just Started";

  return (
    <div className="relative font-sans" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button className="flex items-center gap-3 p-1 pl-3 bg-neutral-900/50 border border-white/10 rounded-full hover:bg-neutral-800 transition-colors">
        <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] font-bold text-white uppercase tracking-tight">{user?.name?.split(' ')[0]}</span>
            <span className={cn("text-[8px] font-bold uppercase tracking-widest", planInfo.color)}>
                {isActive ? planInfo.name : "Free Tier"}
            </span>
        </div>
        <div className={cn("h-8 w-8 rounded-full border overflow-hidden bg-black", isActive ? planInfo.border : "border-white/20")}>
            <img src={user?.picture || "/avatar.png"} alt="u" className="w-full h-full object-cover" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-4 w-72 bg-[#0a0a0a] border border-white/10 rounded-3xl p-2 shadow-2xl backdrop-blur-xl z-[110] overflow-hidden"
          >
            {/* User Header */}
            <div className="flex items-center gap-4 p-4 mb-2 bg-neutral-900/30 rounded-2xl">
                 <div className={cn("h-10 w-10 rounded-full border overflow-hidden", isActive ? planInfo.border : "border-white/10")}>
                    <img src={user?.picture} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-white">{user?.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">{user?.email}</p>
                 </div>
            </div>

            {/* Streak */}
            <div className="mx-2 mb-2 p-3 bg-gradient-to-br from-neutral-900 to-black border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Streak</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">{streakCount}</span>
                        <span className="text-[10px] text-neutral-600">days</span>
                    </div>
                </div>
                <div className="h-10 w-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <Flame size={18} className={streakCount > 0 ? "text-orange-500" : "text-neutral-700"} />
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-1 p-1">
              <HUDLink href="/profile" icon={<UserCircle size={16} />} label="Dashboard" />
              <HUDLink href="/leaderboard" icon={<Trophy size={16} />} label="Leaderboard" />
              <HUDLink href="/billing" icon={<Coins size={16} />} label="Billing" />
              
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors mt-2">
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HUDLink = ({ href, icon, label }: any) => (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
        {icon} {label}
    </Link>
)

const MobileDrawer = ({ isOpen, onClose, isLoggedIn, user, onLoginSuccess, authLoading, onLogout }: any) => {
  const isActive = user?.membership?.isActive;
  const planInfo = PLANS.find(p => p.id === user?.membership?.planId) || { name: "Standard", color: "text-neutral-400" };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }} 
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[150] bg-[#0a0a0a] flex flex-col lg:hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
             <div className="flex items-center gap-2">
                <Terminal size={18} className="text-white" />
                <span className="text-sm font-bold text-white uppercase tracking-widest">Menu</span>
             </div>
             <button onClick={onClose} className="p-2 bg-neutral-900 rounded-full text-white"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 font-sans">
            {isLoggedIn ? (
                <div className="space-y-8">
                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl border border-white/10 overflow-hidden">
                            <img src={user?.picture} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                            <span className={cn("text-[10px] font-bold uppercase px-2 py-1 bg-white/5 rounded", planInfo.color)}>
                                {isActive ? planInfo.name : "Free Plan"}
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-4">System</p>
                        {SUPPORT_TOOLS.map((tool, i) => (
                            <Link key={i} href={tool.href} onClick={onClose} className="flex items-center gap-4 p-4 bg-neutral-900/40 rounded-2xl border border-white/5">
                                <div className="text-white">{tool.icon}</div>
                                <div>
                                    <p className="text-sm font-bold text-white">{tool.title}</p>
                                    <p className="text-[10px] text-neutral-500">{tool.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <button onClick={onLogout} className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold uppercase text-xs tracking-widest border border-red-500/20">
                        Terminate Session
                    </button>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="h-20 w-20 bg-neutral-900 rounded-3xl flex items-center justify-center border border-white/10 rotate-3">
                        <User size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white">Guest User</h3>
                        <p className="text-sm text-neutral-500 mt-2">Log in to sync your neural data.</p>
                    </div>
                    <GoogleLoginBtn onSuccess={onLoginSuccess} loading={authLoading} />
                </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* --- Global Utilities & Navigation Items --- */

const SUPPORT_TOOLS = [
    { title: "Snippets", desc: "Code Generation.", href: "/tools/code-to-image", icon: <Code size={18} /> },
    { title: "AI Sentinel", desc: "Plagiarism Check.", href: "/tools/sentinel", icon: <ShieldCheck size={18} /> },
    { title: "Logic Lab", desc: "Boolean Logic.", href: "/tools/logic-gate-lab", icon: <Cpu size={18} /> },
];

const MobileTab = ({ href, icon, label }: any) => (
    <Link href={href} className="flex flex-col items-center gap-1 opacity-60 active:opacity-100 active:scale-95 transition-all">
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </Link>
);

const NavEntry = ({ href, label, icon }: any) => (
    <Link href={href} className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
        {icon} {label}
    </Link>
);

const NavDropdown = ({ label, items }: any) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <button className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          {label} <ChevronDown size={10} className={cn("transition-transform", open && "rotate-180")} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl"
            >
              {items.map((item: any, i: number) => (
                <Link key={i} href={item.href} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl group transition-all">
                  <div className="p-2 bg-neutral-900 rounded-lg text-neutral-400 group-hover:text-white transition-colors">{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">{item.title}</p>
                    <p className="text-[9px] text-neutral-500 font-medium">{item.desc}</p>
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
      <button onClick={() => login()} disabled={loading} className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wide bg-white text-black rounded-xl hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-white/5">
        {loading ? <div className="h-3 w-3 border-2 border-t-transparent border-black rounded-full animate-spin" /> : <FcGoogle size={16} />}
        Sign In
      </button>
    );
};