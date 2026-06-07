import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const classicSlateTheme: PPTThemeConfig = {
  id: "classic-slate",
  name: "Classic Slate",
  colors: {
    primary: "#64748b",
    accent: "#94a3b8",
    text: "#f8fafc",
    bg: "#0f172a",
    border: "rgba(100, 116, 139, 0.15)",
    cardBg: "rgba(100, 116, 139, 0.04)"
  },
  bgGradient: "from-[#0f172a] via-[#1e293b] to-[#020617]",
  fontFamily: "'Inter', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533038590840-1cde6b66b72d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#64748b",
    accent: "#94a3b8",
    text: "#f8fafc",
    bg: "#0f172a",
    border: "rgba(100, 116, 139, 0.15)",
    cardBg: "rgba(100, 116, 139, 0.04)"
  }) as any
};
