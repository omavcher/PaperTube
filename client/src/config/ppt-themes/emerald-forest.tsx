import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const emeraldForestTheme: PPTThemeConfig = {
  id: "emerald-forest",
  name: "Emerald Forest",
  colors: {
    primary: "#10b981",
    accent: "#a7f3d0",
    text: "#ecfdf5",
    bg: "#02120e",
    border: "rgba(16, 185, 129, 0.15)",
    cardBg: "rgba(16, 185, 129, 0.04)"
  },
  bgGradient: "from-[#020d0a] via-[#041d16] to-[#010806]",
  fontFamily: "Georgia, serif",
  bgImages: [
  "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533038590840-1cde6b66b72d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588600878108-57c6118524de?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#10b981",
    accent: "#a7f3d0",
    text: "#ecfdf5",
    bg: "#02120e",
    border: "rgba(16, 185, 129, 0.15)",
    cardBg: "rgba(16, 185, 129, 0.04)"
  }) as any
};
