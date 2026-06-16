import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIDiagramSeoPage from "@/components/seo/AIDiagramSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

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
  return VALID_FORMATS.map((format) => ({ format }));
}

interface PageProps {
  params: Promise<{ format: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { format } = await params;
  const lowerFormat = format.toLowerCase();

  if (!VALID_FORMATS.includes(lowerFormat)) {
    return {};
  }

  return generateMetadataForPage("ai-diagram", "global", lowerFormat);
}

export default async function AIDiagramFormatPage({ params }: PageProps) {
  const { format } = await params;
  const lowerFormat = format.toLowerCase();

  if (!VALID_FORMATS.includes(lowerFormat)) {
    notFound();
  }

  return <AIDiagramSeoPage region="global" format={lowerFormat} />;
}
