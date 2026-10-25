"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  LayoutDashboard, Users, CreditCard, 
  Cpu, LogOut, ShieldAlert, 
  Terminal, Activity, BarChart3, ChevronRight, 
  Menu, X, Sparkles, Bug, FileText, Search,
  Home, Bell, UserCircle, Moon,
  List, Fence, Gamepad2Icon, File,
  ChartBarBig, TicketPercent, Command,
  Radio, Globe2, Layers, Compass, ArrowUpRight,
  RefreshCw, CheckCircle2, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter, notFound } from "next/navigation";
import { toast } from "sonner";
import { FcComments, FcFeedback } from "react-icons/fc";
import { Icon2fa, IconAnalyze, IconBrandStorybook, IconReport, IconSeo } from "@tabler/icons-react";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Core Control",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Overview" },
      { href: "/admin/users", icon: Users, label: "User Directory", badge: "Live" },
      { href: "/admin/transactions", icon: CreditCard, label: "Transactions", badge: "Stripe/PayPal" },
      { href: "/admin/promo", icon: TicketPercent, label: "Promo Codes" },
    ]
  },
  {
    group: "Content Studio",
    items: [
      { href: "/admin/content-analytics", icon: IconAnalyze, label: "Content Analytics" },
      { href: "/admin/success-stories", icon: IconBrandStorybook, label: "Success Stories" },
      { href: "/admin/blog", icon: File, label: "Blog Console" },
    ]
  },
  {
    group: "AI & Intelligence",
    items: [
      { href: "/admin/content", icon: FileText, label: "Content Vault" },
      { href: "/admin/reports", icon: IconReport, label: "Reports Deck" },
      { href: "/admin/ai-models", icon: Cpu, label: "AI Models" },
      { href: "/admin/bugs", icon: Bug, label: "Bug Tracker" },
      { href: "/admin/support", icon: Terminal, label: "Support Console" },
    ]
  },
  {
    group: "Analytics & Growth",
    items: [
      { href: "/admin/tools-analytics", icon: ChartBarBig, label: "Tools Stats" },
      { href: "/admin/analytics", icon: BarChart3, label: "Platform Analytics" },
      { href: "/admin/feedback", icon: Fence, label: "Feedback & Reviews" },
      { href: "/admin/seo", icon: IconSeo, label: "SEO Console" },
    ]
  },
  {
    group: "Dev Utilities",
    items: [
      { href: "/admin/faker", icon: Gamepad2Icon, label: "Mock Data Engine" },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [latency, setLatency] = useState(14);
  const [systemTime, setSystemTime] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Responsive check
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, []);

  // Security Protocol: Admin Only
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setIsAuthorized(false);
      setCheckingAuth(false);
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      setIsAuthorized(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // Mobile resize listener
  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Dynamic latency ping simulator & clock
  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(Math.floor(12 + Math.random() * 8));
      const now = new Date();
      setSystemTime(now.toLocaleTimeString("en-US", { hour12: false }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Close sidebar on mobile route change
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Filtered Nav Items
  const filteredNavGroups = useMemo(() => {
    if (!navSearch.trim()) return NAV_GROUPS;
    const query = navSearch.toLowerCase();
    return NAV_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(query) || 
        item.href.toLowerCase().includes(query)
      )
    })).filter(group => group.items.length > 0);
  }, [navSearch]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07070a] text-neutral-200 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
            <div className="absolute inset-1.5 rounded-full border-2 border-purple-500/20 border-b-purple-500 animate-spin" style={{ animationDuration: "0.7s" }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[11px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
              Authenticating Admin...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-neutral-100 flex flex-col lg:flex-row overflow-hidden font-sans antialiased selection:bg-red-500/20 selection:text-red-200">
      {/* Background Ambience / Mesh Grids */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      </div>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-white/[0.08] bg-[#07070a]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/[0.06] rounded-xl text-neutral-400 hover:text-white transition-all border border-white/[0.06] active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-neutral-200">
              Paperxify Admin
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{latency}ms</span>
          </div>
          <div className="h-7 w-7 rounded-lg border border-red-500/30 overflow-hidden relative p-[1px] bg-neutral-900 shadow-md">
            <img 
              src="https://lh3.googleusercontent.com/a/ACg8ocI9Nfqu4mJ19RkFL1qfLd9nurbxz9pXNE0WJpBgHYexk30uZ-4X=s96-c" 
              alt="Admin Avatar" 
              className="object-cover h-full w-full rounded-[6px]"
            />
          </div>
        </div>
      </header>

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside 
        id="admin-sidebar"
        className={cn(
          "fixed lg:relative z-40 border-r border-white/[0.08] bg-[#0a0a0f]/95 lg:bg-[#08080c]/80 backdrop-blur-2xl transition-all duration-300 flex flex-col h-full",
          isSidebarOpen 
            ? "translate-x-0 w-72" 
            : "-translate-x-full lg:translate-x-0 lg:w-[76px]"
        )}
        style={{
          height: isMobile ? 'calc(100dvh - 53px)' : '100vh',
          top: isMobile ? '53px' : '0',
        }}
      >
        {/* Brand Banner */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className={cn("flex items-center gap-3 overflow-hidden transition-all", !isSidebarOpen && "lg:justify-center lg:w-full")}>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-purple-600 p-[1px] flex-shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <div className="h-full w-full bg-[#0a0a0f] rounded-[11px] flex items-center justify-center">
                <ShieldCheck size={16} className="text-red-400" />
              </div>
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold tracking-[0.15em] text-white uppercase">
                    Paperxify
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                    Admin
                  </span>
                </div>
                <span className="text-[9px] font-mono text-neutral-400 tracking-wider">
                  Management Console
                </span>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-1.5 hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-lg text-neutral-400 hover:text-white transition-all hidden lg:flex items-center justify-center"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={14} />
          </button>
        </div>

        {/* Search / Filter in Sidebar (When expanded) */}
        {isSidebarOpen && (
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Jump to module..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-red-500/40 focus:bg-white/[0.05] transition-all"
              />
              {navSearch && (
                <button 
                  onClick={() => setNavSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Layers */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto custom-scrollbar">
          {filteredNavGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {isSidebarOpen ? (
                <div className="flex items-center justify-between px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-neutral-500">
                  <span>{group.group}</span>
                  <span className="text-[8px] text-neutral-600 font-mono font-normal">({group.items.length})</span>
                </div>
              ) : (
                <div className="h-px bg-white/[0.06] my-2 mx-2" />
              )}
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/admin" 
                    ? pathname === "/admin" 
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all group relative overflow-hidden",
                        isActive
                          ? "bg-indigo-500/10 text-white font-medium border border-indigo-500/25 shadow-sm"
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] border border-transparent"
                      )}
                      title={!isSidebarOpen ? item.label : undefined}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]" 
                        />
                      )}
                      
                      <div className={cn(
                        "flex items-center justify-center transition-all duration-200 flex-shrink-0",
                        isActive 
                          ? "text-indigo-400 scale-110" 
                          : "text-neutral-400 group-hover:text-neutral-200 group-hover:scale-105"
                      )}>
                        <Icon size={16} />
                      </div>

                      {isSidebarOpen && (
                        <span className="text-[12px] tracking-tight truncate flex-1">
                          {item.label}
                        </span>
                      )}

                      {isSidebarOpen && item.badge && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 group-hover:text-white border border-white/[0.06] transition-colors">
                          {item.badge}
                        </span>
                      )}

                      {isSidebarOpen && isActive && !item.badge && (
                        <ChevronRight size={12} className="text-indigo-400/80 ml-auto" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Footer Status & Exit */}
        <div className="p-3 border-t border-white/[0.08] bg-[#07070a]/80 space-y-2">
          {isSidebarOpen && (
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  API Gateway
                </span>
                <span className="text-emerald-400 font-bold">{latency}ms</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500">
                <span>MongoDB & Microservices</span>
                <span className="text-emerald-400">Connected</span>
              </div>
            </div>
          )}

          <button 
            onClick={() => router.push("/")} 
            className={cn(
              "w-full flex items-center gap-2.5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all group border border-transparent hover:border-white/[0.08] text-xs",
              !isSidebarOpen && "justify-center"
            )}
            title="Exit to Client App"
          >
            <LogOut size={15} className="group-hover:-translate-x-0.5 transition-transform text-neutral-400 group-hover:text-white" />
            {isSidebarOpen && (
              <span className="text-[11px] font-medium tracking-wide truncate">
                Exit to Website
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar flex flex-col h-screen bg-[#07070a]">
        {/* Desktop Top Command Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 border-b border-white/[0.08] bg-[#07070a]/80 backdrop-blur-xl px-8 py-3.5 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>System: Operational</span>
            </div>
            
            <div className="hidden xl:flex items-center gap-3 text-[10px] font-mono text-neutral-400">
              <span className="text-neutral-700">|</span>
              <span>Production Env</span>
              <span>Time: {systemTime || "Live"}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Admin Avatar & Pill */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-white tracking-wide">Om Avcher</p>
                <p className="text-[9px] font-mono text-indigo-400 font-medium tracking-wider uppercase">
                  Administrator
                </p>
              </div>
              <div className="h-9 w-9 rounded-xl border border-zinc-700 overflow-hidden shadow-md relative p-[1px] bg-zinc-800">
                <img 
                  src="https://lh3.googleusercontent.com/a/ACg8ocI9Nfqu4mJ19RkFL1qfLd9nurbxz9pXNE0WJpBgHYexk30uZ-4X=s96-c" 
                  alt="Admin" 
                  className="object-cover h-full w-full rounded-[10px] grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto pb-24 lg:pb-10 z-10">
          {children}
        </div>

        {/* Mobile Floating Bottom Bar */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-2xl border-t border-white/[0.08] py-2 px-4 shadow-2xl">
            <div className="grid grid-cols-4 gap-1">
              <MobileNavButton 
                href="/admin"
                icon={LayoutDashboard}
                label="Deck"
                active={pathname === "/admin"}
              />
              <MobileNavButton 
                href="/admin/users"
                icon={Users}
                label="Users"
                active={pathname.includes("/users")}
              />
              <MobileNavButton 
                href="/admin/transactions"
                icon={CreditCard}
                label="Finance"
                active={pathname.includes("/transactions")}
              />
              <MobileNavButton 
                onClick={() => setIsSidebarOpen(true)}
                icon={Menu}
                label="Modules"
              />
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}

function MobileNavButton({ 
  href, 
  icon: Icon, 
  label, 
  active,
  onClick 
}: { 
  href?: string; 
  icon: React.ElementType; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center py-1 rounded-xl transition-all border",
      active 
        ? "text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.1)] font-bold" 
        : "text-neutral-400 hover:text-neutral-200 border-transparent"
    )}>
      <Icon size={16} className={cn(active && "animate-pulse text-red-400")} />
      <span className="text-[9px] font-mono tracking-tight mt-0.5">{label}</span>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full">
        {content}
      </button>
    );
  }

  return (
    <Link href={href!} className="w-full">
      {content}
    </Link>
  );
}