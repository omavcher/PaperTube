import PasswordGeneratorClient from "@/components/tools/PasswordGeneratorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Password Generator | High-Entropy Key Creator",
  description: "Generate cryptographically strong passwords instantly. Customize length, character sets, and complexity. Client-side generation ensures your keys never leave your browser.",
  keywords: ["password generator", "secure password", "random key generator", "password strength checker", "high entropy password", "offline password tool"],
  openGraph: {
    title: "Security Vault | Neural Tools",
    description: "Generate military-grade encryption keys and passwords locally.",
    type: "website",
  }
};

export default function Page() {
  return <PasswordGeneratorClient />;
}