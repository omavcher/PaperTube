import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIPPTSeoPage from "@/components/seo/AIPPTSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

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

  return generateMetadataForPage("presentation-generator", lowerRegion);
}

export default async function RegionalPresentationGeneratorPage({ params }: PageProps) {
  const { region } = await params;
  const lowerRegion = region.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion)) {
    notFound();
  }

  return <AIPPTSeoPage region={lowerRegion} />;
}
