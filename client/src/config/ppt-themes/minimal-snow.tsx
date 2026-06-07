import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const minimalSnowTheme: PPTThemeConfig = {
  id: "minimal-snow",
  name: "Minimal Snow",
  colors: {
    primary: "#ffffff",
    accent: "#a3a3a3",
    text: "#f5f5f5",
    bg: "#121212",
    border: "rgba(255, 255, 255, 0.08)",
    cardBg: "rgba(255, 255, 255, 0.02)"
  },
  bgGradient: "from-[#121212] via-[#262626] to-[#0a0a0a]",
  fontFamily: "'Outfit', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#ffffff",
    accent: "#a3a3a3",
    text: "#f5f5f5",
    bg: "#121212",
    border: "rgba(255, 255, 255, 0.08)",
    cardBg: "rgba(255, 255, 255, 0.02)"
  }) as any
};
