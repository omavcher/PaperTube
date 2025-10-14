"use client";
import { useState, useEffect } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/Navbar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import HomeMain from "@/components/HomeMain";
import HomeWorkspace from "@/components/HomeWorkspace";
import { HomeFeatureX } from "@/components/HomeFeatureX";
import { HomeCompare } from "@/components/HomeCompare";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
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
      <HomeFeatureX/>
      <HomeCompare/>
      </main>
    </div>
  );
}
