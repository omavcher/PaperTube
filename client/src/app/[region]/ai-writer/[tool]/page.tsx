import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIWriterSeoPage from "@/components/seo/AIWriterSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

const VALID_REGIONS = ["us", "uk", "ca", "au"];
const VALID_TOOLS = ["ai-detector", "ai-humanizer", "essay-writer", "plagiarism"];

export function generateStaticParams() {
  return VALID_REGIONS.flatMap((region) =>
    VALID_TOOLS.map((tool) => ({ region, tool }))
  );
}

interface PageProps {
  params: Promise<{ region: string; tool: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region, tool } = await params;
  const lowerRegion = region.toLowerCase();
  const lowerTool = tool.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion) || !VALID_TOOLS.includes(lowerTool)) {
    return {};
  }

  return generateMetadataForPage("ai-writer", lowerRegion, lowerTool);
}

export default async function RegionalAIWriterToolPage({ params }: PageProps) {
  const { region, tool } = await params;
  const lowerRegion = region.toLowerCase();
  const lowerTool = tool.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion) || !VALID_TOOLS.includes(lowerTool)) {
    notFound();
  }

  return <AIWriterSeoPage region={lowerRegion} tool={lowerTool} />;
}
