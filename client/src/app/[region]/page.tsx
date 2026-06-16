import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeClient from "../HomeClient";
import { generateMetadataForPage, generateJsonLdForPage } from "@/lib/seo-helpers";

const VALID_REGIONS = ["us", "uk", "ca", "au"];

export function generateStaticParams() {
  return VALID_REGIONS.map((region) => ({ region }));
}

interface PageProps {
  params: Promise<{ region: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region } = await params;
  const lowerRegion = region.toLowerCase();
  
  if (!VALID_REGIONS.includes(lowerRegion)) {
    return {};
  }
  
  return generateMetadataForPage("home", lowerRegion);
}

export default async function RegionalPage({ params }: PageProps) {
  const { region } = await params;
  const lowerRegion = region.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion)) {
    notFound();
  }

  const jsonLd = generateJsonLdForPage("home", lowerRegion);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient region={lowerRegion} />
    </>
  );
}
