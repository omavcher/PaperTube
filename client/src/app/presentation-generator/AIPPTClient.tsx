"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PPTMain from "@/components/PPTMain";
import Footer from "@/components/Footer";

// Lazy load the PPT workspace component
const PPTWorkspace = dynamic(() => import("@/components/PPTWorkspace"), { ssr: false });

export default function AIPPTClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full">
      {/* 1. Main Slide Generator Form */}
      <PPTMain />

      {/* 2. User Slide Decks Library (auth-gated) */}
      {isAuthenticated && (
        <div className="w-full mt-4 border-t border-white/[0.04] pt-8">
          <PPTWorkspace />
        </div>
      )}

    </div>
  );
}
