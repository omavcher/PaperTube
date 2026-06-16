import React from "react";
import type { Metadata } from "next";
import AIWriterSeoPage from "@/components/seo/AIWriterSeoPage";
import { generateMetadataForPage } from "@/lib/seo-helpers";

export function generateMetadata(): Metadata {
  return generateMetadataForPage("ai-writer");
}

export default function AIWriterPage() {
  return <AIWriterSeoPage region="global" />;
}
