import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const nebulaSpaceTheme: PPTThemeConfig = {
  id: "nebula-space",
  name: "Nebula Space",
  colors: {
    primary: "#ec4899",
    accent: "#3b82f6",
    text: "#faf5ff",
    bg: "#05030f",
    border: "rgba(236, 72, 153, 0.15)",
    cardBg: "rgba(236, 72, 153, 0.04)"
  },
  bgGradient: "from-[#05030f] via-[#311042] to-[#020108]",
  fontFamily: "'Outfit', sans-serif",
  bgImages: [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#ec4899",
    accent: "#3b82f6",
    text: "#faf5ff",
    bg: "#05030f",
    border: "rgba(236, 72, 153, 0.15)",
    cardBg: "rgba(236, 72, 153, 0.04)"
  }) as any
};
