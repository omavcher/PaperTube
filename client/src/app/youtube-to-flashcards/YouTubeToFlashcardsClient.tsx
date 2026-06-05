"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import HomeMain from "@/components/HomeMain";

// Lazy load below-fold notes/flashcards library
const HomeWorkspace = dynamic(() => import("@/components/HomeWorkspace"), { ssr: false });

export default function YouTubeToFlashcardsClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full" id="search-form">
      {/* 1. Main Converter Form */}
      <HomeMain mode="flashcards" />

      {/* 2. User Workspace Library (auth-gated) */}
      {isAuthenticated && (
        <div className="w-full mt-4 border-t border-white/[0.04] pt-8">
          <HomeWorkspace />
        </div>
      )}
    </div>
  );
}
