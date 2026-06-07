import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const midnightTechTheme: PPTThemeConfig = {
  id: "midnight-tech",
  name: "Midnight Tech",
  colors: {
    primary: "#3b82f6",
    accent: "#8b5cf6",
    text: "#eff6ff",
    bg: "#030712",
    border: "rgba(59, 130, 246, 0.15)",
    cardBg: "rgba(59, 130, 246, 0.04)"
  },
  bgGradient: "from-[#020617] via-[#090d1f] to-[#020205]",
  fontFamily: "'Outfit', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#3b82f6",
    accent: "#8b5cf6",
    text: "#eff6ff",
    bg: "#030712",
    border: "rgba(59, 130, 246, 0.15)",
    cardBg: "rgba(59, 130, 246, 0.04)"
  }) as any
};
