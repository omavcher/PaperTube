import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Paperxify — Owned by Om Eknath Avchar",
  description: "Learn about the founder, vision, and mission behind Paperxify, an EdTech AI platform owned and operated by Om Eknath Avchar in Maharashtra, India.",
  alternates: {
    canonical: "https://paperxify.com/about",
  }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
