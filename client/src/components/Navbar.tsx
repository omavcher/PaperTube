"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useCallback, useEffect, useRef, useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/config/api";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export type PlanStatusPayload = {
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
  membership: {
    isActive: boolean;
    planId: string | null;
    planName: string | null;
    billingPeriod: string | null;
    startedAt: string | null;
    expiresAt: string | null;
    expiresInDays: number | null;
  };
  tokens: {
    balance: number;
    used: number;
  };
  usageSummary: {
    notesCreated: number;
    tokenTransactions: number;
  };
  recentTransactions: Array<{
    id: string;
    packageId: string;
    packageName: string;
    packageType: string;
    amount: number;
    tokens: number;
    status: string;
    timestamp: string;
  }>;
};

const PLAN_STORAGE_KEY = "planStatus";
const PLAN_FETCHED_AT_KEY = "planStatusFetchedAt";
const PLAN_STATUS_TTL = 5 * 60 * 1000; // 5 minutes

const PlanStatusContext = React.createContext<PlanStatusPayload | null>(null);

export const usePlanStatus = () => useContext(PlanStatusContext);

const safeParseJSON = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readPlanStatusFromStorage = (): PlanStatusPayload | null => {
  if (typeof window === "undefined") return null;
  return safeParseJSON<PlanStatusPayload>(localStorage.getItem(PLAN_STORAGE_KEY));
};

const persistPlanStatus = (data: PlanStatusPayload) => {
  localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(PLAN_FETCHED_AT_KEY, Date.now().toString());
};

const clearPlanStatus = () => {
  localStorage.removeItem(PLAN_STORAGE_KEY);
  localStorage.removeItem(PLAN_FETCHED_AT_KEY);
};

const usePlanStatusSync = () => {
  const [planStatus, setPlanStatus] = useState<PlanStatusPayload | null>(() =>
    readPlanStatusFromStorage(),
  );

  const fetchPlanStatus = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      setPlanStatus(null);
      clearPlanStatus();
      return;
    }

    try {
      const response = await api.get("/auth/plan-status", {
        headers: {
          Auth: token,
        },
      });

      if (response.data?.success && response.data?.data) {
        const payload = response.data.data as PlanStatusPayload;
        setPlanStatus(payload);
        persistPlanStatus(payload);
      }
    } catch (error) {
      console.error("❌ Failed to fetch plan status:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let disposed = false;

    const shouldRefresh = () => {
      const lastFetched = parseInt(
        localStorage.getItem(PLAN_FETCHED_AT_KEY) || "0",
        10,
      );
      return !lastFetched || Date.now() - lastFetched > PLAN_STATUS_TTL;
    };

    const hydrateFromStorage = () => {
      const cached = readPlanStatusFromStorage();
      if (cached) {
        setPlanStatus((prev) => prev ?? cached);
      }
    };

    const syncPlanStatus = (force = false) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setPlanStatus(null);
        clearPlanStatus();
        return;
      }

      hydrateFromStorage();
      if (force || shouldRefresh()) {
        fetchPlanStatus();
      }
    };

    syncPlanStatus();

    const handleFocus = () => syncPlanStatus();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncPlanStatus();
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "authToken") {
        syncPlanStatus(true);
        return;
      }
      if (event.key === PLAN_STORAGE_KEY && !disposed) {
        const cached = readPlanStatusFromStorage();
        setPlanStatus(cached);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);

    return () => {
      disposed = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchPlanStatus]);

  return planStatus;
};

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);
  const planStatus = usePlanStatusSync();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <PlanStatusContext.Provider value={planStatus}>
      <motion.div
        ref={ref}
        className={cn("sticky inset-x-0 top-0 z-40 w-full", className)}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(
                child as React.ReactElement<{
                  visible?: boolean;
                  planStatus?: PlanStatusPayload | null;
                }>,
                { visible, planStatus },
              )
            : child,
        )}
      </motion.div>
    </PlanStatusContext.Provider>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex",
        visible && "bg-neutral-950/80",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium transition duration-200 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <Link
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-neutral-300"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-neutral-800"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </Link>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && "bg-neutral-950/80",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-neutral-950 px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-white" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal"
    >
      <Image
        src="/papertube.png"
        alt="logo"
        width={55}
        height={50}
        priority
      />
      <span className="font-medium text-xl text-white">PaperTube</span>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "bg-white text-black shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};