"use client";
import { useState, useEffect } from "react";
import HomeMain from "@/components/HomeMain";
import HomeWorkspace from "@/components/HomeWorkspace";
import { HomeFeatureX } from "@/components/HomeFeatureX";
import { HomeCompare } from "@/components/HomeCompare";
import HomeLine from "@/components/HomeLine";
import Testimonials from "@/components/Testimonials";
import HomeFeedback from "@/components/HomeFeedback";
import Footer from "@/components/Footer";

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



      {/* <div className="flex flex-col items-center w-full">
  <header className="w-full max-w-7xl px-4 py-6 sm:py-8 lg:py-12 mb-4 sm:mb-6 lg:mb-8">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-100 text-center px-2">
      What Our Customers Are Saying
    </h2>
    <p className="mt-3 sm:mt-4 max-w-3xl mx-auto text-center text-gray-400 text-sm sm:text-base px-4">
      Hear from our satisfied users who have transformed their workflow with our service.
    </p>
  </header>
  <Testimonials />
</div> */}
        <div className="w-full my-20">
       <HomeFeatureX/>
</div>
      

      <div className="w-full">
        <HomeLine/>
      </div>

      <div className="w-full">
        <HomeFeedback/>
      </div>


      </main>
      <Footer/>
    </div>
  );
}
