"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBrandTabler,
  IconRobot,
  IconBrandYoutube,
  IconPresentation,
  IconPencil,
  IconBookmark,
  IconSchool,
  IconFileText,
  IconCode,
  IconTrophy,
  IconSettings,
  IconHistory,
  IconChevronDown,
  IconRefresh,
  IconArrowLeft,
  IconUser,
  IconUserBolt,
  IconLogout,
  IconSparkles,
  IconCrown,
  IconTrash,
  IconSearch,
  IconLayoutGrid,
  IconClock,
  IconArrowUpRight,
  IconChevronRight,
  IconCalculator,
  IconCalendar,
  IconHelpCircle,
  IconLayersLinked,
  IconLanguage
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink, Links } from "@/components/ui/sidebar";
import api from "@/config/api";
import { toast } from "sonner";

interface DesktopSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  isLoggedIn: boolean;
  user: any;
  tokenInfo: any;
  onLogout: () => void;
  onOpenLogin: () => void;
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "";
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function DesktopSidebar({
  isExpanded,
  onToggle,
  isLoggedIn,
  user,
  tokenInfo,
  onLogout,
  onOpenLogin
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Hover preview when collapsed (Aceternity UI behavior)
  const [isHovered, setIsHovered] = useState(false);
  const [justCollapsed, setJustCollapsed] = useState(false);
  const isOpen = isExpanded || (isHovered && !justCollapsed);

  const handleCollapse = () => {
    setJustCollapsed(true);
    setIsHovered(false);
    onToggle();
  };

  const handleExpand = () => {
    setJustCollapsed(false);
    if (!isExpanded) {
      onToggle();
    }
  };

  // Dynamic User details & plan status
  const userName = isLoggedIn ? (user?.name || "User") : "Guest User";
  const userAvatar = user?.picture || "/avatar.png";
  const isPro = Boolean(
    user?.membership?.isActive || 
    tokenInfo?.isSubscribed || 
    user?.membership?.planId === "pro" || 
    user?.membership?.planId === "power"
  );
  const planName = user?.membership?.planName || tokenInfo?.planName || (isPro ? "Pro Scholar" : "Free Plan");

  // History / Creations State
  const [creations, setCreations] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'workspace' | 'notes' | 'ppt' | 'whiteboard' | 'quiz'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Accordion state for secondary tool suites
  const [activeSuite, setActiveSuite] = useState<'study' | 'writer' | 'dev' | null>(() => {
    if (pathname.startsWith('/ai-study')) return 'study';
    if (pathname.startsWith('/ai-writer') || pathname.startsWith('/ai-diagram')) return 'writer';
    if (pathname.startsWith('/tools') || pathname === '/leaderboard' || pathname.startsWith('/blog')) return 'dev';
    return null;
  });

  useEffect(() => {
    if (pathname.startsWith('/ai-study')) setActiveSuite('study');
    else if (pathname.startsWith('/ai-writer') || pathname.startsWith('/ai-diagram')) setActiveSuite('writer');
    else if (pathname.startsWith('/tools') || pathname === '/leaderboard' || pathname.startsWith('/blog')) setActiveSuite('dev');
  }, [pathname]);

  // Fetch creations from backend or local storage
  const fetchCreations = useCallback(async () => {
    let localAgentSessions: any[] = [];
    try {
      const stored = localStorage.getItem("paperxify_agent_sessions_list");
      if (stored) {
        const parsed = JSON.parse(stored);
        localAgentSessions = (Array.isArray(parsed) ? parsed : []).map((s: any) => ({
          id: s.slug,
          _id: s.slug,
          type: 'workspace',
          typeLabel: 'AI Workspace',
          title: s.title || 'Workspace Session',
          slug: s.slug,
          url: `/workspace/${s.slug}`,
          createdAt: s.updatedAt || new Date().toISOString()
        }));
      }
    } catch {}

    if (isLoggedIn) {
      try {
        setHistoryLoading(true);
        const token = localStorage.getItem("authToken");
        const res = await api.get(`/users/creations/recent?limit=30&type=${historyFilter === 'workspace' ? 'agent' : historyFilter}&search=${encodeURIComponent(historySearch)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serverCreations = res.data.success ? (res.data.data || []) : [];

        const seenKeys = new Set<string>();
        const merged: any[] = [];

        for (const item of localAgentSessions) {
          const key = item.slug || item.id || item._id;
          if (key && !seenKeys.has(key)) {
            seenKeys.add(key);
            merged.push(item);
          }
        }

        for (const item of serverCreations) {
          const key = item.slug || item.id || item._id;
          if (key && !seenKeys.has(key)) {
            seenKeys.add(key);
            merged.push({
              ...item,
              type: item.type === 'agent' ? 'workspace' : item.type
            });
          }
        }

        let filtered = merged;
        if (historyFilter !== 'all') {
          filtered = filtered.filter((i: any) => i.type === historyFilter);
        }
        if (historySearch) {
          filtered = filtered.filter((i: any) => i.title?.toLowerCase().includes(historySearch.toLowerCase()));
        }

        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCreations(filtered.slice(0, 30));
      } catch {
        let filtered = localAgentSessions;
        if (historyFilter !== 'all') {
          filtered = filtered.filter((i: any) => i.type === historyFilter);
        }
        setCreations(filtered);
      } finally {
        setHistoryLoading(false);
      }
    } else {
      try {
        const local = localStorage.getItem("paperxify_local_history");
        const parsed = local ? JSON.parse(local) : [];
        const merged = [...localAgentSessions, ...(Array.isArray(parsed) ? parsed : [])];
        let filtered = merged;
        if (historyFilter !== 'all') {
          filtered = filtered.filter((i: any) => i.type === historyFilter);
        }
        if (historySearch) {
          filtered = filtered.filter((i: any) => i.title?.toLowerCase().includes(historySearch.toLowerCase()));
        }
        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCreations(filtered.slice(0, 20));
      } catch {
        setCreations(localAgentSessions);
      }
    }
  }, [isLoggedIn, historyFilter, historySearch]);

  useEffect(() => {
    fetchCreations();
    const handleCreationSaved = () => fetchCreations();
    window.addEventListener("creation-saved", handleCreationSaved);
    return () => window.removeEventListener("creation-saved", handleCreationSaved);
  }, [fetchCreations]);

  const handleDeleteCreation = async (type: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setDeletingId(id);

      if (type === 'workspace' || type === 'agent') {
        try {
          const stored = localStorage.getItem("paperxify_agent_sessions_list");
          if (stored) {
            const list = JSON.parse(stored).filter((s: any) => s.slug !== id);
            localStorage.setItem("paperxify_agent_sessions_list", JSON.stringify(list));
          }
          localStorage.removeItem(`paperxify_agent_chat_${id}`);
        } catch {}
      }

      if (isLoggedIn) {
        const token = localStorage.getItem("authToken");
        await api.delete(`/users/creations/${type === 'workspace' ? 'agent' : type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setCreations(prev => prev.filter(item => item.id !== id && item._id !== id && item.slug !== id));
      toast.success("Removed from history");
    } catch {
      toast.error("Failed to delete creation");
    } finally {
      setDeletingId(null);
    }
  };

  const getCreationIcon = (type: string) => {
    switch (type) {
      case 'workspace':
      case 'agent':
        return <IconRobot size={14} className="text-red-400 shrink-0" />;
      case 'notes':
        return <IconBrandYoutube size={14} className="text-red-500 shrink-0" />;
      case 'presentation':
      case 'ppt':
        return <IconPresentation size={14} className="text-orange-400 shrink-0" />;
      case 'quiz':
        return <IconHelpCircle size={14} className="text-purple-400 shrink-0" />;
      case 'whiteboard':
        return <IconPencil size={14} className="text-violet-400 shrink-0" />;
      case 'study':
        return <IconSchool size={14} className="text-cyan-400 shrink-0" />;
      default:
        return <IconSparkles size={14} className="text-amber-400 shrink-0" />;
    }
  };

  const coreLinks: Links[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: <IconBrandTabler className={cn("h-5 w-5 shrink-0 transition-colors", pathname === "/" || pathname === "/dashboard" ? "text-red-500" : "text-neutral-400")} />,
      active: pathname === "/" || pathname === "/dashboard",
    },
    {
      label: "AI Workspace",
      href: "/workspace",
      icon: <IconRobot className={cn("h-5 w-5 shrink-0 transition-colors", pathname.startsWith("/workspace") ? "text-red-500" : "text-red-400")} />,
      badge: "STUDIO",
      badgeVariant: "red",
      active: pathname.startsWith("/workspace"),
    },
    {
      label: "YouTube to Notes",
      href: "/youtube-to-notes",
      icon: <IconBrandYoutube className={cn("h-5 w-5 shrink-0 transition-colors", pathname === "/youtube-to-notes" ? "text-red-500" : "text-red-400")} />,
      badge: "HOT",
      badgeVariant: "red",
      active: pathname === "/youtube-to-notes",
    },
    {
      label: "AI Presentation (PPT)",
      href: "/presentation-generator",
      icon: <IconPresentation className={cn("h-5 w-5 shrink-0 transition-colors", pathname === "/presentation-generator" ? "text-orange-400" : "text-neutral-400")} />,
      active: pathname === "/presentation-generator",
    },
    {
      label: "Whiteboard Studio",
      href: "/whiteboard",
      icon: <IconPencil className={cn("h-5 w-5 shrink-0 transition-colors", pathname.startsWith("/whiteboard") ? "text-violet-400" : "text-neutral-400")} />,
      badge: "AI",
      badgeVariant: "violet",
      active: pathname.startsWith("/whiteboard"),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <IconUser className={cn("h-5 w-5 shrink-0 transition-colors", pathname === "/profile" ? "text-white" : "text-neutral-400")} />,
      active: pathname === "/profile",
    },
  ];

  return (
    <div
      onMouseEnter={() => {
        if (!justCollapsed) setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setJustCollapsed(false);
      }}
      className="hidden lg:block fixed inset-y-0 left-0 z-[110]"
    >
      <Sidebar open={isOpen} setOpen={setIsHovered} animate={true}>
        <SidebarBody className="justify-between gap-3 h-screen p-2.5 bg-[#070709]/95 backdrop-blur-2xl border-r border-white/[0.08] shadow-[4px_0_30px_rgba(0,0,0,0.85)]">
          
          {/* ──── TOP AREA: LOGO & SCROLLABLE LINKS ──── */}
          <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto no-scrollbar space-y-4">
            
            {/* 1. Aceternity Logo / LogoIcon */}
            {isOpen ? (
              <PaperxifyLogo onToggle={handleCollapse} />
            ) : (
              <PaperxifyLogoIcon onToggle={handleExpand} />
            )}

            {/* 2. Main Workspace Links */}
            <div className="space-y-0.5">
              {isOpen && (
                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5 whitespace-pre">
                  Workspace & Studio
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {coreLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>

            {/* 3. Recent Sessions History */}
            <div className="pt-2 border-t border-white/[0.05]">
              <div className={cn("flex items-center justify-between px-2 mb-1", !isOpen && "justify-center px-0")}>
                {isOpen ? (
                  <>
                    <button
                      onClick={() => setHistoryExpanded(!historyExpanded)}
                      className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      <IconHistory size={12} className="text-red-500" />
                      <span>Recent Sessions ({creations.length})</span>
                      <IconChevronDown size={11} className={cn("transition-transform duration-200", historyExpanded && "rotate-180")} />
                    </button>
                    <button
                      onClick={fetchCreations}
                      title="Refresh recent sessions"
                      className="p-1 rounded text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <IconRefresh size={11} className={cn(historyLoading && "animate-spin text-red-400")} />
                    </button>
                  </>
                ) : (
                  <div className="flex justify-center w-full">
                    <button
                      onClick={handleExpand}
                      title={`Recent Sessions (${creations.length})`}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer mx-auto"
                    >
                      <IconHistory size={18} className="text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              {isOpen && historyExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 pt-1"
                >
                  {/* Search Input */}
                  <div className="relative px-1">
                    <IconSearch size={12} className="absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search sessions..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full bg-[#0e0e12] border border-white/[0.06] rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-neutral-300 placeholder:text-neutral-500 focus:outline-none focus:border-red-500/40 transition-colors"
                    />
                  </div>

                  {/* List of Sessions */}
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {historyLoading && creations.length === 0 ? (
                      <div className="py-4 text-center text-xs text-neutral-500">Loading...</div>
                    ) : creations.length === 0 ? (
                      <div className="py-3 px-2 text-center rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[11px] text-neutral-400">No sessions yet</p>
                        <Link
                          href="/workspace"
                          className="text-[10px] text-red-400 hover:underline mt-1 block"
                        >
                          Start your first session →
                        </Link>
                      </div>
                    ) : (
                      creations.map((item) => (
                        <Link
                          key={item.id || item._id}
                          href={item.url || `/notes/${item.slug}`}
                          className="group flex items-center justify-between p-1.5 rounded-lg bg-[#0e0e12]/80 hover:bg-[#16161d] border border-white/[0.04] hover:border-white/10 transition-all text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            <div className="p-1 rounded bg-black/40 border border-white/[0.06] shrink-0">
                              {getCreationIcon(item.type)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-neutral-200 group-hover:text-white truncate leading-tight">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-[9px] text-neutral-500 mt-0.5">
                                <span className="capitalize">{item.typeLabel || item.type}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <IconClock size={8} />
                                  {formatRelativeTime(item.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDeleteCreation(item.type, item.id || item._id, e)}
                              title="Delete"
                              disabled={deletingId === (item.id || item._id)}
                              className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <IconTrash size={12} />
                            </button>
                            <div className="p-1 text-neutral-400 group-hover:text-white">
                              <IconArrowUpRight size={12} />
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 4. AI Suites & Matrix */}
            <div className="pt-2 border-t border-white/[0.05] space-y-1">
              {isOpen && (
                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1 whitespace-pre">
                  AI Suites & Tools
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                <SidebarLink
                  link={{
                    label: "AI Study Room",
                    href: "/ai-study",
                    icon: <IconSchool className={cn("h-5 w-5 shrink-0 transition-colors", pathname.startsWith("/ai-study") ? "text-cyan-400" : "text-neutral-400")} />,
                    active: pathname.startsWith("/ai-study"),
                  }}
                />
                <SidebarLink
                  link={{
                    label: "Writer & Research",
                    href: "/ai-writer",
                    icon: <IconFileText className={cn("h-5 w-5 shrink-0 transition-colors", pathname.startsWith("/ai-writer") ? "text-amber-400" : "text-neutral-400")} />,
                    active: pathname.startsWith("/ai-writer"),
                  }}
                />
                <SidebarLink
                  link={{
                    label: "Dev Lab & Matrix",
                    href: "/tools",
                    icon: <IconCode className={cn("h-5 w-5 shrink-0 transition-colors", pathname.startsWith("/tools") ? "text-blue-400" : "text-neutral-400")} />,
                    active: pathname.startsWith("/tools"),
                  }}
                />
              </div>
            </div>

          </div>

          {/* ──── BOTTOM AREA: USER HUD & ACETERNITY USER PROFILE ──── */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            
            {/* Pro Upgrade Card (shown when open and not pro) */}
            {!isPro && isOpen && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-600/15 via-rose-600/10 to-transparent border border-red-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <IconCrown size={13} className="text-amber-400" /> Upgrade to Pro
                  </span>
                </div>
                <p className="text-[9.5px] text-neutral-400 mb-2 leading-relaxed">
                  Unlock Claude 3.5, GPT-4o, and unlimited workspace sessions.
                </p>
                <Link
                  href="/pricing"
                  className="block text-center py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-[10px] shadow-[0_0_10px_rgba(239,68,68,0.35)] transition-all"
                >
                  Upgrade Plan
                </Link>
              </div>
            )}

            {/* User Profile Item */}
            {isLoggedIn ? (
              isOpen ? (
                <div className="flex items-center justify-between">
                  <SidebarLink
                    link={{
                      label: userName,
                      href: "/profile",
                      icon: (
                        <div className="relative shrink-0">
                          <div className={cn(
                            "h-7 w-7 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-white text-xs border shadow-sm",
                            isPro ? "border-amber-400" : "border-neutral-700"
                          )}>
                            {user?.picture ? (
                              <img src={user.picture} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{(userName?.[0] || "U").toUpperCase()}</span>
                            )}
                          </div>
                          {isPro && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black absolute -bottom-0.5 -right-0.5" />
                          )}
                        </div>
                      ),
                    }}
                    className="flex-1"
                  />

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href="/profile"
                      title="Profile"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <IconSettings size={15} />
                    </Link>
                    <button
                      onClick={onLogout}
                      title="Log Out"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <IconLogout size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center w-full py-0.5">
                  <Link
                    href="/profile"
                    title={`${userName} (${planName})`}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/[0.06] transition-all mx-auto"
                  >
                    <div className="relative shrink-0">
                      <div className={cn(
                        "h-8 w-8 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-white text-xs border shadow-sm",
                        isPro ? "border-amber-400" : "border-neutral-700"
                      )}>
                        {user?.picture ? (
                          <img src={user.picture} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{(userName?.[0] || "U").toUpperCase()}</span>
                        )}
                      </div>
                      {isPro && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>
                  </Link>
                </div>
              )
            ) : (
              isOpen ? (
                <SidebarLink
                  link={{
                    label: "Sign In / Register",
                    href: "#",
                    icon: <IconUserBolt className="h-5 w-5 shrink-0 text-red-400" />,
                  }}
                  onClick={onOpenLogin}
                />
              ) : (
                <div className="flex justify-center w-full py-0.5">
                  <button
                    onClick={onOpenLogin}
                    title="Sign In / Register"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:text-white hover:bg-white/[0.06] transition-all mx-auto cursor-pointer"
                  >
                    <IconUserBolt size={20} />
                  </button>
                </div>
              )
            )}

          </div>

        </SidebarBody>
      </Sidebar>
    </div>
  );
}

// ──── ACETERNITY LOGO (EXPANDED) ────
export const PaperxifyLogo = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <Link
        href="/"
        className="relative z-20 flex items-center gap-2 text-sm font-normal text-white group"
      >
        <div className="h-6 w-6 shrink-0 rounded-lg bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.4)]">
          <span className="font-black text-xs italic tracking-tighter text-white">Px</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5"
        >
          <span className="text-[15px] font-black italic tracking-tight uppercase text-white whitespace-pre">
            PAPER<span className="text-[#ef4444]">XIFY</span>
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            AI
          </span>
        </motion.div>
      </Link>

      <button
        onClick={onToggle}
        title="Collapse sidebar"
        className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer shrink-0"
      >
        <IconArrowLeft size={16} />
      </button>
    </div>
  );
};

// ──── ACETERNITY LOGO ICON (COLLAPSED) ────
export const PaperxifyLogoIcon = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <div className="flex justify-center w-full py-1">
      <button
        onClick={onToggle}
        title="Expand sidebar"
        className="relative z-20 h-8 w-8 shrink-0 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:scale-105 transition-transform cursor-pointer"
      >
        <span className="font-black text-xs italic tracking-tighter text-white">Px</span>
      </button>
    </div>
  );
};
