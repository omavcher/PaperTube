import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import YouTubeToNotesSeoPage from "@/components/seo/YouTubeToNotesSeoPage";
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

  return generateMetadataForPage("youtube-to-notes", lowerRegion);
}

export default async function RegionalYouTubeToNotesPage({ params }: PageProps) {
  const { region } = await params;
  const lowerRegion = region.toLowerCase();

  if (!VALID_REGIONS.includes(lowerRegion)) {
    notFound();
  }

  return <YouTubeToNotesSeoPage region={lowerRegion} />;
}
