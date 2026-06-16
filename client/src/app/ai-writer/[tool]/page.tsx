import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIWriterSeoPage from "@/components/seo/AIWriterSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

const VALID_TOOLS = ["ai-detector", "ai-humanizer", "essay-writer", "plagiarism"];

export function generateStaticParams() {
  return VALID_TOOLS.map((tool) => ({ tool }));
}

interface PageProps {
  params: Promise<{ tool: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  const lowerTool = tool.toLowerCase();

  if (!VALID_TOOLS.includes(lowerTool)) {
    return {};
  }

  return generateMetadataForPage("ai-writer", "global", lowerTool);
}

export default async function AIWriterToolPage({ params }: PageProps) {
  const { tool } = await params;
  const lowerTool = tool.toLowerCase();

  if (!VALID_TOOLS.includes(lowerTool)) {
    notFound();
  }

  return <AIWriterSeoPage region="global" tool={lowerTool} />;
}
