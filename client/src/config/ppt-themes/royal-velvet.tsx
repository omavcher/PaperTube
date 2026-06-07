import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./types";

export const royalVelvetTheme: PPTThemeConfig = {
  id: "royal-velvet",
  name: "Royal Velvet",
  colors: {
    primary: "#8b5cf6",
    accent: "#c084fc",
    text: "#f5f3ff",
    bg: "#0a0314",
    border: "rgba(139, 92, 246, 0.15)",
    cardBg: "rgba(139, 92, 246, 0.04)"
  },
  bgGradient: "from-[#0a0314] via-[#2e1065] to-[#05010a]",
  fontFamily: "Georgia, serif",
  bgImages: [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
],
  layouts: createThemeLayouts({
    primary: "#8b5cf6",
    accent: "#c084fc",
    text: "#f5f3ff",
    bg: "#0a0314",
    border: "rgba(139, 92, 246, 0.15)",
    cardBg: "rgba(139, 92, 246, 0.04)"
  }) as any
};
