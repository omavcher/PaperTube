import GithubWrappedClient from "@/components/tools/GithubWrappedClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Wrapped 2026 | Developer Year in Review",
  description: "Get your unofficial GitHub Wrapped stats. Visualize your coding year with beautiful charts, contribution analysis, and personality archetypes. Free & Open Source.",
  keywords: ["github wrapped", "developer stats", "github visualization", "coding year in review", "programmer stats", "github analytics"],
  openGraph: {
    title: "GitHub Wrapped | Neural Tools",
    description: "Your coding journey, visualized. Discover your developer archetype.",
    type: "website",
  }
};

export default function Page() {
  return <GithubWrappedClient />;
}