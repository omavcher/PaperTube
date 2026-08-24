import React from "react";
import type { Metadata } from "next";
import AIPPTSeoPage from "@/components/seo/AIPPTSeoPage";
import { generateMetadataForPage, generateJsonLdForPage } from "@/lib/seo-helpers";

export function generateMetadata(): Metadata {
  return generateMetadataForPage("presentation-generator");
}

export default function PresentationGeneratorPage() {
  const jsonLd = generateJsonLdForPage("presentation-generator", "global");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AIPPTSeoPage region="global" />
    </>
  );
}
