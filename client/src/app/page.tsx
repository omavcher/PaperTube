"use client";
import { useState, useEffect } from "react";
import HomeMain from "@/components/HomeMain";
import HomeWorkspace from "@/components/HomeWorkspace";
import { HomeFeatureX } from "@/components/HomeFeatureX";
import { HomeCompare } from "@/components/HomeCompare";
import HomeLine from "@/components/HomeLine";
import Testimonials from "@/components/Testimonials";
import FeebackDailogBox from "@/components/FeebackDailogBox";
import Footer from "@/components/Footer";
import { IconLanguage, IconRobot } from "@tabler/icons-react";
import { FileText, ShieldCheck } from "lucide-react";
import FeatureHomeSection from "@/components/FeatureHomeSection";
import ToolsGlimpse from "@/components/ToolsGlimpse";
import ArcadeGlimpse from "@/components/ArcadeGlimpse";
import PricingShowcase from "@/components/PricingShowcase";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // ✅ Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-2 bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        {/* Always visible section */}
        <HomeMain />
        {/* ✅ Show HomeWorkspace only if logged in */}
        {isAuthenticated && <HomeWorkspace />}
        <div className="w-full">
       <ToolsGlimpse/>
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

   
        {/* <div className="w-full my-20">
       <HomeFeatureX/>
</div> */}
      

      <div className="w-full">
        <HomeLine/>
      </div>



      </main>
      <Footer/>
    </div>
  );
}
