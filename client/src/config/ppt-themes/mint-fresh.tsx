import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const mintFreshTheme: PPTThemeConfig = {
  id: "mint-fresh",
  name: "Mint Fresh",
  colors: {
    primary: "#2dd4bf",
    accent: "#5eead4",
    text: "#f0fdfa",
    bg: "#031411",
    border: "rgba(45, 212, 191, 0.15)",
    cardBg: "rgba(45, 212, 191, 0.04)"
  },
  bgGradient: "from-[#031411] via-[#115e59] to-[#010706]",
  fontFamily: "'Outfit', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#2dd4bf",
    accent: "#5eead4",
    text: "#f0fdfa",
    bg: "#031411",
    border: "rgba(45, 212, 191, 0.15)",
    cardBg: "rgba(45, 212, 191, 0.04)"
  }) as any
};
