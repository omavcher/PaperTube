import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const bronzeMetalTheme: PPTThemeConfig = {
  id: "bronze-metal",
  name: "Bronze Metal",
  colors: {
    primary: "#b45309",
    accent: "#f59e0b",
    text: "#fffbeb",
    bg: "#140e05",
    border: "rgba(180, 83, 9, 0.15)",
    cardBg: "rgba(180, 83, 9, 0.04)"
  },
  bgGradient: "from-[#140e05] via-[#451a03] to-[#0a0702]",
  fontFamily: "Georgia, serif",
  bgImages: [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#b45309",
    accent: "#f59e0b",
    text: "#fffbeb",
    bg: "#140e05",
    border: "rgba(180, 83, 9, 0.15)",
    cardBg: "rgba(180, 83, 9, 0.04)"
  }) as any
};
