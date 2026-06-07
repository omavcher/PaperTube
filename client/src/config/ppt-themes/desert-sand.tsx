import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const desertSandTheme: PPTThemeConfig = {
  id: "desert-sand",
  name: "Desert Sand",
  colors: {
    primary: "#f59e0b",
    accent: "#d97706",
    text: "#fffbeb",
    bg: "#140e05",
    border: "rgba(245, 158, 11, 0.15)",
    cardBg: "rgba(245, 158, 11, 0.04)"
  },
  bgGradient: "from-[#140e05] via-[#78350f] to-[#0a0702]",
  fontFamily: "'Outfit', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#f59e0b",
    accent: "#d97706",
    text: "#fffbeb",
    bg: "#140e05",
    border: "rgba(245, 158, 11, 0.15)",
    cardBg: "rgba(245, 158, 11, 0.04)"
  }) as any
};
