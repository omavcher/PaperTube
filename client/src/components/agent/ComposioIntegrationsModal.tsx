"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  X, 
  Check, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Unlink, 
  ShieldCheck, 
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Puzzle,
  Layers,
  Globe,
  FileCode2,
  BookOpen,
  Mail,
  Cloud,
  Calendar,
  Code2,
  Terminal,
  Cpu,
  ChevronRight,
  SlidersHorizontal,
  Lock,
  ArrowUpRight,
  Boxes
} from "lucide-react";
import api from "@/config/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface IntegrationApp {
  id: string;
  appName: string;
  name: string;
  desc: string;
  icon: string;
  logoUrl?: string;
  toolsCount?: number;
  category: string;
  color?: string;
  appUrl?: string;
  isConnected: boolean;
  connectedAccountId?: string | null;
  connectedAt?: string | null;
  userAccountIdentifier?: string | null;
  authSchemes?: string[];
}

export interface ConnectorTool {
  slug: string;
  name: string;
  description: string;
  parameters?: any;
}

interface ComposioIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIntegrationsUpdated?: () => void;
}

const CATEGORIES = [
  { id: "All", label: "All", icon: Boxes },
  { id: "Enabled", label: "Connected", icon: CheckCircle2 },
  { id: "Mail", label: "Mail", icon: Mail },
  { id: "Cloud", label: "Cloud", icon: Cloud },
  { id: "Calendar", label: "Calendar", icon: Calendar },
  { id: "Dev Tools", label: "Dev Tools", icon: Code2 },
  { id: "MCP", label: "MCP", icon: Terminal },
  { id: "Custom", label: "Custom", icon: Cpu }
];

export function ComposioIntegrationsModal({
  isOpen,
  onClose,
  onIntegrationsUpdated
}: ComposioIntegrationsModalProps) {
  const [activeTab, setActiveTab] = useState<"connectors" | "skills">("connectors");
  const [integrations, setIntegrations] = useState<IntegrationApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectingAppId, setConnectingAppId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  
  // Detail view state
  const [selectedApp, setSelectedApp] = useState<IntegrationApp | null>(null);
  const [appTools, setAppTools] = useState<ConnectorTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsSearch, setToolsSearch] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background page scroll and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchIntegrations();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (selectedApp) {
            setSelectedApp(null);
          } else {
            onClose();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
      setSelectedApp(null);
    }
  }, [isOpen, selectedApp]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? JSON.parse(userStr) : null;
      const isLoggedIn = Boolean(token && user && (user._id || user.id));
      const userId = isLoggedIn ? (user._id || user.id) : "guest";

      const res = await api.get(`/agent/integrations?userId=${userId}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        if (!isLoggedIn) {
          // Strictly force 0 connected items for guests
          setIntegrations(
            res.data.data.map((app: IntegrationApp) => ({
              ...app,
              isConnected: false,
              connectionStatus: "NOT_CONNECTED",
              connectedAccountId: null,
              userAccountIdentifier: null,
            }))
          );
        } else {
          setIntegrations(res.data.data);
        }
      }
    } catch (err) {
      console.warn("Could not load integrations list:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific tools when an app is selected
  useEffect(() => {
    if (selectedApp) {
      const fetchTools = async () => {
        try {
          setLoadingTools(true);
          const res = await api.get(`/agent/integrations/${selectedApp.id}/tools`);
          if (res.data?.success && Array.isArray(res.data?.data)) {
            setAppTools(res.data.data);
          } else {
            setAppTools([]);
          }
        } catch {
          setAppTools([]);
        } finally {
          setLoadingTools(false);
        }
      };
      fetchTools();
    }
  }, [selectedApp]);

  const handleConnectApp = async (app: IntegrationApp) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      toast.error("Please sign in to your Paperxify account to connect integrations.");
      return;
    }

    try {
      setConnectingAppId(app.id);

      const targetPath = typeof window !== "undefined" ? window.location.pathname : "/workspace";
      const redirectUri = typeof window !== "undefined" 
        ? `${window.location.origin}${targetPath}?connected=${(app.id || app.appName).toLowerCase()}`
        : "https://paperxify.com/workspace";

      const res = await api.post("/agent/integrations/connect", {
        appName: app.id || app.appName,
        userId: user._id || user.id,
        redirectUri
      });

      if (res.data?.success) {
        const { redirectUrl, message } = res.data.data || res.data;

        if (redirectUrl) {
          const width = 600;
          const height = 720;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;

          const popup = window.open(
            redirectUrl,
            `Connect ${app.name}`,
            `width=${width},height=${height},top=${top},left=${left}`
          );

          let pollAttempts = 0;
          const timer = setInterval(async () => {
            pollAttempts++;
            await fetchIntegrations();

            if (popup?.closed || pollAttempts > 60) {
              clearInterval(timer);
              await fetchIntegrations();
              onIntegrationsUpdated?.();
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("integrations-updated"));
                window.dispatchEvent(new CustomEvent("integration-connected", {
                  detail: {
                    appName: app.name,
                    appId: app.id,
                    logoUrl: app.logoUrl
                  }
                }));
              }
            }
          }, 2000);
        } else {
          toast.success(message || `Connected ${app.name} to Paperxify!`);
          await fetchIntegrations();
          onIntegrationsUpdated?.();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("integrations-updated"));
            window.dispatchEvent(new CustomEvent("integration-connected", {
              detail: {
                appName: app.name,
                appId: app.id,
                logoUrl: app.logoUrl
              }
            }));
          }
        }
      }
    } catch (err: any) {
      console.error("Connection failed:", err);
      toast.error(err.message || `Failed to initiate ${app.name} connection.`);
    } finally {
      setConnectingAppId(null);
    }
  };

  const handleDisconnect = async (app: IntegrationApp) => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?._id || user?.id || "guest";
    const accountId = app.connectedAccountId || app.id;

    try {
      const res = await api.delete(`/agent/integrations/${accountId}?userId=${userId}`);
      if (res.data?.success) {
        toast.info(`Disconnected ${app.name}`);
        setIntegrations(prev =>
          prev.map(item => item.id === app.id ? { ...item, isConnected: false, connectedAccountId: null, connectionStatus: "NOT_CONNECTED" } : item)
        );
        if (selectedApp?.id === app.id) {
          setSelectedApp(prev => prev ? { ...prev, isConnected: false, connectedAccountId: null, connectionStatus: "NOT_CONNECTED" } : null);
        }
        onIntegrationsUpdated?.();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("integrations-updated"));
        }
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to disconnect ${app.name}`);
    }
  };

  const handleCopyConnectorId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success(`Copied connector ID: ${id}`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Connected count
  const connectedCount = integrations.filter(i => i.isConnected).length;

  const filteredIntegrations = integrations.filter(app => {
    let matchesCategory = true;
    if (selectedCategory === "Enabled") {
      matchesCategory = app.isConnected;
    } else if (selectedCategory !== "All") {
      matchesCategory = (app.category || "").toLowerCase().includes(selectedCategory.toLowerCase()) ||
                        (selectedCategory === "Dev Tools" && ((app.category || "").toLowerCase().includes("dev") || (app.category || "").toLowerCase().includes("code"))) ||
                        (selectedCategory === "Mail" && ((app.category || "").toLowerCase().includes("mail") || (app.category || "").toLowerCase().includes("comm") || (app.category || "").toLowerCase().includes("chat"))) ||
                        (selectedCategory === "Cloud" && ((app.category || "").toLowerCase().includes("cloud") || (app.category || "").toLowerCase().includes("storage") || (app.category || "").toLowerCase().includes("doc")));
    }

    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTools = appTools.filter(t => 
    t.slug.toLowerCase().includes(toolsSearch.toLowerCase()) || 
    (t.name && t.name.toLowerCase().includes(toolsSearch.toLowerCase())) ||
    (t.description && t.description.toLowerCase().includes(toolsSearch.toLowerCase()))
  );

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 !z-[999999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl font-sans select-none animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-4xl rounded-3xl bg-[#09090e] border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col h-[88vh] max-h-[820px] relative z-10"
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 bg-red-600/[0.08] blur-[100px] pointer-events-none" />

        {/* ═══════════════════════════════════════════════════════ */}
        {/* VIEW 1: CONNECTORS & SKILLS DIRECTORY */}
        {/* ═══════════════════════════════════════════════════════ */}
        {!selectedApp && (
          <>
            {/* TOP HEADER SECTION */}
            <div className="p-5 sm:p-6 pb-3 border-b border-white/[0.07] space-y-4 shrink-0 relative z-10 bg-[#09090e]/80 backdrop-blur-sm">
              
              <div className="flex items-center justify-between gap-4">
                
                {/* Segmented Switcher & Title */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.07] shadow-inner">
                    <button
                      onClick={() => setActiveTab("connectors")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        activeTab === "connectors"
                          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                          : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <LinkIcon size={12} className="rotate-45" />
                      <span>Connectors</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("skills")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        activeTab === "skills"
                          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                          : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <Puzzle size={13} />
                      <span>Skills</span>
                    </button>
                  </div>

                  {connectedCount > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                      <span>{connectedCount} Connected</span>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline-block text-[10px] font-mono text-neutral-500 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    ESC
                  </span>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-xs sm:text-[13px] text-neutral-300">
                Let <span className="text-white font-semibold">Paperxify AI</span> work with your favourite tools, databases, and workspace apps.
              </p>

              {/* Search Bar */}
              <div className="relative w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search connectors by name, category, or capability..."
                  className="w-full bg-[#121218] border border-white/[0.08] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-md"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills with Icons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer shrink-0",
                        isSelected
                          ? "bg-white text-black font-bold shadow-sm scale-[1.02]"
                          : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.07] border border-white/[0.05]"
                      )}
                    >
                      <Icon size={12} className={cn(isSelected ? "text-black" : "text-neutral-500")} />
                      <span>{cat.label}</span>
                      {cat.id === "Enabled" && connectedCount > 0 && (
                        <span className={cn(
                          "text-[9.5px] px-1.5 py-0.2 rounded-full font-bold",
                          isSelected ? "bg-black/15 text-black" : "bg-emerald-500/20 text-emerald-400"
                        )}>
                          {connectedCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* TAB CONTENT 1: CONNECTORS GRID */}
            {activeTab === "connectors" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                
                {/* SKELETON LOADING GRID */}
                {loading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="p-4 rounded-2xl bg-[#111117] border border-white/[0.05] flex items-start gap-3.5 animate-pulse"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3.5 bg-white/[0.08] rounded-md w-28" />
                          <div className="h-2.5 bg-white/[0.04] rounded-md w-full" />
                          <div className="h-2.5 bg-white/[0.04] rounded-md w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CONNECTOR CARDS GRID */}
                {!loading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredIntegrations.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden",
                          app.isConnected
                            ? "bg-gradient-to-br from-emerald-950/15 via-[#111219] to-[#0f1017] border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]"
                            : "bg-[#101016]/90 hover:bg-[#151522] border-white/[0.06] hover:border-white/[0.14] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                        )}
                      >
                        {/* Top Row: Icon, App Name & Status Button */}
                        <div className="flex items-start gap-3.5 mb-2.5">
                          {/* App Icon Container */}
                          <div className="w-11 h-11 rounded-2xl bg-[#161622] border border-white/[0.08] p-2 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                            {app.logoUrl ? (
                              <img
                                src={app.logoUrl}
                                alt={app.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-xl">{app.icon}</span>
                            )}
                          </div>

                          {/* App Info & Action Button */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <h3 className="text-[13px] font-bold text-white group-hover:text-red-400 transition-colors truncate">
                                {app.name}
                              </h3>

                              {app.isConnected ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400 shrink-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                                  Connected
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConnectApp(app);
                                  }}
                                  disabled={connectingAppId === app.id}
                                  className="px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-red-600 hover:text-white hover:border-red-500/50 text-neutral-200 text-[11px] font-semibold transition-all shrink-0 cursor-pointer border border-white/[0.08] flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                                >
                                  {connectingAppId === app.id ? (
                                    <RefreshCw size={11} className="animate-spin" />
                                  ) : (
                                    <LinkIcon size={11} className="rotate-45" />
                                  )}
                                  <span>{connectingAppId === app.id ? "Connecting" : "Connect"}</span>
                                </button>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-[11.5px] text-neutral-400 line-clamp-2 leading-relaxed mt-1">
                              {app.desc}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Metadata Pill Strip */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {app.userAccountIdentifier && app.isConnected ? (
                              <span className="text-[9.5px] text-emerald-400/90 font-mono bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                                {app.userAccountIdentifier}
                              </span>
                            ) : null}
                            <span className="text-neutral-400 bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 rounded-md">
                              {app.category}
                            </span>
                          </div>

                          <span className="text-[10px] font-medium text-neutral-500 group-hover:text-neutral-300 transition-colors flex items-center gap-0.5 shrink-0">
                            <span>{app.toolsCount || 10}+ tools</span>
                            <ChevronRight size={11} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty Search Fallback */}
                {!loading && filteredIntegrations.length === 0 && (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-500">
                      <Search size={20} />
                    </div>
                    <p className="text-neutral-400 text-xs font-medium">
                      No matching connectors found for <span className="text-white">"{searchQuery}"</span>
                    </p>
                    <button
                      onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                      className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-neutral-300 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT 2: SKILLS VIEW */}
            {activeTab === "skills" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/30 via-[#141015] to-[#121218] border border-red-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Autonomous Multi-App Execution Playbooks</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Skills are intelligent agent execution playbooks. When Paperxify AI executes your prompts, it orchestrates multiple connected apps in sequence without requiring manual configuration.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { 
                      title: "Draft & Dispatch Gmail Lecture Notes", 
                      desc: "Formats Markdown study notes into rich HTML emails and sends directly to your recipient.", 
                      tools: ["GMAIL_SEND_EMAIL", "GMAIL_CREATE_DRAFT"],
                      appId: "gmail",
                      category: "Mail"
                    },
                    { 
                      title: "Google Calendar Exam & Study Scheduler", 
                      desc: "Calculates spaced-repetition study milestones and automatically schedules revision events.", 
                      tools: ["GOOGLECALENDAR_CREATE_EVENT", "GOOGLECALENDAR_QUICK_ADD_EVENT"],
                      appId: "googlecalendar",
                      category: "Calendar"
                    },
                    { 
                      title: "Notion Knowledge Base Exporter", 
                      desc: "Translates AI notes, code snippets, and syllabus hierarchies into native Notion database blocks.", 
                      tools: ["NOTION_CREATE_PAGE", "NOTION_APPEND_BLOCK_CHILDREN"],
                      appId: "notion",
                      category: "Cloud"
                    },
                    { 
                      title: "GitHub Algorithm & Gist Publisher", 
                      desc: "Generates clean syntax-highlighted code gists and repositories for study algorithms.", 
                      tools: ["GITHUB_CREATE_GIST", "GITHUB_CREATE_ISSUE"],
                      appId: "github",
                      category: "Dev Tools"
                    },
                    { 
                      title: "Slack Study Channel Broadcaster", 
                      desc: "Posts daily summaries, key flashcards, and group study reminders directly into channels.", 
                      tools: ["SLACK_CHAT_POST_MESSAGE", "SLACK_LIST_CHANNELS"],
                      appId: "slack",
                      category: "Communication"
                    },
                    { 
                      title: "Google Sheets Data & Flashcard Sync", 
                      desc: "Compiles study datasets, flashcards formulas, and financial tables directly into spreadsheets.", 
                      tools: ["GOOGLESHEETS_BATCH_UPDATE", "GOOGLESHEETS_CREATE_SPREADSHEET"],
                      appId: "googlesheets",
                      category: "Cloud"
                    }
                  ].map((skill, idx) => {
                    const linkedApp = integrations.find(i => i.id === skill.appId);
                    const isLinkedConnected = Boolean(linkedApp?.isConnected);

                    return (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl bg-[#111117] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white leading-tight">
                              {skill.title}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 border",
                              isLinkedConnected
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                : "bg-white/[0.04] text-neutral-400 border-white/[0.06]"
                            )}>
                              {isLinkedConnected ? "Ready to Use" : "Needs Connection"}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-relaxed">
                            {skill.desc}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                          <span className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-500">
                            Required Tools:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {skill.tools.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[9.5px] font-mono text-red-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODAL BOTTOM BAR */}
            <div className="p-4 sm:px-6 border-t border-white/[0.07] bg-[#08080c] flex items-center justify-between text-xs text-neutral-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 font-medium">
                  {filteredIntegrations.length} {activeTab === "connectors" ? "connectors available" : "autonomous skills"}
                </span>
                <span className="hidden sm:inline-block text-neutral-600">•</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-neutral-400 text-xs">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Encrypted via Composio Engine</span>
                </span>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* VIEW 2: CONNECTOR DETAIL & TOOLS INSPECTOR */}
        {/* ═══════════════════════════════════════════════════════ */}
        {selectedApp && (
          <div className="flex flex-col h-full min-h-0 flex-1">
            
            {/* Top Navigation Bar */}
            <div className="p-4 sm:p-5 border-b border-white/[0.07] flex items-center justify-between shrink-0 bg-[#09090e]/80 backdrop-blur-sm">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold"
              >
                <ArrowLeft size={15} />
                <span>Back to connectors</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            {/* Detail Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar flex flex-col items-center">
              
              {/* App Hero Card */}
              <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-3 shrink-0">
                <div className="w-16 h-16 rounded-3xl bg-[#14141c] border border-white/[0.1] p-3 flex items-center justify-center shadow-xl overflow-hidden shrink-0">
                  {selectedApp.logoUrl ? (
                    <img
                      src={selectedApp.logoUrl}
                      alt={selectedApp.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl">{selectedApp.icon}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {selectedApp.name}
                    </h2>
                    {selectedApp.isConnected && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 size={11} />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed max-w-lg">
                    {selectedApp.desc}
                  </p>
                </div>
              </div>

              {/* Connected Account Identifier Card (if connected) */}
              {selectedApp.isConnected && selectedApp.userAccountIdentifier && (
                <div className="w-full max-w-2xl p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-neutral-400 leading-tight">Active Connected Account</p>
                      <p className="text-xs font-bold text-white font-mono mt-0.5">{selectedApp.userAccountIdentifier}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDisconnect(selectedApp)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              )}

              {/* Available Tools Tags & Capability Section */}
              <div className="w-full max-w-2xl text-left space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-neutral-300">
                    {appTools.length > 0 ? `${appTools.length} tools available` : `${selectedApp.toolsCount || 12} tools available`}
                  </div>

                  {appTools.length > 6 && (
                    <div className="relative w-44">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        value={toolsSearch}
                        onChange={(e) => setToolsSearch(e.target.value)}
                        placeholder="Filter tools..."
                        className="w-full bg-[#121218] border border-white/[0.08] focus:border-red-500/40 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-neutral-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* SKELETON TOOL TAGS */}
                {loadingTools ? (
                  <div className="flex flex-wrap gap-1.5 animate-pulse">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-7 rounded-xl bg-white/[0.06] border border-white/[0.04]"
                        style={{ width: `${80 + (idx % 4) * 20}px` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {(filteredTools.length > 0 ? filteredTools : (appTools.length > 0 ? filteredTools : [
                      { slug: "send_email" },
                      { slug: "fetch_emails" },
                      { slug: "create_event" },
                      { slug: "create_document" },
                      { slug: "find_file" },
                      { slug: "create_folder" },
                      { slug: "create_meet" },
                      { slug: "insert_task" },
                      { slug: "create_chart" },
                      { slug: "batch_update_values" }
                    ])).map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-[#13131a] border border-white/[0.08] text-[11px] font-mono text-neutral-300 hover:border-red-500/30 transition-colors"
                      >
                        {tool.slug}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Connector Metadata Key-Value Table */}
              <div className="w-full max-w-2xl rounded-2xl bg-[#111117] border border-white/[0.06] divide-y divide-white/[0.05] text-left text-xs shrink-0">
                
                {/* Connector ID */}
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Connector ID</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#181824] text-[11px] font-mono text-neutral-200 border border-white/[0.06]">
                      {selectedApp.id}
                    </span>
                    <button
                      onClick={() => handleCopyConnectorId(selectedApp.id)}
                      className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Connector ID"
                    >
                      {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Website Link */}
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Official Website</span>
                  <a
                    href={selectedApp.appUrl || `https://${selectedApp.id}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1 text-[11.5px]"
                  >
                    <span>{selectedApp.appUrl ? selectedApp.appUrl.replace(/^https?:\/\//, '') : `${selectedApp.id}.com`}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Documentation Link */}
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Documentation & Schema</span>
                  <a
                    href={`https://docs.composio.dev/toolkits/${selectedApp.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1 text-[11.5px]"
                  >
                    <span>docs.composio.dev/toolkits/{selectedApp.id}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Security Protocol */}
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Authentication & Security</span>
                  <span className="flex items-center gap-1 text-neutral-300 text-[11px]">
                    <Lock size={12} className="text-emerald-400" />
                    <span>OAuth 2.0 PKCE (Zero Plaintext Token Storage)</span>
                  </span>
                </div>

              </div>

            </div>

            {/* Detail Floating Footer Action Bar */}
            <div className="p-4 sm:px-6 border-t border-white/[0.08] bg-[#08080c] flex items-center justify-between shrink-0 z-20">
              <div>
                {selectedApp.isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 size={13} />
                    Connected & Ready
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">
                    Ready to link with Paperxify AI
                  </span>
                )}
              </div>

              <div>
                {selectedApp.isConnected ? (
                  <button
                    onClick={() => handleDisconnect(selectedApp)}
                    className="px-5 py-2 rounded-xl bg-white/[0.05] hover:bg-red-500/20 border border-white/[0.08] hover:border-red-500/30 text-xs font-bold text-neutral-300 hover:text-red-400 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlink size={13} />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectApp(selectedApp)}
                    disabled={connectingAppId === selectedApp.id}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {connectingAppId === selectedApp.id ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon size={13} className="rotate-45" />
                        <span>Connect {selectedApp.name}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </motion.div>
    </div>,
    document.body
  );
}
