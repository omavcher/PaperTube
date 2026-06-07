import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const oceanBreezeTheme: PPTThemeConfig = {
  id: "ocean-breeze",
  name: "Ocean Breeze",
  colors: {
    primary: "#0ea5e9",
    accent: "#38bdf8",
    text: "#f0f9ff",
    bg: "#030c14",
    border: "rgba(14, 165, 233, 0.15)",
    cardBg: "rgba(14, 165, 233, 0.04)"
  },
  bgGradient: "from-[#030c14] via-[#075985] to-[#020617]",
  fontFamily: "'Inter', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#0ea5e9",
    accent: "#38bdf8",
    text: "#f0f9ff",
    bg: "#030c14",
    border: "rgba(14, 165, 233, 0.15)",
    cardBg: "rgba(14, 165, 233, 0.04)"
  }) as any
};
