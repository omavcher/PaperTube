"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  LayoutDashboard, Users, CreditCard, 
  Cpu, Settings, LogOut, ShieldAlert, 
  Terminal, Activity, BarChart3, ChevronRight, 
  Menu, X, Sparkles, Bug, FileText, Share2, Search,
  Home, Bell, UserCircle, Shield, Moon,
  List,
  Fence,
  Gamepad2Icon,
  File
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FcFeedback } from "react-icons/fc";
import { Icon2fa, IconAnalyze, IconBrandStorybook } from "@tabler/icons-react";

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
      if (user.email === "omawchar07@gmail.com") {
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

  // Don't render anything until authorization is checked
  if (!isAuthorized) {
    return null;
  }

  // Render the main layout
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 border-b border-white/5 bg-black/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            <span className="text-sm font-black uppercase italic tracking-tight text-red-500">Admin</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg text-neutral-500">
            <Bell size={18} />
          </button>
          <div className="h-8 w-8 rounded-full border border-red-600/30 overflow-hidden">
            <img 
              src="https://instagram.fnag6-3.fna.fbcdn.net/v/t51.2885-19/588716770_18107765224651561_1977598599250782792_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fnag6-3.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QGac27yPL45VW8hWPeWM3H4hJ0elgNS1P8-80daKBdg359aAPe8lDY5nnEK483r1AM&_nc_ohc=eY2X9DYxHI0Q7kNvwGJjgyc&_nc_gid=DM0O7pXnG5sI2ZxBoPN1hQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfpzYQFG0jeW5v8UuQ6K6SobwvpgfM4zTHZBls2hgggpQA&oe=69733117&_nc_sid=7a9f4b" 
              alt="admin" 
              className="object-cover h-full w-full"
            />
          </div>
        </div>
      </header>

      {/* Sidebar - Responsive */}
      <aside 
        id="admin-sidebar"
        className={cn(
          "fixed md:relative z-40 md:z-0 border-r border-white/5 bg-black/95 md:bg-black/60 backdrop-blur-3xl transition-all duration-300 flex flex-col h-full",
          isSidebarOpen 
            ? "translate-x-0 md:translate-x-0 w-64 md:w-72" 
            : "-translate-x-full md:translate-x-0 md:w-20"
        )}
        style={{
          height: isMobile ? 'calc(100vh - 60px)' : '100vh',
          top: isMobile ? '60px' : '0',
        }}
      >
        {/* Brand Section */}
        <div className="p-4 md:p-6 mb-2 md:mb-4 flex items-center justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="hidden md:block"
              >
                <span className="text-sm font-black uppercase italic tracking-[0.3em] text-red-500 flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  Admin_OS <span className="text-[8px] text-white/30 font-mono">v2.0</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors hidden md:block"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Layers */}
        <nav className="flex-1 px-2 md:px-4 space-y-1 overflow-y-auto custom-scrollbar pb-20 md:pb-10">
          {/* Core Systems */}
          <div className="mb-3 md:mb-4">
            <p className="px-2 md:px-4 py-1 md:py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">
              Core
            </p>
            <AdminNavLink 
              href="/admin" 
              icon={<LayoutDashboard size={isMobile ? 20 : 18} />} 
              label="Dashboard" 
              active={pathname === "/admin"} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
            <AdminNavLink 
              href="/admin/users" 
              icon={<Users size={isMobile ? 20 : 18} />} 
              label="Users" 
              active={pathname.includes("/users")} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
            <AdminNavLink 
              href="/admin/transactions" 
              icon={<CreditCard size={isMobile ? 20 : 18} />} 
              label="Transactions" 
              active={pathname.includes("/transactions")} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
          </div>  


          {/*  Content Bank */}
          <div className="mb-3 md:mb-4">
            <p className="px-2 md:px-4 py-1 md:py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">
              Content Bank
            </p>
    <AdminNavLink 
  href="/admin/content-analytics"
  icon={<IconAnalyze size={isMobile ? 20 : 18} />}
  label="Content Analytics"
  active={pathname.includes("/content-analytics")}
  expanded={isSidebarOpen}
  mobile={isMobile}
/>

            <AdminNavLink 
  href="/admin/success-stories" 
  icon={<IconBrandStorybook  size={isMobile ? 20 : 18} />} 
  label="Success Stories" 
  active={pathname.includes("/success-stories")} 
  expanded={isSidebarOpen} 
  mobile={isMobile}
/>

<AdminNavLink 
  href="/admin/blog" 
  icon={<File  size={isMobile ? 20 : 18} />} 
  label="Blog Console" 
  active={pathname.includes("/blog")} 
  expanded={isSidebarOpen} 
  mobile={isMobile}
/>

          </div>     






          {/* Intelligence Ops */}
          <div className="mb-3 md:mb-4">
            <p className="px-2 md:px-4 py-1 md:py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">
              Intelligence
            </p>
            <AdminNavLink 
              href="/admin/content" 
              icon={<FileText size={isMobile ? 20 : 18} />} 
              label="Content" 
              active={pathname.includes("/content")} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
            <AdminNavLink 
              href="/admin/ai-models" 
              icon={<Cpu size={isMobile ? 20 : 18} />} 
              label="AI Models" 
              active={pathname.includes("/ai-models")} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
            <AdminNavLink 
              href="/admin/bugs" 
              icon={<Bug size={isMobile ? 20 : 18} />} 
              label="Bug Reports" 
              active={pathname.includes("/bugs")} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
          </div>


          {/* Analytics */}
          <div className="mb-3 md:mb-4">
            <p className="px-2 md:px-4 py-1 md:py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">
              Analytics
            </p>
            <AdminNavLink 
              href="/admin/analytics" 
              icon={<BarChart3 size={isMobile ? 20 : 18} />} 
              label="Analytics" 
              active={pathname.includes("/analytics")} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
              <AdminNavLink
    href="/admin/feedback"
    icon={<Fence size={isMobile ? 20 : 18} />}
    label="Feedback"
    active={pathname.includes("/feedback")}
    expanded={isSidebarOpen}
    mobile={isMobile}
  />
  <AdminNavLink
    href="/admin/arced"
    icon={<Gamepad2Icon size={isMobile ? 20 : 18} />}
    label="ARCED"
    active={pathname.includes("/arced")}
    expanded={isSidebarOpen}
    mobile={isMobile}
  />
          </div>

          {/* Settings */}
          <div className="mb-3 md:mb-4">
            <p className="px-2 md:px-4 py-1 md:py-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">
              System
            </p>
            <AdminNavLink 
              href="/admin/settings" 
              icon={<Settings size={isMobile ? 20 : 18} />} 
              label="Settings" 
              active={pathname.includes("/settings")} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
            <AdminNavLink 
              href="/admin/security" 
              icon={<Shield size={isMobile ? 20 : 18} />} 
              label="Security" 
              active={pathname.includes("/security")} 
              expanded={isSidebarOpen} 
              mobile={isMobile}
            />
          </div>
        </nav>

        {/* System Exit */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 border-t border-white/5 bg-black/95 backdrop-blur-xl">
          <button 
            onClick={() => router.push("/")} 
            className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl text-neutral-500 hover:text-red-500 hover:bg-red-500/5 transition-all group"
          >
            <LogOut size={isMobile ? 18 : 16} className="group-hover:translate-x-1 transition-transform" />
            {isSidebarOpen && (
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                Logout
              </span>
            )}
          </button>
          
          {/* Mobile quick actions */}
          {isMobile && isSidebarOpen && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 text-neutral-400 hover:text-white transition-colors">
                <Home size={14} />
                <span className="text-[8px] mt-1">Home</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 text-neutral-400 hover:text-white transition-colors">
                <Moon size={14} />
                <span className="text-[8px] mt-1">Theme</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 text-neutral-400 hover:text-white transition-colors">
                <UserCircle size={14} />
                <span className="text-[8px] mt-1">Profile</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar pt-0 md:pt-0">
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 md:px-8 py-4 md:py-6 items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">
                System Handshake: Stable
              </h2>
              <span className="text-[8px] font-mono text-neutral-700 tracking-tighter">
                SECURE_NODE_07 // {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase text-white leading-none">OM AWCHAR</p>
              <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">Prime Architect</p>
            </div>
            <div className="h-8 md:h-10 w-8 md:w-10 rounded-xl border border-red-600/30 overflow-hidden shadow-lg relative group cursor-pointer">
              <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src="https://lh3.googleusercontent.com/a/ACg8ocI9Nfqu4mJ19RkFL1qfLd9nurbxz9pXNE0WJpBgHYexk30uZ-4X=s96-c" 
                alt="admin" 
                className="object-cover h-full w-full grayscale group-hover:grayscale-0 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Breadcrumb for mobile */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl px-4 py-2 border-b border-white/5 md:hidden">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Home size={12} />
              <span>/</span>
              <span className="font-medium text-white capitalize">
                {pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-80px)]">
          {children}
        </div>

        {/* Mobile Navigation Bar */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/5 py-2 px-4 md:hidden">
            <div className="grid grid-cols-4 gap-1">
              <MobileNavButton 
                href="/admin"
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                active={pathname === "/admin"}
              />
              <MobileNavButton 
                href="/admin/users"
                icon={<Users size={20} />}
                label="Users"
                active={pathname.includes("/users")}
              />
              <MobileNavButton 
                href="/admin/transactions"
                icon={<CreditCard size={20} />}
                label="Finance"
                active={pathname.includes("/transactions")}
              />
              <MobileNavButton 
                onClick={() => setIsSidebarOpen(true)}
                icon={<Menu size={20} />}
                label="Menu"
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
        "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all group relative overflow-hidden",
        active 
          ? "bg-red-600 text-white shadow-[0_5px_15px_-5px_rgba(220,38,38,0.5)]" 
          : "text-neutral-500 hover:text-white hover:bg-white/5"
      )}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
      )}
      
      <div className={cn(
        "transition-transform group-hover:scale-110", 
        active && "text-white",
        mobile ? "text-xl" : "text-base"
      )}>
        {icon}
      </div>
      {expanded && (
        <span className="text-xs md:text-[10px] font-bold md:font-black uppercase tracking-widest whitespace-nowrap">
          {label}
        </span>
      )}
      {active && expanded && (
        <ChevronRight size={mobile ? 16 : 14} className="ml-auto opacity-40 animate-pulse" />
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
      "flex flex-col items-center justify-center p-2 rounded-xl transition-all",
      active 
        ? "text-red-500 bg-red-500/10" 
        : "text-neutral-400 hover:text-white"
    )}>
      <div className={cn(active && "animate-pulse")}>
        {icon}
      </div>
      <span className="text-[10px] font-medium mt-1">{label}</span>
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