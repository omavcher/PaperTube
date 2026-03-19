"use client";
import { useState, useEffect, lazy, Suspense } from "react";
import HomeMain from "@/components/HomeMain";

// ─── Lazy load everything below the fold ────────────────────────────────────
const HomeWorkspace      = lazy(() => import("@/components/HomeWorkspace"));
const HowToUse           = lazy(() => import("@/components/HowToUse"));
const ToolsGlimpse       = lazy(() => import("@/components/ToolsGlimpse"));
const PricingShowcase    = lazy(() => import("@/components/PricingShowcase"));
const ArcadeGlimpse      = lazy(() => import("@/components/ArcadeGlimpse"));
const FeatureHomeSection = lazy(() => import("@/components/FeatureHomeSection"));
const Footer             = lazy(() => import("@/components/Footer"));

/**
 * Smooth skeleton fallback — a shimmer bar that fades in/out.
 * Prevents the abrupt "pop-in" that was causing the "not smooth" feel.
 * Uses CSS animations only so it runs on the GPU compositor thread.
 */
function SectionSkeleton({ height = "200px" }: { height?: string }) {
  return (
    <div
      className="w-full"
      style={{ minHeight: height, overflow: "hidden" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.03) 40%,
            rgba(255,255,255,0.06) 50%,
            rgba(255,255,255,0.03) 60%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
      <div
        className="skeleton-shimmer w-full rounded-2xl"
        style={{ minHeight: height, background: "rgba(255,255,255,0.02)" }}
      />
    </div>
  );
}

/** Lazy section wrapper with smooth skeleton while loading */
function LazySection({
  children,
  skeletonHeight = "200px",
}: {
  children: React.ReactNode;
  skeletonHeight?: string;
}) {
  return (
    <Suspense fallback={<SectionSkeleton height={skeletonHeight} />}>
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
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        {/* HomeMain is always above-the-fold → eager load */}
        <HomeMain />

        {/* Authenticated-only section */}
        {isAuthenticated && (
          <LazySection skeletonHeight="400px">
            <HomeWorkspace />
          </LazySection>
        )}

        <LazySection skeletonHeight="360px">
          <div className="w-full">
            <HowToUse />
          </div>
        </LazySection>

        <LazySection skeletonHeight="320px">
          <div className="w-full">
            <ToolsGlimpse />
          </div>
        </LazySection>

        <LazySection skeletonHeight="480px">
          <div className="w-full">
            <PricingShowcase />
          </div>
        </LazySection>

        <LazySection skeletonHeight="320px">
          <div className="w-full">
            <ArcadeGlimpse />
          </div>
        </LazySection>

        <LazySection skeletonHeight="280px">
          <section className="w-full">
            <FeatureHomeSection />
          </section>
        </LazySection>
      </main>

      <LazySection skeletonHeight="160px">
        <Footer />
      </LazySection>
    </div>
  );
}
