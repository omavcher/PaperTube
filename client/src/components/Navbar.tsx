"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Menu as MenuIcon, X, ChevronDown, Cpu, Zap, 
  Home, Code, Gamepad2, User, Compass, Search, 
  Settings, LogOut, ShieldCheck, Activity, UserCircle,
  Briefcase,
  Gamepad2 as GamepadIcon,
  Crown,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import api from "@/config/api";
import axios from "axios";
import { Button } from "./ui/button";

export const Navbar = ({ isLoggedIn, user, onLoginSuccess, authLoading }: any) => {
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
      {/* --- DESKTOP: TOP CAPSULE NAVIGATION --- */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-500 hidden lg:block", 
        visible ? "pt-4" : "pt-0"
      )}>
        <div className="container mx-auto px-4 flex justify-center">
          <motion.div
            animate={{
              width: visible ? "auto" : "100%",
              borderRadius: visible ? "2rem" : "0rem",
              backgroundColor: visible ? "rgba(10, 10, 10, 0.9)" : "rgba(0,0,0,0.4)",
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
              <NavEntry href="/pricing" icon={<Zap size={14} />} label="Access" />
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <UserHUD user={user} onLogout={handleLogout} />
              ) : (
                <GoogleLoginBtn onSuccess={onLoginSuccess} loading={authLoading} />
              )}
            </div>
          </motion.div>
        </div>
      </nav>

      {/* --- MOBILE: PROFESSIONAL BOTTOM DOCK --- */}
      <div className="fixed bottom-0 inset-x-0 z-[120] lg:hidden bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-safe-area shadow-[0_-10px_40px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-2 h-16 max-w-md mx-auto">
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
              <div className="h-6 w-6 rounded-full border-2 border-red-600 overflow-hidden bg-neutral-800">
                <img src={user?.picture || "/avatar.png"} alt="u" className="w-full h-full object-cover" />
              </div>
            ) : (
              <User size={20} />
            )}
            <span className="text-[8px] font-black uppercase tracking-widest">Menu</span>
          </button>
        </div>
      </div>

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

/* --- Visual Sub-Components --- */

const LogoSection = () => (
  <Link href="/" className="group flex items-center shrink-0">
    <span className="text-xl font-black italic tracking-tighter uppercase text-white transition-all group-hover:tracking-normal">
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

const UserHUD = ({ user, onLogout }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Membership Logic based on your JSON structure
  const isPremium = user?.membership?.isActive === true;
  const planName = user?.membership?.planName || "Free Node";

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className="text-[10px] font-black text-white uppercase italic tracking-tighter truncate max-w-[100px]">{user?.name}</span>
          
          {isPremium ? (
            <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1">
              <Crown size={8} className="fill-current" /> {planName}
            </span>
          ) : (
            <Link href="/pricing" className="text-[8px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 hover:underline">
              Buy Subscription <ArrowUpRight size={8} />
            </Link>
          )}
        </div>
        <div className={cn(
          "h-10 w-10 rounded-full border-2 overflow-hidden relative group-hover:scale-105 transition-transform shadow-lg",
          isPremium ? "border-yellow-500 shadow-yellow-500/20" : "border-red-600 shadow-red-600/20"
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
            className="absolute top-full right-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-[110]"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Neural Identity</p>
              <p className="text-[11px] font-bold text-white truncate">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                 <div className={cn("px-2 py-0.5 rounded-full text-[7px] font-black uppercase", isPremium ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "bg-white/5 text-neutral-500 border border-white/10")}>
                    {planName}
                 </div>
                 <div className="text-[7px] font-black text-neutral-600 uppercase">Tokens: {user?.token || 0}</div>
              </div>
            </div>
            
            <Link href="/profile" className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl transition-colors text-neutral-400 hover:text-white group">
              <UserCircle size={16} className="group-hover:text-red-500" />
              <span className="text-[10px] font-black uppercase italic">User Dashboard</span>
            </Link>

            {!isPremium && (
              <Link href="/pricing" className="flex items-center gap-3 p-2.5 bg-red-600/10 hover:bg-red-600/20 rounded-xl transition-colors text-red-500 group my-1">
                <Zap size={16} className="fill-current" />
                <span className="text-[10px] font-black uppercase italic">Upgrade to Pro</span>
              </Link>
            )}

            <Link href="/tools" className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl transition-colors text-neutral-400 hover:text-white group">
              <Briefcase size={16} className="group-hover:text-red-500" />
              <span className="text-[10px] font-black uppercase italic">PaperTube Tools</span>
            </Link>

            <div className="h-px bg-white/5 my-1" />

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-2.5 hover:bg-red-600/10 rounded-xl transition-colors text-neutral-500 hover:text-red-500 group"
            >
              <LogOut size={16} />
              <span className="text-[10px] font-black uppercase italic">Terminate Session</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function GoogleLoginBtn({ onSuccess, loading }: any) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      const { data: userInfo } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const response = await api.post("/auth/google", { googleAccessToken: accessToken, authType: 'access_token' });
      onSuccess(accessToken, userInfo, response.data);
    },
  });

  return (
    <button
      onClick={() => login()}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase italic bg-white text-black rounded-xl hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
    >
      {loading ? <div className="h-4 w-4 border-2 border-t-transparent border-black rounded-full animate-spin" /> : <FcGoogle size={16} />}
      {loading ? "SYNCING..." : "INIT_SESSION"}
    </button>
  );
}

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

const MobileDrawer = ({ isOpen, onClose, isLoggedIn, user, onLoginSuccess, authLoading, onLogout }: any) => {
  const isPremium = user?.membership?.isActive === true;
  const planName = user?.membership?.planName || "Free Node";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[150] bg-black p-8 flex flex-col gap-10 lg:hidden"
        >
          <div className="flex justify-between items-center">
             <span className="text-xl font-black italic text-white uppercase tracking-tighter">
               Paper<span className="text-red-600">Tube</span>
             </span>
             <button onClick={onClose} className="p-3 bg-neutral-900 rounded-full text-white"><X /></button>
          </div>
          
          <div className="flex flex-col gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 border-b border-white/5 pb-2">Operational Modules</p>
            {SUPPORT_TOOLS.map((tool, i) => (
              <Link key={i} href={tool.href} onClick={onClose} className="flex items-center gap-4 p-4 bg-neutral-900/50 rounded-2xl border border-white/5">
                 <div className="text-red-600">{tool.icon}</div>
                 <div>
                   <p className="text-xs font-black uppercase text-white">{tool.title}</p>
                   <p className="text-[8px] text-neutral-600 font-bold uppercase">{tool.desc}</p>
                 </div>
              </Link>
            ))}
          </div>

          <div className="mt-auto">
            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-neutral-900 rounded-3xl mb-4 border border-white/5">
                   <img src={user?.picture} className={cn("w-12 h-12 rounded-full border-2", isPremium ? "border-yellow-500" : "border-red-600")} />
                   <div className="flex-1">
                     <p className="text-xs font-black uppercase text-white truncate">{user?.name}</p>
                     <p className="text-[9px] font-bold text-yellow-500 uppercase">{planName}</p>
                   </div>
                   {!isPremium && (
                     <Link href="/pricing" onClick={onClose}>
                       <Button size="sm" className="h-7 text-[8px] font-black uppercase bg-red-600">Upgrade</Button>
                     </Link>
                   )}
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => { onLogout(); onClose(); }} 
                  className="w-full text-neutral-600 hover:text-red-500 uppercase font-black text-[10px] tracking-[0.3em]"
                >
                  <LogOut className="mr-2 h-3 w-3" /> Terminate Session
                </Button>
              </div>
            ) : (
              <div className="p-6 bg-neutral-900/50 border border-white/5 rounded-[2.5rem] flex flex-col gap-4 text-center">
                 <p className="text-[10px] font-black text-neutral-500 uppercase">Authentication Required</p>
                 <GoogleLoginBtn onSuccess={onLoginSuccess} loading={authLoading} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NavEntry = ({ href, label, icon }: any) => (
  <Link href={href} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-all">{icon} {label}</Link>
);

const SUPPORT_TOOLS = [
  { title: "Snippets", desc: "Code syntax imaging.", href: "/tools/code-to-image", icon: <Code size={16} /> },
  { title: "AI Sentinel", desc: "Signature analysis.", href: "/tools/sentinel", icon: <ShieldCheck size={16} /> },
  { title: "Logic Lab", desc: "Boolean circuit forge.", href: "/tools/logic-gate-lab", icon: <Cpu size={16} /> },
];