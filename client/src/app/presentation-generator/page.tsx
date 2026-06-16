import React from "react";
import type { Metadata } from "next";
import AIPPTSeoPage from "@/components/seo/AIPPTSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

export function generateMetadata(): Metadata {
  return generateMetadataForPage("presentation-generator");
}

export default function PresentationGeneratorPage() {
  return <AIPPTSeoPage region="global" />;
}
