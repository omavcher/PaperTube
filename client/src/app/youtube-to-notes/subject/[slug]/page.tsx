import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import YouTubeToNotesSubjectPage from "@/components/seo/YouTubeToNotesSubjectPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

const VALID_SUBJECTS = [
  "biology",
  "chemistry",
  "physics",
  "python",
  "machine-learning",
  "sat",
  "ap-biology",
  "gcse-maths",
  "a-level-physics",
  "atar-chemistry"
];

export function generateStaticParams() {
  return VALID_SUBJECTS.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lowerSlug = slug.toLowerCase();

  if (!VALID_SUBJECTS.includes(lowerSlug)) {
    return {};
  }

  return generateMetadataForPage(lowerSlug, "global");
}

export default async function SubjectPage({ params }: PageProps) {
  const { slug } = await params;
  const lowerSlug = slug.toLowerCase();

  if (!VALID_SUBJECTS.includes(lowerSlug)) {
    notFound();
  }

  return <YouTubeToNotesSubjectPage slug={lowerSlug} />;
}
