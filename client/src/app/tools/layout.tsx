import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Tools Suite | Paperxify",
  description: "Explore the comprehensive matrix of tools for engineers and students. Utilities bridging PDF organization, code format, algorithms, and AI workflows.",
  alternates: {
    canonical: "https://paperxify.com/tools",
  }
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
