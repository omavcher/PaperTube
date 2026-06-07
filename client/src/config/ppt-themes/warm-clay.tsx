import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const warmClayTheme: PPTThemeConfig = {
  id: "warm-clay",
  name: "Warm Clay",
  colors: {
    primary: "#ea580c",
    accent: "#ff7849",
    text: "#fdf4ff",
    bg: "#140a05",
    border: "rgba(234, 88, 12, 0.15)",
    cardBg: "rgba(234, 88, 12, 0.04)"
  },
  bgGradient: "from-[#140a05] via-[#431407] to-[#0a0402]",
  fontFamily: "Georgia, serif",
  bgImages: [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#ea580c",
    accent: "#ff7849",
    text: "#fdf4ff",
    bg: "#140a05",
    border: "rgba(234, 88, 12, 0.15)",
    cardBg: "rgba(234, 88, 12, 0.04)"
  }) as any
};
