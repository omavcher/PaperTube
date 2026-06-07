import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const lavenderDreamTheme: PPTThemeConfig = {
  id: "lavender-dream",
  name: "Lavender Dream",
  colors: {
    primary: "#a855f7",
    accent: "#f472b6",
    text: "#faf5ff",
    bg: "#0a0512",
    border: "rgba(168, 85, 247, 0.15)",
    cardBg: "rgba(168, 85, 247, 0.04)"
  },
  bgGradient: "from-[#08030f] via-[#150724] to-[#04010b]",
  fontFamily: "'Outfit', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#a855f7",
    accent: "#f472b6",
    text: "#faf5ff",
    bg: "#0a0512",
    border: "rgba(168, 85, 247, 0.15)",
    cardBg: "rgba(168, 85, 247, 0.04)"
  }) as any
};
