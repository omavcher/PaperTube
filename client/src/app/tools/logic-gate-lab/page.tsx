// app/tools/logic-gate-lab/page.tsx
import LogicLabClient from "@/components/tools/LogicLabClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logic Gate Simulator | Paperxify",
  description: "Simulate and design boolean logic circuits online. Test AND, OR, NOT, XOR, NAND, and NOR gates visually in your browser.",
  keywords: ["logic gate simulator", "boolean logic", "circuit simulator", "online logic gates", "truth table generator"],
  alternates: {
    canonical: "https://paperxify.com/tools/logic-gate-lab",
  },
  openGraph: {
    title: "Logic Gate Simulator | Paperxify",
    description: "Simulate and design boolean logic circuits online. Test AND, OR, NOT, XOR, NAND, and NOR gates visually in your browser.",
    type: "website",
    url: "https://paperxify.com/tools/logic-gate-lab",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logic Gate Simulator",
    description: "Simulate and design boolean logic circuits online. Test AND, OR, NOT, XOR, NAND, and NOR gates visually in your browser.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Logic Gate Simulator - Paperxify",
    "url": "https://paperxify.com/tools/logic-gate-lab",
    "description": "Simulate and design boolean logic circuits online. Test AND, OR, NOT, XOR, NAND, and NOR gates visually in your browser.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What logic gates are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support all standard gates: AND, OR, NOT, NAND, NOR, XOR, and XNOR."
        }
      },
      {
        "@type": "Question",
        "name": "Can I simulate complex circuits?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can build and test boolean expressions by linking multiple gates together."
        }
      },
      {
        "@type": "Question",
        "name": "Is the simulator suitable for students?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely, it's designed to help computer science and engineering students visualize boolean logic."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LogicLabClient />
    </>
  );
}
