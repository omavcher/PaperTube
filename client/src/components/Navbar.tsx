"use client";
// Paperxify Original Navbar
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
  GraduationCap,
  Sparkles,
  BookOpen,
  History,
  Heart,
  LayoutGrid,
  Code2,
  FileText,
  Package,
  Settings,
  Users,
  Lightbulb,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  MessageSquare,
  Gift,
  Bell,
  Tag,
  Calculator,
  Languages,
  ShieldAlert,
  FileSearch,
  Newspaper,
  Presentation,
  GitBranch,
  HelpCircle,
  Layers,
  Search,
  Trash2,
  Clock,
  RefreshCw,
  ArrowUpRight
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
  hideMobile,
  sidebarExpanded,
  onToggleSidebar
}: { 
  isLoggedIn?: boolean; 
  user?: any; 
  onLoginSuccess?: any; 
  authLoading?: boolean;
  hideDesktop?: boolean;
  hideMobile?: boolean;
  sidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
}) => {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const pathname = usePathname();

  const finalHideDesktop = hideDesktop;

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
      {/* --- DESKTOP NAVIGATION (APPLE IOS LIQUID GLASS SCROLL-ANIMATED) --- */}
      {!finalHideDesktop && (
        <nav className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-all duration-500 hidden lg:block font-sans pointer-events-none",
          sidebarExpanded !== undefined ? (sidebarExpanded ? "lg:pl-[248px]" : "lg:pl-[64px]") : "",
          visible ? "pt-3" : "pt-0"
        )}>
          <div className="container mx-auto px-4 flex justify-center pointer-events-auto">
            <div
              className={cn(
                "flex items-center justify-between w-full relative transition-all duration-500 transform-gpu",
                visible
                  ? "max-w-[1240px] px-5 py-2 rounded-full bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.8)]"
                  : "max-w-7xl px-6 py-4 rounded-none bg-transparent border border-transparent"
              )}
            >
              {/* Left: Brand Logo + [AI] Badge */}
              <Link href="/" className="flex items-center gap-1.5 group shrink-0">
                <span className="text-xl font-black italic tracking-tighter uppercase text-white">
                  PAPER<span className="text-[#ef4444]">XIFY</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-white/10 ml-1">
                  AI
                </span>
              </Link>

              {/* Center: Sleek Navigation Pill Menu */}
              <div className="flex items-center gap-1 bg-[#0d0d0d]/80 border border-white/[0.08] backdrop-blur-xl px-1.5 py-1 rounded-full shadow-md">
                <Link
                  href="/"
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                    pathname === "/" || pathname === "/dashboard"
                      ? "text-white bg-white/[0.08]"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Home size={13} className={pathname === "/" || pathname === "/dashboard" ? "text-red-500" : "text-neutral-400"} />
                  <span>Home</span>
                </Link>

                <NavDropdown
                  label="AI Study Suite"
                  icon={<BookOpen size={13} />}
                  items={AI_STUDY_SUITE}
                />

                <NavDropdown
                  label="Backpack"
                  icon={<ToolCase size={13} />}
                  items={SUPPORT_TOOLS}
                />

                <Link
                  href="/pricing"
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                    pathname === "/pricing"
                      ? "text-white bg-white/[0.08]"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Zap size={13} className="text-neutral-400" />
                  <span>Pricing</span>
                </Link>
              </div>

              {/* Right: User Profile Pill & Notification Bell */}
              <div className="flex items-center gap-2.5">
                {/* Plan Badge */}
                {isLoggedIn && (
                  <Link
                    href="/pricing"
                    className={cn(
                      "hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all",
                      tokenInfo?.isSubscribed || user?.membership?.isActive
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        : "bg-white/[0.05] text-neutral-300 border border-white/10 hover:text-white hover:bg-white/[0.08]"
                    )}
                  >
                    <Crown size={12} className={tokenInfo?.isSubscribed || user?.membership?.isActive ? "text-amber-400 fill-amber-400/20" : "text-neutral-400"} />
                    <span>{tokenInfo?.isSubscribed || user?.membership?.isActive ? "PRO" : "FREE"}</span>
                  </Link>
                )}
                
                {isLoggedIn ? (
                  <UserHUD user={user} onLogout={handleLogout} />
                ) : (
                  <SignInBtn loading={authLoading} />
                )}

                {/* Notification Bell Button with red notification dot */}
                <NotificationBell />
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
  const userName = user?.name || "Om Awchar";
  const userEmail = user?.email || "omawchar07@gmail.com";
  const userAvatar = user?.picture;
  const initialLetter = (userName?.[0] || "O").toUpperCase();
  const streakCount = user?.streak?.count || 0;

  return (
    <div className="relative font-sans" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {/* User Profile Pill Capsule Button */}
      <button className="flex items-center gap-2.5 px-3 py-1.5 bg-[#111111] hover:bg-[#161616] border border-white/[0.08] hover:border-white/20 rounded-full transition-all cursor-pointer shadow-md">
        <div className="flex flex-col text-right leading-none">
          <span className="text-xs font-bold text-white tracking-tight">{userName}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
            {isActive ? "PRO SCHOLAR" : "FREE TIER"}
          </span>
        </div>
        <div className="w-7 h-7 rounded-full border border-white/10 overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-white text-xs relative shrink-0">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span>{initialLetter}</span>
          )}
          <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5 shadow-[0_0_6px_rgba(239,68,68,0.9)] ring-2 ring-black" />
        </div>
      </button>

      {/* Open Profile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.96 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="absolute top-full right-0 mt-3 w-64 bg-[#0c0c0c]/95 border border-white/[0.09] backdrop-blur-2xl rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(239,68,68,0.15)] z-[120] space-y-2.5 overflow-hidden"
          >
            {/* User Header */}
            <div className="flex items-center gap-2.5 p-1.5">
              <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initialLetter}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">{userName}</p>
                <p className="text-[10px] text-neutral-400 font-mono truncate">{userEmail}</p>
              </div>
            </div>

            {/* Study Streak Card */}
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-2.5 flex items-center justify-between shadow-inner">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-wider block">
                  Study Streak
                </span>
                <p className="text-xs font-bold text-white">
                  {streakCount} Days
                </p>
                <p className="text-[8.5px] text-neutral-400 leading-tight">
                  {streakCount > 0 ? "🔥 Keep it up!" : "Start studying to build streak!"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/25 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] shrink-0">
                <Flame size={16} className={cn(streakCount > 0 ? "text-red-500 animate-pulse" : "text-red-400")} />
              </div>
            </div>

            {/* Links */}
            <div className="space-y-0.5 pt-1 border-t border-white/[0.04]">
              <Link href="/profile" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                <UserCircle size={14} className="text-neutral-400" />
                <span>Profile</span>
              </Link>
              <Link href="/leaderboard" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                <Trophy size={14} className="text-neutral-400" />
                <span>Leaderboard</span>
              </Link>
              <Link href="/pricing" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                <Tag size={14} className="text-neutral-400" />
                <span>Pricing</span>
              </Link>
            </div>

            {/* Log out */}
            <div className="pt-1 border-t border-white/[0.04]">
              <button 
                onClick={onLogout} 
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        title="Notifications"
        className="w-8 h-8 rounded-full bg-[#111111] hover:bg-[#181818] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer relative shadow-md"
      >
        <Bell size={14} />
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1.5 right-1.5 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="absolute top-full right-0 mt-3 w-72 bg-[#0c0c0c]/95 border border-white/[0.09] backdrop-blur-2xl rounded-2xl p-3 shadow-2xl z-[120] space-y-2"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-white">Notifications</span>
              <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">1 New</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-0.5">
              <p className="text-[11px] font-semibold text-white">🎉 Welcome to Paperxify AI!</p>
              <p className="text-[9.5px] text-neutral-400 leading-snug">Generate smart notes, quizzes, and mind maps in seconds.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarNavLink = ({ href, icon, label, active, highlighted, onClose }: any) => {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
        highlighted || active
          ? "bg-red-500/10 border-l-2 border-red-500 text-red-400 font-semibold shadow-[inset_0_0_15px_rgba(239,68,68,0.08)]"
          : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
      )}
    >
      <div className={cn(
        "shrink-0 transition-colors",
        highlighted || active ? "text-red-500" : "text-neutral-400 group-hover:text-white"
      )}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </Link>
  );
};

const HUDLink = ({ href, icon, label }: any) => (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
        {icon} {label}
    </Link>
)

const MobileDrawer = ({ isOpen, onClose, isLoggedIn, user, onLoginSuccess, authLoading, onLogout, tokenInfo }: any) => {
  const pathname = usePathname();
  const userName = isLoggedIn ? (user?.name || "User") : "Guest User";
  const userAvatar = user?.picture || "/avatar.png";
  const isPro = Boolean(user?.membership?.isActive || tokenInfo?.isSubscribed);
  const planName = user?.membership?.planName || tokenInfo?.planName || (isPro ? "Pro Scholar" : "Free Plan");
  const currentCredits = Number(tokenInfo?.tokens ?? user?.tokens ?? user?.credits ?? 0);
  const maxCredits = Number(tokenInfo?.maxTokens ?? user?.membership?.maxTokens ?? (isPro ? 2000 : 50));
  const creditPercent = maxCredits > 0 ? Math.min(100, Math.max(0, (currentCredits / maxCredits) * 100)) : 0;
  
  const [mobileCreations, setMobileCreations] = useState<any[]>([]);
  const [mobileLoading, setMobileLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isLoggedIn) {
        const token = localStorage.getItem("authToken");
        setMobileLoading(true);
        api.get('/users/creations/recent?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          if (res.data.success) {
            setMobileCreations(res.data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setMobileLoading(false));
      } else {
        try {
          const local = localStorage.getItem("paperxify_local_history");
          if (local) {
            setMobileCreations(JSON.parse(local).slice(0, 8));
          }
        } catch {}
      }
    }
  }, [isOpen, isLoggedIn]);

  const getCreationIcon = (type: string) => {
    switch (type) {
      case 'notes':
        return <Youtube size={13} className="text-red-500 shrink-0" />;
      case 'presentation':
      case 'ppt':
        return <Presentation size={13} className="text-orange-400 shrink-0" />;
      case 'quiz':
        return <HelpCircle size={13} className="text-purple-400 shrink-0" />;
      case 'flashcard':
        return <Layers size={13} className="text-blue-400 shrink-0" />;
      case 'diagram':
        return <GitBranch size={13} className="text-emerald-400 shrink-0" />;
      default:
        return <GraduationCap size={13} className="text-cyan-400 shrink-0" />;
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm lg:hidden"
          />

          {/* Side Navigation Drawer */}
          <motion.div 
            initial={{ x: "-100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "-100%" }} 
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed inset-y-0 left-0 z-[150] w-72 sm:w-80 max-w-[85vw] bg-[#070707] border-r border-white/10 flex flex-col justify-between font-sans lg:hidden shadow-2xl overflow-hidden"
          >
            {/* Header with Logo + Close Button */}
            <div className="flex justify-between items-center p-4 border-b border-white/[0.08]">
              <Link href="/" onClick={onClose} className="flex items-center gap-1.5">
                <span className="text-base font-black italic tracking-tight uppercase text-white">
                  Paper<span className="text-[#ef4444]">xify</span>
                </span>
                <span className="text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  AI
                </span>
              </Link>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4 no-scrollbar">
              
              {/* Category 1: CORE WORKSPACE */}
              <div>
                <p className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5">
                  CORE WORKSPACE
                </p>
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all",
                      pathname === "/" || pathname === "/dashboard"
                        ? "bg-red-950/20 border border-red-500/40 text-red-400 font-semibold shadow-[inset_0_0_12px_rgba(239,68,68,0.08)]"
                        : "bg-[#0f0f0f] border border-white/[0.04] text-neutral-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Home size={15} />
                      <span>Dashboard</span>
                    </div>
                    <MenuIcon size={12} className="text-red-500/80" />
                  </Link>

                  <Link
                    href="/youtube-to-notes"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-[#111111] border-l-2 border-red-500 text-white font-medium transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Youtube size={15} className="text-red-500" />
                      <span>YouTube to Notes</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">CORE</span>
                  </Link>

                  <Link
                    href="/presentation-generator"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-[#0f0f0f] border border-white/[0.04] text-neutral-300 hover:text-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <Presentation size={15} className="text-orange-400" />
                      <span>AI Presentation (PPT)</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">HOT</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-[#0f0f0f] border border-white/[0.04] text-neutral-300 hover:text-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen size={15} />
                      <span>Backpack Library</span>
                    </div>
                    <ChevronRight size={13} className="text-neutral-500" />
                  </Link>
                </div>
              </div>

              {/* Category 1.5: RECENT CREATIONS */}
              {mobileCreations.length > 0 && (
                <div>
                  <p className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5 flex items-center justify-between">
                    <span>RECENT CREATIONS ({mobileCreations.length})</span>
                    <History size={10} className="text-red-500" />
                  </p>
                  <div className="space-y-1">
                    {mobileCreations.map((item) => (
                      <Link
                        key={item.id || item._id}
                        href={item.url || `/notes/${item.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#0e0e0e] border border-white/[0.04] hover:border-white/10 text-xs transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <div className="p-1 rounded bg-black/40 border border-white/[0.06] shrink-0">
                            {getCreationIcon(item.type)}
                          </div>
                          <p className="text-[11.5px] font-medium text-neutral-200 truncate">
                            {item.title}
                          </p>
                        </div>
                        <ArrowUpRight size={11} className="text-neutral-500 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: AI STUDY ROOM */}
              <div>
                <p className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5">
                  AI STUDY ROOM
                </p>
                <div className="space-y-0.5">
                  {[
                    { href: "/ai-study/homework-helper", icon: GraduationCap, label: "Homework Helper" },
                    { href: "/ai-study/math-solver", icon: Calculator, label: "AI Math Solver" },
                    { href: "/ai-study/exam-planner", icon: Calendar, label: "Exam Prep Planner", badge: "NEW" },
                    { href: "/ai-study/language-tutor", icon: Languages, label: "AI Language Tutor", badge: "AUDIO" },
                    { href: "/youtube-to-quiz", icon: HelpCircle, label: "YouTube to Quiz" },
                    { href: "/youtube-to-flashcards", icon: Layers, label: "AI Flashcards" },
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon size={15} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Category 3: WRITER & DIAGRAMS */}
              <div>
                <p className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5">
                  WRITER & DIAGRAMS
                </p>
                <div className="space-y-0.5">
                  {[
                    { href: "/ai-writer/ai-detector", icon: ShieldAlert, label: "AI Detector & Certs", badge: "VERIFIED" },
                    { href: "/ai-writer/ai-humanizer", icon: Sparkles, label: "AI Humanizer" },
                    { href: "/ai-writer/essay-writer", icon: FileText, label: "AI Essay Writer" },
                    { href: "/ai-writer/plagiarism", icon: FileSearch, label: "Plagiarism Checker" },
                    { href: "/ai-diagram", icon: GitBranch, label: "AI Mind Maps & Charts" },
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon size={15} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Category 4: DEV UTILITIES & COMMUNITY */}
              <div>
                <p className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5">
                  DEV UTILITIES & COMMUNITY
                </p>
                <div className="space-y-0.5">
                  {[
                    { href: "/tools", icon: LayoutGrid, label: "All 25+ Developer Tools" },
                    { href: "/tools/code-to-image", icon: Code2, label: "Code to Image" },
                    { href: "/leaderboard", icon: Trophy, label: "Global Leaderboard" },
                    { href: "/success-stories", icon: MessageSquare, label: "Success Stories" },
                    { href: "/blog", icon: Newspaper, label: "Blog & Tutorials" },
                    { href: "/pricing", icon: Zap, label: "Pricing & Plans" },
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon size={15} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Upgrade to Pro Scholar Card */}
              <div className="bg-gradient-to-b from-[#180a0c] to-[#0c0506] border border-red-500/30 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(239,68,68,0.12)] relative overflow-hidden">
                <Sparkles size={12} className="absolute top-2.5 right-2.5 text-red-500/40 pointer-events-none" />
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                    <Crown size={15} className="fill-amber-400/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white tracking-tight">
                        Upgrade to <span className="text-red-500">Pro Scholar</span>
                      </h4>
                      <ChevronRight size={12} className="text-neutral-500" />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                      Unlock 120 Pro notes, slide decks, quizzes & priority AI!
                    </p>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
                >
                  <Zap size={13} className="fill-white" />
                  <span>Upgrade Now</span>
                </Link>
              </div>

            </div>

            {/* Bottom User Profile & Credits Bar */}
            <div className="p-3 border-t border-white/[0.08] bg-[#090909]">
              {isLoggedIn ? (
                <div className="bg-[#0e0e0e] border border-white/[0.06] rounded-2xl p-2.5 space-y-2">
                  <div 
                    onClick={() => {
                      onClose();
                      window.location.href = "/profile";
                    }} 
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full border border-neutral-700 overflow-hidden bg-neutral-800 shrink-0">
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate leading-tight">{userName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Crown size={10} className={cn(isPro ? "text-red-500 fill-red-500/20" : "text-neutral-500")} />
                          <span className={cn("text-[10px] font-semibold leading-none", isPro ? "text-red-500" : "text-neutral-400")}>
                            {planName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-neutral-500 shrink-0" />
                  </div>

                  <div className="pt-1 border-t border-white/[0.04] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10.5px] font-medium text-neutral-300">
                        <Zap size={11} className="text-amber-400 fill-amber-400" />
                        <span>{currentCredits.toLocaleString()} / {maxCredits.toLocaleString()} Credits</span>
                      </div>
                      <Link
                        href="/pricing"
                        onClick={onClose}
                        className="text-[9.5px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md"
                      >
                        Top Up +
                      </Link>
                    </div>
                    <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.7)]" 
                        style={{ width: `${creditPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0e0e0e] border border-white/[0.06] rounded-2xl p-3 space-y-2.5 text-center">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 shrink-0">
                      <User size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white leading-tight">Welcome to Paperxify</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate">Sign in to save study notes</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new Event("open-login"));
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <User size={12} />
                    <span>Sign In / Register</span>
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        </>
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

const NavDropdown = ({ label, icon, items }: any) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.04] rounded-full transition-all cursor-pointer">
          {icon && <span className="text-neutral-400">{icon}</span>}
          <span>{label}</span>
          <ChevronDown size={11} className={cn("text-neutral-500 transition-transform duration-200", open && "rotate-180 text-white")} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.96 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="absolute top-full left-0 mt-2 w-80 bg-[#0c0c0c]/95 border border-white/[0.08] rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(239,68,68,0.1)] backdrop-blur-2xl transform-gpu z-[110]"
            >
              {items.map((item: any, i: number) => (
                <Link key={i} href={item.href} className="flex items-start gap-3 p-2.5 hover:bg-white/[0.05] rounded-xl group transition-all">
                  <div className="p-2 bg-neutral-900/80 border border-white/[0.06] rounded-lg text-neutral-400 group-hover:text-red-400 group-hover:border-red-500/30 transition-all shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">{item.title}</p>
                      {item.badge && (
                        <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0", item.badgeColor)}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-normal mt-0.5 leading-snug">{item.desc}</p>
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
      Try Free
    </button>
  );
}