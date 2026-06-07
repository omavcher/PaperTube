import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const nordicFrostTheme: PPTThemeConfig = {
  id: "nordic-frost",
  name: "Nordic Frost",
  colors: {
    primary: "#38bdf8",
    accent: "#7dd3fc",
    text: "#f0f9ff",
    bg: "#06131a",
    border: "rgba(56, 189, 248, 0.15)",
    cardBg: "rgba(56, 189, 248, 0.04)"
  },
  bgGradient: "from-[#06131a] via-[#0c4a6e] to-[#03090d]",
  fontFamily: "'Inter', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#38bdf8",
    accent: "#7dd3fc",
    text: "#f0f9ff",
    bg: "#06131a",
    border: "rgba(56, 189, 248, 0.15)",
    cardBg: "rgba(56, 189, 248, 0.04)"
  }) as any
};
