"use client";
import { useState, useEffect } from "react";
import HomeMain from "@/components/HomeMain";
import HomeWorkspace from "@/components/HomeWorkspace";
import { HomeFeatureX } from "@/components/HomeFeatureX";
import { HomeCompare } from "@/components/HomeCompare";
import HomeLine from "@/components/HomeLine";
import Testimonials from "@/components/Testimonials";

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
        
        <div className="my-20">
       <HomeFeatureX/>
</div>
       <div className=" flex flex-col items-center">
               <header className="w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mb-8">
                 <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl text-center">
                   What Our Customers Are Saying
                 </h2>
                 <p className="mt-4 max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-400">
                   Hear from our satisfied users who have transformed their workflow with our service.
                 </p>
               </header>
       <Testimonials/>
       </div>

      <div>
        <HomeLine/>
      </div>

      </main>
    </div>
  );
}
