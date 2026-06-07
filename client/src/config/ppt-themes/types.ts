import React from "react";

export interface ThemeColors {
  primary: string;
  accent: string;
  text: string;
  bg: string;
  border: string;
  cardBg: string;
}

export interface ThemeLayoutVariant {
  id: string;
  name: string;
  render: (slide: any, colors: ThemeColors) => React.ReactNode;
}

export interface PPTThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  bgGradient: string;
  fontFamily: string;
  bgImages: string[];
  layouts: {
    title: ThemeLayoutVariant[];
    section_break: ThemeLayoutVariant[];
    conclusion: ThemeLayoutVariant[];
    bullets: ThemeLayoutVariant[];
    paragraph: ThemeLayoutVariant[];
    quote: ThemeLayoutVariant[];
    two_column_text: ThemeLayoutVariant[];
    comparison: ThemeLayoutVariant[];
    pros_cons: ThemeLayoutVariant[];
    metric_callout: ThemeLayoutVariant[];
    matrix_2x2: ThemeLayoutVariant[];
    timeline: ThemeLayoutVariant[];
    steps: ThemeLayoutVariant[];
    roadmap: ThemeLayoutVariant[];
    image_left: ThemeLayoutVariant[];
    image_right: ThemeLayoutVariant[];
    gallery_grid: ThemeLayoutVariant[];
    metric?: ThemeLayoutVariant[];
  };
}
