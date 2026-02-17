import GitForgeClient from "@/components/tools/GitForgeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Git Forge | Visual Git Command Generator & Blueprint Tool",
  description: "Visualize and generate Git commands instantly. Create branches, commits, and merges visually. Perfect for developers learning version control workflows.",
  keywords: ["git visualizer", "git command generator", "git cheat sheet", "version control visualizer", "git workflow diagram", "developer tools"],
  openGraph: {
    title: "Git Command Forge | Neural Tools",
    description: "Map your version control strategy visually. Export high-res blueprints.",
    type: "website",
  }
};

export default function Page() {
  return <GitForgeClient />;
}