import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Founder | Paperxify",
  description: "Learn about the founder, vision, and mission behind Paperxify, building the next-generation AI platforms.",
  alternates: {
    canonical: "https://paperxify.com/about",
  }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
