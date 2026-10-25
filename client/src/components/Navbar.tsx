"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Menu as MenuIcon, 
  X, 
  ChevronDown, 
  Zap, 
  Home, 
  User, 
  LogOut, 
  UserCircle, 
  Crown, 
  Flame, 
  Trophy, 
  Youtube, 
  Layout, 
  Workflow, 
  PenTool, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  LayoutGrid, 
  Code2, 
  FileText, 
  Settings, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ChevronRight, 
  MessageSquare, 
  Tag, 
  Calculator, 
  Calendar, 
  Languages, 
  ShieldAlert, 
  Presentation, 
  HelpCircle, 
  Layers, 
  Search, 
  Clock, 
  ArrowUpRight,
  Command,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Video
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/config/api";
import { toast } from "sonner";

interface NavbarProps {
  isLoggedIn?: boolean;
  user?: any;
  onLoginSuccess?: any;
  authLoading?: boolean;
  hideDesktop?: boolean;
  hideMobile?: boolean;
  sidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar = ({ 
  isLoggedIn, 
  user, 
  onLoginSuccess, 
  authLoading,
  hideDesktop,
  hideMobile,
  sidebarExpanded,
  onToggleSidebar
}: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isMac, setIsMac] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Detect Windows vs Mac for keyboard shortcuts
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.userAgent.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  // Fetch token & credit balance
  useEffect(() => {
    if (isLoggedIn) {
      const fetchTokens = async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) return;
          const res = await api.get("/users/tokens", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data?.success) {
            setTokenInfo(res.data);
          }
        } catch (error) {
          console.warn("Navbar token fetch non-blocking:", error);
        }
      };
      fetchTokens();
    }
  }, [isLoggedIn]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 30);
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Compute current page context title
  const getPageTitle = (path: string) => {
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.startsWith("/workspace")) return "AI Workspace";
    if (path.startsWith("/youtube-to-notes")) return "YouTube to Notes";
    if (path.startsWith("/presentation-generator")) return "AI Presentation";
    if (path.startsWith("/whiteboard")) return "Whiteboard Studio";
    if (path.startsWith("/profile")) return "Profile";
    if (path.startsWith("/tools")) return "Developer Tools";
    if (path.startsWith("/pricing")) return "Pricing & Plans";
    if (path.startsWith("/leaderboard")) return "Leaderboard";
    if (path.startsWith("/blog")) return "Blog & Tutorials";
    if (path.startsWith("/ai-study")) return "AI Study Room";
    if (path.startsWith("/ai-writer")) return "AI Writer Suite";
    if (path.startsWith("/ai-video-explanation")) return "AI Video Explainer";
    return null;
  };

  const currentTitle = getPageTitle(pathname);
  const isPro = Boolean(user?.membership?.isActive || tokenInfo?.isSubscribed);

  // ──── UNIFIED DROPDOWN CONTROLLER (PREVENTS 2 OPENING AT ONCE) ────
  const [activeDropdown, setActiveDropdown] = useState<"study" | "dev" | "user" | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active section highlights
  const isSuiteActive = pathname.startsWith("/ai-study") || 
                        pathname.startsWith("/youtube-to-notes") || 
                        pathname.startsWith("/presentation-generator") || 
                        pathname.startsWith("/whiteboard") ||
                        pathname.startsWith("/workspace");

  const isDevActive = pathname.startsWith("/tools") || 
                      pathname.startsWith("/leaderboard") || 
                      pathname.startsWith("/blog") || 
                      pathname.startsWith("/success-stories");

  // Automatically close all dropdowns on route changes
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  // Click outside & Escape key listeners
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-navbar-menu]")) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openCenterMenu = (menu: "study" | "dev") => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const closeCenterMenuDebounced = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown((curr) => (curr === "study" || curr === "dev" ? null : curr));
    }, 180);
  };

  const cancelCloseCenterMenu = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
  };

  const openUserHUD = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown("user");
  };

  const closeUserHUDDebounced = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown((curr) => (curr === "user" ? null : curr));
    }, 180);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. DESKTOP TOP HEADER BAR */}
      {/* ═══════════════════════════════════════════════════════ */}
      {!hideDesktop && (
        <header className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-all duration-300 hidden lg:block font-sans select-none",
          sidebarExpanded !== undefined ? (sidebarExpanded ? "lg:pl-[248px]" : "lg:pl-[64px]") : ""
        )}>
          <div className={cn(
            "h-16 px-6 flex items-center justify-between transition-all duration-200 border-b",
            scrolled 
              ? "bg-[#070709]/85 backdrop-blur-2xl border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.6)]" 
              : "bg-[#070709]/50 backdrop-blur-md border-white/[0.05]"
          )}>
            
            {/* Left: Context Indicator / Breadcrumb & Fast Search Trigger */}
            <div className="flex items-center gap-3.5 min-w-0">
              {/* If no sidebar is shown (e.g. SEO pages), display the Brand Logo */}
              {sidebarExpanded === undefined ? (
                <Link href="/" className="flex items-center gap-1.5 group shrink-0">
                  <span className="text-lg font-black italic tracking-tighter uppercase text-white">
                    PAPER<span className="text-[#ef4444]">XIFY</span>
                  </span>
                  <span className="text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    AI
                  </span>
                </Link>
              ) : (
                /* Breadcrumb Context Pill */
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-400 font-medium">Paperxify</span>
                  <span className="text-neutral-500">/</span>
                  <span className="text-white font-bold tracking-tight">
                    {currentTitle || "Studio"}
                  </span>
                </div>
              )}

            </div>

            {/* Center: Sleek Navigation Center Pill with Unified iOS Dropdown */}
            <div 
              data-navbar-menu="center-pill"
              onMouseEnter={cancelCloseCenterMenu}
              onMouseLeave={closeCenterMenuDebounced}
              className="relative flex items-center gap-1 bg-[#0d0d12]/90 border border-white/[0.08] backdrop-blur-xl px-1.5 py-1 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              {/* 1. Home */}
              <Link
                href="/"
                onClick={() => setActiveDropdown(null)}
                onMouseEnter={() => {
                  cancelCloseCenterMenu();
                  setActiveDropdown(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95",
                  pathname === "/" || pathname === "/dashboard"
                    ? "text-white bg-white/[0.1] shadow-sm"
                    : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Home size={13} className={pathname === "/" || pathname === "/dashboard" ? "text-red-500" : "text-neutral-400"} />
                <span>Home</span>
              </Link>

              {/* 2. Study Suite Trigger */}
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "study" ? null : "study")}
                onMouseEnter={() => openCenterMenu("study")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer active:scale-95 select-none",
                  activeDropdown === "study"
                    ? "text-white bg-white/[0.12] shadow-sm border border-white/10"
                    : isSuiteActive
                    ? "text-white bg-white/[0.08]"
                    : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <BookOpen size={13} className={isSuiteActive ? "text-red-500" : "text-neutral-400"} />
                <span>Study Suite</span>
                <ChevronDown 
                  size={11} 
                  className={cn(
                    "text-neutral-500 transition-transform duration-200", 
                    activeDropdown === "study" && "rotate-180 text-white"
                  )} 
                />
              </button>

              {/* 3. Dev Lab Trigger */}
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "dev" ? null : "dev")}
                onMouseEnter={() => openCenterMenu("dev")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer active:scale-95 select-none",
                  activeDropdown === "dev"
                    ? "text-white bg-white/[0.12] shadow-sm border border-white/10"
                    : isDevActive
                    ? "text-white bg-white/[0.08]"
                    : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <LayoutGrid size={13} className={isDevActive ? "text-red-500" : "text-neutral-400"} />
                <span>Dev Lab</span>
                <ChevronDown 
                  size={11} 
                  className={cn(
                    "text-neutral-500 transition-transform duration-200", 
                    activeDropdown === "dev" && "rotate-180 text-white"
                  )} 
                />
              </button>

              {/* 4. Pricing */}
              <Link
                href="/pricing"
                onClick={() => setActiveDropdown(null)}
                onMouseEnter={() => {
                  cancelCloseCenterMenu();
                  setActiveDropdown(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 active:scale-95",
                  pathname === "/pricing"
                    ? "text-white bg-white/[0.1] shadow-sm"
                    : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Zap size={13} className="text-neutral-400" />
                <span>Pricing</span>
              </Link>

              {/* ──── UNIFIED MEGA-MENU DIALOG (NEVER OPENS 2, NEVER OVERFLOWS) ──── */}
              <AnimatePresence>
                {(activeDropdown === "study" || activeDropdown === "dev") && (
                  <motion.div
                    key="navbar-mega-menu"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    onMouseEnter={cancelCloseCenterMenu}
                    onMouseLeave={closeCenterMenuDebounced}
                    className={cn(
                      "absolute top-full right-0 mt-2.5",
                      "w-[540px] max-w-[calc(100vw-32px)]",
                      // Invisible bridge covering gap so cursor doesn't drop hover
                      "before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']",
                      "bg-[#0a0a10]/95 backdrop-blur-3xl",
                      "border border-white/[0.1] rounded-[24px]",
                      "p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.06),0_1px_0_rgba(255,255,255,0.1)_inset]",
                      "z-[130] overflow-hidden select-none"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {activeDropdown === "study" && (
                        <motion.div
                          key="study-panel"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <StudySuiteContent onClose={() => setActiveDropdown(null)} />
                        </motion.div>
                      )}

                      {activeDropdown === "dev" && (
                        <motion.div
                          key="dev-panel"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <DevLabContent onClose={() => setActiveDropdown(null)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Credits / Status HUD & User Profile */}
            <div className="flex items-center gap-2.5">
              
              {/* Study Streak Indicator */}
              {isLoggedIn && (
                <Link
                  href="/profile"
                  title="Your Study Streak"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 text-orange-400 hover:border-orange-500/40 text-[11px] font-bold transition-all cursor-pointer"
                >
                  <Flame size={13} className="text-orange-500 fill-orange-500/20" />
                  <span>{Number(user?.streak?.count ?? 0)}d</span>
                </Link>
              )}

              {/* Membership Plan Pill */}
              {isLoggedIn && (
                <Link
                  href="/pricing"
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all shadow-sm",
                    isPro
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                      : "bg-white/[0.05] text-neutral-300 border border-white/10 hover:text-white hover:bg-white/[0.08]"
                  )}
                >
                  <Crown size={12} className={isPro ? "text-amber-400 fill-amber-400/20" : "text-neutral-400"} />
                  <span>{isPro ? "PRO" : "FREE"}</span>
                </Link>
              )}

              {/* User Avatar Capsule or Sign In Button */}
              {isLoggedIn ? (
                <UserHUD 
                  user={user} 
                  tokenInfo={tokenInfo} 
                  isPro={isPro} 
                  onLogout={handleLogout} 
                  isOpen={activeDropdown === "user"}
                  onToggle={() => setActiveDropdown(activeDropdown === "user" ? null : "user")}
                  onOpen={openUserHUD}
                  onClose={() => setActiveDropdown(null)}
                  onMouseEnter={cancelCloseCenterMenu}
                  onMouseLeave={closeUserHUDDebounced}
                />
              ) : (
                <SignInBtn loading={authLoading} />
              )}

            </div>

          </div>
        </header>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. MOBILE TOP BAR (FOR SMALL SCREENS) */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="fixed top-0 inset-x-0 z-[100] lg:hidden h-14 bg-[#070709]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="text-base font-black italic tracking-tighter uppercase text-white">
            PAPER<span className="text-[#ef4444]">XIFY</span>
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            AI
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <Link
              href="/pricing"
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                isPro ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-white/5 text-neutral-300 border border-white/10"
              )}
            >
              <Crown size={10} className={isPro ? "text-amber-400" : "text-neutral-400"} />
              <span>{isPro ? "PRO" : "FREE"}</span>
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white"
          >
            <MenuIcon size={16} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 3. MOBILE: BOTTOM DOCK BAR */}
      {/* ═══════════════════════════════════════════════════════ */}
      {!hideMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[120] lg:hidden">
          <div className="w-full bg-[#08080c]/95 backdrop-blur-2xl border-t border-white/[0.08] h-[72px] pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.85)]">
            <div className="grid grid-cols-5 h-full items-center px-1 relative">
              
              {/* 1. Home */}
              <Link href="/" className="flex flex-col items-center justify-center gap-1 group w-full h-full pt-1">
                <Home size={19} className={pathname === "/" ? "text-red-500" : "text-neutral-500 group-hover:text-white"} />
                <span className={cn("text-[9px] font-bold uppercase tracking-wider", pathname === "/" ? "text-white" : "text-neutral-500")}>
                  Home
                </span>
              </Link>

              {/* 2. Tools */}
              <Link href="/tools" className="flex flex-col items-center justify-center gap-1 group w-full h-full pt-1">
                <LayoutGrid size={19} className={pathname.startsWith("/tools") ? "text-red-500" : "text-neutral-500 group-hover:text-white"} />
                <span className={cn("text-[9px] font-bold uppercase tracking-wider", pathname.startsWith("/tools") ? "text-white" : "text-neutral-500")}>
                  Tools
                </span>
              </Link>
              
              {/* 3. Central AI Action (YouTube to Notes / Workspace) */}
              <div className="relative flex justify-center -top-4 h-full pointer-events-none">
                <Link href="/youtube-to-notes" className="group relative pointer-events-auto">
                  <div className="absolute inset-0 bg-red-600/30 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="h-14 w-14 bg-gradient-to-tr from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)] border-[4px] border-[#08080c] active:scale-95 transition-transform z-10 relative">
                    <Sparkles size={22} className="text-white fill-white/20" />
                  </div>
                </Link>
              </div>

              {/* 4. Pricing / Plan */}
              <Link href="/pricing" className="flex flex-col items-center justify-center gap-1 group w-full h-full pt-1">
                <Zap size={19} className={pathname === "/pricing" ? "text-red-500" : "text-neutral-500 group-hover:text-white"} />
                <span className={cn("text-[9px] font-bold uppercase tracking-wider", pathname === "/pricing" ? "text-white" : "text-neutral-500")}>
                  Pricing
                </span>
              </Link>
              
              {/* 5. Profile / Drawer */}
              <button 
                onClick={() => setMobileOpen(true)} 
                className="flex flex-col items-center justify-center gap-1 group w-full h-full outline-none pt-1"
              >
                {isLoggedIn ? (
                  <div className={cn(
                    "h-6 w-6 rounded-full border-2 overflow-hidden shadow-sm",
                    isPro ? "border-amber-400" : "border-neutral-700"
                  )}>
                    <img 
                      src={user?.picture || "/avatar.png"} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <User size={19} className="text-neutral-500 group-hover:text-white" />
                )}
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 group-hover:text-white">
                  Menu
                </span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 4. MOBILE DRAWER OVERLAY */}
      {/* ═══════════════════════════════════════════════════════ */}
      <MobileDrawer 
        isOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        isLoggedIn={isLoggedIn} 
        user={user} 
        isPro={isPro}
        onLoginSuccess={onLoginSuccess}
        authLoading={authLoading}
        onLogout={handleLogout}
        tokenInfo={tokenInfo}
      />
    </>
  );
};

// ──── CONTENT 1: AI STUDY SUITE ────
function StudySuiteContent({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-2.5">
        {/* Column 1: Core AI Studio */}
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-1.5 flex items-center justify-between">
            <span>Core AI Studio</span>
            <span className="text-[9px] font-semibold text-red-400/90 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20">Suite</span>
          </span>
          <div className="space-y-0.5">
            <MegaMenuItem
              href="/youtube-to-notes"
              icon={Youtube}
              iconColor="text-red-500"
              title="YouTube to Notes"
              desc="Convert lectures into smart study notes"
              badge="HOT"
              badgeColor="bg-red-500/15 text-red-400 border-red-500/30"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/workspace"
              icon={Sparkles}
              iconColor="text-red-400"
              title="AI Workspace"
              desc="Autonomous research & note studio"
              badge="STUDIO"
              badgeColor="bg-red-500/15 text-red-400 border-red-500/30"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/presentation-generator"
              icon={Presentation}
              iconColor="text-orange-400"
              title="AI Presentation (PPT)"
              desc="Generate formatted slide decks"
              badge="PPT"
              badgeColor="bg-orange-500/15 text-orange-400 border-orange-500/30"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/whiteboard"
              icon={PenTool}
              iconColor="text-violet-400"
              title="Agentic Whiteboard"
              desc="Visual diagramming with Excalidraw"
              badge="AI"
              badgeColor="bg-violet-500/15 text-violet-400 border-violet-500/30"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/ai-video-explanation"
              icon={Video}
              iconColor="text-violet-400"
              title="AI Video Explainer"
              desc="Sarvam Bulbul V3 neural voice & synced video"
              badge="NEW"
              badgeColor="bg-violet-500/15 text-violet-400 border-violet-500/30"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Column 2: Academic Study Room */}
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-1.5 flex items-center justify-between">
            <span>Academic Tools</span>
            <span className="text-[9px] font-semibold text-cyan-400/90 bg-cyan-500/10 px-1.5 py-0.5 rounded-full border border-cyan-500/20">Learn</span>
          </span>
          <div className="space-y-0.5">
            <MegaMenuItem
              href="/ai-study/homework-helper"
              icon={GraduationCap}
              iconColor="text-cyan-400"
              title="Homework Helper"
              desc="Step-by-step guidance & answers"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/ai-study/math-solver"
              icon={Calculator}
              iconColor="text-emerald-400"
              title="AI Math Solver"
              desc="Formulas, calculus & step proofs"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/ai-study/exam-planner"
              icon={Calendar}
              iconColor="text-amber-400"
              title="Exam Prep Planner"
              desc="Spaced repetition revision schedule"
              badge="NEW"
              badgeColor="bg-amber-500/15 text-amber-400 border-amber-500/30"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/youtube-to-quiz"
              icon={HelpCircle}
              iconColor="text-purple-400"
              title="AI Quizzes & Flashcards"
              desc="Auto-generate MCQs and flashcards"
              onClick={onClose}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer Callout */}
      <div className="pt-2 border-t border-white/[0.07] flex items-center justify-end text-xs text-neutral-400 px-1">
        <Link 
          href="/ai-study" 
          onClick={onClose}
          className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors group"
        >
          <span>View All Study Tools</span>
          <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ──── CONTENT 2: DEV TOOLS & LAB ────
function DevLabContent({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-2.5">
        {/* Column 1: Utilities */}
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-1.5 flex items-center justify-between">
            <span>Developer Utilities</span>
            <span className="text-[9px] font-semibold text-blue-400/90 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">Tools</span>
          </span>
          <div className="space-y-0.5">
            <MegaMenuItem
              href="/tools"
              icon={LayoutGrid}
              iconColor="text-blue-400"
              title="All 25+ Dev Tools"
              desc="Converters, formatters, QR & calculators"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/tools/code-to-image"
              icon={Code2}
              iconColor="text-emerald-400"
              title="Code to Image"
              desc="Export syntax-highlighted code cards"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/ai-diagram"
              icon={Workflow}
              iconColor="text-cyan-400"
              title="AI Mind Maps & Charts"
              desc="Interactive diagrams & flowcharts"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/ai-writer/ai-humanizer"
              icon={Sparkles}
              iconColor="text-rose-400"
              title="AI Humanizer & Detector"
              desc="Bypass detection & check plagiarism"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Column 2: Community & Growth */}
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-1.5 flex items-center justify-between">
            <span>Community & Insights</span>
            <span className="text-[9px] font-semibold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">Hub</span>
          </span>
          <div className="space-y-0.5">
            <MegaMenuItem
              href="/leaderboard"
              icon={Trophy}
              iconColor="text-amber-400"
              title="Global Leaderboard"
              desc="Top scholars & study streaks"
              badge="TOP"
              badgeColor="bg-amber-500/15 text-amber-400 border-amber-500/30"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/blog"
              icon={FileText}
              iconColor="text-neutral-300"
              title="Blog & Tutorials"
              desc="Study techniques & AI workflows"
              onClick={onClose}
            />
            <MegaMenuItem
              href="/success-stories"
              icon={MessageSquare}
              iconColor="text-indigo-400"
              title="Success Stories"
              desc="Student & engineer testimonials"
              onClick={onClose}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer Callout */}
      <div className="pt-2 border-t border-white/[0.07] flex items-center justify-between text-xs text-neutral-400 px-1">
        <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>100% Free & Open Developer Utilities</span>
        </span>
        <Link 
          href="/tools" 
          onClick={onClose}
          className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors group"
        >
          <span>Browse All Tools</span>
          <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ──── MEGA-MENU ITEM COMPONENT ────
function MegaMenuItem({
  href,
  icon: Icon,
  iconColor = "text-neutral-400",
  title,
  desc,
  badge,
  badgeColor = "bg-white/[0.08] text-neutral-300 border-white/10",
  onClick
}: {
  href: string;
  icon: any;
  iconColor?: string;
  title: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] active:scale-[0.985] transition-all duration-150 group cursor-pointer"
    >
      <div className={cn("w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-white/15 transition-all shadow-sm", iconColor)}>
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-white group-hover:text-red-400 transition-colors truncate">
            {title}
          </span>
          {badge && (
            <span className={cn("text-[7.5px] font-extrabold uppercase px-1.5 py-0.2 rounded-full border shrink-0", badgeColor)}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-[10.5px] text-neutral-400 leading-snug line-clamp-1 mt-0.5">
          {desc}
        </p>
      </div>
    </Link>
  );
}

// ──── USER PROFILE HUD DROPDOWN ────
function UserHUD({ 
  user, 
  tokenInfo, 
  isPro, 
  onLogout,
  isOpen,
  onToggle,
  onOpen,
  onClose,
  onMouseEnter,
  onMouseLeave
}: any) {
  // Dynamic user data from authentication state & token payload
  const userName = user?.name || user?.username || "Scholar";
  const userEmail = user?.email || "";
  const userAvatar = user?.picture;
  const initialLetter = (userName?.[0] || "S").toUpperCase();

  // Dynamic subscription status & plan name
  const isSubscribed = Boolean(
    user?.membership?.isActive || 
    tokenInfo?.isSubscribed || 
    user?.membership?.planId === "pro" || 
    user?.membership?.planId === "power"
  );
  const planName = user?.membership?.planName || tokenInfo?.planName || (isSubscribed ? "Pro Scholar Plan" : "Free Plan");

  // Dynamic Streak count & proper pluralization (0 Days, 1 Day, 3 Days)
  const streakDays = typeof user?.streak?.count === "number" 
    ? user.streak.count 
    : (typeof user?.streak?.days === "number" ? user.streak.days : 0);


  return (
    <div 
      data-navbar-menu="user-hud"
      className="relative font-sans" 
      onMouseEnter={onOpen} 
      onMouseLeave={onMouseLeave}
    >
      {/* Profile Capsule Button */}
      <button 
        type="button"
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 p-1 pl-2.5 rounded-full transition-all cursor-pointer shadow-md select-none",
          isOpen 
            ? "bg-[#181824] border border-white/20" 
            : "bg-[#101016] hover:bg-[#161622] border border-white/[0.08] hover:border-white/20"
        )}
      >
        <span className="text-xs font-bold text-white tracking-tight max-w-[90px] truncate">
          {userName}
        </span>
        <div className="relative">
          <div className={cn(
            "w-7 h-7 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-white text-xs shrink-0 border",
            isSubscribed ? "border-amber-500/60" : "border-neutral-700"
          )}>
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span>{initialLetter}</span>
            )}
          </div>
          {isSubscribed && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black absolute -bottom-0.5 -right-0.5" />
          )}
        </div>
      </button>

      {/* Flyout Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
              "absolute top-full right-0 mt-2.5 w-[280px]",
              // Invisible top bridge
              "before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']",
              "bg-[#0a0a10]/95 border border-white/[0.1] backdrop-blur-3xl rounded-[22px] p-3.5",
              "shadow-[0_24px_60px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.06),0_1px_0_rgba(255,255,255,0.1)_inset]",
              "z-[130] space-y-3 overflow-hidden select-none"
            )}
          >
            {/* User Header */}
            <div className="flex items-center gap-3 p-1">
              <div className="relative shrink-0">
                <div className={cn(
                  "w-10 h-10 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-white text-xs border-2 shadow-sm",
                  isSubscribed ? "border-amber-400" : "border-neutral-700"
                )}>
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initialLetter}</span>
                  )}
                </div>
                {isSubscribed && (
                  <span className="w-3 h-3 rounded-full bg-amber-400 border-2 border-[#0c0c12] absolute -bottom-0.5 -right-0.5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate leading-tight tracking-tight">{userName}</p>
                <p className="text-[11px] text-neutral-400 font-mono truncate">{userEmail}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Crown size={11} className={isSubscribed ? "text-amber-400 fill-amber-400/20" : "text-neutral-500"} />
                  <span className={cn("text-[10px] font-bold leading-none", isSubscribed ? "text-amber-400" : "text-neutral-400")}>
                    {planName}
                  </span>
                </div>
              </div>
            </div>

            {/* Streak HUD Tile */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                STUDY STREAK
              </span>
              <span className="text-xs font-black text-orange-400 flex items-center gap-1.5">
                <Flame size={13} className="fill-orange-400/20 text-orange-500" />
                <span>{streakDays} {streakDays === 1 ? "Day" : "Days"}</span>
              </span>
            </div>

            {/* Navigation Links */}
            <div className="space-y-0.5 pt-1 border-t border-white/[0.05]">
              <Link 
                href="/profile" 
                onClick={onClose}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group cursor-pointer"
              >
                <User size={15} className="text-neutral-400 group-hover:text-white transition-colors" />
                <span className="truncate">Profile</span>
              </Link>
              <Link 
                href="/leaderboard" 
                onClick={onClose}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group cursor-pointer"
              >
                <Trophy size={15} className="text-neutral-400 group-hover:text-amber-400 transition-colors" />
                <span className="truncate">Leaderboard</span>
              </Link>
              <Link 
                href="/pricing" 
                onClick={onClose}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group cursor-pointer"
              >
                <Tag size={15} className="text-neutral-400 group-hover:text-red-400 transition-colors" />
                <span className="truncate">Membership & Plans</span>
              </Link>
            </div>

            {/* Log Out */}
            <div className="pt-1 border-t border-white/[0.05]">
              <button 
                onClick={onLogout} 
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──── SIGN IN BUTTON ────
function SignInBtn({ loading }: any) {
  const handleOpenLogin = () => {
    window.dispatchEvent(new Event("open-login"));
  };
  
  return (
    <button 
      onClick={handleOpenLogin} 
      disabled={loading} 
      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.35)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
    >
      <User size={12} />
      <span>Sign In</span>
    </button>
  );
}

// ──── MOBILE SLIDE-OVER DRAWER ────
function MobileDrawer({ isOpen, onClose, isLoggedIn, user, isPro, authLoading, onLogout, tokenInfo }: any) {
  const pathname = usePathname();
  const userName = isLoggedIn ? (user?.name || "Scholar") : "Guest User";
  const userAvatar = user?.picture || "/avatar.png";
  const planName = user?.membership?.planName || tokenInfo?.planName || (isPro ? "Pro Scholar" : "Free Plan");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] lg:hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
          className="fixed inset-y-0 right-0 w-[300px] bg-[#09090e] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between p-4 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <Link href="/" onClick={onClose} className="flex items-center gap-1.5">
              <span className="text-base font-black italic tracking-tighter uppercase text-white">
                PAPER<span className="text-[#ef4444]">XIFY</span>
              </span>
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                AI
              </span>
            </Link>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Links List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
            
            {/* Core Links */}
            <div>
              <span className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2 mb-1 block">
                Navigation
              </span>
              <div className="space-y-0.5">
                {[
                  { href: "/", label: "Dashboard", icon: Home },
                  { href: "/workspace", label: "AI Workspace", icon: Sparkles, badge: "STUDIO" },
                  { href: "/youtube-to-notes", label: "YouTube to Notes", icon: Youtube, badge: "HOT" },
                  { href: "/presentation-generator", label: "AI Presentation (PPT)", icon: Presentation },
                  { href: "/whiteboard", label: "Whiteboard Studio", icon: PenTool },
                  { href: "/profile", label: "Profile", icon: User },
                  { href: "/pricing", label: "Pricing & Plans", icon: Zap },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors",
                      pathname === item.href
                        ? "bg-red-500/10 text-red-400 font-semibold"
                        : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Academic & Dev Sections */}
            <div>
              <span className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2 mb-1 block">
                Study & Developer Tools
              </span>
              <div className="space-y-0.5">
                {[
                  { href: "/ai-study/homework-helper", label: "Homework Helper", icon: GraduationCap },
                  { href: "/ai-study/math-solver", label: "AI Math Solver", icon: Calculator },
                  { href: "/tools", label: "All 25+ Dev Tools", icon: LayoutGrid },
                  { href: "/leaderboard", label: "Global Leaderboard", icon: Trophy },
                  { href: "/blog", label: "Blog & Tutorials", icon: FileText }
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Profile Bar */}
          <div className="pt-3 border-t border-white/[0.06]">
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03]">
                  <div className="w-8 h-8 rounded-full border border-neutral-700 overflow-hidden bg-neutral-800 shrink-0">
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{userName}</p>
                    <p className={cn("text-[10px] font-semibold", isPro ? "text-amber-400" : "text-neutral-400")}>
                      {planName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new Event("open-login"));
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}