"use client";
import { useState, useEffect } from "react";
import HomeMain from "@/components/HomeMain";
import HomeWorkspace from "@/components/HomeWorkspace";
import HomeLine from "@/components/HomeLine";
import Footer from "@/components/Footer";
import FeatureHomeSection from "@/components/FeatureHomeSection";
import ToolsGlimpse from "@/components/ToolsGlimpse";
import ArcadeGlimpse from "@/components/ArcadeGlimpse";
import PricingShowcase from "@/components/PricingShowcase";
import HowToUse from "@/components/HowToUse";
import UseCasesHome from "@/components/UseCasesHome";
import FAQHome from "@/components/FAQHome";

export default function HomeClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-2 bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        <HomeMain />
        {isAuthenticated && <HomeWorkspace />}
        <div className="w-full">
          <HowToUse />
        </div>
        <div className="w-full">
          <ToolsGlimpse/>
        </div>
        <div className="w-full">
          <UseCasesHome/>
        </div>
        <div className="w-full">
          <PricingShowcase/>
        </div>
        <div className="w-full">
          <ArcadeGlimpse/>
        </div>
        <section className="w-full">
          <FeatureHomeSection/>
        </section>
        <section className="w-full">
          <FAQHome/>
        </section>
       
      </main>
      <Footer/>
    </div>
  );
}
