import React from "react";
import type { Metadata } from "next";
import AIDiagramSeoPage from "@/components/seo/AIDiagramSeoPage";
import { generateMetadataForPage, generateJsonLdForPage } from "@/lib/seo-helpers";

export function generateMetadata(): Metadata {
  return generateMetadataForPage("ai-diagram");
}

export default function AIDiagramPage() {
  const jsonLd = generateJsonLdForPage("ai-diagram", "global");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AIDiagramSeoPage region="global" />
    </>
  );
}
