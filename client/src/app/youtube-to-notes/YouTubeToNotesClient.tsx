"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import HomeMain from "@/components/HomeMain";
import Footer from "@/components/Footer";

// Lazy load below-fold notes library
const HomeWorkspace = dynamic(() => import("@/components/HomeWorkspace"), { ssr: false });

export default function YouTubeToNotesClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-full overflow-x-hidden">
      {/* 1. Main Converter Form */}
      <HomeMain />

      {/* 2. User Notes Library (auth-gated) */}
      {isAuthenticated && (
        <div className="w-full border-t border-white/[0.06]">
          <HomeWorkspace />
        </div>
      )}

     
    </div>
  );
}
