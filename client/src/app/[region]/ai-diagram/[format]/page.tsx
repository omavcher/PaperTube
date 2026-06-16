import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIDiagramSeoPage from "@/components/seo/AIDiagramSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

const VALID_REGIONS = ["us", "uk", "ca", "au"];
const VALID_FORMATS = [
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "journey",
  "pie",
  "quadrant",
  "timeline",
  "sankey",
  "xy",
  "block",
];

export function generateStaticParams() {
  return VALID_REGIONS.flatMap((region) =>
    VALID_FORMATS.map((format) => ({ region, format }))
  );
}

interface PageProps {
  params: Promise<{ region: string; format: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region, format } = await params;
  const lowerRegion = region.toLowerCase();
  const lowerFormat = format.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion) || !VALID_FORMATS.includes(lowerFormat)) {
    return {};
  }

  return generateMetadataForPage("ai-diagram", lowerRegion, lowerFormat);
}

export default async function RegionalAIDiagramFormatPage({ params }: PageProps) {
  const { region, format } = await params;
  const lowerRegion = region.toLowerCase();
  const lowerFormat = format.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion) || !VALID_FORMATS.includes(lowerFormat)) {
    notFound();
  }

  return <AIDiagramSeoPage region={lowerRegion} format={lowerFormat} />;
}
