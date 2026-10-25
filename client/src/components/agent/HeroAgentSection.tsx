"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Sparkles, 
  Crown, 
  ArrowRight, 
  X, 
  Link as LinkIcon,
  Layers,
  Code2
} from "lucide-react";
import Link from "next/link";
import api from "@/config/api";
import { AuthLoginModal } from "@/components/AuthGuard";
import { AgentPromptInput } from "./AgentPromptInput";
import { ComposioIntegrationsModal } from "./ComposioIntegrationsModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

interface HeroAgentSectionProps {
  user?: any;
  tokenInfo?: any;
}

// Connected tools branding badges with official Composio HD vector logos
const CONNECTED_TOOLS = [
  { id: "gmail", name: "Gmail", logoUrl: "https://logos.composio.dev/api/gmail" },
  { id: "drive", name: "Google Drive", logoUrl: "https://logos.composio.dev/api/googledrive" },
  { id: "cal", name: "Google Calendar", logoUrl: "https://logos.composio.dev/api/googlecalendar" },
  { id: "notion", name: "Notion", logoUrl: "https://logos.composio.dev/api/notion" },
  { id: "teams", name: "Office / Teams", logoUrl: "https://logos.composio.dev/api/microsoft_teams" },
  { id: "zapier", name: "Supabase / Webhooks", logoUrl: "https://logos.composio.dev/api/supabase" }
];

// Real-time time of day greeting engine
function getRealTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Fresh ideas for a fresh morning!";
  } else if (hour >= 12 && hour < 17) {
    return "Powering up for a productive afternoon!";
  } else if (hour >= 17 && hour < 22) {
    return "Smart focus for a peaceful evening!";
  } else {
    return "Late-night clarity for big breakthroughs!";
  }
}

// Extract clean first name from any user object variant (name, displayName, email, etc.)
function extractFirstName(userObj: any): string {
  if (!userObj) return "";
  
  if (userObj.firstName && typeof userObj.firstName === "string") {
    return userObj.firstName.trim();
  }
  
  if (userObj.name && typeof userObj.name === "string") {
    const parts = userObj.name.trim().split(" ");
    return parts[0] || "";
  }
  
  if (userObj.displayName && typeof userObj.displayName === "string") {
    const parts = userObj.displayName.trim().split(" ");
    return parts[0] || "";
  }
  
  if (userObj.email && typeof userObj.email === "string") {
    return userObj.email.split("@")[0] || "";
  }
  
  return "";
}

export function HeroAgentSection({ user: initialUser, tokenInfo: initialTokenInfo }: HeroAgentSectionProps) {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Powering up for a productive day!");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToolsBar, setShowToolsBar] = useState(true);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<any>(null);

  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [tokenInfo, setTokenInfo] = useState<any>(initialTokenInfo || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sync real-time greeting, dynamic user name & latest tokens/membership
  useEffect(() => {
    setGreeting(getRealTimeGreeting());
    
    const syncUser = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("authToken");
      const stored = localStorage.getItem("user");
      setIsLoggedIn(!!token);

      let u = initialUser;
      if (!u && stored) {
        try {
          u = JSON.parse(stored);
        } catch {}
      }
      if (u) {
        setCurrentUser(u);
        setUserName(extractFirstName(u));
      }

      if (token) {
        try {
          const res = await api.get("/users/tokens", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data?.success) {
            setTokenInfo(res.data);
            if (res.data.user) {
              setCurrentUser(res.data.user);
              setUserName(extractFirstName(res.data.user));
            }
          }
        } catch (e) {
          // non-blocking
        }
      }
    };

    syncUser();
    window.addEventListener("auth-change", syncUser);
    window.addEventListener("tokens-updated", syncUser);
    return () => {
      window.removeEventListener("auth-change", syncUser);
      window.removeEventListener("tokens-updated", syncUser);
    };
  }, [initialUser]);

  // Prefetch workspace route so transitions are instantaneous
  useEffect(() => {
    try {
      router.prefetch("/workspace");
    } catch {}
  }, [router]);

  // Handle hero prompt submission -> Navigate smoothly to /workspace/:slug
  const handlePromptSubmit = async ({ query, model, capability, attachments, imageOptions }: {
    query: string;
    model: string;
    capability: string;
    attachments: any[];
    imageOptions?: any;
  }) => {
    if (!query.trim() && attachments.length === 0) return;

    // Strict Auth Gate: User cannot launch agent until logged in properly
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!authToken || authToken === "null" || authToken === "undefined") {
      toast.info("Please sign in to run autonomous agent workflows.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("open-login"));
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Save prompt payload in localStorage & sessionStorage for seamless transfer
      const taskSlug = `task-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const payload = JSON.stringify({
        initialQuery: query,
        model,
        capability,
        attachments,
        imageOptions,
        timestamp: Date.now()
      });
      
      if (typeof window !== "undefined") {
        localStorage.setItem(`paperxify_workspace_init_${taskSlug}`, payload);
        sessionStorage.setItem(`paperxify_workspace_init_${taskSlug}`, payload);
        localStorage.setItem(`paperxify_agent_init_${taskSlug}`, payload);
        sessionStorage.setItem(`paperxify_agent_init_${taskSlug}`, payload);
      }

      // Smooth instant transition to Workspace task page with query param fallback
      const qParam = query ? `?q=${encodeURIComponent(query)}` : "";
      router.push(`/workspace/${taskSlug}${qParam}`);
    } catch (err: any) {
      console.error("Hero prompt routing failed:", err);
      toast.error("Could not launch Workspace. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleDismissTools = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowToolsBar(false);
  };

  // Determine user subscription status & display pill properties
  const isPro = Boolean(
    currentUser?.membership?.isActive || 
    tokenInfo?.isSubscribed || 
    currentUser?.isPaid || 
    currentUser?.plan === "Mastery" || 
    currentUser?.plan === "Pro" ||
    currentUser?.membership?.planId === "pro" ||
    currentUser?.membership?.planId === "scholar" ||
    currentUser?.membership?.planId === "power"
  );

  const planName = 
    currentUser?.membership?.planName || 
    tokenInfo?.planName || 
    (isPro ? "Pro Plan" : "Free plan");

  const targetHref = isPro ? "/profile" : (isLoggedIn ? "/pricing" : "/login");
  const actionLabel = isPro ? "Manage" : (isLoggedIn ? "Upgrade" : "Upgrade");

  return (
    <section className="relative w-full overflow-visible z-30 flex flex-col items-center justify-start pt-20 pb-12 lg:pt-8 lg:pb-16 font-sans select-none">
      
      {/* Background Ambience Layer (Contained in isolated overflow-hidden container to prevent page scrollbars while letting popovers float freely) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <BackgroundRippleEffect className="-top-10 pointer-events-auto" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[300px] bg-red-600/[0.06] blur-[130px] rounded-full" />
      </div>

      {/* Main Content Stage */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center">

      {/* ──── 1. TOP PLAN BADGE PILL (Logically Reactive to User Plan) ──── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-4 sm:mb-5"
      >
        <Link
          href={targetHref}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs transition-all shadow-sm group backdrop-blur-xl",
            isPro
              ? "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              : "bg-[#111116]/80 hover:bg-[#181820] border-white/[0.08] hover:border-red-500/30 text-neutral-300"
          )}
        >
          <span className="font-medium flex items-center gap-1.5">
            {isPro ? (
              <Crown size={12} className="text-amber-400 fill-amber-400/20" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            )}
            <span className={cn(isPro ? "text-amber-200 font-semibold" : "text-neutral-300")}>
              {planName}
            </span>
          </span>
          <span className={cn(isPro ? "text-amber-500/50" : "text-neutral-600")}>•</span>
          <span className={cn(
            "font-semibold flex items-center gap-0.5 transition-colors",
            isPro ? "text-amber-300 group-hover:text-amber-100" : "text-white group-hover:text-red-400"
          )}>
            <span>{actionLabel}</span>
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </motion.div>

      {/* ──── 2. DYNAMIC REAL-TIME GREETING HEADER ──── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="text-center mb-6 sm:mb-7 space-y-1"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
          Hey <span className="text-red-400 capitalize">{userName || "there"}</span>,{" "}
          <span className="text-neutral-200 font-semibold">{greeting}</span>
        </h1>
      </motion.div>

      {/* ──── 3. CONNECTED TOOLS MINI BANNER & MAIN INPUT CONTAINER ──── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ 
          opacity: 1, 
          scale: isSubmitting ? 0.995 : 1
        }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => {
          try { router.prefetch("/workspace"); } catch {}
        }}
        className={cn(
          "w-full max-w-3xl flex flex-col items-center transition-all duration-300 relative z-20",
          isSubmitting && "opacity-95"
        )}
      >
        
        {/* Top Mini Connected Tools Pill Bar (Paperxify Red & Obsidian Glass) */}
        <AnimatePresence>
          {showToolsBar && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsToolsModalOpen(true)}
              className="w-full mb-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-red-950/20 via-[#0d0d15]/95 to-[#0d0d15]/95 border border-white/[0.08] hover:border-red-500/40 flex items-center justify-between gap-2 sm:gap-3 text-xs backdrop-blur-xl shadow-md transition-all cursor-pointer group hover:shadow-[0_4px_24px_rgba(239,68,68,0.1)] overflow-hidden"
            >
              {/* Left: Link Icon + Responsive Tool prompt */}
              <div className="flex items-center gap-2 sm:gap-2.5 text-neutral-300 group-hover:text-white transition-colors min-w-0 flex-1">
                <div className="w-5 h-5 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:bg-red-500/25 group-hover:scale-105 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] shrink-0">
                  <LinkIcon size={11} className="rotate-45" />
                </div>
                <span className="font-medium text-[11px] sm:text-[13px] tracking-tight truncate">
                  <span className="hidden sm:inline">Connect your favourite tools to </span>
                  <span className="sm:hidden">Connect tools to </span>
                  <span className="text-white font-semibold group-hover:text-red-400 transition-colors">Paperxify</span>
                </span>
              </div>

              {/* Right: Overlapping App Vector Logos + Dismiss */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="flex items-center -space-x-1.5 group/stack">
                  {CONNECTED_TOOLS.map((tool, idx) => (
                    <div
                      key={tool.id}
                      title={tool.name}
                      className={cn(
                        "w-5 h-5 sm:w-6.5 sm:h-6.5 rounded-full bg-[#181824] p-0.5 sm:p-1 flex items-center justify-center border border-white/[0.14] group-hover:border-red-500/40 shadow-sm transition-all duration-200 group-hover:scale-105 overflow-hidden shrink-0 ring-1 ring-black/60",
                        idx >= 4 && "hidden sm:flex"
                      )}
                    >
                      <img
                        src={tool.logoUrl}
                        alt={tool.name}
                        className={cn(
                          "w-full h-full object-contain filter",
                          tool.id === "notion" && "invert brightness-150 contrast-125"
                        )}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                  <span className="sm:hidden text-[9px] font-mono text-neutral-400 pl-1 font-semibold">
                    +2
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDismissTools}
                  className="p-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-white/[0.08] transition-colors shrink-0"
                  title="Dismiss banner"
                >
                  <X size={12} className="sm:w-[13px] sm:h-[13px]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──── 4. MAIN CHATGPT-GRADE RED & BLACK INPUT BOX ──── */}
        <AgentPromptInput
          size="hero"
          showQuickPills={true}
          isLoading={isSubmitting}
          onOpenIntegrations={() => setIsToolsModalOpen(true)}
          onSubmit={handlePromptSubmit}
        />

      </motion.div>
      </div>

      {/* Production Composio Integrations Modal */}
      <ComposioIntegrationsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
      />

      {/* Auth Login Modal */}
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          if (pendingPrompt) {
            handlePromptSubmit(pendingPrompt);
            setPendingPrompt(null);
          }
        }}
      />

    </section>
  );
}
