"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import HomePortal from "@/components/HomePortal";
import PricingShowcase from "@/components/PricingShowcase";

// --- Lazy load below-fold dynamic sections ---
// Defer JS parse & render until sections enter the viewport.

const LeaderboardStreakSection = dynamic(() => import("@/components/LeaderboardStreakSection"), { ssr: false });
const ToolsGlimpse       = dynamic(() => import("@/components/ToolsGlimpse"),       { ssr: false });
const TestimonialsCarousel = dynamic(() => import("@/components/TestimonialsCarousel").then(mod => mod.TestimonialsCarousel), { ssr: false });
const FAQAccordion       = dynamic(() => import("@/components/FAQAccordion").then(mod => mod.FAQAccordion), { ssr: false });
import Footer from "@/components/Footer";

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

export default function HomeClient({ region }: { region?: string }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("user");
      setIsAuthenticated(!!token);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    syncAuth();
    window.addEventListener("auth-change", syncAuth);
    return () => window.removeEventListener("auth-change", syncAuth);
  }, []);

  // Sentinel refs — one per section. Component renders once sentinel enters viewport.
  const leaderboardRef  = useRef<HTMLDivElement>(null);
  const toolsRef        = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const faqRef          = useRef<HTMLDivElement>(null);

  const showLeaderboard  = useInView(leaderboardRef,  "400px");
  const showTools        = useInView(toolsRef,        "400px");
  const showTestimonials = useInView(testimonialsRef, "400px");
  const showFaq          = useInView(faqRef,          "400px");

  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-2 bg-black text-white w-full max-w-full overflow-x-hidden">
      <main className="flex flex-1 flex-col items-center justify-center w-full max-w-full overflow-x-hidden">
        
        {/* Above fold — always eager */}
        <HomePortal region={region} user={user} />

        {/* Dynamic Leaderboard & Streak Strip */}
        <div ref={leaderboardRef} className="w-full perf-section">
          {showLeaderboard && <LeaderboardStreakSection />}
        </div>

        {/* Tools */}
        <div ref={toolsRef} className="w-full perf-section">
          {showTools && <ToolsGlimpse />}
        </div>

        {/* Pricing Showcase (Eagerly rendered for instant visibility & SSR) */}
        <section id="pricing" className="w-full">
          <PricingShowcase region={region} />
        </section>

        {/* Testimonials */}
        <div ref={testimonialsRef} className="w-full max-w-6xl mx-auto px-6 py-16 border-t border-white/[0.04] mt-8">
          {showTestimonials && <TestimonialsCarousel region={region} />}
        </div>

        {/* FAQ (For fully populated FAQ page metadata matching page.tsx schema) */}
        <div ref={faqRef} className="w-full perf-section px-6">
          {showFaq && <FAQAccordion region={region} />}
        </div>

      </main>

      {/* Footer (SSR-rendered for search engines & instant navigation) */}
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}

