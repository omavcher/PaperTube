"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Menu as MenuIcon, X, ChevronDown, Cpu, Zap, 
  Home, Code, Compass, User, LogOut, ShieldCheck, 
  UserCircle, Crown, Calendar, Coins, PlusCircle,
  Flame
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import api from "@/config/api";
import axios from "axios";

// --- PLAN DEFINITIONS ---
const PLANS = [
    { id: "scholar", name: "Scholar", color: "text-blue-400", border: "border-blue-500" },
    { id: "pro", name: "Pro Scholar", color: "text-yellow-500", border: "border-yellow-500" },
    { id: "power", name: "Power Scholar", color: "text-cyan-400", border: "border-cyan-500" },
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
                {isLoggedIn && <TokenBadge user={user} />}
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
        <div className="fixed bottom-0 inset-x-0 z-[120] lg:hidden bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-safe-area shadow-[0_-10px_40px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-4 h-16 max-w-md mx-auto">
            <MobileTab href="/" icon={<Home size={20} />} label="Home" />
            <MobileTab href="/explore" icon={<Compass size={20} />} label="Explore" />
            
            <Link href="/tools" className="relative -top-4">
               <div className="bg-red-600 p-4 rounded-2xl shadow-[0_0_25px_rgba(220,38,38,0.5)] active:scale-90 transition-transform">
                  <Zap size={24} className="text-white fill-current" />
               </div>
            </Link>

            <MobileTab href="/pricing" icon={<Zap size={20} />} label="Access" />
            
            <button 
              onClick={() => setMobileOpen(true)} 
              className="flex flex-col items-center gap-1 p-2 text-neutral-500 active:text-red-500 transition-colors"
            >
              {isLoggedIn ? (
                <div className={cn(
                    "h-6 w-6 rounded-full border-2 overflow-hidden bg-neutral-800",
                    user?.membership?.isActive ? "border-yellow-500" : "border-red-600"
                )}>
                  <img src={user?.picture || "/avatar.png"} alt="u" className="w-full h-full object-cover" />
                </div>
              ) : (
                <User size={20} />
              )}
              <span className="text-[8px] font-black uppercase tracking-widest">Menu</span>
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
  const planInfo = PLANS.find(p => p.id === membership?.planId) || { name: "Standard", color: "text-red-500", border: "border-red-600" };

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">{user?.name}</span>
          <span className={cn("text-[8px] font-black uppercase tracking-widest flex items-center gap-1", planInfo.color)}>
            {isActive && <Crown size={8} className="fill-current" />}
            {isActive ? planInfo.name : "Free Sync"}
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-72 bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-4 shadow-2xl backdrop-blur-xl z-[110] overflow-hidden"
          >
            {/* --- Status Header --- */}
            <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Profile Status</p>
                        <p className={cn("text-xs font-black uppercase italic leading-tight", planInfo.color)}>{isActive ? planInfo.name : "Basic Access"}</p>
                    </div>
                    {isActive ? (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[8px] font-black rounded-lg px-2">PRO</Badge>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] font-black text-white italic"><Coins size={10} className="text-yellow-500"/> {user?.tokens}</div>
                    )}
                </div>
            </div>

           {/* --- Minimalist & Gentle Streak Widget --- */}
<Link href="/quest">
  <motion.div 
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="mb-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-300 backdrop-blur-sm"
  >
    <div className="flex items-center gap-4">
      {/* Soft Glow Icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="h-10 w-10 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center">
          <Flame 
            size={18} 
            className="text-red-500/80 transition-all duration-700 group-hover:text-red-500 group-hover:fill-red-500/10" 
          />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium tracking-tight text-neutral-200">
          5 Day Streak
        </span>
        <span className="text-[10px] text-neutral-500 font-medium tracking-wide uppercase opacity-80">
          Keep the momentum going
        </span>
      </div>
    </div>

    {/* Subtle Status Indicator */}
    <div className="flex items-center gap-3">
      <div className="h-1 w-8 bg-neutral-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "70%" }}
          className="h-full bg-red-500/40"
        />
      </div>
      <ChevronDown size={14} className="text-neutral-600 -rotate-90 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </div>
  </motion.div>
</Link>

            {/* --- Action Links --- */}
            <div className="space-y-1">
              <Link href="/profile" className="flex items-center gap-3 p-3.5 hover:bg-white/5 rounded-xl transition-all group">
                <UserCircle size={16} className="text-red-500" />
                <span className="text-[10px] font-black uppercase italic text-white group-hover:translate-x-1 transition-transform">Neural Dashboard</span>
              </Link>

              <button onClick={onLogout} className="w-full flex items-center gap-3 p-3.5 hover:bg-red-600/10 rounded-xl transition-all group text-neutral-500 hover:text-red-500">
                <LogOut size={16} />
                <span className="text-[10px] font-black uppercase italic group-hover:translate-x-1 transition-transform">Terminate Link</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Badge = ({ children, className }: any) => (
  <div className={cn("px-2 py-0.5 rounded uppercase tracking-widest border", className)}>{children}</div>
);

const MobileDrawer = ({ isOpen, onClose, isLoggedIn, user, onLoginSuccess, authLoading, onLogout }: any) => {
  const isActive = user?.membership?.isActive;
  const planName = PLANS.find(p => p.id === user?.membership?.planId)?.name || "Standard";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}
          className="fixed inset-0 z-[150] bg-black p-8 flex flex-col lg:hidden overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-10">
             <LogoSection />
             <button onClick={onClose} className="p-3 bg-neutral-900 rounded-full text-white"><X /></button>
          </div>

          {isLoggedIn && (
              <div className="mb-8 p-6 bg-neutral-900/50 rounded-[2.5rem] border border-white/5 flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-16 w-16 rounded-2xl border-2 overflow-hidden shadow-2xl", isActive ? "border-yellow-500" : "border-red-600")}>
                        <img src={user?.picture} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white italic uppercase tracking-tighter leading-none mb-1">{user.name}</p>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-yellow-500" : "text-neutral-500")}>
                            {isActive ? planName : "Basic Access"}
                        </p>
                    </div>
                  </div>
                  
                  {/* Mobile Streak */}
                  <div className="flex items-center gap-3 p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
                     <Flame size={16} className="text-red-500 fill-current" />
                     <span className="text-[10px] font-black uppercase italic text-white">5-Day Active Streak</span>
                  </div>

                  {!isActive && (
                      <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-white/5">
                          <div className="flex items-center gap-2">
                              <Coins size={14} className="text-yellow-500" />
                              <span className="text-xs font-black text-white">{user?.tokens || 0}</span>
                          </div>
                          <Link href="/get/free-token" onClick={onClose} className="text-[10px] font-black text-red-500 uppercase tracking-wider">
                              + Get More
                          </Link>
                      </div>
                  )}
              </div>
          )}

          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 border-b border-white/5 pb-2">Operational Hub</p>
            {SUPPORT_TOOLS.map((tool, i) => (
              <Link key={i} href={tool.href} onClick={onClose} className="flex items-center gap-4 p-4 bg-neutral-900/50 rounded-2xl border border-white/5 active:scale-95 transition-transform">
                  <div className="text-red-600">{tool.icon}</div>
                  <div><p className="text-xs font-black uppercase text-white">{tool.title}</p><p className="text-[8px] text-neutral-600 font-bold uppercase">{tool.desc}</p></div>
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-10">
            {isLoggedIn ? (
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-5 bg-red-600/10 rounded-2xl text-red-500 font-black uppercase text-[10px] active:scale-95 transition-all">
                <LogOut size={16} /> Terminate Connection
              </button>
            ) : (
              <GoogleLoginBtn onSuccess={onLoginSuccess} loading={authLoading} />
            )}
          </div>
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
    <Link href={href} className="flex flex-col items-center gap-1 p-2 text-neutral-500 active:text-red-500 transition-colors">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
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