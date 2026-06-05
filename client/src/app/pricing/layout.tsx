import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans | Paperxify",
  description: "Turn any YouTube lecture into structured notes, flashcards, and PDFs. Start free — upgrade to Pro or Power when you're ready.",
  alternates: {
    canonical: "https://paperxify.com/pricing",
  }
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
