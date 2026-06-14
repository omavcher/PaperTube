"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  LayoutDashboard, Users, CreditCard, 
  Cpu, LogOut, ShieldAlert, 
  Terminal, Activity, BarChart3, ChevronRight, 
  Menu, X, Sparkles, Bug, FileText, Share2, Search,
  Home, Bell, UserCircle, Moon,
  List,
  Fence,
  Gamepad2Icon,
  File,
  ChartBarBig,
  TicketPercent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FcComments, FcFeedback } from "react-icons/fc";
import { Icon2fa, IconAnalyze, IconBrandStorybook, IconReport } from "@tabler/icons-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check if mobile - Moved to top level
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, []);

  // Security Protocol: Admin Only
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.email ===process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        toast.error("Unauthorized access detected");
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  }, [router]);

  // Check mobile on mount and resize
  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const sidebar = document.getElementById('admin-sidebar');
        const menuButton = document.getElementById('mobile-menu-button');
        
        if (sidebar && !sidebar.contains(e.target as Node) && 
            menuButton && !menuButton.contains(e.target as Node)) {
          setIsSidebarOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isSidebarOpen]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Render the main layout
  return (
    <div className="min-h-screen bg-[#020202] text-neutral-200 flex flex-col md:flex-row overflow-hidden font-sans select-none antialiased">
      {/* High-tech ambient background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 border-b border-neutral-800/40 bg-neutral-950/70 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="mobile-menu-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 transition-colors border border-transparent hover:border-neutral-800"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-red-500 font-bold">Admin_OS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-neutral-500 tracking-tight">PING: 14ms</span>
          <div className="h-7 w-7 rounded-lg border border-red-500/20 overflow-hidden relative p-[1px] bg-neutral-950">
            <img 
              src="https://lh3.googleusercontent.com/a/ACg8ocI9Nfqu4mJ19RkFL1qfLd9nurbxz9pXNE0WJpBgHYexk30uZ-4X=s96-c" 
              alt="admin" 
              className="object-cover h-full w-full rounded-md grayscale"
            />
          </div>
        </div>
      </header>

      {/* Sidebar - Responsive */}
      <aside 
        id="admin-sidebar"
        className={cn(
          "fixed md:relative z-40 md:z-0 border-r border-neutral-900 bg-neutral-950/80 md:bg-neutral-950/40 backdrop-blur-md transition-all duration-300 flex flex-col h-full",
          isSidebarOpen 
            ? "translate-x-0 md:translate-x-0 w-64 md:w-68" 
            : "-translate-x-full md:translate-x-0 md:w-20"
        )}
        style={{
          height: isMobile ? 'calc(100dvh - 49px)' : '100vh',
          top: isMobile ? '49px' : '0',
        }}
      >
        {/* Brand Section */}
        <div className="p-4 md:p-5 flex items-center justify-between border-b border-neutral-900/60 mb-2">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="hidden md:flex items-center gap-2"
              >
                <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_#ef4444]" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-neutral-400 font-mono">
                  Admin_OS <span className="text-[8px] text-neutral-600">v2.1</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors hidden md:block"
          >
            {isSidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>

        {/* Navigation Layers */}
        <nav className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar pb-24 md:pb-8">
          {/* Core Systems */}
          <div>
            <p className={cn("px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 transition-opacity", !isSidebarOpen && "opacity-0 md:h-0 overflow-hidden py-0")}>
              Core
            </p>
            <div className="space-y-1 mt-1">
              <AdminNavLink 
                href="/admin" 
                icon={<LayoutDashboard size={isMobile ? 18 : 16} />} 
                label="Dashboard" 
                active={pathname === "/admin"} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/users" 
                icon={<Users size={isMobile ? 18 : 16} />} 
                label="Users" 
                active={pathname.includes("/users")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/transactions" 
                icon={<CreditCard size={isMobile ? 18 : 16} />} 
                label="Transactions" 
                active={pathname.includes("/transactions")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/promo" 
                icon={<TicketPercent size={isMobile ? 18 : 16} />} 
                label="Promo Codes" 
                active={pathname.includes("/promo")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
            </div>
          </div>  

          {/* Content Bank */}
          <div>
            <p className={cn("px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 transition-opacity", !isSidebarOpen && "opacity-0 md:h-0 overflow-hidden py-0")}>
              Content Bank
            </p>
            <div className="space-y-1 mt-1">
              <AdminNavLink 
                href="/admin/content-analytics"
                icon={<IconAnalyze size={isMobile ? 18 : 16} />}
                label="Content Analytics"
                active={pathname.includes("/content-analytics")}
                expanded={isSidebarOpen}
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/success-stories" 
                icon={<IconBrandStorybook size={isMobile ? 18 : 16} />} 
                label="Stories" 
                active={pathname.includes("/success-stories")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/blog" 
                icon={<File size={isMobile ? 18 : 16} />} 
                label="Blog Console" 
                active={pathname.includes("/blog")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
            </div>
          </div>     

          {/* Intelligence Ops */}
          <div>
            <p className={cn("px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 transition-opacity", !isSidebarOpen && "opacity-0 md:h-0 overflow-hidden py-0")}>
              Intelligence
            </p>
            <div className="space-y-1 mt-1">
              <AdminNavLink 
                href="/admin/content" 
                icon={<FileText size={isMobile ? 18 : 16} />} 
                label="Content" 
                active={pathname.includes("/content")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/reports" 
                icon={<IconReport size={isMobile ? 18 : 16} />} 
                label="Reports" 
                active={pathname.includes("/reports")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />

              <AdminNavLink 
                href="/admin/ai-models" 
                icon={<Cpu size={isMobile ? 18 : 16} />} 
                label="AI Models" 
                active={pathname.includes("/ai-models")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/bugs" 
                icon={<Bug size={isMobile ? 18 : 16} />} 
                label="Bug Reports" 
                active={pathname.includes("/bugs")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/support" 
                icon={<Terminal size={isMobile ? 18 : 16} />} 
                label="Support" 
                active={pathname.includes("/support")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
            </div>
          </div>

          {/* Analytics */}
          <div>
            <p className={cn("px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 transition-opacity", !isSidebarOpen && "opacity-0 md:h-0 overflow-hidden py-0")}>
              Analytics
            </p>
            <div className="space-y-1 mt-1">
              <AdminNavLink 
                href="/admin/tools-analytics" 
                icon={<ChartBarBig size={isMobile ? 18 : 16} />} 
                label="Tools Stats" 
                active={pathname.includes("/tools-analytics")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink 
                href="/admin/analytics" 
                icon={<BarChart3 size={isMobile ? 18 : 16} />} 
                label="Analytics" 
                active={pathname.includes("/analytics")} 
                expanded={isSidebarOpen} 
                mobile={isMobile}
              />
              <AdminNavLink
                href="/admin/feedback"
                icon={<Fence size={isMobile ? 18 : 16} />}
                label="Feedback"
                active={pathname.includes("/feedback")}
                expanded={isSidebarOpen}
                mobile={isMobile}
              />

            </div>
          </div>

        </nav>

        {/* System Exit */}
        <div className="p-3 border-t border-neutral-900 bg-neutral-950/90 backdrop-blur-md">
          <button 
            onClick={() => router.push("/")} 
            className="w-full flex items-center gap-3 p-2.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/5 transition-all group border border-transparent hover:border-red-500/10"
          >
            <LogOut size={15} className="group-hover:translate-x-0.5 transition-transform" />
            {isSidebarOpen && (
              <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap font-mono">
                Exit Protocol
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar flex flex-col h-screen">
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-40 border-b border-neutral-900 bg-neutral-950/30 backdrop-blur-md px-6 py-3.5 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <div className="flex flex-col">
              <h2 className="text-[9px] font-mono tracking-[0.3em] uppercase text-neutral-400 font-bold leading-tight">
                NODE_HANDSHAKE: STABLE
              </h2>
              <span className="text-[8px] font-mono text-neutral-600 tracking-tighter mt-0.5">
                SECURE_GATEWAY // PING: 12ms // STACK_NODE_07
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] font-bold text-white uppercase font-sans tracking-wide">OM Avcher</p>
              <p className="text-[8px] font-mono text-red-500/80 uppercase tracking-widest mt-0.5">Prime Architect</p>
            </div>
            <div className="h-8 w-8 rounded-lg border border-red-500/20 overflow-hidden shadow-lg relative group cursor-pointer p-[1px] bg-neutral-950">
              <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src="https://lh3.googleusercontent.com/a/ACg8ocI9Nfqu4mJ19RkFL1qfLd9nurbxz9pXNE0WJpBgHYexk30uZ-4X=s96-c" 
                alt="admin" 
                className="object-cover h-full w-full rounded grayscale transition-all duration-300"
              />
            </div>
          </div>
        </header>

        {/* Breadcrumb for mobile */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md px-4 py-2 border-b border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
              <Home size={10} className="text-neutral-600" />
              <span>/</span>
              <span className="font-semibold text-neutral-300 uppercase tracking-wider">
                {pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
            <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8 z-10">
          {children}
        </div>

        {/* Mobile Navigation Bar */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-t border-neutral-900 py-1.5 px-4">
            <div className="grid grid-cols-4 gap-1">
              <MobileNavButton 
                href="/admin"
                icon={<LayoutDashboard size={16} />}
                label="Deck"
                active={pathname === "/admin"}
              />
              <MobileNavButton 
                href="/admin/users"
                icon={<Users size={16} />}
                label="Users"
                active={pathname.includes("/users")}
              />
              <MobileNavButton 
                href="/admin/transactions"
                icon={<CreditCard size={16} />}
                label="Finance"
                active={pathname.includes("/transactions")}
              />
              <MobileNavButton 
                onClick={() => setIsSidebarOpen(true)}
                icon={<Menu size={16} />}
                label="More"
              />
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}

function AdminNavLink({ 
  href, 
  icon, 
  label, 
  active, 
  expanded, 
  mobile 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  expanded: boolean; 
  mobile?: boolean;
}) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-xl transition-all group relative overflow-hidden border",
        active 
          ? "bg-gradient-to-r from-red-500/10 to-red-500/0 text-red-400 border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.08)] font-semibold" 
          : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02] border-transparent"
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-red-500 rounded-r shadow-[0_0_6px_#ef4444]" />
      )}
      
      <div className={cn(
        "transition-transform group-hover:scale-105", 
        active ? "text-red-400" : "text-neutral-400 group-hover:text-neutral-300",
        mobile ? "text-lg" : "text-sm"
      )}>
        {icon}
      </div>
      {expanded && (
        <span className="text-[10px] font-mono tracking-wider font-bold uppercase whitespace-nowrap">
          {label}
        </span>
      )}
      {active && expanded && (
        <ChevronRight size={mobile ? 12 : 10} className="ml-auto text-red-500/60 animate-pulse" />
      )}
    </Link>
  );
}

function MobileNavButton({ 
  href, 
  icon, 
  label, 
  active,
  onClick 
}: { 
  href?: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center py-1 rounded-lg transition-all border border-transparent",
      active 
        ? "text-red-400 bg-red-500/5 border-red-500/10" 
        : "text-neutral-500 hover:text-neutral-300"
    )}>
      <div className={cn(active && "animate-pulse")}>
        {icon}
      </div>
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