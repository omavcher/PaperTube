import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIStudySeoPage from "@/components/seo/AIStudySeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

const VALID_TOOLS = ["homework-helper", "math-solver", "exam-planner", "language-tutor"];

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

  return generateMetadataForPage("ai-study", "global", lowerTool);
}

export default async function AIStudyToolPage({ params }: PageProps) {
  const { tool } = await params;
  const lowerTool = tool.toLowerCase();

  if (!VALID_TOOLS.includes(lowerTool)) {
    notFound();
  }

  return <AIStudySeoPage region="global" tool={lowerTool} />;
}
