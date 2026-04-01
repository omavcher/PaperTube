"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import HomeMain from "@/components/HomeMain";

// --- Lazy load ALL below-fold sections ---
// This is the #1 desktop perf fix: on large screens multiple sections
// are visible at load — this defers their JS parse + render until needed.
const HomeWorkspace   = dynamic(() => import("@/components/HomeWorkspace"),   { ssr: false });
const HowToUse        = dynamic(() => import("@/components/HowToUse"),        { ssr: false });
const ToolsGlimpse    = dynamic(() => import("@/components/ToolsGlimpse"),    { ssr: false });
const PricingShowcase = dynamic(() => import("@/components/PricingShowcase"), { ssr: false });
const ArcadeGlimpse   = dynamic(() => import("@/components/ArcadeGlimpse"),   { ssr: false });
const FeatureHomeSection = dynamic(() => import("@/components/FeatureHomeSection"), { ssr: false });
const Footer          = dynamic(() => import("@/components/Footer"),          { ssr: false });

// Hook: returns true once the element enters the viewport
function useInView(ref: React.RefObject<HTMLDivElement | null>, rootMargin = "400px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

export default function HomeClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  // Sentinel refs — one per section. Component renders once sentinel enters viewport.
  const workspaceRef  = useRef<HTMLDivElement>(null);
  const howToRef      = useRef<HTMLDivElement>(null);
  const toolsRef      = useRef<HTMLDivElement>(null);
  const pricingRef    = useRef<HTMLDivElement>(null);
  const arcadeRef     = useRef<HTMLDivElement>(null);
  const featureRef    = useRef<HTMLDivElement>(null);
  const footerRef     = useRef<HTMLDivElement>(null);

  const showWorkspace  = useInView(workspaceRef,  "200px");
  const showHowTo      = useInView(howToRef,      "400px");
  const showTools      = useInView(toolsRef,      "400px");
  const showPricing    = useInView(pricingRef,    "400px");
  const showArcade     = useInView(arcadeRef,     "400px");
  const showFeature    = useInView(featureRef,    "400px");
  const showFooter     = useInView(footerRef,     "400px");

  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-2 bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        
        {/* Above fold — always eager */}
        <HomeMain />

        {/* Workspace (auth-gated) */}
        <div ref={workspaceRef} className="w-full perf-section">
          {isAuthenticated && showWorkspace && <HomeWorkspace />}
        </div>

        {/* HowToUse */}
        <div ref={howToRef} className="w-full perf-section">
          {showHowTo && <HowToUse />}
        </div>

        {/* Tools */}
        <div ref={toolsRef} className="w-full perf-section">
          {showTools && <ToolsGlimpse />}
        </div>

        {/* Pricing */}
        <div ref={pricingRef} className="w-full perf-section">
          {showPricing && <PricingShowcase />}
        </div>

        {/* Arcade */}
        <div ref={arcadeRef} className="w-full perf-section">
          {showArcade && <ArcadeGlimpse />}
        </div>

        {/* Features */}
        <div ref={featureRef} className="w-full perf-section">
          {showFeature && <FeatureHomeSection />}
        </div>

      </main>

      {/* Footer */}
      <div ref={footerRef} className="w-full">
        {showFooter && <Footer />}
      </div>
    </div>
  );
}
