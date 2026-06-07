const fs = require("fs");
const path = require("path");

const themes = [
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    font: "'Outfit', sans-serif",
    primary: "#f97316",
    accent: "#fbbf24",
    text: "#ffedd5",
    bg: "#0f0b07",
    border: "rgba(249, 115, 22, 0.15)",
    cardBg: "rgba(249, 115, 22, 0.04)",
    gradient: "from-[#120a04] via-[#080808] to-[#040404]",
    bgImages: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "midnight-tech",
    name: "Midnight Tech",
    font: "'Outfit', sans-serif",
    primary: "#3b82f6",
    accent: "#8b5cf6",
    text: "#eff6ff",
    bg: "#030712",
    border: "rgba(59, 130, 246, 0.15)",
    cardBg: "rgba(59, 130, 246, 0.04)",
    gradient: "from-[#020617] via-[#090d1f] to-[#020205]",
    bgImages: [
      "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "classic-slate",
    name: "Classic Slate",
    font: "'Inter', sans-serif",
    primary: "#64748b",
    accent: "#94a3b8",
    text: "#f8fafc",
    bg: "#0f172a",
    border: "rgba(100, 116, 139, 0.15)",
    cardBg: "rgba(100, 116, 139, 0.04)",
    gradient: "from-[#0f172a] via-[#1e293b] to-[#020617]",
    bgImages: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533038590840-1cde6b66b72d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    font: "'Inter', sans-serif",
    primary: "#0ea5e9",
    accent: "#38bdf8",
    text: "#f0f9ff",
    bg: "#030c14",
    border: "rgba(14, 165, 233, 0.15)",
    cardBg: "rgba(14, 165, 233, 0.04)",
    gradient: "from-[#030c14] via-[#075985] to-[#020617]",
    bgImages: [
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "minimal-snow",
    name: "Minimal Snow",
    font: "'Outfit', sans-serif",
    primary: "#ffffff",
    accent: "#a3a3a3",
    text: "#f5f5f5",
    bg: "#121212",
    border: "rgba(255, 255, 255, 0.08)",
    cardBg: "rgba(255, 255, 255, 0.02)",
    gradient: "from-[#121212] via-[#262626] to-[#0a0a0a]",
    bgImages: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    font: "Georgia, serif",
    primary: "#10b981",
    accent: "#a7f3d0",
    text: "#ecfdf5",
    bg: "#02120e",
    border: "rgba(16, 185, 129, 0.15)",
    cardBg: "rgba(16, 185, 129, 0.04)",
    gradient: "from-[#020d0a] via-[#041d16] to-[#010806]",
    bgImages: [
      "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533038590840-1cde6b66b72d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588600878108-57c6118524de?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "vintage-gold",
    name: "Vintage Gold",
    font: "Georgia, serif",
    primary: "#fbbf24",
    accent: "#d97706",
    text: "#fffbeb",
    bg: "#17140f",
    border: "rgba(251, 191, 36, 0.15)",
    cardBg: "rgba(251, 191, 36, 0.04)",
    gradient: "from-[#17140f] via-[#2d220c] to-[#0a0805]",
    bgImages: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Glow",
    font: "'Courier New', monospace",
    primary: "#ec4899",
    accent: "#06b6d4",
    text: "#fdf2f8",
    bg: "#08020f",
    border: "rgba(236, 72, 153, 0.2)",
    cardBg: "rgba(236, 72, 153, 0.04)",
    gradient: "from-[#08020e] via-[#12021c] to-[#04010a]",
    bgImages: [
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1561736778-92e52a7769ef?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515260268569-9271009adfdb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "royal-velvet",
    name: "Royal Velvet",
    font: "Georgia, serif",
    primary: "#8b5cf6",
    accent: "#c084fc",
    text: "#f5f3ff",
    bg: "#0a0314",
    border: "rgba(139, 92, 246, 0.15)",
    cardBg: "rgba(139, 92, 246, 0.04)",
    gradient: "from-[#0a0314] via-[#2e1065] to-[#05010a]",
    bgImages: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "carbon-coder",
    name: "Carbon Coder",
    font: "'Courier New', monospace",
    primary: "#22c55e",
    accent: "#4ade80",
    text: "#f0fdf4",
    bg: "#0a0f0a",
    border: "rgba(34, 197, 94, 0.15)",
    cardBg: "rgba(34, 197, 94, 0.04)",
    gradient: "from-[#0a0f0a] via-[#14532d] to-[#020502]",
    bgImages: [
      "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "sakura-bloom",
    name: "Sakura Bloom",
    font: "'Inter', sans-serif",
    primary: "#f472b6",
    accent: "#fbcfe8",
    text: "#fff1f2",
    bg: "#14070e",
    border: "rgba(244, 114, 182, 0.15)",
    cardBg: "rgba(244, 114, 182, 0.04)",
    gradient: "from-[#14070e] via-[#4c0519] to-[#0a0206]",
    bgImages: [
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "warm-clay",
    name: "Warm Clay",
    font: "Georgia, serif",
    primary: "#ea580c",
    accent: "#ff7849",
    text: "#fdf4ff",
    bg: "#140a05",
    border: "rgba(234, 88, 12, 0.15)",
    cardBg: "rgba(234, 88, 12, 0.04)",
    gradient: "from-[#140a05] via-[#431407] to-[#0a0402]",
    bgImages: [
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    font: "'Outfit', sans-serif",
    primary: "#a855f7",
    accent: "#f472b6",
    text: "#faf5ff",
    bg: "#0a0512",
    border: "rgba(168, 85, 247, 0.15)",
    cardBg: "rgba(168, 85, 247, 0.04)",
    gradient: "from-[#08030f] via-[#150724] to-[#04010b]",
    bgImages: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "nordic-frost",
    name: "Nordic Frost",
    font: "'Inter', sans-serif",
    primary: "#38bdf8",
    accent: "#7dd3fc",
    text: "#f0f9ff",
    bg: "#06131a",
    border: "rgba(56, 189, 248, 0.15)",
    cardBg: "rgba(56, 189, 248, 0.04)",
    gradient: "from-[#06131a] via-[#0c4a6e] to-[#03090d]",
    bgImages: [
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "bronze-metal",
    name: "Bronze Metal",
    font: "Georgia, serif",
    primary: "#b45309",
    accent: "#f59e0b",
    text: "#fffbeb",
    bg: "#140e05",
    border: "rgba(180, 83, 9, 0.15)",
    cardBg: "rgba(180, 83, 9, 0.04)",
    gradient: "from-[#140e05] via-[#451a03] to-[#0a0702]",
    bgImages: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    font: "Georgia, serif",
    primary: "#fbbf24",
    accent: "#1e3a8a",
    text: "#eff6ff",
    bg: "#030814",
    border: "rgba(251, 191, 36, 0.15)",
    cardBg: "rgba(251, 191, 36, 0.04)",
    gradient: "from-[#030814] via-[#172554] to-[#01030a]",
    bgImages: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    font: "'Outfit', sans-serif",
    primary: "#2dd4bf",
    accent: "#5eead4",
    text: "#f0fdfa",
    bg: "#031411",
    border: "rgba(45, 212, 191, 0.15)",
    cardBg: "rgba(45, 212, 191, 0.04)",
    gradient: "from-[#031411] via-[#115e59] to-[#010706]",
    bgImages: [
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "nebula-space",
    name: "Nebula Space",
    font: "'Outfit', sans-serif",
    primary: "#ec4899",
    accent: "#3b82f6",
    text: "#faf5ff",
    bg: "#05030f",
    border: "rgba(236, 72, 153, 0.15)",
    cardBg: "rgba(236, 72, 153, 0.04)",
    gradient: "from-[#05030f] via-[#311042] to-[#020108]",
    bgImages: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "desert-sand",
    name: "Desert Sand",
    font: "'Outfit', sans-serif",
    primary: "#f59e0b",
    accent: "#d97706",
    text: "#fffbeb",
    bg: "#140e05",
    border: "rgba(245, 158, 11, 0.15)",
    cardBg: "rgba(245, 158, 11, 0.04)",
    gradient: "from-[#140e05] via-[#78350f] to-[#0a0702]",
    bgImages: [
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "dark-matter",
    name: "Dark Matter",
    font: "'Inter', sans-serif",
    primary: "#ffffff",
    accent: "#f97316",
    text: "#fafafa",
    bg: "#020205",
    border: "rgba(255, 255, 255, 0.08)",
    cardBg: "rgba(255, 255, 255, 0.02)",
    gradient: "from-[#020205] via-[#171717] to-[#000000]",
    bgImages: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop"
    ]
  }
];

const targetDir = path.join(__dirname, "../client/src/config/ppt-themes");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

themes.forEach((t) => {
  const filePath = path.join(targetDir, `${t.id}.tsx`);
  const content = `import React from "react";
import { createThemeLayouts } from "./layout-templates";
import { PPTThemeConfig } from "./sunset-orange";

export const ${t.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Theme: PPTThemeConfig = {
  id: "${t.id}",
  name: "${t.name}",
  colors: {
    primary: "${t.primary}",
    accent: "${t.accent}",
    text: "${t.text}",
    bg: "${t.bg}",
    border: "${t.border}",
    cardBg: "${t.cardBg}"
  },
  bgGradient: "${t.gradient}",
  fontFamily: "${t.font}",
  bgImages: ${JSON.stringify(t.bgImages, null, 2)},
  layouts: createThemeLayouts({
    primary: "${t.primary}",
    accent: "${t.accent}",
    text: "${t.text}",
    bg: "${t.bg}",
    border: "${t.border}",
    cardBg: "${t.cardBg}"
  }) as any
};
`;
  
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Wrote theme file: ${t.id}.tsx`);
});
