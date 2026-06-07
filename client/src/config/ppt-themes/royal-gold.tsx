import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const royalGoldTheme: PPTThemeConfig = {
  id: "royal-gold",
  name: "Royal Gold",
  colors: {
    primary: "#fbbf24",
    accent: "#1e3a8a",
    text: "#eff6ff",
    bg: "#030814",
    border: "rgba(251, 191, 36, 0.15)",
    cardBg: "rgba(251, 191, 36, 0.04)"
  },
  bgGradient: "from-[#030814] via-[#172554] to-[#01030a]",
  fontFamily: "Georgia, serif",
  bgImages: [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#fbbf24",
    accent: "#1e3a8a",
    text: "#eff6ff",
    bg: "#030814",
    border: "rgba(251, 191, 36, 0.15)",
    cardBg: "rgba(251, 191, 36, 0.04)"
  }) as any
};
