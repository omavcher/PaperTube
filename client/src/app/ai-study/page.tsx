import React from "react";
import type { Metadata } from "next";
import AIStudySeoPage from "@/components/seo/AIStudySeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

export function generateMetadata(): Metadata {
  return generateMetadataForPage("ai-study");
}

export default function AIStudyPage() {
  return <AIStudySeoPage region="global" />;
}
