import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIDiagramSeoPage from "@/components/seo/AIDiagramSeoPage";
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

  return generateMetadataForPage("ai-diagram", lowerRegion);
}

export default async function RegionalAIDiagramPage({ params }: PageProps) {
  const { region } = await params;
  const lowerRegion = region.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion)) {
    notFound();
  }

  return <AIDiagramSeoPage region={lowerRegion} />;
}
