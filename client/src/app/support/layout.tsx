import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support & Help Center | Paperxify",
  description: "Need help? Access the Paperxify knowledge base, read FAQs, or reach out directly to our support team.",
  alternates: {
    canonical: "https://paperxify.com/support",
  }
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
