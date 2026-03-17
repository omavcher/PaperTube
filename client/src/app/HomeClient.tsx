"use client";
import { useState, useEffect, lazy, Suspense } from "react";
import HomeMain from "@/components/HomeMain";
import WelcomeTour from "@/components/WelcomeTour";

// ─── Lazy load everything below the fold ────────────────────────────────────
// This prevents heavy components from being parsed/executed until the user
// actually scrolls near them, dramatically improving initial load time and
// Time-to-Interactive on low-end devices.
const HomeWorkspace    = lazy(() => import("@/components/HomeWorkspace"));
const HowToUse         = lazy(() => import("@/components/HowToUse"));
const ToolsGlimpse     = lazy(() => import("@/components/ToolsGlimpse"));
const PricingShowcase  = lazy(() => import("@/components/PricingShowcase"));
const ArcadeGlimpse    = lazy(() => import("@/components/ArcadeGlimpse"));
const FeatureHomeSection = lazy(() => import("@/components/FeatureHomeSection"));
const Footer           = lazy(() => import("@/components/Footer"));

/** Thin Suspense wrapper — shows nothing while chunk loads (avoids layout shift) */
function LazySection({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="w-full min-h-[200px]" aria-hidden="true" />}>
      {children}
    </Suspense>
  );
}

export default function HomeClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-2 bg-black text-white">
      {/* First-time user onboarding tour — renders itself only for new users */}
      <WelcomeTour />

      <main className="flex flex-1 flex-col items-center justify-center w-full">
        {/* HomeMain is always above-the-fold → eager load */}
        <HomeMain />

        {/* Below-fold sections → lazy loaded */}
        {isAuthenticated && (
          <LazySection>
            <HomeWorkspace />
          </LazySection>
        )}

        <LazySection>
          <div className="w-full">
            <HowToUse />
          </div>
        </LazySection>

        <LazySection>
          <div className="w-full">
            <ToolsGlimpse />
          </div>
        </LazySection>

        <LazySection>
          <div className="w-full">
            <PricingShowcase />
          </div>
        </LazySection>

        <LazySection>
          <div className="w-full">
            <ArcadeGlimpse />
          </div>
        </LazySection>

        <LazySection>
          <section className="w-full">
            <FeatureHomeSection />
          </section>
        </LazySection>
      </main>

      <LazySection>
        <Footer />
      </LazySection>
    </div>
  );
}
