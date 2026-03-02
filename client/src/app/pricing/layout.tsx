import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans | Paperxify",
  description: "Check out Paperxify's flexible pricing, subscriptions, and token packages to supercharge your engineering workflow with AI.",
  alternates: {
    canonical: "https://paperxify.com/pricing",
  }
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
