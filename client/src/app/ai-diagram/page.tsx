import React from "react";
import type { Metadata } from "next";
import AIDiagramSeoPage from "@/components/seo/AIDiagramSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

export function generateMetadata(): Metadata {
  return generateMetadataForPage("ai-diagram");
}

export default function AIDiagramPage() {
  return <AIDiagramSeoPage region="global" />;
}
