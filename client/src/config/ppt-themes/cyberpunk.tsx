import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const cyberpunkTheme: PPTThemeConfig = {
  id: "cyberpunk",
  name: "Cyberpunk Glow",
  colors: {
    primary: "#ec4899",
    accent: "#06b6d4",
    text: "#fdf2f8",
    bg: "#08020f",
    border: "rgba(236, 72, 153, 0.2)",
    cardBg: "rgba(236, 72, 153, 0.04)"
  },
  bgGradient: "from-[#08020e] via-[#12021c] to-[#04010a]",
  fontFamily: "'Courier New', monospace",
  bgImages: [
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1561736778-92e52a7769ef?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515260268569-9271009adfdb?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#ec4899",
    accent: "#06b6d4",
    text: "#fdf2f8",
    bg: "#08020f",
    border: "rgba(236, 72, 153, 0.2)",
    cardBg: "rgba(236, 72, 153, 0.04)"
  }) as any
};
