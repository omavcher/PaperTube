import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIWriterSeoPage from "@/components/seo/AIWriterSeoPage";
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

  return generateMetadataForPage("ai-writer", lowerRegion);
}

export default async function RegionalAIWriterPage({ params }: PageProps) {
  const { region } = await params;
  const lowerRegion = region.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion)) {
    notFound();
  }

  return <AIWriterSeoPage region={lowerRegion} />;
}
