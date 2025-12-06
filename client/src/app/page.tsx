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
import { IconLanguage, IconRobot } from "@tabler/icons-react";
import { FileText, ShieldCheck } from "lucide-react";

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

         {/* Features Section */}
      <section className="py-12 sm:py-16 bg-black ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Advanced AI Features
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Everything you need for perfect notes from videos
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <IconRobot className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Multiple AI Models</h3>
              <p className="text-sm text-gray-400">
                Choose from 5 specialized AI models optimized for different note-taking styles
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <IconLanguage className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Multi-Language Support</h3>
              <p className="text-sm text-gray-400">
                Generate notes in 7 different languages with accurate translations
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">PDF Export</h3>
              <p className="text-sm text-gray-400">
                Download beautifully formatted PDFs with images and organized content
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 sm:p-6 hover:border-red-500/30 transition-colors duration-300 group">
              <div className="mb-4 inline-flex rounded-lg bg-red-500/10 p-3 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Secure Processing</h3>
              <p className="text-sm text-gray-400">
                All videos are processed securely with end-to-end encryption
              </p>
            </div>
          </div>
        </div>
      </section>

   
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
