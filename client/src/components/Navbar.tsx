"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Menu as MenuIcon, X, ChevronDown, Cpu, Zap, 
  Home, Code, Compass, User, LogOut, ShieldCheck, 
  UserCircle, Crown, Calendar, Coins, PlusCircle,
  Flame, Trophy, BarChart3, Command, Terminal,
  ToolCase,
  Gamepad,
  NotebookTabsIcon,
  Youtube,
  Layout,
  Workflow,
  PenTool,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/config/api";
import axios from "axios";
import { toast } from "sonner";
import { IconSquareLetterB } from "@tabler/icons-react";

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
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const pathname = usePathname();

  const isGamePlatform = pathname?.startsWith("/games/") && pathname !== "/games";
  const finalHideDesktop = hideDesktop || isGamePlatform;

  useEffect(() => {
    if (isLoggedIn) {
      const fetchTokens = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const res = await api.get("/users/tokens", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setTokenInfo(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch tokens:", error);
        }
      };
      fetchTokens();
    }
  }, [isLoggedIn]);

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
      {!finalHideDesktop && (
        <nav className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-all duration-500 hidden lg:block font-sans pointer-events-none", 
          visible ? "pt-4" : "pt-0"
        )}>
          <div className="container mx-auto px-4 flex justify-center pointer-events-auto">
            <div
              className={cn(
                "flex items-center justify-between px-6 py-4 w-full relative transition-all duration-300 transform-gpu",
                visible
                  ? "max-w-[1200px] rounded-3xl bg-[rgba(10,10,10,0.85)] backdrop-blur-md border border-white/[0.08] shadow-2xl"
                  : "max-w-7xl rounded-none bg-transparent border border-transparent"
              )}
            >
              <Link href="/" className="group flex items-center shrink-0">
      <span className="text-xl font-black italic tracking-tighter uppercase text-white">
        Paper<span className="text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">xify</span>
      </span>
    </Link>

              {/* Center Nav */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-2xl border border-white/5 backdrop-blur-sm mx-5 transform-gpu">
  <NavEntry href="/" icon={<Home size={14} />} label="Home" />
  <NavDropdown label="AI Study Suite" items={AI_STUDY_SUITE} />
  <NavDropdown label="Backpack" items={SUPPORT_TOOLS} />
  <NavEntry href="/pricing" icon={<Zap size={14} />} label={user?.membership?.isActive ? "My Plan" : "Pricing"} />
</div>

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                {/* Token Counter (Non-Subscribers) */}
                {isLoggedIn && tokenInfo && !tokenInfo.isSubscribed && (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-full">
                        <Coins size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-white">{tokenInfo.tokens}</span>
                    </div>
                )}
                
                {isLoggedIn ? (
                  <UserHUD user={user} onLogout={handleLogout} />
                ) : (
                  <SignInBtn loading={authLoading} />
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* --- MOBILE: BOTTOM DOCK --- */}
      {!hideMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[120] lg:hidden">
  {/* Glass Container */}
  <div className="w-full bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 h-[80px] pb-safe shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.8)] transform-gpu">
    
    <div className="grid grid-cols-5 h-full items-center px-1 relative">
      
      {/* 1. Home Tab */}
      <Link href="/" className="flex flex-col items-center justify-center gap-1.5 group w-full h-full pt-2">
        <div className="p-1 rounded-xl group-active:bg-white/5 transition-colors">
          <Home size={22} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white transition-colors" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-300">Home</span>
      </Link>

      {/* 2. Tools Tab */}
      <Link href="/tools" className="flex flex-col items-center justify-center gap-1.5 group w-full h-full pt-2">
        <div className="p-1 rounded-xl group-active:bg-white/5 transition-colors">
          <NotebookTabsIcon size={22} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white transition-colors" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-300">Tools</span>
      </Link>
      
      {/* 3. Central Action (Floating) */}
      <div className="relative flex justify-center -top-6 h-full pointer-events-none">
        <Link href="/youtube-to-notes" className="group relative pointer-events-auto">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
          
          {/* Button */}
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)] border-[6px] border-[#0a0a0a] active:scale-90 transition-transform duration-200 z-10 relative">
            <Zap size={26} className="text-black fill-black" strokeWidth={2} />
          </div>
        </Link>
      </div>

      {/* 4. Plan / Pricing Tab */}
      <Link href="/pricing" className="flex flex-col items-center justify-center gap-1.5 group w-full h-full pt-2">
        <div className="p-1 rounded-xl group-active:bg-white/5 transition-colors">
          <Zap size={22} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white transition-colors" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-300">
          {isLoggedIn && user?.membership?.isActive ? "My Plan" : "Pricing"}
        </span>
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
        tokenInfo={tokenInfo}
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
            className="absolute top-full right-0 mt-4 w-72 bg-[#0a0a0a] border border-white/10 rounded-3xl p-2 shadow-2xl backdrop-blur-md z-[110] overflow-hidden transform-gpu"
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

            {/* Streak Card */}
            <div className="mx-2 mb-2 p-4 bg-gradient-to-r from-orange-600/10 via-amber-600/15 to-transparent border border-orange-500/20 rounded-2xl flex items-center justify-between shadow-[inset_0_0_15px_rgba(249,115,22,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10 space-y-1">
                    <span className="text-[8px] font-extrabold text-orange-500 uppercase tracking-[0.15em] block">Study Streak</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-white leading-none tracking-tight font-mono">{streakCount}</span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{streakCount === 1 ? "day" : "days"}</span>
                    </div>
                    <span className="text-[8.5px] font-medium text-neutral-400 block leading-tight">
                      {streakCount > 0 ? "🔥 You're on fire! Keep it up." : "⚡ Start study to build streak!"}
                    </span>
                </div>
                <div className="relative z-10 h-12 w-12 bg-orange-500/15 border border-orange-500/20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-[0_0_20px_rgba(249,115,22,0.1)] shrink-0">
                    <Flame size={20} className={cn("transition-colors", streakCount > 0 ? "text-orange-500 fill-orange-500/20 animate-pulse" : "text-neutral-500")} />
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-1 p-1">
              <HUDLink href="/profile" icon={<UserCircle size={16} />} label="Profile" />
              <HUDLink href="/leaderboard" icon={<Trophy size={16} />} label="Leaderboard" />
              <HUDLink href="/pricing" icon={<Coins size={16} />} label="Pricing" />
              
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

const MobileDrawer = ({ isOpen, onClose, isLoggedIn, user, onLoginSuccess, authLoading, onLogout, tokenInfo }: any) => {
  const isActive = user?.membership?.isActive;
  const planInfo = PLANS.find(p => p.id === user?.membership?.planId) || { name: "Standard", color: "text-neutral-400", border: "border-neutral-600", bg: "bg-neutral-800" };
  
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
                    {/* User Profile Info Card */}
                    <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-5 relative overflow-hidden">
                        {/* Background Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        
                        <div className="flex items-start gap-4 relative z-10">
                            <div className={cn("h-16 w-16 rounded-2xl border-2 overflow-hidden shrink-0 bg-black/50", isActive ? planInfo.border : "border-white/10")}>
                                <img src={user?.picture || "/avatar.png"} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white leading-tight truncate">{user?.name}</h3>
                                <p className="text-xs text-neutral-500 mb-2 truncate">{user?.email}</p>
                                <span className={cn("text-[10px] font-bold uppercase px-2 py-1 bg-white/5 rounded inline-block", planInfo.color)}>
                                    {isActive ? planInfo.name : "Free Plan"}
                                </span>
                            </div>
                        </div>

                        {/* Stats box */}
                        <div className="grid grid-cols-2 gap-3 mt-5 relative z-10">
                             {/* Streak Card */}
                             <div className="bg-gradient-to-br from-orange-600/10 via-amber-600/15 to-transparent border border-orange-500/20 rounded-2xl p-3.5 flex flex-col justify-between h-28 relative overflow-hidden group shadow-[inset_0_0_15px_rgba(249,115,22,0.03)]">
                                 <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 blur-xl rounded-full pointer-events-none" />
                                 <div className="flex justify-between items-start w-full relative z-10">
                                     <span className="text-[8px] font-extrabold text-orange-500 uppercase tracking-widest block">Streak</span>
                                     <Flame size={16} className={cn("transition-colors", (user?.streak?.count || 0) > 0 ? "text-orange-500 fill-orange-500/15 animate-pulse" : "text-neutral-500")} />
                                 </div>
                                 <div className="relative z-10">
                                     <div className="flex items-baseline gap-1">
                                         <span className="text-2xl font-black text-white tracking-tight font-mono">{user?.streak?.count || 0}</span>
                                         <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{(user?.streak?.count || 0) === 1 ? "day" : "days"}</span>
                                     </div>
                                     <p className="text-[8px] text-neutral-500 leading-normal font-medium mt-1 truncate">
                                       {(user?.streak?.count || 0) > 0 ? "🔥 Keep it up!" : "⚡ Start study"}
                                     </p>
                                 </div>
                             </div>

                             {/* Credits Card */}
                             {(!tokenInfo || !tokenInfo.isSubscribed) && (
                                 <div className="bg-gradient-to-br from-blue-600/10 via-cyan-600/15 to-transparent border border-blue-500/20 rounded-2xl p-3.5 flex flex-col justify-between h-28 relative overflow-hidden group shadow-[inset_0_0_15px_rgba(59,130,246,0.03)]">
                                     <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-xl rounded-full pointer-events-none" />
                                     <div className="flex justify-between items-start w-full relative z-10">
                                         <span className="text-[8px] font-extrabold text-blue-400 uppercase tracking-widest block">Tokens</span>
                                         <Coins size={16} className="text-blue-400 fill-blue-500/15" />
                                     </div>
                                     <div className="relative z-10">
                                         <span className="text-2xl font-black text-white tracking-tight font-mono">{tokenInfo?.tokens || user?.credits || 0}</span>
                                         <p className="text-[8px] text-neutral-500 leading-normal font-medium mt-1">Available Credits</p>
                                     </div>
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">System</p>
                            <Link href="/profile" onClick={onClose} className="flex items-center gap-4 p-4 bg-neutral-900/40 hover:bg-neutral-900/60 rounded-2xl border border-white/5 transition-all mb-3">
                                <div className="text-white shrink-0"><UserCircle size={18} /></div>
                                <div>
                                    <p className="text-sm font-bold text-white">Profile</p>
                                    <p className="text-[10px] text-neutral-500">Manage your account and settings.</p>
                                </div>
                            </Link>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {SUPPORT_TOOLS.map((tool, i) => (
                                  <Link key={i} href={tool.href} onClick={onClose} className="flex flex-col gap-2 p-3.5 bg-neutral-900/40 hover:bg-neutral-900/60 active:scale-[0.98] rounded-2xl border border-white/5 transition-all">
                                      <div className="text-white p-1.5 bg-neutral-950 rounded-lg w-fit shrink-0">{tool.icon}</div>
                                      <div>
                                          <p className="text-xs font-bold text-white tracking-tight leading-tight">{tool.title}</p>
                                          <p className="text-[9px] text-neutral-500 mt-1 leading-snug line-clamp-2">{tool.desc}</p>
                                      </div>
                                  </Link>
                              ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">AI Study Suite</p>
                            <div className="grid grid-cols-2 gap-3">
                              {AI_STUDY_SUITE.map((tool, i) => (
                                  <Link key={i} href={tool.href} onClick={onClose} className="flex flex-col gap-2 p-3.5 bg-neutral-900/40 hover:bg-neutral-900/60 active:scale-[0.98] rounded-2xl border border-white/5 transition-all">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="text-white p-1.5 bg-neutral-950 rounded-lg shrink-0">{tool.icon}</div>
                                        {tool.badge && (
                                            <span className={cn("text-[6px] font-black uppercase px-1 py-0.5 rounded border shrink-0", tool.badgeColor)}>
                                                {tool.badge}
                                            </span>
                                        )}
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-white tracking-tight leading-tight">{tool.title}</p>
                                          <p className="text-[9px] text-neutral-500 mt-1 leading-snug line-clamp-2">{tool.desc}</p>
                                      </div>
                                  </Link>
                              ))}
                            </div>
                        </div>
                    </div>

                    <button onClick={onLogout} className="w-full mt-8 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold uppercase text-xs tracking-widest border border-red-500/20 active:scale-95 transition-transform">
                        Terminate Session
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Guest Greeting Card */}
                    <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center">
                        <div className="h-14 w-14 bg-neutral-950 rounded-2xl flex items-center justify-center border border-white/10 mb-4 shrink-0 rotate-3">
                            <User size={24} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Guest User</h3>
                        <p className="text-xs text-neutral-500 mt-1 mb-4 leading-relaxed">Log in to unlock full credits and save your notes.</p>
                        <SignInBtn loading={authLoading} />
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">System</p>
                            <div className="grid grid-cols-2 gap-3">
                              {SUPPORT_TOOLS.map((tool, i) => (
                                  <Link key={i} href={tool.href} onClick={onClose} className="flex flex-col gap-2 p-3.5 bg-neutral-900/40 hover:bg-neutral-900/60 active:scale-[0.98] rounded-2xl border border-white/5 transition-all">
                                      <div className="text-white p-1.5 bg-neutral-950 rounded-lg w-fit shrink-0">{tool.icon}</div>
                                      <div>
                                          <p className="text-xs font-bold text-white tracking-tight leading-tight">{tool.title}</p>
                                          <p className="text-[9px] text-neutral-500 mt-1 leading-snug line-clamp-2">{tool.desc}</p>
                                      </div>
                                  </Link>
                              ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">AI Study Suite</p>
                            <div className="grid grid-cols-2 gap-3">
                              {AI_STUDY_SUITE.map((tool, i) => (
                                  <Link key={i} href={tool.href} onClick={onClose} className="flex flex-col gap-2 p-3.5 bg-neutral-900/40 hover:bg-neutral-900/60 active:scale-[0.98] rounded-2xl border border-white/5 transition-all">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="text-white p-1.5 bg-neutral-950 rounded-lg shrink-0">{tool.icon}</div>
                                        {tool.badge && (
                                            <span className={cn("text-[6px] font-black uppercase px-1 py-0.5 rounded border shrink-0", tool.badgeColor)}>
                                                {tool.badge}
                                            </span>
                                        )}
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-white tracking-tight leading-tight">{tool.title}</p>
                                          <p className="text-[9px] text-neutral-500 mt-1 leading-snug line-clamp-2">{tool.desc}</p>
                                      </div>
                                  </Link>
                              ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* --- Global Utilities & Navigation Items --- */

const AI_STUDY_SUITE = [
  { title: "YouTube to Notes AI", desc: "Convert video lectures, crash courses & tutorials into notes & flashcards.", href: "/youtube-to-notes", icon: <Youtube size={16} />, badge: "Popular", badgeColor: "text-red-500 bg-red-500/10 border-red-500/20" },
  { title: "AI Slide Deck & PPT Maker", desc: "Transform topics, transcripts, or notes into beautifully structured slide decks.", href: "/presentation-generator", icon: <Layout size={16} />, badge: "Active", badgeColor: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { title: "AI Diagram & Flowchart", desc: "Generate concept maps, mind maps & interactive flowcharts from topics.", href: "/ai-diagram", icon: <Workflow size={16} />, badge: "New", badgeColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { title: "AI Writer & Editor", desc: "Draft essays, research summaries & study guides with academic formatting.", href: "/ai-writer", icon: <PenTool size={16} />, badge: "New", badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { title: "AI Study Room", desc: "Homework helper, step-by-step math solver & MCQ quiz player.", href: "/ai-study", icon: <GraduationCap size={16} />, badge: "New", badgeColor: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
];

const SUPPORT_TOOLS = [
    { title: "Tools", desc: "Paperxify Tools.", href: "/tools", icon: <ToolCase size={18} /> },
    { title: "Success Stories", desc: "Inspiring Students Stories.", href: "/success-stories", icon: <NotebookTabsIcon size={18} /> },
    { title: "Blogs", desc: "Paperxify Blogs.", href: "/blog", icon: <IconSquareLetterB size={18} /> },
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
              className="absolute top-full left-0 mt-2 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-md transform-gpu z-[110]"
            >
              {items.map((item: any, i: number) => (
                <Link key={i} href={item.href} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl group transition-all">
                  <div className="p-2 bg-neutral-900 rounded-lg text-neutral-400 group-hover:text-white transition-colors shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white uppercase tracking-wide">{item.title}</p>
                      {item.badge && (
                        <span className={cn("text-[7px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0", item.badgeColor)}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-neutral-500 font-medium mt-1 leading-normal">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};

function SignInBtn({ loading }: any) {
  const handleOpenLogin = () => {
    window.dispatchEvent(new Event("open-login"));
  };
  
  return (
    <button onClick={handleOpenLogin} disabled={loading} className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wide bg-white text-black rounded-xl hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-white/5">
      Sign In
    </button>
  );
}