"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";

export interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  badge?: string;
  badgeVariant?: "red" | "violet" | "amber" | "blue" | "default";
  active?: boolean;
}

export interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

export const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebarComponent {...props} />
      <MobileSidebarComponent {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebarComponent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-2.5 py-3 hidden lg:flex lg:flex-col bg-[#070709]/95 backdrop-blur-2xl border-r border-white/[0.08] shrink-0 font-sans select-none shadow-[4px_0_30px_rgba(0,0,0,0.85)] overflow-hidden",
        className
      )}
      animate={{
        width: open ? "248px" : "64px",
      }}
      transition={
        animate
          ? {
              type: "spring",
              stiffness: 380,
              damping: 32,
              mass: 0.8,
            }
          : { duration: 0 }
      }
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebarComponent = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-[#070709] border-b border-white/[0.08] w-full",
        className
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <IconMenu2
          className="text-neutral-200 cursor-pointer"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-[#070709] p-6 z-[120] flex flex-col justify-between overflow-y-auto",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 z-50 text-neutral-200 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: () => void;
  props?: LinkProps;
}) => {
  const { open } = useSidebar();
  const active = link.active;

  return (
    <Link
      href={link.href}
      onClick={onClick}
      title={!open ? link.label : undefined}
      className={cn(
        "flex items-center rounded-xl transition-all duration-150 relative group/sidebar overflow-hidden",
        open
          ? "justify-start gap-2.5 px-2.5 py-2 w-full"
          : "justify-center w-10 h-10 mx-auto p-0",
        active
          ? "bg-red-500/[0.12] text-white font-semibold border border-red-500/25 shadow-sm"
          : "text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "shrink-0 flex items-center justify-center transition-transform duration-150 group-hover/sidebar:scale-110",
          active ? "text-red-500" : "text-neutral-400 group-hover/sidebar:text-white"
        )}
      >
        {link.icon}
      </div>

      {open && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "text-xs truncate whitespace-pre inline-block !p-0 !m-0 flex-1",
            active ? "text-white font-semibold" : "text-neutral-300 group-hover/sidebar:text-white"
          )}
        >
          {link.label}
        </motion.span>
      )}

      {open && link.badge && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-full border shrink-0",
            link.badgeVariant === "red"
              ? "bg-red-500/15 text-red-400 border-red-500/30"
              : link.badgeVariant === "violet"
              ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
              : link.badgeVariant === "amber"
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "bg-white/[0.08] text-neutral-300 border-white/10"
          )}
        >
          {link.badge}
        </motion.span>
      )}
    </Link>
  );
};
