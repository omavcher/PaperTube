import React from "react";
import type { Metadata } from "next";
import EssayWorkspaceClient from "./EssayWorkspaceClient";

export const metadata: Metadata = {
  title: "AI Essay Workspace | Paperxify",
  description: "Professional Word-like editor and formatter for academic essays.",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <EssayWorkspaceClient slug={slug} />;
}
