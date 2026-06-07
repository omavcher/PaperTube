import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const sakuraBloomTheme: PPTThemeConfig = {
  id: "sakura-bloom",
  name: "Sakura Bloom",
  colors: {
    primary: "#f472b6",
    accent: "#fbcfe8",
    text: "#fff1f2",
    bg: "#14070e",
    border: "rgba(244, 114, 182, 0.15)",
    cardBg: "rgba(244, 114, 182, 0.04)"
  },
  bgGradient: "from-[#14070e] via-[#4c0519] to-[#0a0206]",
  fontFamily: "'Inter', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#f472b6",
    accent: "#fbcfe8",
    text: "#fff1f2",
    bg: "#14070e",
    border: "rgba(244, 114, 182, 0.15)",
    cardBg: "rgba(244, 114, 182, 0.04)"
  }) as any
};
