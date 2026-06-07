import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const sunsetOrangeTheme: PPTThemeConfig = {
  id: "sunset-orange",
  name: "Sunset Orange",
  colors: {
    primary: "#f97316",
    accent: "#fbbf24",
    text: "#ffedd5",
    bg: "#0f0b07",
    border: "rgba(249, 115, 22, 0.15)",
    cardBg: "rgba(249, 115, 22, 0.04)"
  },
  bgGradient: "from-[#120a04] via-[#080808] to-[#040404]",
  fontFamily: "'Outfit', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#f97316",
    accent: "#fbbf24",
    text: "#ffedd5",
    bg: "#0f0b07",
    border: "rgba(249, 115, 22, 0.15)",
    cardBg: "rgba(249, 115, 22, 0.04)"
  }) as any
};
