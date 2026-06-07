import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const carbonCoderTheme: PPTThemeConfig = {
  id: "carbon-coder",
  name: "Carbon Coder",
  colors: {
    primary: "#22c55e",
    accent: "#4ade80",
    text: "#f0fdf4",
    bg: "#0a0f0a",
    border: "rgba(34, 197, 94, 0.15)",
    cardBg: "rgba(34, 197, 94, 0.04)"
  },
  bgGradient: "from-[#0a0f0a] via-[#14532d] to-[#020502]",
  fontFamily: "'Courier New', monospace",
  bgImages: [
  "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#22c55e",
    accent: "#4ade80",
    text: "#f0fdf4",
    bg: "#0a0f0a",
    border: "rgba(34, 197, 94, 0.15)",
    cardBg: "rgba(34, 197, 94, 0.04)"
  }) as any
};
