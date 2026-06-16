import React from "react";
import type { Metadata } from "next";
import YouTubeToNotesSeoPage from "@/components/seo/YouTubeToNotesSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

export const metadata: Metadata = generateMetadataForPage("youtube-to-notes", "global");

export default function YouTubeToNotesPage() {
  return <YouTubeToNotesSeoPage region="global" />;
}

